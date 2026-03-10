// ** React Imports
import { useState } from 'react'

// ** MUI Imports

import Button from '@mui/material/Button'

import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { styled, useTheme } from '@mui/material/styles'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Configs

// ** Custom Component Imports
import Repeater from 'src/@core/components/repeater'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { uploadFile } from 'src/store/apps/query-category'

const RepeatingContent = styled(Grid)(({ theme }) => ({
  paddingRight: 0,
  display: 'flex',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,

  //   border: `1px solid ${theme.palette.divider}`,
  '& .col-title': {
    top: '-2.375rem',
    position: 'absolute'
  },
  [theme.breakpoints.down('md')]: {
    '& .col-title': {
      top: '0',
      position: 'relative'
    }
  }
}))

const RepeaterWrapper = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(0, 0, 0),
  '& .repeater-wrapper + .repeater-wrapper': {
    marginTop: theme.spacing(0)
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(0)
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6)
  }
}))

const InvoiceAction = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  padding: theme.spacing(2, 1)
}))

const AddCard = ({ handleClose }) => {
  // ** States
  const [count, setCount] = useState(1)

  // ** Hook
  const dispatch = useDispatch()

  // ** Deletes form
  const deleteForm = e => {
    e.preventDefault()

    // @ts-ignore
    e.target.closest('.repeater-wrapper').remove()
  }

  // ** Handle Invoice To Change

  const schema = yup.object().shape({
    category: yup.string().required(),
    subCategory: yup.array().required()
  })

  const defaultValues = {
    category: '',
    subCategory: []
  }

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
    console.log(data)
    const category = data.category
    const subCategory = []
    data.subCategory.map(sub => subCategory.push({ name: sub }))
    const send = { category, subCategory }

    dispatch(uploadFile(send))
    handleClose()
  }

  return (
    <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
      <Grid container columnSpacing={4}>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Controller
              name='category'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CustomTextField
                  fullWidth
                  label='Category'
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  placeholder='Enter Category'
                  error={Boolean(errors.category)}
                  {...(errors.category && { helperText: errors.category.message })}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
          <RepeaterWrapper>
            <Repeater count={count}>
              {i => {
                const Tag = i === 1 ? Box : Collapse

                return (
                  <Tag key={i} className='repeater-wrapper' {...(i !== 0 ? { in: true } : {})}>
                    <Grid container>
                      <RepeatingContent item xs={12}>
                        <Controller
                          name={`subCategory[${i - 1}]`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { value, onChange, onBlur } }) => (
                            <CustomTextField
                              fullWidth
                              label={`Sub-Category ${i}`}
                              value={value}
                              onBlur={onBlur}
                              onChange={onChange}
                              placeholder='Enter SubCategory'
                              error={Boolean(errors.subCategory)}
                              {...(errors.subCategory && { helperText: errors.subCategory.message })}
                            />
                          )}
                        />
                        <InvoiceAction>
                          <IconButton size='small' onClick={deleteForm}>
                            <Icon icon='tabler:x' fontSize='1.25rem' />
                          </IconButton>
                        </InvoiceAction>
                      </RepeatingContent>
                    </Grid>
                  </Tag>
                )
              }}
            </Repeater>
            <Grid container sx={{ mt: 5 }}>
              <Grid item xs={12} sx={{ px: 0 }}>
                <Button variant='contained' onClick={() => setCount(count + 1)}>
                  Add Sub-Category
                </Button>
              </Grid>
            </Grid>
          </RepeaterWrapper>
        </Grid>
      </Grid>
      <Grid container justifyContent='center' columnGap={4}>
        <Button type='submit' variant='contained'>
          SUBMIT
        </Button>
        <Button variant='tonal' color='secondary' onClick={handleClose}>
          CANCEL
        </Button>
      </Grid>
    </form>
  )
}

export default AddCard
