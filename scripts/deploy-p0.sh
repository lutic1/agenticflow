#!/bin/bash

###############################################################################
# P0 Integration Deployment Script
#
# This script handles automated deployment of P0 integration with:
# - Pre-deployment validation
# - Health checks
# - Automatic rollback on failure
# - Deployment metrics
#
# Usage:
#   ./scripts/deploy-p0.sh [--rollback] [--dry-run]
#
# Environment Variables:
#   DEPLOY_ENV       - Deployment environment (production/staging/development)
#   GITHUB_TOKEN     - GitHub token for API access
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
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
DRY_RUN=false
ROLLBACK_MODE=false
DEPLOYMENT_ID="deploy-$(date +%s)"
LOG_FILE="/tmp/p0-deploy-${DEPLOYMENT_ID}.log"

# Deployment configuration
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=10
DEPLOYMENT_TIMEOUT=300

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

# Exit with error message
die() {
    log_error "$1"
    exit 1
}

###############################################################################
# Pre-Deployment Validation
###############################################################################

validate_environment() {
    log "Validating deployment environment..."

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

    log_success "Environment validation passed"
}

validate_build() {
    log "Validating build artifacts..."

    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        die "Build artifacts not found. Run 'npm run build' first."
    fi

    if [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
        die "Main entry point not found in dist/"
    fi

    # Check build size
    BUILD_SIZE=$(du -sh "$PROJECT_ROOT/dist" | cut -f1)
    log "Build size: $BUILD_SIZE"

    log_success "Build validation passed"
}

run_pre_deployment_tests() {
    log "Running pre-deployment tests..."

    if [ "$DRY_RUN" = true ]; then
        log_warning "Skipping tests in dry-run mode"
        return 0
    fi

    cd "$PROJECT_ROOT"

    # Run type checking
    log "Running TypeScript type check..."
    if ! npm run typecheck; then
        die "Type checking failed"
    fi

    # Run linting
    log "Running linting..."
    if ! npm run lint; then
        log_warning "Linting found issues, but continuing deployment"
    fi

    # Run tests
    log "Running tests..."
    if ! npm test -- --maxWorkers=2; then
        die "Tests failed"
    fi

    log_success "Pre-deployment tests passed"
}

###############################################################################
# Deployment Functions
###############################################################################

backup_current_version() {
    log "Backing up current version..."

    BACKUP_DIR="/tmp/p0-backup-$(date +%s)"
    mkdir -p "$BACKUP_DIR"

    if [ -d "$PROJECT_ROOT/dist" ]; then
        cp -r "$PROJECT_ROOT/dist" "$BACKUP_DIR/"
        log_success "Backup created at $BACKUP_DIR"
        echo "$BACKUP_DIR" > /tmp/p0-last-backup
    else
        log_warning "No dist directory to backup"
    fi
}

deploy_build() {
    log "Deploying P0 integration..."

    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Skipping actual deployment"
        return 0
    fi

    cd "$PROJECT_ROOT"

    # Install production dependencies
    log "Installing production dependencies..."
    npm ci --production

    # Copy artifacts to deployment location
    # This is a placeholder - adjust based on your actual deployment target
    log "Deploying build artifacts..."

    # Example: If deploying to a specific directory
    # DEPLOY_DIR="/var/www/p0-integration"
    # mkdir -p "$DEPLOY_DIR"
    # cp -r dist/* "$DEPLOY_DIR/"

    # Example: If deploying to npm registry
    # npm publish --dry-run

    log_success "Deployment completed"
}

###############################################################################
# Health Check Functions
###############################################################################

check_health() {
    local retry_count=0

    log "Running health checks..."

    while [ $retry_count -lt $HEALTH_CHECK_RETRIES ]; do
        if perform_health_check; then
            log_success "Health check passed"
            return 0
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $HEALTH_CHECK_RETRIES ]; then
            log_warning "Health check failed. Retrying in ${HEALTH_CHECK_INTERVAL}s... (${retry_count}/${HEALTH_CHECK_RETRIES})"
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done

    log_error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
    return 1
}

