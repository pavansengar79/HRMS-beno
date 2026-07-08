// src/pages/attendance/records.js
// Legacy route redirect - /attendance/records now redirects to /attendance/my
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AttendanceRecords() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/attendance/my')
  }, [router])
  
  return null
}
