/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'
import NorthIcon from '@mui/icons-material/North'
import SouthIcon from '@mui/icons-material/South'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchQueryData } from 'src/store/apps/query'

const TicketHeader = () => {
  const dispatch = useDispatch()
  const queries = useSelector(state => state?.helpDeskTickets)

  // useEffect(() => {
  //   dispatch(fetchQueryData({}))
  // }, [dispatch])

  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white'
      }}
    >
      <Grid>
        <div>
          <Typography variant='h6' fontWeight={700}>
            MTD
          </Typography>
          <Typography variant='h3' fontWeight={700} color='#1976d2'>
            Ticket Status
          </Typography>
        </div>
      </Grid>
      <Grid>
        <Stack direction={'row'} spacing={2}>
          <div>
            <Typography variant='body2' fontWeight={700}>
              Total Tickets
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h4' fontWeight={700} color='#1976d2'>
                {queries?.counts.reduce((acc, item) => acc + item.count, 0)}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: '700',
                  m: 1,
                  color: `${
                    queries?.percentageChange?.find(item => item._id === 'TOTAL')?.change > 0
                      ? 'green'
                      : queries?.percentageChange?.find(item => item._id === 'TOTAL')?.change < 0
                      ? 'red'
                      : 'orange'
                  }`
                }}
              >
                {queries?.percentageChange?.find(item => item._id === 'TOTAL')?.change || 0}%
                {queries?.percentageChange?.find(item => item._id === 'TOTAL')?.change > 0 ? (
                  <NorthIcon sx={{ fontSize: '10px' }} />
                ) : queries?.percentageChange?.find(item => item._id === 'TOTAL')?.change < 0 ? (
                  <SouthIcon sx={{ fontSize: '10px' }} />
                ) : null}
              </Typography>
            </div>
          </div>
          <div>
            <Typography variant='body2' fontWeight={700}>
              Resolved
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: `${
                    queries?.percentageChange?.find(item => item._id === 'RESOLVED')?.change > 0
                      ? 'green'
                      : queries?.percentageChange?.find(item => item._id === 'RESOLVED')?.change < 0
                      ? 'red'
                      : 'orange'
                  }`
                }}
              >
                {queries?.counts.find(item => item._id === 'RESOLVED')?.count || 0}
              </Typography>
              <Typography sx={{ fontSize: '10px', m: 1, color: 'red', fontWeight: '700' }}>
                {queries?.percentageChange?.find(item => item._id === 'RESOLVED')?.change || 0}%{' '}
                {queries?.percentageChange?.find(item => item._id === 'RESOLVED')?.change > 0 ? (
                  <NorthIcon sx={{ fontSize: '10px' }} />
                ) : queries?.percentageChange?.find(item => item._id === 'RESOLVED')?.change < 0 ? (
                  <SouthIcon sx={{ fontSize: '10px' }} />
                ) : null}
              </Typography>
            </div>
          </div>
          <div>
            <Typography variant='body2' fontWeight={700}>
              Unresolved
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: `${
                    queries?.percentageChange?.find(item => item._id === 'OPEN')?.change > 0
                      ? 'green'
                      : queries?.percentageChange?.find(item => item._id === 'OPEN')?.change < 0
                      ? 'red'
                      : 'orange'
                  }`
                }}
              >
                {queries?.counts.find(item => item._id === 'OPEN')?.count || 0}
              </Typography>
              <Typography
                sx={{
                  fontSize: '10px',
                  fontWeight: '700',
                  m: 1,
                  color: `${
                    queries?.percentageChange?.find(item => item._id === 'OPEN')?.change > 0
                      ? 'green'
                      : queries?.percentageChange?.find(item => item._id === 'OPEN')?.change < 0
                      ? 'red'
                      : 'orange'
                  }`
                }}
              >
                {queries?.percentageChange?.find(item => item._id === 'OPEN')?.change || 0}%{' '}
                {queries?.percentageChange?.find(item => item._id === 'OPEN')?.change > 0 ? (
                  <NorthIcon sx={{ fontSize: '10px' }} />
                ) : queries?.percentageChange?.find(item => item._id === 'OPEN')?.change < 0 ? (
                  <SouthIcon sx={{ fontSize: '10px' }} />
                ) : null}
              </Typography>
            </div>
          </div>
          <div>
            <Typography variant='body2' fontWeight={700}>
              In Progress
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: `${
                    queries?.percentageChange?.find(item => item._id === 'IN PROGRESS')?.change > 0
                      ? 'green'
                      : queries?.percentageChange?.find(item => item._id === 'IN PROGRESS')?.change < 0
                      ? 'red'
                      : 'orange'
                  }`
                }}
              >
                {queries?.counts.find(item => item._id === 'IN PROGRESS')?.count || 0}
              </Typography>
              <Typography sx={{ fontSize: '10px', m: 1, color: 'red', fontWeight: '700' }}>
                {queries?.percentageChange?.find(item => item._id === 'IN PROGRESS')?.change || 0}%{' '}
                {queries?.percentageChange?.find(item => item._id === 'IN PROGRESS')?.change > 0 ? (
                  <NorthIcon sx={{ fontSize: '10px' }} />
                ) : queries?.percentageChange?.find(item => item._id === 'IN PROGRESS')?.change < 0 ? (
                  <SouthIcon sx={{ fontSize: '10px' }} />
                ) : null}
              </Typography>
            </div>
          </div>
        </Stack>
      </Grid>
    </Box>
  )
}

export default TicketHeader
