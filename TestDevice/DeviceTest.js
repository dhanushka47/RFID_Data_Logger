var firebaseConfig = {
    apiKey: "AIzaSyBGA1vUD96TPp0jz66JSJaPm560mn7nTrg",
    authDomain: "rfid-data-log.firebaseapp.com",
    databaseURL: "https://rfid-data-log-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "rfid-data-log",
    storageBucket: "rfid-data-log.appspot.com",
};
firebase.initializeApp(firebaseConfig);

function getChatChildIDAndUpdateUI() {
    firebase.database().ref('RFID').once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            const chatChildID = Object.keys(data)[0];
            //document.getElementById('uid').value = chatChildID;
        } else {
            document.getElementById('uid').value = '';
        }
    });
}
function saveData() {
    const uid = document.getElementById('uid').value;
    const housingRemove = document.querySelector('input[name="housingRemove"]:checked').value;
    const firmwareUpload = document.querySelector('input[name="firmwareUpload"]:checked').value;
    const heatPress = Array.from(document.querySelectorAll('input[name="heatPress"]:checked')).map(input => input.value);
    const assembleHousing = document.querySelector('input[name="assembleHousing"]:checked').value;
    const devicePass = document.querySelector('input[name="devicePass"]:checked').value;
    const damage = document.querySelector('input[name="damage"]:checked') ? document.querySelector('input[name="damage"]:checked').value : '';
    const specialNotes = document.getElementById('specialNotes').value;

    const now = new Date();
    const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const data = {
        uid,
        dateTime: formattedDateTime,
        housingRemove,
        firmwareUpload,
        heatPress,
        assembleHousing,
        devicePass,
        damage,
        specialNotes
    };

    firebase.database().ref('TestData').orderByChild('uid').equalTo(uid).once('value', snapshot => {
        if (snapshot.exists()) {
            const confirmOverwrite = confirm('This UID already exists. Do you want to overwrite the existing data?');
            if (confirmOverwrite) {
                const existingKey = Object.keys(snapshot.val())[0];
                firebase.database().ref('TestData').child(existingKey).set(data)
                    .then(() => {
                        alert('Data overwritten successfully!');
                        resetForm();
                    })
                    .catch(error => {
                        console.error('Error overwriting data: ', error);
                        alert('Error overwriting data. Please try again.');
                    });
            } else {
                alert('Save cancelled.');
            }
        } else {
            const confirmSave = confirm('Are you sure you want to save this data?');
            if (confirmSave) {
                firebase.database().ref('TestData').push(data)
                    .then(() => {
                        alert('Data saved successfully!');
                        resetForm();
                        damageField.style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error saving data: ', error);
                        alert('Error saving data. Please try again.');
                    });
            } else {
                alert('Save cancelled.');
            }
        }
    }).catch(error => {
        console.error('Error checking existing data: ', error);
        alert('Error checking existing data. Please try again.');
    });
}


function resetForm() {
    document.getElementById('uid').value = '';
    document.querySelectorAll('input[name="housingRemove"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="firmwareUpload"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="heatPress"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="assembleHousing"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="devicePass"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="damage"]').forEach(input => input.checked = false);

    document.getElementById('specialNotes').value = '';
    getChatChildIDAndUpdateUI();
}

window.onload = function() {
    getChatChildIDAndUpdateUI();
    getUidCount();

    const devicePassYes = document.getElementById('devicePassYes');
    const devicePassNo = document.getElementById('devicePassNo');
    const damageField = document.getElementById('damageField');

    devicePassYes.addEventListener('click', toggleDamageField);
    devicePassNo.addEventListener('click', toggleDamageField);

    function toggleDamageField() {
        if (devicePassNo.checked) {
            damageField.style.display = 'block';
        } else {
            damageField.style.display = 'none';
        }
    }
};


function refreshUID() {
    firebase.database().ref('RFID').limitToLast(1).once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            const latestChildID = Object.keys(data)[0];
            const latestUID = data[latestChildID];
            document.getElementById('uid').value = latestUID;
            console.log('Latest UID: ', latestUID);
            // Delete the latest child from Firebase
            firebase.database().ref('RFID').child(latestChildID).remove()
                .then(() => {
                    console.log('Latest child deleted successfully.');
                })
                .catch(error => {
                    console.error('Error deleting latest child: ', error);
                });
        } else {
            document.getElementById('uid').value = '';
            alert('No UID found');
            console.log('No data found in the RFID node.');
        }
    }).catch(error => {
        console.error('Error fetching data: ', error);
    });
}


function getUidCount() {
    const uidCountRef = firebase.database().ref('RFID');

    // Fetch initial count
    uidCountRef.once('value').then(snapshot => {
        const uidCount = snapshot.numChildren();
        document.getElementById('uidCount').textContent = `UIDs found: ${uidCount}`;
    }).catch(error => {
        console.error('Error fetching UID count: ', error);
    });

    // Set up listener for real-time updates
    uidCountRef.on('value', snapshot => {
        const uidCount = snapshot.numChildren();
        document.getElementById('uidCount').textContent = `UIDs found: ${uidCount}`;
    }, error => {
        console.error('Listener error: ', error);
    });
}
