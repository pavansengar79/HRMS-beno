// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Button, Card, CardContent, CardHeader, Divider, Grid } from '@mui/material'
import BasicDetails from './basicDetails'
import DefineEligibility from './defineEligibility'
// import DefineEligibility from './defineEligibility2'
import DefineTarget from './defineTargets'
import { useDispatch } from 'react-redux'
import { addTSO, createScheme } from 'src/store/apps/TSO/simulator'
import { useRouter } from 'next/router'

const AccordionControlled = () => {
  // ** State
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const [detailsData, setDetailsData] = useState()
  const [eligibilityData, setEligibilityData] = useState()
  const [targetData, setTargetData] = useState()
  const [groupList, setGroupList] = useState([])
  const [brand, setBrand] = useState()
  const [oldCodeMapping, setOldCodeMapping] = useState([])
  const [productRunOn, setProductRunOn] = useState(false)

  const dispatch = useDispatch()

  const handleSubmit = async () => {
    try {
      if (detailsData.schemeConfig === 'Early Bird' || detailsData.schemeConfig === 'Volume Discount') {
        await dispatch(
          addTSO({
            basicData: detailsData,
            schemeEligibility: eligibilityData,
            simulatorObj: targetData,
            secondScheme: false
          })
        ).unwrap()
      } else {
        if (detailsData.schemeType === 'BOI') {
          await dispatch(
            createScheme({
              basicData: detailsData,
              schemeEligibility: eligibilityData,
              eligibilityDataBOI: targetData.eligibilityDataBOI,
              secondScheme: false
            })
          ).unwrap()
        } else {
          await dispatch(
            createScheme({
              basicData: detailsData,
              schemeEligibility: eligibilityData,
              eligibilityData: targetData.eligibilityDataBOI,
              secondScheme: false
            })
          ).unwrap()
        }
      }
      router.back()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Typography variant='h5'>Create Scheme</Typography>

      <Grid container columnSpacing={4} rowSpacing={2}>
        <Grid item xs={12} sm={12}>
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary
              id='controlled-panel-header-1'
              aria-controls='controlled-panel-content-1'
              expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
            >
              <Typography>1. Enter Basic Details (Like: scheme type, objective, scheme duration …)</Typography>
            </AccordionSummary>
            <Divider sx={{ m: '0 !important' }} />

            <AccordionDetails>
              <BasicDetails setDetailsData={setDetailsData} setExpanded={setExpanded} />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
            <AccordionSummary
              id='controlled-panel-header-2'
              aria-controls='controlled-panel-content-2'
              expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
            >
              <Typography>
                2. Define Eligibility (What is covered under this scheme, ex: products, region, customers …)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DefineEligibility
                setEligibilityData={setEligibilityData}
                setExpanded={setExpanded}
                setGroupList={setGroupList}
                setBrand={setBrand}
                brand={brand}
                schemeConfig={detailsData?.schemeConfig}
                setOldCodeMapping={setOldCodeMapping}
                setProductRunOn={setProductRunOn}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
            <AccordionSummary
              id='controlled-panel-header-3'
              aria-controls='controlled-panel-content-3'
              expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
            >
              <Typography>3. Define Targets (Sale targets and rewards)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DefineTarget
                setTargetData={setTargetData}
                schemeConfig={detailsData?.schemeConfig}
                setExpanded={setExpanded}
                eligibilityData={eligibilityData}
                groupList={groupList}
                oldCodeMapping={oldCodeMapping}
                productRunOn={productRunOn}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
        {detailsData?.schemeConfig === 'Early Bird' || detailsData?.schemeConfig === 'Volume Discount' ? (
          <Grid item xs={12} sm={12}>
            <Button variant='contained' onClick={handleSubmit}>
              Run Simulator
            </Button>
          </Grid>
        ) : (
          <Grid item xs={12} sm={12}>
            <Button variant='contained' onClick={handleSubmit}>
              Submit Scheme
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  )
}

export default AccordionControlled
