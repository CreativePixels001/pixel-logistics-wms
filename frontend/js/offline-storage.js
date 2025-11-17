/**
 * Offline Storage Manager
 * Handles offline data storage using IndexedDB
 */

class OfflineStorageManager {
  constructor() {
    this.dbName = 'DLT_WMS_Offline';
    this.dbVersion = 1;
    this.db = null;
    
    this.stores = {
      scans: 'offline_scans',
      receipts: 'offline_receipts',
      picks: 'offline_picks',
      counts: 'offline_counts',
      shipments: 'offline_shipments',
      queue: 'sync_queue'
    };
    
    this.init();
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[Offline Storage] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Offline Storage] Database initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('[Offline Storage] Upgrading database...');

        // Create object stores
        Object.values(this.stores).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            
            // Add indexes
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('userId', 'userId', { unique: false });
            
            console.log(`[Offline Storage] Created store: ${storeName}`);
          }
        });
      };
    });
  }

  /**
   * Add item to offline storage
   */
  async add(storeName, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const item = {
        ...data,
        timestamp: Date.now(),
        status: 'pending',
        userId: this.getCurrentUserId()
      };

      const request = store.add(item);

      request.onsuccess = () => {
        console.log(`[Offline Storage] Added to ${storeName}:`, item);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`[Offline Storage] Error adding to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all items from a store
   */
  async getAll(storeName, filter = null) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let items = request.result;
        
        // Apply filter if provided
        if (filter) {
          items = items.filter(filter);
        }
        
        resolve(items);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get items by status
   */
  async getByStatus(storeName, status) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update item status
   */
  async updateStatus(storeName, id, status, error = null) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          item.syncedAt = Date.now();
          if (error) {
            item.error = error;
          }

          const updateRequest = store.put(item);
          
          updateRequest.onsuccess = () => {
            console.log(`[Offline Storage] Updated ${storeName} item ${id} to ${status}`);
            resolve(item);
          };

          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Item not found'));
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  /**
   * Delete item
   */
  async delete(storeName, id) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`[Offline Storage] Deleted from ${storeName}:`, id);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`[Offline Storage] Cleared ${storeName}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get count of items in store
   */
  async count(storeName, status = null) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request;
      if (status) {
        const index = store.index('status');
        request = index.count(status);
      } else {
        request = store.count();
      }

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get current user ID (from session or localStorage)
   */
  getCurrentUserId() {
    return localStorage.getItem('currentUserId') || 'demo-user';
  }

  /**
   * Export database for debugging
   */
  async exportData() {
    const data = {};
    
    for (const [key, storeName] of Object.entries(this.stores)) {
      data[key] = await this.getAll(storeName);
    }
    
    return data;
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    const stats = {};
    
    for (const [key, storeName] of Object.entries(this.stores)) {
      const total = await this.count(storeName);
      const pending = await this.count(storeName, 'pending');
      const synced = await this.count(storeName, 'synced');
      const failed = await this.count(storeName, 'failed');
      
      stats[key] = { total, pending, synced, failed };
    }
    
    return stats;
  }
}

/**
 * Offline Sync Manager
 * Handles synchronization of offline data when connection is restored
 */
class OfflineSyncManager {
  constructor(storage) {
    this.storage = storage;
    this.isSyncing = false;
    this.syncInterval = null;
    this.listeners = [];
    
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for online event
    window.addEventListener('online', () => {
      console.log('[Offline Sync] Connection restored, starting sync...');
      this.syncAll();
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_OFFLINE_DATA') {
          this.syncAll();
        }
      });
    }

    // Periodic sync check (every 5 minutes)
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Add sync listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }

  /**
   * Sync all pending data
   */
  async syncAll() {
    if (this.isSyncing) {
      console.log('[Offline Sync] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[Offline Sync] No connection, skipping sync');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('sync_started', {});

    try {
      const results = {
        scans: await this.syncStore('offline_scans', this.syncScan),
        receipts: await this.syncStore('offline_receipts', this.syncReceipt),
        picks: await this.syncStore('offline_picks', this.syncPick),
        counts: await this.syncStore('offline_counts', this.syncCount),
        shipments: await this.syncStore('offline_shipments', this.syncShipment)
      };

      const totalSynced = Object.values(results).reduce((sum, r) => sum + r.synced, 0);
      const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);

      console.log('[Offline Sync] Sync complete:', results);
      
      this.notifyListeners('sync_completed', {
        synced: totalSynced,
        failed: totalFailed,
        results
      });

      if (totalSynced > 0) {
        this.showSyncNotification(totalSynced, totalFailed);
      }
    } catch (error) {
      console.error('[Offline Sync] Sync failed:', error);
      this.notifyListeners('sync_failed', { error });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a specific store
   */
  async syncStore(storeName, syncFunction) {
    const pendingItems = await this.storage.getByStatus(storeName, 'pending');
    
    let synced = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        await syncFunction.call(this, item);
        await this.storage.updateStatus(storeName, item.id, 'synced');
        synced++;
      } catch (error) {
        console.error(`[Offline Sync] Failed to sync ${storeName} item:`, error);
        await this.storage.updateStatus(storeName, item.id, 'failed', error.message);
        failed++;
      }
    }

    return { synced, failed, total: pendingItems.length };
  }

  /**
   * Sync scan data
   */
  async syncScan(item) {
    console.log('[Offline Sync] Syncing scan:', item);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Offline Sync] Scan synced:', item.barcode);
        resolve();
      }, 500);
    });
  }

  /**
   * Sync receipt data
   */
  async syncReceipt(item) {
    console.log('[Offline Sync] Syncing receipt:', item);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Offline Sync] Receipt synced:', item.poNumber);
        resolve();
      }, 500);
    });
  }

  /**
   * Sync pick data
   */
  async syncPick(item) {
    console.log('[Offline Sync] Syncing pick:', item);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Offline Sync] Pick synced:', item.orderNumber);
        resolve();
      }, 500);
    });
  }

  /**
   * Sync count data
   */
  async syncCount(item) {
    console.log('[Offline Sync] Syncing count:', item);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Offline Sync] Count synced:', item.location);
        resolve();
      }, 500);
    });
  }

  /**
   * Sync shipment data
   */
  async syncShipment(item) {
    console.log('[Offline Sync] Syncing shipment:', item);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Offline Sync] Shipment synced:', item.shipmentNumber);
        resolve();
      }, 500);
    });
  }

  /**
   * Show sync notification
   */
  showSyncNotification(synced, failed) {
    const message = failed > 0 
      ? `Synced ${synced} items, ${failed} failed`
      : `Successfully synced ${synced} items`;
    
    if (typeof notify !== 'undefined') {
      notify[failed > 0 ? 'warning' : 'success'](message);
    }

    // Show browser notification if permitted
    this.showBrowserNotification('Data Synchronized', message);
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'sync-notification',
        renotify: false
      });
    }
  }

  /**
   * Manual sync trigger
   */
  async manualSync() {
    console.log('[Offline Sync] Manual sync triggered');
    return this.syncAll();
  }

  /**
   * Get sync status
   */
  async getStatus() {
    const stats = await this.storage.getStats();
    return {
      isSyncing: this.isSyncing,
      isOnline: navigator.onLine,
      stats
    };
  }

  /**
   * Clear synced items older than X days
   */
  async clearOldSyncedItems(daysOld = 7) {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    for (const storeName of Object.values(this.storage.stores)) {
      const items = await this.storage.getByStatus(storeName, 'synced');
      
      for (const item of items) {
        if (item.syncedAt && item.syncedAt < cutoffTime) {
          await this.storage.delete(storeName, item.id);
        }
      }
    }
    
    console.log('[Offline Sync] Cleared old synced items');
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Initialize global instances
const offlineStorage = new OfflineStorageManager();
const offlineSync = new OfflineSyncManager(offlineStorage);

// Expose to window
window.offlineStorage = offlineStorage;
window.offlineSync = offlineSync;

console.log('[Offline Storage] Initialized');
