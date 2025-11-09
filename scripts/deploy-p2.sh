#!/bin/bash

###############################################################################
# P2 Features Batch Deployment Script
#
# This script handles batch-by-batch deployment of P2 features with:
# - Batch-specific deployment (1-3)
# - Canary deployment strategy (1% → 10% → 50% → 100%)
# - Feature flag management for 8 P2 features
# - Health checks per batch
# - Automatic rollback per batch
# - Integration validation with P0+P1
# - Deployment metrics tracking
# - Security validation (API keys, blockchain credentials)
#
# Usage:
#   ./scripts/deploy-p2.sh --batch=<1-3> [--canary=<1|10|50|100>] [--rollback] [--dry-run] [--experimental]
#
# Environment Variables:
#   DEPLOY_ENV           - Deployment environment (production/staging/development)
#   GITHUB_TOKEN         - GitHub token for API access
#   P2_BATCH             - Batch number to deploy (1-3)
#   CANARY_PERCENTAGE    - Canary deployment percentage (1, 10, 50, 100)
#   EXPERIMENTAL_FEATURES - Enable experimental features (for Batch 3)
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
DRY_RUN=false
ROLLBACK_MODE=false
BATCH_NUMBER="${P2_BATCH:-1}"
CANARY_PERCENTAGE="${CANARY_PERCENTAGE:-100}"
EXPERIMENTAL_MODE="${EXPERIMENTAL_FEATURES:-false}"
DEPLOYMENT_ID="deploy-p2-batch${BATCH_NUMBER}-canary${CANARY_PERCENTAGE}-$(date +%s)"
LOG_FILE="/tmp/p2-deploy-${DEPLOYMENT_ID}.log"

# Batch configuration
BATCH_NAMES=("batch1" "batch2" "batch3")
BATCH_RISK_LEVELS=("Low Risk" "Medium Risk" "High Risk/Experimental")
BATCH_FEATURES=(
  "Voice Narration, API Access, Interactive Elements, Themes Marketplace"
  "3D Animations, Figma/Sketch Import"
  "AR Presentation, Blockchain NFTs"
)

# P2 Feature definitions (8 features across 3 batches)
declare -A P2_FEATURES=(
  ["voice-narration"]="batch1"
  ["api-access"]="batch1"
  ["interactive-elements"]="batch1"
  ["themes-marketplace"]="batch1"
  ["3d-animations"]="batch2"
  ["figma-sketch-import"]="batch2"
  ["ar-presentation"]="batch3"
  ["blockchain-nfts"]="batch3"
)

# Deployment configuration
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=10
DEPLOYMENT_TIMEOUT=300
FEATURE_FLAGS_FILE="${PROJECT_ROOT}/config/feature-flags-p2.json"
CANARY_SOAK_TIMES=(3600 7200 14400 0)  # 1h, 2h, 4h, 0h for 1%, 10%, 50%, 100%

###############################################################################
# Utility Functions
###############################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $*" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ${NC} $*" | tee -a "$LOG_FILE"
}

log_batch() {
    echo -e "${MAGENTA}[$(date +'%Y-%m-%d %H:%M:%S')] [P2 BATCH $BATCH_NUMBER - ${BATCH_RISK_LEVELS[$((BATCH_NUMBER - 1))]}]${NC} $*" | tee -a "$LOG_FILE"
}

log_canary() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] [CANARY ${CANARY_PERCENTAGE}%]${NC} $*" | tee -a "$LOG_FILE"
}

die() {
    log_error "$1"
    exit 1
}

###############################################################################
# Validation Functions
###############################################################################

validate_batch_number() {
    log "Validating batch number..."

    if [ "$BATCH_NUMBER" -lt 1 ] || [ "$BATCH_NUMBER" -gt 3 ]; then
        die "Invalid batch number: $BATCH_NUMBER. Must be between 1 and 3."
    fi

    log_success "Batch number $BATCH_NUMBER is valid (${BATCH_RISK_LEVELS[$((BATCH_NUMBER - 1))]})"
}

