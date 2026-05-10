# Environment Variables Setup

## Frontend (.env.local)

Create `.env.local` in the frontend root with:

```bash
# For local development
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# For production (set in Vercel/deployment platform)
NEXT_PUBLIC_BACKEND_URL=https://api.swais.in
```

**Important:** Use `NEXT_PUBLIC_` prefix so the variable is available in the browser.

## Backend (.env)

Update your backend `.env` with:

```bash
# For local development
FRONTEND_URL=http://localhost:3001

# For production
FRONTEND_URL=https://swais.in
```

This enables CORS for direct browser-to-FastAPI calls.

## Deployment Checklist

### Vercel (Frontend)
```bash
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Enter: https://api.swais.in
```

### Backend Server
Update production `.env`:
```bash
FRONTEND_URL=https://swais.in
```

Then restart FastAPI:
```bash
sudo systemctl restart swais-backend
# or
pm2 restart swais-backend
```

## Testing

After deployment, test in browser console:

```javascript
// Should work with cookies
fetch('https://api.swais.in/admin/users?status=P', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

Should return user data, not 401 error.
