import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════
//  SCHEMA + STATIC DATA
// ════════════════════════════════════════════════════════
const OLIST_SCHEMA = {
  orders: {
    columns: [
      { name: "order_id", type: "VARCHAR(32)", pk: true, nullable: false },
      { name: "customer_id", type: "VARCHAR(32)", pk: false, nullable: false, fk: { table: "customers", col: "customer_id" } },
      { name: "order_status", type: "VARCHAR(20)", pk: false, nullable: false },
      { name: "order_purchase_timestamp", type: "TIMESTAMP", pk: false, nullable: false },
      { name: "order_approved_at", type: "TIMESTAMP", pk: false, nullable: true },
      { name: "order_delivered_carrier_date", type: "TIMESTAMP", pk: false, nullable: true },
      { name: "order_delivered_customer_date", type: "TIMESTAMP", pk: false, nullable: true },
      { name: "order_estimated_delivery_date", type: "TIMESTAMP", pk: false, nullable: false },
    ],
    rowCount: 99441, sampleNulls: { order_approved_at: 160, order_delivered_carrier_date: 1783, order_delivered_customer_date: 2965 },
    category: "core", color: "#3b82f6",
  },
  customers: {
    columns: [
      { name: "customer_id", type: "VARCHAR(32)", pk: true, nullable: false },
      { name: "customer_unique_id", type: "VARCHAR(32)", pk: false, nullable: false },
      { name: "customer_zip_code_prefix", type: "INT", pk: false, nullable: false },
      { name: "customer_city", type: "VARCHAR(100)", pk: false, nullable: false },
      { name: "customer_state", type: "CHAR(2)", pk: false, nullable: false },
    ],
    rowCount: 99441, sampleNulls: {}, category: "entity", color: "#10b981",
  },
  order_items: {
    columns: [
      { name: "order_id", type: "VARCHAR(32)", pk: true, nullable: false, fk: { table: "orders", col: "order_id" } },
      { name: "order_item_id", type: "INT", pk: true, nullable: false },
      { name: "product_id", type: "VARCHAR(32)", pk: false, nullable: false, fk: { table: "products", col: "product_id" } },
      { name: "seller_id", type: "VARCHAR(32)", pk: false, nullable: false, fk: { table: "sellers", col: "seller_id" } },
      { name: "shipping_limit_date", type: "TIMESTAMP", pk: false, nullable: false },
      { name: "price", type: "FLOAT", pk: false, nullable: false },
      { name: "freight_value", type: "FLOAT", pk: false, nullable: false },
    ],
    rowCount: 112650, sampleNulls: {}, category: "transaction", color: "#f59e0b",
  },
  products: {
    columns: [
      { name: "product_id", type: "VARCHAR(32)", pk: true, nullable: false },
      { name: "product_category_name", type: "VARCHAR(100)", pk: false, nullable: true },
      { name: "product_name_lenght", type: "INT", pk: false, nullable: true },
      { name: "product_description_lenght", type: "INT", pk: false, nullable: true },
      { name: "product_photos_qty", type: "INT", pk: false, nullable: true },
      { name: "product_weight_g", type: "INT", pk: false, nullable: true },
      { name: "product_length_cm", type: "INT", pk: false, nullable: true },
      { name: "product_height_cm", type: "INT", pk: false, nullable: true },
      { name: "product_width_cm", type: "INT", pk: false, nullable: true },
    ],
    rowCount: 32951, sampleNulls: { product_category_name: 610, product_name_lenght: 610, product_description_lenght: 610, product_photos_qty: 610, product_weight_g: 2, product_length_cm: 2, product_height_cm: 2, product_width_cm: 2 },
    category: "entity", color: "#8b5cf6",
  },
  sellers: {
    columns: [
      { name: "seller_id", type: "VARCHAR(32)", pk: true, nullable: false },
      { name: "seller_zip_code_prefix", type: "INT", pk: false, nullable: false },
      { name: "seller_city", type: "VARCHAR(100)", pk: false, nullable: false },
      { name: "seller_state", type: "CHAR(2)", pk: false, nullable: false },
    ],
    rowCount: 3095, sampleNulls: {}, category: "entity", color: "#ec4899",
  },
  order_reviews: {
    columns: [
      { name: "review_id", type: "VARCHAR(32)", pk: true, nullable: false },
      { name: "order_id", type: "VARCHAR(32)", pk: false, nullable: false, fk: { table: "orders", col: "order_id" } },
      { name: "review_score", type: "INT", pk: false, nullable: false },
      { name: "review_comment_title", type: "TEXT", pk: false, nullable: true },
      { name: "review_comment_message", type: "TEXT", pk: false, nullable: true },
      { name: "review_creation_date", type: "TIMESTAMP", pk: false, nullable: false },
      { name: "review_answer_timestamp", type: "TIMESTAMP", pk: false, nullable: false },
    ],
    rowCount: 99224, sampleNulls: { review_comment_title: 87656, review_comment_message: 58247 },
    category: "feedback", color: "#f97316",
  },
  order_payments: {
    columns: [
      { name: "order_id", type: "VARCHAR(32)", pk: false, nullable: false, fk: { table: "orders", col: "order_id" } },
      { name: "payment_sequential", type: "INT", pk: false, nullable: false },
      { name: "payment_type", type: "VARCHAR(30)", pk: false, nullable: false },
      { name: "payment_installments", type: "INT", pk: false, nullable: false },
      { name: "payment_value", type: "FLOAT", pk: false, nullable: false },
    ],
    rowCount: 103886, sampleNulls: {}, category: "transaction", color: "#14b8a6",
  },
  geolocation: {
    columns: [
      { name: "geolocation_zip_code_prefix", type: "INT", pk: false, nullable: false },
      { name: "geolocation_lat", type: "FLOAT", pk: false, nullable: false },
      { name: "geolocation_lng", type: "FLOAT", pk: false, nullable: false },
      { name: "geolocation_city", type: "VARCHAR(100)", pk: false, nullable: false },
      { name: "geolocation_state", type: "CHAR(2)", pk: false, nullable: false },
    ],
    rowCount: 1000163, sampleNulls: {}, category: "geo", color: "#06b6d4",
  },
  product_category_name_translation: {
    columns: [
      { name: "product_category_name", type: "VARCHAR(100)", pk: true, nullable: false },
      { name: "product_category_name_english", type: "VARCHAR(100)", pk: false, nullable: false },
    ],
    rowCount: 71, sampleNulls: {}, category: "lookup", color: "#a78bfa",
  },
};

