// ** React Imports

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

import { useForm, Controller } from 'react-hook-form'
import moment from 'moment'

// ** Icon Imports
import { Box, Divider, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { updateQueryData } from 'src/store/apps/query'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { fetchCategory } from 'src/store/apps/matrix'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',

  //   border: '2px solid #000',
  //   boxShadow: 24,
  //   p: 4
  borderRadius: '5px'
}

// const schema = yup.object().shape({
//   category: yup.string().required(),
//   subCategory: yup.array().required(),
//   level: yup.array().required(),
//   mailList: yup.array().mailList().required()
// })

const defaultValues = {
  category: '',
  subCategory: [],
  level: [],
  mailList: []
}

const AddModal = ({ onClose }) => {
  // ** States

  const dispatch = useDispatch()
  const data = useSelector(state => state.matrix)
  console.log('data'.data)
  const result = data.category?.filter(ob => ob?.subcategory?.length)

  // ** Hooks
  useEffect(() => {
    dispatch(fetchCategory())
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = e => {
    e.mailList = e.level.map((level, i) => {
      return { [level]: e.mailList[i] }
    })
    console.log('submit', e)
    dispatch(addMatrix(e))
    onClose()
  }

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedlevel, setSelectedlevel] = useState([])

  useEffect(() => console.log(selectedlevel), [selectedlevel])

  const subcategoryOptions =
    result.find(item => {
      return item._id === selectedCategory
    })?.subcategory || []

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={0} justifyContent='center'>
        <Divider sx={{ m: '0 !important' }} />
        <Grid item xs={12} sm={6} container rowGap={2}>
          <Controller
            name='category'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                label='Select Query Category'
                SelectProps={{
                  value: value,
                  onChange: e => {
                    setSelectedCategory(e.target.value)

                    return onChange(e)
                  }
                }}
                id='validation-basic-select'
                error={Boolean(errors.category)}
                aria-describedby='validation-basic-select'
                {...(errors.category && { helperText: 'This field is required' })}

                // defaultValue=''
              >
                {result.map(item => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />

          <Controller
            name='subCategory'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                label='Select Query subCategory'
                SelectProps={{
                  multiple: true,
                  value: value,
                  onChange: e => onChange(e)
                }}
                id='validation-basic-select'
                error={Boolean(errors.subCategory)}
                aria-describedby='validation-basic-select'
                {...(errors.subCategory && { helperText: 'This field is required' })}

                // defaultValue=''
              >
                {subcategoryOptions.map(subCat => (
                  <MenuItem key={subCat._id} value={subCat._id}>
                    {subCat.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
          <Controller
            name='level'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                label='Select User Level'
                SelectProps={{
                  multiple: true,
                  value: value,
                  onChange: e => {
                    setSelectedlevel(e.target.value)

                    return onChange(e)
                  }
                }}
                id='validation-basic-select'
                error={Boolean(errors.level)}
                aria-describedby='validation-basic-select'
                {...(errors.level && { helperText: 'This field is required' })}

                // defaultValue=''
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
            )}
          />
          {selectedlevel.map((user, i) => (
            <Controller
              key={i}
              name={`mailList[${i}]`}
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4})(,\s*[\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4})*$/,
                  message: 'Invalid Email address'
                }
              }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  label={`Enter Emails (${user})`}
                  onChange={onChange}
                  placeholder=''
                  error={Boolean(errors && errors.mailList && errors.mailList[i])}
                  helperText='To enter multiple emails use "," eg: abc@mail.com, qwe@mail.com'
                  aria-describedby='validation-basic-first-name'
                  {...(errors && errors.mailList && errors.mailList[i] && { helperText: errors.mailList[i].message })}
                />
              )}
            />
          ))}
          <Grid item xs={12} sm={6}></Grid>
        </Grid>
        <Grid container justifyContent='center' gap={5} xs={12}>
          <Button type='submit' variant='contained'>
            SUBMIT
          </Button>
          <Button onClick={onClose} variant='tonal' color='secondary'>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default AddModal
