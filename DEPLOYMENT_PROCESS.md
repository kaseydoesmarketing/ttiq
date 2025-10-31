# TitleIQ Admin Dashboard - Deployment Process

## Never Have Issues Again - Follow This Process

This document describes the bulletproof deployment process for the TitleIQ Admin Dashboard. Following these steps will prevent the issues we've experienced with missing state declarations, duplicate imports, cache problems, and deployment failures.

---

## Quick Reference

### To Deploy Safely:
```bash
cd /Users/kvimedia/titleiq
bash scripts/safe-deploy-admin.sh
```

### To Validate Before Manual Changes:
```bash
cd /Users/kvimedia/titleiq
bash scripts/validate-admin-dashboard.sh
```

---

## The Safe Deployment Script

Location: `/Users/kvimedia/titleiq/scripts/safe-deploy-admin.sh`

### What It Does:

1. **Pre-deployment Validation** - Runs comprehensive checks before any changes
2. **Backup** - Creates timestamped backup of current state
3. **Build Configuration** - Sets proper build tags and environment variables
4. **Build** - Compiles frontend with error checking
5. **Backend Restart** - Restarts PM2 with updated environment
6. **Cache Clearing** - Removes nginx cache and reloads configuration
7. **Verification** - Tests that new assets are being served correctly
8. **Automatic Rollback** - Fails fast if any step encounters errors

### Features:

- ✅ Validates code structure before deployment
- ✅ Creates automatic backups with timestamps
- ✅ Checks for build errors
- ✅ Verifies new assets are served
- ✅ Tests backend health
- ✅ Color-coded output for easy reading
- ✅ Detailed error messages
- ✅ Safe failure handling

---

## The Validation Script

Location: `/Users/kvimedia/titleiq/scripts/validate-admin-dashboard.sh`

### What It Checks:

1. **File Existence** - AdminDashboard.jsx is present
2. **Duplicate Imports** - No duplicate import statements
3. **State Declarations** - All required useState calls present:
   - `loading` / `setLoading`
   - `error` / `setError`
   - `overview` / `setOverview`
   - `traffic` / `setTraffic`
   - `activeUsers` / `setActiveUsers`
   - `topUsage` / `setTopUsage`
   - `systemHealth` / `setSystemHealth`
   - `lastRefresh` / `setLastRefresh`
4. **Export Structure** - Single default export (not multiple)
5. **Required Imports** - useState, useEffect, useNavigate, useAuth, api
6. **Admin Guard** - Role check logic is present
7. **Basic Syntax** - No obvious syntax errors
8. **API Endpoints** - Required endpoints are referenced
9. **Environment Config** - Build tag is configured

### Exit Codes:

- `0` - All checks passed (safe to deploy)
- `1` - Errors found (DO NOT deploy)

---

## Common Issues and How They're Prevented

### Issue #1: Missing State Declarations
**Symptom:** "Route not found" error or component crashes
**How It's Prevented:** Validation checks for all 8 required state declarations
**Detection:** Pre-deployment validation step fails if any are missing

### Issue #2: Duplicate Imports
**Symptom:** Build errors about "symbol already declared"
**How It's Prevented:** Validation detects duplicate import lines
**Detection:** Pre-deployment validation step fails if duplicates found

### Issue #3: Multiple Default Exports
**Symptom:** Build errors or wrong component rendered
**How It's Prevented:** Validation checks for exactly one default export
**Detection:** Pre-deployment validation step fails if multiple found

### Issue #4: Cache Issues
**Symptom:** Old assets served, changes not visible
**How It's Prevented:** Script clears nginx cache and reloads
**Detection:** Post-deployment verification checks asset hash

### Issue #5: Build Errors
**Symptom:** Application breaks, nothing renders
**How It's Prevented:** Build output is checked for errors
**Detection:** Deployment fails if build contains errors

---

## Manual Deployment Checklist

If you need to deploy manually (not recommended), follow this checklist:

### Before Making Changes:

- [ ] Run validation script: `bash scripts/validate-admin-dashboard.sh`
- [ ] Backup current file:
  ```bash
  ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
    "cp /var/www/titleiq/frontend/src/pages/AdminDashboard.jsx \
        /var/www/titleiq/frontend/src/pages/AdminDashboard.jsx.backup-$(date -u +%Y%m%d%H%M%S)"
  ```

### After Making Changes:

- [ ] Run validation script again
- [ ] Check for duplicate imports
- [ ] Verify all state declarations present
- [ ] Verify single default export
- [ ] Set build tag:
  ```bash
  BUILD_TAG=$(date -u +%Y%m%d%H%M%S)
  ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
    "printf 'VITE_BUILD_TAG=%s\n' '$BUILD_TAG' > /var/www/titleiq/frontend/.env.production.local"
  ```

### Build and Deploy:

- [ ] Build frontend:
  ```bash
  ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
    "cd /var/www/titleiq/frontend && npm run build"
  ```
