import { useState, useEffect, useRef } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  ink:      "#0A0B0D",
  inkMid:   "#3D4148",
  inkLight: "#767D8A",
  surface:  "#FFFFFF",
  surfaceAlt:"#F7F8FA",
  border:   "#E4E7EC",
  borderMid:"#C9CDD6",
  teal:     "#0DB37A",
  tealDark: "#089460",
  tealFaint:"#E6FAF3",
  tealMid:  "#B6EDDA",
  blue:     "#2563EB",
  blueFaint:"#EFF4FF",
  amber:    "#D97706",
  amberFaint:"#FFFBEB",
  red:      "#DC2626",
  redFaint: "#FEF2F2",
  purple:   "#7C3AED",
  purpleFaint:"#F5F3FF",
};

// ── Module catalogue ─────────────────────────────────────────────────────────
const MODULES = [
  { id:"core",       name:"Core Platform",       icon:"⬡", desc:"Auth, RBAC, audit logs, org structure", required:true,  plans:["starter","growth","pro","enterprise"] },
  { id:"employee",   name:"Employee Management",  icon:"👤", desc:"Profiles, lifecycle, designations",    required:true,  plans:["starter","growth","pro","enterprise"] },
  { id:"attendance", name:"Attendance",           icon:"🕐", desc:"Check-in/out, biometric, WFH, reports", required:false, plans:["growth","pro","enterprise"] },
  { id:"leave",      name:"Leave Management",     icon:"🌴", desc:"Policy, approval workflow, balance",    required:false, plans:["growth","pro","enterprise"] },
  { id:"payroll",    name:"Payroll",              icon:"💳", desc:"Salary structure, pay runs, payslips",  required:false, plans:["growth","pro","enterprise"] },
  { id:"appraisal",  name:"Performance & Appraisal",icon:"⭐", desc:"Goals, reviews, ratings",           required:false, plans:["pro","enterprise"] },
  { id:"recruitment",name:"Recruitment",          icon:"🎯", desc:"Job postings, pipeline, offers",        required:false, plans:["pro","enterprise"] },
  { id:"training",   name:"Training & LMS",       icon:"🎓", desc:"Courses, certifications, completion",   required:false, plans:["pro","enterprise"] },
  { id:"expenses",   name:"Expense Management",   icon:"🧾", desc:"Claims, approvals, reimbursement",      required:false, plans:["enterprise"] },
  { id:"analytics",  name:"Advanced Analytics",   icon:"📊", desc:"Custom dashboards, BI exports",         required:false, plans:["enterprise"] },
  { id:"assets",     name:"Asset Management",     icon:"💼", desc:"Assign, track, return assets",          required:false, plans:["enterprise"] },
  { id:"helpdesk",   name:"HR Helpdesk",          icon:"🎧", desc:"Tickets, SLA, knowledge base",          required:false, plans:["enterprise"] },
];

const PLANS = [
  { id:"starter",    name:"Starter",    monthly:999,   annual:799,   seats:50,   color:C.inkLight, colorFaint:"#F7F8FA" },
  { id:"growth",     name:"Growth",     monthly:2499,  annual:1999,  seats:200,  color:C.teal,     colorFaint:C.tealFaint, popular:true },
  { id:"pro",        name:"Pro",        monthly:5999,  annual:4799,  seats:500,  color:C.blue,     colorFaint:C.blueFaint },
  { id:"enterprise", name:"Enterprise", monthly:null,  annual:null,  seats:null, color:C.purple,   colorFaint:C.purpleFaint },
];

// ── Shared primitives ────────────────────────────────────────────────────────
const Tag = ({ color = C.teal, faint = C.tealFaint, children }) => (
  <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
    color, background:faint, padding:"3px 10px", borderRadius:20, display:"inline-block" }}>
    {children}
  </span>
);

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:"8px 20px", borderRadius:24, border:`1.5px solid ${active ? C.teal : C.border}`,
    background: active ? C.tealFaint : C.surface, color: active ? C.tealDark : C.inkLight,
    fontWeight:500, fontSize:14, cursor:"pointer", transition:"all .15s"
  }}>{children}</button>
);

