document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const anchorId = urlParams.get('id');
  
    // Fetch anchor details from anchors.json
    fetch('anchors.json')
        .then(response => response.json())
        .then(anchors => {
            const anchorDetails = anchors.find(anchor => anchor.id == anchorId);
            if (anchorDetails) {
                // Display anchor details
                displayDetails(anchorDetails);
                // Add double-click event listeners to values for editing
                addDoubleClickEventListeners(anchorDetails);
            } else {
                console.error('Anchor not found');
            }
        })
        .catch(error => console.error('Error fetching anchor details:', error));
});

function displayDetails(anchorDetails) {
    const { id, x, y, z, message } = anchorDetails;
    document.getElementById('anchor-id').textContent = id;
    document.getElementById('anchor-x').textContent = x;
    document.getElementById('anchor-y').textContent = y;
    document.getElementById('anchor-z').textContent = z;
    document.getElementById('anchor-message').textContent = message;
}

function addDoubleClickEventListeners(anchorDetails) {
    const { id, x, y, z, message } = anchorDetails;
    addDoubleClickEventListener('anchor-x', 'x', id, x);
    addDoubleClickEventListener('anchor-y', 'y', id, y);
    addDoubleClickEventListener('anchor-z', 'z', id, z);
    addDoubleClickEventListener('anchor-message', 'message', id, message);
}

function addDoubleClickEventListener(elementId, propertyName, anchorId, originalValue) {
    const element = document.getElementById(elementId);
    element.addEventListener('dblclick', () => {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = originalValue;

        inputField.addEventListener('input', (event) => {
            const newValue = event.target.value;
            updateJsonValue(anchorId, propertyName, newValue);
        });

        inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                inputField.blur();
            }
        });

        inputField.addEventListener('blur', () => {
            element.textContent = '';
            element.appendChild(document.createTextNode(inputField.value));
        });

        element.textContent = '';
        element.appendChild(inputField);
        inputField.focus();
    });
}

function updateJsonValue(anchorId, propertyName, newValue) {
    const numericValue = parseFloat(newValue);
    if (isNaN(numericValue)) {
        return;
    }

    fetch('update_json.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${encodeURIComponent(anchorId)}&property=${encodeURIComponent(propertyName)}&value=${JSON.stringify(numericValue)}`,
    })
    .then(response => response.json())  
    .then(data => {
        if (data.success) {
            console.log('Updated Data:', data.data);
        } else {
            console.error('Error updating value:', data.message);
        }
    })
    .catch(error => console.error('Error updating value:', error));
}
