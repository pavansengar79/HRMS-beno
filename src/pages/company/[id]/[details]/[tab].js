// src/pages/apps/company/[id]/details/[[...tab]].jsx

// ** React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// ** Redux
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCompanyById,
  clearSelectedCompany,
  selectSelectedCompany,
  selectCompanyDetailLoading
} from 'src/store/company/companySlice'
import {
  setSelectedCompany,
  clearHierarchySelection,
} from 'src/store/hierarchy/hierarchySlice'
import CompanyViewLeft from '../../view/CompanyViewLeft'
import CompanyViewRight from '../../view/CompanyViewRight'

// ** View Components


const CompanyDetails = () => {
  const router   = useRouter()
  const dispatch = useDispatch()

  const { id, tab } = router.query
  const activeTab   = Array.isArray(tab) ? tab[0] : (tab || 'overview')

  const company = useSelector(selectSelectedCompany)
  const loading = useSelector(selectCompanyDetailLoading)

  useEffect(() => {
    if (id) {
      dispatch(fetchCompanyById(id))
      // Scope the sidebar to this company
      dispatch(setSelectedCompany(id))
    }

    return () => {
      dispatch(clearSelectedCompany())
      // Clear sidebar scope when leaving company detail
      dispatch(clearHierarchySelection())
    }
  }, [id, dispatch])

  if (loading || !company) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 3 }}>
        <CircularProgress />
        <Typography sx={{ color: 'text.secondary' }}>Loading company details…</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        <CompanyViewLeft company={company} />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <CompanyViewRight tab={activeTab} company={company} />
      </Grid>
    </Grid>
  )
}

export default CompanyDetails