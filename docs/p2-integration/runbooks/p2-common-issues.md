# P2 Common Issues - Quick Resolution Guide

**Version**: 1.0
**Last Updated**: 2025-11-08
**Owner**: SRE Team
**Audience**: On-call engineers, support team

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [P0 Protection Issues](#p0-protection-issues)
3. [Voice Narration Issues](#voice-narration-issues)
4. [Developer API Issues](#developer-api-issues)
5. [Interactive Elements Issues](#interactive-elements-issues)
6. [Themes Marketplace Issues](#themes-marketplace-issues)
7. [3D Animations Issues](#3d-animations-issues)
8. [Figma/Sketch Import Issues](#figmassketch-import-issues)
9. [AR Mode Issues](#ar-mode-issues)
10. [Blockchain NFT Issues](#blockchain-nft-issues)
11. [General Troubleshooting](#general-troubleshooting)

---

## Quick Reference

### Emergency Commands

```bash
# Disable ALL P2 features immediately (P0 protection)
npx claude-flow@alpha feature-flag disable-all-p2

# Disable specific P2 feature
npx claude-flow@alpha feature-flag disable ENABLE_VOICE_NARRATION

# Check feature flag status
npx claude-flow@alpha feature-flag status

# Check P0 impact metrics
curl -s 'http://prometheus:9090/api/v1/query?query=p2_p0_latency_impact_ratio' | jq

# View P2 error budget consumption
curl -s 'http://prometheus:9090/api/v1/query?query=p2_error_budget_consumed' | jq

# Check daily cost
curl -s 'http://prometheus:9090/api/v1/query?query=sum(increase(p2_feature_cost_usd[24h]))' | jq
```

---

### Dashboards Quick Links

- **P0 Protection**: https://monitoring.agenticflow.io/p2-p0-protection
- **P2 Overview**: https://monitoring.agenticflow.io/p2-overview
- **Cost Tracking**: https://monitoring.agenticflow.io/p2-costs
- **Error Budgets**: https://monitoring.agenticflow.io/p2-error-budget

---

### Escalation Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| P0 Impact | @sre-oncall (Page) | Immediate |
| Security | @security-team (Page) | 15 minutes |
| Cost Overrun | @finance-team (Slack) | 1 hour |
| Feature Bug | @feature-owner (Slack) | Business hours |

---

## P0 Protection Issues

### Issue: P2 Degrading P0 Performance

**Symptoms**:
- Alert: "P2 features causing >10% P0 degradation"
- P0 latency increased
- P0 error rate elevated

**Quick Check**:
```bash
# Check P0 impact ratio
prometheus_query "p2_p0_latency_impact_ratio"
# Expected: <1.10 (less than 10% increase)

# Check which P2 features are enabled
npx claude-flow@alpha feature-flag list | grep "true"
```

**Resolution**:
1. **IMMEDIATE**: System auto-disables all P2 features
2. Verify auto-disable worked:
   ```bash
   npx claude-flow@alpha feature-flag status
   # All P2 flags should show "false"
   ```
3. Monitor P0 recovery:
   ```bash
   watch -n 5 'prometheus_query "p0_latency_p95"'
   ```
4. Page on-call if P0 doesn't recover in 5 minutes

**Root Causes**:
- P2 feature consuming excessive resources (CPU/memory)
- P2 feature blocking critical code paths
- Database query from P2 feature causing locks
- Memory leak in P2 feature

**Prevention**:
- Add resource limits to P2 features
- Implement circuit breakers
- Regular load testing with P2 enabled

---

### Issue: P2 Auto-Disable Not Working

**Symptoms**:
- P0 degradation alert but P2 still enabled
- Auto-remediation script failed

**Quick Check**:
```bash
# Check auto-remediation logs
journalctl -u p2-auto-remediate -n 100 --no-pager

# Check feature flag service status
systemctl status feature-flag-service
```

**Resolution**:
1. **MANUAL DISABLE**:
   ```bash
   npx claude-flow@alpha feature-flag disable-all-p2 --force
   ```
2. Check why auto-disable failed:
   - Feature flag service down?
   - Network connectivity issue?
   - Script permission error?
3. Page SRE lead if manual disable also fails
4. File incident report for auto-disable failure

**Root Causes**:
- Feature flag service outage
- Script execution error
- Insufficient permissions
- Network partition

**Prevention**:
- Monitor auto-remediation script health
- Test auto-disable monthly
- Add redundant disable mechanisms

---

## Voice Narration Issues

### Issue: TTS Generation Slow (>10s)

**Symptoms**:
- Voice narration taking >10 seconds
- User complaints about wait time
- p95 latency >10s

**Quick Check**:
```bash
# Check current TTS latency
prometheus_query "histogram_quantile(0.95, rate(p2_feature_request_duration_seconds_bucket{feature=\"voice_narration\"}[5m]))"

# Check OpenAI API status
curl https://status.openai.com/api/v2/status.json | jq '.status.description'
```

**Resolution**:
1. Check if OpenAI API is degraded
2. If API slow, switch provider:
   ```bash
   # Switch to ElevenLabs temporarily
   kubectl set env deployment/voice-narration TTS_PROVIDER=elevenlabs
   ```
3. If both providers slow, consider:
   - Reducing audio length
   - Lowering quality settings temporarily
   - Adding "Slow generation expected" notice

**Root Causes**:
- OpenAI/ElevenLabs API congestion
- Network latency to API
- Long text input (>5000 characters)
- High concurrent requests

**Prevention**:
- Multi-provider failover
- Text length limits
- Request queuing
- User expectations management

---

### Issue: Voice Narration Cost Spike

**Symptoms**:
- Daily cost approaching $150 limit
- Alert: "Cost budget >75%"
- Unexpected API usage

**Quick Check**:
```bash
# Check current daily cost
prometheus_query "sum(increase(p2_feature_cost_usd{feature=\"voice_narration\"}[24h]))"

# Check top users by usage
prometheus_query "topk(10, sum by (user_id) (rate(p2_voice_narration_requests_total[1h])))"

# Check if abuse detected
prometheus_query "rate(p2_voice_narration_requests_total[5m]) > 10"
# (>10 requests/sec is suspicious)
```

**Resolution**:
1. Identify high-usage users
2. Check for:
   - Automated scripts hitting API
   - Users in infinite loops
   - API abuse
3. Implement immediate rate limiting:
   ```bash
   # Reduce per-user quota
   kubectl set env deployment/voice-narration USER_DAILY_QUOTA=25
   ```
4. If abuse detected, temporarily block user:
   ```bash
   redis-cli SETEX "voice:blocked:user_123" 86400 "1"
   ```

**Root Causes**:
- API abuse/spam
- User script in infinite loop
- Missing rate limiting
- Caching not working

**Prevention**:
- Per-user quotas (50/day)
- Duplicate request detection
- Response caching (24h TTL)
- Anomaly detection

---

### Issue: Voice Quality Complaints

**Symptoms**:
- User reports robotic/unnatural voices
- Quality score <90%
- Mispronunciations

**Quick Check**:
```bash
# Check quality score trend
prometheus_query "avg(p2_voice_quality_score) * 100"

# Test sample narration
curl -X POST https://api.agenticflow.io/v1/narrate \
  -H "Authorization: Bearer ${API_KEY}" \
  -d '{"text": "The quick brown fox jumps over the lazy dog.", "voice": "alloy"}'
```

**Resolution**:
1. Test different voices to isolate issue
2. Check if specific voice model degraded
3. Switch to different model:
   ```javascript
   // Update default voice
   {
     "voice": "nova",  // Try: alloy, echo, fable, onyx, nova, shimmer
     "model": "tts-1-hd"  // Higher quality model
   }
   ```
4. If widespread, file ticket with OpenAI support

**Root Causes**:
- TTS model quality degradation
- Inappropriate voice selection
- Text formatting issues (HTML, markdown)
- Unsupported language

**Prevention**:
- Voice quality monitoring
- A/B testing different models
- Text preprocessing
- User voice selection options

---

## Developer API Issues

### Issue: API High Latency (>500ms)

**Symptoms**:
- p95 API response time >500ms
- Developer complaints
- Timeout errors

**Quick Check**:
```bash
# Check API latency by endpoint
prometheus_query "histogram_quantile(0.95, sum by (operation) (rate(p2_feature_request_duration_seconds_bucket{feature=\"developer_api\"}[5m])))"

# Check database query performance
psql -U postgres -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check API server CPU/memory
kubectl top pods -l app=developer-api
```

**Resolution**:
1. Identify slow endpoints
2. Check for:
   - Slow database queries (missing indexes)
   - N+1 query problems
   - Large response payloads
3. Quick fixes:
   ```bash
   # Enable query caching
   kubectl set env deployment/developer-api ENABLE_QUERY_CACHE=true

   # Increase cache TTL
   kubectl set env deployment/developer-api CACHE_TTL=300

   # Add missing database index (example)
   psql -U postgres -c "CREATE INDEX CONCURRENTLY idx_presentations_user_id ON presentations(user_id);"
   ```

**Root Causes**:
- Missing database indexes
- Inefficient queries
- High traffic volume
- Cache not enabled

**Prevention**:
- Query performance monitoring
- Automated index suggestions
- Load testing
- Response caching (Redis)

---

### Issue: API Rate Limiting Too Aggressive

**Symptoms**:
- Many 429 errors
- Developers complaining about limits
- Rate limit events >100/hour

**Quick Check**:
```bash
# Check rate limit events
prometheus_query "sum(increase(p2_api_rate_limit_events_total[1h]))"

# Check which users hitting limits
redis-cli KEYS "ratelimit:*" | head -20
```

**Resolution**:
1. Review current rate limits:
   ```bash
   # Check configured limits
   kubectl get configmap developer-api-config -o yaml | grep -A 5 "rate_limits"
   ```
2. If limits too strict, temporarily increase:
   ```bash
   # Increase free tier limit
   kubectl set env deployment/developer-api FREE_TIER_LIMIT=200
   ```
3. Communicate with affected developers
4. Review if paid tier appropriate

**Root Causes**:
- Rate limits set too conservatively
- Legitimate high-volume use case
- Bot traffic not identified
- Retry storms

**Prevention**:
- Tiered rate limiting (free/pro/enterprise)
- User-specific overrides
- Backoff recommendations in docs
- Rate limit headers (X-RateLimit-*)

---

### Issue: Webhook Delivery Failures

**Symptoms**:
- Webhook delivery <98%
- User complaints about missed events
- Webhook queue backing up

**Quick Check**:
```bash
# Check webhook delivery rate
prometheus_query "rate(p2_webhook_delivered_total[5m]) / rate(p2_webhook_attempted_total[5m]) * 100"

# Check webhook queue size
redis-cli LLEN webhook_queue

# Check failed webhooks
redis-cli LRANGE webhook_failed 0 10
```

**Resolution**:
1. Check webhook endpoint health:
   ```bash
   # Test webhook endpoint
   curl -X POST https://user-webhook-url.com/webhook \
     -H "Content-Type: application/json" \
     -d '{"event": "test", "data": {}}'
   ```
2. Review failed webhooks for patterns:
   - Timeouts (user endpoint slow)
   - SSL errors
   - Authentication failures
3. Retry failed webhooks:
   ```bash
   # Trigger retry job
   kubectl create job webhook-retry-manual --from=cronjob/webhook-retry
   ```

**Root Causes**:
- User webhook endpoint down
- User endpoint slow/timeout
- SSL certificate issues
- Firewall blocking requests

**Prevention**:
- Webhook retry logic (exponential backoff)
- Webhook health monitoring
- User webhook health dashboard
- Dead letter queue

---

## Interactive Elements Issues

### Issue: WebSocket Disconnections

**Symptoms**:
- Frequent WebSocket disconnects
- Real-time sync not working
- Response collection rate <99%

**Quick Check**:
```bash
# Check WebSocket connection count
prometheus_query "p2_interactive_websocket_connections_active"

# Check disconnection rate
prometheus_query "rate(p2_interactive_websocket_disconnects_total[5m])"

# Check WebSocket server health
kubectl top pods -l app=interactive-websocket
```

**Resolution**:
1. Check WebSocket server capacity:
   ```bash
   # Current connections per pod
   kubectl exec -it $(kubectl get pod -l app=interactive-websocket -o name | head -1) -- netstat -an | grep ESTABLISHED | wc -l
   ```
2. If near capacity, scale up:
   ```bash
   kubectl scale deployment interactive-websocket --replicas=5
   ```
3. Check for network issues:
   ```bash
   # Test WebSocket endpoint
   wscat -c wss://api.agenticflow.io/interactive/ws
   ```

**Root Causes**:
- Server overload (too many connections)
- Network instability
- Load balancer timeout
- Client-side connection issues

**Prevention**:
- Auto-scaling based on connections
- Connection pooling
- Sticky sessions (affinity)
- Heartbeat/keepalive

---

### Issue: Response Data Loss

**Symptoms**:
- Missing poll/quiz responses
- Data integrity <99.9%
- User complaints about lost votes

**Quick Check**:
```bash
# Check data integrity metric
prometheus_query "p2_interactive_data_integrity_rate * 100"

# Check database for duplicates
psql -U postgres -c "SELECT response_id, COUNT(*) FROM interactive_responses GROUP BY response_id HAVING COUNT(*) > 1 LIMIT 10;"

# Check for transaction errors
grep "ROLLBACK" /var/log/postgresql/postgresql.log | tail -20
```

**Resolution**:
1. Identify pattern in data loss:
   - Specific element type (poll vs quiz)?
   - Specific time window?
   - High concurrency events?
2. Check database transaction logs
3. Implement immediate fixes:
   ```bash
   # Enable transaction-level durability
   kubectl set env deployment/interactive-service DB_SYNC_COMMIT=on

   # Add idempotency keys
   kubectl set env deployment/interactive-service ENABLE_IDEMPOTENCY=true
   ```

**Root Causes**:
- Race conditions
- Database transaction failures
- Duplicate submissions not deduplicated
- Network retries causing duplicates

**Prevention**:
- Idempotency keys
- Optimistic locking
- Database transactions
- Comprehensive testing

---

## Themes Marketplace Issues

### Issue: Malware Detection Alert

**Symptoms**:
- Alert: "Malware detected in theme"
- ClamAV scan failure
- User report of suspicious behavior

**CRITICAL**: This is a security incident. Follow immediately:

**Immediate Actions**:
1. **AUTO-QUARANTINE** (automated):
   ```bash
   # Verify theme quarantined
   redis-cli GET "theme:quarantine:theme_id_123"
   ```
2. **Disable theme**:
   ```bash
   psql -U postgres -c "UPDATE themes SET status='quarantined', active=false WHERE id='theme_id_123';"
   ```
3. **Notify security team**:
   ```bash
   # Page security team
   curl -X POST https://api.pagerduty.com/incidents \
     -H "Authorization: Token ${PAGERDUTY_TOKEN}" \
     -d '{"incident": {"title": "Malware detected in marketplace theme", "urgency": "high"}}'
   ```
4. **Audit publisher**:
   ```bash
   # List all themes from publisher
   psql -U postgres -c "SELECT id, name, downloads FROM themes WHERE publisher_id='pub_456' AND active=true;"
   ```
5. **Ban publisher** (after review):
   ```bash
   psql -U postgres -c "UPDATE publishers SET banned=true, banned_reason='Malware upload' WHERE id='pub_456';"
   ```

**Investigation**:
```bash
# Download theme for analysis
aws s3 cp s3://marketplace-themes/theme_id_123.zip /tmp/

# Extract and scan
unzip /tmp/theme_id_123.zip -d /tmp/theme_analysis
clamscan -r /tmp/theme_analysis

# Check for common malware patterns
grep -r "eval(" /tmp/theme_analysis
grep -r "document.write" /tmp/theme_analysis
grep -r "<script src=" /tmp/theme_analysis | grep -v "https://cdn.agenticflow.io"
```

**Communication**:
- Notify affected users (who downloaded theme)
- Post security advisory
- Update security scanning rules

---

### Issue: Theme Approval Queue Backlog

**Symptoms**:
- Moderation queue >50 themes
- User complaints about slow approval
- Themes pending >48 hours

**Quick Check**:
```bash
# Check queue size
prometheus_query "p2_marketplace_moderation_queue_size"

# List pending themes
psql -U postgres -c "SELECT id, name, submitted_at FROM themes WHERE status='pending_review' ORDER BY submitted_at ASC LIMIT 20;"
```

**Resolution**:
1. Prioritize queue:
   - Auto-approve from trusted publishers
   - Fast-track simple themes
   - Batch review similar themes
2. Adjust auto-approval thresholds:
   ```bash
   # Lower quality threshold temporarily
   kubectl set env deployment/marketplace AUTO_APPROVE_THRESHOLD=85
   ```
3. Request additional moderator help:
   ```bash
   # Notify moderation team
   slack-cli post -C moderation-team "Queue backlog: 50+ themes. Need help reviewing."
   ```

**Root Causes**:
- Spam submissions
- Insufficient moderators
- Manual review too strict
- Holidays/weekends

**Prevention**:
- Automated quality scoring
- Trusted publisher auto-approval
- Weekend moderation coverage
- Better submission limits

---

## 3D Animations Issues

### Issue: Low Frame Rate (<24 FPS)

**Symptoms**:
- FPS <24 for >30% users
- Janky animations
- User complaints about performance

**Quick Check**:
```bash
# Check FPS distribution
prometheus_query "histogram_quantile(0.50, rate(p2_render_fps_bucket[5m]))"

# Check GPU memory usage
prometheus_query "p2_memory_usage_bytes{feature=\"3d_animations\"} / 1048576"

# Check browser compatibility
prometheus_query "sum by (browser) (rate(p2_3d_sessions_total[1h]))"
```

**Resolution**:
1. Implement quality presets:
   ```javascript
   // Auto-detect and adjust quality
   if (avgFPS < 24) {
     setQualityPreset('low');  // Reduce polygon count, texture resolution
   } else if (avgFPS < 45) {
     setQualityPreset('medium');
   } else {
     setQualityPreset('high');
   }
   ```
2. Enable LOD (Level of Detail):
   ```javascript
   // Reduce detail for distant objects
   camera.updateProjectionMatrix();
   scene.traverse((object) => {
     if (object.isMesh) {
       const distance = camera.position.distanceTo(object.position);
       object.material.wireframe = (distance > 100);
     }
   });
   ```
3. If widespread, consider temporary disable

**Root Causes**:
- Low-end devices
- Complex 3D models
- Too many objects in scene
- Inefficient shaders

**Prevention**:
- Device capability detection
- Adaptive quality settings
- Model optimization
- Performance budgets

---

### Issue: WebGL Context Loss

**Symptoms**:
- 3D rendering stops working
- Error: "WebGL context lost"
- Browser becomes unresponsive

**Quick Check**:
```bash
# Check context loss rate
prometheus_query "rate(p2_3d_context_lost_total[5m])"

# Check GPU memory usage
prometheus_query "p2_gpu_utilization_ratio * 100"
```

**Resolution**:
1. Implement context loss handling:
   ```javascript
   canvas.addEventListener('webglcontextlost', (event) => {
     event.preventDefault();
     // Stop rendering loop
     cancelAnimationFrame(animationId);
     // Show user message
     showNotification('3D rendering paused. Reloading...');
   });

   canvas.addEventListener('webglcontextrestored', () => {
     // Reinitialize WebGL
     initWebGL();
     // Reload textures and shaders
     reloadResources();
     // Resume rendering
     animate();
   });
   ```
2. Reduce GPU memory usage:
   - Compress textures
   - Reduce geometry complexity
   - Dispose unused objects
3. Add fallback to 2D mode

**Root Causes**:
- GPU memory exhaustion
- Driver issues
- Too many WebGL contexts
- Memory leaks

**Prevention**:
- Memory monitoring
- Resource disposal
- Texture compression
- Single WebGL context per page

---

## Figma/Sketch Import Issues

### Issue: Import Failures (Success Rate <95%)

**Symptoms**:
- Import errors
- Designs not converting
- User frustration

**Quick Check**:
```bash
# Check import success rate
prometheus_query "rate(p2_import_success_total[5m]) / rate(p2_import_attempts_total[5m]) * 100"

# Check error types
prometheus_query "sum by (error_type) (rate(p2_import_errors_total[5m]))"

# Check Figma API status
curl https://status.figma.com/api/v2/status.json | jq '.status.description'
```

**Resolution**:
1. Identify error patterns:
   ```bash
   # List recent import errors
   kubectl logs -l app=design-import --tail=100 | grep "ERROR"
   ```
2. Common fixes:
   - **Figma API down**: Show user message, retry later
   - **Invalid file ID**: Validate Figma URL format
   - **Permission denied**: Check OAuth token, re-authenticate
   - **File too large**: Add file size limits
3. Manual import test:
   ```bash
   # Test import specific file
   curl -X POST https://api.agenticflow.io/v1/import/figma \
     -H "Authorization: Bearer ${API_KEY}" \
     -d '{"file_id": "abc123", "node_id": "1:5"}'
   ```

**Root Causes**:
- Figma API outage
- Invalid Figma file IDs
- OAuth token expired
- Unsupported Figma features

**Prevention**:
- Figma API health monitoring
- Better error messages
- Feature support detection
- Automatic retry logic

---

### Issue: Import Cost Spike

**Symptoms**:
- Daily Figma API cost >$50
- Approaching budget limit

**Quick Check**:
```bash
# Check daily import cost
prometheus_query "sum(increase(p2_feature_cost_usd{feature=\"design_import\",provider=\"figma\"}[24h]))"

# Check import volume
prometheus_query "sum(increase(p2_import_attempts_total{source=\"figma\"}[24h]))"

# Check top users
prometheus_query "topk(10, sum by (user_id) (rate(p2_import_attempts_total[1h])))"
```

**Resolution**:
1. Identify high-volume users
2. Implement rate limiting:
   ```bash
   # Reduce per-user quota
   kubectl set env deployment/design-import USER_DAILY_IMPORT_LIMIT=10
   ```
3. Enable caching:
   ```bash
   # Cache imported designs for 24 hours
   kubectl set env deployment/design-import ENABLE_IMPORT_CACHE=true
   kubectl set env deployment/design-import CACHE_TTL=86400
   ```

**Root Causes**:
- Users re-importing same designs
- No caching implemented
- Automated scripts
- Missing rate limits

**Prevention**:
- Per-user import quotas (10/day)
- Design caching (24h TTL)
- Duplicate detection
- Cost monitoring alerts

---

## AR Mode Issues

### Issue: AR Session Initialization Failures

**Symptoms**:
- AR mode won't start
- Error: "WebXR not supported"
- Initialization timeout

**Quick Check**:
```bash
# Check AR initialization success rate
prometheus_query "rate(p2_ar_init_success_total[5m]) / rate(p2_ar_init_attempts_total[5m]) * 100"

# Check browser/device distribution
prometheus_query "sum by (browser, device) (rate(p2_ar_sessions_total[1h]))"
```

**Resolution**:
1. Check browser/device compatibility:
   ```javascript
   if ('xr' in navigator) {
     navigator.xr.isSessionSupported('immersive-ar')
       .then((supported) => {
         if (!supported) {
           showError('Your device does not support AR');
         }
       });
   } else {
     showError('Your browser does not support WebXR');
   }
   ```
2. Add browser/device detection:
   ```javascript
   const supportedDevices = [
     { browser: 'Chrome', minVersion: 79, platform: 'Android' },
     { browser: 'Safari', minVersion: 13, platform: 'iOS' }
   ];
   ```
3. Implement graceful fallback:
   ```javascript
   // Fallback to marker-based AR or regular view
   if (!xrSupported) {
     initMarkerBasedAR();  // Fallback option
   }
   ```

**Root Causes**:
- Unsupported browser/device
- WebXR feature not enabled
- HTTPS requirement not met
- Permissions denied (camera)

**Prevention**:
- Pre-flight compatibility check
- Clear error messages
- Fallback modes
- Browser/device documentation

---

### Issue: AR Tracking Poor Quality

**Symptoms**:
- Jittery AR content
- Drift over time
- Tracking accuracy <90%

**Quick Check**:
```bash
# Check tracking accuracy
prometheus_query "avg(p2_ar_tracking_accuracy) * 100"

# Check session duration (short sessions indicate problems)
prometheus_query "histogram_quantile(0.50, rate(p2_ar_session_duration_seconds_bucket[5m]))"
```

**Resolution**:
1. Implement tracking quality detection:
   ```javascript
   // Monitor tracking quality
   frame.getHitTestResults(hitTestSource).forEach((hitTestResult) => {
     const trackingQuality = hitTestResult.trackingState;
     if (trackingQuality === 'limited') {
       showWarning('Move to a well-lit area with more features');
     }
   });
   ```
2. Add user guidance:
   - "Move slowly"
   - "Ensure good lighting"
   - "Point at surfaces with texture"
3. Implement SLAM improvements:
   - Use plane detection
   - Use anchor points
   - Combine multiple tracking modes

**Root Causes**:
- Poor lighting conditions
- Featureless surfaces (white walls)
- Fast device movement
- Device sensor limitations

**Prevention**:
- Environment quality detection
- User guidance system
- Marker-based fallback
- Quality monitoring

---

## Blockchain NFT Issues

### Issue: NFT Minting Stuck/Pending

**Symptoms**:
- Transactions pending >10 minutes
- User frustration
- Minting timeout errors

**Quick Check**:
```bash
# Check pending transactions
prometheus_query "p2_blockchain_pending_transactions"

# Check average confirmation time
prometheus_query "p2_blockchain_confirmation_time_seconds"

# Check network status
curl https://api.etherscan.io/api?module=gastracker&action=gasoracle | jq
```

**Resolution**:
1. Check blockchain network congestion:
   - Etherscan gas tracker
   - Mempool status
2. Options:
   - **Wait**: If gas reasonable, transaction will confirm
   - **Speed up**: Increase gas price
   - **Cancel**: Issue cancellation transaction
   - **Switch network**: Use Polygon instead
3. Speed up transaction:
   ```javascript
   // Resubmit with higher gas price
   const newGasPrice = oldGasPrice * 1.5;
   web3.eth.sendTransaction({
     ...originalTx,
     gasPrice: newGasPrice,
     nonce: originalTx.nonce  // Same nonce to replace
   });
   ```

**Root Causes**:
- Network congestion
- Gas price too low
- Nonce conflicts
- RPC provider issues

**Prevention**:
- Dynamic gas price calculation
- Gas price buffer (1.2x recommended)
- Transaction monitoring
- Network switching (Ethereum ↔ Polygon)

---

### Issue: IPFS Upload Failures

**Symptoms**:
- IPFS upload success <98%
- NFT metadata unavailable
- Error: "IPFS timeout"

**Quick Check**:
```bash
# Check IPFS upload success rate
prometheus_query "rate(p2_ipfs_upload_success_total[5m]) / rate(p2_ipfs_upload_attempts_total[5m]) * 100"

# Check IPFS provider status
curl https://status.pinata.cloud/api/v2/status.json | jq
```

**Resolution**:
1. Check IPFS provider health:
   - Pinata status page
   - Infura IPFS status
2. Retry failed uploads:
   ```javascript
   async function uploadWithRetry(file, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await ipfs.upload(file);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await sleep(2 ** i * 1000);  // Exponential backoff
       }
     }
   }
   ```
3. Switch to backup provider:
   ```bash
   # Switch to backup IPFS provider
   kubectl set env deployment/nft-service IPFS_PROVIDER=infura
   ```

**Root Causes**:
- IPFS gateway downtime
- Network timeouts
- File size too large
- Rate limiting

**Prevention**:
- Multiple IPFS providers
- Automatic failover
- Retry logic with backoff
- File size validation

---

## General Troubleshooting

### Feature Flag Issues

**Issue: Feature flag not updating**

```bash
# Check feature flag service
systemctl status feature-flag-service

# Force refresh feature flags
redis-cli DEL "feature_flags:cache"

# Verify flag state
curl https://api.agenticflow.io/v1/feature-flags | jq
```

---

### Database Issues

**Issue: Slow queries**

```bash
# Find slow queries
psql -U postgres -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check for missing indexes
psql -U postgres -c "SELECT schemaname, tablename, attname, n_distinct, correlation FROM pg_stats WHERE schemaname = 'public' ORDER BY n_distinct DESC;"

# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

---

### Redis Issues

**Issue: Cache miss rate high**

```bash
# Check cache hit rate
redis-cli INFO stats | grep keyspace

# Check memory usage
redis-cli INFO memory | grep used_memory_human

# Clear stale cache
redis-cli KEYS "cache:*" | xargs redis-cli DEL
```

---

### Kubernetes Issues

**Issue: Pod restarts**

```bash
# Check pod restarts
kubectl get pods -l app=p2-feature --sort-by=.status.containerStatuses[0].restartCount

# Check pod logs
kubectl logs <pod-name> --previous

# Describe pod for events
kubectl describe pod <pod-name>
```

---

## Document Control

**Version**: 1.0
**Last Updated**: 2025-11-08
**Next Review**: Monthly
**Owner**: SRE Team

**Contribution**:
If you encounter a new issue not covered here, please:
1. Resolve the issue
2. Document the resolution
3. Submit PR to add to this runbook

**Feedback**: sre-team@agenticflow.io
