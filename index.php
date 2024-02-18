<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Box</title>
  <link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>
  <div id="dashboard-container">
    <button id="dashboard-button">Dashboard</button>
    <button id="toggle-move-button">Toggle Move</button>
  </div>
  <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.148.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.148.0/examples/jsm/"
            }
        }
      </script>
  <script type="module" src="js/main.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Add event listener for the "Add Anchor" button
      const addAnchorButton = document.getElementById('dashboard-button');
      addAnchorButton.addEventListener('click', () => {
        // Redirect to the dashboard page
        window.location.href = 'dashboard.php';
      });
          // Add event listener for the "Toggle Move" button
      const toggleMoveButton = document.getElementById('toggle-move-button');
      toggleMoveButton.addEventListener('click', () => {
      // Toggle the mouse move functionality by calling the toggleMouseMove function
      if (typeof toggleMouseMove === 'function') {
        toggleMouseMove();
      }
      });
    });
  </script>
</body>
</html>