const RELATIONSHIPS = [
  { from: "orders", fromCol: "customer_id", to: "customers", toCol: "customer_id", type: "N:1" },
  { from: "order_items", fromCol: "order_id", to: "orders", toCol: "order_id", type: "N:1" },
  { from: "order_items", fromCol: "product_id", to: "products", toCol: "product_id", type: "N:1" },
  { from: "order_items", fromCol: "seller_id", to: "sellers", toCol: "seller_id", type: "N:1" },
  { from: "order_reviews", fromCol: "order_id", to: "orders", toCol: "order_id", type: "N:1" },
  { from: "order_payments", fromCol: "order_id", to: "orders", toCol: "order_id", type: "N:1" },
  { from: "products", fromCol: "product_category_name", to: "product_category_name_translation", toCol: "product_category_name", type: "N:1" },
];

// Pre-built SQL templates
const SQL_TEMPLATES = [
  { label: "Revenue by Month", icon: "💰", query: `SELECT\n  DATE_TRUNC('month', o.order_purchase_timestamp) AS month,\n  SUM(p.payment_value) AS total_revenue,\n  COUNT(DISTINCT o.order_id) AS order_count\nFROM orders o\nJOIN order_payments p ON o.order_id = p.order_id\nWHERE o.order_status = 'delivered'\nGROUP BY 1\nORDER BY 1;` },
  { label: "Top Sellers", icon: "🏆", query: `SELECT\n  s.seller_id,\n  s.seller_state,\n  COUNT(DISTINCT oi.order_id) AS orders,\n  ROUND(SUM(oi.price)::numeric, 2) AS revenue\nFROM sellers s\nJOIN order_items oi ON s.seller_id = oi.seller_id\nGROUP BY 1, 2\nORDER BY revenue DESC\nLIMIT 20;` },
  { label: "Avg Delivery Delay", icon: "🚚", query: `SELECT\n  c.customer_state,\n  AVG(\n    EXTRACT(EPOCH FROM (\n      o.order_delivered_customer_date - o.order_estimated_delivery_date\n    ))/86400\n  ) AS avg_delay_days\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nWHERE o.order_delivered_customer_date IS NOT NULL\nGROUP BY 1\nORDER BY avg_delay_days DESC;` },
  { label: "Review Score Dist.", icon: "⭐", query: `SELECT\n  review_score,\n  COUNT(*) AS count,\n  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct\nFROM order_reviews\nGROUP BY 1\nORDER BY 1;` },
  { label: "Payment Methods", icon: "💳", query: `SELECT\n  payment_type,\n  COUNT(*) AS transactions,\n  ROUND(AVG(payment_value)::numeric, 2) AS avg_value,\n  ROUND(SUM(payment_value)::numeric, 2) AS total_value\nFROM order_payments\nGROUP BY 1\nORDER BY transactions DESC;` },
  { label: "Null Audit", icon: "🔍", query: `SELECT\n  'products' AS tbl,\n  SUM(CASE WHEN product_category_name IS NULL THEN 1 ELSE 0 END) AS null_category,\n  SUM(CASE WHEN product_weight_g IS NULL THEN 1 ELSE 0 END) AS null_weight\nFROM products\nUNION ALL\nSELECT\n  'orders',\n  SUM(CASE WHEN order_approved_at IS NULL THEN 1 ELSE 0 END),\n  SUM(CASE WHEN order_delivered_customer_date IS NULL THEN 1 ELSE 0 END)\nFROM orders;` },
];

// Anomaly rules
const ANOMALIES = [
  { table: "order_reviews", col: "review_comment_title", severity: "high", msg: "88.3% of review titles are NULL — comment collection is largely absent.", type: "null_spike" },
  { table: "order_reviews", col: "review_comment_message", severity: "medium", msg: "58.7% of review messages are NULL — text reviews are optional/skipped.", type: "null_spike" },
  { table: "products", col: "product_category_name", severity: "medium", msg: "1.85% of products have no category — affects catalog browsing & reporting.", type: "missing_ref" },
  { table: "orders", col: "order_delivered_customer_date", severity: "medium", msg: "2.98% of orders have no delivery date — likely cancelled or in-transit.", type: "incomplete_flow" },
  { table: "orders", col: "order_approved_at", severity: "low", msg: "0.16% of orders never received an approval timestamp — edge case.", type: "incomplete_flow" },
  { table: "geolocation", col: "geolocation_zip_code_prefix", severity: "info", msg: "1M+ rows — zip codes are duplicated (multiple lat/lng per zip). Consider dedup.", type: "cardinality" },
];

const schemaString = JSON.stringify(
  Object.entries(OLIST_SCHEMA).map(([name, t]) => ({
    table: name, rows: t.rowCount,
    columns: t.columns.map(c => ({ name: c.name, type: c.type, pk: c.pk, fk: c.fk?.table, nullable: c.nullable })),
    nullCounts: t.sampleNulls,
  })), null, 2
);

// ════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════
function computeMetrics(tableName, table) {
  const totalCells = table.columns.length * table.rowCount;
  const nullCells = Object.values(table.sampleNulls).reduce((a, b) => a + b, 0);
  const completeness = ((1 - nullCells / totalCells) * 100).toFixed(1);
  const nullableCount = table.columns.filter(c => c.nullable).length;
  const fkCount = table.columns.filter(c => c.fk).length;
  const typeGroups = {};
  table.columns.forEach(c => { const b = c.type.replace(/\(.*\)/, "").trim(); typeGroups[b] = (typeGroups[b] || 0) + 1; });
  const hasTimestamp = table.columns.some(c => c.type === "TIMESTAMP");
  return { completeness, nullableCount, fkCount, typeGroups, hasTimestamp, nullCells, totalCells };
}

const TYPE_COLORS = { VARCHAR: "#6ee7b7", CHAR: "#6ee7b7", TEXT: "#a5f3fc", INT: "#fde68a", FLOAT: "#fde68a", TIMESTAMP: "#c4b5fd", DATE: "#c4b5fd" };
function typeColor(t) { return TYPE_COLORS[t.replace(/\(.*\)/, "").trim()] || "#e2e8f0"; }

async function askClaude(system, user) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content: user }] }),
    });
    const data = await res.json();
    return data.content?.map(b => b.text || "").join("\n") || "No response.";
  } catch { return "API error — please try again."; }
}

