// src/@core/layouts/components/shared-components/GlobalSearch/GlobalSearchIcon.js
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Icon from 'src/@core/components/icon'
import { openSearch } from 'src/store/search/searchSlice'

// ─── Global Search Icon Button ────────────────────────────────────────────────
const GlobalSearchIcon = () => {
  const dispatch = useDispatch()

  // ── Keyboard Shortcut: ⌘K / Ctrl+K ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        dispatch(openSearch())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  // ── Handler: Open Search ───────────────────────────────────────────────────
  const handleClickOpen = () => {
    dispatch(openSearch())
  }

  return (
    <Tooltip title='Search (⌘K)' placement='bottom'>
      <IconButton
        color='inherit'
        onClick={handleClickOpen}
        sx={{ mr: 1.5 }}
        aria-label='Open search'
      >
        <Icon icon='tabler:search' fontSize='1.5rem' />
      </IconButton>
    </Tooltip>
  )
}

export default GlobalSearchIcon
