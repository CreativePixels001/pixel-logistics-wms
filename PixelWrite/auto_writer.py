"""
Auto Writer - Automated daily blog generation
"""

import os
import sys
import json
import time
from datetime import datetime
from typing import List
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.ai_writer import AIWriter
from src.trend_monitor import TrendMonitor
from src.integrator import PixelFactIntegrator

class AutoWriter:
    """Automated blog generation system"""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize auto writer"""
        self.config = self._load_config(config_path)
        self.writer = AIWriter(config_path)
        self.monitor = TrendMonitor(config_path)
        self.integrator = PixelFactIntegrator(config_path)
        self.scheduler = BlockingScheduler()
        
        # Statistics
        self.articles_generated_today = 0
        self.total_articles_generated = 0
        
    def _load_config(self, path: str) -> dict:
        """Load configuration"""
        with open(path, 'r') as f:
            return json.load(f)
    
    def generate_daily_articles(self):
        """Generate configured number of articles for the day"""
        print("\n" + "="*60)
        print(f"🚀 Starting daily article generation - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        articles_per_day = self.config['generation_settings']['articles_per_day']
        
        # Fetch trending topics
        topics = self.monitor.fetch_trending_topics(limit=10)
        
        if not topics:
            print("❌ No trending topics found. Using fallback topics.")
            topics = self._get_fallback_topics()
        
        # Generate articles
        for i in range(articles_per_day):
            try:
                # Select category based on weights
                category = self._select_category()
                
                # Get relevant topic
                topic = self.monitor.get_topic_for_category(category)
                
                print(f"\n📝 Generating article {i+1}/{articles_per_day}")
                print(f"   Category: {category}")
                print(f"   Topic: {topic['title']}")
                
                # Generate article
                article = self.writer.generate_article(
                    topic=topic['title'],
                    category=category
                )
                
                # Save article
                filepath = self.writer.save_article(article)
                
                # Integrate with Pixel Fact
                if self.config['output']['integrate_with_pixelfact']:
                    self.integrator.add_article(article)
                
                self.articles_generated_today += 1
                self.total_articles_generated += 1
                
                print(f"✅ Article {i+1} completed successfully")
                
                # Wait between generations to avoid rate limits
                if i < articles_per_day - 1:
                    time.sleep(5)
                
            except Exception as e:
                print(f"❌ Error generating article {i+1}: {e}")
        
        # Summary
        print("\n" + "="*60)
        print(f"📊 Generation Summary:")
        print(f"   Articles generated today: {self.articles_generated_today}")
        print(f"   Total articles generated: {self.total_articles_generated}")
        print(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60 + "\n")
        
        # Save statistics
        self._save_statistics()
    
    def _select_category(self) -> str:
        """Select category based on configured weights"""
        import random
        
        categories = list(self.config['categories']['weights'].keys())
        weights = list(self.config['categories']['weights'].values())
        
        return random.choices(categories, weights=weights)[0]
    
    def _get_fallback_topics(self) -> List[dict]:
        """Get fallback topics when trend monitoring fails"""
        fallback = [
            {'title': 'AI Revolution in 2025', 'category': 'Technology'},
            {'title': 'Quantum Computing Breakthroughs', 'category': 'Science'},
            {'title': 'Indian Startup Ecosystem Growth', 'category': 'Business'},
            {'title': 'Electric Vehicle Adoption in India', 'category': 'India'},
        ]
        return fallback
    
    def _save_statistics(self):
        """Save generation statistics"""
        stats = {
            'last_run': datetime.now().isoformat(),
            'articles_generated_today': self.articles_generated_today,
            'total_articles_generated': self.total_articles_generated
        }
        
        os.makedirs('logs', exist_ok=True)
        with open('logs/statistics.json', 'w') as f:
            json.dump(stats, f, indent=2)
    
    def start_scheduler(self):
        """Start scheduled article generation"""
        print("🤖 Pixel Write Auto Writer Started")
        print(f"📅 Schedule: {self.config['generation_settings']['articles_per_day']} articles per day")
        print(f"⏰ Times: {', '.join(self.config['generation_settings']['schedule_times'])}")
        print("\nPress Ctrl+C to stop\n")
        
        # Add jobs for each schedule time
        for schedule_time in self.config['generation_settings']['schedule_times']:
            hour, minute = schedule_time.split(':')
            
            self.scheduler.add_job(
                self.generate_daily_articles,
                CronTrigger(hour=int(hour), minute=int(minute)),
                id=f'generate_articles_{schedule_time}',
                name=f'Generate Articles at {schedule_time}'
            )
            
            print(f"✅ Scheduled: Daily generation at {schedule_time}")
        
        # Start scheduler
        try:
            self.scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            print("\n👋 Stopping Auto Writer...")
            self.scheduler.shutdown()
    
    def generate_now(self):
        """Generate articles immediately (manual trigger)"""
        print("🎯 Manual generation triggered")
        self.generate_daily_articles()


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Pixel Write Auto Writer')
    parser.add_argument('--daemon', action='store_true', help='Run as scheduled daemon')
    parser.add_argument('--now', action='store_true', help='Generate articles immediately')
    parser.add_argument('--config', default='config.json', help='Config file path')
    
    args = parser.parse_args()
    
    auto_writer = AutoWriter(args.config)
    
    if args.daemon:
        auto_writer.start_scheduler()
    elif args.now:
        auto_writer.generate_now()
    else:
        print("Usage:")
        print("  --daemon  : Run as scheduled daemon")
        print("  --now     : Generate articles now")
        print("  --config  : Specify config file")


if __name__ == "__main__":
    main()
