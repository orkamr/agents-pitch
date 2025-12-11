// Default color presets
const COLOR_PRESETS = {
    simple: { bg: '#fef08a', border: '#eab308', text: '#854d0e' },
    advanced: { bg: '#fed7aa', border: '#f97316', text: '#9a3412' },
    tbd: { bg: '#fca5a5', border: '#ef4444', text: '#991b1b' }
};

// Configuration data - now mutable for dynamic options
let CONFIG_DATA = {
    areas: {
        'kb-integrations': {
            name: 'Knowledge Base Integrations',
            icon: 'fa-database',
            required: false
        },
        'kb-ingestion': {
            name: 'Knowledge Base Ingestion',
            icon: 'fa-cogs',
            required: false
        },
        'system-prompt': {
            name: 'System Prompt/Instructions',
            icon: 'fa-comment-dots',
            required: true
        },
        'tools': {
            name: 'Tools/Capabilities',
            icon: 'fa-tools',
            required: true
        },
        'workflow': {
            name: 'Agent Workflow',
            icon: 'fa-project-diagram',
            required: true
        },
        'ui-integration': {
            name: 'UI Integration',
            icon: 'fa-desktop',
            required: true
        }
    },
    options: {
        // KB Integrations
        'sharepoint': { name: 'Sharepoint', icon: 'fab fa-microsoft', area: 'kb-integrations', level: 'simple', time: 4, cost: 500, color: null },
        'azure-blob': { name: 'Azure BlobStorage', icon: 'fas fa-cloud', area: 'kb-integrations', level: 'simple', time: 4, cost: 500, color: null },
        'upload-local': { name: 'Upload from local', icon: 'fas fa-upload', area: 'kb-integrations', level: 'simple', time: 4, cost: 500, color: null },
        'custom-api': { name: 'Custom API', icon: 'fas fa-plug', area: 'kb-integrations', level: 'advanced', time: 12, cost: 1500, color: null },
        'live-sync': { name: 'Any live/sync connection', icon: 'fas fa-sync', area: 'kb-integrations', level: 'advanced', time: 12, cost: 1500, color: null },
        // KB Ingestion
        'standard-ingestion': { name: 'Standard KB Ingestion', icon: 'fas fa-database', area: 'kb-ingestion', level: 'simple', time: 4, cost: 500, color: null },
        'domain-specific': { name: 'Domain Specific Ingestion', icon: 'fas fa-brain', area: 'kb-ingestion', level: 'advanced', time: 12, cost: 1500, color: null },
        // System Prompt
        'custom-prompt': { name: 'Custom System Prompt', icon: 'fas fa-comment-dots', area: 'system-prompt', level: 'simple', time: 4, cost: 500, color: null },
        // Tools
        'image-understanding': { name: 'Image Understanding', icon: 'fas fa-eye', area: 'tools', level: 'simple', time: 4, cost: 500, color: null },
        'image-creation': { name: 'Image Creation', icon: 'fas fa-paint-brush', area: 'tools', level: 'advanced', time: 12, cost: 1500, color: null },
        'speech-to-text': { name: 'Speech to text', icon: 'fas fa-microphone', area: 'tools', level: 'advanced', time: 12, cost: 1500, color: null },
        'simple-rag': { name: 'Simple RAG / File search', icon: 'fas fa-search', area: 'tools', level: 'simple', time: 4, cost: 500, color: null },
        'code-execution': { name: 'Code execution/Data Analyst', icon: 'fas fa-code', area: 'tools', level: 'advanced', time: 12, cost: 1500, color: null },
        'custom-rag': { name: 'Custom RAG', icon: 'fas fa-cogs', area: 'tools', level: 'advanced', time: 12, cost: 1500, color: null },
        'custom-tool': { name: 'Custom Tool', icon: 'fas fa-wrench', area: 'tools', level: 'tbd', time: 24, cost: 3000, color: null },
        // Workflow
        'simple-flow': { name: 'Simple flow', icon: 'fas fa-stream', area: 'workflow', level: 'simple', time: 4, cost: 500, color: null },
        'advanced-flow': { name: 'Advanced flow', icon: 'fas fa-project-diagram', area: 'workflow', level: 'advanced', time: 12, cost: 1500, color: null },
        'custom-flow': { name: 'Custom flow', icon: 'fas fa-sitemap', area: 'workflow', level: 'tbd', time: 24, cost: 3000, color: null },
        // UI Integration
        'launchpad': { name: 'Launchpad', icon: 'fas fa-rocket', area: 'ui-integration', level: 'simple', time: 4, cost: 500, color: null },
        'teams': { name: 'Teams', icon: 'fab fa-microsoft', area: 'ui-integration', level: 'tbd', time: 24, cost: 3000, color: null },
        'email': { name: 'Email', icon: 'fas fa-envelope', area: 'ui-integration', level: 'tbd', time: 24, cost: 3000, color: null },
        'custom-ui': { name: 'Custom UI', icon: 'fas fa-palette', area: 'ui-integration', level: 'tbd', time: 24, cost: 3000, color: null }
    }
};

