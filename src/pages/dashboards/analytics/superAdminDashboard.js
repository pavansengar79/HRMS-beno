'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Card, CardHeader, CardContent, Typography, Grid, Avatar,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, LinearProgress,
  useTheme, alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import axiosRequest from 'src/utils/AxiosInterceptor';
import { selectAllCustomers } from 'src/store/customer/customerSlice';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ─── Styled helpers ─────────────────────────────────────────────────────────

const SCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 16px rgba(0,0,0,0.35)'
    : '0 1px 8px rgba(15,23,42,0.07)',
  height: '100%',
  background: theme.palette.background.paper,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 24px rgba(0,0,0,0.5)'
      : '0 4px 16px rgba(15,23,42,0.11)',
  },
}));

// ─── Badge components ────────────────────────────────────────────────────────

const PlanBadge = ({ plan }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const map = {
    Enterprise: { light: ['#fef3c7', '#92400e'], dark: ['rgba(245,158,11,0.18)', '#fbbf24'] },
    Growth:     { light: ['#eff6ff', '#1e40af'], dark: ['rgba(96,165,250,0.15)', '#60a5fa'] },
    Free:       { light: ['#f5f3ff', '#5b21b6'], dark: ['rgba(167,139,250,0.15)', '#a78bfa'] },
    Trial:      { light: ['#f0fdf4', '#166534'], dark: ['rgba(74,222,128,0.12)', '#4ade80'] },
  };
  const [bg, color] = (isDark ? map[plan]?.dark : map[plan]?.light) || (isDark ? ['rgba(148,163,184,0.12)', '#94a3b8'] : ['#f1f5f9', '#475569']);
  return (
    <Box sx={{ display: 'inline-flex', px: 1.2, py: 0.35, borderRadius: 1.5, fontSize: 11, fontWeight: 700, bgcolor: bg, color }}>
      {plan || '—'}
    </Box>
  );
};

const StatusBadge = ({ status }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!status) return null;
  const isActive  = ['active', 'Active'].includes(status);
  const isExpired = /expired|suspend/i.test(status);
  const cfg = isActive
    ? { bg: isDark ? 'rgba(74,222,128,0.12)' : '#f0fdf4',  color: isDark ? '#4ade80' : '#16a34a' }
    : isExpired
    ? { bg: isDark ? 'rgba(248,113,113,0.15)' : '#fef2f2', color: isDark ? '#f87171' : '#dc2626' }
    : { bg: isDark ? 'rgba(251,191,36,0.15)' : '#fffbeb',  color: isDark ? '#fbbf24' : '#d97706' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1.2, py: 0.35, borderRadius: 1.5, fontSize: 11, fontWeight: 700, bgcolor: cfg.bg, color: cfg.color }}>
      {isExpired ? '⚠ ' : ''}{status}
    </Box>
  );
};

const ActionBadge = ({ action }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const map = {
    'Plan Override': isDark ? ['rgba(96,165,250,0.15)', '#60a5fa']   : ['#eff6ff', '#2563eb'],
    Login:           isDark ? ['rgba(148,163,184,0.1)',  '#94a3b8']  : ['#f8fafc', '#64748b'],
    Suspend:         isDark ? ['rgba(248,113,113,0.15)', '#f87171']  : ['#fef2f2', '#dc2626'],
    Create:          isDark ? ['rgba(74,222,128,0.12)',  '#4ade80']  : ['#f0fdf4', '#16a34a'],
    Update:          isDark ? ['rgba(251,191,36,0.12)',  '#fbbf24']  : ['#fffbeb', '#d97706'],
    Delete:          isDark ? ['rgba(248,113,113,0.15)', '#f87171']  : ['#fef2f2', '#dc2626'],
  };
  const [bg, color] = map[action] || (isDark ? ['rgba(148,163,184,0.1)', '#94a3b8'] : ['#f8fafc', '#64748b']);
  return (
    <Box sx={{ display: 'inline-flex', px: 1.2, py: 0.3, borderRadius: 1.5, fontSize: 11, fontWeight: 700, bgcolor: bg, color }}>
      {action}
    </Box>
  );
};

const StatusDot = ({ status }) => {
  const color = status === 'healthy' ? '#4ade80' : status === 'warning' ? '#fbbf24' : '#f87171';
  return <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block', mr: 0.75, flexShrink: 0 }} />;
};

// ─── Section Header ──────────────────────────────────────────────────────────

