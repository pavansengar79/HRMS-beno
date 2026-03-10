// ** React Imports
import { forwardRef, useState, useEffect, useRef } from 'react'
import { bulkUploadPoint } from 'src/store/apps/point'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import Link from 'next/link'
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

import { useDispatch } from 'react-redux'
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

const AddModal = ({ handleClose }) => {
  // ** States

  const [submit, setSubmit] = useState(true)
  const [file, setFile] = useState()
  const ref = useRef()
  const dispatch = useDispatch()
  const [csvData, setCsvData] = useState()

  // useEffect(() => {
  //   dispatch(fetchData({ limit: '2000' }))
  // }, [])

  const handleSubmit = e => {
    e.preventDefault()
    setSubmit(true)
    const formData = new FormData()
    formData.append('csvFile', csvData)
    dispatch(bulkUploadPoint(formData))

    // dispatch(fetchrepairData())
    // handleClose()
  }

  // const data = useSelector(state => state.productsPage)

  // const handleExcel = () => {
  //   const fileName = 'MaterialNo-Restricted'
  //   exportExcel(
  //     data.data.map(x => {
  //       let str = x?.restrictedDealers.length > 0 ? x?.restrictedDealers.join(', ') : ''

  //       return {
  //         MaterialNo: x?.materialNo,
  //         DealerCode: str
  //       }
  //     }),
  //     fileName
  //   )
  // }

  // const readUploadFile = e => {
  //   e.preventDefault()
  //   if (e.target.files) {
  //     const reader = new FileReader()
  //     reader.readAsArrayBuffer(e.target.files[0])
  //     reader.onload = e => {
  //       const data = e.target.result
  //       const workbook = XLSX.read(data, { type: 'array' })
  //       const sheetName = workbook.SheetNames[0]
  //       const worksheet = workbook.Sheets[sheetName]
  //       const json = XLSX.utils.sheet_to_json(worksheet)
  //       if ('Kunnr' in json[0] && 'Points' in json[0]) {
  //         let arr = []
  //         for (let j of json) {
  //           let obj = {}
  //           obj['Kunnr'] = j.Kunnr
  //           obj['Points'] = j.Points
  //           obj['rowNo'] = j.__rowNum__
  //           arr.push(obj)
  //         }
  //         console.log(JSON.stringify(arr))
  //         setCsvData(arr)

  //         return
  //       } else {
  //         alert(`Uploaded CSV file is missing "Kunnr" or "Points" field.`)
  //         ref.current.value = ''
  //       }
  //     }
  //   }
  // }

  const onFileUpload = async () => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('csvFile', csvfile)
    await axios
      .post(`${backendUrl}/loyalty/uploadLoyaltyPoints`, formData, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        console.log(res)
        if (res.status === 203) {
          setErrors(res.data.error)
          setErrorsModal(true)
          setUploadModal(false)
        } else {
          setFile(false)
          setCsvData([])
          setLoading(false)
          toastMessage(res.data.message, 'success')
          setUploadModal(false)
        }
      })
      .catch(err => {
        // if (
        //   err &&
        //   err.response &&
        //   err.response.data &&
        //   err.response.data.error
        // ) {
        //   alert(err.response.data.error);
        // }
        // if (
        //   err &&
        //   err.response &&
        //   err.response.data &&
        //   err.response.data.validated
        // ) {
        //   setErrors(err.response.data.errors);
        // }
        // setLoading(false);
        console.log('errrr', err)
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={12}>
            <Button
              sx={{ ml: 30 }}
              componet={Link}
              href={'https://jkconnect.s3.ap-south-1.amazonaws.com/public/1693479091973-0.29141943193807274.xlsx'}
              variant='contained'
            >
              DOWNLOAD SAMPLE FILE
            </Button>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
              * First Header Name Must Be {'<>Kunnr<>'}
            </Typography>
            <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
              * Second Header Name Must Be {'<>Points<>'}
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
                    setSubmit(false)
                    setCsvData(e.target.files[0])
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
              label='UPLOAD CSV'
              placeholder='uploadcsv'
              type='file'
              inputProps={{
                accept:
                  'csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
              }}
              ref={ref}
              required
              onChange={e => {
                setSubmit(false)
                setCsvData(e.target.files[0])
              }}
            ></CustomTextField> */}
          </Grid>

          {/* <Button fullWidth onClick={handleSubmit} sx={{ ml: 5, mt: 5 }} disabled={submit} variant='contained'>
            Submit
          </Button> */}
        </Grid>
      </CardContent>
      <Grid container justifyContent='center'>
        <Button type='submit' variant='contained' sx={{ mr: 4 }}>
          SUBMIT
        </Button>
        <Button variant='tonal' color='secondary' onClick={() => handleClose()}>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default AddModal
