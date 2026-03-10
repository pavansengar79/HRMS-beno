// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

import Box from '@mui/material/Box'
import { fetchCategory, updateMatrix } from 'src/store/apps/matrix'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import { useDispatch, useSelector } from 'react-redux'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

const EditModal = ({ data, onClose }) => {
  // ** States
  const [category, setCategory] = useState(data?.category)
  const [subcategory, setSubcategory] = useState(data?.subCategory)
  const [userLevel, setUserLevel] = useState(data?.matrix?.map(item => item.level))
  const [emails, setEmails] = useState(data?.matrix?.map(item => item?.email?.join(', ')))

  const dispatch = useDispatch()
  const fetchdata = useSelector(state => state.matrix)
  console.log('data', data)
  const result = fetchdata?.category

  useEffect(() => {
    dispatch(fetchCategory())
  }, [])

  const handleSubmit = () => {
    const senddata = {
      category: category._id,
      level: userLevel,

      mailList: userLevel.map((level, i) => ({ [level]: emails[i] })),
      subCategory: subcategory
    }
    dispatch(updateMatrix({ data: senddata, id: data._id }))
    onClose()
  }

  const handleCategory = e => {
    const categoryId = e.target.value
    const selectedCategory = result.find(category => category._id === categoryId)
    setCategory(selectedCategory)

    // setSubcategory(selectedCategory.subcategory)

    // setCategory(e.target.value)
  }

  const handleSubcategory = e => {
    setSubcategory(e.target.value)
  }

  const handleUserLevel = e => {
    setUserLevel(e.target.value)
  }

  const handleEmail = (i, e) => {
    const newEmails = [...emails]
    newEmails[i] = e.target.value

    setEmails(newEmails)

    // const newValues = [...emails]
    // newValues[i] = [...newValues[i], e.target.value]
    // const newValues[i] = email
    // newValues[i] = [newValues[i], e.target.value]
    // console.log('new', newValues)

    // setEmails(newValues)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            sx={{ mb: 4 }}
            select
            fullWidth
            label='Select Query Category'
            id='form-layouts-separator-select'
            onChange={handleCategory}
            value={category._id}
          >
            {result?.map(item => (
              <MenuItem key={item?._id} value={item?._id}>
                {item?.name}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            sx={{ mb: 4 }}
            select
            fullWidth
            label='Select Query Subcategories'
            id='form-layouts-separator-select'
            SelectProps={{
              MenuProps,
              multiple: true,
              value: subcategory?.map(item => item),
              onChange: e => handleSubcategory(e)
            }}
          >
            {category?.subcategory?.map(item => (
              <MenuItem key={item?._id} value={item?.name}>
                {item?.name}
              </MenuItem>
            ))}
          </CustomTextField>
          <CustomTextField
            sx={{ mb: 4 }}
            select
            SelectProps={{
              MenuProps,
              multiple: true,
              value: userLevel,
              onChange: e => handleUserLevel(e)
            }}
            fullWidth
            label=' Select User Level'
            id='form-layouts-separator-select'
          >
            <MenuItem key={1} value={'LEVEL1'}>
              LEVEL 1
            </MenuItem>
            <MenuItem key={2} value={'LEVEL2'}>
              LEVEL 2
            </MenuItem>
            <MenuItem key={3} value={'LEVEL3'}>
              LEVEL 3
            </MenuItem>
          </CustomTextField>
          {userLevel?.map((user, i) => (
            <Box key={i} sx={{ mb: 4 }}>
              <CustomTextField
                fullWidth
                label={`Enter Email ${user}`}
                placeholder='Emails'
                id='form-layouts-separator-select'
                onChange={e => handleEmail(i, e)}
                value={emails[i]}
                helperText='To enter multiple emails use "," eg: abc@mail.com, qwe@mail.com'
              />
            </Box>
          ))}
        </Grid>
      </Grid>
      <Grid container justifyContent='center' columnGap={4}>
        <Button onClick={handleSubmit} variant='contained'>
          SUBMIT
        </Button>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default EditModal
