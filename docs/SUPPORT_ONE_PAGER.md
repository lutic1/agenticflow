# Support One-Pager - Agentic Flow v2.0.0
## Quick Reference for Support Team

**Last Updated:** 2025-11-09
**Version:** 2.0.0

---

## 🚨 Common Error Codes

### Backend Errors (5xx)

| Code | Error | Cause | Solution |
|------|-------|-------|----------|
| **500** | Internal Server Error | Backend crash or unhandled exception | 1. Check backend logs<br>2. Restart backend service<br>3. Escalate if persistent |
| **502** | Bad Gateway | Backend not responding | 1. Verify backend is running (`npm run dev`)<br>2. Check port 3000<br>3. Restart if needed |
| **503** | Service Unavailable | Backend overloaded or starting up | 1. Wait 30 seconds<br>2. Refresh page<br>3. Check server resources |
| **504** | Gateway Timeout | Request took >30s | 1. Check network<br>2. Verify large file uploads<br>3. Retry with smaller data |

### Client Errors (4xx)

| Code | Error | Cause | Solution |
|------|-------|-------|----------|
| **400** | Bad Request | Invalid request data | 1. Check telemetry logs<br>2. Verify input format<br>3. Clear browser cache |
| **401** | Unauthorized | Invalid or missing auth token | 1. Log out and log back in<br>2. Clear cookies<br>3. Check token expiration |
| **403** | Forbidden | Insufficient permissions | 1. Verify user role<br>2. Check feature flags<br>3. Contact admin |
| **404** | Not Found | Resource doesn't exist | 1. Verify presentation ID<br>2. Check if deleted<br>3. Try creating new |
| **429** | Too Many Requests | Rate limit exceeded | 1. Wait 60 seconds<br>2. Reduce request frequency<br>3. Check for loops |

### Frontend Errors (Custom)

| Code | Error | Cause | Solution |
|------|-------|-------|----------|
| **NETWORK_ERROR** | Network Connection Failed | No internet or backend down | 1. Check internet connection<br>2. Verify backend running<br>3. Check firewall |
| **VALIDATION_ERROR** | Invalid Input | Failed Zod validation | 1. Check telemetry for details<br>2. Verify input format<br>3. Clear form and retry |
| **TIMEOUT_ERROR** | Request Timeout | Request took >30s | 1. Check file size<br>2. Try with smaller data<br>3. Check network speed |
| **RENDER_ERROR** | Component Render Failed | React error boundary caught error | 1. Refresh page<br>2. Clear browser cache<br>3. Check browser console |

---

## 📋 How to Capture Logs

### 1. Telemetry Logs (Recommended)

**User Action:**
1. Click hamburger menu (☰) in top right
2. Click "Developer Dashboard"
3. Click "Export Logs" button
4. Save file to desktop
5. Send to support team

**What You Get:**
- Last 1000 telemetry events
- API call timings
- Error stack traces
- User journey breadcrumbs
- Browser and device info

### 2. Browser Console Logs

**User Action:**
1. Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
2. Click "Console" tab
3. Right-click in console
4. Select "Save as..." → Save to desktop
5. Send to support team

**What You Get:**
- JavaScript errors
- Network requests
- React warnings
- Performance metrics

### 3. Network Logs

**User Action:**
1. Press F12 to open DevTools
2. Click "Network" tab
3. Reproduce the issue
4. Right-click in network panel
5. Select "Save all as HAR" → Save to desktop
6. Send to support team

**What You Get:**
- All API requests/responses
- Request headers
- Response times
- Status codes

---

## 🔍 Troubleshooting Flowchart

```
┌─────────────────────────┐
│  User Reports Issue     │
└───────────┬─────────────┘
            │
            ▼
    ┌───────────────┐
    │ Can they load │ NO ──► Check internet connection
    │   the page?   │        Check backend status (port 3000)
    └───────┬───────┘        Verify URL is correct
            │ YES
            ▼
    ┌───────────────┐
    │ Is it a       │ YES ──► Follow P2 Known Issues section
    │ P2 feature?   │         (AR, NFT, 3D animations)
    └───────┬───────┘
            │ NO
            ▼
    ┌───────────────┐
    │ Is there an   │ YES ──► Request telemetry logs
    │ error message?│         Check error code table
    └───────┬───────┘         Follow solution steps
            │ NO
            ▼
    ┌───────────────┐
    │ Does it work  │ YES ──► Browser compatibility issue
    │ in Chrome?    │         Update browser or try Chrome
    └───────┬───────┘
            │ NO
            ▼
    ┌───────────────┐
    │ Clear cache   │ ──────► Hard refresh (Ctrl+Shift+R)
    │ and retry     │         Clear cookies
    └───────┬───────┘         Restart browser
            │
            ▼
        Still fails? ──────► ESCALATE TO ENGINEERING
```

