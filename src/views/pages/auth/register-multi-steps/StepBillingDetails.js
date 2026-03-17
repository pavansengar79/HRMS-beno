// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'

// ** Third Party Imports
import Payment from 'payment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomRadioIcons from 'src/@core/components/custom-radio/icons'

// ** Util Import
import { formatCVC, formatExpirationDate, formatCreditCardNumber } from 'src/@core/utils/format'

// ** Styles Import
import 'react-credit-cards/es/styles-compiled.css'

// ** React Hook Form + Yup
import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ─── Plan Radio Data (same as original) ──────
const planData = [
  {
    value: 'basic',
    title: (
      <Typography variant='h4' sx={{ mb: 1 }}>
        Basic
      </Typography>
    ),
    content: (
      <Box sx={{ my: 'auto', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          A simple start for start ups & Students
        </Typography>
        <Box sx={{ mt: 1, display: 'flex' }}>
          <Typography component='sup' sx={{ mt: 1.5, color: 'primary.main', alignSelf: 'flex-start' }}>
            $
          </Typography>
          <Typography variant='h2' sx={{ color: 'primary.main' }}>
            0
          </Typography>
          <Typography component='sub' sx={{ mb: 1.5, alignSelf: 'flex-end', color: 'text.disabled' }}>
            /month
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    isSelected: true,
    value: 'standard',
    title: (
      <Typography variant='h4' sx={{ mb: 1 }}>
        Standard
      </Typography>
    ),
    content: (
      <Box sx={{ my: 'auto', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          For small to medium businesses
        </Typography>
        <Box sx={{ mt: 1, display: 'flex' }}>
          <Typography component='sup' sx={{ mt: 1.5, color: 'primary.main', alignSelf: 'flex-start' }}>
            $
          </Typography>
          <Typography variant='h2' sx={{ color: 'primary.main' }}>
            99
          </Typography>
          <Typography component='sub' sx={{ mb: 1.5, alignSelf: 'flex-end', color: 'text.disabled' }}>
            /month
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    value: 'enterprise',
    title: (
      <Typography variant='h4' sx={{ mb: 1 }}>
        Enterprise
      </Typography>
    ),
    content: (
      <Box sx={{ my: 'auto', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Solution for enterprise & organizations
        </Typography>
        <Box sx={{ mt: 1, display: 'flex' }}>
          <Typography component='sup' sx={{ mt: 1.5, color: 'primary.main', alignSelf: 'flex-start' }}>
            $
          </Typography>
          <Typography variant='h2' sx={{ color: 'primary.main' }}>
            499
          </Typography>
          <Typography component='sub' sx={{ mb: 1.5, alignSelf: 'flex-end', color: 'text.disabled' }}>
            /month
          </Typography>
        </Box>
      </Box>
    )
  }
]

// ─── Validation Schema ───────────────────────
const schema = yup.object().shape({
  subscriptionPlan: yup.string().required('Please select a plan'),

  // Billing contact — required only when NOT basic
  billingContactName: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s => s.required('Billing Contact Name is required'),
    otherwise: s => s.nullable()
  }),
  billingEmail: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s => s.email('Invalid email format').required('Billing Email is required'),
    otherwise: s => s.nullable()
  }),
  billingPhone: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s =>
      s
        .matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone number')
        .required('Billing Phone is required'),
    otherwise: s => s.nullable()
  }),
  billingAddress: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s => s.required('Billing Address is required'),
    otherwise: s => s.nullable()
  }),

  // Payment — required only when NOT basic
  paymentMethod: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s => s.required('Payment Method is required'),
    otherwise: s => s.nullable()
  }),
  currency: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s => s.required('Currency is required'),
    otherwise: s => s.nullable()
  }),
  billingCycle: yup.string().when('subscriptionPlan', {
    is: val => val && val !== 'basic',
    then: s => s.required('Billing Cycle is required'),
    otherwise: s => s.nullable()
  }),
  billingGst: yup.string().nullable(),

  // Card fields — required only when paymentMethod is credit_card AND plan != basic
  cardNumber: yup.string().when(['subscriptionPlan', 'paymentMethod'], {
    is: (plan, method) => plan && plan !== 'basic' && method === 'credit_card',
    then: s => s.required('Card Number is required'),
    otherwise: s => s.nullable()
  }),
  cardName: yup.string().when(['subscriptionPlan', 'paymentMethod'], {
    is: (plan, method) => plan && plan !== 'basic' && method === 'credit_card',
    then: s => s.required('Name on Card is required'),
    otherwise: s => s.nullable()
  }),
  expiry: yup.string().when(['subscriptionPlan', 'paymentMethod'], {
    is: (plan, method) => plan && plan !== 'basic' && method === 'credit_card',
    then: s => s.required('Expiry is required'),
    otherwise: s => s.nullable()
  }),
  cvc: yup.string().when(['subscriptionPlan', 'paymentMethod'], {
    is: (plan, method) => plan && plan !== 'basic' && method === 'credit_card',
    then: s => s.required('CVC is required'),
    otherwise: s => s.nullable()
  })
})

