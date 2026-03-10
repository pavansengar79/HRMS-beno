import { Box, Button, Grid, Modal, Tooltip, Typography } from '@mui/material'
import dynamic from 'next/dynamic'

const DynamicReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import styles from '../../../pages/apps/coupon/add/coupon.module.css'
import toast from 'react-hot-toast'
import axios from 'axios'
import { backendUrl } from 'src/utils/helper'
import { useRouter } from 'next/router'
import moment from 'moment'
import { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  height: '80%',
  overflowY: 'scroll',
  boxShadow: 24,
  p: 4
}
const CustomeCouponPreview = ({ open, setOpen, data, type }) => {
  const [value, setValue] = useState('')
  const [legalValues, setLegalValues] = useState('')

  const router = useRouter()
  const handleClose = () => setOpen(false)
  const submitData = data => {
    data.terms_conditions = value
    data.legalPolicies = legalValues
    // toast.success("Coupon Created Successfully.")
    // axios.post(`/api/admindash/coupon/create`,)
    const token = localStorage.getItem('accessToken')
    if (type == 'add') {
      axios
        .post(
          `${backendUrl}/coupon/create`,
          { data },
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        )
        .then(response => {
          // alert("data", response)
          console.log(response?.data)
          //   toastMessage(response?.data?.message, 'success')
          toast.success(response?.data?.message, { duration: 2000 })
          router.push('/apps/coupon')

          // setTyreSize(response?.data?.data);
        })
        .catch(err => {
          // toastMessage("Some Error","error")
          console.log(err)
        })
    }
    if (type == 'update') {
      axios
        .post(
          `${backendUrl}/coupon/update`,
          { data },
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        )
        .then(response => {
          // alert("data", response)
          // console.log(response?.data);
          //   toastMessage(response?.data?.message, 'success')
          toast.success(response?.data?.message, { duration: 2000 })

          router.push('/apps/coupon')
          // setTyreSize(response?.data?.data);
        })
        .catch(err => {
          // toastMessage("Some Error","error")
          console.log(err)
        })
    }
  }
  const handleChange = content => {
    console.log(content)
    setValue(content)
  }
  const handleChangeLegal = content => {
    console.log(content)
    setLegalValues(content)
  }
  useEffect(() => {
    setValue(`
  <div>
    <h2>
      Terms and Conditions for ${data?.title}
    </h2>
  </div>
<ul>
<li>
  <div>
    <strong>Eligibility : </strong>
    ${
      data?.partner != ''
        ? `This offer is available exclusively to ${data?.partner} customers residing in ${
            data?.coverage != '' && data?.coverage != 'AllOverIndia'
              ? data?.coverage + ' like (' + data?.selectedCoverage.join(', ') + ')' + ' in'
              : ''
          } India.`
        : `This offer is available to customers residing in ${
            data?.coverage != '' && data?.coverage != 'AllOverIndia'
              ? data?.coverage + ' like (' + data?.selectedCoverage.join(', ') + ')' + ' in'
              : ''
          } India.`
    }
    By participating in this promotion, customers agree to these terms and conditions.
  </div>
</li>

<li>
  <div>
    <strong>Coupon Type : </strong>
    This coupon is valid for a Product (Tyre) ${
      data?.couponType
    } only. It cannot be applied to any other products or services.
  </div>
</li>

${
  data?.couponType == 'SALE'
    ? `<li>
      <div>
        <strong>Discount Value : </strong>
        Each coupon offers a ${
          data?.couponValue == 'Percentage'
            ? `${data?.discount} Percentage off on`
            : `${data?.couponValue} discount of INR ${data?.discount} off`
        } the regular price of eligible tyre products.
      </div>
    </li>`
    : ''
}

${
  data?.couponType == 'SERVICE' && data?.couponValueService == 'Fixed Amount'
    ? `<li>
      <div>
        <strong>Discount Value : </strong>
        Each coupon offers a Fixed Amount discount of INR ${data?.serviceCouponAmount} off the regular price of eligible tyre products.
      </div>
    </li>`
    : ''
}

${
  data?.couponType == 'SERVICE' && data?.couponValueService == 'Percentage'
    ? `<li>
      <div>
        <strong>Discount Value : </strong>
        Each coupon offers a ${data?.serviceCouponPercentageAmount} Percentage off on the regular price of eligible tyre products.
      </div>
    </li>`
    : ''
}

<li>
  <div>
    <strong>Usage : </strong>
    The coupon can be redeemed only once per customer. It cannot be combined with any other offer, discount, or promotion.
  </div>
</li>

<li>
  <div>
    <strong>Redemption Process : </strong>
    To redeem the offer, customers must present the coupon at the time of purchase. The discount will be applied to the total purchase price of eligible products.
  </div>
</li>

<li>
  <div>
    <strong>Returns/Exchanges : </strong>
    Any products purchased using the coupon are subject to the standard return and exchange policy. If a product is returned, only the actual amount paid will be refunded, not the original value of the coupon.
  </div>
</li>

<li>
  <div>
    <strong>Limitations : </strong>
    The coupon is not transferable, has no cash value, and cannot be sold. It is void where prohibited by law.
  </div>
</li>

<li>
  <div>
    <strong>Changes to Terms and Conditions : </strong>
    The promoter reserves the right to change these terms and conditions without prior notice. Any modifications will be effective immediately upon posting the revised terms.
  </div>
</li>

<li>
  <div>
    <strong>Customer Support : </strong>
    For any questions or assistance regarding the coupon or the promotion, customers can contact our support team.
  </div>
</li>
</ul>
    `)
    setLegalValues(`
  <div>
    <h2>
      Legal Policies for ${data?.title}
    </h2>
  </div>
<ul>
<li>
  <div>
    <strong>Eligibility : </strong>
    ${
      data?.partner != ''
        ? `This offer is available exclusively to ${data?.partner} customers residing in ${
            data?.coverage != '' && data?.coverage != 'AllOverIndia'
              ? data?.coverage + ' like (' + data?.selectedCoverage.join(', ') + ')' + ' in'
              : ''
          } India.`
        : `This offer is available to customers residing in ${
            data?.coverage != '' && data?.coverage != 'AllOverIndia'
              ? data?.coverage + ' like (' + data?.selectedCoverage.join(', ') + ')' + ' in'
              : ''
          } India.`
    }
    By participating in this promotion, customers agree to these terms and conditions.
  </div>
</li>

<li>
  <div>
    <strong>Coupon Type : </strong>
    This coupon is valid for a Product (Tyre) ${
      data?.couponType
    } only. It cannot be applied to any other products or services.
  </div>
</li>

${
  data?.couponType == 'SALE'
    ? `<li>
      <div>
        <strong>Discount Value : </strong>
        Each coupon offers a ${
          data?.couponValue == 'Percentage'
            ? `${data?.discount} Percentage off on`
            : `${data?.couponValue} discount of INR ${data?.discount} off`
        } the regular price of eligible tyre products.
      </div>
    </li>`
    : ''
}

${
  data?.couponType == 'SERVICE' && data?.couponValueService == 'Fixed Amount'
    ? `<li>
      <div>
        <strong>Discount Value : </strong>
        Each coupon offers a Fixed Amount discount of INR ${data?.serviceCouponAmount} off the regular price of eligible tyre products.
      </div>
    </li>`
    : ''
}

${
  data?.couponType == 'SERVICE' && data?.couponValueService == 'Percentage'
    ? `<li>
      <div>
        <strong>Discount Value : </strong>
        Each coupon offers a ${data?.serviceCouponPercentageAmount} Percentage off on the regular price of eligible tyre products.
      </div>
    </li>`
    : ''
}

<li>
  <div>
    <strong>Usage : </strong>
    The coupon can be redeemed only once per customer. It cannot be combined with any other offer, discount, or promotion.
  </div>
</li>

<li>
  <div>
    <strong>Redemption Process : </strong>
    To redeem the offer, customers must present the coupon at the time of purchase. The discount will be applied to the total purchase price of eligible products.
  </div>
</li>

<li>
  <div>
    <strong>Returns/Exchanges : </strong>
    Any products purchased using the coupon are subject to the standard return and exchange policy. If a product is returned, only the actual amount paid will be refunded, not the original value of the coupon.
  </div>
</li>

<li>
  <div>
    <strong>Limitations : </strong>
    The coupon is not transferable, has no cash value, and cannot be sold. It is void where prohibited by law.
  </div>
</li>

<li>
  <div>
    <strong>Changes to Terms and Conditions : </strong>
    The promoter reserves the right to change these terms and conditions without prior notice. Any modifications will be effective immediately upon posting the revised terms.
  </div>
</li>

<li>
  <div>
    <strong>Customer Support : </strong>
    For any questions or assistance regarding the coupon or the promotion, customers can contact our support team.
  </div>
</li>
</ul>
    `)
  }, [])
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius:'10px'
              }}
            >
                <Typography variant='h4' >Preview Coupon Configuration</Typography>
              <div>
                {type == 'add' ? (
                //   <Button variant='outlined' sx={{ m: 1 }} onClick={handleClose}>
                //     Edit
                //   </Button>
                ""
                ) : (
                  ''
                )}
                {type == 'add' ? (
                  <Button variant='contained' sx={{ m: 1 }} onClick={() => submitData(data)}>
                    Generate Coupon
                  </Button>
                ) : (
                  ''
                )}
                {type == 'update' ? (
                  <Button variant='contained' sx={{ m: 1 }} onClick={() => submitData(data)}>
                    Update Coupon
                  </Button>
                ) : (
                  ''
                )}
                <CloseIcon
                  style={{
                    fontSize: '36px',
                    color: 'darkgray',
                    cursor: 'pointer'
                  }}
                  onClick={handleClose}
                />
              </div>
            </div>
            <hr />
            <div
              style={{
                margin: '5px',
                boxShadow: '0px 1px 4px 0px',
                borderRadius: '5px'
              }}
            >
              <Grid container>
                <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                  Title
                </Grid>
                <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                  {data?.title ?? '---'}
                </Grid>
                {data?.couponType == 'SALE' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Description
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.description ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Is Bill Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.billRequired ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Number of Coupon Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponRequired ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Coupon Type{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponType ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Coupon Value Type
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponValue ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Discount Amount
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.discount
                        ? data?.discount +
                          `${data?.couponValue == 'Fixed Amount' || data?.couponValue == 'Cashback' ? ' Rs' : ' %'}`
                        : '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Applicable On{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.applicableOn ?? '---'}
                    </Grid>
                    {data?.applicableOn == 'Tyre Level' ? (
                      <>
                        <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                          Max Limit
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                          {data?.coupenApplicableOnMaxTyre ? data?.coupenApplicableOnMaxTyre + ' Tyres' : '---'}
                        </Grid>
                      </>
                    ) : (
                      ''
                    )}
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Dealer CN Adjustment{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.dealerAdjustment ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Validity
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.validEnd && data?.validStart
                        ? moment(data?.validStart).format('LL') + ' - ' + moment(data?.validEnd).format('LL')
                        : '---'}
                    </Grid>
                    <br />
                    <br />
                  </>
                ) : (
                  <></>
                )}
                {data?.couponType == 'SERVICE' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Description
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.description ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Number of Coupon Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponRequired ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Is Bill Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.billRequired ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Coupon Type{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponType ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Coupon Value Type
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponValueService ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Services
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.services ?? '---'}
                    </Grid>
                    {data?.couponValueService == 'Fixed Amount' ? (
                      <>
                        <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                          Discount Amount
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                          {data?.serviceCouponAmount + ' Rs' ?? '---'}
                        </Grid>
                      </>
                    ) : (
                      <></>
                    )}
                    {/* {data?.couponValueService == "Bill Amount" ?
                                        <><Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>Bill Document</Grid>
                                        <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>{data?.serviceCouponBill ? data?.serviceCouponBill.substr(12) : "---"}</Grid>
                                        </> : <></>
                                    } */}
                    {data?.couponValueService == 'Percentage' ? (
                      <>
                        <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                          Discount Amount
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                          {data?.serviceCouponPercentageAmount + ' %' ?? '---'}
                        </Grid>
                      </>
                    ) : (
                      <></>
                    )}
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Dealer CN Adjustment{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.dealerAdjustment ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Validity
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.validEnd && data?.validStart
                        ? moment(data?.validStart).format('LL') + ' - ' + moment(data?.validEnd).format('LL')
                        : '---'}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data?.couponType == 'EXTENDED WARRANTY' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Description
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.description ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Number of Coupon Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponRequired ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Is Bill Required
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.billRequired ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Coupon Type{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponType ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Month Value{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.monthValue ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Applicable On{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.applicableOn ?? '---'}
                    </Grid>
                    {data?.applicableOn == 'Tyre Level' ? (
                      <>
                        <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                          Max Limit
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                          {data?.coupenApplicableOnMaxTyre ? data?.coupenApplicableOnMaxTyre + ' Tyres' : '---'}
                        </Grid>
                      </>
                    ) : (
                      ''
                    )}
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Dealer CN Adjustment{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.dealerAdjustment ?? '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Validity
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.validEnd && data?.validStart
                        ? moment(data?.validStart).format('LL') + ' - ' + moment(data?.validEnd).format('LL')
                        : '---'}
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
                {data?.tyreCategory != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Tyre Categories
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.tyreCategory != '' ? (
                        <>
                          {data?.tyreCategory?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data?.tyreCategory?.length > 3 ? (
                            <Tooltip title={data?.tyreCategory?.join(', ')}>
                              <span>...{data?.tyreCategory?.length - 3} more</span>
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
                {/* <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>Brands</Grid>
                            <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>{data?.brandSubBrand != "" ? data?.brandSubBrand : "---"}</Grid> */}
                {data?.tyreSize != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Tyre Sizes
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.tyreSize != '' ? (
                        <>
                          {' '}
                          {data?.tyreSize?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data?.tyreSize?.length > 3 ? (
                            <Tooltip title={data?.tyreSize?.join(', ')}>
                              <span>...{data?.tyreSize?.length - 3} more</span>
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
                {data?.skuListName != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      SKUs
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.skuListName != '' ? (
                        <>
                          {data?.skuListName?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data?.skuListName?.length > 3 ? (
                            <Tooltip title={data?.skuListName?.join(', ')}>
                              <span>...{data?.skuListName?.length - 3} more</span>
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
                {data?.isWarrantyRegistrationRequired != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Warranty Creation
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.isWarrantyRegistrationRequired != '' ? data?.isWarrantyRegistrationRequired : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data?.coverage != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Applicable Area{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.coverage != '' ? data?.coverage : '---'}
                    </Grid>
                    {data?.coverage != '' && data?.coverage != 'AllOverIndia' ? (
                      <>
                        <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                          Applicable Coverage{' '}
                        </Grid>
                        <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                          {data?.selectedCoverage != '' ? (
                            <>
                              {data?.selectedCoverage?.slice(0, 3)?.map((n, i) => {
                                return <span key={i}>{n + ', '}</span>
                              })}
                              {data?.selectedCoverage?.length > 3 ? (
                                <Tooltip title={data?.selectedCoverage?.join(', ')}>
                                  <span>...{data?.selectedCoverage?.length - 3} more</span>
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
                  </>
                ) : (
                  ''
                )}
                {data?.customer != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      For Customers
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.customer != '' ? data?.customer : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data?.customer == 'dealers' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Dealers{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.allDealers != '' ? data?.allDealers.join(', ') : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data?.customer == 'fleets' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      For Managed Partners{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.fleets != '' ? data?.fleets : '---'}
                    </Grid>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      All Selected Fleets{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.selectedFleets != '' ? (
                        <>
                          {data?.selectedFleets?.slice(0, 3)?.join(',  ')}
                          <Tooltip title={data?.selectedFleets?.join(', ')}>
                            <span>...{data?.selectedFleets?.length - 3} more</span>
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
                {data?.partner != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      For Managed Partners{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.partner != '' ? (
                        <>
                          {data?.partner?.slice(0, 3)?.map((n, i) => {
                            return <span key={i}>{n + ', '}</span>
                          })}
                          {data?.partner?.length > 3 ? (
                            <Tooltip title={data?.partner?.join(', ')}>
                              <span>...{data?.partner?.length - 3} more</span>
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
                {data?.model != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Model{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.model != '' ? data?.model : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data?.variant != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Variant
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.variant != '' ? data?.variant : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data?.isRcRequired != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      RC Required{' '}
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.isRcRequired != '' ? data?.isRcRequired : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                {data?.distributionType != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Distribution Channel
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.distributionType != '' ? data?.distributionType : '---'} -{' '}
                      {data?.format != '' ? data?.format : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
                <br />
                <br />
                {data?.couponDownloadPath != '' ? (
                  <>
                    <Grid item md={3} sm={3} xs={3} className={styles.leftcolumn}>
                      Ready Notification to be sent at
                    </Grid>
                    <Grid item md={9} sm={9} xs={9} className={styles.rightcolumn}>
                      {data?.couponDownloadPath != '' ? data?.couponDownloadPath : '---'}
                    </Grid>
                  </>
                ) : (
                  ''
                )}
              </Grid>
              <div>
                <DynamicReactQuill
                  theme='snow'
                  value={value}
                  onChange={handleChange}
                  modules={{
                    toolbar: [
                      [{ header: '1' }, { header: '2' }, { font: [] }],
                      [{ size: [] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                      ['clean']
                    ]
                  }}
                />
              </div>
              <div>
                <DynamicReactQuill
                  theme='snow'
                  value={legalValues}
                  onChange={handleChangeLegal}
                  modules={{
                    toolbar: [
                      [{ header: '1' }, { header: '2' }, { font: [] }],
                      [{ size: [] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                      ['clean']
                    ]
                  }}
                />
              </div>
            </div>

            <hr />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <div>
                {type == 'preview' ? (
                  <Button variant='outlined' sx={{ m: 1 }} onClick={handleClose}>
                    Close
                  </Button>
                ) : (
                  ''
                )}
                {type == 'add' ? (
                //   <Button variant='outlined' sx={{ m: 1 }} onClick={handleClose}>
                //     Edit
                //   </Button>
                ""
                ) : (
                  ''
                )}
                {type == 'add' ? (
                  <Button variant='contained' sx={{ m: 1 }} onClick={() => submitData(data)}>
                    Generate Coupon
                  </Button>
                ) : (
                  ''
                )}
                {type == 'update' ? (
                  <Button variant='contained' sx={{ m: 1 }} onClick={() => submitData(data)}>
                    Update Coupon
                  </Button>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  )
}

export default CustomeCouponPreview
