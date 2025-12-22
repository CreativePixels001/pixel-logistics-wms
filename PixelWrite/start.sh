#!/bin/bash

# Pixel Write - Quick Start Script

echo "🚀 Pixel Write - Automated Blog Generation System"
echo "=================================================="
echo ""

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

echo "✅ Python 3 detected: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  1. Generate single article:  python generate_blog.py"
echo "  2. Generate articles now:    python auto_writer.py --now"
echo "  3. Start auto scheduler:     python auto_writer.py --daemon"
echo ""
echo "⚠️  Note: Configure your OpenAI API key in config.json before generating articles"
echo ""

# Ask user what to do
read -p "What would you like to do? (1/2/3/quit): " choice

case $choice in
    1)
        echo ""
        python generate_blog.py
        ;;
    2)
        echo ""
        python auto_writer.py --now
        ;;
    3)
        echo ""
        echo "Starting scheduler... (Press Ctrl+C to stop)"
        python auto_writer.py --daemon
        ;;
    *)
        echo "👋 Goodbye!"
        ;;
esac
