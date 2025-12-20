# Frontend Migration Guide
## From localStorage to Real API Integration

This guide shows how to migrate the current localStorage-based frontend to use the real backend API.

## Step 1: Add API Client

Include the API client in all HTML pages (before other scripts):

```html
<script src="../js/api-client.js"></script>
```

## Step 2: Update Login Page

### Current (login.html):
```javascript
// Mock Google Sign-In
function handleGoogleSignIn() {
  localStorage.setItem('user', JSON.stringify({
    name: 'Demo Student',
    email: 'demo@pixelacademy.com'
  }));
  window.location.href = 'student/dashboard.html';
}
```

### New (login.html):
```html
<!-- Add Google Sign-In SDK -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
async function handleCredentialResponse(response) {
  try {
    const result = await window.pixelAcademyAPI.loginWithGoogle(response.credential);
    
    // Redirect based on role
    if (result.user.role === 'admin') {
      window.location.href = 'admin/dashboard.html';
    } else {
      window.location.href = 'student/dashboard.html';
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}
</script>
```

## Step 3: Add Authentication Check

Add to the top of every page (after including api-client.js):

```javascript
// Check authentication
if (!window.pixelAcademyAPI.isAuthenticated()) {
  window.location.href = '/login.html';
}

// For admin pages, add role check
if (!window.pixelAcademyAPI.isAdmin()) {
  window.location.href = '/student/dashboard.html';
}
```

## Step 4: Update Progress Tracking

### Current (module-02.html):
```javascript
function markChapterComplete(chapterId) {
  progressTracker.markChapterComplete('module-02', chapterId);
  updateProgress();
}
```

### New (module-02.html):
```javascript
async function markChapterComplete(chapterId) {
  try {
    await window.pixelAcademyAPI.markChapterComplete(
      'course-id', // Get from page context
      'module-02',
      chapterId,
      300 // time spent in seconds
    );
    await updateProgress();
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

async function updateProgress() {
  const { progress } = await window.pixelAcademyAPI.getCourseProgress('course-id');
  // Update UI based on progress
}
```

## Step 5: Update Assignment Submission

### Current (module-02.html):
```javascript
function submitAssignment() {
  const caseStudy = document.getElementById('caseStudy').value;
  const files = Array.from(document.getElementById('fileUpload').files);
  
  // Save metadata only
  progressTracker.submitAssignment('design-technology-ai', 'module-02', {
    studentName: 'Demo Student',
    caseStudy: caseStudy,
    files: files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }))
  });
}
```

### New (module-02.html):
```javascript
async function submitAssignment() {
  const caseStudy = document.getElementById('caseStudy').value;
  const fileInput = document.getElementById('fileUpload');
  const files = fileInput.files; // Real File objects

  if (!caseStudy) {
    alert('Please provide a case study');
    return;
  }

  try {
    const result = await window.pixelAcademyAPI.submitAssignment(
      'module-id', // Get from page context
      caseStudy,
      Array.from(files) // Convert FileList to Array
    );

    alert('Assignment submitted successfully!');
    // Optionally redirect or update UI
  } catch (error) {
    alert('Submission failed: ' + error.message);
  }
}
```

## Step 6: Update Admin Dashboard

### Current (admin/dashboard.html):
```javascript
function loadDashboardData() {
  const progress = progressTracker.getProgress();
  // Use localStorage data
}
```

### New (admin/dashboard.html):
```javascript
async function loadDashboardData() {
  try {
    const analytics = await window.pixelAcademyAPI.getAnalyticsOverview();
    
    document.getElementById('totalStudents').textContent = analytics.students.total;
    document.getElementById('activeStudents').textContent = analytics.students.active;
    document.getElementById('avgProgress').textContent = analytics.enrollments.avgCompletion + '%';
    document.getElementById('pendingReviews').textContent = analytics.assignments.pending;
    
    // Update charts, tables, etc.
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

// Call on page load
loadDashboardData();
```

## Step 7: Update Admin Assignments

### Current (admin/assignments.html):
```javascript
function loadAssignments() {
  const assignments = progressTracker.getAllPendingAssignments();
  renderAssignments(assignments);
}

function approveAssignment(courseId, moduleId) {
  progressTracker.approveAssignment(courseId, moduleId, 'Admin', 'Great work!');
}
```

