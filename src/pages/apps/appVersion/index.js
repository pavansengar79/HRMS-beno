import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import AddModal from './add'
import { useDispatch, useSelector } from 'react-redux'
import Switch from '@mui/material/Switch'
import { fetchAppVersion, updateAppVersion } from 'src/store/apps/appVersion'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

const Appversion = () => {
  const [show, setShow] = useState(false)
  const data = useSelector(state => state.appVersion)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAppVersion())
  }, [])

  useEffect(() => {
    if (data.shouldFetchData) dispatch(fetchAppVersion())
  }, [data.shouldFetchData])

  return (
    <Grid item xs={12}>
      <Card>
        <Box
          sx={{
            p: 5,
            pb: 3,
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant='h4' sx={{ mb: 2 }}>
            App Version
          </Typography>
          <Button
            sx={{ mb: 2 }}
            variant='contained'
            onClick={() => {
              setShow(true)
            }}
          >
            ADD APP VERSION
          </Button>
        </Box>
      </Card>
      <Card sx={{ marginTop: '30px' }}>
        <CardHeader title='Set Maintenance' />
        <Divider />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={6} sm={3}>
              <Typography variant='h5' marginRight={2}>
                Current Android Version :
              </Typography>
            </Grid>
            <Grid item xs={9} sm={9}>
              <Typography variant='h5' marginRight={2}>
                {data?.appVersion?.latestAndroidBuildNumber}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant='h5' marginRight={2}>
                Current IOS Version :
              </Typography>
            </Grid>
            <Grid item xs={9} sm={9}>
              <Typography variant='h5' marginRight={2}>
                {data?.appVersion?.latestIOSBuildNumber}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant='h5' marginRight={2}>
                Force Android
              </Typography>
            </Grid>
            <Grid item xs={9} sm={9}>
              <Switch
                checked={data?.appVersion?.forceAndroid}
                onChange={event => {
                  dispatch(
                    updateAppVersion({ id: data?.appVersion?._id, data: { forceAndroid: event.target.checked } })
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant='h5' marginRight={2}>
                Force IOS
              </Typography>
            </Grid>
            <Grid item xs={9} sm={9}>
              <Switch
                checked={data?.appVersion?.forceIOS}
                onChange={event => {
                  dispatch(updateAppVersion({ forceIOS: event.target.checked }))
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CustomDialog show={show} setShow={setShow} title='Create App Version'>
          <AddModal onClose={() => setShow(false)} data={data?.appVersion} />
        </CustomDialog>
      </Card>
    </Grid>
  )
}

export default Appversion
