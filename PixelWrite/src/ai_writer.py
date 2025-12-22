"""
Pixel Write - AI-Powered Blog Writer
Generates high-quality tech articles using AI
"""

import os
import json
import openai
from datetime import datetime
from typing import Dict, List, Optional
import re

class AIWriter:
    """AI content generator for tech blogs"""
    
    def __init__(self, config_path: str = "../config.json"):
        """Initialize AI Writer with configuration"""
        self.config = self._load_config(config_path)
        self.api_key = self.config['api_config']['api_key']
        self.model = self.config['api_config']['model']
        
        # Set up OpenAI
        if self.api_key != "YOUR_API_KEY_HERE":
            openai.api_key = self.api_key
        
    def _load_config(self, path: str) -> Dict:
        """Load configuration from JSON file"""
        with open(path, 'r') as f:
            return json.load(f)
    
    def generate_article(self, topic: str, category: str = "Technology") -> Dict:
        """
        Generate a complete blog article on given topic
        
        Args:
            topic: Main topic/title for the article
            category: Article category (Technology, Science, etc.)
            
        Returns:
            Dict containing article data
        """
        print(f"🤖 Generating article on: {topic}")
        
        # Create the prompt
        prompt = self._create_article_prompt(topic, category)
        
        # Generate content using AI
        try:
            content = self._generate_with_ai(prompt)
        except Exception as e:
            print(f"❌ AI generation failed: {e}")
            content = self._generate_fallback_content(topic, category)
        
        # Parse and structure the article
        article = self._structure_article(content, topic, category)
        
        # Calculate reading time
        article['readTime'] = self._calculate_read_time(article['content'])
        
        # Add metadata
        article['generated_at'] = datetime.now().isoformat()
        article['views'] = 0
        article['trending'] = True
        
        print(f"✅ Article generated: {article['title']}")
        return article
    
    def _create_article_prompt(self, topic: str, category: str) -> str:
        """Create detailed prompt for AI"""
        return f"""Write a comprehensive, engaging tech blog article about: {topic}

Category: {category}

Requirements:
- Length: 800-1200 words
- Professional, informative tone
- Include current facts and innovations
- Structure: Introduction, Main Content (3-4 sections), Conclusion
- Make it SEO-friendly
- Include real-world applications and implications
- Target audience: Tech enthusiasts and professionals

Format the article with:
TITLE: [Catchy, SEO-friendly title]
EXCERPT: [2-3 sentence summary]
CONTENT: [Full article with clear paragraphs]
TAGS: [5 relevant tags separated by commas]

Write the article now:"""
    
    def _generate_with_ai(self, prompt: str) -> str:
        """Generate content using OpenAI API"""
        if self.api_key == "YOUR_API_KEY_HERE":
            raise Exception("API key not configured")
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert tech journalist and content writer specializing in emerging technologies, innovations, and current tech trends. Write engaging, informative, and SEO-optimized articles."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=self.config['api_config']['max_tokens'],
            temperature=self.config['api_config']['temperature']
        )
        
        return response.choices[0].message.content
    
    def _generate_fallback_content(self, topic: str, category: str) -> str:
        """Generate basic article structure when AI is unavailable"""
        return f"""TITLE: {topic}: Transforming the Future of Technology

EXCERPT: Explore how {topic.lower()} is revolutionizing the tech industry and shaping our digital future with groundbreaking innovations and real-world applications.

CONTENT:
The technological landscape is constantly evolving, and {topic} stands at the forefront of this transformation. As we navigate through 2025, understanding these developments has become crucial for businesses and individuals alike.

**The Current State of {topic}**

The field of {topic.lower()} has witnessed remarkable progress in recent years. Industry leaders and researchers are pushing boundaries, developing solutions that were once considered science fiction. From enhanced efficiency to unprecedented capabilities, the impact is profound.

**Key Innovations and Breakthroughs**

Recent innovations in this space have introduced game-changing capabilities. Organizations worldwide are adopting these technologies to streamline operations, enhance user experiences, and drive competitive advantages. The integration of advanced algorithms and cutting-edge hardware has opened new possibilities.

**Real-World Applications**

The practical applications of {topic.lower()} span across multiple industries. Healthcare, finance, education, and manufacturing are all experiencing transformative changes. These implementations are not just improving existing processes but creating entirely new business models and opportunities.

**Challenges and Considerations**

While the potential is enormous, several challenges remain. Issues around scalability, security, ethical considerations, and regulatory compliance need careful attention. Industry stakeholders are working collaboratively to address these concerns.

**The Road Ahead**

Looking forward, the trajectory of {topic.lower()} appears promising. Experts predict continued innovation, increased adoption, and deeper integration into daily life. As technology matures, we can expect more refined, accessible, and impactful solutions.

The evolution of {topic.lower()} represents more than just technological advancement—it symbolizes our collective ambition to solve complex problems and create a better future. Staying informed and engaged with these developments is essential for anyone involved in the tech ecosystem.

TAGS: {topic}, Technology, Innovation, {category}, Future Tech"""
    
    def _structure_article(self, content: str, topic: str, category: str) -> Dict:
        """Parse AI response and create structured article object"""
        
        # Extract sections
        title = self._extract_section(content, "TITLE:", topic)
        excerpt = self._extract_section(content, "EXCERPT:", f"Explore {topic} and its impact on technology")
        main_content = self._extract_section(content, "CONTENT:", content.split("CONTENT:")[-1] if "CONTENT:" in content else content)
        tags = self._extract_section(content, "TAGS:", f"{topic}, Technology, Innovation")
        
        # Clean up content
        main_content = self._clean_content(main_content)
        
        # Create article object
        article = {
            "id": self._generate_id(),
            "title": title.strip(),
            "category": category,
            "author": "Pixel AI Writer",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "readTime": "8 min",
            "excerpt": excerpt.strip(),
            "content": main_content.strip(),
            "tags": [tag.strip() for tag in tags.split(",") if tag.strip()],
            "image": f"/images/blog-{self._generate_id()}.jpg",
            "featured": False,
            "trending": True
        }
        
        return article
    
    def _extract_section(self, content: str, marker: str, default: str) -> str:
        """Extract section from AI response"""
        if marker not in content:
            return default
        
        # Find the section
        start = content.find(marker) + len(marker)
        remaining = content[start:]
        
        # Find next marker or end
        next_markers = ["TITLE:", "EXCERPT:", "CONTENT:", "TAGS:"]
        end_positions = [remaining.find(m) for m in next_markers if remaining.find(m) > 0]
        
        if end_positions:
            end = min(end_positions)
            return remaining[:end].strip()
        
        return remaining.strip()
    
    def _clean_content(self, content: str) -> str:
        """Clean and format content"""
        # Remove extra whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Remove any remaining markers
        for marker in ["TITLE:", "EXCERPT:", "CONTENT:", "TAGS:"]:
            content = content.replace(marker, "")
        
        return content.strip()
    
    def _calculate_read_time(self, content: str) -> str:
        """Calculate estimated reading time"""
        words = len(content.split())
        wpm = self.config['generation_settings']['reading_time_wpm']
        minutes = max(1, round(words / wpm))
        return f"{minutes} min"
    
    def _generate_id(self) -> int:
        """Generate unique article ID based on timestamp"""
        return int(datetime.now().timestamp() * 1000) % 100000
    
    def save_article(self, article: Dict, output_dir: str = None) -> str:
        """Save article to JSON file"""
        if output_dir is None:
            output_dir = self.config['output']['output_directory']
        
        # Create directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate filename
        filename = f"article_{article['id']}_{datetime.now().strftime('%Y%m%d')}.json"
        filepath = os.path.join(output_dir, filename)
        
        # Save to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(article, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Article saved: {filepath}")
        return filepath


# Example usage
if __name__ == "__main__":
    writer = AIWriter()
    
    # Generate sample article
    topics = [
        "AI Regulation in 2025",
        "Quantum Computing Breakthroughs",
        "India's Space Program Achievements",
        "Electric Vehicle Revolution"
    ]
    
    for topic in topics[:1]:  # Generate one article
        article = writer.generate_article(topic, "Technology")
        writer.save_article(article)
        print(f"\n📝 Title: {article['title']}")
        print(f"📊 Category: {article['category']}")
        print(f"⏱️  Read Time: {article['readTime']}")
        print(f"🏷️  Tags: {', '.join(article['tags'])}")
        print("-" * 60)
