/**
 * PixelCloud - Domain Manager
 * DNS zone editor and domain management
 */

let currentDomain = '';

// Open DNS editor for a specific domain
function openDNSEditor(domain) {
    currentDomain = domain;
    document.getElementById('dnsEditorDomain').textContent = domain;
    document.getElementById('dnsEditorCard').style.display = 'block';
    
    // Scroll to DNS editor
    document.getElementById('dnsEditorCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Load DNS records for this domain (mock data for now)
    loadDNSRecords(domain);
}

// Close DNS editor
function closeDNSEditor() {
    document.getElementById('dnsEditorCard').style.display = 'none';
    currentDomain = '';
}

// Load DNS records for domain
function loadDNSRecords(domain) {
    // Mock DNS records - in production, fetch from API
    const mockRecords = {
        'example.com': [
            { type: 'A', name: '@', value: '68.178.157.215', ttl: 3600 },
            { type: 'A', name: 'www', value: '68.178.157.215', ttl: 3600 },
            { type: 'CNAME', name: 'blog', value: 'example.com', ttl: 3600 },
            { type: 'MX', name: '@', value: '10 mail.example.com', ttl: 3600 },
            { type: 'TXT', name: '@', value: '"v=spf1 include:_spf.google.com ~all"', ttl: 3600 }
        ],
        'creativepixels.in': [
            { type: 'A', name: '@', value: '68.178.157.215', ttl: 3600 },
            { type: 'A', name: '*', value: '68.178.157.215', ttl: 3600 },
            { type: 'CNAME', name: 'www', value: 'creativepixels.in', ttl: 3600 },
            { type: 'TXT', name: '@', value: '"v=spf1 include:_spf.google.com ~all"', ttl: 3600 }
        ],
        'testsite.com': [
            { type: 'A', name: '@', value: '192.168.1.100', ttl: 3600 },
            { type: 'CNAME', name: 'www', value: 'testsite.com', ttl: 3600 }
        ]
    };

    const records = mockRecords[domain] || [];
    const tbody = document.querySelector('#dnsRecordsTable tbody');
    tbody.innerHTML = '';

    records.forEach((record, index) => {
        const row = createDNSRecordRow(record, index);
        tbody.appendChild(row);
    });

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No DNS records found. Add your first record above.</td></tr>';
    }
}

// Create table row for DNS record
function createDNSRecordRow(record, index) {
    const tr = document.createElement('tr');
    
    const typeBadgeClass = {
        'A': 'bg-dark',
        'AAAA': 'bg-dark',
        'CNAME': 'bg-secondary',
        'MX': 'bg-warning text-dark',
        'TXT': 'bg-success',
        'NS': 'bg-info',
        'SRV': 'bg-primary'
    };

    tr.innerHTML = `
        <td><span class="badge ${typeBadgeClass[record.type] || 'bg-secondary'}">${record.type}</span></td>
        <td>${record.name}</td>
        <td>${record.value}</td>
        <td>${record.ttl}</td>
        <td>
            <button class="btn btn-sm btn-outline-dark me-1" onclick="editDNSRecord(${index})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteDNSRecord(${index})">Delete</button>
        </td>
    `;
    
    return tr;
}

// Edit DNS record
function editDNSRecord(index) {
    showToast('Edit feature coming soon', 'info');
    console.log('Edit record:', index);
}

// Delete DNS record
function deleteDNSRecord(index) {
    if (confirm('Are you sure you want to delete this DNS record? This action cannot be undone.')) {
        showToast('DNS record deleted successfully', 'success');
        // In production: Make API call to delete record
        // Then reload the table
        setTimeout(() => loadDNSRecords(currentDomain), 500);
    }
}

// Add Domain button handler
document.addEventListener('DOMContentLoaded', () => {
    const addDomainBtn = document.getElementById('addDomainBtn');
    if (addDomainBtn) {
        addDomainBtn.addEventListener('click', () => {
            const domainName = document.getElementById('domainName').value.trim();
            const server = document.getElementById('domainServer').value;
            const rootPath = document.getElementById('domainRootPath').value.trim();
            const autoSSL = document.getElementById('autoSSL').checked;

            // Validation
            if (!domainName) {
                showToast('Please enter a domain name', 'error');
                return;
            }

            if (!server) {
                showToast('Please select a target server', 'error');
                return;
            }

            if (!rootPath) {
                showToast('Please enter a web root path', 'error');
                return;
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addDomainModal'));
            modal.hide();

            // Show success message
            showToast(`Domain ${domainName} added successfully!`, 'success');

            // In production: Make API call to add domain
            console.log('Add domain:', { domainName, server, rootPath, autoSSL });

            // Reset form
            document.getElementById('domainName').value = '';
            document.getElementById('domainServer').value = '';
            document.getElementById('domainRootPath').value = '';
            document.getElementById('autoSSL').checked = true;
        });
    }

    // Add DNS Record button handler
    const addDNSRecordBtn = document.getElementById('addDNSRecordBtn');
    if (addDNSRecordBtn) {
        addDNSRecordBtn.addEventListener('click', () => {
            const recordType = document.getElementById('dnsRecordType').value;
            const name = document.getElementById('dnsRecordName').value.trim();
            const value = document.getElementById('dnsRecordValue').value.trim();
            const ttl = document.getElementById('dnsRecordTTL').value;
            const priority = document.getElementById('dnsRecordPriority').value;

            // Validation
            if (!name) {
                showToast('Please enter a record name', 'error');
                return;
            }

            if (!value) {
                showToast('Please enter a record value', 'error');
                return;
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addDNSRecordModal'));
            modal.hide();

            // Show success message
            showToast(`DNS ${recordType} record added successfully!`, 'success');

            // In production: Make API call to add DNS record
            console.log('Add DNS record:', { type: recordType, name, value, ttl, priority });

            // Reload DNS records
            setTimeout(() => loadDNSRecords(currentDomain), 500);

            // Reset form
            document.getElementById('dnsRecordType').value = 'A';
            document.getElementById('dnsRecordName').value = '';
            document.getElementById('dnsRecordValue').value = '';
            document.getElementById('dnsRecordTTL').value = '3600';
            document.getElementById('dnsRecordPriority').value = '10';
        });
    }

    // DNS record type change handler (show/hide priority field for MX records)
    const dnsRecordType = document.getElementById('dnsRecordType');
    if (dnsRecordType) {
        dnsRecordType.addEventListener('change', (e) => {
            const priorityField = document.getElementById('dnsPriorityField');
            const valueHint = document.getElementById('dnsValueHint');
            
            if (e.target.value === 'MX') {
                priorityField.style.display = 'block';
                valueHint.textContent = 'Enter mail server hostname (e.g., mail.example.com)';
            } else {
                priorityField.style.display = 'none';
                
                // Update hints based on record type
                const hints = {
                    'A': 'Enter the target IPv4 address',
                    'AAAA': 'Enter the target IPv6 address',
                    'CNAME': 'Enter the target hostname',
                    'TXT': 'Enter text value (use quotes for SPF/DKIM)',
                    'NS': 'Enter nameserver hostname',
                    'SRV': 'Enter service target'
                };
                valueHint.textContent = hints[e.target.value] || 'Enter the record value';
            }
        });
    }
});
