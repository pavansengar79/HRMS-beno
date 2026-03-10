import React, { useEffect, useState } from 'react'
import { Box, Typography, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/@core/components/mui/text-field'
import { debounce } from 'src/utils/helper'
import SearchIcon from '@mui/icons-material/Search'
import axiosRequest from 'src/utils/AxiosInterceptor'

const zoneList = [
  { value: 'NZ', label: 'North' },
  { value: 'EZ', label: 'East' },
  { value: 'SZ', label: 'South I' },
  { value: 'TZ', label: 'South II' },
  { value: 'WZ', label: 'West' },
  { value: 'CZ', label: 'Central' }
]

const regionsListData = [
  { value: 'Nepal', label: 'Nepal', PZone: 'NP' },
  { value: 'GUWAHATI', label: 'GUWAHATI', PZone: 'EZ' },
  { value: 'Patna', label: 'Patna', PZone: 'EZ' },
  { value: 'DELHI', label: 'DELHI', PZone: 'NZ' },
  { value: 'FARIDABAD', label: 'FARIDABAD', PZone: 'NZ' },
  { value: 'JALLANDHAR', label: 'JALLANDHAR', PZone: 'NZ' },
  { value: 'JAIPUR', label: 'JAIPUR', PZone: 'NZ' },
  { value: 'JODHPUR', label: 'JODHPUR', PZone: 'NZ' },
  { value: 'KANPUR', label: 'KANPUR', PZone: 'NZ' },
  { value: 'MEERUT', label: 'MEERUT', PZone: 'NZ' },
  { value: 'VARANASI', label: 'VARANASI', PZone: 'NZ' },
  { value: 'H.BAD', label: 'H.BAD', PZone: 'TZ' },
  { value: 'VIJAYWADA', label: 'VIJAYWADA', PZone: 'TZ' },
  { value: 'CHENNAI', label: 'CHENNAI', PZone: 'SZ' },
  { value: 'Cochin', label: 'Cochin', PZone: 'SZ' },
  { value: 'INDORE', label: 'INDORE', PZone: 'WZ' },
  { value: 'RANCHI', label: 'RANCHI', PZone: 'EZ' },
  { value: 'MUMBAI', label: 'MUMBAI', PZone: 'WZ' },
  { value: 'NAGPUR', label: 'NAGPUR', PZone: 'WZ' },
  { value: 'AHMEDABAD', label: 'AHMEDABAD', PZone: 'WZ' },
  { value: 'KOLKATTA', label: 'KOLKATTA', PZone: 'EZ' },
  { value: 'RAIPUR', label: 'RAIPUR', PZone: 'EZ' },
  { value: 'JABALPUR', label: 'JABALPUR', PZone: 'WZ' },
  { value: 'CUTTAK', label: 'CUTTAK', PZone: 'EZ' },
  { value: 'BNGLR', label: 'BNGLR', PZone: 'TZ' },
  { value: 'CHANDIGARH', label: 'CHANDIGARH', PZone: 'NZ' },
  { value: 'HUBLI', label: 'HUBLI', PZone: 'TZ' },
  { value: 'Coimbatore', label: 'Coimbatore', PZone: 'SZ' },
  { value: 'RAJKOT', label: 'RAJKOT', PZone: 'WZ' },
  { value: 'UDAIPUR', label: 'UDAIPUR', PZone: 'NZ' },
  { value: 'PUNE', label: 'PUNE', PZone: 'WZ' },
  { value: 'SURAT', label: 'SURAT', PZone: 'WZ' },
  { value: 'AGRA', label: 'AGRA', PZone: 'NZ' },
  { value: 'MADURAI', label: 'MADURAI', PZone: 'SZ' },
  { value: 'RAIGARH', label: 'RAIGARH', PZone: 'EZ' },
  { value: 'SILIGURI', label: 'SILIGURI', PZone: 'EZ' },
  { value: 'CALICUT', label: 'CALICUT', PZone: 'SZ' }
]

export const depotList = [
  { value: 1134, label: 'KL-AN-BURDWAN' },
  { value: 1200, label: 'KTP' },
  { value: 1211, label: 'KL-GW-GUWAHATI' },
  { value: 1291, label: 'GW-FG-GUWAHATI' },
  { value: 1300, label: 'BTP' },
  { value: 1311, label: 'KL-GW-SHILLONG' },
  { value: 1400, label: 'VTP' },
  { value: 1411, label: 'KL-GW-DIMAPUR' },
  { value: 1500, label: 'TRP' },
  { value: 1511, label: 'KL-GW-AGARTALA' },
  { value: 1600, label: 'COCHIN' },
  { value: 1611, label: 'JR-PT-PATNA' },
  { value: 1612, label: 'JR-PT-GAYA' },
  { value: 1613, label: 'JR-PT-DEHRI ON SONE' },
  { value: 1614, label: 'JR-PT-MUZAFARPUR' },
  { value: 1615, label: 'JR-PT-PURNEA' },
  { value: 1691, label: 'JR-FG-PATNA' },
  { value: 1700, label: 'TCIL' },
  { value: 1711, label: 'JR-RC-JAMSHEDPUR' },
  { value: 1721, label: 'JR-RN-RANCHI' },
  { value: 1722, label: 'JR-RN-DHANBAD' },
  { value: 1723, label: 'JR-RN-DUMKA' },
  { value: 1791, label: 'JR-FG-JAMSHEDPUR' },
  { value: 1800, label: 'OTR PLANT' },
  { value: 1811, label: 'JR-CK-CUTTACK' },
  { value: 1812, label: 'JR-CK-ROURKELA' },
  { value: 1813, label: 'JR-CK-SAMBALPUR' },
  { value: 1814, label: 'JR-CK-BARBIL' },
  { value: 1891, label: 'RP-FG-CUTTACK' },
  { value: 1900, label: 'CHENNAI TYRE PLANT' },
  { value: 3111, label: 'DEL-J.WALAN-J.WALAN' },
  { value: 3112, label: 'DEL-J.WALAN-TILAK NA' },
  { value: 3113, label: 'MT-MT-UPBORDER' },
  { value: 3114, label: 'DL-OE-TILAK NAGAR' },
  { value: 3121, label: 'DEL-SGT.NGR-SGT.NAGA' },
  { value: 3131, label: 'DL-SA-KHIRKEE' },
  { value: 3191, label: 'DEL-J.WALAN-F.G. ALI' },
  { value: 3211, label: 'DEL-FBD-FARIDABAD' },
  { value: 3212, label: 'DEL-FBD-AMBALA' },
  { value: 3213, label: 'DEL-FBD-HISSAR' },
  { value: 3214, label: 'DEL-FBD-ROHTHAK' },
  { value: 3215, label: 'DEL-FBD-GURGAON' },
  { value: 3216, label: 'DEL-RH-PANIPAT' },
  { value: 3218, label: 'DEL-FBD-GURGAON-2' },
  { value: 3219, label: 'DL-OE-GURGAON-2' },
  { value: 3291, label: 'DEL-F.G. FARIDABAD' },
  { value: 3311, label: 'JL-LU-LUDHIANA' },
  { value: 3312, label: 'JL-JL-CHANDIGARH' },
  { value: 3313, label: 'JL-LU-PATIALA' },
  { value: 3314, label: 'JL-JL-CHANDIGARH_EXC' },
  { value: 3321, label: 'JL-JL-JALLANDHAR' },
  { value: 3322, label: 'JL-JL-AMRITSAR' },
  { value: 3323, label: 'JL-LU-BATHINDA' },
  { value: 3391, label: 'JL-FG-LUDHIANA' },
  { value: 3411, label: 'JL-JL-JAMMU' },
  { value: 3412, label: 'JL-JL-SRINAGAR' },
  { value: 3511, label: 'JL-LU-PARWANOO' },
  { value: 3521, label: 'JL-LU-BARMANA' },
  { value: 3611, label: 'JP-J1-JAIPUR' },
  { value: 3612, label: 'JP-JP-SHAHPURA' },
  { value: 3613, label: 'JP-JP-SIKAR' },
  { value: 3619, label: 'JP-OE-ALWAR-2' },
  { value: 3621, label: 'JP-J2-JAIPUR 2' },
  { value: 3622, label: 'JP-J2-KOTA' },
  { value: 3623, label: 'JP-J2-ALWAR' },
  { value: 3624, label: 'JP-J2-NASIRABAD' },
  { value: 3625, label: 'JP-J2-BHARATPUR' },
  { value: 3631, label: 'JP-UD-UDAIPUR' },
  { value: 3632, label: 'JP-UD-BHILWARA' },
  { value: 3641, label: 'JP-JO-JODHPUR' },
  { value: 3642, label: 'JP-JO-BIKANER' },
  { value: 3643, label: 'JP-JO-SRIGANGANAGAR' },
  { value: 3691, label: 'JP-FG-JAIPUR' },
  { value: 3711, label: 'KN-KN-KANPUR' },
  { value: 3712, label: 'KN-KN-JHANSI' },
  { value: 3721, label: 'KN-LK-LUCKNOW' },
  { value: 3722, label: 'MT-BR-BAREILLY' },
  { value: 3731, label: 'KN-VN-VARANSI' },
  { value: 3732, label: 'KN-AL-ALLAHABAD' },
  { value: 3733, label: 'KN-VN-GORAKHPUR' },
  { value: 3741, label: 'MT-MT-MEERUT' },
  { value: 3742, label: 'MT-DN-HALDWANI' },
  { value: 3743, label: 'MT-DN-DEHRADUN' },
  { value: 3751, label: 'MT-AG-AGRA' },
  { value: 3792, label: 'MT-FG-MEERUT' },
  { value: 5111, label: 'HY-HY-HYDRABAD' },
  { value: 5112, label: 'HY-HY-KARIMNAGAR' },
  { value: 5113, label: 'HY-HY-HYDRABAD-2' },
  { value: 5114, label: 'HY-HY-NIZAMABAD' },
  { value: 5115, label: 'HY-HY-WARANGAL' },
  { value: 5121, label: 'HY-VW-V.WADA' },
  { value: 5122, label: 'HY-VW-GUNTUR' },
  { value: 5123, label: 'HY-VW-NELLORE' },
  { value: 5131, label: 'HY-VG-VIZAG' },
  { value: 5132, label: 'HY-VG-RAJMUNDHARY' },
  { value: 5141, label: 'HY-KL-KURNOOL' },
  { value: 5142, label: 'HY-KL-CHITTOOR' },
  { value: 5143, label: 'HY-KL-YERRAGUNTLA' },
  { value: 5191, label: 'HY-FG-HYDERABAD' },
  { value: 5192, label: 'HY-FG-VJW' },
  { value: 5211, label: 'BR-BR-BANGLORE' },
  { value: 5212, label: 'BR-MY-MYSORE' },
  { value: 5213, label: 'BR-BR-MANGLORE' },
  { value: 5214, label: 'BR-BR-SHIMOGA' },
  { value: 5215, label: 'BR-BR-BANGALORE-2' },
  { value: 5221, label: 'BR-HL-HUBLI' },
  { value: 5222, label: 'BR-BM-BELGAUM' },
  { value: 5223, label: 'BR-BM-GULBARGA' },
  { value: 5224, label: 'BR-HL-HOSPET' },
  { value: 5291, label: 'BR-FG-BANGLORE' },
  { value: 5292, label: 'BR-FG-HUBLI' },
  { value: 5311, label: 'CH-CH-CHENNAI' },
  { value: 5312, label: 'CH-CH-VELLORE' },
  { value: 5313, label: 'CH-CH-CHENNAI-2' },
  { value: 5321, label: 'CH-MD-MADURAI' },
  { value: 5322, label: 'CH-MD-TRICHY' },
  { value: 5323, label: 'CH-MD-TIRUNELVELI' },
  { value: 5331, label: 'CH-SL-SALEM' },
  { value: 5332, label: 'CH-NM-NAMAKKAL' },
  { value: 5333, label: 'CH-CO-SANKARI' },
  { value: 5334, label: 'CH-CO-COIMBATORE' },
  { value: 5335, label: 'CH-SL-SALEM( Ex. Rg.' },
  { value: 5391, label: 'CH-FG-SALEM' },
  { value: 5392, label: 'CH-FG-CHENNAI-2' },
  { value: 5411, label: 'CH-CH-PONDY' },
  { value: 5511, label: 'CH-CO-COCHIN' },
  { value: 5512, label: 'CH-CO-CALICUT' },
  { value: 5513, label: 'CH-CO-KOTTAYAM' },
  { value: 5514, label: 'CH-CO-TRIVANDRUM' },
  { value: 5591, label: 'CH-FG-COCHIN' },
  { value: 7111, label: 'IND-IND-IND' },
  { value: 7112, label: 'IND-IND-NEEMUCH' },
  { value: 7121, label: 'IN-BP-BHOPAL' },
  { value: 7122, label: 'IN-BP-GWALIOR' },
  { value: 7123, label: 'IN-BP-CHATARPUR' },
  { value: 7131, label: 'IN-JB-JABALPUR' },
  { value: 7132, label: 'IN-JB-SATNA' },
  { value: 7191, label: 'IND-FG-INDORE' },
  { value: 7211, label: 'IN-RP-RAIPUR' },
  { value: 7212, label: 'IN-RP-BILASPUR' },
  { value: 7213, label: 'IN-RP-RAIGARH' },
  { value: 7214, label: 'IND_RPR_JAGDALPUR' },
  { value: 7215, label: 'IN-RP-RAIPUR[Exregd]' },
  { value: 7291, label: 'RP-FG-RAIPUR' },
  { value: 7311, label: 'MU-MU-SEWRI' },
  { value: 7312, label: 'MU-MU-GHATKOPAR' },
  { value: 7321, label: 'MU-VASHI-RABALE' },
  { value: 7322, label: 'MU-AU-DHULIA' },
  { value: 7323, label: 'MU-VASHI-RABALE (EXC' },
  { value: 7324, label: 'MU-VASHI-BHIWANDI' },
  { value: 7331, label: 'MU-PN-PUNE' },
  { value: 7332, label: 'MU-KL-KOLHAPUR' },
  { value: 7333, label: 'MU-AU-AURANGABAD' },
  { value: 7334, label: 'MU-PUNE(WAGHOLI-EXC-' },
  { value: 7335, label: 'MU-PN-SOLAPUR' },
  { value: 7336, label: 'MU-AUR-NASIK' },
  { value: 7341, label: 'MU-NG-NGPR' },
  { value: 7342, label: 'MU-NG-AKOLA' },
  { value: 7343, label: 'MU-NG-CHANDRAPUR' },
  { value: 7344, label: 'MU-ND-NANDED' },
  { value: 7391, label: 'MU-FG-BHIWANDI' },
  { value: 7392, label: 'NG-FG-NGPR' },
  { value: 7393, label: 'MU-FG-PUNE' },
  { value: 7394, label: 'MU-FG-NASIK' },
  { value: 7411, label: 'MU-KL-GOA' },
  { value: 7511, label: 'AH-AH-AHMEDABAD' },
  { value: 7512, label: 'AH-SU-SURAT' },
  { value: 7513, label: 'AH-SU-BARODA' },
  { value: 7514, label: 'AH-AH-MEHASANA' },
  { value: 7515, label: 'AH-AH-NAROL' },
  { value: 7517, label: 'AH-SU-ANKLESHWAR' },
  { value: 7518, label: 'AH-AH-AHMEDABAD-2' },
  { value: 7521, label: 'AH-RJ-RAJKOT' },
  { value: 7522, label: 'AH-GD-GANDHIDHAM' },
  { value: 7523, label: 'AH-RJ-JAMNAGAR' },
  { value: 7524, label: 'AH-RJ-BHAVNAGAR' },
  { value: 7591, label: 'AH-FG-AHMEDABAD' },
  { value: 8000, label: 'Port - Mumbai' },
  { value: 8001, label: 'Port - kolkata' },
  { value: 8002, label: 'Port - Chennai' },
  { value: 8003, label: 'Port - Amritsar' },
  { value: 'F335', label: 'CIL-CH-SL-SALEM( Ex.' },
  { value: 'F391', label: 'CIL-CH-FG-SALEM' },
  { value: 'F392', label: 'CIL-CH-FG-CHENNAI' },
  { value: 'F411', label: 'CIL-CH-CH-PONDY' },
  { value: 'F511', label: 'CIL-CH-CO-COCHIN' },
  { value: 'F512', label: 'CIL-CH-CO-CALICUT' },
  { value: 'F513', label: 'CIL-CH-CO-KOTTAYAM' },
  { value: 'F514', label: 'CIL-CH-CO-TRIVANDRUM' },
  { value: 'F591', label: 'CIL-CH-FG-COCHIN' },
  { value: 'H111', label: 'CIL-IND-IND-IND' },
  { value: 'H112', label: 'CIL-IND-IND-NEEMUCH' },
  { value: 'H114', label: 'CIL-IND-IND-IND(EX R' },
  { value: 'H121', label: 'CIL-IN-BP-BHOPAL' },
  { value: 'H122', label: 'CIL-IN-BP-GWALIOR' },
  { value: 'H123', label: 'CIL-IN-BP-CHATARPUR' },
  { value: 'H131', label: 'CIL-IN-JB-JABALPUR' },
  { value: 'H132', label: 'CIL-IN-JB-SATNA' },
  { value: 'H191', label: 'CIL-IND-FG-INDORE' },
  { value: 'H211', label: 'CIL-IN-RP-RAIPUR' }
]

const schemeRegionList = [
  { value: 'JABALPUR', label: 'JABALPUR' },
  { value: 'VARANASI', label: 'VARANASI' },
  { value: 'JALLANDHAR', label: 'JALLANDHAR' },
  { value: 'Udaipur', label: 'Udaipur' },
  { value: 'Pune', label: 'Pune' },
  { value: 'INDORE', label: 'INDORE' },
  { value: 'Surat', label: 'Surat' },
  { value: 'Agra', label: 'Agra' },
  { value: 'CHENNAI', label: 'CHENNAI' },
  { value: 'RAIPUR', label: 'RAIPUR' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Raigarh', label: 'Raigarh' },
  { value: 'H.BAD', label: 'H.BAD' },
  { value: 'CUTTAK', label: 'CUTTAK' },
  { value: 'RANCHI', label: 'RANCHI' },
  { value: 'Siliguri', label: 'Siliguri' },
  { value: 'VIJAYWADA', label: 'VIJAYWADA' },
  { value: 'DELHI', label: 'DELHI' },
  { value: 'AHMEDABAD', label: 'AHMEDABAD' },
  { value: 'JODHPUR', label: 'JODHPUR' },
  { value: 'MEERUT', label: 'MEERUT' },
  { value: 'NAGPUR', label: 'NAGPUR' },
  { value: 'JAIPUR', label: 'JAIPUR' },
  { value: 'FARIDABAD', label: 'FARIDABAD' },
  { value: 'Calicut', label: 'Calicut' },
  { value: 'Cochin', label: 'Cochin' },
  { value: 'HUBLI', label: 'HUBLI' },
  { value: 'MUMBAI', label: 'MUMBAI' },
  { value: 'GUWAHATI', label: 'GUWAHATI' },
  { value: 'KOLKATTA', label: 'KOLKATTA' },
  { value: 'RAJKOT', label: 'RAJKOT' },
  { value: 'CHANDIGARH', label: 'CHANDIGARH' },
  { value: 'Patna', label: 'Patna' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'BNGLR', label: 'BNGLR' },
  { value: 'KANPUR', label: 'KANPUR' },
  { value: 'Nepal', label: 'Nepal' }
]

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const PlacesDrawer = ({ toggle, selectedOption, checkedItems, setCheckedItems }) => {
  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])

  console.log('option', selectedOption)
  useEffect(() => {
    const fetchData = async () => {
      try {
        let responseData = []
        if (selectedOption === 'Zone') {
          responseData = zoneList
        } else if (selectedOption === 'Region') {
          responseData = regionsListData.sort((a, b) => {
            if (a.label.toLowerCase() < b.label.toLowerCase()) {
              return -1
            }
            if (a.label.toLowerCase() > b.label.toLowerCase()) {
              return 1
            }
            return 0
          })
        } else if (selectedOption === 'Depot') {
          responseData = depotList
        } else if (selectedOption === 'Customer') {
          const response = await axiosRequest({
            url: `/api/admindash/vistex/dealer-list?search=${search}`,
            method: 'GET'
          })
          responseData =
            response?.dealers?.map(item => ({
              value: item?.value,
              label: `${item?.value}-${item?.label}`
            })) || []
        } else if (selectedOption === 'Pan India') {
          responseData = schemeRegionList.sort((a, b) => {
            if (a.label.toLowerCase() < b.label.toLowerCase()) {
              return -1
            }
            if (a.label.toLowerCase() > b.label.toLowerCase()) {
              return 1
            }
            return 0
          })
        }

        const filteredData = responseData.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))

        setData(filteredData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [selectedOption, search])

  const handleSelectAll = event => {
    const newCheckedState = event.target.checked
    setCheckedItems(newCheckedState ? data : [])
    setSelectAll(newCheckedState)
  }

  const handleCheckboxChange = event => {
    const { name, checked } = event.target
    const selectedItem = data.find(item => item.value === name)

    setCheckedItems(prevCheckedItems =>
      checked ? [...prevCheckedItems, selectedItem] : prevCheckedItems.filter(item => item.value !== name)
    )

    if (!checked) {
      setSelectAll(false)
    } else {
      const allChecked = data.every(
        item => checkedItems.some(checkedItem => checkedItem.value === item.value) || item.value === name
      )
      setSelectAll(allChecked)
    }
  }

  const handleSearch = e => {
    setSearch(e.target.value)
  }

  return (
    <Box>
      <Header>
        <Typography variant='h6'>
          Please Select a {selectedOption} - Total {checkedItems?.length} selected out of {data?.length}
        </Typography>
        <IconButton
          size='small'
          onClick={toggle}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Header>
      <Box p={6}>
        <CustomTextField
          fullWidth
          placeholder='Search'
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} label='Select All' />
        <Box sx={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
          {data?.length === 0 ? (
            <Typography variant='body2' color='error'>
              No data found
            </Typography>
          ) : (
            data.map((el, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={checkedItems.some(item => item.value === el.value)}
                    onChange={handleCheckboxChange}
                    name={el.value}
                  />
                }
                label={el.label}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default PlacesDrawer
