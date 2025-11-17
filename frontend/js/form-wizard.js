/**
 * Form Wizard Framework
 * Reusable multi-step wizard component with validation and auto-save
 */

class FormWizard {
  constructor(options) {
    this.formId = options.formId;
    this.steps = options.steps || [];
    this.currentStep = 0;
    this.formData = {};
    this.autoSaveKey = options.autoSaveKey || 'formWizard_draft';
    this.autoSaveInterval = options.autoSaveInterval || 30000; // 30 seconds
    this.onComplete = options.onComplete || (() => {});
    this.onStepChange = options.onStepChange || (() => {});
    
    this.init();
  }

  init() {
    this.loadDraft();
    this.setupEventListeners();
    this.startAutoSave();
    this.renderStep();
    this.updateProgress();
    this.setupUnsavedWarning();
  }

  setupEventListeners() {
    // Next button
    document.getElementById('wizardNext')?.addEventListener('click', () => {
      this.nextStep();
    });

    // Previous button
    document.getElementById('wizardPrev')?.addEventListener('click', () => {
      this.previousStep();
    });

    // Submit button
    document.getElementById('wizardSubmit')?.addEventListener('click', () => {
      this.submit();
    });

    // Save draft button
    document.getElementById('saveDraft')?.addEventListener('click', () => {
      this.saveDraft();
      this.showNotification('Draft saved successfully', 'success');
    });

    // Cancel button
    document.getElementById('wizardCancel')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        this.clearDraft();
        window.location.href = 'orders.html';
      }
    });

    // Form field changes
    document.querySelectorAll('.wizard-form input, .wizard-form select, .wizard-form textarea').forEach(field => {
      field.addEventListener('change', () => {
        this.captureFormData();
      });
    });
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.captureFormData();
      
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.renderStep();
        this.updateProgress();
        this.onStepChange(this.currentStep);
        this.scrollToTop();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.captureFormData();
      this.currentStep--;
      this.renderStep();
      this.updateProgress();
      this.onStepChange(this.currentStep);
      this.scrollToTop();
    }
  }

  validateCurrentStep() {
    const stepElement = document.getElementById(`step${this.currentStep + 1}`);
    if (!stepElement) return true;

    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(field => {
      this.clearFieldError(field);
      
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
        if (!firstInvalidField) firstInvalidField = field;
      } else if (field.type === 'email' && !this.validateEmail(field.value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
        if (!firstInvalidField) firstInvalidField = field;
      } else if (field.type === 'number') {
        const min = field.min ? parseFloat(field.min) : null;
        const max = field.max ? parseFloat(field.max) : null;
        const value = parseFloat(field.value);
        
        if (min !== null && value < min) {
          this.showFieldError(field, `Value must be at least ${min}`);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = field;
        } else if (max !== null && value > max) {
          this.showFieldError(field, `Value must not exceed ${max}`);
          isValid = false;
          if (!firstInvalidField) firstInvalidField = field;
        }
      }
    });

    // Custom validation for specific steps
    if (this.currentStep === 1) {
      isValid = this.validateOrderLines() && isValid;
    }

    if (!isValid && firstInvalidField) {
      firstInvalidField.focus();
    }

    return isValid;
  }

  validateOrderLines() {
    const orderLines = this.formData.orderLines || [];
    
    if (orderLines.length === 0) {
      this.showNotification('Please add at least one order line', 'error');
      return false;
    }

    return true;
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  captureFormData() {
    const stepElement = document.getElementById(`step${this.currentStep + 1}`);
    if (!stepElement) return;

    const inputs = stepElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          this.formData[input.name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) {
            this.formData[input.name] = input.value;
          }
        } else {
          this.formData[input.name] = input.value;
        }
      }
    });
  }

  renderStep() {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
      step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.getElementById(`step${this.currentStep + 1}`);
    if (currentStepElement) {
      currentStepElement.classList.add('active');
    }

    // Update buttons
    this.updateButtons();

    // Populate fields with saved data
    this.populateFields();
  }

  populateFields() {
    const stepElement = document.getElementById(`step${this.currentStep + 1}`);
    if (!stepElement) return;

    const inputs = stepElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.name && this.formData[input.name] !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = this.formData[input.name];
        } else if (input.type === 'radio') {
          input.checked = input.value === this.formData[input.name];
        } else {
          input.value = this.formData[input.name];
        }
      }
    });
  }

  updateButtons() {
    const prevBtn = document.getElementById('wizardPrev');
    const nextBtn = document.getElementById('wizardNext');
    const submitBtn = document.getElementById('wizardSubmit');

    if (prevBtn) {
      prevBtn.style.display = this.currentStep === 0 ? 'none' : 'inline-block';
    }

    if (this.currentStep === this.steps.length - 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-block';
      if (submitBtn) submitBtn.style.display = 'none';
    }
  }

  updateProgress() {
    const progressBar = document.querySelector('.wizard-progress-fill');
    const progressText = document.querySelector('.wizard-progress-text');
    const stepIndicators = document.querySelectorAll('.step-indicator');

    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;
    }

    // Update step indicators
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove('active', 'completed');
      
      if (index < this.currentStep) {
        indicator.classList.add('completed');
      } else if (index === this.currentStep) {
        indicator.classList.add('active');
      }
    });
  }

  submit() {
    if (this.validateCurrentStep()) {
      this.captureFormData();
      
      // Show confirmation
      if (confirm('Are you sure you want to submit this order?')) {
        this.onComplete(this.formData);
        this.clearDraft();
        this.hasUnsavedChanges = false;
      }
    }
  }

  saveDraft() {
    this.captureFormData();
    localStorage.setItem(this.autoSaveKey, JSON.stringify({
      formData: this.formData,
      currentStep: this.currentStep,
      timestamp: new Date().toISOString()
    }));
  }

  loadDraft() {
    const draft = localStorage.getItem(this.autoSaveKey);
    
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      const draftAge = new Date() - new Date(parsedDraft.timestamp);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (draftAge < maxAge) {
        if (confirm('A draft was found. Would you like to continue from where you left off?')) {
          this.formData = parsedDraft.formData || {};
          this.currentStep = parsedDraft.currentStep || 0;
        }
      } else {
        // Draft is too old, clear it
        this.clearDraft();
      }
    }
  }

  clearDraft() {
    localStorage.removeItem(this.autoSaveKey);
  }

  startAutoSave() {
    setInterval(() => {
      this.saveDraft();
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    }, this.autoSaveInterval);
  }

  setupUnsavedWarning() {
    this.hasUnsavedChanges = false;

    // Track changes
    document.querySelectorAll('.wizard-form input, .wizard-form select, .wizard-form textarea').forEach(field => {
      field.addEventListener('change', () => {
        this.hasUnsavedChanges = true;
      });
    });

    // Warn on navigation
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  scrollToTop() {
    const wizardContainer = document.querySelector('.wizard-container');
    if (wizardContainer) {
      wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add to page
    const container = document.querySelector('.notification-container') || document.body;
    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}
