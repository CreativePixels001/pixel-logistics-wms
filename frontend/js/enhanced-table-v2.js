/**
 * Enhanced Data Table Library v2 - Complete Phase 7 Implementation
 * Advanced features: Multi-sort, column filters, column management, Excel/PDF export
 */

class EnhancedDataTable {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        this.options = {
            data: options.data || [],
            columns: options.columns || [],
            pageSize: options.pageSize || 25,
            pageSizeOptions: options.pageSizeOptions || [10, 25, 50, 100],
            sortable: options.sortable !== false,
            filterable: options.filterable !== false,
            searchable: options.searchable !== false,
            selectable: options.selectable !== false,
            exportable: options.exportable !== false,
            multiSort: options.multiSort !== false,
            columnReorder: options.columnReorder !== false,
            onRowClick: options.onRowClick || null,
            onSelectionChange: options.onSelectionChange || null,
            actions: options.actions || [],
            emptyMessage: options.emptyMessage || 'No data available'
        };

        this.state = {
            currentPage: 1,
            sortColumns: [], // [{field: 'name', direction: 'asc'}]
            columnFilters: {},
            searchTerm: '',
            selectedRows: new Set(),
            filteredData: [],
            columnVisibility: {},
            columnOrder: [],
            showFilterRow: false,
            showColumnManager: false
        };

        // Initialize column visibility and order
        this.options.columns.forEach((col, index) => {
            this.state.columnVisibility[col.field] = col.hidden !== true;
            this.state.columnOrder.push(col.field);
        });

