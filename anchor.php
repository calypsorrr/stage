<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Anchor</title>
    <link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>
    <div id="go-back-container">
        <button id="go-back-button">Dashboard</button>
    </div>
    <div id="add-anchor-form">
        <h3>Add Anchor</h3>
        <label for="x-input">X:</label>
        <input type="number" id="x-input" step="any" required>
        <br>
        <label for="y-input">Y:</label>
        <input type="number" id="y-input" step="any" required>
        <br>
        <label for="z-input">Z:</label>
        <input type="number" id="z-input" step="any" required>
        <br>
        <label for="message-input">Message:</label>
        <input type="text" id="message-input" required>
        <br>
        <label for="is-master-input">Is Master?</label>
        <input type="checkbox" id="is-master-input">
        <br>
        <button onclick="addAnchor()">Add Anchor</button>
    </div>
    <script src="js/add.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Add event listener for the "Go Back" button
            const goBackButton = document.getElementById('go-back-button');
            goBackButton.addEventListener('click', () => {
                // Navigate to the previous page
                window.history.back();
            });
        });
    </script>
</body>
</html>
