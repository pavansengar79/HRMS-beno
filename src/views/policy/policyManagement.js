// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Redux
import { useSelector } from 'react-redux'
import { selectPermissions } from 'src/store/auth/authSlice'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiTabList from '@mui/lab/TabList'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Tab Content Imports — each is a fully self-contained policy section

import TabCompanyConfig from './TabCompanyConfig'
import TabLeavePolicy from './TabLeavePolicy'
import TabAttendancePolicy from './TabAttendancePolicy'
import TabHolidayCalendar from './TabHolidayCalendar'
import PayrollManagement from './PayrollManagement' // Enterprise Payroll with all features
import TabRegularisationPolicy from './TabRegularisationPolicy'

// ─── Styled TabList — mirrors leaves page pattern exactly ─────────────────────

const TabList = styled(MuiTabList)(({ theme }) => ({
    border: '0 !important',
    '&, & .MuiTabs-scroller': {
        boxSizing: 'content-box',
        padding: theme.spacing(1.25, 1.25, 2),
        margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
    },
    '& .MuiTabs-indicator': { display: 'none' },
    '& .Mui-selected': {
        boxShadow: theme.shadows[2],
        backgroundColor: theme.palette.primary.main,
        color: `${theme.palette.common.white} !important`
    },
    '& .MuiTab-root': {
        minWidth: 65,
        minHeight: 38,
        lineHeight: 1,
        borderRadius: theme.shape.borderRadius,
        [theme.breakpoints.up('md')]: { minWidth: 130 },
        '&:hover': { color: theme.palette.primary.main }
    }
}))

// ─── Tab config with permission requirements ─────────────────────────────────

const TABS = [
    { value: 'company', label: 'Company Config', icon: 'tabler:building', permission: 'attendancePolicy.read' },
    { value: 'leave', label: 'Leave Policy', icon: 'tabler:calendar-off', permission: 'leavePolicy.read' },
    { value: 'attendance', label: 'Attendance', icon: 'tabler:clock', permission: 'attendancePolicy.read' },
    { value: 'holiday', label: 'Holiday Calendar', icon: 'tabler:calendar-event', permission: 'holiday.read' },
    { value: 'payroll', label: 'Payroll', icon: 'tabler:cash', permission: 'payrollPolicy.read' },
    { value: 'regularisation', label: 'Regularisation', icon: 'tabler:refresh', permission: 'attendancePolicy.read' }, // HR only
]

// ─── PolicyManagement ─────────────────────────────────────────────────────────

const PolicyManagement = ({ tab }) => {
    const [activeTab, setActiveTab] = useState(tab)
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const hideText = useMediaQuery(theme => theme.breakpoints.down('md'))
    const permissions = useSelector(selectPermissions)

    // Filter tabs based on permissions
    const visibleTabs = TABS.filter(t => permissions.includes(t.permission))

    useEffect(() => {
        if (tab && tab !== activeTab) setActiveTab(tab)
        // If current tab is not visible, redirect to first visible tab
        if (visibleTabs.length > 0 && !visibleTabs.find(t => t.value === tab)) {
            router.replace(`/policy/${visibleTabs[0].value}`)
        }
    }, [tab, visibleTabs, router, activeTab])

    const handleChange = (event, value) => {
        setIsLoading(true)
        router.push(`/policy/${value}`).then(() => setIsLoading(false))
    }

    // If no tabs visible, show access denied
    if (visibleTabs.length === 0) {
        return (
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <Icon icon='tabler:lock' fontSize='4rem' />
                        <Typography sx={{ mt: 2 }} variant='h6'>Access Denied</Typography>
                        <Typography color='text.secondary'>You don't have permission to view policy settings</Typography>
                    </Box>
                </Grid>
            </Grid>
        )
    }

    // Each tab is self-contained — owns its own fetch, form, and save
    const tabContentList = {
        company: <TabCompanyConfig />,
        leave: <TabLeavePolicy />,
        attendance: <TabAttendancePolicy />,
        holiday: <TabHolidayCalendar />,
        payroll: <PayrollManagement />, // Enterprise payroll with tabs for policies, run, investments
        regularisation: <TabRegularisationPolicy />,
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TabContext value={activeTab}>
                    <Grid container spacing={6}>
                        <Grid item xs={12}>
                            <TabList
                                variant='scrollable'
                                scrollButtons='auto'
                                onChange={handleChange}
                                aria-label='policy management tabs'
                            >
                                {visibleTabs.map(t => (
                                    <Tab
                                        key={t.value}
                                        value={t.value}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                                                <Icon fontSize='1.25rem' icon={t.icon} />
                                                {!hideText && t.label}
                                            </Box>
                                        }
                                    />
                                ))}
                            </TabList>
                        </Grid>

                        <Grid item xs={12}>
                            {isLoading ? (
                                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    <CircularProgress sx={{ mb: 4 }} />
                                    <Typography>Loading...</Typography>
                                </Box>
                            ) : (
                                <TabPanel sx={{ p: 0 }} value={activeTab}>
                                    {tabContentList[activeTab]}
                                </TabPanel>
                            )}
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </Grid>
    )
}

export default PolicyManagement