perform_health_check() {
    # Basic health checks

    # 1. Check if build artifacts exist
    if [ ! -d "$PROJECT_ROOT/dist" ] || [ ! -f "$PROJECT_ROOT/dist/index.js" ]; then
        log_error "Build artifacts not found"
        return 1
    fi

    # 2. Check if main module can be loaded
    if ! node -e "require('$PROJECT_ROOT/dist/index.js')" 2>/dev/null; then
        log_error "Cannot load main module"
        return 1
    fi

    # 3. Check file permissions
    if [ ! -r "$PROJECT_ROOT/dist/index.js" ]; then
        log_error "Build artifacts not readable"
        return 1
    fi

    # 4. Additional health checks can be added here
    # For example: HTTP endpoint checks, database connectivity, etc.

    return 0
}

###############################################################################
# Rollback Functions
###############################################################################

rollback_deployment() {
    log "Initiating rollback..."

    if [ ! -f /tmp/p0-last-backup ]; then
        die "No backup found for rollback"
    fi

    BACKUP_DIR=$(cat /tmp/p0-last-backup)

    if [ ! -d "$BACKUP_DIR" ]; then
        die "Backup directory not found: $BACKUP_DIR"
    fi

    log "Rolling back to backup: $BACKUP_DIR"

    # Remove current deployment
    if [ -d "$PROJECT_ROOT/dist" ]; then
        rm -rf "$PROJECT_ROOT/dist"
    fi

    # Restore from backup
    cp -r "$BACKUP_DIR/dist" "$PROJECT_ROOT/"

    # Verify rollback
    if check_health; then
        log_success "Rollback completed successfully"
        return 0
    else
        die "Rollback failed health check"
    fi
}

###############################################################################
# Monitoring and Metrics
###############################################################################

record_deployment_metrics() {
    log "Recording deployment metrics..."

    METRICS_FILE="$PROJECT_ROOT/monitoring/deployment-metrics.json"
    mkdir -p "$(dirname "$METRICS_FILE")"

    # Create or update metrics file
    cat > "$METRICS_FILE" <<EOF
{
  "deployment_id": "$DEPLOYMENT_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$DEPLOY_ENV",
  "version": "$(node -p "require('$PROJECT_ROOT/package.json').version")",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "build_size": "$(du -sh "$PROJECT_ROOT/dist" 2>/dev/null | cut -f1 || echo 'unknown')",
  "status": "success"
}
EOF

    log_success "Deployment metrics recorded"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    log "==================================================================="
    log "P0 Integration Deployment"
    log "==================================================================="
    log "Deployment ID: $DEPLOYMENT_ID"
    log "Environment: $DEPLOY_ENV"
    log "Project Root: $PROJECT_ROOT"
    log "==================================================================="

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
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
                echo "Usage: $0 [--rollback] [--dry-run]"
                exit 1
                ;;
        esac
    done

    # Handle rollback mode
    if [ "$ROLLBACK_MODE" = true ]; then
        rollback_deployment
        exit 0
    fi

    # Pre-deployment phase
    log "Phase 1: Pre-deployment validation"
    validate_environment
    validate_build
    run_pre_deployment_tests

    # Backup phase
    log "Phase 2: Backup current version"
    backup_current_version

    # Deployment phase
    log "Phase 3: Deployment"
    if ! deploy_build; then
        log_error "Deployment failed"
        log "Initiating automatic rollback..."
        rollback_deployment
        exit 1
    fi

    # Health check phase
    log "Phase 4: Health checks"
    if ! check_health; then
        log_error "Health checks failed"
        log "Initiating automatic rollback..."
        rollback_deployment
        exit 1
    fi

    # Post-deployment phase
    log "Phase 5: Post-deployment"
    record_deployment_metrics

    log "==================================================================="
    log_success "Deployment completed successfully!"
    log "==================================================================="
    log "Deployment ID: $DEPLOYMENT_ID"
    log "Log file: $LOG_FILE"
    log "==================================================================="
}

# Run main function
main "$@"
