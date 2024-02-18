document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display the list of anchors
    fetchAnchors();
  });
  
  function fetchAnchors() {
    fetch('anchors.json')
      .then(response => response.json())
      .then(data => {
        data.forEach(anchor => {
          displayAnchor(anchor);
        });
      })
      .catch(error => console.error('Error loading anchors:', error));
  }
  
  function displayAnchor(anchor) {
    // Create HTML elements to display anchor information
    const anchorElement = document.createElement('div');
    anchorElement.id = `anchor-${anchor.id}`; // Assign an ID for easier identification
    anchorElement.innerHTML = `
        <p>ID: ${anchor.id}</p>
        <button onclick="viewDetails(${anchor.id})">Details</button>
        <button onclick="deleteAnchor(${anchor.id})">Delete</button>
        <hr>
    `;
    document.getElementById('anchors-list').appendChild(anchorElement);
}


function viewDetails(anchorId) {
    // Redirect to the details page with the anchor details as parameters
    window.location.href = `details.php?id=${anchorId}`;
}
  
function deleteAnchor(anchorId) {
    const confirmDelete = confirm("Are you sure you want to delete this anchor?");
    if (!confirmDelete) {
        return;
    }

    fetch('delete_dot.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: anchorId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const anchorElement = document.getElementById(`anchor-${anchorId}`);
            if (anchorElement) {
                anchorElement.remove();
            } else {
                console.error('Anchor element not found in the UI');
            }
        } else {
            console.error('Failed to delete anchor:', data.message);
        }
    })
    .catch(error => console.error('Error deleting anchor:', error));
}


