import { useState, useEffect, useRef } from 'react'
import exportExcel from 'src/utils/genarateExcel'
import { fetchData } from 'src/store/apps/productsPage/products'
import { bulkUploadProduct } from 'src/store/apps/product-visibility'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/@core/components/mui/text-field'
import * as XLSX from 'xlsx'
import { useDispatch, useSelector } from 'react-redux'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { Box } from '@mui/system'
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

const AddModal = ({ onClose, page }) => {
  const [submit, setSubmit] = useState(true)
  const ref = useRef()
  const dispatch = useDispatch()
  const [csvData, setCsvData] = useState()
  const [fileuploaded, setfileuploaded] = useState('')

  useEffect(() => {
    dispatch(fetchData({ limit: '2000' }))
  }, [])

  const handleSubmit = e => {
    dispatch(bulkUploadProduct({ data: csvData }))
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  const data = useSelector(state => state.Products)

  const handleExcel = async () => {
    const fileName = 'MaterialNo-Restricted'

    const response = await axiosRequest({
      url: `/api/admindash/product/getBlockedProduct?page=${page?.page + 1}&limit=2000`,
      method: 'GET'
    })
    console.log('res', response)
    exportExcel(
      response?.data?.map(x => {
        let str = x?.restrictedDealers.length > 0 ? x?.restrictedDealers.join(', ') : ''
        return {
          MaterialNo: x?.materialNo,
          DealerCode: str
        }
      }),
      fileName
    )
  }

  const readUploadFile = e => {
    console.log('INSIDIE')
    e.preventDefault()
    if (e.target.files) {
      e.target.files[0].name.length > 16
        ? setfileuploaded(e.target.files[0].name.slice(0, 16) + '...')
        : setfileuploaded(e.target.files[0].name)
      console.log('INSIDE IFS')
      const reader = new FileReader()
      reader.readAsArrayBuffer(e.target.files[0])
      reader.onload = e => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        if ('MaterialNo' in json[0] && 'DealerCode' in json[0]) {
          let arr = []
          for (let j of json) {
            let obj = {}
            let str = j.DealerCode.toString().split(' ').join('')
            obj['materialNo'] = j.MaterialNo
            obj['dealerCode'] = str.split(',')
            arr.push(obj)
          }
          setCsvData(arr)
          setSubmit(false)

          return
        } else {
          alert(`Uploaded CSV file is missing "DealerCode" or "MaterialNo" field.`)
          ref.current.value = ''
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={7}>
          <Typography variant='subtitle2' sx={{ display: 'block', mb: 3 }}>
            * First Header Name Must Be {'<>MaterialNo<>'}
          </Typography>
          <Typography variant='subtitle2' sx={{ display: 'block', mb: 3 }}>
            * Second Header Name Must Be {'<>DealerCode<>'}
          </Typography>
          <Typography variant='subtitle2' sx={{ display: 'block', mb: 3 }}>
            * Supported file format are ".csv .xlsx .xls"
          </Typography>
          <>
            <Box sx={{ mb: 0.5 }}>
              <Typography> UPLOAD CSV</Typography>
            </Box>
            <Button
              sx={{ width: '100%' }}
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              {fileuploaded == '' ? 'Upload File' : fileuploaded}
              <VisuallyHiddenInput
                type='file'
                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet , application/vnd.ms-excel'
                onChange={readUploadFile}
                id='form-layouts-separator-select'
              />
            </Button>
          </>
          {/* <CustomTextField
            label='UPLOAD CSV'
            placeholder='uploadcsv'
            type='file'
            inputProps={{
              accept: 'csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
            }}
            ref={ref}
            required
            onChange={e => {
              readUploadFile(e)
            }}
          ></CustomTextField> */}
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button onClick={handleExcel} sx={{ ml: 15, mt: 20 }} variant='outlined'>
            Download Sample File
          </Button>
        </Grid>
        <Button fullWidth onClick={handleSubmit} sx={{ ml: 5, mt: 5 }} disabled={submit} variant='contained'>
          Submit
        </Button>
      </Grid>
    </form>
  )
}

export default AddModal
