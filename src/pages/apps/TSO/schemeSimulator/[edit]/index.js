// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Divider, Grid } from '@mui/material'
import BasicDetails from './basicDetails'
// import DefineEligibility from './defineEligibility'
import DefineEligibility from './defineEligibility4'
// import DefineEligibility from './defineEligibility3'
import DefineTarget from './defineTargets'
import DefineTarget2 from './defineTargets2'
import { useDispatch, useSelector } from 'react-redux'
import { addTSO, fetchSchemeParameter } from 'src/store/apps/TSO/simulator'
import { useRouter } from 'next/router'
import axiosRequest from 'src/utils/AxiosInterceptor'

const AccordionControlled = () => {
  // ** State
  const [expanded, setExpanded] = useState(false)
  const [detailsData, setDetailsData] = useState()
  const [eligibilityData, setEligibilityData] = useState()
  const [simulatorData, setSimulatorData] = useState()
  const [allData, setAllData] = useState([])
  const [slabInputs, setSlabInputs] = useState([])
  const [approvalData, setApprovalData] = useState()
  const [groupList, setGroupList] = useState([])
  const [brand, setBrand] = useState()

  const [targetData, setTargetData] = useState()

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const router = useRouter()

  const edit = router.query.edit

  useEffect(() => {
    if (edit) {
      const getData = async () => {
        const response = await axiosRequest({
          url: `/api/admindash/vistex/scheme?id=${edit}`,
          method: 'GET'
        })
        console.log('res', response)
        setDetailsData(response?.data?.schemeObj?.basicData)
        setEligibilityData(response?.data?.schemeObj?.schemeEligibility)
        setSimulatorData(response?.data)
        let simulatorObj = response?.data?.simulatorObj
        // let simulatorObj = {
        //   slab_inputs: [
        //     {
        //       failure_end: '12',
        //       failure_start: '21',
        //       failure_step: '12',
        //       slab_end: '12',
        //       slab_start: '12',
        //       slab_step: '12',
        //       success_end: '12',
        //       success_start: '12',
        //       success_step: '12',
        //       target_end: '12',
        //       target_start: '12',
        //       target_step: '12'
        //     },
        //     {
        //       failure_end: '21',
        //       failure_start: '21',
        //       failure_step: '21',
        //       slab_end: '21',
        //       slab_start: '21',
        //       slab_step: '21',
        //       success_end: '21',
        //       success_start: '21',
        //       success_step: '21',
        //       target_end: '21',
        //       target_start: '21',
        //       target_step: '21'
        //     }
        //   ],
        //   objective: 'dsa',
        //   reward_type: 'dsd',
        //   region_customization: 'false',
        //   min_payout: '12',
        //   min_bin_width: '12',
        //   max_payout: '12',
        //   payout_increment: '12',
        //   min_slab_start: '12',
        //   max_bin_width: '12'
        // }

        const response2 = await axiosRequest({
          url: `/api/admindash/vistex/scheme-parameter?module=${response?.data?.schemeObj?.schemeConfig}`,
          method: 'GET'
        })

        const filteredDataArray = response2?.data
          .filter(item => simulatorObj?.hasOwnProperty(item.fieldName))
          .map(item => {
            return {
              ...item,
              field_value: simulatorObj[item?.fieldName]
            }
          })
        console.log('filtered', filteredDataArray)
        setAllData(filteredDataArray)
        if (simulatorObj?.slab_inputs) {
          setSlabInputs(simulatorObj?.slab_inputs)
        }
      }
      getData()
    }
  }, [edit])

  const dispatch = useDispatch()

  const handleSubmit = () => {
    console.log('submit1', detailsData)
    console.log('submit2', eligibilityData)
    console.log('submit3', simulatorData)
    console.log('approval', approvalData)
    // dispatch(addTSO({ basicData: detailsData, schemeEligibility: eligibilityData, eligibilityData: approvalData }))
  }

  return edit ? (
    <div>
      <Typography variant='h5'>Edit Scheme</Typography>

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
              <BasicDetails setDetailsData={setDetailsData} setExpanded={setExpanded} detailsData={detailsData} />
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
              {/* <DefineEligibility eligibilityData={setEligibilityData} setExpanded={setExpanded} /> */}
              <DefineEligibility
                setEligibilityData={setEligibilityData}
                setExpanded={setExpanded}
                setGroupList={setGroupList}
                setBrand={setBrand}
                brand={brand}
                eligibilityData={eligibilityData}
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
              <Typography>3.1 Simulator Recommendations (Review Schemes, Send for Approval)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DefineTarget
                simulatorData={simulatorData}
                allData={allData}
                setApprovalData={setApprovalData}
                detailsData={detailsData}
                eligibilityData={eligibilityData}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
        {/* <Grid item xs={12} sm={12}>
          <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
            <AccordionSummary
              id='controlled-panel-header-3'
              aria-controls='controlled-panel-content-3'
              expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
            >
              <Typography>3.2 Configure Scheme Simulator (Define Slabs and rewards)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DefineTarget2 allData={allData} slabInputs={slabInputs} />
            </AccordionDetails>
          </Accordion>
        </Grid> */}
        {/* <Grid item xs={12} sm={12}>
          <Button variant='contained' onClick={handleSubmit}>
            Submit Scheme
          </Button>
        </Grid> */}
      </Grid>
    </div>
  ) : (
    <CircularProgress sx={{ position: 'relative', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
  )
}

export default AccordionControlled
