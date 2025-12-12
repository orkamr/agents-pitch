// Default color presets
const COLOR_PRESETS = {
    simple: { bg: '#fef08a', border: '#eab308', text: '#854d0e' },
    advanced: { bg: '#fed7aa', border: '#f97316', text: '#9a3412' },
    tbd: { bg: '#fca5a5', border: '#ef4444', text: '#991b1b' }
};

// Configuration data - reorganized structure
let CONFIG_DATA = {
    areas: {
        'data-sources': {
            name: 'Data Sources',
            icon: 'fa-database',
            required: false,
            description: 'What information can the agent access?'
        },
        'tools': {
            name: 'Tools & Capabilities',
            icon: 'fa-tools',
            required: true,
            description: 'What can the agent do?'
        },
        'workflow': {
            name: 'Agent Workflow',
            icon: 'fa-project-diagram',
            required: true,
            description: 'How does the agent reason?'
        },
        'ui-integration': {
            name: 'User Interface',
            icon: 'fa-desktop',
            required: true,
            description: 'How will users interact?'
        }
    },
    options: {
        // Data Sources
        'sharepoint': { name: 'SharePoint', icon: 'fab fa-microsoft', area: 'data-sources', level: 'simple', time: 40, cost: 50000, color: null },
        'blob-files': { name: 'Blob / Files', icon: 'fas fa-cloud', area: 'data-sources', level: 'simple', time: 40, cost: 50000, color: null },
        'uploads': { name: 'Uploads', icon: 'fas fa-upload', area: 'data-sources', level: 'simple', time: 40, cost: 50000, color: null },
        'apis': { name: 'APIs', icon: 'fas fa-plug', area: 'data-sources', level: 'advanced', time: 80, cost: 100000, color: null },
        'other-sources': { name: 'Other', icon: 'fas fa-ellipsis-h', area: 'data-sources', level: 'advanced', time: 80, cost: 100000, color: null },

        // Tools & Capabilities
        'prompt': { name: 'Instructions', icon: 'fas fa-comment-dots', area: 'tools', level: 'simple', time: 40, cost: 50000, color: null, alwaysOn: true },
        'retrieval': { name: 'Retrieval (RAG)', icon: 'fas fa-search', area: 'tools', level: 'simple', time: 40, cost: 50000, color: null },
        'employee-search': { name: 'Employee Search', icon: 'fas fa-user-tie', area: 'tools', level: 'simple', time: 40, cost: 50000, color: null },
        'docuscan': { name: 'DocuScan', icon: 'fas fa-file-alt', area: 'tools', level: 'simple', time: 40, cost: 50000, color: null },
        'multimodal': { name: 'Multimodal', icon: 'fas fa-images', area: 'tools', level: 'advanced', time: 80, cost: 100000, color: null },
        'code-execution': { name: 'Data Analysis', icon: 'fas fa-code', area: 'tools', level: 'advanced', time: 80, cost: 100000, color: null },
        'custom-tools': { name: 'Custom Tools', icon: 'fas fa-wrench', area: 'tools', level: 'tbd', time: 160, cost: 200000, color: null },

        // Workflow
        'simple-flow': { name: 'Simple Agent', icon: 'fas fa-stream', area: 'workflow', level: 'simple', time: 40, cost: 50000, color: null },
        'advanced-flow': { name: 'Reflection Agent', icon: 'fas fa-project-diagram', area: 'workflow', level: 'advanced', time: 80, cost: 100000, color: null },
        'custom-flow': { name: 'Custom Agent', icon: 'fas fa-sitemap', area: 'workflow', level: 'tbd', time: 160, cost: 200000, color: null },

        // UI Integration
        'launchpad': { name: 'Launchpad', icon: 'fas fa-rocket', area: 'ui-integration', level: 'simple', time: 40, cost: 50000, color: null },
        'rest-api': { name: 'REST API', icon: 'fas fa-code', area: 'ui-integration', level: 'simple', time: 40, cost: 50000, color: null },
        'teams': { name: 'Teams', icon: 'fab fa-microsoft', area: 'ui-integration', level: 'tbd', time: 160, cost: 200000, color: null },
        'email': { name: 'Email', icon: 'fas fa-envelope', area: 'ui-integration', level: 'tbd', time: 160, cost: 200000, color: null },
        'custom-ui': { name: 'Custom UI', icon: 'fas fa-palette', area: 'ui-integration', level: 'tbd', time: 160, cost: 200000, color: null }
    }
};

// Required areas for validation
const REQUIRED_AREAS = ['tools', 'workflow', 'ui-integration'];

// State management
let state = {
    selectedOptions: new Map(),
    settings: {
        simple: { time: 40, cost: 50000 },
        advanced: { time: 80, cost: 100000 },
        tbd: { time: 160, cost: 200000 }
    }
};

// Get option's effective color
function getOptionColor(option) {
    if (option.color) {
        return option.color;
    }
    return COLOR_PRESETS[option.level];
}

// Get option's effective time/cost (individual or level default)
function getOptionTimeCost(option) {
    if (option.time !== undefined && option.time !== null) {
        return { time: option.time, cost: option.cost };
    }
    return state.settings[option.level];
}

