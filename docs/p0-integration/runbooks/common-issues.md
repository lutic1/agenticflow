# Common Issues Runbook - Agentic Flow P0 Features

## Table of Contents

1. [Agent Booster Issues](#agent-booster-issues)
2. [ReasoningBank Issues](#reasoningbank-issues)
3. [Multi-Model Router Issues](#multi-model-router-issues)
4. [QUIC Transport Issues](#quic-transport-issues)
5. [AgentDB Issues](#agentdb-issues)
6. [Swarm Coordination Issues](#swarm-coordination-issues)
7. [General Troubleshooting](#general-troubleshooting)

---

## Agent Booster Issues

### Issue 1: High Latency (p95 >5ms)

**Symptoms**:
- Grafana shows p95 latency >5ms
- User complaints about slow code transformations
- Alert: "Agent Booster - High Latency"

**Common Causes**:
1. WASM module not properly loaded/cached
2. High CPU contention on host
3. Large file operations exceeding memory limits
4. Rust/WASM module crashed and restarted

**Diagnostic Steps**:

```bash
# 1. Check service health
kubectl get pods -n agentic-flow -l app=agent-booster
kubectl logs -n agentic-flow deployment/agent-booster --tail=100

# 2. Check WASM module status
kubectl exec -it deployment/agent-booster -- curl localhost:8080/health | jq .wasm_status

# 3. Check CPU/memory usage
kubectl top pods -n agentic-flow -l app=agent-booster

# 4. Check recent error logs
kubectl logs -n agentic-flow deployment/agent-booster --tail=1000 | grep -i "error\|panic\|fail"

# 5. Verify metrics
curl http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(agent_booster_operation_duration_seconds_bucket[5m]))
```

**Resolution Steps**:

**Option A: Restart Service (if module crashed)**
```bash
# Restart deployment
kubectl rollout restart deployment/agent-booster -n agentic-flow

# Wait for rollout to complete (typically 30-60 seconds)
kubectl rollout status deployment/agent-booster -n agentic-flow

# Verify latency improved
# Check Grafana dashboard after 2 minutes
```

**Option B: Scale Up Resources (if CPU/memory constrained)**
```bash
# Increase replica count
kubectl scale deployment/agent-booster --replicas=6 -n agentic-flow

# Or increase resource limits
kubectl set resources deployment/agent-booster \
  --limits=cpu=2000m,memory=4Gi \
  --requests=cpu=1000m,memory=2Gi
```

**Option C: Clear WASM Cache (if module issue)**
```bash
# Exec into pod
kubectl exec -it deployment/agent-booster -- sh

# Clear WASM cache
rm -rf /tmp/wasm-cache/*

# Restart process (or use kubectl rollout restart from outside)
kill -HUP 1
```

**Verification**:
```bash
# Wait 2 minutes, then check metrics
# p95 should be <5ms
# Success rate should be >99.9%
```

**Prevention**:
- Enable WASM module pre-loading in deployment config
- Set appropriate resource limits and requests
- Implement horizontal pod autoscaling based on latency

---

### Issue 2: Low Throughput (<1000 ops/sec)

**Symptoms**:
- Operations queuing up
- Grafana shows throughput <1000 ops/sec
- User complaints about delays

**Common Causes**:
1. Insufficient replicas for current load
2. Database connection pool exhausted
3. Rate limiting from upstream services
4. Network bandwidth saturation

**Diagnostic Steps**:

```bash
# 1. Check current load
kubectl get hpa -n agentic-flow
kubectl top pods -n agentic-flow -l app=agent-booster

# 2. Check connection pool status
kubectl exec -it deployment/agent-booster -- curl localhost:8080/metrics | grep connection_pool

# 3. Check for rate limiting errors
kubectl logs -n agentic-flow deployment/agent-booster --tail=1000 | grep -i "rate limit\|429\|throttle"

# 4. Check network metrics
kubectl exec -it deployment/agent-booster -- netstat -an | grep ESTABLISHED | wc -l
```

**Resolution Steps**:

**Option A: Scale Out (most common)**
```bash
# Increase replicas
kubectl scale deployment/agent-booster --replicas=10 -n agentic-flow

# Enable horizontal pod autoscaling
kubectl autoscale deployment/agent-booster \
  --min=4 --max=12 \
  --cpu-percent=70 -n agentic-flow
```

**Option B: Increase Connection Pool**
```bash
# Update environment variables
kubectl set env deployment/agent-booster \
  MAX_CONNECTIONS=500 \
  CONNECTION_TIMEOUT=5000
```

**Option C: Optimize Operation Batching**
```bash
# Enable batch processing mode
kubectl set env deployment/agent-booster \
  BATCH_MODE=true \
  BATCH_SIZE=100
```

**Verification**:
```bash
# Monitor throughput for 5 minutes
# Should see >1000 ops/sec sustained
watch -n 5 'curl -s http://prometheus:9090/api/v1/query?query=rate(agent_booster_operations_total[1m]) | jq .'
```

---

### Issue 3: WASM Module Load Failure

**Symptoms**:
- All operations failing with "Module initialization error"
- Logs show "Failed to load WASM module"
- Zero successful operations

**Common Causes**:
1. Incompatible WASM runtime version
2. Missing or corrupted WASM binary
3. Insufficient memory to load module
4. Browser/Node.js runtime incompatibility

**Diagnostic Steps**:

```bash
# 1. Check WASM module exists
kubectl exec -it deployment/agent-booster -- ls -lh /app/dist/wasm/

# 2. Verify WASM module integrity
kubectl exec -it deployment/agent-booster -- sha256sum /app/dist/wasm/agent_booster.wasm

# 3. Check runtime version
kubectl exec -it deployment/agent-booster -- node --version
kubectl exec -it deployment/agent-booster -- npm list @anthropic-ai/claude-code

# 4. Check memory limits
kubectl describe pod -n agentic-flow -l app=agent-booster | grep -A 5 "Limits:"
```

**Resolution Steps**:

**Option A: Rollback Deployment (quickest)**
```bash
# Rollback to previous version
kubectl rollout undo deployment/agent-booster -n agentic-flow

# Verify rollback success
kubectl rollout status deployment/agent-booster -n agentic-flow
```

**Option B: Re-deploy with Correct WASM Build**
```bash
# Pull latest image with correct WASM build
kubectl set image deployment/agent-booster \
  agent-booster=agenticflow/agent-booster:v1.9.0-wasm32-unknown-unknown

# Monitor rollout
kubectl rollout status deployment/agent-booster -n agentic-flow
```

**Option C: Rebuild WASM Module**
```bash
# On build server
cd agent-booster
rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown

# Copy to deployment
docker build -t agenticflow/agent-booster:v1.9.1-fixed .
docker push agenticflow/agent-booster:v1.9.1-fixed

# Update deployment
kubectl set image deployment/agent-booster \
  agent-booster=agenticflow/agent-booster:v1.9.1-fixed -n agentic-flow
```

**Verification**:
```bash
# Check WASM module loaded successfully
kubectl logs -n agentic-flow deployment/agent-booster | grep "WASM module loaded"

# Verify operations working
curl -X POST http://agent-booster.agenticflow.io/transform \
  -H "Content-Type: application/json" \
  -d '{"code": "const x = 1;", "operation": "format"}'
```

---

## ReasoningBank Issues

### Issue 1: Slow Queries (p95 >50ms)

**Symptoms**:
- Query latency exceeds SLO
- Agent learning degraded
- User complaints about slow pattern matching

**Common Causes**:
1. Vector index not optimized
2. Large result set without pagination
3. Database disk I/O saturation
4. Missing indexes on frequently queried fields

**Diagnostic Steps**:

```bash
# 1. Check query performance
kubectl exec -it deployment/reasoningbank -- npx agentdb stats

# 2. Check index health
kubectl exec -it deployment/reasoningbank -- npx agentdb index status

# 3. Check disk I/O
kubectl exec -it deployment/reasoningbank -- iostat -x 1 5

# 4. Analyze slow queries
kubectl logs -n agentic-flow deployment/reasoningbank --tail=1000 | grep "slow query"
```

**Resolution Steps**:

**Option A: Rebuild Vector Index (most effective)**
```bash
# Rebuild HNSW index for faster search
kubectl exec -it deployment/reasoningbank -- npx agentdb index rebuild --type hnsw

# This may take 5-15 minutes depending on data size
# Monitor progress
kubectl logs -n agentic-flow deployment/reasoningbank -f
```

**Option B: Optimize Query Parameters**
```bash
# Increase cache size
kubectl set env deployment/reasoningbank \
  VECTOR_CACHE_SIZE=10000 \
  QUERY_CACHE_TTL=3600
```

**Option C: Scale Database Resources**
```bash
# Increase memory for better caching
kubectl set resources deployment/reasoningbank \
  --limits=memory=8Gi --requests=memory=4Gi

# Add read replicas for query scaling
kubectl scale statefulset/reasoningbank-replica --replicas=3
```

**Verification**:
```bash
# Run sample query and check latency
time kubectl exec -it deployment/reasoningbank -- \
  npx agentdb skill search "authentication" 10

# Should complete in <50ms
```

---

### Issue 2: Low Search Accuracy (<95%)

**Symptoms**:
- Irrelevant results returned
- Agents not learning effectively
- User feedback indicating poor recommendations

**Common Causes**:
1. Embedding model mismatch
2. Insufficient training data
3. Incorrect distance metric
4. Data quality issues

**Diagnostic Steps**:

```bash
# 1. Check search accuracy metrics
curl http://prometheus:9090/api/v1/query?query=reasoningbank_search_accuracy_score

# 2. Verify embedding model version
kubectl exec -it deployment/reasoningbank -- \
  npx agentdb config get embedding_model

# 3. Check data quality
kubectl exec -it deployment/reasoningbank -- \
  npx agentdb stats --namespace default | jq .quality_score

# 4. Sample recent queries
kubectl logs -n agentic-flow deployment/reasoningbank --tail=100 | \
  grep "search_query" | jq .relevance_score
```

**Resolution Steps**:

**Option A: Retrain Embeddings**
```bash
# Regenerate embeddings with latest model
kubectl exec -it deployment/reasoningbank -- \
  npx agentdb embeddings regenerate --model text-embedding-3-large

# This may take 10-30 minutes
```

**Option B: Adjust Search Parameters**
```bash
# Tune distance metric and threshold
kubectl set env deployment/reasoningbank \
  DISTANCE_METRIC=cosine \
  SIMILARITY_THRESHOLD=0.7
```

**Option C: Clean and Deduplicate Data**
```bash
# Remove low-quality entries
kubectl exec -it deployment/reasoningbank -- \
  npx agentdb clean --min-quality 0.5

# Deduplicate similar patterns
kubectl exec -it deployment/reasoningbank -- \
  npx agentdb deduplicate --threshold 0.95
```

**Verification**:
```bash
# Run test queries and check relevance
kubectl exec -it deployment/reasoningbank -- \
  npx agentdb test-accuracy --sample-size 100

# Should show accuracy >95%
```

---

## Multi-Model Router Issues

### Issue 1: High Failure Rate (>0.5%)

**Symptoms**:
- Requests failing with "No available models"
- Grafana shows success rate <99.5%
- Alert: "Router - Low Success Rate"

**Common Causes**:
1. External LLM provider API outages
2. Rate limiting from providers
3. API key expiration or quota exhaustion
4. Network connectivity issues

**Diagnostic Steps**:

```bash
# 1. Check provider status
kubectl logs -n agentic-flow deployment/router --tail=100 | grep "provider"

# 2. Check API key validity
kubectl exec -it deployment/router -- curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/models

# 3. Check rate limiting
kubectl logs -n agentic-flow deployment/router --tail=1000 | grep -i "429\|rate limit"

# 4. Verify network connectivity
kubectl exec -it deployment/router -- ping -c 5 api.openrouter.ai
kubectl exec -it deployment/router -- curl -I https://api.anthropic.com
```

**Resolution Steps**:

**Option A: Enable Fallback Models**
```bash
# Prioritize available providers
kubectl set env deployment/router \
  FALLBACK_ORDER="gemini,openrouter,anthropic" \
  FAILOVER_ENABLED=true
```

**Option B: Increase Timeout and Retries**
```bash
# More aggressive retry policy
kubectl set env deployment/router \
  API_TIMEOUT=30000 \
  MAX_RETRIES=5 \
  RETRY_DELAY=1000
```

**Option C: Rotate API Keys**
```bash
# Update API keys
kubectl create secret generic router-api-keys \
  --from-literal=anthropic=$NEW_ANTHROPIC_KEY \
  --from-literal=openrouter=$NEW_OPENROUTER_KEY \
  --from-literal=gemini=$NEW_GEMINI_KEY \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployment to pick up new keys
kubectl rollout restart deployment/router -n agentic-flow
```

**Option D: Check Provider Status Pages**
```bash
# Anthropic: https://status.anthropic.com
# OpenRouter: https://status.openrouter.ai
# Google AI: https://status.cloud.google.com

# Temporarily disable failing provider
kubectl set env deployment/router \
  DISABLED_PROVIDERS="anthropic"  # if Anthropic is down
```

**Verification**:
```bash
# Send test request
curl -X POST http://router.agenticflow.io/chat \
  -H "Content-Type: application/json" \
  -d '{"model": "auto", "messages": [{"role": "user", "content": "test"}]}'

# Should succeed with status 200
```

---

### Issue 2: Cost Budget Exceeded

**Symptoms**:
- Daily spend >$6.67 (monthly budget $200)
- Alert: "Router - Cost Budget Exceeded"
- Unexpectedly high API costs

**Common Causes**:
1. Routing to expensive models unnecessarily
2. Large context windows increasing costs
3. High request volume spike
4. Incorrect model tier selection

**Diagnostic Steps**:

```bash
# 1. Check current spend
curl http://prometheus:9090/api/v1/query?query=sum(increase(router_cost_usd[1d]))

# 2. Identify expensive models being used
kubectl logs -n agentic-flow deployment/router --tail=10000 | \
  jq 'select(.model_cost > 0.01) | {model: .model, cost: .model_cost}' | \
  jq -s 'group_by(.model) | map({model: .[0].model, total_cost: map(.cost) | add})' | \
  jq 'sort_by(.total_cost) | reverse'

# 3. Check request volume
curl http://prometheus:9090/api/v1/query?query=rate(router_requests_total[1h])

# 4. Analyze cost per request
kubectl logs -n agentic-flow deployment/router --tail=1000 | \
  jq .cost_per_request | \
  awk '{sum+=$1; count++} END {print "Avg cost per request: $" sum/count}'
```

**Resolution Steps**:

**Option A: Force Cheaper Models (immediate)**
```bash
# Temporarily restrict to budget-tier models only
kubectl set env deployment/router \
  MAX_COST_PER_REQUEST=0.001 \
  ALLOWED_TIERS="tier3,tier4,tier5" \
  PRIORITY=cost
```

**Option B: Implement Rate Limiting**
```bash
# Limit requests per user
kubectl set env deployment/router \
  RATE_LIMIT_PER_USER=100 \
  RATE_LIMIT_WINDOW=3600
```

**Option C: Optimize Model Selection**
```bash
# Update routing rules to prefer cost-effective models
kubectl exec -it deployment/router -- cat > /config/routing-rules.json <<EOF
{
  "simple_tasks": {
    "models": ["llama-3.1-8b", "gemini-2.5-flash"],
    "max_cost": 0.0005
  },
  "complex_tasks": {
    "models": ["deepseek-r1", "llama-3.3-70b"],
    "max_cost": 0.005
  },
  "critical_tasks": {
    "models": ["claude-sonnet-4.5", "gpt-4o"],
    "max_cost": 0.05
  }
}
EOF

kubectl rollout restart deployment/router -n agentic-flow
```

**Verification**:
```bash
# Monitor spend for next hour
watch -n 300 'curl -s http://prometheus:9090/api/v1/query?query=sum(increase(router_cost_usd[1h])) | jq .'

# Should stay under $0.28/hour ($6.67/day)
```

---

## QUIC Transport Issues

### Issue 1: High Latency (p95 >15ms)

**Symptoms**:
- Message round-trip time exceeds SLO
- Inter-agent communication slow
- Alert: "QUIC - High Latency"

**Common Causes**:
1. Network congestion or packet loss
2. Too many concurrent streams
3. Connection pool exhaustion
4. TLS handshake overhead (not using 0-RTT)

**Diagnostic Steps**:

```bash
# 1. Check connection stats
kubectl exec -it deployment/quic-transport -- \
  curl localhost:4433/stats | jq .

# 2. Check packet loss
kubectl exec -it deployment/quic-transport -- \
  ss -ti | grep quic

# 3. Check 0-RTT usage
kubectl logs -n agentic-flow deployment/quic-transport --tail=1000 | \
  grep "connection_type" | \
  jq 'select(.connection_type == "0-rtt")' | wc -l

# 4. Monitor network latency
kubectl exec -it deployment/quic-transport -- ping -c 10 <peer-ip>
```

**Resolution Steps**:

**Option A: Enable 0-RTT Connections**
```bash
# Ensure 0-RTT is enabled
kubectl set env deployment/quic-transport \
  QUIC_0RTT_ENABLED=true \
  SESSION_CACHE_SIZE=10000
```

**Option B: Optimize Stream Limits**
```bash
# Adjust concurrent stream limits
kubectl set env deployment/quic-transport \
  MAX_CONCURRENT_STREAMS=200 \
  STREAM_RECEIVE_WINDOW=1048576
```

**Option C: Increase Connection Pool**
```bash
# Scale up connection pool
kubectl set env deployment/quic-transport \
  CONNECTION_POOL_SIZE=1000 \
  IDLE_TIMEOUT=60000
```

**Option D: Check Network Path**
```bash
# Verify MTU settings (QUIC sensitive to MTU)
kubectl exec -it deployment/quic-transport -- ip link show

# If MTU <1500, adjust:
kubectl set env deployment/quic-transport \
  QUIC_MAX_DATAGRAM_SIZE=1350  # Conservative for network with lower MTU
```

**Verification**:
```bash
# Send test messages and measure RTT
kubectl exec -it deployment/quic-transport -- \
  /app/scripts/benchmark-latency.sh

# p95 should be <15ms
```

---

### Issue 2: Connection Failures (>0.1%)

**Symptoms**:
- Unable to establish QUIC connections
- High connection error rate
- Alert: "QUIC - Connection Failures"

**Common Causes**:
1. TLS certificate issues
2. Firewall blocking UDP traffic
3. Port conflicts
4. Invalid peer addresses

**Diagnostic Steps**:

```bash
# 1. Check TLS certificate validity
kubectl exec -it deployment/quic-transport -- \
  openssl x509 -in /certs/cert.pem -noout -dates

# 2. Verify UDP port is open
kubectl exec -it deployment/quic-transport -- \
  nc -u -v -z localhost 4433

# 3. Check firewall rules
kubectl exec -it deployment/quic-transport -- \
  iptables -L -n | grep 4433

# 4. Test connection manually
kubectl exec -it deployment/quic-transport -- \
  /app/scripts/test-connection.sh <peer-ip> 4433
```

**Resolution Steps**:

**Option A: Renew TLS Certificate**
```bash
# Generate new certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update secret
kubectl create secret generic quic-tls-cert \
  --from-file=cert.pem=cert.pem \
  --from-file=key.pem=key.pem \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployment
kubectl rollout restart deployment/quic-transport -n agentic-flow
```

**Option B: Fix Firewall Rules**
```bash
# Ensure UDP port 4433 is open
kubectl exec -it deployment/quic-transport -- \
  iptables -A INPUT -p udp --dport 4433 -j ACCEPT
```

**Option C: Verify Service Configuration**
```bash
# Check service exposes UDP correctly
kubectl get service quic-transport -n agentic-flow -o yaml

# Should show:
# protocol: UDP
# port: 4433
```

**Verification**:
```bash
# Test connection from another pod
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
apk add curl
curl -v http://quic-transport.agentic-flow.svc.cluster.local:4433/health
```

---

## AgentDB Issues

### Issue 1: Low Cache Hit Rate (<70%)

**Symptoms**:
- Cache hit rate below SLO
- Increased database load
- Slower read operations

**Common Causes**:
1. Cache size too small
2. High churn rate (data changing frequently)
3. Cache eviction policy too aggressive
4. Cold cache after restart

**Diagnostic Steps**:

```bash
# 1. Check current cache stats
kubectl exec -it deployment/agentdb -- \
  npx agentdb cache stats

# 2. Monitor cache size vs limit
kubectl exec -it deployment/agentdb -- \
  curl localhost:8080/metrics | grep cache_size

# 3. Check eviction rate
kubectl logs -n agentic-flow deployment/agentdb --tail=1000 | \
  grep "cache_eviction" | wc -l

# 4. Analyze access patterns
kubectl exec -it deployment/agentdb -- \
  npx agentdb stats --cache-access-pattern
```

**Resolution Steps**:

**Option A: Increase Cache Size**
```bash
# Increase memory and cache size
kubectl set resources deployment/agentdb \
  --limits=memory=8Gi --requests=memory=4Gi

kubectl set env deployment/agentdb \
  CACHE_SIZE=100000 \
  CACHE_MEMORY_LIMIT=4096
```

**Option B: Optimize Eviction Policy**
```bash
# Switch to LRU eviction
kubectl set env deployment/agentdb \
  CACHE_EVICTION_POLICY=lru \
  CACHE_TTL=7200
```

**Option C: Pre-warm Cache**
```bash
# Load frequently accessed data
kubectl exec -it deployment/agentdb -- \
  npx agentdb cache prewarm --top-keys 10000
```

**Verification**:
```bash
# Monitor hit rate for 10 minutes
watch -n 30 'kubectl exec -it deployment/agentdb -- npx agentdb cache stats | grep hit_rate'

# Should reach >80% within 10 minutes
```

---

### Issue 2: Slow Writes (p95 >30ms)

**Symptoms**:
- Write latency exceeds SLO
- Agent state updates delayed
- Alert: "AgentDB - High Write Latency"

**Common Causes**:
1. Disk I/O saturation
2. Large transaction sizes
3. Missing database indexes
4. Lock contention

**Diagnostic Steps**:

```bash
# 1. Check disk I/O
kubectl exec -it deployment/agentdb -- iostat -x 1 5

# 2. Check active transactions
kubectl exec -it deployment/agentdb -- \
  npx agentdb stats --transactions

# 3. Identify slow writes
kubectl logs -n agentic-flow deployment/agentdb --tail=1000 | \
  jq 'select(.operation == "write" and .duration_ms > 30)'

# 4. Check for lock contention
kubectl exec -it deployment/agentdb -- \
  npx agentdb stats --locks
```

**Resolution Steps**:

**Option A: Optimize Batch Writes**
```bash
# Enable write batching
kubectl set env deployment/agentdb \
  BATCH_WRITES=true \
  BATCH_SIZE=100 \
  BATCH_TIMEOUT=50
```

**Option B: Add Indexes**
```bash
# Create indexes on frequently queried columns
kubectl exec -it deployment/agentdb -- \
  npx agentdb index create --column agent_id --column timestamp
```

**Option C: Scale Storage**
```bash
# Migrate to faster SSD (if on HDD)
# Update PVC to use SSD storage class

kubectl patch pvc agentdb-data -p \
  '{"spec": {"storageClassName": "ssd-fast"}}'

# May require PVC recreation and data migration
```

**Verification**:
```bash
# Run write benchmark
kubectl exec -it deployment/agentdb -- \
  npx agentdb benchmark write --iterations 1000

# p95 should be <30ms
```

---

## Swarm Coordination Issues

### Issue 1: Slow Agent Spawn (p95 >200ms)

**Symptoms**:
- Agent initialization slow
- Swarm scaling delayed
- Alert: "Swarm - Slow Agent Spawn"

**Common Causes**:
1. Resource constraints (CPU/memory)
2. Image pull delays
3. Cold start overhead
4. Coordinator bottleneck

**Diagnostic Steps**:

```bash
# 1. Check coordinator load
kubectl top pods -n agentic-flow -l app=swarm-coordinator

# 2. Check agent spawn logs
kubectl logs -n agentic-flow deployment/swarm-coordinator --tail=100 | \
  jq 'select(.event == "agent_spawn") | .duration_ms'

# 3. Check image pull times
kubectl get events -n agentic-flow --sort-by='.lastTimestamp' | \
  grep "Pulling image"

# 4. Check resource availability
kubectl describe nodes | grep -A 5 "Allocated resources"
```

**Resolution Steps**:

**Option A: Pre-pull Images**
```bash
# Create DaemonSet to pre-pull agent images
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: agent-image-prepull
  namespace: agentic-flow
spec:
  selector:
    matchLabels:
      app: agent-image-prepull
  template:
    metadata:
      labels:
        app: agent-image-prepull
    spec:
      containers:
      - name: prepull
        image: agenticflow/agent:latest
        command: ["sleep", "infinity"]
EOF
```

**Option B: Increase Coordinator Resources**
```bash
# Scale coordinator
kubectl set resources deployment/swarm-coordinator \
  --limits=cpu=4000m,memory=8Gi \
  --requests=cpu=2000m,memory=4Gi
```

**Option C: Use Agent Pool**
```bash
# Maintain pool of warm agents
kubectl set env deployment/swarm-coordinator \
  AGENT_POOL_SIZE=10 \
  AGENT_POOL_MIN=5
```

**Verification**:
```bash
# Benchmark spawn time
kubectl exec -it deployment/swarm-coordinator -- \
  /app/scripts/benchmark-spawn.sh --agents 100

# p95 should be <200ms
```

---

### Issue 2: Poor Topology Selection (<70% optimal)

**Symptoms**:
- Suboptimal swarm topology chosen
- Lower than expected speedup
- Alert: "Swarm - Poor Topology Selection"

**Common Causes**:
1. Insufficient training data
2. Incorrect workload classification
3. Topology learning model needs retraining
4. Resource constraints affecting performance

**Diagnostic Steps**:

```bash
# 1. Check topology selection accuracy
kubectl exec -it deployment/swarm-coordinator -- \
  npx claude-flow stats --topology-accuracy

# 2. Review recent topology choices
kubectl logs -n agentic-flow deployment/swarm-coordinator --tail=100 | \
  jq 'select(.event == "topology_selection") | {workload: .workload, chosen: .topology, optimal: .optimal_topology}'

# 3. Check training data size
kubectl exec -it deployment/swarm-coordinator -- \
  npx claude-flow learner stats

# 4. Analyze speedup vs expected
kubectl logs -n agentic-flow deployment/swarm-coordinator --tail=1000 | \
  jq 'select(.event == "task_complete") | {topology: .topology, speedup: .speedup, expected: .expected_speedup}'
```

**Resolution Steps**:

**Option A: Retrain Topology Model**
```bash
# Retrain with recent data
kubectl exec -it deployment/swarm-coordinator -- \
  npx claude-flow learner retrain --epochs 100
```

**Option B: Update Topology Rules**
```bash
# Override automatic selection with rules
kubectl exec -it deployment/swarm-coordinator -- cat > /config/topology-rules.json <<EOF
{
  "parallel_tasks": {
    "min_tasks": 5,
    "topology": "mesh",
    "expected_speedup": 4.0
  },
  "sequential_tasks": {
    "dependencies": true,
    "topology": "hierarchical",
    "expected_speedup": 1.5
  },
  "mixed_tasks": {
    "topology": "adaptive",
    "expected_speedup": 3.0
  }
}
EOF

kubectl rollout restart deployment/swarm-coordinator -n agentic-flow
```

**Option C: Increase Training Data**
```bash
# Run benchmark workloads to generate training data
kubectl exec -it deployment/swarm-coordinator -- \
  /app/scripts/generate-training-data.sh --iterations 1000
```

**Verification**:
```bash
# Test topology selection on known workloads
kubectl exec -it deployment/swarm-coordinator -- \
  /app/scripts/test-topology-selection.sh

# Accuracy should be >90%
```

---

## General Troubleshooting

### Checking Overall System Health

```bash
# 1. All P0 components up
kubectl get pods -n agentic-flow | grep -E "agent-booster|reasoningbank|router|quic|agentdb|swarm-coordinator"

# 2. Check Prometheus targets
curl http://prometheus:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job | contains("agentic")) | {job: .labels.job, health: .health}'

# 3. Grafana dashboard overview
open https://monitoring.agenticflow.io/p0-dashboards

# 4. Check error budget remaining
curl http://prometheus:9090/api/v1/query?query=error_budget_remaining | jq .
```

### Common kubectl Commands

```bash
# List all pods in agentic-flow namespace
kubectl get pods -n agentic-flow

# Get detailed pod info
kubectl describe pod <pod-name> -n agentic-flow

# View logs
kubectl logs -n agentic-flow <pod-name> --tail=100 -f

# Exec into pod
kubectl exec -it <pod-name> -n agentic-flow -- sh

# Restart deployment
kubectl rollout restart deployment/<name> -n agentic-flow

# Rollback deployment
kubectl rollout undo deployment/<name> -n agentic-flow

# Scale deployment
kubectl scale deployment/<name> --replicas=5 -n agentic-flow

# Update environment variable
kubectl set env deployment/<name> VAR=value -n agentic-flow

# Update resource limits
kubectl set resources deployment/<name> --limits=cpu=2000m,memory=4Gi
```

### Accessing Metrics

```bash
# Prometheus queries
curl 'http://prometheus:9090/api/v1/query?query=<promql>' | jq .

# Common queries:
# - up{job="agent-booster"}
# - rate(agent_booster_operations_total[5m])
# - histogram_quantile(0.95, rate(quic_message_rtt_seconds_bucket[5m]))

# Export metrics for analysis
curl 'http://prometheus:9090/api/v1/query_range?query=<promql>&start=<timestamp>&end=<timestamp>&step=60s' > metrics.json
```

### Emergency Procedures

**Complete System Restart**:
```bash
# Only use as last resort!
kubectl rollout restart deployment -n agentic-flow

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod -l app -n agentic-flow --timeout=5m
```

**Enable Debug Logging**:
```bash
# Increase log verbosity
kubectl set env deployment/<component> LOG_LEVEL=debug -n agentic-flow
```

**Circuit Breaker (Disable Feature)**:
```bash
# Temporarily disable a P0 feature if causing cascading failures
kubectl scale deployment/<component> --replicas=0 -n agentic-flow

# Remember to document and file incident!
```

---

**Runbook Version**: 1.0
**Last Updated**: 2025-11-08
**Next Review**: 2025-12-08
**Owner**: SRE Team
