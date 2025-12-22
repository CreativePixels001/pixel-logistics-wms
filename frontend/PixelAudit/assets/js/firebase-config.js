// Firebase Configuration
// Replace these values with your Firebase project credentials
// Get them from: https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
let app, auth, db, storage;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('👤 User logged in:', user.email);
        localStorage.setItem('currentUser', user.email);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userDisplayName', user.displayName || user.email);
    } else {
        console.log('👤 No user logged in');
        // Redirect to login if not on public pages
        const publicPages = ['index.html', 'login.html', 'about.html', 'pricing.html', 'contact.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (!publicPages.includes(currentPage) && currentPage !== '') {
            window.location.href = 'login.html';
        }
    }
});

// Helper Functions
const FirebaseHelper = {
    // Get current user
    getCurrentUser: () => {
        return auth.currentUser;
    },

    // Sign out
    signOut: async () => {
        try {
            await auth.signOut();
            localStorage.clear();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Error signing out. Please try again.');
        }
    },

    // Create document
    createDocument: async (collection, data) => {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: auth.currentUser?.uid
            });
            return docRef.id;
        } catch (error) {
            console.error('Create document error:', error);
            throw error;
        }
    },

    // Get documents
    getDocuments: async (collection, whereClause = null) => {
        try {
            let query = db.collection(collection);
            
            if (whereClause) {
                query = query.where(whereClause.field, whereClause.operator, whereClause.value);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Get documents error:', error);
            throw error;
        }
    },

    // Update document
    updateDocument: async (collection, docId, data) => {
        try {
            await db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Update document error:', error);
            throw error;
        }
    },

    // Delete document
    deleteDocument: async (collection, docId) => {
        try {
            await db.collection(collection).doc(docId).delete();
        } catch (error) {
            console.error('Delete document error:', error);
            throw error;
        }
    },

    // Upload file
    uploadFile: async (file, path) => {
        try {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(path);
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.error('Upload file error:', error);
            throw error;
        }
    },

    // Compress and upload image
    uploadImage: async (file, path) => {
        try {
            // Compress image before upload
            const compressed = await FirebaseHelper.compressImage(file);
            return await FirebaseHelper.uploadFile(compressed, path);
        } catch (error) {
            console.error('Upload image error:', error);
            throw error;
        }
    },

    // Compress image
    compressImage: (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }
};

// Export for use in other files
window.FirebaseHelper = FirebaseHelper;
