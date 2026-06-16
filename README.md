# Marlotto 🎰
*Personal Sweepstakes Mail Entry Tracker*

A clean, minimal React + Node.js app to track sweepstakes mail-in entries, manage deadlines, and organize mailing instructions.

## Features

- **Dashboard**: View summary stats (total entries, upcoming deadlines, prize value)
- **Sweepstakes List**: Browse all entries with filtering and sorting
- **Detailed View**: See full instructions, mailing addresses, and track status
- **Status Tracking**: Mark sweepstakes as "not_started", "started", "mailed", or "saved"
- **Notes**: Add personal notes to each sweepstake
- **Search & Filter**: Find entries by name, status, or deadline

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Hosting**: Railway (DB) + Vercel (optional for frontend/backend)

## Local Development Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+ (local or remote)
- Git

### 1. Clone & Install

```bash
git clone <repo>
cd marlotto

# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database
createdb marlotto

# Update backend/.env
DATABASE_URL=postgresql://localhost:5432/marlotto
```

**Option B: Railway (Recommended)**
1. Sign up at [railway.app](https://railway.app)
2. Create a new PostgreSQL project
3. Copy the `DATABASE_URL` from the dashboard
4. Save to `backend/.env`

The tables will auto-create on first server startup.

### 3. Environment Variables

**backend/.env**
```env
DATABASE_URL=postgresql://...
PORT=5000
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run Locally

**Backend (from `/backend`)**
```bash
npm run dev
```
Runs on http://localhost:5000

**Frontend (from `/frontend` in a new terminal)**
```bash
npm run dev
```
Runs on http://localhost:5173

Visit http://localhost:5173 in your browser.

## API Endpoints

### Sweepstakes
- `GET /api/sweepstakes` - List all (optional: `?status=not_started&sortBy=deadline`)
- `POST /api/sweepstakes` - Create new
- `PATCH /api/sweepstakes/:id` - Update (status, notes, etc.)
- `DELETE /api/sweepstakes/:id` - Remove

### Dashboard
- `GET /api/dashboard` - Summary stats (total, by status, upcoming, prize value)

### Health
- `GET /health` - Server status

## Database Schema

```sql
CREATE TABLE sweepstakes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prize_value INT,
  deadline DATE NOT NULL,
  mail_address_street VARCHAR(255),
  mail_address_city VARCHAR(100),
  mail_address_state VARCHAR(2),
  mail_address_zip VARCHAR(10),
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'not_started',
  status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
```

## Deployment

### Backend (Railway)
1. Push to GitHub
2. Create a new Railway project from GitHub repo
3. Set `DATABASE_URL` environment variable
4. Deploy

### Frontend (Vercel)
1. Push to GitHub
2. Import repo to [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` to your Railway backend URL
4. Deploy

## Data Format

When adding a sweepstake, provide:
- **name** (required): Sweepstake title
- **deadline** (required): Date (YYYY-MM-DD)
- **prize_value** (optional): Dollar amount
- **mail_address_street, city, state, zip** (optional): Mailing address
- **instructions** (optional): T&C entry instructions (copy-paste from rules)
- **notes** (optional): Personal notes

## Usage Tips

1. **Extract Instructions**: When you find a sweepstake, copy the entry instructions from the T&Cs into the form. This saves time later.
2. **Track Status**: Use the status dropdown to mark your progress.
3. **Confirm Before Mailing**: When you mark an entry as "mailed", you'll get a confirmation dialog.
4. **Check Upcoming**: The dashboard shows deadlines within 7 days—prioritize these.
5. **Prize Value**: Track high-value sweepstakes separately; the dashboard sums them up.

## Scraper Integration (Optional)

If you have a web scraper that finds sweepstakes, it can integrate with the backend:

1. Scraper outputs JSON:
   ```json
   [
     {
       "name": "PCH",
       "prize_value": 1000000,
       "deadline": "2025-12-31",
       "mail_address_street": "P.O. Box 123",
       "mail_address_city": "Port Washington",
       "mail_address_state": "NY",
       "mail_address_zip": "11050",
       "instructions": "..."
     }
   ]
   ```

2. Add to `backend/routes.js`:
   ```javascript
   router.post('/api/scrape', async (req, res) => {
     // Run scraper, parse JSON, insert into DB
     // Return { added: N, skipped: M }
   });
   ```

## Project Structure

```
marlotto/
├── backend/
│   ├── server.js          # Express setup
│   ├── db.js              # PostgreSQL connection
│   ├── routes.js          # API routes
│   ├── package.json
│   └── .env               # Database URL
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx        # Main component
│       ├── App.css        # Global styles
│       ├── index.css
│       ├── api.js         # Axios client
│       └── components/
│           ├── Dashboard.jsx
│           ├── SweepstakesList.jsx
│           ├── SweepstakeDetail.jsx
│           └── AddEditForm.jsx
└── README.md
```

## Security

- Single-user app (no auth required for personal use)
- Never commit `.env` with real credentials
- `DATABASE_URL` should only be in backend
- Input validation on backend

## License

Personal use. Enjoy the sweepstakes! 🍀
