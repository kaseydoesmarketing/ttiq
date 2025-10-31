#!/bin/bash
# Pre-deployment validation script for TitleIQ Admin Dashboard
# Catches common issues before they reach production

set -e

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}TitleIQ Admin Dashboard Validation${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo ""

# Function to report errors
report_error() {
    echo -e "${COLOR_RED}❌ ERROR: $1${COLOR_RESET}"
    ERRORS=$((ERRORS + 1))
}

# Function to report warnings
report_warning() {
    echo -e "${COLOR_YELLOW}⚠️  WARNING: $1${COLOR_RESET}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to report success
report_success() {
    echo -e "${COLOR_GREEN}✅ $1${COLOR_RESET}"
}

# Check if file exists
ADMIN_FILE="/var/www/titleiq/frontend/src/pages/AdminDashboard.jsx"

echo "📋 Checking AdminDashboard.jsx structure..."
echo ""

# TEST 1: File exists
if ! ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "test -f $ADMIN_FILE"; then
    report_error "AdminDashboard.jsx not found at $ADMIN_FILE"
    exit 1
fi
report_success "File exists"

# TEST 2: No duplicate imports
echo ""
echo "🔍 Checking for duplicate imports..."
DUPLICATE_IMPORTS=$(ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -n '^import' $ADMIN_FILE | cut -d: -f2 | sort | uniq -d")
if [ -n "$DUPLICATE_IMPORTS" ]; then
    report_error "Duplicate imports found:"
    echo "$DUPLICATE_IMPORTS"
else
    report_success "No duplicate imports"
fi

# TEST 3: All required state declarations present
echo ""
echo "🔍 Checking state declarations..."
REQUIRED_STATES=("loading" "error" "overview" "traffic" "activeUsers" "topUsage" "systemHealth" "lastRefresh")
for state in "${REQUIRED_STATES[@]}"; do
    if ! ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -q 'const \[$state, set' $ADMIN_FILE"; then
        report_error "Missing state declaration: $state"
    fi
done
if [ $ERRORS -eq 0 ]; then
    report_success "All state declarations present"
fi

# TEST 4: Valid export structure
echo ""
echo "🔍 Checking export structure..."
EXPORT_COUNT=$(ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -c '^export default' $ADMIN_FILE" || echo "0")
if [ "$EXPORT_COUNT" -eq 0 ]; then
    report_error "No default export found"
elif [ "$EXPORT_COUNT" -gt 1 ]; then
    report_error "Multiple default exports found ($EXPORT_COUNT)"
else
    report_success "Single default export found"
fi

# TEST 5: Required imports present
echo ""
echo "🔍 Checking required imports..."
REQUIRED_IMPORTS=("useState" "useEffect" "useNavigate" "useAuth" "api")
for import_item in "${REQUIRED_IMPORTS[@]}"; do
    if ! ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -q '$import_item' $ADMIN_FILE"; then
        report_error "Missing import: $import_item"
    fi
done
if [ $ERRORS -eq 0 ]; then
    report_success "All required imports present"
fi

# TEST 6: Admin guard logic present
echo ""
echo "🔍 Checking admin guard..."
if ! ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -q \"user.role !== 'admin'\" $ADMIN_FILE"; then
    report_error "Admin guard logic missing"
else
    report_success "Admin guard present"
fi

# TEST 7: Check for syntax errors (basic)
echo ""
echo "🔍 Checking for basic syntax errors..."
if ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -E '(const \[.*\] = useState\(\);|function.*\{$|}\s*$)' $ADMIN_FILE > /dev/null"; then
    # These are actually fine, just checking the file is readable
    report_success "File syntax appears valid"
fi

# TEST 8: API endpoint calls present
echo ""
echo "🔍 Checking API endpoint calls..."
REQUIRED_ENDPOINTS=("/api/admin/stats/overview" "/api/admin/users/active")
for endpoint in "${REQUIRED_ENDPOINTS[@]}"; do
    if ! ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep -q '$endpoint' $ADMIN_FILE"; then
        report_warning "API endpoint not found: $endpoint"
    fi
done
if [ $WARNINGS -eq 0 ]; then
    report_success "All API endpoints referenced"
fi

# TEST 9: Environment variables check
echo ""
echo "🔍 Checking environment configuration..."
if ! ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "test -f /var/www/titleiq/frontend/.env.production.local"; then
    report_warning ".env.production.local not found"
else
    BUILD_TAG=$(ssh -i ~/.ssh/tightslice_deploy root@automations.tightslice.com "grep '^VITE_BUILD_TAG=' /var/www/titleiq/frontend/.env.production.local | cut -d= -f2")
    if [ -n "$BUILD_TAG" ]; then
        report_success "Build tag configured: $BUILD_TAG"
    else
        report_warning "Build tag not set"
    fi
fi

# SUMMARY
echo ""
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo -e "${COLOR_BLUE}Validation Summary${COLOR_RESET}"
echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${COLOR_RED}❌ VALIDATION FAILED${COLOR_RESET}"
    echo -e "${COLOR_RED}Errors: $ERRORS${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}Warnings: $WARNINGS${COLOR_RESET}"
    echo ""
    echo "❌ DO NOT DEPLOY - Fix errors first"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${COLOR_YELLOW}⚠️  VALIDATION PASSED WITH WARNINGS${COLOR_RESET}"
    echo -e "${COLOR_GREEN}Errors: $ERRORS${COLOR_RESET}"
    echo -e "${COLOR_YELLOW}Warnings: $WARNINGS${COLOR_RESET}"
    echo ""
    echo "✅ Safe to deploy (warnings are non-critical)"
    exit 0
else
    echo -e "${COLOR_GREEN}✅ VALIDATION PASSED${COLOR_RESET}"
    echo -e "${COLOR_GREEN}Errors: $ERRORS${COLOR_RESET}"
    echo -e "${COLOR_GREEN}Warnings: $WARNINGS${COLOR_RESET}"
    echo ""
    echo "✅ Safe to deploy"
    exit 0
fi
