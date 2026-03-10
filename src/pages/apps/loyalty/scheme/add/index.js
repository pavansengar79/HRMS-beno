/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Typography,
  TextField,
  Select,
  Button,
  MenuItem,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Modal,
  InputAdornment,
  Pagination,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  FormHelperText,
  ListItemText,
  Card
} from '@mui/material'

// import { backendUrl, jkmsfaUrl } from '../../utils/bakendUrl'
import { backendUrl, jkmsfaUrl } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'
import axios from 'axios'
import { useRouter } from 'next/router'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import toast from 'react-hot-toast'

const AddLoyaltyScheme = () => {
  const router = useRouter()
  const currentDate = new Date().toISOString().split('T')[0]
  const userName = 'applore_con'
  const password = 'ApSue^3aWbi2Suppo'

  const [fetchCategory, setFetchCategory] = useState([])
  const [userCategory, setUserCategory] = useState([])

  const [schemeValues, setSchemeValues] = useState({
    name: '',
    startDate: '',
    endDate: '',
    userType: '',
    fleetType: '',
    tyreCategory: [],
    categoryName: [],
    dealerType: [],
    userGroups: [],
    coverage: '',
    frequency: '',
    schemeType: '',
    dealerGroup: [],
    zones: [],
    regions: [],
    areas: []
  })

  const [tyreSizeSlab, setTyreSizeSlab] = useState([
    {
      tyreSize: [],
      skuList: [],
      tyreSlab: [
        {
          // clubName: "",
          // slabStartRange: "",
          // slabEndRange: "",
          // slabPoints: 0,
          // slabJump: 0,
        }
      ]
    }
  ])

  const [slabValues, setSlabValues] = useState([
    {
      slabName: '',
      slabStartRange: '',
      slabEndRange: '',
      tyreSize: [],
      tyreGroups: [],
      skuList: [],
      slabPoints: '',
      target: [],
      test: [],
      tyreBrands: [],
      extraPoints: [
        // {
        //   additionaldealerType: "",
        //   additionalPointType: "",
        //   additionalPointsValue: "",
        // },
      ]
    }
  ])

  const [slabTyres, setSlabTyres] = useState({
    tyreSize: [],
    skuList: []
  })

  const [createLoyaltyScheme, setCreateLoyaltyScheme] = useState(true)
  const [reviewScreen, setReviewScreen] = useState(false)

  const [additionalPointsData, setAdditionalPointsData] = useState([])

  const [extraPointBySize, setExtraPointsBySize] = useState([])
  const [extraPointByTyreBrand, setExtraPointsByTyreBrand] = useState([])
  const [premiumTyrePoint, setPremiumTyrePoint] = useState({})
  const [prmTyreLogic, setPrmTyreLogic] = useState('')

  const [extraPointsBrand, setExtraPointsBrand] = useState([])

  const [schemeErr, setschemeErr] = useState({
    name: false,
    startDate: false,
    endDate: false,
    tyreCategory: false,
    categoryName: false,
    dealerType: false,
    userGroups: false,
    coverage: false,
    frequency: false,
    schemeType: false,
    dealerGroup: false
  })

  const [slabErr, setSlabErr] = useState([
    {
      name: '',
      startRange: '',
      endRange: '',
      tyreCategory: '',
      point: ''
    }
  ])

  const [tyreSlabErr, setTyreSlabErr] = useState([{ tyreSize: false, skuList: false, tyreSlab: false }])

  const [tyreSizeGroup, setTyreSizeGroup] = useState([])

  const [tyreSizes, setTyreSizes] = useState([])
  const [selectedTyreSizes, setselectedTyreSizes] = useState([])
  const [selectedTyreSizesFleet, setselectedTyreSizesFleet] = useState([])
  const [selectAllTyreSizes, setSelectAllTyreSizes] = useState(false)
  const [selectAllTyreSizesFleet, setSelectAllTyreSizesFleet] = useState(false)

  const [skuList, setSkuList] = useState([])
  const [selectedSku, setselectedSku] = useState([])
  const [selectAllSKU, setSelectAllSKU] = useState(false)

  const [tyreSizesAP, setTyreSizesAP] = useState([])
  const [selectedTyreSizesAP, setselectedTyreSizesAP] = useState([])
  const [selectAllTyreSizesAP, setSelectAllTyreSizesAP] = useState(false)

  const [tyreBrands, setTyreBrands] = useState([])
  const [selectAllTyreBrand, setSelectAllTyreBrand] = useState(false)

  const [tyreCategories, setTyreCategories] = useState([])

  // const [tyreGroups, setTyreGroups] = useState([]);
  const [selectAllTyreGroups, setSelectAllTyreGroups] = useState(false)

  const [selectedProducts, setSelectedProducts] = useState([])
  const [slabValVisible, setSlabValueVisible] = useState(false)
  const [basicData, setBasicData] = useState(true)
  const [reviewScheme, setReviewScheme] = useState(false)
  const [extraPointsStep, setExtraPointsStep] = useState(false)

  const [territories, setTerritories] = useState([])
  const [selectedTerritories, setSelectedTerritories] = useState([])
  const [openDealersModal, setOpenDealersModal] = useState(false)
  const [openDepotModal, setOpenDepotModal] = useState(false)
  const [openFleetsModal, setOpenFleetsModal] = useState(false)
  const [depoList, setDepoList] = useState([])
  const [selectAllDepo, setSelectAllDepo] = useState(false)
  const [selectedDepos, setSelectedDepos] = useState([])

  const [openPincodeModal, setOpenPincodeModal] = useState(false)
  const [pincodeList, setPincodeList] = useState([])
  const [selectAllPincode, setSelectAllPincode] = useState(false)
  const [selectedPincodes, setSelectedPincodes] = useState([])
  const [currentPagePincode, setCurrentPagePincode] = useState(1)
  const [pageCountPincode, setPageCountPincode] = useState('')

  const [selectAllTerritory, setSelectAllTerritory] = useState(false)
  const [selectedTerritoriesList, setSelectedTerritoriesList] = useState([])
  const [openTerritoryModal, setOpenTerritoryModal] = useState(false)

  // const [selectedTerritory, setSelectedTerritories] = useState([]);

  const [dealersearch, setDealerSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState('')
  const [dealers, setDealers] = useState([])
  const [selectedDealers, setSelectedDealers] = useState([])

  const [fleet, setFleets] = useState([])
  const [selectedFleets, setSelectedFleets] = useState([])
  const [selectAllfleets, setselectAllfleets] = useState([])
  const [allFleetsSelected, setAllFleetsSelected] = useState(false)

  const [tyreBrandList, setTyreBrandList] = useState([])

  const [visible, setVisible] = useState(false)

  const [skuBrandWiseModal, setskuBrandWiseModal] = useState(false)
  const [skuListBrandWise, setskuListBrandWise] = useState([])
  const [selectedBrand, setSelectedBrand] = useState([])
  const [selectedBrandsku, setSelectedBrandsku] = useState([])
  const selectBrandRef = useRef(null)

  const [selectedUserType, setSelectedUserType] = useState([])
  const [userTypeVisible, setUserTypeVisible] = useState(false)
  const selectUserTypeRef = useRef(null)

  const [skuListModal, setSkuListModal] = useState(false)
  const [selectedSkuIndex, setSelectedSkuIndex] = useState(null)

  const [zoneModal, setZoneModal] = useState(false)
  const [regionModal, setRegionModal] = useState(false)
  const [areaModal, setAreaModal] = useState(false)

  const [selectallregions, setSelectAllRegions] = useState(false)
  const [selectallareas, setSelectAllAreas] = useState(false)

  const [selectAllBrandSku, setSelectAllBrandSku] = useState(false)
  const [filteredDepoCode, setFileterdDepoCode] = useState([])
  const [searchTerritory, setSearchTerritory] = useState('')
  const [filteredTerritory, setFileterdTerritory] = useState([])

  const [searchsku, setSearchsku] = useState('')
  const [searchskuTyre, setSearchSkuTyre] = useState('')
  const [searchDepoCode, setSearchDepoCode] = useState('')
  const [searchArea, setSearchArea] = useState('')
  const [searchRegion, setSearchRegion] = useState('')
  const [searchFleet, setSearchFleet] = useState('')

  const {
    name,
    startDate,
    endDate,
    tyreCategory,
    dealerType,
    userGroups,
    coverage,
    frequency,
    categoryName,
    dealerGroup,
    userType,
    fleetType,
    zones,
    regions,
    areas
  } = schemeValues

  const { slabName, slabStartRange, slabEndRange, tyreSize, slabPoints, schemeType } = slabValues

  const tyreBrand = [
    { value: 'Ranger', label: 'Ranger' },
    { value: 'Levitas', label: 'Levitas' },
    { value: 'UX', label: 'UX' },
    { value: 'Smart Tyre', label: 'Smart Tyre' },
    { value: 'Punture Guard', label: 'Punture Guard' }
  ]

  let fleetClubs = [
    { value: 'BLUE', label: 'BLUE' },
    { value: 'GOLD', label: 'GOLD' },
    { value: 'DIAMOND', label: 'DIAMOND' },
    { value: 'PLATINUM', label: 'PLATINUM' },
    { value: 'CHAIRMANS', label: 'CHAIRMANS' }
  ]

  const dealerCategoryType = [
    { value: 'Dealers', label: 'All Dealers' },
    { value: 'Dealer Groups', label: "Dealer's List" },
    { value: 'SX', label: 'SX' },
    { value: 'XW', label: 'XW' },
    { value: 'FXW', label: 'FXW' },
    { value: 'TWC', label: 'TWC' },
    { value: 'PTP', label: 'PTP' },
    { value: 'MBO/Distributor', label: 'MBO/Distributor' }
  ]

  const dealerGroupType = [
    {
      main: 'Dealers',
      sub: ['Dealer', 'SW', 'XW', 'FXW', 'TWC', 'PTP', 'MBO']
    },
    {
      main: 'Dealer Groups',
      sub: []
    },
    {
      main: 'Distributor',
      sub: []
    }
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

  const userTypes = [
    { value: 'Dealers', label: 'Dealers' },
    { value: 'Fleet', label: 'Fleets' }
  ]

  const fleetTypes = [
    { value: 'custom', label: 'Custom List' },
    { value: 'fleet', label: 'Fleets form SAP' }
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

  const dealerCategoryTypeFleet = [
    { value: 'Dealers', label: 'All Dealers' },
    { value: 'Fleet', label: 'Fleet Users' }
  ]

  const schemeCoverage = [
    { value: 'AllOverIndia', label: 'All Over India' },
    { value: 'Zone', label: 'Zonal Level' },
    { value: 'Region', label: 'Regional Level' },
    { value: 'Area', label: 'Area Level' },
    { value: 'Territory', label: 'Territory Level' },
    { value: 'Pincode', label: 'PIN code Level' },
    { value: 'Depo', label: 'Depot Level' }
  ]

  const pointFrequency = [
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Fortnightly', label: 'Fortnightly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' }
  ]

  const schemeTypeValues = [
    { value: 'TRANSACTIONAL', label: 'TRANSACTIONAL' },
    { value: 'BEHAVIOURAL', label: 'BEHAVIOURAL' }
  ]

  const additionalPoints = [
    { value: 'Points', label: 'Points' },
    { value: 'Multiple of Base Points', label: 'Multiple of Base Points' },
    { value: 'Percentage of Base Points', label: 'Percentage of Base Points' }
  ]

  const calculationLogic = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    console.log('tokeeen', token)
    axios
      .get(`${backendUrl}/product/getVehicleCategory`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        let arr = response?.data?.data
        if (userType === 'Dealers') {
          setFetchCategory(arr)
        } else if (userType === 'Fleet') {
          let obj1 = {
            CatCode: '11',
            Ydesc: 'TRUCK BIAS'
          }

          let obj2 = {
            CatCode: '12',
            Ydesc: 'TRUCK RADIAL'
          }

          // // arr.unshift(obj1);
          arr = [obj1, obj2]
          setFetchCategory(arr)
        }

        // setFetchCategory(arr);
      })
      .catch(err => {
        // setLoading(false);
        console.log(err)
      })
  }, [userType])

  console.log('schemeval', schemeValues)

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
      .catch(err => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    axios
      .get(`${jkmsfaUrl}/territory-list`, {
        headers: {
          Authorization: 'Basic ' + Buffer.from(userName + ':' + password).toString('base64')
        }
      })
      .then(response => {
        setTerritories(response?.data?.data)
      })
      .catch(err => {
        console.log(err)
      })
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
      .catch(err => {
        console.log(err)
      })
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
        setPageCountPincode(response?.data?.totalPage)
        setCurrentPagePincode(response?.data?.currentPage)
        setSelectAllPincode(false)
      })
      .catch(err => {
        console.log(err)
      })
  }, [currentPagePincode])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    let arr = []
    if (tyreSizesAP.length > 0) {
      let sizes = tyreSizesAP?.map(d => arr.push(d?.size))
    }
    axios
      .post(
        `${backendUrl}/product/getTyreSizes`,
        {
          Category: tyreCategories,
          sizeGroup: arr
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        setTyreSizes(response?.data?.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [tyreCategories, tyreSizesAP])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl}/product/getSKUlist`,
        {
          Category: tyreCategories,
          tyreSizes: selectedTyreSizes,
          categoryName: categoryName
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        setSkuList(response?.data?.data)
      })
      .catch(err => {
        console.log(err)
      })
  }, [tyreCategories, selectedTyreSizes])

  const getSKUlistByBrand = async () => {
    const token = localStorage.getItem('accessToken')

    let brandArr = [...selectedBrand.flatMap(item => [item.brand, ...item.subBrands])]

    axios
      .post(
        `${backendUrl}/product/getSKUlistByBrand`,
        {
          Category: tyreCategories,
          brand: brandArr
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        console.log('open', JSON.stringify(response?.data?.data))
        setskuListBrandWise(response?.data?.data)
        setSelectedBrandsku(response?.data?.data)
        setSelectAllBrandSku(true)
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    getSKUlistByBrand()
  }, [selectedBrand])

  console.log('sku list', skuListBrandWise)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl}/product/getTyreBrands`,
        { Category: tyreCategories },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        let filteredArray = response?.data?.data?.filter(item => item.brand !== '')
        setTyreBrandList(filteredArray)
      })
      .catch(err => {
        console.log(err)
      })
  }, [tyreCategories])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl}/product/getTyreSizeGroup`,
        { Category: tyreCategories, categoryName: categoryName },
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
        setTyreSizeGroup(arr)
      })
      .catch(err => {
        console.log(err)
      })
  }, [tyreCategories])

  // console.log("terr", JSON.stringify(territories));

  const Validate = () => {
    let value = true
    let err = {}

    if (name === '') {
      err.name = 'Please Enter Name.'
      value = false
    }

    if (startDate === '') {
      err.startDate = 'Please Enter Start date.'
      value = false
    }

    if (endDate === '') {
      err.endDate = 'Please Enter End Date.'
      value = false
    }

    if (tyreCategory.length === 0) {
      err.tyreCategory = 'Select Tyre Category.'
      value = false
    }
    if (categoryName === '') {
      err.categoryName = 'Please Enter Category Name.'
      value = false
    }

    if (selectUserTypeRef.length === 0) {
      err.dealerType = 'Please Select Dealer Type.'
      value = false
    }

    // if (coverage === "") {
    //   err.coverage = "Please Enter Coverage.";
    //   value = false;
    // }

    // if (schemeType === "") {
    //   err.schemeType = "Please Enter Scheme Type.";
    //   value = false;
    // }

    setschemeErr({ ...err })

    return value
  }

  const validateTyreSlab = () => {
    let value = true
    tyreSizeSlab?.map((slab, i) => {
      if (slab?.tyreSize.length === 0) {
        let data = [...tyreSlabErr]
        data[i].tyreSize = 'Select Tyre Size'
        setTyreSlabErr(data)
        value = false
      }
      if (slab?.skuList.length === 0) {
        let data = [...tyreSlabErr]
        data[i].skuList = 'Select SKUs.'
        setTyreSlabErr(data)
        value = false
      }
      if (
        slab?.tyreSlab[0].slabStartRange === '' ||
        slab?.tyreSlab[0].slabEndRange === '' ||
        slab?.tyreSlab[0].slabPoints === ''
      ) {
        let data = [...tyreSlabErr]
        data[i].tyreSlab = 'Slab fields are required.'
        setTyreSlabErr(data)
        value = false
      }
    })

    return value
  }

  let dealerstype = [
    { name: 'SW/XW', pointsType: true },
    { name: 'MBO', pointsType: true },
    { name: 'PTP', pointsType: true }

    // { name: "Premium Tyres", pointsType: true },
    // { name: "Warranty Registration", pointsType: false },
    // { name: "Claim Registration", pointsType: false },
  ]

  let dealerTypePremium = [
    { name: 'SW/XW', pointsType: true },
    { name: 'MBO', pointsType: true },
    { name: 'PTP', pointsType: true },
    { name: 'Premium Tyres', pointsType: true }

    // { name: "Warranty Registration", pointsType: false },
    // { name: "Claim Registration", pointsType: false },
  ]

  const handleChange = async e => {
    if (e.target.name === 'tyreCategory') {
      let data = fetchCategory.find(fetch => fetch._id === e.target.value)
      setSchemeValues({
        ...schemeValues,
        [e.target.name]: e.target.value.replace(/\s+/g, ' '),
        categoryName: data?.vehicletype
      })
      setTyreCategories(data?.catcode)

      return
    }
    if (e.target.value === 'Depo') {
      setOpenDepotModal(true)
    }
    if (e.target.value === 'Territory') {
      setOpenTerritoryModal(true)
    }
    if (e.target.value === 'Pincode') {
      setOpenPincodeModal(true)
    }
    if (e.target.value === 'Zone') {
      setZoneModal(true)
    }
    if (e.target.value === 'Region') {
      setRegionModal(true)
    }
    if (e.target.value === 'Area') {
      setAreaModal(true)
    }
    if (e.target.name === 'userType') {
      setTyreSizeSlab([
        {
          tyreSize: [],
          skuList: [],
          tyreSlab: [{}]
        }
      ])
      setSchemeValues(prev => ({
        ...prev,
        tyreCategory: [],
        categoryName: [],
        dealerType: [],
        dealerGroup: [],
        [e.target.name]: e.target.value.replace(/\s+/g, ' ')
      }))
      setTyreCategories([])

      return
    }
    setSchemeValues({
      ...schemeValues,
      [e.target.name]: e.target.value.replace(/\s+/g, ' ')
    })
  }

  console.log('scheme', schemeValues)

  const handleGetDealers = async type => {
    const token = localStorage.getItem('accessToken')
    let data = {}
    if (type === 'territory') {
      data.territory = selectedTerritories
    }

    // console.log("scheme values", schemeValues);
    if (schemeValues?.coverage === 'At a Territory Level') {
      data.territory = selectedTerritories
    } else if (schemeValues?.coverage === 'At a Depot Level') {
      data.depos = selectedDepos
    } else if (schemeValues?.coverage === 'At a PIN code Level') {
      console.log('At a PIN code Level')
      data.pincodes = selectedPincodes
    }
    await axios
      .post(`${backendUrl}/adminUserRoute/dealers/list?Pin=${currentPage}&search=${dealersearch}`, data, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setDealers(response?.data?.data)
        setCurrentPage(response?.data?.currentPage)
        setPageCount(response?.data?.totalPage)
      })
      .catch(err => {
        console.log('err')
      })
  }

  console.log('tyreslab', tyreSizeSlab)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    axios
      .get(`${backendUrl}/loyalty/loyaltyFleets?limit=500&type=${fleetType}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setFleets(response?.data?.DealerGroups)
      })
      .catch(err => {
        console.log('err')
      })
  }, [fleetType])

  const handleSelectedDealers = z => {
    // console.log("selected dealers");
    if (selectedDealers.includes(z)) {
      setSelectedDealers(selectedDealers.filter(zval => zval !== z))
    } else {
      setSelectedDealers([...selectedDealers, z])
    }
  }

  const handleSelectedFleets = z => {
    if (selectedFleets.includes(z)) {
      setSelectedFleets(selectedFleets.filter(zval => zval !== z))
    } else {
      setSelectedFleets([...selectedFleets, z])
    }
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
  }

  const handlePageChangePincode = (event, value) => {
    setCurrentPagePincode(value)
  }

  useEffect(() => {
    handleGetDealers()
  }, [dealersearch, currentPage])

  const addFieldsTyreSizeSlab = () => {
    let errObj = { tyreSize: false, skuList: false, tyreSlab: false }

    const firstObject = tyreSizeSlab[0]

    // const newObj = {
    //   ...firstObject,
    //   tyreSize: [],
    //   skuList: [],
    // };
    const newObj = {
      ...firstObject,
      tyreSize: [],
      skuList: [],
      tyreSlab: firstObject.tyreSlab.map(item => ({ ...item }))
    }

    let updatedTyreSizeSlab = [...tyreSizeSlab]

    const updatedTyreSizeGroup = tyreSizeGroup.filter(sizeObj => {
      return updatedTyreSizeSlab.every(slab => !slab.tyreSize.some(s => s.size === sizeObj.size))
    })

    setTyreSizeGroup(updatedTyreSizeGroup)

    // setTyreSizeSlab([...tyreSizeSlab, newObj]);
    setTyreSizeSlab(prevTyreSizeSlab => {
      const updatedTyreSizeSlab = [...prevTyreSizeSlab, newObj] // Create a new array by adding newOb

      return updatedTyreSizeSlab
    })

    // setSelectedProducts([...selectedProducts, selectedProducts[0]]);
    // setSlabErr([...slabErr, errObj]);
    setTyreSlabErr([...tyreSlabErr, errObj])
  }

  const addTyreSizeSlab = index => {
    console.log('tyreslab add', index)

    const newTyreSlabObject = {
      slabStartRange: '',
      slabEndRange: '',
      slabPoints: ''
    }

    setTyreSizeSlab(prevState => {
      const updatedTyreSizeSlab = prevState.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            tyreSlab: [...item.tyreSlab, { ...newTyreSlabObject }]
          }
        }

        return item
      })

      return updatedTyreSizeSlab
    })

    let errObj = {
      name: '',
      startRange: '',
      endRange: '',
      tyreCategory: '',
      point: ''
    }
  }

  const updateSlabProperty = (event, index, tyreSlabIndex) => {
    console.log('skyu', index, tyreSlabIndex)
    const { name, value } = event.target
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    console.log('index 1', updatedTyreSizeSlab[index].tyreSlab)
    updatedTyreSizeSlab[index].tyreSlab[tyreSlabIndex] = {
      ...updatedTyreSizeSlab[index].tyreSlab[tyreSlabIndex],
      [name]: value
    }
    setTyreSizeSlab(updatedTyreSizeSlab)
  }

  console.log('index val', tyreSizeSlab)

  const getlistofSKU = index => {
    console.log('tyreslab index', index, tyreSizeSlab[index].tyreSize)
    setSelectedSkuIndex(index)
    const token = localStorage.getItem('accessToken')
    axios
      .post(
        `${backendUrl}/product/getSKUlist`,
        {
          Category: tyreCategories,
          tyreSizes: tyreSizeSlab[index].tyreSize,
          categoryName: categoryName
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        console.log('sort', JSON.stringify(response?.data?.data))

        let arr = response?.data?.data.sort((a, b) => a.Productsize.localeCompare(b.Productsize))
        const updatedTyreSizeSlab = [...tyreSizeSlab]

        // updatedTyreSizeSlab[index].skuList = [];
        updatedTyreSizeSlab[index].skuList = arr
        setSelectAllSKU(true)
        setTyreSizeSlab(updatedTyreSizeSlab)
        setSkuList(arr)
      })
      .catch(err => {
        console.log(err)
      })
  }

  console.log('sky', tyreSizeSlab, selectedSkuIndex)

  const removeFields = index => {
    let data = [...slabValues]
    let data1 = [...selectedProducts]
    let errData = [...slabErr]
    data.splice(index, 1)
    data1.splice(index, 1)
    errData.splice(index, 1)
    setSlabValues(data)
    setSelectedProducts(data1)
    setSlabErr(errData)
  }

  console.log('tyreslab prmpo', selectedFleets)

  const removeFieldsTyreSlab = (index, idx) => {
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    updatedTyreSizeSlab[index] = {
      ...updatedTyreSizeSlab[index],
      tyreSlab: updatedTyreSizeSlab[index].tyreSlab.filter((_, i) => i !== idx)
    }

    setTyreSizeSlab(updatedTyreSizeSlab)
  }

  const handleUserGroup = data => {
    if (userGroups.includes(data)) {
      const updatedUserGroups = userGroups.filter(value => value !== data)
      setSchemeValues({
        ...schemeValues,
        userGroups: updatedUserGroups
      })
    } else {
      setSchemeValues({
        ...schemeValues,
        userGroups: [...userGroups, data]
      })
    }
  }

  const handleZones = data => {
    console.log('event', data, name)
    if (zones.includes(data.value)) {
      const updatedUserGroups = name.filter(value => value !== data.value)
      setSchemeValues({
        ...schemeValues,
        zones: updatedUserGroups
      })
    } else {
      setSchemeValues({
        ...schemeValues,
        zones: [...zones, data.value]
      })
    }
  }

  const handleRegions = data => {
    if (regions.includes(data.value)) {
      const updatedUserGroups = name.filter(value => value !== data.value)
      setSchemeValues({
        ...schemeValues,
        regions: updatedUserGroups
      })
    } else {
      setSchemeValues({
        ...schemeValues,
        regions: [...regions, data.value]
      })
    }
  }

  const handleAreas = data => {
    if (areas.includes(data.value)) {
      const updatedUserGroups = name.filter(value => value !== data.value)
      setSchemeValues({
        ...schemeValues,
        areas: updatedUserGroups
      })
    } else {
      setSchemeValues({
        ...schemeValues,
        areas: [...areas, data.value]
      })
    }
  }

  const handleSelectAllRegions = event => {
    const checked = event.target.checked
    setSelectAllRegions(checked)
    setSchemeValues({
      ...schemeValues,
      areas: checked ? areaList.map(r => r.value) : []
    })
  }

  const handleSelectAllAreas = event => {
    const checked = event.target.checked
    setSelectAllAreas(checked)
    setSchemeValues({
      ...schemeValues,
      areas: checked ? areaList.map(r => r.value) : []
    })
  }

  useEffect(() => {
    if (searchsku?.length) {
      let filterData = skuListBrandWise.filter(
        x => x.MatDesc.toLowerCase().includes(searchsku.toLowerCase())

        // x.email.toLowerCase().includes(searchsku.toLowerCase()) ||
        // (x?.phone ? x?.phone.toString() : '').includes(searchsku.toString())
      )
      setskuListBrandWise(filterData)
    } else {
      getSKUlistByBrand()
    }
  }, [searchsku])

  useEffect(() => {
    if (searchDepoCode.trim() === '') {
      setFileterdDepoCode(depoList)
    } else {
      const searchText = searchDepoCode.toLowerCase()

      const filteredDepos = depoList.filter(r => r?.depo.toLowerCase().includes(searchText))
      setFileterdDepoCode(filteredDepos)
    }
  }, [searchDepoCode, depoList])

  useEffect(() => {
    if (searchTerritory.trim() === '') {
      setFileterdTerritory(territories)
    } else {
      const searchText = searchTerritory.toLowerCase()

      const filteredDepos = territories.filter(
        r => r?.territoryCode.toLowerCase().includes(searchText) || r?.name.toLowerCase().includes(searchText)
      )
      setFileterdTerritory(filteredDepos)
    }
  }, [searchTerritory])

  console.log('eventv', schemeValues)

  const handleVehicleCategory = data => {
    if (tyreCategory.includes(data)) {
      const updatedUserGroups = tyreCategory.filter(value => value !== data)

      let updatedCatNames = categoryName.filter(value => value !== data?.Ydesc)
      setSchemeValues({
        ...schemeValues,
        tyreCategory: updatedUserGroups,
        categoryName: updatedCatNames
      })
      let category = tyreCategories
      category = category.filter(item => !data?.CatCode.includes(item))
      setTyreCategories(category)
    } else {
      setSchemeValues({
        ...schemeValues,
        tyreCategory: [...tyreCategory, data],
        categoryName: [...categoryName, data?.Ydesc]
      })
      setTyreCategories(prev => [...prev, data?.CatCode])
    }
  }

  console.log('handlevehi', schemeValues, tyreCategories)

  const handleDealerType = (categoryName, subBrands, type) => {
    console.log('subba', categoryName, subBrands)
    if (selectedUserType.includes(categoryName)) {
      // If the category is already selected, deselect it and its sub-brands
      setSelectedUserType(prevSelected =>
        prevSelected.filter(item => item !== categoryName && !subBrands.includes(item))
      )
    } else {
      // If the category is not selected, select it and its sub-brands
      setSelectedUserType(prevSelected => [...prevSelected, categoryName, ...subBrands])
    }
  }

  const handleTyreSizesSlab = (data, index) => {
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    const updatedTyreSizeArray = [...updatedTyreSizeSlab[index].tyreSize]
    const innerIndex = updatedTyreSizeArray.indexOf(data)

    if (innerIndex === -1) {
      updatedTyreSizeArray.push(data)
    } else {
      updatedTyreSizeArray.splice(innerIndex, 1)
    }
    updatedTyreSizeSlab[index] = {
      ...updatedTyreSizeSlab[index],
      tyreSize: updatedTyreSizeArray
    }
    setTyreSizeSlab(updatedTyreSizeSlab)
  }

  const handleskuListSlab = (data, index) => {
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    const updatedTyreSizeArray = [...updatedTyreSizeSlab[index].skuList]
    const innerIndex = updatedTyreSizeArray.indexOf(data)

    if (innerIndex === -1) {
      updatedTyreSizeArray.push(data)
    } else {
      updatedTyreSizeArray.splice(innerIndex, 1)
    }
    updatedTyreSizeSlab[index] = {
      ...updatedTyreSizeSlab[index],
      skuList: updatedTyreSizeArray
    }

    setTyreSizeSlab(updatedTyreSizeSlab)
  }

  const handleSKUSelection = sku => {
    const index = selectedSkuIndex
    if (index !== null) {
      // Get the selected tyre
      const selectedTyre = tyreSizeSlab[index]

      // Check if the SKU is in the selected SKU list for the selected tyre
      const selectedSkuIndex = selectedTyre.skuList.findIndex(s => s?.MatDesc === sku?.MatDesc)

      if (selectedSkuIndex === -1) {
        // If the SKU is not in the selected list, add it
        const updatedSelectedTyre = { ...selectedTyre }
        updatedSelectedTyre.skuList = [...selectedTyre.skuList, sku]

        // Update the selected tyre in the tyreSizeSlab array
        const updatedTyreSizeSlab = [...tyreSizeSlab]
        updatedTyreSizeSlab[index] = updatedSelectedTyre
        setTyreSizeSlab(updatedTyreSizeSlab)
      } else {
        // If the SKU is in the selected list, remove it
        const updatedSelectedTyre = { ...selectedTyre }
        updatedSelectedTyre.skuList.splice(selectedSkuIndex, 1)

        // Update the selected tyre in the tyreSizeSlab array
        const updatedTyreSizeSlab = [...tyreSizeSlab]
        updatedTyreSizeSlab[index] = updatedSelectedTyre
        setTyreSizeSlab(updatedTyreSizeSlab)
      }
    }
  }

  const handleTerritories = z => {
    const exist = selectedTerritories.find(a => a._id === z._id)
    if (exist) {
      selectedTerritories.map(as => {
        if (as._id == z._id) {
          let s = selectedTerritories.indexOf(as)

          const filteredItems = selectedTerritories.filter((value, index) => s != index)
          setSelectedTerritories(filteredItems)
        }
      })
    } else {
      setSelectedTerritories([...selectedTerritories, z])
    }
  }

  const handleSelectAllSKU = (event, index) => {
    const checked = event.target.checked
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    setSelectAllSKU(checked)
    if (checked) {
      updatedTyreSizeSlab[index] = {
        ...updatedTyreSizeSlab[index],
        skuList: skuList
      }
      setTyreSizeSlab(updatedTyreSizeSlab)
    } else {
      updatedTyreSizeSlab[index] = {
        ...updatedTyreSizeSlab[index],
        skuList: []
      }
      setTyreSizeSlab(updatedTyreSizeSlab)
    }
  }

  const handleSelectAllSKUModal = event => {
    const checked = event.target.checked
    let index = selectedSkuIndex
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    setSelectAllSKU(checked)
    console.log('skyin', index)
    if (checked) {
      updatedTyreSizeSlab[index] = {
        ...updatedTyreSizeSlab[index],
        skuList: skuList
      }
      setTyreSizeSlab(updatedTyreSizeSlab)

      // setSelectedSkuIndex(null)
    } else {
      updatedTyreSizeSlab[index] = {
        ...updatedTyreSizeSlab[index],
        skuList: []
      }
      setTyreSizeSlab(updatedTyreSizeSlab)

      // setSelectedSkuIndex(null)
    }

    // setSelectedSkuIndex(null)
  }

  const handleSelectAllTyreSizes = (event, index) => {
    const checked = event.target.checked
    const updatedTyreSizeSlab = [...tyreSizeSlab]
    setSelectAllTyreSizes(checked)
    if (checked) {
      updatedTyreSizeSlab[index] = {
        ...updatedTyreSizeSlab[index],
        tyreSize: tyreSizeGroup
      }
      setselectedTyreSizes(tyreSizeGroup)
      setTyreSizeSlab(updatedTyreSizeSlab)
    } else {
      updatedTyreSizeSlab[index] = {
        ...updatedTyreSizeSlab[index],
        tyreSize: []
      }
      setselectedTyreSizes(tyreSizeGroup)
      setTyreSizeSlab(updatedTyreSizeSlab)
    }
  }

  const handleSelectAllDepos = (event, index) => {
    const checked = event.target.checked
    setSelectAllDepo(checked)
    setSelectedDepos(checked ? depoList.map(r => r.depo) : [])
  }

  const handleSelectAllFleets = event => {
    const checked = event.target.checked
    setAllFleetsSelected(checked)
    setSelectedFleets(checked ? fleet.map(f => f._id) : [])
  }

  const handleSelectAllPincodes = (event, index) => {
    const checked = event.target.checked
    setSelectAllPincode(checked)
    setSelectedPincodes(checked ? pincodeList.map(r => r.pinCode) : [])
  }

  const handleSelectAllTerritories = (event, index) => {
    const checked = event.target.checked
    setSelectAllTerritory(checked)
    setSelectedTerritoriesList(checked ? territories.map(r => r.territoryCode) : [])
  }

  const handleSelectAllskuBrand = (event, index) => {
    const checked = event.target.checked
    setSelectAllPincode(checked)
    setSelectedPincodes(checked ? pincodeList.map(r => r.pinCode) : [])
  }

  const handleSelected = d => {
    if (selectedProducts.includes(d)) {
      setSelectedProducts(selectedProducts.filter(zval => zval !== d))
    } else {
      setSelectedProducts([...selectedProducts, d])
    }
  }

  const handleSelectedDepos = d => {
    if (selectedDepos.includes(d)) {
      setSelectedDepos(selectedDepos.filter(zval => zval !== d))
    } else {
      setSelectedDepos([...selectedDepos, d])
    }
  }

  const handleSelectedPincodes = d => {
    if (selectedPincodes.includes(d)) {
      setSelectedPincodes(selectedPincodes.filter(zval => zval !== d))
    } else {
      setSelectedPincodes([...selectedPincodes, d])
    }
  }

  const handleSelectedTerritories = d => {
    if (selectedTerritoriesList.includes(d)) {
      setSelectedTerritoriesList(selectedTerritoriesList.filter(zval => zval !== d))
    } else {
      setSelectedTerritoriesList([...selectedTerritoriesList, d])
    }
  }

  const handleSelectedBrandSku = d => {
    if (selectedBrandsku.includes(d)) {
      setSelectedBrandsku(selectedBrandsku.filter(zval => zval !== d))
    } else {
      setSelectedBrandsku([...selectedBrandsku, d])
    }
  }

  const handleSelectedAllBrandSku = event => {
    const checked = event.target.checked
    setSelectAllBrandSku(checked)
    setSelectedBrandsku(checked ? skuListBrandWise : [])
  }

  const checkTyreBrandValue = (p, text) => {
    let data = extraPointsBrand.find(obj => obj.tyre === p)
    let val
    if (text === 'value') {
      val = data?.additionalPointsValue
    } else if (text === 'type') {
      val = data?.additionalPointType
    }

    return val
  }

  const checkTyreSizeAPValue = (d, p, text) => {
    console.log('ppppp', d, p)
    let data = extraPointBySize.find(obj => obj.size === p.size)
    console.log('pppp', data)
    let val
    if (text === 'value') {
      data?.value.map(v => {
        if (v?.additionaldealerType === d?.name) {
          val = v?.additionalPointsValue
        }
      })
    } else if (text === 'type') {
      data?.value.map(v => {
        if (v?.additionaldealerType === d?.name) {
          val = v?.additionalPointType
        }
      })
    }

    return val
  }

  const handleExtraPointsByTyreBrand = (event, i, p) => {
    const { name, value } = event.target
    let data1 = [...extraPointByTyreBrand]
    setExtraPointsByTyreBrand([...data1])
  }

  const handleUpdateTyre = (event, tyre) => {
    const { name, value } = event.target
    const tyreIndex = extraPointsBrand.findIndex(item => item.tyre === tyre)

    if (tyreIndex !== -1) {
      const updatedExtraPointsBrand = [...extraPointsBrand]
      updatedExtraPointsBrand[tyreIndex] = {
        ...updatedExtraPointsBrand[tyreIndex],
        [name]: value
      }
      setExtraPointsBrand(updatedExtraPointsBrand)
    } else {
      setExtraPointsBrand([
        ...extraPointsBrand,
        {
          tyre,
          [name]: value
        }
      ])
    }
  }

  const handlePrmTyrePoints = event => {
    const { name, value } = event.target

    // setPremiumTyrePoint({ [name]: value });
    setPremiumTyrePoint(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const prmPointLogic = event => {
    const { name, value } = event.target
    setPrmTyreLogic(value)
  }

  const extraPointByTyreBrandLogic = (event, i, p) => {
    const { name, value } = event.target
    let data1 = [...extraPointByTyreBrand]
    let additionFlag = false

    console.log('extra log', name, value, p, i)
    if (data1[i]?.brand === p) {
      console.log('extra inside')
      data1[i].logic = value
    } else {
      // data1[i] = {
      //   brand: p,
      //   value: [
      //     {
      //       [name]: value,
      //       additionaldealerType: d.name,
      //     },
      //   ],
      // };
      data1[i].logic = value
      console.log('extra out')
    }
  }

  const valiadteSlab = () => {
    let value = true
    slabValues?.map((slab, i) => {
      if (slab?.slabName === '') {
        let data = [...slabErr]
        data[i].name = 'Name field is required.'
        setSlabErr(data)
        value = false
      }
      if (slab?.slabStartRange === '') {
        let data = [...slabErr]
        data[i].startRange = 'Start Range is required.'
        setSlabErr(data)
        value = false
      }
      if (slab?.slabEndRange === '') {
        let data = [...slabErr]
        data[i].endRange = 'End Range is required.'
        setSlabErr(data)
        value = false
      }
      if (slab?.slabPoints === '') {
        let data = [...slabErr]
        data[i].point = 'Slab Points are required.'
        setSlabErr(data)
        value = false
      }
    })

    return value
  }

  const handleSubmit = async () => {
    if (Object.keys(schemeValues).length === 0 || slabValues.length === 0) {
      alert('Some Fields are missing.')

      return
    }
    let data = {}
    data = schemeValues
    data.territories = selectedTerritoriesList
    data.depos = selectedDepos
    data.pincodes = selectedPincodes
    data.slabDetails = slabValues
    data.user = selectedDealers
    data.additionalPointsTyreSize = extraPointBySize
    data.additionalPointsBrand = extraPointByTyreBrand
    data.products = selectedSku.map(sku => sku._id)
    data.tyreSizes = selectedTyreSizes.map(s => s?.size)
    const token = localStorage.getItem('accessToken')
    console.log('data', data)

    // console.log("object scheme", schemeValues);
    // console.log("object slab", slabValues);
    // console.log("object tyre", selectedTyreSizes);
    // console.log("object sku", selectedSku);
    // console.log("object xtra size", extraPointBySize);
    // console.log("object xtra brnad", extraPointByTyreBrand);
    axios
      .post(`${backendUrl}/loyalty/create/loyaltyscheme`, data, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        // router.push("/LoyaltyScheme");
        toast.success(response.data.message, { duration: 2000 })
        location.reload()
      })
      .catch(err => {
        toast.error('error while creating', { duration: 2000 })
      })
  }

  const handleKeyPress = e => {
    const allowedCharacters = /^[0-9\b]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleKeyPressDecimal = e => {
    const allowedCharacters = /^[0-9\b.]+$/
    if (!allowedCharacters.test(e.key)) {
      e.preventDefault()
    }
  }

  // console.log("fleet rs", schemeValues);
  const containsCategory = category => {
    // s.vehicletype == r.vehicletype
    return true
  }

  const handleReviewScheme = () => {
    if (validateTyreSlab() || Validate()) {
      setCreateLoyaltyScheme(false)
      setReviewScreen(true)
    }
  }

  const handleViewScheme = () => {
    setCreateLoyaltyScheme(true)
    setReviewScreen(false)
  }

  const handleSaveScheme = () => {
    let data = {}
    data = schemeValues
    data.territories = selectedTerritoriesList
    data.depos = selectedDepos
    data.pincodes = selectedPincodes
    data.slabsByTyreSize = tyreSizeSlab
    data.additionalPointsBrand = extraPointsBrand
    data.prmTyrepoints = premiumTyrePoint
    data.prmTyreLogic = prmTyreLogic
    ;(data.fleetType = fleetType), (data.user = userType === 'Fleet' ? selectedFleets : selectedDealers)
    data.userType = userType
    data.dealerType = selectedUserType
    data.selectedSku = selectedBrandsku
    const token = localStorage.getItem('accessToken')

    console.log('final data', data)
    axios
      .post(`${backendUrl}/loyalty/create/loyaltyscheme`, data, {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        toast.success(response.data.message, { duration: 2000 })
        router.push('/apps/loyalty/scheme')
      })
      .catch(err => {
        if (err?.response?.data?.error?.code === 11000) {
          toast.error('scheme with same name already exists', { duration: 2000 })
        } else {
          toast.error(err?.response?.data?.message, { duration: 2000 })
        }
      })
  }

  // console.log("review", schemeValues, JSON.stringify(tyreSizeSlab));

  const toggleSubBrand = (subBrands, subBrandName) => {
    // Check if the sub-brand already exists, if yes, remove it, else add it
    if (subBrands.includes(subBrandName)) {
      return subBrands.filter(item => item !== subBrandName)
    } else {
      return [...subBrands, subBrandName]
    }
  }

  const toggleCategory = (categoryName, subBrands, type, allData) => {
    // if (selectedBrand.includes(categoryName)) {
    //   // If the category is already selected, deselect it and its sub-brands
    //   setSelectedBrand((prevSelected) =>
    //     prevSelected.filter(
    //       (item) => item !== categoryName && !subBrands.includes(item)
    //     )
    //   );
    // } else {
    //   // If the category is not selected, select it and its sub-brands
    //   setSelectedBrand((prevSelected) => [
    //     ...prevSelected,
    //     categoryName,
    //     ...subBrands,
    //   ]);
    // }

    if (type === 'brand') {
      // let val = tyreBrands;
      const doesBrandExist = selectedBrand.some(item => item.brand === allData.brand)
      if (doesBrandExist) {
        const updatedSelectedBrand = selectedBrand.filter(item => item.brand !== allData.brand)
        setSelectedBrand(updatedSelectedBrand)
        setTyreBrands(prev => prev.filter(brand => brand !== allData.brand))
      } else {
        setSelectedBrand(prev => [...prev, { brand: allData.brand, subBrands: allData.subBrand }])
        setTyreBrands(prev => [...prev, allData.brand])
      }

      // if (JSON.stringify(val).includes(JSON.stringify(categoryName))) {
      //   const updatedUserGroups = tyreBrands.filter(
      //     (brand) => brand !== categoryName
      //   );
      //   val = updatedUserGroups;
      //   setTyreBrands(val);
      //   // let arr = [...extraPointByTyreBrand];
      //   // let updated = arr.filter((item) => item.brand !== categoryName);
      //   // setExtraPointsByTyreBrand(updated);
      // } else {
      //   setTyreBrands((prev) => [...prev, categoryName]);
      // }
    }

    // if (type === "subbrand") {
    //   // Add the corresponding brand to tyreBrands
    //   setSelectedBrand((prev) => [...prev, brandName]);
    //   if (!tyreBrands.includes(brandName)) {
    //     setTyreBrands((prev) => [...prev, brandName]);
    //   }
    // }
    if (type === 'subbrand') {
      // Check if the brand exists in selectedBrand
      const doesBrandExist = selectedBrand.some(item => item.brand === allData.brand)

      if (doesBrandExist) {
        // If the brand exists, update the selectedBrand array
        const updatedSelectedBrand = selectedBrand.map(item =>
          item.brand === allData.brand
            ? {
                ...item,
                subBrands: toggleSubBrand(item.subBrands, categoryName)
              }
            : item
        )

        setSelectedBrand(updatedSelectedBrand)
      } else {
        // If the brand doesn't exist, add a new entry to selectedBrand
        setSelectedBrand(prev => [...prev, { brand: allData.brand, subBrands: [categoryName] }])
        setTyreBrands(prev => [...prev, allData.brand])
      }
    }
  }
  console.log('tyre arr 12', JSON.stringify(selectedBrand), tyreBrands)

  useEffect(() => {
    const handleClickOutside = event => {
      if (selectBrandRef.current && !selectBrandRef.current.contains(event.target)) {
        setVisible(false)
      }
      if (selectUserTypeRef.current && !selectUserTypeRef.current.contains(event.target)) {
        setUserTypeVisible(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <Card sx={{ padding: '2rem' }}>
      <>
        {createLoyaltyScheme ? (
          <>
            {basicData ? (
              <div
                style={{
                  padding: ' 2rem',
                  border: '1px solid darkgrey',
                  borderRadius: '5px',
                  marginRight: '1rem',
                  marginTop: '1rem'
                }}
              >
                <Typography>Enter Scheme Name</Typography>
                <TextField
                  name='name'
                  value={name}
                  label='Name'
                  onChange={handleChange}
                  sx={{ width: '30%', marginTop: '5px' }}
                  error={schemeErr.name}
                  helperText={schemeErr.name}
                />
                <Typography sx={{ marginTop: '20px' }}>Enter Scheme Period</Typography>
                <TextField
                  onChange={handleChange}
                  value={startDate}
                  name='startDate'
                  id='standard-basic'
                  variant='outlined'
                  type='date'
                  error={schemeErr.startDate}
                  helperText={schemeErr.startDate}
                />
                <TextField
                  onChange={handleChange}
                  value={endDate}
                  name='endDate'
                  id='standard-basic'
                  variant='outlined'
                  type='date'
                  style={{ marginLeft: '2rem' }}
                  error={schemeErr.endDate}
                  helperText={schemeErr.endDate}
                />

                <Typography sx={{ marginTop: '20px' }}>Select User Type</Typography>
                <TextField
                  select
                  name='userType'
                  value={userType}
                  onChange={handleChange}
                  label='Select an Option'
                  sx={{ width: '30%', marginTop: '5px' }}
                  error={schemeErr.schemeType}
                  helperText={schemeErr.schemeType}
                >
                  {userTypes.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* <Typography sx={{ marginTop: "20px" }}>Select Scheme Type</Typography>
            <TextField
              select
              name="schemeType"
              value={schemeType}
              onChange={handleChange}
              label="Select an Option"
              sx={{ width: "30%", marginTop: "5px" }}
              error={schemeErr.schemeType}
              helperText={schemeErr.schemeType}
            >
              {schemeTypeValues.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.value === "BEHAVIOURAL" ? true : false}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField> */}

                <Typography sx={{ marginTop: '20px' }}>Select Tyre Categories</Typography>
                <Select
                  labelId='demo-multiple-checkbox-label'
                  id='demo-multiple-checkbox'
                  multiple
                  value={tyreCategory}
                  label='User Groups'
                  sx={{ width: '30%', marginTop: '5px' }}
                  renderValue={tyreCategory => {
                    const data = tyreCategory.map(n => n?.Ydesc)

                    return data.join(', ')
                  }}
                  error={schemeErr.tyreCategory}
                  helperText={schemeErr.tyreCategory}
                >
                  {fetchCategory && fetchCategory?.length > 0 ? (
                    fetchCategory.map(r => (
                      <div key={r} style={{ marginLeft: '1rem' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                tyreCategory.find(s => {
                                  return s.Ydesc == r.Ydesc
                                })
                                  ? true
                                  : false
                              }
                              onChange={e => handleVehicleCategory(r)}
                              name={r.Ydesc}
                            />
                          }
                          label={`${r.Ydesc}`}
                        />
                      </div>
                    ))
                  ) : (
                    <CircularProgress />
                  )}
                </Select>
                {schemeErr.tyreCategory ? (
                  <FormHelperText style={{ color: 'red' }}>{schemeErr.tyreCategory}</FormHelperText>
                ) : null}

                {userType === 'Fleet' ? (
                  <>
                    <Typography sx={{ marginTop: '20px' }}>Select Fleet Type</Typography>
                    <TextField
                      select
                      name='fleetType'
                      value={fleetType}
                      onChange={handleChange}
                      sx={{ width: '30%', marginTop: '5px' }}
                      error={schemeErr.schemeType}
                      helperText={schemeErr.schemeType}
                    >
                      {fleetTypes.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant='contained'
                      onClick={() => {
                        setOpenFleetsModal(true)
                      }}
                      sx={{ marginLeft: '15px', marginTop: '1rem' }}
                    >
                      SELECT FLEETS
                    </Button>
                  </>
                ) : userType === 'Dealers' ? (
                  <div style={{ display: 'flex', width: '100%' }}>
                    <div style={{ width: '30%' }}>
                      <Typography sx={{ marginTop: '20px' }}>Select Dealer Types</Typography>
                      <div
                        style={{
                          width: '100%',
                          border: '1px solid darkgrey',
                          borderRadius: '4px',
                          height: '55px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onClick={() => setUserTypeVisible(!visible)}
                        ref={selectUserTypeRef}
                      >
                        <div style={{ marginLeft: '0.5rem' }}>
                          {selectedUserType.length === 0 ? (
                            <p>Select Dealer Type</p>
                          ) : (
                            <p>{selectedUserType.join(', ')}</p>
                          )}
                        </div>
                        {userTypeVisible ? (
                          <>
                            <div
                              style={{
                                width: '20%',
                                border: '1px solid darkgrey',
                                borderRadius: '3px',
                                zIndex: '5',
                                position: 'absolute',

                                // top: "2.5vh",
                                transform: 'translateY(-50%)',

                                // overflowY: "scroll",
                                // margin: "2.5vh 0",
                                backgroundColor: '#fff',
                                maxHeight: '95vh'
                              }}
                              onClick={event => {
                                event.stopPropagation()
                              }}
                            >
                              {dealerGroupType.map((item, index) => (
                                <div key={index}>
                                  <div onClick={() => handleDealerType(item.main, item.sub, 'main')}>
                                    <MenuItem value={item.main} style={{ padding: '0px' }}>
                                      <Checkbox checked={selectedUserType.includes(item.main)} color='primary' />
                                      <ListItemText primary={item.main} />
                                    </MenuItem>
                                  </div>

                                  {item.sub.map((subcat, subIndex) => (
                                    <div key={subIndex} onClick={() => handleDealerType(subcat, [], 'subbrand')}>
                                      <MenuItem
                                        key={subIndex}
                                        value={subcat}
                                        style={{
                                          marginLeft: '2rem',
                                          padding: '0px',
                                          marginTop: '-10px'
                                        }}
                                      >
                                        <Checkbox checked={selectedUserType.includes(subcat)} color='primary' />
                                        <ListItemText primary={<span>{subcat}</span>} />
                                      </MenuItem>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                      {schemeErr.dealerType ? (
                        <FormHelperText style={{ color: 'red' }}>{schemeErr.dealerType}</FormHelperText>
                      ) : null}
                    </div>

                    {selectedUserType.includes('Dealer Groups') ? (
                      <>
                        <div style={{ width: '100%' }}>
                          <Typography sx={{ marginTop: '20px', marginLeft: '1rem' }}>Select User Groups</Typography>
                          <Select
                            labelId='demo-multiple-checkbox-label'
                            id='demo-multiple-checkbox'
                            multiple
                            value={userGroups}
                            label='User Groups'
                            sx={{ width: '90%', marginLeft: '1rem' }}
                            renderValue={userGroups => {
                              const data = userGroups.map(n => n?.name)

                              return data.join(', ')
                            }}
                          >
                            {userCategory && userCategory?.length > 0 ? (
                              userCategory.map(r => (
                                <div key={r} style={{ marginLeft: '1rem' }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          userGroups.find(s => {
                                            return s.name == r.name
                                          })
                                            ? true
                                            : false
                                        }
                                        onChange={e => handleUserGroup(r)}
                                        name={r.name}
                                      />
                                    }
                                    label={`${r.name}`}
                                  />
                                </div>
                              ))
                            ) : (
                              <CircularProgress />
                            )}
                          </Select>
                        </div>
                      </>
                    ) : null}

                    {selectedUserType.length > 0 ? (
                      <div style={{ width: '40%', marginLeft: '1rem' }}>
                        <Typography sx={{ marginTop: '20px', marginLeft: '1rem' }}>Select Scheme Coverage</Typography>
                        <TextField
                          select
                          name='coverage'
                          value={coverage}
                          onChange={handleChange}
                          label='Select an Option'
                          sx={{ width: '90%', marginLeft: '1rem' }}
                        >
                          {schemeCoverage.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </div>
                    ) : null}

                    <div style={{ width: '65%', marginLeft: '2rem' }}>
                      <div style={{ display: 'flex' }}></div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {tyreSizeSlab.map((form, index) => {
              return (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    border: '2px solid grey',
                    marginTop: '15px',
                    marginRight: '1rem',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                    // style={{width:"50%"}}
                  > */}
                  <div
                    style={{
                      display: 'flex',

                      // justifyContent:"center",
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <div style={{ width: '30%', overflow: 'hidden' }}>
                      <Typography>Select Tyre Size (Inch Grouping)</Typography>
                      <Select
                        labelId='demo-multiple-checkbox-label'
                        id='demo-multiple-checkbox'
                        multiple
                        value={tyreSizeSlab[index]?.tyreSize}
                        sx={{ width: '100%', marginTop: '5px' }}
                        renderValue={() => {
                          const data = tyreSizeSlab[index]?.tyreSize.map(n => n?.size + ' inch').join(', ')

                          return data
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectAllTyreSizes}
                              onChange={event => handleSelectAllTyreSizes(event, index)}
                              color='primary'
                              style={{ marginLeft: '1rem' }}
                            />
                          }
                          label='Select All'
                        />
                        {tyreSizeGroup && tyreSizeGroup?.length > 0 ? (
                          tyreSizeGroup.map(r => (
                            <div key={r} style={{ marginLeft: '1rem' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={
                                      tyreSizeSlab[index].tyreSize?.find(s => {
                                        return s.size == r.size
                                      })
                                        ? true
                                        : false
                                    }
                                    onChange={e => handleTyreSizesSlab(r, index)}
                                    name={r?.size}
                                  />
                                }
                                label={`${r?.size !== null || undefined ? r?.size + ' inch' : 'OTHERS'}`}
                              />
                            </div>
                          ))
                        ) : (
                          <CircularProgress />
                        )}
                      </Select>
                      {tyreSlabErr[index].tyreSize ? (
                        <FormHelperText style={{ color: 'red' }}>{tyreSlabErr[index].tyreSize}</FormHelperText>
                      ) : null}
                    </div>

                    <div
                      style={{
                        margin: '0 2rem',
                        marginTop: '1rem',
                        width: '15%'
                      }}
                    >
                      <Button
                        variant='contained'
                        onClick={() => {
                          setSkuListModal(true)
                          getlistofSKU(index)
                        }}
                      >
                        SELECT SKU
                      </Button>
                    </div>
                  </div>
                  {/* </AccordionSummary> */}

                  {/* <AccordionDetails> */}
                  {form?.tyreSlab.map((f, idx) => {
                    return (
                      <div key={idx} style={{ display: 'flex' }}>
                        <div
                          style={{
                            display: 'flex',
                            marginTop: '10px',
                            width: '85%'
                          }}
                        >
                          {/* <div style={{ marginTop: "5px" }}> */}

                          {userType === 'Fleet' ? (
                            <>
                              <div style={{ width: '20%' }}>
                                <Typography>Club</Typography>
                                <TextField
                                  select
                                  name='clubName'
                                  value={f?.clubName}
                                  onChange={event => updateSlabProperty(event, index, idx)}
                                  label='Select an Option'
                                  sx={{ width: '90%', marginTop: '5px' }}
                                  error={slabErr[index]?.clubName}
                                  helperText={slabErr[index]?.clubName}
                                >
                                  {fleetClubs.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                                {/* <TextField
                                name="clubName"
                                value={f?.clubName}
                                label="Club Name"
                                onChange={(event) =>
                                  updateSlabProperty(event, index, idx)
                                }
                                sx={{ width: "90%", marginTop: "5px" }}
                                error={slabErr[index]?.clubName}
                                helperText={slabErr[index]?.clubName}
                              /> */}
                              </div>
                              <div style={{ width: '20%' }}>
                                <Typography>Min Offtake</Typography>
                                <TextField
                                  name='offtake'
                                  value={f?.offtake}
                                  label='Offtake'
                                  type='number'
                                  onChange={event => updateSlabProperty(event, index, idx)}
                                  sx={{ width: '90%', marginTop: '5px' }}
                                  onKeyPress={handleKeyPress}
                                  error={slabErr[index]?.clubName}
                                  helperText={slabErr[index]?.clubName}
                                />
                              </div>
                              {tyreCategory.map(cat => (
                                <div style={{ width: '20%' }} key={cat}>
                                  <Typography>Points {cat?.Ydesc === 'TRUCK BIAS' ? 'TBB' : 'TBR'}</Typography>
                                  <TextField
                                    name={cat?.Ydesc === 'TRUCK BIAS' ? 'TBB' : 'TBR'}
                                    value={f?.cat?.Ydesc}
                                    label={cat?.Ydesc === 'TRUCK BIAS' ? 'Points TBB' : 'Points TBR'}
                                    type='number'
                                    onChange={event => updateSlabProperty(event, index, idx)}
                                    sx={{ width: '90%', marginTop: '5px' }}
                                    error={slabErr[index]?.endRange}
                                    onKeyPress={handleKeyPress}
                                    helperText={slabErr[index]?.endRange}
                                  />
                                </div>
                              ))}
                              <div style={{ width: '20%' }}>
                                <Typography>Points Slab Jump</Typography>
                                <TextField
                                  name='slabJumpPoints'
                                  value={f?.slabJumpPoints}
                                  label='Slab Jump'
                                  type='number'
                                  onChange={event => updateSlabProperty(event, index, idx)}
                                  sx={{ width: '90%', marginTop: '5px' }}
                                  onKeyPress={handleKeyPress}
                                  error={slabErr[index]?.clubName}
                                  helperText={slabErr[index]?.clubName}
                                />
                              </div>
                            </>
                          ) : null}

                          {userType === 'Dealers' ? (
                            <>
                              <div style={{ width: '20%' }}>
                                <Typography>Offtake Start ({idx + 1})</Typography>
                                <TextField
                                  name='slabStartRange'
                                  value={f?.slabStartRange}
                                  label='Slab/Club Start Range'
                                  onChange={event => updateSlabProperty(event, index, idx)}
                                  sx={{ width: '90%', marginTop: '5px' }}
                                  onKeyPress={handleKeyPress}
                                  error={slabErr[index]?.startRange}
                                  helperText={slabErr[index]?.startRange}
                                />
                              </div>
                              <div style={{ width: '20%' }}>
                                <Typography>Offtake End ({idx + 1})</Typography>
                                <TextField
                                  name='slabEndRange'
                                  value={f?.slabEndRange}
                                  label='Slab/Club End Range'
                                  onChange={event => updateSlabProperty(event, index, idx)}
                                  sx={{ width: '90%', marginTop: '5px' }}
                                  error={slabErr[index]?.endRange}
                                  onKeyPress={handleKeyPress}
                                  helperText={slabErr[index]?.endRange}
                                />
                              </div>
                              <div style={{ width: '20%' }}>
                                <Typography>Assign Points</Typography>
                                <TextField
                                  name='slabPoints'
                                  value={f?.slabPoints}
                                  label='Slab Points'
                                  onChange={event => updateSlabProperty(event, index, idx)}
                                  sx={{ width: '100%', marginTop: '5px' }}
                                  onKeyPress={handleKeyPress}
                                  error={slabErr[index]?.point}
                                  helperText={slabErr[index]?.point}
                                />
                              </div>
                            </>
                          ) : null}
                        </div>
                        {idx !== 0 && idx === form?.tyreSlab.length - 1 ? (
                          <div
                            style={{
                              marginTop: '10px'
                            }}
                          >
                            <Button
                              variant='contained'
                              color='error'
                              style={{
                                marginTop: '33%',
                                height: '50%'
                              }}
                              onClick={() => removeFieldsTyreSlab(index, idx)}

                              // fullWidth
                            >
                              REMOVE
                            </Button>
                            {/* <AddCircleOutlineIcon /> */}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  {tyreSlabErr[index].tyreSlab ? (
                    <FormHelperText style={{ color: 'red' }}>{tyreSlabErr[index].tyreSlab}</FormHelperText>
                  ) : null}
                  {/* </AccordionDetails> */}

                  {/* {index === 0 ? ( */}
                  {/* <div > */}
                  {userType !== 'Fleet' ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {tyreSizeSlab[index].tyreSlab[tyreSizeSlab[index].tyreSlab.length - 1].slabEndRange !== '' &&
                      tyreSizeSlab[index].tyreSlab[tyreSizeSlab[index].tyreSlab.length - 1].slabStartRange !== '' ? (
                        <Button
                          variant='contained'
                          style={{ marginTop: '1rem', width: '150px' }}
                          onClick={() => addTyreSizeSlab(index)}
                        >
                          ADD SLAB
                        </Button>
                      ) : null}
                      <Tooltip
                        title='Slab start and end range are required.'
                        placement='bottom'
                        style={{
                          margin: '1rem 0 0 1rem',
                          fontSize: '2rem',
                          color: 'green'
                        }}
                      >
                        {/* <Button>bottom</Button> */}
                        <InfoOutlinedIcon
                          style={{
                            margin: '1rem 0 0 1rem',
                            color: 'red',
                            fontSize: '2rem'
                          }}
                        />
                      </Tooltip>
                    </div>
                  ) : (
                    <Button
                      variant='contained'
                      style={{ marginTop: '1rem', width: '150px' }}
                      onClick={() => addTyreSizeSlab(index)}
                    >
                      ADD SLAB
                    </Button>
                  )}
                </div>
              )
            })}
            {userType !== 'Fleet' ? (
              <Button
                variant='contained'
                style={{ margin: '25px 0' }}
                onClick={addFieldsTyreSizeSlab}

                // fullWidth
              >
                ADD TYRE SIZE GROUP
              </Button>
            ) : null}

            {userType === 'Dealers' ? (
              <>
                <div
                  style={{
                    padding: '1rem',
                    border: '1px solid green',
                    position: 'relative',
                    borderRadius: '5px',
                    marginRight: '1rem',
                    marginTop: '1rem'
                  }}
                >
                  <div style={{ width: '30%', overflow: 'hidden' }}>
                    <Typography>Assign Points for Special Tyres</Typography>
                  </div>
                  <div
                    style={{
                      marginTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%'

                      // border:"1px solid red"
                    }}
                  >
                    <div
                      style={{
                        width: '30%',
                        border: '1px solid darkgrey',
                        borderRadius: '3px',
                        height: '55px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => setVisible(!visible)}
                      ref={selectBrandRef}
                    >
                      <div style={{ marginLeft: '0.5rem' }}>
                        {selectedBrand.length === 0 ? (
                          <p>Select Tyre Brands</p>
                        ) : (
                          <p>{selectedBrand.map(item => [item.brand, ...item.subBrands].join(', ')).join(', ')}</p>
                        )}
                      </div>
                    </div>
                    {visible ? (
                      <>
                        <div
                          style={{
                            width: 'auto',
                            border: '1px solid darkgrey',
                            borderRadius: '3px',
                            zIndex: '5',
                            position: 'absolute',
                            top: '2.5vh',
                            transform: 'translateY(-50%)',
                            overflowY: 'scroll',

                            // margin: "2.5vh 0",
                            backgroundColor: '#fff',
                            maxHeight: '95vh'
                          }}
                          onClick={event => {
                            event.stopPropagation()
                          }}
                        >
                          {tyreBrandList.map((item, index) => (
                            <div key={index}>
                              <div onClick={() => toggleCategory(item.brand, item.subBrand, 'brand', item)}>
                                <MenuItem value={item.brand} style={{ padding: '0px' }}>
                                  <Checkbox
                                    checked={selectedBrand.some(brand => brand.brand === item.brand)}
                                    color='primary'
                                  />
                                  <ListItemText primary={item.brand} />
                                </MenuItem>
                              </div>

                              {item.subBrand.map((subcat, subIndex) => (
                                <div key={subIndex} onClick={() => toggleCategory(subcat, [], 'subbrand', item)}>
                                  <MenuItem
                                    key={subIndex}
                                    value={subcat}
                                    style={{
                                      marginLeft: '2rem',
                                      padding: '0px',
                                      marginTop: '-10px'
                                    }}
                                  >
                                    <Checkbox
                                      checked={selectedBrand.some(
                                        brand => brand.brand === item.brand && brand.subBrands.includes(subcat)
                                      )}
                                      color='primary'
                                    />
                                    <ListItemText primary={<span>{subcat}</span>} />
                                  </MenuItem>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                    <div
                      style={{
                        margin: '0 2rem',
                        width: '15%'
                      }}
                    >
                      <Button variant='contained' onClick={() => setskuBrandWiseModal(true)}>
                        SELECT SKU
                      </Button>
                    </div>
                  </div>

                  {tyreBrands && tyreBrands.length > 0 ? (
                    <div>
                      {tyreBrands.map((p, i) => (
                        <div key={i}>
                          <h4>{p}</h4>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto auto auto auto'
                            }}
                          >
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%'
                              }}
                            >
                              <div>
                                <TextField
                                  select
                                  name='additionalPointType'
                                  value={checkTyreBrandValue(p, 'type')}
                                  onChange={event => handleUpdateTyre(event, p)}
                                  label='Select an Option'
                                  sx={{ width: '60%', marginTop: '5px' }}
                                >
                                  {additionalPoints.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>

                                <TextField
                                  name='additionalPointsValue'
                                  value={checkTyreBrandValue(p, 'value')}
                                  label='Enter Value'
                                  onKeyPress={handleKeyPressDecimal}
                                  onChange={event => handleUpdateTyre(event, p)}
                                  sx={{ width: '30%', margin: '5px 0 0 1rem' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    padding: '1rem',
                    border: '1px solid darkgrey',
                    borderRadius: '5px',
                    marginRight: '1rem',
                    marginTop: '1rem'

                    // marginBottom: "1rem",
                  }}
                >
                  <Typography sx={{ mt: 1 }}>Assign Points for Premium Tyres</Typography>
                  <TextField
                    select
                    name='additionalPointType'
                    value={premiumTyrePoint.additionalPointType}
                    onChange={event => handlePrmTyrePoints(event)}
                    label='Select an Option'
                    sx={{ width: '60%', marginTop: '5px' }}
                  >
                    {additionalPoints.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    name='additionalPointsValue'
                    value={premiumTyrePoint.additionalPointsValue}
                    label='Enter Value'
                    onKeyPress={handleKeyPressDecimal}
                    onChange={event => handlePrmTyrePoints(event)}
                    sx={{ width: '30%', margin: '5px 0 0 1rem' }}
                  />
                </div>

                <div
                  style={{
                    padding: '1rem',
                    border: '1px solid darkgrey',
                    borderRadius: '5px',
                    marginRight: '1rem',
                    marginTop: '1rem',
                    display: 'flex'
                  }}
                >
                  <div style={{ width: '30%' }}>
                    <Typography sx={{ mt: 0 }}>Point Calculation Formula</Typography>

                    <TextField
                      select
                      name='frequency'
                      value={prmTyreLogic}
                      onChange={event => prmPointLogic(event)}
                      label='Logic Type'
                      sx={{ width: '100%' }}
                    >
                      {calculationLogic.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  <div style={{ marginLeft: '2rem' }}>
                    <p>AND : Will add points (premium tyre points & special tyre brand)</p>
                    <p>OR : Will Assign the highest value points from (premium tyre points OR special tyre brand)</p>
                  </div>
                </div>
              </>
            ) : null}

            <div
              style={{
                padding: '1rem',
                border: '1px solid darkgrey',
                borderRadius: '5px',
                marginRight: '1rem',
                marginTop: '1rem'
              }}
            >
              <Typography sx={{ mt: 0 }}>Point Calculation Frequency</Typography>

              <TextField select name='frequency' value={frequency} onChange={handleChange} sx={{ width: '30%' }}>
                {pointFrequency.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div style={{ margin: '15px', display: 'flex', justifyContent: 'end' }}>
              <Button variant='contained' onClick={handleReviewScheme}>
                REVIEW AND SAVE SCHEME
              </Button>
            </div>
          </>
        ) : null}

        {reviewScreen ? (
          <>
            <Typography variant='h5' sx={{ mt: '1rem' }}>
              Review Scheme
            </Typography>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'darkgray' }}>
                  <TableRow>
                    <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                      Scheme Name
                    </TableCell>
                    <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                      Duration
                    </TableCell>

                    <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                      Tyre Category
                    </TableCell>
                    <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                      Applicable For
                    </TableCell>
                    <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                      Coverage
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {schemeValues ? (
                    <TableRow key={schemeValues?.name}>
                      <TableCell align='left'>{schemeValues?.name}</TableCell>
                      <TableCell align='left'>
                        {schemeValues?.startDate} - {schemeValues.endDate}
                      </TableCell>
                      <TableCell align='center'>{schemeValues?.categoryName.map(c => c + ' ')}</TableCell>
                      <TableCell align='center'>
                        {userType === 'Fleet'
                          ? 'Fleet'
                          : schemeValues?.dealerType?.map((c, idx) =>
                              idx === schemeValues?.dealerType?.length - 1 ? c : c + ' / '
                            )}
                      </TableCell>
                      <TableCell align='left'>{schemeValues?.coverage}</TableCell>
                    </TableRow>
                  ) : (
                    <Box sx={{ textAlign: 'left', pt: 1 }}>
                      <Typography variant='h6' sx={{ p: 1 }}>
                        No Scheme Found.
                      </Typography>
                    </Box>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'darkgray' }}>
                  <TableRow>
                    <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                      Size (inch)
                    </TableCell>
                    {userType === 'Fleet' ? (
                      <>
                        <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%' }}>
                          Club Name
                        </TableCell>
                        <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%' }}>
                          Min Offtake
                        </TableCell>
                        <TableCell align='center' style={{ fontWeight: 'bolder', width: '25%' }}>
                          Points
                        </TableCell>
                        <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%' }}>
                          Slab Jump Points
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align='center' style={{ fontWeight: 'bolder', width: '15%' }}>
                          Slab Range
                        </TableCell>
                        <TableCell align='center' style={{ fontWeight: 'bolder', width: '10%' }}>
                          Slab Points
                        </TableCell>
                      </>
                    )}
                    {/* <TableCell align="center" sx={{ fontWeight: "bolder" }}>
                    Applicable For
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: "bolder" }}>
                    Coverage
                  </TableCell> */}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tyreSizeSlab && tyreSizeSlab?.length > 0 ? (
                    tyreSizeSlab?.map((d, idx) => (
                      <TableRow key={d._id}>
                        <TableCell align='left'>{d?.tyreSize.map(d => d.size + 'inch ')}</TableCell>

                        {userType === 'Fleet' ? (
                          <>
                            <TableCell align='center'>
                              {d?.tyreSlab && d?.tyreSlab.length > 0
                                ? d?.tyreSlab.map(v => (
                                    <TableRow key={v}>
                                      <TableCell align='center' sx={{ width: '15%' }}>
                                        {v?.clubName}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : null}
                            </TableCell>
                            <TableCell align='center'>
                              {d?.tyreSlab && d?.tyreSlab.length > 0
                                ? d?.tyreSlab.map(v => (
                                    <TableRow key={v}>
                                      <TableCell align='center' sx={{ width: '15%' }}>
                                        {v?.offtake}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : null}
                            </TableCell>
                            <TableCell align='center'>
                              {d?.tyreSlab && d?.tyreSlab.length > 0
                                ? d?.tyreSlab.map(v => (
                                    <TableRow key={v}>
                                      <TableCell align='center' sx={{ width: '25%' }}>
                                        {v?.TBB ? `TBB - ${v?.TBB}` : null} , {v?.TBR ? `TBR - ${v?.TBR}` : null}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : null}
                            </TableCell>
                            <TableCell align='center'>
                              {d?.tyreSlab && d?.tyreSlab.length > 0
                                ? d?.tyreSlab.map(v => (
                                    <TableRow key={v}>
                                      <TableCell align='center' sx={{ width: '15%' }}>
                                        {v?.slabJumpPoints}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : null}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell align='center'>
                              {d?.tyreSlab && d?.tyreSlab.length > 0
                                ? d?.tyreSlab.map(v => (
                                    <TableRow key={v}>
                                      <TableCell align='center' sx={{ width: '25%' }}>
                                        {v?.slabStartRange} - {v?.slabEndRange}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : null}
                            </TableCell>
                            <TableCell align='center'>
                              {d?.tyreSlab && d?.tyreSlab.length > 0
                                ? d?.tyreSlab.map(v => (
                                    <TableRow key={v}>
                                      <TableCell align='center' sx={{ width: '25%' }}>
                                        {v?.slabPoints}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                : null}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'left', pt: 1 }}>
                      <Typography variant='h6' sx={{ p: 1 }}>
                        No Scheme Found.
                      </Typography>
                    </Box>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {userType !== 'Fleet' ? (
              <>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'darkgray' }}>
                      <TableRow>
                        <TableCell align='left' sx={{ fontWeight: 'bolder' }}>
                          Tyre Brand
                        </TableCell>
                        <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                          Point Type
                        </TableCell>
                        <TableCell align='center' sx={{ fontWeight: 'bolder' }}>
                          Point Value
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {extraPointsBrand && extraPointsBrand?.length > 0
                        ? extraPointsBrand?.map((d, idx) => (
                            <TableRow key={d?.tyre}>
                              <TableCell align='left'>{d?.tyre}</TableCell>
                              <TableCell align='center'>{d?.additionalPointType}</TableCell>
                              <TableCell align='center'>{d?.additionalPointsValue}</TableCell>
                            </TableRow>
                          ))
                        : null}
                      {premiumTyrePoint ? (
                        <>
                          <TableCell align='left'>{'Premium Tyre Points'}</TableCell>
                          <TableCell align='center'>{premiumTyrePoint.additionalPointType}</TableCell>
                          <TableCell align='center'>{premiumTyrePoint.additionalPointsValue}</TableCell>
                        </>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant='h5' sx={{ mt: 2 }}>
                  Point Calculation logic : {prmTyreLogic}
                </Typography>
              </>
            ) : null}

            <Typography variant='h5' sx={{ mt: 2 }}>
              Point Calculation frequency : {frequency}
            </Typography>

            <div
              style={{
                padding: '1rem 0',
                display: 'flex',
                flexDirection: 'column',
                width: '20%'
              }}
            >
              <Button variant='contained' onClick={handleViewScheme}>
                EDIT SCHEME
              </Button>

              <Button variant='contained' onClick={handleSaveScheme} sx={{ mt: 1 }}>
                SAVE SCHEME
              </Button>
            </div>
          </>
        ) : null}

        <Modal
          open={openDealersModal}
          onClose={() => {
            setOpenDealersModal(false)
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
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of Dealers
            </Typography>
            <TextField
              value={dealersearch}
              name='search'
              variant='outlined'
              label='Dealer Code'
              onChange={e => setDealerSearch(e.target.value)}
              sx={{ width: '100%', mt: '10px', mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <div
              style={{
                display: 'grid',

                gridTemplateColumns: 'auto auto'
              }}
            >
              {dealers && dealers?.length > 0 ? (
                dealers.map(r => (
                  <div key={r}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedDealers.includes(r?._id) ? true : false}
                          onChange={e => handleSelectedDealers(r._id)}
                          name={r}
                        />
                      }
                      label={`${r.Kunnr}- ${r.Name1}`}
                    />
                  </div>
                ))
              ) : (
                <CircularProgress />
              )}
            </div>
            <Grid justifyContent={'center'} container p={2}>
              <Pagination align='center' count={pageCount} page={currentPage} onChange={handlePageChange} />
            </Grid>
          </Box>
        </Modal>

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
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of Fleets
            </Typography>
            <div style={{ borderBottom: '2px solid darkgrey', marginBottom: '1rem' }}></div>

            <TextField
              onChange={e => setSearchFleet(e.target.value)}
              value={searchFleet}
              name='searchFleet'
              variant='outlined'
              label='Fleet Code'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
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
            {/* <Grid justifyContent={"center"} container p={2}>
            <Pagination
              align="center"
              count={pageCount}
              page={currentPage}
              onChange={handlePageChange}
            />
          </Grid> */}
          </Box>
        </Modal>

        <Modal
          open={openDepotModal}
          onClose={() => {
            setOpenDepotModal(false)
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
              width: '50vw',
              height: '75vh',
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of Depos
            </Typography>

            <TextField
              onChange={e => setSearchDepoCode(e.target.value)}
              value={searchDepoCode}
              name='searchDepoCode'
              variant='outlined'
              label='Depo Code'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <div style={{ borderBottom: '2px solid darkgrey' }}></div>
            <div
              style={{
                display: 'grid',
                margin: '1rem 0 0 3rem',
                gridTemplateColumns: 'auto auto auto auto'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox checked={selectAllDepo} onChange={event => handleSelectAllDepos(event)} color='primary' />
                }
                label='Select All'
              />
              {filteredDepoCode && filteredDepoCode?.length > 0 ? (
                filteredDepoCode.map(r => (
                  <div key={r}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedDepos.includes(r?.depo) ? true : false}
                          onChange={e => handleSelectedDepos(r?.depo)}
                          name={r?.depo}
                        />
                      }
                      label={`${r?.depo}`}
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
          open={openTerritoryModal}
          onClose={() => {
            setOpenTerritoryModal(false)
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
              height: '75vh',
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of Territories
            </Typography>

            <TextField
              onChange={e => setSearchTerritory(e.target.value)}
              value={searchTerritory}
              name='searchTerritory'
              variant='outlined'
              label='Territory Code'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            <div style={{ borderBottom: '2px solid darkgrey' }}></div>
            <div
              style={{
                display: 'grid',
                margin: '1rem 0 0 3rem',
                gridTemplateColumns: 'auto auto auto'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllTerritory}
                    onChange={event => handleSelectAllTerritories(event)}
                    color='primary'
                  />
                }
                label='Select All'
              />
              {territories && territories?.length > 0 ? (
                territories
                  ?.filter(
                    r =>
                      r?.territoryCode.toLowerCase().includes(searchTerritory.toLowerCase()) ||
                      r?.name.toLowerCase().includes(searchTerritory.toLowerCase())
                  )
                  ?.map(r => (
                    <div key={r}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              selectedTerritoriesList.find(s => {
                                return s == r?.territoryCode
                              })
                                ? true
                                : false
                            }
                            onChange={e => handleSelectedTerritories(r?.territoryCode)}
                            name={r.name}
                          />
                        }
                        label={`${r?.territoryCode}- ${r.name}`}
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
          open={openPincodeModal}
          onClose={() => {
            setOpenPincodeModal(false)
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
              width: '50vw',
              height: '75vh'

              // overflowY: "scroll",
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of Pincodes
            </Typography>

            <div style={{ borderBottom: '2px solid darkgrey' }}></div>
            <div
              style={{
                display: 'grid',
                margin: '1rem 0 0 3rem',
                gridTemplateColumns: 'auto auto auto'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllPincode}
                    onChange={event => handleSelectAllPincodes(event)}
                    color='primary'
                  />
                }
                label='Select All'
              />
              {pincodeList && pincodeList?.length > 0 ? (
                pincodeList.map(r => (
                  <div key={r}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedPincodes.includes(r?.pinCode) ? true : false}
                          onChange={e => handleSelectedPincodes(r?.pinCode)}
                          name={r?.pinCode}
                        />
                      }
                      label={`${r?.pinCode}`}
                    />
                  </div>
                ))
              ) : (
                <CircularProgress />
              )}
            </div>
            <Grid justifyContent={'center'} container p={2}>
              <Pagination
                align='center'
                count={pageCountPincode}
                page={currentPagePincode}
                onChange={handlePageChangePincode}
              />
            </Grid>
          </Box>
        </Modal>

        <Modal
          open={skuBrandWiseModal}
          onClose={() => {
            setskuBrandWiseModal(false)
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
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of SKU Brand Specific
            </Typography>

            <TextField
              onChange={e => setSearchsku(e.target.value)}
              value={searchsku}
              name='searchsku'
              variant='outlined'
              label='Mat Desc'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
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
                    checked={selectAllBrandSku}
                    onChange={event => handleSelectedAllBrandSku(event)}
                    color='primary'
                  />
                }
                label='Select All'
              />
              {skuListBrandWise && skuListBrandWise?.length > 0 ? (
                skuListBrandWise.map(r => (
                  <div key={r}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            selectedBrandsku.find(s => {
                              return s.MatDesc == r.MatDesc
                            })
                              ? true
                              : false
                          }
                          onChange={e => handleSelectedBrandSku(r)}
                          name={r?.MatDesc}
                        />
                      }
                      label={`${r?.MatDesc}`}
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
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              List of SKU
            </Typography>

            <TextField
              onChange={e => setSearchSkuTyre(e.target.value)}
              value={searchskuTyre}
              name='searchTerritory'
              variant='outlined'
              label='Sku search'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
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
                  <Checkbox checked={selectAllSKU} onChange={event => handleSelectAllSKUModal(event)} color='primary' />
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
                            checked={
                              selectedSkuIndex !== null &&
                              tyreSizeSlab[selectedSkuIndex]?.skuList?.filter(sku => sku._id === r._id)[0]?._id
                            }
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
        </Modal>

        <Modal
          open={zoneModal}
          onClose={() => {
            setZoneModal(false)
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
              padding: '1rem 2rem'
            }}
          >
            <Typography variant='h5' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              Select Zone
            </Typography>

            <div style={{ borderBottom: '2px solid darkgrey', marginBottom: '1rem' }}></div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto'
              }}
            >
              {zonesList && zonesList?.length > 0 ? (
                zonesList?.map(r => (
                  <div key={r}>
                    <FormControlLabel
                      control={
                        <Checkbox checked={zones?.includes(r.value)} onChange={() => handleZones(r)} name={'zones'} />
                      }
                      label={`${r?.label}`}
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
          open={regionModal}
          onClose={() => {
            setRegionModal(false)
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
              padding: '1rem 2rem'
            }}
          >
            <Typography variant='h5' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              Select Regions
            </Typography>

            <TextField
              onChange={e => setSearchRegion(e.target.value)}
              value={searchRegion}
              name='searchTerritory'
              variant='outlined'
              label='Region Code'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            <div style={{ borderBottom: '2px solid darkgrey', marginBottom: '1rem' }}></div>
            <div
              style={{
                display: 'grid',
                margin: '1rem 0 0 0rem',
                gridTemplateColumns: 'auto auto auto'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ ml: 2 }}
                    checked={selectallregions}
                    onChange={event => handleSelectAllRegions(event)}
                    color='primary'
                  />
                }
                label='Select All'
              />
              {regionList && regionList?.length > 0 ? (
                regionList
                  ?.filter(r => r?.Name.toLowerCase().includes(searchRegion.toLowerCase()))
                  ?.map(r => (
                    <div key={r} style={{ padding: '0 1rem' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={regions?.includes(r.value)}
                            onChange={() => handleRegions(r)}
                            name={'regions'}
                          />
                        }
                        label={`${r?.Name}`}
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
          open={areaModal}
          onClose={() => {
            setAreaModal(false)
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
              width: '80%',
              height: '80%',
              overflowY: 'scroll'
            }}
          >
            <Typography variant='h4' sx={{ p: 1 }} style={{ textAlign: 'center' }}>
              Select Area
            </Typography>

            <TextField
              onChange={e => setSearchArea(e.target.value)}
              value={searchArea}
              name='searchTerritory'
              variant='outlined'
              label='Area Code'
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            <div style={{ borderBottom: '2px solid darkgrey' }}></div>
            <div
              style={{
                display: 'grid',
                margin: '1rem 0 0 3rem',
                gridTemplateColumns: 'auto auto auto auto'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox checked={selectallareas} onChange={event => handleSelectAllAreas(event)} color='primary' />
                }
                label='Select All'
              />
              {areaList && areaList?.length > 0 ? (
                areaList
                  ?.filter(r => r?.Name.toLowerCase().includes(searchArea.toLowerCase()))
                  .map(r => (
                    <div key={r}>
                      <FormControlLabel
                        control={
                          <Checkbox checked={areas.includes(r?.value)} onChange={() => handleAreas(r)} name={r?.Name} />
                        }
                        label={`${r?.Name}`}
                      />
                    </div>
                  ))
              ) : (
                <div>No results found.</div>
              )}
            </div>
          </Box>
        </Modal>
      </>
    </Card>
  )
}

export default AddLoyaltyScheme
