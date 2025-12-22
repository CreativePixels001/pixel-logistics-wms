// Logistics Templates Manager
// Handles loading and managing audit templates

const LogisticsTemplates = {
    // Template base path
    TEMPLATE_PATH: '../templates/',
    
    // Template registry
    templates: {
        warehouse: [
            { id: 'warehouse-safety', name: 'Warehouse Safety Audit', file: 'warehouse-safety.json', items: 50 },
            { id: 'warehouse-process', name: 'Warehouse Process Audit', file: 'warehouse-process.json', items: 45 },
            { id: 'fire-safety', name: 'Fire Safety Audit', file: 'fire-safety.json', items: 30 },
            { id: 'loading-unloading', name: 'Loading & Unloading Safety', file: 'loading-unloading.json', items: 26 },
            { id: 'packaging', name: 'Packaging Quality Audit', file: 'packaging.json', items: 32 }
        ],
        driver: [
            { id: 'driver-compliance', name: 'Driver Compliance Audit', file: 'driver-compliance.json', items: 40 },
            { id: 'driver-safety', name: 'Driver Safety Audit', file: 'driver-safety.json', items: 28 }
        ],
        vehicle: [
            { id: 'vehicle-inspection', name: 'Vehicle Inspection Audit', file: 'vehicle-inspection.json', items: 38 },
            { id: 'tyre-brake', name: 'Tyre & Brake Safety Audit', file: 'tyre-brake.json', items: 22 }
        ],
        trip: [
            { id: 'trip-safety', name: 'Trip Safety Audit', file: 'trip-safety.json', items: 25 },
            { id: 'trip-compliance', name: 'Trip Compliance Audit', file: 'trip-compliance.json', items: 18 }
        ]
    },
    
    // Get templates by category
    getTemplatesByCategory(category) {
        return this.templates[category] || [];
    },
    
    // Load template JSON file
    async loadTemplate(fileName) {
        try {
            const response = await fetch(this.TEMPLATE_PATH + fileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`✅ Template loaded: ${fileName}`);
            return data;
        } catch (error) {
            console.error(`❌ Error loading template ${fileName}:`, error);
            return null;
        }
    },
    
    // Get template by ID
    async getTemplateById(templateId) {
        // Find template in registry
        let templateInfo = null;
        for (const category in this.templates) {
            const found = this.templates[category].find(t => t.id === templateId);
            if (found) {
                templateInfo = found;
                break;
            }
        }
        
        if (!templateInfo) {
            console.error(`Template not found: ${templateId}`);
            return null;
        }
        
        // Load template data
        return await this.loadTemplate(templateInfo.file);
    },
    
    // Get all templates (flat list)
    getAllTemplates() {
        const all = [];
        for (const category in this.templates) {
            all.push(...this.templates[category].map(t => ({
                ...t,
                category
            })));
        }
        return all;
    },
    
    // Search templates
    searchTemplates(query) {
        const all = this.getAllTemplates();
        const lowerQuery = query.toLowerCase();
        return all.filter(t => 
            t.name.toLowerCase().includes(lowerQuery) ||
            t.category.toLowerCase().includes(lowerQuery)
        );
    },
    
    // Get template icon
    getTemplateIcon(category) {
        const icons = {
            warehouse: `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>`,
            driver: `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="9"/>
                <line x1="12" y1="15" x2="12" y2="22"/>
            </svg>`,
            vehicle: `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>`,
            trip: `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`
        };
        return icons[category] || icons.warehouse;
    },
    
    // Calculate template completion time estimate
    getEstimatedTime(itemCount) {
        // Assume 1-2 minutes per item on average
        const minutes = Math.ceil(itemCount * 1.5);
        if (minutes < 60) {
            return `~${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        return remainingMins > 0 ? `~${hours}h ${remainingMins}m` : `~${hours}h`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogisticsTemplates;
}
