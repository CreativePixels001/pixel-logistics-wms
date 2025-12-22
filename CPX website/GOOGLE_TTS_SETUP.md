# Google Cloud Text-to-Speech Setup Guide

## ✅ Benefits
- **1 Million FREE characters/month** (enough for ~50 lectures)
- **Ultra-natural Neural voices** (near-human quality)
- **380+ voices** in 75+ languages
- **Production-ready** and reliable

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Google Cloud Account
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Try for free" (no credit card required for free tier)

### Step 2: Enable Text-to-Speech API
1. In Google Cloud Console, go to: **APIs & Services** → **Enable APIs and Services**
2. Search for: **"Cloud Text-to-Speech API"**
3. Click **Enable**

### Step 3: Create API Key
1. Go to: **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **API Key**
3. Copy your API key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`)
4. (Optional) Click **Restrict Key** → Select **Cloud Text-to-Speech API**

### Step 4: Add API Key to Your Code
Open `course-lecture-intro.html` and find this line (around line 490):

```javascript
const GOOGLE_TTS_API_KEY = 'YOUR_API_KEY_HERE';
```

Replace with your actual key:

```javascript
const GOOGLE_TTS_API_KEY = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX';
```

### Step 5: Test It!
1. Open `course-lecture-intro.html` in Chrome
2. Click the **Play** button
3. Wait 2-3 seconds for audio to generate
4. Enjoy ultra-natural voice! 🎧

---

## 🎙️ Voice Options

You can change the voice in the code. Find this section:

```javascript
voice: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-J', // ← Change this
}
```

### Best Natural Voices:

**Male Voices:**
- `en-US-Neural2-D` - Deep, authoritative
- `en-US-Neural2-J` - Warm, conversational (Default)
- `en-US-Neural2-A` - Clear, professional

**Female Voices:**
- `en-US-Neural2-F` - Warm, friendly
- `en-US-Neural2-C` - Clear, articulate
- `en-US-Neural2-H` - Soft, calm

**British Voices:**
- `en-GB-Neural2-A` - Male, British
- `en-GB-Neural2-B` - Female, British
- `en-GB-Neural2-F` - Female, British (elegant)

**Newscaster Style (Premium):**
- `en-US-News-K` - Male news anchor
- `en-US-News-L` - Female news anchor
- `en-US-News-N` - Male broadcaster

Full list: https://cloud.google.com/text-to-speech/docs/voices

---

## 💰 Pricing (Very Generous)

| Tier | Characters | Cost |
|------|-----------|------|
| **Free** | First 1M chars/month | $0 |
| **Paid** | After 1M chars | $16 per 1M |

**Example:**
- 1 lecture = ~20,000 characters
- **50 lectures FREE every month!**
- After that: ~$0.32 per lecture

---

## 🔧 Troubleshooting

### "Audio not playing"
- Wait 2-3 seconds after clicking play (audio is generated first time)
- Check browser console (F12) for errors
- Verify API key is correct

### "API key invalid"
- Make sure you enabled "Cloud Text-to-Speech API"
- Try creating a new API key
- Check for extra spaces when copying key

### "Quota exceeded"
- Free tier: 1M chars/month
- Check usage: https://console.cloud.google.com/apis/dashboard

### "Still sounds robotic"
- Verify you're using Neural2 voices (e.g., `en-US-Neural2-J`)
- Avoid "Standard" voices (lower quality)
- Try WaveNet voices for best quality

---

## 🎯 Current Implementation

**What happens now:**
1. Page loads → Text is sent to Google TTS API
2. Google returns MP3 audio (natural voice)
3. Audio is cached in browser
4. Click play → Professional quality voice starts
5. Words highlight as voice speaks

**Fallback:**
If API key not set → Uses browser voices (robotic)

---

## 📊 Monitoring Usage

Track your usage at:
https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/metrics

---

## 🔒 Security (Optional)

For production, restrict your API key:
1. Go to: **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - Select **HTTP referrers**
   - Add: `creativepixels.in/*`
4. Save

This prevents others from using your key.

---

## ✨ Result

**Before:** Robotic, mechanical voice
**After:** Natural, human-like narration with emotion and expression!

Perfect for Pixel Academy lectures! 🎓
