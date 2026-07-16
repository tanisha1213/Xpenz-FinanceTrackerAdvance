import API from './api'

export const getInsurances = () => API.get('/insurances')
export const addInsurance = (data) => API.post('/insurances', data)
export const updateInsurance = (id, data) => API.put(`/insurances/${id}`, data)
export const deleteInsurance = (id) => API.delete(`/insurances/${id}`)
