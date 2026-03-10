// ** React Imports
import Zone from './dealersItems/Zone'
import Region from './dealersItems/Region'
import Area from './dealersItems/Area'
import Dealers from './dealersItems/Dealers'
import AllDealers from './dealersItems/AllDealers'
import { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiStep from '@mui/material/Step'

// ** Third Party Imports

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
// import StepperCustomDot from './StepperCustomDot'
import StepperCustomDot from 'src/views/forms/form-wizard/StepperCustomDot'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

const steps = [
  {
    icon: 'tabler:home',
    title: 'ZONES'
  },
  {
    icon: 'tabler:location',
    title: 'REGIONS LIST'
  },
  {
    icon: 'tabler:map',
    title: 'AREAS LIST'
  },
  {
    icon: 'tabler:users',
    title: 'DEALERS LIST'
  },
  {
    icon: 'tabler:list',
    title: 'ALL DEALERS LIST'
  }
]

const Step = styled(MuiStep)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  '&:first-of-type': {
    paddingLeft: 0
  },
  '&:last-of-type': {
    paddingRight: 0
  },
  '& .MuiStepLabel-iconContainer': {
    display: 'none'
  },
  '& .step-subtitle': {
    color: `${theme.palette.text.disabled} !important`
  },
  '& + svg': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed .step-title': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed + svg': {
    color: theme.palette.primary.main
  },
  [theme.breakpoints.down('md')]: {
    padding: 0,
    ':not(:last-of-type)': {
      marginBottom: theme.spacing(6)
    }
  }
}))

const StepperCustomHorizontal = ({ onClose, formData, setFormData }) => {
  // ** States

  const [zones, setZones] = useState([
    { checked: false, value: 'NZ' },
    { checked: false, value: 'EZ' },
    { checked: false, value: 'SZ' },
    { checked: false, value: 'WZ' },
    { checked: false, value: 'TZ' }
  ])

  const [oldzone, setoldzone] = useState([
    { checked: false, value: 'NZ' },
    { checked: false, value: 'EZ' },
    { checked: false, value: 'SZ' },
    { checked: false, value: 'WZ' },
    { checked: false, value: 'TZ' }
  ])

  const [type, setType] = useState([{ checked: false, value: null, label: null }])
  const [category, setCategory] = useState([{ checked: false, value: null, label: null }])
  const [regions, setRegions] = useState([{ checked: false, value: null, label: null }])
  const [areasData, setAreasData] = useState([{ checked: false, value: null, label: null }])
  const [oldareasData, setOldAreasData] = useState([{ checked: false, value: null, label: null }])
  const [oldregions, setoldregions] = useState([{ checked: false, value: null, label: null }])
  const [allDealers, setAllDealers] = useState([{ checked: false, value: null, label: null }])

  const [checkeditems, setcheckeditems] = useState([])

  const [activeStep, setActiveStep] = useState(0)

  // ** Hooks & Var

  const { settings } = useSettings()
  const smallScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const { direction } = settings

  // Handle Stepper
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleSubmit = () => {
    onClose()
    setFormData({
      ...formData,

      applicableTo: checkeditems.filter(item => item.checked === true).map(curr => curr.value)
    })
  }
  useEffect(() => {
    console.log('category:', category)
  }, [category])
  useEffect(() => {
    console.log(type)
  }, [type])

  const getStepContent = step => {
    switch (step) {
      case 0:
        return <Zone zones={zones} setZones={setZones} />
      case 1:
        return (
          <Region
            key={step}
            zones={zones}
            regions={regions}
            oldzone={oldzone}
            setoldzone={setoldzone}
            setRegions={setRegions}
          />
        )
      case 2:
        return (
          <Area
            key={step}
            regions={regions}
            areas={areasData}
            oldregions={oldregions}
            setoldregions={setoldregions}
            setAreas={setAreasData}
          />
        )
      case 3:
        return (
          <Dealers
            key={step}
            type={type}
            setType={setType}
            category={category}
            setCategory={setCategory}
            areas={areasData}
            oldareasData={oldareasData}
            setOldAreasData={setOldAreasData}
          />
        )

      case 4:
        return (
          <AllDealers
            key={step}
            type={type}
            category={category}
            areas={areasData}
            dealers={allDealers}
            checkeditems={checkeditems}
            setDealers={setAllDealers}
            setcheckeditems={setcheckeditems}
            formData={formData}
            setFormData={setFormData}
          />
        )
      default:
        return handleSubmit()
    }
  }

  const handleNextDisable = () => {
    switch (activeStep) {
      case 0:
        return zones.some(item => item.checked === true)
      case 1:
        return regions.some(item => item.checked === true)
      case 2:
        return areasData.some(item => item.checked === true)
      case 3:
        return type.some(item => item.checked === true) && category.some(item => item.checked === true)
      case 4:
        return checkeditems.some(item => item.checked === true)
    }
  }
  const renderContent = () => {
    return (
      <form onSubmit={e => e.preventDefault()}>
        <Grid container spacing={5}>
          <Grid item xs={12}>
            {/* <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {steps[activeStep]?.title}
            </Typography>
            <Typography variant='caption' component='p'>
              {steps[activeStep]?.subtitle}
            </Typography> */}
          </Grid>
          {getStepContent(activeStep)}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant='tonal' color='secondary' disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button variant='contained' onClick={handleNext} disabled={!handleNextDisable()}>
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Grid>
        </Grid>
      </form>
    )
  }

  return (
    <Card>
      <CardContent>
        <StepperWrapper>
          <Stepper
            activeStep={activeStep}
            connector={
              !smallScreen ? <Icon icon={direction === 'ltr' ? 'tabler:chevron-right' : 'tabler:chevron-left'} /> : null
            }
          >
            {steps.map((step, index) => {
              const RenderAvatar = activeStep >= index ? CustomAvatar : Avatar

              return (
                <Step key={index}>
                  <StepLabel StepIconComponent={StepperCustomDot}>
                    <div className='step-label'>
                      <RenderAvatar
                        variant='rounded'
                        {...(activeStep >= index && { skin: 'light' })}
                        {...(activeStep === index && { skin: 'filled' })}
                        {...(activeStep >= index && { color: 'primary' })}
                        sx={{
                          ...(activeStep === index && { boxShadow: theme => theme.shadows[3] }),
                          ...(activeStep > index && { color: theme => hexToRGBA(theme.palette.primary.main, 0.4) })
                        }}
                      >
                        <Icon icon={step.icon} />
                      </RenderAvatar>
                      <div>
                        <Typography className='step-title'>{step.title}</Typography>
                        <Typography className='step-subtitle'>{step.subtitle}</Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
      </CardContent>
      <Divider sx={{ m: '0 !important' }} />
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}

export default StepperCustomHorizontal
