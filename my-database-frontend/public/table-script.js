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

function handleEdit(tableName, id) {
    console.log("Edit clicked:", tableName, id);
    alert(`Edit requested for table: ${tableName}, ID: ${id}`);
    
    switch(tableName){
        case "customer":
            
        case "category":
        case "product":
        case "sales":
        case "suppliers":
        
    }

    // Here you can redirect or open form
    // window.location.href = `/edit.html?table=${tableName}&id=${id}`;
}

function handleDelete(tableName, id) {
    console.log("Delete clicked:", tableName, id);
    alert(`Delete requested for table: ${tableName}, ID: ${id}`);

    // Example: call Netlify function to delete
    // fetch(`/.netlify/functions/delete-item?table=${tableName}&id=${id}`, { method: "DELETE" })
    //     .then(res => res.json())
    //     .then(response => console.log(response));
}

