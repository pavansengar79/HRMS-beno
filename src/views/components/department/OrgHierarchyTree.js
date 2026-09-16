// OrgHierarchyTree.jsx
// Premium Executive Organization Tree
// Full-screen, dynamic MUI tree with stable connectors and employee profile panel.
// API: /api/v1/organization/hierarchy-tree

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { alpha, styled, useTheme } from '@mui/material/styles'

import Icon from 'src/@core/components/icon'
import axiosRequest from 'src/utils/AxiosInterceptor'

// Theme colors will be derived from MUI theme
const getThemeColors = theme => ({
  gold: theme.palette.warning.main,
  goldBright: theme.palette.warning.light,
  primary: theme.palette.primary.main,
  background: theme.palette.background.paper,
  backgroundDefault: theme.palette.background.default
})

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2
const FIT_PADDING_PX = 24

const initialsOf = name =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const normalizeLevel = node => {
  const raw = String(node?.level || node?.type || '').toLowerCase()

  if (raw.includes('sub')) return 'subDepartment'
  if (raw.includes('employee') || raw.includes('user')) return 'employee'
  if (raw.includes('department') || raw.includes('dept')) return 'department'
  if (raw.includes('unit') || raw.includes('location')) return 'unit'
  if (raw.includes('company')) return 'company'
  if (raw.includes('business') || raw.includes('lob')) return 'business'
  return 'organization'
}

const LEVEL_CONFIG = {
  organization: {
    icon: 'tabler:crown',
    label: 'ORGANIZATION',
    accent: '#F4D98A' // Gold bright
  },
  company: {
    icon: 'tabler:building-skyscraper',
    label: 'COMPANY',
    accent: '#D9DDE5'
  },
  business: {
    icon: 'tabler:briefcase-2',
    label: 'BUSINESS',
    accent: '#E4C56A'
  },
  unit: {
    icon: 'tabler:hierarchy-2',
    label: 'UNIT',
    accent: '#C8A84E'
  },
  department: {
    icon: 'tabler:building',
    label: 'DEPARTMENT',
    accent: '#5E82C8'
  },
  subDepartment: {
    icon: 'tabler:git-branch',
    label: 'SUB DEPARTMENT',
    accent: '#4BA58A'
  },
  employee: {
    icon: 'tabler:user',
    label: 'EMPLOYEE',
    accent: '#AAB1BD'
  }
}

const TreeViewport = styled(Box)(({ theme }) => {
  const colors = getThemeColors(theme)
  
  return {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 500,
    overflow: 'hidden',
    cursor: 'grab',
    backgroundColor: theme.palette.background.default,
    '&:active': {
      cursor: 'grabbing'
    },
    '&::-webkit-scrollbar': {
      width: 10,
      height: 10
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.action.hover
    },
    '&::-webkit-scrollbar-thumb': {
      background: alpha(colors.gold, 0.35),
      borderRadius: 20
    }
  }
})

const TreeCanvas = styled(Box)(() => ({
  width: 'max-content',
  minWidth: '100%',
  minHeight: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '54px 80px 100px'
}))

const ChildrenRow = styled(Box)(({ theme }) => {
  return {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 54,
    width: 'max-content',
    margin: '0 auto',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      height: 54,
      borderLeft: `2px solid ${alpha(getThemeColors(theme).gold, 0.5)}`
    }
  }
})

const ChildSlot = styled(Box)(({ theme }) => {
  const colors = getThemeColors(theme)
  
  return {
    position: 'relative',
    width: 'max-content',
    minWidth: 248,
    flex: '0 0 auto',
    padding: '0 14px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      height: 54,
      borderLeft: `2px solid ${alpha(colors.gold, 0.5)}`
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      borderTop: `2px solid ${alpha(colors.gold, 0.5)}`
    },
    '&:first-of-type::after': {
      left: '50%'
    },
    '&:last-of-type::after': {
      right: '50%'
    },
    '&:only-of-type::after': {
      display: 'none'
    }
  }
})

const PremiumSurface = styled(Paper)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  boxShadow: theme.shadows[4],
  backdropFilter: 'blur(18px)',
  transition: 'all 0.2s ease'
}))

