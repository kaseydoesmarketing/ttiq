# 🚀 TitleIQ Stripe Setup - Quick Start

**Current Status:** 95% Complete → 12 minutes to 100%

**What's Working:**
- ✅ User authentication & trials
- ✅ Role-based access (2 admins, 5 lifetime users)
- ✅ Rate limiting
- ✅ Frontend + Backend deployed
- ✅ Stripe keys configured (rk_live_***YvGk, pk_live_***EJT8)
- ✅ Webhook handler code ready at `/api/billing/webhook`

**What Needs 12 Minutes:**
- ⚠️ Webhook signing secret (3 min)
- ⚠️ Price IDs for Creator + Creator Pro (9 min)

---

## 🔥 SETUP IN 3 STEPS (12 MINUTES)

### STEP 1: Configure Webhook (3 minutes)

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   ```
   Endpoint URL: https://titleiq.tightslice.com/api/billing/webhook
   Description: TitleIQ Production Webhook
   ```

3. **Select These 5 Events:**
   - ✅ `checkout.session.completed`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

4. **Click "Add endpoint"**

5. **Copy the Signing Secret:**
   - Shows as `whsec_...`
   - Click "Reveal" if hidden

6. **Add to Server:**
   ```bash
   # SSH to server
   ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com

   # Edit .env
   nano /var/www/titleiq/backend/.env

   # Add this line (replace with your actual secret):
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE

   # Save: Ctrl+X, Y, Enter

   # Restart backend
   pm2 restart titleiq-backend

   # Verify it restarted
   pm2 status
   ```

7. **Test in Stripe Dashboard:**
   - Go back to webhook page
   - Click "Send test webhook"
   - Select: `checkout.session.completed`
   - Click "Send test webhook"
   - Should see: ✅ 200 response

---

### STEP 2: Create Price Objects (9 minutes)

1. **Go to Products:**
   - https://dashboard.stripe.com/products

2. **Create Product 1 - Creator:**
   ```
   Click: + Add product

   Name: TitleIQ Creator Monthly
   Description: 60 title generations per day, priority support

   Pricing:
   • Price: $15.00
   • Currency: USD
   • Billing period: Monthly
   • Recurring

   Click: Save product
   ```

3. **Copy Price ID:**
   - In the product page, under "Pricing"
   - You'll see: `price_xxxxxxxxxxxxx`
   - Copy this ID

4. **Create Product 2 - Creator Pro:**
   ```
   Click: + Add product

   Name: TitleIQ Creator Pro Monthly
   Description: 180 title generations per day, premium support, API access

   Pricing:
   • Price: $29.00
   • Currency: USD
   • Billing period: Monthly
   • Recurring

   Click: Save product
   ```

5. **Copy Price ID:**
   - Copy the `price_yyyyyyyyyyy` for Creator Pro

6. **Add Both Price IDs to Server:**
   ```bash
   # Edit .env again
   nano /var/www/titleiq/backend/.env

   # Add these two lines (replace with your actual IDs):
   STRIPE_PRICE_CREATOR=price_xxxxxxxxxxxxx
   STRIPE_PRICE_CREATOR_PRO=price_yyyyyyyyyyy

   # Save: Ctrl+X, Y, Enter

   # Restart backend
   pm2 restart titleiq-backend

   # Verify
   pm2 status
   ```

---

### STEP 3: Test Complete Flow (2 minutes)

1. **Open TitleIQ in Browser:**
   - https://titleiq.tightslice.com

2. **Register New Test Account:**
   - Email: `test+stripe@yourdomain.com`
   - Password: anything

3. **Generate 10 Titles:**
   - Paste any YouTube URL
   - Click generate
   - Repeat 10 times

4. **Trigger Upgrade Modal:**
   - Try to generate an 11th title
   - Should see: "Daily limit reached for Trial plan. Upgrade to continue."

5. **Click Upgrade Button:**
   - Should redirect to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - ZIP: any 5 digits

6. **Complete Checkout:**
   - Should redirect back to TitleIQ
   - User should now have upgraded plan

7. **Verify in Database:**
   ```bash
   # Check user's plan was upgraded
   ssh root@automations.tightslice.com
   cd /var/www/titleiq/backend

   node -e "import('better-sqlite3').then(m => {
     const db = m.default('./database/titleiq.db', {readonly: true});
     const u = db.prepare('SELECT email, plan, billing_status FROM users WHERE email=?')
       .get('test+stripe@yourdomain.com');
     console.log(u);
     db.close();
   })"
   ```

8. **Check Webhook Logs:**
   ```bash
   pm2 logs titleiq-backend | grep -i webhook
   # Should see: checkout.session.completed received
   ```

---

## ✅ VERIFICATION CHECKLIST

After completing all 3 steps, verify:

- [ ] Webhook secret added to .env
- [ ] Price IDs added to .env
- [ ] Backend restarted successfully
- [ ] Test webhook returns 200 in Stripe Dashboard
- [ ] Can complete checkout with test card
- [ ] User plan upgraded in database
- [ ] Webhook logs show events received

---

## 🚨 TROUBLESHOOTING

### Webhook Returns 401 Unauthorized
**Problem:** Signing secret mismatch
**Fix:** Copy exact secret from Stripe Dashboard, paste in .env, restart backend

### Upgrade Button Does Nothing
**Problem:** Price IDs not set or incorrect
**Fix:** Verify Price IDs in .env match exactly what's in Stripe Dashboard

### Checkout Fails
**Problem:** Test mode vs Live mode mismatch
**Fix:** Ensure you're using live mode in both Dashboard and keys (pk_live_ / rk_live_)

### User Plan Not Upgraded
**Problem:** Webhook not receiving events
**Fix:**
1. Check webhook secret in .env
2. Restart backend
3. Send test webhook from Dashboard
4. Check logs: `pm2 logs titleiq-backend`

---

## 📊 FINAL STATUS

**Before Setup:** 95% complete
**After Setup:** 100% complete

**Time Investment:** ~12 minutes
**Result:** Fully functional billing system

---

## 📞 NEED HELP?

**Documentation:**
- Full guide: `BOSS_PRIME_FINAL_CLOSEOUT_COMPLETE.md`
- Deployment guide: `DEPLOY_PLAYBOOK.md`
- Stripe status: `backend/STRIPE_STATUS.json`

**Server Access:**
```bash
ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com
pm2 logs titleiq-backend
```

**Stripe Dashboard:**
- Webhooks: https://dashboard.stripe.com/webhooks
- Products: https://dashboard.stripe.com/products

---

**Created:** October 28, 2025
**For:** TitleIQ Production Deployment
**Status:** Ready to complete in 12 minutes 🚀
