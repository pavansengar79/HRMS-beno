import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Card,
  Divider
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomeCouponPreview from 'src/views/apps/customCouponPreview'
import styles from './coupon.module.css'
import axios from 'axios'
import { backendUrl, backendUrl1, jkmsfaUrl } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'
import moment from 'moment'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { enIN } from 'date-fns/locale'
import CustomDialog from 'src/pages/components/CustomDialog/CustomDialog'

const initialValues = {
  title: '',
  description: '',
  couponType: '',
  billRequired: '',
  services: '',
  couponRequired: '',
  couponValue: '',
  couponValueService: '',
  serviceCouponAmount: '',
  // serviceCouponBill: "",
  serviceCouponPercentageAmount: '',
  discount: '',
  applicableOn: '',
  coupenApplicableOnMaxTyre: '',
  dealerAdjustment: '',
  monthValue: '',
  validStart: '',
  validEnd: '',
  isWarrantyRegistrationRequired: '',
  tyreCategory: [],
  brandSubBrand: '',
  tyreSize: [],
  tyresku: [],
  coverage: '',
  zone: [],
  regions: [],
  areas: [],
  teritorys: [],
  pincodes: [],
  depos: [],
  customer: '',
  allDealers: [],
  subDealers: [],
  userGroup: [],
  fleets: '',
  partner: [],
  model: '',
  variant: '',
  isRcRequired: '',
  distributionType: '',
  format: '',
  couponDownloadPath: ''
}

const schemeCoverage = [
  { value: 'AllOverIndia', label: 'All Over India' },
  { value: 'Zone', label: 'Zonal Level' },
  { value: 'Region', label: 'Regional Level' },
  { value: 'Area', label: 'Area Level' },
  { value: 'Territory', label: 'Territory Level' },
  { value: 'Pincode', label: 'PIN code Level' },
  { value: 'Depo', label: 'Depot Level' }
]
const zonesList = [
  { value: 'NZ', label: 'North Zone' },
  { value: 'EZ', label: 'East Zone' },
  { value: 'SZ', label: 'South Zone' },
  { value: 'WZ', label: 'West Zone' }
]

const regionList = [
  { value: 1682, Name: 'Nepal', PZone: 'NP' },
  { value: 1182, Name: 'GUWAHATI', PZone: 'EZ' },
  { value: 1681, Name: 'Patna', PZone: 'EZ' },
  { value: 3181, Name: 'DELHI', PZone: 'NZ' },
  { value: 3281, Name: 'FARIDABAD', PZone: 'NZ' },
  { value: 3381, Name: 'JALLANDHAR', PZone: 'NZ' },
  { value: 3681, Name: 'JAIPUR', PZone: 'NZ' },
  { value: 3682, Name: 'JODHPUR', PZone: 'NZ' },
  { value: 3781, Name: 'KANPUR', PZone: 'NZ' },
  { value: 3782, Name: 'MEERUT', PZone: 'NZ' },
  { value: 3783, Name: 'VARANASI', PZone: 'NZ' },
  { value: 5181, Name: 'H.BAD', PZone: 'TZ' },
  { value: 5182, Name: 'VIJAYWADA', PZone: 'TZ' },
  { value: 5381, Name: 'CHENNAI', PZone: 'SZ' },
  { value: 5382, Name: 'Cochin', PZone: 'SZ' },
  { value: 7181, Name: 'INDORE', PZone: 'WZ' },
  { value: 1683, Name: 'RANCHI', PZone: 'EZ' },
  { value: 7381, Name: 'MUMBAI', PZone: 'WZ' },
  { value: 7382, Name: 'NAGPUR', PZone: 'WZ' },
  { value: 7581, Name: 'AHMEDABAD', PZone: 'WZ' },
  { value: 1181, Name: 'KOLKATTA', PZone: 'EZ' },
  { value: 7182, Name: 'RAIPUR', PZone: 'EZ' },
  { value: 7183, Name: 'JABALPUR', PZone: 'WZ' },
  { value: 7184, Name: 'CUTTAK', PZone: 'EZ' },
  { value: 5281, Name: 'BNGLR', PZone: 'TZ' },
  { value: 3382, Name: 'CHANDIGARH', PZone: 'NZ' },
  { value: 5282, Name: 'HUBLI', PZone: 'TZ' },
  { value: 5383, Name: 'Coimbatore', PZone: 'SZ' },
  { value: 7582, Name: 'RAJKOT', PZone: 'WZ' }
]

const dealerGroupType1 = [
  {
    main: { value: 'Dealers', label: 'Dealers' },
    sub: [
      { value: 'Dealer', label: 'Dealer' },
      { value: 'SW', label: 'SW' },
      { value: 'XW', label: 'XW' },
      { value: 'FXW', label: 'FXW' },
      { value: 'TWC', label: 'TWC' },
      { value: 'PTP', label: 'PTP' },
      { value: 'MBO', label: 'MBO' }
    ]
  },
  {
    main: { value: 'Dealer Groups', label: 'Dealer Groups' },
    sub: []
  },
  {
    main: { value: 'Distributor', label: 'Distributor' },
    sub: []
  }
]

const areaList = [
  { value: 3661, Name: 'JAIPUR' },
  { value: 3663, Name: 'UDAIPUR' },
  { value: 3664, Name: 'JODHPUR' },
  { value: 3665, Name: 'ALWAR' },
  { value: 3666, Name: 'JAIPUR II' },
  { value: 3667, Name: 'SRIGANGANAGAR' },
  { value: 3662, Name: 'Ajmer' },
  { value: 1181, Name: 'FM-Kolkata' },
  { value: 1182, Name: 'FM-Guwahati' },
  { value: 1183, Name: 'FM-Kolkata' },
  { value: 1681, Name: 'FM-Jamshedpur 1' },
  { value: 1682, Name: 'FM-Janshedpur 2' },
  { value: 3761, Name: 'KANPUR' },
  { value: 3762, Name: 'LUCKNOW' },
  { value: 3763, Name: 'VARANASI' },
  { value: 3764, Name: 'MEERUT' },
  { value: 3765, Name: 'AGRA' },
  { value: 3767, Name: 'BARELILLY' },
  { value: 3161, Name: 'JHANDEWLAN(non-Trk)' },
  { value: 3162, Name: 'S G T NAGAR (Trk)' },
  { value: 3163, Name: 'SAKET (KHIRKEE)' },
  { value: 3164, Name: 'Rohtak' },
  { value: 3165, Name: 'Gurgaon' },
  { value: 3261, Name: 'FARIDABAD' },
  { value: 3262, Name: 'Hissar' },
  { value: 3263, Name: 'Gurgaon' },
  { value: 3361, Name: 'LUDHIANA' },
  { value: 3362, Name: 'JALLANDHAR' },
  { value: 3363, Name: 'CHANDIGARH' },
  { value: 3364, Name: 'JAMMU' },
  { value: 3181, Name: 'FM-Delhi' },
  { value: 3281, Name: 'FM-Faridabad 1' },
  { value: 3282, Name: 'FM-Faridabad 2' },
  { value: 3381, Name: 'FM-Jalandhar 1' },
  { value: 3382, Name: 'FM-Jalandhar 2' },
  { value: 3681, Name: 'FM-Jaipur' },
  { value: 3682, Name: 'FM-Jodhpur1' },
  { value: 3683, Name: 'FM-Jodhpur 2' },
  { value: 5181, Name: 'FM-Hyderabad' },
  { value: 5172, Name: 'DB-VIJAYWADA' },
  { value: 5281, Name: 'FM-Bangalore 1' },
  { value: 5282, Name: 'FM-Bangalore 2' },
  { value: 5381, Name: 'FM-Chennai 1' },
  { value: 5382, Name: 'FM-Chennai 2' },
  { value: 3365, Name: 'PARWANOO' },
  { value: 5383, Name: 'FM-Chennai 3' },
  { value: 5384, Name: 'FM-Chennai 4' },
  { value: 7381, Name: 'FM-Mumbai 1' },
  { value: 7382, Name: 'FM-Nagpur' },
  { value: 7383, Name: 'FM-Mumbai 3' },
  { value: 7384, Name: 'FM-Mumbai 2' },
  { value: 7581, Name: 'FM- Ahmedabad 1' },
  { value: 1171, Name: 'DB-KOLKATTA' },
  { value: 1172, Name: 'DB-GWH' },
  { value: 1173, Name: 'DB-KOLKATTA' },
  { value: 1671, Name: 'DB-JAMSHEDPU' },
  { value: 3171, Name: 'DB-DELHI' },
  { value: 3271, Name: 'DB-Faridabad' },
  { value: 3371, Name: 'DB-JALLANDHA' },
  { value: 3671, Name: 'DB-JAIPUR' },
  { value: 3673, Name: 'DB-JODHPUR' },
  { value: 3771, Name: 'DB-KANPUR' },
  { value: 3772, Name: 'DB-Meerut' },
  { value: 5171, Name: 'DB-H.BAD' },
  { value: 5182, Name: 'FM-Vijaywada' },
  { value: 5271, Name: 'DB-BNGLR' },
  { value: 5371, Name: 'DB-CHENNAI' },
  { value: 5373, Name: 'DB-COCHIN' },
  { value: 7162, Name: 'GWALIOR' },
  { value: 7173, Name: 'DB-RAIPUR' },
  { value: 1161, Name: 'NORTH KOLKATTA' },
  { value: 1162, Name: 'SOUTH KOLKATTA' },
  { value: 1163, Name: 'ASANSOL' },
  { value: 7571, Name: 'AO AHM - DB' },
  { value: 1164, Name: 'SILIGURI' },
  { value: 1261, Name: 'GUWAHATI' },
  { value: 1262, Name: 'Jorhat' },
  { value: 7181, Name: 'FM-Indore 1' },
  { value: 3781, Name: 'FM-Kanpur' },
  { value: 7182, Name: 'FM-Raipur 1' },
  { value: 7171, Name: 'DB-INDORE' },
  { value: 7371, Name: 'DB-MUMBAI-1' },
  { value: 7373, Name: 'DB-NAGPUR-1' },
  { value: 7172, Name: 'DB-RAEUR' },
  { value: 3782, Name: 'FM-Meerut' },
  { value: 3672, Name: 'DB-JODHPUR' },
  { value: 1263, Name: 'SilChar' },
  { value: 5372, Name: 'DB-COCHIN' },
  { value: 7372, Name: 'DB-NAGPUR-1' },
  { value: 7361, Name: 'MUMBAI' },
  { value: 7362, Name: 'VASHI' },
  { value: 7363, Name: 'PUNE' },
  { value: 7366, Name: 'KOLAPUR' },
  { value: 7368, Name: 'BHIWANDI' },
  { value: 7364, Name: 'NAGPUR' },
  { value: 7365, Name: 'NASHIK' },
  { value: 7367, Name: 'NANDED' },
  { value: 7161, Name: 'INDORE' },
  { value: 1761, Name: 'JAMSHEDPUR' },
  { value: 7163, Name: 'JABALPUR' },
  { value: 7164, Name: 'BHOPAL' },
  { value: 7561, Name: 'AHMEDABAD' },
  { value: 7562, Name: 'RAJKOT' },
  { value: 7563, Name: 'SURAT' },
  { value: 7564, Name: 'GANDHIDHAM' },
  { value: 7565, Name: 'BARODA' },
  { value: 7566, Name: 'JAMNAGAR' },
  { value: 3768, Name: 'NOIDA' },
  { value: 5161, Name: 'GREATER HYDERABAD' },
  { value: 5162, Name: 'VIJAYAWADA' },
  { value: 5163, Name: 'VIZAG' },
  { value: 5164, Name: 'KURNOOL' },
  { value: 5261, Name: 'Bangalore Rural' },
  { value: 5262, Name: 'HUBLI' },
  { value: 5263, Name: 'MYSORE' },
  { value: 5264, Name: 'BELGAUM' },
  { value: 5265, Name: 'Bangalore Urban' },
  { value: 5361, Name: 'CHENNAI' },
  { value: 5362, Name: 'MADURAI' },
  { value: 5364, Name: 'NAMAKAL' },
  { value: 5366, Name: 'TRICHY' },
  { value: 5561, Name: 'COCHIN' },
  { value: 5562, Name: 'CALICUT' },
  { value: 7261, Name: 'RAIPUR' },
  { value: 7262, Name: 'BILASPUR' },
  { value: 3766, Name: 'ALLAHBAD' },
  { value: 3861, Name: 'HALDWANI' },
  { value: 5165, Name: 'Karimnagar' },
  { value: 5365, Name: 'COIMBATORE' },
  { value: 1763, Name: 'RANCHI' },
  { value: 1661, Name: 'PATNA' },
  { value: 1664, Name: 'MUZAFARPUR' },
  { value: 1861, Name: 'CUTTACK' },
  { value: 1862, Name: 'SAMBALPUR' },
  { value: 5363, Name: 'SALEM' },
  { value: 1100, Name: 'Nepall' }
]
const currentDate = moment().format('YYYY-MM-DD')
const schema = yup
  .object({
    // required fields
    title: yup.string().required('Title is a required field'),
    description: yup.string().required('Description is a required field'),
    couponType: yup.string().required('Coupon Type is a required field'),
    couponRequired: yup.string().test('required-coupon', 'Number of coupons is a required field', function (value) {
      const couponType = this.parent.couponType
      if (
        // couponType === "SALE" ||
        // couponType == "EXTENDED WARRANTY" ||
        // couponType == "SERVICE"
        true
      ) {
        if (!value) {
          throw new yup.ValidationError('Number of coupons is a required field', value, 'couponRequired')
        }
        if (isNaN(parseFloat(value)) || !isFinite(value)) {
          throw new yup.ValidationError('Must be a numeric value', value, 'couponRequired')
        }
        if (value.includes('.')) {
          throw new yup.ValidationError('This field should not be in decimal', value, 'couponRequired')
        }
        return true
      }
      return true // Return true if the field is not required
    }),
    couponValue: yup.string().test('required-coupon', 'Value type is required field', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SALE') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    discount: yup.string().test('required-coupon', 'Coupon discount amount is a required field', function (value) {
      const couponType = this.parent.couponType
      const couponValue = this.parent.couponValue
      if (couponType === 'SALE') {
        if (!value) {
          throw new yup.ValidationError('Coupon discount amount is a required field', value, 'discount')
        }
        if (isNaN(parseFloat(value)) || !isFinite(value)) {
          throw new yup.ValidationError('Discount amount must be a numeric value', value, 'discount')
        }
        if (couponValue === 'Percentage') {
          if (parseFloat(value) < 0 || parseFloat(value) > 100) {
            throw new yup.ValidationError('Discount amount must be between 0 and 100', value, 'discount')
          }
        }
        return true
      }
      return true // Return true if the field is not required
    }),
    applicableOn: yup.string().test('required-coupon', 'Applicable on is a required field', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SALE' || couponType == 'EXTENDED WARRANTY') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    coupenApplicableOnMaxTyre: yup
      .string()
      .test('required-coupon', 'Applicable on maximum number of tyres is a required field', function (value) {
        const couponType = this.parent.couponType
        const applicableOn = this.parent.applicableOn
        if (
          (couponType === 'SALE' && applicableOn == 'Tyre Level') ||
          (couponType === 'EXTENDED WARRANTY' && applicableOn == 'Tyre Level')
        ) {
          if (!value) {
            throw new yup.ValidationError(
              'Applicable on maximum number of tyres is a required field',
              value,
              'coupenApplicableOnMaxTyre'
            )
          }
          if (isNaN(parseFloat(value)) || !isFinite(value)) {
            throw new yup.ValidationError('Must be a numeric value', value, 'coupenApplicableOnMaxTyre')
          }
          if (value.includes('.')) {
            throw new yup.ValidationError('This field should not be in decimal', value, 'coupenApplicableOnMaxTyre')
          }
          return true
        }
        return true // Return true if the field is not required
      }),
    validStart: yup.string().test('required-coupon', 'Please select a date', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SALE' || couponType === 'SERVICE' || couponType == 'EXTENDED WARRANTY') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    validEnd: yup.string().test('required-coupon', 'Please select a date', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SALE' || couponType === 'SERVICE' || couponType == 'EXTENDED WARRANTY') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    billRequired: yup.string().test('required-coupon', 'Bill is a required field.', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SALE' || couponType === 'SERVICE' || couponType == 'EXTENDED WARRANTY') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    couponValueService: yup.string().test('required-coupon', 'Value type is a required field', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SERVICE') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    serviceCouponAmount: yup.string().test('required-coupon', 'Amount is a required field', function (value) {
      const couponValueService = this.parent.couponValueService
      const couponType = this.parent.couponType
      if (couponValueService === 'Fixed Amount' && couponType === 'SERVICE') {
        if (!value) {
          throw new yup.ValidationError('Amount is a required field', value, 'serviceCouponAmount')
        }
        if (isNaN(parseFloat(value)) || !isFinite(value)) {
          throw new yup.ValidationError('Must be a numeric value', value, 'serviceCouponAmount')
        }
        return true
      }
      return true // Return true if the field is not required
    }),
    // serviceCouponBill: yup.string().test('required-coupon', 'Please upload bill', function (value) {
    //     const couponValueService = this.parent.couponValueService;
    //     if (couponValueService === 'Bill Amount') {
    //         return !!value;
    //     }
    //     return true; // Return true if the field is not required
    // }),
    serviceCouponPercentageAmount: yup.string().test('required-coupon', 'Amount is a required field', function (value) {
      const couponValueService = this.parent.couponValueService
      const couponType = this.parent.couponType
      if (couponValueService === 'Percentage' && couponType === 'SERVICE') {
        if (!value) {
          throw new yup.ValidationError('Amount is a required field', value, 'serviceCouponPercentageAmount')
        }
        if (isNaN(parseFloat(value)) || !isFinite(value)) {
          throw new yup.ValidationError('Must be a numeric value', value, 'serviceCouponPercentageAmount')
        }
        if (parseFloat(value) < 0 || parseFloat(value) > 100) {
          throw new yup.ValidationError(
            'Discount amount must be between 0 and 100',
            value,
            'serviceCouponPercentageAmount'
          )
        }
        return true
      }
      return true // Return true if the field is not required
    }),

    monthValue: yup.string().test('required-coupon', 'Value in Months is a required field', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'EXTENDED WARRANTY') {
        if (!value) {
          throw new yup.ValidationError('Value in Months is a required field', value, 'monthValue')
        }
        if (isNaN(parseFloat(value)) || !isFinite(value)) {
          throw new yup.ValidationError('Must be a numeric value', value, 'monthValue')
        }
        if (value.includes('.')) {
          throw new yup.ValidationError('This field should not be in decimal', value, 'monthValue')
        }
        return true
      }
      return true // Return true if the field is not required
    }),
    services: yup.string().test('required-services', 'Types of service is a required field', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SERVICE') {
        return !!value
      }
      return true // Return true if the field is not required
    }),
    dealerAdjustment: yup.string().test('required-services', 'CN adjustment is a required field', function (value) {
      const couponType = this.parent.couponType
      if (couponType === 'SERVICE' || couponType === 'EXTENDED WARRANTY' || couponType === 'SALE') {
        return !!value
      }
      return true // Return true if the field is not required
    }),

    // not required field
    tyreCategory: yup.array().of(yup.string()),
    brandSubBrand: yup.string(),
    tyreSize: yup.array().of(yup.string()),
    tyresku: yup.array().of(yup.string()),
    isWarrantyRegistrationRequired: yup.string(),
    coverage: yup.string(),
    zone: yup.array().of(yup.string()),
    regions: yup.array().of(yup.string()),
    areas: yup.array().of(yup.string()),
    teritorys: yup.array().of(yup.string()),
    pincodes: yup.array().of(yup.string()),
    depos: yup.array().of(yup.string()),
    customer: yup.string(),
    allDealers: yup.array().of(yup.string()),
    subDealers: yup.array().of(yup.string()),
    userGroup: yup.array().of(yup.string()),
    partner: yup.array().of(yup.string()),
    model: yup.string(),
    variant: yup.string(),
    isRcRequired: yup.string(),
    distributionType: yup.string(),
    format: yup.string(),
    couponDownloadPath: yup.string().email('Invalid email address')
  })
  .required()
