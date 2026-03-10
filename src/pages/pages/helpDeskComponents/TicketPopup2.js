// ** MUI Imports
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import DeletePopUpModel from './DeletePopupModel'

import { useForm, Controller } from 'react-hook-form'
import { Chip, Grid } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { updateAssignUser } from 'src/store/apps/query-category'
import { useState } from 'react'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const EditModal = ({ toggle, data }) => {
  console.log('data', data)
  const { timeConfig } = useSelector(state => state.matrix)

  const defaultValues = {
    name: data?.name,
    subcategory: data?.subcategory.map(sub => sub.name),
    level1User:
      data?.emailList
        .find(item => item.level === 'LEVEL1')
        ?.email?.map(n => n)
        ?.join(', ') || [],
    level2User:
      data?.emailList
        .find(item => item.level === 'LEVEL2')
        ?.email?.map(n => n)
        ?.join(', ') || [],
    level3User:
      data?.emailList
        .find(item => item.level === 'LEVEL3')
        ?.email?.map(n => n)
        ?.join(', ') || []
  }

  const [subcategory, setSubcategory] = useState(data?.subcategory)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const dispatch = useDispatch()

  const handleDelete = i => {
    let newArray = subcategory.filter((_, index) => index !== i)
    setSubcategory(newArray)
  }

  const onSubmit = e => {
    let data1 = {
      id: data?._id,
      category: e?.name,
      level: ['LEVEL1', 'LEVEL2', 'LEVEL3'],
      mailList: [{ LEVEL1: e?.level1User }, { LEVEL2: e?.level2User }, { LEVEL3: e?.level3User }],
      subCategory: e?.subcategory
    }

    dispatch(updateAssignUser(data1))
    toggle()
  }

  return (
    <Box>
      <Header>
        <Typography variant='h5'>Category Details</Typography>
        <IconButton
          size='small'
          onClick={toggle}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <Grid container rowGap={4} columnGap={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Category'
                    disabled
                    onChange={onChange}
                    placeholder=''
                    error={Boolean(errors.name)}
                    aria-describedby='validation-basic-name'
                    {...(errors.name && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='subcategory'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    freeSolo
                    multiple
                    fullWidth
                    id='autocomplete-multiple-filled'
                    value={value}
                    options={[]}
                    onChange={(event, value) => onChange(value)}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        variant='filled'
                        label='Sub-Category'
                        placeholder=''
                        error={Boolean(errors.subcategory)}
                        helperText={
                          errors?.subcategory
                            ? 'This field is required'
                            : 'After Entering Sub-Category press ENTER from the keyboard'
                        }
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip label={option} {...getTagProps({ index })} key={index} />)
                    }
                  />
                )}
              />

              {/* {subcategory?.map((n, i) => {
                return (
                  <Chip
                    key={n?._id}
                    sx={{ margin: 1 }}
                    label={n.name}
                    color='primary'
                    onDelete={e => handleDelete(i)}
                    deleteIcon={<Icon icon='tabler:trash' />}
                  />
                )
              })} */}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle1'>Levels and Roles</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='level1User'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Level 1 User*'
                    onChange={onChange}
                    placeholder=''
                    error={Boolean(errors.level1User)}
                    aria-describedby='validation-basic-email'
                    {...(errors.level1User && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 7 }}>
                Ticket assigned immediately
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='level2User'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Level 2 User*'
                    onChange={onChange}
                    placeholder=''
                    error={Boolean(errors.level2User)}
                    aria-describedby='validation-basic-email'
                    {...(errors.level2User && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 4 }}>
                Escalated after {timeConfig.level2} hours of ticket creation
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='level3User'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Level 3 User*'
                    onChange={onChange}
                    placeholder=''
                    error={Boolean(errors.level3User)}
                    aria-describedby='validation-basic-email'
                    {...(errors.level3User && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 4 }}>
                Escalated after {timeConfig.level3} hours of ticket creation
              </Typography>
            </Grid>
            <Grid container columnGap={4} marginTop={4}>
              {/* <Button variant='outlined' color='error' sx={{ mr: 10 }} onClick={e => setDeleteOpen(true)}>
                Delete
              </Button> */}
              <Button variant='tonal' color='secondary' onClick={toggle}>
                Cancel
              </Button>
              <Button variant='contained' type='submit'>
                Update
              </Button>
            </Grid>
            <Box>
              <Typography variant='subtitle2'>Please Note:</Typography>
              <Typography variant='subtitle2'>
                Ticket will be automatically marked Unresolved after 24 hours If no action has been taken by all
                users/levels
              </Typography>
            </Box>
          </Grid>
        </Box>
      </form>
      <DeletePopUpModel deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} category={data} onClose={toggle} />
    </Box>
  )
}

export default EditModal
