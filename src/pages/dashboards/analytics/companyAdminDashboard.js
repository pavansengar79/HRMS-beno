'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Avatar,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, LinearProgress,
  useTheme, alpha, Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axiosRequest from 'src/utils/AxiosInterceptor';
import InviteDrawer from 'src/views/apps/user/list/inviteDrawer';

// ── Icons ────────────────────────────────────────────────────────────────────
import PeopleAltOutlinedIcon    from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon     from '@mui/icons-material/BusinessOutlined';
import MailOutlineIcon          from '@mui/icons-material/MailOutline';
import CreditCardOutlinedIcon   from '@mui/icons-material/CreditCardOutlined';
import CheckCircleIcon          from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ArrowForwardIcon         from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon          from '@mui/icons-material/WorkOutline';
import AccessTimeOutlinedIcon   from '@mui/icons-material/AccessTimeOutlined';
import TrendingUpIcon           from '@mui/icons-material/TrendingUp';

// ── Styled base card ─────────────────────────────────────────────────────────
const SCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 16px rgba(0,0,0,0.3)'
    : '0 1px 6px rgba(15,23,42,0.06)',
  background: theme.palette.background.paper,
}));

// ── Status badge (employee status: ACTIVE / INACTIVE / etc.) ─────────────────
const StatusBadge = ({ status }) => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const s = String(status || '').toLowerCase();
  const cfg =
    s === 'active'
      ? { bg: isDark ? 'rgba(74,222,128,0.12)'  : '#f0fdf4', color: isDark ? '#4ade80' : '#16a34a' }
    : s.includes('pending') || s.includes('invite')
      ? { bg: isDark ? 'rgba(251,191,36,0.15)'  : '#fffbeb', color: isDark ? '#fbbf24' : '#d97706', prefix: '⏳ ' }
    : s === 'inactive' || s.includes('terminat')
      ? { bg: isDark ? 'rgba(248,113,113,0.15)' : '#fef2f2', color: isDark ? '#f87171' : '#dc2626' }
      : { bg: isDark ? 'rgba(148,163,184,0.1)'  : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: 11, fontWeight: 700, bgcolor: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.prefix || ''}{status || '—'}
    </Box>
  );
};

// ── Setup step circle ────────────────────────────────────────────────────────
const SetupStep = ({ label, stepNum, done, current }) => {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
      <Box sx={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: done    ? primary
               : current ? alpha(primary, 0.12)
               : isDark  ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        border: done    ? 'none'
              : current ? `2px solid ${primary}`
              : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        fontWeight: 800, fontSize: 14,
        color: done ? '#fff' : current ? primary : isDark ? '#475569' : '#94a3b8',
      }}>
        {done ? <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} /> : stepNum}
      </Box>
      <Typography sx={{
        fontSize: 11,
        fontWeight: done || current ? 700 : 500,
        color: done || current ? theme.palette.text.primary : theme.palette.text.secondary,
        textAlign: 'center', lineHeight: 1.3,
      }}>
        {label}
      </Typography>
    </Box>
  );
};

// ── Config status row ────────────────────────────────────────────────────────
const ConfigRow = ({ label, sub, done, actionLabel }) => {
  const theme   = useTheme();
  const primary = theme.palette.primary.main;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2,
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:last-child': { borderBottom: 'none' },
    }}>
      {done
        ? <CheckCircleIcon          sx={{ color: primary,                      fontSize: 20, flexShrink: 0 }} />
        : <RadioButtonUncheckedIcon sx={{ color: theme.palette.text.disabled,  fontSize: 20, flexShrink: 0 }} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.palette.text.primary }}>{label}</Typography>
        <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary }}>{sub}</Typography>
      </Box>
      {!done && actionLabel && (
        <Button size="small" endIcon={<ArrowForwardIcon fontSize="small" />}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, color: primary, p: 0, minWidth: 0, flexShrink: 0 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

// ── Activity dot ─────────────────────────────────────────────────────────────
const Dot = ({ color }) => (
  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0, mt: '5px' }} />
);