const Index = () => {
  const userName = 'applore_con'
  const password = 'ApSue^3aWbi2Suppo'
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const [categoryCollapse, setCategoryCollapse] = useState(false)
  const [partnerCollapse, setPartnerCollapse] = useState(false)
  const [tyreCategorys, setTyreCategorys] = useState([])
  const [selectedTyreCategory, setselectedTyreCategory] = useState([])
  const [selectedTyreDesc, setselectedTyreDesc] = useState([])
  const [selectedTyreSize, setselectedTyreSize] = useState([])
  const [selectedTyreSize1, setselectedTyreSize1] = useState([])
  const [tyreBrands, setTyreBrands] = useState([])
  const [tyreSize, setTyreSize] = useState([])
  const [skuList, setSkuList] = useState([])
  const [territoriesList, setTerritoriesList] = useState([])

  // customerState
  const [customerVal, setCustomerVal] = useState([])
  const [allDealers1, setAllDealers1] = useState([])
  const [userCategory, setUserCategory] = useState([])

  const [skuListModal, setSkuListModal] = useState(false)
  const [searchskuTyre, setSearchSkuTyre] = useState('')
  const [selectAllSKU, setSelectAllSKU] = useState(true)
  const [selectedOneByOneSku, setSelectedOneByOneSku] = useState([])

  const [pincodeList, setPincodeList] = useState([])
  const [selectAllPincode, setSelectAllPincode] = useState(false)
  const [selectedPincodes, setSelectedPincodes] = useState([])
  const [currentPagePincode, setCurrentPagePincode] = useState(1)
  const [pageCountPincode, setPageCountPincode] = useState('')
  const [applicableLevel, setApplicableLevel] = useState('')

  const [depoList, setDepoList] = useState([])
  const [manufacturerList, setManufacturerList] = useState([])
  const [modelList, setModelList] = useState([])
  const [mondelId, setModelId] = useState({
    vehicletype: [],
    manufacturer: []
  })

  const [fleet, setFleets] = useState([])
  const [fleetValue, setFleetValue] = useState('')
  const [openFleetsModal, setOpenFleetsModal] = useState(false)
  const [searchFleet, setSearchFleet] = useState('')
  const [selectedFleets, setSelectedFleets] = useState([])
  const [allFleetsSelected, setAllFleetsSelected] = useState(true)
  const [subDealer, setSubDeler] = useState([])
  const [dealerGroup, setDealerGroup] = useState([])
  const [selectedDate, setSelectedDate] = useState('')

  const [couponType, setCouponType] = useState('')
  const [customPopUp, setCustomePopup] = useState({
    zone: false,
    region: false,
    area: false,
    territory: false,
    pincode: false,
    depot: false
  })
  const [selectAllCoverage, setSelectAllCoverage] = useState({
    zone: true,
    region: true,
    area: true,
    territory: true,
    pincode: true,
    depot: true
  })
  const [searchCoverage, setSearchCoverage] = useState({
    zone: '',
    region: '',
    area: '',
    territory: '',
    pincode: '',
    depot: ''
  })
  const [customeSelectCoverage, setCustomSelectCoverage] = useState({
    zone: [],
    region: [],
    area: [],
    territory: [],
    pincode: [],
    depot: []
  })

  const [couponValueType, setCouponValueType] = useState('')
  const [couponValueServiceType, setCouponValueServiceType] = useState('')
  const [coverageVal, setCoverage] = useState('AllOverIndia')
  const [formData, setFormDate] = useState(null)
  const [open, setOpen] = useState(false)
  const [selectAllTyreCategory, setSelectAllTyreCategory] = useState(false)
  const [selectAllManufacturer, setSelectAllManufacturer] = useState(false)
  const [selectAllTyreSize, setSelectAllTyreSize] = useState(false)
  const [selectAllDealer, setSelectAllDealer] = useState(false)
  const [selectAllSubDealer, setSelectAllSubDealer] = useState(false)
  const [selectAllDealerGroup, setSelectAllDealerGroup] = useState(false)

  const [selectedManufacturer, setSelectedManufacturer] = useState([])
  // functions .
  const handleSelectAllFleets = event => {
    const checked = event.target.checked
    setAllFleetsSelected(checked)
    setSelectedFleets(checked ? fleet.map(f => f._id) : [])
  }

  const handleSelectedFleets = z => {
    if (selectedFleets.includes(z)) {
      setSelectedFleets(selectedFleets.filter(zval => zval !== z))
      setAllFleetsSelected(false)
    } else {
      setSelectedFleets([...selectedFleets, z])
    }
  }

  const handleFileSubmit = e => {
    // let file1 = e.target.files[0]
    // let location = await uploadFilesToAws(file1);
    return e.target.value
  }
  useEffect(() => {
    if (selectedManufacturer.length != 0) {
      if (manufacturerList.length == selectedManufacturer.length) {
        setSelectAllManufacturer(true)
      } else {
        setSelectAllManufacturer(false)
      }
    }
    setModelIdHandel(selectedManufacturer)
  }, [selectedManufacturer])
  const handleSingleManufacturer = async data => {
    if (selectedManufacturer.includes(data)) {
      setSelectedManufacturer(selectedManufacturer.filter(n => n != data))
      // setSelectAllDealerGroup(false);
      // setModelIdHandel(selectedManufacturer);
      setSelectAllTyreCategory(false)
    } else {
      setSelectedManufacturer(p => [...p, data])
      // setModelIdHandel(selectedManufacturer);
    }
  }

  const handleSelectAllDealerGroup = () => {
    setSelectAllDealerGroup(!selectAllDealerGroup)
    if (!selectAllDealerGroup) {
      setDealerGroup(userCategory.map(n => n.name))
    } else {
      setDealerGroup([])
    }
  }
  const handleSingleSelectAllDealerGroup = data => {
    if (dealerGroup.includes(data)) {
      setDealerGroup(subDealer.filter(n => n != data))
      setSelectAllDealerGroup(false)
    } else {
      setDealerGroup(p => [...p, data])
    }
    // if(selectedTyreCategory.length!=tyreCategorys.length){
    // setSelectAllTyreCategory(true)
    // }else{
    //   setSelectAllTyreCategory(false)
    // }
  }
  const handleSelectAllSubDealer = () => {
    setSelectAllSubDealer(!selectAllSubDealer)
    if (!selectAllSubDealer) {
      setSubDeler(dealerGroupType1[0].sub.map(m => m.value))
    } else {
      setSubDeler([])
    }
  }
  const handleSingleSelectAllSubDealer = data => {
    if (subDealer.includes(data)) {
      setSubDeler(subDealer.filter(n => n != data))
      setSelectAllSubDealer(false)
    } else {
      setSubDeler(p => [...p, data])
    }
    // if(selectedTyreCategory.length!=tyreCategorys.length){
    //   setSelectAllTyreCategory(true)
    // }else{
    //   setSelectAllTyreCategory(false)
    // }
  }
  const handleSelectAllDealer = () => {
    setSelectAllDealer(!selectAllDealer)
    if (!selectAllDealer) {
      setAllDealers1(dealerGroupType1.map(m => m.main.value))
    } else {
      setAllDealers1([])
    }
  }
  useEffect(() => {
    if (allDealers1.length == 3) {
      setSelectAllDealer(true)
    } else {
      setSelectAllDealer(false)
    }

    if (dealerGroupType1[0].sub.length == subDealer.length) {
      setSelectAllSubDealer(true)
    } else {
      setSelectAllSubDealer(false)
    }
    if (userCategory.length == dealerGroup.length) {
      setSelectAllDealerGroup(true)
    } else {
      setSelectAllDealerGroup(false)
    }
    if (skuList.length == selectedOneByOneSku.length) {
      setSelectAllSKU(true)
    } else {
      setSelectAllSKU(false)
    }
    if (zonesList.length == customeSelectCoverage.zone.length) {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        zone: true
      }))
    } else {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        zone: false
      }))
    }
    if (regionList.length == customeSelectCoverage.region.length) {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        region: true
      }))
    } else {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        region: false
      }))
    }
    if (areaList.length == customeSelectCoverage.area.length) {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        area: true
      }))
    } else {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        area: false
      }))
    }
    if (territoriesList.length == customeSelectCoverage.territory.length) {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        territory: true
      }))
    } else {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        territory: false
      }))
    }
    if (pincodeList.length == customeSelectCoverage.pincode.length) {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        pincode: true
      }))
    } else {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        pincode: false
      }))
    }
    if (depoList.length == customeSelectCoverage.depot.length) {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        depot: true
      }))
    } else {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        depot: false
      }))
    }
    if (fleet.length == selectedFleets.length) {
      setAllFleetsSelected(true)
    } else {
      setAllFleetsSelected(false)
    }
  }, [
    allDealers1,
    subDealer,
    dealerGroup,
    selectedOneByOneSku,
    customeSelectCoverage.zone,
    customeSelectCoverage.region,
    customeSelectCoverage.area,
    customeSelectCoverage.pincode,
    customeSelectCoverage.territory,
    customeSelectCoverage.depot,
    selectedFleets
  ])

  const handleSingleDealer = data => {
    if (allDealers1.includes(data)) {
      setAllDealers1(allDealers1.filter(n => n != data))
      setSelectAllDealer(false)
    } else {
      setAllDealers1(p => [...p, data])
    }
    // if(selectedTyreCategory.length!=tyreCategorys.length){
    //   setSelectAllTyreCategory(true)
    // }else{
    //   setSelectAllTyreCategory(false)
    // }
  }
  const handleSelectAlltyreSize = () => {
    setSelectAllTyreSize(!selectAllTyreSize)
    if (!selectAllTyreSize) {
      setselectedTyreSize1(tyreSize.map(m => m.size))
      setselectedTyreSize(tyreSize.map(m => m))
    } else {
      setselectedTyreSize1([])
      setselectedTyreSize([])
    }
  }
  const handleSingleSelectTyreSize = data => {
    if (selectedTyreSize1.includes(data)) {
      setselectedTyreSize1(selectedTyreSize1.filter(n => n != data))
      setselectedTyreSize(selectedTyreSize.filter(m => m.size != data))
      setSelectAllTyreSize(false)
    } else {
      setselectedTyreSize1(p => [...p, data])
      setselectedTyreSize(p => [...p, { size: data }])
    }
    // if(selectedTyreCategory.length!=tyreCategorys.length){
    //   setSelectAllTyreCategory(true)
    // }else{
    //   setSelectAllTyreCategory(false)
    // }
  }
  const handelSelectAllTyreCategory = () => {
    setSelectAllTyreCategory(!selectAllTyreCategory)
    if (!selectAllTyreCategory) {
      setselectedTyreCategory(tyreCategorys.map(m => m.Ydesc))
      setselectedTyreDesc(tyreCategorys.map(m => m.CatCode))
    } else {
      setselectedTyreCategory([])
      setselectedTyreDesc([])
    }
  }
  const handelSelectManufactrer = () => {
    setSelectAllManufacturer(!selectAllManufacturer)
    if (!selectAllManufacturer) {
      // let arr = manufacturerList.map((m) => m.manufacturer);
      setSelectedManufacturer(manufacturerList.map(m => m.manufacturer))
      // setModelIdHandel(arr);
    } else {
      setSelectedManufacturer([])
      // setModelIdHandel([]);
    }
  }
  const handleSingleSelectTyreCategory = (data, data1) => {
    if (selectedTyreCategory.includes(data)) {
      setselectedTyreCategory(selectedTyreCategory.filter(n => n != data))
      setselectedTyreDesc(selectedTyreDesc.filter(n => n != data1))
      setSelectAllTyreCategory(false)
    } else {
      setselectedTyreCategory(p => [...p, data])
      setselectedTyreDesc(p => [...p, data1])
    }
  }
  const customeSelectCheckBox = (e, type) => {
    if (type == 'zone') {
      const updatedZone = [...customeSelectCoverage.zone]

      // Push the new value into the cloned array
      if (updatedZone.includes(e.value)) {
        let arr = updatedZone.filter(n => n != e.value)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          zone: arr
        }))
        setSelectAllCoverage(prevState => ({
          ...prevState,
          zone: false
        }))
      } else {
        updatedZone.push(e.value)

        setCustomSelectCoverage(prevState => ({
          ...prevState,
          zone: updatedZone
        }))
        // Update the state with the modified array
      }
    }
    if (type == 'region') {
      const updatedRegion = [...customeSelectCoverage.region]

      // Push the new value into the cloned array
      if (updatedRegion.includes(e.Name)) {
        let arr = updatedRegion.filter(n => n != e.Name)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          region: arr
        }))
        setSelectAllCoverage(prevState => ({
          ...prevState,
          region: false
        }))
      } else {
        updatedRegion.push(e.Name)

        setCustomSelectCoverage(prevState => ({
          ...prevState,
          region: updatedRegion
        }))
        // Update the state with the modified array
      }
    }
    if (type == 'area') {
      const updatedRegion = [...customeSelectCoverage.area]
      // Push the new value into the cloned array
      if (updatedRegion.includes(e.Name)) {
        let arr = updatedRegion.filter(n => n != e.Name)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          area: arr
        }))
        setSelectAllCoverage(prevState => ({
          ...prevState,
          area: false
        }))
      } else {
        updatedRegion.push(e.Name)

        setCustomSelectCoverage(prevState => ({
          ...prevState,
          area: updatedRegion
        }))
        // Update the state with the modified array
      }
    }
    if (type == 'territory') {
      const updatedTerritory = [...customeSelectCoverage.territory]

      // Push the new value into the cloned array
      if (updatedTerritory.includes(e.territoryCode)) {
        let arr = updatedTerritory.filter(n => n != e.territoryCode)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          territory: arr
        }))
        setSelectAllCoverage(prevState => ({
          ...prevState,
          territory: false
        }))
      } else {
        updatedTerritory.push(e.territoryCode)

        setCustomSelectCoverage(prevState => ({
          ...prevState,
          territory: updatedTerritory
        }))
        // Update the state with the modified array
      }
    }
    if (type == 'pincode') {
      const updatedTerritory = [...customeSelectCoverage.pincode]

      // Push the new value into the cloned array
      if (updatedTerritory.includes(e.pinCode)) {
        let arr = updatedTerritory.filter(n => n != e.pinCode)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          pincode: arr
        }))
        setSelectAllCoverage(prevState => ({
          ...prevState,
          pincode: false
        }))
      } else {
        updatedTerritory.push(e.pinCode)

        setCustomSelectCoverage(prevState => ({
          ...prevState,
          pincode: updatedTerritory
        }))
        // Update the state with the modified array
      }
    }
    if (type == 'depot') {
      const updatedTerritory = [...customeSelectCoverage.depot]

      // Push the new value into the cloned array
      if (updatedTerritory.includes(e.depo)) {
        let arr = updatedTerritory.filter(n => n != e.depo)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          depot: arr
        }))
        setSelectAllCoverage(prevState => ({
          ...prevState,
          depot: false
        }))
      } else {
        updatedTerritory.push(e.depo)

        setCustomSelectCoverage(prevState => ({
          ...prevState,
          depot: updatedTerritory
        }))
        // Update the state with the modified array
      }
    }
  }
  const handleSelectAllInCoverage = (e, type) => {
    if (type == 'zone') {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        zone: !selectAllCoverage?.zone
      }))
      let arr = zonesList.map(n => n.value)
      if (!selectAllCoverage?.zone) {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          zone: arr
        }))
      } else {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          zone: []
        }))
      }
    }
    if (type == 'region') {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        region: !selectAllCoverage?.region
      }))
      let arr = regionList.map(n => n.Name)
      if (!selectAllCoverage?.region) {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          region: arr
        }))
      } else {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          region: []
        }))
      }
    }
    if (type == 'area') {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        area: !selectAllCoverage?.area
      }))
      let arr = areaList.map(n => n.Name)
      if (!selectAllCoverage?.area) {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          area: arr
        }))
      } else {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          area: []
        }))
      }
    }
    if (type == 'territory') {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        territory: !selectAllCoverage?.territory
      }))
      let arr = territoriesList.map(n => n.territoryCode)
      if (!selectAllCoverage?.territory) {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          territory: arr
        }))
      } else {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          territory: []
        }))
      }
    }
    if (type == 'pincode') {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        pincode: !selectAllCoverage?.pincode
      }))
      let arr = pincodeList.map(n => n.pinCode)
      if (!selectAllCoverage?.pincode) {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          pincode: arr
        }))
      } else {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          pincode: []
        }))
      }
    }
    if (type == 'depot') {
      setSelectAllCoverage(prevState => ({
        ...prevState,
        depot: !selectAllCoverage?.depot
      }))
      let arr = depoList.map(n => n.depo)
      if (!selectAllCoverage?.depot) {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          depot: arr
        }))
      } else {
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          depot: []
        }))
      }
    }
    // if (selectAllSKU != true) {
    //     let arr = []
    //     skuList.map(n => arr.push(n._id))
    //     setSelectedOneByOneSku(arr)
    // } else {
    //     setSelectedOneByOneSku([])
    // }
  }
  const customeValSet = e => {
    if (e == 'Zone') {
      setCustomePopup(prevState => ({ ...prevState, zone: true }))
    }
    if (e == 'Region') {
      setCustomePopup(prevState => ({ ...prevState, region: true }))
    }
    if (e == 'Area') {
      setCustomePopup(prevState => ({ ...prevState, area: true }))
    }
    if (e == 'Territory') {
      setCustomePopup(prevState => ({ ...prevState, territory: true }))
    }
    if (e == 'Pincode') {
      setCustomePopup(prevState => ({ ...prevState, pincode: true }))
    }
    if (e == 'Depo') {
      setCustomePopup(prevState => ({ ...prevState, depot: true }))
    }
  }
  const handleSelectAllSKUModal = e => {
    setSelectAllSKU(!selectAllSKU)
    if (selectAllSKU != true) {
      let arr = []
      skuList.map(n => arr.push(n._id))
      setSelectedOneByOneSku(arr)
    } else {
      setSelectedOneByOneSku([])
    }
  }
  const setModelIdHandel = e => {
    let vehicletype = []
    let manufacturer = []
    let data = manufacturerList
      .filter(n => e.includes(n.manufacturer))
      .map(k => {
        vehicletype.push(k.vehicletype)
        manufacturer.push(k.manufacturer)
      })
    let obj = {
      vehicletype: vehicletype,
      manufacturer: manufacturer
    }
    setModelId(obj)
  }
  const handleSKUSelection = sku => {
    if (selectedOneByOneSku.includes(sku._id)) {
      setSelectedOneByOneSku(selectedOneByOneSku.filter(n => n != sku._id))
      setSelectAllSKU(false)
    } else {
      setSelectedOneByOneSku(prevSelected => [...prevSelected, sku._id])
    }
    // const index = selectedSkuIndex;
    // if (index !== null) {
    //   // Get the selected tyre
    //   const selectedTyre = tyreSizeSlab[index];

    //   // Check if the SKU is in the selected SKU list for the selected tyre
    //   const selectedSkuIndex = selectedTyre.skuList.findIndex(
    //     (s) => s?.MatDesc === sku?.MatDesc
    //   );

    //   if (selectedSkuIndex === -1) {
    //     // If the SKU is not in the selected list, add it
    //     const updatedSelectedTyre = { ...selectedTyre };
    //     updatedSelectedTyre.skuList = [...selectedTyre.skuList, sku];

    //     // Update the selected tyre in the tyreSizeSlab array
    //     const updatedTyreSizeSlab = [...tyreSizeSlab];
    //     updatedTyreSizeSlab[index] = updatedSelectedTyre;
    //     setTyreSizeSlab(updatedTyreSizeSlab);
    //   } else {
    //     // If the SKU is in the selected list, remove it
    //     const updatedSelectedTyre = { ...selectedTyre };
    //     updatedSelectedTyre.skuList.splice(selectedSkuIndex, 1);

    //     // Update the selected tyre in the tyreSizeSlab array
    //     const updatedTyreSizeSlab = [...tyreSizeSlab];
    //     updatedTyreSizeSlab[index] = updatedSelectedTyre;
    //     setTyreSizeSlab(updatedTyreSizeSlab);
    //   }
    // }
  }
  const selectAllTyreSizeHandle = () => {
    let arr = tyreSize.map(n => n.size)
    setSelectAllTyreSize(!selectAllTyreSize)
    if (!selectAllTyreSize) {
      setselectedTyreSize(tyreSize)
      setselectedTyreSize1(arr)
    } else {
      setselectedTyreSize([])
      setselectedTyreSize1([])
    }
  }
  const onSubmit = data => {
    data.allskyTypes = selectedOneByOneSku
    data.allDealers1 = allDealers1
    data.partner1 = selectedManufacturer
    data.subDealers1 = subDealer
    data.userGroup1 = dealerGroup
    data.tyreCategory1 = selectedTyreCategory
    data.tyreSize1 = selectedTyreSize1
    let selectedFleetname = fleet.filter(n => selectedFleets.includes(n._id)).map(n1 => n1.Name1)
    data.selectedFleets = selectedFleetname

    data.searchCoverage = []
    let skuListName = []
    selectedOneByOneSku.map(n => {
      skuList.map(n1 => {
        if (n1._id == n) {
          skuListName.push(n1.MatDesc)
        }
      })
    })

    data.skuListName = skuListName
    if (data.coverage == 'AllOverIndia') {
      data.selectedCoverage = 'AllOverIndia'
    }
    if (data.coverage == 'Zone') {
      data.selectedCoverage = customeSelectCoverage.zone
    }
    if (data.coverage == 'Region') {
      data.selectedCoverage = customeSelectCoverage.region
    }
    if (data.coverage == 'Area') {
      data.selectedCoverage = customeSelectCoverage.area
    }
    if (data.coverage == 'Territory') {
      data.selectedCoverage = customeSelectCoverage.territory
    }
    if (data.coverage == 'Pincode') {
      data.selectedCoverage = customeSelectCoverage.pincode
    }
    if (data.coverage == 'Depo') {
      data.selectedCoverage = customeSelectCoverage.depot
    }
    let customData = {}
    if (data.couponType == 'SALE') {
      customData = {
        title: data.title,
        description: data.description,
        couponType: data.couponType,
        dealerAdjustment: data.dealerAdjustment,
        couponValue: data.couponValue,
        billRequired: data.billRequired,
        couponRequired: data.couponRequired,
        discount: data.discount,
        validEnd: data.validEnd,
        validStart: data.validStart,
        applicableOn: data.applicableOn,
        allskyTypes: data.allskyTypes,
        skuListName: data.skuListName,
        coverage: data.coverage,
        selectedCoverage: data.selectedCoverage,
        allDealers: data.allDealers1,
        subDealers: data.subDealers1,
        userGroup: data.userGroup1,
        customer: data.customer,
        fleets: data.fleets,
        selectedFleets: data.selectedFleets,
        tyreCategory: data.tyreCategory1,
        tyreSize: data.tyreSize1,
        brandSubBrand: data.brandSubBrand,
        isWarrantyRegistrationRequired: data.isWarrantyRegistrationRequired,
        couponDownloadPath: data.couponDownloadPath,
        format: data.format,
        isRcRequired: data.isRcRequired,
        partner: data.partner1,
        variant: data.variant,
        distributionType: data.distributionType,
        model: data.model
      }
    }
    if (data.couponType == 'EXTENDED WARRANTY') {
      customData = {
        title: data.title,
        description: data.description,
        couponRequired: data.couponRequired,
        monthValue: data.monthValue,
        couponType: data.couponType,
        billRequired: data.billRequired,
        dealerAdjustment: data.dealerAdjustment,
        validEnd: data.validEnd,
        validStart: data.validStart,
        applicableOn: data.applicableOn,
        allskyTypes: data.allskyTypes,
        skuListName: data.skuListName,
        coverage: data.coverage,
        selectedCoverage: data.selectedCoverage,
        allDealers: data.allDealers1,
        subDealers: data.subDealers1,
        userGroup: data.userGroup1,
        customer: data.customer,
        fleets: data.fleets,
        selectedFleets: data.selectedFleets,
        tyreCategory: data.tyreCategory1,
        tyreSize: data.tyreSize1,
        brandSubBrand: data.brandSubBrand,
        isWarrantyRegistrationRequired: 'yes',
        couponDownloadPath: data.couponDownloadPath,
        format: data.format,
        isRcRequired: data.isRcRequired,
        partner: data.partner1,
        distributionType: data.distributionType,
        model: data.model,
        variant: data.variant
      }
    }
    if (data.couponType == 'SERVICE') {
      customData = {
        title: data.title,
        description: data.description,
        couponType: data.couponType,
        billRequired: data.billRequired,
        services: data.services,
        dealerAdjustment: data.dealerAdjustment,
        couponRequired: data.couponRequired,
        couponValueService: data.couponValueService,
        serviceCouponAmount: data.serviceCouponAmount,
        // serviceCouponBill: data.serviceCouponBill,
        validEnd: data.validEnd,
        validStart: data.validStart,
        serviceCouponPercentageAmount: data.serviceCouponPercentageAmount,
        allskyTypes: data.skuListName,
        skuListName: data.skuListName,
        coverage: data.coverage,
        selectedCoverage: data.selectedCoverage,
        allDealers: data.allDealers1,
        subDealers: data.subDealers1,
        userGroup: data.userGroup1,
        customer: data.customer,
        fleets: data.fleets,
        selectedFleets: data.selectedFleets,
        tyreCategory: data.tyreCategory1,
        tyreSize: data.tyreSize1,
        brandSubBrand: data.brandSubBrand,
        isWarrantyRegistrationRequired: data.isWarrantyRegistrationRequired,
        couponDownloadPath: data.couponDownloadPath,
        format: data.format,
        isRcRequired: data.isRcRequired,
        partner: data.partner1,
        distributionType: data.distributionType,
        model: data.model,
        variant: data.variant
      }
    }
    if (data.applicableOn == 'Tyre Level' && data.couponType != 'SERVICE') {
      customData.coupenApplicableOnMaxTyre = data.coupenApplicableOnMaxTyre
    }
    setFormDate(customData)
    setOpen(true)
  }
  const setCatData = data => {
    let name = []
    tyreCategorys.map(n => {
      if (data.includes(n.Ydesc)) {
        name.push(n.CatCode)
      }
    })
    setselectedTyreCategory(data)
    setselectedTyreDesc(name)
  }

  const setSizeData = data => {
    let arr1 = data.map(n => {
      return { size: n }
    })
    setselectedTyreSize(arr1)
    setselectedTyreSize1(data)
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/product/getVehicleCategory`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setTyreCategorys(response?.data?.data)
      })
      .catch(err => {})
    let arr = zonesList.map(n => n.value)
    setCustomSelectCoverage(prevState => ({
      ...prevState,
      zone: arr
    }))
    let arr1 = regionList.map(n => n.Name)
    setCustomSelectCoverage(prevState => ({
      ...prevState,
      region: arr1
    }))
    let arr2 = areaList.map(n => n.Name)
    setCustomSelectCoverage(prevState => ({
      ...prevState,
      area: arr2
    }))
  }, [])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl}/product/getTyreSizeGroup`,
        { Category: selectedTyreDesc, categoryName: selectedTyreCategory },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        let arr = response?.data?.data
        const customSort = (a, b) => {
          const sizeA = a.size
          const sizeB = b.size

          if (sizeA === null) return 1
          if (sizeB === null) return -1

          return parseInt(sizeA) - parseInt(sizeB)
        }
        arr.sort(customSort)
        setTyreSize(arr)
      })
      .catch(err => {})
    if (selectedTyreCategory.length != 0)
      if (selectedTyreCategory.length == tyreCategorys.length) {
        setSelectAllTyreCategory(true)
      } else {
        setSelectAllTyreCategory(false)
      }
  }, [selectedTyreCategory, selectedTyreDesc])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl1}/user/vehicle/getAllManufacturer`,
        { catCode: selectedTyreDesc },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        setManufacturerList(response?.data?.data)
      })
      .catch(err => {})
  }, [selectedTyreDesc])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(`${backendUrl1}/user/vehiclemodel/getAllModelVehicles1`, mondelId, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setModelList(response?.data?.allmodel)
        // setManufacturerList(response?.data?.data);
      })
      .catch(err => {
        console.log(err)
      })
  }, [mondelId])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl}/product/getSKUlist`,
        {
          Category: selectedTyreDesc,
          categoryName: selectedTyreCategory,
          tyreSizes: selectedTyreSize
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        setSkuList(response?.data?.data)
        let arr = response?.data?.data.map(n => n._id)
        setSelectedOneByOneSku(arr)
      })
      .catch(err => {})
    if (selectedTyreSize != 0) {
      if (selectedTyreSize.length == tyreSize.length) {
        setSelectAllTyreSize(true)
      } else {
        setSelectAllTyreSize(false)
      }
    }
  }, [selectedTyreSize, selectedTyreCategory, selectedTyreDesc])
  useEffect(() => {
    axios
      .get(`${jkmsfaUrl}/territory-list`, {
        headers: {
          Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
        }
      })
      .then(response => {
        setTerritoriesList(response?.data?.data)
        let arr = response?.data?.data.map(n => n.territoryCode)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          territory: arr
        }))
      })
      .catch(err => {})
  }, [])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/adminUserRoute/dealers/pincode?page=${currentPagePincode}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setPincodeList(response?.data?.data)
        let arr = response?.data?.data.map(n => n.pinCode)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          pincode: arr
        }))
        setPageCountPincode(response?.data?.totalPage)
        setCurrentPagePincode(response?.data?.currentPage)
        setSelectAllPincode(false)
      })
      .catch(err => {})
  }, [currentPagePincode])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/adminUserRoute/dealers/depo`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setDepoList(response?.data?.data)
        let arr = response?.data?.data.map(n => n.depo)
        setCustomSelectCoverage(prevState => ({
          ...prevState,
          depot: arr
        }))
      })
      .catch(err => {})
  }, [])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/adminUserRoute/dealers/depo`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setDepoList(response?.data?.data)
      })
      .catch(err => {})
  }, [])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/loyalty/loyaltyDealerGroups`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setUserCategory(response?.data?.DealerGroups)
      })
      .catch(err => {})
  }, [])
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/loyalty/loyaltyFleets?limit=500&type=${fleetValue}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setFleets(response?.data?.DealerGroups)
        setSelectedFleets(response?.data?.DealerGroups?.map(f => f._id))
      })
      .catch(err => {})
  }, [fleetValue])

  const handleKeyPress = e => {
    const allowedCharacters = /^[0-9]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <>
      {open ? <CustomeCouponPreview open={open} setOpen={setOpen} data={formData} type={'add'} /> : ''}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <Box
            sx={{
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <Typography variant='h4'>Create Coupon</Typography>
            <Divider />
            <div className={styles.card}>
              <div style={{ margin: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Typography variant='subtitle1'>Basic Details</Typography>
                <div>
                  <Controller
                    name='title'
                    control={control}
                    render={({ field }) => (
                      <>
                        <CustomTextField
                          label='Title*'
                          type='text'
                          fullWidth
                          {...field}
                          placeholder='Hyundai Holi Bonanza'
                          style={{ width: '380px' }}
                          error={errors.title}
                          helperText={errors.title && errors.title.message}
                        />
                      </>
                    )}
                  />
                </div>
                <div>
                  <div>
                    <Controller
                      name='description'
                      control={control}
                      render={({ field }) => (
                        <>
                          <CustomTextField
                            {...field}
                            label='Description*'
                            multiline
                            fullWidth
                            rows={5}
                            placeholder='Example - “For Hyundai customers in Delhi, applicable on UX Royale series in March 2024, offering Rs500 flat discount.”'
                            error={errors.description}
                            helperText={errors.description && errors.description.message}
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <Controller
                    name='couponRequired'
                    control={control}
                    render={({ field }) => (
                      <>
                        <CustomTextField
                          onKeyPress={handleKeyPress}
                          {...field}
                          fullWidth
                          sx={{ width: 400 }}
                          placeholder='2500'
                          min='0'
                          label='Number of Coupons Required*'
                          error={errors.couponRequired}
                          helperText={errors.couponRequired && errors.couponRequired.message}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
            <Divider />
            <div className={styles.card}>
              <div style={{ margin: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Typography variant='subtitle1'>Coupon Type</Typography>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12} md={4}>
                    <Controller
                      name='couponType'
                      control={control}
                      defaultValue=''
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          label='Select Coupon Type'
                          select
                          fullWidth
                          labelId='demo-simple-select-label'
                          id='demo-simple-select'
                          onChange={e => {
                            field.onChange(e.target.value)
                            setCouponType(e.target.value)
                            // setCouponValueServiceType("")
                          }}
                          displayEmpty
                          MenuProps={{
                            sx: {
                              '&& .Mui-selected': {
                                backgroundColor: '#2b96d26b'
                              }
                            }
                          }}
                          error={errors.couponType}
                          helperText={errors.couponType && errors.couponType.message}
                        >
                          {/* <MenuItem value='abc'>
                          Select Coupon Type
                        </MenuItem> */}
                          <MenuItem value={'SALE'}>Sale</MenuItem>
                          <MenuItem value={'EXTENDED WARRANTY'}>Extended Warranty</MenuItem>
                          <MenuItem value={'SERVICE'}>Service</MenuItem>
                        </CustomTextField>
                      )}
                    />
                  </Grid>

                  {couponType == 'SERVICE' ? (
                    <Grid item sm={6} xs={12} md={4}>
                      <Controller
                        name='services'
                        control={control}
                        defaultValue=''
                        render={({ field }) => (
                          <CustomTextField
                            select
                            {...field}
                            fullWidth
                            label='Select Service'
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            //   className={styles.customSelect}
                            displayEmpty
                            MenuProps={{
                              sx: {
                                '&& .Mui-selected': {
                                  backgroundColor: '#2b96d26b'
                                }
                              }
                            }}
                            error={errors.services}
                            helperText={errors.services && errors.services.message}
                          >
                            {/* <MenuItem value='' disabled>
                            Select Service
                          </MenuItem> */}
                            <MenuItem value={'Wheel balancing'}>Wheel balancing</MenuItem>
                            <MenuItem value={'Wheel alignment'}>Wheel alignment</MenuItem>
                            <MenuItem value={'Car wash'}>Car wash</MenuItem>
                            <MenuItem value={'Dry cleaning'}>Dry cleaning</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                  ) : (
                    ''
                  )}

                  {/* {(couponType == "SALE" || couponType == "EXTENDED WARRANTY" || couponType == "SERVICE") ?
                                        
                                        : ""} */}
                  {couponType == 'EXTENDED WARRANTY' ? (
                    <Grid item sm={6} xs={12} md={4}>
                      <Controller
                        name='monthValue'
                        control={control}
                        render={({ field }) => (
                          <>
                            <CustomTextField
                              fullWidth
                              {...field}
                              placeholder='2'
                              onKeyPress={handleKeyPress}
                              label='Enter Value in Months*'
                              error={errors.monthValue}
                              helperText={errors.monthValue && errors.monthValue.message}
                            />
                          </>
                        )}
                      />
                    </Grid>
                  ) : (
                    ''
                  )}
                  {couponType == 'SALE' ? (
                    <Grid item sm={6} xs={12} md={4}>
                      <Controller
                        name='couponValue'
                        control={control}
                        defaultValue=''
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            select
                            label='Select Value Type*'
                            labelId='demo-simple-select-label'
                            id='demo-simple-select'
                            // className={styles.customSelect}
                            onChange={e => {
                              field.onChange(e.target.value)
                              setCouponValueType(e.target.value)
                            }}
                            displayEmpty
                            MenuProps={{
                              sx: {
                                '&& .Mui-selected': {
                                  backgroundColor: '#2b96d26b'
                                }
                              }
                            }}
                            error={errors.couponValue}
                            helperText={errors.couponValue && errors.couponValue.message}
                          >
                            {/* <MenuItem value='' disabled>
                              Select Coupon Value
                            </MenuItem> */}
                            <MenuItem value={'Fixed Amount'}> Fixed Amount</MenuItem>
                            <MenuItem value={'Cashback'}>Cashback</MenuItem>
                            <MenuItem value={'Percentage'}>Percentage</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>
                  ) : (
                    ''
                  )}

                  <>
                    {couponType == 'SERVICE' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='couponValueService'
                          control={control}
                          defaultValue=''
                          render={({ field }) => (
                            <CustomTextField
                              select
                              label='Select Value Type*'
                              fullWidth
                              {...field}
                              labelId='demo-simple-select-label'
                              id='demo-simple-select'
                              //   className={styles.customSelect}
                              onChange={e => {
                                field.onChange(e.target.value)
                                setCouponValueServiceType(e.target.value)
                              }}
                              displayEmpty
                              MenuProps={{
                                sx: {
                                  '&& .Mui-selected': {
                                    backgroundColor: '#2b96d26b'
                                  }
                                }
                              }}
                              error={errors.couponValueService}
                              helperText={errors.couponValueService && errors.couponValueService.message}
                            >
                              {/* <MenuItem value='' disabled>
                                Select Coupon Value
                              </MenuItem> */}
                              <MenuItem value={'Fixed Amount'}> Fixed Amount</MenuItem>
                              <MenuItem value={'Bill Amount'}>Bill Amount</MenuItem>
                              <MenuItem value={'Percentage'}>Percentage off on bill</MenuItem>
                            </CustomTextField>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {couponValueServiceType == 'Fixed Amount' && couponType == 'SERVICE' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='serviceCouponAmount'
                          control={control}
                          render={({ field }) => (
                            <>
                              <CustomTextField
                                label='Enter Amount*'
                                fullWidth
                                onKeyPress={handleKeyPress}
                                {...field}
                                placeholder='Enter Amount'
                                error={errors.serviceCouponAmount}
                                helperText={errors.serviceCouponAmount && errors.serviceCouponAmount.message}
                              />
                            </>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {/* {couponValueServiceType == "Bill Amount" ?
                                            <Grid item sm={6} xs={12} md={4}>
                                                <FormControl fullWidth>
                                                    <div className={styles.label}>
                                                        <label htmlFor="">Please Upload Bill* {couponValueType == "Percentage" ? "(In Percentage)" : ""}</label>
                                                    </div>
                                                    <Controller
                                                        name="serviceCouponBill"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <>
                                                                <CustomTextField
                                                                    type="file"
                                                                    {...field}
                                                                    // placeholder="Enter Amount"
                                                                    onChange={e => field.onChange(handleFileSubmit(e))}
                                                                    
                                                                    style={{ padding: "14px" }}
                                                                />
                                                                {errors.serviceCouponBill && (
                                                                    <div className={styles.errorText}>{errors.serviceCouponBill.message}</div>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            : ""} */}
                    {couponValueServiceType == 'Percentage' && couponType == 'SERVICE' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='serviceCouponPercentageAmount'
                          control={control}
                          render={({ field }) => (
                            <>
                              <CustomTextField
                                fullWidth
                                label='Enter Amount (In Percentage)*'
                                onKeyPress={handleKeyPress}
                                {...field}
                                placeholder='Enter Amount'
                                error={errors.serviceCouponPercentageAmount}
                                helperText={
                                  errors.serviceCouponPercentageAmount && errors.serviceCouponPercentageAmount.message
                                }
                              />
                            </>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {couponType == 'SALE' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='discount'
                          control={control}
                          render={({ field }) => (
                            <>
                              <CustomTextField
                                fullWidth
                                label={`Enter Coupon Discount Amount* ${
                                  couponValueType == 'Percentage' ? '(In Percentage)' : ''
                                }`}
                                onKeyPress={handleKeyPress}
                                {...field}
                                placeholder='Enter Amount'
                                error={errors.discount}
                                helperText={errors.discount && errors.discount.message}
                              />
                            </>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {couponType == 'SALE' || couponType == 'EXTENDED WARRANTY' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='applicableOn'
                          control={control}
                          defaultValue=''
                          render={({ field }) => (
                            <CustomTextField
                              select
                              label='Select Coupon is applicable On*'
                              fullWidth
                              {...field}
                              labelId='demo-simple-select-label'
                              id='demo-simple-select'
                              //   className={styles.customSelect}
                              displayEmpty
                              MenuProps={{
                                sx: {
                                  '&& .Mui-selected': {
                                    backgroundColor: '#2b96d26b'
                                  }
                                }
                              }}
                              onChange={e => {
                                field.onChange(e.target.value)
                                setApplicableLevel(e.target.value)
                              }}
                              error={errors.applicableOn}
                              helperText={errors.applicableOn && errors.applicableOn.message}
                            >
                              {/* <MenuItem value='' disabled>
                                Select Applicable On
                              </MenuItem> */}
                              <MenuItem value={'Tyre Level'}> Tyre Level</MenuItem>
                              <MenuItem value={'Order Value'}> Order Value</MenuItem>
                            </CustomTextField>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {(couponType == 'SALE' && applicableLevel == 'Tyre Level') ||
                    (couponType == 'EXTENDED WARRANTY' && applicableLevel == 'Tyre Level') ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='coupenApplicableOnMaxTyre'
                          control={control}
                          render={({ field }) => (
                            <>
                              <CustomTextField
                                fullWidth
                                label='Applicable on Max Number of Tyres Per Coupon*'
                                {...field}
                                placeholder='Enter Amount'
                                onKeyPress={handleKeyPress}
                                error={errors.coupenApplicableOnMaxTyre}
                                helperText={
                                  errors.coupenApplicableOnMaxTyre && errors.coupenApplicableOnMaxTyre.message
                                }
                              />
                            </>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {couponType == 'SALE' || couponType == 'SERVICE' || couponType == 'EXTENDED WARRANTY' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='validStart'
                          control={control}
                          render={({ field }) => (
                            <>
                              <DatePickerWrapper>
                                <DatePicker
                                  selected={field.value ? new Date(field.value) : null}
                                  onChange={date => {
                                    field.onChange(date)
                                    setSelectedDate(date)
                                  }}
                                  minDate={new Date(currentDate)}
                                  placeholderText='Select Date'
                                  dateFormat='yyyy-MM-dd'
                                  customInput={
                                    <PickersCustomInput
                                      label='Valid From*'
                                      value={field.value ? new Date(field.value) : null}
                                      fullWidth
                                      error={errors.validStart}
                                      helperText={errors.validStart && errors.validStart.message}
                                    />
                                  }
                                />
                              </DatePickerWrapper>
                              {/* <CustomTextField
                                type='date'
                                {...field}
                                placeholder='Enter Amount'
                                min={currentDate}
                                onChange={e => {
                                  field.onChange(e.target.value)
                                  setSelectedDate(e.target.value)
                                }}
                              /> */}
                              {/* {errors.validStart && <div className={styles.errorText}>{errors.validStart.message}</div>} */}
                            </>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {couponType == 'SALE' || couponType == 'SERVICE' || couponType == 'EXTENDED WARRANTY' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='validEnd'
                          control={control}
                          render={({ field }) => (
                            <>
                              <DatePickerWrapper>
                                <DatePicker
                                  selected={field.value ? new Date(field.value) : null}
                                  onChange={date => {
                                    field.onChange(date)
                                  }}
                                  disabled={selectedDate === ''}
                                  minDate={new Date(selectedDate)}
                                  placeholderText='Select Date'
                                  dateFormat='yyyy-MM-dd'
                                  customInput={
                                    <PickersCustomInput
                                      label='Valid To*'
                                      value={field.value ? new Date(field.value) : null}
                                      fullWidth
                                      error={errors.validEnd}
                                      helperText={errors.validEnd && errors.validEnd.message}
                                    />
                                  }
                                />
                              </DatePickerWrapper>
                              {/* <CustomTextField type='date' {...field} placeholder='Enter Amount' min={selectedDate} />
                              {errors.validEnd && <div className={styles.errorText}>{errors.validEnd.message}</div>} */}
                            </>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                    {couponType == 'SERVICE' || couponType === 'EXTENDED WARRANTY' || couponType === 'SALE' ? (
                      <>
                        <Grid item sm={6} xs={12} md={4}>
                          <Controller
                            name='billRequired'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <CustomTextField
                                select
                                fullWidth
                                label='Is Bill Required*'
                                {...field}
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                // className={styles.customSelect}
                                // onChange={(e) => {
                                //     field.onChange(e.target.value);
                                //     setCouponType(e.target.value)
                                //     // setCouponValueServiceType("")
                                // }}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.billRequired}
                                helperText={errors.billRequired && errors.billRequired.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select bill
                                </MenuItem> */}
                                <MenuItem value={'Yes'}>Yes</MenuItem>
                                <MenuItem value={'No'}>No</MenuItem>
                              </CustomTextField>
                            )}
                          />
                        </Grid>
                      </>
                    ) : (
                      ''
                    )}
                    {couponType == 'SERVICE' || couponType === 'EXTENDED WARRANTY' || couponType === 'SALE' ? (
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='dealerAdjustment'
                          control={control}
                          defaultValue=''
                          render={({ field }) => (
                            <CustomTextField
                              {...field}
                              label='Dealer CN Adjustment*'
                              fullWidth
                              select
                              labelId='demo-simple-select-label'
                              id='demo-simple-select'
                              className={styles.customSelect}
                              displayEmpty
                              MenuProps={{
                                sx: {
                                  '&& .Mui-selected': {
                                    backgroundColor: '#2b96d26b'
                                  }
                                }
                              }}
                              error={errors.dealerAdjustment}
                              helperText={errors.dealerAdjustment && errors.dealerAdjustment.message}
                            >
                              {/* <MenuItem value='' disabled>
                                Select Dealer CN Adjustment
                              </MenuItem> */}
                              <MenuItem value={'daily'}>Daily</MenuItem>
                              <MenuItem value={'weekly'}>Weekly</MenuItem>
                              <MenuItem value={'monthly'}>Monthly</MenuItem>
                            </CustomTextField>
                          )}
                        />
                      </Grid>
                    ) : (
                      ''
                    )}
                  </>
                </Grid>
              </div>
            </div>
            <Divider />
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <Typography variant='subtitle1'>Product Category and Coverage (Optional)</Typography>
                  <div className={styles.miniText}>
                    <Typography variant='subtitle2'>
                      Please Note: In case coupon distributions and coverage is not configured, the coupon will be
                      applicable all over India and for all product types.
                    </Typography>
                  </div>
                </div>
                <div>
                  {!categoryCollapse ? (
                    <IconButton
                      size='small'
                      sx={{ color: 'text.secondary' }}
                      onClick={() => {
                        setCategoryCollapse(true)
                      }}
                    >
                      <Icon icon='tabler:chevron-down' fontSize={20} />
                    </IconButton>
                  ) : (
                    <IconButton
                      size='small'
                      sx={{ color: 'text.secondary' }}
                      onClick={() => {
                        setCategoryCollapse(false)
                      }}
                    >
                      <Icon icon='tabler:chevron-up' fontSize={20} />
                    </IconButton>
                  )}
                </div>
              </div>
              <Collapse in={categoryCollapse} timeout='auto' unmountOnExit>
                <div style={{ margin: '10px' }}>
                  <div>
                    <Grid container spacing={2}>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography htmlFor='tyreCategory' variant='body2'>
                              {' '}
                              Tyre Category
                            </Typography>
                          </div>
                          <Controller
                            name='tyreCategory'
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                              <Select
                                {...field}
                                size='small'
                                fullWidth
                                multiple
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                value={selectedTyreCategory}
                                renderValue={selected => selected.join(', ')}
                                // onChange={e => {
                                //   field.onChange(e.target.value)
                                //   console.log('>>', e.target.value)
                                //   // setCatData(e.target.value);
                                // }}
                                displayEmpty
                                error={errors.tyreCategory}
                                helperText={errors.tyreCategory && errors.tyreCategory.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Tyre categories
                                </MenuItem> */}
                                <MenuItem onClick={() => handelSelectAllTyreCategory()}>
                                  <Checkbox checked={selectAllTyreCategory} />
                                  <ListItemText primary={'Select all'} />
                                </MenuItem>
                                {tyreCategorys.map((n, i) => {
                                  return (
                                    <MenuItem
                                      key={i}
                                      value={n.Ydesc}
                                      onClick={() => handleSingleSelectTyreCategory(n.Ydesc, n.CatCode)}
                                    >
                                      <Checkbox checked={selectedTyreCategory.indexOf(n.Ydesc) > -1} />
                                      <ListItemText primary={n.Ydesc} />
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      {/* <Grid item sm={6} xs={12} md={3}>
                                                <FormControl fullWidth>
                                                    <div className={styles.label}>
                                                        <label htmlFor=""> Brand / Sub Brand</label>
                                                    </div>
                                                    <Controller
                                                        name="brandSubBrand"
                                                        control={control}
                                                        defaultValue=""
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                labelId="demo-simple-select-label"
                                                                id="demo-simple-select"
                                                                className={styles.customSelect}
                                                                displayEmpty
                                                                MenuProps={{
                                                                    sx: {"&& .Mui-selected":{
                                                                        backgroundColor: "#2b96d26b"
                                                                    }}
                                                                }}
                                                                
                                                            >
                                                                <MenuItem value="" disabled>
                                                                    Select Tyre Brand
                                                                </MenuItem>
                                                                <MenuItem value={"RANGER"}>RANGER</MenuItem>
                                                                <MenuItem value={"UX"}>UX</MenuItem>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.brandSubBrand && (
                                                        <div className={styles.errorText}>{errors.brandSubBrand.message}</div>
                                                    )}
                                                </FormControl>
                                            </Grid> */}
                      <Grid item sm={6} xs={12} md={3}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography htmlFor='tyreSize' variant='body2'>
                              Tyre Sizes
                            </Typography>
                          </div>
                          <Controller
                            name='tyreSize'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                {...field}
                                size='small'
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                multiple
                                value={selectedTyreSize1}
                                renderValue={selected => selected.join(', ')}
                                // onChange={e => {
                                //   field.onChange(e.target.value)
                                //   // setSizeData(e.target.value);
                                // }}
                                displayEmpty
                                disabled={!selectedTyreDesc.length > 0}
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: 'white'
                                    }
                                  }
                                }}
                                error={errors.tyreSize}
                                helperText={errors.tyreSize && errors.tyreSize.message}
                              >
                                {/* <MenuItem 
                                                                    onClick={selectAllTyreSizeHandle}>
                                                                    <Checkbox checked={selectAllTyreSize} />
                                                                    <ListItemText primary={"Select All"} />
                                                                </MenuItem> */}
                                {/* <MenuItem value='' disabled>
                                  Select Tyre Size
                                </MenuItem> */}
                                <MenuItem onClick={() => handleSelectAlltyreSize()}>
                                  <Checkbox checked={selectAllTyreSize} />
                                  <ListItemText primary={'Select All'} />
                                </MenuItem>
                                {tyreSize.map((n, i) => {
                                  return (
                                    <MenuItem key={i} value={n.size} onClick={() => handleSingleSelectTyreSize(n.size)}>
                                      <Checkbox checked={selectedTyreSize1.includes(n.size)} />
                                      <ListItemText primary={n.size + ' inch'} />
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item sm={6} xs={12} md={3}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography variant='body2' htmlFor=''>
                              {' '}
                              Tyre SKU
                            </Typography>
                          </div>
                          {/* <Controller
                                                        name="tyresku"
                                                        control={control}
                                                        defaultValue=""
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                labelId="demo-simple-select-label"
                                                                id="demo-simple-select"
                                                                className={styles.customSelect}
                                                                multiple
                                                            >
                                                                {
                                                                    skuList.map((n, i) => {
                                                                        return <MenuItem key={i} value={n.MatDesc}>
                                                                            {n.MatDesc}
                                                                        </MenuItem>
                                                                    })
                                                                }
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.tyresku && (
                                                        <div className={styles.errorText}>{errors.tyresku.message}</div>
                                                    )} */}
                          <div
                            style={
                              {
                                // margin: "0 2rem",
                                // marginTop: "1rem",
                                // width: "%",
                              }
                            }
                          >
                            <Button
                              variant='contained'
                              onClick={() => {
                                setSkuListModal(true)
                                // getlistofSKU(index);
                              }}
                              sx={{ display: 'flex', alignItems: 'center' }}
                              disabled={!selectedTyreSize1.length > 0}
                            >
                              Select SKU
                            </Button>
                          </div>
                        </FormControl>
                      </Grid>
                      <Modal
                        open={skuListModal}
                        onClose={() => {
                          setSkuListModal(false)
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setSkuListModal(false)
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of SKUs
                          </Typography>

                          <Box>
                            <CustomTextField
                              onChange={e => setSearchSkuTyre(e.target.value)}
                              value={searchskuTyre}
                              name='searchTerritory'
                              variant='outlined'
                              label='Search SKUs'
                              fullWidth
                              sx={{ mb: 3 }}
                            />
                            <Divider />
                            <div
                              style={{
                                display: 'grid',
                                // margin: '1rem 0 0 3rem',
                                gridTemplateColumns: '1fr 1fr',
                                gridAutoRows: 'min-content',
                                overflowY: 'scroll',
                                height: '70vh'
                              }}
                            >
                              {skuList.length > 0 ? (
                                <>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        // checked={true}
                                        checked={selectAllSKU}
                                        onChange={event => handleSelectAllSKUModal(event)}
                                        color='primary'
                                      />
                                    }
                                    label='Select All'
                                  />
                                  {skuList
                                    ?.filter(r => r?.MatDesc.toLowerCase().includes(searchskuTyre.toLowerCase()))
                                    ?.map(r => (
                                      <div key={r}>
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={selectedOneByOneSku.includes(r._id)}
                                              onChange={() => handleSKUSelection(r)}
                                              name={r.MatDesc}
                                            />
                                          }
                                          label={`${r.MatDesc}`}
                                        />
                                      </div>
                                    ))}
                                </>
                              ) : (
                                <CircularProgress />
                              )}
                            </div>
                          </Box>
                        </Box>
                      </Modal>
                      {/* <CustomDialog
                        show={skuListModal}
                        setShow={setSkuListModal}
                        title='List of SKU'
                        size='lg'
                        // open={skuListModal}
                        // onClose={() => {
                        //   setSkuListModal(false)
                        // }}
                        // style={{
                        //   display: 'flex',
                        //   justifyContent: 'center',
                        //   alignItems: 'center'
                        // }}
                      >
                        <Box>
                          <CustomTextField
                            onChange={e => setSearchSkuTyre(e.target.value)}
                            value={searchskuTyre}
                            name='searchTerritory'
                            variant='outlined'
                            label='Sku search'
                            fullWidth
                            sx={{ mb: 3 }}
                            
                          />
                          <Divider />
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllSKU}
                                  onChange={event => handleSelectAllSKUModal(event)}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {skuList && skuList.length > 0 ? (
                              skuList
                                ?.filter(r => r?.MatDesc.toLowerCase().includes(searchskuTyre.toLowerCase()))
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={selectedOneByOneSku.includes(r._id)}
                                          onChange={() => handleSKUSelection(r)}
                                          name={r.MatDesc}
                                        />
                                      }
                                      label={`${r.MatDesc}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </CustomDialog> */}
                    </Grid>
                  </div>
                  {couponType == 'EXTENDED WARRANTY' ? (
                    <div>
                      <FormControl component='fieldset'>
                        <div>
                          <Typography variant='subtitle1'>Is Warranty Registration Required?</Typography>
                        </div>
                        <div>
                          <Controller
                            name='isWarrantyRegistrationRequired'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <RadioGroup
                                {...field}
                                row
                                aria-labelledby='demo-row-radio-buttons-group-label'
                                name='row-radio-buttons-group'
                                sx={{ mb: 1 }}
                              >
                                <FormControlLabel
                                  value='yes'
                                  control={<Radio />}
                                  label='Yes'
                                  checked={couponType === 'EXTENDED WARRANTY'}
                                  className={styles.customRadio}
                                />
                                <FormControlLabel
                                  value='no'
                                  control={<Radio />}
                                  label='No'
                                  className={styles.customRadio}
                                />
                              </RadioGroup>
                            )}
                          />
                          {errors.isWarrantyRegistrationRequired && (
                            <Typography variant='body2'>{errors.isWarrantyRegistrationRequired.message}</Typography>
                          )}
                        </div>
                      </FormControl>
                    </div>
                  ) : (
                    ''
                  )}
                  {couponType == 'SALE' ? (
                    <div>
                      <FormControl component='fieldset'>
                        <div>
                          <Typography variant='subtitle1'>Is Warranty Registration Required?</Typography>
                        </div>
                        <div>
                          <Controller
                            name='isWarrantyRegistrationRequired'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <RadioGroup
                                {...field}
                                row
                                aria-labelledby='demo-row-radio-buttons-group-label'
                                name='row-radio-buttons-group'
                                sx={{ mb: 1 }}
                              >
                                <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                                <FormControlLabel value='no' control={<Radio />} label='No' />
                              </RadioGroup>
                            )}
                          />
                          {errors.isWarrantyRegistrationRequired && (
                            <div className={styles.errorText}>{errors.isWarrantyRegistrationRequired.message}</div>
                          )}
                        </div>
                      </FormControl>
                    </div>
                  ) : (
                    ''
                  )}
                  <div>
                    <Grid container spacing={2}>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography label htmlFor='coverage' variant='body2'>
                              {' '}
                              Coverage
                            </Typography>
                          </div>
                          <Controller
                            name='coverage'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                {...field}
                                fullWidth
                                size='small'
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                onChange={e => {
                                  field.onChange(e.target.value)
                                  // setCoverage(e.target.value)
                                  customeValSet(e.target.value)
                                }}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.coverage}
                                helperText={errors.coverage && errors.coverage.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Coverage
                                </MenuItem> */}
                                {schemeCoverage.map((n, i) => (
                                  <MenuItem value={n.value} key={i}>
                                    {n.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      {coverageVal == 'Zone' ? (
                        <Grid item sm={6} xs={12} md={4}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <Typography variant='body2' htmlFor='zone'>
                                {' '}
                                Zone
                              </Typography>
                            </div>
                            <Controller
                              name='zone'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  size='small'
                                  fullWidth
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                  error={errors.zone}
                                  helperText={errors.zone && errors.zone.message}
                                >
                                  {zonesList.map((n, i) => (
                                    <MenuItem key={i} value={n.value}>
                                      {n.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {coverageVal == 'Region' ? (
                        <Grid item sm={6} xs={12} md={4}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <Typography variant='body2' htmlFor='regions'>
                                Region
                              </Typography>
                            </div>
                            <Controller
                              name='regions'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  size='small'
                                  fullWidth
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                  error={errors.regions}
                                  helperText={errors.regions && errors.regions.message}
                                >
                                  {regionList.map((n, i) => (
                                    <MenuItem key={i} value={n.value}>
                                      {n.Name}-{n.PZone}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                            {errors.zone && <div className={styles.errorText}>{errors.zone.message}</div>}
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {coverageVal == 'Area' ? (
                        <Grid item sm={6} xs={12} md={3}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <label htmlFor=''> Area</label>
                            </div>
                            <Controller
                              name='areas'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                >
                                  {areaList.map((n, i) => (
                                    <MenuItem key={i} value={n.value}>
                                      {n.Name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                            {errors.zone && <div className={styles.errorText}>{errors.zone.message}</div>}
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {coverageVal == 'Territory' ? (
                        <Grid item sm={6} xs={12} md={3}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <label htmlFor=''> Territory</label>
                            </div>
                            <Controller
                              name='teritorys'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                >
                                  {territoriesList.map((n, i) => (
                                    <MenuItem key={i} value={n.territoryCode}>
                                      {n.territoryCode} {n.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                            {errors.zone && <div className={styles.errorText}>{errors.zone.message}</div>}
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {coverageVal == 'Pincode' ? (
                        <Grid item sm={6} xs={12} md={3}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <label htmlFor=''> Pincode</label>
                            </div>
                            <Controller
                              name='pincodes'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                >
                                  {pincodeList.map((n, i) => (
                                    <MenuItem key={i} value={n.pinCode}>
                                      {' '}
                                      {n.pinCode}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                            {errors.zone && <div className={styles.errorText}>{errors.zone.message}</div>}
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {coverageVal == 'Depo' ? (
                        <Grid item sm={6} xs={12} md={3}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <label htmlFor=''> Depot</label>
                            </div>

                            <Controller
                              name='depos'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                >
                                  {depoList.map((n, i) => (
                                    <MenuItem key={i} value={n.depo}>
                                      {' '}
                                      {n.depo}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                            {errors.zone && <div className={styles.errorText}>{errors.zone.message}</div>}
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      <Modal
                        open={customPopUp.zone}
                        onClose={() => {
                          setCustomePopup(prevState => ({
                            ...prevState,
                            zone: false
                          }))
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setCustomePopup(prevState => ({
                                ...prevState,
                                zone: false
                              }))
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Zone
                          </Typography>

                          <CustomTextField
                            onChange={e =>
                              setSearchCoverage(prevState => ({
                                ...prevState,
                                zone: e.target.value
                              }))
                            }
                            value={searchCoverage.zone}
                            name='searchTerritory'
                            variant='outlined'
                            label='Zone search'
                            fullWidth
                          />

                          <div style={{ borderBottom: '2px solid darkgrey' }}></div>
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllCoverage.zone}
                                  onChange={event => handleSelectAllInCoverage(event, 'zone')}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {zonesList && zonesList.length > 0 ? (
                              zonesList
                                ?.filter(r => {
                                  return (
                                    r?.value.toLowerCase().includes(searchCoverage?.zone.toLowerCase()) ||
                                    r?.label.toLowerCase().includes(searchCoverage?.zone.toLowerCase())
                                  )
                                })
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={customeSelectCoverage.zone.includes(r.value)}
                                          onChange={() => customeSelectCheckBox(r, 'zone')}
                                          name={r.label}
                                        />
                                      }
                                      label={`${r.label}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={customPopUp.region}
                        onClose={() => {
                          setCustomePopup(prevState => ({
                            ...prevState,
                            region: false
                          }))
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setCustomePopup(prevState => ({
                                ...prevState,
                                region: false
                              }))
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Region
                          </Typography>

                          <CustomTextField
                            onChange={e =>
                              setSearchCoverage(prevState => ({
                                ...prevState,
                                region: e.target.value
                              }))
                            }
                            value={searchCoverage.region}
                            name='searchTerritory'
                            variant='outlined'
                            label='Region search'
                            fullWidth
                          />

                          <div style={{ borderBottom: '2px solid darkgrey' }}></div>
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllCoverage.region}
                                  onChange={event => handleSelectAllInCoverage(event, 'region')}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {regionList && regionList.length > 0 ? (
                              regionList
                                ?.filter(
                                  r =>
                                    r?.Name.toLowerCase().includes(searchCoverage?.region.toLowerCase()) ||
                                    r?.PZone.toLowerCase().includes(searchCoverage?.region.toLowerCase())
                                )
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={customeSelectCoverage.region.includes(r.Name)}
                                          onChange={() => customeSelectCheckBox(r, 'region')}
                                          name={r.Name}
                                        />
                                      }
                                      label={`${r.Name} - ${r.PZone}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={customPopUp.area}
                        onClose={() => {
                          setCustomePopup(prevState => ({
                            ...prevState,
                            area: false
                          }))
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setCustomePopup(prevState => ({
                                ...prevState,
                                area: false
                              }))
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Area
                          </Typography>

                          <CustomTextField
                            onChange={e =>
                              setSearchCoverage(prevState => ({
                                ...prevState,
                                area: e.target.value
                              }))
                            }
                            value={searchCoverage.area}
                            name='searchTerritory'
                            variant='outlined'
                            label='Area search'
                            fullWidth
                          />

                          <div style={{ borderBottom: '2px solid darkgrey' }}></div>
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllCoverage.area}
                                  onChange={event => handleSelectAllInCoverage(event, 'area')}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {areaList && areaList.length > 0 ? (
                              areaList
                                ?.filter(r => r?.Name.toLowerCase().includes(searchCoverage?.area.toLowerCase()))
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={customeSelectCoverage.area.includes(r.Name)}
                                          onChange={() => customeSelectCheckBox(r, 'area')}
                                          name={r.Name}
                                        />
                                      }
                                      label={`${r.Name}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={customPopUp.territory}
                        onClose={() => {
                          setCustomePopup(prevState => ({
                            ...prevState,
                            territory: false
                          }))
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setCustomePopup(prevState => ({
                                ...prevState,
                                territory: false
                              }))
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Territory
                          </Typography>

                          <CustomTextField
                            onChange={e =>
                              setSearchCoverage(prevState => ({
                                ...prevState,
                                territory: e.target.value
                              }))
                            }
                            value={searchCoverage.territory}
                            name='searchTerritory'
                            variant='outlined'
                            label='Territory search'
                            fullWidth
                          />

                          <div style={{ borderBottom: '2px solid darkgrey' }}></div>
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllCoverage.territory}
                                  onChange={event => handleSelectAllInCoverage(event, 'territory')}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {territoriesList && territoriesList.length > 0 ? (
                              territoriesList
                                ?.filter(
                                  r =>
                                    r?.territoryCode
                                      .toString()
                                      .includes(searchCoverage.territory.toString().toLowerCase()) ||
                                    r?.name.includes(searchCoverage.territory.toLowerCase())
                                )
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={customeSelectCoverage.territory.includes(r.territoryCode)}
                                          onChange={() => customeSelectCheckBox(r, 'territory')}
                                          name={r.territoryCode}
                                        />
                                      }
                                      label={`${r.territoryCode} - ${r.name}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={customPopUp.pincode}
                        onClose={() => {
                          setCustomePopup(prevState => ({
                            ...prevState,
                            pincode: false
                          }))
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setCustomePopup(prevState => ({
                                ...prevState,
                                pincode: false
                              }))
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Pincode
                          </Typography>

                          <CustomTextField
                            onChange={e =>
                              setSearchCoverage(prevState => ({
                                ...prevState,
                                pincode: e.target.value
                              }))
                            }
                            value={searchCoverage.pincode}
                            name='searchTerritory'
                            variant='outlined'
                            label='pinCode search'
                            fullWidth
                          />

                          <div style={{ borderBottom: '2px solid darkgrey' }}></div>
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllCoverage.pincode}
                                  onChange={event => handleSelectAllInCoverage(event, 'pincode')}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {pincodeList && pincodeList.length > 0 ? (
                              pincodeList
                                ?.filter(r =>
                                  r?.pinCode.toLowerCase().includes(searchCoverage.pincode.toString().toLowerCase())
                                )
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={customeSelectCoverage.pincode.includes(r.pinCode)}
                                          onChange={() => customeSelectCheckBox(r, 'pincode')}
                                          name={r.pinCode}
                                        />
                                      }
                                      label={`${r.pinCode}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={customPopUp.depot}
                        onClose={() => {
                          setCustomePopup(prevState => ({
                            ...prevState,
                            depot: false
                          }))
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '80vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setCustomePopup(prevState => ({
                                ...prevState,
                                depot: false
                              }))
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Depot
                          </Typography>

                          <CustomTextField
                            onChange={e =>
                              setSearchCoverage(prevState => ({
                                ...prevState,
                                depot: e.target.value
                              }))
                            }
                            value={searchCoverage.depot}
                            name='searchTerritory'
                            variant='outlined'
                            label='Depot search'
                            fullWidth
                          />

                          <div style={{ borderBottom: '2px solid darkgrey' }}></div>
                          <div
                            style={{
                              display: 'grid',
                              margin: '1rem 0 0 3rem',
                              gridTemplateColumns: 'auto auto'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  // checked={true}
                                  checked={selectAllCoverage.depot}
                                  onChange={event => handleSelectAllInCoverage(event, 'depot')}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {depoList && depoList.length > 0 ? (
                              depoList
                                ?.filter(r => r?.depo.toLowerCase().includes(searchCoverage.depot.toLowerCase()))
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={customeSelectCoverage.depot.includes(r.depo)}
                                          onChange={() => customeSelectCheckBox(r, 'depot')}
                                          name={r.depo}
                                        />
                                      }
                                      label={`${r.depo}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                    </Grid>
                  </div>
                  <div>
                    <Grid container spacing={2}>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography variant='body2' htmlFor=''>
                              {' '}
                              Customer
                            </Typography>
                          </div>
                          <Controller
                            name='customer'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                {...field}
                                size='small'
                                fullWidth
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                onChange={e => {
                                  field.onChange(e.target.value)
                                  setCustomerVal(e.target.value)
                                  setAllDealers1([])
                                }}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.customer}
                                helperText={errors.customer && errors.customer.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Customers
                                </MenuItem> */}
                                <MenuItem value={'all'}>All Customers</MenuItem>
                                <MenuItem value={'dealers'}>Dealers</MenuItem>
                                <MenuItem value={'fleets'}>Fleets</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      {customerVal == 'dealers' ? (
                        <Grid item sm={6} xs={12} md={4}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <Typography variant='body2' htmlFor=''>
                                {' '}
                                Dealership type
                              </Typography>
                            </div>
                            <Controller
                              name='allDealers'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  size='small'
                                  fullWidth
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  value={allDealers1}
                                  renderValue={selected => selected.join(', ')}
                                  onChange={e => {
                                    field.onChange(e.target.value)
                                    // setAllDealers1(e.target.value);
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: 'white'
                                      }
                                    }
                                  }}
                                  error={errors.zone}
                                  helperText={errors.zone && errors.zone.message}
                                >
                                  {/* <MenuItem value='' disabled>
                                    Select dealers
                                  </MenuItem> */}
                                  <MenuItem onClick={() => handleSelectAllDealer()}>
                                    <Checkbox checked={selectAllDealer} />
                                    <ListItemText primary={'Select All'} />
                                  </MenuItem>
                                  {dealerGroupType1.map((n, i) => (
                                    <MenuItem
                                      key={i}
                                      value={n.main.value}
                                      onClick={() => handleSingleDealer(n.main.value)}
                                    >
                                      <Checkbox checked={allDealers1.includes(n.main.value)} />
                                      <ListItemText primary={n.main.label} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {allDealers1.includes('Dealers') ? (
                        <Grid item sm={6} xs={12} md={4}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <Typography htmlFor='' variant='body2'>
                                {' '}
                                Dealers
                              </Typography>
                            </div>
                            <Controller
                              name='subDealers'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  size='small'
                                  fullWidth
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  value={subDealer}
                                  renderValue={selected => selected.join(', ')}
                                  onChange={e => {
                                    field.onChange(e.target.value)
                                    // setSubDeler(e.target.value);
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: 'white'
                                      }
                                    }
                                  }}
                                  error={errors.zone}
                                  helperText={errors.zone && errors.zone.message}
                                >
                                  {/* <MenuItem value='' disabled>
                                    Select sub dealers
                                  </MenuItem> */}
                                  <MenuItem onClick={() => handleSelectAllSubDealer()}>
                                    <Checkbox checked={selectAllSubDealer} />
                                    <ListItemText primary={'Select All'} />
                                  </MenuItem>
                                  {dealerGroupType1[0].sub.map((n, i) => (
                                    <MenuItem
                                      key={i}
                                      value={n.value}
                                      onClick={() => handleSingleSelectAllSubDealer(n.value)}
                                    >
                                      <Checkbox checked={subDealer.includes(n.value)} />
                                      <ListItemText primary={n.label} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {allDealers1.includes('Dealer Groups') ? (
                        <Grid item sm={6} xs={12} md={4}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <Typography htmlFor='' variant='body2'>
                                {' '}
                                Select User Groups
                              </Typography>
                            </div>
                            <Controller
                              name='userGroup'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  size='small'
                                  fullWidth
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  multiple
                                  value={dealerGroup}
                                  renderValue={selected => selected.join(', ')}
                                  onChange={e => {
                                    field.onChange(e.target.value)
                                    // setDealerGroup(e.target.value);
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: 'white'
                                      }
                                    }
                                  }}
                                  error={errors.userGroup}
                                  helperText={errors.userGroup && errors.userGroup.message}
                                >
                                  {/* <MenuItem value='' disabled>
                                    Select User Groups
                                  </MenuItem> */}
                                  <MenuItem onClick={() => handleSelectAllDealerGroup()}>
                                    <Checkbox checked={selectAllDealerGroup} />
                                    <ListItemText primary={'Select All'} />
                                  </MenuItem>
                                  {userCategory.map((n, i) => (
                                    <MenuItem
                                      key={i}
                                      value={n.name}
                                      onClick={() => handleSingleSelectAllDealerGroup(n.name)}
                                    >
                                      <Checkbox checked={dealerGroup.includes(n.name)} />
                                      <ListItemText primary={n.name} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {customerVal == 'fleets' ? (
                        <Grid item sm={6} xs={12} md={3}>
                          <FormControl fullWidth>
                            <div className={styles.label}>
                              <Typography htmlFor='' variant='body2'>
                                {' '}
                                Select Fleets
                              </Typography>
                            </div>
                            <Controller
                              name='fleets'
                              control={control}
                              defaultValue=''
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  size='small'
                                  labelId='demo-simple-select-label'
                                  id='demo-simple-select'
                                  className={styles.customSelect}
                                  // multiple
                                  onChange={e => {
                                    field.onChange(e.target.value)
                                    setFleetValue(e.target.value)
                                  }}
                                  displayEmpty
                                  MenuProps={{
                                    sx: {
                                      '&& .Mui-selected': {
                                        backgroundColor: '#2b96d26b'
                                      }
                                    }
                                  }}
                                  error={errors.fleets}
                                  helperText={errors.fleets && errors.fleets.message}
                                >
                                  {/* <MenuItem value='' disabled>
                                    Select fleets
                                  </MenuItem> */}
                                  <MenuItem value={'custom'}>Custom List</MenuItem>
                                  <MenuItem value={'fleet'}>Fleets from SAP</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                        </Grid>
                      ) : (
                        ''
                      )}
                      {customerVal == 'fleets' ? (
                        <Grid item sm={6} xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', mt: 5 }}>
                          <Button variant='contained' onClick={() => setOpenFleetsModal(true)}>
                            Select Fleets
                          </Button>
                        </Grid>
                      ) : (
                        ''
                      )}
                      <Modal
                        open={openFleetsModal}
                        onClose={() => {
                          setOpenFleetsModal(false)
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            width: '75vw',
                            height: '90vh',
                            overflowY: 'scroll',
                            position: 'relative',
                            borderRadius: '10px'
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: '36px',
                              color: 'darkgray',
                              cursor: 'pointer',
                              position: 'absolute',
                              top: 0,
                              right: 0
                            }}
                            onClick={() => {
                              setOpenFleetsModal(false)
                            }}
                          />
                          <Typography variant='h3' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
                            List of Fleets
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <CustomTextField
                            onChange={e => setSearchFleet(e.target.value)}
                            value={searchFleet}
                            name='searchFleet'
                            variant='outlined'
                            label='Fleet Code'
                            fullWidth
                          />

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto auto',
                              marginLeft: '1rem'
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={allFleetsSelected}
                                  onChange={event => handleSelectAllFleets(event)}
                                  color='primary'
                                />
                              }
                              label='Select All'
                            />
                            {fleet && fleet?.length > 0 ? (
                              fleet
                                ?.filter(r => {
                                  if (r?.Kunnr && r?.Kunnr.toLowerCase().includes(searchFleet.toLowerCase())) {
                                    return true
                                  }
                                  if (!r?.Kunnr) {
                                    return true
                                  }
                                  return false
                                })
                                ?.map(r => (
                                  <div key={r}>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={selectedFleets.includes(r?._id) ? true : false}
                                          onChange={e => handleSelectedFleets(r._id)}
                                          name={r?.Kunnr}
                                        />
                                      }
                                      label={`${r?.Kunnr}  ${r?.Name1 ? '-' + r?.Name1 : ''}`}
                                    />
                                  </div>
                                ))
                            ) : (
                              <CircularProgress />
                            )}
                          </div>
                        </Box>
                      </Modal>
                      {/* <Grid item sm={6} xs={12} md={3}>
                                                <FormControl fullWidth>
                                                    <div className={styles.label}>
                                                        <label htmlFor="">  Dealership Type</label>
                                                    </div>
                                                    <Controller
                                                        name="dealershipType"
                                                        control={control}
                                                        defaultValue=""
                                                        render={({ field }) => (
                                                            <Select
                                                                {...field}
                                                                labelId="demo-simple-select-label"
                                                                id="demo-simple-select"
                                                                className={styles.customSelect}
                                                            >
                                                                <MenuItem value={10}>Ten</MenuItem>
                                                                <MenuItem value={20}>Twenty</MenuItem>
                                                                <MenuItem value={30}>Thirty</MenuItem>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.dealershipType && (
                                                        <div className={styles.errorText}>{errors.dealershipType.message}</div>
                                                    )}
                                                </FormControl>
                                            </Grid> */}
                    </Grid>
                  </div>
                </div>
              </Collapse>
            </div>
            <Divider />
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <Typography variant='subtitle1'>Managed Partners and Distribution (Optional)</Typography>
                  <div className={styles.miniText}>
                    <Typography variant='subtitle2'>
                      Please Note: In case coupon partners and distribution is not configured, the coupon will be
                      applicable for everyone who is in possession of the coupons.
                    </Typography>
                  </div>
                </div>
                <div>
                  {!partnerCollapse ? (
                    //   <TbTriangleInvertedFilled onClick={() => setPartnerCollapse(true)} />
                    <IconButton
                      size='small'
                      sx={{ color: 'text.secondary' }}
                      onClick={() => {
                        setPartnerCollapse(true)
                      }}
                    >
                      <Icon icon='tabler:chevron-down' fontSize={20} />
                    </IconButton>
                  ) : (
                    //   <TbTriangleFilled onClick={() => setPartnerCollapse(false)} />
                    <IconButton
                      size='small'
                      sx={{ color: 'text.secondary' }}
                      onClick={() => {
                        setPartnerCollapse(false)
                      }}
                    >
                      <Icon icon='tabler:chevron-up' fontSize={20} />
                    </IconButton>
                  )}
                </div>
              </div>
              <Collapse in={partnerCollapse} timeout='auto' unmountOnExit>
                <div style={{ margin: '10px' }}>
                  <div>
                    <Grid container spacing={2}>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography variant='body2' htmlFor=''>
                              Select partner
                            </Typography>
                          </div>
                          <Controller
                            name='partner'
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                              <Select
                                {...field}
                                fullWidth
                                size='small'
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                value={selectedManufacturer}
                                renderValue={selected => selected.join(', ')}
                                // onChange={e => {
                                //   field.onChange(e.target.value)
                                //   // setModelIdHandel(e.target.value);
                                // }}
                                multiple
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: 'white'
                                    }
                                  }
                                }}
                                error={errors.partner}
                                helperText={errors.partner && errors.partner.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Partner
                                </MenuItem> */}
                                <MenuItem onClick={() => handelSelectManufactrer()}>
                                  <Checkbox checked={selectAllManufacturer} />
                                  <ListItemText primary={'Select all'} />
                                </MenuItem>
                                {manufacturerList.map((n, i) => (
                                  <MenuItem
                                    key={i}
                                    value={n.manufacturer}
                                    onClick={() => handleSingleManufacturer(n.manufacturer)}
                                  >
                                    <Checkbox
                                      checked={selectedManufacturer.indexOf(n.manufacturer) > -1}
                                      // checked={true}
                                    />
                                    <ListItemText primary={n.manufacturer} />
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography variant='body2' htmlFor=''>
                              Model
                            </Typography>
                          </div>
                          <Controller
                            name='model'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                size='small'
                                fullWidth
                                {...field}
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.model}
                                helperText={errors.model && errors.model.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Model
                                </MenuItem> */}
                                {modelList.map((n, i) => (
                                  <MenuItem key={i} value={n}>
                                    {n}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography htmlFor='' variant='body2'>
                              {' '}
                              Variant
                            </Typography>
                          </div>
                          <Controller
                            name='variant'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                {...field}
                                fullWidth
                                size='small'
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.variant}
                                helperText={errors.variant && errors.variant.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Variant
                                </MenuItem> */}
                                <MenuItem value={'all'}>All</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </div>
                  <div className={styles.label}>
                    <FormControl component='fieldset'>
                      <div>
                        <Typography variant='body2' htmlFor='isRcRequired' className={styles.label}>
                          Is Vehicle RC Required?
                        </Typography>
                      </div>
                      <div>
                        <Controller
                          name='isRcRequired'
                          control={control}
                          defaultValue=''
                          render={({ field }) => (
                            <RadioGroup
                              {...field}
                              row
                              aria-labelledby='demo-row-radio-buttons-group-label'
                              name='row-radio-buttons-group'
                              sx={{ mb: 1 }}
                              error={errors.isRcRequired}
                              helperText={errors.isRcRequired && errors.isRcRequired.message}
                            >
                              <FormControlLabel value='yes' control={<Radio />} label='Yes' />
                              <FormControlLabel value='no' control={<Radio />} label='No' />
                            </RadioGroup>
                          )}
                        />
                        {/* {errors.isRcRequired && <div className={styles.errorText}>{errors.isRcRequired.message}</div>} */}
                      </div>
                    </FormControl>
                  </div>
                  <div>
                    <Grid container spacing={2}>
                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography variant='body2' htmlFor=''>
                              {' '}
                              Distribution Type
                            </Typography>
                          </div>
                          <Controller
                            name='distributionType'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                {...field}
                                size='small'
                                fullWidth
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.distributionType}
                                helperText={errors.distributionType && errors.distributionType.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Distribution Type
                                </MenuItem> */}
                                <MenuItem value={'export'}>Export</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>

                      <Grid item sm={6} xs={12} md={4}>
                        <FormControl fullWidth>
                          <div className={styles.label}>
                            <Typography htmlFor='' variant='body2'>
                              {' '}
                              Format
                            </Typography>
                          </div>
                          <Controller
                            name='format'
                            control={control}
                            defaultValue=''
                            render={({ field }) => (
                              <Select
                                {...field}
                                size='small'
                                fullWidth
                                labelId='demo-simple-select-label'
                                id='demo-simple-select'
                                className={styles.customSelect}
                                displayEmpty
                                MenuProps={{
                                  sx: {
                                    '&& .Mui-selected': {
                                      backgroundColor: '#2b96d26b'
                                    }
                                  }
                                }}
                                error={errors.format}
                                helperText={errors.format && errors.format.message}
                              >
                                {/* <MenuItem value='' disabled>
                                  Select Format
                                </MenuItem> */}
                                <MenuItem value={'excel'}>Excel</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item sm={6} xs={12} md={4}>
                        <Controller
                          name='couponDownloadPath'
                          control={control}
                          render={({ field }) => (
                            <>
                              <CustomTextField
                                label=' Notify when coupons are ready to be downloaded'
                                {...field}
                                fullWidth
                                placeholder='Enter Email to receive notification'
                                error={errors.couponDownloadPath}
                                helperText={errors.couponDownloadPath && errors.couponDownloadPath.message}
                              />
                            </>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </Collapse>
            </div>
            <Button type='submit' variant='contained' color='primary' sx={{ m: 1, width: 100 }}>
              Preview
            </Button>
          </Box>
        </Card>
      </form>
    </>
  )
}

export default Index
