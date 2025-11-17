/**
 * Notification Preferences Manager
 * Handles user notification settings and preferences
 */

class NotificationPreferences {
  constructor() {
    this.storageKey = 'notification_preferences';
    this.defaults = {
      enabled: true,
      categories: {
        taskAssigned: { enabled: true, sound: true, vibrate: true },
        lowStock: { enabled: true, sound: true, vibrate: true },
        orderUpdate: { enabled: true, sound: false, vibrate: false },
        cycleCountDue: { enabled: true, sound: true, vibrate: true },
        shipmentReady: { enabled: true, sound: true, vibrate: true },
        receivingAlert: { enabled: true, sound: true, vibrate: true },
        systemAlert: { enabled: true, sound: true, vibrate: true }
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      sound: {
        enabled: true,
        volume: 0.7
      },
      vibration: {
        enabled: true,
        pattern: [200, 100, 200]
      }
    };

    this.preferences = this.load();
  }

  /**
   * Load preferences from storage
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new settings exist
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.error('[Preferences] Error loading preferences:', error);
    }
    return { ...this.defaults };
  }

  /**
   * Merge stored preferences with defaults
   */
  mergeWithDefaults(stored) {
    return {
      enabled: stored.enabled !== undefined ? stored.enabled : this.defaults.enabled,
      categories: { ...this.defaults.categories, ...stored.categories },
      quietHours: { ...this.defaults.quietHours, ...stored.quietHours },
      sound: { ...this.defaults.sound, ...stored.sound },
      vibration: { ...this.defaults.vibration, ...stored.vibration }
    };
  }

  /**
   * Save preferences to storage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
      console.log('[Preferences] Saved:', this.preferences);
      return true;
    } catch (error) {
      console.error('[Preferences] Error saving preferences:', error);
      return false;
    }
  }

  /**
   * Get all preferences
   */
  getAll() {
    return { ...this.preferences };
  }

  /**
   * Set master notification toggle
   */
  setEnabled(enabled) {
    this.preferences.enabled = enabled;
    this.save();
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled() {
    return this.preferences.enabled;
  }

  /**
   * Set category preference
   */
  setCategoryPreference(category, settings) {
    if (this.preferences.categories[category]) {
      this.preferences.categories[category] = {
        ...this.preferences.categories[category],
        ...settings
      };
      this.save();
    }
  }

  /**
   * Get category preference
   */
  getCategoryPreference(category) {
    return this.preferences.categories[category] || null;
  }

  /**
   * Check if category is enabled
   */
  isCategoryEnabled(category) {
    const pref = this.preferences.categories[category];
    return this.preferences.enabled && pref && pref.enabled;
  }

  /**
   * Set quiet hours
   */
  setQuietHours(enabled, start, end) {
    this.preferences.quietHours = { enabled, start, end };
    this.save();
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours() {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const { start, end } = this.preferences.quietHours;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  /**
   * Set sound preferences
   */
  setSoundPreferences(enabled, volume) {
    this.preferences.sound = { enabled, volume };
    this.save();
  }

  /**
   * Set vibration preferences
   */
  setVibrationPreferences(enabled, pattern) {
    this.preferences.vibration = { enabled, pattern };
    this.save();
  }

  /**
   * Should notification be shown based on preferences
   */
  shouldShowNotification(category) {
    // Check if notifications are globally enabled
    if (!this.isEnabled()) {
      return false;
    }

    // Check if in quiet hours
    if (this.isQuietHours()) {
      // System alerts override quiet hours
      return category === 'systemAlert';
    }

    // Check if category is enabled
    return this.isCategoryEnabled(category);
  }

  /**
   * Get notification options based on preferences
   */
  getNotificationOptions(category, baseOptions = {}) {
    const categoryPref = this.getCategoryPreference(category);
    
    if (!categoryPref) {
      return baseOptions;
    }

    const options = { ...baseOptions };

    // Apply vibration settings
    if (this.preferences.vibration.enabled && categoryPref.vibrate) {
      options.vibrate = this.preferences.vibration.pattern;
    } else {
      options.vibrate = [];
    }

    // Apply sound settings (if supported)
    if (this.preferences.sound.enabled && categoryPref.sound) {
      options.silent = false;
    } else {
      options.silent = true;
    }

    return options;
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.preferences = { ...this.defaults };
    this.save();
  }

  /**
   * Export preferences
   */
  export() {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Import preferences
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.preferences = this.mergeWithDefaults(imported);
      this.save();
      return true;
    } catch (error) {
      console.error('[Preferences] Error importing preferences:', error);
      return false;
    }
  }
}

/**
 * UI Manager for Notification Preferences
 */
class NotificationPreferencesUI {
  constructor(preferencesManager) {
    this.prefs = preferencesManager;
    this.modal = null;
  }

  /**
   * Create preferences modal
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'notification-preferences-modal';
    modal.innerHTML = `
      <div class="notification-preferences-overlay"></div>
      <div class="notification-preferences-content">
        <div class="notification-preferences-header">
          <h2>Notification Preferences</h2>
          <button class="notification-preferences-close" aria-label="Close">×</button>
        </div>
        <div class="notification-preferences-body">
          ${this.createGeneralSection()}
          ${this.createCategoriesSection()}
          ${this.createQuietHoursSection()}
          ${this.createSoundVibrationSection()}
        </div>
        <div class="notification-preferences-footer">
          <button class="btn btn-secondary" data-action="reset">Reset to Defaults</button>
          <button class="btn btn-primary" data-action="save">Save Preferences</button>
        </div>
      </div>
    `;

    this.attachEventListeners(modal);
    return modal;
  }

  /**
   * Create general settings section
   */
  createGeneralSection() {
    const prefs = this.prefs.getAll();
    return `
      <div class="preference-section">
        <h3>General Settings</h3>
        <div class="preference-item">
          <label class="preference-toggle">
            <input type="checkbox" id="pref-enabled" ${prefs.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Enable Notifications</span>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Create notification categories section
   */
  createCategoriesSection() {
    const categories = this.prefs.getAll().categories;
    const categoryLabels = {
      taskAssigned: 'Task Assigned',
      lowStock: 'Low Stock Alerts',
      orderUpdate: 'Order Updates',
      cycleCountDue: 'Cycle Count Due',
      shipmentReady: 'Shipment Ready',
      receivingAlert: 'Receiving Alerts',
      systemAlert: 'System Alerts'
    };

    let html = `
      <div class="preference-section">
        <h3>Notification Categories</h3>
    `;

    for (const [key, label] of Object.entries(categoryLabels)) {
      const cat = categories[key];
      html += `
        <div class="preference-category">
          <label class="preference-toggle">
            <input type="checkbox" data-category="${key}" data-setting="enabled" ${cat.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">${label}</span>
          </label>
          <div class="preference-category-options">
            <label>
              <input type="checkbox" data-category="${key}" data-setting="sound" ${cat.sound ? 'checked' : ''}>
              Sound
            </label>
            <label>
              <input type="checkbox" data-category="${key}" data-setting="vibrate" ${cat.vibrate ? 'checked' : ''}>
              Vibrate
            </label>
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Create quiet hours section
   */
  createQuietHoursSection() {
    const quietHours = this.prefs.getAll().quietHours;
    return `
      <div class="preference-section">
        <h3>Quiet Hours</h3>
        <div class="preference-item">
          <label class="preference-toggle">
            <input type="checkbox" id="pref-quiet-enabled" ${quietHours.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Enable Quiet Hours</span>
          </label>
        </div>
        <div class="preference-time-range">
          <label>
            From:
            <input type="time" id="pref-quiet-start" value="${quietHours.start}">
          </label>
          <label>
            To:
            <input type="time" id="pref-quiet-end" value="${quietHours.end}">
          </label>
        </div>
        <p class="preference-help">No notifications during quiet hours except system alerts</p>
      </div>
    `;
  }

  /**
   * Create sound and vibration section
   */
  createSoundVibrationSection() {
    const sound = this.prefs.getAll().sound;
    const vibration = this.prefs.getAll().vibration;
    
    return `
      <div class="preference-section">
        <h3>Sound & Vibration</h3>
        <div class="preference-item">
          <label class="preference-toggle">
            <input type="checkbox" id="pref-sound-enabled" ${sound.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Enable Sound</span>
          </label>
        </div>
        <div class="preference-item">
          <label>
            Volume:
            <input type="range" id="pref-sound-volume" min="0" max="1" step="0.1" value="${sound.volume}">
            <span id="pref-sound-volume-value">${Math.round(sound.volume * 100)}%</span>
          </label>
        </div>
        <div class="preference-item">
          <label class="preference-toggle">
            <input type="checkbox" id="pref-vibration-enabled" ${vibration.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
            <span class="toggle-label">Enable Vibration</span>
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners(modal) {
    // Close button
    modal.querySelector('.notification-preferences-close').addEventListener('click', () => {
      this.close();
    });

    // Overlay click
    modal.querySelector('.notification-preferences-overlay').addEventListener('click', () => {
      this.close();
    });

    // Category toggles
    modal.querySelectorAll('[data-category]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const category = e.target.dataset.category;
        const setting = e.target.dataset.setting;
        this.prefs.setCategoryPreference(category, { [setting]: e.target.checked });
      });
    });

    // Volume slider
    const volumeSlider = modal.querySelector('#pref-sound-volume');
    const volumeValue = modal.querySelector('#pref-sound-volume-value');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        volumeValue.textContent = `${Math.round(volume * 100)}%`;
        this.prefs.setSoundPreferences(
          modal.querySelector('#pref-sound-enabled').checked,
          volume
        );
      });
    }

    // Save button
    modal.querySelector('[data-action="save"]').addEventListener('click', () => {
      this.savePreferences(modal);
      this.close();
    });

    // Reset button
    modal.querySelector('[data-action="reset"]').addEventListener('click', () => {
      if (confirm('Reset all notification preferences to defaults?')) {
        this.prefs.reset();
        this.close();
        this.show(); // Reopen with defaults
      }
    });
  }

  /**
   * Save preferences from modal
   */
  savePreferences(modal) {
    // General
    this.prefs.setEnabled(modal.querySelector('#pref-enabled').checked);

    // Quiet hours
    this.prefs.setQuietHours(
      modal.querySelector('#pref-quiet-enabled').checked,
      modal.querySelector('#pref-quiet-start').value,
      modal.querySelector('#pref-quiet-end').value
    );

    // Sound
    this.prefs.setSoundPreferences(
      modal.querySelector('#pref-sound-enabled').checked,
      parseFloat(modal.querySelector('#pref-sound-volume').value)
    );

    // Vibration
    this.prefs.setVibrationPreferences(
      modal.querySelector('#pref-vibration-enabled').checked,
      this.prefs.getAll().vibration.pattern
    );

    showNotification('Notification preferences saved', 'success');
  }

  /**
   * Show preferences modal
   */
  show() {
    if (this.modal) {
      this.close();
    }

    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    
    // Trigger animation
    setTimeout(() => {
      this.modal.classList.add('active');
    }, 10);
  }

  /**
   * Close preferences modal
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      setTimeout(() => {
        this.modal.remove();
        this.modal = null;
      }, 300);
    }
  }
}

// Initialize
const notificationPreferences = new NotificationPreferences();
const notificationPreferencesUI = new NotificationPreferencesUI(notificationPreferences);

// Expose to window
window.notificationPreferences = notificationPreferences;
window.notificationPreferencesUI = notificationPreferencesUI;

console.log('[Preferences] Notification Preferences Manager initialized');
