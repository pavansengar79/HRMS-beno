// src/pages/attendance/index.js
// Redirect to My Attendance by default
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AttendanceIndex() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/attendance/my')
  }, [router])
  
  return null
}
