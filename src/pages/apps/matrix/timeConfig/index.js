// ** React Imports
import { forwardRef, useEffect, useMemo, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'

import CardContent from '@mui/material/CardContent'

import { fetchTimeConfig, updateTimeConfig } from 'src/store/apps/matrix'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { Box } from '@mui/material'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const AddUserModal = ({ data, onClose }) => {
  // ** States
  const dispatch = useDispatch()
  console.log('timecongfig', data)
  const [level1, setLevel1] = useState(data?.level1)
  const [level2, setLevel2] = useState(data?.level2)
  const [level3, setLevel3] = useState(data?.level3)

  //   const level =useMemo(()=>{
  //       return {1:data.timeConfig.level1,2:data.timeConfig.level2,3:data.timeConfig.level3}
  // },[data])

  const handleSubmit = () => {
    dispatch(updateTimeConfig({ level1, level2, level3 }))
    onClose(false)
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
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5} justifyContent={'center'}>
        <Grid item xs={12} sm={3}>
          <CustomTextField disabled label='Level 1' id='level 1' value={level1} onChange={handleLevel1} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <CustomTextField label='Level 2 (In Hours)' id='level 2' value={level2} onChange={handleLevel2} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <CustomTextField label='Level 3 (In Hours)' id='level 3' value={level3} onChange={handleLevel3} />
        </Grid>
        <Grid container justifyContent='center' gap={5} xs={12} sx={{ mt: 5 }}>
          <Button onClick={handleSubmit} variant='contained'>
            SUBMIT
          </Button>
          <Button onClick={onClose} variant='tonal' color='secondary'>
            CANCEL
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
  )
}

export default AddUserModal
