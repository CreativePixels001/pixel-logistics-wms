/**
 * Server Management Module
 * Handles Add Server wizard with 5-step flow
 */

// Wizard state
let wizardState = {
    currentStep: 1,
    provider: '',
    serverName: '',
    region: '',
    size: '',
    ip: '',
    hostname: '',
    authMethod: 'sshkey',
    sshKey: '',
    sshUsername: 'root',
    sshPassword: '',
    sshPort: 22,
    webServer: 'nginx',
    databases: [],
    languages: [],
    tools: ['docker', 'git', 'ufw']
};

// Provider templates
const providerTemplates = {
    aws: {
        name: 'Amazon AWS',
        regions: [
            { value: 'us-east-1', label: 'US East (N. Virginia)' },
            { value: 'us-west-2', label: 'US West (Oregon)' },
            { value: 'eu-west-1', label: 'EU (Ireland)' },
            { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' }
        ],
        sizes: [
            { value: 't2.micro', label: 't2.micro - 1 vCPU, 1 GB RAM', price: '$8.50/mo' },
            { value: 't3.small', label: 't3.small - 2 vCPU, 2 GB RAM', price: '$15.20/mo' },
            { value: 't3.medium', label: 't3.medium - 2 vCPU, 4 GB RAM', price: '$30.40/mo' },
            { value: 't3.large', label: 't3.large - 2 vCPU, 8 GB RAM', price: '$60.80/mo' }
        ]
    },
    azure: {
        name: 'Microsoft Azure',
        regions: [
            { value: 'eastus', label: 'East US' },
            { value: 'westus', label: 'West US' },
            { value: 'westeurope', label: 'West Europe' },
            { value: 'southeastasia', label: 'Southeast Asia' }
        ],
        sizes: [
            { value: 'Standard_B1s', label: 'Standard_B1s - 1 vCPU, 1 GB RAM', price: '$7.59/mo' },
            { value: 'Standard_B2s', label: 'Standard_B2s - 2 vCPU, 4 GB RAM', price: '$30.37/mo' },
            { value: 'Standard_D2s_v3', label: 'Standard_D2s_v3 - 2 vCPU, 8 GB RAM', price: '$70.08/mo' }
        ]
    },
    digitalocean: {
        name: 'DigitalOcean',
        regions: [
            { value: 'nyc1', label: 'New York 1' },
            { value: 'nyc3', label: 'New York 3' },
            { value: 'sfo3', label: 'San Francisco 3' },
            { value: 'ams3', label: 'Amsterdam 3' },
            { value: 'sgp1', label: 'Singapore 1' }
        ],
        sizes: [
            { value: '1gb', label: '1 GB - 1 vCPU, 25 GB SSD', price: '$6/mo' },
            { value: '2gb', label: '2 GB - 1 vCPU, 50 GB SSD', price: '$12/mo' },
            { value: '4gb', label: '4 GB - 2 vCPU, 80 GB SSD', price: '$24/mo' },
            { value: '8gb', label: '8 GB - 4 vCPU, 160 GB SSD', price: '$48/mo' }
        ]
    },
    linode: {
        name: 'Linode',
        regions: [
            { value: 'us-east', label: 'Newark, NJ' },
            { value: 'us-west', label: 'Fremont, CA' },
            { value: 'eu-west', label: 'London, UK' },
            { value: 'ap-south', label: 'Singapore, SG' }
        ],
        sizes: [
            { value: 'nanode-1', label: 'Nanode 1 GB - 1 vCPU, 25 GB SSD', price: '$5/mo' },
            { value: 'linode-2', label: 'Linode 2 GB - 1 vCPU, 50 GB SSD', price: '$10/mo' },
            { value: 'linode-4', label: 'Linode 4 GB - 2 vCPU, 80 GB SSD', price: '$20/mo' },
            { value: 'linode-8', label: 'Linode 8 GB - 4 vCPU, 160 GB SSD', price: '$40/mo' }
        ]
    },
    vultr: {
        name: 'Vultr',
        regions: [
            { value: 'ewr', label: 'New Jersey' },
            { value: 'sea', label: 'Seattle' },
            { value: 'lhr', label: 'London' },
            { value: 'sgp', label: 'Singapore' }
        ],
        sizes: [
            { value: 'vc2-1c-1gb', label: '1 GB - 1 vCPU, 25 GB SSD', price: '$6/mo' },
            { value: 'vc2-1c-2gb', label: '2 GB - 1 vCPU, 55 GB SSD', price: '$12/mo' },
            { value: 'vc2-2c-4gb', label: '4 GB - 2 vCPU, 80 GB SSD', price: '$24/mo' },
            { value: 'vc2-4c-8gb', label: '8 GB - 4 vCPU, 160 GB SSD', price: '$48/mo' }
        ]
    },
    custom: {
        name: 'Custom VPS',
        regions: [],
        sizes: []
    }
};

// Initialize wizard
document.addEventListener('DOMContentLoaded', function() {
    initServerWizard();
});

function initServerWizard() {
    // Provider selection
    document.querySelectorAll('.provider-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            wizardState.provider = this.dataset.provider;
        });
    });

    // Wizard navigation
    document.getElementById('wizardNextBtn').addEventListener('click', handleNext);
    document.getElementById('wizardBackBtn').addEventListener('click', handleBack);
    document.getElementById('wizardDeployBtn').addEventListener('click', handleDeploy);

    // Authentication method toggle
    document.querySelectorAll('input[name="authMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            wizardState.authMethod = this.value;
            document.getElementById('sshKeySection').style.display = 
                this.value === 'sshkey' ? 'block' : 'none';
            document.getElementById('passwordSection').style.display = 
                this.value === 'password' ? 'block' : 'none';
        });
    });

    // SSH Key generation toggle
    document.getElementById('generateSSHKeyBtn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('uploadSSHKeyBtn').classList.remove('active');
        document.getElementById('uploadKeyField').style.display = 'none';
        document.getElementById('generateKeyField').style.display = 'block';
        generateSSHKeyPair();
    });

    document.getElementById('uploadSSHKeyBtn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('generateSSHKeyBtn').classList.remove('active');
        document.getElementById('generateKeyField').style.display = 'none';
        document.getElementById('uploadKeyField').style.display = 'block';
    });

    // Download private key
    document.getElementById('downloadPrivateKeyBtn').addEventListener('click', downloadPrivateKey);

    // Software stack changes
    document.querySelectorAll('#step4 input[type="checkbox"], #step4 input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateEstimatedTime);
    });

    // Reset wizard on modal close
    document.getElementById('addServerModal').addEventListener('hidden.bs.modal', resetWizard);
}

