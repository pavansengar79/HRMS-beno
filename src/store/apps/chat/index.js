// Minimal stubs for chat store actions/selectors used by pages
export const sendMsg = payload => async dispatch => {
  dispatch({ type: 'chat/send', payload })
}

export const selectChat = id => ({ type: 'chat/select', payload: id })

export const fetchUserProfile = () => async dispatch => {
  dispatch({ type: 'chat/fetchUserProfile' })
}

export const fetchChatsContacts = () => async dispatch => {
  dispatch({ type: 'chat/fetchChatsContacts' })
}

export const removeSelectedChat = () => ({ type: 'chat/removeSelected' })

export default {}
