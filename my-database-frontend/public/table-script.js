// table-script.js
// Generic table renderer with sorting & pagination for multiple tables
import { loadData, showMessage } from "./script.js"; // your existing utilities

// Per-table UI state stored here
const tableStates = new Map();

/**
 * createTableFromJSON(jsonData, containerId, tableName, isActionRequired, idField = null)
 * - jsonData: array or single object
 * - containerId: id of the container where table will be injected
 * - tableName: name of table (used for API endpoints and state key)
 * - isActionRequired: boolean to add Edit/Delete action column
 * - idField: optional primary key field (defaults to *_id detection)
 */
export function createTableFromJSON(jsonData, containerId, tableName, isActionRequired = true, idField = null) {
    // Normalize array
    if (!Array.isArray(jsonData)) jsonData = [jsonData];

    // initialize state if needed
    if (!tableStates.has(tableName)) {
        tableStates.set(tableName, {
            originalData: [],    // full dataset
            filteredData: [],    // after search/filter
            currentPage: 1,
            rowsPerPage: 10,
            sortBy: null,        // field name
            sortDir: 'asc'       // 'asc' | 'desc'
        });
    }

    const state = tableStates.get(tableName);
    state.originalData = jsonData.slice(); // store original
    state.filteredData = jsonData.slice(); // initial same
    state.currentPage = 1; // reset page on data load

    // detect idField if not provided
    if (!idField) {
        idField = Object.keys(jsonData[0] || {}).find(k => k.endsWith('_id')) || 'id';
    }

    // Save idField to state for action handlers
    state.idField = idField;

    // Render controls (rows per page, search if needed)
    renderControls(containerId, tableName);

    // Render the table with current state
    renderTable(containerId, tableName, isActionRequired);
}

// --------------- Controls ----------------
function renderControls(containerId, tableName) {
    const state = tableStates.get(tableName);
    const controlsId = containerId.replace('_record','_controls');
    const controls = document.getElementById(controlsId);
    if (!controls) return;

    controls.innerHTML = '';

    // Left area: search box (only one exists in page for category; keep optional)
    const searchInputId = containerId + '_search';
    const searchHtml = `
        <div>
            <input id="${searchInputId}" placeholder="Search..." style="padding:6px;" />
            <button id="${searchInputId}_btn" style="padding:6px;margin-left:6px;">Search</button>
            <button id="${searchInputId}_clear" style="padding:6px;margin-left:6px;">Clear</button>
        </div>
    `;
    // Right area: rows per page selector
    const rightHtml = `
        <div>
            <label>Rows per page:</label>
            <select id="${containerId}_rows" class="rows-per-page">
                <option value="10" ${state.rowsPerPage===10?'selected':''}>10</option>
                <option value="20" ${state.rowsPerPage===20?'selected':''}>20</option>
                <option value="50" ${state.rowsPerPage===50?'selected':''}>50</option>
            </select>
        </div>
    `;

    controls.innerHTML = `<div style="display:flex;justify-content:space-between;width:100%">${searchHtml}${rightHtml}</div>`;

    // attach events
    document.getElementById(`${searchInputId}_btn`).onclick = () => {
        const term = document.getElementById(searchInputId).value.trim().toLowerCase();
        applySearch(tableName, term);
    };
    document.getElementById(`${searchInputId}_clear`).onclick = () => {
        document.getElementById(searchInputId).value = '';
        applySearch(tableName, '');
    };
    document.getElementById(`${containerId}_rows`).onchange = (e) => {
        state.rowsPerPage = Number(e.target.value);
        state.currentPage = 1;
        renderTable(containerId, tableName);
    };
}

// ------------ Search/filter -------------
function applySearch(tableName, term) {
    const state = tableStates.get(tableName);
    if (!state) return;
    if (!term) {
        state.filteredData = state.originalData.slice();
    } else {
        const columns = Object.keys(state.originalData[0] || {});
        state.filteredData = state.originalData.filter(row => {
            return columns.some(col => {
                const val = row[col];
                return val != null && String(val).toLowerCase().includes(term);
            });
        });
    }
    state.currentPage = 1;
    renderTable(`${tableName}_record`, tableName);
}

