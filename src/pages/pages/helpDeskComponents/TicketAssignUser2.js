// ** React Imports

// ** MUI Imports
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// ** Icon Imports

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useDispatch, useSelector } from 'react-redux'
import { createAssignUser } from 'src/store/apps/query-category'

// ** Configs

// ** Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import { Card, Checkbox, Typography, MenuItem } from '@mui/material'
// import MuiMenuItem from '@mui/material/MenuItem'
// import { styled } from '@mui/material/styles'
// import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

import { useState } from 'react'

const schema = yup.object().shape({
  category: yup.string().required(),
  subCategory: yup.string().required(),
  level1User: yup.array().of(yup.string()).required().typeError('Level 1 is a required field'),
  level2User: yup.array().of(yup.string()).required().typeError('Level 2 is a required field'),
  level3User: yup.array().of(yup.string()).required().typeError('Level 3 is a required field')
})

const defaultValues = {
  category: '',
  subCategory: '',
  level1User: '',
  level2User: '',
  level3User: ''
}

const roles = [
  { value: 'SO', label: 'SO' },
  { value: 'SE', label: 'SE' },
  { value: 'FM', label: 'FM' },
  { value: 'AM', label: 'AM' },
  { value: 'RM', label: 'RM' },
  { value: 'ZM', label: 'ZM' },
  { value: 'email', label: 'Email ID' }
]

// const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
//   margin: 0,
//   borderRadius: 0,
//   '&:not(.Mui-focusVisible):hover': {
//     backgroundColor: theme.palette.action.hover
//   },
//   '&.Mui-selected': {
//     backgroundColor: hexToRGBA(theme.palette.primary.main, 0.08)
//   },
//   '&.Mui-focusVisible': {
//     backgroundColor: theme.palette.primary.main,
//     '& .MuiListItemIcon-root, & .MuiTypography-root': {
//       color: theme.palette.common.white
//     }
//   }
// }))

