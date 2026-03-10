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
//   const [status, setStatus] = useState()
// const [name, setName] = useState()
// const [price, setPrice] = useState()
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

// const handleStatus = event => {
//   setStatus(event.target.value)
// }

// const handleName = event => {
//   setName(event.target.value)
// }

// const handleprice = event => {
//   setPrice(event.target.value)
// }

//   const handleRemark = event => {
//     setRemark(event.target.value)
//   }

//   const handleSubmit = () => {
//     const senddata = { name: name, price: price, status: status }
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
//             label='price'
//             id='form-layouts-separator-select'
//             defaultValue={price}
//             onChange={handleprice}
//           ></CustomTextField>
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <CustomTextField
//             select
//             fullWidth
//             label='Status'
//             id='form-layouts-separator-select'
//             defaultValue={status}
//             onChange={handleStatus}
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
import { fetchrepairData, updateInvestment } from 'src/store/apps/roiMasters'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'

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

const EditModal = ({ data, onClose }) => {
  console.log('daaa', data)

  // ** States
  const [name, setName] = useState(data.name)
  const [date, setDate] = useState(null)
  const [language, setLanguage] = useState([])

  //   const [status, setStatus] = useState(data.status)

  //   const [price, setPrice] = useState(data.avgPrice)
  //   const [margin, setMargin] = useState(data.margin)
  const [remark, setRemark] = useState()

  const [values, setValues] = useState({
    password: '',
    password2: '',
    showPassword: false,
    showPassword2: false
  })

  const dispatch = useDispatch()

  // Handle Password
  const handlePasswordChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  // Handle Confirm Password
  const handleConfirmChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowConfirmPassword = () => {
    setValues({ ...values, showPassword2: !values.showPassword2 })
  }

  // Handle Select
  const handleSelectChange = event => {
    setLanguage(event.target.value)
  }

  const handleStatus = event => {
    setStatus(event.target.value)
  }

  const handleName = event => {
    setName(event.target.value)
  }

  const handlePrice = event => {
    setPrice(event.target.value)
  }

  const handleMargin = event => {
    setMargin(event.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (name) {
      dispatch(updateInvestment({ id: data._id, name: name }))
      handleCancel()
    } else {
      toast.error('No fields should be empty', { duration: 2000 })
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container rowGap={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            label='Name'
            id='form-layouts-separator-select'
            defaultValue={name}
            onChange={handleName}
          ></CustomTextField>
        </Grid>
        <Grid container justifyContent='center' columnGap={4}>
          <Button type='submit' variant='contained'>
            SUBMIT
          </Button>
          <Button variant='tonal' color='secondary' onClick={onClose}>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal
