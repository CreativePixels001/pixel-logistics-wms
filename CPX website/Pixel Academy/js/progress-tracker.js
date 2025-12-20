/**
 * Pixel Academy - Progress Tracking System
 * 
 * Manages course progress, module completion, and learning analytics
 * Stores data in localStorage for persistence
 * 
 * ⚠️ DEMO MODE ACTIVE ⚠️
 * All modules and chapters are UNLOCKED for local testing.
 * In production, modules/chapters lock until prerequisites are completed.
 * 
 * To reset progress for testing: window.progressTracker.resetProgress()
 */

class ProgressTracker {
    constructor() {
        this.storageKey = 'pixelAcademyProgress';
        this.progress = this.loadProgress();
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }

        // Default structure
        return {
            courses: {
                'design-technology-ai': {
                    id: 'design-technology-ai',
                    title: 'Design & Technology in the AI Era',
                    enrolledDate: new Date().toISOString(),
                    lastAccessedDate: new Date().toISOString(),
                    status: 'not-started', // not-started, in-progress, completed
                    overallProgress: 0,
                    totalModules: 5,
                    completedModules: 0,
                    totalMinutes: 275,
                    watchedMinutes: 0,
                    modules: {
                        'module-01': {
                            id: 'module-01',
                            title: 'What is Design?',
                            duration: 45,
                            status: 'not-started',
                            progress: 0,
                            lastPosition: 0,
                            completedDate: null,
                            audioSpeed: 1
                        },
                        'module-02': {
                            id: 'module-02',
                            title: 'How Interfaces Work',
                            duration: 135, // 3 chapters × 45 min each
                            status: 'not-started', // UNLOCKED FOR DEMO
                            progress: 0,
                            lastPosition: 0,
                            completedDate: null,
                            audioSpeed: 1,
                            chapters: {
                                'chapter-01-font': {
                                    id: 'chapter-01-font',
                                    title: 'FONT',
                                    duration: 45,
                                    status: 'not-started', // UNLOCKED FOR DEMO
                                    progress: 0,
                                    lastPosition: 0,
                                    completedDate: null,
                                    audioSpeed: 1
                                },
                                'chapter-02-color': {
                                    id: 'chapter-02-color',
                                    title: 'COLOR',
                                    duration: 45,
                                    status: 'not-started', // UNLOCKED FOR DEMO (normally locked until chapter-01 complete)
                                    progress: 0,
                                    lastPosition: 0,
                                    completedDate: null,
                                    audioSpeed: 1
                                },
                                'chapter-03-shape': {
                                    id: 'chapter-03-shape',
                                    title: 'SHAPE',
                                    duration: 45,
                                    status: 'not-started', // UNLOCKED FOR DEMO (normally locked until chapter-02 complete)
                                    progress: 0,
                                    lastPosition: 0,
                                    completedDate: null,
                                    audioSpeed: 1
                                }
                            },
                            assignment: {
                                status: 'not-submitted', // not-submitted, pending, approved, rejected
                                submittedDate: null,
                                approvedDate: null,
                                feedback: null,
                                files: []
                            }
                        },
                        'module-03': {
                            id: 'module-03',
                            title: 'Understanding AI & Prompts',
                            duration: 60,
                            status: 'not-started', // UNLOCKED FOR DEMO (normally locked until module-02 assignment approved)
                            progress: 0,
                            lastPosition: 0,
                            completedDate: null,
                            audioSpeed: 1
                        },
                        'module-04': {
                            id: 'module-04',
                            title: 'Systems Thinking',
                            duration: 55,
                            status: 'not-started', // UNLOCKED FOR DEMO
                            progress: 0,
                            lastPosition: 0,
                            completedDate: null,
                            audioSpeed: 1
                        },
                        'module-05': {
                            id: 'module-05',
                            title: 'Final Synthesis',
                            duration: 65,
                            status: 'not-started', // UNLOCKED FOR DEMO
                            progress: 0,
                            lastPosition: 0,
                            completedDate: null,
                            audioSpeed: 1
                        }
                    }
                }
            },
            stats: {
                totalCoursesEnrolled: 1,
                totalCoursesCompleted: 0,
                totalLearningMinutes: 0,
                currentStreak: 0,
                lastActivityDate: new Date().toISOString()
            }
        };
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
            return true;
        } catch (e) {
            console.error('Error saving progress:', e);
            return false;
        }
    }

    /**
     * Get course progress
     */
    getCourseProgress(courseId) {
        return this.progress.courses[courseId] || null;
    }

    /**
     * Get module progress
     */
    getModuleProgress(courseId, moduleId) {
        const course = this.getCourseProgress(courseId);
        return course ? course.modules[moduleId] : null;
    }

    /**
     * Update module progress
     */
    updateModuleProgress(courseId, moduleId, updates) {
        const course = this.progress.courses[courseId];
        if (!course) return false;

        const module = course.modules[moduleId];
        if (!module) return false;

        // Update module data
        Object.assign(module, updates);

        // Update last accessed date
        course.lastAccessedDate = new Date().toISOString();

        // Update course status
        if (module.status === 'in-progress' && course.status === 'not-started') {
            course.status = 'in-progress';
        }

        // Recalculate course progress
        this.recalculateCourseProgress(courseId);

        // Save to localStorage
        return this.saveProgress();
    }

    /**
     * Mark module as complete
     */
    completeModule(courseId, moduleId) {
        const course = this.progress.courses[courseId];
        if (!course) return false;

        const module = course.modules[moduleId];
        if (!module) return false;

        // Mark as completed
        module.status = 'completed';
        module.progress = 100;
        module.completedDate = new Date().toISOString();

        // Unlock next module
        const moduleKeys = Object.keys(course.modules);
        const currentIndex = moduleKeys.indexOf(moduleId);
        if (currentIndex < moduleKeys.length - 1) {
            const nextModuleId = moduleKeys[currentIndex + 1];
            const nextModule = course.modules[nextModuleId];
            if (nextModule.status === 'locked') {
                nextModule.status = 'not-started';
            }
        }

        // Update course completion count
        course.completedModules = Object.values(course.modules).filter(m => m.status === 'completed').length;

        // Check if course is complete
        if (course.completedModules === course.totalModules) {
            course.status = 'completed';
            course.overallProgress = 100;
            this.progress.stats.totalCoursesCompleted++;
        }

        // Recalculate progress
        this.recalculateCourseProgress(courseId);

        return this.saveProgress();
    }

    /**
     * Update audio position
     */
    updateAudioPosition(courseId, moduleId, position, speed = 1) {
        return this.updateModuleProgress(courseId, moduleId, {
            lastPosition: position,
            audioSpeed: speed,
            status: position > 0 ? 'in-progress' : 'not-started'
        });
    }

    /**
     * Add learning time
     */
    addLearningTime(courseId, minutes) {
        const course = this.progress.courses[courseId];
        if (!course) return false;

        course.watchedMinutes = Math.min(course.watchedMinutes + minutes, course.totalMinutes);
        this.progress.stats.totalLearningMinutes += minutes;
        this.progress.stats.lastActivityDate = new Date().toISOString();

        return this.saveProgress();
    }

    /**
     * Recalculate course progress percentage
     */
    recalculateCourseProgress(courseId) {
        const course = this.progress.courses[courseId];
        if (!course) return;

        const modules = Object.values(course.modules);
        const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
        course.overallProgress = Math.round(totalProgress / modules.length);

        // Update watched minutes based on module progress
        const totalWatched = modules.reduce((sum, module) => {
            return sum + (module.duration * module.progress / 100);
        }, 0);
        course.watchedMinutes = Math.round(totalWatched);
    }

    /**
     * Get dashboard stats
     */
    getDashboardStats() {
        const courses = Object.values(this.progress.courses);
        const totalCourses = courses.length;
        const inProgressCourses = courses.filter(c => c.status === 'in-progress').length;
        const completedCourses = courses.filter(c => c.status === 'completed').length;
        
        // Get overall progress across all courses
        const totalProgress = courses.reduce((sum, course) => sum + course.overallProgress, 0);
        const overallProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

        // Get total modules completed
        const totalModulesCompleted = courses.reduce((sum, course) => sum + course.completedModules, 0);
        const totalModules = courses.reduce((sum, course) => sum + course.totalModules, 0);

        return {
            totalCourses,
            inProgressCourses,
            completedCourses,
            totalLearningMinutes: this.progress.stats.totalLearningMinutes,
            overallProgress,
            totalModulesCompleted,
            totalModules,
            lastActivityDate: this.progress.stats.lastActivityDate
        };
    }

    /**
     * Get learning hours formatted
     */
    getLearningHoursFormatted() {
        const minutes = this.progress.stats.totalLearningMinutes;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) {
            return `${mins}m`;
        } else if (mins === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${mins}m`;
        }
    }

    /**
     * Get chapter progress
     */
    getChapterProgress(courseId, moduleId, chapterId) {
        const course = this.progress.courses[courseId];
        if (!course) return null;
        
        const module = course.modules[moduleId];
        if (!module || !module.chapters) return null;
        
        return module.chapters[chapterId] || null;
    }

    /**
     * Update chapter progress
     */
    updateChapterProgress(courseId, moduleId, chapterId, updates) {
        const course = this.progress.courses[courseId];
        if (!course) return false;
        
        const module = course.modules[moduleId];
        if (!module || !module.chapters) return false;
        
        const chapter = module.chapters[chapterId];
        if (!chapter) return false;
        
        Object.assign(chapter, updates);
        
        // Update module status based on chapter progress
        if (updates.status === 'in-progress' && module.status === 'not-started') {
            module.status = 'in-progress';
        }
        
        course.lastAccessedDate = new Date().toISOString();
        this.progress.stats.lastActivityDate = new Date().toISOString();
        
        this.saveProgress();
        return true;
    }

    /**
     * Update chapter audio position
     */
    updateChapterPosition(courseId, moduleId, chapterId, position, speed = 1) {
        return this.updateChapterProgress(courseId, moduleId, chapterId, {
            lastPosition: position,
            audioSpeed: speed,
            status: position > 0 ? 'in-progress' : 'not-started'
        });
    }

    /**
     * Complete a chapter
     */
    completeChapter(courseId, moduleId, chapterId) {
        const updates = {
            status: 'completed',
            progress: 100,
            completedDate: new Date().toISOString()
        };
        
        const success = this.updateChapterProgress(courseId, moduleId, chapterId, updates);
        
        if (success) {
            // Unlock next chapter (FOR PRODUCTION - currently all unlocked for demo)
            const module = this.progress.courses[courseId]?.modules[moduleId];
            if (module && module.chapters) {
                const chapterKeys = Object.keys(module.chapters);
                const currentIndex = chapterKeys.indexOf(chapterId);
                if (currentIndex >= 0 && currentIndex < chapterKeys.length - 1) {
                    const nextChapterId = chapterKeys[currentIndex + 1];
                    // In production, unlock next chapter here
                    // module.chapters[nextChapterId].status = 'not-started';
                }
                
                // Check if all chapters complete
                const allChaptersComplete = Object.values(module.chapters).every(ch => ch.status === 'completed');
                if (allChaptersComplete) {
                    module.status = 'completed';
                    module.progress = 100;
                    module.completedDate = new Date().toISOString();
                }
            }
            
            this.recalculateCourseProgress(courseId);
            this.saveProgress();
        }
        
        return success;
    }

    /**
     * Submit assignment
     */
    submitAssignment(courseId, moduleId, submissionData) {
        const course = this.progress.courses[courseId];
        if (!course) return false;
        
        const module = course.modules[moduleId];
        if (!module || !module.assignment) return false;
        
        // Update assignment data
        module.assignment = {
            status: 'pending',
            submittedDate: new Date().toISOString(),
            approvedDate: null,
            rejectedDate: null,
            feedback: null,
            studentName: submissionData.studentName,
            caseStudy: submissionData.caseStudy,
            files: submissionData.files,
            reviewedBy: null
        };
        
        // Mark module as awaiting approval
        if (module.status !== 'completed') {
            module.status = 'awaiting-approval';
        }
        
        course.lastAccessedDate = new Date().toISOString();
        this.progress.stats.lastActivityDate = new Date().toISOString();
        
        return this.saveProgress();
    }

    /**
     * Get assignment status
     */
    getAssignmentStatus(courseId, moduleId) {
        const module = this.getModuleProgress(courseId, moduleId);
        return module?.assignment || null;
    }

    /**
     * Approve assignment (admin only)
     */
    approveAssignment(courseId, moduleId, adminName, feedback = '') {
        const course = this.progress.courses[courseId];
        if (!course) return false;
        
        const module = course.modules[moduleId];
        if (!module || !module.assignment) return false;
        
        // Update assignment status
        module.assignment.status = 'approved';
        module.assignment.approvedDate = new Date().toISOString();
        module.assignment.feedback = feedback;
        module.assignment.reviewedBy = adminName;
        
        // Mark module as complete
        module.status = 'completed';
        module.progress = 100;
        module.completedDate = new Date().toISOString();
        
        // Unlock next module
        const moduleKeys = Object.keys(course.modules);
        const currentIndex = moduleKeys.indexOf(moduleId);
        if (currentIndex < moduleKeys.length - 1) {
            const nextModuleId = moduleKeys[currentIndex + 1];
            const nextModule = course.modules[nextModuleId];
            if (nextModule.status === 'locked' || nextModule.status === 'not-started') {
                nextModule.status = 'not-started'; // Unlock
            }
        }
        
        // Update course stats
        course.completedModules = Object.values(course.modules).filter(m => m.status === 'completed').length;
        
        // Check if course is complete
        if (course.completedModules === course.totalModules) {
            course.status = 'completed';
            course.overallProgress = 100;
            this.progress.stats.totalCoursesCompleted++;
        }
        
        this.recalculateCourseProgress(courseId);
        return this.saveProgress();
    }

    /**
     * Reject assignment (admin only)
     */
    rejectAssignment(courseId, moduleId, adminName, feedback) {
        const course = this.progress.courses[courseId];
        if (!course) return false;
        
        const module = course.modules[moduleId];
        if (!module || !module.assignment) return false;
        
        // Update assignment status
        module.assignment.status = 'rejected';
        module.assignment.rejectedDate = new Date().toISOString();
        module.assignment.feedback = feedback;
        module.assignment.reviewedBy = adminName;
        
        // Keep module in progress state
        module.status = 'in-progress';
        
        return this.saveProgress();
    }

    /**
     * Get all pending assignments (admin view)
     */
    getAllPendingAssignments() {
        const pending = [];
        
        Object.values(this.progress.courses).forEach(course => {
            Object.entries(course.modules).forEach(([moduleId, module]) => {
                if (module.assignment && module.assignment.status === 'pending') {
                    pending.push({
                        courseId: course.id,
                        courseTitle: course.title,
                        moduleId: moduleId,
                        moduleTitle: module.title,
                        studentName: module.assignment.studentName,
                        submittedDate: module.assignment.submittedDate,
                        files: module.assignment.files,
                        caseStudy: module.assignment.caseStudy
                    });
                }
            });
        });
        
        return pending;
    }

    /**
     * Get assignment history (all statuses)
     */
    getAssignmentHistory() {
        const history = [];
        
        Object.values(this.progress.courses).forEach(course => {
            Object.entries(course.modules).forEach(([moduleId, module]) => {
                if (module.assignment && module.assignment.status !== 'not-submitted') {
                    history.push({
                        courseId: course.id,
                        courseTitle: course.title,
                        moduleId: moduleId,
                        moduleTitle: module.title,
                        studentName: module.assignment.studentName,
                        status: module.assignment.status,
                        submittedDate: module.assignment.submittedDate,
                        approvedDate: module.assignment.approvedDate,
                        rejectedDate: module.assignment.rejectedDate,
                        feedback: module.assignment.feedback,
                        reviewedBy: module.assignment.reviewedBy,
                        files: module.assignment.files,
                        caseStudy: module.assignment.caseStudy
                    });
                }
            });
        });
        
        // Sort by submitted date (newest first)
        return history.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    }

    /**
     * Reset all progress (for testing)
     */
    resetProgress() {
        localStorage.removeItem(this.storageKey);
        this.progress = this.loadProgress();
        return true;
    }

    /**
     * Get formatted learning hours for display
     */
    getLearningHoursFormatted() {
        const minutes = this.progress.stats.totalLearningMinutes;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    /**
     * Export progress data
     */
    exportProgress() {
        return JSON.stringify(this.progress, null, 2);
    }

    /**
     * Import progress data
     */
    importProgress(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.progress = imported;
            return this.saveProgress();
        } catch (e) {
            console.error('Error importing progress:', e);
            return false;
        }
    }
}

// Create global instance
window.progressTracker = new ProgressTracker();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}
