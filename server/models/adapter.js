import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

// Helper to map PostgreSQL row to MongoDB-like document object (mapping id to _id)
export function mapDoc(doc) {
  if (!doc) return doc;
  const mapped = { ...doc };
  if (doc.id) {
    mapped._id = doc.id;
  }
  return mapped;
}

// Wrapper for documents returned from queries to support Mongoose operations (like .save())
export class SupabaseDocument {
  constructor(table, data) {
    this._table = table;
    Object.assign(this, data);
  }

  async save() {
    const table = this._table;
    const mapped = { ...this };
    delete mapped._table;

    // Map _id back to id for PG primary key
    if (mapped._id) {
      mapped.id = mapped._id;
      delete mapped._id;
    }

    // Pre-save logic: hash passwords if saving a user with plain text password
    if (table === 'users' && mapped.password && !mapped.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      mapped.password = await bcrypt.hash(mapped.password, salt);
      this.password = mapped.password;
    }

    const isUpdate = !!mapped.id;
    let result;

    if (isUpdate) {
      const { data, error } = await supabase
        .from(table)
        .update(mapped)
        .eq('id', mapped.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = data;
    } else {
      const { data, error } = await supabase
        .from(table)
        .insert(mapped)
        .select()
        .single();
      if (error) throw new Error(error.message);
      result = data;
    }

    // Update current instance properties
    const mappedResult = mapDoc(result);
    Object.assign(this, mappedResult);
    return this;
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

// Thenable Query Builder class to support chainable sort/limit/skip/populate/select
export class SupabaseQueryBuilder {
  constructor(table, initialQuery = null, single = false) {
    this._table = table;
    this._builder = supabase.from(table).select('*');
    this._populates = [];
    this._single = single;

    if (initialQuery) {
      this.applyQueryFilters(initialQuery);
    }
  }

  applyQueryFilters(query) {
    if (query.$or) {
      const orFilters = [];
      for (const condition of query.$or) {
        for (const [field, condVal] of Object.entries(condition)) {
          const pgField = field === '_id' ? 'id' : field;
          if (condVal && typeof condVal === 'object' && condVal.$regex) {
            orFilters.push(`${pgField}.ilike.%${condVal.$regex}%`);
          } else {
            orFilters.push(`${pgField}.eq.${condVal}`);
          }
        }
      }
      if (orFilters.length > 0) {
        this._builder = this._builder.or(orFilters.join(','));
      }
    }

    for (const [key, val] of Object.entries(query)) {
      if (key === '$or') continue;
      
      let pgKey = key;
      if (key === '_id') pgKey = 'id';

      // Handling query operators e.g., { transactionDate: { $gte: start, $lte: end } }
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        for (const [op, opVal] of Object.entries(val)) {
          if (op === '$gte') {
            this._builder = this._builder.gte(pgKey, opVal);
          } else if (op === '$lte') {
            this._builder = this._builder.lte(pgKey, opVal);
          } else if (op === '$gt') {
            this._builder = this._builder.gt(pgKey, opVal);
          } else if (op === '$lt') {
            this._builder = this._builder.lt(pgKey, opVal);
          } else if (op === '$ne') {
            this._builder = this._builder.neq(pgKey, opVal);
          } else if (op === '$regex') {
            this._builder = this._builder.ilike(pgKey, `%${opVal}%`);
          }
        }
      } else {
        // Simple equal comparison
        this._builder = this._builder.eq(pgKey, val);
      }
    }
  }

  sort(sortObj) {
    // sortObj format: { status: 1, startDate: -1 } or { transactionDate: -1 }
    for (const [key, order] of Object.entries(sortObj)) {
      const pgKey = key === '_id' ? 'id' : key;
      const ascending = order === 1 || order === 'asc' || order === 'ascending';
      this._builder = this._builder.order(pgKey, { ascending });
    }
    return this;
  }

  limit(num) {
    this._builder = this._builder.limit(num);
    return this;
  }

  skip(num) {
    // range uses absolute indexes (from, to). We approximate page sizes.
    this._builder = this._builder.range(num, num + 1000);
    return this;
  }

  populate(field, selectFields) {
    this._populates.push({ field, selectFields });
    return this;
  }

  select(fields) {
    // Supabase returns all fields by default, so we can just chain and ignore
    return this;
  }

  async then(onfulfilled, onrejected) {
    try {
      if (this._single) {
        this._builder = this._builder.limit(1);
      }

      const { data, error } = await this._builder;
      if (error) throw new Error(error.message);

      let docs = (data || []).map(row => new SupabaseDocument(this._table, mapDoc(row)));

      // Emulate populate functionality using secondary queries
      if (this._populates.length > 0 && docs.length > 0) {
        for (const pop of this._populates) {
          const field = pop.field;
          const refTable =
            field === 'accountId' || field === 'toAccountId'
              ? 'accounts'
              : field === 'loanId'
              ? 'loans'
              : null;
          if (!refTable) continue;

          const ids = [...new Set(docs.map(d => d[field]).filter(Boolean))];
          if (ids.length === 0) continue;

          const { data: refData, error: refError } = await supabase
            .from(refTable)
            .select('*')
            .in('id', ids);

          if (!refError && refData) {
            const refMap = {};
            refData.forEach(row => {
              refMap[row.id] = mapDoc(row);
            });

            docs.forEach(doc => {
              if (doc[field]) {
                doc[field] = refMap[doc[field]] || null;
              }
            });
          }
        }
      }

      if (this._single) {
        const result = docs.length > 0 ? docs[0] : null;
        return onfulfilled(result);
      } else {
        return onfulfilled(docs);
      }
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }
}

// Supabase DB Model Adapter class
export class SupabaseModelAdapter {
  constructor(table) {
    this.table = table;
  }

  find(query = {}) {
    return new SupabaseQueryBuilder(this.table, query, false);
  }

  findOne(query = {}) {
    return new SupabaseQueryBuilder(this.table, query, true);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    const isArray = Array.isArray(data);
    const items = isArray ? data : [data];
    const docs = [];

    for (const item of items) {
      const doc = new SupabaseDocument(this.table, item);
      await doc.save();
      docs.push(doc);
    }

    return isArray ? docs : docs[0];
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (!id) return null;
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  async findOneAndUpdate(query, update, options = {}) {
    let record = await this.findOne(query);
    if (!record) {
      if (options.upsert) {
        const newObj = { ...query };
        const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
        Object.assign(newObj, fieldsToUpdate);
        delete newObj.$setOnInsert;

        record = new SupabaseDocument(this.table, newObj);
        await record.save();
        return record;
      }
      return null;
    }

    const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
    delete fieldsToUpdate.$setOnInsert;

    Object.assign(record, fieldsToUpdate);
    await record.save();
    return record;
  }

  async deleteOne(query) {
    let pgKey = 'id';
    let pgVal = query._id || query.id;

    if (!pgVal) {
      const entries = Object.entries(query);
      if (entries.length > 0) {
        pgKey = entries[0][0] === '_id' ? 'id' : entries[0][0];
        pgVal = entries[0][1];
      }
    }

    if (!pgVal) return { deletedCount: 0 };

    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq(pgKey, pgVal);

    if (error) throw new Error(error.message);
    return { deletedCount: 1 };
  }

  async deleteMany(query = {}) {
    let builder = supabase.from(this.table).delete();

    for (const [key, val] of Object.entries(query)) {
      const pgKey = key === '_id' ? 'id' : key;
      builder = builder.eq(pgKey, val);
    }

    const { error } = await builder;
    if (error) throw new Error(error.message);
    return { deletedCount: 999 };
  }

  async updateMany(query = {}, update = {}) {
    // Standardize update object
    const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
    
    // Map _id to id inside update fields if any
    if (fieldsToUpdate._id) {
      fieldsToUpdate.id = fieldsToUpdate._id;
      delete fieldsToUpdate._id;
    }

    let builder = supabase.from(this.table).update(fieldsToUpdate);

    for (const [key, val] of Object.entries(query)) {
      const pgKey = key === '_id' ? 'id' : key;
      if (val && typeof val === 'object' && '$exists' in val && val.$exists === false) {
        builder = builder.is(pgKey, null);
      } else {
        builder = builder.eq(pgKey, val);
      }
    }

    const { error } = await builder;
    if (error) throw new Error(error.message);
    return { modifiedCount: 999 };
  }

  async countDocuments(query = {}) {
    const qb = new SupabaseQueryBuilder(this.table, query, false);
    qb._builder = qb._builder.select('*', { count: 'exact', head: true });

    const { count, error } = await qb._builder;
    if (error) throw new Error(error.message);
    return count || 0;
  }
}
