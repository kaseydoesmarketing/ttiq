# Email Deliverability Setup for TitleIQ

## Overview
Configure SPF, DKIM, and DMARC DNS records for tightslice.com to ensure password reset emails don't land in spam.

## Current Configuration
- **Email Provider**: Resend (recommended)
- **From Address**: `TitleIQ <no-reply@tightslice.com>`
- **Environment Variable**: `RESEND_API_KEY`

## Required DNS Records

### 1. SPF (Sender Policy Framework)
**Purpose**: Authorizes Resend to send emails on behalf of tightslice.com

```
Type: TXT
Name: @ (or tightslice.com)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

### 2. DKIM (DomainKeys Identified Mail)
**Purpose**: Cryptographic signature to verify email authenticity

**Step 1**: Get your DKIM records from Resend
- Login to [Resend Dashboard](https://resend.com/domains)
- Add domain: `tightslice.com`
- Copy the DKIM record they provide

**Step 2**: Add to DNS (example format)
```
Type: TXT
Name: resend._domainkey (or as provided by Resend)
Value: [Resend will provide this value]
TTL: 3600
```

### 3. DMARC (Domain-based Message Authentication)
**Purpose**: Tells receiving servers what to do with emails that fail SPF/DKIM checks

```
Type: TXT
Name: _dmarc.tightslice.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@tightslice.com; ruf=mailto:dmarc@tightslice.com; fo=1
TTL: 3600
```

**DMARC Policy Breakdown**:
- `p=quarantine` - Put suspicious emails in spam (recommended for production)
- `p=none` - Monitor only (good for testing)
- `p=reject` - Block suspicious emails entirely (strict)
- `rua` - Aggregate report email address
- `ruf` - Forensic report email address
- `fo=1` - Generate report if any auth check fails

## Step-by-Step Setup

### 1. Set up Resend Domain
```bash
# Login to Resend Dashboard
# Navigate to: https://resend.com/domains
# Click "Add Domain"
# Enter: tightslice.com
# Copy the DNS records provided
```

### 2. Add DNS Records
Add all three DNS records (SPF, DKIM, DMARC) to your DNS provider (e.g., Cloudflare, Namecheap, etc.)

### 3. Verify DNS Propagation
```bash
# Check SPF
dig TXT tightslice.com | grep spf

# Check DKIM (replace with actual record name)
dig TXT resend._domainkey.tightslice.com

# Check DMARC
dig TXT _dmarc.tightslice.com
```

### 4. Verify in Resend Dashboard
- Return to Resend Domains page
- Click "Verify Domain"
- All checks should show green ✓

### 5. Test Email Delivery
```bash
# Send test email via API
curl -X POST https://titleiq.tightslice.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'

# Check spam score at https://mail-tester.com/
```

## Environment Variables Required

```bash
# In /var/www/titleiq/backend/.env
MAIL_PROVIDER=resend
MAIL_FROM="TitleIQ <no-reply@tightslice.com>"
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## Troubleshooting

### Emails still going to spam?
1. **Check DNS records are propagated** (can take 1-48 hours)
   ```bash
   dig TXT tightslice.com
   dig TXT _dmarc.tightslice.com
   ```

2. **Verify domain in Resend dashboard** shows all green checks

3. **Check SPF alignment** - From address domain must match SPF domain

4. **Warm up your domain** - Start with low volume, gradually increase

5. **Test with mail-tester.com** - Should score 8/10 or higher

### DMARC Reports Not Receiving?
- Create dedicated email: `dmarc@tightslice.com`
- Or use DMARC monitoring service (e.g., Postmark DMARC Digests)

## Security Best Practices

1. **Use dedicated subdomain** (optional but recommended)
   - Instead of `no-reply@tightslice.com`
   - Use `no-reply@mail.tightslice.com`
   - Isolates sending reputation from main domain

2. **Monitor DMARC reports** weekly for:
   - Unauthorized senders
   - Misconfigured SPF/DKIM
   - Spoofing attempts

3. **Start with `p=none`** then move to `p=quarantine` after 2 weeks of monitoring

4. **Keep DKIM keys rotated** - Resend handles this automatically

## Quick Reference

| Record Type | Name | Purpose | Priority |
|------------|------|---------|----------|
| SPF | @ | Authorize sender | Critical |
| DKIM | resend._domainkey | Cryptographic signature | Critical |
| DMARC | _dmarc | Policy enforcement | Important |

## Expected Results After Setup

- ✅ Password reset emails land in inbox (not spam)
- ✅ DMARC reports show 100% pass rate
- ✅ Mail-tester.com score: 8-10/10
- ✅ Resend dashboard shows "Verified" status

## Current Status

### Completed ✓
- Backend configured with Resend integration
- Password reset email templates ready
- Error handling for email failures
- Audit logging for email events

### TODO
- [ ] Add SPF record to DNS
- [ ] Add DKIM record from Resend to DNS
- [ ] Add DMARC record to DNS
- [ ] Verify domain in Resend dashboard
- [ ] Test email delivery to Gmail/Outlook
- [ ] Monitor DMARC reports for 1 week

## Support

- **Resend Docs**: https://resend.com/docs
- **SPF Record Checker**: https://mxtoolbox.com/spf.aspx
- **DMARC Checker**: https://mxtoolbox.com/dmarc.aspx
- **Email Tester**: https://mail-tester.com/
