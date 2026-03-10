import { Divider, Grid, Card } from '@mui/material'

import TicketHeader from 'src/pages/pages/helpDeskComponents/TicketHeader'
import TicketStatusList from 'src/pages/pages/helpDeskComponents/TicketStatusList'

const TicketList = () => {
  return (
    <Card>
      <TicketHeader />
      <Divider />
      <TicketStatusList />
    </Card>
  )
}

export default TicketList
