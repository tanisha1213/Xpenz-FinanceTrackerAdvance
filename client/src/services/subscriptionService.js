import API from './api'

export const getSubscriptions = () => API.get('/subscriptions')
export const createSubscription = (data) => API.post('/subscriptions', data)
export const updateSubscription = (id, data) => API.put(`/subscriptions/${id}`, data)
export const deleteSubscription = (id) => API.delete(`/subscriptions/${id}`)
export const triggerDeductionNow = (id) => API.post(`/subscriptions/${id}/deduct`)
