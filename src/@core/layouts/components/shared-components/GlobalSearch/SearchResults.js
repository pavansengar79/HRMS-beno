// src/@core/layouts/components/shared-components/GlobalSearch/SearchResults.js
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import ResultGroup from './ResultGroup'

// ─── Search Results Component ──────────────────────────────────────────────────
const SearchResults = ({ onItemClick, highlightText }) => {
  const theme = useTheme()
  const { results, loading, query, selectedIndex } = useSelector(state => state.search)
  
  // ── Flatten Results for Navigation ──────────────────────────────────────────
  const getFlatResults = () => {
    let flat = []
    let index = 0
    
    Object.keys(results).forEach(moduleKey => {
      results[moduleKey].forEach(item => {
        flat.push({ ...item, moduleKey, index })
        index++
      })
    })
    
    return flat
  }
  
  const flatResults = getFlatResults()
  const totalResults = Object.values(results).reduce((sum, items) => sum + items.length, 0)

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Icon icon='tabler:loader-2' color={theme.palette.text.disabled} fontSize='2rem' />
        <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
          Searching...
        </Typography>
      </Box>
    )
  }

  // ── No Query State ───────────────────────────────────────────────────────────
  if (!query) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Icon icon='tabler:search' color={theme.palette.text.disabled} fontSize='2rem' />
        <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
          Start typing to search HRMS
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
          Employees, Leave, Attendance, and more...
        </Typography>
      </Box>
    )
  }

  // ── No Results State ─────────────────────────────────────────────────────────
  if (totalResults === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Icon icon='tabler:search-off' color={theme.palette.text.disabled} fontSize='2rem' />
        <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
          No results found for "{query}"
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
          Try searching for employee name, ID, department, or leave type
        </Typography>
      </Box>
    )
  }

  // ── Results List ─────────────────────────────────────────────────────────────
  let currentIndex = 0
  
  return (
    <Box>
      {/* ── Results Counter ───────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, py: 2, backgroundColor: theme.palette.background.default }}>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} in {Object.keys(results).length} categor{Object.keys(results).length !== 1 ? 'ies' : 'y'}
        </Typography>
      </Box>
      
      {/* ─── Module Groups ─────────────────────────────────────────────────────── */}
      {Object.keys(results).map(moduleKey => {
        const items = results[moduleKey]
        const startIndex = currentIndex
        currentIndex += items.length
        
        return (
          <ResultGroup
            key={moduleKey}
            moduleKey={moduleKey}
            items={items}
            onItemClick={onItemClick}
            selectedIndex={selectedIndex}
            startIndex={startIndex}
            highlightText={highlightText}
          />
        )
      })}
    </Box>
  )
}

export default SearchResults
