// ** MUI Imports
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'

// ** Demo Components
import CreateApiKey from 'src/views/pages/account-settings/security/CreateApiKey'
import ChangePasswordCard from 'src/views/pages/account-settings/security/ChangePasswordCard'
import TwoFactorAuthentication from 'src/views/pages/account-settings/security/TwoFactorAuthentication'

// ** API
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

const apiKeyList = [
  {
    title: 'Server Key 1',
    access: 'Full Access',
    date: '28 Apr 2021, 18:20 GTM+4:10',
    key: '23eaf7f0-f4f7-495e-8b86-fad3261282ac'
  },
  {
    title: 'Server Key 2',
    access: 'Read Only',
    date: '12 Feb 2021, 10:30 GTM+2:30',
    key: 'bb98e571-a2e2-4de8-90a9-2e231b5e99'
  },
  {
    title: 'Server Key 3',
    access: 'Full Access',
    date: '28 Dec 2021, 12:21 GTM+4:10',
    key: '2e915e59-3105-47f2-8838-6e46bf83b711'
  }
]

const recentDeviceData = [
  {
    location: 'Switzerland',
    device: 'HP Spectre 360',
    date: '10, July 2021 20:07',
    browserName: 'Chrome on Windows',
    browserIcon: (
      <Box component='span' sx={{ mr: 2.5, display: 'flex', '& svg': { color: 'info.main' } }}>
        <Icon icon='tabler:brand-windows' />
      </Box>
    )
  },
  {
    location: 'Australia',
    device: 'iPhone 12x',
    date: '13, July 2021 10:10',
    browserName: 'Chrome on iPhone',
    browserIcon: (
      <Box component='span' sx={{ mr: 2.5, display: 'flex', '& svg': { color: 'error.main' } }}>
        <Icon icon='tabler:device-mobile' />
      </Box>
    )
  },
  {
    location: 'Dubai',
    device: 'Oneplus 9 Pro',
    date: '14, July 2021 15:15',
    browserName: 'Chrome on Android',
    browserIcon: (
      <Box component='span' sx={{ mr: 2.5, display: 'flex', '& svg': { color: 'success.main' } }}>
        <Icon icon='tabler:brand-android' />
      </Box>
    )
  },
  {
    location: 'India',
    device: 'Apple iMac',
    date: '16, July 2021 16:17',
    browserName: 'Chrome on MacOS',
    browserIcon: (
      <Box component='span' sx={{ mr: 2.5, display: 'flex', '& svg': { color: 'secondary.main' } }}>
        <Icon icon='tabler:brand-apple' />
      </Box>
    )
  },
  {
    location: 'Switzerland',
    device: 'HP Spectre 360',
    date: '20, July 2021 21:01',
    browserName: 'Chrome on Windows',
    browserIcon: (
      <Box component='span' sx={{ mr: 2.5, display: 'flex', '& svg': { color: 'info.main' } }}>
        <Icon icon='tabler:brand-windows' />
      </Box>
    )
  },
  {
    location: 'Dubai',
    device: 'Oneplus 9 Pro',
    date: '21, July 2021 12:22',
    browserName: 'Chrome on Android',
    browserIcon: (
      <Box component='span' sx={{ mr: 2.5, display: 'flex', '& svg': { color: 'success.main' } }}>
        <Icon icon='tabler:brand-android' />
      </Box>
    )
  }
]

