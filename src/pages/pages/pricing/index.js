// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import MuiCardContent from '@mui/material/CardContent'

// ** Third Party Imports
import axiosRequest from 'src/utils/AxiosInterceptor'

// ** Demo Imports
import PricingCTA from 'src/views/pages/pricing/PricingCTA'
import PricingTable from 'src/views/pages/pricing/PricingTable'
import PricingPlans from 'src/views/pages/pricing/PricingPlans'
import PricingHeader from 'src/views/pages/pricing/PricingHeader'
import PricingFooter from 'src/views/pages/pricing/PricingFooter'

const PLAN_IMAGE_MAP = {
  professionals: '/images/pages/pricing-plan-basic.png',
  teams: '/images/pages/pricing-plan-standard.png',
  enterprise: '/images/pages/pricing-plan-enterprise.png',
}

const formatPublicPlan = plan => {
  const monthlyPrice = Number(plan.price_monthly ?? 0)
  const annualPrice = Number(plan.price_annual ?? monthlyPrice * 12)
  const moduleBenefits = Array.isArray(plan.modules)
    ? plan.modules.map(mod => (typeof mod === 'string' ? mod.replace(/_/g, ' ') : mod.name || mod.slug || String(mod)))
    : []

  return {
    imgWidth: 140,
    imgHeight: 140,
    title: plan.name || plan.package_type || 'Plan',
    monthlyPrice,
    currentPlan: false,
    popularPlan: plan.package_type === 'teams' || plan.package_type === 'standard',
    subtitle: `${plan.structure_level ? `${plan.structure_level} • ` : ''}${plan.seat_limit ? `up to ${plan.seat_limit} employees` : 'Unlimited seats'}`,
    imgSrc: PLAN_IMAGE_MAP[plan.package_type] || '/images/pages/pricing-plan-basic.png',
    yearlyPlan: {
      perMonth: annualPrice ? Math.round(annualPrice / 12) : 0,
      totalAnnual: annualPrice,
    },
    planBenefits: moduleBenefits,
  }
}

const DEFAULT_PRICING_TABLE = {
  header: [
    {
      title: 'Features',
      subtitle: 'Native Front Features',
    },
    {
      title: 'Starter',
      subtitle: 'Free',
    },
    {
      isPro: true,
      title: 'Pro',
      subtitle: '$7.5/month',
    },
    {
      title: 'Enterprise',
      subtitle: '$16/month',
    },
  ],
  rows: [
    {
      pro: true,
      starter: true,
      enterprise: true,
      feature: '14-days free trial',
    },
    {
      pro: false,
      starter: false,
      enterprise: true,
      feature: 'No user limit',
    },
    {
      pro: true,
      starter: false,
      enterprise: true,
      feature: 'Product Support',
    },
    {
      starter: false,
      enterprise: true,
      pro: 'Add-On Available',
      feature: 'Email Support',
    },
    {
      pro: true,
      starter: false,
      enterprise: true,
      feature: 'Integrations',
    },
    {
      starter: false,
      enterprise: true,
      pro: 'Add-On Available',
      feature: 'Removal of Front branding',
    },
    {
      pro: false,
      starter: false,
      enterprise: true,
      feature: 'Active maintenance & support',
    },
    {
      pro: false,
      starter: false,
      enterprise: true,
      feature: 'Data storage for 365 days',
    },
  ],
}

const DEFAULT_FAQ = [
  {
    id: 'responses-limit',
    question: 'What counts towards the 100 responses limit?',
    answer:
      'We count all responses submitted through all your forms in a month. If you already received 100 responses this month, you won’t be able to receive any more of them until next month when the counter resets.',
  },
  {
    id: 'process-payments',
    question: 'How do you process payments?',
    answer:
      'We accept Visa®, MasterCard®, American Express®, and PayPal®. So you can be confident that your credit card information will be kept safe and secure.',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: '2Checkout accepts all types of credit and debit cards.',
  },
  {
    id: 'money-back-guarantee',
    question: 'Do you have a money-back guarantee?',
    answer: 'Yes. You may request a refund within 30 days of your purchase without any additional explanations.',
  },
  {
    id: 'more-questions',
    question: 'I have more questions. Where can I get help?',
    answer: 'Please contact us if you have more questions. Please contact us if you have more questions. We’re here to help!',
  },
]

// ** Styled Components
const CardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: `${theme.spacing(20, 36)} !important`,
  [theme.breakpoints.down('xl')]: {
    padding: `${theme.spacing(20)} !important`
  },
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(10, 5)} !important`
  }
}))

const Pricing = ({ apiData }) => {
  // ** States
  const [plan, setPlan] = useState('annually')

  const handleChange = e => {
    if (e.target.checked) {
      setPlan('annually')
    } else {
      setPlan('monthly')
    }
  }

  return (
    <Card>
      <CardContent>
        <PricingHeader plan={plan} handleChange={handleChange} />
        <PricingPlans plan={plan} data={apiData.pricingPlans} />
      </CardContent>
      <PricingCTA />
      <CardContent>
        <PricingTable data={apiData} />
      </CardContent>
      <CardContent sx={{ backgroundColor: 'action.hover' }}>
        <PricingFooter data={apiData} />
      </CardContent>
    </Card>
  )
}

export const getStaticProps = async () => {
  let pricingPlans = []

  try {
    const res = await axiosRequest.get('/api/v1/plans/public')
    const plans = Array.isArray(res) ? res : res?.data

    if (Array.isArray(plans)) {
      pricingPlans = plans.map(formatPublicPlan)
    }
  } catch (error) {
    console.error('Failed to load public pricing plans:', error)
  }

  if (!pricingPlans.length) {
    pricingPlans = [
      {
        imgWidth: 140,
        imgHeight: 140,
        title: 'Basic',
        monthlyPrice: 0,
        currentPlan: true,
        popularPlan: false,
        subtitle: 'A simple start for everyone',
        imgSrc: '/images/pages/pricing-plan-basic.png',
        yearlyPlan: {
          perMonth: 0,
          totalAnnual: 0,
        },
        planBenefits: [
          '100 responses a month',
          'Unlimited forms and surveys',
          'Unlimited fields',
          'Basic form creation tools',
          'Up to 2 subdomains',
        ],
      },
      {
        imgWidth: 140,
        imgHeight: 140,
        monthlyPrice: 49,
        title: 'Standard',
        popularPlan: true,
        currentPlan: false,
        subtitle: 'For small to medium businesses',
        imgSrc: '/images/pages/pricing-plan-standard.png',
        yearlyPlan: {
          perMonth: 40,
          totalAnnual: 480,
        },
        planBenefits: [
          'Unlimited responses',
          'Unlimited forms and surveys',
          'Instagram profile page',
          'Google Docs integration',
          'Custom “Thank you” page',
        ],
      },
      {
        imgWidth: 140,
        imgHeight: 140,
        monthlyPrice: 99,
        popularPlan: false,
        currentPlan: false,
        title: 'Enterprise',
        subtitle: 'Solution for big organizations',
        imgSrc: '/images/pages/pricing-plan-enterprise.png',
        yearlyPlan: {
          perMonth: 80,
          totalAnnual: 960,
        },
        planBenefits: [
          'PayPal payments',
          'Logic Jumps',
          'File upload with 5GB storage',
          'Custom domain support',
          'Stripe integration',
        ],
      },
    ]
  }

  return {
    props: {
      apiData: {
        pricingPlans,
        pricingTable: DEFAULT_PRICING_TABLE,
        faq: DEFAULT_FAQ,
      }
    }
  }
}

export default Pricing
