# CORS Configuration for Production

## Update Backend .env

Make sure your production backend `.env` has:

```bash
FRONTEND_URL=https://swais.in
```

This allows the frontend to make direct API calls to FastAPI.

## Verify CORS is Working

After deploying, test:

```bash
curl -H "Origin: https://swais.in" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.swais.in/admin/users/stats
```

Should return:
```
Access-Control-Allow-Origin: https://swais.in
Access-Control-Allow-Credentials: true
```

## Local Development

For local testing, keep:

```bash
FRONTEND_URL=http://localhost:3001
```
