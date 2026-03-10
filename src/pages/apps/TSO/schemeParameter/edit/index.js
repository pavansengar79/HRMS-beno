import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { updateTSO } from 'src/store/apps/TSO/scheme'
import { Box } from '@mui/system'
import { useState } from 'react'

const CreateScheme = ({ rowData, onClose }) => {
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const [fieldType, setFieldType] = useState(rowData?.fieldType)

  const onSubmit = async data => {
    console.log('data', data)
    data.id = rowData?._id
    dispatch(updateTSO(data))
    onClose()
  }

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container columnSpacing={4} rowSpacing={4}>
          <Grid item xs={12} sm={12}>
            <CustomTextField
              select
              fullWidth
              label='Scheme Type'
              defaultValue={rowData?.schemeType}
              {...register('schemeType', { required: 'Scheme Type is required' })}
              error={Boolean(errors.schemeType)}
              helperText={errors.schemeType ? errors.schemeType.message : ''}
            >
              <MenuItem value={'BOI'}>BOI</MenuItem>
              <MenuItem value={'CN'}>CN</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomTextField
              select
              fullWidth
              label='Module'
              defaultValue={rowData?.module}
              {...register('module', { required: 'Module is required' })}
              error={Boolean(errors.module)}
              helperText={errors.module ? errors.module.message : ''}
            >
              <MenuItem value={'Early Bird'}>Early Bird</MenuItem>
              <MenuItem value={'Volume Slab'}>Volume Slab</MenuItem>
            </CustomTextField>
          </Grid>

          <Grid item container columnSpacing={3} rowSpacing={6}>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                fullWidth
                label='Field Name'
                defaultValue={rowData?.fieldName}
                {...register(`fieldName`, { required: 'Field Name is required' })}
                error={Boolean(errors.fieldName)}
                helperText={errors.fieldName?.message}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                select
                fullWidth
                label='Field Type'
                defaultValue={rowData?.fieldType}
                {...register(`fieldType`, { required: 'Field Type is required' })}
                error={Boolean(errors.fieldType)}
                helperText={errors.fieldType?.message}
                onChange={e => setFieldType(e.target.value)}
              >
                <MenuItem value='Text'>Text</MenuItem>
                <MenuItem value='Number'>Number</MenuItem>
                <MenuItem value='Date'>Date</MenuItem>
                <MenuItem value='Boolean'>Boolean</MenuItem>
                <MenuItem value='Dropdown'>Dropdown</MenuItem>
                <MenuItem value='Radio'>Radio</MenuItem>
                <MenuItem value='Checkbox'>Checkbox</MenuItem>
              </CustomTextField>
            </Grid>
            {fieldType == 'Dropdown' ? (
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Dropdown Options'
                  defaultValue={rowData?.values ? rowData?.values.join(',') : ''}
                  placeholder='option 1, option 2'
                  {...register(`values`, { required: 'Dropdown Options is required' })}
                  error={Boolean(errors.values)}
                  helperText={
                    errors.values ? errors.values?.message : 'To enter multiple values seperate them by comma(,)'
                  }
                  // value={values}
                  // onChange={e => setValues(e.target.value)}
                  // helperText={'To enter multiple values seperate them by comma(,)'}
                />
              </Grid>
            ) : fieldType == 'Radio' ? (
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Radio Options'
                  placeholder='option 1, option 2'
                  defaultValue={rowData?.values ? rowData?.values.join(',') : ''}
                  {...register(`values`, { required: 'Dropdown Options is required' })}
                  error={Boolean(errors.values)}
                  helperText={
                    errors.values ? errors.values?.message : 'To enter multiple values seperate them by comma(,)'
                  }

                  // value={values}
                  // placeholder='true,false'
                  // onChange={e => setValues(e.target.value)}
                  // helperText={'To enter multiple values seperate them by comma(,)'}
                />
              </Grid>
            ) : fieldType == 'Checkbox' ? (
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Checkbox Options'
                  placeholder='option 1, option 2'
                  defaultValue={rowData?.values ? rowData?.values.join(',') : ''}
                  {...register(`values`, { required: 'Dropdown Options is required' })}
                  error={Boolean(errors.values)}
                  helperText={
                    errors.values ? errors.values?.message : 'To enter multiple values seperate them by comma(,)'
                  }
                />
              </Grid>
            ) : null}
          </Grid>
        </Grid>
        <Grid sx={{ mt: 3 }} container justifyContent='center'>
          <Button type='submit' sx={{ mr: 2 }} variant='contained'>
            Submit
          </Button>
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
        </Grid>
      </form>
    </Box>
  )
}

export default CreateScheme
