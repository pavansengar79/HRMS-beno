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
import { forwardRef, useState, useEffect, useRef } from 'react'
import exportExcel from 'src/utils/genarateExcel'
import { fetchData } from 'src/store/apps/productsPage/products'
import { bulkUploadProduct } from 'src/store/apps/dealerGroup'

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

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as XLSX from 'xlsx'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { ref } from 'yup'
import Link from 'next/link'
import { styled } from '@mui/material/styles'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const CustomInput = forwardRef((props, ref) => {
  return <CustomTextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const AddModal = ({ onClose }) => {
  // ** States
  const [groupName, setGroupName] = useState()
  const [submit, setSubmit] = useState(true)
  const [file, setFile] = useState()
  const ref = useRef()
  const dispatch = useDispatch()
  const [csvData, setCsvData] = useState()

  const handleSubmit = e => {
    console.log('submit', file)

    dispatch(bulkUploadProduct({ csvData: csvData, name: groupName, userType: 'Dealer' }))

    // dispatch(fetchrepairData())
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  const readUploadFileFleet = e => {
    e.preventDefault()
    if (e.target.files) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(e.target.files[0])
      reader.onload = e => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        if ('Kunnr' in json[0] && ('Name' in json[0] || 'Club' in json[0])) {
          console.log('JSON', JSON.stringify(json))
          let arr = []
          for (let j of json) {
            arr.push({ Kunnr: j.Kunnr, Name1: j.Name, club: j.Club, ...j })
          }
          console.log(arr)
          setCsvData(arr)
          setSubmit(false)

          return
        } else {
          alert(`Uploaded CSV file is missing "Kunnr" or "Fleet name" field.`)
          ref.current.value = ''
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5} rowGap={4}>
        <Grid item xs={12} sm={12}>
          {/* <CustomTextField
                  sx={{ mb: 2 }}
                  placeholder='Group Name'
                  label='Enter Group Name'
                  onChange={e => setGroupName(e.target.value)}
                /> */}
          <Button
            fullWidth
            component={Link}
            variant='outlined'
            href='https://jkm-buck.s3.ap-south-1.amazonaws.com/public/fleet_master.xlsx'
          >
            Download Sample File
          </Button>
          <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
            * First Header Name Must Be {'<>Kunnr<>'}
          </Typography>
          <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
            * Second Header Name Must Be {'<>Name<>'}
          </Typography>
          <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
            * Third Header Name Must Be {'<>Club<>'}
          </Typography>
          <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
            * Supported file format are ".csv .xlsx .xls"
          </Typography>

          <>
            <Box sx={{ mb: 0.5 }}>
              <Typography> UPLOAD CSV</Typography>
            </Box>
            <Button
              sx={{ width: '100%', mb: 4 }}
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              {'Upload File'}
              <VisuallyHiddenInput
                type='file'
                onChange={e => {
                  readUploadFileFleet(e)
                }}
                inputProps={{
                  accept:
                    'csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                }}
                id='form-layouts-separator-select'
              />
            </Button>
          </>

          {/* <CustomTextField
            fullWidth
            label='UPLOAD CSV'
            placeholder='uploadcsv'
            type='file'
            inputProps={{
              accept: 'csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
            }}
            ref={ref}
            required
            onChange={e => {
              readUploadFileFleet(e)
            }}
          ></CustomTextField> */}
        </Grid>

        {/* <Button fullWidth onClick={handleSubmit} sx={{ ml: 5, mt: 5 }} disabled={submit} variant='contained'>
          Submit
        </Button> */}
        <Grid container justifyContent='center'>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            SUBMIT
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => handleCancel()}>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default AddModal
