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
import { addMatrix } from 'src/store/apps/matrix'

// ** Custom Component Import

import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import { Checkbox, Divider } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchCategory } from 'src/store/apps/matrix'

// const schema = yup.object().shape({
//   category: yup.string().required(),
//   subCategory: yup.array().required(),
//   level: yup.array().required(),
//   role: yup.array().role().required()
// })

const defaultValues = {
  category: '',
  subCategory: [],
  level: [],
  role: [],
  email: []
}

const levels = [
  { value: 'LEVEL1', label: 'Level 1' },
  { value: 'LEVEL2', label: 'Level 2' },
  { value: 'LEVEL3', label: 'Level 3' }
]
const roles = [
  { value: 'SO', label: 'SO' },
  { value: 'SE', label: 'SE' },
  { value: 'FM', label: 'FM' },
  { value: 'AM', label: 'AM' },
  { value: 'RM', label: 'RM' },
  { value: 'ZM', label: 'ZM' },
  { value: 'email', label: 'Email ID' }
]

const AddModal = ({ setSwitchtab }) => {
  // ** States

  const dispatch = useDispatch()
  const data = useSelector(state => state.matrix)
  console.log('data'.data)
  const result = data.category?.filter(ob => ob?.subcategory?.length)

  // ** Hooks
  useEffect(() => {
    dispatch(fetchCategory({ status: true }))
  }, [])

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = e => {
    // e.mailList = e.level.map((level, i) => {
    //   return { [level]: !e.email[i] ? e.role[i] : e.email[i] }
    // })
    e.role = e.role.map((item, i) => {
      return item.map((item2, i2) => {
        if (item2 === 'email') {
          return e.email[i]
        } else {
          return item2
        }
      })
    })
    e.mailList = e.level.map((level, i) => {
      return { [level]: e.role[i] }
    })

    delete e.email
    delete e.role
    console.log('data', e)
    dispatch(addMatrix(e))
    setSwitchtab('Category and User List')
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
      <Card>
        <Grid container spacing={5} sx={{ p: 4 }}>
          <Divider sx={{ m: '0 !important' }} />
          <Grid item xs={12} sm={6} container rowGap={3}>
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
                  label='Select Query Sub-Categories'
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
                    <MenuItem key={subCat._id} value={subCat.name}>
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
                    renderValue: selected => selected.join(', '),
                    onChange: e => {
                      setSelectedlevel(e.target.value)

                      return onChange(e)
                    }
                  }}
                  id='validation-basic-select'
                  error={Boolean(errors.level)}
                  aria-describedby='validation-basic-select'
                  {...(errors.level && { helperText: 'This field is required' })}
                >
                  {levels.map((level, index) => (
                    <MenuItem key={index} value={level.value}>
                      <Checkbox checked={value.indexOf(level.value) > -1} />
                      {level.label}
                    </MenuItem>
                  ))}
                  {/* <MenuItem key={1} value={'LEVEL1'}>
                    LEVEL 1
                  </MenuItem>
                  <MenuItem key={2} value={'LEVEL2'}>
                    LEVEL 2
                  </MenuItem>
                  <MenuItem key={3} value={'LEVEL3'}>
                    LEVEL 3
                  </MenuItem> */}
                </CustomTextField>
              )}
            />
            {selectedlevel.map((user, i) => (
              <Controller
                key={i}
                name={`role[${i}]`}
                control={control}
                rules={{
                  required: 'This field is required'
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <CustomTextField
                      select
                      fullWidth
                      label={`Select Level ${user} User`}
                      SelectProps={{
                        multiple: true,
                        value: value || [],
                        renderValue: selected => selected.join(', '),
                        onChange: onChange
                      }}
                      id='validation-basic-select'
                      error={Boolean(errors && errors.role && errors.role[i])}
                      helperText={errors && errors.role && errors.role[i] ? errors.role[i].message : ''}
                    >
                      {roles.map((role, index) => (
                        <MenuItem key={index} value={role.value}>
                          <Checkbox checked={value?.indexOf(role.value) > -1} />
                          {role.label}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                    {value && value.includes('email') && (
                      <Controller
                        key={i}
                        name={`email[${i}]`}
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
                            error={Boolean(errors && errors.email && errors.email[i])}
                            helperText='To enter multiple emails use "," eg: abc@mail.com, qwe@mail.com'
                            aria-describedby='validation-basic-first-name'
                            {...(errors && errors.email && errors.email[i] && { helperText: errors.email[i].message })}
                          />
                        )}
                      />
                    )}
                  </>
                )}
              />
            ))}

            <Grid container gap={5} xs={12} sx={{ mt: 4 }}>
              <Button type='submit' variant='contained'>
                SUBMIT
              </Button>
              {/* <Button onClick={onClose} variant='tonal' color='secondary'>
              CANCEL
            </Button> */}
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </form>
  )
}

export default AddModal
