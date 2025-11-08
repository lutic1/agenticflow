# Incident Response Playbook - Agentic Flow P0 Features

## Table of Contents

1. [Overview](#overview)
2. [Incident Classification](#incident-classification)
3. [Response Procedures](#response-procedures)
4. [Escalation Paths](#escalation-paths)
5. [Communication Guidelines](#communication-guidelines)
6. [Post-Mortem Process](#post-mortem-process)
7. [On-Call Rotations](#on-call-rotations)

---

## Overview

This playbook defines incident response procedures for Agentic Flow P0 (Priority 0) features. Following these procedures ensures rapid resolution, clear communication, and continuous improvement through post-incident reviews.

**Core Principles**:
- **Customer Impact First**: Restore service before determining root cause
- **Communicate Early and Often**: Keep stakeholders informed
- **Blameless Post-Mortems**: Focus on system improvements, not individual blame
- **Learn and Improve**: Every incident is an opportunity to strengthen the system

---

## Incident Classification

### SEV1 (Severity 1) - Critical Outage

**Definition**: Complete service unavailability or critical data loss affecting all users.

**Examples**:
- Agent Booster completely down (0% operations succeeding)
- QUIC Transport unable to establish any connections
- AgentDB data corruption or complete database failure
- Multi-Model Router failing for all requests
- ReasoningBank data loss affecting production agents
- Swarm Coordinator unable to spawn any agents

**Response Time**:
- **Detection to Acknowledgment**: <5 minutes
- **Acknowledgment to First Response**: <10 minutes
- **Initial Status Update**: Within 15 minutes
- **Target Resolution**: <1 hour

**Escalation**: Immediate page to on-call SRE + Engineering Lead + Product Manager

**Communication**:
- Public status page update every 15 minutes
- Internal Slack updates every 5 minutes
- Customer email notification within 30 minutes

---

### SEV2 (Severity 2) - Major Degradation

**Definition**: Significant performance degradation or partial outage affecting >25% of operations.

**Examples**:
- Agent Booster p95 latency >50ms (10x SLO violation)
- QUIC Transport p95 latency >100ms (6x SLO violation)
- Multi-Model Router success rate <95% (4.5% failure rate)
- AgentDB cache hit rate <50% (causing 2x slowdown)
- ReasoningBank query latency >500ms (5x SLO violation)
- Swarm coordination failing for >25% of spawns

**Response Time**:
- **Detection to Acknowledgment**: <15 minutes
- **Acknowledgment to First Response**: <30 minutes
- **Initial Status Update**: Within 45 minutes
- **Target Resolution**: <4 hours

**Escalation**: Page on-call SRE, notify Engineering Lead via Slack

**Communication**:
- Status page update every 30 minutes
- Internal Slack updates every 15 minutes
- Customer notification if issue persists >2 hours

---

### SEV3 (Severity 3) - Moderate Issue

**Definition**: Elevated error rates or performance degradation affecting <25% of operations.

**Examples**:
- Agent Booster p95 latency >10ms (2x SLO violation)
- QUIC Transport p95 latency >30ms (2x SLO violation)
- Multi-Model Router success rate <99% (1% failure rate)
- AgentDB cache hit rate <70%
- ReasoningBank search accuracy <90%
- Swarm coordination overhead >20% (2x SLO violation)

**Response Time**:
- **Detection to Acknowledgment**: <30 minutes
- **Acknowledgment to First Response**: <1 hour
- **Initial Status Update**: Within 2 hours
- **Target Resolution**: <8 hours (next business day acceptable)

**Escalation**: Slack message to on-call SRE, CC team channel

**Communication**:
- Internal Slack updates every 30 minutes
- Status page update if customer-impacting
- No proactive customer notification unless >4 hours

---

### SEV4 (Severity 4) - Minor Issue

**Definition**: Low-impact issues not violating SLOs but requiring attention.

**Examples**:
- Error budget burn rate trending toward exhaustion
- Warning threshold breached (75% of SLO limit)
- Single region experiencing elevated latency
- Non-critical monitoring gaps
- Documentation gaps discovered

**Response Time**:
- **Detection to Acknowledgment**: <4 hours
- **Acknowledgment to First Response**: <8 hours (next business day)
- **Target Resolution**: <1 week

**Escalation**: Create ticket in issue tracker, assign to responsible team

**Communication**:
- Internal ticket updates only
- Mention in weekly team sync
- No external communication

---

## Response Procedures

### Step 1: Detect and Acknowledge (0-5 minutes)

1. **Receive Alert**
   - PagerDuty notification (SEV1/SEV2)
   - Slack alert (SEV3/SEV4)
   - User report via support channel

2. **Acknowledge Immediately**
   ```bash
   # Acknowledge in PagerDuty
   pd acknowledge <incident-id>

   # Post in Slack
   "🚨 SEV1: Agent Booster down - investigating (acknowledged by @engineer)"
   ```

3. **Initial Assessment** (2 minutes)
   - Check Grafana dashboards: https://monitoring.agenticflow.io/p0-dashboards
   - Review recent deployments: `git log --oneline -10`
   - Check system health: `curl https://api.agenticflow.io/health`

4. **Classify Severity**
   - Use classification table above
   - Escalate if severity higher than initially reported

---

### Step 2: Assemble Response Team (5-15 minutes)

**For SEV1 (Critical)**:
```
Incident Commander: On-call SRE (coordinates all response)
Technical Lead: Engineering Lead (technical decisions)
Communications: Product Manager (customer/stakeholder updates)
Subject Matter Experts: Component owners (as needed)
```

**For SEV2 (Major)**:
```
Incident Commander: On-call SRE
Technical Lead: Component owner
Communications: Engineering Lead (internal only)
```

**For SEV3/SEV4**:
```
Single responder: On-call SRE or component owner
```

**Communication Channels**:
```bash
# Create incident Slack channel
/incident create sev1-agent-booster-down

# Start incident bridge (for SEV1/SEV2)
zoom.us/j/incident-bridge
```

---

### Step 3: Investigate and Mitigate (15 minutes - 1 hour)

**Prioritize Mitigation Over Root Cause**

1. **Gather Data**
   ```bash
   # Check service status
   kubectl get pods -n agentic-flow

   # Review recent logs
   kubectl logs -n agentic-flow deployment/agent-booster --tail=1000

   # Check metrics
   curl http://prometheus:9090/api/v1/query?query=up{job="agent-booster"}
   ```

2. **Common Mitigation Strategies**

   **Agent Booster Down**:
   ```bash
   # Restart service
   kubectl rollout restart deployment/agent-booster -n agentic-flow

   # Rollback recent deployment
   kubectl rollout undo deployment/agent-booster -n agentic-flow

   # Scale up replicas
   kubectl scale deployment/agent-booster --replicas=6 -n agentic-flow
   ```

   **QUIC Transport High Latency**:
   ```bash
   # Check network connectivity
   kubectl exec -it deployment/quic-transport -- ping 8.8.8.8

   # Increase connection pool
   kubectl set env deployment/quic-transport MAX_CONNECTIONS=500

   # Restart with fresh connections
   kubectl rollout restart deployment/quic-transport -n agentic-flow
   ```

   **Multi-Model Router Failures**:
   ```bash
   # Check provider API status
   curl https://status.openrouter.ai
   curl https://status.anthropic.com

   # Enable fallback models only
   kubectl set env deployment/router FALLBACK_MODE=true

   # Increase timeout limits
   kubectl set env deployment/router API_TIMEOUT=30000
   ```

   **AgentDB Performance Issues**:
   ```bash
   # Check database connections
   kubectl exec -it deployment/agentdb -- npx agentdb stats

   # Clear cache and rebuild
   kubectl exec -it deployment/agentdb -- npx agentdb cache clear

   # Scale read replicas
   kubectl scale statefulset/agentdb-replica --replicas=3
   ```

   **ReasoningBank Slow Queries**:
   ```bash
   # Check index health
   kubectl exec -it deployment/reasoningbank -- npx agentdb index status

   # Rebuild vector index
   kubectl exec -it deployment/reasoningbank -- npx agentdb index rebuild

   # Increase memory limits
   kubectl set resources deployment/reasoningbank --limits=memory=4Gi
   ```

   **Swarm Coordination Issues**:
   ```bash
   # Check coordinator status
   kubectl logs -n agentic-flow deployment/swarm-coordinator --tail=100

   # Reset coordination state
   kubectl exec -it deployment/swarm-coordinator -- npx claude-flow reset

   # Reduce concurrent agents
   kubectl set env deployment/swarm-coordinator MAX_AGENTS=50
   ```

3. **Apply Mitigation**
   - Execute fix with approval from Incident Commander
   - Document all changes in incident channel
   - Monitor metrics for 5 minutes to confirm improvement

---

### Step 4: Monitor and Verify (Post-Mitigation)

1. **Confirm Resolution**
   ```bash
   # Check service health
   curl https://api.agenticflow.io/health | jq .

   # Verify SLO metrics
   # - Agent Booster p95 <5ms
   # - QUIC p95 <15ms
   # - Router success rate >99.5%
   # - AgentDB p95 <50ms
   # - ReasoningBank p95 <50ms
   # - Swarm spawn p95 <200ms
   ```

2. **Monitor for 30 Minutes**
   - Watch Grafana dashboards
   - Check error logs
   - Verify no spike in related alerts

3. **Declare Resolution**
   ```
   "✅ SEV1 RESOLVED: Agent Booster restored to normal operation.
   p95 latency: 3ms (SLO: 5ms)
   Success rate: 99.97% (SLO: 99.9%)
   Root cause investigation in progress."
   ```

---

### Step 5: Communication (Throughout Incident)

**Internal Communication (Slack)**:
```
Initial: "🚨 SEV1: Agent Booster completely down affecting all users. Investigating."
Update 1 (15m): "🔍 Identified: Recent deployment caused WASM module load failure. Rolling back."
Update 2 (30m): "🔄 Rollback in progress. ETA 5 minutes to full restoration."
Resolution: "✅ RESOLVED: Rollback complete. Service restored. Post-mortem in 24h."
```

**External Communication (Status Page)**:
```
Investigating (5m): "We are investigating reports of Agent Booster unavailability."
Identified (20m): "We have identified the issue and are implementing a fix."
Monitoring (35m): "A fix has been deployed and we are monitoring the results."
Resolved (45m): "The incident has been resolved. All systems operational."
```

**Customer Email (if >30min outage)**:
```
Subject: [Resolved] Service Disruption - Agent Booster

Dear Agentic Flow Users,

We experienced a service disruption affecting the Agent Booster component
from 14:23 UTC to 15:08 UTC on November 8, 2025 (45 minutes).

Impact: Code transformation operations were unavailable.
Root Cause: Deployment issue with WASM module loading.
Resolution: Rollback to previous stable version.
Prevention: Enhanced deployment validation checks added.

We apologize for any inconvenience. A detailed post-mortem will be
published within 5 business days.

- Agentic Flow SRE Team
```

---

## Escalation Paths

### Level 1: On-Call SRE (First Responder)

**Responsibilities**:
- Acknowledge alerts within 5 minutes
- Initial investigation and mitigation
- Classify severity and escalate if needed
- Document all actions in incident channel

**Contact**: PagerDuty rotation, Slack #sre-oncall

---

### Level 2: Engineering Lead (SEV1/SEV2)

**Escalate When**:
- SEV1 incident declared
- SEV2 incident not improving after 1 hour
- Requires architectural decisions
- Cross-component coordination needed

**Responsibilities**:
- Serve as Technical Lead in incident response
- Approve significant system changes
- Coordinate between engineering teams
- Make build vs. buy tradeoff decisions

**Contact**: Phone (SEV1), Slack (SEV2)

---

### Level 3: VP Engineering (SEV1 only)

**Escalate When**:
- SEV1 incident exceeding 2 hours
- Multiple P0 features affected
- Requires significant resource reallocation
- External vendor engagement needed

**Responsibilities**:
- Executive decision-making authority
- Resource allocation across teams
- Vendor escalation and contracts
- Customer executive communication

**Contact**: Phone (SEV1 only)

---

### Level 4: CTO (Extended SEV1)

**Escalate When**:
- SEV1 incident exceeding 4 hours
- Existential system risk
- Requires board-level communication
- Legal/compliance implications

**Contact**: Phone (critical only)

---

## Communication Guidelines

### Internal Communication

**Slack Channels**:
- `#incidents` - All SEV1/SEV2 incidents
- `#sre-oncall` - On-call coordination
- `#engineering` - Engineering team updates
- `#<incident-id>` - Dedicated channel per SEV1 incident

**Update Frequency**:
- **SEV1**: Every 15 minutes (or at major milestones)
- **SEV2**: Every 30 minutes
- **SEV3**: Every 1 hour
- **SEV4**: Daily summary

**Format**:
```
[HH:MM UTC] STATUS: <Investigating|Identified|Monitoring|Resolved>
Current Impact: <% of users affected, specific symptoms>
Actions Taken: <What we've done>
Next Steps: <What we're doing now>
ETA: <Estimated resolution time or "Unknown">
```

---

### External Communication

**Status Page** (status.agenticflow.io):
- Update within 15 minutes of SEV1/SEV2 declaration
- Use template language (Investigating → Identified → Monitoring → Resolved)
- Never commit to specific ETAs publicly
- Link to post-mortem when published

**Customer Email**:
- Required for SEV1 incidents affecting >30 minutes
- Optional for SEV2 incidents affecting >4 hours
- Send within 24 hours of resolution
- Include: Impact, Root Cause, Resolution, Prevention

**Social Media**:
- Only for widespread SEV1 incidents (>2 hours)
- Coordinated by Marketing team
- Focus on restoration, not technical details

---

## Post-Mortem Process

### Timeline

1. **Draft Post-Mortem**: Within 24 hours of resolution (owner: Incident Commander)
2. **Internal Review**: Within 3 business days (SRE + Engineering teams)
3. **External Publication**: Within 5 business days (after leadership approval)

---

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date**: YYYY-MM-DD
**Authors**: [Incident Commander, Technical Lead]
**Status**: Draft | Review | Published
**Severity**: SEV1 | SEV2 | SEV3 | SEV4

---

## Executive Summary

[2-3 sentences describing what happened, impact, and resolution]

---

## Impact

- **Duration**: X hours Y minutes (HH:MM UTC to HH:MM UTC)
- **Users Affected**: X% of user base (N users)
- **Requests Failed**: X requests (Y% of total)
- **Revenue Impact**: $X (estimated)
- **Error Budget**: X% of monthly budget consumed

---

## Timeline (All times UTC)

| Time | Event |
|------|-------|
| 14:23 | Deployment v1.9.1 started |
| 14:28 | First spike in error rate detected |
| 14:30 | PagerDuty alert fired |
| 14:32 | On-call SRE acknowledged |
| 14:35 | Identified WASM module load failure |
| 14:40 | Rollback initiated |
| 14:50 | Rollback completed |
| 14:55 | Service metrics returned to normal |
| 15:08 | Incident declared resolved |

---

## Root Cause

[Detailed technical explanation of what caused the incident]

Example:
"The v1.9.1 deployment included an updated Rust/WASM module for Agent Booster
that was compiled with incompatible WASM runtime flags. When the module
attempted to load, it failed validation, causing all Agent Booster operations
to fail with 'Module initialization error'."

---

## Detection

**How was it detected?**
- Automated: PagerDuty alert from Prometheus (threshold: error rate >1%)
- Time to detect: 2 minutes (from first error to alert)

**What worked well?**
- Alert fired quickly and accurately
- Clear runbook reference in alert

**What could be improved?**
- Earlier detection via pre-deployment validation
- Canary deployment would have caught issue before full rollout

---

## Response

**What worked well?**
- Fast acknowledgment (2 minutes)
- Clear escalation path followed
- Effective rollback procedure

**What could be improved?**
- Deployment automation should include WASM validation
- Rollback took longer than target (10 minutes vs 5 minute goal)
- Communication to customers was delayed (45 minutes vs 30 minute target)

---

## Resolution

**Immediate Fix**:
- Rolled back deployment to v1.9.0 (stable version)
- Service restored within 22 minutes of detection

**Temporary Workaround**:
- None required (rollback fully resolved issue)

---

## Action Items

| Action | Owner | Priority | Due Date | Status |
|--------|-------|----------|----------|--------|
| Add WASM module validation to CI/CD pipeline | @sre-lead | P0 | 2025-11-15 | In Progress |
| Implement canary deployments for Agent Booster | @devops | P0 | 2025-11-22 | Not Started |
| Update runbook with WASM-specific troubleshooting | @sre-oncall | P1 | 2025-11-12 | In Progress |
| Improve customer notification automation | @product | P1 | 2025-11-20 | Not Started |
| Add synthetic monitoring for WASM module loading | @sre-lead | P2 | 2025-11-30 | Not Started |

---

## Lessons Learned

**What went well?**
1. Monitoring and alerting worked as designed
2. Team responded quickly and followed playbook
3. Rollback procedure was well-documented and effective

**What didn't go well?**
1. Pre-deployment validation didn't catch WASM compatibility issue
2. Rollback took 2x longer than target time
3. Customer communication was delayed

**Where did we get lucky?**
1. Incident occurred during business hours (fast response team available)
2. Rollback was clean with no data migration issues
3. No permanent data loss or corruption

---

## Related Incidents

- **2025-10-15**: Agent Booster deployment issue (SEV3) - similar root cause
- **2025-09-22**: WASM module loading failure (SEV4) - validation gap

---

## Appendix

**Supporting Links**:
- Grafana dashboard: [link]
- Incident Slack channel: #incident-2025-11-08-agent-booster
- PagerDuty incident: [link]
- Deployment logs: [link]

**Technical Details**:
```
WASM module compilation flags:
Previous (v1.9.0): --target wasm32-unknown-unknown
Broken (v1.9.1): --target wasm32-wasi (incompatible with browser runtime)
```

---

**Post-Mortem Review Meeting**: 2025-11-10 at 10:00 UTC
**Attendees**: SRE Team, Engineering Leads, Product Manager
```

---

## On-Call Rotations

### SRE On-Call

**Rotation Schedule**:
- **Primary On-Call**: 1 week rotation
- **Secondary On-Call**: 1 week rotation (backup)
- **Rotation starts**: Monday 00:00 UTC

**Current Rotation**:
- View in PagerDuty: https://agenticflow.pagerduty.com/schedules

**Responsibilities**:
1. Respond to all P0/P1 alerts within SLOs
2. Triage and escalate incidents appropriately
3. Document all incidents and resolutions
4. Hand off open incidents during rotation change
5. Participate in post-mortem reviews

**Handoff Process**:
```
1. Schedule handoff meeting (30 minutes)
2. Review open incidents and ongoing investigations
3. Share context on recent changes and known issues
4. Update on-call documentation with current state
5. Transfer PagerDuty primary on-call status
```

---

### Component Owner On-Call

**Rotation Schedule**:
- **Per-Component**: Each P0 component has dedicated owner rotation
- **Duration**: 2 weeks
- **Rotation starts**: Monday 00:00 UTC

**Components and Owners**:
- Agent Booster: @team-performance
- ReasoningBank: @team-ml
- Multi-Model Router: @team-infrastructure
- QUIC Transport: @team-networking
- AgentDB: @team-data
- Swarm Coordination: @team-orchestration

**Responsibilities**:
1. Provide subject matter expertise during SEV1/SEV2 incidents
2. Review component-specific alerts and metrics
3. Maintain component runbooks and documentation
4. Participate in architecture decisions affecting component
5. Mentor team members on component internals

---

## Quick Reference

### Emergency Contacts

| Role | Contact Method | Response Time |
|------|---------------|---------------|
| On-Call SRE (Primary) | PagerDuty | 5 minutes |
| On-Call SRE (Secondary) | PagerDuty | 10 minutes |
| Engineering Lead | Phone + Slack | 15 minutes |
| VP Engineering | Phone | 30 minutes |
| CTO | Phone | 1 hour |

### Critical Links

- **Dashboards**: https://monitoring.agenticflow.io/p0-dashboards
- **Status Page**: https://status.agenticflow.io
- **Runbooks**: https://github.com/agenticflow/docs/p0-integration/runbooks/
- **Incident Slack**: #incidents
- **PagerDuty**: https://agenticflow.pagerduty.com
- **Incident Bridge**: https://zoom.us/j/incident-bridge

### Common Commands

```bash
# Check service health
kubectl get pods -n agentic-flow

# View recent logs
kubectl logs -n agentic-flow deployment/<component> --tail=100

# Restart service
kubectl rollout restart deployment/<component> -n agentic-flow

# Rollback deployment
kubectl rollout undo deployment/<component> -n agentic-flow

# Check metrics
curl http://prometheus:9090/api/v1/query?query=up{job="<component>"}
```

---

**Playbook Version**: 1.0
**Last Updated**: 2025-11-08
**Next Review**: 2025-12-08
**Owner**: SRE Team
