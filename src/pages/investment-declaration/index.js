// src/pages/investment-declaration/index.js
// DEPRECATED: Redirect to new payroll route
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function InvestmentDeclarationPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to new functional page
    router.replace('/payroll/investment-declarations')
  }, [router])
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  )
}
