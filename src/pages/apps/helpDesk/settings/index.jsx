import { Grid, InputAdornment, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import EscalationLevel from 'src/pages/pages/helpDeskComponents/EscalationLevel'
import TicketHeader from 'src/pages/pages/helpDeskComponents/Header'
import TicketAssignUser from 'src/pages/pages/helpDeskComponents/TicketAssignUser2'
import TicketSettingList from 'src/pages/pages/helpDeskComponents/TicketList'
import SearchIcon from '@mui/icons-material/Search'
import { fetchTimeConfig } from 'src/store/apps/matrix'
import { useDispatch, useSelector } from 'react-redux'

// import TicketAssignUser from 'src/pages/pages/helpDeskComponents/TicketAssignUser'

const Index = () => {
  const [switchtab, setSwitchtab] = useState('Category and User List')
  const dispatch = useDispatch()
  const data = useSelector(state => state.matrix)
  useEffect(() => {
    dispatch(fetchTimeConfig())
  }, [])

  useEffect(() => {
    if (data.shouldFetchData) {
      dispatch(fetchTimeConfig())
    }
  }, [data.shouldFetchData])

  return (
    <Grid>
      <TicketHeader switchtab={switchtab} setSwitchtab={setSwitchtab} />
      {switchtab === 'Category and User List' ? (
        <TicketSettingList />
      ) : switchtab === 'Configure Time' ? (
        <EscalationLevel data={data?.timeConfig} switchtab={switchtab} setSwitchtab={setSwitchtab} />
      ) : (
        <TicketAssignUser switchtab={switchtab} setSwitchtab={setSwitchtab} />
      )}
    </Grid>
  )
}

export default Index
