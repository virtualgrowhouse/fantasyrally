# Namecheap DNS Configuration for wavetype.xyz

## Current Status
- Domain registered: ✅ wavetype.xyz
- Vercel deployment: ✅ Ready
- Issue: DNS pointing to wrong server

## Fix Steps:

### 1. Login to Namecheap
- Go to namecheap.com
- Sign in to your account

### 2. Manage Domain
- Dashboard → Domain List
- Find wavetype.xyz → Click "Manage"

### 3. Advanced DNS Settings
- Click "Advanced DNS" tab
- You'll see current records

### 4. Delete Old Records
Remove any existing:
- A Records pointing to 185.27.134.60
- CNAME records pointing elsewhere

### 5. Add New Records
Click "Add New Record" for each:

**Record 1:**
- Type: CNAME Record
- Host: @
- Value: cname.vercel-dns.com
- TTL: Automatic

**Record 2:**
- Type: CNAME Record
- Host: www
- Value: cname.vercel-dns.com
- TTL: Automatic

### 6. Save Changes
- Click "Save all changes"
- Wait for green confirmation

### 7. Verify (after 10-30 minutes)
Test commands:
```bash
nslookup wavetype.xyz
# Should show cname.vercel-dns.com

ping wavetype.xyz
# Should resolve to Vercel IP
```

### 8. Test Website
- Visit https://wavetype.xyz
- Should load your Fantasy Rally 3D car collection
- Check for SSL lock icon (secure connection)

## Troubleshooting
- If changes don't work after 1 hour, contact Namecheap support
- Verify you're editing the correct domain
- Clear your browser cache/DNS cache