// // ** React Imports
// import { forwardRef, useEffect, useState } from 'react'
// import { useRouter } from 'next/router'
// import { useDispatch, useSelector } from 'react-redux'
// import { addReason } from 'src/store/apps/reject-reason'
// import { fetchRowReasonData } from 'src/store/apps/reject-reason'

// // ** MUI Imports
// import Card from '@mui/material/Card'
// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'
// import Divider from '@mui/material/Divider'
// import MenuItem from '@mui/material/MenuItem'
// import CardHeader from '@mui/material/CardHeader'
// import IconButton from '@mui/material/IconButton'
// import Typography from '@mui/material/Typography'
// import CardContent from '@mui/material/CardContent'
// import CardActions from '@mui/material/CardActions'
// import InputAdornment from '@mui/material/InputAdornment'
// import Box from '@mui/material/Box'
// import Modal from '@mui/material/Modal'

// // ** Custom Component Import
// import CustomTextField from 'src/@core/components/mui/text-field'

// // ** Third Party Imports
// import DatePicker from 'react-datepicker'

// // ** Icon Imports
// import Icon from 'src/@core/components/icon'

// const CustomInput = forwardRef((props, ref) => {
//   return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
// })

// const AddRejectModal = () => {
//   // ** States
//   const [date, setDate] = useState(null)
//   const [language, setLanguage] = useState([])
//   const [report, setReport] = useState()
// const [name, setName] = useState()
// const [email, setEmail] = useState()
//   const [remark, setRemark] = useState()
//   const router = useRouter()
//   const dispatch = useDispatch()

//   const [values, setValues] = useState({
//     password: '',
//     password2: '',
//     showPassword: false,
//     showPassword2: false
//   })
//   const data = useSelector(state => state.reason)
//   console.log('data', data)

//   // Handle Password
//   const handlePasswordChange = prop => event => {
//     setValues({ ...values, [prop]: event.target.value })
//   }

//   const handleClickShowPassword = () => {
//     setValues({ ...values, showPassword: !values.showPassword })
//   }

//   // Handle Confirm Password
//   const handleConfirmChange = prop => event => {
//     setValues({ ...values, [prop]: event.target.value })
//   }

//   const handleClickShowConfirmPassword = () => {
//     setValues({ ...values, showPassword2: !values.showPassword2 })
//   }

//   // Handle Select
//   const handleSelectChange = event => {
//     setLanguage(event.target.value)
//   }

// const handlereport = event => {
//   setReport(event.target.value)
// }

// const handleName = event => {
//   setName(event.target.value)
// }

// const handleEmail = event => {
//   setEmail(event.target.value)
// }

//   const handleRemark = event => {
//     setRemark(event.target.value)
//   }

//   const handleSubmit = () => {
//     const senddata = { name: name, email: email, report: report }
//     dispatch(addReason(senddata))
//     router.push('/apps/reject-reason')
//   }

//   return (
// <Card>
//   <CardHeader title='Add Escalation Matrix' />
//   <Divider sx={{ m: '0 !important' }} />
//   <form onSubmit={handleSubmit}>
//     <CardContent>
//       <Grid container spacing={5}>
//         <Grid item xs={12} sm={6}>
//           <CustomTextField
//             fullWidth
//             label='Name'
//             id='form-layouts-separator-select'
//             defaultValue={name}
//             onChange={handleName}
//           ></CustomTextField>
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <CustomTextField
//             fullWidth
//             label='email'
//             id='form-layouts-separator-select'
//             defaultValue={email}
//             onChange={handleEmail}
//           ></CustomTextField>
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <CustomTextField
//             select
//             fullWidth
//             label='report'
//             id='form-layouts-separator-select'
//             defaultValue={report}
//             onChange={handlereport}
//           >
//             <MenuItem value='true'>TRUE</MenuItem>
//             <MenuItem value='false'>FALSE</MenuItem>
//           </CustomTextField>
//         </Grid>
//       </Grid>
//       <Button onClick={handleSubmit} sx={{ mr: 2, mt: 4 }} variant='contained'>
//         Submit
//       </Button>
//       <Button onClick={() => router.back()} sx={{ mr: 2, mt: 4 }} variant='outlined'>
//         cancel
//       </Button>
//     </CardContent>
//   </form>
// </Card>
//   )
// }

// export default AddRejectModal

// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import { addMailScheduler } from 'src/store/apps/mail-scheduler'
import toast from 'react-hot-toast'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch } from 'react-redux'

const CustomInput = forwardRef((props, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

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

const AddModal = forwardRef(({ onClose, onUpdate }, ref) => {
  // ** States
  const [report, setReport] = useState()
  const [frequency, setFrequency] = useState()
  const [email, setEmail] = useState()
  const [submitButton, setSubmitButton] = useState(false)

  const dispatch = useDispatch()

  const handleReport = event => {
    setReport(event.target.value)
  }

  const handleFrequency = event => {
    setFrequency(event.target.value)
  }

  const handleEmail = event => {
    setEmail(event.target.value)
  }

  const handleSubmit = () => {
    setSubmitButton(true)
    if (report && frequency && email) {
      dispatch(addMailScheduler({ report: report, frequency: frequency, userList: email }))
      onUpdate()
      handleCancel()
    } else {
      setSubmitButton(false)

      toast.error('Please enter all the fields', {
        duration: 2000,
        style: { zIndex: 999 }
      })
    }

    // dispatch(addMailScheduler({ report: report, frequency: frequency, userList: email }))
    // onUpdate()

    // // dispatch(fetchrepairData())
    // handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Box sx={style} inputRef={ref}>
      <Card>
        <CardHeader title='Add Users' />
        <Divider sx={{ m: '0 !important' }} />
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Report'
                  id='form-layouts-separator-select'
                  onChange={handleReport}

                  // defaultValue={report}
                >
                  <MenuItem value='Secondary Sales'>Secondary Sales</MenuItem>
                  <MenuItem value='Orders'>Orders</MenuItem>
                  <MenuItem value='Payments'>Payments</MenuItem>
                  <MenuItem value='Device logins'>Device logins</MenuItem>
                  <MenuItem value='Dealer order'>Dealer order</MenuItem>
                  <MenuItem value='Dealer payment'>Dealer payment</MenuItem>
                  <MenuItem value='Warranty'>Warranty</MenuItem>
                  <MenuItem value='Claims'>Claims</MenuItem>
                  <MenuItem value='Retread'>Retread</MenuItem>
                  <MenuItem value='Queries'>Queries</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='frequency'
                  id='form-layouts-separator-select'
                  onChange={handleFrequency}

                  // defaultValue={frequency}
                >
                  <MenuItem value='Daily'>Daily</MenuItem>
                  <MenuItem value='Weekly'>Weekly</MenuItem>
                  <MenuItem value='Monthly'>Monthly</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Email'
                  id='form-layouts-separator-select'
                  onChange={handleEmail}

                  // defaultValue={email}
                ></CustomTextField>
              </Grid>
            </Grid>
            <Button disabled={submitButton} onClick={handleSubmit} sx={{ mr: 2, mt: 4 }} variant='contained'>
              Submit
            </Button>
            <Button onClick={handleCancel} sx={{ mr: 2, mt: 4 }} variant='outlined'>
              cancel
            </Button>
          </CardContent>
        </form>
      </Card>
    </Box>
  )
})

export default AddModal
