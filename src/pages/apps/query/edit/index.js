// ** React Imports

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports

import { useForm, Controller } from 'react-hook-form'
import moment from 'moment'

// ** Icon Imports
import { Box, Divider, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { updateQueryData } from 'src/store/apps/query'

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

const EditModal = ({ data, onClose }) => {
  console.log('data', data)

  const defaultValues = {
    queryStatus: data?.status,
    remark: data?.remark
  }

  // ** States

  const dispatch = useDispatch()

  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = e => {
    dispatch(updateQueryData({ status: e.queryStatus, remark: e.remark, queryId: data?._id }))
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5} rowGap={7}>
        <Grid item xs={12}>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            Name : {data?.user?.Name1}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            Kunnr : {data?.user?.Kunnr}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            City : {data?.user?.City1}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            State : {data?.user?.state}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            Category : {data?.category}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            Subject : {data?.subject}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 900 }}>
            Description : {data?.description}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name='queryStatus'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                label='Status'
                SelectProps={{
                  value: value,
                  onChange: e => onChange(e)
                }}
                id='validation-basic-select'
                error={Boolean(errors.queryStatus)}
                aria-describedby='validation-basic-select'
                {...(errors.queryStatus && { helperText: 'This field is required' })}

                // defaultValue=''
              >
                <MenuItem value='IN PROGRESS'>IN PROGRESS</MenuItem>
                <MenuItem value='RESOLVED'>RESOLVED</MenuItem>
                <MenuItem value='OPEN'>OPEN</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name='remark'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Remark'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors.remark)}
                aria-describedby='validation-basic-first-name'
                {...(errors.remark && { helperText: 'This field is required' })}
              />
            )}
          />
        </Grid>
        <Grid container justifyContent='center' columnGap={4}>
          <Button type='submit' variant='contained'>
            SUBMIT
          </Button>
          <Button variant='tonal' color='secondary' onClick={onClose}>
            CANCEL
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}

export default EditModal
