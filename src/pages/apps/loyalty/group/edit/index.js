// ** React Imports
import { forwardRef, useEffect, useState } from 'react'

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
import Chip from '@mui/material/Chip'
import { updateProduct } from 'src/store/apps/product-visibility'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch } from 'react-redux'
import { fetchDealerData } from 'src/store/apps/dealer'

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
  const [value, setValue] = useState(data.restrictedDealers)
  const [inputValue, setInputValue] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchDealerData({ search: inputValue }))
  }, [dispatch, inputValue])

  const handleSubmit = () => {
    dispatch(updateProduct({ data: { materialNo: data.materialNo, dealerCode: value } }))

    // dispatch(fetchrepairData())
    handleCancel()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <Typography variant='body1' sx={{ fontWeight: 900, mb: 3 }}>
            Material No : {data.materialNo}
          </Typography>
          <Typography variant='body1' sx={{ fontWeight: 900, mb: 3 }}>
            Material Desc : {data.MatDesc}
          </Typography>
          <CustomAutocomplete
            freeSolo
            multiple
            sx={{ width: 325 }}
            id='autocomplete-multiple-filled'
            value={value}
            options={[]}
            onChange={(event, newValue) => {
              setValue(newValue)
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue)
            }}
            renderInput={params => (
              <CustomTextField {...params} variant='filled' label='Enter Dealer Id' placeholder='Dealer Id' />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option} {...getTagProps({ index })} key={index} />)
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button onClick={handleSubmit} sx={{ mr: 2, mt: 4 }} variant='contained'>
            Submit
          </Button>
          <Button onClick={handleCancel} sx={{ mr: 2, mt: 4 }} variant='outlined'>
            cancel
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal
