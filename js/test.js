import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedDot = null;
let isDragging = false;
let data = null;


// Fetch anchor data
fetch('anchors.json')
  .then(response => response.json())
  .then(initialData => {
    data = initialData;

    let maxX = 0;
    let maxY = 0;

    data.forEach(({ x, y }) => {
      maxX = Math.max(maxX, Math.abs(parseFloat(x)));
      maxY = Math.max(maxY, Math.abs(parseFloat(y)));
    });

    const planeGeometry = new THREE.PlaneGeometry(maxX * 2 + 1, maxY * 2 + 1, maxX * 2 + 1, maxY * 2 + 1);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x008000, wireframe: true });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    const dots = new THREE.Group();

    data.forEach(({ id, x, y, z, message, role, sync }) => {
      const dotGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      let dotMaterial;
    
      if (role === 'master') {
        dotMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      } else {
        dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff3300 });
      }
    
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    
      const normalizedX = x;
      const normalizedY = y;
      const normalizedZ = z;
    
      dot.position.set(normalizedX, normalizedY, normalizedZ);
      dot.userData.id = id;
      dot.userData.message = message;
      if (role) {
        dot.userData.role = role;
      }
    
      if (sync) {
        dot.userData.sync = sync;
      }
      dots.add(dot);
    });
    
    scene.add(dots);
    

    // Assume that there is a master dot with id: 3
    const masterDot = data.find(dot => dot.role === 'master');

    const lineGeometry = new THREE.BufferGeometry();
    const numConnections = data.length - 1;  // Since each slave connects to the master
    const vertices = new Float32Array(numConnections * 2 * 3);
    const colors = new Float32Array(numConnections * 2 * 3);

    let vertexIndex = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].role === 'master') continue;  // Skip connecting master to itself

      vertices[vertexIndex] = data[i].x;
      vertices[vertexIndex + 1] = data[i].y;
      vertices[vertexIndex + 2] = data[i].z;

      vertices[vertexIndex + 3] = masterDot.x;  // Connect each slave to the master
      vertices[vertexIndex + 4] = masterDot.y;
      vertices[vertexIndex + 5] = masterDot.z;

      const syncStatus = data[i].sync;
      console.log(syncStatus);
      const lineColor = syncStatus === 'good' ? new THREE.Color(0x00ff00) : new THREE.Color(0xff0000);

      colors[vertexIndex] = lineColor.r;
      colors[vertexIndex + 1] = lineColor.g;
      colors[vertexIndex + 2] = lineColor.b;

      colors[vertexIndex + 3] = lineColor.r;
      colors[vertexIndex + 4] = lineColor.g;
      colors[vertexIndex + 5] = lineColor.b;

      vertexIndex += 6;
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, linewidth: 2 });
    lineMaterial.vertexColors = true; // Add this line to enable vertex colors
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);


    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('contextmenu', function(event) {
      event.preventDefault();
  });
    lines.addEventListener('mousedown', onLineClick, false);

    function onLineClick(event) {
      const intersects = raycaster.intersectObject(lines);
      
      if (intersects.length > 0) {
        const lineIndex = intersects[0].index;
        isDragging = false;
        controls.enabled = false;
        
        // Find the master dot
        const masterDot = data.find(dot => dot.role === 'master');
    
        // Retrieve start and end positions of the intersected line
        const line = intersects[0].object; // Get the intersected line object
        const vertices = line.geometry.attributes.position.array;
    
        const startIndex = lineIndex * 3;
        const start = new THREE.Vector3(vertices[startIndex], vertices[startIndex + 1], vertices[startIndex + 2]);
        
        // Find the slave dot closest to the start of the line
        let minDistance = Infinity;
        let closestSlaveDot = null;
        for (const dot of data) {
          if (dot.role === 'slave') {
            const dotPosition = new THREE.Vector3(dot.x, dot.y, dot.z);
            const distance = dotPosition.distanceTo(start);
            if (distance < minDistance) {
              minDistance = distance;
              closestSlaveDot = dot;
            }
          }
        }
        
        if (masterDot && closestSlaveDot) {
          // Check if the click is close to the line
          const distance = intersects[0].distance;
          const threshold = 15.0;
    
          if (distance < threshold) {
            alert(`Sync Information:\n\nMaster: ${masterDot.id}\nSlave: ${closestSlaveDot.id}\nSync: ${closestSlaveDot.sync}`);

          }
        }
      }
    }     
    
    
    function onMouseDown(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
      const intersectsDots = raycaster.intersectObjects(dots.children);
      const intersectsLines = raycaster.intersectObject(lines);
    
      if (intersectsDots.length > 0) {
        selectedDot = intersectsDots[0].object;
        isDragging = false;
        controls.enabled = false;
      } else if (intersectsLines.length > 0) {
        // Handle line click here
        onLineClick(event);
      } else {
        controls.enabled = true;
      }
    }
    

    function updateLineVertices() {
      let vertexIndex = 0;
    
      // Assuming there is a master dot with role 'master'
      const masterIndex = data.findIndex(dot => dot.role === 'master');
    
      for (let i = 0; i < data.length; i++) {
        if (i === masterIndex) continue;  // Skip updating lines for the master itself
    
        lines.geometry.attributes.position.array[vertexIndex] = dots.children[masterIndex].position.x;
        lines.geometry.attributes.position.array[vertexIndex + 1] = dots.children[masterIndex].position.y;
        lines.geometry.attributes.position.array[vertexIndex + 2] = dots.children[masterIndex].position.z;
    
        lines.geometry.attributes.position.array[vertexIndex + 3] = dots.children[i].position.x;
        lines.geometry.attributes.position.array[vertexIndex + 4] = dots.children[i].position.y;
        lines.geometry.attributes.position.array[vertexIndex + 5] = dots.children[i].position.z;
    
        vertexIndex += 6;
      }
    
      lines.geometry.attributes.position.needsUpdate = true;
    }
    
    function onDoubleClick(id) {
      // Redirect to details.php with the dot's ID as a query parameter
      console.log(`Double-clicked on dot with ID: ${id}`);
      window.location.href = `details.php?id=${id}`;
    }

    function onMouseMove(event) {
      if (selectedDot) {
        isDragging = true;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);

        if (intersects.length > 0) {
          const intersectionPoint = intersects[0].point;
          selectedDot.position.x = intersectionPoint.x;
          selectedDot.position.y = intersectionPoint.y;

          // Update the line vertices
          updateLineVertices();
          saveToLocalStorage();
        }
      } else {
        controls.update();
      }
    }
    
    function onMouseUp(event) {
      if (event.button === 2){
        onDoubleClick(selectedDot.userData.id);
        return
      }
      if (!isDragging && selectedDot) {
        performClickAction();
      }
      if (selectedDot) {
        saveToJsonFile(selectedDot.userData.id);
      }

      selectedDot = null;
      isDragging = false;
      controls.enabled = true;
    }

     
    function performClickAction() {
      if (selectedDot) {
        const dotId = selectedDot.userData.id;
        const dotMessage = selectedDot.userData.message;
        const dotRole = selectedDot.userData.role;
    
        // Clone the position of the selected dot
        const originalDotPosition = selectedDot.position.clone();
        const x = originalDotPosition.x;
        const y = originalDotPosition.y;
        const z = originalDotPosition.z;
    
        // Display alert with dot information
        alert(`Dot Information:\n\nID: ${dotId}\nX-axis: ${x}\nY-axis: ${y}\nZ-axis: ${z}\nMessage: ${dotMessage}\nRole: ${dotRole}`);
      }
    }
    
    

    function saveToLocalStorage() {
      const anchorPositions = {};
      dots.children.forEach((dot) => {
        anchorPositions[dot.userData.id] = dot.position.toArray();
      });
      localStorage.setItem('anchorPositions', JSON.stringify(anchorPositions));
    }

    function saveToJsonFile(dotId) {
      const anchorData = dots.children.map((dot) => {
        const roundedX = parseFloat(dot.position.x.toFixed(2));
        const roundedY = parseFloat(dot.position.y.toFixed(2));

        const savedData = {
          id: dot.userData.id,
          x: roundedX,
          y: roundedY,
          z: dot.position.z,
          message: dot.userData.message,
        };

        // Retain role and sync properties if present
        if ('role' in dot.userData) {
          savedData.role = dot.userData.role;
        }

        if ('sync' in dot.userData) {
          savedData.sync = dot.userData.sync;
        }

        return savedData;
      });

      fetch('update_anchors.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(anchorData),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Anchor positions updated on the server.');
          } else {
            console.error('Failed to update anchor positions on the server.');
          }
        })
        .catch(error => console.error('Error updating anchor positions:', error));
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      render();
    }

    window.addEventListener('resize', onWindowResize);

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.attributes.color.needsUpdate = true;
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  })
  .catch(error => console.error('Error parsing JSON:', error));