// Load settings and options from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('AgentSettings');
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }

    const savedOptions = localStorage.getItem('AgentOptions');
    if (savedOptions) {
        CONFIG_DATA.options = JSON.parse(savedOptions);
        rebuildAllOptions();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('AgentSettings', JSON.stringify(state.settings));
}

// Save options to localStorage
function saveOptions() {
    localStorage.setItem('AgentOptions', JSON.stringify(CONFIG_DATA.options));
}

// Update settings inputs with current values
function updateSettingsInputs() {
    document.getElementById('simpleTime').value = state.settings.simple.time;
    document.getElementById('simpleCost').value = state.settings.simple.cost;
    document.getElementById('advancedTime').value = state.settings.advanced.time;
    document.getElementById('advancedCost').value = state.settings.advanced.cost;
    document.getElementById('tbdTime').value = state.settings.tbd.time;
    document.getElementById('tbdCost').value = state.settings.tbd.cost;
}

// Zoom and pan state
let viewState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    startX: 0,
    startY: 0
};

// Initialize the application
function init() {
    loadSettings();
    setupEventListeners();
    setupResizeHandles();
    setupCollapseButtons();
    setupZoomPan();

    // Auto-select prompt (always on)
    const promptBtn = document.querySelector('[data-option="prompt"]');
    if (promptBtn && !state.selectedOptions.has('prompt')) {
        state.selectedOptions.set('prompt', { level: 'simple', ...CONFIG_DATA.options['prompt'] });
        promptBtn.classList.add('selected');
    }

    updateBasket();
    updateLivePreview();
    applyCustomColors();
}

// Setup resize handles for sidebars
function setupResizeHandles() {
    const resizeLeft = document.getElementById('resizeLeft');
    const resizeRight = document.getElementById('resizeRight');
    const sidebarLeft = document.getElementById('sidebarLeft');
    const previewPanel = document.getElementById('previewPanel');

    let isResizing = false;
    let currentHandle = null;

    function startResize(e, handle) {
        isResizing = true;
        currentHandle = handle;
        handle.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }

    function doResize(e) {
        if (!isResizing) return;

        if (currentHandle === resizeLeft) {
            const newWidth = e.clientX;
            if (newWidth >= 200 && newWidth <= 400) {
                sidebarLeft.style.width = newWidth + 'px';
            }
        } else if (currentHandle === resizeRight) {
            const containerWidth = document.querySelector('.app-container').offsetWidth;
            const newWidth = containerWidth - e.clientX;
            if (newWidth >= 300 && newWidth <= containerWidth * 0.6) {
                previewPanel.style.width = newWidth + 'px';
            }
        }
    }

    function stopResize() {
        if (isResizing) {
            isResizing = false;
            if (currentHandle) {
                currentHandle.classList.remove('active');
            }
            currentHandle = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }

    resizeLeft.addEventListener('mousedown', (e) => startResize(e, resizeLeft));
    resizeRight.addEventListener('mousedown', (e) => startResize(e, resizeRight));
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

// Setup collapse/expand buttons
function setupCollapseButtons() {
    const collapseLeft = document.getElementById('collapseLeft');
    const collapseRight = document.getElementById('collapseRight');
    const expandLeft = document.getElementById('expandLeft');
    const expandRight = document.getElementById('expandRight');
    const sidebarLeft = document.getElementById('sidebarLeft');
    const previewPanel = document.getElementById('previewPanel');
    const resizeLeft = document.getElementById('resizeLeft');
    const resizeRight = document.getElementById('resizeRight');

    collapseLeft.addEventListener('click', () => {
        sidebarLeft.classList.add('collapsed');
        resizeLeft.style.display = 'none';
        expandLeft.classList.add('visible');
    });

    collapseRight.addEventListener('click', () => {
        previewPanel.classList.add('collapsed');
        resizeRight.style.display = 'none';
        expandRight.classList.add('visible');
    });

    expandLeft.addEventListener('click', () => {
        sidebarLeft.classList.remove('collapsed');
        resizeLeft.style.display = '';
        expandLeft.classList.remove('visible');
    });

    expandRight.addEventListener('click', () => {
        previewPanel.classList.remove('collapsed');
        resizeRight.style.display = '';
        expandRight.classList.remove('visible');
    });
}

// Setup zoom and pan controls
function setupZoomPan() {
    const mainContent = document.getElementById('mainContent');
    const pipelineWrapper = document.querySelector('.pipeline-wrapper');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');
    const zoomFit = document.getElementById('zoomFit');
    const zoomLevel = document.getElementById('zoomLevel');

    function updateTransform() {
        pipelineWrapper.style.transform = `translate(${viewState.panX}px, ${viewState.panY}px) scale(${viewState.zoom})`;
        zoomLevel.textContent = Math.round(viewState.zoom * 100) + '%';
    }

    function setZoom(newZoom) {
        viewState.zoom = Math.max(0.25, Math.min(2, newZoom));
        updateTransform();
    }

    zoomIn.addEventListener('click', () => setZoom(viewState.zoom + 0.1));
    zoomOut.addEventListener('click', () => setZoom(viewState.zoom - 0.1));
    zoomReset.addEventListener('click', () => {
        viewState.zoom = 1;
        viewState.panX = 0;
        viewState.panY = 0;
        updateTransform();
    });

    zoomFit.addEventListener('click', () => {
        const contentRect = mainContent.getBoundingClientRect();
        const pipelineRect = document.querySelector('.pipeline-container').getBoundingClientRect();

        const scaleX = (contentRect.width - 100) / (pipelineRect.width / viewState.zoom);
        const scaleY = (contentRect.height - 100) / (pipelineRect.height / viewState.zoom);
        const newZoom = Math.min(scaleX, scaleY, 1);

        viewState.zoom = Math.max(0.25, newZoom);
        viewState.panX = 0;
        viewState.panY = 0;
        updateTransform();
    });

    // Mouse wheel zoom (simple scroll without ctrl/cmd)
    mainContent.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(viewState.zoom + delta);
    }, { passive: false });

    // Pan with mouse drag
    pipelineWrapper.addEventListener('mousedown', (e) => {
        if (e.target === pipelineWrapper || e.target.classList.contains('pipeline-container')) {
            viewState.isPanning = true;
            viewState.startX = e.clientX - viewState.panX;
            viewState.startY = e.clientY - viewState.panY;
            pipelineWrapper.classList.add('panning');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (viewState.isPanning) {
            viewState.panX = e.clientX - viewState.startX;
            viewState.panY = e.clientY - viewState.startY;
            updateTransform();
        }
    });

    document.addEventListener('mouseup', () => {
        if (viewState.isPanning) {
            viewState.isPanning = false;
            pipelineWrapper.classList.remove('panning');
        }
    });

    // Touch support for mobile
    let touchStartX, touchStartY;
    pipelineWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            viewState.isPanning = true;
            touchStartX = e.touches[0].clientX - viewState.panX;
            touchStartY = e.touches[0].clientY - viewState.panY;
            pipelineWrapper.classList.add('panning');
        }
    }, { passive: true });

    pipelineWrapper.addEventListener('touchmove', (e) => {
        if (viewState.isPanning && e.touches.length === 1) {
            viewState.panX = e.touches[0].clientX - touchStartX;
            viewState.panY = e.touches[0].clientY - touchStartY;
            updateTransform();
        }
    }, { passive: true });

    pipelineWrapper.addEventListener('touchend', () => {
        viewState.isPanning = false;
        pipelineWrapper.classList.remove('panning');
    });
}

// Apply custom colors to options
function applyCustomColors() {
    Object.entries(CONFIG_DATA.options).forEach(([optId, opt]) => {
        if (opt.color) {
            const btn = document.querySelector(`[data-option="${optId}"]`);
            if (btn) {
                btn.style.background = opt.color.bg;
                btn.style.borderColor = opt.color.border;
                btn.style.color = opt.color.text;
            }
        }
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Option buttons (regular cards)
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleOption(btn));
    });

    // Workflow buttons (agent hub)
    document.querySelectorAll('.workflow-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleOption(btn));
    });

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettings').addEventListener('click', handleSaveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettingsToDefault);

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetSelection);

    // Chat interaction (demo)
    document.getElementById('sendBtn').addEventListener('click', sendDemoMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendDemoMessage();
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Toggle option selection
function toggleOption(btn) {
    const optionId = btn.dataset.option;
    const level = btn.dataset.level;
    const option = CONFIG_DATA.options[optionId];

    // Prevent toggling always-on options
    if (option && option.alwaysOn) {
        return;
    }

    // Single-select for workflow area (Agent Workflow)
    if (option.area === 'workflow') {
        // Deselect all other workflow options
        document.querySelectorAll('.workflow-btn.selected').forEach(selectedBtn => {
            selectedBtn.classList.remove('selected');
            state.selectedOptions.delete(selectedBtn.dataset.option);
        });

        // Select the clicked option
        state.selectedOptions.set(optionId, { level, ...CONFIG_DATA.options[optionId] });
        btn.classList.add('selected');
    } else {
        // Multi-select for other areas
        if (state.selectedOptions.has(optionId)) {
            state.selectedOptions.delete(optionId);
            btn.classList.remove('selected');
        } else {
            state.selectedOptions.set(optionId, { level, ...CONFIG_DATA.options[optionId] });
            btn.classList.add('selected');
        }
    }

    updateBasket();
    updateLivePreview();
}

// Check if all required areas have at least one selection
function validateRequiredAreas() {
    const selectedAreas = new Set();
    state.selectedOptions.forEach((option) => {
        selectedAreas.add(option.area);
    });

    const missing = [];
    REQUIRED_AREAS.forEach(area => {
        if (!selectedAreas.has(area)) {
            missing.push(CONFIG_DATA.areas[area].name);
        }
    });

    return { valid: missing.length === 0, missing };
}

// Update the basket display
function updateBasket() {
    const basketItems = document.getElementById('basketItems');
    const totalTime = document.getElementById('totalTime');
    const totalCost = document.getElementById('totalCost');
    const complexityLevel = document.getElementById('complexityLevel');

    if (state.selectedOptions.size === 0) {
        basketItems.innerHTML = `
            <p class="empty-basket">Select options to build your agent configuration</p>
        `;
        totalTime.textContent = '0 hours';
        totalCost.textContent = '0 DKK';
        complexityLevel.textContent = '-';
        complexityLevel.className = '';
        return;
    }

    let html = '';
    let time = 0;
    let cost = 0;
    let maxLevel = 'simple';

    state.selectedOptions.forEach((option, optionId) => {
        // Use individual option time/cost
        const timeCost = getOptionTimeCost(option);
        time += timeCost.time;
        cost += timeCost.cost;

        if (option.level === 'tbd') maxLevel = 'tbd';
        else if (option.level === 'advanced' && maxLevel !== 'tbd') maxLevel = 'advanced';

        const color = getOptionColor(option);

        html += `
            <div class="basket-item">
                <div class="basket-item-info">
                    <span class="basket-item-dot" style="background: ${color.border}"></span>
                    <span class="basket-item-name">${option.name}</span>
                    <span class="basket-item-cost">${timeCost.cost} DKK</span>
                </div>
                <button class="basket-item-remove" onclick="removeOption('${optionId}')" title="Remove" ${option.alwaysOn ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    basketItems.innerHTML = html;
    totalTime.textContent = `${time} hours`;
    totalCost.textContent = `${cost.toLocaleString()} DKK`;

    const levelLabels = { simple: 'Simple', advanced: 'Advanced', tbd: 'Complex' };
    complexityLevel.textContent = levelLabels[maxLevel];
    complexityLevel.className = `complexity-${maxLevel}`;
}

// Remove option from basket
function removeOption(optionId) {
    const option = CONFIG_DATA.options[optionId];
    if (option && option.alwaysOn) return;

    state.selectedOptions.delete(optionId);
    document.querySelector(`[data-option="${optionId}"]`)?.classList.remove('selected');
    updateBasket();
    updateLivePreview();
}

// Reset all selections
function resetSelection() {
    state.selectedOptions.clear();
    document.querySelectorAll('.option-btn.selected, .workflow-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Re-select always-on options
    const promptBtn = document.querySelector('[data-option="prompt"]');
    if (promptBtn) {
        state.selectedOptions.set('prompt', { level: 'simple', ...CONFIG_DATA.options['prompt'] });
        promptBtn.classList.add('selected');
    }

    updateBasket();
    updateLivePreview();
}

// Update live preview in real-time
function updateLivePreview() {
    updatePreviewCapabilities();
    updatePreviewConfig();
    updatePreviewMetrics();
    updateChatWelcome();
}

// Update preview capabilities
function updatePreviewCapabilities() {
    const container = document.getElementById('chatCapabilities');
    const voiceBtn = document.getElementById('voiceBtn');
    const imageBtn = document.getElementById('imageUploadBtn');
    const searchBtn = document.getElementById('fileSearchBtn');
    const featuresContainer = document.getElementById('chatInputFeatures');

    let badges = [];
    let inputFeatures = [];

    // Show/hide action buttons based on selection
    voiceBtn.style.display = state.selectedOptions.has('multimodal') ? 'flex' : 'none';
    imageBtn.style.display = state.selectedOptions.has('multimodal') ? 'flex' : 'none';
    searchBtn.style.display = state.selectedOptions.has('retrieval') ? 'flex' : 'none';

    // Create capability badges and input features
    if (state.selectedOptions.has('multimodal')) {
        inputFeatures.push(`<button class="chat-feature-btn" title="Voice Input"><i class="fas fa-microphone"></i></button>`);
        inputFeatures.push(`<button class="chat-feature-btn" title="Upload Image"><i class="fas fa-image"></i></button>`);
    }

    if (state.selectedOptions.has('retrieval')) {
        inputFeatures.push(`<button class="chat-feature-btn" title="Search Files"><i class="fas fa-search"></i></button>`);
    }

    state.selectedOptions.forEach((option) => {
        if (option.area === 'tools') {
            badges.push(`<span class="capability-badge"><i class="${option.icon}"></i> ${option.name}</span>`);
        }
    });

    container.innerHTML = badges.length > 0 ? badges.join('') : '';
    featuresContainer.innerHTML = inputFeatures.join('');
}

// Update preview configuration list
function updatePreviewConfig() {
    const container = document.getElementById('configItems');

    if (state.selectedOptions.size === 0) {
        container.innerHTML = '<p class="no-config">No options selected yet</p>';
        return;
    }

    let html = '';
    state.selectedOptions.forEach((option) => {
        html += `
            <div class="config-item">
                <i class="${option.icon}"></i>
                <span>${option.name}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Update preview metrics
function updatePreviewMetrics() {
    let baseResponseTime = 1.0;
    let baseAccuracy = 80;
    let baseMonthlyCost = 100;

    state.selectedOptions.forEach((option) => {
        if (option.area === 'tools') {
            baseResponseTime += 0.3;
            baseAccuracy += 2;
            baseMonthlyCost += 30;
        }
        if (option.area === 'data-sources') {
            baseAccuracy += 3;
            baseMonthlyCost += 20;
        }
        if (option.level === 'advanced') {
            baseResponseTime += 0.2;
            baseAccuracy += 3;
            baseMonthlyCost += 40;
        }
        if (option.level === 'tbd') {
            baseResponseTime += 0.5;
            baseMonthlyCost += 100;
        }
    });

    document.getElementById('previewResponseTime').textContent = `~${baseResponseTime.toFixed(1)}s`;
    document.getElementById('previewAccuracy').textContent = `${Math.min(baseAccuracy, 98)}%`;
    document.getElementById('previewMonthlyCost').textContent = `${baseMonthlyCost} DKK`;
}

// Update chat welcome message based on config
function updateChatWelcome() {
    const chatMessages = document.getElementById('chatMessages');
    const welcomeMessage = getWelcomeMessage();

    chatMessages.innerHTML = `
        <div class="message bot">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>${welcomeMessage}</p>
            </div>
        </div>
    `;
}

function getWelcomeMessage() {
    const capabilities = [];

    if (state.selectedOptions.has('multimodal')) {
        capabilities.push('understand and generate images');
    }
    if (state.selectedOptions.has('retrieval')) {
        capabilities.push('search through your documents');
    }
    if (state.selectedOptions.has('code-execution')) {
        capabilities.push('execute code and analyze data');
    }
    if (state.selectedOptions.has('custom-tools')) {
        capabilities.push('use custom tools and APIs');
    }

    let msg = "Hello! I'm your configured Agent Assistant.";

    if (capabilities.length === 0) {
        return msg + ' How can I help you today?';
    }

    if (capabilities.length === 1) {
        return msg + ` I can ${capabilities[0]}. How can I help you today?`;
    }

    const last = capabilities.pop();
    return msg + ` I can ${capabilities.join(', ')}, and ${last}. How can I help you today?`;
}

// Settings Modal
function openSettingsModal() {
    updateSettingsInputs();
    renderOptionsManager();
    setupSettingsTabs();
    document.getElementById('settingsModal').classList.add('active');
}

// Setup settings tabs
function setupSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function handleSaveSettings() {
    state.settings = {
        simple: {
            time: parseFloat(document.getElementById('simpleTime').value) || 0,
            cost: parseFloat(document.getElementById('simpleCost').value) || 0
        },
        advanced: {
            time: parseFloat(document.getElementById('advancedTime').value) || 0,
            cost: parseFloat(document.getElementById('advancedCost').value) || 0
        },
        tbd: {
            time: parseFloat(document.getElementById('tbdTime').value) || 0,
            cost: parseFloat(document.getElementById('tbdCost').value) || 0
        }
    };
    saveSettings();
    saveOptions();
    rebuildAllOptions();
    applyCustomColors();
    updateBasket();
    updateLivePreview();
    closeSettingsModal();
}

function resetSettingsToDefault() {
    if (!confirm('This will reset all pricing to defaults. Continue?')) return;

    state.settings = {
        simple: { time: 40, cost: 50000 },
        advanced: { time: 80, cost: 100000 },
        tbd: { time: 160, cost: 200000 }
    };
    updateSettingsInputs();
}

// Options Manager - render the options list per area
function renderOptionsManager() {
    const container = document.getElementById('optionsManager');
    if (!container) return;

    let html = '';
    const areaOrder = ['data-sources', 'tools', 'workflow', 'ui-integration'];

    areaOrder.forEach(areaId => {
        const area = CONFIG_DATA.areas[areaId];
        const areaOptions = Object.entries(CONFIG_DATA.options).filter(([_, opt]) => opt.area === areaId);

        html += `
            <div class="options-manager-area" data-area="${areaId}">
                <div class="options-manager-header">
                    <h5><i class="fas ${area.icon}"></i> ${area.name}</h5>
                    ${area.required ? '<span class="required-badge">Required</span>' : ''}
                    <button class="btn-add-option" onclick="showAddOptionForm('${areaId}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="options-manager-list">
                    ${areaOptions.map(([optId, opt]) => {
                        const color = getOptionColor(opt);
                        const timeCost = getOptionTimeCost(opt);
                        return `
                        <div class="options-manager-item" data-option-id="${optId}" style="background: ${color.bg}20; border-color: ${color.border}50">
                            <div class="option-info">
                                <i class="${opt.icon}" style="color: ${color.text}"></i>
                                <span style="color: ${color.text}">${opt.name}</span>
                                ${opt.alwaysOn ? '<span class="badge-default" style="margin-left:4px">Default</span>' : ''}
                            </div>
                            <div class="option-meta">
                                <span class="option-time">${timeCost.time}h</span>
                                <span class="option-cost">${timeCost.cost} DKK</span>
                                <span class="option-color-preview" style="background: ${color.bg}; border-color: ${color.border}"></span>
                            </div>
                            <div class="option-actions">
                                <button class="btn-edit-option" onclick="openEditModal('${optId}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete-option" onclick="deleteOption('${optId}')" title="Delete" ${opt.alwaysOn ? 'disabled style="opacity:0.3"' : ''}>
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
                <div class="add-option-form" id="add-form-${areaId}" style="display: none;">
                    <div class="form-row">
                        <input type="text" placeholder="Option name" class="option-name-input" id="name-${areaId}">
                        <input type="text" placeholder="Icon (fas fa-star)" class="option-icon-input" id="icon-${areaId}">
                    </div>
                    <div class="form-row">
                        <select class="option-level-select" id="level-${areaId}" onchange="updateAddFormDefaults('${areaId}')">
                            <option value="simple">Simple</option>
                            <option value="advanced">Advanced</option>
                            <option value="tbd">To Be Decided</option>
                        </select>
                        <input type="number" placeholder="Hours" class="option-time-input" id="time-${areaId}" value="${state.settings.simple.time}">
                        <input type="number" placeholder="Cost DKK" class="option-cost-input" id="cost-${areaId}" value="${state.settings.simple.cost}">
                    </div>
                    <div class="form-row color-row">
                        <label>Color:</label>
                        <input type="color" id="color-bg-${areaId}" value="${COLOR_PRESETS.simple.bg}">
                        <input type="color" id="color-border-${areaId}" value="${COLOR_PRESETS.simple.border}">
                        <input type="color" id="color-text-${areaId}" value="${COLOR_PRESETS.simple.text}">
                        <button class="btn-use-preset" onclick="usePresetColors('${areaId}')">Use Preset</button>
                    </div>
                    <div class="form-actions">
                        <button class="btn-cancel" onclick="hideAddOptionForm('${areaId}')">Cancel</button>
                        <button class="btn-confirm" onclick="addOption('${areaId}')">Add</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Update add form defaults when level changes
function updateAddFormDefaults(areaId) {
    const level = document.getElementById(`level-${areaId}`).value;
    const defaults = state.settings[level];
    const colors = COLOR_PRESETS[level];

    document.getElementById(`time-${areaId}`).value = defaults.time;
    document.getElementById(`cost-${areaId}`).value = defaults.cost;
    document.getElementById(`color-bg-${areaId}`).value = colors.bg;
    document.getElementById(`color-border-${areaId}`).value = colors.border;
    document.getElementById(`color-text-${areaId}`).value = colors.text;
}

// Use preset colors based on level
function usePresetColors(areaId) {
    const level = document.getElementById(`level-${areaId}`).value;
    const colors = COLOR_PRESETS[level];
    document.getElementById(`color-bg-${areaId}`).value = colors.bg;
    document.getElementById(`color-border-${areaId}`).value = colors.border;
    document.getElementById(`color-text-${areaId}`).value = colors.text;
}

// Show add option form
function showAddOptionForm(areaId) {
    document.getElementById(`add-form-${areaId}`).style.display = 'block';
    updateAddFormDefaults(areaId);
}

// Hide add option form
function hideAddOptionForm(areaId) {
    document.getElementById(`add-form-${areaId}`).style.display = 'none';
    document.getElementById(`name-${areaId}`).value = '';
    document.getElementById(`icon-${areaId}`).value = '';
}

// Add new option
function addOption(areaId) {
    const name = document.getElementById(`name-${areaId}`).value.trim();
    const icon = document.getElementById(`icon-${areaId}`).value.trim() || 'fas fa-circle';
    const level = document.getElementById(`level-${areaId}`).value;
    const time = parseFloat(document.getElementById(`time-${areaId}`).value) || state.settings[level].time;
    const cost = parseFloat(document.getElementById(`cost-${areaId}`).value) || state.settings[level].cost;
    const colorBg = document.getElementById(`color-bg-${areaId}`).value;
    const colorBorder = document.getElementById(`color-border-${areaId}`).value;
    const colorText = document.getElementById(`color-text-${areaId}`).value;

    if (!name) {
        alert('Please enter an option name');
        return;
    }

    // Generate unique ID
    const optionId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // Check if using custom colors or preset
    const presetColors = COLOR_PRESETS[level];
    const isCustomColor = colorBg !== presetColors.bg || colorBorder !== presetColors.border || colorText !== presetColors.text;

    CONFIG_DATA.options[optionId] = {
        name,
        icon,
        area: areaId,
        level,
        time,
        cost,
        color: isCustomColor ? { bg: colorBg, border: colorBorder, text: colorText } : null
    };

    saveOptions();
    renderOptionsManager();
    rebuildAreaOptions(areaId);
    hideAddOptionForm(areaId);
}

// Open edit modal for option
function openEditModal(optionId) {
    const option = CONFIG_DATA.options[optionId];
    if (!option) return;

    const color = getOptionColor(option);
    const timeCost = getOptionTimeCost(option);

    // Create and show edit modal
    const existingModal = document.getElementById('editOptionModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editOptionModal';
    modal.innerHTML = `
        <div class="modal-content edit-option-modal">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Edit Option</h3>
                <button class="modal-close" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="edit-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="edit-name" value="${option.name}">
                    </div>
                    <div class="form-group">
                        <label>Icon Class</label>
                        <input type="text" id="edit-icon" value="${option.icon}">
                        <small>e.g., fas fa-star, fab fa-microsoft</small>
                    </div>
                    <div class="form-group">
                        <label>Difficulty Level</label>
                        <select id="edit-level" onchange="updateEditFormFromLevel()">
                            <option value="simple" ${option.level === 'simple' ? 'selected' : ''}>Simple</option>
                            <option value="advanced" ${option.level === 'advanced' ? 'selected' : ''}>Advanced</option>
                            <option value="tbd" ${option.level === 'tbd' ? 'selected' : ''}>To Be Decided</option>
                        </select>
                    </div>
                    <div class="form-row-inline">
                        <div class="form-group">
                            <label>Hours</label>
                            <input type="number" id="edit-time" value="${timeCost.time}" min="0" step="0.5">
                        </div>
                        <div class="form-group">
                            <label>Cost (DKK)</label>
                            <input type="number" id="edit-cost" value="${timeCost.cost}" min="0" step="50">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Colors</label>
                        <div class="color-inputs">
                            <div class="color-input-group">
                                <label>Background</label>
                                <input type="color" id="edit-color-bg" value="${color.bg}">
                            </div>
                            <div class="color-input-group">
                                <label>Border</label>
                                <input type="color" id="edit-color-border" value="${color.border}">
                            </div>
                            <div class="color-input-group">
                                <label>Text</label>
                                <input type="color" id="edit-color-text" value="${color.text}">
                            </div>
                            <button class="btn-use-preset-edit" onclick="usePresetColorsEdit()">
                                <i class="fas fa-palette"></i> Use Level Preset
                            </button>
                        </div>
                    </div>
                    <div class="color-preview-box">
                        <div class="preview-option" id="edit-preview" style="background: ${color.bg}; border-color: ${color.border}; color: ${color.text}">
                            <i class="${option.icon}"></i>
                            <span>${option.name}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button class="btn-primary" onclick="saveOptionEdit('${optionId}')">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add live preview update
    ['edit-name', 'edit-icon', 'edit-color-bg', 'edit-color-border', 'edit-color-text'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateEditPreview);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEditModal();
    });
}

// Update edit preview
function updateEditPreview() {
    const preview = document.getElementById('edit-preview');
    if (!preview) return;

    const name = document.getElementById('edit-name').value;
    const icon = document.getElementById('edit-icon').value;
    const bg = document.getElementById('edit-color-bg').value;
    const border = document.getElementById('edit-color-border').value;
    const text = document.getElementById('edit-color-text').value;

    preview.style.background = bg;
    preview.style.borderColor = border;
    preview.style.color = text;
    preview.innerHTML = `<i class="${icon}"></i><span>${name}</span>`;
}

// Use preset colors in edit modal
function usePresetColorsEdit() {
    const level = document.getElementById('edit-level').value;
    const colors = COLOR_PRESETS[level];
    document.getElementById('edit-color-bg').value = colors.bg;
    document.getElementById('edit-color-border').value = colors.border;
    document.getElementById('edit-color-text').value = colors.text;
    updateEditPreview();
}

// Update form from level selection
function updateEditFormFromLevel() {
    const level = document.getElementById('edit-level').value;
    const defaults = state.settings[level];
    document.getElementById('edit-time').value = defaults.time;
    document.getElementById('edit-cost').value = defaults.cost;
    usePresetColorsEdit();
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editOptionModal');
    if (modal) modal.remove();
}

// Save option edit
function saveOptionEdit(optionId) {
    const option = CONFIG_DATA.options[optionId];
    if (!option) return;

    const name = document.getElementById('edit-name').value.trim();
    const icon = document.getElementById('edit-icon').value.trim();
    const level = document.getElementById('edit-level').value;
    const time = parseFloat(document.getElementById('edit-time').value) || 0;
    const cost = parseFloat(document.getElementById('edit-cost').value) || 0;
    const colorBg = document.getElementById('edit-color-bg').value;
    const colorBorder = document.getElementById('edit-color-border').value;
    const colorText = document.getElementById('edit-color-text').value;

    if (!name) {
        alert('Name is required');
        return;
    }

    // Check if using custom colors
    const presetColors = COLOR_PRESETS[level];
    const isCustomColor = colorBg !== presetColors.bg || colorBorder !== presetColors.border || colorText !== presetColors.text;

    CONFIG_DATA.options[optionId] = {
        ...option,
        name,
        icon,
        level,
        time,
        cost,
        color: isCustomColor ? { bg: colorBg, border: colorBorder, text: colorText } : null
    };

    // Update selected option if in basket
    if (state.selectedOptions.has(optionId)) {
        state.selectedOptions.set(optionId, { ...CONFIG_DATA.options[optionId] });
    }

    saveOptions();
    renderOptionsManager();
    rebuildAreaOptions(option.area);
    applyCustomColors();
    updateBasket();
    updateLivePreview();
    closeEditModal();
}

// Delete option
function deleteOption(optionId) {
    const option = CONFIG_DATA.options[optionId];
    if (!option) return;
    if (option.alwaysOn) return;

    if (!confirm(`Are you sure you want to delete "${option.name}"?`)) return;

    const areaId = option.area;

    // Remove from selections if selected
    state.selectedOptions.delete(optionId);

    delete CONFIG_DATA.options[optionId];

    saveOptions();
    renderOptionsManager();
    rebuildAreaOptions(areaId);
    updateBasket();
    updateLivePreview();
}

// Rebuild options for a specific area in the UI
function rebuildAreaOptions(areaId) {
    const areaOptions = Object.entries(CONFIG_DATA.options).filter(([_, opt]) => opt.area === areaId);

    if (areaId === 'workflow') {
        // Special handling for workflow (agent hub buttons)
        const container = document.querySelector('.workflow-options');
        if (!container) return;

        container.innerHTML = areaOptions.map(([optId, opt]) => {
            const color = getOptionColor(opt);
            const labelMap = {
                'simple-flow': 'Simple',
                'advanced-flow': 'Reflection',
                'custom-flow': 'Custom'
            };
            const label = labelMap[optId] || opt.name;
            return `
            <button class="workflow-btn ${opt.level} ${state.selectedOptions.has(optId) ? 'selected' : ''}"
                    data-option="${optId}" data-level="${opt.level}" title="${opt.name}"
                    style="background: ${color.bg}; border-color: ${color.border}; color: ${color.text}">
                <span class="workflow-icon"><i class="${opt.icon}"></i></span>
                <span class="workflow-label">${label}</span>
            </button>
        `}).join('');

        // Re-attach event listeners
        container.querySelectorAll('.workflow-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleOption(btn));
        });
    } else {
        // Regular area cards
        const container = document.querySelector(`[data-area="${areaId}"] .options-list`);
        if (!container) return;

        container.innerHTML = areaOptions.map(([optId, opt]) => {
            const color = getOptionColor(opt);
            return `
            <button class="option-btn ${state.selectedOptions.has(optId) ? 'selected' : ''} ${opt.alwaysOn ? 'always-on' : ''}"
                    data-option="${optId}" data-level="${opt.level}"
                    style="background: ${color.bg}; border-color: ${color.border}; color: ${color.text}">
                <span class="option-icon"><i class="${opt.icon}"></i></span>
                <span>${opt.name}</span>
                ${opt.alwaysOn ? '<span class="badge-default">Default</span>' : ''}
            </button>
        `}).join('');

        // Re-attach event listeners
        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => toggleOption(btn));
        });
    }
}

// Rebuild all options in the UI
function rebuildAllOptions() {
    const areas = ['data-sources', 'tools', 'workflow', 'ui-integration'];
    areas.forEach(areaId => rebuildAreaOptions(areaId));
}

// Send demo message
function sendDemoMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');

    // Add user message
    chatMessages.innerHTML += `
        <div class="message user">
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;

    input.value = '';

    // Simulate bot response after delay
    setTimeout(() => {
        const response = generateDemoResponse(message);
        chatMessages.innerHTML += `
            <div class="message bot">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    ${response}
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateDemoResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Demo responses based on capabilities
    if (lowerMessage.includes('image') && state.selectedOptions.has('multimodal')) {
        return `<p>I'd be happy to help with images! With multimodal capabilities enabled, I can:</p>
                <ul style="margin: 8px 0; padding-left: 20px; font-size: 0.8rem;">
                    <li>Analyze and understand images you share</li>
                    <li>Generate images based on descriptions</li>
                    <li>Extract text from images</li>
                </ul>
                <p><em>(Demo response)</em></p>`;
    }

    if ((lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('document')) &&
        state.selectedOptions.has('retrieval')) {
        return `<p>I searched through your knowledge base and found relevant results:</p>
                <p style="background: rgba(99,102,241,0.1); padding: 8px; border-radius: 6px; margin: 8px 0; font-size: 0.75rem;">
                    <strong>3 documents found</strong><br>
                    Document_A.pdf - 95% relevance<br>
                    Report_2024.docx - 87% relevance<br>
                    Guidelines.pdf - 72% relevance
                </p>
                <p><em>(Demo response)</em></p>`;
    }

    if ((lowerMessage.includes('code') || lowerMessage.includes('data') || lowerMessage.includes('analyze')) &&
        state.selectedOptions.has('code-execution')) {
        return `<p>I can help analyze that data! Here's a sample output:</p>
                <pre style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; font-size: 0.7rem; overflow-x: auto; margin: 8px 0;">
data = analyze(input)
# Results:
# - Total records: 1,234
# - Average value: 45.2
# - Trend: Increasing (+12%)
                </pre>
                <p><em>(Demo response)</em></p>`;
    }

    // Default response
    const responses = [
        "I understand your request. Based on my configuration, I can assist you with that.",
        "Thank you for your message! I'm here to help with your questions.",
        "Great question! Let me help you with that based on my current capabilities.",
        "I've received your message and I'm ready to assist."
    ];

    return `<p>${responses[Math.floor(Math.random() * responses.length)]}</p>
            <p><em>(Demo response - actual responses depend on your configuration)</em></p>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
