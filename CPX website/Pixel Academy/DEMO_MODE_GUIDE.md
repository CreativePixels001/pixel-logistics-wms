# Pixel Academy - Demo Mode Guide

## 🎯 Current Status: DEMO MODE ACTIVE

All modules and chapters are **UNLOCKED** for local testing. This allows you to navigate through the entire course flow without completing prerequisites.

---

## 📚 Course Structure

### Module 01: What is Design? (45 min)
- ✅ Single lecture
- Status: **UNLOCKED**
- File: `lectures/module-01.html`

### Module 02: How Interfaces Work (135 min total)
- ✅ Chapter 1: FONT (45 min) - **UNLOCKED**
- ⏳ Chapter 2: COLOR (45 min) - **UNLOCKED** (normally locked until Chapter 1 complete)
- ⏳ Chapter 3: SHAPE (45 min) - **UNLOCKED** (normally locked until Chapter 2 complete)
- 📝 Assignment Submission - **AVAILABLE** (normally locked until all chapters complete)
- Files: 
  - `lectures/module-02-chapter-01-font.html`
  - `lectures/module-02-chapter-02-color.html` (to be created)
  - `lectures/module-02-chapter-03-shape.html` (to be created)
  - `lectures/module-02-assignment.html` (to be created)

### Module 03-05
- Status: **UNLOCKED** (normally locked until Module 02 assignment approved by admin)

---

## 🧪 Testing the Flow

### 1. Start Local Server
```bash
cd "/Users/ashishkumar/Documents/Pixel ecosystem/CPX website"
python3 -m http.server 8000
```
Open: http://localhost:8000/Pixel%20Academy/

### 2. Demo Login
- Click "Demo Login (Local Testing)" button
- Automatically logs in as test user
- No Google OAuth needed

### 3. Navigate Course
- Dashboard → My Courses → Course Overview
- All modules/chapters accessible
- Audio playback works with Web Speech API
- Progress auto-saves to localStorage

### 4. Test Features
- ✅ Audio playback (play, pause, speed, seek)
- ✅ Progress tracking (saves position, resumes)
- ✅ Chapter completion
- ✅ Dashboard stats update
- ✅ Learning time tracking

### 5. Reset Progress (If Needed)
Open browser console and run:
```javascript
window.progressTracker.resetProgress()
location.reload()
```

---

## 🔒 Production Mode Changes

When going live, the following will be locked:

### Module 02 Chapters
- **Chapter 1: FONT** - Unlocked by default
- **Chapter 2: COLOR** - Locked until Chapter 1 completed
- **Chapter 3: SHAPE** - Locked until Chapter 2 completed
- **Assignment** - Locked until all 3 chapters completed

### Module 03-05
- Locked until **Module 02 assignment APPROVED by admin**
- Admin must review and approve submission
- Only then Module 03 unlocks

### Implementation Changes for Production
1. Change all `status: 'not-started'` to `status: 'locked'` (except Module 01 and Module 02 Chapter 1)
2. Enable unlock logic in `completeChapter()` method
3. Enable Module 03 unlock only after admin approval
4. Remove "Demo Login" button from login page
5. Enable Google OAuth requirement

---

## 📁 Files Modified for Demo Mode

### `/Pixel Academy/js/progress-tracker.js`
- All modules set to `status: 'not-started'` instead of `'locked'`
- Added comment: `// UNLOCKED FOR DEMO`
- Added `getChapterProgress()`, `updateChapterProgress()`, `completeChapter()` methods
- Module 02 now has `chapters` object with 3 chapters

### Demo Mode Markers
Search for `// UNLOCKED FOR DEMO` in code to find all demo-specific changes.

---

## 🚀 Features Currently Working

✅ **Authentication**
- Demo login (local only)
- Google OAuth (production ready)
- Session persistence

✅ **Student Dashboard**
- Learning stats (courses, time, progress)
- Continue learning section
- Dynamic updates from progress tracker

✅ **My Courses**
- Filter tabs (All, In Progress, Completed, Not Started)
- Real progress bars
- Dynamic status badges

✅ **Lecture Pages**
- Module 01: Complete lecture with audio
- Module 02 Chapter 1: FONT lecture with audio
- Audio controls (play/pause, speed, seek)
- Resume from last position
- Auto-save progress every 30 seconds

✅ **Settings**
- Profile info
- Audio preferences
- Email settings
- All stored in localStorage

---

## ⏳ To Be Created

### Module 02
- [ ] Chapter 2: COLOR lecture (45 min)
- [ ] Chapter 3: SHAPE lecture (45 min)
- [ ] Assignment submission page (upload + case study)

### Admin Panel
- [ ] Admin dashboard
- [ ] Assignment review interface
- [ ] Student management
- [ ] Approval workflow

### Modules 03-05
- [ ] Full lecture content
- [ ] Audio playback integration

---

## 🐛 Known Issues

None currently! All features working as expected in demo mode.

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify local server is running (port 8000)
3. Clear localStorage: `localStorage.clear()` then reload
4. Reset progress: `window.progressTracker.resetProgress()`

---

**Last Updated:** December 16, 2025  
**Mode:** DEMO (All Unlocked)  
**Environment:** Local Development