function handleNext() {
    // Validate current step
    if (!validateStep(wizardState.currentStep)) {
        return;
    }

    // Save current step data
    saveStepData(wizardState.currentStep);

    // Move to next step
    if (wizardState.currentStep < 5) {
        wizardState.currentStep++;
        updateWizardUI();
    }
}

function handleBack() {
    if (wizardState.currentStep > 1) {
        wizardState.currentStep--;
        updateWizardUI();
    }
}

async function handleDeploy() {
    const deployBtn = document.getElementById('wizardDeployBtn');
    const originalText = deployBtn.innerHTML;
    
    deployBtn.disabled = true;
    deployBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deploying...';

    // Show deployment progress
    document.getElementById('deploymentProgress').style.display = 'block';

    // Simulate deployment process
    await simulateDeployment();

    // Success
    showSuccess('Server deployed successfully!');
    
    setTimeout(() => {
        bootstrap.Modal.getInstance(document.getElementById('addServerModal')).hide();
        deployBtn.disabled = false;
        deployBtn.innerHTML = originalText;
    }, 2000);
}

function validateStep(step) {
    switch(step) {
        case 1:
            if (!wizardState.provider) {
                showError('Please select a provider');
                return false;
            }
            return true;
        
        case 2:
            const serverName = document.getElementById('serverName').value.trim();
            if (!serverName) {
                showError('Please enter a server name');
                return false;
            }
            
            // Validate server name format
            if (!/^[a-z0-9-]+$/.test(serverName)) {
                showError('Server name can only contain lowercase letters, numbers, and hyphens');
                return false;
            }
            return true;
        
        case 3:
            if (wizardState.authMethod === 'sshkey') {
                const sshKey = document.getElementById('sshPublicKey').value.trim();
                const generatedKey = document.getElementById('generatedPublicKey').value.trim();
                if (!sshKey && !generatedKey) {
                    showError('Please provide an SSH public key or generate a new one');
                    return false;
                }
            } else {
                const password = document.getElementById('sshPassword').value;
                if (!password) {
                    showError('Please enter an SSH password');
                    return false;
                }
            }
            return true;
        
        case 4:
            return true; // Software selection is optional
        
        case 5:
            return true;
        
        default:
            return true;
    }
}

