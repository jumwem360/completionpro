import { useState, useEffect } from "react";

// ── Palette & helpers ──────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "systems",   label: "Systems",   icon: "◈" },
  { id: "punch",     label: "Punch List", icon: "◉" },
  { id: "checklist", label: "Commissioning", icon: "◎" },
  { id: "handover",  label: "Handover",  icon: "◇" },
  { id: "reports",   label: "Reports",   icon: "▤" },
];

const CAT_COLOR = { A: "#ef4444", B: "#f59e0b", C: "#22c55e" };
const STATUS_COLOR = {
  "Not Started": "#64748b", "In Progress": "#3b82f6",
  "Complete": "#22c55e", "On Hold": "#f59e0b", "Closed": "#8b5cf6",
};

const SYSTEMS_INIT = [
  { id: 1, no: "SYS-001", name: "HP Flare System",        discipline: "Process",       status: "In Progress", completion: 65, subsystems: 4, mcDate: "2025-08-15" },
  { id: 2, no: "SYS-002", name: "Utility Air System",     discipline: "Mechanical",    status: "Complete",    completion: 100, subsystems: 3, mcDate: "2025-07-30" },
  { id: 3, no: "SYS-003", name: "Fire & Gas Detection",   discipline: "Instrument",    status: "In Progress", completion: 42, subsystems: 6, mcDate: "2025-09-01" },
  { id: 4, no: "SYS-004", name: "Main Power Distribution",discipline: "Electrical",    status: "Not Started", completion: 8,  subsystems: 5, mcDate: "2025-09-20" },
  { id: 5, no: "SYS-005", name: "ESD / Safety Shutdown",  discipline: "Instrument",    status: "In Progress", completion: 55, subsystems: 4, mcDate: "2025-08-28" },
  { id: 6, no: "SYS-006", name: "HVAC Systems",           discipline: "Mechanical",    status: "On Hold",     completion: 30, subsystems: 3, mcDate: "2025-10-05" },
];

const PUNCH_INIT = [
  { id: 1, no: "PL-001", system: "SYS-001", description: "PSV-101 relief valve certification missing",         category: "A", discipline: "Process",    raisedBy: "D. Ehinmowo", date: "2025-07-01", status: "Open",   target: "2025-07-20" },
  { id: 2, no: "PL-002", system: "SYS-002", description: "Instrument air dryer bypass valve not labelled",     category: "B", discipline: "Mechanical", raisedBy: "J. Adeyemi",  date: "2025-07-03", status: "Closed", target: "2025-07-25" },
  { id: 3, no: "PL-003", system: "SYS-003", description: "FGD-205 gas detector response time test overdue",    category: "A", discipline: "Instrument", raisedBy: "D. Ehinmowo", date: "2025-07-05", status: "Open",   target: "2025-07-18" },
  { id: 4, no: "PL-004", system: "SYS-004", description: "MCC panel door hinge damaged",                       category: "C", discipline: "Electrical", raisedBy: "K. Okafor",   date: "2025-07-06", status: "Open",   target: "2025-08-01" },
  { id: 5, no: "PL-005", system: "SYS-005", description: "ESD logic functional test not signed off",           category: "A", discipline: "Instrument", raisedBy: "D. Ehinmowo", date: "2025-07-08", status: "Open",   target: "2025-07-22" },
  { id: 6, no: "PL-006", system: "SYS-001", description: "Flare tip inspection report not submitted",          category: "B", discipline: "Process",    raisedBy: "J. Adeyemi",  date: "2025-07-09", status: "Open",   target: "2025-07-28" },
];

const CHECKLIST_INIT = [
  { id: 1, system: "SYS-001", item: "P&ID walkdown completed and signed off",                  discipline: "Process",    status: "Complete",    date: "2025-07-01" },
  { id: 2, system: "SYS-001", item: "All instruments installed and tagged per index",           discipline: "Instrument", status: "Complete",    date: "2025-07-03" },
  { id: 3, system: "SYS-001", item: "Control valve positioners calibrated",                     discipline: "Instrument", status: "In Progress", date: "" },
  { id: 4, system: "SYS-001", item: "PSV tested and certified",                                 discipline: "Process",    status: "Not Started", date: "" },
  { id: 5, system: "SYS-003", item: "Fire & Gas detection loop checks completed",               discipline: "Instrument", status: "In Progress", date: "" },
  { id: 6, system: "SYS-003", item: "ESD system logic test completed",                          discipline: "Instrument", status: "Not Started", date: "" },
  { id: 7, system: "SYS-002", item: "Motor rotation checks completed",                          discipline: "Mechanical", status: "Complete",    date: "2025-07-05" },
  { id: 8, system: "SYS-002", item: "Hydrostatic test records signed off",                      discipline: "Process",    status: "Complete",    date: "2025-07-06" },
];

