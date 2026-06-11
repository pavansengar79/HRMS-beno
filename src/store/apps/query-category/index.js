// Minimal stub for query-category store
export const fetchQueryCategories = () => async dispatch => {
  dispatch({ type: 'queryCategory/fetch' })
  return Promise.resolve([])
}

export const selectQueryCategory = id => ({ type: 'queryCategory/select', payload: id })

export const queryCategoryEdit = ({ id, data } = {}) => async dispatch => {
  dispatch({ type: 'queryCategory/edit', payload: { id, data } })
  return Promise.resolve({ success: true })
}

export const createAssignUser = payload => async dispatch => {
  dispatch({ type: 'queryCategory/createAssignUser', payload })
  return Promise.resolve({ success: true })
}

export const getTicketCategories = () => async dispatch => {
  dispatch({ type: 'queryCategory/getTicketCategories' })
  return Promise.resolve([])
}

export const updateAssignUser = ({ id, data } = {}) => async dispatch => {
  dispatch({ type: 'queryCategory/updateAssignUser', payload: { id, data } })
  return Promise.resolve({ success: true })
}

export default {}
