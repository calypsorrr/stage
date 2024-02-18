function addAnchor() {
    console.log('Add Anchor button clicked!');

    // Get input values
    const xValue = parseFloat(document.getElementById('x-input').value);
    const yValue = parseFloat(document.getElementById('y-input').value);
    let zValue = parseFloat(document.getElementById('z-input').value);
    const messageValue = encodeURIComponent(document.getElementById('message-input').value);
    const isMaster = document.getElementById('is-master-input').checked;

    // Ensure Z-axis is not below 0
    if (zValue < 0) {
        alert("Z-axis cannot be below 0.");
        return;
    }

    // Validate input
    if (isNaN(xValue) || isNaN(yValue) || isNaN(zValue)) {
        alert("Please enter valid numeric values for X, Y, and Z.");
        return;
    }

    // Make a POST request to add the anchor
    fetch('new_json.php', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            x: xValue,
            y: yValue,
            z: zValue,
            message: messageValue,
            isMaster: isMaster,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // If successful, refresh the anchors list
            alert('Anchor added successfully!');
            window.location.href = 'dashboard.php';
        } else {
            console.error('Failed to add anchor:', data.message);
        }
    })
    .catch(error => console.error('Error adding anchor:', error));
}