const TicketAssignUser = ({ setSwitchtab }) => {
  // ** Props

  // ** States
  const [emaillevel1, setEmailLevel1] = useState()
  const [emaillevel2, setEmailLevel2] = useState()
  const [emaillevel3, setEmailLevel3] = useState()
  const queryCategory = useSelector(state => state.queryCategory)
  const { timeConfig } = useSelector(state => state.matrix)

  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = data => {
    let data1 = {
      category: data?.category,
      subCategory: data?.subCategory.split(','),
      mailList: [
        { LEVEL1: data?.level1User.map(level1 => (level1 != 'email' ? level1 : emaillevel1)) },
        { LEVEL2: data?.level2User.map(level2 => (level2 != 'email' ? level2 : emaillevel2)) },
        { LEVEL3: data?.level3User.map(level3 => (level3 != 'email' ? level3 : emaillevel3)) }
      ]
    }

    console.log('data', data)

    console.log('email1', emaillevel1)
    console.log('email2', emaillevel2)
    console.log('email3', emaillevel3)

    console.log('data1', data1)
    // dispatch(createAssignUser(data1))
  }
  if (queryCategory?.assignUserLoadingStatus === 'LOADED') {
    setSwitchtab('Category and User List')
  }

  return (
    <Card>
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <Grid container columnSpacing={5} columnGap={5} rowGap={5} padding={6}>
          <Grid item xs={12} sm={6}>
            <Typography variant='subtitle1' sx={{ mb: 4 }}>
              1 Add a ticket category
            </Typography>
            <Controller
              name='category'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  label='Add a Category*'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Ex: Orders, Payments .. etc'
                  error={Boolean(errors.category)}
                  {...(errors.category && { helperText: errors.category.message })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name='subCategory'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  label='Add a Sub-Category*'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Ex: Orders, Payments .. etc'
                  error={Boolean(errors.subCategory)}
                  helperText={
                    errors.subCategory
                      ? errors.subCategory.message
                      : 'To add more than one sub-category, you can separate them with a comma'
                  }
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant='subtitle1'>2 Add Levels and Roles</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name='level1User'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <>
                  <CustomTextField
                    select
                    fullWidth
                    label='Add Level 1 User*'
                    SelectProps={{
                      multiple: true,
                      value: value || [],
                      renderValue: selected => selected.join(', '),
                      onChange: onChange
                    }}
                    id='validation-basic-select'
                    error={Boolean(errors.level1User)}
                    {...(errors.level1User && { helperText: errors.level1User.message })}
                    sx={{ mt: '1px', '& .MuiMenu-paper': { backgroundColor: 'black' } }}
                  >
                    {roles.map((role, index) => (
                      <MenuItem key={index} value={role.value}>
                        <Checkbox checked={value?.indexOf(role.value) > -1} />
                        {role.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                  {value && value.includes('email') && (
                    <CustomTextField
                      fullWidth
                      sx={{ mt: 4 }}
                      value={emaillevel1}
                      label={`Enter Emails Level 1`}
                      onChange={e => setEmailLevel1(e.target.value)}
                      placeholder='abc@email.com'
                      helperText='To enter multiple emails use "," eg: abc@mail.com, qwe@mail.com'
                    />
                  )}
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 7 }}>
              Ticket assigned immediately
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* <Controller
              name='level2User'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  label='Add Level 2 User*'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Ex: SO100001 or parveen.verma@jkmail.com'
                  error={Boolean(errors.level2User)}
                  {...(errors.level2User && { helperText: errors.level2User.message })}
                />
              )}
            /> */}
            <Controller
              name='level2User'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <>
                  <CustomTextField
                    select
                    fullWidth
                    label='Add Level 2 User*'
                    SelectProps={{
                      multiple: true,
                      value: value || [],
                      renderValue: selected => selected.join(', '),
                      onChange: onChange
                    }}
                    id='validation-basic-select'
                    error={Boolean(errors.level2User)}
                    {...(errors.level2User && { helperText: errors.level2User.message })}
                  >
                    {roles.map((role, index) => (
                      <MenuItem key={index} value={role.value}>
                        <Checkbox checked={value?.indexOf(role.value) > -1} />
                        {role.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                  {value && value.includes('email') && (
                    <CustomTextField
                      fullWidth
                      sx={{ mt: 4 }}
                      value={emaillevel2}
                      label={`Enter Emails Level 2`}
                      onChange={e => setEmailLevel2(e.target.value)}
                      placeholder='abc@email.com'
                      helperText='To enter multiple emails use "," eg: abc@mail.com, qwe@mail.com'
                    />
                  )}
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 7 }}>
              Escalated after {timeConfig.level2} hours of ticket creation
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* <Controller
              name='level3User'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  label='Add Level 3 User*'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Ex: SO100001 or parveen.verma@jkmail.com'
                  error={Boolean(errors.level3User)}
                  {...(errors.level3User && { helperText: errors.level3User.message })}
                />
              )}
            /> */}
            <Controller
              name='level3User'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <>
                  <CustomTextField
                    select
                    fullWidth
                    label='Add Level 3 User*'
                    SelectProps={{
                      multiple: true,
                      value: value || [],
                      renderValue: selected => selected.join(', '),
                      onChange: onChange
                    }}
                    id='validation-basic-select'
                    error={Boolean(errors.level3User)}
                    {...(errors.level3User && { helperText: errors.level3User.message })}
                  >
                    {roles.map((role, index) => (
                      <MenuItem key={index} value={role.value}>
                        <Checkbox checked={value?.indexOf(role.value) > -1} />
                        {role.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                  {value && value.includes('email') && (
                    <CustomTextField
                      fullWidth
                      sx={{ mt: 4 }}
                      value={emaillevel1}
                      label={`Enter Emails Level 3`}
                      onChange={e => setEmailLevel3(e.target.value)}
                      placeholder='abc@email.com'
                      helperText='To enter multiple emails use "," eg: abc@mail.com, qwe@mail.com'
                    />
                  )}
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 7 }}>
              Escalated after {timeConfig.level3} hours of ticket creation
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
              Please Note: Ticket will be automatically marked Unresolved after 24 hours If no action is taken by all
              users/levels
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button variant='tonal' color='secondary' onClick={e => setSwitchtab('Category and User List')}>
              Cancel
            </Button>
            <Button type='submit' variant='contained' sx={{ ml: 4, px: 8 }}>
              Save
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default TicketAssignUser
