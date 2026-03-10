// // ** React Imports
// import { forwardRef, useState, useEffect } from 'react'

// // ** MUI Imports
// import Card from '@mui/material/Card'
// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'
// import Divider from '@mui/material/Divider'
// import CardHeader from '@mui/material/CardHeader'
// import Typography from '@mui/material/Typography'
// import CardContent from '@mui/material/CardContent'
// import Box from '@mui/material/Box'
// import { addMaintenance } from 'src/store/apps/maintenance'

// // ** Custom Component Import

// // ** Third Party Imports
// import DatePicker from 'react-datepicker'

// // ** Icon Imports
// import { useDispatch } from 'react-redux'
// import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
// import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
// import Switch from '@mui/material/Switch'
// import CustomTextField from 'src/@core/components/mui/text-field'

// const AddModal = () => {
//   // ** States

//   const [endDate, setEndDate] = useState()
//   const [mode, setMode] = useState(false)
//   const [reason, setReason] = useState()

//   const dispatch = useDispatch()

//   // const hadleReasons = () => {
//   //   const handleKeyPress = e => {
//   //     const allowedCharacters = /^[a-zA-Z\s]+$/
//   //     if (!allowedCharacters.test(e.key)) {
//   //       e.preventDefault()
//   //     }
//   //   }
//   // }
//   const handleKeyPress = e => {
//     const allowedCharacters = /^[a-zA-Z\s]+$/
//     if (!allowedCharacters.test(e.key)) {
//       e.preventDefault()
//     }
//   }

//   const handleSubmit = () => {
//     dispatch(addMaintenance({ endDate: endDate, maintenanceMode: mode, maintenanceReason: reason }))
//   }

//   return (
//     <Grid item xs={12}>
//       <Card>
//         <Box
//           sx={{
//             p: 5,
//             pb: 3,
//             width: '100%',
//             display: 'flex',
//             flexWrap: 'wrap',
//             alignItems: 'center',
//             justifyContent: 'space-between'
//           }}
//         >
//           <Typography variant='h4' sx={{ mb: 2 }}>
//             Maintenance Mode
//           </Typography>
//         </Box>
//       </Card>
//       <Card sx={{ marginTop: '30px' }}>
//         <CardHeader title='Set Maintenance' />
//         <Divider />
//         <CardContent>
//           <Grid container spacing={5}>
//             <Grid item xs={6} sm={3}>
//               <Typography variant='h5' marginRight={2}>
//                 Maintenance Mode
//               </Typography>
//             </Grid>
//             <Grid item xs={9} sm={9}>
//               <Switch
//                 onChange={event => {
//                   setMode(event.target.checked)
//                 }}
//               />
//             </Grid>
//             <Grid item xs={6} sm={3}>
//               <Typography variant='h5' marginRight={2}>
//                 End Date :
//               </Typography>
//             </Grid>
//             <Grid item xs={9} sm={9}>
//               <DatePickerWrapper>
//                 {/* <DatePicker
//                   selected={endDate}
//                   id='basic-input'
//                   popperPlacement={'bottom-start'}
//                   onChange={date => setEndDate(date)}
//                   placeholderText='mm/dd/yyy'
//                   customInput={<PickersCustomInput />}
//                 /> */}

//                 <DatePicker
//                   showTimeSelect
//                   timeFormat='HH:mm'
//                   timeIntervals={15}
//                   selected={endDate}
//                   id='date-time-picker'
//                   dateFormat='MM/dd/yyyy h:mm aa'
//                   popperPlacement={'bottom-start'}
//                   onChange={date => setEndDate(date)}
//                   customInput={<PickersCustomInput />}
//                   placeholderText='mm/dd/yyyy hh:mm'
//                 />
//               </DatePickerWrapper>
//             </Grid>
//             <Grid item xs={6} sm={3}>
//               <Typography variant='h5' marginRight={2}>
//                 Maintenance Reason :
//               </Typography>
//             </Grid>
//             <Grid item xs={9} sm={9}>
//               <CustomTextField type='text' onChange={e => setReason(e.target.value)} onKeyPress={handleKeyPress} />
//             </Grid>
//           </Grid>
//           <Button sx={{ mb: 2, mt: 4 }} variant='contained' onClick={handleSubmit}>
//             SUBMIT
//           </Button>
//         </CardContent>
//       </Card>
//     </Grid>
//   )
// }

// export default AddModal

// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import { addMaintenance } from 'src/store/apps/maintenance'

// ** Custom Component Import

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import { useDispatch } from 'react-redux'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import Switch from '@mui/material/Switch'
import CustomTextField from 'src/@core/components/mui/text-field'

const AddModal = () => {
  // ** States

  const [endDate, setEndDate] = useState()
  const [mode, setMode] = useState(false)
  const [reason, setReason] = useState()

  const dispatch = useDispatch()

  // const hadleReasons = () => {
  //   const handleKeyPress = e => {
  //     const allowedCharacters = /^[a-zA-Z\s]+$/
  //     if (!allowedCharacters.test(e.key)) {
  //       e.preventDefault()
  //     }
  //   }
  // }
  const handleKeyPress = e => {
    const allowedCharacters = /^[a-zA-Z\s]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleSubmit = () => {
    dispatch(addMaintenance({ endDate: endDate, maintenanceMode: mode, maintenanceReason: reason }))
    setEndDate()
    setMode(false)
    setReason('')
  }

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
            Maintenance Mode
          </Typography>
        </Box>
      </Card>
      <Card sx={{ marginTop: '30px' }}>
        <CardHeader title='Set Maintenance' />
        <Divider />
        <CardContent>
          <Grid container spacing={12}>
            <Grid container alignItems={'center'} gap={10} item xs={12} sm={12}>
              <Typography variant='h5'>Maintenance Mode</Typography>
              <Switch
                checked={mode}
                onChange={event => {
                  setMode(event.target.checked)
                }}
              />
            </Grid>
            <Grid container alignItems={'center'} gap={30} item xs={12} sm={12}>
              <Typography variant='h5'>End Date :</Typography>
              <DatePickerWrapper>
                {/* <DatePicker
                  selected={endDate}
                  id='basic-input'
                  popperPlacement={'bottom-start'}
                  onChange={date => setEndDate(date)}
                  placeholderText='mm/dd/yyy'
                  customInput={<PickersCustomInput />}
                /> */}

                <DatePicker
                  showTimeSelect
                  timeFormat='HH:mm'
                  timeIntervals={15}
                  selected={endDate}
                  id='date-time-picker'
                  dateFormat='MM/dd/yyyy h:mm aa'
                  popperPlacement={'right-end'}
                  onChange={date => setEndDate(date)}
                  customInput={<PickersCustomInput />}
                  placeholderText='mm/dd/yyyy hh:mm'
                  minDate={new Date()}
                />
              </DatePickerWrapper>
            </Grid>
            <Grid container alignItems={'center'} gap={5} item xs={12} sm={12}>
              <Typography variant='h5'>Maintenance Reason :</Typography>
              <CustomTextField type='text' value={reason} onChange={e => setReason(e.target.value)} />
            </Grid>
          </Grid>
          <Button sx={{ mb: 2, mt: 4 }} variant='contained' onClick={handleSubmit}>
            SUBMIT
          </Button>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AddModal