function saveStepData(step) {
    switch(step) {
        case 1:
            // Provider already saved on click
            break;
        
        case 2:
            wizardState.serverName = document.getElementById('serverName').value.trim();
            wizardState.ip = document.getElementById('serverIP').value.trim();
            wizardState.hostname = document.getElementById('serverHostname').value.trim();
            
            // Save provider-specific fields
            const regionSelect = document.getElementById('serverRegion');
            const sizeSelect = document.getElementById('serverSize');
            if (regionSelect) wizardState.region = regionSelect.value;
            if (sizeSelect) wizardState.size = sizeSelect.value;
            break;
        
        case 3:
            wizardState.authMethod = document.querySelector('input[name="authMethod"]:checked').value;
            if (wizardState.authMethod === 'sshkey') {
                const uploadedKey = document.getElementById('sshPublicKey').value.trim();
                const generatedKey = document.getElementById('generatedPublicKey').value.trim();
                wizardState.sshKey = uploadedKey || generatedKey;
            } else {
                wizardState.sshUsername = document.getElementById('sshUsername').value;
                wizardState.sshPassword = document.getElementById('sshPassword').value;
            }
            wizardState.sshPort = document.getElementById('sshPort').value;
            break;
        
        case 4:
            wizardState.webServer = document.querySelector('input[name="webserver"]:checked').value;
            
            wizardState.databases = [];
            document.querySelectorAll('#step4 input[type="checkbox"][id^="db"]:checked').forEach(cb => {
                wizardState.databases.push(cb.value);
            });
            
            wizardState.languages = [];
            document.querySelectorAll('#step4 input[type="checkbox"][id^="lang"]:checked').forEach(cb => {
                wizardState.languages.push(cb.value);
            });
            
            wizardState.tools = [];
            document.querySelectorAll('#step4 input[type="checkbox"][id^="tool"]:checked').forEach(cb => {
                wizardState.tools.push(cb.value);
            });
            break;
    }
}

function updateWizardUI() {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.style.display = 'none';
    });

    // Show current step
    document.getElementById(`step${wizardState.currentStep}`).style.display = 'block';

    // Update progress
    const progress = (wizardState.currentStep / 5) * 100;
    document.getElementById('wizardProgress').style.width = `${progress}%`;
    document.getElementById('currentStep').textContent = wizardState.currentStep;

    // Update step title
    const titles = ['Choose Provider', 'Configure Details', 'Setup Authentication', 'Select Software', 'Review & Deploy'];
    document.getElementById('stepTitle').textContent = titles[wizardState.currentStep - 1];

    // Update buttons
    document.getElementById('wizardBackBtn').style.display = wizardState.currentStep > 1 ? 'inline-block' : 'none';
    document.getElementById('wizardNextBtn').style.display = wizardState.currentStep < 5 ? 'inline-block' : 'none';
    document.getElementById('wizardDeployBtn').style.display = wizardState.currentStep === 5 ? 'inline-block' : 'none';

    // Special handling for each step
    if (wizardState.currentStep === 2) {
        loadProviderFields();
    } else if (wizardState.currentStep === 5) {
        loadReviewData();
    }
}