const Input = ({ label, placeholder, value, onChange, type="text", hint }) => (
  <div style={{ marginBottom:20 }}>
    <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.inkMid, marginBottom:6 }}>{label}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${C.border}`, borderRadius:10,
        fontSize:15, color:C.ink, outline:"none", background:C.surface, boxSizing:"border-box",
        fontFamily:"inherit", transition:"border .15s" }}
      onFocus={e=>e.target.style.borderColor=C.teal}
      onBlur={e=>e.target.style.borderColor=C.border}
    />
    {hint && <p style={{ fontSize:12, color:C.inkLight, marginTop:4 }}>{hint}</p>}
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:20 }}>
    <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.inkMid, marginBottom:6 }}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} style={{
      width:"100%", padding:"12px 16px", border:`1.5px solid ${C.border}`, borderRadius:10,
      fontSize:15, color:C.ink, background:C.surface, outline:"none", fontFamily:"inherit",
      appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23767D8A' stroke-width='2' stroke-linecap='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center"
    }}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Btn = ({ onClick, children, variant="primary", disabled=false, full=false }) => {
  const primary = { background: disabled ? C.border : C.teal, color: disabled ? C.inkLight : "#fff", border:"none" };
  const ghost   = { background:"transparent", color:C.inkMid, border:`1.5px solid ${C.border}` };
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding:"13px 28px", borderRadius:10, fontWeight:600, fontSize:15, cursor: disabled ? "not-allowed" : "pointer",
      transition:"all .15s", width: full ? "100%" : "auto", fontFamily:"inherit",
      ...(variant==="primary" ? primary : ghost)
    }}>{children}</button>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"28px 32px", ...style }}>
    {children}
  </div>
);

const StepHeader = ({ tag, title, sub }) => (
  <div style={{ marginBottom:32 }}>
    {tag && <div style={{ marginBottom:12 }}><Tag>{tag}</Tag></div>}
    <h2 style={{ fontSize:26, fontWeight:700, color:C.ink, margin:"0 0 8px", letterSpacing:"-0.3px" }}>{title}</h2>
    {sub && <p style={{ fontSize:15, color:C.inkLight, margin:0, lineHeight:1.65 }}>{sub}</p>}
  </div>
);

// ── Progress bar ─────────────────────────────────────────────────────────────
const FLOWS = {
  super: ["Plan","Modules","Billing","Organisation","Tenants","Done"],
  tenant: ["Welcome","LOB","Units","Admin Setup","Done"],
  unit: ["Welcome","Company Info","Leave Policy","Payroll","Working Days","Done"],
};

const ProgressBar = ({ flow, step }) => {
  const steps = FLOWS[flow] || [];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:36 }}>
      {steps.map((s,i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? C.teal : active ? C.teal : C.surfaceAlt,
                border: `2px solid ${done || active ? C.teal : C.border}`,
                fontSize:13, fontWeight:700, color: done || active ? "#fff" : C.inkLight,
                zIndex:1, position:"relative"
              }}>
                {done ? "✓" : i+1}
              </div>
              <span style={{ fontSize:11, color: active ? C.tealDark : done ? C.teal : C.inkLight,
                fontWeight: active ? 600 : 400, marginTop:4, whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < steps.length-1 && (
              <div style={{ height:2, flex:1, background: i < step ? C.teal : C.border,
                margin:"0 4px", marginBottom:16, borderRadius:2 }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FLOW A — SUPER ADMIN ONBOARDING
// ══════════════════════════════════════════════════════════════════════════════

// Step 1 — Plan selection
const StepPlan = ({ data, setData, onNext }) => {
  const [billing, setBilling] = useState("monthly");
  const [plan, setPlan] = useState(data.plan || "growth");

  return (
    <div>
      <StepHeader tag="Step 1 of 5" title="Choose your plan"
        sub="Every plan includes a 14-day free trial. You can customise modules in the next step." />

      <div style={{ display:"flex", gap:8, marginBottom:28, justifyContent:"center" }}>
        <Pill active={billing==="monthly"} onClick={()=>setBilling("monthly")}>Monthly</Pill>
        <Pill active={billing==="annual"} onClick={()=>setBilling("annual")}>Annual <span style={{color:C.teal,fontWeight:700}}>−20%</span></Pill>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        {PLANS.map(p => {
          const sel = plan === p.id;
          return (
            <div key={p.id} onClick={()=>setPlan(p.id)} style={{
              border:`2px solid ${sel ? p.color : C.border}`, borderRadius:14, padding:"20px 16px",
              cursor:"pointer", background: sel ? p.colorFaint : C.surface, position:"relative",
              transition:"all .15s"
            }}>
              {p.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                background:C.teal, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 12px",
                borderRadius:20, whiteSpace:"nowrap", letterSpacing:"0.05em" }}>MOST POPULAR</div>}
              <div style={{ fontSize:22, marginBottom:8 }}>{p.id==="starter"?"🌱":p.id==="growth"?"🚀":p.id==="pro"?"⚡":"🏢"}</div>
              <div style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:22, fontWeight:800, color:p.color, marginBottom:2 }}>
                {p.monthly ? `₹${(billing==="annual"?p.annual:p.monthly).toLocaleString()}` : "Custom"}
              </div>
              {p.monthly && <div style={{ fontSize:11, color:C.inkLight }}>/ mo {billing==="annual"?"(billed annually)":""}</div>}
              <div style={{ fontSize:12, color:C.inkMid, marginTop:10, borderTop:`1px solid ${C.border}`, paddingTop:10 }}>
                {p.seats ? `Up to ${p.seats} employees` : "Unlimited employees"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <Btn onClick={() => { setData(d=>({...d, plan, billing})); onNext(); }}>Select modules →</Btn>
      </div>
    </div>
  );
};

// Step 2 — Module selection
const StepModules = ({ data, setData, onNext, onBack }) => {
  const allowed = MODULES.filter(m => m.plans.includes(data.plan));
  const [selected, setSelected] = useState(() => {
    const defaults = MODULES.filter(m=>m.required || m.plans.includes(data.plan)).map(m=>m.id);
    return data.modules || defaults;
  });

  const toggle = (id) => {
    const m = MODULES.find(x=>x.id===id);
    if (m.required) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  return (
    <div>
      <StepHeader tag="Step 2 of 5" title="Customise your modules"
        sub={`You're on the ${PLANS.find(p=>p.id===data.plan)?.name} plan. Highlighted modules are included. Toggle to add or remove.`} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
        {MODULES.map(m => {
          const inPlan  = m.plans.includes(data.plan);
          const checked = selected.includes(m.id);
          const locked  = m.required;
          return (
            <div key={m.id} onClick={()=>toggle(m.id)} style={{
              display:"flex", alignItems:"flex-start", gap:14, padding:"16px 18px",
              border:`1.5px solid ${checked && inPlan ? C.teal : C.border}`,
              borderRadius:12, cursor: locked ? "default" : "pointer",
              background: checked && inPlan ? C.tealFaint : !inPlan ? C.surfaceAlt : C.surface,
              opacity: !inPlan ? 0.45 : 1, transition:"all .15s", position:"relative"
            }}>
              {!inPlan && <div style={{ position:"absolute", top:8, right:12, fontSize:10,
                color:C.inkLight, fontWeight:600, letterSpacing:"0.05em" }}>UPGRADE</div>}
              <div style={{ fontSize:24, flexShrink:0 }}>{m.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>{m.name}</span>
                  {locked && <Tag color={C.blue} faint={C.blueFaint}>Required</Tag>}
                </div>
                <p style={{ fontSize:12, color:C.inkLight, margin:0 }}>{m.desc}</p>
              </div>
              <div style={{
                width:22, height:22, borderRadius:6, border:`2px solid ${checked && inPlan ? C.teal : C.borderMid}`,
                background: checked && inPlan ? C.teal : C.surface, flexShrink:0, marginTop:2,
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                {checked && inPlan && <span style={{ color:"#fff", fontSize:14, lineHeight:1 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background:C.surfaceAlt, borderRadius:12, padding:"14px 18px", marginBottom:24,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:14, color:C.inkMid }}>
          <strong style={{color:C.ink}}>{selected.length} modules</strong> selected
        </span>
        <Tag>{PLANS.find(p=>p.id===data.plan)?.name} plan</Tag>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d, modules:selected})); onNext(); }}>Continue to billing →</Btn>
      </div>
    </div>
  );
};

// Step 3 — Stripe-style billing
const StepBilling = ({ data, setData, onNext, onBack }) => {
  const plan = PLANS.find(p=>p.id===data.plan);
  const price = data.billing==="annual" ? plan?.annual : plan?.monthly;
  const [card, setCard] = useState({ name:"", number:"", exp:"", cvc:"" });
  const [agreed, setAgreed] = useState(false);

  const formatCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp  = v => v.replace(/\D/g,"").slice(0,4).replace(/(.{2})/g,"$1/").slice(0,5);

  return (
    <div>
      <StepHeader tag="Step 3 of 5" title="Secure payment"
        sub="Your card won't be charged until your 14-day trial ends. Cancel anytime." />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }}>
        {/* Payment form */}
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
            {["💳 Visa","💳 Mastercard","💳 Amex","💳 RuPay"].map(x=>(
              <div key={x} style={{ fontSize:11, color:C.inkLight, background:C.surfaceAlt,
                padding:"4px 10px", borderRadius:6, border:`1px solid ${C.border}` }}>{x}</div>
            ))}
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, color:C.inkLight, fontSize:12 }}>
              🔒 256-bit SSL
            </div>
          </div>
          <Input label="Cardholder name" placeholder="Vibhav Singh" value={card.name} onChange={v=>setCard(c=>({...c,name:v}))} />
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.inkMid, marginBottom:6 }}>Card number</label>
            <div style={{ position:"relative", marginBottom:20 }}>
              <input value={card.number} onChange={e=>setCard(c=>({...c,number:formatCard(e.target.value)}))}
                placeholder="1234 5678 9012 3456" maxLength={19}
                style={{ width:"100%", padding:"12px 48px 12px 16px", border:`1.5px solid ${C.border}`, borderRadius:10,
                  fontSize:15, color:C.ink, outline:"none", background:C.surface, boxSizing:"border-box", fontFamily:"monospace" }}
              />
              <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:20 }}>💳</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="Expiry" placeholder="MM/YY" value={card.exp}
              onChange={v=>setCard(c=>({...c,exp:formatExp(v)}))} />
            <Input label="CVC" placeholder="123" value={card.cvc}
              onChange={v=>setCard(c=>({...c,cvc:v.replace(/\D/g,"").slice(0,3)}))} />
          </div>
          <div onClick={()=>setAgreed(!agreed)} style={{ display:"flex", alignItems:"flex-start", gap:12,
            cursor:"pointer", marginTop:4 }}>
            <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${agreed?C.teal:C.borderMid}`,
              background:agreed?C.teal:C.surface, flexShrink:0, marginTop:2,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              {agreed && <span style={{ color:"#fff", fontSize:13 }}>✓</span>}
            </div>
            <span style={{ fontSize:13, color:C.inkLight, lineHeight:1.6 }}>
              I agree to the <a href="#" style={{color:C.teal}}>Terms of Service</a> and authorise
              BenoSupport to charge my card after the 14-day trial at the rate shown.
            </span>
          </div>
        </Card>

        {/* Order summary */}
        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.inkLight, textTransform:"uppercase",
              letterSpacing:"0.06em", marginBottom:16 }}>Order summary</div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:14, color:C.inkMid }}>{plan?.name} plan</span>
              <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>
                {price ? `₹${price?.toLocaleString()}/mo` : "Custom"}
              </span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:14, color:C.inkMid }}>Modules selected</span>
              <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>{data.modules?.length || 0}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:14, color:C.inkMid }}>Billing</span>
              <span style={{ fontSize:14, fontWeight:600, color:C.ink, textTransform:"capitalize" }}>{data.billing}</span>
            </div>
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14, marginTop:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:15, fontWeight:700, color:C.ink }}>Due today</span>
                <span style={{ fontSize:20, fontWeight:800, color:C.teal }}>₹0.00</span>
              </div>
              <p style={{ fontSize:12, color:C.inkLight, marginTop:6 }}>
                Trial ends in 14 days. First charge: {price ? `₹${price?.toLocaleString()}` : "Custom pricing"}
              </p>
            </div>
          </Card>

          <div style={{ background:C.tealFaint, border:`1px solid ${C.tealMid}`, borderRadius:12,
            padding:"14px 16px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.tealDark, marginBottom:4 }}>🎉 14-day free trial</div>
            <p style={{ fontSize:12, color:C.tealDark, margin:0, lineHeight:1.5 }}>
              Full access to all selected modules. Reminder sent 3 days before trial ends.
            </p>
          </div>

          <Btn full onClick={() => { if(agreed) { setData(d=>({...d,billing_done:true})); onNext(); } }}
            disabled={!agreed || !card.name || card.number.length < 19}>
            Start free trial →
          </Btn>
        </div>
      </div>

      <div style={{ marginTop:16 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
      </div>
    </div>
  );
};

// Step 4 — Organisation setup
const StepOrganisation = ({ data, setData, onNext, onBack }) => {
  const [org, setOrg] = useState(data.org || { name:"", industry:"", country:"India", email:"", phone:"" });
  const [admin, setAdmin] = useState(data.orgAdmin || { name:"", email:"" });

  const valid = org.name && org.email && admin.name && admin.email;

  return (
    <div>
      <StepHeader tag="Step 4 of 5" title="Set up your organisation"
        sub="One organisation can hold multiple companies (tenants). The Org Admin manages company creation." />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:18,
            display:"flex", alignItems:"center", gap:8 }}>
            🏢 Organisation details
          </div>
          <Input label="Organisation name *" placeholder="Acme Group Pvt. Ltd."
            value={org.name} onChange={v=>setOrg(o=>({...o,name:v}))} />
          <Select label="Industry" value={org.industry} onChange={v=>setOrg(o=>({...o,industry:v}))}
            options={["Manufacturing","IT / Software","Retail","Healthcare","BFSI","Education","Logistics","Other"]
              .map(x=>({value:x,label:x}))} />
          <Select label="Country" value={org.country} onChange={v=>setOrg(o=>({...o,country:v}))}
            options={["India","UAE","Singapore","USA","UK"].map(x=>({value:x,label:x}))} />
          <Input label="Contact email *" placeholder="contact@acmegroup.in" type="email"
            value={org.email} onChange={v=>setOrg(o=>({...o,email:v}))} />
          <Input label="Phone" placeholder="+91 98765 43210"
            value={org.phone} onChange={v=>setOrg(o=>({...o,phone:v}))} />
        </Card>

        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:18,
              display:"flex", alignItems:"center", gap:8 }}>
              👤 Org Admin details
            </div>
            <div style={{ background:C.blueFaint, border:`1px solid #BFDBFE`, borderRadius:10,
              padding:"12px 14px", marginBottom:18, fontSize:13, color:"#1E40AF", lineHeight:1.6 }}>
              The Org Admin can create companies and invite Tenant Admins. They <strong>cannot</strong> view employee HR data.
            </div>
            <Input label="Admin full name *" placeholder="Vibhav Singh"
              value={admin.name} onChange={v=>setAdmin(a=>({...a,name:v}))} />
            <Input label="Admin email *" placeholder="vibhav@acmegroup.in" type="email"
              value={admin.email} onChange={v=>setAdmin(a=>({...a,email:v}))}
              hint="Login credentials will be emailed to this address." />
          </Card>
          <Card>
            <div style={{ fontSize:13, fontWeight:600, color:C.inkLight, marginBottom:12 }}>What happens next</div>
            {[
              ["✉️","Org Admin receives login credentials via email"],
              ["🏢","Admin logs in and creates company tenants"],
              ["👥","Tenant admins are invited per company"],
            ].map(([ic,txt])=>(
              <div key={txt} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:16 }}>{ic}</span>
                <span style={{ fontSize:13, color:C.inkMid, lineHeight:1.5 }}>{txt}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,org,orgAdmin:admin})); onNext(); }} disabled={!valid}>
          Add tenants →
        </Btn>
      </div>
    </div>
  );
};

