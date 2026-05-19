'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';

import { styled } from '@mui/material/styles';

import axiosRequest from 'src/utils/AxiosInterceptor';
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts';

// ✅ IMPORTANT
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false
});

const SCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  height: '100%'
}));

const StatBox = styled(Box)(({ bg }) => ({
  background: bg || '#fff',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  padding: '16px 18px',
  height: '100%'
}));

const StatusBadge = ({ status }) => {
  const map = {
    PENDING: {
      bg: '#fffbeb',
      color: '#d97706',
      label: '⏳ Pending'
    },
    APPROVED: {
      bg: '#f0fdf4',
      color: '#16a34a',
      label: '✓ Approved'
    },
    REJECTED: {
      bg: '#fef2f2',
      color: '#dc2626',
      label: '✗ Rejected'
    }
  };

  const s = map[status] || map.PENDING;

  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.25,
        py: 0.3,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 700,
        bgcolor: s.bg,
        color: s.color
      }}
    >
      {s.label}
    </Box>
  );
};

const fmt = iso =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '—';

export default function EmployeeDashboard() {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosRequest
      .get('api/v1/dashboard/employee')
      .then(res => setRaw(res.data))
      .catch(err =>
        setError(err?.response?.data?.message || 'Failed to load')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity='error' sx={{ m: 3 }}>
        {error}
      </Alert>
    );

  const {
    employee,
    today,
    attendance,
    leaveBalances,
    recentLeaves
  } = raw;

  const {
    present,
    absent,
    late,
    halfDay,
    onLeave,
    wfh,
    totalWorkingHours,
    totalOvertimeHours,
    totalLateMinutes
  } = attendance;

  const totalDays =
    present + absent + late + onLeave + wfh || 1;

  const donutOptions = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false
      }
    },

    labels: ['Present', 'Late', 'Absent', 'On Leave', 'WFH'],

    colors: [
      '#0d9488',
      '#f59e0b',
      '#ef4444',
      '#6366f1',
      '#8b5cf6'
    ],

    legend: {
      show: false
    },

    dataLabels: {
      enabled: false
    },

    stroke: {
      width: 0
    },

    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Days',
              formatter: () => totalDays
            }
          }
        }
      }
    }
  };

  const donutSeries = [
    present,
    late,
    absent,
    onLeave,
    wfh
  ];

  return (
    <ApexChartWrapper>
      <Box
        sx={{
          bgcolor: '#f8fafc',
          minHeight: '100vh',
          p: 3
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Box>
            <Typography variant='h5' fontWeight={800}>
              Welcome, {employee?.name}
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              {employee?.department} • {employee?.employeeId}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant='outlined'>
              Apply Leave
            </Button>

            <Button variant='contained'>
              Download Payslip
            </Button>
          </Box>
        </Box>

        {/* Top Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <StatBox bg='#f0fdfa'>
              <Typography variant='caption'>
                Present Days
              </Typography>

              <Typography variant='h4' fontWeight={800}>
                {present}
              </Typography>
            </StatBox>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatBox bg='#eff6ff'>
              <Typography variant='caption'>
                Working Hours
              </Typography>

              <Typography variant='h4' fontWeight={800}>
                {totalWorkingHours}h
              </Typography>
            </StatBox>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatBox bg='#fffbeb'>
              <Typography variant='caption'>
                Late Minutes
              </Typography>

              <Typography variant='h4' fontWeight={800}>
                {totalLateMinutes}m
              </Typography>
            </StatBox>
          </Grid>

          <Grid item xs={12} md={3}>
            <StatBox bg='#fef2f2'>
              <Typography variant='caption'>
                Pending Leaves
              </Typography>

              <Typography variant='h4' fontWeight={800}>
                {
                  recentLeaves.filter(
                    l => l.status === 'PENDING'
                  ).length
                }
              </Typography>
            </StatBox>
          </Grid>
        </Grid>

        {/* Charts + Leave */}
        <Grid container spacing={2}>
          {/* Attendance Chart */}
          <Grid item xs={12} md={5}>
            <SCard>
              <CardHeader title='Attendance Overview' />

              <CardContent>
                <Chart
                  options={donutOptions}
                  series={donutSeries}
                  type='donut'
                  height={320}
                />
              </CardContent>
            </SCard>
          </Grid>

          {/* Leave Balances */}
          <Grid item xs={12} md={7}>
            <SCard>
              <CardHeader title='Leave Balances' />

              <CardContent>
                <Grid container spacing={2}>
                  {leaveBalances.map(lb => {
                    const pct = lb.totalAllocated
                      ? Math.round(
                          (lb.remaining /
                            lb.totalAllocated) *
                            100
                        )
                      : 0;

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        key={lb.code}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border:
                              '1px solid #e2e8f0'
                          }}
                        >
                          <Typography
                            fontWeight={700}
                            mb={1}
                          >
                            {lb.leaveType}
                          </Typography>

                          <Typography
                            variant='h4'
                            fontWeight={800}
                          >
                            {lb.remaining}
                          </Typography>

                          <LinearProgress
                            variant='determinate'
                            value={pct}
                            sx={{
                              my: 1.5,
                              height: 8,
                              borderRadius: 10
                            }}
                          />

                          <Typography
                            variant='caption'
                            color='text.secondary'
                          >
                            {lb.remaining} of{' '}
                            {lb.totalAllocated}{' '}
                            remaining
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>

        {/* Recent Leaves */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <SCard>
              <CardHeader title='Recent Leave Requests' />

              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Dates</TableCell>
                        <TableCell>Days</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {recentLeaves.map(lv => (
                        <TableRow key={lv.id}>
                          <TableCell>
                            {lv.leaveType?.name}
                          </TableCell>

                          <TableCell>
                            {fmt(lv.startDate)} -{' '}
                            {fmt(lv.endDate)}
                          </TableCell>

                          <TableCell>
                            {lv.totalDays}
                          </TableCell>

                          <TableCell>
                            <StatusBadge
                              status={lv.status}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </SCard>
          </Grid>
        </Grid>
      </Box>
    </ApexChartWrapper>
  );
}