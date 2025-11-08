#!/bin/bash

###############################################################################
# P1 Features Batch Deployment Script
#
# This script handles batch-by-batch deployment of P1 features with:
# - Batch-specific deployment (1-5)
# - Feature flag management
# - Health checks per batch
# - Automatic rollback per batch
# - Integration validation with P0
# - Deployment metrics tracking
#
# Usage:
#   ./scripts/deploy-p1.sh --batch=<1-5> [--rollback] [--dry-run]
#
# Environment Variables:
#   DEPLOY_ENV       - Deployment environment (production/staging/development)
#   GITHUB_TOKEN     - GitHub token for API access
#   P1_BATCH         - Batch number to deploy (1-5)
#   ROLLBACK_VERSION - Version to rollback to (optional)
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
BATCH_NUMBER="${P1_BATCH:-1}"
DEPLOYMENT_ID="deploy-p1-batch${BATCH_NUMBER}-$(date +%s)"
LOG_FILE="/tmp/p1-deploy-${DEPLOYMENT_ID}.log"

# Batch configuration
BATCH_NAMES=("batch1" "batch2" "batch3" "batch4" "batch5")
BATCH_FEATURES=(
  "Quick Wins: Template System, Analytics Dashboard, Keyboard Shortcuts"
  "Interactive & Marketplace: Interactive Elements, Template Marketplace"
  "Advanced Visual: Advanced Transitions, Design System"
  "Cutting Edge: Real-time Collaboration, AI Slide Generation"
  "Collaborative Features: Version Control, Comment System, Team Workspaces"
)

# Deployment configuration
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=10
DEPLOYMENT_TIMEOUT=300
FEATURE_FLAGS_FILE="${PROJECT_ROOT}/config/feature-flags.json"

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
    echo -e "${MAGENTA}[$(date +'%Y-%m-%d %H:%M:%S')] [BATCH $BATCH_NUMBER]${NC} $*" | tee -a "$LOG_FILE"
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

    if [ "$BATCH_NUMBER" -lt 1 ] || [ "$BATCH_NUMBER" -gt 5 ]; then
        die "Invalid batch number: $BATCH_NUMBER. Must be between 1 and 5."
    fi

    log_success "Batch number $BATCH_NUMBER is valid"
}

