// ** React Imports
import { useState } from 'react'

// ** MUI Imports

import Button from '@mui/material/Button'

import { fetchTimeConfig, updateTimeConfig } from 'src/store/apps/matrix'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import { Card, Grid, Typography } from '@mui/material'

const AddUserModal = ({ data, setSwitchtab }) => {
  // ** States
  const dispatch = useDispatch()

  const [level1, setLevel1] = useState(data?.level1)
  const [level2, setLevel2] = useState(data?.level2)
  const [level3, setLevel3] = useState(data?.level3)
  const [error, setError] = useState(false)
  //   const level =useMemo(()=>{
  //       return {1:data.timeConfig.level1,2:data.timeConfig.level2,3:data.timeConfig.level3}
  // },[data])

  const handleSubmit = () => {
    if (level2 > level3) {
      setError(true)
      return
    } else {
      setError(false)
      dispatch(updateTimeConfig({ level1, level2, level3 }))
    }

    // setSwitchtab('Category and User List')
  }

  const handleLevel1 = e => {
    setLevel1(e.target.value)
  }

  const handleLevel2 = e => {
    setLevel2(e.target.value)
  }

  const handleLevel3 = e => {
    setLevel3(e.target.value)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Grid container padding={4} rowGap={4} xs={6} alignItems={'center'}>
          <Grid item xs={12} sm={12}>
            <Typography variant='h6'>Define Level and Escalation Time </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField disabled label='Level 1 Time' id='level 1' value={level1} onChange={handleLevel1} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 7 }}>
              Ticket assigned immediately
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField label='Level 2 Time (In Hours)' id='level 2' value={level2} onChange={handleLevel2} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 4 }}>
              Escalated after {data?.level2} hours of ticket creation
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              label='Level 3 Time (In Hours)'
              id='level 3'
              value={level3}
              onChange={handleLevel3}
              error={error}
              helperText={error && 'Level 3 value must be greater than Level 2'}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 4 }}>
              Escalated after {data?.level3} hours of ticket creation
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button onClick={e => setSwitchtab('Category and User List')} variant='tonal' color='secondary'>
              CANCEL
            </Button>
            <Button onClick={handleSubmit} variant='contained' sx={{ ml: 4 }}>
              SUBMIT
            </Button>
          </Grid>
        </Grid>
        {/* <Button onClick={handleSubmit} sx={{ mr: 2, mt: 4 }} variant='contained'>
        Submit
      </Button>
      <Button onClick={onClose} sx={{ mr: 2, mt: 4 }} variant='outlined'>
      Cancel
    </Button> */}
      </form>
    </Card>
  )
}

export default AddUserModal
