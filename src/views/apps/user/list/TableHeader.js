// src/views/apps/user/list/TableHeader.jsx
// Table header — Export + Search + Add New User + Invite button

import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import InviteDrawer from './inviteDrawer'

// ** Invite Drawer

const TableHeader = props => {
  const { handleFilter, toggle, value, onInviteSuccess } = props

  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      <Box
        sx={{
          py: 4,
          px: 6,
          rowGap: 2,
          columnGap: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Export */}
        <Button color='secondary' variant='tonal' startIcon={<Icon icon='tabler:upload' />}>
          Export
        </Button>

        {/* Right: Search + Add + Invite */}
        <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
          <CustomTextField
            value={value}
            placeholder='Search User'
            onChange={e => handleFilter(e.target.value)}
          />

          {/* Invite — sends email invite via API */}
          <Button
            variant='tonal'
            color='primary'
            startIcon={<Icon fontSize='1.125rem' icon='tabler:mail-forward' />}
            onClick={() => setInviteOpen(true)}
          >
            Invite User
          </Button>

          {/* Add New User — opens existing AddUserDrawer */}
          <Button onClick={toggle} variant='contained' sx={{ '& svg': { mr: 2 } }}>
            <Icon fontSize='1.125rem' icon='tabler:plus' />
            Add New User
          </Button>
        </Box>
      </Box>

      {/* Invite Drawer */}
      <InviteDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={onInviteSuccess}
      />
    </>
  )
}

export default TableHeader