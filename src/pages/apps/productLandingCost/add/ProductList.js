import { forwardRef, useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

import { fetchProductList } from 'src/store/apps/productLandingCost'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, CircularProgress, FormControlLabel, Pagination } from '@mui/material'

const ProductList = ({ onClose, setFormData, formData, checkedItems, setCheckedItems, showDealers }) => {
  // ** States
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [arr, setarr] = useState()

  const data = useSelector(state => state.productLandingCost)
  useEffect(() => {
    setarr(data)
  }, [data?.productList])

  useEffect(() => {
    dispatch(fetchProductList({ page }))
  }, [page])
  useEffect(() => {
    dispatch(fetchProductList({ search }))
  }, [search])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleSubmit = () => {
    setFormData({
      ...formData,
      product: checkedItems
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
    console.log(newCheckedItems)
    setCheckedItems(newCheckedItems)
    console.log(newCheckedItems)
  }

  return (
    <div style={{ width: '800px', height: '390px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ height: '310px' }}>
          <Grid container spacing={2} sx={{ maxHeight: '310px', overflowY: 'scroll' }}>
            <CustomTextField
              sx={{ m: 3 }}
              fullWidth
              placeholder='Product SKU'
              onChange={e => setSearch(e.target.value)}
            />
            {arr?.productList?.map(item => (
              <Grid key={item?._id} item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkedItems.includes(item?._id)}
                      onChange={() => handleCheckboxChange(item?._id)}
                      name={`item_${item?._id}`}
                    />
                  }
                  label={item?.productName}
                />
              </Grid>
            ))}
          </Grid>
        </div>
        <Grid container justifyContent='center'>
          <Pagination count={data.totalPage2} page={page} onChange={handlePageChange} color='primary' />
          <Button
            onClick={handleSubmit}
            sx={{ mt: 3 }}
            variant='contained'
            fullWidth
            disabled={checkedItems.length == 0}
          >
            Submit
          </Button>
        </Grid>
      </form>
    </div>
  )
}

export default ProductList