- [ ] Check build output for errors
- [ ] Note new asset hash from build output
- [ ] Restart backend:
  ```bash
  ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
    "pm2 restart titleiq-backend --update-env"
  ```
- [ ] Clear nginx cache:
  ```bash
  ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
    "rm -rf /var/cache/nginx/* && nginx -t && systemctl reload nginx"
  ```

### Verify Deployment:

- [ ] Check live asset hash matches build:
  ```bash
  curl -s 'https://titleiq.tightslice.com/' | grep -o 'index-[^"]*\.js'
  ```
- [ ] Test admin URL: https://titleiq.tightslice.com/admin
- [ ] Test backend health: https://titleiq.tightslice.com/api/health
- [ ] Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

---

## File Locations

### Scripts:
- Validation: `/Users/kvimedia/titleiq/scripts/validate-admin-dashboard.sh`
- Safe Deploy: `/Users/kvimedia/titleiq/scripts/safe-deploy-admin.sh`

### Source Files (Production):
- AdminDashboard: `/var/www/titleiq/frontend/src/pages/AdminDashboard.jsx`
- Frontend env: `/var/www/titleiq/frontend/.env.production.local`
- Backend env: `/var/www/titleiq/backend/.env`

### Built Assets (Production):
- Dist folder: `/var/www/titleiq/frontend/dist/`
- Index HTML: `/var/www/titleiq/frontend/dist/index.html`
- Assets: `/var/www/titleiq/frontend/dist/assets/`

### Backups:
- Location: `/var/www/titleiq/frontend/src/pages/`
- Pattern: `AdminDashboard.jsx.backup-YYYYMMDDHHMMSS`

---

## Troubleshooting

### Validation Fails

**If validation script reports errors:**
1. Read the error messages carefully
2. Fix the reported issues in AdminDashboard.jsx
3. Run validation again
4. Do NOT deploy until validation passes

### Build Fails

**If build fails during deployment:**
1. Check the error message in build output
2. Common causes:
   - Missing imports
   - Syntax errors
   - Missing dependencies
3. Fix the issue
4. Run safe-deploy script again

### Deployment Succeeds But Changes Not Visible

**If deployment reports success but you don't see changes:**
1. Check browser cache - do a HARD refresh:
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
2. Check asset hash:
   ```bash
   curl -s 'https://titleiq.tightslice.com/' | grep -o 'index-[^"]*\.js'
   ```
3. Compare with build output asset hash
4. If different, nginx may not have reloaded - run:
   ```bash
   ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
     "systemctl reload nginx"
   ```

### Backend Not Responding

**If backend health check fails:**
1. Check PM2 status:
   ```bash
   ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "pm2 status"
   ```
2. Check logs:
   ```bash
   ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "pm2 logs titleiq-backend --lines 50"
   ```
3. Restart if needed:
   ```bash
   ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "pm2 restart titleiq-backend"
   ```

---

## Best Practices

### Always:
- ✅ Use the safe deployment script
- ✅ Run validation before manual changes
- ✅ Create backups before modifications
- ✅ Test in admin dashboard after deployment
- ✅ Hard refresh browser to clear cache

### Never:
- ❌ Deploy without running validation
- ❌ Skip the pre-deployment checks
- ❌ Make changes directly on production without backup
- ❌ Assume browser shows latest without hard refresh
- ❌ Deploy if validation shows errors

---

## Quick Commands Reference

```bash
# Safe deployment (recommended)
cd /Users/kvimedia/titleiq && bash scripts/safe-deploy-admin.sh

# Validation only
cd /Users/kvimedia/titleiq && bash scripts/validate-admin-dashboard.sh

# Check live asset
curl -s 'https://titleiq.tightslice.com/' | grep -o 'index-[^"]*\.js'

# Check backend health
curl -s 'https://titleiq.tightslice.com/api/health'

# View PM2 status
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "pm2 status"

# View backend logs
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "pm2 logs titleiq-backend --lines 50"

# Clear nginx cache manually
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "rm -rf /var/cache/nginx/* && systemctl reload nginx"
```

---

## Support

If you encounter issues not covered in this document:

1. Check validation output carefully
2. Check build error messages
3. Check PM2 logs
4. Review recent changes to AdminDashboard.jsx
5. Restore from backup if needed:
   ```bash
   ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com \
     "cp /var/www/titleiq/frontend/src/pages/AdminDashboard.jsx.backup-TIMESTAMP \
         /var/www/titleiq/frontend/src/pages/AdminDashboard.jsx"
   ```

---

## Summary

**To never have deployment issues again:**

1. Always use `bash scripts/safe-deploy-admin.sh`
2. Never skip validation
3. Always hard refresh browser after deployment
4. Check asset hashes to confirm deployment
5. Monitor PM2 logs for backend issues

**The safe deployment script handles:**
- All validation checks
- All build steps
- All cache clearing
- All verification tests
- Automatic error handling

**Result: Zero-surprise deployments every time.**
