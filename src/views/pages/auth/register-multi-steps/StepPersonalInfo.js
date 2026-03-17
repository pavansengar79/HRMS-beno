// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** React Hook Form + Yup
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ─── Validation Schema ───────────────────────
const schema = yup.object().shape({
  companyName: yup.string().required('Company Name is required'),
  companyLegalName: yup.string().required('Company Legal Name is required'),
  companyRegNumber: yup.string().required('Registration Number is required'),
  gstTaxId: yup.string().required('GST / Tax ID is required'),
  industryType: yup.string().required('Industry Type is required'),
  companySize: yup
    .number()
    .typeError('Must be a number')
    .positive('Must be a positive number')
    .integer('Must be a whole number')
    .required('Company Size is required'),
  companyEmail: yup.string().email('Invalid email format').required('Company Email is required'),
  companyPhone: yup
    .string()
    .matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number')
    .required('Company Phone is required'),
  companyWebsite: yup
    .string()
    .url('Must be a valid URL (e.g. https://example.com)')
    .nullable()
    .transform(val => (val === '' ? null : val)),
  country: yup.string().required('Country is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  zipCode: yup.string().required('Zip Code is required'),
  fullAddress: yup.string().required('Full Address is required'),
  hrContactName: yup.string().required('HR Contact Name is required'),
  hrContactEmail: yup.string().email('Invalid email format').required('HR Contact Email is required'),
  hrContactPhone: yup
    .string()
    .matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number')
    .required('HR Contact Phone is required')
})

// ─── Component ───────────────────────────────
const StepPersonalInfo = ({ handleNext, handlePrev }) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      companyName: '',
      companyLegalName: '',
      companyRegNumber: '',
      gstTaxId: '',
      industryType: '',
      companySize: '',
      companyEmail: '',
      companyPhone: '',
      companyWebsite: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      fullAddress: '',
      hrContactName: '',
      hrContactEmail: '',
      hrContactPhone: ''
    }
  })

  const onNext = handleSubmit(() => handleNext())

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Personal Information
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>Enter Your Company Information</Typography>
      </Box>

      <Grid container spacing={5}>

        {/* Company Name */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companyName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Company Name'
                placeholder='Acme Inc.'
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
              />
            )}
          />
        </Grid>

        {/* Company Legal Name */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companyLegalName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Company Legal Name'
                placeholder='Acme Incorporated Pvt Ltd'
                error={!!errors.companyLegalName}
                helperText={errors.companyLegalName?.message}
              />
            )}
          />
        </Grid>

        {/* Registration Number */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companyRegNumber'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Company Registration Number'
                placeholder='CIN123456789'
                error={!!errors.companyRegNumber}
                helperText={errors.companyRegNumber?.message}
              />
            )}
          />
        </Grid>

        {/* GST / Tax ID */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='gstTaxId'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='GST / Tax ID'
                placeholder='22AAAAA0000A1Z5'
                error={!!errors.gstTaxId}
                helperText={errors.gstTaxId?.message}
              />
            )}
          />
        </Grid>

        {/* Industry Type */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='industryType'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Industry Type'
                error={!!errors.industryType}
                helperText={errors.industryType?.message}
              >
                <MenuItem value='technology'>Technology</MenuItem>
                <MenuItem value='finance'>Finance & Banking</MenuItem>
                <MenuItem value='healthcare'>Healthcare</MenuItem>
                <MenuItem value='retail'>Retail & E-commerce</MenuItem>
                <MenuItem value='manufacturing'>Manufacturing</MenuItem>
                <MenuItem value='education'>Education</MenuItem>
                <MenuItem value='logistics'>Logistics & Supply Chain</MenuItem>
                <MenuItem value='realestate'>Real Estate</MenuItem>
                <MenuItem value='media'>Media & Entertainment</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>

        {/* Company Size */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companySize'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Company Size (No. of Employees)'
                placeholder='150'
                error={!!errors.companySize}
                helperText={errors.companySize?.message}
              />
            )}
          />
        </Grid>

        {/* Company Email */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companyEmail'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label='Company Email'
                placeholder='info@company.com'
                error={!!errors.companyEmail}
                helperText={errors.companyEmail?.message}
              />
            )}
          />
        </Grid>

        {/* Company Phone */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companyPhone'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Company Phone Number'
                placeholder='+91 98765 43210'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>
                }}
                error={!!errors.companyPhone}
                helperText={errors.companyPhone?.message}
              />
            )}
          />
        </Grid>

        {/* Company Website */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='companyWebsite'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Company Website'
                placeholder='https://www.company.com'
                error={!!errors.companyWebsite}
                helperText={errors.companyWebsite?.message}
              />
            )}
          />
        </Grid>

        {/* Country */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='country'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='Country'
                error={!!errors.country}
                helperText={errors.country?.message}
              >
                <MenuItem value='india'>India</MenuItem>
                <MenuItem value='us'>United States</MenuItem>
                <MenuItem value='uk'>United Kingdom</MenuItem>
                <MenuItem value='canada'>Canada</MenuItem>
                <MenuItem value='australia'>Australia</MenuItem>
                <MenuItem value='uae'>UAE</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>

        {/* State */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='state'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label='State'
                error={!!errors.state}
                helperText={errors.state?.message}
              >
                <MenuItem value='maharashtra'>Maharashtra</MenuItem>
                <MenuItem value='karnataka'>Karnataka</MenuItem>
                <MenuItem value='delhi'>Delhi</MenuItem>
                <MenuItem value='gujarat'>Gujarat</MenuItem>
                <MenuItem value='telangana'>Telangana</MenuItem>
                <MenuItem value='tamilnadu'>Tamil Nadu</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>

        {/* City */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='city'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='City'
                placeholder='Mumbai'
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />
        </Grid>

        {/* Zip Code */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='zipCode'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Zip Code'
                placeholder='400001'
                error={!!errors.zipCode}
                helperText={errors.zipCode?.message}
              />
            )}
          />
        </Grid>

        {/* Full Address */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Controller
              name='fullAddress'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Full Company Address'
                  placeholder='123, Business Park, Andheri East'
                  error={!!errors.fullAddress}
                  helperText={errors.fullAddress?.message}
                />
              )}
            />
          </FormControl>
        </Grid>

        {/* HR Contact Name */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='hrContactName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='HR Contact Person Name'
                placeholder='Rahul Sharma'
                error={!!errors.hrContactName}
                helperText={errors.hrContactName?.message}
              />
            )}
          />
        </Grid>

        {/* HR Contact Email */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='hrContactEmail'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label='HR Contact Email'
                placeholder='hr@company.com'
                error={!!errors.hrContactEmail}
                helperText={errors.hrContactEmail?.message}
              />
            )}
          />
        </Grid>

        {/* HR Contact Phone */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='hrContactPhone'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='HR Contact Phone'
                placeholder='+91 98765 43210'
                error={!!errors.hrContactPhone}
                helperText={errors.hrContactPhone?.message}
              />
            )}
          />
        </Grid>

        {/* Navigation — same layout as original */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Previous
            </Button>
            <Button variant='contained' onClick={onNext} sx={{ '& svg': { ml: 2 } }}>
              Next
              <Icon fontSize='1.125rem' icon='tabler:arrow-right' />
            </Button>
          </Box>
        </Grid>

      </Grid>
    </>
  )
}

export default StepPersonalInfo