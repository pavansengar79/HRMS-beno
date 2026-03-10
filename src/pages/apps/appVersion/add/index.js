// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { addAppVersion } from 'src/store/apps/appVersion'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch } from 'react-redux'
import Switch from '@mui/material/Switch'
import toast from 'react-hot-toast'

const AddModal = ({ onClose, data }) => {
  // ** States
  console.log('data', data)
  const [forceAndroid, setForceAndroid] = useState(false)
  const [forceIOS, setForceIOS] = useState(false)
  const [latestAndroidBuildNumber, setLatestAndroidBuildNumber] = useState(null)
  const [latestIOSBuildNumber, setLatestIOSBuildNumber] = useState(null)

  const dispatch = useDispatch()

  const handleAndroid = event => {
    setLatestAndroidBuildNumber(event.target.value)
  }

  const handleIOS = event => {
    setLatestIOSBuildNumber(event.target.value)
  }

  const handleSubmit = () => {
    if (latestAndroidBuildNumber <= data.latestAndroidBuildNumber) {
      toast.error(`Android version must be greater ${data?.latestAndroidBuildNumber}`, { duration: 2000 })
    }
    if (latestIOSBuildNumber <= data.latestIOSBuildNumber) {
      toast.error(`IOS version must be greater than ${data?.latestIOSBuildNumber} `, { duration: 2000 })
    }
    if (latestAndroidBuildNumber > data.latestAndroidBuildNumber && latestIOSBuildNumber > data.latestIOSBuildNumber) {
      // dispatch(addAppVersion(forceAndroid, forceIOS, latestAndroidBuildNumber, latestIOSBuildNumber))
      handleCancel()
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const handleKeyPress = e => {
    const allowedCharacters = /^[0-9]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Android Version'
            placeholder=''
            id='form-layouts-separator-select'
            onChange={handleAndroid}
            onKeyPress={handleKeyPress}
          ></CustomTextField>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='IOS Version'
            placeholder=''
            id='form-layouts-separator-select'
            onChange={handleIOS}
            onKeyPress={handleKeyPress}
          ></CustomTextField>
          <Typography variant='body2' marginRight={2}>
            Force Android :
            <Switch
              onChange={event => {
                setForceAndroid(event.target.checked)
              }}
            />
          </Typography>
          <Typography variant='body2' marginRight={2}>
            Force IOS :
            <Switch
              onChange={event => {
                setForceIOS(event.target.checked)
              }}
            />
          </Typography>
          <Button onClick={handleSubmit} sx={{ mr: 2, mt: 5 }} variant='contained' fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default AddModal
