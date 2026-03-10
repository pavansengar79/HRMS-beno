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
  { value: '1682', label: 'Nepal', PZone: 'NP' },
  { value: '1182', label: 'GUWAHATI', PZone: 'EZ' },
  { value: '1681', label: 'Patna', PZone: 'EZ' },
  { value: '3181', label: 'DELHI', PZone: 'NZ' },
  { value: '3281', label: 'FARIDABAD', PZone: 'NZ' },
  { value: '3381', label: 'JALLANDHAR', PZone: 'NZ' },
  { value: '3681', label: 'JAIPUR', PZone: 'NZ' },
  { value: '3682', label: 'JODHPUR', PZone: 'NZ' },
  { value: '3781', label: 'KANPUR', PZone: 'NZ' },
  { value: '3782', label: 'MEERUT', PZone: 'NZ' },
  { value: '3783', label: 'VARANASI', PZone: 'NZ' },
  { value: '5181', label: 'H.BAD', PZone: 'TZ' },
  { value: '5182', label: 'VIJAYWADA', PZone: 'TZ' },
  { value: '5381', label: 'CHENNAI', PZone: 'SZ' },
  { value: '5382', label: 'Cochin', PZone: 'SZ' },
  { value: '7181', label: 'INDORE', PZone: 'WZ' },
  { value: '1683', label: 'RANCHI', PZone: 'EZ' },
  { value: '7381', label: 'MUMBAI', PZone: 'WZ' },
  { value: '7382', label: 'NAGPUR', PZone: 'WZ' },
  { value: '7581', label: 'AHMEDABAD', PZone: 'WZ' },
  { value: '1181', label: 'KOLKATTA', PZone: 'EZ' },
  { value: '7182', label: 'RAIPUR', PZone: 'EZ' },
  { value: '7183', label: 'JABALPUR', PZone: 'WZ' },
  { value: '7184', label: 'CUTTAK', PZone: 'EZ' },
  { value: '5281', label: 'BNGLR', PZone: 'TZ' },
  { value: '3382', label: 'CHANDIGARH', PZone: 'NZ' },
  { value: '5282', label: 'HUBLI', PZone: 'TZ' },
  { value: '5383', label: 'Coimbatore', PZone: 'SZ' },
  { value: '7582', label: 'RAJKOT', PZone: 'WZ' }
]

