export function createTableFromJSON(jsonData, containerId) {
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

    // Create the table
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Extract headers
    const headers = Object.keys(jsonData[0]);
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

    // Add "Actions" header
    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    actionTh.style.border = "1px solid black";
    actionTh.style.padding = "8px";
    actionTh.style.background = "#f0f0f0";
    headerRow.appendChild(actionTh);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

    jsonData.forEach(item => {
        const row = document.createElement("tr");

        headers.forEach(key => {
            const td = document.createElement("td");
            td.innerText = item[key];
            td.style.border = "1px solid black";
            td.style.padding = "8px";
            row.appendChild(td);
        });

        // Create actions cell
        const actionTd = document.createElement("td");
        actionTd.style.border = "1px solid black";
        actionTd.style.padding = "8px";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.innerText = "Edit";
        editBtn.style.marginRight = "5px";
        editBtn.addEventListener("click", () => {
            // Call your edit function here
            console.log("Edit clicked for id:", item.id);
            // Example: editCategory(item);
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.style.backgroundColor = "#dc3545";
        deleteBtn.style.color = "white";
        deleteBtn.addEventListener("click", () => {
            // Call your delete function here
            console.log("Delete clicked for id:", item.id);
            // Example: deleteCategory(item.id);
        });

        actionTd.appendChild(editBtn);
        actionTd.appendChild(deleteBtn);
        row.appendChild(actionTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add table to container
    container.appendChild(table);
}
