// Create Audit Module
// Handles audit creation, assignment, and WhatsApp integration

const CreateAudit = {
    init() {
        this.setupEventListeners();
        this.loadURLParams();
        console.log('✅ Create Audit initialized');
    },
    
    setupEventListeners() {
        // Category change
        document.getElementById('category').addEventListener('change', (e) => {
            this.loadTemplates(e.target.value);
        });
        
        // Template change
        document.getElementById('template').addEventListener('change', (e) => {
            this.showTemplatePreview(e.target.value);
        });
        
        // Form submission
        document.getElementById('createAuditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createAudit();
        });
    },
    
    loadURLParams() {
        const params = new URLSearchParams(window.location.search);
        const templateId = params.get('template');
        
        if (templateId) {
            // Find category for this template
            const templates = LogisticsTemplates.getAllTemplates();
            const template = templates.find(t => t.id === templateId);
            
            if (template) {
                document.getElementById('category').value = template.category;
                this.loadTemplates(template.category);
                setTimeout(() => {
                    document.getElementById('template').value = templateId;
                    this.showTemplatePreview(templateId);
                }, 100);
            }
        }
    },
    
    loadTemplates(category) {
        const templateSelect = document.getElementById('template');
        const templates = LogisticsTemplates.getTemplatesByCategory(category);
        
        if (templates.length === 0) {
            templateSelect.disabled = true;
            templateSelect.innerHTML = '<option value="">No templates available</option>';
            return;
        }
        
        templateSelect.disabled = false;
        templateSelect.innerHTML = '<option value="">Select Template</option>';
        
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = `${template.name} (${template.items} items)`;
            templateSelect.appendChild(option);
        });
    },
    
    async showTemplatePreview(templateId) {
        if (!templateId) {
            document.getElementById('templatePreview').style.display = 'none';
            return;
        }
        
        const templates = LogisticsTemplates.getAllTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) return;
        
        const preview = document.getElementById('templatePreview');
        const estimatedTime = LogisticsTemplates.getEstimatedTime(template.items);
        
        // Load full template to count critical items
        const fullTemplate = await LogisticsTemplates.loadTemplate(template.file);
        const criticalCount = fullTemplate ? fullTemplate.items.filter(i => i.critical).length : 0;
        const photoCount = fullTemplate ? fullTemplate.items.filter(i => i.photo_required).length : 0;
        
        preview.innerHTML = `
            <div class="template-preview-title">📋 ${template.name}</div>
            <div class="template-preview-stats">
                <div class="preview-stat">
                    <div class="preview-stat-value">${template.items}</div>
                    <div class="preview-stat-label">Total Items</div>
                </div>
                <div class="preview-stat">
                    <div class="preview-stat-value">${criticalCount}</div>
                    <div class="preview-stat-label">Critical</div>
                </div>
                <div class="preview-stat">
                    <div class="preview-stat-value">${estimatedTime}</div>
                    <div class="preview-stat-label">Estimated Time</div>
                </div>
            </div>
        `;
        preview.style.display = 'block';
    },
    
    createAudit() {
        // Get form data
        const formData = {
            id: 'AUDIT-' + Date.now(),
            templateId: document.getElementById('template').value,
            templateName: document.getElementById('template').options[document.getElementById('template').selectedIndex].text.split(' (')[0],
            category: document.getElementById('category').value,
            clientName: document.getElementById('clientName').value,
            location: document.getElementById('location').value,
            auditorId: document.getElementById('auditor').value,
            auditorName: document.getElementById('auditor').options[document.getElementById('auditor').selectedIndex].text,
            dueDate: document.getElementById('dueDate').value,
            notes: document.getElementById('notes').value,
            status: 'assigned',
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('pixelaudit_user_name') || 'Admin'
        };
        
        // Save to localStorage
        this.saveAudit(formData);
        
        // Generate audit link
        const auditLink = `${window.location.origin}/frontend/PixelAudit/modules/logistics/pages/mobile-audit.html?id=${formData.id}`;
        
        // Generate WhatsApp message
        const whatsappMessage = this.generateWhatsAppMessage(formData, auditLink);
        const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Show success modal
        this.showSuccessModal(formData, auditLink, whatsappLink);
    },
    
    saveAudit(audit) {
        const STORAGE_KEY = 'pixelaudit_logistics_audits';
        let audits = [];
        
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            audits = JSON.parse(data);
        }
        
        audits.push(audit);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
        
        console.log('✅ Audit saved:', audit.id);
    },
    
    generateWhatsAppMessage(audit, link) {
        return `*New Audit Assignment* 📋

*Template:* ${audit.templateName}
*Client:* ${audit.clientName}
*Location:* ${audit.location}
*Due Date:* ${new Date(audit.dueDate).toLocaleDateString()}

${audit.notes ? `*Instructions:*\n${audit.notes}\n\n` : ''}*Complete Audit Here:*
${link}

_Sent via PixelAudit_`;
    },
    
    showSuccessModal(audit, auditLink, whatsappLink) {
        const modal = document.getElementById('successModal');
        const message = document.getElementById('successMessage');
        const linkBox = document.getElementById('auditLinkBox');
        const whatsappBtn = document.getElementById('whatsappLink');
        
        if (audit.auditorId === 'self') {
            message.textContent = 'You can now start the audit immediately.';
            whatsappBtn.style.display = 'none';
        } else {
            message.textContent = `Audit assigned to ${audit.auditorName}. Share the link via WhatsApp.`;
            whatsappBtn.href = whatsappLink;
            whatsappBtn.style.display = 'inline-block';
        }
        
        linkBox.textContent = auditLink;
        modal.classList.add('show');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreateAudit;
}
