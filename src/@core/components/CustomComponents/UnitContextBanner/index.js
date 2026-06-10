// src/@core/components/CustomComponents/UnitContextBanner/index.js
// Shows which company / unit context is currently active.
// Displayed at top of HRMS pages when org_admin is viewing a specific unit.

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { selectSelectedCompany, selectSelectedUnit } from 'src/store/hierarchy/hierarchySlice'
import { selectRoleSlug } from 'src/store/auth/authSlice'
import { useRouter } from 'next/router'
import { useSelector as useReduxSelector } from 'react-redux'
import { selectAllHierarchyCompanies, selectAllHierarchyUnits } from 'src/store/hierarchy/hierarchySlice'

const UnitContextBanner = () => {
  const router      = useRouter()
  const roleSlug    = useSelector(selectRoleSlug)
  const companies   = useSelector(selectAllHierarchyCompanies)
  const units       = useSelector(selectAllHierarchyUnits)

  const queryUnitId    = router.query?.unit    || null
  const queryCompanyId = router.query?.company || null

  const reduxCompany = useSelector(selectSelectedCompany)
  const reduxUnit    = useSelector(selectSelectedUnit)

  const activeUnit    = queryUnitId    ? units.find(u => u._id === queryUnitId)       : reduxUnit
  const activeCompany = queryCompanyId ? companies.find(c => c._id === queryCompanyId) : reduxCompany

  // Only show for org_admin / company_admin viewing scoped data
  if (!['org_admin', 'org_head', 'company_admin'].includes(roleSlug)) return null
  if (!activeUnit && !activeCompany) return null

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 4,
        p: 2.5,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
      }}
    >
      <Icon icon='mdi:filter-outline' fontSize='1.1rem' style={{ opacity: 0.6 }} />
      <Typography variant='body2' sx={{ color: 'text.secondary', mr: 1 }}>
        Viewing data for:
      </Typography>
      {activeCompany && (
        <Chip
          size='small'
          icon={<Icon icon='mdi:domain' fontSize='0.85rem' />}
          label={activeCompany.name || activeCompany.company_name}
          variant='outlined'
          color='primary'
          sx={{ height: 24, fontSize: '0.78rem' }}
        />
      )}
      {activeUnit && (
        <>
          <Icon icon='mdi:chevron-right' fontSize='0.9rem' style={{ opacity: 0.4 }} />
          <Chip
            size='small'
            icon={<Icon icon='mdi:store-outline' fontSize='0.85rem' />}
            label={activeUnit.name || activeUnit.unit_name}
            variant='outlined'
            color='secondary'
            sx={{ height: 24, fontSize: '0.78rem' }}
          />
        </>
      )}
    </Box>
  )
}

export default UnitContextBanner