// Required areas for validation
const REQUIRED_AREAS = ['system-prompt', 'tools', 'workflow', 'ui-integration'];

// State management
let state = {
    selectedOptions: new Map(),
    settings: {
        simple: { time: 4, cost: 500 },
        advanced: { time: 12, cost: 1500 },
        tbd: { time: 24, cost: 3000 }
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

// Initialize the application
function init() {
    loadSettings();
    setupEventListeners();
    updateBasket();
    applyCustomColors();
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

    // Preview modal
    document.getElementById('previewBtn').addEventListener('click', openPreviewModal);
    document.getElementById('closePreview').addEventListener('click', closePreviewModal);

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

    // Add mobile basket toggle
    addMobileBasketToggle();
}

// Toggle option selection
function toggleOption(btn) {
    const optionId = btn.dataset.option;
    const level = btn.dataset.level;

    if (state.selectedOptions.has(optionId)) {
        state.selectedOptions.delete(optionId);
        btn.classList.remove('selected');
    } else {
        state.selectedOptions.set(optionId, { level, ...CONFIG_DATA.options[optionId] });
        btn.classList.add('selected');
    }

    updateBasket();
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
    const previewBtn = document.getElementById('previewBtn');

    // Check validation
    const validation = validateRequiredAreas();

    if (state.selectedOptions.size === 0) {
        basketItems.innerHTML = `
            <p class="empty-basket">Select options to build your agent configuration</p>
            <div class="required-hint">
                <i class="fas fa-info-circle"></i>
                <span>Required: System Prompt, Tools, Agent Workflow, UI</span>
            </div>
        `;
        totalTime.textContent = '0 hours';
        totalCost.textContent = '0 DKK';
        complexityLevel.textContent = '-';
        complexityLevel.className = '';
        previewBtn.disabled = true;
        previewBtn.title = 'Select required options first';
        updateMobileBasketBadge(0);
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
                <button class="basket-item-remove" onclick="removeOption('${optionId}')" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    // Add missing requirements warning
    if (!validation.valid) {
        html += `
            <div class="missing-requirements">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Missing: ${validation.missing.join(', ')}</span>
            </div>
        `;
    }

    basketItems.innerHTML = html;
    totalTime.textContent = `${time} hours`;
    totalCost.textContent = `${cost.toLocaleString()} DKK`;

    const levelLabels = { simple: 'Simple', advanced: 'Advanced', tbd: 'Complex' };
    complexityLevel.textContent = levelLabels[maxLevel];
    complexityLevel.className = `complexity-${maxLevel}`;

    previewBtn.disabled = !validation.valid;
    previewBtn.title = validation.valid ? 'Preview your chatbot' : `Missing: ${validation.missing.join(', ')}`;
    updateMobileBasketBadge(state.selectedOptions.size);
}

// Remove option from basket
function removeOption(optionId) {
    state.selectedOptions.delete(optionId);
    document.querySelector(`[data-option="${optionId}"]`)?.classList.remove('selected');
    updateBasket();
}

// Reset all selections
function resetSelection() {
    state.selectedOptions.clear();
    document.querySelectorAll('.option-btn.selected, .workflow-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    updateBasket();
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
            // Remove active from all tabs and contents
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));

            // Add active to clicked tab and corresponding content
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
    closeSettingsModal();
}

function resetSettingsToDefault() {
    if (!confirm('This will reset all pricing to defaults. Continue?')) return;

    state.settings = {
        simple: { time: 4, cost: 500 },
        advanced: { time: 12, cost: 1500 },
        tbd: { time: 24, cost: 3000 }
    };
    updateSettingsInputs();
}

// Options Manager - render the options list per area
function renderOptionsManager() {
    const container = document.getElementById('optionsManager');
    if (!container) return;

    let html = '';
    const areaOrder = ['kb-integrations', 'kb-ingestion', 'system-prompt', 'tools', 'workflow', 'ui-integration'];

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
                            </div>
                            <div class="option-meta">
                                <span class="option-time">${timeCost.time}h</span>
                                <span class="option-cost">$${timeCost.cost}</span>
                                <span class="option-color-preview" style="background: ${color.bg}; border-color: ${color.border}"></span>
                            </div>
                            <div class="option-actions">
                                <button class="btn-edit-option" onclick="openEditModal('${optId}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete-option" onclick="deleteOption('${optId}')" title="Delete">
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
                        <input type="number" placeholder="Cost $" class="option-cost-input" id="cost-${areaId}" value="${state.settings.simple.cost}">
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
    closeEditModal();
}

// Delete option
function deleteOption(optionId) {
    const option = CONFIG_DATA.options[optionId];
    if (!option) return;

    if (!confirm(`Are you sure you want to delete "${option.name}"?`)) return;

    const areaId = option.area;

    // Remove from selections if selected
    state.selectedOptions.delete(optionId);

    delete CONFIG_DATA.options[optionId];

    saveOptions();
    renderOptionsManager();
    rebuildAreaOptions(areaId);
    updateBasket();
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
            return `
            <button class="workflow-btn ${state.selectedOptions.has(optId) ? 'selected' : ''}"
                    data-option="${optId}" data-level="${opt.level}" title="${opt.name}"
                    style="background: ${color.bg}; border-color: ${color.border}; color: ${color.text}">
                <i class="${opt.icon}"></i>
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
            <button class="option-btn ${state.selectedOptions.has(optId) ? 'selected' : ''}"
                    data-option="${optId}" data-level="${opt.level}"
                    style="background: ${color.bg}; border-color: ${color.border}; color: ${color.text}">
                <span class="option-icon"><i class="${opt.icon}"></i></span>
                <span>${opt.name}</span>
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
    const areas = ['kb-integrations', 'kb-ingestion', 'system-prompt', 'tools', 'workflow', 'ui-integration'];
    areas.forEach(areaId => rebuildAreaOptions(areaId));
}

// Preview Modal
function openPreviewModal() {
    const modal = document.getElementById('previewModal');
    modal.classList.add('active');

    updatePreviewCapabilities();
    updatePreviewConfig();
    updatePreviewMetrics();
    setupChatDemo();
}

function closePreviewModal() {
    document.getElementById('previewModal').classList.remove('active');
}

function updatePreviewCapabilities() {
    const container = document.getElementById('chatCapabilities');
    const voiceBtn = document.getElementById('voiceBtn');
    const imageBtn = document.getElementById('imageUploadBtn');
    const searchBtn = document.getElementById('fileSearchBtn');

    let badges = [];

    // Show/hide action buttons based on selection
    voiceBtn.style.display = state.selectedOptions.has('speech-to-text') ? 'flex' : 'none';
    imageBtn.style.display = (state.selectedOptions.has('image-understanding') || state.selectedOptions.has('image-creation')) ? 'flex' : 'none';
    searchBtn.style.display = (state.selectedOptions.has('simple-rag') || state.selectedOptions.has('custom-rag')) ? 'flex' : 'none';

    // Create capability badges
    state.selectedOptions.forEach((option) => {
        if (option.area === 'tools') {
            badges.push(`<span class="capability-badge"><i class="${option.icon}"></i> ${option.name}</span>`);
        }
    });

    container.innerHTML = badges.join('');
}

function updatePreviewConfig() {
    const container = document.getElementById('previewConfig');

    // Group by area
    const grouped = {};
    state.selectedOptions.forEach((option) => {
        const areaKey = option.area;
        if (!grouped[areaKey]) grouped[areaKey] = [];
        grouped[areaKey].push(option);
    });

    let html = '';
    for (const [, options] of Object.entries(grouped)) {
        options.forEach(opt => {
            html += `
                <div class="preview-config-item">
                    <i class="${opt.icon}"></i>
                    <span>${opt.name}</span>
                </div>
            `;
        });
    }

    container.innerHTML = html || '<p style="color: var(--text-muted); font-size: 0.8125rem;">No options selected</p>';
}

function updatePreviewMetrics() {
    // Calculate estimated metrics based on configuration
    let baseResponseTime = 1.0;
    let baseAccuracy = 80;
    let baseMonthlyCost = 100;

    state.selectedOptions.forEach((option) => {
        // Adjust metrics based on options
        if (option.area === 'tools') {
            baseResponseTime += 0.3;
            baseAccuracy += 2;
            baseMonthlyCost += 30;
        }
        if (option.area === 'kb-ingestion') {
            baseAccuracy += 5;
            baseMonthlyCost += 50;
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

function setupChatDemo() {
    const chatMessages = document.getElementById('chatMessages');

    // Reset chat with welcome message
    chatMessages.innerHTML = `
        <div class="message bot">
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>Hello! I'm your configured Agent Building Assistant. ${getWelcomeMessage()}</p>
            </div>
        </div>
    `;
}

function getWelcomeMessage() {
    const capabilities = [];

    if (state.selectedOptions.has('image-understanding')) {
        capabilities.push('understand images');
    }
    if (state.selectedOptions.has('image-creation')) {
        capabilities.push('create images');
    }
    if (state.selectedOptions.has('speech-to-text')) {
        capabilities.push('process voice input');
    }
    if (state.selectedOptions.has('simple-rag') || state.selectedOptions.has('custom-rag')) {
        capabilities.push('search through your documents');
    }
    if (state.selectedOptions.has('code-execution')) {
        capabilities.push('execute code and analyze data');
    }

    if (capabilities.length === 0) {
        return 'How can I help you today?';
    }

    if (capabilities.length === 1) {
        return `I can ${capabilities[0]}. How can I help you today?`;
    }

    const last = capabilities.pop();
    return `I can ${capabilities.join(', ')}, and ${last}. How can I help you today?`;
}

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
    if (lowerMessage.includes('image') && state.selectedOptions.has('image-creation')) {
        return `<p>I'd be happy to create an image for you! Here's a demo visualization:</p>
                <img src="https://picsum.photos/200/150" alt="Generated image demo">
                <p><em>(This is a demo - in production, I would generate a custom image based on your request)</em></p>`;
    }

    if ((lowerMessage.includes('search') || lowerMessage.includes('find')) &&
        (state.selectedOptions.has('simple-rag') || state.selectedOptions.has('custom-rag'))) {
        return `<p>I searched through your knowledge base and found 3 relevant documents:</p>
                <p>📄 <strong>Document_A.pdf</strong> - 95% relevance<br>
                📄 <strong>Report_2024.docx</strong> - 87% relevance<br>
                📄 <strong>Guidelines.pdf</strong> - 72% relevance</p>
                <p><em>(This is a demo response)</em></p>`;
    }

    if ((lowerMessage.includes('code') || lowerMessage.includes('data') || lowerMessage.includes('analyze')) &&
        state.selectedOptions.has('code-execution')) {
        return `<p>I can help with that! Here's a sample analysis:</p>
                <pre style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 0.8rem; overflow-x: auto;">
import pandas as pd
data = pd.read_csv('data.csv')
print(data.describe())

# Output:
# count: 1000
# mean: 45.2
# std: 12.8
                </pre>
                <p><em>(This is a demo - in production, I would execute real code)</em></p>`;
    }

    // Default response
    const responses = [
        "I understand your request. Based on my configuration, I can assist you with that. Let me process this information.",
        "Thank you for your message! I'm here to help. This demo shows how I would interact based on your selected configuration.",
        "Great question! In a production environment, I would leverage the configured capabilities to provide you with a comprehensive response.",
        "I've received your message. My capabilities allow me to handle various types of requests based on your configuration."
    ];

    return `<p>${responses[Math.floor(Math.random() * responses.length)]}</p>
            <p><em>(This is a demo response - actual responses would be based on your knowledge base and configuration)</em></p>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mobile basket toggle
function addMobileBasketToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'basket-toggle';
    toggle.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="badge">0</span>';
    toggle.addEventListener('click', () => {
        document.querySelector('.basket-panel').classList.toggle('active');
    });
    document.body.appendChild(toggle);
}

function updateMobileBasketBadge(count) {
    const badge = document.querySelector('.basket-toggle .badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
