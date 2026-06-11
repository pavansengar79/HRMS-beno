// Minimal stub for invoice store
export const fetchInvoices = ({ paginationModel } = {}) => async dispatch => {
  dispatch({ type: 'invoice/fetch', payload: { paginationModel } })
  return Promise.resolve([])
}

export const fetchData = ({ paginationModel } = {}) => async dispatch => {
  dispatch({ type: 'invoice/fetchData', payload: { paginationModel } })
  return Promise.resolve([])
}

export const deleteInvoice = id => async dispatch => {
  dispatch({ type: 'invoice/delete', payload: id })
  return Promise.resolve({ success: true })
}

export default {}
