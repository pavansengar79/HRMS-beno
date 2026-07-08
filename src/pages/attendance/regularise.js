// src/pages/attendance/regularise.js
// Legacy route redirect - /attendance/regularise now redirects to /attendance/my (with regularization dialog)
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AttendanceRegularise() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to my attendance - user can click "Regularize" button there
    router.replace('/attendance/my')
  }, [router])
  
  return null
}
