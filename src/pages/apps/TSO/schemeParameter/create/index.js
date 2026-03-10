import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import { useForm, useFieldArray } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Card, CardContent, CardHeader, CircularProgress, Divider } from '@mui/material'
import { addTSO } from 'src/store/apps/TSO/scheme'
import { useRouter } from 'next/router'

const defaultValues = {
  typeArr: [
    {
      fieldName: '',
      fieldType: ''
    }
  ]
}

const CreateScheme = () => {
  const dispatch = useDispatch()
  const state = useSelector(state => state.TSOScheme)
  const router = useRouter()
  const {
    register,
    unregister,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    control
  } = useForm({ defaultValues })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'typeArr'
  })

  const onSubmit = async data => {
    console.log('data', data)
    dispatch(addTSO(data))
    if (state.TSOSchemeLoading === 'LOADED') {
      router.push('/apps/TSO/schemeParameter')
    }
  }

  return (
    <>
      {state.TSOSchemeLoading === 'LOADING' ? (
        <CircularProgress sx={{ position: 'relative', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      ) : (
        <Card>
          <CardHeader title='Create Parameter' />
          <Divider sx={{ m: '0 !important' }} />
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Grid container columnSpacing={4} rowSpacing={4}>
                <Grid item xs={12} sm={3}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Scheme Type'
                    {...register('schemeType', { required: 'Scheme Type is required' })}
                    error={Boolean(errors.schemeType)}
                    helperText={errors.schemeType ? errors.schemeType.message : ''}
                  >
                    <MenuItem value={'BOI'}>BOI</MenuItem>
                    <MenuItem value={'CN'} onClick={() => unregister('dealerType')}>
                      CN
                    </MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Module'
                    {...register('module', { required: 'Module is required' })}
                    error={Boolean(errors.module)}
                    helperText={errors.module ? errors.module.message : ''}
                  >
                    <MenuItem value={'Early Bird'}>Early Bird</MenuItem>
                    <MenuItem value={'Volume Slab'}>Volume Slab</MenuItem>
                  </CustomTextField>
                </Grid>

                {fields.map((field, index) => (
                  <Grid item container columnSpacing={3} rowSpacing={6} key={field.id}>
                    <Grid item xs={12} sm={3}>
                      <CustomTextField
                        fullWidth
                        label='Field Name'
                        {...register(`typeArr.${index}.fieldName`, { required: 'Field Name is required' })}
                        error={Boolean(errors.typeArr?.[index]?.fieldName)}
                        helperText={errors.typeArr?.[index]?.fieldName?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <CustomTextField
                        select
                        fullWidth
                        label='Field Type'
                        {...register(`typeArr.${index}.fieldType`, { required: 'Field Type is required' })}
                        error={Boolean(errors.typeArr?.[index]?.fieldType)}
                        helperText={errors.typeArr?.[index]?.fieldType?.message}
                      >
                        <MenuItem value='Text'>Text</MenuItem>
                        <MenuItem value='Number'>Number</MenuItem>
                        <MenuItem value='Date'>Date</MenuItem>
                        <MenuItem value='Boolean'>Boolean</MenuItem>
                        <MenuItem value='Dropdown'>Dropdown</MenuItem>
                        <MenuItem value='Radio'>Radio</MenuItem>
                        <MenuItem value='Checkbox'>Checkbox</MenuItem>
                        <MenuItem value='Array'>Array</MenuItem>
                      </CustomTextField>
                    </Grid>
                    {watch(`typeArr.${index}.fieldType`) === 'Dropdown' ? (
                      <Grid item xs={12} sm={3}>
                        <CustomTextField
                          fullWidth
                          label='Dropdown Options'
                          placeholder='option 1, option 2'
                          {...register(`typeArr.${index}.values`, { required: 'Dropdown Options is required' })}
                          error={Boolean(errors.typeArr?.[index]?.values)}
                          helperText={
                            errors.typeArr?.[index]?.values
                              ? errors.typeArr?.[index]?.values?.message
                              : 'To enter multiple values seperate them by comma(,)'
                          }
                        />
                      </Grid>
                    ) : watch(`typeArr.${index}.fieldType`) === 'Radio' ? (
                      <Grid item xs={12} sm={3}>
                        <CustomTextField
                          fullWidth
                          label='Radio Options'
                          placeholder='option 1, option 2'
                          {...register(`typeArr.${index}.values`, { required: 'Radio Options is required' })}
                          error={Boolean(errors.typeArr?.[index]?.values)}
                          helperText={
                            errors.typeArr?.[index]?.values
                              ? errors.typeArr?.[index]?.values?.message
                              : 'To enter multiple values seperate them by comma(,)'
                          }
                        />
                      </Grid>
                    ) : watch(`typeArr.${index}.fieldType`) === 'Checkbox' ? (
                      <Grid item xs={12} sm={3}>
                        <CustomTextField
                          fullWidth
                          label='Checkbox Options'
                          placeholder='option 1, option 2'
                          {...register(`typeArr.${index}.values`, { required: 'Checkbox Options is required' })}
                          error={Boolean(errors.typeArr?.[index]?.values)}
                          helperText={
                            errors.typeArr?.[index]?.values
                              ? errors.typeArr?.[index]?.values?.message
                              : 'To enter multiple values seperate them by comma(,)'
                          }
                        />
                      </Grid>
                    ) : // : watch(`typeArr.${index}.fieldType`) === 'Array' ? (
                    //   <Grid item xs={12} sm={3}>
                    //     <CustomTextField
                    //       fullWidth
                    //       label='value'
                    //       placeholder='number'
                    //       {...register(`typeArr.${index}.values`, { required: 'Array Options is required' })}
                    //       error={Boolean(errors.typeArr?.[index]?.values)}
                    //       helperText={errors.typeArr?.[index]?.values ? errors.typeArr?.[index]?.values?.message : ''}
                    //     />
                    //   </Grid>
                    // )
                    null}
                    {index > 0 && (
                      <Grid item xs={12} sm={3}>
                        <Button sx={{ mt: 5 }} variant='outlined' onClick={() => remove(index)}>
                          Remove
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    onClick={() =>
                      append({
                        fieldName: '',
                        fieldType: ''
                      })
                    }
                  >
                    Add
                  </Button>
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
        </Card>
      )}
    </>
  )
}

export default CreateScheme
