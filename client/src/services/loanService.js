import API from './api'

export const getLoans = () => API.get('/loans')
export const addLoan = (data) => API.post('/loans', data)
export const updateLoan = (id, data) => API.put(`/loans/${id}`, data)
export const deleteLoan = (id) => API.delete(`/loans/${id}`)