// Step 5 — Multi-tenant setup
const StepTenants = ({ data, setData, onNext, onBack }) => {
  const [tenants, setTenants] = useState(data.tenants || [
    { id:1, name:"", pan:"", gst:"", state:"Maharashtra", adminName:"", adminEmail:"", open:true }
  ]);

  const addTenant = () => setTenants(t=>[...t, {
    id: Date.now(), name:"", pan:"", gst:"", state:"Maharashtra", adminName:"", adminEmail:"", open:true
  }]);

  const update = (id, field, value) =>
    setTenants(t=>t.map(x=>x.id===id?{...x,[field]:value}:x));

  const toggle = (id) =>
    setTenants(t=>t.map(x=>x.id===id?{...x,open:!x.open}:x));

  const remove = (id) => setTenants(t=>t.filter(x=>x.id!==id));

  const valid = tenants.length > 0 && tenants.every(t=>t.name && t.adminEmail);

  return (
    <div>
      <StepHeader tag="Step 5 of 5" title="Add your companies (tenants)"
        sub="Each company is fully isolated. Tenant admins receive login credentials by email and can set up their own HR structure." />

      <div style={{ marginBottom:16 }}>
        {tenants.map((t, idx) => (
          <Card key={t.id} style={{ marginBottom:14, padding:0, overflow:"hidden" }}>
            {/* Header */}
            <div onClick={()=>toggle(t.id)} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"16px 24px", cursor:"pointer", background: t.name ? C.surface : C.surfaceAlt
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:C.tealFaint,
                  border:`1px solid ${C.tealMid}`, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, fontWeight:700, color:C.tealDark }}>
                  {idx+1}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:600, color:C.ink }}>
                    {t.name || `Company ${idx+1}`}
                  </div>
                  <div style={{ fontSize:12, color:C.inkLight }}>
                    {t.adminEmail || "Tenant admin not set"}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {t.name && t.adminEmail && (
                  <Tag color={C.teal} faint={C.tealFaint}>Ready</Tag>
                )}
                {tenants.length > 1 && (
                  <button onClick={e=>{e.stopPropagation();remove(t.id)}} style={{
                    background:"none", border:"none", cursor:"pointer", color:C.red,
                    fontSize:18, padding:"0 4px" }}>✕</button>
                )}
                <span style={{ color:C.inkLight, fontSize:18 }}>{t.open?"▲":"▼"}</span>
              </div>
            </div>

            {t.open && (
              <div style={{ padding:"0 24px 24px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ paddingTop:20 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <Input label="Legal company name *" placeholder="Acme Manufacturing Ltd."
                      value={t.name} onChange={v=>update(t.id,"name",v)} />
                    <Select label="State" value={t.state} onChange={v=>update(t.id,"state",v)}
                      options={["Maharashtra","Karnataka","Tamil Nadu","Delhi","Gujarat","Telangana","UP","West Bengal","Other"]
                        .map(x=>({value:x,label:x}))} />
                    <Input label="PAN" placeholder="AACCA1234Z"
                      value={t.pan} onChange={v=>update(t.id,"pan",v.toUpperCase().slice(0,10))} />
                    <Input label="GST number" placeholder="09AACCA1234Z1Z1"
                      value={t.gst} onChange={v=>update(t.id,"gst",v.toUpperCase().slice(0,15))} />
                  </div>

                  <div style={{ borderTop:`1px dashed ${C.border}`, paddingTop:18, marginTop:4 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14,
                      display:"flex", alignItems:"center", gap:6 }}>
                      👤 Tenant Admin
                      <span style={{ fontSize:11, fontWeight:400, color:C.inkLight }}>— will receive login credentials</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <Input label="Admin full name *" placeholder="Rahul Sharma"
                        value={t.adminName} onChange={v=>update(t.id,"adminName",v)} />
                      <Input label="Admin email *" placeholder="rahul@acmemfg.in" type="email"
                        value={t.adminEmail} onChange={v=>update(t.id,"adminEmail",v)} />
                    </div>
                    <div style={{ background:C.amberFaint, border:`1px solid #FDE68A`, borderRadius:10,
                      padding:"12px 14px", fontSize:12, color:"#92400E", lineHeight:1.6 }}>
                      🔐 BenoSupport will auto-create a login account and send credentials to this email. The tenant admin sets their password on first login.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <button onClick={addTenant} style={{
        width:"100%", padding:"14px", border:`2px dashed ${C.border}`, borderRadius:12,
        background:"transparent", cursor:"pointer", color:C.inkLight, fontSize:14,
        fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        transition:"all .15s", fontFamily:"inherit"
      }}>
        <span style={{ fontSize:20, color:C.teal }}>+</span> Add another company
      </button>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,tenants})); onNext(); }} disabled={!valid}>
          Launch workspace →
        </Btn>
      </div>
    </div>
  );
};

