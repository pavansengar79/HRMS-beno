// Minimal stub for matrix store
export const fetchMatrix = () => async dispatch => {
  dispatch({ type: 'matrix/fetch' })
  return Promise.resolve([])
}

export const selectMatrix = id => ({ type: 'matrix/select', payload: id })

export const fetchCategory = () => async dispatch => {
  dispatch({ type: 'matrix/fetchCategory' })
  return Promise.resolve([])
}

export const fetchTimeConfig = () => async dispatch => {
  dispatch({ type: 'matrix/fetchTimeConfig' })
  return Promise.resolve([])
}

export const addMatrix = payload => async dispatch => {
  dispatch({ type: 'matrix/add', payload })
  return Promise.resolve({ success: true })
}

export const updateTimeConfig = payload => async dispatch => {
  dispatch({ type: 'matrix/updateTimeConfig', payload })
  return Promise.resolve({ success: true })
}

export default {}
