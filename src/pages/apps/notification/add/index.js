// ** React Imports
import { forwardRef, useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import Typography from '@mui/material/Typography'

import { fetchDealers, addNotification } from 'src/store/apps/notification'
import Chip from '@mui/material/Chip'
import { Switch } from '@mui/material'
import * as XLSX from 'xlsx'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { debounce } from 'src/utils/helper'
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

const AddModal = ({ onClose }) => {
  // ** States

  const [search, setSearch] = useState('')
  const [groupName, setGroupName] = useState('')
  const [dealers, setDealers] = useState([])
  const [uploadCsv, setUploadCsv] = useState(false)
  const [fileuploaded, setfileuploaded] = useState('')

  const dispatch = useDispatch()

  const data = useSelector(state => state.notification)
  const options = data.dealers
  useEffect(() => {
    dispatch(fetchDealers({ search: search }))
  }, [dispatch, search])

  useEffect(() => {
    console.log('df', dealers)
  }, [dealers])

  const handleGroupName = event => {
    setGroupName(event.target.value)
  }

  const handleDealers = (event, value) => {
    setDealers(value)
  }

  const handleInput = e => {
    debounce(() => setSearch(e.target.value), 2000)
  }

  const handleSubmit = () => {
    if (groupName && dealers.length > 0) {
      if (!uploadCsv) {
        dispatch(
          addNotification({
            groupName: groupName,
            userList: dealers.map(user => {
              return { user: user._id }
            }),
            fromCSV: uploadCsv
          })
        )
      } else {
        dispatch(
          addNotification({
            groupName: groupName,
            userList: dealers,
            fromCSV: uploadCsv
          })
        )
      }
      handleCancel()
    } else {
      toast.error('Please enter all fields', { duration: 2000 })
    }
  }

  const handleCancel = () => {
    onClose()
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

        if (!json[0]?.DealerCode) {
          alert(`Uploaded CSV file is missing "DealerCode" field.`)
        }

        var finalArray = json.map(obj => {
          return obj.DealerCode
        })

        // console.log(finalArray);
        setDealers(finalArray)
      }

      // console.log("reader", reader.readAsArrayBuffer(e.target.files[0]));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            sx={{ mb: 4 }}
            label='Group Name'
            placeholder='Group Name'
            id='form-layouts-separator-select'
            onChange={handleGroupName}
          ></CustomTextField>
          <Typography>Upload CSV</Typography>
          <Switch
            checked={uploadCsv}
            onChange={event => {
              setUploadCsv(event.target.checked)
            }}
          />

          {uploadCsv ? (
            <div>
              <>
                <Box sx={{ mb: 0.5 }}>
                  <Typography> Select File</Typography>
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
                name='asset'
                type='file'
                fullWidth
                label='Select File'
                placeholder='Select a file'
                id='form-layouts-separator-select'
                onChange={readUploadFile}
              ></CustomTextField> */}
              <Typography variant='subtitle2' style={{ fontSize: '12px' }}>
                {`* First Header Name Must Be <>DealerCode<>`}
              </Typography>
              <Typography variant='subtitle2' style={{ fontSize: '12px' }}>
                {`* Second Header Name Can Be <>DealerName<>`}
              </Typography>
            </div>
          ) : (
            <CustomAutocomplete
              freeSolo={false}
              multiple
              id='autocomplete-multiple-filled'
              options={options}
              getOptionLabel={option => `${option?.user?.Kunnr} - ${option?.user?.Name1}`}
              onChange={handleDealers}
              onInputChange={handleInput}
              renderInput={params => (
                <CustomTextField {...params} variant='filled' label='Select Dealers' placeholder='Select Dealers' />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option?.user?.Kunnr} - ${option?.user?.Name1}`}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
            />
          )}
          {/* <CustomAutocomplete
                  freeSolo
                  multiple
                  id='autocomplete-multiple-filled'
                  options={options}
                  getOptionLabel={option => `${option.Kunnr} - ${option.Address}`}
                  onChange={handleDealers}
                  onInputChange={handleInput}
                  renderInput={params => (
                    <CustomTextField {...params} variant='filled' label='Select Dealers' placeholder='Select Dealers' />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={`${option.Kunnr} - ${option.Address}`} {...getTagProps({ index })} key={index} />
                    ))
                  }
                /> */}
          <Button onClick={handleSubmit} sx={{ mt: 5 }} variant='contained' fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default AddModal
