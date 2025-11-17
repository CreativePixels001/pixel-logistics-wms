/**
 * Enhanced Data Table Library - Phase 7
 * Professional table component with sorting, filtering, pagination, and bulk operations
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
            onRowClick: options.onRowClick || null,
            onSelectionChange: options.onSelectionChange || null,
            actions: options.actions || [],
            emptyMessage: options.emptyMessage || 'No data available'
        };

        this.state = {
            currentPage: 1,
            sortColumn: null,
            sortDirection: 'asc',
            filters: {},
            searchTerm: '',
            selectedRows: new Set(),
            filteredData: [],
            columnVisibility: {}
        };

        // Initialize column visibility
        this.options.columns.forEach(col => {
            this.state.columnVisibility[col.field] = col.hidden !== true;
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
                <div class="enhanced-table-container">
                    <table class="enhanced-table">
                        ${this.renderHeader()}
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
                            <i class="fas fa-search"></i>
                            <input type="text" class="search-input" placeholder="Search..." value="${this.state.searchTerm}">
                        </div>
                    ` : ''}
                    ${this.options.filterable ? `
                        <button class="btn btn-outline btn-sm" data-action="filter">
                            <i class="fas fa-filter"></i> Filters
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" data-action="columns">
                        <i class="fas fa-columns"></i> Columns
                    </button>
                </div>
                <div class="toolbar-right">
                    ${selectedCount > 0 ? `
                        <span class="selected-count">${selectedCount} selected</span>
                        ${this.renderBulkActions()}
                    ` : ''}
                    ${this.options.exportable ? `
                        <div class="dropdown">
                            <button class="btn btn-outline btn-sm" data-action="export">
                                <i class="fas fa-download"></i> Export
                            </button>
                            <div class="dropdown-menu">
                                <a href="#" data-action="export-csv">Export as CSV</a>
                                <a href="#" data-action="export-excel">Export as Excel</a>
                                <a href="#" data-action="export-pdf">Export as PDF</a>
                            </div>
                        </div>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" data-action="refresh">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderBulkActions() {
        if (!this.options.actions || this.options.actions.length === 0) return '';
        
        return `
            <div class="dropdown">
                <button class="btn btn-primary btn-sm">
                    <i class="fas fa-ellipsis-v"></i> Actions
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

    renderHeader() {
        const visibleColumns = this.options.columns.filter(col => this.state.columnVisibility[col.field]);
        
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
        const isSorted = this.state.sortColumn === column.field;
        const sortIcon = isSorted 
            ? (this.state.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down')
            : 'fa-sort';
        
        return `
            <th data-field="${column.field}" ${column.sortable !== false && this.options.sortable ? 'class="sortable"' : ''}>
                <div class="th-content">
                    <span>${column.label}</span>
                    ${column.sortable !== false && this.options.sortable ? `
                        <i class="fas ${sortIcon} sort-icon"></i>
                    ` : ''}
                </div>
            </th>
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

        const visibleColumns = this.options.columns.filter(col => this.state.columnVisibility[col.field]);

        return `
            <tbody>
                ${pageData.map((row, index) => `
                    <tr data-row-index="${start + index}" ${this.state.selectedRows.has(start + index) ? 'class="selected"' : ''}>
                        ${this.options.selectable ? `
                            <td class="select-column">
                                <input type="checkbox" class="select-row" ${this.state.selectedRows.has(start + index) ? 'checked' : ''}>
                            </td>
                        ` : ''}
                        ${visibleColumns.map(col => this.renderCell(row, col)).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;
    }

    renderCell(row, column) {
        let value = row[column.field];
        
        if (column.render) {
            value = column.render(value, row);
        } else if (column.type === 'date') {
            value = value ? new Date(value).toLocaleDateString() : '-';
        } else if (column.type === 'number') {
            value = value !== null && value !== undefined ? value.toLocaleString() : '-';
        } else if (column.type === 'currency') {
            value = value !== null && value !== undefined ? `$${value.toLocaleString()}` : '-';
        } else if (column.type === 'badge') {
            const badgeClass = column.badgeClass ? column.badgeClass(value, row) : '';
            value = `<span class="badge ${badgeClass}">${value}</span>`;
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
                    Showing ${start} to ${end} of ${this.state.filteredData.length} entries
                    ${this.state.searchTerm || Object.keys(this.state.filters).length > 0 
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
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button class="btn btn-sm" data-action="prev-page" ${this.state.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-left"></i>
                    </button>
                    <span class="page-numbers">
                        Page ${this.state.currentPage} of ${totalPages}
                    </span>
                    <button class="btn btn-sm" data-action="next-page" ${this.state.currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-right"></i>
                    </button>
                    <button class="btn btn-sm" data-action="last-page" ${this.state.currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-right"></i>
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
            searchInput.addEventListener('input', (e) => {
                this.state.searchTerm = e.target.value;
                this.state.currentPage = 1;
                this.applyFiltersAndSort();
            });
        }

        // Sort
        container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.field;
                if (this.state.sortColumn === field) {
                    this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.state.sortColumn = field;
                    this.state.sortDirection = 'asc';
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
                    if (!e.target.closest('.select-row')) {
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

        // Refresh
        container.querySelector('[data-action="refresh"]')?.addEventListener('click', () => this.refresh());

        // Export
        container.querySelector('[data-action="export-csv"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportToCSV();
        });
    }

    applyFiltersAndSort() {
        let data = [...this.options.data];

        // Apply search
        if (this.state.searchTerm) {
            const term = this.state.searchTerm.toLowerCase();
            data = data.filter(row => {
                return this.options.columns.some(col => {
                    const value = row[col.field];
                    return value && value.toString().toLowerCase().includes(term);
                });
            });
        }

        // Apply filters
        Object.keys(this.state.filters).forEach(field => {
            const filterValue = this.state.filters[field];
            if (filterValue) {
                data = data.filter(row => row[field] === filterValue);
            }
        });

        // Apply sort
        if (this.state.sortColumn) {
            data.sort((a, b) => {
                const aVal = a[this.state.sortColumn];
                const bVal = b[this.state.sortColumn];
                
                if (aVal < bVal) return this.state.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.state.sortDirection === 'asc' ? 1 : -1;
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

    getColumnCount() {
        const visibleColumns = this.options.columns.filter(col => this.state.columnVisibility[col.field]);
        return visibleColumns.length + (this.options.selectable ? 1 : 0);
    }

    updateToolbar() {
        const toolbar = this.container.querySelector('.toolbar-right');
        if (toolbar) {
            toolbar.innerHTML = `
                ${this.state.selectedRows.size > 0 ? `
                    <span class="selected-count">${this.state.selectedRows.size} selected</span>
                    ${this.renderBulkActions()}
                ` : ''}
                ${this.options.exportable ? `
                    <button class="btn btn-outline btn-sm" data-action="export">
                        <i class="fas fa-download"></i> Export
                    </button>
                ` : ''}
                <button class="btn btn-outline btn-sm" data-action="refresh">
                    <i class="fas fa-sync"></i>
                </button>
            `;
        }
    }

    getSelectedData() {
        return Array.from(this.state.selectedRows).map(index => this.state.filteredData[index]);
    }

    refresh() {
        this.container.innerHTML = this.renderTable();
        this.attachEventListeners();
    }

    exportToCSV() {
        const visibleColumns = this.options.columns.filter(col => this.state.columnVisibility[col.field]);
        const headers = visibleColumns.map(col => col.label).join(',');
        const rows = this.state.filteredData.map(row => {
            return visibleColumns.map(col => {
                let value = row[col.field];
                if (value === null || value === undefined) value = '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.csv';
        a.click();
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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedDataTable;
}
