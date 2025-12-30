// Initialize data storage
let storageData = [];
let currentFilter = {
    searchText: '',
    column: 'all'
};

// Initialize the app
window.onload = function() {
    // Set today's date
    document.getElementById('storageDate').valueAsDate = new Date();
    
    // Load sample data
    loadSampleData();
};

// Load sample data based on the image
function loadSampleData() {
    storageData = [
        {
            name: 'Tool',
            classification: 'Electric Drill',
            unit: '',
            startStorage: 100,
            in: 50,
            out: 70,
            note: ''
        },
        {
            name: 'Visual Studio 2',
            classification: 'IDE',
            unit: '1',
            startStorage: 200,
            in: 40,
            out: 80,
            note: '3/4/2025'
        }
    ];
    renderTable();
}

// Render the table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    storageData.forEach((item, index) => {
        const row = createRow(item, index);
        
        // Apply current filter
        if (currentFilter.searchText) {
            const matchesFilter = checkFilterMatch(item);
            if (!matchesFilter) {
                row.classList.add('filtered-out');
            } else {
                row.classList.add('highlight-match');
            }
        }
        
        tbody.appendChild(row);
    });
}

// Create a table row
function createRow(item, index) {
    const row = document.createElement('tr');
    const endStorage = calculateEndStorage(item.startStorage, item.in, item.out);
    
    row.innerHTML = `
        <td class="no-column">${index + 1}</td>
        <td><input type="text" value="${item.name}" onchange="updateData(${index}, 'name', this.value)"></td>
        <td><input type="text" value="${item.classification}" onchange="updateData(${index}, 'classification', this.value)"></td>
        <td><input type="text" value="${item.unit}" onchange="updateData(${index}, 'unit', this.value)"></td>
        <td><input type="number" value="${item.startStorage}" onchange="updateData(${index}, 'startStorage', this.value)"></td>
        <td><input type="number" value="${item.in}" onchange="updateData(${index}, 'in', this.value)"></td>
        <td><input type="number" value="${item.out}" onchange="updateData(${index}, 'out', this.value)"></td>
        <td class="end-storage">${endStorage}</td>
        <td><input type="text" value="${item.note}" onchange="updateData(${index}, 'note', this.value)"></td>
        <td class="action-cell">
            <button class="btn-delete" onclick="deleteRow(${index})">Delete</button>
        </td>
    `;
    
    return row;
}

// Calculate end storage
function calculateEndStorage(start, inValue, outValue) {
    const startNum = parseFloat(start) || 0;
    const inNum = parseFloat(inValue) || 0;
    const outNum = parseFloat(outValue) || 0;
    return startNum + inNum - outNum;
}

// Update data
function updateData(index, field, value) {
    storageData[index][field] = value;
    renderTable();
}

// Add new row
function addRow() {
    const newItem = {
        name: '',
        classification: '',
        unit: '',
        startStorage: 0,
        in: 0,
        out: 0,
        note: ''
    };
    storageData.push(newItem);
    renderTable();
}

// Delete row
function deleteRow(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        storageData.splice(index, 1);
        renderTable();
    }
}

// Clear all data
function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
        storageData = [];
        renderTable();
    }
}

// Import Excel file
function importExcel() {
    document.getElementById('fileInput').click();
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Parse the data (skip header row)
        storageData = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length > 1 && row[1]) { // Check if row has data
                storageData.push({
                    name: row[1] || '',
                    classification: row[2] || '',
                    unit: row[3] || '',
                    startStorage: parseFloat(row[4]) || 0,
                    in: parseFloat(row[5]) || 0,
                    out: parseFloat(row[6]) || 0,
                    note: row[8] || ''
                });
            }
        }
        
        renderTable();
        alert('Excel file imported successfully!');
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    event.target.value = '';
}

// Export to Excel
function exportExcel() {
    // Prepare data for export
    const exportData = [
        ['NO', 'Name', 'Classification', 'Unit', 'Start Storage', 'In', 'Out', 'End Storage', 'Note']
    ];
    
    storageData.forEach((item, index) => {
        const endStorage = calculateEndStorage(item.startStorage, item.in, item.out);
        exportData.push([
            index + 1,
            item.name,
            item.classification,
            item.unit,
            item.startStorage,
            item.in,
            item.out,
            endStorage,
            item.note
        ]);
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // NO
        { wch: 20 }, // Name
        { wch: 20 }, // Classification
        { wch: 10 }, // Unit
        { wch: 15 }, // Start Storage
        { wch: 10 }, // In
        { wch: 10 }, // Out
        { wch: 15 }, // End Storage
        { wch: 15 }  // Note
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Storage');
    
    // Get warehouse info
    const warehouse = document.getElementById('warehouseName').value || 'Warehouse';
    const date = document.getElementById('storageDate').value || 'date';
    const filename = `${warehouse}_Storage_${date}.xlsx`;
    
    // Export file
    XLSX.writeFile(wb, filename);
    alert('Excel file exported successfully!');
}

// Filter functionality
function applyFilter() {
    const searchText = document.getElementById('searchFilter').value.toLowerCase();
    const column = document.getElementById('columnFilter').value;
    
    currentFilter.searchText = searchText;
    currentFilter.column = column;
    
    renderTable();
    
    // Update filter count
    updateFilterCount();
}

function checkFilterMatch(item) {
    const searchText = currentFilter.searchText.toLowerCase();
    const column = currentFilter.column;
    
    if (!searchText) return true;
    
    if (column === 'all') {
        return item.name.toLowerCase().includes(searchText) ||
               item.classification.toLowerCase().includes(searchText) ||
               item.note.toLowerCase().includes(searchText) ||
               item.unit.toLowerCase().includes(searchText);
    } else {
        return item[column].toString().toLowerCase().includes(searchText);
    }
}

function clearFilter() {
    document.getElementById('searchFilter').value = '';
    document.getElementById('columnFilter').value = 'all';
    currentFilter.searchText = '';
    currentFilter.column = 'all';
    renderTable();
    updateFilterCount();
}

function updateFilterCount() {
    const searchText = currentFilter.searchText;
    if (!searchText) return;
    
    const visibleCount = storageData.filter(item => checkFilterMatch(item)).length;
    const totalCount = storageData.length;
    
    if (visibleCount < totalCount) {
        console.log(`Showing ${visibleCount} of ${totalCount} items`);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + N: Add new row
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        addRow();
    }
    // Ctrl + E: Export
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportExcel();
    }
    // Ctrl + I: Import
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        importExcel();
    }
    // Ctrl + F: Focus filter
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchFilter').focus();
    }
});
