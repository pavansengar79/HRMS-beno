// ** React Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { Button, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useEffect, useState } from 'react'
import { Box, minWidth } from '@mui/system'
import moment from 'moment'
import exportExcel from 'src/utils/genarateExcel'

const ViewModal = ({ data }) => {
  console.log('data', data)
  const [preview, setPreview] = useState(false)
  const [data1, setData1] = useState(null)
  const [value, setValue] = useState('')
  const [legalValues, setLegalValues] = useState('')

  useEffect(() => {
    let d = data
    let customData = {}
    if (d.couponType == 'SALE') {
      customData = {
        title: d.couponDetails.title,
        description: d.couponDetails.description,
        couponCode: d?.couponCode?.join(', '),
        couponType: d.couponDetails.couponType,
        billRequired: d.couponDetails.billRequired,
        dealerAdjustment: d.couponDetails.dealerAdjustment,
        couponValue: d.couponDetails.couponValue,
        couponRequired: d.couponDetails.couponRequired,
        discount: d.couponDetails.discount,
        validEnd: d.couponDetails.validEnd,
        validStart: d.couponDetails.validStart,
        coupenApplicableOnMaxTyre: d.couponDetails.couponApplicableOnMaxTyre,
        applicableOn: d.couponDetails.applicableOn,

        allskyTypes: d.categoryCourageDetails.productSKUtypes,
        skuListName: d.categoryCourageDetails.productSKUtypes,
        coverage: d.categoryCourageDetails.coverage,
        selectedCoverage: d.categoryCourageDetails.selectedCoverage,
        allDealers: d.categoryCourageDetails.allDealers,
        subDealers: d.categoryCourageDetails.subDealers,
        userGroup: d.categoryCourageDetails.userGroup,
        customer: d.categoryCourageDetails.customerType,
        fleets: d.categoryCourageDetails.fleets,
        selectedFleets: d.categoryCourageDetails.selectedFleets,
        tyreCategory: d.categoryCourageDetails.productCategotyType,
        tyreSize: d.categoryCourageDetails.productTyreSize,
        brandSubBrand: d.categoryCourageDetails.brands,
        isWarrantyRegistrationRequired: d.categoryCourageDetails.warrantyRequired ? 'Yes' : 'No',

        couponDownloadPath: d.partnerDistributionDetails.notificationSentTo,
        format: d.partnerDistributionDetails.format,
        isRcRequired: d.partnerDistributionDetails.rcRequired ? 'Yes' : 'No',
        partner: d.partnerDistributionDetails.partner,
        variant: d.partnerDistributionDetails.variant,
        distributionType: d.partnerDistributionDetails.distributionType,
        model: d.partnerDistributionDetails.model
      }
    }
    if (d.couponType == 'SERVICE') {
      customData = {
        title: d.couponDetails.title,
        description: d.couponDetails.description,
        couponCode: d?.couponCode?.join(', '),
        couponType: d.couponDetails.couponType,
        services: d.couponDetails.services,
        billRequired: d.couponDetails.billRequired,
        dealerAdjustment: d.couponDetails.dealerAdjustment,
        couponRequired: d.couponDetails.couponRequired,
        couponValueService: d.couponDetails.couponValueService,
        coupenApplicableOnMaxTyre: d.couponDetails.couponApplicableOnMaxTyre,
        serviceCouponAmount: d.couponDetails.serviceCouponAmount,
        serviceCouponBill: d.couponDetails.serviceCouponBill,
        validEnd: d.couponDetails.validEnd,
        validStart: d.couponDetails.validStart,
        serviceCouponPercentageAmount: d.couponDetails.serviceCouponPercentageAmount,

        allskyTypes: d.categoryCourageDetails.productSKUtypes,
        skuListName: d.categoryCourageDetails.productSKUtypes,
        coverage: d.categoryCourageDetails.coverage,
        selectedCoverage: d.categoryCourageDetails.selectedCoverage,
        allDealers: d.categoryCourageDetails.allDealers,
        subDealers: d.categoryCourageDetails.subDealers,
        userGroup: d.categoryCourageDetails.userGroup,
        customer: d.categoryCourageDetails.customerType,
        fleets: d.categoryCourageDetails.fleets,
        selectedFleets: d.categoryCourageDetails.selectedFleets,
        tyreCategory: d.categoryCourageDetails.productCategotyType,
        tyreSize: d.categoryCourageDetails.productTyreSize,
        brandSubBrand: d.categoryCourageDetails.brands,
        isWarrantyRegistrationRequired: d.categoryCourageDetails.warrantyRequired ? 'Yes' : 'No',

        couponDownloadPath: d.partnerDistributionDetails.notificationSentTo,
        format: d.partnerDistributionDetails.format,
        isRcRequired: d.partnerDistributionDetails.rcRequired ? 'Yes' : 'No',
        partner: d.partnerDistributionDetails.partner,
        variant: d.partnerDistributionDetails.variant,
        distributionType: d.partnerDistributionDetails.distributionType,
        model: d.partnerDistributionDetails.model
      }
    }
    if (d.couponType == 'EXTENDED WARRANTY') {
      customData = {
        title: d.couponDetails.title,
        description: d.couponDetails.description,
        couponCode: d?.couponCode?.join(', '),
        couponRequired: d.couponDetails.couponRequired,
        billRequired: d.couponDetails.billRequired,
        monthValue: d.couponDetails.monthValue,
        couponType: d.couponDetails.couponType,
        dealerAdjustment: d.couponDetails.dealerAdjustment,
        coupenApplicableOnMaxTyre: d.couponDetails.couponApplicableOnMaxTyre,
        applicableOn: d.couponDetails.applicableOn,
        validEnd: d.couponDetails.validEnd,
        validStart: d.couponDetails.validStart,

        allskyTypes: d.categoryCourageDetails.productSKUtypes,
        skuListName: d.categoryCourageDetails.productSKUtypes,
        coverage: d.categoryCourageDetails.coverage,
        selectedCoverage: d.categoryCourageDetails.selectedCoverage,
        allDealers: d.categoryCourageDetails.allDealers,
        subDealers: d.categoryCourageDetails.subDealers,
        userGroup: d.categoryCourageDetails.userGroup,
        customer: d.categoryCourageDetails.customerType,
        fleets: d.categoryCourageDetails.fleets,
        selectedFleets: d.categoryCourageDetails.selectedFleets,
        tyreCategory: d.categoryCourageDetails.productCategotyType,
        tyreSize: d.categoryCourageDetails.productTyreSize,
        brandSubBrand: d.categoryCourageDetails.brands,
        isWarrantyRegistrationRequired: d.categoryCourageDetails.warrantyRequired ? 'Yes' : 'No',

        couponDownloadPath: d.partnerDistributionDetails.notificationSentTo,
        format: d.partnerDistributionDetails.format,
        isRcRequired: d.partnerDistributionDetails.rcRequired ? 'Yes' : 'No',
        partner: d.partnerDistributionDetails.partner,
        variant: d.partnerDistributionDetails.variant,
        distributionType: d.partnerDistributionDetails.distributionType,
        model: d.partnerDistributionDetails.model
      }
    }
    setData1(customData)
    setValue(d?.couponDetails?.terms_conditions ? d?.couponDetails?.terms_conditions : '')
    setLegalValues(d?.couponDetails?.legalPolicies ? d?.couponDetails?.legalPolicies : '')
  }, [])

  const generateExcel = data => {
    let filename = 'coupon_info'
    let d = data
    let customData = {}
    if (d.couponType == 'SALE') {
      customData = {
        title: d.couponDetails.title,
        description: d.couponDetails.description,
        couponType: d.couponDetails.couponType,
        billRequired: d.couponDetails.billRequired,
        dealerAdjustment: d.couponDetails.dealerAdjustment,
        couponValue: d.couponDetails.couponValue,
        couponRequired: d.couponDetails.couponRequired,
        discount: d.couponDetails.discount,
        validEnd: d.couponDetails.validEnd,
        validStart: d.couponDetails.validStart,
        coupenApplicableOnMaxTyre: d.couponDetails.couponApplicableOnMaxTyre,
        applicableOn: d.couponDetails.applicableOn,

        allskyTypes: d.categoryCourageDetails.productSKUtypes.join(', '),
        skuListName: d.categoryCourageDetails.productSKUtypes.join(', '),
        coverage: d.categoryCourageDetails.coverage,
        selectedCoverage: d.categoryCourageDetails.selectedCoverage?.join(', '),
        allDealers: d.categoryCourageDetails.allDealers.join(', '),
        subDealers: d.categoryCourageDetails.subDealers.join(', '),
        userGroup: d.categoryCourageDetails.userGroup.join(', '),
        customer: d.categoryCourageDetails.customerType,
        fleets: d.categoryCourageDetails.fleets,
        selectedFleets: d.categoryCourageDetails.selectedFleets.join(', '),
        tyreCategory: d.categoryCourageDetails.productCategotyType.join(', '),
        tyreSize: d.categoryCourageDetails.productTyreSize.join(', '),
        brandSubBrand: d.categoryCourageDetails.brands,
        isWarrantyRegistrationRequired: d.categoryCourageDetails.warrantyRequired ? 'Yes' : 'No',

        couponDownloadPath: d.partnerDistributionDetails.notificationSentTo,
        format: d.partnerDistributionDetails.format,
        isRcRequired: d.partnerDistributionDetails.rcRequired ? 'Yes' : 'No',
        partner: d.partnerDistributionDetails.partner.join(', '),
        variant: d.partnerDistributionDetails.variant,
        distributionType: d.partnerDistributionDetails.distributionType,
        model: d.partnerDistributionDetails.model
      }
    }
    if (d.couponType == 'SERVICE') {
      customData = {
        title: d.couponDetails.title,
        description: d.couponDetails.description,
        couponType: d.couponDetails.couponType,
        services: d.couponDetails.services,
        billRequired: d.couponDetails.billRequired,
        dealerAdjustment: d.couponDetails.dealerAdjustment,
        couponRequired: d.couponDetails.couponRequired,
        couponValueService: d.couponDetails.couponValueService,
        coupenApplicableOnMaxTyre: d.couponDetails.couponApplicableOnMaxTyre,
        serviceCouponAmount: d.couponDetails.serviceCouponAmount,
        serviceCouponBill: d.couponDetails.serviceCouponBill,
        validEnd: d.couponDetails.validEnd,
        validStart: d.couponDetails.validStart,
        serviceCouponPercentageAmount: d.couponDetails.serviceCouponPercentageAmount,

        allskyTypes: d.categoryCourageDetails.productSKUtypes.join(', '),
        skuListName: d.categoryCourageDetails.productSKUtypes.join(', '),
        coverage: d.categoryCourageDetails.coverage,
        selectedCoverage: d.categoryCourageDetails.selectedCoverage.join(', '),
        allDealers: d.categoryCourageDetails.allDealers.join(', '),
        subDealers: d.categoryCourageDetails.subDealers.join(', '),
        userGroup: d.categoryCourageDetails.userGroup.join(', '),
        customer: d.categoryCourageDetails.customerType,
        fleets: d.categoryCourageDetails.fleets,
        selectedFleets: d.categoryCourageDetails.selectedFleets.join(', '),
        tyreCategory: d.categoryCourageDetails.productCategotyType.join(', '),
        tyreSize: d.categoryCourageDetails.productTyreSize.join(', '),
        brandSubBrand: d.categoryCourageDetails.brands,
        isWarrantyRegistrationRequired: d.categoryCourageDetails.warrantyRequired ? 'Yes' : 'No',

        couponDownloadPath: d.partnerDistributionDetails.notificationSentTo,
        format: d.partnerDistributionDetails.format,
        isRcRequired: d.partnerDistributionDetails.rcRequired ? 'Yes' : 'No',
        partner: d.partnerDistributionDetails.partner.join(', '),
        variant: d.partnerDistributionDetails.variant,
        distributionType: d.partnerDistributionDetails.distributionType,
        model: d.partnerDistributionDetails.model
      }
    }
    if (d.couponType == 'EXTENDED WARRANTY') {
      customData = {
        title: d.couponDetails.title,
        description: d.couponDetails.description,
        couponRequired: d.couponDetails.couponRequired,
        billRequired: d.couponDetails.billRequired,
        monthValue: d.couponDetails.monthValue,
        couponType: d.couponDetails.couponType,
        dealerAdjustment: d.couponDetails.dealerAdjustment,
        coupenApplicableOnMaxTyre: d.couponDetails.couponApplicableOnMaxTyre,
        applicableOn: d.couponDetails.applicableOn,
        validEnd: d.couponDetails.validEnd,
        validStart: d.couponDetails.validStart,

        allskyTypes: d.categoryCourageDetails.productSKUtypes.join(', '),
        skuListName: d.categoryCourageDetails.productSKUtypes.join(', '),
        coverage: d.categoryCourageDetails.coverage,
        selectedCoverage: d.categoryCourageDetails.selectedCoverage.join(', '),
        allDealers: d.categoryCourageDetails.allDealers.join(', '),
        subDealers: d.categoryCourageDetails.subDealers.join(', '),
        userGroup: d.categoryCourageDetails.userGroup.join(', '),
        customer: d.categoryCourageDetails.customerType,
        fleets: d.categoryCourageDetails.fleets,
        selectedFleets: d.categoryCourageDetails.selectedFleets.join(', '),
        tyreCategory: d.categoryCourageDetails.productCategotyType.join(', '),
        tyreSize: d.categoryCourageDetails.productTyreSize.join(', '),
        brandSubBrand: d.categoryCourageDetails.brands,
        isWarrantyRegistrationRequired: d.categoryCourageDetails.warrantyRequired ? 'Yes' : 'No',

        couponDownloadPath: d.partnerDistributionDetails.notificationSentTo,
        format: d.partnerDistributionDetails.format,
        isRcRequired: d.partnerDistributionDetails.rcRequired ? 'Yes' : 'No',
        partner: d.partnerDistributionDetails.partner.join(', '),
        variant: d.partnerDistributionDetails.variant,
        distributionType: d.partnerDistributionDetails.distributionType,
        model: d.partnerDistributionDetails.model
      }
    }
    let arr = d?.couponCode?.map(n => {
      return { couponCode: n, ...customData }
    })
    console.log(arr)

    exportExcel(arr, filename)
  }

  return (
    <form>
      <Grid container spacing={5}>
        <Grid container xs={12} sm={12} justifyContent={'space-between'}>
          <Button variant={preview ? 'contained' : 'outlined'} onClick={() => setPreview(!preview)}>
            Coupon Preview
          </Button>
          <Button variant='contained' onClick={() => generateExcel(data)}>
            Export
          </Button>
        </Grid>
        {preview ? (
          <div>
            {/* <div className={styles.pageHeader}>
            <div>Preview Coupon Configuration</div>
          </div> */}
            <div
              style={{
                margin: '5px',
                boxShadow: '0px 1px 4px 0px',
                borderRadius: '5px',
                marginTop: '20px'
              }}
            >
              <Grid container>
                <Grid
                  item
                  md={3}
                  sm={3}
                  xs={3}
                  style={{ 'background-color': 'rgb(218, 218, 218)', 'padding-left': '10px', 'padding-top': '10px' }}
                >
                  Title
                </Grid>
                <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                  {data1?.title ?? '---'}
                </Grid>
                {data1?.couponType == 'SALE' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Description
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.description ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Number of Coupon Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponRequired ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Is Bill Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.billRequired ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Coupon Type{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponType ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Coupon Value Type
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponValue ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Discount Amount
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.discount
                        ? data1?.discount +
                          `${data1?.couponValue == 'Fixed Amount' || data1?.couponValue == 'Cashback' ? ' Rs' : ' %'}`
                        : '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Applicable On{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.applicableOn ?? '---'}
                    </Grid>
                    {data1?.applicableOn == 'Tyre Level' ? (
                      <>
                        <Grid
                          item
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            'background-color': 'rgb(218, 218, 218)',
                            'padding-left': '10px',
                            'padding-top': '10px'
                          }}
                        >
                          Max Limit
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                          {data1?.coupenApplicableOnMaxTyre ? data1?.coupenApplicableOnMaxTyre + ' Tyres' : '---'}
                        </Grid>
                      </>
                    ) : (
                      ''
                    )}
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Dealer CN Adjustment{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.dealerAdjustment ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Validity
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.validEnd && data1?.validStart
                        ? moment(data1?.validStart).format('LL') + ' - ' + moment(data1?.validEnd).format('LL')
                        : '---'}
                    </Grid>
                    <br />
                    <br />
                  </>
                ) : (
                  <></>
                )}
                {data1?.couponType == 'SERVICE' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Description
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.description ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Number of Coupon Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponRequired ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Is Bill Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.billRequired ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Coupon Type{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponType ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Coupon Value Type
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponValueService ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Services
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.services ?? '---'}
                    </Grid>
                    {data1?.couponValueService == 'Fixed Amount' ? (
                      <>
                        <Grid
                          item
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            'background-color': 'rgb(218, 218, 218)',
                            'padding-left': '10px',
                            'padding-top': '10px'
                          }}
                        >
                          Discount Amount
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                          {data1?.serviceCouponAmount + ' Rs' ?? '---'}
                        </Grid>
                      </>
                    ) : (
                      <></>
                    )}
                    {/* {data1?.couponValueService == "Bill Amount" ?
                                    <><Grid item md={3} sm={3} xs={3} style={{"background-color": "rgb(218, 218, 218)",
    "padding-left": "10px",
    "padding-top": "10px",}}>Bill Document</Grid>
                                    <Grid item md={9} sm={9} xs={9} style={{"color": "black",
    "padding-left": "10px",
    "padding-top": "10px",}}>{data1?.serviceCouponBill ? data1?.serviceCouponBill.substr(12) : "---"}</Grid>
                                    </> : <></>
                                } */}
                    {data1?.couponValueService == 'Percentage' ? (
                      <>
                        <Grid
                          item
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            'background-color': 'rgb(218, 218, 218)',
                            'padding-left': '10px',
                            'padding-top': '10px'
                          }}
                        >
                          Discount Amount
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                          {data1?.serviceCouponPercentageAmount + ' %' ?? '---'}
                        </Grid>
                      </>
                    ) : (
                      <></>
                    )}
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Dealer CN Adjustment{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.dealerAdjustment ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Validity
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.validEnd && data1?.validStart
                        ? moment(data1?.validStart).format('LL') + ' - ' + moment(data1?.validEnd).format('LL')
                        : '---'}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data1?.couponType == 'EXTENDED WARRANTY' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Description
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.description ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Number of Coupon Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponRequired ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Is Bill Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.billRequired ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Coupon Type{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponType ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Month Value{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.monthValue ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Applicable On{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.applicableOn ?? '---'}
                    </Grid>
                    {data1?.applicableOn == 'Tyre Level' ? (
                      <>
                        <Grid
                          item
                          md={3}
                          sm={3}
                          xs={3}
                          style={{
                            'background-color': 'rgb(218, 218, 218)',
                            'padding-left': '10px',
                            'padding-top': '10px'
                          }}
                        >
                          Max Limit
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                          {data1?.coupenApplicableOnMaxTyre ? data1?.coupenApplicableOnMaxTyre + ' Tyres' : '---'}
                        </Grid>
                      </>
                    ) : (
                      ''
                    )}
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Dealer CN Adjustment{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.dealerAdjustment ?? '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Validity
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.validEnd && data1?.validStart
                        ? moment(data1?.validStart).format('LL') + ' - ' + moment(data1?.validEnd).format('LL')
                        : '---'}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data1?.tyreCategory?.length > 0 ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Tyre Categories
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.tyreCategory != '' ? (
                        <>
                          {data1?.tyreCategory?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data1?.tyreCategory?.length > 3 ? (
                            <Tooltip title={data1?.tyreCategory?.join(', ')}>
                              <span>...{data1?.tyreCategory?.length - 3} more</span>
                            </Tooltip>
                          ) : (
                            ''
                          )}
                        </>
                      ) : (
                        '---'
                      )}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {/* <Grid item md={3} sm={3} xs={3} style={{"background-color": "rgb(218, 218, 218)",
    "padding-left": "10px",
    "padding-top": "10px",}}>Brands</Grid>
                        <Grid item md={9} sm={9} xs={9} style={{"color": "black",
    "padding-left": "10px",
    "padding-top": "10px",}}>{data1?.brandSubBrand != "" ? data1?.brandSubBrand : "---"}</Grid> */}
                {data1?.tyreSize?.length > 0 ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Tyre Sizes
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.tyreSize != '' ? (
                        <>
                          {' '}
                          {data1?.tyreSize?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data1?.tyreSize?.length > 3 ? (
                            <Tooltip title={data1?.tyreSize?.join(', ')}>
                              <span>...{data1?.tyreSize?.length - 3} more</span>
                            </Tooltip>
                          ) : (
                            ''
                          )}
                        </>
                      ) : (
                        '---'
                      )}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data1?.skuListName?.length > 0 ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      SKUs
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.skuListName != '' ? (
                        <>
                          {data1?.skuListName?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data1?.skuListName?.length > 3 ? (
                            <Tooltip title={data1?.skuListName?.join(', ')}>
                              <span>...{data1?.skuListName?.length - 3} more</span>
                            </Tooltip>
                          ) : (
                            ''
                          )}
                        </>
                      ) : (
                        '---'
                      )}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                <Grid
                  item
                  md={3}
                  sm={3}
                  xs={3}
                  style={{ 'background-color': 'rgb(218, 218, 218)', 'padding-left': '10px', 'padding-top': '10px' }}
                >
                  Warranty Creation
                </Grid>
                <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                  {data1?.isWarrantyRegistrationRequired != '' ? data1?.isWarrantyRegistrationRequired : '---'}
                </Grid>
                <Grid
                  item
                  md={3}
                  sm={3}
                  xs={3}
                  style={{ 'background-color': 'rgb(218, 218, 218)', 'padding-left': '10px', 'padding-top': '10px' }}
                >
                  Applicable Area{' '}
                </Grid>
                <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                  {data1?.coverage != '' ? data1?.coverage : '---'}
                </Grid>
                {data1?.coverage != '' && data1?.coverage != 'AllOverIndia' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Applicable Coverage{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.selectedCoverage != '' ? (
                        <>
                          {data1?.selectedCoverage?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data1?.selectedCoverage?.length > 3 ? (
                            <Tooltip title={data1?.selectedCoverage?.join(', ')}>
                              <span>...{data1?.selectedCoverage?.length - 3} more</span>
                            </Tooltip>
                          ) : (
                            ''
                          )}
                        </>
                      ) : (
                        '---'
                      )}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data1?.customer != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      For Customers
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.customer != '' ? data1?.customer : '---'}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data1?.customer == 'dealers' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Dealers{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.allDealers != '' ? data1?.allDealers.join(', ') : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data1?.customer == 'fleets' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      For Managed Partners{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.fleets != '' ? data1?.fleets : '---'}
                    </Grid>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      All Selected Fleets{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.selectedFleets != '' ? (
                        <>
                          {data1?.selectedFleets?.slice(0, 3)?.join(',  ')}
                          <Tooltip title={data1?.selectedFleets?.join(', ')}>
                            <span>...{data1?.selectedFleets?.length - 3} more</span>
                          </Tooltip>
                        </>
                      ) : (
                        '---'
                      )}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                <br />
                <br />
                {data1?.partner != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      For Managed Partners{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.partner.length != 0 ? (
                        <>
                          {data1?.partner?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data1?.partner?.length > 3 ? (
                            <Tooltip title={data1?.partner?.join(', ')}>
                              <span>...{data1?.partner?.length - 3} more</span>
                            </Tooltip>
                          ) : (
                            ''
                          )}
                        </>
                      ) : (
                        '---'
                      )}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data1?.model != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Model{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.model != '' ? data1?.model : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data1?.variant != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Variant
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.variant != '' ? data1?.variant : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data1?.isRcRequired != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      RC Required{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.isRcRequired != '' ? data1?.isRcRequired : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data1?.distributionType != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Distribution Channel
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.distributionType != '' ? data1?.distributionType : '---'} -{' '}
                      {data1?.format != '' ? data1?.format : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                <br />
                <br />
                {data1?.couponDownloadPath != '' ? (
                  <>
                    <Grid
                      item
                      md={3}
                      sm={3}
                      xs={3}
                      style={{
                        'background-color': 'rgb(218, 218, 218)',
                        'padding-left': '10px',
                        'padding-top': '10px'
                      }}
                    >
                      Ready Notification to be sent at
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} style={{ 'padding-left': '10px', 'padding-top': '10px' }}>
                      {data1?.couponDownloadPath != '' ? data1?.couponDownloadPath : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                <div style={{ 'padding-left': '10px' }} dangerouslySetInnerHTML={{ __html: value }}></div>
                <div style={{ 'padding-left': '10px' }} dangerouslySetInnerHTML={{ __html: legalValues }}></div>
              </Grid>
            </div>
          </div>
        ) : (
          <Grid item xs={12} sm={12}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell>SR NO.</TableCell>
                    <TableCell>Coupon Code</TableCell>
                    <TableCell>Copy Code</TableCell>
                  </TableRow>
                </TableHead>
                {data?.couponCode?.map((item, i) => (
                  <TableBody key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{item}</TableCell>
                    <TableCell>
                      <Tooltip title='Copy'>
                        <IconButton
                          size='small'
                          sx={{ color: 'text.secondary' }}
                          onClick={() => {
                            navigator.clipboard.writeText(item)
                          }}
                        >
                          <Icon icon='tabler:copy' fontSize={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableBody>
                ))}
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </form>
  )
}

export default ViewModal
