import { forwardRef, useState, useEffect } from 'react'

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
import { fetchProductCategory } from 'src/store/apps/productLandingCost'
import Chip from '@mui/material/Chip'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { top100Films } from 'src/@fake-db/autocomplete'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, CircularProgress, FormControlLabel, FormGroup } from '@mui/material'
import CustomCheckbox from 'src/@core/components/custom-checkbox/basic'

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

const ProductCategory = ({ onClose, setFormData, formData, checkedItems, setCheckedItems, showDealers }) => {
  // ** States
  const dispatch = useDispatch()

  const data = useSelector(state => state.productLandingCost)
  useEffect(() => {
    dispatch(fetchProductCategory())
  }, [])

  const handleSubmit = () => {
    setFormData({
      ...formData,
      category: checkedItems
    })
    handleCancel()
    showDealers(true)
  }

  const handleCancel = () => {
    onClose()
  }

  const handleCheckboxChange = id => {
    const currentIndex = checkedItems.indexOf(id)
    const newCheckedItems = [...checkedItems]

    if (currentIndex === -1) {
      newCheckedItems.push(id)
    } else {
      newCheckedItems.splice(currentIndex, 1)
    }

    setCheckedItems(newCheckedItems)
  }

  return (
    <>
      {data?.productCategoryLoading === 'LOADING' ? (
        <CircularProgress sx={{ position: 'relative', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {data?.productCategory?.map(item => (
              <Grid key={item?._id} item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkedItems.includes(item?._id)}
                      onChange={() => handleCheckboxChange(item?._id)}
                      name={`item_${item?._id}`}
                    />
                  }
                  label={item?.Ydesc}
                />
              </Grid>
            ))}
            <Button
              onClick={handleSubmit}
              disabled={checkedItems.length == 0}
              sx={{ mr: 2, mt: 5 }}
              variant='contained'
              fullWidth
            >
              Submit
            </Button>
          </Grid>
        </form>
      )}
    </>
  )
}

export default ProductCategory