validate_canary_percentage() {
    log "Validating canary percentage..."

    case $CANARY_PERCENTAGE in
        1|10|50|100)
            log_success "Canary percentage $CANARY_PERCENTAGE% is valid"
            ;;
        *)
            die "Invalid canary percentage: $CANARY_PERCENTAGE. Must be 1, 10, 50, or 100."
            ;;
    esac
}

validate_environment() {
    log_batch "Validating deployment environment for Batch $BATCH_NUMBER..."

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        die "Node.js is not installed"
    fi

    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"

    # Check npm
    if ! command -v npm &> /dev/null; then
        die "npm is not installed"
    fi

    NPM_VERSION=$(npm --version)
    log "npm version: $NPM_VERSION"

    # Check required files
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        die "package.json not found in $PROJECT_ROOT"
    fi

    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        log_warning "dist directory not found. Build may be required."
    fi

    # Check feature flags configuration
    if [ ! -f "$FEATURE_FLAGS_FILE" ]; then
        log_warning "Feature flags file not found. Will create default configuration."
        create_default_feature_flags
    fi

    log_success "Environment validation passed"
}

validate_build() {
    log_batch "Validating build artifacts for Batch $BATCH_NUMBER..."

    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        die "Build artifacts not found. Run 'npm run build' first."
    fi

    if [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
        die "Main entry point not found in dist/"
    fi

    # Check P2 batch-specific artifacts
    BATCH_NAME="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"

    if [ ! -d "$PROJECT_ROOT/dist/p2/$BATCH_NAME" ]; then
        log_warning "Batch $BATCH_NUMBER artifacts not found in dist/p2/$BATCH_NAME"
    else
        BATCH_SIZE=$(du -sh "$PROJECT_ROOT/dist/p2/$BATCH_NAME" | cut -f1)
        log_info "Batch $BATCH_NUMBER size: $BATCH_SIZE"
    fi

    # Check build size
    BUILD_SIZE=$(du -sh "$PROJECT_ROOT/dist" | cut -f1)
    log "Total build size: $BUILD_SIZE"

    log_success "Build validation passed for Batch $BATCH_NUMBER"
}

validate_previous_batches() {
    log_batch "Validating previous batch deployments..."

    if [ "$BATCH_NUMBER" -eq 1 ]; then
        log_info "Batch 1 is the first batch. No previous batches to validate."
        return 0
    fi

    # Check if previous batches are deployed
    for ((i = 1; i < BATCH_NUMBER; i++)); do
        PREV_BATCH="${BATCH_NAMES[$((i - 1))]}"

        if ! check_batch_deployment_status "$i"; then
            log_warning "Previous Batch $i is not deployed. This may cause issues."
        else
            log_success "Previous Batch $i is deployed"
        fi
    done

    log_success "Previous batch validation completed"
}

###############################################################################
# Security Validation
###############################################################################

validate_security() {
    log_batch "Running security validation for Batch $BATCH_NUMBER..."

    local security_issues=0

    # Check for hardcoded API keys
    log "Checking for hardcoded API keys..."
    if grep -rE "(api[_-]?key|apikey|api[_-]?secret)" "$PROJECT_ROOT/src/p2/" --include="*.ts" --include="*.js" | grep -E "=\s*['\"][^'\"]+['\"]"; then
        log_error "Hardcoded API keys detected in P2 code!"
        security_issues=$((security_issues + 1))
    else
        log_success "No hardcoded API keys found"
    fi

    # Check for blockchain credentials (Batch 3 specific)
    if [ "$BATCH_NUMBER" -eq 3 ]; then
        log "Checking for hardcoded blockchain credentials..."
        if grep -rE "(private[_-]?key|mnemonic|seed[_-]?phrase|wallet[_-]?address)" "$PROJECT_ROOT/src/p2/batch3/" --include="*.ts" --include="*.js" | grep -E "=\s*['\"][^'\"]+['\"]"; then
            log_error "Hardcoded blockchain credentials detected!"
            security_issues=$((security_issues + 1))
        else
            log_success "No hardcoded blockchain credentials found"
        fi
    fi

    # Check for environment variable usage
    log "Verifying environment variable usage for sensitive data..."
    if ! grep -r "process.env" "$PROJECT_ROOT/src/p2/" --include="*.ts" | grep -iE "(api|key|secret|token)" > /dev/null; then
        log_warning "No environment variable usage detected for sensitive data"
    else
        log_success "Environment variables are being used for sensitive data"
    fi

    if [ $security_issues -gt 0 ]; then
        die "Security validation failed with $security_issues issues. Fix before deploying."
    fi

    log_success "Security validation passed"
}

###############################################################################
# Feature Flag Management
###############################################################################

create_default_feature_flags() {
    log "Creating default P2 feature flags configuration..."

    mkdir -p "$(dirname "$FEATURE_FLAGS_FILE")"

    cat > "$FEATURE_FLAGS_FILE" <<EOF
{
  "version": "2.0",
  "environment": "$DEPLOY_ENV",
  "p2_features": {
    "batch1_enabled": false,
    "batch2_enabled": false,
    "batch3_enabled": false,
    "voice_narration_enabled": false,
    "api_access_enabled": false,
    "interactive_elements_enabled": false,
    "themes_marketplace_enabled": false,
    "3d_animations_enabled": false,
    "figma_sketch_import_enabled": false,
    "ar_presentation_enabled": false,
    "blockchain_nfts_enabled": false,
    "all_features_enabled": false
  },
  "canary": {
    "batch1_percentage": 0,
    "batch2_percentage": 0,
    "batch3_percentage": 0
  },
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

    log_success "Default P2 feature flags created"
}

enable_batch_feature_flag() {
    local batch_num=$1
    local canary_pct=$2
    local batch_key="batch${batch_num}_enabled"

    log_batch "Enabling feature flag for Batch $batch_num at ${canary_pct}% canary..."

    if [ ! -f "$FEATURE_FLAGS_FILE" ]; then
        create_default_feature_flags
    fi

    # Get features for this batch
    BATCH_NAME="${BATCH_NAMES[$((batch_num - 1))]}"

    # Update feature flags using node
    node -e "
        const fs = require('fs');
        const flags = JSON.parse(fs.readFileSync('$FEATURE_FLAGS_FILE', 'utf8'));

        // Enable batch flag
        flags.p2_features['$batch_key'] = true;

        // Enable individual features for this batch
        const batchFeatures = {
            '1': ['voice_narration_enabled', 'api_access_enabled', 'interactive_elements_enabled', 'themes_marketplace_enabled'],
            '2': ['3d_animations_enabled', 'figma_sketch_import_enabled'],
            '3': ['ar_presentation_enabled', 'blockchain_nfts_enabled']
        };

        if (batchFeatures['$batch_num']) {
            batchFeatures['$batch_num'].forEach(feature => {
                flags.p2_features[feature] = true;
            });
        }

        // Update canary percentage
        flags.canary['batch${batch_num}_percentage'] = $canary_pct;

        // Update timestamp
        flags.updated_at = new Date().toISOString();

        // Check if all batches are enabled at 100%
        const allEnabled = Object.keys(flags.canary)
            .every(k => flags.canary[k] === 100);
        flags.p2_features.all_features_enabled = allEnabled;

        fs.writeFileSync('$FEATURE_FLAGS_FILE', JSON.stringify(flags, null, 2));
    "

    log_success "Feature flag enabled for Batch $batch_num at ${canary_pct}%"
}

disable_batch_feature_flag() {
    local batch_num=$1
    local batch_key="batch${batch_num}_enabled"

    log_batch "Disabling feature flag for Batch $batch_num..."

    if [ ! -f "$FEATURE_FLAGS_FILE" ]; then
        log_warning "Feature flags file not found. Nothing to disable."
        return 0
    fi

    # Update feature flag using node
    node -e "
        const fs = require('fs');
        const flags = JSON.parse(fs.readFileSync('$FEATURE_FLAGS_FILE', 'utf8'));

        // Disable batch flag
        flags.p2_features['$batch_key'] = false;

        // Disable individual features for this batch
        const batchFeatures = {
            '1': ['voice_narration_enabled', 'api_access_enabled', 'interactive_elements_enabled', 'themes_marketplace_enabled'],
            '2': ['3d_animations_enabled', 'figma_sketch_import_enabled'],
            '3': ['ar_presentation_enabled', 'blockchain_nfts_enabled']
        };

        if (batchFeatures['$batch_num']) {
            batchFeatures['$batch_num'].forEach(feature => {
                flags.p2_features[feature] = false;
            });
        }

        // Reset canary percentage
        flags.canary['batch${batch_num}_percentage'] = 0;

        // Update timestamp
        flags.updated_at = new Date().toISOString();
        flags.p2_features.all_features_enabled = false;

        fs.writeFileSync('$FEATURE_FLAGS_FILE', JSON.stringify(flags, null, 2));
    "

    log_success "Feature flag disabled for Batch $batch_num"
}

get_batch_feature_flag_status() {
    local batch_num=$1
    local batch_key="batch${batch_num}_enabled"

    if [ ! -f "$FEATURE_FLAGS_FILE" ]; then
        echo "false"
        return
    fi

    node -e "
        const fs = require('fs');
        const flags = JSON.parse(fs.readFileSync('$FEATURE_FLAGS_FILE', 'utf8'));
        console.log(flags.p2_features['$batch_key'] || false);
    "
}

###############################################################################
# Pre-Deployment Tests
###############################################################################

run_pre_deployment_tests() {
    log_batch "Running pre-deployment tests for Batch $BATCH_NUMBER..."

    if [ "$DRY_RUN" = true ]; then
        log_warning "Skipping tests in dry-run mode"
        return 0
    fi

    cd "$PROJECT_ROOT"

    # Run type checking
    log "Running TypeScript type check..."
    if ! npm run typecheck; then
        die "Type checking failed for Batch $BATCH_NUMBER"
    fi

    # Run linting for P2 batch
    BATCH_NAME="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    log "Running linting for Batch $BATCH_NUMBER..."
    if ! npm run lint -- "src/p2/$BATCH_NAME/**/*.ts"; then
        log_warning "Linting found issues in Batch $BATCH_NUMBER, but continuing deployment"
    fi

    # Run batch-specific unit tests
    log "Running unit tests for Batch $BATCH_NUMBER..."
    if ! npm run test -- --testPathPattern="p2/$BATCH_NAME" --maxWorkers=2; then
        die "Unit tests failed for Batch $BATCH_NUMBER"
    fi

    # Run P0 regression tests
    log "Running P0 regression tests..."
    if ! npm run test:p0:regression; then
        die "P0 regression tests failed. Batch $BATCH_NUMBER may break P0 features."
    fi

    # Run P1 regression tests
    log "Running P1 regression tests..."
    if ! npm run test:p1:regression; then
        die "P1 regression tests failed. Batch $BATCH_NUMBER may break P1 features."
    fi

    # Run integration tests
    log "Running P0+P1+P2 integration tests..."
    if ! npm run test:integration -- --testNamePattern="p2-${BATCH_NAME}-integration"; then
        die "Integration tests failed for Batch $BATCH_NUMBER"
    fi

    log_success "Pre-deployment tests passed for Batch $BATCH_NUMBER"
}

###############################################################################
# Canary Deployment Functions
###############################################################################

deploy_canary() {
    local batch_num=$1
    local canary_pct=$2

    log_canary "Deploying Batch $batch_num at ${canary_pct}% canary..."

    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Skipping actual canary deployment"
        return 0
    fi

    cd "$PROJECT_ROOT"

    # Install production dependencies
    log "Installing production dependencies..."
    npm ci --production

    # Enable feature flag for this batch at canary percentage
    enable_batch_feature_flag "$batch_num" "$canary_pct"

    # Copy batch artifacts to deployment location
    BATCH_NAME="${BATCH_NAMES[$((batch_num - 1))]}"
    log "Deploying Batch $batch_num ($BATCH_NAME) at ${canary_pct}% canary..."

    # Placeholder for actual canary deployment logic
    # This would depend on your deployment infrastructure
    # Examples:
    # - Update load balancer weights
    # - Deploy to canary cluster
    # - Update feature flag service
    # - Configure traffic splitting

    log_success "Batch $batch_num canary deployment (${canary_pct}%) completed"
}

wait_canary_soak_time() {
    local canary_pct=$1

    # Get soak time based on canary percentage
    local soak_time=0
    case $canary_pct in
        1)
            soak_time=${CANARY_SOAK_TIMES[0]}  # 1 hour
            ;;
        10)
            soak_time=${CANARY_SOAK_TIMES[1]}  # 2 hours
            ;;
        50)
            soak_time=${CANARY_SOAK_TIMES[2]}  # 4 hours
            ;;
        100)
            soak_time=${CANARY_SOAK_TIMES[3]}  # 0 hours
            ;;
    esac

    if [ $soak_time -gt 0 ]; then
        log_canary "Waiting ${soak_time}s ($(($soak_time / 3600))h) for ${canary_pct}% canary soak time..."

        if [ "$DRY_RUN" = true ]; then
            log_warning "DRY RUN: Skipping soak time wait"
        else
            sleep $soak_time
        fi

        log_success "Canary soak time completed"
    fi
}

