// Minimal stub for helpDeskTickets store
export const fetchHelpDeskTickets = () => async dispatch => {
  dispatch({ type: 'helpDeskTickets/fetch' })
  return Promise.resolve([])
}

export const updateTicketStatus = ({ id, status } = {}) => async dispatch => {
  dispatch({ type: 'helpDeskTickets/updateStatus', payload: { id, status } })
  return Promise.resolve({ success: true })
}

export const fetchQueryData = () => async dispatch => {
  dispatch({ type: 'helpDeskTickets/fetchQueryData' })
  return Promise.resolve([])
}

export const fetchQueryCategoryData = () => async dispatch => {
  dispatch({ type: 'helpDeskTickets/fetchQueryCategoryData' })
  return Promise.resolve([])
}

export const ticketUpdateRemark = ({ id, remark } = {}) => async dispatch => {
  dispatch({ type: 'helpDeskTickets/updateRemark', payload: { id, remark } })
  return Promise.resolve({ success: true })
}

export const getTicketTimelines = id => async dispatch => {
  dispatch({ type: 'helpDeskTickets/getTimelines', payload: id })
  return Promise.resolve([])
}

export default {}
