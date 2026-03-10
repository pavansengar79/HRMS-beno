// ** React Imports
import { useState, useRef } from 'react'

import { bulkUploadProduct } from 'src/store/apps/dealerGroup'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

import Typography from '@mui/material/Typography'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as XLSX from 'xlsx'

// ** Icon Imports

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

const AddModal = ({ onClose }) => {
  // ** States
  const [groupName, setGroupName] = useState()
  const [submit, setSubmit] = useState(true)
  const [file, setFile] = useState()
  const ref = useRef()
  const dispatch = useDispatch()
  const [csvData, setCsvData] = useState()

  const handleSubmit = e => {
    e.preventDefault()
    console.log('submit', file)

    dispatch(bulkUploadProduct({ csvData: csvData, name: groupName, userType: 'Dealer' }))

    // dispatch(fetchrepairData())
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  const readUploadFile = e => {
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
            arr.push({ Kunnr: j.Kunnr, Name: j.Name })
          }
          console.log(arr)
          setCsvData(arr)
          setSubmit(false)

          return
        } else {
          alert(`Uploaded CSV file is missing "Kunnr" or "Dealer name" field.`)
          ref.current.value = ''
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5} rowGap={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 2 }}
            placeholder='Group Name'
            label='Enter Group Name'
            onChange={e => setGroupName(e.target.value)}
          />
          <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
            * First Header Name Must Be {'<>Kunnr<>'}
          </Typography>
          <Typography variant='overline' sx={{ display: 'block', mb: 3 }}>
            * Second Header Name Must Be {'<>Name<>'}
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
                  readUploadFile(e)
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
              accept: 'csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
            }}
            ref={ref}
            required
            onChange={e => {
              readUploadFile(e)
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
