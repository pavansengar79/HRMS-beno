// ** React Imports
import { useState, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Redux — read user info and role from store
import { useSelector } from 'react-redux'
import { selectUser, selectRole, selectRoleSlug } from 'src/store/auth/authSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Role label helper
//   tenant_admin → "ADMIN"
//   super_admin  → "SUPER ADMIN"
//   hr_manager   → "HR MANAGER"
//   (any slug)   → slug uppercased, underscores → spaces
// ─────────────────────────────────────────────────────────────────────────────
const getRoleLabel = (roleSlug, roleName) => {
  if (!roleSlug && !roleName) return ''
  if (roleSlug === 'tenant_admin') return 'ADMIN'
  if (roleSlug === 'super_admin')  return 'SUPER ADMIN'
  // Fall back to slug → uppercase, or role name
  return roleSlug
    ? roleSlug.replace(/_/g, ' ').toUpperCase()
    : roleName?.toUpperCase() || ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Styled Components — unchanged from original
// ─────────────────────────────────────────────────────────────────────────────
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  '&:hover .MuiBox-root, &:hover .MuiBox-root svg': {
    color: theme.palette.primary.main
  }
}))

// ─────────────────────────────────────────────────────────────────────────────
// UserDropdown
// ─────────────────────────────────────────────────────────────────────────────
const UserDropdown = props => {
  const { settings } = props

  const [anchorEl, setAnchorEl] = useState(null)

  const router        = useRouter()
  const { logout }    = useAuth()
  const { direction } = settings

  // ── Read from Redux ────────────────────────────────────────────────────────
  // selectUser  → { id, firstName, email, ... }   (role is stripped out — stored separately)
  // selectRole     → "Tenant Admin"
  // selectRoleSlug → "tenant_admin"
  const user     = useSelector(selectUser)
  const role     = useSelector(selectRole)
  const roleSlug = useSelector(selectRoleSlug)

  const displayName  = user?.firstName || user?.name || user?.email || 'User'
  const displayEmail = user?.email     || ''
  const roleLabel    = getRoleLabel(roleSlug, role)
  const isSuperAdmin = roleSlug === 'super_admin'

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDropdownOpen  = e => setAnchorEl(e.currentTarget)
  const handleDropdownClose = url => {
    if (url) router.push(url)
    setAnchorEl(null)
  }
  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  const styles = {
    px: 4,
    py: 1.75,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2.5,
      fontSize: '1.5rem',
      color: 'text.secondary'
    }
  }

  // ── Avatar initials fallback ───────────────────────────────────────────────
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Fragment>
      {/* ── Trigger Badge + Avatar ──────────────────────────────────────── */}
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt={displayName}
          onClick={handleDropdownOpen}
          sx={{ width: 38, height: 38, backgroundColor: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}
        >
          {initials}
        </Avatar>
      </Badge>

      {/* ── Dropdown Menu ──────────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4.75 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        {/* ── User Info ────────────────────────────────────────────────── */}
        <Box sx={{ py: 1.75, px: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar
                alt={displayName}
                sx={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}
              >
                {initials}
              </Avatar>
            </Badge>

            <Box sx={{ display: 'flex', ml: 2.5, alignItems: 'flex-start', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Real user name from Redux */}
              <Typography
                sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}
              >
                {displayName}
              </Typography>

              {/* Role label — tenant_admin → ADMIN, others → slug uppercased */}
              <Typography
                variant='body2'
                sx={{ color: 'text.disabled', fontSize: '0.7rem', letterSpacing: '0.05em' }}
              >
                {roleLabel}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />

        {/* ── Settings — only visible to super_admin ───────────────────── */}
        {isSuperAdmin && (
          <MenuItemStyled sx={{ p: 0 }} onClick={() => handleDropdownClose('/pages/account-settings/account')}>
            <Box sx={styles}>
              <Icon icon='tabler:settings' />
              Settings
            </Box>
          </MenuItemStyled>
        )}

        {/* ── Sign Out — always visible ─────────────────────────────────── */}
        {isSuperAdmin && <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />}

        <MenuItemStyled sx={{ p: 0 }} onClick={handleLogout}>
          <Box sx={styles}>
            <Icon icon='tabler:logout' />
            Sign Out
          </Box>
        </MenuItemStyled>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown