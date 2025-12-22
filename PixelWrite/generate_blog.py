"""
Quick script to generate a single blog article
"""

import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.ai_writer import AIWriter
from src.integrator import PixelFactIntegrator

def main():
    """Generate a single article"""
    print("🚀 Pixel Write - Single Article Generator\n")
    
    # Get topic from command line or use default
    if len(sys.argv) > 1:
        topic = ' '.join(sys.argv[1:])
    else:
        topic = input("Enter article topic (or press Enter for trending topic): ").strip()
        if not topic:
            # Use trending topic
            from src.trend_monitor import TrendMonitor
            monitor = TrendMonitor()
            topics = monitor.fetch_trending_topics(limit=5)
            
            if topics:
                print("\n📰 Trending Topics:")
                for i, t in enumerate(topics[:5], 1):
                    print(f"{i}. {t['title']}")
                
                choice = input("\nSelect topic (1-5) or enter custom topic: ").strip()
                
                if choice.isdigit() and 1 <= int(choice) <= len(topics):
                    topic = topics[int(choice)-1]['title']
                elif choice:
                    topic = choice
                else:
                    topic = topics[0]['title']
            else:
                topic = "Latest Technology Innovations in 2025"
    
    # Select category
    print("\n📂 Categories: 1) Technology  2) Science  3) Business  4) India")
    category_choice = input("Select category (1-4) [default: 1]: ").strip()
    
    categories = {
        '1': 'Technology',
        '2': 'Science',
        '3': 'Business',
        '4': 'India'
    }
    category = categories.get(category_choice, 'Technology')
    
    print(f"\n🤖 Generating article...")
    print(f"   Topic: {topic}")
    print(f"   Category: {category}\n")
    
    # Generate article
    writer = AIWriter()
    article = writer.generate_article(topic, category)
    
    # Display article
    print("\n" + "="*60)
    print(f"📝 {article['title']}")
    print("="*60)
    print(f"📂 Category: {article['category']}")
    print(f"✍️  Author: {article['author']}")
    print(f"📅 Date: {article['date']}")
    print(f"⏱️  Read Time: {article['readTime']}")
    print(f"🏷️  Tags: {', '.join(article['tags'])}")
    print(f"\n💭 Excerpt:\n{article['excerpt']}")
    print(f"\n📄 Content ({len(article['content'])} characters):\n{article['content'][:300]}...")
    print("="*60)
    
    # Save article
    filepath = writer.save_article(article)
    print(f"\n💾 Article saved to: {filepath}")
    
    # Ask to integrate
    integrate = input("\n🔗 Integrate with Pixel Fact? (y/n) [default: y]: ").strip().lower()
    
    if integrate != 'n':
        integrator = PixelFactIntegrator()
        success = integrator.add_article(article)
        
        if success:
            print("✅ Article integrated with Pixel Fact successfully!")
        else:
            print("❌ Integration failed")
    
    print("\n✨ Done!\n")

if __name__ == "__main__":
    main()
