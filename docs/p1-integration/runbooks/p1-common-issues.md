# P1 Features Common Issues Runbook

**Version**: 1.0
**Last Updated**: 2025-11-08
**Owner**: SRE Team
**Scope**: Slide Designer P1 Features (15 features across 5 batches)

---

## Table of Contents

1. [Batch 1: Quick Wins](#batch-1-quick-wins)
2. [Batch 2: Content Enhancement](#batch-2-content-enhancement)
3. [Batch 3: Advanced Features](#batch-3-advanced-features)
4. [Batch 4: System Features](#batch-4-system-features)
5. [Batch 5: Collaborative Features](#batch-5-collaborative-features)
6. [Cross-Feature Issues](#cross-feature-issues)
7. [Feature Flag Operations](#feature-flag-operations)

---

## Batch 1: Quick Wins

### P1.1: Icon Library - Slow Search Performance

**Symptoms**:
- Icon search taking >10ms (p95)
- Search results incomplete or incorrect
- High memory usage in icon library service

**Common Causes**:
1. Search index not optimized
2. Cache miss rate too high
3. Large result sets without pagination
4. Memory leak in search service

**Diagnostic Steps**:

```bash
# 1. Check search performance metrics
curl "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(p1_feature_request_duration_seconds_bucket{feature=\"icon_library\",operation=\"search\"}[5m]))"

# 2. Check cache hit rate
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "icon_library" | grep "cache" | \
  jq '{hit: .cache_hit, miss: .cache_miss}' | \
  jq -s 'group_by(.hit) | map({status: (if .[0].hit then "hit" else "miss" end), count: length})'

# 3. Check memory usage
kubectl top pods -n agentic-flow -l component=icon-library

# 4. Test search with sample query
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/icons/search?q=chart&limit=10" | jq .
```

**Resolution Steps**:

**Option A: Clear and Rebuild Search Index**
```bash
# Clear icon search cache
kubectl exec -it deployment/slide-designer -- \
  node -e "require('./dist/slide-designer/assets/icon-library').iconLibrary.clearCache()"

# Rebuild search index
kubectl exec -it deployment/slide-designer -- \
  node -e "require('./dist/slide-designer/assets/icon-library').iconLibrary.rebuildIndex()"

# Verify search works
kubectl exec -it deployment/slide-designer -- \
  node -e "console.log(require('./dist/slide-designer/assets/icon-library').iconLibrary.search('chart').length)"
```

**Option B: Increase Cache Size**
```bash
# Increase icon cache memory limit
kubectl set env deployment/slide-designer \
  ICON_CACHE_SIZE=10000 \
  ICON_CACHE_TTL=3600

# Restart to apply changes
kubectl rollout restart deployment/slide-designer -n agentic-flow
```

**Option C: Optimize Search Algorithm**
```bash
# Enable fuzzy search optimization
kubectl set env deployment/slide-designer \
  ICON_SEARCH_ALGORITHM=optimized \
  ICON_SEARCH_MAX_RESULTS=50

# Enable result pagination
kubectl set env deployment/slide-designer \
  ICON_SEARCH_PAGINATION=true
```

**Verification**:
```bash
# Run performance test
kubectl exec -it deployment/slide-designer -- \
  npm run test:performance -- --feature icon-library

# Should show p95 <10ms
```

---

### P1.2: Background Patterns - High Memory Usage

**Symptoms**:
- Memory usage >5MB per pattern
- Pattern generation taking >20ms
- OOM (Out of Memory) errors

**Common Causes**:
1. SVG patterns not being garbage collected
2. Pattern cache too large
3. High-resolution patterns consuming memory
4. Memory leak in pattern generation

**Diagnostic Steps**:

```bash
# 1. Check memory usage per pattern
kubectl exec -it deployment/slide-designer -- \
  node -e "const bg = require('./dist/slide-designer/assets/background-patterns'); console.log(process.memoryUsage())"

# 2. Check pattern cache size
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "background_patterns" | grep "cache_size"

# 3. Generate test pattern and measure memory
kubectl exec -it deployment/slide-designer -- \
  node --expose-gc -e "
    const bg = require('./dist/slide-designer/assets/background-patterns');
    const before = process.memoryUsage().heapUsed;
    bg.backgroundPatterns.generatePattern('hexagon-grid');
    global.gc();
    const after = process.memoryUsage().heapUsed;
    console.log('Memory delta:', (after - before) / 1024 / 1024, 'MB');
  "
```

**Resolution Steps**:

**Option A: Clear Pattern Cache**
```bash
# Clear background pattern cache
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/patterns/cache/clear"

# Force garbage collection
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/system/gc"
```

**Option B: Reduce Cache Size**
```bash
# Limit pattern cache size
kubectl set env deployment/slide-designer \
  PATTERN_CACHE_MAX_ITEMS=20 \
  PATTERN_CACHE_MAX_SIZE_MB=50

# Enable LRU (Least Recently Used) eviction
kubectl set env deployment/slide-designer \
  PATTERN_CACHE_EVICTION=lru
```

**Option C: Optimize Pattern Generation**
```bash
# Use simpler SVG rendering
kubectl set env deployment/slide-designer \
  PATTERN_SVG_OPTIMIZATION=true \
  PATTERN_RESOLUTION=medium

# Reduce pattern detail
kubectl set env deployment/slide-designer \
  PATTERN_DETAIL_LEVEL=medium
```

**Verification**:
```bash
# Check memory usage stabilized
kubectl top pods -n agentic-flow -l component=slide-designer --watch

# Should stay under 200MB per pod
```

---

### P1.4: Slide Management - Undo/Redo Failures

**Symptoms**:
- Undo/redo not working
- History depth less than 50 actions
- Data inconsistency after undo

**Common Causes**:
1. History buffer overflow
2. State snapshots corrupted
3. Concurrent operations conflict
4. History not being saved properly

**Diagnostic Steps**:

```bash
# 1. Check history depth
kubectl exec -it deployment/slide-designer -- \
  node -e "const sm = require('./dist/slide-designer/features/slide-manager'); console.log('History depth:', sm.getGlobalSlideManager().getHistoryDepth())"

# 2. Check for history errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "slide_manager" | grep -i "error\|undo\|redo"

# 3. Test undo/redo operations
kubectl exec -it deployment/slide-designer -- \
  npm run test:integration -- --feature slide-management --test undo-redo
```

**Resolution Steps**:

**Option A: Clear and Rebuild History**
```bash
# Clear corrupted history
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/slides/history/clear"

# Create fresh snapshot
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/slides/history/snapshot"

# Verify history working
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/slides/history/depth"
```

**Option B: Increase History Buffer**
```bash
# Increase max history depth
kubectl set env deployment/slide-designer \
  SLIDE_HISTORY_MAX_DEPTH=100 \
  SLIDE_HISTORY_BUFFER_SIZE=10MB

# Enable history compression
kubectl set env deployment/slide-designer \
  SLIDE_HISTORY_COMPRESSION=true
```

**Option C: Fix State Synchronization**
```bash
# Force state resync
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/slides/state/resync"

# Enable optimistic locking
kubectl set env deployment/slide-designer \
  SLIDE_STATE_LOCKING=optimistic
```

**Verification**:
```bash
# Test undo/redo cycle
kubectl exec -it deployment/slide-designer -- \
  npm run test:e2e -- --test slide-undo-redo

# Should show 100% pass rate
```

---

## Batch 2: Content Enhancement

### P1.5: Template Library - Templates Not Loading

**Symptoms**:
- Template library returns empty results
- Templates showing as "corrupted"
- Template load time >200ms (p95)

**Common Causes**:
1. Template cache invalidated
2. Template JSON files corrupted
3. Database connection issues
4. Template validation failing

**Diagnostic Steps**:

```bash
# 1. Check template availability
kubectl exec -it deployment/slide-designer -- \
  node -e "const tl = require('./dist/slide-designer/features/template-library'); console.log('Templates:', tl.templateLibrary.getAllTemplates().length)"

# 2. Validate templates
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const tl = require('./dist/slide-designer/features/template-library');
    const templates = tl.templateLibrary.getAllTemplates();
    const invalid = templates.filter(t => !t.slides || t.slides.length === 0);
    console.log('Invalid templates:', invalid.length);
  "

# 3. Check template cache
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "template_library" | grep "cache"

# 4. Test template loading
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/templates/startup-pitch-deck" | jq .
```

**Resolution Steps**:

**Option A: Rebuild Template Cache**
```bash
# Clear template cache
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/templates/cache/clear"

# Preload all templates
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/templates/cache/preload"

# Verify templates loaded
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/templates" | jq 'length'
```

**Option B: Restore Template Data**
```bash
# Restore from backup
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const fs = require('fs');
    const tl = require('./dist/slide-designer/features/template-library');
    const backup = JSON.parse(fs.readFileSync('/app/backups/templates.json'));
    // Restore templates from backup
    console.log('Restored templates:', backup.length);
  "
```

**Option C: Reinitialize Template Library**
```bash
# Restart slide designer service
kubectl rollout restart deployment/slide-designer -n agentic-flow

# Wait for startup
kubectl wait --for=condition=ready pod -l app=slide-designer -n agentic-flow --timeout=60s

# Verify templates available
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/templates/search?category=pitch"
```

**Verification**:
```bash
# Load test template library
kubectl exec -it deployment/slide-designer -- \
  npm run test:load -- --feature template-library --duration 60s

# p95 load time should be <200ms
```

---

### P1.7: Video Embed - Playback Failures

**Symptoms**:
- Videos not playing
- Embed URLs not being parsed correctly
- YouTube/Vimeo detection failing

**Common Causes**:
1. Invalid API keys (if using YouTube Data API)
2. URL parsing regex broken
3. CORS issues with video providers
4. Iframe embedding blocked

**Diagnostic Steps**:

```bash
# 1. Test URL parsing
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const ve = require('./dist/slide-designer/features/video-embed');
    const test = ve.videoEmbedManager.parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('Parsed:', test);
  "

# 2. Check embed generation
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/video/embed" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' | jq .

# 3. Check for CORS errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "video_embed" | grep -i "cors\|403\|401"
```

**Resolution Steps**:

**Option A: Verify API Keys**
```bash
# Check if YouTube API key is valid
kubectl exec -it deployment/slide-designer -- \
  curl "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=$YOUTUBE_API_KEY"

# Update API key if expired
kubectl create secret generic video-embed-keys \
  --from-literal=youtube-api-key=$NEW_YOUTUBE_API_KEY \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployment
kubectl rollout restart deployment/slide-designer -n agentic-flow
```

**Option B: Fix URL Parsing**
```bash
# Test various URL formats
kubectl exec -it deployment/slide-designer -- \
  npm run test:unit -- --feature video-embed --test url-parsing

# If tests fail, check URL regex patterns
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const ve = require('./dist/slide-designer/features/video-embed');
    console.log('YouTube regex:', ve.YOUTUBE_REGEX);
    console.log('Vimeo regex:', ve.VIMEO_REGEX);
  "
```

**Option C: Use Fallback Embed Method**
```bash
# Enable simple iframe embed (no API)
kubectl set env deployment/slide-designer \
  VIDEO_EMBED_MODE=simple \
  VIDEO_API_ENABLED=false

# This bypasses API checks and uses direct iframe embedding
```

**Verification**:
```bash
# Test video embed end-to-end
kubectl exec -it deployment/slide-designer -- \
  npm run test:e2e -- --test video-embed

# Should show 100% success rate
```

---

### P1.12: Data Import - CSV/Excel Parse Failures

**Symptoms**:
- File upload succeeds but parsing fails
- Data corruption in imported data
- Import taking >2s for <1MB files

**Common Causes**:
1. Encoding issues (non-UTF-8)
2. Large file sizes exceeding limits
3. Malformed CSV/Excel files
4. Memory issues during parsing

**Diagnostic Steps**:

```bash
# 1. Check recent import errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "data_import" | grep -i "error\|failed"

# 2. Check file size limits
kubectl exec -it deployment/slide-designer -- \
  printenv | grep -E "DATA_IMPORT|FILE_SIZE"

# 3. Test parsing with sample file
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const di = require('./dist/slide-designer/features/data-import');
    const fs = require('fs');
    const testData = 'name,value\nTest,123';
    fs.writeFileSync('/tmp/test.csv', testData);
    const result = di.dataImportManager.importCSV('/tmp/test.csv');
    console.log('Result:', result);
  "
```

**Resolution Steps**:

**Option A: Relax Validation**
```bash
# Allow non-UTF-8 files with auto-detect encoding
kubectl set env deployment/slide-designer \
  DATA_IMPORT_ENCODING=auto \
  DATA_IMPORT_STRICT_VALIDATION=false

# Increase max file size
kubectl set env deployment/slide-designer \
  DATA_IMPORT_MAX_FILE_SIZE_MB=15
```

**Option B: Fix Encoding Issues**
```bash
# Enable charset detection
kubectl set env deployment/slide-designer \
  DATA_IMPORT_CHARSET_DETECTION=true \
  DATA_IMPORT_FALLBACK_ENCODING=latin1

# Add encoding conversion
kubectl set env deployment/slide-designer \
  DATA_IMPORT_CONVERT_TO_UTF8=true
```

**Option C: Increase Parsing Resources**
```bash
# Allocate more memory for parsing
kubectl set resources deployment/slide-designer \
  --limits=memory=4Gi --requests=memory=2Gi

# Enable streaming parsing (for large files)
kubectl set env deployment/slide-designer \
  DATA_IMPORT_STREAMING=true \
  DATA_IMPORT_CHUNK_SIZE=1000
```

**Verification**:
```bash
# Test import with various file formats
kubectl exec -it deployment/slide-designer -- \
  npm run test:integration -- --feature data-import

# Should show >99% success rate
```

---

## Batch 3: Advanced Features

### P1.3: Speaker Notes - Presenter View Sync Issues

**Symptoms**:
- Presenter view out of sync with main window
- Notes not updating in real-time
- Timer not accurate

**Common Causes**:
1. Window communication (postMessage) failing
2. Popup blocked by browser
3. State synchronization lag
4. Timer drift

**Diagnostic Steps**:

```bash
# 1. Check presenter view errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "speaker_notes" | grep -i "error\|sync"

# 2. Test presenter view generation
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const sn = require('./dist/slide-designer/features/speaker-notes');
    const html = sn.speakerNotesManager.generatePresenterView('test-session');
    console.log('HTML length:', html.length);
  "

# 3. Check timer accuracy
kubectl exec -it deployment/slide-designer -- \
  npm run test:unit -- --feature speaker-notes --test timer
```

**Resolution Steps**:

**Option A: Fix Window Communication**
```bash
# Enable fallback sync method
kubectl set env deployment/slide-designer \
  SPEAKER_NOTES_SYNC_METHOD=polling \
  SPEAKER_NOTES_SYNC_INTERVAL_MS=500

# Increase message timeout
kubectl set env deployment/slide-designer \
  SPEAKER_NOTES_MESSAGE_TIMEOUT_MS=5000
```

**Option B: Reset Presenter Session**
```bash
# Clear stale presenter sessions
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/speaker-notes/sessions/clear"

# Force resync all active sessions
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/speaker-notes/sessions/resync"
```

**Option C: Fix Timer Drift**
```bash
# Use server-side timer
kubectl set env deployment/slide-designer \
  SPEAKER_NOTES_TIMER_SOURCE=server \
  SPEAKER_NOTES_TIMER_SYNC_INTERVAL_MS=1000

# Enable NTP sync
kubectl set env deployment/slide-designer \
  SPEAKER_NOTES_USE_NTP=true
```

**Verification**:
```bash
# Test presenter view sync
kubectl exec -it deployment/slide-designer -- \
  npm run test:e2e -- --test speaker-notes-sync

# Should show <100ms sync latency
```

---

### P1.8: Custom Fonts - Upload Failures

**Symptoms**:
- Font uploads rejected with validation errors
- Uploaded fonts not appearing in font list
- Font preview not rendering

**Common Causes**:
1. Storage quota exceeded
2. Unsupported font format
3. Font file size >5MB
4. Font parsing errors

**Diagnostic Steps**:

```bash
# 1. Check storage usage
kubectl exec -it deployment/slide-designer -- \
  df -h /app/uploads/fonts

# 2. Check recent font upload errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "custom_fonts" | grep -i "upload\|error"

# 3. List uploaded fonts
kubectl exec -it deployment/slide-designer -- \
  ls -lh /app/uploads/fonts/ | head -20

# 4. Test font validation
kubectl exec -it deployment/slide-designer -- \
  npm run test:unit -- --feature custom-fonts --test validation
```

**Resolution Steps**:

**Option A: Clear Old Fonts**
```bash
# Remove fonts older than 90 days
kubectl exec -it deployment/slide-designer -- \
  find /app/uploads/fonts -type f -mtime +90 -delete

# Remove unused fonts
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const cf = require('./dist/slide-designer/features/custom-fonts');
    cf.customFontManager.cleanupUnusedFonts();
  "

# Check storage freed
kubectl exec -it deployment/slide-designer -- \
  df -h /app/uploads/fonts
```

**Option B: Increase Storage Limit**
```bash
# Expand PVC size
kubectl patch pvc slide-designer-fonts -p '{"spec":{"resources":{"requests":{"storage":"50Gi"}}}}'

# Wait for expansion
kubectl get pvc slide-designer-fonts -w
```

**Option C: Relax Font Validation**
```bash
# Increase max font size
kubectl set env deployment/slide-designer \
  FONT_MAX_SIZE_MB=10 \
  FONT_VALIDATION_STRICT=false

# Allow more font formats
kubectl set env deployment/slide-designer \
  FONT_ALLOWED_FORMATS=ttf,woff,woff2,otf,eot
```

**Verification**:
```bash
# Test font upload
kubectl exec -it deployment/slide-designer -- \
  npm run test:integration -- --feature custom-fonts --test upload

# Should show 100% success rate
```

---

### P1.11: AI Image Generation - High Costs / Low Success

**Symptoms**:
- Daily DALL-E 3 costs >$75
- Image generation failing >5% of requests
- Generation time >30s

**Common Causes**:
1. No rate limiting on API calls
2. Using HD quality unnecessarily
3. API key issues
4. Network latency to OpenAI

**Diagnostic Steps**:

```bash
# 1. Check daily spend
curl "http://prometheus:9090/api/v1/query?query=sum(increase(p1_feature_cost_usd{feature=\"ai_image_gen\"}[1d]))"

# 2. Check generation success rate
curl "http://prometheus:9090/api/v1/query?query=sum(rate(p1_feature_requests_total{feature=\"ai_image_gen\",status=\"success\"}[1h]))/sum(rate(p1_feature_requests_total{feature=\"ai_image_gen\"}[1h]))"

# 3. Check recent errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "ai_image_gen" | grep -i "error\|failed"

# 4. Identify high-usage users
kubectl logs -n agentic-flow deployment/slide-designer --tail=10000 | \
  grep "ai_image_gen" | grep "generate" | \
  jq -r '.user_id' | sort | uniq -c | sort -rn | head -10
```

**Resolution Steps**:

**Option A: Implement Rate Limiting**
```bash
# Add per-user daily limits
kubectl set env deployment/slide-designer \
  AI_IMAGE_GEN_LIMIT_PER_USER_DAILY=10 \
  AI_IMAGE_GEN_LIMIT_GLOBAL_DAILY=500 \
  AI_IMAGE_GEN_MAX_DAILY_COST_USD=50

# Enable cost-based throttling
kubectl set env deployment/slide-designer \
  AI_IMAGE_GEN_COST_THROTTLING=true
```

**Option B: Reduce Quality/Size**
```bash
# Use standard quality instead of HD
kubectl set env deployment/slide-designer \
  DALLE_QUALITY=standard \
  DALLE_SIZE=1024x1024

# This reduces cost by ~50%
```

**Option C: Implement Caching**
```bash
# Enable image generation caching
kubectl set env deployment/slide-designer \
  AI_IMAGE_GEN_CACHE_ENABLED=true \
  AI_IMAGE_GEN_CACHE_TTL_HOURS=168

# Cache common prompts
kubectl set env deployment/slide-designer \
  AI_IMAGE_GEN_PROMPT_DEDUPLICATION=true
```

**Option D: Verify API Key**
```bash
# Test API key
kubectl exec -it deployment/slide-designer -- \
  curl https://api.openai.com/v1/images/generations \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "dall-e-3",
      "prompt": "test",
      "n": 1,
      "size": "1024x1024",
      "quality": "standard"
    }'

# If 401: update API key
kubectl create secret generic openai-api-key \
  --from-literal=key=$NEW_OPENAI_API_KEY \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployment
kubectl rollout restart deployment/slide-designer -n agentic-flow
```

**Verification**:
```bash
# Monitor spend for next hour
watch -n 300 'curl -s "http://prometheus:9090/api/v1/query?query=sum(increase(p1_feature_cost_usd{feature=\"ai_image_gen\"}[1h]))" | jq .'

# Should stay under $2/hour ($50/day)
```

---

## Batch 4: System Features

### P1.6: i18n - Translation Missing / RTL Issues

**Symptoms**:
- Translations showing as keys (e.g., "common.save")
- Arabic/RTL layout broken
- Locale switching slow (>200ms)

**Common Causes**:
1. Translation files not loaded
2. Missing translation keys
3. RTL CSS not applied
4. Locale switching race conditions

**Diagnostic Steps**:

```bash
# 1. Check translation coverage
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const i18n = require('./dist/slide-designer/features/i18n');
    const coverage = i18n.i18n.getTranslationCoverage('es');
    console.log('Spanish coverage:', coverage);
  "

# 2. Test locale switching
kubectl exec -it deployment/slide-designer -- \
  npm run test:unit -- --feature i18n --test locale-switch

# 3. Check RTL support
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const i18n = require('./dist/slide-designer/features/i18n');
    i18n.i18n.setLocale('ar');
    console.log('RTL enabled:', i18n.i18n.isRTL());
  "

# 4. Check for missing keys
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "i18n" | grep "missing"
```

**Resolution Steps**:

**Option A: Reload Translation Files**
```bash
# Reload all translation dictionaries
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/i18n/reload"

# Verify translations loaded
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/i18n/languages" | jq 'map(.loaded)'
```

**Option B: Add Missing Translations**
```bash
# Find missing keys for a language
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const i18n = require('./dist/slide-designer/features/i18n');
    const missing = i18n.i18n.getMissingKeys('fr');
    console.log('Missing French keys:', missing);
  "

# Fallback to English for missing keys
kubectl set env deployment/slide-designer \
  I18N_FALLBACK_LOCALE=en \
  I18N_SHOW_MISSING_KEYS=false
```

**Option C: Fix RTL Styling**
```bash
# Force RTL recompile
kubectl exec -it deployment/slide-designer -- \
  npm run build:css -- --rtl

# Enable RTL debugging
kubectl set env deployment/slide-designer \
  I18N_RTL_DEBUG=true

# Restart to apply CSS changes
kubectl rollout restart deployment/slide-designer -n agentic-flow
```

**Verification**:
```bash
# Test all 10 supported languages
for lang in en es fr de zh ja ar pt ru hi; do
  kubectl exec -it deployment/slide-designer -- \
    node -e "
      const i18n = require('./dist/slide-designer/features/i18n');
      i18n.i18n.setLocale('$lang');
      console.log('$lang:', i18n.t('common.save'));
    "
done

# All should show translated text, not keys
```

---

### P1.10: Version History - Restore Failures

**Symptoms**:
- Version restore not working
- Snapshots corrupted or missing
- Restore taking >2s

**Common Causes**:
1. Snapshot storage corrupted
2. Version diff calculation errors
3. Database connection issues
4. Insufficient storage space

**Diagnostic Steps**:

```bash
# 1. Check version history depth
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const vh = require('./dist/slide-designer/features/version-history');
    const versions = vh.versionHistory.listVersions('test-presentation');
    console.log('Versions stored:', versions.length);
  "

# 2. Check snapshot integrity
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "version_history" | grep -i "snapshot\|corrupt"

# 3. Check storage usage
kubectl exec -it deployment/slide-designer -- \
  du -sh /app/data/versions/

# 4. Test restore operation
kubectl exec -it deployment/slide-designer -- \
  npm run test:integration -- --feature version-history --test restore
```

**Resolution Steps**:

**Option A: Rebuild Snapshot Index**
```bash
# Rebuild version index
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/versions/rebuild-index"

# Verify versions indexed
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/versions/stats" | jq .
```

**Option B: Clean Old Snapshots**
```bash
# Remove old snapshots (keep last 100)
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const vh = require('./dist/slide-designer/features/version-history');
    vh.versionHistory.cleanup({ keepLast: 100 });
  "

# Check storage freed
kubectl exec -it deployment/slide-designer -- \
  du -sh /app/data/versions/
```

**Option C: Fix Snapshot Corruption**
```bash
# Validate all snapshots
kubectl exec -it deployment/slide-designer -- \
  node -e "
    const vh = require('./dist/slide-designer/features/version-history');
    const corrupted = vh.versionHistory.validateAllSnapshots();
    console.log('Corrupted snapshots:', corrupted.length);
  "

# Recreate from presentation state
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/versions/recreate-from-state"
```

**Verification**:
```bash
# Test full restore cycle
kubectl exec -it deployment/slide-designer -- \
  npm run test:e2e -- --test version-restore

# Should complete in <2s with 100% success
```

---

### P1.13: Analytics - Events Not Being Tracked

**Symptoms**:
- Analytics events missing
- Event tracking success rate <99.5%
- Analytics dashboard empty

**Common Causes**:
1. Event queue overflow
2. Analytics service down
3. Event schema validation failing
4. Network issues to analytics backend

**Diagnostic Steps**:

```bash
# 1. Check event tracking rate
curl "http://prometheus:9090/api/v1/query?query=sum(rate(p1_feature_requests_total{feature=\"analytics\",operation=\"track_event\",status=\"success\"}[5m]))/sum(rate(p1_feature_requests_total{feature=\"analytics\",operation=\"track_event\"}[5m]))"

# 2. Check event queue depth
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/analytics/queue/depth"

# 3. Check recent tracking errors
kubectl logs -n agentic-flow deployment/slide-designer --tail=1000 | \
  grep "analytics" | grep -i "error\|failed"

# 4. Test event submission
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/analytics/track" \
    -H "Content-Type: application/json" \
    -d '{"event": "test", "properties": {"source": "runbook"}}'
```

**Resolution Steps**:

**Option A: Flush Event Queue**
```bash
# Flush pending events
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/analytics/queue/flush"

# Check queue cleared
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/analytics/queue/depth"
```

**Option B: Increase Queue Capacity**
```bash
# Increase event queue size
kubectl set env deployment/slide-designer \
  ANALYTICS_QUEUE_SIZE=10000 \
  ANALYTICS_BATCH_SIZE=100 \
  ANALYTICS_FLUSH_INTERVAL_MS=5000
```

**Option C: Relax Event Validation**
```bash
# Allow partial events
kubectl set env deployment/slide-designer \
  ANALYTICS_VALIDATION_STRICT=false \
  ANALYTICS_ALLOW_PARTIAL_EVENTS=true

# Enable fallback tracking
kubectl set env deployment/slide-designer \
  ANALYTICS_FALLBACK_ENABLED=true
```

**Verification**:
```bash
# Send test events and verify
kubectl exec -it deployment/slide-designer -- \
  npm run test:integration -- --feature analytics --test event-tracking

# Should show >99.5% success rate
```

---

## Batch 5: Collaborative Features

### P1.9: Collaboration - Sync Conflicts

**Symptoms**:
- Users seeing different slide states
- Comments not appearing
- Cursor positions incorrect
- Conflict resolution failures

**Common Causes**:
1. WebSocket connection drops
2. Operational Transform (OT) conflicts
3. Stale session state
4. Network latency issues

**Diagnostic Steps**:

```bash
# 1. Check WebSocket health
curl "http://prometheus:9090/api/v1/query?query=up{job=\"websocket-server\"}"

# 2. Check active collaboration sessions
kubectl exec -it deployment/collaboration-service -- \
  curl "localhost:8080/api/collaboration/sessions" | jq 'length'

# 3. Check conflict resolution rate
kubectl logs -n agentic-flow deployment/collaboration-service --tail=1000 | \
  grep "conflict_resolution" | \
  jq '{resolved: .resolved, failed: .failed}' | \
  jq -s 'group_by(.resolved) | map({status: (if .[0].resolved then "resolved" else "failed" end), count: length})'

# 4. Check sync latency
curl "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(p1_feature_request_duration_seconds_bucket{feature=\"collaboration\",operation=\"sync\"}[5m]))"
```

**Resolution Steps**:

**Option A: Force Session Resync**
```bash
# Broadcast resync to all sessions
kubectl exec -it deployment/collaboration-service -- \
  curl -X POST "localhost:8080/api/collaboration/sessions/resync-all"

# Clear stale sessions
kubectl exec -it deployment/collaboration-service -- \
  curl -X POST "localhost:8080/api/collaboration/sessions/cleanup" \
    -H "Content-Type: application/json" \
    -d '{"inactiveTimeout": 300}'
```

**Option B: Restart WebSocket Server**
```bash
# Notify clients of impending restart
kubectl exec -it deployment/websocket-server -- \
  curl -X POST "localhost:8080/api/websocket/broadcast" \
    -H "Content-Type: application/json" \
    -d '{"type": "server_restart", "reconnect_in": 10000}'

# Wait for clients to prepare
sleep 15

# Graceful restart
kubectl rollout restart deployment/websocket-server -n agentic-flow

# Verify clients reconnected
kubectl exec -it deployment/websocket-server -- \
  curl "localhost:8080/api/websocket/connections" | jq 'length'
```

**Option C: Reduce Concurrent Collaborators**
```bash
# Temporarily limit to 5 users per session
kubectl set env deployment/collaboration-service \
  MAX_COLLABORATORS_PER_SESSION=5

# This reduces conflict probability
```

**Verification**:
```bash
# Test collaboration sync
kubectl exec -it deployment/collaboration-service -- \
  npm run test:e2e -- --test collaboration-sync

# Should show <500ms sync latency, >99% conflict resolution
```

---

### P1.15: Live Presentation - Slide Sync Delay

**Symptoms**:
- Attendees seeing slides 1-2 seconds behind presenter
- Q&A not updating in real-time
- Poll results delayed

**Common Causes**:
1. WebSocket message queuing
2. Network latency
3. Too many attendees per session
4. Message serialization overhead

**Diagnostic Steps**:

```bash
# 1. Check slide sync latency
curl "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(p1_feature_request_duration_seconds_bucket{feature=\"live_presentation\",operation=\"slide_sync\"}[5m]))"

# 2. Check concurrent attendees
kubectl exec -it deployment/live-presentation-service -- \
  curl "localhost:8080/api/live/sessions" | \
  jq 'map(.attendees | length) | max'

# 3. Check WebSocket message queue
kubectl logs -n agentic-flow deployment/websocket-server --tail=1000 | \
  grep "queue_depth"

# 4. Check message delivery rate
kubectl logs -n agentic-flow deployment/live-presentation-service --tail=1000 | \
  grep "message_delivery" | \
  jq '{delivered: .delivered, failed: .failed}' | \
  jq -s 'group_by(.delivered) | map({status: (if .[0].delivered then "delivered" else "failed" end), count: length})'
```

**Resolution Steps**:

**Option A: Optimize WebSocket Throughput**
```bash
# Increase WebSocket buffer size
kubectl set env deployment/websocket-server \
  WS_SEND_BUFFER_SIZE=1048576 \
  WS_RECEIVE_BUFFER_SIZE=524288

# Enable message compression
kubectl set env deployment/websocket-server \
  WS_COMPRESSION=true \
  WS_COMPRESSION_THRESHOLD=1024
```

**Option B: Reduce Message Size**
```bash
# Send deltas instead of full slides
kubectl set env deployment/live-presentation-service \
  SLIDE_SYNC_MODE=delta \
  SLIDE_SYNC_COMPRESS=true

# Reduce poll update frequency
kubectl set env deployment/live-presentation-service \
  POLL_UPDATE_INTERVAL_MS=2000
```

**Option C: Scale WebSocket Server**
```bash
# Add more WebSocket server replicas
kubectl scale deployment/websocket-server --replicas=5 -n agentic-flow

# Enable session affinity
kubectl annotate service websocket-server \
  service.kubernetes.io/topology-mode=Auto
```

**Verification**:
```bash
# Test live presentation sync
kubectl exec -it deployment/live-presentation-service -- \
  npm run test:load -- --feature live-presentation --attendees 100

# p95 sync latency should be <300ms
```

---

### P1.14: Mobile App - Crash Rate High

**Symptoms**:
- App crash rate >1%
- Offline sync failures
- App launch time >2s

**Common Causes**:
1. Memory leaks in React Native
2. Unhandled exceptions
3. Native module crashes
4. Database corruption on device

**Diagnostic Steps**:

```bash
# 1. Check crash rate
curl "http://prometheus:9090/api/v1/query?query=sum(rate(p1_feature_errors_total{feature=\"mobile_app\",error_type=\"crash\"}[1h]))/sum(rate(p1_feature_requests_total{feature=\"mobile_app\"}[1h]))"

# 2. Check crash reports
kubectl logs -n agentic-flow deployment/mobile-backend --tail=1000 | \
  grep "crash_report" | jq .

# 3. Check offline sync success
kubectl logs -n agentic-flow deployment/mobile-backend --tail=1000 | \
  grep "offline_sync" | \
  jq '{success: .success, failed: .failed}' | \
  jq -s 'group_by(.success) | map({status: (if .[0].success then "success" else "failed" end), count: length})'

# 4. Check app version distribution
kubectl exec -it deployment/mobile-backend -- \
  curl "localhost:8080/api/mobile/versions" | \
  jq 'group_by(.version) | map({version: .[0].version, users: length}) | sort_by(.users) | reverse'
```

**Resolution Steps**:

**Option A: Push Hotfix Update**
```bash
# Deploy hotfix via OTA (Over-The-Air) update
kubectl exec -it deployment/mobile-backend -- \
  curl -X POST "localhost:8080/api/mobile/ota/deploy" \
    -H "Content-Type: application/json" \
    -d '{
      "version": "1.2.1-hotfix",
      "mandatory": true,
      "rollout": 100,
      "notes": "Critical crash fix"
    }'

# Monitor adoption rate
watch -n 60 'kubectl exec -it deployment/mobile-backend -- curl "localhost:8080/api/mobile/versions/1.2.1-hotfix/adoption"'
```

**Option B: Disable Problematic Feature**
```bash
# Disable feature causing crashes via remote config
kubectl exec -it deployment/mobile-backend -- \
  curl -X POST "localhost:8080/api/mobile/config/set" \
    -H "Content-Type: application/json" \
    -d '{
      "key": "ENABLE_OFFLINE_MODE",
      "value": false,
      "platforms": ["ios", "android"]
    }'

# Config propagates to all apps within 5 minutes
```

**Option C: Force App Update**
```bash
# Require minimum version
kubectl exec -it deployment/mobile-backend -- \
  curl -X POST "localhost:8080/api/mobile/min-version" \
    -H "Content-Type: application/json" \
    -d '{
      "ios": "1.2.0",
      "android": "1.2.0",
      "message": "Please update to the latest version for critical bug fixes"
    }'

# Users on older versions will see update prompt
```

**Verification**:
```bash
# Monitor crash rate over next 24 hours
watch -n 3600 'curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(p1_feature_errors_total{feature=\"mobile_app\",error_type=\"crash\"}[1h]))/sum(rate(p1_feature_requests_total{feature=\"mobile_app\"}[1h]))" | jq .'

# Should drop to <1% within 24 hours
```

---

## Cross-Feature Issues

### Issue: P1 Features Degrading P0 Performance

**Symptoms**:
- P0 latency increased >10% after enabling P1
- Resource contention (CPU/memory)
- Database connection pool exhaustion

**Diagnostic Steps**:

```bash
# 1. Compare P0 metrics before/after P1
curl "http://prometheus:9090/api/v1/query?query=(p0_with_p1_latency/p0_baseline_latency)*100"

# 2. Check resource usage by feature
kubectl top pods -n agentic-flow -l component=slide-designer

# 3. Identify resource-hungry P1 feature
kubectl logs -n agentic-flow deployment/slide-designer --tail=10000 | \
  grep "p1_feature" | \
  jq '{feature: .feature, cpu_ms: .cpu_time_ms, memory_mb: .memory_mb}' | \
  jq -s 'group_by(.feature) | map({feature: .[0].feature, total_cpu: (map(.cpu_ms) | add), total_memory: (map(.memory_mb) | add)}) | sort_by(.total_cpu) | reverse'
```

**Resolution Steps**:

```bash
# 1. Disable problematic P1 feature
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set <PROBLEMATIC_FEATURE> false

# 2. Verify P0 recovery
# Wait 5 minutes, check P0 metrics back to baseline

# 3. Implement resource limits for P1 feature
kubectl set env deployment/slide-designer \
  P1_<FEATURE>_MAX_CPU_MS=100 \
  P1_<FEATURE>_MAX_MEMORY_MB=50

# 4. Re-enable with limits
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags rollout <FEATURE> --percentage 10

# Monitor P0 performance impact
```

---

## Feature Flag Operations

### Quick Feature Flag Commands

```bash
# Check feature flag status
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags list

# Disable single feature
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_<FEATURE> false

# Enable single feature
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags set ENABLE_<FEATURE> true

# Gradual rollout
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags rollout ENABLE_<FEATURE> --percentage 50

# Disable entire batch
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags batch-disable batch<N>

# Emergency: disable ALL P1
kubectl exec -it deployment/feature-flag-service -- \
  npx feature-flags disable-all-p1

# Check flag propagation
kubectl exec -it deployment/slide-designer -- \
  curl "localhost:8080/api/feature-flags" | jq .
```

### Feature Flag Troubleshooting

**Issue: Flag changes not propagating**
```bash
# Check flag service health
kubectl get pods -n agentic-flow -l app=feature-flag-service

# Force flag refresh on slide-designer
kubectl exec -it deployment/slide-designer -- \
  curl -X POST "localhost:8080/api/feature-flags/refresh"

# Check flag evaluation latency
curl "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,rate(p1_feature_flag_latency_seconds_bucket[5m]))"
```

---

**Runbook Version**: 1.0
**Last Updated**: 2025-11-08
**Next Review**: 2025-12-08
**Owner**: SRE Team

**Related Documents**:
- [P1 SLIs/SLOs](/home/user/agenticflow/docs/p1-integration/sli-slo.md)
- [P1 Incident Response](/home/user/agenticflow/docs/p1-integration/incident-response.md)
- [P0 Runbooks](/home/user/agenticflow/docs/p0-integration/runbooks/common-issues.md)
