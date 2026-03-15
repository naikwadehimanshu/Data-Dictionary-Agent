# 🧠 AI Database Intelligence Agent

> An AI-powered relational database analysis tool that auto-generates schema understanding, ER diagrams, data quality metrics, anomaly detection, SQL intelligence, and human-readable data dictionaries — all in one interactive dashboard.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![AI Powered](https://img.shields.io/badge/AI-Powered-orange)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Dataset](https://img.shields.io/badge/Dataset-Olist%20E--Commerce-blue)](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)

---

## 📌 Overview

The **AI Database Intelligence Agent** is a full-stack React application powered by AI that analyzes relational databases and surfaces insights automatically. It is built around the **Olist Brazilian E-Commerce Dataset** — a real-world schema with 9 interlinked tables, 100K+ orders, and mixed data types including timestamps, floats, text reviews, and geospatial coordinates.

The agent goes beyond basic schema visualization. It interprets your database like a senior data engineer — detecting anomalies, grading table health, explaining SQL, tracing data lineage, and generating plain-English data dictionaries on demand.

---

## ✨ Features

### 📊 Overview Dashboard
- High-level metrics: total tables, rows, relationships, average completeness
- Color-coded table cards with completeness bars and category tags
- AI-generated executive business summary of the entire database

### 🗂 Schema Explorer
- Full column-level inspection: data types, PK/FK markers, nullability, null percentages
- Searchable table list with category color coding
- Per-table AI business context and inline anomaly badges

### 🔗 Interactive ER Diagram
- SVG-based entity relationship map for all 9 tables
- Hover glow and click-to-highlight FK connections
- Full relationship index with cardinality (N:1, 1:N)

### ✅ Data Quality Dashboard
- Completeness scores, null cell counts, freshness detection per table
- Null distribution heatmap with visual progress bars
- Column type distribution chart across the full schema

### ⚠️ Anomaly Detector *(Unique Feature)*
- Automatically flags: null spikes, missing references, incomplete data flows, cardinality issues
- Severity classification: High / Medium / Low / Info
- One-click jump from anomaly to affected table in Schema Explorer

### ⚡ SQL Lab *(Unique Feature)*
- 6 pre-built query templates: Revenue by Month, Top Sellers, Delivery Delay, Review Distribution, Payment Methods, Null Audit
- AI SQL Generator: describe what you want in plain English → get a ready-to-run query
- AI Query Explainer: paste any SQL → get a plain-English breakdown with performance notes

### 🌊 Data Lineage Explorer *(Unique Feature)*
- Visual upstream/downstream dependency map for any selected table
- Shows what each table depends on and what depends on it
- AI-powered lineage analysis: what breaks if this table has quality issues?

### 📖 AI Data Dictionary
- Auto-generates human-readable one-line descriptions for every column in any table
- Business context summaries paired with technical column definitions
- Copy-to-clipboard on all AI outputs

### 🏅 Database Health Scorecard *(Unique Feature)*
- Grades every table A+ through D across 4 dimensions:
  - Completeness score
  - Foreign key coverage
  - Timestamp presence (freshness capability)
  - Not-null column ratio
- Overall score and grade distribution summary

### 💬 Multi-turn AI Chat *(Unique Feature)*
- Full conversational interface with context memory across messages
- Ask anything: schema questions, SQL help, analytics strategy, data quality
- Quick-start prompt buttons, auto-scroll, and chat clear option

---

## 🗄️ Dataset

**Primary: Olist Brazilian E-Commerce Dataset**
- 🔗 [kaggle.com/datasets/olistbr/brazilian-ecommerce](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- License: CC BY-NC-SA 4.0
- 9 interlinked relational tables
- 100K+ orders, 1M+ geolocation records
- Mixed data types: timestamps, floats, text reviews, geospatial coordinates

| Table | Rows | Description |
|-------|------|-------------|
| `orders` | 99,441 | Core order lifecycle and status |
| `customers` | 99,441 | Customer identifiers and location |
| `order_items` | 112,650 | Line items, prices, freight |
| `products` | 32,951 | Product catalog with dimensions |
| `sellers` | 3,095 | Seller profiles and location |
| `order_reviews` | 99,224 | Star ratings and text reviews |
| `order_payments` | 103,886 | Payment types and installments |
| `geolocation` | 1,000,163 | ZIP code lat/lng mapping |
| `product_category_name_translation` | 71 | PT → EN category names |

---

<!-- ## 🚀 Getting Started

### Option 1: Run Online (Instant, No Setup)
Open the artifact directly in your browser — no installation needed.

### Option 2: Run Locally

**Prerequisites**
- Node.js 18+
- An AI API key (see setup step 4)

**Steps**

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ai-database-intelligence-agent.git
cd ai-database-intelligence-agent

# 2. Create a Vite + React project
npm create vite@latest . -- --template react
npm install

# 3. Copy the component
cp db-intelligence-agent-v2.jsx src/App.jsx

# 4. Add your API key
# In src/App.jsx, find the askAI function and add headers: -->
<!-- ```

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_AI_API_KEY",
  "ai-version": "2023-06-01",
  "ai-dangerous-direct-browser-access": "true",
},
```

```bash
# 5. Run
npm run dev
# Open http://localhost:5173
```

--- -->

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 |
| Styling | Inline CSS with CSS variables |
| AI Engine | AI Language Model API |
| Fonts | Google Fonts — Outfit |
| Diagrams | SVG (hand-crafted, no library) |
| Build Tool | Vite |
| Dataset | Olist Brazilian E-Commerce (Kaggle) |

---

## 🏗️ Project Structure

```
ai-database-intelligence-agent/
├── src/
│   └── App.jsx                  # Main component (all-in-one)
├── public/
├── index.html
├── package.json
└── README.md
```

The entire agent lives in a single `App.jsx` file, organized into:
- **Static data layer** — schema definitions, relationships, anomaly rules, SQL templates
- **AI layer** — `askAI()` function wrapping the AI API
- **Component layer** — reusable UI components (Badge, ProgressBar, AIBox, ERDiagram, etc.)
- **Tab views** — 10 fully independent feature tabs

---

## 📐 Architecture

```
User Interface (React)
        │
        ▼
 Tab Router (10 views)
        │
   ┌────┴────┐
   │         │
Static       AI
Schema      API
 Data
        │
   Business Context
   Data Dictionary
   SQL Generation
   Query Explanation
   Lineage Analysis
   Chat (multi-turn)
```

---

## 🔮 Roadmap / Future Enhancements

- [ ] File upload support — drag & drop your own CSV/SQL schema
- [ ] Database connector — live PostgreSQL / MySQL / SQLite connection
- [ ] Export reports as PDF or Markdown
- [ ] Column-level profiling (min, max, distinct count, sample values)
- [ ] AI-powered index recommendations
- [ ] Dark/light theme toggle
- [ ] Saved query history
- [ ] Multi-database comparison mode

---

<!-- ## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

--- -->
<!-- 
## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

The Olist dataset is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

---

## 🙏 Acknowledgements

- [Olist](https://olist.com) for the open e-commerce dataset
- The AI API for powering intelligent database analysis
- Built as part of the **AI Database Intelligence Agent** hackathon objective

--- -->

<div align="center">
  <strong>Built with 🧠 AI + ⚛️ React</strong><br/>
  <sub>Turning raw schemas into business intelligence, automatically.</sub>
</div>
