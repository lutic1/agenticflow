#!/bin/bash

# Google OAuth Authentication - Installation Script
# Run this from the Frontend directory

set -e

echo "=========================================="
echo "Google OAuth Authentication Setup"
echo "=========================================="
echo ""

# Check if we're in the Frontend directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the Frontend directory."
    echo "Usage: cd /home/user/agenticflow/Frontend && bash ../docs/auth/INSTALL.sh"
    exit 1
fi

echo "Step 1: Installing dependencies..."
npm install next-auth@beta
echo "✓ Dependencies installed"
echo ""

echo "Step 2: Checking environment file..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "✓ .env.local created"
        echo ""
        echo "⚠️  IMPORTANT: You must edit .env.local with your credentials!"
        echo ""
    else
        echo "Warning: .env.example not found. Creating .env.local manually..."
        cat > .env.local << 'EOF'
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF
        echo "✓ .env.local created"
        echo ""
    fi
else
    echo "✓ .env.local already exists"
    echo ""
fi

echo "Step 3: Generating NEXTAUTH_SECRET..."
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    echo "Your generated NEXTAUTH_SECRET:"
    echo "$SECRET"
    echo ""
    echo "Add this to your .env.local file as NEXTAUTH_SECRET"
    echo ""
else
    echo "openssl not found. Using Node.js to generate secret..."
    SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    echo "Your generated NEXTAUTH_SECRET:"
    echo "$SECRET"
    echo ""
    echo "Add this to your .env.local file as NEXTAUTH_SECRET"
    echo ""
fi

echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Set up Google OAuth:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create a new project or select existing"
echo "   - Enable Google+ API"
echo "   - Create OAuth 2.0 credentials"
echo "   - Add authorized redirect URI:"
echo "     http://localhost:3000/api/auth/callback/google"
echo ""
echo "2. Update .env.local with your credentials:"
echo "   - NEXTAUTH_SECRET (use the generated secret above)"
echo "   - GOOGLE_CLIENT_ID (from Google Console)"
echo "   - GOOGLE_CLIENT_SECRET (from Google Console)"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Test authentication:"
echo "   - Navigate to http://localhost:3000"
echo "   - Click 'Sign in' button"
echo "   - Complete Google OAuth flow"
echo ""
echo "📚 Full documentation: /home/user/agenticflow/docs/auth/AUTH_SETUP.md"
echo ""
