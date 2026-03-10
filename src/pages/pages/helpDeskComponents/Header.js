import { useState } from 'react'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
const { Grid, Typography, Button, Card, Divider } = require('@mui/material')
const { Box, Stack } = require('@mui/system')

const TicketHeader = ({ switchtab, setSwitchtab }) => {
  const handleAlignment = (event, value) => {
    if (value != null) {
      setSwitchtab(value)
    }
  }

  return (
    <Card>
      <Box
        sx={{
          p: 2,
          pb: 3,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}
      >
        <Grid>
          {switchtab == 'Category and User List' ? (
            <div>
              <Typography variant='body2' fontWeight={700}>
                View, Edit and Delete
              </Typography>
              <Typography variant='h3' fontWeight={700} color='#1976d2'>
                Ticket Categories
              </Typography>
            </div>
          ) : (
            ''
          )}
          {switchtab == 'Configure Time' ? (
            <div>
              <Typography variant='body2' fontWeight={700}>
                Configure
              </Typography>
              <Typography variant='h3' fontWeight={700} color='#1976d2'>
                Escalation Level Time
              </Typography>
            </div>
          ) : (
            ''
          )}
          {switchtab == 'Configure Tickets' ? (
            <div>
              <Typography variant='body2' fontWeight={700}>
                Configure
              </Typography>
              <Typography variant='h3' fontWeight={700} color='#1976d2'>
                Tickets and Assign Users
              </Typography>
            </div>
          ) : (
            ''
          )}
        </Grid>
        <Grid>
          <ToggleButtonGroup exclusive color='primary' value={switchtab} onChange={handleAlignment}>
            <ToggleButton value='Category and User List'>Category List</ToggleButton>
            <ToggleButton value='Configure Time'>Time Configuration</ToggleButton>
            <ToggleButton value='Configure Tickets'>Ticket Configuration</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Box>
      <Divider />
    </Card>
  )
}

export default TicketHeader
