"use client";

import { useState, useEffect } from "react";
import { useTheme, alpha } from '@mui/material/styles'
import axiosRequest from 'src/utils/AxiosInterceptor'

const initialData = {
  today: {
    date: "Saturday, 4 Apr 2026",
    time: "9:41am",
    totalActive: 8,
    present: 1,
    late: 2,
    absent: 2,
    onLeave: 0,
    attendanceRate: 83,
    liveNow: 18,
    newThisMonth: 3,
  },
  payroll: {
    dueInDays: 3,
    estimated: "₹5,84,000",
    employeeCount: 8,
    lastRun: { month: "March 2026", employees: 24, total: "₹5,76,400", date: "28 Mar", status: "Locked" },
    nextRun: { month: "April 2026", dueBy: "7 Apr", daysRemaining: 3, status: "Pending" },
  },
  pendingLeaves: [
    { id: 1, name: "Priya Iyer", avatar: "P", color: "var(--teal)", dates: "7 Apr – 8 Apr", days: 2, dept: "Engineering", type: "Annual" },
    { id: 2, name: "Ravi Kumar", avatar: "R", color: "#6366f1", dates: "5 Apr", days: 1, dept: "Sales", type: "Sick" },
    { id: 3, name: "Suresh Pillai", avatar: "S", color: "#f59e0b", dates: "10–11 Apr", days: 2, dept: "Finance", type: "Casual" },
    { id: 4, name: "Anita Bose", avatar: "A", color: "#8b5cf6", dates: "14–18 Apr", days: 5, dept: "Design", type: "Annual" },
    { id: 5, name: "Meera Joshi", avatar: "M", color: "#ef4444", dates: "6 Apr", days: 1, dept: "Engineering", type: "Sick" },
  ],
  alerts: [
    { id: 1, name: "Deepa Nair", issue: "Missing bank details", sub: "Payroll cannot process", severity: "High" },
    { id: 2, name: "Vikram Nair", issue: "Contract expires 30 Apr", sub: "26 days remaining", severity: "Med" },
    { id: 3, name: "Rahul Mishra", issue: "No attendance 3 days", sub: "Apr 1–3 unrecorded", severity: "High" },
  ],
};

const leaveTypeStyle = {
  Annual: { bg: "var(--leave-annual-bg)", color: "var(--leave-annual-fg)" },
  Sick: { bg: "var(--leave-sick-bg)", color: "var(--leave-sick-fg)" },
  Casual: { bg: "var(--leave-casual-bg)", color: "var(--leave-casual-fg)" },
};

const severityStyle = {
  High: { color: "#ef4444" },
  Med: { color: "#f59e0b" },
};

// Donut chart SVG
function DonutChart({ present, late, absent, onLeave, total }) {
  const segments = [
      { value: present, color: "var(--teal)" }, // This line remains unchanged
    { value: late, color: "#f59e0b" },
    { value: absent, color: "#ef4444" },
    { value: onLeave, color: "#6366f1" },
  ];
  const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
  const cx = 60, cy = 60, r = 48, ir = 33;
  let angle = -Math.PI / 2;
  const arcs = segments.map((seg) => {
    const sweep = (seg.value / sum) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const laf = sweep > Math.PI ? 1 : 0;
    const xi1 = cx + ir * Math.cos(angle - sweep), yi1 = cy + ir * Math.sin(angle - sweep);
    const xi2 = cx + ir * Math.cos(angle), yi2 = cy + ir * Math.sin(angle);
    return { d: `M${x1},${y1} A${r},${r} 0 ${laf},1 ${x2},${y2} L${xi2},${yi2} A${ir},${ir} 0 ${laf},0 ${xi1},${yi1} Z`, color: seg.color };
  });
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {arcs.map((arc, i) => <path key={i} d={arc.d} fill={arc.color} />)}
      <text x="60" y="57" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text-primary)">{total}</text>
      <text x="60" y="71" textAnchor="middle" fontSize="9" fill="var(--text-muted)">employees</text>
    </svg>
  );
}

