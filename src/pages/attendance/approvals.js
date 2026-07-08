// src/pages/attendance/approvals.js
// Legacy route redirect - /attendance/approvals now redirects to /leaves (leave approvals)
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AttendanceApprovals() {
  const router = useRouter()
  
  useEffect(() => {
    // Attendance approvals are now handled in the leave approvals section
    router.replace('/leaves')
  }, [router])
  
  return null
}