// ------------ Sorting -------------
function applySort(state, field) {
    if (state.sortBy === field) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortBy = field;
        state.sortDir = 'asc';
    }

    state.filteredData.sort((a, b) => {
        const av = a[field], bv = b[field];
        if (av == null && bv == null) return 0;
        if (av == null) return state.sortDir === 'asc' ? -1 : 1;
        if (bv == null) return state.sortDir === 'asc' ? 1 : -1;

        // numeric?
        if (!isNaN(Number(av)) && !isNaN(Number(bv))) {
            return state.sortDir === 'asc' ? (Number(av) - Number(bv)) : (Number(bv) - Number(av));
        }

        // date?
        const da = Date.parse(av), db = Date.parse(bv);
        if (!isNaN(da) && !isNaN(db)) {
            return state.sortDir === 'asc' ? (da - db) : (db - da);
        }

        // string fallback
        return state.sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
}

// ------------ Render Table -------------
function renderTable(containerId, tableName, isActionRequired = true) {
    const state = tableStates.get(tableName);
    if (!state) return;

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // clear

    if (!state.filteredData || state.filteredData.length === 0) {
        container.innerHTML = '<p>No data available</p>';
        // clear pagination
        renderPagination(containerId, tableName);
        return;
    }

    // Apply sorting if set
    if (state.sortBy) applySort(state, state.sortBy);

    // Paging
    const total = state.filteredData.length;
    const perPage = state.rowsPerPage || 10;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    const start = (state.currentPage - 1) * perPage;
    const pageData = state.filteredData.slice(start, start + perPage);

    // build table
    const headers = Object.keys(state.filteredData[0]);

    const table = document.createElement('table');
    table.className = 'table-sortable';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // thead
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.innerText = prettifyHeader(h);
        th.style.border = '1px solid #ccc';
        th.style.padding = '8px';
        th.onclick = () => {
            state.sortBy = h;
            applySort(state, h);
            renderTable(containerId, tableName, isActionRequired);
        };
        if (state.sortBy === h) {
            th.classList.add('active-sort');
            th.innerText += state.sortDir === 'asc' ? ' ▲' : ' ▼';
        }
        hr.appendChild(th);
    });

    if (isActionRequired) {
        const ath = document.createElement('th');
        ath.innerText = 'Action';
        ath.style.border = '1px solid #ccc';
        ath.style.padding = '8px';
        hr.appendChild(ath);
    }

    thead.appendChild(hr);
    table.appendChild(thead);

    // tbody
    const tbody = document.createElement('tbody');
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            td.innerText = row[h] != null ? row[h] : '';
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            tr.appendChild(td);
        });

        if (isActionRequired) {
            const actionTd = document.createElement('td');
            actionTd.style.border = '1px solid #ddd';
            actionTd.style.padding = '8px';

            // Edit
            const editBtn = document.createElement('button');
            editBtn.innerText = 'Edit';
            editBtn.style.marginRight = '6px';
            editBtn.onclick = () => handleEdit(tableName, row[state.idField]);

            // Delete
            const delBtn = document.createElement('button');
            delBtn.innerText = 'Delete';
            delBtn.style.background = '#dc3545';
            delBtn.style.color = '#fff';
            delBtn.onclick = () => handleDelete(tableName, row[state.idField]);

            actionTd.appendChild(editBtn);
            actionTd.appendChild(delBtn);
            tr.appendChild(actionTd);
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    // render pagination controls
    renderPagination(containerId, tableName);
}

// ------------- Pagination ---------------
function renderPagination(containerId, tableName) {
    const state = tableStates.get(tableName);
    if (!state) return;

    const paginationId = containerId.replace('_record','_pagination');
    const container = document.getElementById(paginationId);
    if (!container) return;

    container.innerHTML = ''; // clear

    const total = state.filteredData.length;
    const perPage = state.rowsPerPage || 10;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const current = state.currentPage;

    // Prev
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Prev';
    prevBtn.disabled = current === 1;
    prevBtn.onclick = () => { state.currentPage = Math.max(1, current - 1); renderTable(containerId, tableName); };
    container.appendChild(prevBtn);

    // page numbers: show upto 7 with sliding window
    const maxButtons = 7;
    let startPage = Math.max(1, current - Math.floor(maxButtons/2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) startPage = Math.max(1, endPage - maxButtons + 1);

    for (let i = startPage; i <= endPage; i++) {
        const b = document.createElement('button');
        b.innerText = i;
        b.disabled = (i === current);
        b.onclick = (() => { const page = i; return () => { state.currentPage = page; renderTable(containerId, tableName); }; })();
        container.appendChild(b);
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.disabled = current === totalPages;
    nextBtn.onclick = () => { state.currentPage = Math.min(totalPages, current + 1); renderTable(containerId, tableName); };
    container.appendChild(nextBtn);

    // show total
    const info = document.createElement('span');
    info.style.marginLeft = '10px';
    info.innerText = ` Page ${current} of ${totalPages} (${total} items)`;
    container.appendChild(info);
}

// --------------- Helpers ----------------
function prettifyHeader(h) {
    // convert snake_case to "Title Case"
    return h.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}

// --------------- Edit & Delete (exported) ---------------
export function handleEdit(tableName, id) {
    window.location.href = `/edit.html?table=${encodeURIComponent(tableName)}&id=${encodeURIComponent(id)}`;
}

export async function handleDelete(tableName, id) {
    if (!confirm(`Are you sure you want to delete ID ${id} from ${tableName}?`)) return;

    try {
        const response = await fetch(`/.netlify/functions/${tableName}-delete-item-by-id?id=${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const status = response.status;
            if (status === 404) showMessage(`Record not found for ID ${id} in ${tableName}`, 'error');
            else if (status === 400) showMessage('Invalid ID or missing parameter', 'error');
            else showMessage('Server error. Try again later.', 'error');
            return;
        }

        // reload data for this table
        showMessage(`Deleted ${tableName} record with ID = ${id}`, 'success');
        loadData(`/.netlify/functions/${tableName}-get-items`, `${tableName}_record`, tableName);
    } catch (err) {
        console.error('Delete error', err);
        showMessage('Network error while deleting record', 'error');
    }
}