const HANDOVER_INIT = [
  { id: 1, system: "SYS-002", name: "Utility Air System Handover", mcDate: "2025-07-30", status: "Closed",      docNo: "HOD-002", preparedBy: "D. Ehinmowo" },
  { id: 2, system: "SYS-001", name: "HP Flare System Handover",    mcDate: "2025-08-15", status: "In Progress", docNo: "HOD-001", preparedBy: "D. Ehinmowo" },
  { id: 3, system: "SYS-005", name: "ESD Shutdown System Handover",mcDate: "2025-08-28", status: "Not Started", docNo: "HOD-005", preparedBy: "" },
];

// ── Reusable UI ────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}55`,
    borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700,
    fontFamily: "'DM Mono', monospace", letterSpacing: 1,
  }}>{label}</span>
);

const ProgressBar = ({ value, color = "#3b82f6" }) => (
  <div style={{ background: "#1e293b", borderRadius: 99, height: 6, width: "100%", overflow: "hidden" }}>
    <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99,
      transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
  </div>
);

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: "linear-gradient(135deg, #0f172a 60%, #1e293b)",
    border: `1px solid ${color}33`, borderRadius: 12, padding: "20px 24px",
    display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 140,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: 12, right: 16, fontSize: 28, opacity: 0.12 }}>{icon}</div>
    <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono',monospace", letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 36, fontFamily: "'Playfair Display',serif", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#475569" }}>{sub}</div>}
  </div>
);

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 16,
        padding: 32, width: 520, maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b",
            fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono',monospace",
      letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155",
    borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 13,
    fontFamily: "'DM Mono',monospace", outline: "none", boxSizing: "border-box", ...props.style }} />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} style={{ width: "100%", background: "#1e293b",
    border: "1px solid #334155", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0",
    fontSize: 13, fontFamily: "'DM Mono',monospace", outline: "none" }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Btn = ({ onClick, children, variant = "primary" }) => (
  <button onClick={onClick} style={{
    background: variant === "primary" ? "linear-gradient(135deg,#1d4ed8,#2563eb)" : "#1e293b",
    border: variant === "primary" ? "none" : "1px solid #334155",
    color: "#e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 13,
    fontFamily: "'DM Mono',monospace", cursor: "pointer", fontWeight: 600, letterSpacing: 0.5,
  }}>{children}</button>
);

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ systems, punch, checklist, handover }) {
  const totalSystems = systems.length;
  const complete = systems.filter(s => s.status === "Complete").length;
  const openPunch = punch.filter(p => p.status === "Open").length;
  const catA = punch.filter(p => p.category === "A" && p.status === "Open").length;
  const avgCompletion = Math.round(systems.reduce((a, s) => a + s.completion, 0) / systems.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace",
          letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Overview</div>
        <div style={{ fontSize: 28, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>
          Project Completion Status
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Systems" value={totalSystems} sub="registered" color="#3b82f6" icon="◈" />
        <StatCard label="MC Complete" value={complete} sub={`of ${totalSystems} systems`} color="#22c55e" icon="◎" />
        <StatCard label="Open Punch" value={openPunch} sub={`Cat A: ${catA} critical`} color="#ef4444" icon="◉" />
        <StatCard label="Avg Completion" value={`${avgCompletion}%`} sub="across all systems" color="#f59e0b" icon="⬡" />
      </div>

      {/* Systems progress */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e293b",
          fontSize: 13, fontFamily: "'DM Mono',monospace", color: "#94a3b8", letterSpacing: 1 }}>
          SYSTEMS COMPLETION PROGRESS
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {systems.map(s => (
            <div key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace" }}>{s.no}</span>
                  <span style={{ fontSize: 13, color: "#e2e8f0" }}>{s.name}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Badge label={s.status} color={STATUS_COLOR[s.status]} />
                  <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'DM Mono',monospace", minWidth: 36, textAlign: "right" }}>{s.completion}%</span>
                </div>
              </div>
              <ProgressBar value={s.completion}
                color={s.completion === 100 ? "#22c55e" : s.completion > 50 ? "#3b82f6" : "#f59e0b"} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent punch items */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e293b",
          fontSize: 13, fontFamily: "'DM Mono',monospace", color: "#94a3b8", letterSpacing: 1 }}>
          CRITICAL PUNCH ITEMS (CAT A)
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {punch.filter(p => p.category === "A" && p.status === "Open").map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "10px 12px", background: "#1e293b",
              borderRadius: 8, borderLeft: "3px solid #ef4444" }}>
              <div>
                <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "'DM Mono',monospace" }}>{p.no}</div>
                <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 2 }}>{p.description}</div>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono',monospace", textAlign: "right" }}>
                <div>{p.system}</div>
                <div>Due: {p.target}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SYSTEMS ────────────────────────────────────────────────────────────────