function loadProviderFields() {
    const provider = providerTemplates[wizardState.provider];
    const container = document.getElementById('providerFields');
    
    if (!provider || wizardState.provider === 'custom') {
        container.innerHTML = `
            <div class="col-12 mb-3">
                <label for="customProvider" class="form-label">Provider Name</label>
                <input type="text" class="form-control" id="customProvider" placeholder="e.g., OVH, Hetzner">
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="col-md-6 mb-3">
            <label for="serverRegion" class="form-label">Region / Location</label>
            <select class="form-select" id="serverRegion" required>
                <option value="">Select region...</option>
                ${provider.regions.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-6 mb-3">
            <label for="serverSize" class="form-label">Server Size / Plan</label>
            <select class="form-select" id="serverSize" required>
                <option value="">Select size...</option>
                ${provider.sizes.map(s => `<option value="${s.value}">${s.label} - ${s.price}</option>`).join('')}
            </select>
        </div>
    `;
}

function loadReviewData() {
    // Provider info
    document.getElementById('reviewProvider').textContent = 
        providerTemplates[wizardState.provider]?.name || wizardState.provider.toUpperCase();
    
    document.getElementById('reviewServerName').textContent = wizardState.serverName;
    document.getElementById('reviewIP').textContent = wizardState.ip || 'Auto-assigned';
    document.getElementById('reviewAuth').textContent = 
        wizardState.authMethod === 'sshkey' ? 'SSH Key' : 'Password';
    document.getElementById('reviewSSHPort').textContent = wizardState.sshPort;

    // Software stack
    document.getElementById('reviewWebServer').textContent = 
        wizardState.webServer === 'none' ? 'None' : wizardState.webServer.toUpperCase();
    
    document.getElementById('reviewDatabases').textContent = 
        wizardState.databases.length > 0 ? wizardState.databases.join(', ').toUpperCase() : 'None';
    
    document.getElementById('reviewLanguages').textContent = 
        wizardState.languages.length > 0 ? wizardState.languages.map(l => {
            if (l === 'nodejs') return 'Node.js';
            if (l === 'php') return 'PHP';
            return l.charAt(0).toUpperCase() + l.slice(1);
        }).join(', ') : 'None';
    
    document.getElementById('reviewTools').textContent = 
        wizardState.tools.length > 0 ? wizardState.tools.map(t => t.toUpperCase()).join(', ') : 'None';
}

function generateSSHKeyPair() {
    // Simulate SSH key generation (in production, this would be done on backend)
    setTimeout(() => {
        const publicKey = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDZx${Math.random().toString(36).substring(2, 15)}... pixelcloud@generated`;
        document.getElementById('generatedPublicKey').value = publicKey;
        document.getElementById('generatedKeyDisplay').style.display = 'block';
        showSuccess('SSH key pair generated successfully!');
    }, 500);
}

function downloadPrivateKey() {
    const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIJKAIBAAKCAgEA2cf${Math.random().toString(36).substring(2, 50)}...
-----END RSA PRIVATE KEY-----`;
    
    const blob = new Blob([privateKey], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wizardState.serverName || 'pixelcloud'}_id_rsa`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showWarning('⚠️ Keep your private key safe! You will need it to access the server.');
}

function updateEstimatedTime() {
    let minutes = 3; // Base time
    
    // Add time for each component
    const webServer = document.querySelector('input[name="webserver"]:checked').value;
    if (webServer !== 'none') minutes += 1;
    
    const dbCount = document.querySelectorAll('#step4 input[type="checkbox"][id^="db"]:checked').length;
    minutes += dbCount * 2;
    
    const langCount = document.querySelectorAll('#step4 input[type="checkbox"][id^="lang"]:checked').length;
    minutes += langCount * 1.5;
    
    const toolCount = document.querySelectorAll('#step4 input[type="checkbox"][id^="tool"]:checked').length;
    minutes += toolCount * 0.5;
    
    const minTime = Math.floor(minutes);
    const maxTime = Math.ceil(minutes + 2);
    
    document.getElementById('estimatedTime').textContent = `${minTime}-${maxTime} minutes`;
}

async function simulateDeployment() {
    const logs = document.getElementById('deploymentLogs');
    const progress = document.getElementById('deployProgress');
    
    const steps = [
        { message: 'Connecting to server...', percent: 10, delay: 800 },
        { message: 'Verifying SSH access...', percent: 20, delay: 1000 },
        { message: 'Updating package repositories...', percent: 30, delay: 1200 },
        { message: `Installing ${wizardState.webServer}...`, percent: 45, delay: 1500 },
        { message: 'Configuring firewall (UFW)...', percent: 60, delay: 1000 },
        { message: 'Installing databases...', percent: 75, delay: 1800 },
        { message: 'Setting up deployment user...', percent: 85, delay: 800 },
        { message: 'Configuring SSH keys...', percent: 92, delay: 600 },
        { message: 'Running security hardening...', percent: 98, delay: 700 },
        { message: 'Deployment complete! ✓', percent: 100, delay: 500, success: true }
    ];

    for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        
        const time = new Date().toLocaleTimeString();
        const logClass = step.success ? 'log-success' : 'log-info';
        
        logs.innerHTML += `
            <div class="log-entry">
                <span class="log-time">[${time}]</span>
                <span class="${logClass}">${step.message}</span>
            </div>
        `;
        
        progress.style.width = `${step.percent}%`;
        progress.textContent = `${step.percent}%`;
        
        logs.scrollTop = logs.scrollHeight;
    }
}

function resetWizard() {
    wizardState = {
        currentStep: 1,
        provider: '',
        serverName: '',
        region: '',
        size: '',
        ip: '',
        hostname: '',
        authMethod: 'sshkey',
        sshKey: '',
        sshUsername: 'root',
        sshPassword: '',
        sshPort: 22,
        webServer: 'nginx',
        databases: [],
        languages: [],
        tools: ['docker', 'git', 'ufw']
    };

    // Reset UI
    document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('serverName').value = '';
    document.getElementById('serverIP').value = '';
    document.getElementById('serverHostname').value = '';
    document.getElementById('sshPublicKey').value = '';
    document.getElementById('generatedPublicKey').value = '';
    document.getElementById('generatedKeyDisplay').style.display = 'none';
    document.getElementById('deploymentProgress').style.display = 'none';
    document.getElementById('deploymentLogs').innerHTML = '';
    
    updateWizardUI();
}