// ─── Component ───────────────────────────────
const StepBillingDetails = ({ handlePrev }) => {
  const initialSelected = planData.filter(item => item.isSelected).slice(-1)[0].value

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subscriptionPlan: initialSelected,
      billingContactName: '',
      billingEmail: '',
      billingPhone: '',
      billingAddress: '',
      paymentMethod: '',
      currency: '',
      billingCycle: '',
      billingGst: '',
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: ''
    }
  })

  const subscriptionPlan = useWatch({ control, name: 'subscriptionPlan' })
  const paymentMethod = useWatch({ control, name: 'paymentMethod' })

  const isFreePlan = subscriptionPlan === 'basic'
  const isCreditCard = paymentMethod === 'credit_card'

  // Card formatting (same as original)
  const handleCardInput = ({ target }, field) => {
    if (field === 'cardNumber') {
      target.value = formatCreditCardNumber(target.value, Payment)
    } else if (field === 'expiry') {
      target.value = formatExpirationDate(target.value)
    } else if (field === 'cvc') {
      target.value = formatCVC(target.value, '', Payment)
    }
    return target.value
  }

  const onSubmit = handleSubmit(async data => {
    // Mock API call
    console.log('Onboarding submitted:', data)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Company Onboarding Submitted Successfully!')
  })

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Select Plan
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>Select plan as per your requirement</Typography>
      </Box>

      <Grid container spacing={5}>

        {/* Plan Radio — same as original CustomRadioIcons */}
        {planData.map((item, index) => (
          <CustomRadioIcons
            key={index}
            data={planData[index]}
            selected={subscriptionPlan}
            name='custom-radios-plan'
            gridProps={{ sm: 4, xs: 12 }}
            handleChange={val => setValue('subscriptionPlan', typeof val === 'string' ? val : val.target.value)}
          />
        ))}

        {/* Plan validation error */}
        {errors.subscriptionPlan && (
          <Grid item xs={12}>
            <Typography color='error' variant='body2'>
              {errors.subscriptionPlan.message}
            </Typography>
          </Grid>
        )}

        {/* ── FREE PLAN: hide all billing fields ── */}
        {isFreePlan && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 4,
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
                textAlign: 'center'
              }}
            >
              <Typography color='text.secondary'>
                No payment details required for the Free plan. You can upgrade anytime.
              </Typography>
            </Box>
          </Grid>
        )}

        {/* ── PAID PLAN: show billing fields ── */}
        {!isFreePlan && (
          <>
            <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
              <Typography variant='h3' sx={{ mb: 1.5 }}>
                Billing Information
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>Enter your billing contact details</Typography>
            </Grid>

            {/* Billing Contact Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='billingContactName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Billing Contact Name'
                    placeholder='John Doe'
                    error={!!errors.billingContactName}
                    helperText={errors.billingContactName?.message}
                  />
                )}
              />
            </Grid>

            {/* Billing Email */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='billingEmail'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Billing Email'
                    placeholder='billing@company.com'
                    error={!!errors.billingEmail}
                    helperText={errors.billingEmail?.message}
                  />
                )}
              />
            </Grid>

            {/* Billing Phone */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='billingPhone'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Billing Phone'
                    placeholder='+91 98765 43210'
                    error={!!errors.billingPhone}
                    helperText={errors.billingPhone?.message}
                  />
                )}
              />
            </Grid>

            {/* Billing Address */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Controller
                  name='billingAddress'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Billing Address'
                      placeholder='123, MG Road, Bengaluru'
                      error={!!errors.billingAddress}
                      helperText={errors.billingAddress?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Payment Method */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='paymentMethod'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Payment Method'
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                  >
                    <MenuItem value='credit_card'>Credit / Debit Card</MenuItem>
                    <MenuItem value='bank_transfer'>Bank Transfer</MenuItem>
                    <MenuItem value='upi'>UPI</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Currency */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='currency'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Currency'
                    error={!!errors.currency}
                    helperText={errors.currency?.message}
                  >
                    <MenuItem value='inr'>INR — Indian Rupee</MenuItem>
                    <MenuItem value='usd'>USD — US Dollar</MenuItem>
                    <MenuItem value='eur'>EUR — Euro</MenuItem>
                    <MenuItem value='gbp'>GBP — British Pound</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Billing Cycle */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='billingCycle'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Billing Cycle'
                    error={!!errors.billingCycle}
                    helperText={errors.billingCycle?.message}
                  >
                    <MenuItem value='monthly'>Monthly</MenuItem>
                    <MenuItem value='yearly'>Yearly (Save 20%)</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Billing GST */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='billingGst'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Company Billing GST Number (Optional)'
                    placeholder='22AAAAA0000A1Z5'
                    error={!!errors.billingGst}
                    helperText={errors.billingGst?.message}
                  />
                )}
              />
            </Grid>

            {/* ── Credit Card fields — only when paymentMethod = credit_card ── */}
            {isCreditCard && (
              <>
                <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
                  <Typography variant='h3' sx={{ mb: 1.5 }}>
                    Payment Information
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>Enter your card information</Typography>
                </Grid>

                {/* Card Number */}
                <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
                  <FormControl fullWidth>
                    <Controller
                      name='cardNumber'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          autoComplete='off'
                          label='Card Number'
                          placeholder='0000 0000 0000 0000'
                          error={!!errors.cardNumber}
                          helperText={errors.cardNumber?.message}
                          onChange={e => {
                            field.onChange(handleCardInput(e, 'cardNumber'))
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Name on Card */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='cardName'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        autoComplete='off'
                        label='Name on Card'
                        placeholder='John Doe'
                        error={!!errors.cardName}
                        helperText={errors.cardName?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Expiry */}
                <Grid item xs={6} sm={3}>
                  <Controller
                    name='expiry'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Expiry'
                        placeholder='MM/YY'
                        inputProps={{ maxLength: '5' }}
                        error={!!errors.expiry}
                        helperText={errors.expiry?.message}
                        onChange={e => {
                          field.onChange(handleCardInput(e, 'expiry'))
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* CVC — same as original with Tooltip */}
                <Grid item xs={6} sm={3}>
                  <Controller
                    name='cvc'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='CVC'
                        placeholder='234'
                        autoComplete='off'
                        error={!!errors.cvc}
                        helperText={errors.cvc?.message}
                        onChange={e => {
                          field.onChange(handleCardInput(e, 'cvc'))
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='start' sx={{ '& svg': { cursor: 'pointer' } }}>
                              <Tooltip title='Card Verification Value'>
                                <Box sx={{ display: 'flex' }}>
                                  <Icon fontSize='1.25rem' icon='tabler:question-circle' />
                                </Box>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </>
        )}

        {/* Navigation — same layout as original */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Previous
            </Button>
            <Button color='success' variant='contained' onClick={onSubmit}>
              Submit
            </Button>
          </Box>
        </Grid>

      </Grid>
    </>
  )
}

export default StepBillingDetails