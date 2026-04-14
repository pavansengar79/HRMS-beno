/**
 * Sidebar Left: Holiday Category Filters
 *
 * Displays:
 * - "Add Event" button
 * - Date picker
 * - Holiday category checkboxes (RH, National, Optional, Company)
 * - "View All" button for quick selection
 *
 * @file src/views/apps/calendar/SidebarLeft.js
 */

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icons Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Constants
import { HOLIDAY_CATEGORIES, HOLIDAY_CATEGORY_LABELS, ALL_HOLIDAY_CATEGORIES } from 'src/configs/holidayConstants'

const SidebarLeft = props => {
  const {
    store,
    mdAbove,
    dispatch,
    calendarApi,
    holidayColors,
    leftSidebarOpen,
    leftSidebarWidth,
    handleSelectEvent,
    handleAllCategories,
    handleCategoriesUpdate,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props

  // ─────────────────────────────────────────────────────────────────────────
  // Build category filter list with labels and colors
  // ─────────────────────────────────────────────────────────────────────────
  const categoryFilters = ALL_HOLIDAY_CATEGORIES.map(category => ({
    key: category,
    label: HOLIDAY_CATEGORY_LABELS[category],
    color: holidayColors?.[category] || 'default'
  }))

  /**
   * Render category filter checkboxes
   */
  const renderFilters = categoryFilters.length
    ? categoryFilters.map(({ key, label, color }) => {
        return (
          <FormControlLabel
            key={key}
            label={label}
            sx={{ '& .MuiFormControlLabel-label': { color: 'text.secondary' } }}
            control={
              <Checkbox
                color={color}
                checked={store.selectedCategories.includes(key)}
                onChange={() => dispatch(handleCategoriesUpdate(key))}
              />
            }
          />
        )
      })
    : null

  /**
   * Handle sidebar toggle and clear selected event
   */
  const handleSidebarToggleSidebar = () => {
    handleAddEventSidebarToggle()
    dispatch(handleSelectEvent(null))
  }

  if (!renderFilters) {
    return null
  }

  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      variant={mdAbove ? 'permanent' : 'temporary'}
      ModalProps={{
        disablePortal: true,
        disableAutoFocus: true,
        disableScrollLock: true,
        keepMounted: true // Better open performance on mobile
      }}
      sx={{
        zIndex: 3,
        display: 'block',
        position: mdAbove ? 'static' : 'absolute',
        '& .MuiDrawer-paper': {
          borderRadius: 1,
          boxShadow: 'none',
          width: leftSidebarWidth,
          borderTopRightRadius: 0,
          alignItems: 'flex-start',
          borderBottomRightRadius: 0,
          zIndex: mdAbove ? 2 : 'drawer',
          position: mdAbove ? 'static' : 'absolute'
        },
        '& .MuiBackdrop-root': {
          borderRadius: 1,
          position: 'absolute'
        }
      }}
    >
      {/* Add Event Button */}
      <Box sx={{ p: 6, width: '100%' }}>
        <Button fullWidth variant='contained' sx={{ '& svg': { mr: 2 } }} onClick={handleSidebarToggleSidebar}>
          <Icon icon='tabler:plus' fontSize='1.125rem' />
          Add Event
        </Button>
      </Box>

      {/* Divider */}
      <Divider sx={{ width: '100%', m: '0 !important' }} />

      {/* Date Picker */}
      <DatePickerWrapper
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          '& .react-datepicker': { boxShadow: 'none !important', border: 'none !important' }
        }}
      >
        <DatePicker inline onChange={date => calendarApi?.gotoDate(date)} />
      </DatePickerWrapper>

      {/* Divider */}
      <Divider sx={{ width: '100%', m: '0 !important' }} />

      {/* Holiday Category Filters */}
      <Box sx={{ p: 6, width: '100%', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
        {/* Filter Section Title */}
        <Typography variant='body2' sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase' }}>
          Holiday Categories
        </Typography>

        {/* View All Checkbox */}
        <FormControlLabel
          label='View All'
          sx={{ '& .MuiFormControlLabel-label': { color: 'text.secondary', mb: 2 } }}
          control={
            <Checkbox
              checked={store.selectedCategories.length === ALL_HOLIDAY_CATEGORIES.length}
              indeterminate={
                store.selectedCategories.length > 0 && store.selectedCategories.length < ALL_HOLIDAY_CATEGORIES.length
              }
              onChange={e => dispatch(handleAllCategories(e.target.checked))}
            />
          }
        />

        {/* Category Checkboxes */}
        {renderFilters}
      </Box>
    </Drawer>
  )
}

export default SidebarLeft