const depotList = [
  { value: '1134', label: 'KL-AN-BURDWAN' },
  { value: '1200', label: 'KTP' },
  { value: '1211', label: 'KL-GW-GUWAHATI' },
  { value: '1291', label: 'GW-FG-GUWAHATI' },
  { value: '1300', label: 'BTP' },
  { value: '1311', label: 'KL-GW-SHILLONG' },
  { value: '1400', label: 'VTP' },
  { value: '1411', label: 'KL-GW-DIMAPUR' },
  { value: '1500', label: 'TRP' },
  { value: '1511', label: 'KL-GW-AGARTALA' },
  { value: '1600', label: 'COCHIN' },
  { value: '1611', label: 'JR-PT-PATNA' },
  { value: '1612', label: 'JR-PT-GAYA' },
  { value: '1613', label: 'JR-PT-DEHRI ON SONE' },
  { value: '1614', label: 'JR-PT-MUZAFARPUR' },
  { value: '1615', label: 'JR-PT-PURNEA' },
  { value: '1691', label: 'JR-FG-PATNA' },
  { value: '1700', label: 'TCIL' },
  { value: '1711', label: 'JR-RC-JAMSHEDPUR' },
  { value: '1721', label: 'JR-RN-RANCHI' },
  { value: '1722', label: 'JR-RN-DHANBAD' },
  { value: '1723', label: 'JR-RN-DUMKA' },
  { value: '1791', label: 'JR-FG-JAMSHEDPUR' },
  { value: '1800', label: 'OTR PLANT' },
  { value: '1811', label: 'JR-CK-CUTTACK' },
  { value: '1812', label: 'JR-CK-ROURKELA' },
  { value: '1813', label: 'JR-CK-SAMBALPUR' },
  { value: '1814', label: 'JR-CK-BARBIL' },
  { value: '1891', label: 'RP-FG-CUTTACK' },
  { value: '1900', label: 'CHENNAI TYRE PLANT' },
  { value: '3111', label: 'DEL-J.WALAN-J.WALAN' },
  { value: '3112', label: 'DEL-J.WALAN-TILAK NA' },
  { value: '3113', label: 'MT-MT-UPBORDER' },
  { value: '3114', label: 'DL-OE-TILAK NAGAR' },
  { value: '3121', label: 'DEL-SGT.NGR-SGT.NAGA' },
  { value: '3131', label: 'DL-SA-KHIRKEE' },
  { value: '3191', label: 'DEL-J.WALAN-F.G. ALI' },
  { value: '3211', label: 'DEL-FBD-FARIDABAD' },
  { value: '3212', label: 'DEL-FBD-AMBALA' },
  { value: '3213', label: 'DEL-FBD-HISSAR' },
  { value: '3214', label: 'DEL-FBD-ROHTHAK' },
  { value: '3215', label: 'DEL-FBD-GURGAON' },
  { value: '3216', label: 'DEL-RH-PANIPAT' },
  { value: '3218', label: 'DEL-FBD-GURGAON-2' },
  { value: '3219', label: 'DL-OE-GURGAON-2' },
  { value: '3291', label: 'DEL-F.G. FARIDABAD' },
  { value: '3311', label: 'JL-LU-LUDHIANA' },
  { value: '3312', label: 'JL-JL-CHANDIGARH' },
  { value: '3313', label: 'JL-LU-PATIALA' },
  { value: '3314', label: 'JL-JL-CHANDIGARH_EXC' },
  { value: '3321', label: 'JL-JL-JALLANDHAR' },
  { value: '3322', label: 'JL-JL-AMRITSAR' },
  { value: '3323', label: 'JL-LU-BATHINDA' },
  { value: '3391', label: 'JL-FG-LUDHIANA' },
  { value: '3411', label: 'JL-JL-JAMMU' },
  { value: '3412', label: 'JL-JL-SRINAGAR' },
  { value: '3511', label: 'JL-LU-PARWANOO' },
  { value: '3521', label: 'JL-LU-BARMANA' },
  { value: '3611', label: 'JP-J1-JAIPUR' },
  { value: '3612', label: 'JP-JP-SHAHPURA' },
  { value: '3613', label: 'JP-JP-SIKAR' },
  { value: '3619', label: 'JP-OE-ALWAR-2' },
  { value: '3621', label: 'JP-J2-JAIPUR 2' },
  { value: '3622', label: 'JP-J2-KOTA' },
  { value: '3623', label: 'JP-J2-ALWAR' },
  { value: '3624', label: 'JP-J2-NASIRABAD' },
  { value: '3625', label: 'JP-J2-BHARATPUR' },
  { value: '3631', label: 'JP-UD-UDAIPUR' },
  { value: '3632', label: 'JP-UD-BHILWARA' },
  { value: '3641', label: 'JP-JO-JODHPUR' },
  { value: '3642', label: 'JP-JO-BIKANER' },
  { value: '3643', label: 'JP-JO-SRIGANGANAGAR' },
  { value: '3691', label: 'JP-FG-JAIPUR' },
  { value: '3711', label: 'KN-KN-KANPUR' },
  { value: '3712', label: 'KN-KN-JHANSI' },
  { value: '3721', label: 'KN-LK-LUCKNOW' },
  { value: '3722', label: 'MT-BR-BAREILLY' },
  { value: '3731', label: 'KN-VN-VARANSI' },
  { value: '3732', label: 'KN-AL-ALLAHABAD' },
  { value: '3733', label: 'KN-VN-GORAKHPUR' },
  { value: '3741', label: 'MT-MT-MEERUT' },
  { value: '3742', label: 'MT-DN-HALDWANI' },
  { value: '3743', label: 'MT-DN-DEHRADUN' },
  { value: '3751', label: 'MT-AG-AGRA' },
  { value: '3792', label: 'MT-FG-MEERUT' },
  { value: '5111', label: 'HY-HY-HYDRABAD' },
  { value: '5112', label: 'HY-HY-KARIMNAGAR' },
  { value: '5113', label: 'HY-HY-HYDRABAD-2' },
  { value: '5114', label: 'HY-HY-NIZAMABAD' },
  { value: '5115', label: 'HY-HY-WARANGAL' },
  { value: '5121', label: 'HY-VW-V.WADA' },
  { value: '5122', label: 'HY-VW-GUNTUR' },
  { value: '5123', label: 'HY-VW-NELLORE' },
  { value: '5131', label: 'HY-VG-VIZAG' },
  { value: '5132', label: 'HY-VG-RAJMUNDHARY' },
  { value: '5141', label: 'HY-KL-KURNOOL' },
  { value: '5142', label: 'HY-KL-CHITTOOR' },
  { value: '5143', label: 'HY-KL-YERRAGUNTLA' },
  { value: '5191', label: 'HY-FG-HYDERABAD' },
  { value: '5192', label: 'HY-FG-VJW' },
  { value: '5211', label: 'BR-BR-BANGLORE' },
  { value: '5212', label: 'BR-BR-TUMKUR' },
  { value: '5221', label: 'BR-DV-DAVANGERE' },
  { value: '5222', label: 'BR-DV-BELLARY' },
  { value: '5231', label: 'BR-MY-MYSORE' },
  { value: '5232', label: 'BR-MY-MADIKERI' },
  { value: '5233', label: 'BR-MY-MANGALORE' },
  { value: '5291', label: 'BR-FG-BANGALORE' },
  { value: '5311', label: 'CL-CL-CHENNAI' },
  { value: '5312', label: 'CL-CL-CHENGELPET' },
  { value: '5313', label: 'CL-CL-VELLORE' },
  { value: '5321', label: 'CL-CB-COIMBATORE' },
  { value: '5322', label: 'CL-CL-SALEM' },
  { value: '5331', label: 'CL-MD-MADURAI' },
  { value: '5332', label: 'CL-MD-TIRUNELVELI' },
  { value: '5333', label: 'CL-MD-TRICHY' },
  { value: '5334', label: 'CL-MD-KARAIKUDI' },
  { value: '5335', label: 'CL-MD-NAGERCOIL' },
  { value: '5391', label: 'CL-FG-CHENNAI' },
  { value: '5392', label: 'CL-CL-VELLORE' },
  { value: '6111', label: 'MB-MB-MUMBAI' },
  { value: '6112', label: 'MB-MB-BHANDUP' },
  { value: '6121', label: 'MB-NS-NASIK' },
  { value: '6122', label: 'MB-NS-NAGPUR' },
  { value: '6123', label: 'MB-NS-JALGAON' },
  { value: '6131', label: 'MB-PN-PUNE' },
  { value: '6132', label: 'MB-PN-KOLHAPUR' },
  { value: '6133', label: 'MB-PN-SOLAPUR' },
  { value: '6141', label: 'MB-PN-KOLHAPUR (OE)' },
  { value: '6142', label: 'MB-PN-LOKNANDU' },
  { value: '6143', label: 'MB-PN-BARAMATI' },
  { value: '6191', label: 'MB-FG-MUMBAI' },
  { value: '6211', label: 'RG-RG-RAIGARH' },
  { value: '6212', label: 'RG-RG-BHOPAL' },
  { value: '6213', label: 'RG-RG-GWALIOR' },
  { value: '6214', label: 'RG-RG-JABALPUR' },
  { value: '6215', label: 'RG-RG-INDORE' },
  { value: '6221', label: 'RA-RA-RAIPUR' },
  { value: '6222', label: 'RA-RA-BHILAI' },
  { value: '6223', label: 'RA-RA-BILASPUR' },
  { value: '6224', label: 'RA-RA-KORBA' },
  { value: '6225', label: 'RA-RA-RAIGARH' },
  { value: '6291', label: 'RG-FG-RAIGARH' },
  { value: '7111', label: 'KG-KG-BARODA' },
  { value: '7112', label: 'KG-KG-AHMEDABAD' },
  { value: '7113', label: 'KG-KG-MEHSANA' },
  { value: '7114', label: 'KG-KG-HIMMATNAGAR' },
  { value: '7115', label: 'KG-KG-SURENDRANAGAR' },
  { value: '7116', label: 'KG-KG-SANAND' },
  { value: '7121', label: 'KG-RJ-RAJKOT' },
  { value: '7122', label: 'KG-RJ-BHAVNAGAR' },
  { value: '7123', label: 'KG-RJ-JAMNAGAR' },
  { value: '7124', label: 'KG-RJ-VERAVAL' },
  { value: '7131', label: 'KG-BV-BHAVNAGAR' },
  { value: '7132', label: 'KG-BV-SURENDRANAGAR' },
  { value: '7133', label: 'KG-BV-UNJHA' },
  { value: '7134', label: 'KG-BV-JETPUR' },
  { value: '7141', label: 'KG-SR-SURAT' },
  { value: '7142', label: 'KG-SR-VAPI' },
  { value: '7143', label: 'KG-SR-BHARUCH' },
  { value: '7144', label: 'KG-SR-BHARUCH2' },
  { value: '7145', label: 'KG-SR-ANKLESHWAR' },
  { value: '7191', label: 'KG-FG-BARODA' },
  { value: '7192', label: 'KG-FG-AHMEDABAD' },
  { value: '7193', label: 'KG-FG-SURAT' },
  { value: '7211', label: 'MI-FT-CALICUT' },
  { value: '7212', label: 'MI-FT-THRISSUR' },
  { value: '7213', label: 'MI-FT-TRIVANDRUM' },
  { value: '7214', label: 'MI-FT-KOTTAYAM' },
  { value: '7215', label: 'MI-FT-ERNAKULAM' },
  { value: '7216', label: 'MI-FT-PALGHAT' },
  { value: '7217', label: 'MI-FT-CALICUT 2' },
  { value: '7218', label: 'MI-FT-ERNAKULAM2' },
  { value: '7219', label: 'MI-FT-THRISSUR2' },
  { value: '7220', label: 'MI-FT-PALGHAT2' },
  { value: '7221', label: 'MI-FT-TRIVANDRUM2' },
  { value: '7291', label: 'MI-FG-FT' }
]

