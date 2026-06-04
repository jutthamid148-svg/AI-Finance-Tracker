# 🤖 AI Finance Tracker

> **Final Year Project — Riphah International University, BSSE**
> Team: Waqar Ali (24421) · Muhammad Hamid (25951) · Zohaib Gulzar (26183)

A full-stack AI-powered personal finance management web application built with Django REST Framework + React 18 + TypeScript.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Django 4.2, Django REST Framework, JWT Auth |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion |
| **Database** | PostgreSQL |
| **AI/ML** | Pandas, NumPy, Scikit-Learn (Linear Regression) |
| **Charts** | Recharts |
| **State** | Zustand + TanStack Query |
| **Reports** | ReportLab (PDF), openpyxl (Excel) |

---

## 📁 Project Structure

```
ai-finance-tracker/
├── backend/
│   ├── finance_tracker/       # Django project settings
│   ├── users/                 # Auth, profiles, notifications
│   ├── transactions/          # Income & Expenses CRUD
│   ├── budgets/               # Monthly budget tracking
│   ├── savings/               # Savings goals
│   ├── ai_module/             # ML analysis & AI chat
│   ├── reports/               # PDF & Excel export
│   ├── requirements.txt
│   ├── manage.py
│   └── Procfile               # Railway deployment
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.tsx
    │   │   ├── auth/          # Login, Register, ForgotPassword
    │   │   ├── dashboard/     # Main dashboard
    │   │   ├── income/        # Income management
    │   │   ├── expenses/      # Expense tracking
    │   │   ├── budget/        # Budget planning
    │   │   ├── savings/       # Savings goals
    │   │   ├── ai/            # AI Insights + Chat
    │   │   ├── reports/       # Reports & Export
    │   │   └── profile/       # User profile
    │   ├── components/layout/ # DashboardLayout + Sidebar
    │   ├── services/api.ts    # Axios API service
    │   └── store/authStore.ts # Zustand auth state
    ├── vercel.json
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env: set DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY

# 4. Create PostgreSQL database
# psql -U postgres -c "CREATE DATABASE ai_finance_tracker;"

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
# API running at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
# .env is pre-configured for localhost

# 3. Start development server
npm run dev
# App running at http://localhost:5173

# 4. Build for production
npm run build
```

---

## 🔌 API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /api/auth/register/` | User registration |
| Auth | `POST /api/auth/login/` | JWT login |
| Auth | `POST /api/auth/logout/` | Token blacklist |
| Auth | `GET /api/auth/dashboard/stats/` | Dashboard summary |
| Income | `GET/POST /api/transactions/income/` | List/Create income |
| Income | `PUT/DELETE /api/transactions/income/{id}/` | Update/Delete |
| Expenses | `GET/POST /api/transactions/expenses/` | List/Create expenses |
| Expenses | `PUT/DELETE /api/transactions/expenses/{id}/` | Update/Delete |
| Charts | `GET /api/transactions/charts/monthly/` | 6-month trend data |
| Charts | `GET /api/transactions/charts/categories/` | Category breakdown |
| Budget | `GET/POST /api/budgets/` | List/Create budgets |
| Budget | `GET /api/budgets/summary/` | Budget summary |
| Savings | `GET/POST /api/savings/` | List/Create goals |
| Savings | `POST /api/savings/{id}/add/` | Add to savings |
| AI | `GET /api/ai/insights/` | Full AI insights |
| AI | `GET /api/ai/spending-analysis/` | Spending analysis |
| AI | `GET /api/ai/predictions/` | ML predictions |
| AI | `POST /api/ai/chat/` | AI finance chat |
| Reports | `GET /api/reports/monthly/` | Monthly report data |
| Reports | `GET /api/reports/export/pdf/` | Download PDF |
| Reports | `GET /api/reports/export/excel/` | Download Excel |

---

## 🧠 AI Features

The AI module (`backend/ai_module/analyzer.py`) uses:

- **Pandas** — Data manipulation and grouping
- **NumPy** — Numerical computations
- **Scikit-Learn** — Polynomial Linear Regression for expense prediction
- **Custom NLP** — Keyword-based chat response routing

### AI Capabilities:
1. **Spending Analysis** — Category breakdown with insights
2. **Overspending Detection** — Month-over-month comparison
3. **Personalized Recommendations** — PKR-optimized savings tips
4. **Expense Prediction** — Next month forecast using regression
5. **Savings Forecast** — 6-month projected savings
6. **AI Chat** — Natural language financial Q&A

---

## 🚢 Deployment

### Backend → Railway
```bash
# Set environment variables in Railway dashboard:
# SECRET_KEY, DEBUG=False, DB_* vars, CORS_ALLOWED_ORIGINS
railway up
```

### Frontend → Vercel
```bash
# Push to GitHub, connect to Vercel
# Set VITE_API_URL=https://your-backend.railway.app/api
vercel --prod
```

---

## 👥 Team

| Name | Student ID | Role |
|------|-----------|------|
| Waqar Ali | 24421 | Full Stack + AI/ML |
| Muhammad Hamid | 25951 | Frontend + UI/UX |
| Zohaib Gulzar | 26183 | Backend + Database |

**Supervisor:** [Supervisor Name]
**Institution:** Riphah International University
**Degree:** BSSE (Bachelor of Science in Software Engineering)

---

## 📜 License
Academic project — All rights reserved © 2024