        this.init();
    }

    init() {
        this.container.innerHTML = this.renderTable();
        this.attachEventListeners();
        this.applyFiltersAndSort();
    }

    renderTable() {
        return `
            <div class="enhanced-table-wrapper">
                ${this.renderToolbar()}
                ${this.renderColumnManager()}
                <div class="enhanced-table-container">
                    <table class="enhanced-table">
                        ${this.renderHeader()}
                        ${this.state.showFilterRow ? this.renderFilterRow() : ''}
                        ${this.renderBody()}
                    </table>
                </div>
                ${this.renderPagination()}
            </div>
        `;
    }

    renderToolbar() {
        const selectedCount = this.state.selectedRows.size;
        
        return `
            <div class="table-toolbar">
                <div class="toolbar-left">
                    ${this.options.searchable ? `
                        <div class="table-search">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input type="text" class="search-input" placeholder="Search..." value="${this.state.searchTerm}">
                        </div>
                    ` : ''}
                    ${this.options.filterable ? `
                        <button class="btn btn-outline btn-sm" data-action="toggle-filters">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            ${this.state.showFilterRow ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" data-action="toggle-columns">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Columns
                    </button>
                </div>
                <div class="toolbar-right">
                    ${selectedCount > 0 ? `
                        <span class="selected-count">${selectedCount} selected</span>
                        ${this.renderBulkActions()}
                    ` : ''}
                    ${this.options.exportable ? `
                        <div class="dropdown export-dropdown">
                            <button class="btn btn-outline btn-sm" data-action="export">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Export
                            </button>
                            <div class="dropdown-menu">
                                <a href="#" data-action="export-csv">CSV</a>
                                <a href="#" data-action="export-excel">Excel</a>
                                <a href="#" data-action="export-pdf">PDF</a>
                            </div>
                        </div>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" data-action="refresh">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6"></path>
                            <path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderBulkActions() {
        if (!this.options.actions || this.options.actions.length === 0) return '';
        
        return `
            <div class="dropdown actions-dropdown">
                <button class="btn btn-primary btn-sm">
                    Actions
                </button>
                <div class="dropdown-menu">
                    ${this.options.actions.map(action => `
                        <a href="#" data-bulk-action="${action.id}">
                            ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                            ${action.label}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderColumnManager() {
        if (!this.state.showColumnManager) return '';
        
        const orderedColumns = this.state.columnOrder
            .map(field => this.options.columns.find(col => col.field === field))
            .filter(col => col);
        
        return `
            <div class="column-manager">
                <div class="column-manager-header">
                    <h4>Manage Columns</h4>
                    <button class="close-btn" data-action="close-column-manager">&times;</button>
                </div>
                <div class="column-manager-body">
                    <div class="column-manager-hint">
                        Drag to reorder • Toggle visibility
                    </div>
                    <div class="column-list">
                        ${orderedColumns.map((col, index) => `
                            <div class="column-item" data-field="${col.field}" draggable="true">
                                <svg class="drag-handle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </svg>
                                <label>
                                    <input type="checkbox" 
                                           data-column-toggle="${col.field}"
                                           ${this.state.columnVisibility[col.field] ? 'checked' : ''}>
                                    <span>${col.label}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="column-manager-actions">
                        <button class="btn btn-outline btn-sm" data-action="reset-columns">Reset to Default</button>
                        <button class="btn btn-primary btn-sm" data-action="apply-columns">Apply</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderHeader() {
        const visibleColumns = this.getVisibleColumns();
        
        return `
            <thead>
                <tr>
                    ${this.options.selectable ? `
                        <th class="select-column">
                            <input type="checkbox" class="select-all">
                        </th>
                    ` : ''}
                    ${visibleColumns.map(col => this.renderHeaderCell(col)).join('')}
                </tr>
            </thead>
        `;
    }

    renderHeaderCell(column) {
        const sortInfo = this.state.sortColumns.find(s => s.field === column.field);
        const sortIndex = this.state.sortColumns.findIndex(s => s.field === column.field);
        const isSortable = column.sortable !== false && this.options.sortable;
        
        let sortIcon = '';
        if (isSortable) {
            if (sortInfo) {
                sortIcon = sortInfo.direction === 'asc' 
                    ? '<svg class="sort-icon active" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>'
                    : '<svg class="sort-icon active" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>';
                if (this.state.sortColumns.length > 1) {
                    sortIcon += `<span class="sort-index">${sortIndex + 1}</span>`;
                }
            } else {
                sortIcon = '<svg class="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"/></svg>';
            }
        }
        
        return `
            <th data-field="${column.field}" 
                ${isSortable ? 'class="sortable"' : ''}
                style="${column.width ? 'width: ' + column.width : ''}">
                <div class="th-content">
                    <span>${column.label}</span>
                    ${sortIcon}
                </div>
            </th>
        `;
    }

    renderFilterRow() {
        const visibleColumns = this.getVisibleColumns();
        
        return `
            <thead class="filter-row">
                <tr>
                    ${this.options.selectable ? '<th class="select-column"></th>' : ''}
                    ${visibleColumns.map(col => `
                        <th>
                            ${this.renderColumnFilter(col)}
                        </th>
                    `).join('')}
                </tr>
            </thead>
        `;
    }

    renderColumnFilter(column) {
        if (column.filterable === false) return '';
        
        const filterValue = this.state.columnFilters[column.field] || '';
        
        if (column.filterType === 'select' && column.filterOptions) {
            return `
                <select class="column-filter" data-field="${column.field}">
                    <option value="">All</option>
                    ${column.filterOptions.map(opt => `
                        <option value="${opt.value}" ${filterValue === opt.value ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            `;
        }
        
        return `
            <input type="${column.type === 'number' ? 'number' : 'text'}" 
                   class="column-filter" 
                   data-field="${column.field}"
                   placeholder="Filter..."
                   value="${filterValue}">
        `;
    }

    renderBody() {
        const start = (this.state.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        const pageData = this.state.filteredData.slice(start, end);

        if (pageData.length === 0) {
            return `
                <tbody>
                    <tr>
                        <td colspan="${this.getColumnCount()}" class="empty-message">
                            ${this.options.emptyMessage}
                        </td>
                    </tr>
                </tbody>
            `;
        }

        const visibleColumns = this.getVisibleColumns();

        return `
            <tbody>
                ${pageData.map((row, index) => {
                    const globalIndex = start + index;
                    return `
                        <tr data-row-index="${globalIndex}" 
                            ${this.state.selectedRows.has(globalIndex) ? 'class="selected"' : ''}>
                            ${this.options.selectable ? `
                                <td class="select-column">
                                    <input type="checkbox" class="select-row" 
                                           ${this.state.selectedRows.has(globalIndex) ? 'checked' : ''}>
                                </td>
                            ` : ''}
                            ${visibleColumns.map(col => this.renderCell(row, col)).join('')}
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
    }

    renderCell(row, column) {
        let value = row[column.field];
        
        if (column.render) {
            value = column.render(value, row);
        } else if (column.type === 'date' && value) {
            value = new Date(value).toLocaleDateString();
        } else if (column.type === 'number' && value !== null && value !== undefined) {
            value = value.toLocaleString();
        } else if (column.type === 'currency' && value !== null && value !== undefined) {
            value = `$${value.toLocaleString()}`;
        } else if (column.type === 'badge') {
            const badgeClass = column.badgeClass ? column.badgeClass(value, row) : '';
            value = `<span class="badge ${badgeClass}">${value || '-'}</span>`;
        } else if (value === null || value === undefined) {
            value = '-';
        }

        return `<td>${value}</td>`;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.state.filteredData.length / this.options.pageSize);
        const start = (this.state.currentPage - 1) * this.options.pageSize + 1;
        const end = Math.min(start + this.options.pageSize - 1, this.state.filteredData.length);

        return `
            <div class="table-pagination">
                <div class="pagination-info">
                    Showing ${this.state.filteredData.length > 0 ? start : 0} to ${end} of ${this.state.filteredData.length} entries
                    ${this.state.searchTerm || Object.keys(this.state.columnFilters).length > 0 
                        ? `(filtered from ${this.options.data.length} total)` 
                        : ''}
                </div>
                <div class="pagination-controls">
                    <select class="page-size-select">
                        ${this.options.pageSizeOptions.map(size => `
                            <option value="${size}" ${size === this.options.pageSize ? 'selected' : ''}>
                                ${size} per page
                            </option>
                        `).join('')}
                    </select>
                    <button class="btn btn-sm" data-action="first-page" ${this.state.currentPage === 1 ? 'disabled' : ''}>
                        «
                    </button>
                    <button class="btn btn-sm" data-action="prev-page" ${this.state.currentPage === 1 ? 'disabled' : ''}>
                        ‹
                    </button>
                    <span class="page-numbers">
                        Page ${this.state.currentPage} of ${totalPages || 1}
                    </span>
                    <button class="btn btn-sm" data-action="next-page" ${this.state.currentPage === totalPages ? 'disabled' : ''}>
                        ›
                    </button>
                    <button class="btn btn-sm" data-action="last-page" ${this.state.currentPage === totalPages ? 'disabled' : ''}>
                        »
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const container = this.container;

        // Search
        const searchInput = container.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.state.searchTerm = e.target.value;
                    this.state.currentPage = 1;
                    this.applyFiltersAndSort();
                }, 300);
            });
        }

        // Column filters
        container.querySelectorAll('.column-filter').forEach(input => {
            let filterTimeout;
            input.addEventListener('input', (e) => {
                clearTimeout(filterTimeout);
                filterTimeout = setTimeout(() => {
                    const field = input.dataset.field;
                    this.state.columnFilters[field] = e.target.value;
                    this.state.currentPage = 1;
                    this.applyFiltersAndSort();
                }, 300);
            });
        });

        // Sort (multi-column with Shift key)
        container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', (e) => {
                const field = th.dataset.field;
                
                if (e.shiftKey && this.options.multiSort) {
                    // Multi-column sort
                    const existingIndex = this.state.sortColumns.findIndex(s => s.field === field);
                    if (existingIndex >= 0) {
                        const current = this.state.sortColumns[existingIndex];
                        if (current.direction === 'asc') {
                            this.state.sortColumns[existingIndex].direction = 'desc';
                        } else {
                            this.state.sortColumns.splice(existingIndex, 1);
                        }
                    } else {
                        this.state.sortColumns.push({ field, direction: 'asc' });
                    }
                } else {
                    // Single column sort
                    const existing = this.state.sortColumns.find(s => s.field === field);
                    if (existing) {
                        if (existing.direction === 'asc') {
                            this.state.sortColumns = [{ field, direction: 'desc' }];
                        } else {
                            this.state.sortColumns = [];
                        }
                    } else {
                        this.state.sortColumns = [{ field, direction: 'asc' }];
                    }
                }
                
                this.applyFiltersAndSort();
            });
        });

        // Select all
        const selectAll = container.querySelector('.select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const start = (this.state.currentPage - 1) * this.options.pageSize;
                const end = start + this.options.pageSize;
                
                if (e.target.checked) {
                    for (let i = start; i < Math.min(end, this.state.filteredData.length); i++) {
                        this.state.selectedRows.add(i);
                    }
                } else {
                    for (let i = start; i < Math.min(end, this.state.filteredData.length); i++) {
                        this.state.selectedRows.delete(i);
                    }
                }
                this.refresh();
            });
        }

        // Select row
        container.querySelectorAll('.select-row').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const row = e.target.closest('tr');
                const index = parseInt(row.dataset.rowIndex);
                
                if (e.target.checked) {
                    this.state.selectedRows.add(index);
                } else {
                    this.state.selectedRows.delete(index);
                }
                
                row.classList.toggle('selected', e.target.checked);
                this.updateToolbar();
                
                if (this.options.onSelectionChange) {
                    this.options.onSelectionChange(this.getSelectedData());
                }
            });
        });

        // Row click
        if (this.options.onRowClick) {
            container.querySelectorAll('tbody tr').forEach(tr => {
                tr.addEventListener('click', (e) => {
                    if (!e.target.closest('.select-row') && !e.target.closest('button')) {
                        const index = parseInt(tr.dataset.rowIndex);
                        this.options.onRowClick(this.state.filteredData[index], index);
                    }
                });
            });
        }

        // Pagination
        container.querySelector('[data-action="first-page"]')?.addEventListener('click', () => this.goToPage(1));
        container.querySelector('[data-action="prev-page"]')?.addEventListener('click', () => this.goToPage(this.state.currentPage - 1));
        container.querySelector('[data-action="next-page"]')?.addEventListener('click', () => this.goToPage(this.state.currentPage + 1));
        container.querySelector('[data-action="last-page"]')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.state.filteredData.length / this.options.pageSize);
            this.goToPage(totalPages);
        });

        // Page size
        const pageSizeSelect = container.querySelector('.page-size-select');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.options.pageSize = parseInt(e.target.value);
                this.state.currentPage = 1;
                this.refresh();
            });
        }

        // Toggle filters
        container.querySelector('[data-action="toggle-filters"]')?.addEventListener('click', () => {
            this.state.showFilterRow = !this.state.showFilterRow;
            this.refresh();
        });

        // Toggle columns
        container.querySelector('[data-action="toggle-columns"]')?.addEventListener('click', () => {
            this.state.showColumnManager = !this.state.showColumnManager;
            this.refresh();
        });

        // Close column manager
        container.querySelector('[data-action="close-column-manager"]')?.addEventListener('click', () => {
            this.state.showColumnManager = false;
            this.refresh();
        });

        // Column visibility toggles
        container.querySelectorAll('[data-column-toggle]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const field = e.target.dataset.columnToggle;
                this.state.columnVisibility[field] = e.target.checked;
            });
        });

        // Reset columns
        container.querySelector('[data-action="reset-columns"]')?.addEventListener('click', () => {
            this.state.columnOrder = this.options.columns.map(col => col.field);
            this.options.columns.forEach(col => {
                this.state.columnVisibility[col.field] = col.hidden !== true;
            });
            this.refresh();
        });

        // Apply columns
        container.querySelector('[data-action="apply-columns"]')?.addEventListener('click', () => {
            this.state.showColumnManager = false;
            this.refresh();
        });

        // Drag and drop for column reordering
        this.attachDragListeners();

        // Refresh
        container.querySelector('[data-action="refresh"]')?.addEventListener('click', () => this.refresh());

        // Export
        container.querySelector('[data-action="export-csv"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportToCSV();
        });
        
        container.querySelector('[data-action="export-excel"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportToExcel();
        });
        
        container.querySelector('[data-action="export-pdf"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportToPDF();
        });

        // Bulk actions
        container.querySelectorAll('[data-bulk-action]').forEach(action => {
            action.addEventListener('click', (e) => {
                e.preventDefault();
                const actionId = action.dataset.bulkAction;
                const selectedData = this.getSelectedData();
                const actionConfig = this.options.actions.find(a => a.id === actionId);
                
                if (actionConfig && actionConfig.handler) {
                    actionConfig.handler(selectedData);
                } else {
                    console.log('Bulk action:', actionId, selectedData);
                }
            });
        });
    }

    attachDragListeners() {
        const container = this.container;
        let draggedItem = null;

        container.querySelectorAll('.column-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem !== item) {
                    const allItems = Array.from(container.querySelectorAll('.column-item'));
                    const draggedIndex = allItems.indexOf(draggedItem);
                    const targetIndex = allItems.indexOf(item);

                    // Reorder in state
                    const draggedField = this.state.columnOrder[draggedIndex];
                    this.state.columnOrder.splice(draggedIndex, 1);
                    this.state.columnOrder.splice(targetIndex, 0, draggedField);

                    this.refresh();
                }
            });
        });
    }

    applyFiltersAndSort() {
        let data = [...this.options.data];

        // Apply global search
        if (this.state.searchTerm) {
            const term = this.state.searchTerm.toLowerCase();
            data = data.filter(row => {
                return this.options.columns.some(col => {
                    const value = row[col.field];
                    return value && value.toString().toLowerCase().includes(term);
                });
            });
        }

        // Apply column filters
        Object.keys(this.state.columnFilters).forEach(field => {
            const filterValue = this.state.columnFilters[field];
            if (filterValue) {
                const column = this.options.columns.find(col => col.field === field);
                data = data.filter(row => {
                    const value = row[field];
                    if (column && column.type === 'number') {
                        return value === parseFloat(filterValue);
                    }
                    return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });

        // Apply multi-column sort
        if (this.state.sortColumns.length > 0) {
            data.sort((a, b) => {
                for (let sortInfo of this.state.sortColumns) {
                    const aVal = a[sortInfo.field];
                    const bVal = b[sortInfo.field];
                    
                    let comparison = 0;
                    if (aVal < bVal) comparison = -1;
                    else if (aVal > bVal) comparison = 1;
                    
                    if (comparison !== 0) {
                        return sortInfo.direction === 'asc' ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }

        this.state.filteredData = data;
        this.refresh();
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.state.filteredData.length / this.options.pageSize);
        this.state.currentPage = Math.max(1, Math.min(page, totalPages));
        this.refresh();
    }

    getVisibleColumns() {
        return this.state.columnOrder
            .map(field => this.options.columns.find(col => col.field === field))
            .filter(col => col && this.state.columnVisibility[col.field]);
    }

    getColumnCount() {
        const visibleColumns = this.getVisibleColumns();
        return visibleColumns.length + (this.options.selectable ? 1 : 0);
    }

    updateToolbar() {
        const toolbarRight = this.container.querySelector('.toolbar-right');
        if (!toolbarRight) return;

        const selectedCount = this.state.selectedRows.size;
        const exportBtn = toolbarRight.querySelector('[data-action="export"]');
        const refreshBtn = toolbarRight.querySelector('[data-action="refresh"]');

        let html = '';
        if (selectedCount > 0) {
            html += `<span class="selected-count">${selectedCount} selected</span>`;
            html += this.renderBulkActions();
        }
        if (this.options.exportable && exportBtn) {
            html += exportBtn.parentElement.outerHTML;
        }
        if (refreshBtn) {
            html += refreshBtn.outerHTML;
        }

        toolbarRight.innerHTML = html;
        this.attachEventListeners();
    }

    getSelectedData() {
        return Array.from(this.state.selectedRows).map(index => this.state.filteredData[index]);
    }

    refresh() {
        this.container.innerHTML = this.renderTable();
        this.attachEventListeners();
    }

    exportToCSV() {
        const visibleColumns = this.getVisibleColumns();
        const headers = visibleColumns.map(col => col.label).join(',');
        const rows = this.state.filteredData.map(row => {
            return visibleColumns.map(col => {
                let value = row[col.field];
                if (value === null || value === undefined) value = '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csv = [headers, ...rows].join('\n');
        this.downloadFile(csv, 'export.csv', 'text/csv');
    }

    exportToExcel() {
        const visibleColumns = this.getVisibleColumns();
        
        // Create simple Excel-compatible HTML table
        let html = '<html><head><meta charset="utf-8"></head><body><table>';
        html += '<thead><tr>';
        visibleColumns.forEach(col => {
            html += `<th style="background:#000;color:#fff;font-weight:bold;padding:8px;">${col.label}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        this.state.filteredData.forEach(row => {
            html += '<tr>';
            visibleColumns.forEach(col => {
                let value = row[col.field];
                if (value === null || value === undefined) value = '';
                html += `<td style="padding:6px;">${value}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></body></html>';
        
        this.downloadFile(html, 'export.xls', 'application/vnd.ms-excel');
    }

    exportToPDF() {
        // Simple PDF export using print
        const visibleColumns = this.getVisibleColumns();
        const printWindow = window.open('', '', 'width=800,height=600');
        
        let html = `
            <html>
            <head>
                <title>Export</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background: #000; color: #fff; font-weight: bold; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h2>Data Export</h2>
                <button onclick="window.print()">Print to PDF</button>
                <table>
                    <thead><tr>
                        ${visibleColumns.map(col => `<th>${col.label}</th>`).join('')}
                    </tr></thead>
                    <tbody>
                        ${this.state.filteredData.map(row => `
                            <tr>
                                ${visibleColumns.map(col => {
                                    let value = row[col.field];
                                    if (value === null || value === undefined) value = '';
                                    return `<td>${value}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    setData(data) {
        this.options.data = data;
        this.state.currentPage = 1;
        this.state.selectedRows.clear();
        this.applyFiltersAndSort();
    }

    destroy() {
        this.container.innerHTML = '';
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.EnhancedDataTable = EnhancedDataTable;
}
