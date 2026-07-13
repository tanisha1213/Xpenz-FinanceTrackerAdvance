import API from './api'

export const getAccounts = () => API.get('/accounts')
export const addBankAccount = (data) => API.post('/accounts/bank', data)
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data)
export const deleteBankAccount = (id) => API.delete(`/accounts/${id}`)