const TabSecurity = () => {
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // ── Fetch active sessions ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchActiveSessions()
  }, [])

  const fetchActiveSessions = async () => {
    setSessionsLoading(true)
    try {
      const response = await axiosRequest.get('/api/v1/auth/sessions')
      setSessions(response?.data?.sessions || [])
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      // Don't show error toast - feature might not be implemented yet
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await axiosRequest.delete(`/api/v1/auth/sessions/${sessionId}`)
      toast.success('Session revoked successfully')
      fetchActiveSessions() // Refresh list
    } catch (err) {
      console.error('Failed to revoke session:', err)
      toast.error(err?.message || 'Failed to revoke session')
    }
  }

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChangePasswordCard />
      </Grid>
      <Grid item xs={12}>
        <TwoFactorAuthentication />
      </Grid>

      {/* ── Active Sessions ─────────────────────────────────────────────────────── */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Active Sessions' 
            action={
              <Button 
                size='small' 
                variant='outlined'
                startIcon={<Icon icon='mdi:refresh' />}
                onClick={fetchActiveSessions}
              >
                Refresh
              </Button>
            }
          />
          <CardContent>
            <Typography sx={{ mb: 4, color: 'text.secondary' }}>
              These are the devices where you're currently logged in. Revoke any session that you don't recognize.
            </Typography>

            {sessionsLoading ? (
              <LinearProgress />
            ) : sessions.length === 0 ? (
              <Typography variant='body2' color='text.secondary' align='center' sx={{ py: 4 }}>
                No active sessions found
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Device</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Browser</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Active</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session, idx) => (
                      <TableRow key={session._id || idx} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Icon icon={session.device?.type === 'mobile' ? 'mdi:cellphone' : 'mdi:laptop'} fontSize={20} />
                            <Typography variant='body2'>{session.device?.name || session.userAgent || 'Unknown Device'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{session.browser?.name || 'Unknown'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{session.ipAddress || 'Unknown'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{session.location || 'Unknown'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{formatLastActive(session.lastActive)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.current ? 'Current' : 'Active'}
                            size='small'
                            color={session.current ? 'primary' : 'success'}
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>
                          {!session.current && (
                            <Button
                              size='small'
                              color='error'
                              variant='text'
                              startIcon={<Icon icon='mdi:logout' />}
                              onClick={() => handleRevokeSession(session._id)}
                            >
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* API Key List - kept for reference but hidden */}
      {/* <Grid item xs={12}>
        <CreateApiKey />
      </Grid> */}

      {/* API Key List & Access Card*/}
      {/* <Grid item xs={12}>
        <Card>
          <CardHeader title='API Key List & Access' />
          <CardContent>
            <Typography sx={{ mb: 4, color: 'text.secondary' }}>
              An API key is a simple encrypted string that identifies an application without any principal. They are
              useful for accessing public data anonymously, and are used to associate API requests with your project for
              quota and billing.
            </Typography>
            {apiKeyList.map(item => {
              return (
                <Box
                  key={item.key}
                  sx={{ p: 4, borderRadius: 1, backgroundColor: 'action.hover', '&:not(:last-child)': { mb: 4 } }}
                >
                  <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='h4' sx={{ mr: 4 }}>
                      {item.title}
                    </Typography>
                    <CustomChip
                      rounded
                      size='small'
                      skin='light'
                      color='primary'
                      label={item.access}
                      sx={{ textTransform: 'uppercase' }}
                    />
                  </Box>
                  <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 2.5, color: 'text.secondary', fontWeight: 500 }}>{item.key}</Typography>
                    <Box component='span' sx={{ display: 'flex', cursor: 'pointer', color: 'text.disabled' }}>
                      <Icon icon='tabler:copy' />
                    </Box>
                  </Box>
                  <Typography sx={{ color: 'text.disabled' }}>Created on {item.date}</Typography>
                </Box>
              )
            })}
          </CardContent>
        </Card>
      </Grid> */}

      {/* Recent Devices Card*/}
      {/* <Grid item xs={12}>
        <Card>
          <CardHeader title='Recent Devices' />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Browser</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Device</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Location</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Recent Activities</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ '& .MuiTableCell-root': { py: theme => `${theme.spacing(2.5)} !important` } }}>
                {recentDeviceData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {row.browserIcon}
                        <Typography sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                          {row.browserName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{row.device}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{row.location}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{row.date}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid> */}
    </Grid>
  )
}

export default TabSecurity
