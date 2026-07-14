import API from './api'

export const getLoans = () => API.get('/loans')
export const addLoan = (data) => API.post('/loans', data)
export const updateLoan = (id, data) => API.put(`/loans/${id}`, data)
export const deleteLoan = (id, deleteTransactions = false) => API.delete(`/loans/${id}?deleteTransactions=${deleteTransactions}`)

// New installments endpoints
export const getLoanInstallments = (id) => API.get(`/loans/${id}/installments`)
export const payInstallment = (installmentId) => API.post(`/loans/installments/${installmentId}/pay`)
