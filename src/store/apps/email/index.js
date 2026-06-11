// Minimal stub for email store
export const fetchEmails = () => async dispatch => {
  dispatch({ type: 'email/fetch' })
  return Promise.resolve([])
}

export const sendEmail = ({ to, subject, body } = {}) => async dispatch => {
  dispatch({ type: 'email/send', payload: { to, subject } })
  return Promise.resolve({ success: true })
}

export const fetchMails = () => async dispatch => {
  dispatch({ type: 'email/fetchMails' })
  return Promise.resolve([])
}

export const handleSelectAllMail = () => ({ type: 'email/selectAll' })

export const updateMail = payload => async dispatch => {
  dispatch({ type: 'email/updateMail', payload })
  return Promise.resolve({ success: true })
}

export const paginateMail = payload => ({ type: 'email/paginate', payload })

export const getCurrentMail = id => ({ type: 'email/getCurrentMail', payload: id })

export const updateMailLabel = ({ id, label } = {}) => async dispatch => {
  dispatch({ type: 'email/updateMailLabel', payload: { id, label } })
  return Promise.resolve({ success: true })
}

export const handleSelectMail = id => ({ type: 'email/selectMail', payload: id })

export default {}
