// table-script.js
// Generic table renderer with sorting, pagination, search, and optional action column
import { loadData, showMessage } from "./script.js";

// Global table UI states
const tableStates = new Map();

export function createTableFromJSON(jsonData, containerId, tableName, isActionRequired = true, idField = null) {
    if (!Array.isArray(jsonData)) jsonData = [jsonData];

    // Initialize state if first time
    if (!tableStates.has(tableName)) {
        tableStates.set(tableName, {
            originalData: [],
            filteredData: [],
            currentPage: 1,
            rowsPerPage: 10,
            sortBy: null,
            sortDir: "asc",
            idField: null,
            isActionRequired: true
        });
    }

    const state = tableStates.get(tableName);
    state.originalData = [...jsonData];
    state.filteredData = [...jsonData];
    state.currentPage = 1;

    // Detect ID field if missing
    if (!idField) {
        idField = Object.keys(jsonData[0]).find(k => k.endsWith("_id")) || "id";
    }
    state.idField = idField;
    state.isActionRequired = isActionRequired;

    // Render search + rows per page controls
    renderControls(containerId, tableName);

    // Render table
    renderTable(containerId, tableName);
}

/* -----------------------------------
   RENDER CONTROLS (search + rows)
-------------------------------------- */
function renderControls(containerId, tableName) {
    const state = tableStates.get(tableName);
    const controlsId = containerId.replace("_record", "_controls");
    const controls = document.getElementById(controlsId);
    if (!controls) return;

    const searchId = containerId + "_search";
    const rowsId = containerId + "_rows";

    controls.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%;">
            <div>
                <input id="${searchId}" placeholder="Search..." style="padding:6px;">
                <button id="${searchId}_btn" style="padding:6px; margin-left:6px;">Search</button>
                <button id="${searchId}_clear" style="padding:6px; margin-left:6px;">Clear</button>
            </div>
            <div>
                <label>Rows per page:</label>
                <select id="${rowsId}" class="rows-per-page">
                    <option value="10" ${state.rowsPerPage === 10 ? "selected" : ""}>10</option>
                    <option value="20" ${state.rowsPerPage === 20 ? "selected" : ""}>20</option>
                    <option value="50" ${state.rowsPerPage === 50 ? "selected" : ""}>50</option>
                </select>
            </div>
        </div>
    `;

    document.getElementById(`${searchId}_btn`).onclick = () => {
        const term = document.getElementById(searchId).value.toLowerCase();
        applySearch(tableName, term, containerId);
    };

    document.getElementById(`${searchId}_clear`).onclick = () => {
        document.getElementById(searchId).value = "";
        applySearch(tableName, "", containerId);
    };

    document.getElementById(rowsId).onchange = (e) => {
        state.rowsPerPage = Number(e.target.value);
        state.currentPage = 1;
        renderTable(containerId, tableName);
    };
}

/* -----------------------------------
   SEARCH FILTERING
-------------------------------------- */
function applySearch(tableName, term, containerId) {
    const state = tableStates.get(tableName);

    if (!term) {
        state.filteredData = [...state.originalData];
    } else {
        const cols = Object.keys(state.originalData[0]);
        state.filteredData = state.originalData.filter(row =>
            cols.some(col =>
                row[col] != null && String(row[col]).toLowerCase().includes(term)
            )
        );
    }

    state.currentPage = 1;
    renderTable(containerId, tableName);
}

/* -----------------------------------
   SORTING
-------------------------------------- */
function applySort(state, field) {
    if (state.sortBy === field) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
    } else {
        state.sortBy = field;
        state.sortDir = "asc";
    }

    const dir = state.sortDir === "asc" ? 1 : -1;

    state.filteredData.sort((a, b) => {
        const av = a[field];
        const bv = b[field];

        if (!isNaN(av) && !isNaN(bv)) return (av - bv) * dir;

        const da = Date.parse(av);
        const db = Date.parse(bv);
        if (!isNaN(da) && !isNaN(db)) return (da - db) * dir;

        return String(av).localeCompare(String(bv)) * dir;
    });
}

/* -----------------------------------
   RENDER TABLE
-------------------------------------- */
function renderTable(containerId, tableName) {
    const state = tableStates.get(tableName);
    const container = document.getElementById(containerId);

    container.innerHTML = "";

    if (!state.filteredData.length) {
        container.innerHTML = "<p>No data found.</p>";
        renderPagination(containerId, tableName);
        return;
    }

    if (state.sortBy) applySort(state, state.sortBy);

    const total = state.filteredData.length;
    const perPage = state.rowsPerPage;
    const totalPages = Math.ceil(total / perPage);

    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const start = (state.currentPage - 1) * perPage;
    const pageData = state.filteredData.slice(start, start + perPage);

    const headers = Object.keys(pageData[0]).filter(h => !/id$/i.test(h));

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");

    headers.forEach(h => {
        const th = document.createElement("th");
        th.innerText = prettifyHeader(h);
        th.style.padding = "8px";
        th.style.border = "1px solid #ccc";
        th.style.cursor = "pointer";

        th.onclick = () => {
            applySort(state, h);
            renderTable(containerId, tableName);
        };

        if (state.sortBy === h) {
            th.innerText += state.sortDir === "asc" ? " ▲" : " ▼";
        }

        trHead.appendChild(th);
    });

    if (state.isActionRequired) {
        const act = document.createElement("th");
        act.innerText = "Action";
        act.style.padding = "8px";
        act.style.border = "1px solid #ccc";
        trHead.appendChild(act);
    }

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    pageData.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(h => {
            const td = document.createElement("td");
            td.innerText = row[h] ?? "";
            td.style.padding = "8px";
            td.style.border = "1px solid #ddd";
            tr.appendChild(td);
        });

        if (state.isActionRequired) {
            const actionTd = document.createElement("td");
            actionTd.style.padding = "8px";
            actionTd.style.border = "1px solid #ddd";

            const edit = document.createElement("button");
            edit.innerText = "Edit";
            edit.style.marginRight = "6px";
            edit.onclick = () => handleEdit(tableName, row[state.idField]);

            const del = document.createElement("button");
            del.innerText = "Delete";
            del.style.background = "#dc3545";
            del.style.color = "#fff";
            del.onclick = () => handleDelete(tableName, row[state.idField]);

            actionTd.appendChild(edit);
            actionTd.appendChild(del);
            tr.appendChild(actionTd);
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    renderPagination(containerId, tableName);
}

/* -----------------------------------
   PAGINATION
-------------------------------------- */
function renderPagination(containerId, tableName) {
    const state = tableStates.get(tableName);
    const paginationId = containerId.replace("_record", "_pagination");
    const container = document.getElementById(paginationId);
    if (!container) return;

    container.innerHTML = "";

    const total = state.filteredData.length;
    const perPage = state.rowsPerPage;
    const totalPages = Math.ceil(total / perPage);

    const prev = document.createElement("button");
    prev.innerText = "Prev";
    prev.disabled = state.currentPage === 1;
    prev.onclick = () => {
        state.currentPage--;
        renderTable(containerId, tableName);
    };
    container.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.disabled = i === state.currentPage;
        btn.onclick = () => {
            state.currentPage = i;
            renderTable(containerId, tableName);
        };
        container.appendChild(btn);
    }

    const next = document.createElement("button");
    next.innerText = "Next";
    next.disabled = state.currentPage === totalPages;
    next.onclick = () => {
        state.currentPage++;
        renderTable(containerId, tableName);
    };
    container.appendChild(next);
}

/* -----------------------------------
   HELPERS
-------------------------------------- */
function prettifyHeader(h) {
    return h.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* -----------------------------------
   EDIT & DELETE
-------------------------------------- */
export function handleEdit(tableName, id) {
    window.location.href = `/edit.html?table=${tableName}&id=${id}`;
}

export async function handleDelete(tableName, id) {
    if (!confirm(`Delete ID ${id}?`)) return;

    try {
        const res = await fetch(`/.netlify/functions/${tableName}-delete-item-by-id?id=${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            showMessage("Delete failed", "error");
            return;
        }

        showMessage("Deleted successfully", "success");
        loadData(`/.netlify/functions/${tableName}-get-items`, `${tableName}_record`, tableName);

    } catch (err) {
        showMessage("Network error", "error");
    }
}
