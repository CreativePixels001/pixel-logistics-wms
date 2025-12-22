"""
Trend Monitor - Tracks latest tech news and trends
"""

import feedparser
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import json

class TrendMonitor:
    """Monitor tech news and identify trending topics"""
    
    def __init__(self, config_path: str = "../config.json"):
        """Initialize trend monitor"""
        self.config = self._load_config(config_path)
        self.rss_feeds = self.config['news_sources']['rss_feeds']
        self.trending_topics = []
        
    def _load_config(self, path: str) -> Dict:
        """Load configuration"""
        with open(path, 'r') as f:
            return json.load(f)
    
    def fetch_trending_topics(self, limit: int = 10) -> List[Dict]:
        """
        Fetch trending topics from various sources
        
        Args:
            limit: Maximum number of topics to return
            
        Returns:
            List of trending topic dictionaries
        """
        print("🔍 Fetching trending topics...")
        
        topics = []
        
        # Fetch from RSS feeds
        for feed_url in self.rss_feeds[:3]:  # Limit to first 3 feeds
            try:
                feed_topics = self._parse_rss_feed(feed_url)
                topics.extend(feed_topics)
            except Exception as e:
                print(f"⚠️  Failed to fetch from {feed_url}: {e}")
        
        # Add predefined trending topics
        topics.extend(self._get_predefined_topics())
        
        # Sort by relevance/date
        topics = sorted(topics, key=lambda x: x.get('score', 0), reverse=True)
        
        # Remove duplicates
        seen_titles = set()
        unique_topics = []
        for topic in topics:
            if topic['title'].lower() not in seen_titles:
                seen_titles.add(topic['title'].lower())
                unique_topics.append(topic)
        
        self.trending_topics = unique_topics[:limit]
        print(f"✅ Found {len(self.trending_topics)} trending topics")
        
        return self.trending_topics
    
    def _parse_rss_feed(self, feed_url: str) -> List[Dict]:
        """Parse RSS feed and extract topics"""
        topics = []
        
        try:
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries[:5]:  # Get top 5 from each feed
                topic = {
                    'title': entry.get('title', 'Untitled'),
                    'description': entry.get('summary', '')[:200],
                    'url': entry.get('link', ''),
                    'published': entry.get('published', ''),
                    'source': feed.feed.get('title', 'Unknown'),
                    'score': self._calculate_relevance_score(entry)
                }
                topics.append(topic)
                
        except Exception as e:
            print(f"Error parsing feed: {e}")
        
        return topics
    
    def _calculate_relevance_score(self, entry: Dict) -> float:
        """Calculate relevance score for a topic"""
        score = 0.0
        
        # Check for tech keywords in title
        tech_keywords = [
            'AI', 'artificial intelligence', 'machine learning', 'quantum',
            'blockchain', 'crypto', 'space', 'electric', 'autonomous',
            'cybersecurity', 'cloud', 'startup', '5G', '6G', 'robot',
            'innovation', 'breakthrough', 'technology', 'digital'
        ]
        
        title_lower = entry.get('title', '').lower()
        summary_lower = entry.get('summary', '').lower()
        
        for keyword in tech_keywords:
            if keyword.lower() in title_lower:
                score += 2.0
            if keyword.lower() in summary_lower:
                score += 1.0
        
        # Bonus for recency (within last 24 hours)
        published = entry.get('published_parsed', None)
        if published:
            pub_date = datetime(*published[:6])
            age_hours = (datetime.now() - pub_date).total_seconds() / 3600
            if age_hours < 24:
                score += 3.0
            elif age_hours < 72:
                score += 1.5
        
        return score
    
    def _get_predefined_topics(self) -> List[Dict]:
        """Get predefined trending topics from config"""
        topics = []
        
        predefined = self.config['topics']['trending']
        india_topics = self.config['topics']['india_specific']
        
        all_topics = predefined + india_topics
        
        for topic in all_topics[:5]:  # Get 5 predefined topics
            topics.append({
                'title': f"Latest Developments in {topic}",
                'description': f"Exploring recent innovations and trends in {topic}",
                'url': '',
                'source': 'Predefined',
                'score': 1.0
            })
        
        return topics
    
    def get_topic_for_category(self, category: str) -> Dict:
        """Get a suitable topic for specific category"""
        if not self.trending_topics:
            self.fetch_trending_topics()
        
        # Category-specific keywords
        category_keywords = {
            'Technology': ['AI', 'software', 'tech', 'digital', 'innovation'],
            'Science': ['quantum', 'research', 'discovery', 'space', 'physics'],
            'Business': ['startup', 'funding', 'market', 'economy', 'investment'],
            'India': ['India', 'Indian', 'Delhi', 'Mumbai', 'Bangalore']
        }
        
        keywords = category_keywords.get(category, [])
        
        # Find best matching topic
        for topic in self.trending_topics:
            title_lower = topic['title'].lower()
            if any(kw.lower() in title_lower for kw in keywords):
                return topic
        
        # Return first topic if no match
        return self.trending_topics[0] if self.trending_topics else {
            'title': f'Innovation Trends in {category}',
            'description': f'Exploring latest developments in {category}',
            'source': 'Generated'
        }
    
    def save_topics(self, filepath: str = None):
        """Save trending topics to JSON file"""
        if filepath is None:
            filepath = "../data/trending_topics.json"
        
        data = {
            'fetched_at': datetime.now().isoformat(),
            'topics': self.trending_topics
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Topics saved: {filepath}")


# Example usage
if __name__ == "__main__":
    monitor = TrendMonitor()
    topics = monitor.fetch_trending_topics(limit=10)
    
    print("\n📰 Top Trending Topics:")
    print("=" * 60)
    for i, topic in enumerate(topics[:5], 1):
        print(f"\n{i}. {topic['title']}")
        print(f"   Source: {topic['source']} | Score: {topic['score']}")
        if topic['description']:
            print(f"   {topic['description'][:100]}...")
