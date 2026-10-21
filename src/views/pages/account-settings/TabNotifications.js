import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'

const TabNotifications = () => {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [savedEmailEnabled, setSavedEmailEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    axiosRequest.get('/api/v1/notifications/preferences')
      .then(response => {
        if (!active) return
        const enabled = response.data.emailEnabled
        setEmailEnabled(enabled)
        setSavedEmailEnabled(enabled)
      })
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await axiosRequest.put('/api/v1/notifications/preferences', { emailEnabled })
      setSavedEmailEnabled(response.data.emailEnabled)
      setEmailEnabled(response.data.emailEnabled)
      toast.success('Notification preferences saved')
    } catch (error) {
      toast.error('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Notification Preferences' subheader='Choose whether to receive optional notification emails.' />
      <CardContent>
        <FormControlLabel
          control={<Checkbox checked={emailEnabled} onChange={event => setEmailEnabled(event.target.checked)} disabled={loading || saving} />}
          label='Email notifications'
        />
      </CardContent>
      <CardContent>
        <Button variant='contained' sx={{ mr: 3 }} onClick={savePreferences} disabled={loading || saving || emailEnabled === savedEmailEnabled}>
          {saving ? <CircularProgress size={20} color='inherit' /> : 'Save Changes'}
        </Button>
        <Button variant='tonal' color='secondary' onClick={() => setEmailEnabled(savedEmailEnabled)} disabled={loading || saving || emailEnabled === savedEmailEnabled}>
          Discard
        </Button>
      </CardContent>
    </Card>
  )
}

export default TabNotifications
