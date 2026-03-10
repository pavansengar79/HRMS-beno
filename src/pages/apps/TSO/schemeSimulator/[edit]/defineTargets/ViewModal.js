// ** React Imports

// ** MUI Imports
import { Box, Button, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { createScheme } from 'src/store/apps/TSO/simulator'

// ** Custom Component Import

const ViewModal = ({ data, detailsData, eligibilityData, onClose }) => {
  // ** States
  const dispatch = useDispatch()
  const state = useSelector(state => state.TSOSimulator)
  const router = useRouter()
  function createEligibilityData(schemeDescription) {
    const rewardType = '%'
    const slabs = schemeDescription.split('|').map(slab => {
      const [rewardAmountPart, salesRangePart] = slab.trim().split(' payout ')
      const rewardAmout = parseFloat(rewardAmountPart)
      let minSales = 0,
        maxSales = ''

      if (salesRangePart) {
        const salesRange = salesRangePart.split(' ')[1]
        if (salesRange.includes('-')) {
          ;[minSales, maxSales] = salesRange.split('-').map(Number)
        } else if (salesRangePart.includes('atleast')) {
          console.log('sales1', salesRange)
          minSales = parseInt(salesRangePart.split('atleast')[1], 10)
        }
      }

      return {
        rewardAmout,
        minSales,
        maxSales
      }
    })
    const slabsRequired = slabs.length
    const group = eligibilityData?.productSubCategory

    return {
      rewardType,
      slabsRequired,
      slab: slabs,
      group: group
    }
  }

  console.log('elidata', eligibilityData)
  const handleSubmit = () => {
    // const payload = data['Scheme Description'].map(item => {
    //   return {
    //     group: eligibilityData?.productSubCategory,
    //     slabRequired: data['Scheme Description'].length,
    //     rewardType: '%',
    //   }
    // })
    const description = createEligibilityData(data['Scheme Description'])
    const payload = { basicData: detailsData, schemeEligibility: eligibilityData, eligibilityData: [description] }
    dispatch(createScheme(payload))
    onClose(false)
    router.back()
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 5 }}>
      <Box
        style={{
          boxShadow: '0px 1px 4px 0px',
          borderRadius: '5px',
          width: '800px'
        }}
      >
        <Grid container>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Type
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {detailsData?.schemeType || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Configuration
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {detailsData?.schemeConfig || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Description
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {detailsData?.description || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Product
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {detailsData?.schemeProduct?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Start Date
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {moment.utc(detailsData?.schemeStartDate).format('YYYY/MM/DD') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme End Date
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {moment.utc(detailsData?.schemeEndDate).format('YYYY/MM/DD') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Company
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.company?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Channel
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.channel?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Coverage
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.coverage || '---'}
          </Grid>
          {eligibilityData?.coverage === 'Pan India' ? (
            <>
              <Grid
                item
                md={3}
                sm={3}
                xs={3}
                style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
              >
                Excluded Regions
              </Grid>
              <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
                {eligibilityData?.excludedRegions?.join(', ') || '---'}
              </Grid>
            </>
          ) : (
            <>
              <Grid
                item
                md={3}
                sm={3}
                xs={3}
                style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
              >
                Selected Coverage
              </Grid>
              <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
                {eligibilityData?.selectedCoverage?.join(', ') || '---'}
              </Grid>
            </>
          )}
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Product Category
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.productCategory || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Product Sub Category
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.productSubCategory?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Schemes to be run on
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.productRunOn || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Excluded SKUs
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.excludeSku?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Customer Group
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.customerGroup?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Selected Customer Class
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.customerType?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Exclude Customer Class
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.excludedCustomerClass?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Exclude Class
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {eligibilityData?.excludedCustomers?.join(', ') || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Dealer Type
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {data['Dealer Type'] || '---'}
          </Grid>

          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Taxable Value
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {(data['Taxable Value'] / 1).toFixed(2) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Estimated Taxable Value
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {(data['Estimated Taxable Value'] / 1).toFixed(2) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            NDP Value
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {(data['NDP Value'] / 1).toFixed(2) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Invoice Value
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {(data['Invoice Value'] / 1).toFixed(2) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Estimated Payout
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {(data['Estimated Payout'] / 1).toFixed(2) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Payout (%)
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {((data['Payout (%)'] / 1) * 100).toFixed(4) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Sales Uplift
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {data['Sales Uplift'] || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Sales Uplift (%)
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {data['Sales Uplift (%)'] * 100 || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Historical Payout
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {(data['Historical Payout'] / 1).toFixed(2) || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Type
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {data['Type'] || '---'}
          </Grid>
          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Scheme Description
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {data['Scheme Description']?.split('|')?.map((item, index) => <div key={index}>{item.trim()}</div>) ||
              '---'}
          </Grid>

          <Grid
            item
            md={3}
            sm={3}
            xs={3}
            style={{ backgroundColor: 'rgb(218, 218, 218)', padding: '10px', paddingLeft: '5px' }}
          >
            Rank
          </Grid>
          <Grid item md={9} sm={9} xs={9} style={{ paddingLeft: '10px', paddingTop: '10px' }}>
            {data['Rank'] || '---'}
          </Grid>
        </Grid>
      </Box>
      <Button variant='contained' onClick={handleSubmit}>
        Submit Scheme
      </Button>
    </Box>
  )
}

export default ViewModal
