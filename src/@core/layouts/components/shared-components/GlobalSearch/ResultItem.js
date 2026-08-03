// src/@core/layouts/components/shared-components/GlobalSearch/ResultItem.js
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Icon from 'src/@core/components/icon'
import { useTheme } from '@mui/material/styles'
import { getModuleConfig } from './searchConfig'

// ─── Result Item Component ────────────────────────────────────────────────────
const ResultItem = ({ item, moduleKey, onClick, isSelected, highlightText }) => {
  const theme = useTheme()
  const config = getModuleConfig(moduleKey)

  // ── Extract Fields ─────────────────────────────────────────────────────────
  const { title, subtitle, description, avatar } = item

  // ── Handle Click ───────────────────────────────────────────────────────────
  const handleClick = () => {
    onClick(item)
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        py: 2,
        px: 3,
        cursor: 'pointer',
        backgroundColor: isSelected ? theme.palette.action.hover : 'transparent',
        transition: 'background-color 0.1s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      {/* ── Avatar / Icon ─────────────────────────────────────────────────────── */}
      <Box sx={{ mr: 2.5, mt: 0.5 }}>
        {avatar ? (
          <Avatar
            src={avatar}
            alt={title}
            sx={{ width: 40, height: 40 }}
          />
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: `${theme.palette[config.color]?.main || theme.palette.primary.main}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon
              icon={config.icon}
              color={theme.palette[config.color]?.main || theme.palette.primary.main}
              fontSize='1.25rem'
            />
          </Box>
        )}
      </Box>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* ── Title + Module Badge ─────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography
            variant='body2'
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              mr: 1
            }}
          >
            {highlightText ? highlightText(title) : title}
          </Typography>
          <Chip
            label={config.label}
            size='small'
            color={config.color}
            variant='outlined'
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }}
          />
        </Box>

        {/* ── Subtitle ─────────────────────────────────────────────────────────── */}
        {subtitle && (
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}
          >
            {highlightText ? highlightText(subtitle) : subtitle}
          </Typography>
        )}

        {/* ── Description ──────────────────────────────────────────────────────── */}
        {description && (
          <Typography
            variant='caption'
            sx={{ color: 'text.disabled', display: 'block' }}
          >
            {highlightText ? highlightText(description) : description}
          </Typography>
        )}
      </Box>

      {/* ── Keyboard Hint ─────────────────────────────────────────────────────── */}
      {isSelected && (
        <Box sx={{ ml: 2, mt: 1 }}>
          <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
            Enter →
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ResultItem