// ════════════════════════════════════════════════════════
//  SMALL COMPONENTS
// ════════════════════════════════════════════════════════
function Pill({ label, color, small }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: small ? "1px 6px" : "2px 8px", fontSize: small ? 10 : 11, fontWeight: 700, fontFamily: "monospace" }}>{label}</span>;
}

function Bar({ pct, color, height = 6 }) {
  return <div style={{ background: "#1e293b", borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, pct)}%`, background: color, height: "100%", borderRadius: 99, transition: "width 0.7s cubic-bezier(.4,0,.2,1)" }} />
  </div>;
}

function Spinner({ color = "#60a5fa" }) {
  return <div style={{ width: 14, height: 14, border: `2px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />;
}

function AIBox({ title, content, loading, accent = "#6ee7b7", actions }) {
  const [copied, setCopied] = useState(false);
  function copy() { navigator.clipboard?.writeText(content || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div style={{ background: "#080f1e", border: `1px solid ${accent}28`, borderRadius: 12, padding: "16px 18px", marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 7px ${accent}` }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>{title}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {actions}
          {content && <button onClick={copy} style={{ background: "#1e293b", border: "1px solid #334155", color: copied ? "#34d399" : "#94a3b8", borderRadius: 6, padding: "2px 10px", fontSize: 11, cursor: "pointer" }}>{copied ? "✓ Copied" : "Copy"}</button>}
        </div>
      </div>
      {loading
        ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Spinner color={accent} /><span style={{ color: "#475569", fontSize: 13 }}>Claude is analyzing…</span></div>
        : <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: content?.startsWith("SELECT") ? "monospace" : "inherit" }}>{content}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TABS CONFIG
// ════════════════════════════════════════════════════════
const TABS = [
  { id: "overview",   icon: "📊", label: "Overview" },
  { id: "schema",     icon: "🗂",  label: "Schema" },
  { id: "er",         icon: "🔗", label: "ER Diagram" },
  { id: "quality",    icon: "✅", label: "Quality" },
  { id: "anomalies",  icon: "⚠️",  label: "Anomalies" },
  { id: "sql",        icon: "⚡", label: "SQL Lab" },
  { id: "lineage",    icon: "🌊", label: "Lineage" },
  { id: "dictionary", icon: "📖", label: "Dictionary" },
  { id: "scorecard",  icon: "🏅", label: "Scorecard" },
  { id: "chat",       icon: "💬", label: "Ask AI" },
];

// ════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("overview");
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [aiCtx, setAiCtx] = useState({});
  const [aiDict, setAiDict] = useState({});
  const [aiOverview, setAiOverview] = useState("");
  const [aiSQL, setAiSQL] = useState("");
  const [loadingCtx, setLoadingCtx] = useState({});
  const [loadingDict, setLoadingDict] = useState({});
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingSQL, setLoadingSQL] = useState(false);
  const [sqlInput, setSqlInput] = useState(SQL_TEMPLATES[0].query);
  const [sqlResult, setSqlResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sqlExplain, setSqlExplain] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [lineageSel, setLineageSel] = useState("orders");
  const [lineageResult, setLineageResult] = useState(null);
  const [loadingLineage, setLoadingLineage] = useState(false);
  const [highlightTable, setHighlightTable] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const totalRows = Object.values(OLIST_SCHEMA).reduce((a, t) => a + t.rowCount, 0);
  const avgCompleteness = (Object.entries(OLIST_SCHEMA).reduce((a, [n, t]) => a + parseFloat(computeMetrics(n, t).completeness), 0) / Object.keys(OLIST_SCHEMA).length).toFixed(1);

  // ── AI loaders ──
  async function loadOverview() {
    if (aiOverview) return;
    setLoadingOverview(true);
    const r = await askClaude(
      "You are a senior data architect. Provide a crisp 5-sentence executive summary covering: business domain, data flow, key analytics capabilities, top data quality risk, and one actionable recommendation.",
      `Olist Brazilian E-Commerce DB:\n${schemaString}`
    );
    setAiOverview(r); setLoadingOverview(false);
  }

  async function loadCtx(name) {
    if (aiCtx[name]) return;
    setLoadingCtx(p => ({ ...p, [name]: true }));
    const t = OLIST_SCHEMA[name], m = computeMetrics(name, t);
    const r = await askClaude(
      "You are a data analyst. For this table: 1) Business purpose (2 sentences). 2) Critical relationships. 3) Data quality findings. 4) Top 2 analytics use-cases. Use plain text, no markdown bullets.",
      `Table: ${name}\nRows: ${t.rowCount}\nCols: ${JSON.stringify(t.columns)}\nNulls: ${JSON.stringify(t.sampleNulls)}\nCompleteness: ${m.completeness}%`
    );
    setAiCtx(p => ({ ...p, [name]: r })); setLoadingCtx(p => ({ ...p, [name]: false }));
  }

  async function loadDict(name) {
    if (aiDict[name]) return;
    setLoadingDict(p => ({ ...p, [name]: true }));
    const t = OLIST_SCHEMA[name];
    const r = await askClaude(
      "Write a concise data dictionary. For EACH column output exactly: column_name: one-sentence description. No markdown, no numbering, plain text only.",
      `Table: ${name}\nColumns: ${JSON.stringify(t.columns.map(c => ({ name: c.name, type: c.type, pk: c.pk, nullable: c.nullable })))}`
    );
    setAiDict(p => ({ ...p, [name]: r })); setLoadingDict(p => ({ ...p, [name]: false }));
  }

  async function explainSQL() {
    if (!sqlInput.trim()) return;
    setLoadingExplain(true); setSqlExplain("");
    const r = await askClaude(
      "You are a SQL expert. Explain this query in plain English: what it does, which tables it touches, what it returns, and any potential performance concerns. Be concise (5-7 sentences).",
      `Query:\n${sqlInput}`
    );
    setSqlExplain(r); setLoadingExplain(false);
  }

  async function generateSQL(prompt) {
    setLoadingSQL(true); setSqlExplain("");
    const r = await askClaude(
      "You are a SQL expert for the Olist Brazilian E-Commerce PostgreSQL database. Return ONLY the SQL query, no explanation, no markdown fences.",
      `Schema:\n${schemaString}\n\nWrite a SQL query for: ${prompt}`
    );
    setSqlInput(r.replace(/```sql|```/g, "").trim()); setLoadingSQL(false);
  }

  async function sendChat(msg) {
    if (!msg.trim()) return;
    const newH = [...chatHistory, { role: "user", content: msg }];
    setChatHistory(newH); setChatInput(""); setChatLoading(true);
    const history = newH.map(m => ({ role: m.role, content: m.content }));
    const r = await askClaude(
      `You are an expert data engineer for the Olist E-Commerce database. Answer questions with specific table/column references. Be concise and technical.\n\nSchema:\n${schemaString}`,
      history.map(h => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n")
    );
    setChatHistory(prev => [...prev, { role: "assistant", content: r }]); setChatLoading(false);
  }

  async function computeLineage(tableName) {
    setLoadingLineage(true);
    const upstream = RELATIONSHIPS.filter(r => r.from === tableName).map(r => r.to);
    const downstream = RELATIONSHIPS.filter(r => r.to === tableName).map(r => r.from);
    const r = await askClaude(
      "You are a data lineage expert. Given a table's upstream and downstream dependencies, describe in 3 sentences: the data flow, what this table enables, and what breaks if this table has quality issues.",
      `Table: ${tableName}\nUpstream (depends on): ${upstream.join(", ") || "none"}\nDownstream (feeds): ${downstream.join(", ") || "none"}`
    );
    setLineageResult({ tableName, upstream, downstream, analysis: r }); setLoadingLineage(false);
  }

  // ── Scorecard ──
  function buildScorecard() {
    return Object.entries(OLIST_SCHEMA).map(([name, table]) => {
      const m = computeMetrics(name, table);
      const completeness = parseFloat(m.completeness);
      const fkScore = m.fkCount > 0 ? 100 : 80;
      const hasTimestamp = m.hasTimestamp ? 100 : 60;
      const nullColRatio = ((table.columns.length - m.nullableCount) / table.columns.length) * 100;
      const overall = ((completeness + fkScore + hasTimestamp + nullColRatio) / 4).toFixed(1);
      const grade = overall >= 95 ? "A+" : overall >= 90 ? "A" : overall >= 80 ? "B" : overall >= 70 ? "C" : "D";
      return { name, completeness, fkScore, hasTimestamp, nullColRatio: nullColRatio.toFixed(1), overall, grade };
    }).sort((a, b) => b.overall - a.overall);
  }

  const scorecard = buildScorecard();

  // ── Filtered tables ──
  const filteredTables = Object.entries(OLIST_SCHEMA).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  // ════════════════════════════════════════════════════════
  //  STYLES
  // ════════════════════════════════════════════════════════
  const BG = "#050b18";
  const SURFACE = "#0c1628";
  const BORDER = "#1a2744";
  const TEXT = "#e2e8f0";
  const MUTED = "#64748b";

  const s = {
    root: { background: BG, minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: TEXT },
    header: { background: "linear-gradient(180deg,#0c1a36 0%,#050b18 100%)", borderBottom: `1px solid ${BORDER}`, padding: "18px 28px 0" },
    tabBar: { display: "flex", gap: 1, marginTop: 16, overflowX: "auto" },
    tab: active => ({
      padding: "9px 15px", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
      background: active ? BG : "transparent", color: active ? "#60a5fa" : MUTED,
      border: "none", borderBottom: `2px solid ${active ? "#3b82f6" : "transparent"}`,
      borderRadius: "8px 8px 0 0", cursor: "pointer", transition: "all 0.15s", gap: 5, display: "flex", alignItems: "center",
    }),
    body: { padding: "24px 28px" },
    card: (accent) => ({
      background: SURFACE, border: `1px solid ${accent ? accent + "33" : BORDER}`,
      borderRadius: 12, padding: "15px 18px",
    }),
    h2: { fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 },
    tableWrap: { background: SURFACE, borderRadius: 12, overflow: "hidden", border: `1px solid ${BORDER}` },
    th: { padding: "9px 13px", fontSize: 10.5, color: MUTED, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: `1px solid ${BORDER}`, background: "#080f1e", whiteSpace: "nowrap" },
    td: { padding: "8px 13px", fontSize: 12.5, borderBottom: `1px solid ${BORDER}` },
  };

  // ════════════════════════════════════════════════════════
  //  ER DIAGRAM (interactive)
  // ════════════════════════════════════════════════════════
  const TP = {
    orders: { x: 360, y: 170 }, customers: { x: 90, y: 80 }, order_items: { x: 360, y: 330 },
    products: { x: 610, y: 270 }, sellers: { x: 630, y: 410 }, order_reviews: { x: 90, y: 280 },
    order_payments: { x: 90, y: 420 }, geolocation: { x: 610, y: 100 },
    product_category_name_translation: { x: 830, y: 270 },
  };

  function ERDiagram({ highlight }) {
    const [hover, setHover] = useState(null);
    return (
      <div style={{ overflowX: "auto" }}>
        <svg width={1030} height={540}>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#a78bfa66" />
            </marker>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {RELATIONSHIPS.map((r, i) => {
            const f = TP[r.from], t = TP[r.to];
            const active = hover === r.from || hover === r.to || highlight === r.from || highlight === r.to;
            return <line key={i} x1={f.x + 75} y1={f.y + 22} x2={t.x + 75} y2={t.y + 22}
              stroke={active ? "#a78bfa" : "#a78bfa33"} strokeWidth={active ? 2 : 1.2}
              markerEnd="url(#arr)" strokeDasharray={active ? "none" : "4 3"} />;
          })}
          {Object.entries(TP).map(([name, pos]) => {
            const table = OLIST_SCHEMA[name];
            const m = computeMetrics(name, table);
            const cc = parseFloat(m.completeness) >= 98 ? "#34d399" : parseFloat(m.completeness) >= 90 ? "#fbbf24" : "#f87171";
            const active = hover === name || highlight === name;
            return (
              <g key={name} transform={`translate(${pos.x},${pos.y})`}
                onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }} filter={active ? "url(#glow)" : ""}>
                <rect width={150} height={44} rx={9}
                  fill={active ? "#1a2f50" : "#0c1628"}
                  stroke={active ? table.color : BORDER} strokeWidth={active ? 2 : 1} />
                <rect width={150} height={5} rx="8 8 0 0" fill={cc + "bb"} />
                <circle cx={138} cy={22} r={4} fill={table.color} opacity={0.9} />
                <text x={74} y={21} textAnchor="middle" fill={TEXT} fontSize={11} fontFamily="monospace" fontWeight="bold">{name}</text>
                <text x={74} y={35} textAnchor="middle" fill={MUTED} fontSize={9} fontFamily="monospace">
                  {table.rowCount.toLocaleString()} rows · {m.completeness}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div style={s.root}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#050b18}
        ::-webkit-scrollbar-thumb{background:#1a2744;border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fade 0.25s ease forwards}
        textarea,input{color:#e2e8f0;background:#0c1628}
        textarea:focus,input:focus{outline:none}
        button:hover{opacity:0.85}
      `}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: TEXT }}>
              🧠 AI Database Intelligence Agent
              <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399", background: "#34d39922", border: "1px solid #34d39944", borderRadius: 20, padding: "2px 10px", marginLeft: 12 }}>v2.0</span>
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
              Olist Brazilian E-Commerce · {Object.keys(OLIST_SCHEMA).length} tables · {totalRows.toLocaleString()} rows · {RELATIONSHIPS.length} FK relationships · Avg completeness {avgCompleteness}%
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[["🗄️", "Tables", Object.keys(OLIST_SCHEMA).length, "#60a5fa"],
              ["📈", "Rows", (totalRows / 1e6).toFixed(2) + "M", "#34d399"],
              ["🔗", "FKs", RELATIONSHIPS.length, "#a78bfa"],
              ["⚠️", "Issues", ANOMALIES.length, "#f87171"]].map(([icon, label, val, color]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color }}>{icon} {val}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.tabBar}>
          {TABS.map(t => (
            <button key={t.id} style={s.tab(tab === t.id)}
              onClick={() => { setTab(t.id); if (t.id === "overview" && !aiOverview) loadOverview(); }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.body}>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {tab === "overview" && (
          <div className="fade">
            {/* Metric strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 22 }}>
              {[
                ["Total Rows", totalRows.toLocaleString(), "#60a5fa", "All tables combined"],
                ["Tables", Object.keys(OLIST_SCHEMA).length, "#34d399", "9 interlinked"],
                ["Relationships", RELATIONSHIPS.length, "#a78bfa", "FK links"],
                ["Avg Completeness", avgCompleteness + "%", parseFloat(avgCompleteness) >= 90 ? "#34d399" : "#fbbf24", "All tables"],
                ["Total Anomalies", ANOMALIES.length, "#f87171", "Detected issues"],
                ["Geo Records", "1M+", "#06b6d4", "geolocation table"],
              ].map(([label, val, color, sub]) => (
                <div key={label} style={{ ...s.card(color), textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Table grid */}
            <div style={s.h2}>All Tables</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10, marginBottom: 20 }}>
              {Object.entries(OLIST_SCHEMA).map(([name, table]) => {
                const m = computeMetrics(name, table);
                const cc = parseFloat(m.completeness) >= 98 ? "#34d399" : parseFloat(m.completeness) >= 90 ? "#fbbf24" : "#f87171";
                return (
                  <div key={name} onClick={() => { setSel(name); setTab("schema"); loadCtx(name); }}
                    style={{ ...s.card(), cursor: "pointer", borderLeft: `3px solid ${table.color}`, transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{name}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{table.rowCount.toLocaleString()} rows · {table.columns.length} cols</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cc }}>{m.completeness}%</span>
                    </div>
                    <div style={{ marginTop: 8 }}><Bar pct={parseFloat(m.completeness)} color={cc} /></div>
                    <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                      <Pill label={table.category} color={table.color} small />
                      {m.fkCount > 0 && <Pill label={`FK×${m.fkCount}`} color="#a78bfa" small />}
                      {m.hasTimestamp && <Pill label="TS" color="#c4b5fd" small />}
                    </div>
                  </div>
                );
              })}
            </div>

            <AIBox title="AI Executive Summary" content={aiOverview} loading={loadingOverview} accent="#6ee7b7" />
          </div>
        )}

        {/* ══════════════ SCHEMA ══════════════ */}
        {tab === "schema" && (
          <div className="fade" style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 210, flexShrink: 0 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Filter tables…"
                style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, marginBottom: 8 }} />
              {filteredTables.map(([name, table]) => (
                <div key={name} onClick={() => { setSel(name); loadCtx(name); loadDict(name); }}
                  style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4, display: "flex", alignItems: "center", gap: 8,
                    background: sel === name ? "#1a2f50" : SURFACE, border: `1px solid ${sel === name ? "#3b82f6" : BORDER}`,
                    fontFamily: "monospace", fontSize: 12, color: sel === name ? TEXT : MUTED, transition: "all 0.13s" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: table.color, flexShrink: 0 }} />
                  {name}
                  {aiDict[name] && <span style={{ marginLeft: "auto", color: "#34d399", fontSize: 10 }}>✓</span>}
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }}>
              {!sel ? <div style={{ color: MUTED, padding: 40, textAlign: "center", fontSize: 14 }}>← Select a table</div> : (() => {
                const table = OLIST_SCHEMA[sel];
                const m = computeMetrics(sel, table);
                const cc = parseFloat(m.completeness) >= 98 ? "#34d399" : parseFloat(m.completeness) >= 90 ? "#fbbf24" : "#f87171";
                const tableAnomalies = ANOMALIES.filter(a => a.table === sel);
                return (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: table.color }} />
                      <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "monospace" }}>{sel}</span>
                      <Pill label={table.category} color={table.color} />
                      {tableAnomalies.length > 0 && <Pill label={`⚠️ ${tableAnomalies.length} issue${tableAnomalies.length > 1 ? "s" : ""}`} color="#f87171" />}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      {[["Rows", table.rowCount.toLocaleString(), "#60a5fa"],
                        ["Completeness", m.completeness + "%", cc],
                        ["Null Cells", m.nullCells.toLocaleString(), "#f87171"],
                        ["FK Columns", m.fkCount, "#a78bfa"],
                        ["Has Timestamps", m.hasTimestamp ? "Yes" : "No", m.hasTimestamp ? "#34d399" : "#f87171"]
                      ].map(([l, v, c]) => (
                        <div key={l} style={{ ...s.card(c), flex: 1, minWidth: 100 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                          <div style={{ fontSize: 11, color: MUTED }}>{l}</div>
                        </div>
                      ))}
                    </div>

                    <div style={s.tableWrap}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>
                          {["Column", "Type", "Constraint", "Nulls", "FK Reference"].map(h => <th key={h} style={s.th}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {table.columns.map(col => {
                            const nullCount = table.sampleNulls[col.name];
                            const nullPct = nullCount ? (nullCount / table.rowCount * 100).toFixed(1) : null;
                            return (
                              <tr key={col.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
                                <td style={{ ...s.td, fontFamily: "monospace", color: col.pk ? "#fbbf24" : col.fk ? "#a78bfa" : TEXT }}>
                                  {col.pk && "🔑 "}{col.fk && "🔗 "}{col.name}
                                </td>
                                <td style={s.td}><Pill label={col.type} color={typeColor(col.type)} /></td>
                                <td style={s.td}><span style={{ fontSize: 11, color: col.nullable ? "#f87171" : "#34d399", fontWeight: 700 }}>{col.nullable ? "NULLABLE" : "NOT NULL"}</span></td>
                                <td style={s.td}>
                                  {nullCount
                                    ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <Bar pct={parseFloat(nullPct)} color="#f87171" />
                                        <span style={{ fontSize: 11, color: "#f87171", whiteSpace: "nowrap" }}>{nullCount.toLocaleString()} ({nullPct}%)</span>
                                      </div>
                                    : <span style={{ color: "#34d399", fontSize: 11 }}>0</span>}
                                </td>
                                <td style={{ ...s.td, fontSize: 11, color: MUTED }}>{col.fk ? `→ ${col.fk.table}.${col.fk.col}` : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {tableAnomalies.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        {tableAnomalies.map((a, i) => (
                          <div key={i} style={{ background: "#1a0a0a", border: "1px solid #f8717133", borderRadius: 8, padding: "10px 14px", marginBottom: 6, fontSize: 12 }}>
                            <span style={{ color: "#f87171", fontWeight: 700 }}>⚠ {a.col}</span>
                            <span style={{ color: "#94a3b8", marginLeft: 10 }}>{a.msg}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <AIBox title="AI Business Context" content={aiCtx[sel]} loading={loadingCtx[sel]} accent="#6ee7b7" />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ══════════════ ER DIAGRAM ══════════════ */}
        {tab === "er" && (
          <div className="fade">
            <div style={s.h2}>Interactive Entity Relationship Diagram</div>
            <div style={{ ...s.card(), marginBottom: 16, overflow: "hidden" }}>
              <ERDiagram highlight={highlightTable} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {Object.keys(OLIST_SCHEMA).map(name => (
                <button key={name} onClick={() => setHighlightTable(highlightTable === name ? null : name)}
                  style={{ background: highlightTable === name ? OLIST_SCHEMA[name].color + "33" : SURFACE, border: `1px solid ${highlightTable === name ? OLIST_SCHEMA[name].color : BORDER}`, color: highlightTable === name ? TEXT : MUTED, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>
                  {name}
                </button>
              ))}
            </div>
            <div style={s.tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["From", "Column", "→", "To", "Column", "Type"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {RELATIONSHIPS.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ ...s.td, fontFamily: "monospace", color: "#60a5fa" }}>{r.from}</td>
                      <td style={{ ...s.td, fontFamily: "monospace" }}>{r.fromCol}</td>
                      <td style={{ ...s.td, color: "#a78bfa" }}>→</td>
                      <td style={{ ...s.td, fontFamily: "monospace", color: "#60a5fa" }}>{r.to}</td>
                      <td style={{ ...s.td, fontFamily: "monospace" }}>{r.toCol}</td>
                      <td style={s.td}><Pill label={r.type} color="#a78bfa" small /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════ QUALITY ══════════════ */}
        {tab === "quality" && (
          <div className="fade">
            <div style={s.h2}>Data Quality Dashboard</div>
            <div style={s.tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Table", "Rows", "Completeness", "Null Cells", "Nullable Cols", "Timestamps", "FKs", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {Object.entries(OLIST_SCHEMA).map(([name, table]) => {
                    const m = computeMetrics(name, table);
                    const cc = parseFloat(m.completeness) >= 98 ? "#34d399" : parseFloat(m.completeness) >= 90 ? "#fbbf24" : "#f87171";
                    const status = parseFloat(m.completeness) >= 98 ? "✅ Clean" : parseFloat(m.completeness) >= 90 ? "⚠️ Minor" : "❌ Issues";
                    return (
                      <tr key={name} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ ...s.td, fontFamily: "monospace" }}><span style={{ color: OLIST_SCHEMA[name].color }}>●</span> {name}</td>
                        <td style={{ ...s.td, color: MUTED }}>{table.rowCount.toLocaleString()}</td>
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 70 }}><Bar pct={parseFloat(m.completeness)} color={cc} /></div>
                            <span style={{ color: cc, fontWeight: 700, fontSize: 12 }}>{m.completeness}%</span>
                          </div>
                        </td>
                        <td style={{ ...s.td, color: m.nullCells > 0 ? "#f87171" : "#34d399" }}>{m.nullCells.toLocaleString()}</td>
                        <td style={{ ...s.td, color: MUTED }}>{m.nullableCount}</td>
                        <td style={{ ...s.td, color: m.hasTimestamp ? "#a78bfa" : MUTED }}>{m.hasTimestamp ? "✓ Yes" : "✗ No"}</td>
                        <td style={{ ...s.td, color: "#60a5fa" }}>{m.fkCount}</td>
                        <td style={s.td}><span style={{ fontSize: 11 }}>{status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Null heatmap */}
              <div>
                <div style={s.h2}>Null Distribution</div>
                {Object.entries(OLIST_SCHEMA).filter(([, t]) => Object.keys(t.sampleNulls).length > 0).map(([name, table]) => (
                  <div key={name} style={{ ...s.card(), marginBottom: 8 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, marginBottom: 8, color: OLIST_SCHEMA[name].color }}>{name}</div>
                    {Object.entries(table.sampleNulls).map(([col, count]) => (
                      <div key={col} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 10, color: MUTED, width: 220, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{col}</span>
                        <div style={{ flex: 1 }}><Bar pct={count / table.rowCount * 100} color="#f87171" /></div>
                        <span style={{ fontSize: 10, color: "#f87171", width: 80, textAlign: "right" }}>{(count / table.rowCount * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {/* Type distribution */}
              <div>
                <div style={s.h2}>Column Type Distribution</div>
                {(() => {
                  const all = {};
                  Object.values(OLIST_SCHEMA).forEach(t => t.columns.forEach(c => { const b = c.type.replace(/\(.*\)/, "").trim(); all[b] = (all[b] || 0) + 1; }));
                  const total = Object.values(all).reduce((a, b) => a + b, 0);
                  return (
                    <div style={s.card()}>
                      {Object.entries(all).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                        <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: typeColor(type), width: 100, flexShrink: 0 }}>{type}</span>
                          <div style={{ flex: 1 }}><Bar pct={count / total * 100} color={typeColor(type)} height={8} /></div>
                          <span style={{ fontSize: 11, color: MUTED, width: 60, textAlign: "right" }}>{count} ({(count / total * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ ANOMALIES ══════════════ */}
        {tab === "anomalies" && (
          <div className="fade">
            <div style={s.h2}>Detected Anomalies & Issues</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 10, marginBottom: 20 }}>
              {[["high","#ef4444"], ["medium","#f97316"], ["low","#fbbf24"], ["info","#60a5fa"]].map(([sev, color]) => {
                const count = ANOMALIES.filter(a => a.severity === sev).length;
                return (
                  <div key={sev} style={{ ...s.card(color), display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color }}>{count}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color, textTransform: "capitalize" }}>{sev} Severity</div>
                      <div style={{ fontSize: 11, color: MUTED }}>anomalies detected</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {ANOMALIES.map((a, i) => {
              const sevColor = { high: "#ef4444", medium: "#f97316", low: "#fbbf24", info: "#60a5fa" }[a.severity];
              const typeLabel = { null_spike: "Null Spike", missing_ref: "Missing Reference", incomplete_flow: "Incomplete Flow", cardinality: "Cardinality Issue" }[a.type];
              return (
                <div key={i} style={{ background: sevColor + "0a", border: `1px solid ${sevColor}33`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, display: "flex", gap: 14 }}>
                  <div style={{ flexShrink: 0, textAlign: "center" }}>
                    <div style={{ fontSize: 18 }}>{a.severity === "high" ? "🔴" : a.severity === "medium" ? "🟠" : a.severity === "low" ? "🟡" : "🔵"}</div>
                    <div style={{ fontSize: 10, color: sevColor, fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>{a.severity}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#60a5fa" }}>{a.table}</span>
                      <span style={{ color: MUTED }}>›</span>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#a78bfa" }}>{a.col}</span>
                      <Pill label={typeLabel} color={sevColor} small />
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{a.msg}</div>
                  </div>
                  <button onClick={() => { setSel(a.table); setTab("schema"); loadCtx(a.table); }}
                    style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 8, padding: "4px 12px", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
                    Inspect →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════ SQL LAB ══════════════ */}
        {tab === "sql" && (
          <div className="fade">
            <div style={{ display: "flex", gap: 16 }}>
              {/* Left: templates */}
              <div style={{ width: 190, flexShrink: 0 }}>
                <div style={s.h2}>Templates</div>
                {SQL_TEMPLATES.map(t => (
                  <div key={t.label} onClick={() => { setSqlInput(t.query); setSqlExplain(""); }}
                    style={{ ...s.card(), marginBottom: 6, cursor: "pointer", padding: "10px 13px" }}>
                    <div style={{ fontSize: 16 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginTop: 3 }}>{t.label}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, s: s.h2 }}>
                  <div style={s.h2}>AI Generate</div>
                  <input id="sqlprompt" placeholder="e.g. avg order value by state"
                    style={{ width: "100%", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 10px", fontSize: 11, marginBottom: 6 }} />
                  <button onClick={() => { const v = document.getElementById("sqlprompt").value; if (v) generateSQL(v); }}
                    style={{ width: "100%", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {loadingSQL ? "Generating…" : "✨ Generate SQL"}
                  </button>
                </div>
              </div>

              {/* Right: editor */}
              <div style={{ flex: 1 }}>
                <div style={s.h2}>SQL Editor</div>
                <textarea value={sqlInput} onChange={e => setSqlInput(e.target.value)}
                  rows={12} style={{ width: "100%", background: "#080f1e", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px", fontSize: 13, fontFamily: "monospace", lineHeight: 1.7, resize: "vertical", color: "#e2e8f0" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={explainSQL}
                    style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    🔍 Explain Query
                  </button>
                  <button onClick={() => { navigator.clipboard?.writeText(sqlInput); }}
                    style={{ background: SURFACE, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 16px", fontSize: 12, cursor: "pointer" }}>
                    📋 Copy SQL
                  </button>
                </div>
                <AIBox title="Query Explanation" content={sqlExplain} loading={loadingExplain} accent="#6366f1" />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ LINEAGE ══════════════ */}
        {tab === "lineage" && (
          <div className="fade">
            <div style={s.h2}>Data Lineage Explorer</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.keys(OLIST_SCHEMA).map(name => (
                <button key={name} onClick={() => { setLineageSel(name); computeLineage(name); }}
                  style={{ background: lineageSel === name ? OLIST_SCHEMA[name].color + "33" : SURFACE, border: `1px solid ${lineageSel === name ? OLIST_SCHEMA[name].color : BORDER}`, color: lineageSel === name ? TEXT : MUTED, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
                  {name}
                </button>
              ))}
            </div>

            {lineageSel && (() => {
              const upstream = RELATIONSHIPS.filter(r => r.from === lineageSel).map(r => r.to);
              const downstream = RELATIONSHIPS.filter(r => r.to === lineageSel).map(r => r.from);
              const tableColor = OLIST_SCHEMA[lineageSel].color;
              return (
                <div>
                  {/* Visual lineage flow */}
                  <div style={{ ...s.card(), display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", padding: 24, marginBottom: 14 }}>
                    {/* Upstream */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      <div style={{ fontSize: 10, color: MUTED, textAlign: "center", marginBottom: 4, letterSpacing: 1 }}>UPSTREAM</div>
                      {upstream.length > 0 ? upstream.map(t => (
                        <div key={t} style={{ background: OLIST_SCHEMA[t].color + "22", border: `1px solid ${OLIST_SCHEMA[t].color}55`, borderRadius: 8, padding: "7px 14px", fontFamily: "monospace", fontSize: 12, color: OLIST_SCHEMA[t].color }}>{t}</div>
                      )) : <div style={{ color: MUTED, fontSize: 12 }}>None</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 20px" }}>
                      <div style={{ fontSize: 20, color: "#475569" }}>→</div>
                    </div>
                    {/* Central */}
                    <div style={{ background: tableColor + "22", border: `2px solid ${tableColor}`, borderRadius: 12, padding: "14px 24px", fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: tableColor, textAlign: "center" }}>
                      {lineageSel}
                      <div style={{ fontSize: 11, color: MUTED, fontWeight: 400, marginTop: 4 }}>{OLIST_SCHEMA[lineageSel].rowCount.toLocaleString()} rows</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "0 20px" }}>
                      <div style={{ fontSize: 20, color: "#475569" }}>→</div>
                    </div>
                    {/* Downstream */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, letterSpacing: 1 }}>DOWNSTREAM</div>
                      {downstream.length > 0 ? downstream.map(t => (
                        <div key={t} style={{ background: OLIST_SCHEMA[t].color + "22", border: `1px solid ${OLIST_SCHEMA[t].color}55`, borderRadius: 8, padding: "7px 14px", fontFamily: "monospace", fontSize: 12, color: OLIST_SCHEMA[t].color }}>{t}</div>
                      )) : <div style={{ color: MUTED, fontSize: 12 }}>None</div>}
                    </div>
                  </div>

                  <AIBox title="AI Lineage Analysis" content={lineageResult?.tableName === lineageSel ? lineageResult.analysis : ""} loading={loadingLineage} accent="#06b6d4" />
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════ DICTIONARY ══════════════ */}
        {tab === "dictionary" && (
          <div className="fade" style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 200, flexShrink: 0 }}>
              <div style={s.h2}>Tables</div>
              {Object.keys(OLIST_SCHEMA).map(name => (
                <div key={name} onClick={() => { setSel(name); loadDict(name); loadCtx(name); }}
                  style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: sel === name ? "#1a2f50" : SURFACE, border: `1px solid ${sel === name ? "#3b82f6" : BORDER}`, fontFamily: "monospace", fontSize: 12, color: sel === name ? TEXT : MUTED }}>
                  {name} {aiDict[name] && <span style={{ float: "right", color: "#34d399", fontSize: 10 }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {!sel
                ? <div style={{ color: MUTED, textAlign: "center", padding: 40 }}>← Select a table</div>
                : <>
                  <AIBox title={`Data Dictionary — ${sel}`} content={aiDict[sel]} loading={loadingDict[sel]} accent="#fbbf24" />
                  <AIBox title="Business Context" content={aiCtx[sel]} loading={loadingCtx[sel]} accent="#6ee7b7" />
                </>}
            </div>
          </div>
        )}

        {/* ══════════════ SCORECARD ══════════════ */}
        {tab === "scorecard" && (
          <div className="fade">
            <div style={s.h2}>Database Health Scorecard</div>
            <div style={s.tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Rank", "Table", "Completeness", "FK Score", "Timestamp", "Not-Null Cols", "Overall", "Grade"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {scorecard.map((row, i) => {
                    const gradeColor = { "A+": "#34d399", A: "#34d399", B: "#fbbf24", C: "#f97316", D: "#ef4444" }[row.grade];
                    return (
                      <tr key={row.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td style={{ ...s.td, color: MUTED, fontWeight: 700 }}>#{i + 1}</td>
                        <td style={{ ...s.td, fontFamily: "monospace" }}><span style={{ color: OLIST_SCHEMA[row.name].color }}>●</span> {row.name}</td>
                        <td style={s.td}><Bar pct={row.completeness} color="#60a5fa" /><span style={{ fontSize: 11, color: "#60a5fa" }}>{row.completeness}%</span></td>
                        <td style={s.td}><Bar pct={row.fkScore} color="#a78bfa" /><span style={{ fontSize: 11, color: "#a78bfa" }}>{row.fkScore}</span></td>
                        <td style={s.td}><Bar pct={row.hasTimestamp} color="#c4b5fd" /><span style={{ fontSize: 11, color: "#c4b5fd" }}>{row.hasTimestamp}</span></td>
                        <td style={s.td}><Bar pct={parseFloat(row.nullColRatio)} color="#34d399" /><span style={{ fontSize: 11, color: "#34d399" }}>{row.nullColRatio}%</span></td>
                        <td style={{ ...s.td, fontWeight: 800, color: gradeColor }}>{row.overall}</td>
                        <td style={s.td}>
                          <span style={{ background: gradeColor + "22", color: gradeColor, border: `1px solid ${gradeColor}44`, borderRadius: 6, padding: "3px 12px", fontSize: 14, fontWeight: 900 }}>{row.grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
              {["A+", "A", "B", "C", "D"].map(grade => {
                const gradeColor = { "A+": "#34d399", A: "#34d399", B: "#fbbf24", C: "#f97316", D: "#ef4444" }[grade];
                const count = scorecard.filter(r => r.grade === grade).length;
                return (
                  <div key={grade} style={{ ...s.card(gradeColor), textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: gradeColor }}>{grade}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{count} table{count !== 1 ? "s" : ""}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════ CHAT ══════════════ */}
        {tab === "chat" && (
          <div className="fade" style={{ display: "flex", flexDirection: "column", height: "68vh" }}>
            <div style={s.h2}>AI Database Assistant</div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", background: "#080f1e", borderRadius: 12, padding: "16px", marginBottom: 12, border: `1px solid ${BORDER}` }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                  <div style={{ color: MUTED, fontSize: 14 }}>Ask me anything about the Olist database schema, queries, data quality, or analytics…</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
                    {["What are the biggest data quality issues?", "How do I calculate revenue per seller?", "Which tables have the most nulls?", "What's the delivery delay formula?"].map(q => (
                      <button key={q} onClick={() => sendChat(q)}
                        style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{msg.role === "user" ? "You" : "🤖 AI Agent"}</div>
                  <div style={{ maxWidth: "82%", background: msg.role === "user" ? "#1e3a5f" : SURFACE, border: `1px solid ${msg.role === "user" ? "#3b82f644" : BORDER}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, lineHeight: 1.7, color: TEXT, whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <Spinner color="#60a5fa" />
                  <span style={{ color: MUTED, fontSize: 13 }}>AI is thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(chatInput); } }}
                placeholder="Ask about tables, queries, quality, analytics…"
                style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 16px", fontSize: 13 }} />
              <button onClick={() => sendChat(chatInput)} disabled={chatLoading}
                style={{ background: chatLoading ? "#1e293b" : "#3b82f6", color: "#fff", border: "none", borderRadius: 10, padding: "0 22px", fontWeight: 700, fontSize: 13, cursor: chatLoading ? "not-allowed" : "pointer" }}>
                {chatLoading ? <Spinner color="#fff" /> : "Send"}
              </button>
              {chatHistory.length > 0 && <button onClick={() => setChatHistory([])}
                style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 10, padding: "0 14px", fontSize: 12, cursor: "pointer" }}>Clear</button>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}