const NodeCard = ({ node, selected, onSelect }) => {
  const theme = useTheme()
  const colors = getThemeColors(theme)
  const level = normalizeLevel(node)
  const config = LEVEL_CONFIG[level]
  const accent = node.color || config.accent
  const isEmployee = level === 'employee'
  const active = String(node.status || 'active').toLowerCase() === 'active'
  const photo = node.profilePhoto || node.photo || node.avatar || node.logo
  const count =
    node.employeeCount ??
    node.employees?.length ??
    (level !== 'employee' ? node.children?.length : undefined)

  if (isEmployee) {
    return (
      <Tooltip title={`${node.name || 'Employee'} • ${node.designation || 'Employee'}`} arrow>
        <PremiumSurface
          onClick={() => onSelect?.(node)}
          sx={{
            width: 190,
            minHeight: 174,
            p: 2,
            borderRadius: 3,
            cursor: 'pointer',
            textAlign: 'center',
            borderColor: selected ? colors.goldBright : alpha(colors.gold, 0.3),
            boxShadow: selected ? theme.shadows[8] : undefined,
            transform: selected ? 'translateY(-4px)' : 'none',
            transition: 'all .25s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              borderColor: colors.goldBright,
              boxShadow: theme.shadows[6]
            }
          }}
        >
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 13,
                  height: 13,
                  borderRadius: '50%',
                  bgcolor: active ? '#22C55E' : '#EF4444',
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            }
          >
            <Avatar
              src={photo}
              sx={{
                width: 68,
                height: 68,
                border: `2px solid ${colors.gold}`,
                bgcolor: alpha(colors.gold, 0.1),
                color: colors.goldBright,
                fontWeight: 800
              }}
            >
              {!photo && initialsOf(node.name)}
            </Avatar>
          </Badge>

          <Typography
            sx={{
              mt: 1.3,
              color: 'text.primary',
              fontWeight: 800,
              fontSize: '.88rem',
              lineHeight: 1.2
            }}
          >
            {node.name}
          </Typography>

          {node.designation && (
            <Chip
              label={node.designation}
              size='small'
              sx={{
                mt: .8,
                maxWidth: '100%',
                height: 22,
                color: colors.goldBright,
                bgcolor: alpha(colors.gold, 0.1),
                border: `1px solid ${alpha(colors.gold, 0.25)}`,
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          )}

          <Typography sx={{ mt: .6, color: 'text.secondary', fontSize: '.68rem' }}>
            {node.departmentName || node.department?.name || 'Employee'}
          </Typography>
        </PremiumSurface>
      </Tooltip>
    )
  }

  return (
    <Tooltip title={`${node.name || config.label}${count != null ? ` • ${count} employees` : ''}`} arrow>
      <PremiumSurface
        onClick={() => onSelect?.(node)}
        sx={{
          width: level === 'organization' ? 250 : 220,
          minHeight: level === 'organization' ? 150 : 132,
          px: 2.3,
          py: 2,
          borderRadius: level === 'organization' ? '50%' : 3,
          cursor: 'pointer',
          textAlign: 'center',
          position: 'relative',
          borderColor: selected ? colors.goldBright : alpha(accent, 0.42),
          boxShadow: selected ? theme.shadows[8] : undefined,
          transition: 'all .25s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            borderColor: colors.goldBright,
            boxShadow: theme.shadows[6]
          }
        }}
      >
        <Box
          sx={{
            width: level === 'organization' ? 64 : 50,
            height: level === 'organization' ? 64 : 50,
            mx: 'auto',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            border: `2px solid ${accent}`,
            bgcolor: alpha(accent, .08),
            color: accent,

          }}
        >
          <Icon icon={config.icon} fontSize={level === 'organization' ? 32 : 25} />
        </Box>

        <Typography
          sx={{
            mt: 1.1,
            color: accent,
            fontSize: '.62rem',
            fontWeight: 900,
            letterSpacing: 1.7
          }}
        >
          {config.label}
        </Typography>

        <Typography
          sx={{
            mt: .35,
            color: 'text.primary',
            fontWeight: 850,
            fontSize: level === 'organization' ? '1.05rem' : '.94rem',
            lineHeight: 1.25
          }}
        >
          {node.name}
        </Typography>

        {node.managerName && (
          <Typography sx={{ mt: .55, color: 'text.secondary', fontSize: '.68rem' }}>
            Head: {node.managerName}
          </Typography>
        )}

        {count != null && level !== 'organization' && (
          <Box
            sx={{
              mt: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: .55,
              px: 1,
              py: .35,
              borderRadius: 99,
              bgcolor: alpha(accent, .08),
              border: `1px solid ${alpha(accent, .18)}`
            }}
          >
            <Icon icon='tabler:users' fontSize={13} style={{ color: accent }} />
            <Typography sx={{ color: accent, fontWeight: 800, fontSize: '.66rem' }}>
              {count} employees
            </Typography>
          </Box>
        )}
      </PremiumSurface>
    </Tooltip>
  )
}

