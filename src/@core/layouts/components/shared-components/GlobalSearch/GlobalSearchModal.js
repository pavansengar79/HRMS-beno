// src/@core/layouts/components/shared-components/GlobalSearch/GlobalSearchModal.js
import { useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useTheme } from '@mui/material/styles'
import { globalSearch, setQuery, closeSearch, setSelectedIndex } from 'src/store/search/searchSlice'
import SearchResults from './SearchResults'
import { SEARCH_LIMITS } from './searchConfig'
import debounce from 'lodash/debounce'

// ─── Highlight Search Text Utility ──────────────────────────────────────────
const highlightText = (text, query, theme) => {
  if (!query || !text) return text
  
  try {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.toString().split(regex)
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <mark
            key={index}
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              padding: '0 2px',
              borderRadius: '2px'
            }}
          >
            {part}
          </mark>
        )
      }
      return part
    })
  } catch {
    return text
  }
}

// ─── Global Search Modal ────────────────────────────────────────────────────
const GlobalSearchModal = () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const router = useRouter()
  const inputRef = useRef(null)
  
  const { isOpen, query, results, selectedIndex, loading } = useSelector(state => state.search)
  
  // ─── Debounced Search ──────────────────────────────────────────────────────
  const debouncedSearch = useMemo(
    () => debounce((searchQuery) => {
      if (searchQuery.length >= SEARCH_LIMITS.MIN_QUERY_LENGTH) {
        dispatch(globalSearch(searchQuery))
      }
    }, SEARCH_LIMITS.DEBOUNCE_DELAY),
    [dispatch]
  )
  
  // ─── Input Change Handler ───────────────────────────────────────────────────
  const handleInputChange = (event) => {
    const value = event.target.value
    dispatch(setQuery(value))
    debouncedSearch(value)
  }
  
  // ─── Handle Result Click ────────────────────────────────────────────────────
  const handleResultClick = (item) => {
    // Backend already provides the complete route, use it directly
    if (item.route) {
      router.push(item.route)
      dispatch(closeSearch())
      return
    }
    
    // Fallback: construct route if backend doesn't provide one
    const moduleKey = item.moduleKey
    const moduleConfig = {
      employees: `/users/${item._id}/details/account`,
      leave: `/leaves/${item._id}`,
      departments: `/department/${item._id}`,
      designations: `/designation/${item._id}`,
      holidays: `/holidays/${item._id}`,
      auditLogs: `/audit-logs/${item._id}`,
      notifications: `/notifications/${item._id}`,
      attendance: `/attendance/${item._id}`
    }
    
    const route = moduleConfig[moduleKey] || `/${moduleKey}/${item._id}`
    
    router.push(route)
    dispatch(closeSearch())
  }
  
  // ─── Flatten Results for Navigation ──────────────────────────────────────────
  const getFlatResults = useCallback(() => {
    let flat = []
    Object.keys(results).forEach(moduleKey => {
      results[moduleKey].forEach(item => {
        flat.push({ ...item, moduleKey })
      })
    })
    return flat
  }, [results])
  
  // ─── Keyboard Navigation ────────────────────────────────────────────────────
  const handleKeyDown = useCallback((event) => {
    const flatResults = getFlatResults()
    const totalResults = flatResults.length
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (totalResults > 0) {
          const newIndex = (selectedIndex + 1) % totalResults
          dispatch(setSelectedIndex(newIndex))
        }
        break
        
      case 'ArrowUp':
        event.preventDefault()
        if (totalResults > 0) {
          const newIndex = (selectedIndex - 1 + totalResults) % totalResults
          dispatch(setSelectedIndex(newIndex))
        }
        break
        
      case 'Enter':
        event.preventDefault()
        if (flatResults[selectedIndex]) {
          handleResultClick(flatResults[selectedIndex])
        }
        break
        
      case 'Escape':
        event.preventDefault()
        dispatch(closeSearch())
        break
        
      default:
        // Let other keys pass through to input
        break
    }
  }, [selectedIndex, getFlatResults, dispatch, handleResultClick])
  
  // ─── Auto-Focus Input on Open ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 100)
    }
  }, [isOpen])
  
  // ─── Keyboard Event Listener ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, selectedIndex, results])
  
  // ─── Close Handler ──────────────────────────────────────────────────────────
  const handleClose = () => {
    dispatch(closeSearch())
  }
  
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      sx={{
        '& .MuiDialog-paper': {
          mt: 6,
          maxHeight: '80vh',
          height: 'auto',
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      {/* ─── Search Input ─────────────────────────────────────────────────────── */}
      <Box sx={{ px: 4, pt: 4, pb: 2, backgroundColor: theme.palette.background.paper }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={handleInputChange}
          placeholder='Search HRMS...'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon
                  icon='tabler:search'
                  color={loading ? theme.palette.warning.main : theme.palette.text.disabled}
                  fontSize='1.5rem'
                  style={{
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Typography variant='caption' sx={{ color: 'text.disabled', mr: 1 }}>
                  ESC to close
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    backgroundColor: theme.palette.grey[200],
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem'
                  }}
                >
                  ⌘K
                </Box>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.background.default
            },
            '& .MuiInputBase-input': {
              py: 1.5,
              fontSize: '1rem'
            }
          }}
        />
      </Box>
      
      {/* ─── Results Container ─────────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
        <SearchResults onItemClick={handleResultClick} highlightText={(text) => highlightText(text, query, theme)} />
      </DialogContent>
      
      {/* ─── Footer Hint ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 4,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
          ↑↓ to navigate • Enter to select • ESC to close
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
          Search powered by MongoDB
        </Typography>
      </Box>
    </Dialog>
  )
}

export default GlobalSearchModal
