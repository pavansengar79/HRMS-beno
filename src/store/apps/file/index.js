// Minimal stub for file store actions used by pages

export const changeFileStatus = id => async dispatch => {
  dispatch({ type: 'file/changeStatus', payload: id })
}

export const fetchFileData = ({ paginationModel } = {}) => async dispatch => {
  dispatch({ type: 'file/fetch', payload: { paginationModel } })
  return Promise.resolve([])
}

export const uploadFile = ({ file } = {}) => async dispatch => {
  dispatch({ type: 'file/upload', payload: { file } })
  return Promise.resolve({ success: true })
}

export default {}
