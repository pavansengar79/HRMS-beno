// src/pages/apps/company/[id]/departments/index.jsx
// Department Management — expandable table view matching the screenshot
// Columns: Department | No of Employees | Status | Actions

import { useState, useCallback, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Redux
import { useSelector } from 'react-redux'
import { selectPermissions } from 'src/store/auth/authSlice'

// ** Axios + Toast
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

// ** Scope (org/company/unit) resolution — same hook used across the app
import useUnitContext from 'src/hooks/useUnitContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const countDescendants = node =>
  (node.children ?? []).reduce((acc, c) => acc + 1 + countDescendants(c), 0)

const flattenTree = (nodes, depth = 0) =>
  nodes.flatMap(n => [
    { ...n, _depth: depth },
    ...flattenTree(n.children ?? [], depth + 1),
  ])

const findInTree = (nodes, id) => {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findInTree(n.children ?? [], id)
    if (found) return found
  }
  return null
}

const filterTree = (nodes, q) => {
  if (!q) return nodes
  const lower = q.toLowerCase()
  return nodes.reduce((acc, n) => {
    const filteredChildren = filterTree(n.children ?? [], q)
    const name = (n.label || n.name || '').toLowerCase()
    if (name.includes(lower) || filteredChildren.length) {
      acc.push({ ...n, children: filteredChildren })
    }
    return acc
  }, [])
}

// ─── Status chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => (
  <Chip
    size='small'
    label={status === 'active' ? 'Active' : 'Inactive'}
    color={status === 'active' ? 'success' : 'error'}
    variant='tonal'
    sx={{ fontWeight: 600, minWidth: 72, fontSize: '0.75rem' }}
  />
)

// Removed simple DeptDialog - now using full departmentDrawer for Add/Edit

// ─── Delete Dialog ────────────────────────────────────────────────────────────
const DeleteDialog = ({ open, onClose, onConfirm, label, childCount, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
    <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600 }}>Delete "{label}"?</DialogTitle>
    <DialogContent>
      <Alert severity='warning' sx={{ mb: 1 }}>
        {childCount > 0
          ? `This deletes "${label}" and its ${childCount} sub-department(s). Employees will need reassignment.`
          : `"${label}" will be permanently deleted.`}
      </Alert>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} color='secondary' variant='tonal' size='small' disabled={loading}>Cancel</Button>
      <Button
        onClick={onConfirm} color='error' variant='contained' size='small' disabled={loading}
        startIcon={loading ? <CircularProgress size={14} color='inherit' /> : null}
      >
        {loading ? 'Deleting…' : 'Delete'}
      </Button>
    </DialogActions>
  </Dialog>
)

