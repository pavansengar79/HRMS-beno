import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import CustomTextField from 'src/@core/components/mui/text-field'
import ProductCategory from './ProductCategory'
import ProductList from './ProductList'
import DealerList from './DealerList'
import { addProductCategory } from 'src/store/apps/productLandingCost'
import toast from 'react-hot-toast'
import { Checkbox, FormGroup, Modal } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { Box } from '@mui/material'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

const FormLayoutsSeparator = () => {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    percentage: '',
    discountType: '',
    applicable: 'NDP',
    // productType: [],
    visibility: '',
    productType: '',
    // visibility: '',
    category: [],
    product: [],
    applicableTo: []
  })
  const [showCategory, setShowCategory] = useState(false)
  const [showDealers, setShowDealers] = useState(false)
  const [showProduct, setShowProduct] = useState(false)
  const [category, setCategory] = useState([])
  const [error, setError] = useState()
  // var checkedItems = []
  const [checkedItems, setcheckedItems] = useState([])
  const dispatch = useDispatch()

  const handleChange = event => {
    const { name, value } = event.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData)
  }, [formData.visibility])

  const handleCheckboxChange = id => {
    setcheckedItems(prevCheckedItems => {
      const newCheckedItems = prevCheckedItems.includes(id)
        ? prevCheckedItems.filter(value => value !== id)
        : [...prevCheckedItems, id]

      // Update formData based on the newCheckedItems array
      if (newCheckedItems.length === 0) {
        setFormData(prevFormData => ({
          ...prevFormData,
          visibility: ''
        }))
        console.log('no visibility selected')
      } else if (newCheckedItems.length === 1) {
        setFormData(prevFormData => ({
          ...prevFormData,
          visibility: newCheckedItems[0]
        }))
        console.log('visibility length one')
      } else if (newCheckedItems.length === 2) {
        setFormData(prevFormData => ({
          ...prevFormData,
          visibility: 'ALL'
        }))
        console.log('length 2')
      }

      return newCheckedItems
    })
    // if (checkedItems.includes(id)) {
    //   console.log('alreday their')
    //   const newarr = checkedItems.filter(value => value !== id)
    //   setcheckedItems(newarr)
    // } else {
    //   setcheckedItems([...checkedItems, id])
    // }

    // if (checkedItems.length === 1) {
    //   formData.visibility = checkedItems[0]
    //   console.log('visibility length one ')
    // } else {
    //   if (checkedItems.length === 2) {
    //     console.log('length 2')
    //     formData.visibility = 'All'
    //   }
    // }
  }

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const handleKeyPress = e => {
    const allowedCharacters = /^[0-9]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (formData.name && formData.description && formData.percentage && formData.discountType && formData.productType) {
      if (error) return
      if (formData.visibility === '') {
        toast.error('Please enter all fields', { duration: 2000 })
        return
      }
      dispatch(addProductCategory(formData))
      router.push('/apps/productLandingCost')
    } else {
      toast.error('Please enter all fields', { duration: 2000 })
    }
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '5px'
  }

  return (
    <Card>
      <CardHeader title='Create Discount' />
      <Divider sx={{ m: '0 !important' }} />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Grid container spacing={8}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                name='name'
                fullWidth
                label='1. Discount name'
                placeholder='Please input discount name'
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl row>
                <FormLabel>5. Discount Applicable on</FormLabel>
                <FormGroup row defaultValue='' aria-label='Discount' onChange={handleChange}>
                  <FormControlLabel value='TUBE' name='productType' control={<Checkbox />} label='Tube' />
                  <FormControlLabel value='FLAP' name='productType' control={<Checkbox />} label='Flap' />
                  <FormControlLabel value='BUNDLE' name='productType' control={<Checkbox />} label='Bundle' />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                name='description'
                fullWidth
                label='2. Description'
                placeholder='Write a description about the product'
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl row>
                <FormLabel>6. Discount Visibility</FormLabel>
                <FormGroup row defaultValue='' aria-label='Discount'>
                  <FormControlLabel
                    name='visibility'
                    value='JKC'
                    control={
                      <Checkbox
                        checked={checkedItems.includes('JKC')}
                        onChange={() => handleCheckboxChange('JKC')}
                        name={`JKC`}
                      />
                    }
                    label='JKC'
                  />
                  <FormControlLabel
                    name='visibility'
                    value='MSFA'
                    control={
                      <Checkbox
                        checked={checkedItems.includes('MSFA')}
                        onChange={() => handleCheckboxChange('MSFA')}
                        name={`MSFA`}
                      />
                    }
                    label='MSFA'
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                onKeyPress={handleKeyPress}
                label='3. Percentage'
                placeholder='Please input percentage'
                name='percentage'
                onChange={e => {
                  e.target.value > 100 ? setError(true) : setError(false)
                  handleChange(e)
                }}
                error={error}
                helperText={error && 'Percentage should not be more than 100'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='7. Discount Type'
                id='form-layouts-collapsible-select'
                defaultValue=''
                name='discountType'
                onChange={handleChange}
              >
                <MenuItem value='CATEGORY' onClick={() => setShowCategory(true)}>
                  Product Category
                </MenuItem>
                <MenuItem value='SKU' onClick={() => setShowProduct(true)}>
                  Product SKU
                </MenuItem>
                <MenuItem value='DEALER' onClick={() => setShowDealers(true)}>
                  Dealers List
                </MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl>
                <FormLabel>4. Applicable</FormLabel>
                <RadioGroup row defaultValue='NDP' aria-label='applicable' name='applicable' onChange={handleChange}>
                  <FormControlLabel value='NDP' control={<Radio />} label='NDP' />
                  <FormControlLabel value='INVOICE' control={<Radio />} label='Invoice' />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid sx={{ mt: 3 }} container justifyContent='center'>
            <Button type='submit' sx={{ mr: 2 }} variant='contained'>
              Submit
            </Button>
            <Button variant='outlined' onClick={() => router.back()}>
              Back
            </Button>
          </Grid>
        </CardContent>
      </form>
      <CustomDialog show={showCategory} setShow={setShowCategory} title='Product Category'>
        <ProductCategory
          onClose={() => setShowCategory(false)}
          setFormData={setFormData}
          formData={formData}
          checkedItems={category}
          setCheckedItems={setCategory}
          showDealers={setShowDealers}
        />
      </CustomDialog>
      <CustomDialog show={showProduct} setShow={setShowProduct} title='Product List' size='md'>
        <ProductList
          onClose={() => setShowProduct(false)}
          setFormData={setFormData}
          formData={formData}
          checkedItems={category}
          setCheckedItems={setCategory}
          showDealers={setShowDealers}
        />
      </CustomDialog>
      <Modal
        open={showDealers}
        onClose={() => setShowDealers(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <DealerList
            onClose={() => setShowDealers(false)}
            setFormData={setFormData}
            formData={formData}
            checkedItems={category}
            setCheckedItems={setCategory}
          />
        </Box>
      </Modal>
    </Card>
  )
}

export default FormLayoutsSeparator