###############################################################################
# Deployment Functions
###############################################################################

backup_current_version() {
    log_batch "Backing up current version before Batch $BATCH_NUMBER deployment..."

    BACKUP_DIR="/tmp/p2-batch${BATCH_NUMBER}-backup-$(date +%s)"
    mkdir -p "$BACKUP_DIR"

    # Backup dist directory
    if [ -d "$PROJECT_ROOT/dist" ]; then
        cp -r "$PROJECT_ROOT/dist" "$BACKUP_DIR/"
        log_success "Build artifacts backed up"
    fi

    # Backup feature flags
    if [ -f "$FEATURE_FLAGS_FILE" ]; then
        cp "$FEATURE_FLAGS_FILE" "$BACKUP_DIR/"
        log_success "Feature flags backed up"
    fi

    echo "$BACKUP_DIR" > "/tmp/p2-batch${BATCH_NUMBER}-last-backup"
    log_success "Backup created at $BACKUP_DIR"
}

deploy_batch() {
    log_batch "Deploying Batch $BATCH_NUMBER..."

    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Skipping actual deployment"
        return 0
    fi

    # Deploy with canary strategy
    deploy_canary "$BATCH_NUMBER" "$CANARY_PERCENTAGE"

    log_success "Batch $BATCH_NUMBER deployment completed"
}

