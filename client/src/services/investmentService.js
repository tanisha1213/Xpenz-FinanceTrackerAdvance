import API from './api'

export const getInvestments = () => API.get('/investments')
export const addInvestment = (data) => API.post('/investments', data)
export const updateInvestment = (id, data) => API.put(`/investments/${id}`, data)
export const deleteInvestment = (id) => API.delete(`/investments/${id}`)