// ── Utility: format date ──────────────────────────────────────────────────────
const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Utility: capitalize ───────────────────────────────────────────────────────
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CompanyAdminDashboard() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const pDark   = theme.palette.primary.dark;
  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const bg      = theme.palette.background.default;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);


  // fetch dashboard data (exposed so child actions can refresh)
  const loadData = async () => {
    try {
      setLoading(true);
      // Response shape: { success, message, data: { setup, employees, departments, pendingInvites, recentUsers, recentActivity } }
      const res = await axiosRequest.get('api/v1/dashboard/company');
      // axiosRequest interceptor may unwrap to res.data or res directly
      setData(res?.data || res || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bg }}>
      <CircularProgress sx={{ color: primary }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100vh', p: 4, bgcolor: bg }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  // ── Map API response fields ────────────────────────────────────────────────
  // API: data.setup
  const setup           = data?.setup           || {};
  const setupSteps      = setup.steps           || [];
  const setupComplete   = setup.completedSteps  ?? setupSteps.filter(s => s.done).length;
  const setupTotal      = setup.totalSteps      ?? setupSteps.length;
  const setupPct        = setup.percentage      ?? (setupTotal ? Math.round((setupComplete / setupTotal) * 100) : 0);

  // API: data.employees
  const emp             = data?.employees       || {};
  const activeEmployees = emp.active            ?? 0;
  const totalEmployees  = emp.total             ?? 0;
  const newThisMonth    = emp.newThisMonth      ?? 0;
  const byType          = emp.byType            || {};

  // API: data.departments
  const depts           = data?.departments     || {};
  const deptTotal       = depts.total           ?? 0;
  const deptList        = depts.list            || [];
  const activeDepts     = deptList.filter(d => d.status === 'active').length;

  // API: data.pendingInvites
  const pendingInvites  = data?.pendingInvites  ?? 0;

  // API: data.recentUsers  (used as Users & Roles table)
  const recentUsers     = data?.recentUsers     || [];

  // API: data.recentActivity
  const recentActivity  = data?.recentActivity  || [];

  // ── Derived: Config Status from setup steps ────────────────────────────────
  // Map step keys → human labels + subtexts
  const stepMeta = {
    companyProfile: {
      label: 'Company Profile',
      doneSub:    'Logo, address, timezone set',
      pendingSub: 'Not yet configured',
      action:     'Set up',
    },
    departments: {
      label: 'Departments',
      doneSub:    `${deptTotal} department${deptTotal !== 1 ? 's' : ''} created`,
      pendingSub: 'No departments added yet',
      action:     'Set up',
    },
    inviteUsers: {
      label: 'User Management',
      doneSub:    `${totalEmployees} users · ${pendingInvites} pending`,
      pendingSub: 'No users invited yet',
      action:     'Invite',
    },
    leaveTypes: {
      label: 'Leave Types',
      doneSub:    'Leave types configured',
      pendingSub: 'Not yet configured',
      action:     'Set up',
    },
    payroll: {
      label: 'Payroll Structure',
      doneSub:    'Payroll configured',
      pendingSub: 'Required before payroll',
      action:     'Set up',
    },
  };

  const configItems = setupSteps.length > 0
    ? setupSteps.map(step => {
        const meta = stepMeta[step.key] || { label: cap(step.key), doneSub: 'Completed', pendingSub: 'Pending', action: 'Set up' };
        return {
          label:  meta.label,
          sub:    step.done ? meta.doneSub : meta.pendingSub,
          done:   step.done,
          action: step.done ? null : meta.action,
        };
      })
    : [
        { label: 'Company Profile',   sub: 'Not yet configured', done: false, action: 'Set up' },
        { label: 'Departments',       sub: 'No departments added', done: false, action: 'Set up' },
        { label: 'User Management',   sub: 'No users yet',        done: false, action: 'Invite' },
        { label: 'Leave Types',       sub: 'Not yet configured',  done: false, action: 'Set up' },
        { label: 'Payroll Structure', sub: 'Required before payroll', done: false, action: 'Set up' },
      ];

  // ── Seats (no subscription field in API — show employees vs a reasonable cap) ──
  // The API has no subscription/seats data; display active vs total employees
  const planSeats  = activeEmployees;
  const planTotal  = totalEmployees || activeEmployees || 1;
  const seatsPct   = planTotal ? Math.round((planSeats / planTotal) * 100) : 0;

  // ── Find first incomplete step for "current" highlight ────────────────────
  const firstIncompleteIdx = setupSteps.findIndex(s => !s.done);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', px: 3, py: 3 }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: textPri, letterSpacing: '-0.3px' }}>
            Company Dashboard
          </Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, fontSize: 12, borderColor: divider, color: textSec, '&:hover': { borderColor: primary, color: primary } }}>
            Export
          </Button>
          <Button variant="contained" size="small" startIcon={<PersonAddAltOutlinedIcon fontSize="small" />}
            onClick={() => setInviteOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: 12, bgcolor: primary, '&:hover': { bgcolor: pDark } }}>
            + Invite User
          </Button>
        </Box>
      </Box>

      {/* ── Setup Progress ───────────────────────────────────────────────────── */}
      <SCard sx={{ mb: 2.5, border: `1.5px solid ${primary}` }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: textPri }}>
              ⚡ Setup Progress — {setupComplete} of {setupTotal} steps complete
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: primary }}>{setupPct}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={setupPct}
            sx={{
              height: 7, borderRadius: 10, mb: 2.5,
              bgcolor: alpha(primary, isDark ? 0.15 : 0.12),
              '& .MuiLinearProgress-bar': { bgcolor: primary, borderRadius: 10 },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            {setupSteps.map((step, i) => (
              <SetupStep
                key={step.key || i}
                label={stepMeta[step.key]?.label || cap(step.key) || step.label}
                stepNum={i + 1}
                done={step.done}
                current={!step.done && i === firstIncompleteIdx}
              />
            ))}
          </Box>
        </CardContent>
      </SCard>

      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Active Employees */}
        <Grid item xs={6} md={3}>
          <SCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: 22, color: primary }} />
              <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: alpha(primary, isDark ? 0.18 : 0.1), color: primary, fontSize: 11, fontWeight: 700 }}>
                +{newThisMonth} new
              </Box>
            </Box>
            <Typography sx={{ fontSize: 34, fontWeight: 800, color: textPri, lineHeight: 1 }}>
              {activeEmployees}
            </Typography>
            <Typography sx={{ fontSize: 12, color: textSec, mt: 0.5 }}>Active Employees</Typography>
          </SCard>
        </Grid>

        {/* Departments */}
        <Grid item xs={6} md={3}>
          <SCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
              <BusinessOutlinedIcon sx={{ fontSize: 22, color: primary }} />
              <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(96,165,250,0.15)' : '#eff6ff', color: isDark ? '#60a5fa' : '#2563eb', fontSize: 11, fontWeight: 700 }}>
                {activeDepts} active
              </Box>
            </Box>
            <Typography sx={{ fontSize: 34, fontWeight: 800, color: textPri, lineHeight: 1 }}>
              {deptTotal}
            </Typography>
            <Typography sx={{ fontSize: 12, color: textSec, mt: 0.5 }}>Departments</Typography>
          </SCard>
        </Grid>

        {/* Pending Invites */}
        <Grid item xs={6} md={3}>
          <SCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
              <MailOutlineIcon sx={{ fontSize: 22, color: pendingInvites > 0 ? '#f59e0b' : textSec }} />
              {pendingInvites > 0
                ? <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(251,191,36,0.15)' : '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 700 }}>
                    ⚠ {pendingInvites} pending
                  </Box>
                : <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4', color: isDark ? '#4ade80' : '#16a34a', fontSize: 11, fontWeight: 700 }}>
                    All sent
                  </Box>
              }
            </Box>
            <Typography sx={{ fontSize: 34, fontWeight: 800, color: textPri, lineHeight: 1 }}>
              {pendingInvites}
            </Typography>
            <Typography sx={{ fontSize: 12, color: textSec, mt: 0.5 }}>Pending Invites</Typography>
          </SCard>
        </Grid>

        {/* Employee Breakdown (byType) */}
        <Grid item xs={6} md={3}>
          <SCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.2 }}>
              <WorkOutlineIcon sx={{ fontSize: 22, color: primary }} />
              <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: alpha(primary, isDark ? 0.18 : 0.1), color: primary, fontSize: 11, fontWeight: 700 }}>
                {totalEmployees} total
              </Box>
            </Box>
            <Typography sx={{ fontSize: 34, fontWeight: 800, color: textPri, lineHeight: 1 }}>
              {byType.fullTime ?? 0}
            </Typography>
            <Typography sx={{ fontSize: 12, color: textSec, mt: 0.5 }}>Full-Time Employees</Typography>
            {/* Mini breakdown */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'Part-time', val: byType.partTime  ?? 0 },
                { label: 'Contract',  val: byType.contract  ?? 0 },
                { label: 'Intern',    val: byType.intern    ?? 0 },
              ].map((t, i) => (
                <Typography key={i} sx={{ fontSize: 10, color: textSec, fontWeight: 600 }}>
                  {t.label}: <Box component="span" sx={{ color: textPri, fontWeight: 800 }}>{t.val}</Box>
                </Typography>
              ))}
            </Box>
          </SCard>
        </Grid>
      </Grid>

      {/* ── Employee Seats / Active vs Total ─────────────────────────────────── */}
      <SCard sx={{ mb: 2.5, px: 2.5, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: textPri }}>Employee Seats Used</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: textSec }}>
              {activeEmployees} active of {totalEmployees} total
            </Typography>
            {emp.inactive > 0 && (
              <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(248,113,113,0.12)' : '#fef2f2', color: isDark ? '#f87171' : '#dc2626', fontSize: 11, fontWeight: 700 }}>
                {emp.inactive} inactive
              </Box>
            )}
            {emp.onNotice > 0 && (
              <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: isDark ? 'rgba(251,191,36,0.15)' : '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 700 }}>
                {emp.onNotice} on notice
              </Box>
            )}
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={totalEmployees ? Math.round((activeEmployees / totalEmployees) * 100) : 100}
          sx={{
            height: 8, borderRadius: 10,
            bgcolor: alpha(primary, isDark ? 0.15 : 0.1),
            '& .MuiLinearProgress-bar': { bgcolor: primary, borderRadius: 10 },
          }}
        />
      </SCard>

      {/* ── Department List ──────────────────────────────────────────────────── */}
      {deptList.length > 0 && (
        <SCard sx={{ mb: 2.5, px: 2.5, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: textPri }}>Departments</Typography>
            <Typography sx={{ fontSize: 12, color: textSec }}>{deptTotal} total</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {deptList.map(dept => (
              <Box key={dept.id} sx={{
                px: 2, py: 1, borderRadius: 2,
                border: `1px solid ${divider}`,
                bgcolor: isDark ? alpha(primary, 0.06) : alpha(primary, 0.04),
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25,
                minWidth: 120,
              }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPri }}>{dept.name}</Typography>
                <Typography sx={{ fontSize: 11, color: textSec }}>{dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}</Typography>
                <Box sx={{ mt: 0.25, px: 0.8, py: 0.2, borderRadius: 1, bgcolor: dept.status === 'active' ? (isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4') : alpha(primary, 0.1), color: dept.status === 'active' ? (isDark ? '#4ade80' : '#16a34a') : primary, fontSize: 10, fontWeight: 700 }}>
                  {cap(dept.status)}
                </Box>
              </Box>
            ))}
          </Box>
        </SCard>
      )}

      {/* ── Recent Users & Config Status / Subscription ───────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>

        {/* Recent Users (from data.recentUsers) */}
        <Grid item xs={12} md={8}>
          <SCard sx={{ height: '100%' }}>
            <Box sx={{ px: 2.5, py: 1.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: textPri }}>Recent Users</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon fontSize="small" />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, color: primary, p: 0 }}>
                Manage
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(primary, isDark ? 0.05 : 0.03) }}>
                    {['USER', 'EMP ID', 'DEPARTMENT', 'JOINING DATE', 'STATUS'].map(h => (
                      <TableCell key={h} sx={{ fontSize: 10, fontWeight: 700, color: textSec, letterSpacing: '0.5px', borderBottom: `1px solid ${divider}`, py: 1, px: 2 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.length > 0 ? recentUsers.map((u, i) => (
                    <TableRow key={u.id || i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.04) } }}>
                      <TableCell sx={{ py: 1.4, px: 2, borderBottom: `1px solid ${divider}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(primary, 0.15), color: primary, fontSize: 12, fontWeight: 800 }}>
                            {(u.name || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: textPri }}>{u.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: textSec }}>{u.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${divider}`, px: 2 }}>
                        <Typography sx={{ fontSize: 12, color: textSec, fontFamily: 'monospace', fontWeight: 600 }}>
                          {u.employeeId || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${divider}`, px: 2, fontSize: 13, color: textSec }}>
                        {u.department || '—'}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${divider}`, px: 2, fontSize: 12, color: textSec }}>
                        {fmtDate(u.joiningDate)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${divider}`, px: 2 }}>
                        <StatusBadge status={u.status} />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: textSec, fontSize: 13, borderBottom: 'none' }}>
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SCard>
        </Grid>

        {/* Right column: Config Status */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>

            {/* Configuration Status */}
            <SCard sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: textPri }}>Configuration Status</Typography>
                <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: alpha(primary, isDark ? 0.18 : 0.1), color: primary, fontSize: 11, fontWeight: 700 }}>
                  {setupComplete}/{setupTotal}
                </Box>
              </Box>
              {configItems.map((item, i) => (
                <ConfigRow
                  key={i}
                  label={item.label}
                  sub={item.sub}
                  done={item.done}
                  actionLabel={item.action}
                />
              ))}
            </SCard>

            {/* Employee Type Breakdown */}
            <SCard sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: textPri, mb: 1.5 }}>
                Employee Breakdown
              </Typography>
              {[
                { label: 'Full-Time', val: byType.fullTime  ?? 0, color: primary },
                { label: 'Part-Time', val: byType.partTime  ?? 0, color: '#f59e0b' },
                { label: 'Contract',  val: byType.contract  ?? 0, color: '#6366f1' },
                { label: 'Intern',    val: byType.intern    ?? 0, color: '#4ade80' },
              ].map((row, i) => {
                const pct = totalEmployees ? Math.round((row.val / totalEmployees) * 100) : 0;
                return (
                  <Box key={i} sx={{ mb: i < 3 ? 1.5 : 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color }} />
                        <Typography sx={{ fontSize: 12, color: textSec }}>{row.label}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: row.color }}>
                        {row.val} · {pct}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{
                        height: 5, borderRadius: 10,
                        bgcolor: alpha(row.color, isDark ? 0.12 : 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 10 },
                      }}
                    />
                  </Box>
                );
              })}
            </SCard>
          </Box>
        </Grid>
      </Grid>

      {/* ── Recent Activity ──────────────────────────────────────────────────── */}
      <SCard sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 14, color: textPri, mb: recentActivity.length > 0 ? 2 : 1 }}>
          Recent Activity
        </Typography>
        {recentActivity.length > 0 ? (
          <Grid container spacing={2}>
            {recentActivity.map((item, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                  <Dot color={item.color || primary} />
                  <Box>
                    <Typography sx={{ fontSize: 13, color: textPri, lineHeight: 1.4 }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {item.actor || item.text || item.user}
                      </Box>
                      {' '}{item.description || item.detail || item.message}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: textSec, mt: 0.25 }}>
                      {item.time || (item.createdAt ? fmtDate(item.createdAt) : '—')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            py: 3, color: textSec,
          }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 32, opacity: 0.3, mb: 1 }} />
            <Typography sx={{ fontSize: 13, color: textSec }}>No recent activity yet</Typography>
          </Box>
        )}
      </SCard>

      {/* Invite drawer for inviting users */}
      <InviteDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={() => { setInviteOpen(false); loadData(); }} />

    </Box>
  );
}