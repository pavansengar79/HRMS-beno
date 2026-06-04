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
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'

// ** Third Party Imports
import Payment from 'payment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Util Import
import { formatCVC, formatExpirationDate, formatCreditCardNumber } from 'src/@core/utils/format'

// ** Styles Import
import 'react-credit-cards/es/styles-compiled.css'

// ** React Hook Form + Yup
import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ─── Plan display info ─────────────────────────
const PLAN_INFO = {
  basic:        { label: 'Basic',        price: '₹0',      isCustom: false, isFree: true },
  standard:     { label: 'Standard',     price: '₹2,499',  isCustom: false, isFree: false },
  professional: { label: 'Professional', price: '₹7,999',  isCustom: false, isFree: false },
  enterprise:   { label: 'Enterprise',   price: 'Custom',  isCustom: true,  isFree: false }
}

// ─── Validation Schema ─────────────────────────
const buildSchema = (plan) => {
  const isFree = plan === 'basic'
  const isCustom = plan === 'enterprise'

  return yup.object().shape({
    billingContactName: isFree
      ? yup.string().nullable()
      : yup.string().required('Billing Contact Name is required'),

    billingEmail: isFree
      ? yup.string().nullable()
      : yup.string().email('Invalid email').required('Billing Email is required'),

    billingPhone: isFree
      ? yup.string().nullable()
      : yup.string().matches(/^[0-9+\-\s()]{7,15}$/, 'Invalid phone').required('Billing Phone is required'),

    billingAddress: isFree
      ? yup.string().nullable()
      : yup.string().required('Billing Address is required'),

    paymentMethod: (isFree || isCustom)
      ? yup.string().nullable()
      : yup.string().required('Payment Method is required'),

    currency: isFree
      ? yup.string().nullable()
      : yup.string().required('Currency is required'),

    billingCycle: (isFree || isCustom)
      ? yup.string().nullable()
      : yup.string().required('Billing Cycle is required'),

    billingGst: yup.string().nullable(),

    cardNumber: yup.string().when('paymentMethod', {
      is: 'credit_card',
      then: s => s.required('Card Number is required'),
      otherwise: s => s.nullable()
    }),
    cardName: yup.string().when('paymentMethod', {
      is: 'credit_card',
      then: s => s.required('Name on Card is required'),
      otherwise: s => s.nullable()
    }),
    expiry: yup.string().when('paymentMethod', {
      is: 'credit_card',
      then: s => s.required('Expiry is required'),
      otherwise: s => s.nullable()
    }),
    cvc: yup.string().when('paymentMethod', {
      is: 'credit_card',
      then: s => s.required('CVC is required'),
      otherwise: s => s.nullable()
    })
  })
}

// ─── Component ───────────────────────────────
const StepBillingDetails = ({ handleNext, handlePrev, plan }) => {
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.standard
  const isFree = planInfo.isFree
  const isCustom = planInfo.isCustom

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(buildSchema(plan)),
    defaultValues: {
      billingContactName: '',
      billingEmail: '',
      billingPhone: '',
      billingAddress: '',
      paymentMethod: '',
      currency: 'inr',
      billingCycle: 'monthly',
      billingGst: '',
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvc: ''
    }
  })

  const paymentMethod = useWatch({ control, name: 'paymentMethod' })
  const isCreditCard = paymentMethod === 'credit_card'

  const handleCardInput = ({ target }, field) => {
    if (field === 'cardNumber') target.value = formatCreditCardNumber(target.value, Payment)
    else if (field === 'expiry') target.value = formatExpirationDate(target.value)
    else if (field === 'cvc') target.value = formatCVC(target.value, '', Payment)
    return target.value
  }

  const onNext = handleSubmit(data => {
    handleNext()
  })

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Billing & Payment
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {isFree ? 'No payment required for the Free plan' :
           isCustom ? 'Provide billing contact details — our team will reach out with custom pricing' :
           `Set up billing for your ${planInfo.label} plan`}
        </Typography>
      </Box>

      {/* Plan summary badge */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler:receipt' fontSize='1.5rem' />
          <Box>
            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: 12 }}>Selected Plan</Typography>
            <Typography variant='h6'>{planInfo.label}</Typography>
          </Box>
        </Box>
        <Chip
          label={isFree ? 'Free Forever' : isCustom ? 'Custom Pricing' : planInfo.price + '/mo'}
          color={isFree ? 'success' : isCustom ? 'warning' : 'primary'}
          variant='tonal'
          size='small'
          sx={{ fontWeight: 600 }}
        />
      </Paper>

      <Grid container spacing={5}>

        {/* ── FREE PLAN ── */}
        {isFree && (
          <Grid item xs={12}>
            <Alert severity='success' icon={<Icon icon='tabler:circle-check' />} sx={{ borderRadius: 2 }}>
              <strong>No payment details required.</strong> The Free plan is free forever. You can upgrade anytime from your dashboard.
            </Alert>
          </Grid>
        )}

        {/* ── ENTERPRISE: Custom quote ── */}
        {isCustom && (
          <Grid item xs={12}>
            <Alert severity='warning' icon={<Icon icon='tabler:building-skyscraper' />} sx={{ borderRadius: 2 }}>
              <strong>Enterprise pricing is custom.</strong> Provide your billing contact below and our sales team will send you a tailored quote within 1 business day.
            </Alert>
          </Grid>
        )}

        {/* ── All non-free: billing contact ── */}
        {!isFree && (
          <>
            <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
              <Typography variant='h5' sx={{ mb: 0.5 }}>Billing Contact</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Who should we send invoices and billing communications to?
              </Typography>
            </Grid>

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

            <Grid item xs={12} sm={6}>
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
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='billingGst'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='GST Number (Optional)'
                    placeholder='22AAAAA0000A1Z5'
                    error={!!errors.billingGst}
                    helperText={errors.billingGst?.message}
                  />
                )}
              />
            </Grid>
          </>
        )}

        {/* ── Paid non-enterprise: payment method + card ── */}
        {!isFree && !isCustom && (
          <>
            <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
              <Typography variant='h5' sx={{ mb: 0.5 }}>Payment Details</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>Choose how you'd like to pay</Typography>
            </Grid>

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

            {/* Credit Card details */}
            {isCreditCard && (
              <>
                <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
                  <Typography variant='h5' sx={{ mb: 0.5 }}>Card Information</Typography>
                </Grid>

                <Grid item xs={12}>
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
                        onChange={e => { field.onChange(handleCardInput(e, 'cardNumber')) }}
                      />
                    )}
                  />
                </Grid>

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
                        onChange={e => { field.onChange(handleCardInput(e, 'expiry')) }}
                      />
                    )}
                  />
                </Grid>

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
                        onChange={e => { field.onChange(handleCardInput(e, 'cvc')) }}
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

        {/* Navigation */}
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

export default StepBillingDetails