### New (admin/assignments.html):
```javascript
async function loadAssignments(status = 'pending') {
  try {
    const { assignments } = await window.pixelAcademyAPI.getAssignments({ status });
    renderAssignments(assignments);
  } catch (error) {
    console.error('Failed to load assignments:', error);
  }
}

async function approveAssignment(assignmentId) {
  const feedback = document.getElementById(`feedback-${assignmentId}`).value;
  
  try {
    await window.pixelAcademyAPI.approveAssignment(assignmentId, feedback);
    alert('Assignment approved!');
    await loadAssignments(); // Reload list
  } catch (error) {
    alert('Failed to approve: ' + error.message);
  }
}

async function rejectAssignment(assignmentId) {
  const feedback = document.getElementById(`feedback-${assignmentId}`).value;
  
  if (!feedback) {
    alert('Feedback is required for rejection');
    return;
  }

  try {
    await window.pixelAcademyAPI.rejectAssignment(assignmentId, feedback);
    alert('Assignment rejected');
    await loadAssignments();
  } catch (error) {
    alert('Failed to reject: ' + error.message);
  }
}

// Load on page load
loadAssignments();
```

## Step 8: Update Students Page

### New (admin/students.html):
```javascript
async function loadStudents() {
  try {
    const { students } = await window.pixelAcademyAPI.getStudentAnalytics();
    
    studentsGrid.innerHTML = students.map(student => `
      <div class="student-card">
        <h3>${student.name}</h3>
        <p>${student.email}</p>
        <div class="progress">${student.avgProgress}%</div>
        <p>Completed: ${student.completedChapters} chapters</p>
        <p>Assignments: ${student.assignments.approved}/${student.assignments.total}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load students:', error);
  }
}

loadStudents();
```

## Step 9: Update Analytics Page

### New (admin/analytics.html):
```javascript
async function loadAnalytics() {
  try {
    const overview = await window.pixelAcademyAPI.getAnalyticsOverview();
    const moduleStats = await window.pixelAcademyAPI.getModuleAnalytics();
    
    // Update KPIs
    document.getElementById('completionRate').textContent = 
      overview.enrollments.avgCompletion + '%';
    document.getElementById('approvalRate').textContent = 
      overview.assignments.approvalRate + '%';
    
    // Render module charts
    renderModuleChart(moduleStats.modules);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}

loadAnalytics();
```

## Step 10: Handle File Downloads

### New file download handler:
```javascript
function downloadAssignmentFile(fileId) {
  window.pixelAcademyAPI.downloadFile(fileId);
}
```

In HTML:
```html
<button onclick="downloadAssignmentFile('file-id')">Download</button>
```

## Step 11: Environment Configuration

Create a config file for different environments:

```javascript
// js/config.js
const CONFIG = {
  development: {
    API_URL: 'http://localhost:3000/api',
    GOOGLE_CLIENT_ID: 'dev-client-id.apps.googleusercontent.com'
  },
  production: {
    API_URL: 'https://api.pixelacademy.com/api',
    GOOGLE_CLIENT_ID: 'prod-client-id.apps.googleusercontent.com'
  }
};

const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
window.APP_CONFIG = CONFIG[ENV];

// Update API client
window.pixelAcademyAPI.baseURL = window.APP_CONFIG.API_URL;
```

## Step 12: Error Handling

Add global error handler:

```javascript
// js/error-handler.js
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check for auth errors
  if (event.reason.message && event.reason.message.includes('Authentication')) {
    // Redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
});
```

## Testing Checklist

After migration, test:

- [ ] Google login redirects correctly
- [ ] Student can view courses
- [ ] Chapter completion saves to database
- [ ] Assignment submission with real files works
- [ ] Admin can see all students
- [ ] Admin can approve/reject assignments
- [ ] File downloads work
- [ ] Analytics show real data
- [ ] Logout clears session
- [ ] Unauthorized access redirects to login

## Rollback Plan

Keep `progress-tracker.js` as fallback. Add feature flag:

```javascript
const USE_API = true; // Set to false to use localStorage

if (USE_API) {
  // Use API methods
} else {
  // Use progressTracker methods
}
```

## Performance Tips

1. **Caching**: Cache course/module data in sessionStorage
2. **Debouncing**: Debounce progress updates
3. **Optimistic UI**: Update UI immediately, sync in background
4. **Error Recovery**: Retry failed requests

## Common Issues

**CORS errors**: Ensure backend CORS is configured for your frontend URL

**Token expiration**: Implement token refresh logic

**File size errors**: Validate file size before upload

**Network failures**: Add retry logic with exponential backoff

---

Ready to migrate! Start with Step 1 and work through each step systematically.
