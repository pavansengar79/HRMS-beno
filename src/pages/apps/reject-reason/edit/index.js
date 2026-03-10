// ** React Imports
import { forwardRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { addReason, updateRejectData } from 'src/store/apps/reject-reason'
import toast from 'react-hot-toast'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import { useForm } from 'react-hook-form'

const EditModal = ({ data, onClose }) => {
  // ** States

  const dispatch = useDispatch()

  const defaultValues = {
    name: data?.name,
    description: data?.description,
    status: data?.status.toString()
  }

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = formdata => {
    dispatch(
      updateRejectData({
        id: data._id,
        status: formdata?.status,
        name: formdata?.name,
        description: formdata?.description
      })
    )

    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            label='Name'
            id='form-name'
            {...register('name', { required: true })}
            error={errors.name}
            helperText={errors.name && 'This field is required'}
          ></CustomTextField>
        </Grid>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            fullWidth
            label='Description'
            id='form-description'
            {...register('description', { required: true })}
            error={errors.description}
            helperText={errors.description && 'This field is required'}
          ></CustomTextField>
        </Grid>
        <Grid item xs={12} sm={12}>
          <CustomTextField
            select
            fullWidth
            label='Status'
            id='form-status'
            {...register('status', { required: true })}
            error={errors.status}
            helperText={errors.status && 'This field is required'}
          >
            <MenuItem value='true'>TRUE</MenuItem>
            <MenuItem value='false'>FALSE</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid container justifyContent='center' columnGap={4} sx={{ mt: 5 }}>
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
