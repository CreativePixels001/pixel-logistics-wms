/**
 * Google Drive Sync Module for Pixel Notes
 * Handles automatic synchronization of notes to user's Google Drive
 */

class GoogleDriveSync {
    constructor() {
        this.clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual Client ID
        this.apiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with actual API Key
        this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
        this.scopes = 'https://www.googleapis.com/auth/drive.file';
        this.folderName = 'PixelNotes';
        this.folderId = null;
        this.isSignedIn = false;
        this.syncInterval = null;
    }

    /**
     * Initialize Google Drive API
     */
    async init() {
        try {
            await gapi.load('client:auth2', async () => {
                await gapi.client.init({
                    apiKey: this.apiKey,
                    clientId: this.clientId,
                    discoveryDocs: this.discoveryDocs,
                    scope: this.scopes
                });

                // Listen for sign-in state changes
                gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));

                // Handle initial sign-in state
                this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            });
        } catch (error) {
            console.error('Error initializing Google Drive:', error);
        }
    }

    /**
     * Update sign-in status
     */
    updateSigninStatus(isSignedIn) {
        this.isSignedIn = isSignedIn;
        
        if (isSignedIn) {
            this.startAutoSync();
        } else {
            this.stopAutoSync();
        }
    }

    /**
     * Sign in to Google
     */
    async signIn() {
        try {
            await gapi.auth2.getAuthInstance().signIn();
            return true;
        } catch (error) {
            console.error('Error signing in:', error);
            return false;
        }
    }

    /**
     * Sign out from Google
     */
    async signOut() {
        try {
            await gapi.auth2.getAuthInstance().signOut();
            this.stopAutoSync();
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            return false;
        }
    }

    /**
     * Find or create PixelNotes folder in Google Drive
     */
    async getOrCreateFolder() {
        if (this.folderId) return this.folderId;

        try {
            // Search for existing folder
            const response = await gapi.client.drive.files.list({
                q: `name='${this.folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.result.files && response.result.files.length > 0) {
                this.folderId = response.result.files[0].id;
            } else {
                // Create new folder
                const folderMetadata = {
                    name: this.folderName,
                    mimeType: 'application/vnd.google-apps.folder'
                };

                const folder = await gapi.client.drive.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                });

                this.folderId = folder.result.id;
            }

            return this.folderId;
        } catch (error) {
            console.error('Error getting/creating folder:', error);
            throw error;
        }
    }

    /**
     * Save notes to Google Drive
     */
    async saveNotesToDrive(notes) {
        if (!this.isSignedIn) {
            console.log('Not signed in to Google Drive');
            return false;
        }

        try {
            const folderId = await this.getOrCreateFolder();
            
            const fileContent = JSON.stringify({
                notes: notes,
                aiLearning: JSON.parse(localStorage.getItem('pixelNotesAI') || '{}'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            }, null, 2);

            const fileName = 'pixel-notes-backup.json';

            // Check if file exists
            const searchResponse = await gapi.client.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const metadata = {
                name: fileName,
                mimeType: 'application/json',
                parents: [folderId]
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                fileContent +
                close_delim;

            let response;
            
            if (searchResponse.result.files && searchResponse.result.files.length > 0) {
                // Update existing file
                const fileId = searchResponse.result.files[0].id;
                response = await gapi.client.request({
                    path: '/upload/drive/v3/files/' + fileId,
                    method: 'PATCH',
                    params: { uploadType: 'multipart' },
                    headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
                    body: multipartRequestBody
                });
            } else {
                // Create new file
                response = await gapi.client.request({
                    path: '/upload/drive/v3/files',
                    method: 'POST',
                    params: { uploadType: 'multipart' },
                    headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
                    body: multipartRequestBody
                });
            }

            // Update last sync time
            const syncSettings = JSON.parse(localStorage.getItem('pixelNotesSyncSettings') || '{}');
            syncSettings.lastSync = new Date().toISOString();
            localStorage.setItem('pixelNotesSyncSettings', JSON.stringify(syncSettings));

            console.log('Notes saved to Google Drive successfully');
            return true;
        } catch (error) {
            console.error('Error saving to Google Drive:', error);
            return false;
        }
    }

    /**
     * Load notes from Google Drive
     */
    async loadNotesFromDrive() {
        if (!this.isSignedIn) {
            console.log('Not signed in to Google Drive');
            return null;
        }

        try {
            const folderId = await this.getOrCreateFolder();
            const fileName = 'pixel-notes-backup.json';

            const searchResponse = await gapi.client.drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, modifiedTime)',
                spaces: 'drive'
            });

            if (!searchResponse.result.files || searchResponse.result.files.length === 0) {
                console.log('No backup found in Google Drive');
                return null;
            }

            const fileId = searchResponse.result.files[0].id;

            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            const data = JSON.parse(response.body);
            
            console.log('Notes loaded from Google Drive successfully');
            return data;
        } catch (error) {
            console.error('Error loading from Google Drive:', error);
            return null;
        }
    }

    /**
     * Start automatic sync
     */
    startAutoSync() {
        const syncSettings = JSON.parse(localStorage.getItem('pixelNotesSyncSettings') || '{}');
        
        if (!syncSettings.autoSync) return;

        // Sync every 5 minutes
        this.syncInterval = setInterval(() => {
            const notes = JSON.parse(localStorage.getItem('pixelNotes') || '[]');
            this.saveNotesToDrive(notes);
        }, syncSettings.syncInterval || 300000);
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Manual sync trigger
     */
    async syncNow() {
        const notes = JSON.parse(localStorage.getItem('pixelNotes') || '[]');
        return await this.saveNotesToDrive(notes);
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        const syncSettings = JSON.parse(localStorage.getItem('pixelNotesSyncSettings') || '{}');
        
        return {
            isSignedIn: this.isSignedIn,
            enabled: syncSettings.enabled || false,
            autoSync: syncSettings.autoSync || false,
            lastSync: syncSettings.lastSync || null
        };
    }
}

// Export for use in other files
window.GoogleDriveSync = GoogleDriveSync;
