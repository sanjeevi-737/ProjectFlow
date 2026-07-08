# Hospital Management System - Deployment Guide

## Prerequisites
- GitHub repository
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB connection string
- SMTP credentials (optional but recommended)
- Cloudinary account (optional for image uploads)

---

## Step 1: Deploy Backend on Render

### Setup
1. Go to [render.com](https://render.com) → Click **New → Web Service**
2. Select your GitHub repository
3. Configure with these settings:

| Setting | Value |
|---------|-------|
| **Name** | projflow-api (or your choice) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm ci` |
| **Start Command** | `npm start` |

### Health Check (Important for auto-restart)
1. After creating the service, go to **Settings**
2. Add Health Check:
   - **Path**: `/api/health`
   - **Port**: `5000`

### Environment Variables
Add these in Render dashboard → Environment:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
SMTP_HOST=<your-smtp-host>
SMTP_PORT=587
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
EMAIL_FROM=noreply@yourdomain.com
```

**⚠️ Generate secure JWT secrets:**
```bash
# On your local machine
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploy
Click **Deploy** and wait for it to complete. Copy your Render URL (e.g., `https://projflow-api.onrender.com`)

---

## Step 2: Deploy Frontend on Vercel

### Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Select your GitHub repository
3. Configure Project:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node.js Version** | 20.x (or latest LTS) |

### Environment Variables
Add these two variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://projflow-api.onrender.com/api` (use your Render URL) |
| `NODE_ENV` | `production` |

### Deploy
Click **Deploy** and wait. Copy your Vercel URL (e.g., `https://your-project.vercel.app`)

---

## Step 3: Update Backend CORS

Now that you have both URLs, update the backend:

1. Go to Render dashboard → Your backend service → **Environment**
2. Edit `CLIENT_URL`:
   ```
   CLIENT_URL=https://your-project.vercel.app
   ```
3. Click **Manual Deploy → Deploy latest commit**

---

## Step 4: Verify Deployment

### Test Backend
```bash
curl https://projflow-api.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-..."
}
```

### Test Frontend
1. Open https://your-project.vercel.app
2. Go to login page and refresh browser
3. Open DevTools → Network tab
4. Attempt login and verify API calls go to your Render URL
5. Check that responses succeed

### Verify CORS
If you see CORS errors:
- Backend logs (Render) should show the origin being blocked
- Frontend should show exact error in browser DevTools → Console
- Update `CLIENT_URL` on Render to match Vercel domain exactly

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| **Blank page / 404 on refresh** | SPA routing not configured | Verify `frontend/vercel.json` exists with rewrite rule |
| **API calls fail (404)** | `VITE_API_URL` not set | Add env var in Vercel project settings |
| **CORS error in browser** | `CLIENT_URL` doesn't match frontend domain | Update Render env var exactly |
| **Build fails "dist not found"** | Wrong output directory | Set `Output Directory` to `dist` in Vercel |
| **Backend not reachable** | Health check failing | Verify `/api/health` returns 200 OK |

---

## Subsequent Deployments

### Backend (Render)
Just push to GitHub → Render auto-deploys

### Frontend (Vercel)
Just push to GitHub → Vercel auto-deploys

### To trigger manual redeploy:
- **Render**: Service → Manual Deploy → Deploy latest commit
- **Vercel**: Deployments → Redeploy

---

## Environment Variable Reference

### Backend (.env.example in `backend/`)
See `backend/.env.example` for full reference

### Frontend (Vercel Settings)
- `VITE_API_URL` - API base URL (must start with `https://`)
- `NODE_ENV` - Always `production`

---

## Files Already Configured for Deployment
✅ `frontend/vercel.json` - SPA routing rewrite  
✅ `frontend/src/services/api.js` - Dynamic API URL from env  
✅ `backend/src/server.js` - Multi-origin CORS support  
✅ `backend/src/routes/index.js` - Health check endpoint  
