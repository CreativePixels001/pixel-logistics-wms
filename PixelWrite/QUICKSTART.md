# Pixel Write - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd PixelWrite
pip install -r requirements.txt
```

### Step 2: Configure API Key
Edit `config.json` and add your OpenAI API key:
```json
{
  "api_config": {
    "api_key": "sk-your-actual-api-key-here"
  }
}
```

### Step 3: Generate Your First Article
```bash
python generate_blog.py
```

## 📝 Usage Examples

### Generate Single Article (Interactive)
```bash
python generate_blog.py
```
Follow the prompts to select topic and category.

### Generate Article with Custom Topic
```bash
python generate_blog.py "Quantum Computing Breakthrough in 2025"
```

### Generate Daily Articles Now
```bash
python auto_writer.py --now
```

### Start Automated Daily Generation
```bash
python auto_writer.py --daemon
```
This will run continuously and generate articles at scheduled times (9 AM and 6 PM by default).

## 🔧 Configuration

### Articles Per Day
Edit `config.json`:
```json
"articles_per_day": 2,
"schedule_times": ["09:00", "18:00"]
```

### Categories
```json
"categories": {
  "enabled": ["Technology", "Science", "Business", "India"],
  "weights": {
    "Technology": 0.4,
    "Science": 0.2,
    "Business": 0.2,
    "India": 0.2
  }
}
```

## 📊 Output

Generated articles are saved to:
- `data/generated/` - Individual JSON files
- `../frontend/PixelFact/js/articles-data.js` - Integrated with Pixel Fact

## 🎯 Features

✅ AI-powered content generation  
✅ Trending topic detection  
✅ Multiple categories (Tech, Science, Business, India)  
✅ SEO optimization  
✅ Automatic integration with Pixel Fact  
✅ Scheduled daily generation  
✅ Quality validation  

## 🔍 Monitoring

Check logs:
```bash
tail -f logs/pixelwrite.log
```

View statistics:
```bash
cat logs/statistics.json
```

## 🛠️ Troubleshooting

**API Key Error:**
- Ensure your OpenAI API key is correct in `config.json`
- Check you have credits available

**No Trending Topics:**
- The system will use fallback topics
- Check your internet connection for RSS feeds

**Integration Failed:**
- Verify the Pixel Fact path in config
- Ensure write permissions

## 📚 Examples

Generated article structure:
```json
{
  "id": 12345,
  "title": "AI Regulation: The Future of Governance in 2025",
  "category": "Technology",
  "author": "Pixel AI Writer",
  "date": "2025-12-07",
  "readTime": "8 min",
  "excerpt": "Exploring how governments worldwide...",
  "content": "Full article content here...",
  "tags": ["AI", "Regulation", "Technology"],
  "trending": true,
  "views": 0
}
```

## 🎨 Customization

### Add New Topics
Edit `config.json` → `topics.trending`:
```json
"trending": [
  "Your Custom Topic",
  "Another Topic"
]
```

### Change Writing Style
Modify prompts in `src/ai_writer.py` → `_create_article_prompt()`

### Add New Categories
Update `config.json` → `categories`

## 🔐 Security

- Never commit your API key to version control
- Use environment variables for production:
  ```bash
  export OPENAI_API_KEY="your-key"
  ```

## 📞 Support

For issues or questions:
- Check logs in `logs/`
- Review configuration in `config.json`
- Test with `generate_blog.py` first

---

**Ready to automate your blog content? Start with `python generate_blog.py`** 🚀
