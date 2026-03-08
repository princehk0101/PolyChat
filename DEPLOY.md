# GitHub And Render Setup

## GitHub par kya upload karna hai

Upload:
- `backend/`
- `frontend/`
- `render.yaml`
- `.gitignore`
- `DEPLOY.md`

Upload mat karo:
- `backend/venv/`
- `backend/.env`
- `backend/db.sqlite3`
- `frontend/node_modules/`
- `frontend/dist/`
- `frontend/.env.local`
- log files

## Pehle local cleanup

Backend env:
- `backend/.env.example` ko copy karke `backend/.env` banao

Frontend env:
- `frontend/.env.example` ko copy karke `frontend/.env.local` banao

## Git commands

```bash
git init
git branch -M main
git add .
git commit -m "Initial PolyChat deploy setup"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Render recommended structure

- 1 PostgreSQL database
- 1 Django backend web service
- 1 Vite frontend static site

`render.yaml` already included hai.

## Render env vars

Backend:
- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=.onrender.com`
- `CSRF_TRUSTED_ORIGINS=https://YOUR_FRONTEND.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://YOUR_FRONTEND.onrender.com`
- `DATABASE_URL` from Render PostgreSQL
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GROQ_API_KEY`

Frontend:
- `VITE_API_BASE_URL=https://YOUR_BACKEND.onrender.com/api/`
- `VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID`

## Google OAuth important

Google Console me ye add karo:
- Authorized JavaScript origin: `https://YOUR_FRONTEND.onrender.com`
- Authorized redirect URI agar needed ho to Render frontend URL

## Local install commands

Backend:

```bash
cd backend
venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Production notes

- Render deploy ke liye SQLite use mat karo; PostgreSQL use karo
- frontend aur backend separate deploy rakho
- agar frontend URL change hoti hai to backend CORS/CSRF vars update karo
