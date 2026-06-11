// Minimal stubs for FAQ store actions used in pages
export const fetchFaqData = ({ paginationModel } = {}) => async dispatch => {
  dispatch({ type: 'faq/fetch', payload: { paginationModel } })
  return Promise.resolve([])
}

export const updateFaqData = ({ id, data } = {}) => async dispatch => {
  dispatch({ type: 'faq/update', payload: { id, data } })
  return Promise.resolve({ success: true })
}

export default {}