// Done — Super admin
const SuperDone = ({ data, onSwitch }) => (
  <div style={{ textAlign:"center", padding:"40px 0" }}>
    <div style={{ fontSize:64, marginBottom:16 }}>🚀</div>
    <h2 style={{ fontSize:28, fontWeight:800, color:C.ink, marginBottom:8 }}>Workspace is live!</h2>
    <p style={{ fontSize:16, color:C.inkLight, marginBottom:32, maxWidth:460, margin:"0 auto 32px" }}>
      Org Admin and {data.tenants?.length || 1} Tenant Admin(s) have received their credentials. The next step happens inside each tenant.
    </p>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, maxWidth:540, margin:"0 auto 32px" }}>
      {[
        ["🏢", "Organisation", data.org?.name || "—"],
        ["🏬", "Tenants added", data.tenants?.length || 1],
        ["🧩", "Modules active", data.modules?.length || "—"],
      ].map(([ic,l,v])=>(
        <div key={l} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 14px" }}>
          <div style={{ fontSize:28 }}>{ic}</div>
          <div style={{ fontSize:12, color:C.inkLight, marginTop:4 }}>{l}</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.ink }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
      <Btn onClick={()=>onSwitch("tenant")}>Simulate Tenant Admin login →</Btn>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// FLOW B — TENANT ADMIN ONBOARDING (first login)
// ══════════════════════════════════════════════════════════════════════════════

const TenantWelcome = ({ onNext }) => (
  <div>
    <div style={{ background:"linear-gradient(135deg,#E6FAF3,#EFF4FF)", borderRadius:16,
      padding:"32px 36px", marginBottom:28, border:`1px solid ${C.tealMid}` }}>
      <div style={{ fontSize:40, marginBottom:12 }}>👋</div>
      <h2 style={{ fontSize:24, fontWeight:800, color:C.ink, margin:"0 0 8px" }}>Welcome, Tenant Admin</h2>
      <p style={{ fontSize:15, color:C.inkMid, margin:0, lineHeight:1.65 }}>
        You're setting up <strong>your company's HR structure</strong>. You'll define your Lines of Business and the Units under them. Each Unit will have its own admin who configures HR policies.
      </p>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:32 }}>
      {[
        ["LOB","Define divisions like Retail, B2B, Manufacturing","#7C3AED",C.purpleFaint],
        ["Units","Operational teams within each LOB","#2563EB",C.blueFaint],
        ["Admin","Assign a Unit Admin per site/location","#0DB37A",C.tealFaint],
      ].map(([t,d,c,f])=>(
        <div key={t} style={{ background:f, border:`1px solid ${c}30`, borderRadius:12, padding:"16px 16px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:c, marginBottom:4 }}>{t}</div>
          <p style={{ fontSize:12, color:C.inkMid, margin:0, lineHeight:1.5 }}>{d}</p>
        </div>
      ))}
    </div>
    <Btn onClick={onNext}>Start setup →</Btn>
  </div>
);

const TenantLOB = ({ data, setData, onNext, onBack }) => {
  const [lobs, setLobs] = useState(data.lobs || [{ id:1, name:"", head:"", desc:"" }]);

  const add = () => setLobs(l=>[...l, { id:Date.now(), name:"", head:"", desc:"" }]);
  const update = (id,f,v) => setLobs(l=>l.map(x=>x.id===id?{...x,[f]:v}:x));
  const remove = (id) => setLobs(l=>l.filter(x=>x.id!==id));
  const valid = lobs.every(l=>l.name);

  return (
    <div>
      <StepHeader tag="Step 2 of 4" title="Define your Lines of Business"
        sub="LOBs are your top-level business divisions. Every unit and employee will belong to one LOB." />

      {lobs.map((l,i) => (
        <Card key={l.id} style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:C.purpleFaint,
                border:`1px solid #C4B5FD`, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, fontWeight:700, color:C.purple }}>L{i+1}</div>
              <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>Line of Business {i+1}</span>
            </div>
            {lobs.length > 1 && (
              <button onClick={()=>remove(l.id)} style={{ background:"none", border:"none",
                cursor:"pointer", color:C.red, fontSize:16 }}>✕</button>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="LOB name *" placeholder="e.g. Retail Division"
              value={l.name} onChange={v=>update(l.id,"name",v)} />
            <Input label="Head of LOB" placeholder="Name of responsible person"
              value={l.head} onChange={v=>update(l.id,"head",v)} />
          </div>
          <Input label="Description" placeholder="Brief description of this business division"
            value={l.desc} onChange={v=>update(l.id,"desc",v)} />
        </Card>
      ))}

      <button onClick={add} style={{
        width:"100%", padding:"14px", border:`2px dashed ${C.border}`, borderRadius:12,
        background:"transparent", cursor:"pointer", color:C.inkLight, fontSize:14,
        fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit"
      }}>
        <span style={{ fontSize:20, color:C.purple }}>+</span> Add another LOB
      </button>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,lobs})); onNext(); }} disabled={!valid}>
          Set up units →
        </Btn>
      </div>
    </div>
  );
};

