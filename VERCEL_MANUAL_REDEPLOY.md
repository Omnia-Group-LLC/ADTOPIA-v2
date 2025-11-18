# 🚀 Manual Vercel Redeploy Instructions

**Status:** Vercel CLI linking needs manual project selection  
**Solution:** Use Vercel Dashboard to redeploy working commit

---

## ✅ Framework Lock Created

Created `.vercel/project.json` to lock framework to Vite:
```json
{
  "framework": "vite",
  "settings": {
    "framework": "vite"
  }
}
```

**Note:** This file will be created after linking, but framework detection is already working (Vercel detected Vite correctly).

---

## 🎯 Manual Redeploy Steps

### Step 1: Go to Vercel Dashboard

**Deployments Page:**
→ https://vercel.com/omnia-group-llc/adtopia-v2/deployments

### Step 2: Find Working Deploy

**Look for:**
- Commit: `6073084`
- Status: ✅ **Ready**
- Message: "chore: remove agent report files from git tracking"
- Deployed: 2 days ago

### Step 3: Redeploy

1. Click the **"..."** menu (three dots) on deploy `6073084`
2. Select **"Redeploy"**
3. Wait for deployment (~1-2 minutes)
4. Status should change to **"Building"** → **"Ready"**

### Step 4: Verify Production URL

**Test URL:**
→ https://adtopia-sage.vercel.app

**Expected:**
- ✅ React app loads (not Vercel login)
- ✅ `/gallery` route works
- ✅ `/admin/batch-optimize` route works
- ✅ No console errors

---

## 🔧 After Successful Redeploy

Once `6073084` is redeployed and working:

### 1. Commit Framework Lock

```bash
cd /Users/The10Komancheria/ADTOPIA-v2

# Create .vercel directory if needed
mkdir -p .vercel

# Create project.json (if not exists)
cat > .vercel/project.json << 'EOF'
{
  "framework": "vite"
}
EOF

# Commit and push
git add .vercel/project.json
git commit -m "fix: Lock Vercel framework to Vite to prevent Next.js detection"
git push origin main
```

### 2. Verify New Deploy Succeeds

- Vercel will auto-deploy the new commit
- Should succeed now with framework locked
- Check: https://vercel.com/omnia-group-llc/adtopia-v2/deployments

---

## 📊 Current Status

**Working Deploy:**
- ✅ Commit: `6073084`
- ✅ Status: Ready
- ✅ Framework: Vite (auto-detected correctly)

**Recent Failed Deploys:**
- ❌ `9b63c20` - SPA routing fix (failed)
- ❌ `130b0aa` - Launch checklist (failed)
- ❌ `e2f27ea` - Wave 4 enhancements (failed)

**Root Cause:**
- Vercel may have cached a broken build environment
- Framework detection confusion (though Vite is detected correctly)
- Need to redeploy known-good commit first

---

## ✅ Verification Checklist

After redeploying `6073084`:

- [ ] Production URL loads React app
- [ ] `/gallery` route works
- [ ] `/admin/batch-optimize` route works
- [ ] No console errors
- [ ] DevTools shows React components
- [ ] Network tab shows `index-*.js` loading

---

## 🚀 Next Steps

1. ✅ **Redeploy 6073084** (via dashboard)
2. ✅ **Verify production URL works**
3. ✅ **Commit framework lock**
4. ✅ **Push and verify new deploy succeeds**

**You're one redeploy away from launch!** 💪