export default function HRDashboard() {
  const [leaves, setLeaves] = useState(initialData.pendingLeaves);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const d = dashboard || initialData;
  console.log('HRDashboard data:', d) // Debug log to check API response structure and values

  // Derive newThisMonth if not present in API
  const newThisMonth = d.today?.newThisMonth ?? 0;

  const muiTheme = useTheme();
  const primary = muiTheme?.palette?.primary?.main || '#0d9488';
  const primaryDark = muiTheme?.palette?.primary?.dark || primary;
  const primarySoft = alpha(primary, 0.15);

  const isDark = muiTheme?.palette?.mode === 'dark';

  const approveLeave = (id) => setLeaves((l) => l.filter((x) => x.id !== id));
  const rejectLeave = (id) => setLeaves((l) => l.filter((x) => x.id !== id));

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axiosRequest.get('api/v1/dashboard/hr');
        if (!mounted) return;
        setDashboard(res.data);
        // map API pendingLeaves to local leaves shape used by the UI
        const apiLeaves = res.data?.pendingLeaves || [];
        if (apiLeaves.length) {
          const mapped = apiLeaves.map((l, idx) => ({
            id: l.id || l._id || idx,
            name: l.employee?.name || 'Unknown',
            avatar: (l.employee?.name || 'U')[0]?.toUpperCase() || 'U',
            color: 'var(--teal)',
            dates: `${new Date(l.startDate).toLocaleDateString()}${l.endDate && l.endDate !== l.startDate ? ' – ' + new Date(l.endDate).toLocaleDateString() : ''}`,
            days: l.totalDays || 1,
            dept: l.employee?.department || '',
            type: l.leaveType?.name || 'Leave',
          }));
          setLeaves(mapped);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false };
  }, []);

  const themeVars = isDark
    ? {
        "--bg": "#0f172a",
        "--surface": "#1e293b",
        "--surface2": "#263245",
        "--border": "#334155",
        "--text-primary": "#f1f5f9",
        "--text-secondary": "#94a3b8",
        "--text-muted": "#64748b",
        "--teal": primary,
        "--teal-hover": primaryDark,
        "--teal-soft": primarySoft,
        "--stat-dark-bg": "#1a2744",
        "--stat-dark-text": "#e2e8f0",
        "--leave-annual-bg": "rgba(37,99,235,0.2)",
        "--leave-annual-fg": "#60a5fa",
        "--leave-sick-bg": "rgba(220,38,38,0.15)",
        "--leave-sick-fg": "#f87171",
        "--leave-casual-bg": "rgba(22,163,74,0.15)",
        "--leave-casual-fg": "#4ade80",
        "--alert-bg": "#1e293b",
        "--payroll-card": "#1a2744",
      }
    : {
        "--bg": "#f1f5f9",
        "--surface": "#ffffff",
        "--surface2": "#f8fafc",
        "--border": "#e2e8f0",
        "--text-primary": "#0f172a",
        "--text-secondary": "#475569",
        "--text-muted": "#94a3b8",
        "--teal": primary,
        "--teal-hover": primaryDark,
        "--teal-soft": primarySoft,
        "--stat-dark-bg": "#0f172a",
        "--stat-dark-text": "#ffffff",
        "--leave-annual-bg": "#eff6ff",
        "--leave-annual-fg": "#2563eb",
        "--leave-sick-bg": "#fef2f2",
        "--leave-sick-fg": "#dc2626",
        "--leave-casual-bg": "#f0fdf4",
        "--leave-casual-fg": "#16a34a",
        "--alert-bg": "#fff",
        "--payroll-card": "#f8fafc",
      };

  return (
    <div style={{ ...themeVars, background: "var(--bg)", minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "var(--text-primary)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
        .badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .btn-icon { width: 28px; height: 28px; border-radius: 7px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .btn-icon:hover { opacity: 0.85; }
        
        .btn-primary { background: var(--teal); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .btn-primary:hover { background: var(--teal-hover); }
        .btn-outline { background: transparent; color: var(--teal); border: 1.5px solid var(--teal); border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .btn-outline:hover { background: var(--teal-soft); }
        .progress-bar { height: 6px; border-radius: 99px; background: var(--border); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; }
        .leave-row:hover { background: var(--surface2); }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 8px; vertical-align: middle; }
        .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; flex-shrink: 0; }
        .section-title { font-size: 15px; font-weight: 800; color: var(--text-primary); }
        .section-sub { font-size: 12px; color: var(--text-muted); }
        .divider { height: 1px; background: var(--border); margin: 0; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>HR Dashboard</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{d.today.date} · Real-time data</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>📊 Reports</button>
            <button className="btn-primary">+ Add Employee</button>
          </div>
        </div>

        {/* Payroll Alert Banner */}
        <div style={{ background: "#d97706", borderRadius: 10, padding: "12px 18px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              April payroll due in {d.payroll?.dueInDays ?? initialData.payroll.dueInDays} days ·  {d.payroll?.employeeCount ?? initialData.payroll.employeeCount} employees
            </span>
          </div>
          <button style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Initiate Pay Run →</button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 18 }}>
          {/* Total Employees - dark card */}
          <div style={{ background: "var(--stat-dark-bg)", borderRadius: 12, padding: "16px", border: "1px solid transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>👥</span>
              <span style={{ fontSize: 11, background: "var(--teal-soft)", color: "var(--teal)", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>+{newThisMonth} this mo</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--stat-dark-text)", lineHeight: 1 }}>{d.today?.totalActive ?? initialData.today.totalActive}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Total Employees</div>
          </div>

          {/* Present */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700 }}>{d.today?.attendanceRate ?? initialData.today.attendanceRate}%</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--teal)", lineHeight: 1 }}>{d.today?.present ?? initialData.today.present}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Present Today</div>
          </div>

          {/* Leave Requests */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🌴</span>
              <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>{d.pendingLeaveCount ?? leaves.length} pending</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#d97706", lineHeight: 1 }}>{d.pendingLeaveCount ?? leaves.length}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Leave Requests</div>
          </div>

          {/* Absent */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>❌</span>
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>Today</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#ef4444", lineHeight: 1 }}>{d.today?.absent ?? initialData.today.absent}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Absent Today</div>
          </div>

          {/* Late */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>⏰</span>
              <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>Today</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>{d.today?.late ?? initialData.today.late}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Late Arrivals</div>
          </div>
        </div>

        {/* Monthly Stats */}
        {/* <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>Working Hours (Month)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{(d.monthlyStats?.totalWorkingHours ?? initialData.monthlyStats.totalWorkingHours).toFixed(2)} hrs</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Total working hours this month</div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>Overtime Hours (Month)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{(d.monthlyStats?.totalOvertimeHours ?? initialData.monthlyStats.totalOvertimeHours).toFixed(2)} hrs</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Total overtime recorded</div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>Late Minutes (Month)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{Math.round(d?.monthlyStats?.totalLateMinutes ?? initialData?.monthlyStats?.totalLateMinutes)} mins</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Total minutes late</div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>Absent Days (Month)</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{d.monthlyStats?.totalAbsentDays ?? initialData.monthlyStats.totalAbsentDays}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Total absent days</div>
          </div>
        </div> */}

        {/* Attendance Card */}
        <div className="card" style={{ padding: "18px 22px", marginBottom: 18 }}>
          <div style={{ marginBottom: 14 }}>
            <div className="section-title">Today's Attendance — {d.today?.date ? new Date(d.today.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : initialData.today.date} · {d.today?.time || initialData.today.time}</div>
          </div>
          <div className="divider" style={{ marginBottom: 14 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <DonutChart 
              present={d.today?.present ?? initialData.today.present} 
              late={d.today?.late ?? initialData.today.late} 
              absent={d.today?.absent ?? initialData.today.absent} 
              onLeave={d.today?.onLeave ?? initialData.today.onLeave} 
              total={d.today?.totalActive ?? initialData.today.totalActive} 
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
              {[
                { label: "Present", color: "var(--teal)" },
                { label: "Late", color: "#f59e0b" },
                { label: "Absent", color: "#ef4444" },
                { label: "On Leave", color: "#6366f1" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1 }}>{row.label}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", minWidth: 160 }}>
              {[
                { label: "Present", val: d.today?.present ?? initialData.today.present, pct: d.today?.attendanceRate ?? initialData.today.attendanceRate, color: "var(--teal)" },
                { label: "Late", val: d.today?.late ?? initialData.today.late, pct: Math.round(((d.today?.late ?? 0) / (d.today?.totalActive ?? 1)) * 100) || 8, color: "#f59e0b" },
                { label: "Absent", val: d.today?.absent ?? initialData.today.absent, pct: Math.round(((d.today?.absent ?? 0) / (d.today?.totalActive ?? 1)) * 100) || 8, color: "#ef4444" },
                { label: "On Leave", val: d.today?.onLeave ?? initialData.today.onLeave, pct: 0, color: "#6366f1" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", width: 24, textAlign: "right" }}>{row.val}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", width: 36 }}>{row.pct}%</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${row.pct}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginLeft: 16, whiteSpace: "nowrap", borderRadius: 9, padding: "10px 18px" }}>View Full Report →</button>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>

          {/* Leave Requests */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="section-title">Leave Requests — Pending</span>
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{leaves.length}</span>
              </div>
            </div>
            <div className="divider" />
            <table>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id} className="leave-row" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ paddingLeft: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ background: leave.color }}>{leave.avatar}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{leave.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{leave.dates} · {leave.days} day{leave.days > 1 ? "s" : ""} · {leave.dept}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: leaveTypeStyle[leave.type]?.bg, color: leaveTypeStyle[leave.type]?.color }}>
                        {leave.type}
                      </span>
                    </td>
                    <td style={{ paddingRight: 20 }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="btn-icon" style={{ background: "#f0fdf4", color: "#16a34a" }} onClick={() => approveLeave(leave.id)}>✓</button>
                        <button className="btn-icon" style={{ background: "#fef2f2", color: "#dc2626" }} onClick={() => rejectLeave(leave.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>No pending leave requests</td></tr>
                )}
              </tbody>
            </table>
            <div style={{ padding: "12px 20px" }}>
              <button style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "11px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                View All Leave Requests →
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Payroll Status */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="section-title">Payroll Status</span>
                <button className="btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>View runs →</button>
              </div>

              {/* Last Run */}
              <div style={{ background: "var(--payroll-card)", borderRadius: 9, padding: "12px 14px", marginBottom: 10, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Last Run</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{d.payroll?.lastRun?.month ?? initialData.payroll.lastRun.month} · {d.payroll?.lastRun?.employees ?? initialData.payroll.lastRun.employees} employees</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.payroll?.lastRun?.total ?? initialData.payroll.lastRun.total} total · {d.payroll?.lastRun?.date ?? initialData.payroll.lastRun.date}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#16a34a", borderRadius: 6, padding: "3px 9px" }}>✓ Locked</span>
                </div>
              </div>

              {/* Next Run */}
              <div style={{ background: "var(--payroll-card)", borderRadius: 9, padding: "12px 14px", marginBottom: 14, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Next Run Due</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>{d.payroll?.nextRun?.month ?? initialData.payroll.nextRun.month}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Due by {d.payroll?.nextRun?.dueBy ?? initialData.payroll.nextRun.dueBy} · {d.payroll?.nextRun?.daysRemaining ?? initialData.payroll.nextRun.daysRemaining} days remaining</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#fffbeb", color: "#d97706", borderRadius: 6, padding: "3px 9px" }}>⏳ Pending</span>
                </div>
              </div>

              <button style={{ width: "100%", background: "var(--teal)", color: "#fff", border: "none", borderRadius: 9, padding: "11px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                💰 Initiate April Pay Run
              </button>
            </div>

            {/* HR Alerts */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span className="section-title">HR Alerts</span>
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                  {(d.alerts ?? initialData.alerts).length + 1}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(d.alerts ?? initialData.alerts).map((alert) => (
                  <div key={alert.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--payroll-card)", borderRadius: 9, border: "1px solid var(--border)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{alert.name} — {alert.issue}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{alert.sub}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: severityStyle[alert.severity]?.color }}>{alert.severity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}