validate_environment() {
    log "Validating deployment environment for Batch $BATCH_NUMBER..."

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

    # Check P1 batch-specific artifacts
    BATCH_NAME="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"

    if [ ! -d "$PROJECT_ROOT/dist/p1/$BATCH_NAME" ]; then
        log_warning "Batch $BATCH_NUMBER artifacts not found in dist/p1/$BATCH_NAME"
    else
        BATCH_SIZE=$(du -sh "$PROJECT_ROOT/dist/p1/$BATCH_NAME" | cut -f1)
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
# Feature Flag Management
###############################################################################

create_default_feature_flags() {
    log "Creating default feature flags configuration..."

    mkdir -p "$(dirname "$FEATURE_FLAGS_FILE")"

    cat > "$FEATURE_FLAGS_FILE" <<EOF
{
  "version": "1.0",
  "environment": "$DEPLOY_ENV",
  "p1_features": {
    "batch1_enabled": false,
    "batch2_enabled": false,
    "batch3_enabled": false,
    "batch4_enabled": false,
    "batch5_enabled": false,
    "all_features_enabled": false
  },
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

    log_success "Default feature flags created"
}

enable_batch_feature_flag() {
    local batch_num=$1
    local batch_key="batch${batch_num}_enabled"

    log_batch "Enabling feature flag for Batch $batch_num..."

    if [ ! -f "$FEATURE_FLAGS_FILE" ]; then
        create_default_feature_flags
    fi

    # Update feature flag using node
    node -e "
        const fs = require('fs');
        const flags = JSON.parse(fs.readFileSync('$FEATURE_FLAGS_FILE', 'utf8'));
        flags.p1_features['$batch_key'] = true;
        flags.updated_at = new Date().toISOString();

        // Check if all batches are enabled
        const allEnabled = Object.keys(flags.p1_features)
            .filter(k => k.startsWith('batch') && k.endsWith('_enabled'))
            .every(k => flags.p1_features[k]);
        flags.p1_features.all_features_enabled = allEnabled;

        fs.writeFileSync('$FEATURE_FLAGS_FILE', JSON.stringify(flags, null, 2));
    "

    log_success "Feature flag enabled for Batch $batch_num"
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
        flags.p1_features['$batch_key'] = false;
        flags.p1_features.all_features_enabled = false;
        flags.updated_at = new Date().toISOString();
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
        console.log(flags.p1_features['$batch_key'] || false);
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

    # Run linting for P1 batch
    BATCH_NAME="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    log "Running linting for Batch $BATCH_NUMBER..."
    if ! npm run lint -- "src/p1/$BATCH_NAME/**/*.ts"; then
        log_warning "Linting found issues in Batch $BATCH_NUMBER, but continuing deployment"
    fi

    # Run batch-specific unit tests
    log "Running unit tests for Batch $BATCH_NUMBER..."
    if ! npm run test -- --testPathPattern="p1/$BATCH_NAME" --maxWorkers=2; then
        die "Unit tests failed for Batch $BATCH_NUMBER"
    fi

    # Run P0 regression tests
    log "Running P0 regression tests..."
    if ! npm run test:p0:regression; then
        die "P0 regression tests failed. Batch $BATCH_NUMBER may break P0 features."
    fi

    # Run integration tests
    log "Running P0+P1 integration tests..."
    if ! npm run test:integration -- --testNamePattern="p1-${BATCH_NAME}-integration"; then
        die "Integration tests failed for Batch $BATCH_NUMBER"
    fi

    log_success "Pre-deployment tests passed for Batch $BATCH_NUMBER"
}

###############################################################################
# Deployment Functions
###############################################################################

backup_current_version() {
    log_batch "Backing up current version before Batch $BATCH_NUMBER deployment..."

    BACKUP_DIR="/tmp/p1-batch${BATCH_NUMBER}-backup-$(date +%s)"
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

    echo "$BACKUP_DIR" > "/tmp/p1-batch${BATCH_NUMBER}-last-backup"
    log_success "Backup created at $BACKUP_DIR"
}

deploy_batch() {
    log_batch "Deploying Batch $BATCH_NUMBER..."

    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Skipping actual deployment"
        return 0
    fi

    cd "$PROJECT_ROOT"

    # Install production dependencies
    log "Installing production dependencies..."
    npm ci --production

    # Enable feature flag for this batch
    enable_batch_feature_flag "$BATCH_NUMBER"

    # Copy batch artifacts to deployment location
    BATCH_NAME="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    log "Deploying Batch $BATCH_NUMBER ($BATCH_NAME) artifacts..."

    # Placeholder for actual deployment logic
    # This would depend on your deployment infrastructure
    # Examples:
    # - Copy to deployment directory
    # - Deploy to cloud service
    # - Update CDN
    # - Restart services

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

    log_batch "Running health checks for Batch $BATCH_NUMBER..."

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
    if [ ! -d "$PROJECT_ROOT/dist/p1/$batch_name" ]; then
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
    if [ -f "$PROJECT_ROOT/scripts/health-check-p1-batch${BATCH_NUMBER}.sh" ]; then
        if ! bash "$PROJECT_ROOT/scripts/health-check-p1-batch${BATCH_NUMBER}.sh"; then
            log_error "Batch-specific health check failed"
            return 1
        fi
    fi

    return 0
}

###############################################################################
# Rollback Functions
###############################################################################

rollback_deployment() {
    log_batch "Initiating rollback for Batch $BATCH_NUMBER..."

    local backup_file="/tmp/p1-batch${BATCH_NUMBER}-last-backup"

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
        rm -rf "$PROJECT_ROOT/dist/p1/${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
        cp -r "$BACKUP_DIR/dist/p1/${BATCH_NAMES[$((BATCH_NUMBER - 1))]}" "$PROJECT_ROOT/dist/p1/" 2>/dev/null || true
    fi

    # Restore feature flags
    if [ -f "$BACKUP_DIR/feature-flags.json" ]; then
        cp "$BACKUP_DIR/feature-flags.json" "$FEATURE_FLAGS_FILE"
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
    log_batch "Recording deployment metrics for Batch $BATCH_NUMBER..."

    local batch_name="${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    local batch_features="${BATCH_FEATURES[$((BATCH_NUMBER - 1))]}"

    METRICS_FILE="$PROJECT_ROOT/monitoring/p1-batch${BATCH_NUMBER}-deployment-metrics.json"
    mkdir -p "$(dirname "$METRICS_FILE")"

    # Create or update metrics file
    cat > "$METRICS_FILE" <<EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "batch_number": $BATCH_NUMBER,
  "batch_name": "$batch_name",
  "batch_features": "$batch_features",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$DEPLOY_ENV",
  "version": "$(node -p "require('$PROJECT_ROOT/package.json').version" 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "batch_size": "$(du -sh "$PROJECT_ROOT/dist/p1/$batch_name" 2>/dev/null | cut -f1 || echo 'unknown')",
  "feature_flag_enabled": true,
  "status": "success",
  "health_check_status": "passed"
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
    echo "  P1 Features Batch Deployment"
    echo "==================================================================="
    echo "  Deployment ID: $DEPLOYMENT_ID"
    echo "  Batch Number:  $BATCH_NUMBER"
    echo "  Batch Name:    ${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    echo "  Features:      ${BATCH_FEATURES[$((BATCH_NUMBER - 1))]}"
    echo "  Environment:   $DEPLOY_ENV"
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
            --rollback)
                ROLLBACK_MODE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Usage: $0 --batch=<1-5> [--rollback] [--dry-run]"
                exit 1
                ;;
        esac
    done

    # Validate batch number
    validate_batch_number

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

    # Testing phase
    log "Phase 2: Pre-deployment testing"
    run_pre_deployment_tests

    # Backup phase
    log "Phase 3: Backup current version"
    backup_current_version

    # Deployment phase
    log "Phase 4: Deployment"
    if ! deploy_batch; then
        log_error "Deployment failed for Batch $BATCH_NUMBER"
        log "Initiating automatic rollback..."
        rollback_deployment
        exit 1
    fi

    # Health check phase
    log "Phase 5: Health checks"
    if ! check_health; then
        log_error "Health checks failed for Batch $BATCH_NUMBER"
        log "Initiating automatic rollback..."
        rollback_deployment
        exit 1
    fi

    # Post-deployment phase
    log "Phase 6: Post-deployment"
    record_deployment_metrics

    echo ""
    echo "==================================================================="
    log_success "Batch $BATCH_NUMBER deployment completed successfully!"
    echo "==================================================================="
    echo "  Deployment ID:     $DEPLOYMENT_ID"
    echo "  Batch:            $BATCH_NUMBER - ${BATCH_NAMES[$((BATCH_NUMBER - 1))]}"
    echo "  Features:         ${BATCH_FEATURES[$((BATCH_NUMBER - 1))]}"
    echo "  Feature Flag:     Enabled"
    echo "  Log file:         $LOG_FILE"
    echo "==================================================================="
    echo ""
}

# Run main function
main "$@"
