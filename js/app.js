// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyBGA1vUD96TPp0jz66JSJaPm560mn7nTrg",
    authDomain: "rfid-data-log.firebaseapp.com",
    databaseURL: "https://rfid-data-log-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "rfid-data-log",
    storageBucket: "rfid-data-log.appspot.com",
};
firebase.initializeApp(firebaseConfig);

// Reference to Firebase database
var database = firebase.database();

// Function to load initial 20 entries from TestData
function loadInitialData() {
    database.ref('TestData').limitToLast(20).once('value')
        .then(snapshot => {
            displayRFIDData(snapshot);
        })
        .catch(error => {
            console.error('Error loading initial data: ', error);
        });
}

// Function to display RFID data in the table
function displayRFIDData(snapshot) {
    const rfidDataBody = document.getElementById('rfidDataBody');
    rfidDataBody.innerHTML = ''; // Clear existing table rows

    snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const row = document.createElement('tr');

        // Add data fields to table columns
        row.innerHTML = `
            <td>${data.dateTime}</td>
            <td>${data.uid}</td>
            <td>${data.housingRemove}</td>
            <td>${data.firmwareUpload}</td>
            <td>${data.heatPress.join(', ')}</td>
            <td>${data.specialNotes}</td>
            <td>${data.devicePass}</td>
        `;
        rfidDataBody.appendChild(row);
    });
}

// Function to filter data by UID
function searchByUID() {
    const uid = document.getElementById('uidSearch').value.trim();
    if (uid === '') {
        loadInitialData();
        return;
    }

    database.ref('TestData').orderByChild('uid').equalTo(uid).once('value')
        .then(snapshot => {
            displayRFIDData(snapshot);
        })
        .catch(error => {
            console.error('Error searching by UID: ', error);
        });
}

// Function to filter data by date range
function filterByDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }

    // Convert dates to timestamps for comparison
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    if (startTimestamp > endTimestamp) {
        alert('End date must be greater than or equal to start date.');
        return;
    }

    database.ref('TestData').orderByChild('timestamp').startAt(startTimestamp).endAt(endTimestamp).once('value')
        .then(snapshot => {
            displayRFIDData(snapshot);
        })
        .catch(error => {
            console.error('Error filtering by date range: ', error);
        });
}

// Function to export filtered data to Excel
function exportToExcel() {
    try {
        // Extract table data
        const rows = document.querySelectorAll('#rfidData tbody tr');
        const data = [];
        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(cell => {
                rowData.push(cell.innerText.trim());
            });
            data.push(rowData);
        });

        if (data.length === 0) {
            throw new Error('No data available to export.');
        }

        // Prepare XLSX workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([
            ['Date & Time', 'UID', 'Housing Remove', 'Firmware Upload', 'Heat Press', 'Special Notes', 'Device Pass'],
            ...data
        ]);
        XLSX.utils.book_append_sheet(wb, ws, 'RFID Data');

        // Export the XLSX file
        XLSX.writeFile(wb, 'RFID_Data.xlsx');
    } catch (error) {
        console.error('Error exporting to Excel: ', error);
        alert('Failed to export data to Excel. ' + error.message);
    }
}

// Load initial data when the page loads
window.onload = function() {
    loadInitialData();
};

// jQuery Document Ready
$(document).ready(function() {
    $('#rfidData').resizableColumns({
        store: window.store
    });

    // Export to Excel button click event
    $('#exportBtn').click(function() {
        exportToExcel();
    });
});

// Function to prompt for password and delete all data under TestData node
function deleteAllData() {
    // Ask for password
    const password = prompt('Enter password to delete all data:');

    // Check if password matches
    if (password !== '1212') {
        alert('Incorrect password. Deletion canceled.');
        return;
    }

    // Confirm deletion
    if (confirm('Are you sure you want to delete all data?')) {
        database.ref('TestData').remove()
            .then(() => {
                alert('All data deleted successfully.');
                loadInitialData(); // Optionally reload data after deletion
            })
            .catch(error => {
                console.error('Error deleting data: ', error);
                alert('Failed to delete data. ' + error.message);
            });
    }
}
