<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anchor Details</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>
  <div id="go-back-container">
    <button id="go-back-button">Go Back</button>
  </div>
  <div id="details-container">
    <div id="details-content">
      <h1>Anchor Details</h1>
      <p>ID: <span id="anchor-id"></span></p>
      <p>X-axis: <span id="anchor-x"></span></p>
      <p>Y-axis: <span id="anchor-y"></span></p>
      <p>Z-axis: <span id="anchor-z"></span></p>
      <p>Message: <span id="anchor-message"></span></p>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>
  <script src="js/details.js"></script>
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
  <script>
        document.addEventListener('contextmenu', function(event) {
      event.preventDefault();
  });
  </script>
</body>
</html>