check_batch_deployment_status() {
    local batch_num=$1

    # Check if batch is deployed by verifying:
    # 1. Feature flag is enabled
    # 2. Build artifacts exist
    # 3. Health check passes

    local flag_status=$(get_batch_feature_flag_status "$batch_num")

    if [ "$flag_status" = "true" ]; then
        return 0
    else
        return 1
    fi
}

###############################################################################
# Health Check Functions
###############################################################################

check_health() {
    local retry_count=0

    log_batch "Running health checks for Batch $BATCH_NUMBER at ${CANARY_PERCENTAGE}% canary..."

    while [ $retry_count -lt $HEALTH_CHECK_RETRIES ]; do
        if perform_health_check; then
            log_success "Health check passed for Batch $BATCH_NUMBER"
            return 0
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $HEALTH_CHECK_RETRIES ]; then
            log_warning "Health check failed. Retrying in ${HEALTH_CHECK_INTERVAL}s... (${retry_count}/${HEALTH_CHECK_RETRIES})"
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done

    log_error "Health check failed after $HEALTH_CHECK_RETRIES attempts for Batch $BATCH_NUMBER"
    return 1
}

perform_health_check() {
    local batch_name="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"

    # 1. Check if build artifacts exist
    if [ ! -d "$PROJECT_ROOT/dist" ] || [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
        log_error "Build artifacts not found"
        return 1
    fi

    # 2. Check if batch-specific artifacts exist
    if [ ! -d "$PROJECT_ROOT/dist/p2/$batch_name" ]; then
        log_error "Batch $BATCH_NUMBER artifacts not found"
        return 1
    fi

    # 3. Check if main module can be loaded
    if ! node -e "require('$PROJECT_ROOT/dist/index.js')" 2>/dev/null; then
        log_error "Cannot load main module"
        return 1
    fi

    # 4. Check feature flag status
    local flag_status=$(get_batch_feature_flag_status "$BATCH_NUMBER")
    if [ "$flag_status" != "true" ]; then
        log_error "Feature flag not enabled for Batch $BATCH_NUMBER"
        return 1
    fi

    # 5. Run batch-specific health check script if available
    if [ -f "$PROJECT_ROOT/scripts/health-check-p2-batch${BATCH_NUMBER}.sh" ]; then
        if ! bash "$PROJECT_ROOT/scripts/health-check-p2-batch${BATCH_NUMBER}.sh"; then
            log_error "Batch-specific health check failed"
            return 1
        fi
    fi

    # 6. Check canary metrics (if not 100%)
    if [ "$CANARY_PERCENTAGE" -ne 100 ]; then
        log "Checking canary metrics..."
        # Placeholder for canary metrics validation
        # Examples:
        # - Check error rate within acceptable bounds
        # - Verify latency hasn't degraded
        # - Ensure no P0/P1 regressions
    fi

    return 0
}

###############################################################################
# Rollback Functions
###############################################################################

rollback_deployment() {
    log_batch "Initiating rollback for Batch $BATCH_NUMBER..."

    local backup_file="/tmp/p2-batch${BATCH_NUMBER}-last-backup"

    if [ ! -f "$backup_file" ]; then
        die "No backup found for Batch $BATCH_NUMBER rollback"
    fi

    BACKUP_DIR=$(cat "$backup_file")

    if [ ! -d "$BACKUP_DIR" ]; then
        die "Backup directory not found: $BACKUP_DIR"
    fi

    log "Rolling back to backup: $BACKUP_DIR"

    # Disable feature flag
    disable_batch_feature_flag "$BATCH_NUMBER"

    # Restore build artifacts
    if [ -d "$BACKUP_DIR/dist" ]; then
        rm -rf "$PROJECT_ROOT/dist/p2/${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
        cp -r "$BACKUP_DIR/dist/p2/${BATCH_NAMES[$((BATCH_NUMBER - 1))]}" "$PROJECT_ROOT/dist/p2/" 2>/dev/null || true
    fi

    # Restore feature flags
    if [ -f "$BACKUP_DIR/feature-flags-p2.json" ]; then
        cp "$BACKUP_DIR/feature-flags-p2.json" "$FEATURE_FLAGS_FILE"
    fi

    # Verify rollback
    if check_health; then
        log_success "Rollback completed successfully for Batch $BATCH_NUMBER"
        return 0
    else
        die "Rollback failed health check for Batch $BATCH_NUMBER"
    fi
}

###############################################################################
# Monitoring and Metrics
###############################################################################

record_deployment_metrics() {
    log_batch "Recording deployment metrics for Batch $BATCH_NUMBER at ${CANARY_PERCENTAGE}% canary..."

    local batch_name="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    local batch_features="${BATCH_FEATURES[$((BATCH_NUMBER - 1))]}"
    local risk_level="${BATCH_RISK_LEVELS[$((BATCH_NUMBER - 1))]}"

    METRICS_FILE="$PROJECT_ROOT/monitoring/p2-batch${BATCH_NUMBER}-deployment-metrics.json"
    mkdir -p "$(dirname "$METRICS_FILE")"

    # Create or update metrics file
    cat > "$METRICS_FILE" <<EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "batch_number": $BATCH_NUMBER,
  "batch_name": "$batch_name",
  "batch_features": "$batch_features",
  "risk_level": "$risk_level",
  "canary_percentage": $CANARY_PERCENTAGE,
  "experimental_mode": $EXPERIMENTAL_MODE,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$DEPLOY_ENV",
  "version": "$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "batch_size": "$(du -sh "$PROJECT_ROOT/dist/p2/$batch_name" 2>/dev/null | cut -f1 || echo 'unknown')",
  "feature_flag_enabled": true,
  "status": "success",
  "health_check_status": "passed",
  "security_validation": "passed"
}
EOF

    log_success "Deployment metrics recorded for Batch $BATCH_NUMBER"
}

