# Incident Response Playbook - P1 Features

**Version**: 1.0
**Last Updated**: 2025-11-08
**Owner**: SRE Team
**Scope**: Slide Designer P1 Features (15 features across 5 batches)

---

## Table of Contents

1. [Overview](#overview)
2. [P1-Specific Incident Scenarios](#p1-specific-incident-scenarios)
3. [Feature Flag Rollback Procedures](#feature-flag-rollback-procedures)
4. [Batch Rollback Strategy](#batch-rollback-strategy)
5. [P1 Incident Classification](#p1-incident-classification)
6. [Response Procedures by Feature](#response-procedures-by-feature)
7. [Escalation Matrix](#escalation-matrix)

---

## Overview

This playbook extends the main [P0 Incident Response Playbook](/home/user/agenticflow/docs/p0-integration/incident-response.md) with P1-specific procedures. P1 features are behind feature flags, enabling rapid rollback without code deployments.

**Key Differences from P0**:
- **Feature Flags**: All P1 features can be disabled instantly via feature flags
- **Batch Isolation**: Issues can be isolated to specific feature batches
- **Non-Critical**: P1 incidents rarely escalate to SEV1 (unless affecting P0)
- **Gradual Rollback**: Can disable individual features or entire batches

**15 P1 Features Across 5 Batches**:
- **Batch 1**: Icon Library, Background Patterns, Slide Management
- **Batch 2**: Template Library, Video Embed, Data Import
- **Batch 3**: Speaker Notes, Custom Fonts, AI Image Generation
- **Batch 4**: i18n, Version History, Analytics
- **Batch 5**: Collaboration, Live Presentation, Mobile App

---

## P1-Specific Incident Scenarios

### Scenario 1: P1 Feature Degrading P0 Performance

**Symptoms**:
- P0 latency increased >10% after P1 feature enabled
- P0 error rate elevated with P1 active
- Resource contention (CPU/memory) from P1 features

**Immediate Actions** (0-5 minutes):
```bash
# 1. Identify the problematic P1 feature
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | grep "p1_feature" | grep -i "error\|slow"

# 2. Check P0 performance impact
curl "http://prometheus:9090/api/v1/query?query=(p0_with_p1_latency/p0_baseline_latency)*100"

# 3. Disable the offending feature flag immediately
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_<FEATURE> false

# 4. Verify P0 performance restored
# Wait 2 minutes, then check P0 metrics
```

**Root Cause Investigation**:
- Profile resource usage of P1 feature
- Check for database connection leaks
- Analyze query patterns for inefficiencies
- Review concurrent request handling

**Prevention**:
- Add resource limits to P1 feature code
- Implement circuit breakers
- Add P0 performance regression tests for P1 features

---

### Scenario 2: Custom Font Upload Failures

**Symptoms**:
- Font uploads failing with validation errors
- Users cannot see uploaded fonts
- Font preview not rendering

**Diagnostic Steps**:
```bash
# 1. Check font upload success rate
curl "http://prometheus:9090/api/v1/query?query=sum(rate(p1_feature_requests_total{feature=\"custom_fonts\",operation=\"upload\",status=\"success\"}[5m]))/sum(rate(p1_feature_requests_total{feature=\"custom_fonts\",operation=\"upload\"}[5m]))"

# 2. Review recent font upload errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | grep "custom_fonts" | grep -i "error"

# 3. Check storage available for fonts
kubectl exec -it deployment/slide-designer -- df -h /app/uploads/fonts

# 4. Verify font file formats being uploaded
kubectl logs -n agentic-flow deployment/slide-designer --tail=100 | grep "font_upload" | jq .file_extension
```

**Resolution Steps**:

**Option A: Storage Issue**
```bash
# Increase PVC size if storage full
kubectl patch pvc slide-designer-fonts -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# Clear old/unused fonts
kubectl exec -it deployment/slide-designer -- \
  node /app/scripts/cleanup-unused-fonts.js --older-than 90d
```

**Option B: Validation Issue**
```bash
# Temporarily relax validation (if safe)
kubectl set env deployment/slide-designer \
  FONT_MAX_SIZE_MB=10 \
  FONT_VALIDATION_STRICT=false

# Or rollback to previous validation logic
kubectl rollout undo deployment/slide-designer -n agentic-flow
```

**Option C: Disable Feature Temporarily**
```bash
# Disable custom fonts feature flag
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_CUSTOM_FONTS false

# Notify users via banner
kubectl exec -it deployment/slide-designer -- \
  npx system-message set "Custom font uploads temporarily unavailable. We're working on a fix."
```

---

### Scenario 3: AI Image Generation Budget Exceeded

**Symptoms**:
- Daily DALL-E 3 API cost >$75
- Image generation requests being throttled
- Alert: "AI Image Gen - Daily Budget Exceeded"

**Diagnostic Steps**:
```bash
# 1. Check current daily spend
curl "http://prometheus:9090/api/v1/query?query=sum(increase(p1_feature_cost_usd{feature=\"ai_image_gen\"}[1d]))"

# 2. Identify high-usage users/sessions
kubectl logs -n agentic-flow deployment/slide-designer --tail=10000 | \
  grep "ai_image_gen" | \
  jq 'select(.operation == "generate") | {user: .user_id, cost: .cost_usd}' | \
  jq -s 'group_by(.user) | map({user: .[0].user, total_cost: map(.cost) | add}) | sort_by(.total_cost) | reverse | .[0:10]'

# 3. Check generation success rate
curl "http://prometheus:9090/api/v1/query?query=sum(rate(p1_feature_requests_total{feature=\"ai_image_gen\",status=\"success\"}[1h]))/sum(rate(p1_feature_requests_total{feature=\"ai_image_gen\"}[1h]))"
```

**Resolution Steps**:

**Option A: Implement Rate Limiting (Immediate)**
```bash
# Add per-user daily limits
kubectl set env deployment/slide-designer \
  AI_IMAGE_GEN_LIMIT_PER_USER_DAILY=10 \
  AI_IMAGE_GEN_LIMIT_GLOBAL_DAILY=500

# Enable cost-based throttling
kubectl set env deployment/slide-designer \
  AI_IMAGE_GEN_MAX_DAILY_COST=50
```

**Option B: Downgrade Quality Temporarily**
```bash
# Use standard quality instead of HD
kubectl set env deployment/slide-designer \
  DALLE_QUALITY=standard \
  DALLE_SIZE=1024x1024
```

**Option C: Disable Feature (Last Resort)**
```bash
# Disable AI image generation
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_AI_IMAGE_GEN false

# Notify users
kubectl exec -it deployment/slide-designer -- \
  npx system-message set "AI image generation temporarily paused due to high demand. Use stock images in the meantime."
```

**Post-Incident**:
- Review and adjust daily budget limits
- Implement progressive rate limiting
- Add queue system for image generation
- Consider caching common requests

---

### Scenario 4: Collaboration Sync Issues

**Symptoms**:
- Users seeing different slide states
- Comments not appearing for collaborators
- Cursor positions out of sync
- WebSocket connection failures

**Diagnostic Steps**:
```bash
# 1. Check WebSocket connection health
curl "http://prometheus:9090/api/v1/query?query=up{job=\"websocket-server\"}"

# 2. Check sync latency
curl "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(p1_feature_request_duration_seconds_bucket{feature=\"collaboration\",operation=\"sync\"}[5m]))"

# 3. Check active collaboration sessions
kubectl exec -it deployment/collaboration-service -- \
  npx collab-admin list-sessions --format json | jq 'length'

# 4. Review conflict resolution failures
kubectl logs -n agentic-flow deployment/collaboration-service --tail=1000 | \
  grep "conflict_resolution" | grep -i "failed"
```

**Resolution Steps**:

**Option A: Restart WebSocket Server**
```bash
# Gracefully restart WebSocket connections
kubectl exec -it deployment/websocket-server -- \
  npx websocket-admin broadcast '{"type": "server_restart", "reconnect_in": 5000}'

# Wait 10 seconds for clients to disconnect
sleep 10

# Restart deployment
kubectl rollout restart deployment/websocket-server -n agentic-flow
```

**Option B: Clear Stale Sessions**
```bash
# Remove sessions with no active users
kubectl exec -it deployment/collaboration-service -- \
  npx collab-admin cleanup --inactive-timeout 300

# Force sync for all active sessions
kubectl exec -it deployment/collaboration-service -- \
  npx collab-admin force-sync --all-sessions
```

**Option C: Temporary Single-User Mode**
```bash
# Disable multi-user editing temporarily
kubectl set env deployment/collaboration-service \
  MAX_COLLABORATORS_PER_SESSION=1

# Or disable collaboration entirely
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_COLLABORATION false
```

**Prevention**:
- Implement CRDT (Conflict-free Replicated Data Types)
- Add operation log for debugging sync issues
- Improve WebSocket reconnection logic
- Add session state checkpoints

---

### Scenario 5: Template Loading Failures

**Symptoms**:
- Template library not loading
- Templates showing as corrupted
- Slow template search (<500ms)

**Diagnostic Steps**:
```bash
# 1. Check template library availability
curl "http://prometheus:9090/api/v1/query?query=up{job=\"template-library\"}"

# 2. Check template load times
curl "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(p1_feature_request_duration_seconds_bucket{feature=\"template_library\",operation=\"load\"}[5m]))"

# 3. Verify template integrity
kubectl exec -it deployment/slide-designer -- \
  npx template-validator check-all --output json | jq '.invalid | length'

# 4. Check template cache status
kubectl exec -it deployment/slide-designer -- \
  curl localhost:8080/metrics | grep template_cache_hit_rate
```

**Resolution Steps**:

**Option A: Rebuild Template Cache**
```bash
# Clear and rebuild template cache
kubectl exec -it deployment/slide-designer -- \
  npx template-admin cache clear

kubectl exec -it deployment/slide-designer -- \
  npx template-admin cache build --all-templates

# Verify templates load correctly
kubectl exec -it deployment/slide-designer -- \
  npx template-admin test-load --sample 5
```

**Option B: Rollback Template Data**
```bash
# Restore templates from backup
kubectl exec -it deployment/slide-designer -- \
  npx template-admin restore --from-backup latest

# Verify restoration
kubectl exec -it deployment/slide-designer -- \
  npx template-admin list --count
```

**Option C: Disable Template Library**
```bash
# Disable feature flag
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_TEMPLATE_LIBRARY false

# Fallback to basic templates
kubectl set env deployment/slide-designer \
  USE_BASIC_TEMPLATES_ONLY=true
```

---

## Feature Flag Rollback Procedures

### Emergency Feature Disable (< 1 minute)

**Single Feature Rollback**:
```bash
# 1. Identify feature flag name
# See: /home/user/agenticflow/docs/p1-integration/sli-slo.md#feature-flag-states

# 2. Disable feature flag
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set <FLAG_NAME> false

# 3. Verify propagation (should be <30 seconds)
watch -n 1 'kubectl exec -it deployment/feature-flag-service -- npx feature-flags get <FLAG_NAME>'

# 4. Confirm feature disabled in application
kubectl logs -n agentic-flow deployment/slide-designer --tail=100 | grep "<feature_name>" | grep "disabled"

# 5. Monitor P0 metrics for recovery
# Check that P0 performance returns to baseline within 5 minutes
```

**Feature Flag Reference**:
```bash
ENABLE_ICON_LIBRARY           # P1.1
ENABLE_BACKGROUND_PATTERNS    # P1.2
ENABLE_SLIDE_MANAGEMENT       # P1.4
ENABLE_TEMPLATE_LIBRARY       # P1.5
ENABLE_VIDEO_EMBED            # P1.7
ENABLE_DATA_IMPORT            # P1.12
ENABLE_SPEAKER_NOTES          # P1.3
ENABLE_CUSTOM_FONTS           # P1.8
ENABLE_AI_IMAGE_GEN           # P1.11
ENABLE_I18N                   # P1.6
ENABLE_VERSION_HISTORY        # P1.10
ENABLE_ANALYTICS              # P1.13
ENABLE_COLLABORATION          # P1.9
ENABLE_LIVE_PRESENTATION      # P1.15
ENABLE_MOBILE_APP             # P1.14
```

### Gradual Feature Re-Enable

After resolving the incident, re-enable features gradually:

```bash
# 1. Enable for internal testing (0% → 1%)
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags rollout <FLAG_NAME> --percentage 1 --target internal_users

# 2. Monitor for 30 minutes
# Check metrics, error rates, P0 performance

# 3. Expand to 10% of users
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags rollout <FLAG_NAME> --percentage 10

# 4. Monitor for 2 hours

# 5. Expand to 50%
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags rollout <FLAG_NAME> --percentage 50

# 6. Monitor for 24 hours

# 7. Full rollout (100%)
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags rollout <FLAG_NAME> --percentage 100
```

---

## Batch Rollback Strategy

### Batch-Level Feature Flag Control

Disable entire batches for widespread issues:

**Batch 1: Quick Wins**
```bash
# Disable all Batch 1 features
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags batch-disable batch1

# Individual flags:
# - ENABLE_ICON_LIBRARY
# - ENABLE_BACKGROUND_PATTERNS
# - ENABLE_SLIDE_MANAGEMENT
```

**Batch 2: Content Enhancement**
```bash
# Disable all Batch 2 features
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags batch-disable batch2

# Individual flags:
# - ENABLE_TEMPLATE_LIBRARY
# - ENABLE_VIDEO_EMBED
# - ENABLE_DATA_IMPORT
```

**Batch 3: Advanced Features**
```bash
# Disable all Batch 3 features
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags batch-disable batch3

# Individual flags:
# - ENABLE_SPEAKER_NOTES
# - ENABLE_CUSTOM_FONTS
# - ENABLE_AI_IMAGE_GEN
```

**Batch 4: System Features**
```bash
# Disable all Batch 4 features
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags batch-disable batch4

# Individual flags:
# - ENABLE_I18N
# - ENABLE_VERSION_HISTORY
# - ENABLE_ANALYTICS
```

**Batch 5: Collaborative Features**
```bash
# Disable all Batch 5 features
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags batch-disable batch5

# Individual flags:
# - ENABLE_COLLABORATION
# - ENABLE_LIVE_PRESENTATION
# - ENABLE_MOBILE_APP
```

### Batch Rollback Decision Tree

```
Incident Detected
    ├─ Affects single feature? → Disable that feature flag
    ├─ Affects 2+ features in same batch? → Disable entire batch
    ├─ Affects P0 performance? → Disable all P1 features, investigate
    └─ Cross-batch issue? → Disable all P1, emergency escalation
```

---

## P1 Incident Classification

### SEV3 (Severity 3) - P1 Feature Degradation

**Definition**: Single P1 feature experiencing issues, P0 unaffected

**Examples**:
- Custom font uploads failing for <50% of requests
- AI image generation slow (>45s but <60s)
- Template library search slow (>300ms but <500ms)
- Collaboration sync delayed (>700ms but <1s)

**Response Time**:
- Detection to Acknowledgment: <30 minutes
- Feature flag rollback if needed: <5 minutes
- Target Resolution: <4 hours

**Actions**:
1. Disable affected feature flag if SLO violation critical
2. Investigate root cause
3. Implement fix
4. Gradual re-enable

---

### SEV2 (Severity 2) - Batch-Wide or Critical P1 Issue

**Definition**: Multiple P1 features affected OR critical P1 feature down

**Examples**:
- Entire batch (3 features) experiencing issues
- Collaboration completely unavailable
- Live presentation failing for all users
- AI image generation exceeding budget by >50%

**Response Time**:
- Detection to Acknowledgment: <15 minutes
- Batch rollback if needed: <5 minutes
- Target Resolution: <8 hours

**Actions**:
1. Disable affected batch via feature flags
2. Check P0 performance impact
3. Emergency investigation
4. Post-incident review required

---

### SEV1 (Severity 1) - P1 Affecting P0

**Definition**: P1 features causing P0 degradation or outage

**Examples**:
- P0 latency increased >20% due to P1 feature
- P0 error rate elevated >1% from P1 issues
- Resource exhaustion from P1 causing P0 failures
- Database connection pool exhausted by P1 queries

**Response Time**:
- Detection to Acknowledgment: <5 minutes
- All P1 features disabled: <2 minutes
- Target Resolution: <1 hour

**Actions**:
1. **IMMEDIATELY** disable ALL P1 feature flags
2. Verify P0 restoration
3. Identify problematic P1 feature
4. Full post-mortem required
5. Implement safeguards before re-enabling

```bash
# Emergency: Disable ALL P1 features
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags disable-all-p1

# Verify P0 metrics recovering
watch -n 10 'curl -s http://prometheus:9090/api/v1/query?query=p0_overall_health | jq .'
```

---

## Response Procedures by Feature

### Quick Reference Matrix

| Feature | Common Issues | Quick Fix | Feature Flag |
|---------|--------------|-----------|--------------|
| **P1.1 Icon Library** | Slow search | Clear search cache | `ENABLE_ICON_LIBRARY` |
| **P1.2 Background Patterns** | High memory usage | Reduce pattern cache size | `ENABLE_BACKGROUND_PATTERNS` |
| **P1.4 Slide Management** | Undo/redo failures | Clear history buffer | `ENABLE_SLIDE_MANAGEMENT` |
| **P1.5 Template Library** | Templates not loading | Rebuild template cache | `ENABLE_TEMPLATE_LIBRARY` |
| **P1.7 Video Embed** | Embed failures | Verify API keys | `ENABLE_VIDEO_EMBED` |
| **P1.12 Data Import** | Parse errors | Relax validation | `ENABLE_DATA_IMPORT` |
| **P1.3 Speaker Notes** | Sync issues | Restart presenter view | `ENABLE_SPEAKER_NOTES` |
| **P1.8 Custom Fonts** | Upload failures | Check storage space | `ENABLE_CUSTOM_FONTS` |
| **P1.11 AI Image Gen** | Budget exceeded | Enable rate limiting | `ENABLE_AI_IMAGE_GEN` |
| **P1.6 i18n** | Translation missing | Reload language packs | `ENABLE_I18N` |
| **P1.10 Version History** | Restore failures | Check snapshot integrity | `ENABLE_VERSION_HISTORY` |
| **P1.13 Analytics** | Events not tracked | Check event queue | `ENABLE_ANALYTICS` |
| **P1.9 Collaboration** | Sync conflicts | Force sync all sessions | `ENABLE_COLLABORATION` |
| **P1.15 Live Presentation** | Slide sync delay | Restart WebSocket server | `ENABLE_LIVE_PRESENTATION` |
| **P1.14 Mobile App** | Crashes | Push hotfix update | `ENABLE_MOBILE_APP` |

---

## Escalation Matrix

### P1 Feature Owners

| Feature | Owner Team | Slack Channel | On-Call |
|---------|-----------|---------------|---------|
| P1.1, P1.2 | @design-team | #design-features | PagerDuty: design-oncall |
| P1.4 | @core-team | #core-features | PagerDuty: core-oncall |
| P1.5 | @content-team | #content-features | PagerDuty: content-oncall |
| P1.7 | @media-team | #media-features | PagerDuty: media-oncall |
| P1.12 | @data-team | #data-features | PagerDuty: data-oncall |
| P1.3 | @presenter-team | #presenter-features | PagerDuty: presenter-oncall |
| P1.8 | @design-team | #design-features | PagerDuty: design-oncall |
| P1.11 | @ai-team | #ai-features | PagerDuty: ai-oncall |
| P1.6 | @localization-team | #i18n-features | PagerDuty: i18n-oncall |
| P1.10 | @core-team | #core-features | PagerDuty: core-oncall |
| P1.13 | @analytics-team | #analytics-features | PagerDuty: analytics-oncall |
| P1.9, P1.15 | @collab-team | #collab-features | PagerDuty: collab-oncall |
| P1.14 | @mobile-team | #mobile-features | PagerDuty: mobile-oncall |

### Escalation Path

```
Level 1: SRE On-Call (All P1 incidents)
    ↓ (if SEV2 or feature-specific expertise needed)
Level 2: Feature Owner Team
    ↓ (if SEV1 or P0 impact)
Level 3: Engineering Lead + VP Engineering
    ↓ (if critical/extended outage)
Level 4: CTO
```

---

## Communication Templates

### P1 Feature Disabled - User Notification

```
🛠️ Temporary Feature Maintenance

The [FEATURE_NAME] feature is temporarily unavailable while we address a technical issue.

Expected restoration: [TIMEFRAME]
Alternative: [WORKAROUND if applicable]

We'll notify you when the feature is back online. Thank you for your patience!

- Slide Designer Team
```

### Internal Incident Update

```
[HH:MM UTC] SEV3: P1 Feature Issue - [FEATURE_NAME]

Status: Investigating | Identified | Monitoring | Resolved
Impact: [FEATURE_NAME] - [% of users affected]
P0 Impact: None | Minor (<5%) | Significant (>5%)

Actions Taken:
- [Action 1]
- [Action 2]

Next Steps:
- [Next action]

Feature Flag Status: [Enabled|Disabled|Partial Rollout X%]
ETA: [Estimated resolution time or "Under investigation"]
```

---

**Playbook Version**: 1.0
**Last Updated**: 2025-11-08
**Next Review**: 2025-12-08
**Owner**: SRE Team

**Related Documents**:
- [P0 Incident Response](/home/user/agenticflow/docs/p0-integration/incident-response.md)
- [P1 SLIs/SLOs](/home/user/agenticflow/docs/p1-integration/sli-slo.md)
- [P1 Runbooks](/home/user/agenticflow/docs/p1-integration/runbooks/p1-common-issues.md)
