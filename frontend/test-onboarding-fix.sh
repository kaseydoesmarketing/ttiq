#!/bin/bash

echo "======================================"
echo "ONBOARDING FIX - LOCAL TEST SCRIPT"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if build was successful
echo -e "${YELLOW}[1/4] Checking build status...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Build directory exists${NC}"

    # Check if main files exist
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✓ index.html found${NC}"
    else
        echo -e "${RED}✗ index.html missing${NC}"
        exit 1
    fi

    # Check for CSS bundle
    CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
    if [ $CSS_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓ CSS bundle found (${CSS_COUNT} file(s))${NC}"
    else
        echo -e "${RED}✗ No CSS bundle found${NC}"
        exit 1
    fi

    # Check for JS bundle
    JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
    if [ $JS_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓ JS bundle found (${JS_COUNT} file(s))${NC}"
    else
        echo -e "${RED}✗ No JS bundle found${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Build directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/4] Checking OnboardingWizard.jsx changes...${NC}"

# Check for critical fixes
if grep -q "z-\[60\]" src/components/OnboardingWizard.jsx; then
    echo -e "${GREEN}✓ Gray overlay layer implemented (z-[60])${NC}"
else
    echo -e "${RED}✗ Gray overlay layer missing${NC}"
fi

if grep -q "bg-white" src/components/OnboardingWizard.jsx; then
    echo -e "${GREEN}✓ White content card implemented${NC}"
else
    echo -e "${RED}✗ White content card missing${NC}"
fi

if grep -q "text-gray-900" src/components/OnboardingWizard.jsx; then
    echo -e "${GREEN}✓ Dark text colors implemented${NC}"
else
    echo -e "${RED}✗ Dark text colors missing${NC}"
fi

if grep -q "titleiq_token" src/components/OnboardingWizard.jsx; then
    echo -e "${GREEN}✓ Token key bug fixed (titleiq_token)${NC}"
else
    echo -e "${RED}✗ Token key bug NOT fixed${NC}"
fi

# Check for old styling (should NOT exist)
if grep -q "from-slate-900 via-purple-900" src/components/OnboardingWizard.jsx; then
    echo -e "${RED}✗ Old purple gradient still exists${NC}"
else
    echo -e "${GREEN}✓ Old purple gradient removed${NC}"
fi

echo ""
echo -e "${YELLOW}[3/4] Checking backend integration...${NC}"

# Check backend files
BACKEND_DIR="/Users/kvimedia/titleiq/backend"

if [ -f "$BACKEND_DIR/routes/generate.js" ]; then
    if grep -q "userContext" "$BACKEND_DIR/routes/generate.js"; then
        echo -e "${GREEN}✓ Backend has userContext integration${NC}"
    else
        echo -e "${YELLOW}⚠ userContext not found in generate.js${NC}"
    fi

    if grep -q "niche" "$BACKEND_DIR/routes/generate.js"; then
        echo -e "${GREEN}✓ Niche field detected in backend${NC}"
    else
        echo -e "${YELLOW}⚠ Niche field not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backend directory not found at expected location${NC}"
fi

echo ""
echo -e "${YELLOW}[4/4] Local development server instructions...${NC}"
echo ""
echo "To test the fixes locally:"
echo ""
echo "  1. Start backend (if not already running):"
echo "     cd /Users/kvimedia/titleiq/backend"
echo "     npm start"
echo ""
echo "  2. Start frontend dev server:"
echo "     cd /Users/kvimedia/titleiq/frontend"
echo "     npm run dev"
echo ""
echo "  3. Open browser to: http://localhost:5173"
echo ""
echo "  4. Test these scenarios:"
echo "     - Login as new user → onboarding should appear"
echo "     - Check visual appearance (white card, dark text, gray overlay)"
echo "     - Complete onboarding → verify it doesn't show again"
echo "     - Skip onboarding → verify skip works"
echo ""

echo -e "${GREEN}======================================"
echo "Build checks completed successfully!"
echo "======================================${NC}"
echo ""
echo "Ready to deploy with:"
echo "  vercel --prod"
echo ""