// ─── Single table row (recursive for children) ────────────────────────────────
const DeptRow = ({
  node, depth,
  expandedIds, toggleExpand,
  onAdd, onEdit, onDelete,
  canCreate, canEdit, canDelete,
}) => {
  const hasKids = (node.children ?? []).length > 0
  const isExpanded = expandedIds.has(node.id)
  const descendants = countDescendants(node)
  const name = node.label || node.name || '—'

  return (
    <>
      <TableRow
        hover
        sx={{
          '& td': {
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 1.75,
          },
          bgcolor: depth > 0 ? 'action.hover' : 'background.paper',
        }}
      >
        {/* ── Department name ────────────────────────────────────── */}
        <TableCell sx={{ pl: `${16 + depth * 28}px` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

            {/* Expand/collapse */}
            {hasKids ? (
              <IconButton
                size='small' onClick={() => toggleExpand(node.id)}
                sx={{ p: 0.5, color: 'text.secondary', flexShrink: 0 }}
              >
                <Icon
                  icon={isExpanded ? 'tabler:chevron-down' : 'tabler:chevron-right'}
                  fontSize={16}
                />
              </IconButton>
            ) : (
              /* Dash line for leaf nodes — matches screenshot */
              <Box sx={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Box component='span' sx={{
                  display: 'inline-block', width: 14, height: '1px',
                  bgcolor: 'text.disabled', opacity: 0.5,
                }} />
              </Box>
            )}

            {/* Color dot */}
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              bgcolor: node.color || '#028090',
            }} />

            {/* Name + description */}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant='body2'
                noWrap
                sx={{ fontWeight: depth === 0 ? 600 : 400, lineHeight: 1.4 }}
              >
                {name}
              </Typography>
              {node.description && (
                <Typography variant='caption' sx={{ color: 'text.disabled' }} noWrap>
                  {node.description}
                </Typography>
              )}
            </Box>

            {/* Sub count */}
            {descendants > 0 && (
              <Chip
                label={`${descendants} sub`}
                size='small'
                variant='tonal'
                sx={{
                  height: 18, fontSize: '0.65rem', ml: 0.5, flexShrink: 0,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}
          </Box>
        </TableCell>

        {/* ── Department Head ───────────────────────────────────── */}
        <TableCell align='center'>
          {node.departmentHeadId ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', mb: 0.25 }}>
                {node.departmentHeadId.name?.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Typography variant='caption' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {node.departmentHeadId.name}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem', lineHeight: 1 }}>
                {node.departmentHeadId.designation || node.departmentHeadId.employeeId}
              </Typography>
            </Box>
          ) : (
            <Typography variant='body2' sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              —
            </Typography>
          )}
        </TableCell>

        {/* ── Employee count ─────────────────────────────────────── */}
        <TableCell align='center'>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            {node.employeeCount != null
              ? String(node.employeeCount).padStart(2, '0')
              : '—'}
          </Typography>
        </TableCell>

        {/* ── Status ────────────────────────────────────────────── */}
        <TableCell align='center'>
          <StatusChip status={node.status} />
        </TableCell>

        {/* ── Actions ───────────────────────────────────────────── */}
        <TableCell align='right' sx={{ pr: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
            {canCreate && (
              <Tooltip title='Add sub-department' placement='top'>
                <IconButton size='small' sx={{ color: 'text.secondary' }}
                  onClick={() => onAdd(node.id, name)}>
                  <Icon icon='tabler:plus' fontSize={16} />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title='Edit' placement='top'>
                <IconButton size='small' sx={{ color: 'text.secondary' }}
                  onClick={() => onEdit(node.id)}>
                  <Icon icon='tabler:edit' fontSize={16} />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title='Delete' placement='top'>
                <IconButton size='small' sx={{ color: 'error.main' }}
                  onClick={() => onDelete(node.id, name, descendants)}>
                  <Icon icon='tabler:trash' fontSize={16} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {/* Render children recursively when expanded */}
      {hasKids && isExpanded &&
        (node.children ?? []).map(child => (
          <DeptRow
            key={child.id}
            node={child} depth={depth + 1}
            expandedIds={expandedIds} toggleExpand={toggleExpand}
            onAdd={onAdd} onEdit={onEdit} onDelete={onDelete}
            canCreate={canCreate} canEdit={canEdit} canDelete={canDelete}
          />
        ))
      }
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// onAddRoot  — optional: called instead of opening internal dialog for root-level creation
// onEdit     — optional: called when editing a department (receives departmentId)
// refreshKey — optional: increment this from the parent to trigger a re-fetch
const DepartmentTreePage = ({ onAddRoot, onEdit, refreshKey = 0 }) => {
  const permissions = useSelector(selectPermissions)
  const canCreate = permissions.includes('department.create')
  const canEdit = permissions.includes('department.update')
  const canDelete = permissions.includes('department.delete')

  // Resolves { orgId, companyId, unitId } from whichever context is active —
  // hierarchical URL (/org/../company/../unit/..), JWT-scoped unit_admin /
  // hr_manager profile, or the flat-route Redux selection.
  const { companyId, unitId } = useUnitContext()

  // Build a params object that only includes ids that actually exist —
  // never send `unitId: undefined` on the wire.
  const scopeParams = useCallback(() => {
    const params = {}
    if (companyId) params.companyId = companyId
    if (unitId)    params.unit_id    = unitId
    return params
  }, [companyId, unitId])

  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState(new Set())

  // Department dialog removed - now using full drawer from parent
  const [delDialog, setDelDialog] = useState({
    open: false, id: null, label: '', childCount: 0, loading: false,
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTree = useCallback(async () => {
    setLoading(true)
    try {
      // Use hierarchical tree endpoint (returns nested children array)
      const res = await axiosRequest.get('/api/v1/departments/tree/list', { params: scopeParams() })
      const data = res.data ?? []
      setTree(data)
      // Auto-expand all root nodes on first load
      setExpandedIds(prev =>
        prev.size === 0 ? new Set(data.map(n => n.id)) : prev
      )
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [scopeParams])

  // Re-fetch whenever the resolved scope changes (e.g. org admin switches unit)
  useEffect(() => { fetchTree() }, [fetchTree])

  // Re-fetch whenever parent increments refreshKey (e.g. after external create)
  useEffect(() => { if (refreshKey > 0) fetchTree() }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Expand / collapse ──────────────────────────────────────────────────────
  const toggleExpand = id =>
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const expandAll = () =>
    setExpandedIds(new Set(
      flattenTree(tree).filter(n => (n.children ?? []).length > 0).map(n => n.id)
    ))

  const collapseAll = () => setExpandedIds(new Set())

  // ── Dialog handlers ────────────────────────────────────────────────────────
  // Add: call parent's onAddRoot with parentId if adding sub-department
  const handleOpenAdd = (parentId, parentLabel) => {
    // For now, call onAddRoot - the parent drawer will handle it
    // TODO: Pass parentId to drawer for sub-department creation
    onAddRoot?.()
  }

  // Edit: call parent's onEdit with department ID
  const handleOpenEdit = id => {
    onEdit?.(id)
  }

  const handleOpenDelete = (id, label, childCount) =>
    setDelDialog({ open: true, id, label, childCount, loading: false })

  // API Create/Update removed - now handled by parent's departmentDrawer

  // ── API: Delete ────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setDelDialog(d => ({ ...d, loading: true }))
    try {
      // Use tree endpoint for delete (cascade checks)
      await axiosRequest.delete(`/api/v1/departments/tree/${delDialog.id}`, { params: scopeParams() })
      toast.success(`"${delDialog.label}" deleted`)
      setDelDialog({ open: false, id: null, label: '', childCount: 0, loading: false })
      fetchTree()
    } catch (e) {
      console.log("data", e)
      toast.error(typeof e === 'string' ? e : e?.message || e?.response?.data?.message || 'Delete failed')

      setDelDialog(d => ({ ...d, loading: false, open: false }))
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'departments.json'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported')
  }

  const totalDepts = flattenTree(tree).length
  const displayTree = filterTree(tree, search)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Card>
        {/* ── Card header ───────────────────────────────────────── */}
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon='tabler:building-community' fontSize={20} />
              Departments
              {!loading && (
                <Chip
                  label={totalDepts}
                  size='small' color='primary' variant='tonal'
                  sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }}
                />
              )}
            </Box>
          }
          subheader="Manage your company's organisational hierarchy"
          action={
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Tooltip title='Expand all'>
                <IconButton size='small' onClick={expandAll}>
                  <Icon icon='tabler:arrows-maximize' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Collapse all'>
                <IconButton size='small' onClick={collapseAll}>
                  <Icon icon='tabler:arrows-minimize' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Refresh'>
                <IconButton size='small' onClick={fetchTree}>
                  <Icon icon='tabler:refresh' />
                </IconButton>
              </Tooltip>
              <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />
              <Tooltip title='Export JSON'>
                <IconButton size='small' onClick={handleExport}>
                  <Icon icon='tabler:download' />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />

        <Divider />

        {/* ── Toolbar: search + add ──────────────────────────────── */}
        <Box sx={{
          px: 4, py: 3,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
        }}>
          <TextField
            size='small' placeholder='Search departments…'
            value={search} onChange={e => setSearch(e.target.value)}
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:search' fontSize={18} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setSearch('')}>
                    <Icon icon='tabler:x' fontSize={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {canCreate && (
            <Button
              variant='contained' size='small'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={() => onAddRoot ? onAddRoot() : handleOpenAdd(null, '')}
            >
              Add Department
            </Button>
          )}
        </Box>

        {/* Read-only notice */}
        {!canCreate && !canEdit && !canDelete && (
          <Box sx={{ px: 4, pb: 2 }}>
            <Alert severity='info'>You have read-only access to departments.</Alert>
          </Box>
        )}

        <Divider />

        {/* ── Table ─────────────────────────────────────────────── */}
        <TableContainer>
          <Table size='small' sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600, width: '35%', pl: 4, py: 1.5 }}>
                  Department
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 600, width: '15%', py: 1.5 }}>
                  Department Head
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 600, width: '15%', py: 1.5 }}>
                  Employees
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 600, width: '15%', py: 1.5 }}>
                  Status
                </TableCell>
                <TableCell align='right' sx={{ fontWeight: 600, width: '20%', pr: 3, py: 1.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ pl: `${16 + (i % 2) * 28}px` }}>
                      <Skeleton height={22} width={`${65 - i * 4}%`} />
                    </TableCell>
                    <TableCell align='center'><Skeleton height={22} width={32} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell align='center'><Skeleton height={22} width={64} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell align='center'><Skeleton height={22} width={64} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell align='right' sx={{ pr: 3 }}><Skeleton height={22} width={80} sx={{ ml: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : displayTree.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                      <Icon icon='tabler:building-off' fontSize={40} />
                      <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                        {search
                          ? `No departments match "${search}"`
                          : canCreate
                            ? 'No departments yet. Click "Add Department" to get started.'
                            : 'No departments found.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                displayTree.map(node => (
                  <DeptRow
                    key={node.id}
                    node={node} depth={0}
                    expandedIds={expandedIds} toggleExpand={toggleExpand}
                    onAdd={handleOpenAdd}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    canCreate={canCreate} canEdit={canEdit} canDelete={canDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Dialogs ───────────────────────────────────────────────── */}
      {/* Department dialog removed - using full drawer from parent instead */}
      
      <DeleteDialog
        open={delDialog.open}
        onClose={() => setDelDialog(d => ({ ...d, open: false }))}
        onConfirm={handleDeleteConfirm}
        label={delDialog.label}
        childCount={delDialog.childCount}
        loading={delDialog.loading}
      />
    </Box>
  )
}

export default DepartmentTreePage