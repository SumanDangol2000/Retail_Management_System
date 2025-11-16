import { loadData, showMessage } from "./script.js";

export function createTableFromJSON(jsonData, containerId, tableName, idField = null) {
    // Convert single object to array
    if (!Array.isArray(jsonData)) {
        jsonData = [jsonData];
    }

    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear previous content

    if (jsonData.length === 0) {
        container.innerHTML = "<p>No data available</p>";
        return;
    }

    // Automatically detect the primary ID field (any field that ends with "_id")
    if (!idField) {
        idField = Object.keys(jsonData[0]).find(key => key.endsWith("_id")) || "id";
    }

    // Extract headers
    const headers = Object.keys(jsonData[0]);

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // HEADER
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(key => {
        const th = document.createElement("th");
        th.innerText = key;
        th.style.border = "1px solid black";
        th.style.padding = "8px";
        th.style.background = "#f0f0f0";
        headerRow.appendChild(th);
    });

    // Action column
    const actionTh = document.createElement("th");
    actionTh.innerText = "Action";
    actionTh.style.border = "1px solid black";
    actionTh.style.padding = "8px";
    actionTh.style.background = "#ddd";
    headerRow.appendChild(actionTh);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // BODY
    const tbody = document.createElement("tbody");

    jsonData.forEach(row => {
        const tr = document.createElement("tr");

        headers.forEach(key => {
            const td = document.createElement("td");
            td.innerText = row[key];
            td.style.border = "1px solid black";
            td.style.padding = "8px";
            tr.appendChild(td);
        });

        // Action buttons (Edit/Delete)
        const actionTd = document.createElement("td");
        actionTd.style.border = "1px solid black";
        actionTd.style.padding = "8px";

        //Edit button
        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";
        editBtn.style.marginRight = "5px";
        editBtn.onclick = () => handleEdit(tableName, row[idField]);

        //Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.style.backgroundColor = "#dc3545";
        deleteBtn.onclick = () => handleDelete(tableName, row[idField]);

        actionTd.appendChild(editBtn);
        actionTd.appendChild(deleteBtn);

        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}


export async function handleEdit(tableName, id) {
    // Option 1: Redirect to an edit page
    // window.location.href = `/edit.html?table=${tableName}&id=${id}`;
    // return;

    // Option 2: Simple prompt editing (temporary solution)
    const newValue = prompt(`Enter updated values for ${tableName} (JSON format):`);
    if (!newValue) return;

    let parsedData;
    try {
        parsedData = JSON.parse(newValue);
    } catch (e) {
        showMessage("Invalid JSON format", "error");
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/${tableName}-update-item-by-id?id=${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(parsedData)
        });

        if (!response.ok) {
            if (response.status === 404) {
                showMessage(`Record not found for ID ${id}`, "error");
            } else if (response.status === 400) {
                showMessage("Invalid update data", "error");
            } else if (response.status === 405) {
                showMessage("Method not allowed. PUT required.", "error");
            } else {
                showMessage("Server error during update", "error");
            }

            console.error("Edit failed:", response.status);
            return;
        }

        const result = await response.json();

        showMessage(`Updated ${tableName} record with ID = ${id}`, "success");
        console.log("Edit success:", result);

        // Reload data
        loadData(`/.netlify/functions/${tableName}-get-items`, `${tableName}_record`, tableName);

    } catch (error) {
        console.error("Edit error:", error);
        showMessage("Network error while updating record", "error");
    }
}


export async function handleDelete(tableName, id) {
    if (!confirm(`Are you sure you want to delete ID ${id} from ${tableName}?`)) {
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/${tableName}-delete-item-by-id?id=${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        // Handle NON-200 responses
        if (!response.ok) {
            if (response.status === 404) {
                showMessage(`Record not found for ID ${id} in ${tableName}`, "error");
            } else if (response.status === 400) {
                showMessage("Invalid ID or missing parameter", "error");
            } else if (response.status === 405) {
                showMessage("Method not allowed. DELETE required.", "error");
            } else {
                showMessage("Server error. Try again later.", "error");
            }

            console.error("Delete failed:", response.status);
            return;
        }

        // // Parse the JSON from backend
        const result = await response.json();

        // SUCCESS CASE (HTTP 200)
        showMessage(`Deleted ${tableName} record with ID = ${id}`, "success");
        console.log("Delete success:", result);

        //Refresh data
        loadData(`/.netlify/functions/${tableName}-get-items`, `${tableName}_record`, tableName);

    } catch (error) {
        console.error("Delete error:", error);
        showMessage("Network error while deleting record", "error");
    }
}