const schemeRegionList = [
  {
    value: '7183',
    label: 'JABALPUR'
  },
  {
    value: '3783',
    label: 'VARANASI'
  },
  {
    value: '3381',
    label: 'JALLANDHAR'
  },
  {
    value: '3683',
    label: 'Udaipur'
  },
  {
    value: '7383',
    label: 'Pune'
  },
  {
    value: '7181',
    label: 'INDORE'
  },
  {
    value: '7584',
    label: 'Surat'
  },
  {
    value: '3784',
    label: 'Agra'
  },
  {
    value: '5381',
    label: 'CHENNAI'
  },
  {
    value: '7182',
    label: 'RAIPUR'
  },
  {
    value: '5384',
    label: 'Madurai'
  },
  {
    value: '7185',
    label: 'Raigarh'
  },
  {
    value: '5181',
    label: 'H.BAD'
  },
  {
    value: '7184',
    label: 'CUTTAK'
  },
  {
    value: '1683',
    label: 'RANCHI'
  },
  {
    value: '1183',
    label: 'Siliguri'
  },
  {
    value: '5182',
    label: 'VIJAYWADA'
  },
  {
    value: '3181',
    label: 'DELHI'
  },
  {
    value: '7581',
    label: 'AHMEDABAD'
  },
  {
    value: '3682',
    label: 'JODHPUR'
  },
  {
    value: '3782',
    label: 'MEERUT'
  },
  {
    value: '7382',
    label: 'NAGPUR'
  },
  {
    value: '3681',
    label: 'JAIPUR'
  },
  {
    value: '3281',
    label: 'FARIDABAD'
  },
  {
    value: '5385',
    label: 'Calicut'
  },
  {
    value: '5382',
    label: 'Cochin'
  },
  {
    value: '5282',
    label: 'HUBLI'
  },
  {
    value: '7381',
    label: 'MUMBAI'
  },
  {
    value: '1182',
    label: 'GUWAHATI'
  },
  {
    value: '1181',
    label: 'KOLKATTA'
  },
  {
    value: '7582',
    label: 'RAJKOT'
  },
  {
    value: '3382',
    label: 'CHANDIGARH'
  },
  {
    value: '1681',
    label: 'Patna'
  },
  {
    value: '5383',
    label: 'Coimbatore'
  },
  {
    value: '5281',
    label: 'BNGLR'
  },
  {
    value: '3781',
    label: 'KANPUR'
  },
  {
    value: '1682',
    label: 'Nepal'
  }
]

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
  justifyContent: 'space-between'
}))

