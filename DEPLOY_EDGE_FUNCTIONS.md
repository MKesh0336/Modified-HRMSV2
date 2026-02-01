# Deploy Edge Functions to New Supabase Project

## Current Status
- ✅ Frontend updated to use NEW project (hikyzijvoqkrueiutzhb)
- ✅ All API URLs now point to NEW project
- ✅ Environment variables configured for NEW database
- ❌ Edge Functions NOT YET deployed to NEW project

## The Problem
The frontend is trying to call Edge Functions at the NEW project, but they don't exist there yet!

```
Frontend Error: Failed to fetch
https://hikyzijvoqkrueiutzhb.supabase.co/functions/v1/make-server-937488f4/auth/login
^ This endpoint doesn't exist on the new project
```

## Solution: Deploy Edge Functions to New Project

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

You'll be prompted to enter your Supabase access token:
1. Go to https://app.supabase.com/account/tokens
2. Create a new token
3. Copy it and paste into the terminal

### Step 3: Create Supabase Configuration File

Create a `supabase.json` file in the root of your project:

```json
{
  "project_id": "hikyzijvoqkrueiutzhb",
  "api": {
    "port": 54321,
    "schemas": ["public", "graphql_public"],
    "max_rows": 1000
  },
  "db": {
    "port": 54322,
    "major_version": 15
  },
  "studio": {
    "port": 54323
  },
  "internalApiPort": 54324
}
```

### Step 4: Link Your New Project

```bash
supabase link --project-ref hikyzijvoqkrueiutzhb
```

This will connect the local project to your new Supabase project.

### Step 5: Deploy Edge Functions

```bash
supabase functions deploy
```

This will:
- Deploy all functions from `src/supabase/functions/server/`
- Deploy to your NEW Supabase project
- Make them available at `https://hikyzijvoqkrueiutzhb.supabase.co/functions/v1/...`

### Step 6: Verify Deployment

Check if the functions are deployed:

```bash
supabase functions list
```

You should see:
```
make-server-937488f4
```

---

## Alternative: Deploy via GitHub Actions (CI/CD)

If you want automatic deployment when you push code:

### Create `.github/workflows/deploy-edge-functions.yml`

```yaml
name: Deploy Edge Functions

on:
  push:
    branches: [main, vibe-lab]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy Edge Functions
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          PROJECT_ID: hikyzijvoqkrueiutzhb
        run: |
          supabase functions deploy --project-ref $PROJECT_ID
```

Then add your Supabase token to GitHub Secrets:
1. Go to your GitHub repo
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `SUPABASE_ACCESS_TOKEN`
5. Value: Your Supabase access token from https://app.supabase.com/account/tokens

---

## Testing the Deployment

### Test 1: Health Check

```bash
curl https://hikyzijvoqkrueiutzhb.supabase.co/functions/v1/make-server-937488f4/health
```

Expected response: Should not return 404

### Test 2: Create Admin User

```bash
curl -X POST https://hikyzijvoqkrueiutzhb.supabase.co/functions/v1/make-server-937488f4/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "TestPassword123!",
    "name": "Admin User"
  }'
```

Expected response:
```json
{
  "message": "Initial admin created successfully! You can now login.",
  "user": {
    "id": "UUID",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Test 3: Login

```bash
curl -X POST https://hikyzijvoqkrueiutzhb.supabase.co/functions/v1/make-server-937488f4/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "TestPassword123!"
  }'
```

Expected response:
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "UUID",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "employee": { ... }
  }
}
```

---

## If Functions Already Exist on Old Project

The old Supabase project (lqtbeqllyikofkznnhlx) has the Edge Functions deployed. You have two options:

### Option A: Keep Old Functions (Simpler)
- Old functions stay deployed to old project
- Copy and modify them for new project
- Deploy to new project

### Option B: Remove Old Project Access
- Deploy new functions to new project
- Stop using old project completely
- Delete old project (optional)

**Recommended:** Option A - Deploy to new project first, test, then optionally remove old project.

---

## Troubleshooting

### "Function not found" (404 error)
**Solution:** Run `supabase functions deploy` again

### "Unauthorized" error
**Solution:** 
1. Check your Supabase access token is valid
2. Run `supabase login` again
3. Verify project ID is correct

### "Project not linked"
**Solution:** Run `supabase link --project-ref hikyzijvoqkrueiutzhb`

### Functions deployed to wrong project
**Solution:** 
1. Run `supabase link --project-ref hikyzijvoqkrueiutzhb` (correct project)
2. Run `supabase functions deploy` again

---

## Quick Deploy Script

Create a file `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Edge Functions to New Supabase Project..."
echo ""
echo "Step 1: Installing Supabase CLI..."
npm install -g supabase

echo ""
echo "Step 2: Logging in to Supabase..."
supabase login

echo ""
echo "Step 3: Linking project..."
supabase link --project-ref hikyzijvoqkrueiutzhb

echo ""
echo "Step 4: Deploying functions..."
supabase functions deploy

echo ""
echo "Step 5: Verifying deployment..."
supabase functions list

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Test the API:"
echo "curl https://hikyzijvoqkrueiutzhb.supabase.co/functions/v1/make-server-937488f4/health"
```

Run it with:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Summary

1. **Install Supabase CLI** - `npm install -g supabase`
2. **Login** - `supabase login`
3. **Link project** - `supabase link --project-ref hikyzijvoqkrueiutzhb`
4. **Deploy** - `supabase functions deploy`
5. **Test** - Call the endpoints from your app

After deployment, your app will work completely with the NEW database! 🎉
