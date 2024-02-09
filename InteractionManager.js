import * as THREE from 'three';

export default class InteractionManager {
    constructor(scene, camera, raycaster, anchorManager) {
        this.scene = scene;
        this.camera = camera;
        this.raycaster = raycaster;
        this.selectedDot = null;
        this.isDragging = false;
        this.lines = null;
        this.dots = null;
        this.anchorManager = anchorManager;
    }
    initialize(controls, dots, lines, plane) {
        this.controls = controls;
        this.dots = dots;
        this.lines = lines;
        this.plane = plane;
        document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        document.addEventListener('contextmenu', event => event.preventDefault());
        this.lines.addEventListener('mousedown', this.onLineClick.bind(this), false);
    }

    onLineClick(event) {
        const intersects = this.raycaster.intersectObject(this.lines);

        if (intersects.length > 0) {
            const lineIndex = intersects[0].index;
            this.isDragging = false;
            this.controls.enabled = false;

            const masterDot = this.dots.find(dot => dot.userData.role === 'master');

            const line = intersects[0].object;
            const vertices = line.geometry.attributes.position.array;

            const startIndex = lineIndex * 3;
            const start = new THREE.Vector3(vertices[startIndex], vertices[startIndex + 1], vertices[startIndex + 2]);

            let minDistance = Infinity;
            let closestSlaveDot = null;
            for (const dot of this.dots) {
                if (dot.userData.role === 'slave') {
                    const dotPosition = new THREE.Vector3(dot.position.x, dot.position.y, dot.position.z);
                    const distance = dotPosition.distanceTo(start);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestSlaveDot = dot;
                    }
                }
            }

            if (masterDot && closestSlaveDot) {
                const distance = intersects[0].distance;
                const threshold = 15.0;

                if (distance < threshold) {
                    alert(`Sync Information:\n\nMaster: ${masterDot.userData.id}\nSlave: ${closestSlaveDot.userData.id}\nSync: ${closestSlaveDot.userData.sync}`);
                }
            }
        }
    }

    onMouseDown(event) {
        const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(mouse, this.camera);
        const intersectsDots = this.raycaster.intersectObjects(this.dots);
        const intersectsLines = this.raycaster.intersectObject(this.lines);

        if (intersectsDots.length > 0) {
            this.selectedDot = intersectsDots[0].object;
            this.isDragging = false;
            this.controls.enabled = false;
        } else if (intersectsLines.length > 0) {
            this.onLineClick(event);
        } else {
            this.controls.enabled = true;
        }
    }

    onMouseMove(event) {
        if (this.selectedDot) {
            this.isDragging = true;
            const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
            this.raycaster.setFromCamera(mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.plane);
        
            if (intersects.length > 0) {
                const intersectionPoint = intersects[0].point;

                const deltaX = intersectionPoint.x - this.selectedDot.position.x;
                const deltaY = intersectionPoint.y - this.selectedDot.position.y;
                
                this.selectedDot.position.x = Math.round((this.selectedDot.position.x + deltaX) * 100) / 100;
                this.selectedDot.position.y = Math.round((this.selectedDot.position.y + deltaY) * 100) / 100;
                this.selectedDot.position.z = Math.round(this.selectedDot.position.z * 100) / 100; // Optional: Round the z-axis position
                
                this.updateLineVertices();
                this.saveToLocalStorage();
            }
        } else {
            this.controls.update();
        }
    }
    
    
    onMouseUp(event) {
        if (event.button === 2) {
            this.onRightClick(this.selectedDot.userData.id);
            return;
        }
        if (!this.isDragging && this.selectedDot) {
            this.performClickAction();
        }
        if (this.selectedDot) {
            this.saveToJsonFile(this.selectedDot.userData.id);
        }
        this.selectedDot = null;
        this.isDragging = false;
        this.controls.enabled = true;
    }

    updateLineVertices() {
        let vertexIndex = 0;
        const masterIndex = this.dots.findIndex(dot => dot.userData.role === 'master');

        for (let i = 0; i < this.dots.length; i++) {
            if (i === masterIndex) continue;
            this.lines.geometry.attributes.position.array[vertexIndex] = this.dots[masterIndex].position.x;
            this.lines.geometry.attributes.position.array[vertexIndex + 1] = this.dots[masterIndex].position.y;
            this.lines.geometry.attributes.position.array[vertexIndex + 2] = this.dots[masterIndex].position.z;

            this.lines.geometry.attributes.position.array[vertexIndex + 3] = this.dots[i].position.x;
            this.lines.geometry.attributes.position.array[vertexIndex + 4] = this.dots[i].position.y;
            this.lines.geometry.attributes.position.array[vertexIndex + 5] = this.dots[i].position.z;

            vertexIndex += 6;
        }

        this.lines.geometry.attributes.position.needsUpdate = true;
    }

    performClickAction() {
        const dotId = this.selectedDot.userData.id;
        const dotMessage = this.selectedDot.userData.message;
        const dotRole = this.selectedDot.userData.role;
        const originalDotPosition = this.selectedDot.position.clone();
        const x = originalDotPosition.x;
        const y = originalDotPosition.y;
        const z = originalDotPosition.z;

        alert(`Dot Information:\n\nID: ${dotId}\nX-axis: ${x}\nY-axis: ${y}\nZ-axis: ${z}\nMessage: ${dotMessage}\nRole: ${dotRole}`);
    }

    onRightClick(dotId) {
        console.log(`Double-clicked on dot with ID: ${dotId}`);
        window.location.href = `details.php?id=${dotId}`;
    }

    saveToLocalStorage() {
        const anchorPositions = {};
        this.dots.forEach(dot => {
            anchorPositions[dot.userData.id] = dot.position.toArray();
        });
        localStorage.setItem('anchorPositions', JSON.stringify(anchorPositions));
    }

    saveToJsonFile(dotId) {
        const anchorData = this.dots.map(dot => {
            const roundedX = parseFloat(dot.position.x.toFixed(2));
            const roundedY = parseFloat(dot.position.y.toFixed(2));
            const savedData = {
                id: dot.userData.id,
                x: roundedX,
                y: roundedY,
                z: dot.position.z,
                message: dot.userData.message,
            };
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
}