function Systems({ systems, setSystems }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ no: "", name: "", discipline: "Process", status: "Not Started", completion: 0, subsystems: 1, mcDate: "" });

  const disciplines = ["Process", "Mechanical", "Electrical", "Instrument", "Civil", "HVAC"];
  const statuses = ["Not Started", "In Progress", "Complete", "On Hold"];

  const add = () => {
    setSystems(prev => [...prev, { ...form, id: Date.now(), completion: Number(form.completion), subsystems: Number(form.subsystems) }]);
    setShowModal(false);
    setForm({ no: "", name: "", discipline: "Process", status: "Not Started", completion: 0, subsystems: 1, mcDate: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Register</div>
          <div style={{ fontSize: 24, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>Systems & Subsystems</div>
        </div>
        <Btn onClick={() => setShowModal(true)}>+ Add System</Btn>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["System No.", "System Name", "Discipline", "Subsystems", "MC Date", "Completion", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11,
                  color: "#475569", fontFamily: "'DM Mono',monospace", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {systems.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #0f172a", background: i % 2 ? "#0a1628" : "transparent" }}>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#3b82f6", fontFamily: "'DM Mono',monospace" }}>{s.no}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#e2e8f0" }}>{s.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{s.discipline}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono',monospace", textAlign: "center" }}>{s.subsystems}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{s.mcDate}</td>
                <td style={{ padding: "12px 16px", minWidth: 120 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ProgressBar value={s.completion}
                      color={s.completion === 100 ? "#22c55e" : s.completion > 50 ? "#3b82f6" : "#f59e0b"} />
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono',monospace", minWidth: 32 }}>{s.completion}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}><Badge label={s.status} color={STATUS_COLOR[s.status]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Add New System" onClose={() => setShowModal(false)}>
          <Field label="System No."><Input value={form.no} onChange={e => setForm({ ...form, no: e.target.value })} placeholder="SYS-007" /></Field>
          <Field label="System Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cooling Water System" /></Field>
          <Field label="Discipline"><Select value={form.discipline} onChange={e => setForm({ ...form, discipline: e.target.value })} options={disciplines} /></Field>
          <Field label="Status"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={statuses} /></Field>
          <Field label="No. of Subsystems"><Input type="number" value={form.subsystems} onChange={e => setForm({ ...form, subsystems: e.target.value })} /></Field>
          <Field label="MC Target Date"><Input type="date" value={form.mcDate} onChange={e => setForm({ ...form, mcDate: e.target.value })} /></Field>
          <Field label="Current Completion %"><Input type="number" min={0} max={100} value={form.completion} onChange={e => setForm({ ...form, completion: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn onClick={add}>Save System</Btn>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PUNCH LIST ─────────────────────────────────────────────────────────────
function PunchList({ punch, setPunch, systems }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ system: "SYS-001", description: "", category: "A", discipline: "Process", raisedBy: "", target: "" });

  const add = () => {
    const no = `PL-${String(punch.length + 1).padStart(3, "0")}`;
    setPunch(prev => [...prev, { ...form, id: Date.now(), no, date: new Date().toISOString().split("T")[0], status: "Open" }]);
    setShowModal(false);
    setForm({ system: "SYS-001", description: "", category: "A", discipline: "Process", raisedBy: "", target: "" });
  };

  const close = (id) => setPunch(prev => prev.map(p => p.id === id ? { ...p, status: "Closed" } : p));

  const filtered = filter === "All" ? punch : punch.filter(p => p.category === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Tracking</div>
          <div style={{ fontSize: 24, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>Punch List</div>
        </div>
        <Btn onClick={() => setShowModal(true)}>+ Raise Item</Btn>
      </div>

      {/* Filter + summary */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {["All", "A", "B", "C"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? (f === "All" ? "#1d4ed8" : CAT_COLOR[f] + "33") : "#1e293b",
            border: `1px solid ${filter === f ? (f === "All" ? "#3b82f6" : CAT_COLOR[f]) : "#334155"}`,
            color: filter === f ? (f === "All" ? "#93c5fd" : CAT_COLOR[f]) : "#64748b",
            borderRadius: 8, padding: "6px 16px", fontSize: 12,
            fontFamily: "'DM Mono',monospace", cursor: "pointer", fontWeight: 700,
          }}>
            {f === "All" ? `All (${punch.length})` : `Cat ${f} (${punch.filter(p => p.category === f).length})`}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>
          Open: {punch.filter(p => p.status === "Open").length} / {punch.length}
        </span>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["No.", "System", "Description", "Cat.", "Discipline", "Raised By", "Target", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11,
                  color: "#475569", fontFamily: "'DM Mono',monospace", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #0f172a", background: i % 2 ? "#0a1628" : "transparent" }}>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#3b82f6", fontFamily: "'DM Mono',monospace" }}>{p.no}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{p.system}</td>
                <td style={{ padding: "10px 14px", fontSize: 13, color: "#e2e8f0", maxWidth: 220 }}>{p.description}</td>
                <td style={{ padding: "10px 14px" }}><Badge label={`Cat ${p.category}`} color={CAT_COLOR[p.category]} /></td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8" }}>{p.discipline}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8" }}>{p.raisedBy}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{p.target}</td>
                <td style={{ padding: "10px 14px" }}>
                  <Badge label={p.status} color={p.status === "Closed" ? "#22c55e" : "#ef4444"} />
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {p.status === "Open" && (
                    <button onClick={() => close(p.id)} style={{
                      background: "#14532d33", border: "1px solid #22c55e55", color: "#22c55e",
                      borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                      fontFamily: "'DM Mono',monospace",
                    }}>Close</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Raise Punch Item" onClose={() => setShowModal(false)}>
          <Field label="System">
            <Select value={form.system} onChange={e => setForm({ ...form, system: e.target.value })}
              options={systems.map(s => s.no)} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155",
                borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 13,
                fontFamily: "'DM Mono',monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </Field>
          <Field label="Category"><Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={["A", "B", "C"]} /></Field>
          <Field label="Discipline"><Select value={form.discipline} onChange={e => setForm({ ...form, discipline: e.target.value })} options={["Process", "Mechanical", "Electrical", "Instrument", "Civil", "HVAC"]} /></Field>
          <Field label="Raised By"><Input value={form.raisedBy} onChange={e => setForm({ ...form, raisedBy: e.target.value })} placeholder="Your name" /></Field>
          <Field label="Target Close Date"><Input type="date" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn onClick={add}>Raise Item</Btn>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── COMMISSIONING CHECKLIST ────────────────────────────────────────────────
function Checklist({ checklist, setChecklist, systems }) {
  const [filterSys, setFilterSys] = useState("All");

  const toggle = (id, status) => {
    const next = status === "Complete" ? "Not Started" : status === "In Progress" ? "Complete" : "In Progress";
    setChecklist(prev => prev.map(c => c.id === id ? {
      ...c, status: next, date: next === "Complete" ? new Date().toISOString().split("T")[0] : ""
    } : c));
  };

  const filtered = filterSys === "All" ? checklist : checklist.filter(c => c.system === filterSys);
  const complete = filtered.filter(c => c.status === "Complete").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Checklist</div>
        <div style={{ fontSize: 24, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>Commissioning Checklist</div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {["All", ...systems.map(s => s.no)].map(f => (
          <button key={f} onClick={() => setFilterSys(f)} style={{
            background: filterSys === f ? "#1e3a5f" : "#1e293b",
            border: `1px solid ${filterSys === f ? "#3b82f6" : "#334155"}`,
            color: filterSys === f ? "#93c5fd" : "#64748b",
            borderRadius: 8, padding: "6px 14px", fontSize: 11,
            fontFamily: "'DM Mono',monospace", cursor: "pointer",
          }}>{f}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>
          {complete}/{filtered.length} complete
        </span>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["System", "Checklist Item", "Discipline", "Status", "Date Completed", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11,
                  color: "#475569", fontFamily: "'DM Mono',monospace", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #0f172a", background: i % 2 ? "#0a1628" : "transparent" }}>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#3b82f6", fontFamily: "'DM Mono',monospace" }}>{c.system}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#e2e8f0" }}>{c.item}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{c.discipline}</td>
                <td style={{ padding: "12px 16px" }}><Badge label={c.status} color={STATUS_COLOR[c.status]} /></td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{c.date || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => toggle(c.id, c.status)} style={{
                    background: "#1e293b", border: "1px solid #334155", color: "#94a3b8",
                    borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                    fontFamily: "'DM Mono',monospace",
                  }}>
                    {c.status === "Complete" ? "Reopen" : c.status === "In Progress" ? "Complete" : "Start"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── HANDOVER ───────────────────────────────────────────────────────────────
function Handover({ handover, setHandover, systems }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ system: "SYS-001", name: "", mcDate: "", preparedBy: "" });

  const add = () => {
    const docNo = `HOD-${String(handover.length + 1).padStart(3, "0")}`;
    setHandover(prev => [...prev, { ...form, id: Date.now(), docNo, status: "Not Started" }]);
    setShowModal(false);
    setForm({ system: "SYS-001", name: "", mcDate: "", preparedBy: "" });
  };

  const advance = (id) => {
    const flow = ["Not Started", "In Progress", "Closed"];
    setHandover(prev => prev.map(h => h.id === id ? {
      ...h, status: flow[Math.min(flow.indexOf(h.status) + 1, 2)]
    } : h));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Dossiers</div>
          <div style={{ fontSize: 24, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>Handover Register</div>
        </div>
        <Btn onClick={() => setShowModal(true)}>+ New Handover</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {handover.map(h => (
          <div key={h.id} style={{ background: "#0f172a", border: "1px solid #1e293b",
            borderRadius: 12, padding: "20px 24px", display: "flex",
            justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, background: "#1e3a5f",
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: "#3b82f6" }}>◇</div>
              <div>
                <div style={{ fontSize: 15, color: "#e2e8f0", fontWeight: 600 }}>{h.name}</div>
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>{h.docNo}</span>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>{h.system}</span>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>MC: {h.mcDate}</span>
                  {h.preparedBy && <span style={{ fontSize: 12, color: "#64748b" }}>By: {h.preparedBy}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Badge label={h.status} color={STATUS_COLOR[h.status]} />
              {h.status !== "Closed" && (
                <button onClick={() => advance(h.id)} style={{
                  background: "#1d4ed833", border: "1px solid #3b82f655", color: "#93c5fd",
                  borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace",
                }}>Advance →</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="New Handover Dossier" onClose={() => setShowModal(false)}>
          <Field label="System">
            <Select value={form.system} onChange={e => setForm({ ...form, system: e.target.value })} options={systems.map(s => s.no)} />
          </Field>
          <Field label="Handover Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. HP Flare System Handover" /></Field>
          <Field label="MC Target Date"><Input type="date" value={form.mcDate} onChange={e => setForm({ ...form, mcDate: e.target.value })} /></Field>
          <Field label="Prepared By"><Input value={form.preparedBy} onChange={e => setForm({ ...form, preparedBy: e.target.value })} placeholder="Engineer name" /></Field>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Btn onClick={add}>Create Dossier</Btn>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── REPORTS ────────────────────────────────────────────────────────────────
function Reports({ systems, punch, checklist, handover }) {
  const totalCompletion = Math.round(systems.reduce((a, s) => a + s.completion, 0) / systems.length);
  const punchByDiscipline = ["Process", "Mechanical", "Electrical", "Instrument", "Civil", "HVAC"].map(d => ({
    d, count: punch.filter(p => p.discipline === d && p.status === "Open").length
  })).filter(x => x.count > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono',monospace", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Analytics</div>
        <div style={{ fontSize: 24, fontFamily: "'Playfair Display',serif", color: "#e2e8f0" }}>Project Reports</div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Overall Completion" value={`${totalCompletion}%`} sub="project average" color="#3b82f6" icon="⬡" />
        <StatCard label="Systems Complete" value={systems.filter(s => s.status === "Complete").length} sub={`of ${systems.length}`} color="#22c55e" icon="◈" />
        <StatCard label="Handovers Closed" value={handover.filter(h => h.status === "Closed").length} sub={`of ${handover.length}`} color="#8b5cf6" icon="◇" />
        <StatCard label="Checklist Done" value={checklist.filter(c => c.status === "Complete").length} sub={`of ${checklist.length} items`} color="#f59e0b" icon="◎" />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Punch summary */}
        <div style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "#94a3b8", letterSpacing: 1, marginBottom: 16 }}>PUNCH SUMMARY</div>
          {["A", "B", "C"].map(cat => {
            const open = punch.filter(p => p.category === cat && p.status === "Open").length;
            const total = punch.filter(p => p.category === cat).length;
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: CAT_COLOR[cat], fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>Category {cat}</span>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>{open} open / {total} total</span>
                </div>
                <ProgressBar value={total > 0 ? ((total - open) / total) * 100 : 0} color={CAT_COLOR[cat]} />
              </div>
            );
          })}
        </div>

        {/* Open punch by discipline */}
        <div style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "#94a3b8", letterSpacing: 1, marginBottom: 16 }}>OPEN PUNCH BY DISCIPLINE</div>
          {punchByDiscipline.length === 0
            ? <div style={{ color: "#475569", fontSize: 13 }}>No open items</div>
            : punchByDiscipline.map(({ d, count }) => (
              <div key={d} style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ fontSize: 13, color: "#e2e8f0" }}>{d}</span>
                <span style={{ fontSize: 13, color: "#f59e0b", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{count}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Systems status breakdown */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: "#94a3b8", letterSpacing: 1, marginBottom: 16 }}>SYSTEMS STATUS BREAKDOWN</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {Object.entries(STATUS_COLOR).map(([status, color]) => {
            const count = systems.filter(s => s.status === status).length;
            return count > 0 ? (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 8,
                background: color + "11", border: `1px solid ${color}33`,
                borderRadius: 8, padding: "10px 16px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }}></span>
                <span style={{ fontSize: 13, color: "#e2e8f0" }}>{status}</span>
                <span style={{ fontSize: 18, fontFamily: "'Playfair Display',serif", color, fontWeight: 700 }}>{count}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("dashboard");
  const [systems, setSystems] = useState(SYSTEMS_INIT);
  const [punch, setPunch] = useState(PUNCH_INIT);
  const [checklist, setChecklist] = useState(CHECKLIST_INIT);
  const [handover, setHandover] = useState(HANDOVER_INIT);

  const pages = {
    dashboard: <Dashboard systems={systems} punch={punch} checklist={checklist} handover={handover} />,
    systems:   <Systems systems={systems} setSystems={setSystems} />,
    punch:     <PunchList punch={punch} setPunch={setPunch} systems={systems} />,
    checklist: <Checklist checklist={checklist} setChecklist={setChecklist} systems={systems} />,
    handover:  <Handover handover={handover} setHandover={setHandover} systems={systems} />,
    reports:   <Reports systems={systems} punch={punch} checklist={checklist} handover={handover} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", background: "#060d1a", fontFamily: "'DM Mono', monospace", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: "#0a1628", borderRight: "1px solid #1e293b",
          display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Logo */}
          <div style={{ padding: "24px 20px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "white", fontWeight: 900 }}>CP</div>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 700, letterSpacing: 1 }}>COMPLETION</div>
                <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 2 }}>PRO</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 10, color: "#334155", letterSpacing: 1 }}>SYSTEM COMPLETION MGR</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 0" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setActive(n.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "11px 20px", background: active === n.id ? "#1e3a5f" : "none",
                border: "none", borderLeft: active === n.id ? "3px solid #3b82f6" : "3px solid transparent",
                color: active === n.id ? "#93c5fd" : "#475569", cursor: "pointer",
                fontSize: 12, letterSpacing: 1, transition: "all 0.15s",
                textAlign: "left",
              }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom info */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
            <div style={{ fontSize: 10, color: "#1e3a5f", letterSpacing: 1 }}>v1.0.0 • CompletionPro</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Top bar */}
          <div style={{ height: 56, background: "#0a1628", borderBottom: "1px solid #1e293b",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: "#475569", letterSpacing: 2, textTransform: "uppercase" }}>
              {NAV.find(n => n.id === active)?.label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 11, color: "#334155", fontFamily: "'DM Mono',monospace" }}>
                {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "white", fontWeight: 700 }}>DE</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
            {pages[active]}
          </div>
        </div>
      </div>
    </>
  );
}
