// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const balanceData = [
  { type: 'Annual Leave',   total: 21, used: 8,  color: 'primary', icon: 'tabler:calendar'       },
  { type: 'Sick Leave',     total: 10, used: 3,  color: 'error',   icon: 'tabler:heart-rate-monitor' },
  { type: 'Casual Leave',   total: 7,  used: 2,  color: 'warning', icon: 'tabler:coffee'          },
  { type: 'Maternity Leave',total: 90, used: 0,  color: 'success', icon: 'tabler:baby-carriage'   },
]

const BalanceCard = ({ data }) => {
  const remaining = data.total - data.used
  const pct       = Math.round((data.used / data.total) * 100)

  return (
    <Card variant='outlined'>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar variant='rounded' sx={{ mr: 3, bgcolor: `${data.color}.light` }}>
            <Icon icon={data.icon} color={data.color} />
          </Avatar>
          <Typography variant='h6'>{data.type}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant='body2' color='text.secondary'>Used: {data.used} days</Typography>
          <Typography variant='body2' color='text.secondary'>Remaining: {remaining} days</Typography>
        </Box>

        <LinearProgress variant='determinate' value={pct} color={data.color} sx={{ height: 8, borderRadius: 4 }} />

        <Typography variant='caption' color='text.disabled' sx={{ mt: 1, display: 'block' }}>
          {pct}% of {data.total} days used
        </Typography>
      </CardContent>
    </Card>
  )
}

const TabLeaveBalance = () => (
  <Grid container spacing={4}>
    <Grid item xs={12}>
      <Typography variant='h5' sx={{ mb: 2 }}>My Leave Balance</Typography>
    </Grid>
    {balanceData.map((d, i) => (
      <Grid item xs={12} sm={6} md={3} key={i}>
        <BalanceCard data={d} />
      </Grid>
    ))}
  </Grid>
)

export default TabLeaveBalance