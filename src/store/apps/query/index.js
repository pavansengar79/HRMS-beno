// Minimal stub for query store
export const fetchQueries = () => async dispatch => {
  dispatch({ type: 'query/fetch' })
  return Promise.resolve([])
}

export const selectQuery = id => ({ type: 'query/select', payload: id })

export const fetchQueryData = () => async dispatch => {
  dispatch({ type: 'query/fetchQueryData' })
  return Promise.resolve([])
}

export default {}