---

## 🐛 Known Issues & Workarounds

### P2 Features (Experimental)

#### AR Presentation (P2.2) - Low Completion Rate (38%)

**Symptoms:**
- User stuck on calibration step 3/5
- Camera permission denied
- "WebXR not supported" error

**Workarounds:**
1. **Use standard presentation mode** - Click "Present" instead of "AR Present"
2. **Try on different device** - Works best on iPhone 12+ or Android 11+
3. **Check browser** - Safari 15.2+ or Chrome 90+ required

**When to Escalate:** If user must use AR (rare)

---

#### NFT Minting (P2.8) - Very Low Completion Rate (8%)

**Symptoms:**
- "Install MetaMask" error
- "Connect wallet" stuck
- "Transaction failed" error

**Workarounds:**
1. **Skip NFT feature** - Most users don't need blockchain
2. **Alternative: Email receipt** - Use "Email Certificate" instead
3. **Tutorial** - Send beginner guide: `/docs/NFT_TUTORIAL.md`

**When to Escalate:** Never (feature is optional)

---

#### 3D Animations (P2.1) - Performance Issues

**Symptoms:**
- Page freezes on "3D Chart" button
- "Out of memory" error
- Slow rendering

**Workarounds:**
1. **Use 2D charts** - Click "Bar Chart" instead of "3D Bar Chart"
2. **Check device** - Feature disabled on devices <2GB RAM
3. **Restart browser** - Close other tabs

**When to Escalate:** If user has high-end device and still fails

---

### Common Frontend Issues

#### "Failed to connect to backend"

**Symptoms:**
- Error: `NETWORK_ERROR`
- All buttons show spinning loader
- Telemetry shows 0 API calls

**Solutions:**
1. Check backend is running: `curl http://localhost:3000/api/health`
2. If 404: Start backend with `npm run dev` in root directory
3. If connection refused: Check firewall blocking port 3000

---

#### "Presentation won't load"

**Symptoms:**
- Stuck on loading screen >10 seconds
- Error: `TIMEOUT_ERROR`
- Network tab shows pending request

**Solutions:**
1. Check presentation size - If >50 slides, may take longer
2. Check network speed - Download telemetry logs to verify
3. Try with fewer slides - Create test with 5 slides

---

#### "Export button does nothing"

**Symptoms:**
- Click "Export" → Nothing happens
- No error message
- Telemetry shows API call succeeded

**Solutions:**
1. Check browser pop-up blocker - Allow downloads from site
2. Check download location - May be in Downloads folder
3. Try different format - If PDF fails, try PPTX

---

## 📊 Escalation Procedures

### Tier 1 → Tier 2 Escalation

**When to escalate:**
- Issue persists after 2 troubleshooting attempts
- User reports data loss
- Security concern (e.g., "Someone accessed my presentation")
- Backend error (5xx) that persists after restart

**What to include:**
1. **Telemetry logs** (from user)
2. **Browser console logs** (from user)
3. **Steps to reproduce** (detailed)
4. **User environment** (browser, OS, device)
5. **Troubleshooting attempts** (what you tried)

---

### Tier 2 → Engineering Escalation

**When to escalate:**
- Backend error persists after server restart
- Data corruption or loss
- Security vulnerability discovered
- New bug not in known issues

**What to include:**
1. **All Tier 1 → Tier 2 information**
2. **HAR file** (network logs)
3. **Backend logs** (if available)
4. **Database state** (if data corruption)
5. **Severity** (P0=critical, P1=high, P2=medium, P3=low)

---

## 🎯 Quick Fixes

### "Clear cache and retry"

```bash
# Chrome/Edge
Ctrl + Shift + Delete → Clear browsing data → Cached images and files

# Firefox
Ctrl + Shift + Delete → Cache → Clear Now

# Safari
Cmd + Option + E → Empty Caches
```