const TreeNode = ({ node, selectedId, onSelect }) => {
  const children = Array.isArray(node?.children) ? node.children : []
  const id = node?.id || node?._id

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <NodeCard node={node} selected={selectedId === id} onSelect={onSelect} />

      {children.length > 0 && (
        <ChildrenRow>
          {children.map(child => (
            <ChildSlot key={child.id || child._id || child.name}>
              <TreeNode node={child} selectedId={selectedId} onSelect={onSelect} />
            </ChildSlot>
          ))}
        </ChildrenRow>
      )}
    </Box>
  )
}

export const EmployeeProfileCard = ({ employee, onClose }) => {
  const theme = useTheme()
  const colors = getThemeColors(theme)
  
  if (!employee) return null

  const photo = employee.profilePhoto || employee.photo || employee.avatar

  const details = [
    ['Job Role', employee.designation || employee.jobRole, 'tabler:briefcase'],
    ['Department', employee.departmentName || employee.department?.name, 'tabler:building'],
    ['Sub Department', employee.subDepartmentName || employee.subDepartment?.name, 'tabler:git-branch'],
    ['Unit', employee.unitName || employee.unit?.name, 'tabler:hierarchy-2'],
    ['Company', employee.companyName || employee.company?.name, 'tabler:building-skyscraper'],
    ['Email', employee.email, 'tabler:mail'],
    ['Phone', employee.phone, 'tabler:phone'],
    ['Reports To', employee.reportsTo || employee.reportingManager?.name, 'tabler:user-cog']
  ].filter(([, value]) => value)

  return (
    <Card
      sx={{
        width: 360,
        maxHeight: 'calc(100vh - 150px)',
        overflow: 'auto',
        flexShrink: 0,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(colors.gold, 0.45)}`,
        boxShadow: `0 24px 70px rgba(0,0,0,.55), 0 0 40px ${alpha(GOLD, .12)}`
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
          <Chip
            label='EMPLOYEE PROFILE'
            size='small'
            sx={{
              color: colors.goldBright,
              bgcolor: alpha(colors.gold, 0.1),
              border: `1px solid ${alpha(colors.gold, 0.25)}`,
              fontWeight: 800
            }}
          />
          <IconButton onClick={onClose} size='small' sx={{ color: '#A1A1AA' }}>
            <Icon icon='tabler:x' />
          </IconButton>
        </Stack>

        <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 2.5 }}>
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 13,
                  height: 13,
                  borderRadius: '50%',
                  bgcolor: String(employee.status || 'active').toLowerCase() === 'active'
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              />
            }
          >
            <Avatar
              src={photo}
              sx={{
                width: 76,
                height: 76,
                border: `2px solid ${colors.gold}`,
                bgcolor: alpha(colors.gold, 0.1),
                color: colors.goldBright,
                fontWeight: 800,
                fontSize: '1.4rem'
              }}
            >
              {!photo && initialsOf(employee.name)}
            </Avatar>
          </Badge>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: 'text.primary', fontSize: '1.1rem', fontWeight: 850 }}>
              {employee.name}
            </Typography>
            <Typography sx={{ color: colors.goldBright, fontSize: '.75rem', fontWeight: 700, mt: .35 }}>
              {employee.employeeId || 'EMPLOYEE'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2.3 }} />

        {details.map(([label, value, icon]) => (
          <Box
            key={label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              py: 1.05,
              borderBottom: `1px solid ${alpha('#fff', .045)}`
            }}
          >
            <Stack direction='row' spacing={1} alignItems='center'>
              <Icon icon={icon} fontSize={16} style={{ color: colors.gold }} />
              <Typography sx={{ color: 'text.secondary', fontSize: '.72rem', fontWeight: 650 }}>
                {label}
              </Typography>
            </Stack>
            <Typography
              sx={{
                color: label === 'Job Role' ? colors.goldBright : 'text.primary',
                fontSize: '.72rem',
                fontWeight: 750,
                textAlign: 'right',
                maxWidth: '58%'
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}

const TreeSkeleton = ({ theme }) => (
  <Box sx={{ p: 8, minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Stack spacing={4} alignItems='center'>
      <Box sx={{ width: 220, height: 130, borderRadius: 4, bgcolor: 'action.hover' }} />
      <Stack direction='row' spacing={3}>
        {[1, 2].map(i => (
          <Box key={i} sx={{ width: 220, height: 110, borderRadius: 3, bgcolor: 'action.hover' }} />
        ))}
      </Stack>
    </Stack>
  </Box>
)

const OrgHierarchyTree = ({
  data,
  loading = false,
  emptyText = 'No organization hierarchy available',
  onSelectNode
}) => {
  const theme = useTheme()
  const colors = getThemeColors(theme)
  const viewportRef = useRef(null)
  const treeContentRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [treeData, setTreeData] = useState(data)
  const [isLoading, setIsLoading] = useState(loading)
  
  // Zoom and Pan State
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, MAX_ZOOM))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, MIN_ZOOM))

  const fitTreeToViewport = useCallback(() => {
    const viewport = viewportRef.current
    const treeContent = treeContentRef.current

    if (!viewport || !treeContent) return

    const availableWidth = Math.max(viewport.clientWidth - FIT_PADDING_PX * 2, 1)
    const availableHeight = Math.max(viewport.clientHeight - FIT_PADDING_PX * 2, 1)
    const widthScale = availableWidth / treeContent.scrollWidth
    const heightScale = availableHeight / treeContent.scrollHeight
    const fittedZoom = Math.max(MIN_ZOOM, Math.min(1, widthScale, heightScale))

    setZoom(fittedZoom)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)))
    }
  }, [])

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers for pinch zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      viewportRef.current.pinchDistance = distance
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const newDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      const prevDistance = viewportRef.current.pinchDistance || newDistance
      const scale = newDistance / prevDistance
      viewportRef.current.pinchDistance = newDistance
      
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale)))
    }
  }, [])

  useEffect(() => {
    if (!data) {
      const fetchTree = async () => {
        setIsLoading(true)
        try {
          const res = await axiosRequest.get('/api/v1/organization/hierarchy-tree')
          setTreeData(res.data?.data || res.data || null)
        } catch (err) {
          console.error('Failed to load org hierarchy:', err)
          setTreeData(null)
        } finally {
          setIsLoading(false)
        }
      }

      fetchTree()
    } else {
      setTreeData(data)
      setIsLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (!treeData || isLoading) return undefined

    const animationFrame = requestAnimationFrame(fitTreeToViewport)
    const resizeObserver = new ResizeObserver(fitTreeToViewport)

    if (viewportRef.current) resizeObserver.observe(viewportRef.current)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
    }
  }, [fitTreeToViewport, isLoading, treeData])

  const selectedId = useMemo(
    () => selectedNode?.id || selectedNode?._id,
    [selectedNode]
  )

  const handleSelect = node => {
    setSelectedNode(node)
    onSelectNode?.(node)
  }

  if (isLoading) return <TreeSkeleton theme={theme} />

  if (!treeData) {
    return (
      <Box
        sx={{
          minHeight: 500,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Stack alignItems='center' spacing={1.5}>
          <Icon icon='tabler:sitemap' fontSize={60} style={{ color: colors.gold, opacity: 0.35 }} />
          <Typography fontWeight={700} color='text.secondary'>{emptyText}</Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      {/* Top bar with zoom controls */}
      <Box
        sx={{
          height: 56,
          flexShrink: 0,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Box
            sx={{
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              border: `1px solid ${alpha(colors.gold, 0.4)}`,
              bgcolor: alpha(colors.gold, 0.08),
              color: colors.goldBright
            }}
          >
            <Icon icon='tabler:sitemap' fontSize={20} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              Organization Tree
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '.7rem' }}>
              Dynamic organizational structure
            </Typography>
          </Box>
        </Stack>

        <Stack direction='row' spacing={1} alignItems='center'>
          {/* Zoom controls */}
          <Tooltip title='Zoom Out'>
            <IconButton
              size='small'
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              sx={{ color: colors.goldBright }}
            >
              <Icon icon='tabler:zoom-out' fontSize={18} />
            </IconButton>
          </Tooltip>
          
          <Chip
            label={`${Math.round(zoom * 100)}%`}
            size='small'
            sx={{
              color: colors.goldBright,
              bgcolor: alpha(colors.gold, 0.1),
              border: `1px solid ${alpha(colors.gold, 0.3)}`,
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          />
          
          <Tooltip title='Zoom In'>
            <IconButton
              size='small'
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              sx={{ color: colors.goldBright }}
            >
              <Icon icon='tabler:zoom-in' fontSize={18} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title='Fit to View'>
            <IconButton
              size='small'
              onClick={fitTreeToViewport}
              sx={{ color: colors.goldBright }}
            >
              <Icon icon='tabler:arrows-maximize' fontSize={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <TreeViewport
          ref={viewportRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <Box
            ref={treeContentRef}
            sx={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center top',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              willChange: 'transform'
            }}
          >
            <TreeCanvas>
              <TreeNode
                node={treeData}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </TreeCanvas>
          </Box>
        </TreeViewport>

        {selectedNode?.level === 'employee' || normalizeLevel(selectedNode) === 'employee' ? (
          <Box
            sx={{
              position: 'absolute',
              top: 76,
              right: { xs: 12, md: 28 },
              zIndex: 5
            }}
          >
            <EmployeeProfileCard
              employee={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

export default OrgHierarchyTree