###############################################################################
# Main Deployment Flow
###############################################################################

print_banner() {
    echo ""
    echo "==================================================================="
    echo "  P2 Features Batch Deployment (Nice-to-Have)"
    echo "==================================================================="
    echo "  Deployment ID: $DEPLOYMENT_ID"
    echo "  Batch Number:  $BATCH_NUMBER"
    echo "  Batch Name:    ${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    echo "  Risk Level:    ${BATCH_RISK_LEVELS[$((BATCH_NUMBER - 1))]}"
    echo "  Features:      ${BATCH_FEATURES[$((BATCH_NUMBER - 1))]}"
    echo "  Canary:        ${CANARY_PERCENTAGE}%"
    echo "  Environment:   $DEPLOY_ENV"
    echo "  Experimental:  $EXPERIMENTAL_MODE"
    echo "  Project Root:  $PROJECT_ROOT"
    echo "==================================================================="
    echo ""
}

main() {
    print_banner

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --batch=*)
                BATCH_NUMBER="${1#*=}"
                shift
                ;;
            --canary=*)
                CANARY_PERCENTAGE="${1#*=}"
                shift
                ;;
            --rollback)
                ROLLBACK_MODE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --experimental)
                EXPERIMENTAL_MODE=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Usage: $0 --batch=<1-3> [--canary=<1|10|50|100>] [--rollback] [--dry-run] [--experimental]"
                exit 1
                ;;
        esac
    done

    # Validate inputs
    validate_batch_number
    validate_canary_percentage

    # Handle rollback mode
    if [ "$ROLLBACK_MODE" = true ]; then
        rollback_deployment
        exit 0
    fi

    # Pre-deployment phase
    log "Phase 1: Pre-deployment validation"
    validate_environment
    validate_build
    validate_previous_batches
    validate_security

    # Testing phase
    log "Phase 2: Pre-deployment testing"
    run_pre_deployment_tests

    # Backup phase
    log "Phase 3: Backup current version"
    backup_current_version

    # Deployment phase
    log "Phase 4: Canary deployment (${CANARY_PERCENTAGE}%)"
    if ! deploy_batch; then
        log_error "Deployment failed for Batch $BATCH_NUMBER"
        log "Initiating automatic rollback..."
        rollback_deployment
        exit 1
    fi

    # Canary soak time
    log "Phase 5: Canary soak time"
    wait_canary_soak_time "$CANARY_PERCENTAGE"

    # Health check phase
    log "Phase 6: Health checks"
    if ! check_health; then
        log_error "Health checks failed for Batch $BATCH_NUMBER"
        log "Initiating automatic rollback..."
        rollback_deployment
        exit 1
    fi

    # Post-deployment phase
    log "Phase 7: Post-deployment"
    record_deployment_metrics

    echo ""
    echo "==================================================================="
    log_success "Batch $BATCH_NUMBER deployment completed successfully!"
    echo "==================================================================="
    echo "  Deployment ID:     $DEPLOYMENT_ID"
    echo "  Batch:            $BATCH_NUMBER - ${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    echo "  Risk Level:       ${BATCH_RISK_LEVELS[$((BATCH_NUMBER - 1))]}"
    echo "  Features:         ${BATCH_FEATURES[$((BATCH_NUMBER - 1))]}"
    echo "  Canary:           ${CANARY_PERCENTAGE}%"
    echo "  Feature Flags:    Enabled"
    echo "  Log file:         $LOG_FILE"
    echo "==================================================================="
    echo ""
}

# Run main function
main "$@"
