// src/@core/layouts/components/shared-components/GlobalSearch/ResultGroup.js
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useTheme } from '@mui/material/styles'
import { getModuleConfig } from './searchConfig'
import ResultItem from './ResultItem'

// ─── Result Group Component ────────────────────────────────────────────────────
const ResultGroup = ({ moduleKey, items, onItemClick, selectedIndex, startIndex, highlightText }) => {
  const theme = useTheme()
  const config = getModuleConfig(moduleKey)

  return (
    <Box sx={{ mb: 3 }}>
      {/* ── Group Header ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          backgroundColor: theme.palette.background.default,
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        <Icon
          icon={config.icon}
          color={theme.palette[config.color]?.main || theme.palette.primary.main}
          fontSize='1rem'
        />
        <Typography
          variant='overline'
          sx={{
            ml: 1.5,
            fontWeight: 600,
            color: theme.palette[config.color]?.main || theme.palette.primary.main,
            letterSpacing: '0.05em'
          }}
        >
          {config.label}
        </Typography>
        <Typography
          variant='caption'
          sx={{
            ml: 'auto',
            color: 'text.disabled',
            fontWeight: 500
          }}
        >
          {items.length} result{items.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* ── Result Items ──────────────────────────────────────────────────────── */}
      {items.map((item, index) => (
        <ResultItem
          key={item._id}
          item={item}
          moduleKey={moduleKey}
          onClick={onItemClick}
          isSelected={selectedIndex === startIndex + index}
          highlightText={highlightText}
        />
      ))}
    </Box>
  )
}

export default ResultGroup