const SectionHeader = ({ title, action }) => {
  const theme = useTheme();
  return (
    <Box sx={{ px: 2.5, pt: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Typography sx={{ fontWeight: 800, fontSize: 14, color: theme.palette.text.primary }}>{title}</Typography>
      {action}
    </Box>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const pDark   = theme.palette.primary.dark;
  const pLight  = theme.palette.primary.light;

  const textPri = theme.palette.text.primary;
  const textSec = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const surface = theme.palette.background.paper;
  const bg      = theme.palette.background.default;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosRequest.get('api/v1/dashboard/super-admin');
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  // ── Data aliases ────────────────────────────────────────────────────────────
  const metrics        = data?.metrics        || {};
  const tenantStats    = data?.tenants        || {};
  const revenueStats   = data?.revenue        || {};
  const recentTenants  = data?.recentTenants  || [];
  const auditLog       = data?.auditLog       || [];
  const flaggedTenants = data?.flaggedTenants || [];
  const infrastructure = data?.infrastructure || [];

  const freePlan       = metrics.freePlan       ?? tenantStats.byPlan?.free       ?? 0;
  const growthPlan     = metrics.growthPlan     ?? tenantStats.byPlan?.growth     ?? 0;
  const enterprisePlan = metrics.enterprisePlan ?? tenantStats.byPlan?.enterprise ?? 0;
const totalTenants =
  metrics?.totalTenants ||
  tenantStats?.total ||
  freePlan + growthPlan + enterprisePlan ||
  0;  const activeTenants  = metrics.activeTenants  ?? tenantStats.active             ?? 0;
  const churned        = metrics.churned        ?? tenantStats.suspended          ?? 0;
  const mrr            = typeof metrics.mrr === 'number'
    ? metrics.mrr
    : (typeof revenueStats.estimatedMRR === 'number' ? revenueStats.estimatedMRR : 0);
  const monthlyRevenue = typeof metrics.monthlyRevenue === 'number'
    ? `₹${metrics.monthlyRevenue.toLocaleString()}`
    : (typeof metrics.monthlyRevenue === 'string' && metrics.monthlyRevenue.trim())
      ? metrics.monthlyRevenue
      : (revenueStats.estimatedMRR != null
        ? `₹${Number(revenueStats.estimatedMRR).toLocaleString()}`
        : null);

  // ── Chart: Plan Distribution ────────────────────────────────────────────────
  const planChartOptions = {
    chart: { type: 'donut', background: 'transparent', animations: { enabled: true } },
    labels: ['Free', 'Growth', 'Enterprise'],
    colors: [alpha(primary, 0.45), alpha(primary, 0.7), primary],
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true, label: 'tenants', fontSize: '11px',
              color: textSec,
              formatter: () => totalTenants,
            },
          },
        },
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };
  const planChartSeries = [freePlan, growthPlan, enterprisePlan];

  // ── Chart: Revenue Trend ────────────────────────────────────────────────────
  const revenueData = data?.revenueMonthly || [
    { x: 'Jan', y: 0 }, { x: 'Feb', y: 0 },
    { x: 'Mar', y: 0 }, { x: 'Apr', y: 0 },
  ];
  const revOptions = {
    chart: { type: 'area', background: 'transparent', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: revenueData.map(r => r.x || r.month),
      labels: { style: { colors: textSec, fontSize: '11px' } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: textSec, fontSize: '11px' },
        formatter: v => `₹${(v / 100000).toFixed(1)}L`,
      },
    },
    colors: [primary],
    fill: { type: 'gradient', gradient: { opacityFrom: isDark ? 0.25 : 0.18, opacityTo: 0.02 } },
    grid: { borderColor: divider, strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light' },
    dataLabels: { enabled: false },
  };
  const revSeries = [{ name: 'MRR', data: revenueData.map(r => r.y || r.value || 0) }];

  // ── Fallback data ───────────────────────────────────────────────────────────
  const infraServices = infrastructure.length > 0 ? infrastructure : [
    { name: 'PostgreSQL (primary)',   status: 'healthy' },
    { name: 'Redis (cache)',          status: 'healthy' },
    { name: 'Email (SendGrid)',       status: 'healthy' },
    { name: 'Stripe API',            status: 'healthy' },
    { name: 'Biometric Device API',  status: 'warning', note: '1 device offline' },
    { name: 'Sentry (errors)',       status: 'healthy' },
  ];

  const fallbackTenants = [
    { name: 'Nexacraft Technologies', email: 'admin@nexacraft.in', plan: 'Growth',     employees: 24, signedUp: 'Today 7:12am', status: 'Active' },
    { name: 'BluLeaf HR Solutions',   email: 'hr@bluleaf.co',      plan: 'Free',       employees: 6,  signedUp: 'Yesterday',    status: 'Active' },
    { name: 'Vantara Systems',        email: 'ops@vantara.io',     plan: 'Enterprise', employees: 87, signedUp: '2 Apr',        status: 'Active' },
    { name: 'Orbis Retail Pvt Ltd',   email: 'payroll@orbis.in',   plan: 'Growth',     employees: 31, signedUp: '1 Apr',        status: 'Active' },
    { name: 'Mindwell Clinics',       email: 'admin@mindwell.care',plan: 'Free',       employees: 9,  signedUp: '30 Mar',       status: 'Invite expired' },
  ];

  const fallbackAudit = [
    { userName: 'Rajat C.', action: 'Plan Override', details: 'upgraded Vantara → Enterprise',  time: 'Today 8:02am' },
    { userName: 'Pavan S.', action: 'Login',         details: 'accessed Super Admin portal',     time: 'Yesterday 6:14pm' },
    { userName: 'Rajat C.', action: 'Suspend',       details: 'suspended Zephyr Solutions',      time: 'Yesterday 3:30pm' },
    { userName: 'Rajat C.', action: 'Create',        details: 'created new Super Admin user',    time: '3 Apr 11:20am' },
  ];

  const fallbackFlagged = [
    { name: 'Zephyr Solutions',  reason: 'Payment failed — 3 days overdue',         icon: '⚠️' },
    { name: 'Pinnacle Exports',  reason: '7 failed logins in 10 min',                icon: '🔒' },
    { name: 'Arclight Media',    reason: 'API error rate 4.2% — above threshold',   icon: '📉' },
  ];

  const displayTenants  = recentTenants.length  > 0 ? recentTenants  : fallbackTenants;
  const displayAudit    = auditLog.length       > 0 ? auditLog       : fallbackAudit;
  const displayFlagged  = flaggedTenants.length > 0 ? flaggedTenants : fallbackFlagged;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', px: 3, py: 3 }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: textPri, letterSpacing: '-0.3px' }}>
            Super Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: 12, color: textSec, mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Live data
          </Typography>
        </Box>
        {/* <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" size="small"
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, fontSize: 12, borderColor: divider, color: textSec }}>
            Export Report
          </Button>
          <Button variant="contained" size="small"
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: 12, bgcolor: primary, '&:hover': { bgcolor: pDark } }}>
            + Add Tenant
          </Button>
        </Box> */}
      </Box>

      {/* ── System KPI Bar ───────────────────────────────────────────────────── */}
      {/* <SCard sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden' }}>
        <Grid container>
          {[
            { label: 'Uptime (30d)',        value: metrics.uptime        || '99.97%', sub: '↑ All systems operational', positive: true },
            { label: 'API Response (p95)',   value: metrics.apiResponse   || '184ms',  sub: '↓ 12ms from yesterday',      positive: true },
            { label: 'Error Rate',           value: metrics.errorRate     || '0.04%',  sub: '↓ Within threshold',         positive: true },
            { label: 'Active Sessions',      value: metrics.activeSessions|| '1,284',  sub: '↑ 23 from 1hr ago',          positive: true },
          ].map((k, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Box sx={{
                px: 3, py: 2.5,
                borderRight: i < 3 ? `1px solid ${divider}` : 'none',
                borderBottom: { xs: i < 2 ? `1px solid ${divider}` : 'none', md: 'none' },
              }}>
                <Typography sx={{ fontSize: 11, color: textSec, fontWeight: 600, mb: 0.5 }}>{k.label}</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: primary, letterSpacing: '-1px', lineHeight: 1.1 }}>
                  {k.value}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#4ade80', mt: 0.5 }}>{k.sub}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </SCard> */}

      {/* ── Business Metrics ─────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: 'TOTAL TENANTS',    value: totalTenants            ?? 247,    sub: `↑ ${tenantStats.newThisMonth ?? 12} new this month`,   color: primary },
          { label: 'ACTIVE TENANTS',   value: activeTenants           ?? 231,    sub: '↑ 93.5% active rate',   color: '#4ade80' },
          { label: 'MONTHLY REVENUE',  value: monthlyRevenue          ?? '₹4.2L', sub: '↑ 18% MoM', color: '#f59e0b' },
          { label: 'CHURNED (30D)',    value: churned                ?? 3,      sub: '↓ 1.2% churn',          color: isDark ? '#a78bfa' : '#7c3aed' },
        ].map((m, i) => (
          <Grid item xs={6} md={3} key={i}>
            <SCard sx={{ p: 2.5, bgcolor: alpha(m.color, isDark ? 0.07 : 0.04) }}>
              <Typography sx={{ fontSize: 10, color: textSec, fontWeight: 700, letterSpacing: '0.5px', mb: 1 }}>
                {m.label}
              </Typography>
              <Typography sx={{ fontSize: 30, fontWeight: 800, color: m.color, letterSpacing: '-1px', lineHeight: 1 }}>
                {m.value}
              </Typography>
              <Typography sx={{ fontSize: 11, color: textSec, mt: 0.75 }}>{m.sub}</Typography>
              <LinearProgress variant="determinate" value={75}
                sx={{
                  mt: 1.5, height: 4, borderRadius: 10,
                  bgcolor: alpha(m.color, 0.15),
                  '& .MuiLinearProgress-bar': { bgcolor: m.color, borderRadius: 10 },
                }}
              />
            </SCard>
          </Grid>
        ))}
      </Grid>

      {/* ── Recent Signups + Revenue / Plan Distribution ──────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>

        {/* Recent Signups */}
        <Grid item xs={12} md={8}>
          <SCard>
            <SectionHeader
              title="Recent Signups"
              action={
                <Button size="small" sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }}>
                  View all →
                </Button>
              }
            />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['COMPANY', 'PLAN', 'SIGNED UP', 'STATUS'].map(h => (
                      <TableCell key={h} sx={{
                        color: textSec, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                        borderBottom: `1px solid ${divider}`, py: 1, px: 2,
                        bgcolor: alpha(primary, 0.03),
                      }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                    {/* {JSON.stringify(displayTenants)} */}
                  {displayTenants.slice(0, 6).map((t, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: alpha(primary, 0.04) }, borderBottom: `1px solid ${divider}` }}>
                      <TableCell sx={{ py: 1.4, px: 2, borderBottom: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(primary, 0.15), color: primary, fontSize: 12, fontWeight: 800 }}>
                            {(t.name || t.companyName || '?').charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: textPri, fontSize: 13, fontWeight: 600 }}>
                              {t.name || t.companyName}
                            </Typography>
                            <Typography sx={{ color: textSec, fontSize: 11 }}>{t.email || t.adminEmail}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                        <PlanBadge plan={t.plan} />
                      </TableCell>
                      {/* <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 13, px: 2 }}>
                        {t.employees || t.employeeCount || 0}
                      </TableCell> */}
                      <TableCell sx={{ borderBottom: 'none', color: textSec, fontSize: 12, px: 2 }}>
                        {new Date(t.joinedAt).toLocaleDateString('en-IN') || (t.createdAt ? new Date(t.joinedAt).toLocaleDateString('en-IN') : '—')}
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none', px: 2 }}>
                        <StatusBadge status={t.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SCard>
        </Grid>

        {/* Right: Revenue + Plan Distribution */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} sx={{ height: '100%' }}>

            {/* MRR */}
            <Grid item xs={12}>
              <SCard sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 14, color: textPri }}>Revenue</Typography>
                  <Button size="small" sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }}>Details →</Button>
                </Box>
                <Typography sx={{ fontSize: 10, color: textSec, fontWeight: 700, letterSpacing: '0.5px' }}>MRR</Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: textPri, letterSpacing: '-1px' }}>
                  {`₹${mrr.toLocaleString()}`}
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#4ade80', mb: 1.5 }}>↑ 18.3% vs last month</Typography>
                <Box sx={{ height: 60, mb: 1 }}>
                  <Chart options={{ ...revOptions, chart: { ...revOptions.chart, sparkline: { enabled: true } }, grid: { show: false }, xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } }, yaxis: { show: false }, tooltip: { ...revOptions.tooltip } }} series={revSeries} type="area" height={60} />
                </Box>
                <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: textSec }}>ARR</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: textPri }}>{metrics.arr || '₹0'}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: textSec }}>AVG/TENANT</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: textPri }}>
                      {metrics.avgPerTenant ? `₹${metrics.avgPerTenant}` : '₹0'}
                    </Typography>
                  </Box>
                </Box>
              </SCard>
            </Grid>

            {/* Plan Distribution */}
            <Grid item xs={12}>
              <SCard sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: textPri, mb: 1 }}>Plan Distribution</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Chart options={planChartOptions} series={planChartSeries} type="donut" width={160} />
                </Box>
                {[
                  { label: 'Free',       val: freePlan,       pct: totalTenants ? Math.round(freePlan / totalTenants * 100) : 54,       color: alpha(primary, 0.45) },
                  { label: 'Growth',     val: growthPlan,     pct: totalTenants ? Math.round(growthPlan / totalTenants * 100) : 28,     color: alpha(primary, 0.7) },
                  { label: 'Enterprise', val: enterprisePlan, pct: totalTenants ? Math.round(enterprisePlan / totalTenants * 100) : 18, color: primary },
                ].map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                      <Typography sx={{ fontSize: 12, color: textSec }}>{p.label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12, color: p.color, fontWeight: 700 }}>{p.val} · {p.pct}%</Typography>
                  </Box>
                ))}
              </SCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Flagged + Audit Log + Infrastructure ─────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Flagged Tenants */}
        <Grid item xs={12} md={4}>
          <SCard>
            <SectionHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🚨</span>
                  <span>Flagged Tenants</span>
                  <Box sx={{ px: 1, py: 0.2, borderRadius: 10, bgcolor: isDark ? 'rgba(248,113,113,0.15)' : '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>
                    {displayFlagged.length}
                  </Box>
                </Box>
              }
            />
            <CardContent sx={{ pt: 2 }}>
              {displayFlagged.map((f, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  mb: i < displayFlagged.length - 1 ? 1.5 : 0,
                  pb: i < displayFlagged.length - 1 ? 1.5 : 0,
                  borderBottom: i < displayFlagged.length - 1 ? `1px solid ${divider}` : 'none',
                }}>
                  <Box sx={{ fontSize: 18, flexShrink: 0 }}>{f.icon || '⚠️'}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: textPri, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.name}
                    </Typography>
                    <Typography sx={{ color: textSec, fontSize: 11, mt: 0.25 }}>{f.reason}</Typography>
                  </Box>
                  <Button size="small" sx={{
                    flexShrink: 0, bgcolor: isDark ? 'rgba(248,113,113,0.15)' : '#fef2f2',
                    color: '#ef4444', fontSize: 11, fontWeight: 700, borderRadius: 1.5,
                    px: 1.5, minWidth: 0, textTransform: 'none',
                    '&:hover': { bgcolor: isDark ? 'rgba(248,113,113,0.25)' : '#fee2e2' },
                  }}>
                    Review
                  </Button>
                </Box>
              ))}
            </CardContent>
          </SCard>
        </Grid>

        {/* Audit Log */}
        <Grid item xs={12} md={4}>
          <SCard>
            <SectionHeader
              title="Audit Log"
              action={
                <Button size="small" sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }}>
                  Full log →
                </Button>
              }
            />
            <CardContent sx={{ pt: 2 }}>
              {displayAudit.slice(0, 5).map((log, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 1.5,
                  mb: 1.5, pb: 1.5,
                  borderBottom: `1px solid ${divider}`,
                  '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' },
                }}>
                  <Avatar sx={{
                    width: 30, height: 30, fontSize: 11, fontWeight: 700,
                    bgcolor: alpha(primary, 0.12), color: primary, flexShrink: 0,
                  }}>
                    {(log.userName || log.user || 'U').charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ color: textPri, fontSize: 12, fontWeight: 600 }}>
                        {log.userName || log.user}
                      </Typography>
                      <ActionBadge action={log.action} />
                    </Box>
                    <Typography sx={{ color: textSec, fontSize: 11, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </Typography>
                    <Typography sx={{ color: textSec, fontSize: 10, mt: 0.25, opacity: 0.7 }}>
                      {log.time || log.createdAt}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </SCard>
        </Grid>

        {/* Infrastructure Status */}
        <Grid item xs={12} md={4}>
          <SCard>
            <SectionHeader
              title="Infrastructure Status"
              action={
                <Button size="small" sx={{ textTransform: 'none', fontSize: 12, color: primary, p: 0 }}>
                  Details →
                </Button>
              }
            />
            <CardContent sx={{ pt: 2 }}>
              {infraServices.map((svc, i) => (
                <Box key={i} sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  mb: i < infraServices.length - 1 ? 1.5 : 0,
                  pb: i < infraServices.length - 1 ? 1.5 : 0,
                  borderBottom: i < infraServices.length - 1 ? `1px solid ${divider}` : 'none',
                }}>
                  <Typography sx={{ color: textSec, fontSize: 13 }}>{svc.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StatusDot status={svc.status} />
                    <Typography sx={{
                      fontSize: 12, fontWeight: 600,
                      color: svc.status === 'healthy' ? '#4ade80' : svc.status === 'warning' ? '#fbbf24' : '#f87171',
                    }}>
                      {svc.note || (svc.status === 'healthy' ? 'Healthy' : svc.status === 'warning' ? 'Warning' : 'Offline')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </SCard>
        </Grid>
      </Grid>

    </Box>
  );
}