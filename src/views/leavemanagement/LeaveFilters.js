// src/views/leavemanagement/LeaveFilters.js
import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/@core/components/mui/text-field'
import { EmployeeSelect, DepartmentSelect } from 'src/components/employee'
import Icon from 'src/@core/components/icon'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'UNDER_REVIEW', label: 'Under Review' }
]

const DURATION_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' }
]

const LeaveFilters = ({
  selectedEmployee,
  setSelectedEmployee,
  selectedDept,
  setSelectedDept,
  leaveTypeFilter,
  setLeaveTypeFilter,
  durationPreset,
  setDurationPreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  statusFilter,
  setStatusFilter,
  leaveTypes = [],
  unitId,
  totalRecords,
  onFilterChange
}) => {
  const getActiveFilterChips = () => {
    const chips = []

    if (selectedEmployee) {
      chips.push({
        key: 'employee',
        label: `Employee: ${selectedEmployee.name || selectedEmployee._id}`,
        value: selectedEmployee
      })
    }
    if (selectedDept) {
      const deptName = selectedDept.name || selectedDept
      chips.push({
        key: 'department',
        label: `Department: ${deptName}`,
        value: selectedDept
      })
    }
    if (leaveTypeFilter) {
      const typeLabel = leaveTypes.find(t => t._id === leaveTypeFilter)?.name || leaveTypeFilter
      chips.push({
        key: 'leaveType',
        label: `Leave Type: ${typeLabel}`,
        value: leaveTypeFilter
      })
    }
    if (durationPreset !== 'thisMonth') {
      const presetLabel = DURATION_PRESETS.find(d => d.value === durationPreset)?.label || durationPreset
      chips.push({
        key: 'duration',
        label: `Duration: ${presetLabel}`,
        value: durationPreset
      })
    }
    if (statusFilter) {
      const statusLabel = STATUS_OPTIONS.find(s => s.value === statusFilter)?.label || statusFilter
      chips.push({
        key: 'status',
        label: `Status: ${statusLabel}`,
        value: statusFilter
      })
    }

    return chips
  }

  const handleClearFilter = (key) => {
    switch (key) {
      case 'employee':
        setSelectedEmployee(null)
        break
      case 'department':
        setSelectedDept('')
        break
      case 'leaveType':
        setLeaveTypeFilter('')
        break
      case 'duration':
        setDurationPreset('thisMonth')
        setCustomStartDate(null)
        setCustomEndDate(null)
        break
      case 'status':
        setStatusFilter('')
        break
    }
    if (onFilterChange) onFilterChange()
  }

  const handleClearAll = () => {
    setSelectedEmployee(null)
    setSelectedDept('')
    setLeaveTypeFilter('')
    setDurationPreset('thisMonth')
    setCustomStartDate(null)
    setCustomEndDate(null)
    setStatusFilter('')
    if (onFilterChange) onFilterChange()
  }

  const activeChips = getActiveFilterChips()
  const hasActiveFilters = activeChips.length > 0

  return (
    <Paper className='leavereq' elevation={0} sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 1, mb: 3 }}>
      {/* Filter Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon icon='tabler:filter' fontSize={20} />
          <Typography variant='subtitle1' fontWeight={600}>
            Filters
          </Typography>
          {totalRecords !== undefined && (
            <Chip
              label={`${totalRecords} record${totalRecords !== 1 ? 's' : ''} found`}
              size='small'
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          )}
        </Box>
        {hasActiveFilters && (
          <Button
            size='small'
            variant='text'
            color='primary'
            startIcon={<Icon icon='tabler:x' />}
            onClick={handleClearAll}
            sx={{ fontSize: '0.75rem' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {activeChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              size='small'
              color='primary'
              variant='outlined'
              onDelete={() => handleClearFilter(chip.key)}
              sx={{ height: 28, fontSize: '0.75rem', '& .MuiChip-label': { px: 1.5 } }}
            />
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Employee Filter */}
        <Box sx={{ minWidth: 180, flex: '0 0 auto' }}>
          <EmployeeSelect
            value={selectedEmployee}
            onChange={(employee) => {
              setSelectedEmployee(employee)
              if (onFilterChange) onFilterChange()
            }}
            size='small'
            unitId={unitId}
            placeholder='Filter by employee...'
          />
        </Box>

        {/* Department Filter */}
        <Box sx={{ minWidth: 160, flex: '0 0 auto' }}>
          <DepartmentSelect
            value={selectedDept}
            onChange={(deptId) => {
              setSelectedDept(deptId)
              if (onFilterChange) onFilterChange()
            }}
            size='small'
          />
        </Box>

        {/* Leave Type Filter */}
        <CustomTextField
          select
          size='small'
          label='Leave Type'
          value={leaveTypeFilter}
          onChange={(e) => {
            setLeaveTypeFilter(e.target.value)
            if (onFilterChange) onFilterChange()
          }}
          sx={{ minWidth: 150, flex: '0 0 auto' }}
        >
          <MenuItem value=''>
            <em>All Types</em>
          </MenuItem>
          {leaveTypes.map((lt) => (
            <MenuItem key={lt._id} value={lt._id}>
              {lt.name} ({lt.code})
            </MenuItem>
          ))}
        </CustomTextField>

        {/* Duration Preset */}
        <CustomTextField
          select
          size='small'
          label='Duration'
          value={durationPreset}
          onChange={(e) => {
            setDurationPreset(e.target.value)
            if (onFilterChange) onFilterChange()
          }}
          sx={{ minWidth: 140, flex: '0 0 auto' }}
        >
          {DURATION_PRESETS.map((preset) => (
            <MenuItem key={preset.value} value={preset.value}>
              {preset.label}
            </MenuItem>
          ))}
        </CustomTextField>

        {/* Custom Date Range (if selected) */}
        {durationPreset === 'custom' && (
          <>
            <CustomTextField
              type='date'
              label='Start Date'
              value={customStartDate || ''}
              onChange={(e) => {
                setCustomStartDate(e.target.value)
                if (onFilterChange) onFilterChange()
              }}
              size='small'
              sx={{ minWidth: 150 }}
              InputLabelProps={{ shrink: true }}
            />
            <CustomTextField
              type='date'
              label='End Date'
              value={customEndDate || ''}
              onChange={(e) => {
                setCustomEndDate(e.target.value)
                if (onFilterChange) onFilterChange()
              }}
              size='small'
              sx={{ minWidth: 150 }}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}

        {/* Status Filter */}
        <CustomTextField
          select
          size='small'
          label='Status'
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            if (onFilterChange) onFilterChange()
          }}
          sx={{ minWidth: 140, flex: '0 0 auto' }}
        >
          <MenuItem value=''>
            <em>All Statuses</em>
          </MenuItem>
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </CustomTextField>
      </Box>
    </Paper>
  )
}

export default LeaveFilters
