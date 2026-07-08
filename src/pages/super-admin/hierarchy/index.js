// src/pages/super-admin/hierarchy/index.js
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCustomerHierarchy } from 'src/store/superAdmin/superAdminSlice'
import {
  Box, Card, Grid, Typography, Chip, Avatar,
  TreeItem, TreeView, CircularProgress, Alert,
  IconButton, Collapse, Button
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTheme, alpha } from '@mui/material/styles'

const HierarchyNode = ({ node, level = 0 }) => {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)
  
  const TYPE_COLORS = {
    customer: '#6366f1',
    organisation: '#0ea5e9',
    company: '#10b981',
    unit: '#f59e0b',
    employee: '#8b5cf6'
  }

  const TYPE_ICONS = {
    customer: 'tabler:building-skyscraper',
    organisation: 'tabler:building-community',
    company: 'tabler:building',
    unit: 'tabler:building-monument',
    employee: 'tabler:user'
  }

  const color = TYPE_COLORS[node.type] || '#64748b'
  const icon = TYPE_ICONS[node.type] || 'tabler:folder'
  const hasChildren = node.children && node.children.length > 0

  return (
    <Box sx={{ ml: level * 3 }}>
      <Card 
        sx={{ 
          mb: 2, 
          p: 2,
          border: `1px solid ${alpha(color, 0.2)}`,
          bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.05 : 0.02)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color }}>
              <Icon icon={icon} fontSize={20} />
            </Avatar>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {node.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {node.type?.charAt(0).toUpperCase() + node.type?.slice(1)}
                {node.status && ` · ${node.status}`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {node.plan && <Chip label={node.plan} size='small' variant='outlined' />}
            {node.email && <Typography variant='caption' color='text.secondary'>{node.email}</Typography>}
            {hasChildren && (
              <IconButton size='small' onClick={() => setExpanded(!expanded)}>
                <Icon icon={expanded ? 'tabler:chevron-down' : 'tabler:chevron-right'} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Card>
      <Collapse in={expanded}>
        {hasChildren && node.children.map((child, idx) => (
          <HierarchyNode key={child._id || child.id || idx} node={child} level={level + 1} />
        ))}
      </Collapse>
    </Box>
  )
}

const CustomerHierarchy = () => {
  const dispatch = useDispatch()
  const { hierarchy, loading, error } = useSelector(state => state.superAdmin)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getCustomerHierarchy())
  }, [dispatch])

  const filteredHierarchy = hierarchy.filter(node => 
    node.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && hierarchy.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5 }}>Customer Hierarchy</Typography>
          <Typography variant='body2' color='text.secondary'>
            Super Admin · Organization Structure
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<Icon icon='tabler:refresh' />}
          onClick={() => dispatch(getCustomerHierarchy())}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity='error' sx={{ mb: 4 }}>{error}</Alert>}

      <Card sx={{ p: 4 }}>
        {filteredHierarchy.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color='text.secondary'>No hierarchy data available</Typography>
          </Box>
        ) : (
          filteredHierarchy.map((node, idx) => (
            <HierarchyNode key={node._id || node.id || idx} node={node} />
          ))
        )}
      </Card>
    </Box>
  )
}

export default CustomerHierarchy
