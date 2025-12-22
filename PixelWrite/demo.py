"""
Demo script - Shows Pixel Write capabilities without API key
"""

import json
from datetime import datetime
from src.ai_writer import AIWriter
from src.trend_monitor import TrendMonitor

def demo_article_generation():
    """Demonstrate article generation with fallback content"""
    
    print("\n" + "="*70)
    print("  🤖 PIXEL WRITE DEMO - Automated Blog Generation System")
    print("="*70)
    
    # Initialize components
    print("\n📦 Initializing Pixel Write components...")
    writer = AIWriter()
    monitor = TrendMonitor()
    
    print("✅ Components ready!\n")
    
    # Fetch trending topics
    print("🔍 Fetching trending topics from tech news sources...")
    topics = monitor.fetch_trending_topics(limit=5)
    
    print(f"\n📰 Found {len(topics)} trending topics:")
    print("-" * 70)
    for i, topic in enumerate(topics[:5], 1):
        print(f"{i}. {topic['title']}")
        print(f"   Source: {topic['source']} | Relevance Score: {topic['score']:.1f}")
    
    # Generate sample article
    print("\n" + "="*70)
    print("📝 GENERATING SAMPLE ARTICLE (Using fallback - No API key required)")
    print("="*70)
    
    sample_topic = "AI Regulation Debate Heats Up in 2025"
    print(f"\nTopic: {sample_topic}")
    print("Category: Technology")
    print("\n⚙️  Processing...")
    
    # Generate article (will use fallback since no API key)
    article = writer.generate_article(sample_topic, "Technology")
    
    # Display generated article
    print("\n" + "="*70)
    print("  ✅ ARTICLE GENERATED SUCCESSFULLY")
    print("="*70)
    
    print(f"\n📌 Title: {article['title']}")
    print(f"📂 Category: {article['category']}")
    print(f"✍️  Author: {article['author']}")
    print(f"📅 Date: {article['date']}")
    print(f"⏱️  Read Time: {article['readTime']}")
    print(f"🏷️  Tags: {', '.join(article['tags'])}")
    print(f"👁️  Views: {article['views']}")
    print(f"🔥 Trending: {'Yes' if article['trending'] else 'No'}")
    
    print(f"\n💭 EXCERPT:")
    print("-" * 70)
    print(article['excerpt'])
    
    print(f"\n📄 CONTENT PREVIEW (First 500 characters):")
    print("-" * 70)
    print(article['content'][:500] + "...")
    
    print(f"\n📊 ARTICLE STATISTICS:")
    print("-" * 70)
    print(f"  • Total words: ~{len(article['content'].split())}")
    print(f"  • Total characters: {len(article['content'])}")
    print(f"  • Estimated reading time: {article['readTime']}")
    print(f"  • Number of tags: {len(article['tags'])}")
    
    # Save article
    print(f"\n💾 Saving article...")
    filepath = writer.save_article(article)
    print(f"✅ Saved to: {filepath}")
    
    # Show what happens with full system
    print("\n" + "="*70)
    print("  📋 DAILY AUTOMATION CAPABILITIES")
    print("="*70)
    print("""
With Pixel Write, you can:

✅ Generate 1-2 articles daily automatically
✅ Monitor tech news and trending topics in real-time
✅ Create SEO-optimized, professional content
✅ Auto-integrate with Pixel Fact platform
✅ Schedule generation at specific times (9 AM, 6 PM)
✅ Cover multiple categories (Tech, Science, Business, India)
✅ Track generation statistics and logs

Commands:
  • Generate single article:  python generate_blog.py
  • Generate now:            python auto_writer.py --now
  • Start scheduler:          python auto_writer.py --daemon
    """)
    
    print("="*70)
    print("  🎯 NEXT STEPS")
    print("="*70)
    print("""
To use full AI generation:
1. Get OpenAI API key from: https://platform.openai.com/api-keys
2. Add key to config.json: "api_key": "sk-your-key-here"
3. Run: python generate_blog.py

For demo purposes, the system uses intelligent fallback templates
that create professional, structured articles.
    """)
    
    print("="*70)
    print("  ✨ Demo Complete! Pixel Write is ready to automate your blog.")
    print("="*70 + "\n")

if __name__ == "__main__":
    demo_article_generation()
