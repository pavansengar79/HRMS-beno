// ** React
import { useState } from 'react'

// ** MUI
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

// ** Icons
import Icon from 'src/@core/components/icon'
import { HOLIDAY_TYPES } from 'src/store/calendar/leaveSlice'

// ** Store

// ─── Type config: color + icon + description ──────────────────────────────
export const HOLIDAY_TYPE_CONFIG = {
  [HOLIDAY_TYPES.NATIONAL]: {
    color: '#1565C0',
    lightColor: '#DBEAFE',
    icon: 'tabler:building-bank',
    label: 'National',
    description: 'Gazetted public holidays for all employees'
  },
  [HOLIDAY_TYPES.RESTRICTED]: {
    color: '#B45309',
    lightColor: '#FEF3C7',
    icon: 'tabler:calendar-check',
    label: 'Restricted',
    description: 'Optional holidays — employee can opt-in'
  },
  [HOLIDAY_TYPES.CUSTOM]: {
    color: '#065F46',
    lightColor: '#D1FAE5',
    icon: 'tabler:building',
    label: 'Custom',
    description: 'Company-specific holidays'
  }
}

const ScrollWrapper = ({ children, hidden }) =>
  hidden ? (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>{children}</Box>
  ) : (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>{children}</Box>
  )

const HolidaySidebarLeft = ({
  store,
  mdAbove,
  dispatch,
  selectedYear,
  onYearChange,
  leftSidebarOpen,
  leftSidebarWidth,
  handleTypeToggle,
  handleAllTypes,
  handleLeftSidebarToggle,
  canEdit,              // permission flag
  onAddHolidayClick,   // open add sidebar
  holidayCounts         // { National: N, 'Restricted Holiday': N, Custom: N }
}) => {
  const { selectedTypes } = store

  const allChecked = selectedTypes.length === Object.values(HOLIDAY_TYPES).length
  const allIndeterminate =
    selectedTypes.length > 0 && selectedTypes.length < Object.values(HOLIDAY_TYPES).length

  const renderContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <Box
        sx={{
          p: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          Holidays
        </Typography>
        {!mdAbove && (
          <IconButton onClick={handleLeftSidebarToggle}>
            <Icon icon='tabler:x' />
          </IconButton>
        )}
      </Box>

      <ScrollWrapper hidden={false}>
        <Box sx={{ p: 5 }}>
          {/* ── Year Selector ── */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='overline'
              sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1.5 }}
            >
              Year
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <IconButton
                size='small'
                onClick={() => onYearChange(selectedYear - 1)}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Icon icon='tabler:chevron-left' fontSize={16} />
              </IconButton>
              <Typography
                variant='h6'
                sx={{ flex: 1, textAlign: 'center', fontWeight: 700, color: 'primary.main' }}
              >
                {selectedYear}
              </Typography>
              <IconButton
                size='small'
                onClick={() => onYearChange(selectedYear + 1)}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Icon icon='tabler:chevron-right' fontSize={16} />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* ── Add Holiday Button (permission-gated) ── */}
          {canEdit && (
            <Box
              onClick={onAddHolidayClick}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'primary.main',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                color: 'primary.main',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'primary.lighter',
                  borderStyle: 'solid'
                }
              }}
            >
              <Icon icon='tabler:plus' />
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'primary.main' }}>
                Add Holiday
              </Typography>
            </Box>
          )}

          {/* ── Filter by Type ── */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='overline'
              sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1.5 }}
            >
              Filter by Type
            </Typography>
          </Box>

          {/* All Types checkbox */}
          <FormControlLabel
            label={
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                All Types
              </Typography>
            }
            sx={{ mb: 2, ml: 0 }}
            control={
              <Checkbox
                checked={allChecked}
                indeterminate={allIndeterminate}
                onChange={e => dispatch(handleAllTypes(e.target.checked))}
              />
            }
          />

          {/* Individual type checkboxes */}
          {Object.values(HOLIDAY_TYPES).map(type => {
            const config = HOLIDAY_TYPE_CONFIG[type]
            const count = holidayCounts?.[type] || 0
            const isChecked = selectedTypes.includes(type)

            return (
              <Tooltip key={type} title={config.description} placement='right' arrow>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isChecked ? config.color + '40' : 'divider',
                    bgcolor: isChecked ? config.lightColor + '60' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    '&:hover': {
                      borderColor: config.color + '80',
                      bgcolor: config.lightColor + '80'
                    }
                  }}
                  onClick={() => dispatch(handleTypeToggle(type))}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Checkbox
                        size='small'
                        checked={isChecked}
                        onChange={() => dispatch(handleTypeToggle(type))}
                        onClick={e => e.stopPropagation()}
                        sx={{
                          p: 0,
                          color: config.color,
                          '&.Mui-checked': { color: config.color }
                        }}
                      />
                      <Icon icon={config.icon} fontSize={16} style={{ color: config.color }} />
                      <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.82rem' }}>
                        {config.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={count}
                      size='small'
                      sx={{
                        height: 18,
                        fontSize: '0.68rem',
                        bgcolor: config.color,
                        color: '#fff',
                        fontWeight: 700,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                </Box>
              </Tooltip>
            )
          })}

          <Divider sx={{ my: 4 }} />

          {/* ── Legend ── */}
          <Typography
            variant='overline'
            sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1.5, mb: 2, display: 'block' }}
          >
            Legend
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#1565C0', flexShrink: 0 }} />
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Mandatory — everyone gets the day off
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#B45309', flexShrink: 0 }} />
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Optional — employee chooses to avail
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#065F46', flexShrink: 0 }} />
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Company-specific declared days
              </Typography>
            </Box>
          </Box>
        </Box>
      </ScrollWrapper>
    </Box>
  )

  return mdAbove ? (
    <Drawer
      open
      variant='permanent'
      ModalProps={{ disablePortal: true, keepMounted: true }}
      sx={{
        zIndex: 3,
        display: 'block',
        position: 'static',
        '& .MuiDrawer-paper': {
          boxShadow: 'none',
          overflow: 'hidden',
          width: leftSidebarWidth,
          borderTopLeftRadius: theme => theme.shape.borderRadius,
          borderBottomLeftRadius: theme => theme.shape.borderRadius,
          position: 'relative',
          borderRight: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      {renderContent()}
    </Drawer>
  ) : (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: leftSidebarWidth,
          borderTopRightRadius: theme => theme.shape.borderRadius,
          borderBottomRightRadius: theme => theme.shape.borderRadius
        }
      }}
    >
      {renderContent()}
    </Drawer>
  )
}

export default HolidaySidebarLeft