const TenantUnits = ({ data, setData, onNext, onBack }) => {
  const [units, setUnits] = useState(data.units || [
    { id:1, name:"", lobId: data.lobs?.[0]?.id || 1, location:"", adminName:"", adminEmail:"", open:true }
  ]);

  const add = () => setUnits(u=>[...u, {
    id:Date.now(), name:"", lobId:data.lobs?.[0]?.id||1, location:"", adminName:"", adminEmail:"", open:true
  }]);
  const update = (id,f,v) => setUnits(u=>u.map(x=>x.id===id?{...x,[f]:v}:x));
  const toggle = (id) => setUnits(u=>u.map(x=>x.id===id?{...x,open:!x.open}:x));
  const remove = (id) => setUnits(u=>u.filter(x=>x.id!==id));
  const valid = units.every(u=>u.name && u.adminEmail);

  return (
    <div>
      <StepHeader tag="Step 3 of 4" title="Create business units"
        sub="Units are operational sites or teams within an LOB. Each unit has its own admin who configures leave, payroll and attendance policies." />

      {units.map((u,i) => (
        <Card key={u.id} style={{ marginBottom:14, padding:0, overflow:"hidden" }}>
          <div onClick={()=>toggle(u.id)} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"16px 24px", cursor:"pointer"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:C.blueFaint,
                border:`1px solid #BFDBFE`, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, color:C.blue }}>U{i+1}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:C.ink }}>{u.name || `Unit ${i+1}`}</div>
                <div style={{ fontSize:12, color:C.inkLight }}>
                  {data.lobs?.find(l=>l.id===u.lobId)?.name || "No LOB"} · {u.location || "No location"}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {u.name && u.adminEmail && <Tag color={C.blue} faint={C.blueFaint}>Ready</Tag>}
              {units.length > 1 && (
                <button onClick={e=>{e.stopPropagation();remove(u.id)}} style={{
                  background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:18 }}>✕</button>
              )}
              <span style={{ color:C.inkLight }}>{u.open?"▲":"▼"}</span>
            </div>
          </div>

          {u.open && (
            <div style={{ padding:"0 24px 24px", borderTop:`1px solid ${C.border}` }}>
              <div style={{ paddingTop:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Input label="Unit name *" placeholder="e.g. North Zone Sales"
                  value={u.name} onChange={v=>update(u.id,"name",v)} />
                <Select label="Parent LOB" value={u.lobId} onChange={v=>update(u.id,"lobId",Number(v))}
                  options={(data.lobs||[]).map(l=>({value:l.id,label:l.name||`LOB ${l.id}`}))} />
                <Input label="Location / City" placeholder="e.g. Delhi"
                  value={u.location} onChange={v=>update(u.id,"location",v)} />
              </div>
              <div style={{ borderTop:`1px dashed ${C.border}`, paddingTop:18, marginTop:4 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14 }}>
                  🔑 Unit Admin <span style={{ fontSize:11, fontWeight:400, color:C.inkLight }}>— manages this site's HR policies</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <Input label="Admin full name *" placeholder="Amit Kumar"
                    value={u.adminName} onChange={v=>update(u.id,"adminName",v)} />
                  <Input label="Admin email *" placeholder="amit@acmemfg.in" type="email"
                    value={u.adminEmail} onChange={v=>update(u.id,"adminEmail",v)} />
                </div>
                <div style={{ background:C.amberFaint, border:`1px solid #FDE68A`, borderRadius:10,
                  padding:"12px 14px", fontSize:12, color:"#92400E" }}>
                  🔐 Login credentials will be emailed to this address. Unit Admin sets up leave policies, payroll structure and working days for this unit.
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}

      <button onClick={add} style={{
        width:"100%", padding:"14px", border:`2px dashed ${C.border}`, borderRadius:12,
        background:"transparent", cursor:"pointer", color:C.inkLight, fontSize:14,
        fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit"
      }}>
        <span style={{ fontSize:20, color:C.blue }}>+</span> Add another unit
      </button>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,units})); onNext(); }} disabled={!valid}>
          Review & finish →
        </Btn>
      </div>
    </div>
  );
};

