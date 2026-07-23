// src/components/OrgCompanyUnitHeader.js
// Displays organization, company, and unit information with logos
// Shown at top of dashboard for all user levels

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { selectOrganization, selectCompany, selectUnit, selectLevel, selectRoleSlug } from 'src/store/auth/authSlice'

const OrgCompanyUnitHeader = () => {
  const organization = useSelector(selectOrganization)
  const company = useSelector(selectCompany)
  const unit = useSelector(selectUnit)
  const level = useSelector(selectLevel)
  const roleSlug = useSelector(selectRoleSlug)

  // Don't render if SUPER_ADMIN (no org/company/unit)
  if (!level && roleSlug === 'SUPER_ADMIN') return null

  return (
    <Card sx={{ mb: 4, overflow: 'visible' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
        
        {/* Organization */}
        {organization && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
              {organization.logo_url ? (
                <Avatar
                  src={organization.logo_url}
                  alt={organization.name || 'Organization'}
                  sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'primary.main' }}
                />
              ) : (
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon='tabler:building' fontSize={24} color='white' />
                </Box>
              )}
              <Box>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                  Organization
                </Typography>
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                  {organization.name || '—'}
                </Typography>
                {organization.address?.city && (
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    {organization.address.city}
                    {organization.address.state && `, ${organization.address.state}`}
                  </Typography>
                )}
              </Box>
            </Box>
            {company && <Divider orientation='vertical' flexItem sx={{ height: 40, mx: 1 }} />}
          </>
        )}

        {/* Company */}
        {company && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
              {company.logo_url ? (
                <Avatar
                  src={company.logo_url}
                  alt={company.company_name || 'Company'}
                  sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'info.main' }}
                />
              ) : (
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon='tabler:building-warehouse' fontSize={24} color='white' />
                </Box>
              )}
              <Box>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                  Company
                </Typography>
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                  {company.company_name || '—'}
                </Typography>
                {company.company_gst && (
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    GST: {company.company_gst}
                  </Typography>
                )}
              </Box>
            </Box>
            {unit && <Divider orientation='vertical' flexItem sx={{ height: 40, mx: 1 }} />}
          </>
        )}

        {/* Unit */}
        {unit && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon icon='tabler:building-pavilion' fontSize={24} color='white' />
            </Box>
            <Box>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                Unit
              </Typography>
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                {unit.unit_name || '—'}
              </Typography>
              {unit.unit_code && (
                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                  Code: {unit.unit_code}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Role Badge */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={level ? `${level.toUpperCase()} Level` : 'ADMIN'}
            size='small'
            color='primary'
            variant='outlined'
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>
    </Card>
  )
}

export default OrgCompanyUnitHeader
