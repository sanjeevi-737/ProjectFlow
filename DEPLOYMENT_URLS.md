# Deployment URLs & Next Steps

## Live Deployed Services

### Frontend (Vercel) ✅ LIVE
```
https://project-flow-two-lilac.vercel.app
https://frontend-g020i7lpy-sanjeevi737.vercel.app
```
- Vercel Dashboard: https://vercel.com/sanjeevi737/frontend
- Build Command: `npm run build`
- Output: `dist`

### Backend (Render)
```
https://projflow-api.onrender.com
```
- Health Check: `https://projflow-api.onrender.com/api/health`
- API Base: `https://projflow-api.onrender.com/api`

---

## ⏳ IMMEDIATE ACTION REQUIRED

**Update Backend CORS to allow your Vercel frontend:**

1. **Go to Render Dashboard** → Your backend service
2. **Navigate to Settings → Environment**
3. **Find `CLIENT_URL`** (currently: `http://localhost:5173`)
4. **Update to:**
   ```
   http://localhost:5173,https://frontend-g020i7lpy-sanjeevi737.vercel.app,https://project-flow-two-lilac.vercel.app
   ```
5. **Save Changes**
6. **Go to Deployments → Manual Deploy → Deploy latest commit**
7. **Wait for redeploy** (usually 2-5 minutes)

---

## ✅ Verification After Backend Redeploy

### 1. Backend Health
```bash
curl https://projflow-api.onrender.com/api/health
```
Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-..."
}
```

### 2. Frontend Access
- Open: https://frontend-g020i7lpy-sanjeevi737.vercel.app
- Navigate to: `/login`
- Refresh page (test SPA routing)

### 3. API Integration
- Open DevTools → Network tab
- Try to login
- Verify:
  - API calls go to `projflow-api.onrender.com`
  - No CORS errors in Console
  - Responses are successful (200/201)

---

## Environment Variable Reference

### Frontend (Vercel Settings)
- `VITE_API_URL` = `https://projflow-api.onrender.com/api` ✅
- `NODE_ENV` = `production` ✅

### Backend (Render Settings)
- `CLIENT_URL` = `http://localhost:5173,https://frontend-g020i7lpy-sanjeevi737.vercel.app,https://project-flow-two-lilac.vercel.app` ⏳ (NEEDS UPDATE)
- All other env vars (MongoDB, JWT, SMTP, etc.) should already be set

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page on frontend | Check Render backend is deployed and health check passes |
| API calls fail (404) | Verify `VITE_API_URL` is set correctly in Vercel |
| CORS error in browser | Ensure `CLIENT_URL` on Render matches Vercel domain exactly |
| 502 Bad Gateway from backend | Check Render service status and logs |

