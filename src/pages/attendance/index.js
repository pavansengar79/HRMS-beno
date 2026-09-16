import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

import { selectLevel } from 'src/store/auth/authSlice'
import MyAttendance from 'src/pages/attendance/my'
import TeamAttendance from 'src/pages/attendance/team'

export default function AttendanceIndex() {
  const router = useRouter()
  const level = useSelector(selectLevel)
  const canViewMyAttendance = level === 'unit'
  const requestedTab = router.query?.tab
  const showMyAttendance = canViewMyAttendance && requestedTab !== 'team'

  return showMyAttendance ? <MyAttendance /> : <TeamAttendance />
}
