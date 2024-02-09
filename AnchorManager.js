import * as THREE from 'three';

export default class AnchorManager {
    constructor(scene) {
        this.scene = scene;
        this.data = null;
        this.masterDot = null;
        this.dots = new THREE.Group();
        this.lines = null;
        this.plane = null;
    }

    async fetchData(url) {
        try {
            const response = await fetch(url);
            this.data = await response.json();
            this.processData();
            this.setupLines();
        } catch (error) {
            console.error('Error fetching anchor data:', error);
        }
    }

    processData() {
        let maxX = 0;
        let maxY = 0;

        this.data.forEach(({ x, y }) => {
            maxX = Math.max(maxX, Math.abs(parseFloat(x)));
            maxY = Math.max(maxY, Math.abs(parseFloat(y)));
        });

        const planeGeometry = new THREE.PlaneGeometry(maxX * 2 + 1, maxY * 2 + 1, maxX * 2 + 1, maxY * 2 + 1);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x008000, wireframe: true });
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.name = 'plane';
        this.scene.add(this.plane);

        this.data.forEach(({ id, x, y, z, message, role, sync }) => {
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
            this.dots.add(dot);
        });

        this.scene.add(this.dots);

        this.masterDot = this.data.find(dot => dot.role === 'master');
    }

    setupLines() {
        const lineGeometry = new THREE.BufferGeometry();
        const numConnections = this.data.length - 1;
        const vertices = new Float32Array(numConnections * 2 * 3);
        const colors = new Float32Array(numConnections * 2 * 3);

        let vertexIndex = 0;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].role === 'master') continue;

            vertices[vertexIndex] = this.data[i].x;
            vertices[vertexIndex + 1] = this.data[i].y;
            vertices[vertexIndex + 2] = this.data[i].z;

            vertices[vertexIndex + 3] = this.masterDot.x;
            vertices[vertexIndex + 4] = this.masterDot.y;
            vertices[vertexIndex + 5] = this.masterDot.z;

            const syncStatus = this.data[i].sync;
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
        lineMaterial.vertexColors = true;
        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }
}