const PlacesDrawer = ({ toggle, selectedOption, checkedItems, setCheckedItems }) => {
  // const [checkedItems, setCheckedItems] = useState(data)

  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])

  console.log('option', selectedOption)
  useEffect(() => {
    if (selectedOption === 'Zone') {
      setData(zoneList)
    }
    if (selectedOption === 'Region') {
      setData(regionsListData)
    }
    if (selectedOption === 'Depot') {
      setData(depotList)
    }
    if (selectedOption === 'Customer') {
      const getDealers = async () => {
        const response = await axiosRequest({
          url: `/api/admindash/vistex/dealer-list?search=${search}`,
          method: 'GET'
        })
        setData(
          response?.dealers?.map(item => {
            return { value: item?.value, label: `${item?.value}-${item?.label}` }
          })
        )
      }

      getDealers()
    }
    if (selectedOption === 'Pan India') {
      setData(schemeRegionList)
    }
  }, [selectedOption])

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

  // const chunkSize = 10
  // const chunkedData = []
  // for (let i = 0; i < data.length; i += chunkSize) {
  //   chunkedData.push(data.slice(i, i + chunkSize))
  // }

  return (
    <Box>
      <Header>
        <Typography variant='h6'>
          Please Select a {selectedOption} - Total {checkedItems.length} selected out of {data.length}
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
          onChange={e => debounce(() => setSearch(e.target.value), 2000)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} label='Select All' />
        {/* <Box sx={{ display: 'flex', gap: '20px' }}>
          {chunkedData.map((chunk, columnIndex) => (
            <Box key={columnIndex} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {chunk.map((region, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox checked={checkedItems.includes(region)} onChange={handleCheckboxChange} name={region} />
                  }
                  label={region}
                />
              ))}
            </Box>
          ))}
        </Box> */}
        <Box sx={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
          {data.map((el, index) => (
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
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default PlacesDrawer