const TenantDone = ({ data, onSwitch }) => (
  <div style={{ textAlign:"center", padding:"40px 0" }}>
    <div style={{ fontSize:64, marginBottom:16 }}>🏢</div>
    <h2 style={{ fontSize:26, fontWeight:800, color:C.ink, marginBottom:8 }}>Company structure ready!</h2>
    <p style={{ fontSize:15, color:C.inkLight, maxWidth:460, margin:"0 auto 28px" }}>
      {data.lobs?.length || 1} LOB(s) and {data.units?.length || 1} unit(s) created. Unit admins have received their login credentials.
    </p>
    <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
      <Btn onClick={()=>onSwitch("unit")}>Simulate Unit Admin first login →</Btn>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// FLOW C — UNIT ADMIN ONBOARDING
// ══════════════════════════════════════════════════════════════════════════════

const UnitWelcome = ({ onNext }) => (
  <div>
    <div style={{ background:"linear-gradient(135deg,#EFF4FF,#F5F3FF)", borderRadius:16,
      padding:"32px 36px", marginBottom:28, border:`1px solid #C7D7FE` }}>
      <div style={{ fontSize:40, marginBottom:12 }}>👋</div>
      <h2 style={{ fontSize:24, fontWeight:800, color:C.ink, margin:"0 0 8px" }}>Welcome, Unit Admin</h2>
      <p style={{ fontSize:15, color:C.inkMid, margin:0, lineHeight:1.65 }}>
        You're setting up HR policies for your unit. We'll walk you through company info, leave policy, payroll structure and working days — <strong>one question at a time</strong>.
      </p>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:32 }}>
      {[
        ["🏭","Company info","Size, type, timezone"],
        ["🌴","Leave policy","Types & accrual rules"],
        ["💳","Payroll","Components & tax"],
        ["📅","Working days","Shifts & holidays"],
      ].map(([ic,t,d])=>(
        <div key={t} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 14px" }}>
          <div style={{ fontSize:24, marginBottom:6 }}>{ic}</div>
          <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{t}</div>
          <div style={{ fontSize:11, color:C.inkLight, marginTop:2 }}>{d}</div>
        </div>
      ))}
    </div>
    <Btn onClick={onNext}>Start HR setup →</Btn>
  </div>
);

const UnitCompanyInfo = ({ data, setData, onNext, onBack }) => {
  const [info, setInfo] = useState(data.unitInfo || {
    size:"", type:"", timezone:"IST", currency:"INR", probation:"90", noticePeriod:"30"
  });
  const valid = info.size && info.type;
  return (
    <div>
      <StepHeader tag="Step 2 of 5" title="Tell us about your unit"
        sub="This helps configure sensible defaults for your HR policies." />
      <Card>
        <Select label="Company size (employees)" value={info.size} onChange={v=>setInfo(i=>({...i,size:v}))}
          options={["1–10","11–50","51–200","201–500","500+"].map(x=>({value:x,label:x}))} />
        <Select label="Organisation type" value={info.type} onChange={v=>setInfo(i=>({...i,type:v}))}
          options={["Private Limited","Public Limited","LLP","Proprietorship","Government","NGO"]
            .map(x=>({value:x,label:x}))} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Select label="Timezone" value={info.timezone} onChange={v=>setInfo(i=>({...i,timezone:v}))}
            options={["IST","GST","SGT","EST","GMT"].map(x=>({value:x,label:x}))} />
          <Select label="Currency" value={info.currency} onChange={v=>setInfo(i=>({...i,currency:v}))}
            options={["INR","USD","AED","SGD","GBP"].map(x=>({value:x,label:x}))} />
          <Input label="Probation period (days)" placeholder="90"
            value={info.probation} onChange={v=>setInfo(i=>({...i,probation:v}))} />
          <Input label="Notice period (days)" placeholder="30"
            value={info.noticePeriod} onChange={v=>setInfo(i=>({...i,noticePeriod:v}))} />
        </div>
      </Card>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,unitInfo:info})); onNext(); }} disabled={!valid}>Next →</Btn>
      </div>
    </div>
  );
};