### "Hard refresh"

```bash
# Windows/Linux
Ctrl + Shift + R

# Mac
Cmd + Shift + R
```

### "Reset to defaults"

**User Action:**
1. Click hamburger menu (☰)
2. Click "Settings"
3. Scroll to bottom
4. Click "Reset to Defaults"
5. Refresh page (F5)

---

## 🔐 Security Issues

### User Reports "Unauthorized access"

**Immediate Actions:**
1. Log user out immediately
2. Invalidate all sessions: `DELETE /api/sessions/:userId`
3. Force password reset
4. Enable 2FA if available
5. Escalate to Security Team

**Do NOT:**
- Tell user "it's probably nothing"
- Wait to escalate
- Ask user for sensitive info over email

---

### User Reports "Data leaked"

**Immediate Actions:**
1. Stop all operations
2. Escalate to Security Team immediately
3. Document everything user reports
4. Do NOT ask for proof (may contain sensitive data)
5. Follow incident response protocol

---

## 📞 Contact Information

### Internal Support Channels

| Team | Contact | SLA |
|------|---------|-----|
| **Tier 1 Support** | support@agenticflow.com | 4 hours |
| **Tier 2 Support** | support-escalation@agenticflow.com | 1 business day |
| **Engineering** | engineering@agenticflow.com | 2 business days |
| **Security Team** | security@agenticflow.com | Immediate |
| **On-Call (P0)** | +1-555-0123 | Immediate |

### External Resources

| Resource | URL | Notes |
|----------|-----|-------|
| **Documentation** | `/home/user/agenticflow/docs/` | Complete docs |
| **API Guide** | `/docs/slide-designer/API_CLIENT_GUIDE.md` | Backend integration |
| **Runbook** | `/Frontend/docs/DEVELOPER_RUNBOOK.md` | Debugging guide |
| **GitHub Issues** | https://github.com/ruvnet/agenticflow/issues | Public bug tracker |

---

## 📝 Support Templates

### Email Response: "Issue Fixed"

```
Subject: [RESOLVED] Presentation Won't Load - Ticket #12345

Hi [User Name],

Great news! I've resolved your issue with the presentation not loading.

The problem was: [Brief explanation]

What I did: [Steps taken]

You should now be able to:
1. [First thing they can do]
2. [Second thing they can do]

If you encounter any other issues, please don't hesitate to reach out.

Best regards,
[Your Name]
Support Team
```

---

### Email Response: "Escalated to Engineering"

```
Subject: Update on Presentation Export Issue - Ticket #12345

Hi [User Name],

Thank you for your patience. I've escalated your export issue to our engineering team for further investigation.

What this means:
- Engineers are actively investigating
- Expected resolution: [timeframe]
- You'll receive updates via email

In the meantime, here's a workaround:
[Temporary solution if available]

Ticket Reference: #12345
Escalation ID: ENG-789

Best regards,
[Your Name]
Support Team
```

---

## 🎓 Training Resources

**New Support Team Members:**
1. Read `/Frontend/docs/TESTING_STRATEGY.md` - Understand testing
2. Read `/Frontend/docs/DEVELOPER_RUNBOOK.md` - Debugging guide
3. Practice with test presentation: http://localhost:3000/presentations/demo/edit
4. Shadow 5 Tier 1 → Tier 2 escalations
5. Complete quiz (see manager)

**Refresher Training:**
- Monthly: New feature updates
- Quarterly: Security training
- Annually: Full system review

---

## ✅ Quick Checklist

Before escalating to Tier 2:
- [ ] Collected telemetry logs
- [ ] Tried hard refresh (Ctrl+Shift+R)
- [ ] Verified backend is running
- [ ] Checked known issues section
- [ ] Attempted at least 2 solutions
- [ ] Documented all troubleshooting steps

Before escalating to Engineering:
- [ ] All Tier 2 checklist items
- [ ] Collected HAR file (network logs)
- [ ] Verified issue is reproducible
- [ ] Checked GitHub issues for duplicates
- [ ] Determined severity (P0-P3)
- [ ] Notified user of escalation

---

**Version:** 2.0.0
**Last Updated:** 2025-11-09
**Next Review:** 2025-12-09