const UnitLeavePolicy = ({ data, setData, onNext, onBack }) => {
  const LEAVE_TYPES = [
    { id:"annual",    name:"Annual Leave",     icon:"🌴", days:21, accrual:"monthly", cf:true  },
    { id:"sick",      name:"Sick Leave",        icon:"🏥", days:10, accrual:"monthly", cf:false },
    { id:"casual",    name:"Casual Leave",      icon:"☕", days:8,  accrual:"upfront", cf:false },
    { id:"maternity", name:"Maternity Leave",   icon:"👶", days:182,accrual:"upfront", cf:false },
    { id:"paternity", name:"Paternity Leave",   icon:"👨‍👧", days:15, accrual:"upfront", cf:false },
    { id:"comp",      name:"Compensatory Off",  icon:"💼", days:0,  accrual:"earned",  cf:true  },
  ];
  const [selected, setSelected] = useState(data.leaveTypes || ["annual","sick","casual"]);
  const [config, setConfig] = useState(data.leaveConfig || {});

  const toggle = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  return (
    <div>
      <StepHeader tag="Step 3 of 5" title="Configure leave policy"
        sub="Select the leave types applicable for this unit. You can fine-tune rules later." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        {LEAVE_TYPES.map(lt => {
          const on = selected.includes(lt.id);
          return (
            <div key={lt.id} onClick={()=>toggle(lt.id)} style={{
              border:`1.5px solid ${on ? C.teal : C.border}`, borderRadius:12, padding:"16px 18px",
              cursor:"pointer", background: on ? C.tealFaint : C.surface, transition:"all .15s"
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20 }}>{lt.icon}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>{lt.name}</span>
                </div>
                <div style={{ width:20, height:20, borderRadius:5,
                  border:`2px solid ${on ? C.teal : C.borderMid}`,
                  background: on ? C.teal : C.surface,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {on && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Tag color={C.blue} faint={C.blueFaint}>{lt.days > 0 ? `${lt.days} days` : "Earned"}</Tag>
                <Tag color={C.inkLight} faint={C.surfaceAlt}>{lt.accrual}</Tag>
                {lt.cf && <Tag color={C.purple} faint={C.purpleFaint}>Carry forward</Tag>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,leaveTypes:selected})); onNext(); }}
          disabled={selected.length===0}>Next →</Btn>
      </div>
    </div>
  );
};

const UnitPayroll = ({ data, setData, onNext, onBack }) => {
  const [cfg, setCfg] = useState(data.payrollCfg || {
    basic:"40", hra:"20", special:"20", pf:true, esi:true, pt:true,
    payDay:"last", salaryMode:"monthly"
  });

  const pct = (field) => (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:"block", fontSize:13, fontWeight:500, color:C.inkMid, marginBottom:6 }}>
        {field==="basic"?"Basic salary %":field==="hra"?"HRA %":"Special allowance %"}
      </label>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <input type="range" min={0} max={80} value={cfg[field]}
          onChange={e=>setCfg(c=>({...c,[field]:e.target.value}))}
          style={{ flex:1, accentColor:C.teal }} />
        <div style={{ width:52, textAlign:"center", fontWeight:700, fontSize:16,
          color:C.teal, background:C.tealFaint, padding:"5px 8px", borderRadius:8 }}>
          {cfg[field]}%
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <StepHeader tag="Step 4 of 5" title="Payroll structure"
        sub="Define how salary is split and which statutory deductions apply. You can create advanced rules later." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:18 }}>Salary components</div>
          {pct("basic")} {pct("hra")} {pct("special")}
          <div style={{ background:C.surfaceAlt, borderRadius:10, padding:"12px 14px", fontSize:13, color:C.inkMid }}>
            Remaining {Math.max(0, 100 - Number(cfg.basic) - Number(cfg.hra) - Number(cfg.special))}% = other allowances
          </div>
        </Card>
        <div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14 }}>Statutory deductions</div>
            {[["pf","Provident Fund (PF)","12% employee + 12% employer"],
              ["esi","ESIC","0.75% employee + 3.25% employer"],
              ["pt","Professional Tax","State specific slab"]].map(([k,n,d])=>(
              <div key={k} onClick={()=>setCfg(c=>({...c,[k]:!c[k]}))} style={{
                display:"flex", alignItems:"flex-start", gap:12, marginBottom:14, cursor:"pointer"
              }}>
                <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${cfg[k]?C.teal:C.borderMid}`,
                  background:cfg[k]?C.teal:C.surface, flexShrink:0, marginTop:2,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {cfg[k] && <span style={{ color:"#fff", fontSize:13 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:C.ink }}>{n}</div>
                  <div style={{ fontSize:11, color:C.inkLight }}>{d}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <Select label="Pay day" value={cfg.payDay} onChange={v=>setCfg(c=>({...c,payDay:v}))}
              options={[{value:"last",label:"Last day of month"},{value:"1",label:"1st of next month"},{value:"5",label:"5th of next month"}]} />
            <Select label="Salary mode" value={cfg.salaryMode} onChange={v=>setCfg(c=>({...c,salaryMode:v}))}
              options={[{value:"monthly",label:"Monthly"},{value:"weekly",label:"Weekly"},{value:"biweekly",label:"Bi-weekly"}]} />
          </Card>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,payrollCfg:cfg})); onNext(); }}>Next →</Btn>
      </div>
    </div>
  );
};

const UnitWorkingDays = ({ data, setData, onNext, onBack }) => {
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const [working, setWorking] = useState(data.workingDays || ["Monday","Tuesday","Wednesday","Thursday","Friday"]);
  const [shift, setShift] = useState(data.shift || { start:"09:00", end:"18:00", grace:"15" });
  const [wfh, setWfh] = useState(data.wfh || { enabled:true, daysPerWeek:"2" });

  const toggleDay = (d) =>
    setWorking(p => p.includes(d) ? p.filter(x=>x!==d) : [...p,d]);

  return (
    <div>
      <StepHeader tag="Step 5 of 5" title="Working days & shift"
        sub="This drives attendance marking, overtime calculation, and WFH eligibility." />
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14 }}>Working days</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {DAYS.map(d => (
            <div key={d} onClick={()=>toggleDay(d)} style={{
              padding:"10px 16px", borderRadius:10, cursor:"pointer",
              border:`1.5px solid ${working.includes(d) ? C.teal : C.border}`,
              background: working.includes(d) ? C.tealFaint : C.surface,
              color: working.includes(d) ? C.tealDark : C.inkLight,
              fontWeight: working.includes(d) ? 600 : 400, fontSize:14, transition:"all .15s"
            }}>{d.slice(0,3)}</div>
          ))}
        </div>
        <p style={{ fontSize:12, color:C.inkLight, marginTop:10 }}>
          {working.length} days selected per week
        </p>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14 }}>Shift timings</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Start time" type="time" value={shift.start}
              onChange={v=>setShift(s=>({...s,start:v}))} />
            <Input label="End time" type="time" value={shift.end}
              onChange={v=>setShift(s=>({...s,end:v}))} />
          </div>
          <Input label="Late grace period (minutes)" placeholder="15"
            value={shift.grace} onChange={v=>setShift(s=>({...s,grace:v}))} />
        </Card>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14 }}>WFH policy</div>
          <div onClick={()=>setWfh(w=>({...w,enabled:!w.enabled}))} style={{
            display:"flex", alignItems:"center", gap:12, cursor:"pointer", marginBottom:16
          }}>
            <div style={{
              width:44, height:24, borderRadius:12, background:wfh.enabled?C.teal:C.border,
              position:"relative", transition:"background .2s"
            }}>
              <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff",
                position:"absolute", top:3, left: wfh.enabled ? 23 : 3, transition:"left .2s" }} />
            </div>
            <span style={{ fontSize:14, fontWeight:500, color:C.ink }}>WFH allowed</span>
          </div>
          {wfh.enabled && (
            <Select label="Max WFH days per week" value={wfh.daysPerWeek}
              onChange={v=>setWfh(w=>({...w,daysPerWeek:v}))}
              options={["1","2","3","4","5"].map(x=>({value:x,label:x+" days"}))} />
          )}
        </Card>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={() => { setData(d=>({...d,workingDays:working,shift,wfh})); onNext(); }}>
          Complete setup →
        </Btn>
      </div>
    </div>
  );
};

const UnitDone = () => (
  <div style={{ textAlign:"center", padding:"40px 0" }}>
    <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
    <h2 style={{ fontSize:26, fontWeight:800, color:C.ink, marginBottom:8 }}>Unit is fully configured!</h2>
    <p style={{ fontSize:15, color:C.inkLight, maxWidth:500, margin:"0 auto 28px" }}>
      Leave policies, payroll structure, and working hours are saved. Your unit is now ready to onboard employees.
    </p>
    <div style={{ background:C.tealFaint, border:`1px solid ${C.tealMid}`, borderRadius:16,
      padding:"24px", maxWidth:420, margin:"0 auto 28px", textAlign:"left" }}>
      <div style={{ fontSize:15, fontWeight:700, color:C.tealDark, marginBottom:12 }}>🎉 HRMS is live for your unit</div>
      {["Add employees and assign to departments","Run your first attendance cycle","Process month-end payroll","Approve leave requests"].map(t=>(
        <div key={t} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
          <span style={{ color:C.teal }}>→</span>
          <span style={{ fontSize:14, color:C.inkMid }}>{t}</span>
        </div>
      ))}
    </div>
    <Tag>BenoSupport HRMS — Enterprise Grade</Tag>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ROOT ORCHESTRATOR
// ══════════════════════════════════════════════════════════════════════════════

const FLOW_STEPS = {
  super:  [StepPlan, StepModules, StepBilling, StepOrganisation, StepTenants, SuperDone],
  tenant: [TenantWelcome, TenantLOB, TenantUnits, null, TenantDone],
  unit:   [UnitWelcome, UnitCompanyInfo, UnitLeavePolicy, UnitPayroll, UnitWorkingDays, UnitDone],
};

const FLOW_META = {
  super:  { label:"Super Admin Setup", icon:"⚙️", color:C.teal },
  tenant: { label:"Tenant Admin Setup", icon:"🏢", color:C.blue },
  unit:   { label:"Unit Admin Setup",   icon:"🏭", color:C.purple },
};

export default function Onboard() {
  const [flow, setFlow]   = useState("super");
  const [step, setStep]   = useState(0);
  const [data, setData]   = useState({});

  const switchFlow = (f) => { setFlow(f); setStep(0); setData({}); };

  const steps = FLOW_STEPS[flow];
  const Step  = steps[step];
  const meta  = FLOW_META[flow];

  const onNext = () => setStep(s => Math.min(s+1, steps.length-1));
  const onBack = () => setStep(s => Math.max(s-1, 0));

  return (
    <div style={{ minHeight:"100vh", background:C.surfaceAlt, fontFamily:
      "'DM Sans', 'Nunito', system-ui, sans-serif", padding:"24px 16px" }}>

      {/* Top bar */}
      <div style={{ maxWidth:880, margin:"0 auto 20px", display:"flex",
        alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:C.ink,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>B</span>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.ink }}>BenoSupport</div>
            <div style={{ fontSize:11, color:C.inkLight }}>Enterprise HRMS</div>
          </div>
        </div>
        {/* Flow switcher */}
        <div style={{ display:"flex", gap:6 }}>
          {Object.entries(FLOW_META).map(([f,m])=>(
            <button key={f} onClick={()=>switchFlow(f)} style={{
              padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600,
              border:`1.5px solid ${flow===f ? m.color : C.border}`,
              background: flow===f ? m.color : C.surface,
              color: flow===f ? "#fff" : C.inkLight, cursor:"pointer", transition:"all .15s",
              fontFamily:"inherit"
            }}>{m.icon} {m.label}</button>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div style={{ maxWidth:880, margin:"0 auto", background:C.surface,
        border:`1px solid ${C.border}`, borderRadius:20, padding:"36px 40px",
        boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

        <ProgressBar flow={flow} step={step} />

        {Step && (
          <Step
            data={data}
            setData={setData}
            onNext={onNext}
            onBack={onBack}
            onSwitch={switchFlow}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ maxWidth:880, margin:"16px auto 0", display:"flex",
        justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:C.inkLight }}>🔒 256-bit SSL · SOC 2 Compliant · GDPR Ready</span>
        <span style={{ fontSize:12, color:C.inkLight }}>BenoSupport © 2025</span>
      </div>
    </div>
  );
}
