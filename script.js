                                                                                                                                                                                                                                                               // ---------------- MENU ----------------
function toggleMenu() {
    let menu = document.getElementById("sidebar");
    menu.style.left = (menu.style.left === "0px") ? "-250px" : "0px";
}
function toggleSubMenu(menuId) {

    let menus = document.querySelectorAll(".submenu");

    menus.forEach(m => {
        if (m.id !== menuId) {
            m.classList.remove("show");
        }
    });

    let menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle("show");
}


// ---------------- PAGE ----------------
window.onload = function () {
    showPage('home');

    if (document.getElementById("shape")) {
        updateInputs();
        setMixRatio();
    }

    if (document.getElementById("colShape")) {
    updateColumnInputs();
    }

    if (document.getElementById("beamShape")) {
    updateBeamInputs();
    }
};

function showPage(pageId) {
    let pages = document.querySelectorAll(".page");

    pages.forEach(p => {
        p.style.display = "none";
        p.classList.remove("active");
    });

    let selected = document.getElementById(pageId);
    if (!selected) return;

    selected.style.display = "block";

    setTimeout(() => {
        selected.classList.add("active");
    }, 10);

    document.getElementById("sidebar").style.left = "-250px";
}

// ---------------- INPUTS ----------------
function updateInputs() {
    let shape = document.getElementById("shape").value;
    let html = "";

    if (shape === "square") {
        html = `
        <label>Side:</label>
        <input type="number" id="side">
        <select id="sideUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    else if (shape === "rectangular") {
        html = `
        <label>Length:</label>
        <input type="number" id="length">
        <select id="lengthUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>

        <label>Breadth:</label>
        <input type="number" id="breadth">
        <select id="breadthUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    else {
        html = `
        <label>Diameter:</label>
        <input type="number" id="diameter">
        <select id="diameterUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    html += `
    <label>Depth:</label>
    <input type="number" id="depth">
    <select id="depthUnit">
        <option value="1">Meter</option>
        <option value="0.01" selected>Centimeter</option>
        <option value="0.3048">Feet</option>
        <option value="0.0254">Inch</option>
    </select>`;

    document.getElementById("inputs").innerHTML = html;
}

// ---------------- MIX ----------------
function setMixRatio() {
    let grade = document.getElementById("grade").value;

    let ratios = {
        "1:2:4": "1:2:4",
        "1:1.5:3": "1:1.5:3",
        "1:1:2": "1:1:2"
    };

    document.getElementById("mixRatio").value = ratios[grade];
}

// ---------------- CALCULATION ----------------
function calculateFooting() {

    let shape = document.getElementById("shape").value;
    let count = parseInt(document.getElementById("count").value || 1);
    let mix = document.getElementById("mixRatio").value;

    let d = document.getElementById("depth").value *
            document.getElementById("depthUnit").value;

    if (!d || d <= 0) d = 0.5;

    let volume = 0;

    if (shape === "square") {
        let s = document.getElementById("side").value *
                document.getElementById("sideUnit").value;

        volume = s * s * d;
    }

    else if (shape === "rectangular") {
        let l = document.getElementById("length").value *
                document.getElementById("lengthUnit").value;

        let b = document.getElementById("breadth").value *
                document.getElementById("breadthUnit").value;

        volume = l * b * d;
    }

    else {
        let dia = document.getElementById("diameter").value *
                  document.getElementById("diameterUnit").value;

        volume = (Math.PI / 4) * dia * dia * d;
    }

    volume *= count;

    let dryVolume = volume * 1.54;

    let parts = mix.split(":").map(Number);
    let total = parts[0] + parts[1] + parts[2];

    let cement = (parts[0] / total) * dryVolume / 0.035;
    let sand = (parts[1] / total) * dryVolume;
    let agg = (parts[2] / total) * dryVolume;

    document.getElementById("result").innerHTML =
        "Wet Volume = " + volume.toFixed(2) + " m³<br>" +
        "Dry Volume = " + dryVolume.toFixed(2) + " m³<br>" +
        "Cement = " + Math.ceil(cement) + " bags<br>" +
        "Sand = " + sand.toFixed(2) + " m³<br>" +
        "Aggregate = " + agg.toFixed(2) + " m³";

    draw3D(shape, count, d);
}

// ---------------- 3D ----------------
function draw3D(shape, count, d) {

    let container = document.getElementById("viewer3D");
    if (!container) return;

    container.innerHTML = "";

    // SCENE
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // CAMERA (responsive)
    let camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    // RENDERER
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
        container.clientWidth || 500,
        container.clientHeight || 300
    );
    container.appendChild(renderer.domElement);

    // CONTROLS ✅ FULL FEATURES
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;

    controls.enablePan = true;

    controls.minDistance = 2;
    controls.maxDistance = 500;

    // LIGHT
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 30, 20);
    scene.add(light);

    // SOIL
    let soil = new THREE.Mesh(
        new THREE.BoxGeometry(100, 1, 100),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    soil.position.y = -0.5;
    scene.add(soil);

    // GRID SIZE
    let gridSize = Math.ceil(Math.sqrt(count));

    let maxSize = 1;

    if (shape === "square") {
        maxSize = document.getElementById("side").value *
                  document.getElementById("sideUnit").value;
    }
    else if (shape === "rectangular") {
        let l = document.getElementById("length").value *
                document.getElementById("lengthUnit").value;

        let b = document.getElementById("breadth").value *
                document.getElementById("breadthUnit").value;

        maxSize = Math.max(l, b);
    }
    else {
        maxSize = document.getElementById("diameter").value *
                  document.getElementById("diameterUnit").value;
    }

    let spacing = maxSize + 1;
    let offset = (gridSize - 1) * spacing / 2;

    // CREATE FOOTINGS + COLUMNS
    for (let i = 0; i < count; i++) {

        let row = Math.floor(i / gridSize);
        let col = i % gridSize;

        let x = col * spacing - offset;
        let z = row * spacing - offset;

        let footing, column;

        if (shape === "square") {

            let s = maxSize;

            footing = new THREE.Mesh(
                new THREE.BoxGeometry(s, d, s),
                new THREE.MeshStandardMaterial({ color: 0xbfbfbf })
            );

            column = new THREE.Mesh(
                new THREE.BoxGeometry(s / 4, d * 2, s / 4),
                new THREE.MeshStandardMaterial({ color: 0x999999 })
            );
        }

        else if (shape === "rectangular") {

            let l = document.getElementById("length").value *
                    document.getElementById("lengthUnit").value;

            let b = document.getElementById("breadth").value *
                    document.getElementById("breadthUnit").value;

            footing = new THREE.Mesh(
                new THREE.BoxGeometry(l, d, b),
                new THREE.MeshStandardMaterial({ color: 0xbfbfbf })
            );

            column = new THREE.Mesh(
                new THREE.BoxGeometry(l / 5, d * 2, b / 5),
                new THREE.MeshStandardMaterial({ color: 0x999999 })
            );
        }

        else {

            let dia = maxSize;

            footing = new THREE.Mesh(
                new THREE.CylinderGeometry(dia / 2, dia / 2, d, 32),
                new THREE.MeshStandardMaterial({ color: 0xbfbfbf })
            );

            column = new THREE.Mesh(
                new THREE.CylinderGeometry(dia / 8, dia / 8, d * 2, 32),
                new THREE.MeshStandardMaterial({ color: 0x999999 })
            );
        }

        footing.position.set(x, d / 2, z);
        column.position.set(x, d + d, z);

        scene.add(footing);
        scene.add(column);
    }

    // ✅ AUTO CAMERA FIT (MAIN FIX)
    let totalSize = gridSize * spacing;
    let distance = totalSize * 1.5;

    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);

    controls.target.set(0, 0, 0);
    controls.update();

    // ANIMATION
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

function updateColumnInputs() {

    let shape = document.getElementById("colShape").value;
    let html = "";

    if (shape === "square") {
        html = `
        <label>Side:</label>
        <input type="number" id="colSide">
        <select id="colSideUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    else if (shape === "rectangular") {
        html = `
        <label>Length:</label>
        <input type="number" id="colLength">
        <select id="colLengthUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>

        <label>Breadth:</label>
        <input type="number" id="colBreadth">
        <select id="colBreadthUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    else {
        html = `
        <label>Diameter:</label>
        <input type="number" id="colDiameter">
        <select id="colDiameterUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    document.getElementById("columnInputs").innerHTML = html;
}
// AUTO MIX
function setColumnMix() {
    document.getElementById("colMix").value =
        document.getElementById("colGrade").value;
}

// MAIN CALCULATION
function calculateColumn() {

    let shape = document.getElementById("colShape").value;

    let heightInput = document.getElementById("colHeight");
    let heightUnit = document.getElementById("colHeightUnit");

    let H = 0;

    if (heightInput && heightUnit) {
        H = parseFloat(heightInput.value || 0) * parseFloat(heightUnit.value || 1);
    }

    if (H <= 0) {
        alert("Please enter valid column height");
        return;
    }

    let count = parseInt(document.getElementById("colCount").value || 1);

    let mix = document.getElementById("colMix").value.split(":").map(Number);

    let L = 0, B = 0;

    if (shape === "square") {
        L = B = document.getElementById("colSide").value *
                document.getElementById("colSideUnit").value;
    }

    else if (shape === "rectangular") {
        L = document.getElementById("colLength").value *
            document.getElementById("colLengthUnit").value;

        B = document.getElementById("colBreadth").value *
            document.getElementById("colBreadthUnit").value;
    }

    else {
        let dia = document.getElementById("colDiameter").value *
                  document.getElementById("colDiameterUnit").value;

        L = B = dia;
    }

    let volume = 0;

    if (shape === "circular") {
        let r = L / 2;
        volume = Math.PI * r * r * H * count;
    } else {
        volume = L * B * H * count;
    }

    let dryVolume = volume * 1.54;

    let total = mix[0] + mix[1] + mix[2];

    let cement = (dryVolume * mix[0] / total) / 0.035;
    let sand = (dryVolume * mix[1] / total);
    let agg = (dryVolume * mix[2] / total);

    document.getElementById("colResult").innerHTML = `
        Concrete Volume = ${volume.toFixed(2)} m³<br>
        Dry Volume = ${dryVolume.toFixed(2)} m³<br>
        Cement = ${Math.ceil(cement)} bags<br>
        Sand = ${sand.toFixed(2)} m³<br>
        Coarse Aggregate = ${agg.toFixed(2)} m³
    `;

    drawColumns(shape, L, B, H, count);
}

function drawColumns(shape, L, B, H, count) {

    try {

        let container = document.getElementById("column3D");
        if (!container) return;

        container.innerHTML = "";

        // SCENE
        let scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // CAMERA
        let camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        // RENDERER
        let renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            container.clientWidth || 500,
            container.clientHeight || 300
        );
        container.appendChild(renderer.domElement);

        // CONTROLS ✅ FULL INTERACTION
        let controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        controls.enableZoom = true;
        controls.zoomSpeed = 1.2;

        controls.enablePan = true;

        controls.minDistance = 5;
        controls.maxDistance = 500;

        // LIGHTS
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        let light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(20, 30, 20);
        scene.add(light);

        // MATERIALS
        let columnMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        let footingMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });

        // FOOTING SIZE
        let footingLength = L * 2;
        let footingBreadth = B * 2;
        let footingDepth = 0.5;

        // SPACING
        let spacing = Math.max(footingLength, footingBreadth) * 2;

        let colsPerRow = Math.ceil(Math.sqrt(count));

        // CENTER OFFSET (IMPORTANT FIX)
        let totalSize = colsPerRow * spacing;
        let offset = totalSize / 2 - spacing / 2;

        for (let i = 0; i < count; i++) {

            let row = Math.floor(i / colsPerRow);
            let col = i % colsPerRow;

            let x = col * spacing - offset;
            let z = row * spacing - offset;

            // FOOTING
            let footing = new THREE.Mesh(
                new THREE.BoxGeometry(footingLength, footingDepth, footingBreadth),
                footingMat
            );

            footing.position.set(x, footingDepth / 2, z);
            scene.add(footing);

            // COLUMN
            let columnGeo;

            if (shape === "circular") {
                columnGeo = new THREE.CylinderGeometry(L / 2, L / 2, H, 32);
            } else {
                columnGeo = new THREE.BoxGeometry(L, H, B);
            }

            let column = new THREE.Mesh(columnGeo, columnMat);
            column.position.set(x, footingDepth + H / 2, z);
            scene.add(column);
        }

        // ✅ AUTO CAMERA FIT (MAIN FIX)
        let maxDim = totalSize;
        let distance = maxDim * 1.5;

        camera.position.set(distance, distance, distance);
        camera.lookAt(0, 0, 0);

        controls.target.set(0, 0, 0);
        controls.update();

        // ANIMATION
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }

        animate();

    } catch (error) {
        console.error("3D Error:", error);
    }
}

function setBeamMix() {
    document.getElementById("beamMix").value =
        document.getElementById("beamGrade").value;
}

function calculateBeam() {

    let L = parseFloat(document.getElementById("beamLength").value || 0) *
            parseFloat(document.getElementById("beamLengthUnit").value || 1);

    let B = parseFloat(document.getElementById("beamBreadth").value || 0) *
            parseFloat(document.getElementById("beamBreadthUnit").value || 1);

    let D = parseFloat(document.getElementById("beamDepth").value || 0) *
            parseFloat(document.getElementById("beamDepthUnit").value || 1);

    let count = parseInt(document.getElementById("beamCount").value || 1);

    let mix = document.getElementById("beamMix").value.split(":").map(Number);

    // validation
    if (L <= 0 || B <= 0 || D <= 0) {
        alert("Please enter all dimensions");
        return;
    }

    // volume
    let volume = L * B * D * count;
    let dryVolume = volume * 1.54;

    let total = mix[0] + mix[1] + mix[2];

    let cement = (dryVolume * mix[0] / total) / 0.035;
    let sand = (dryVolume * mix[1] / total);
    let agg = (dryVolume * mix[2] / total);

    document.getElementById("beamResult").innerHTML = `
        Concrete Volume = ${volume.toFixed(2)} m³<br>
        Dry Volume = ${dryVolume.toFixed(2)} m³<br>
        Cement = ${Math.ceil(cement)} bags<br>
        Sand = ${sand.toFixed(2)} m³<br>
        Coarse Aggregate = ${agg.toFixed(2)} m³
    `;

    // ✅ IMPORTANT → CALL 3D
    drawBeam3D(L, B, D, count);
}

function drawBeam3D(L, B, D, beamCount) {

    let container = document.getElementById("beam3D");
    if (!container) return;

    container.innerHTML = "";

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    let camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth || 500, container.clientHeight || 300);
    container.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 30, 20);
    scene.add(light);

    // MATERIALS
    let beamMat = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    let columnMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    let footingMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });

    let spacing = L * 2;
    let beamY = 3;

    let positions = [];

    // ================== ≤ 4 BEAMS ==================
    if (beamCount <= 4) {

        if (beamCount === 1) {
            positions = [
                { x: 0, z: 0 },
                { x: spacing, z: 0 }
            ];
        }

        else if (beamCount === 2) {
            // ✅ L SHAPE
            positions = [
                { x: 0, z: 0 },
                { x: spacing, z: 0 },
                { x: spacing, z: spacing }
            ];
        }

        else {
            // ✅ 3 or 4 beams → square layout
            positions = [
                { x: 0, z: 0 },
                { x: spacing, z: 0 },
                { x: spacing, z: spacing },
                { x: 0, z: spacing }
            ];
        }

        // 🔹 FOOTINGS + COLUMNS
        positions.forEach(p => {

            let footing = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.5, 1.5),
                footingMat
            );
            footing.position.set(p.x, 0.25, p.z);
            scene.add(footing);

            let column = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, beamY, 0.4),
                columnMat
            );
            column.position.set(p.x, beamY / 2, p.z);
            scene.add(column);
        });

        // 🔹 BEAM CONNECTIONS
        let pairs = [];

        if (beamCount === 1) {
            pairs = [[positions[0], positions[1]]];
        }

        else if (beamCount === 2) {
            pairs = [
                [positions[0], positions[1]],
                [positions[1], positions[2]]
            ];
        }

        else if (beamCount === 3) {
            pairs = [
                [positions[0], positions[1]],
                [positions[1], positions[2]],
                [positions[2], positions[3]]
            ];
        }

        else if (beamCount === 4) {
            // 🔥 CLOSED SQUARE (MAIN FIX)
            pairs = [
                [positions[0], positions[1]],
                [positions[1], positions[2]],
                [positions[2], positions[3]],
                [positions[3], positions[0]]
            ];
        }

        // 🔹 DRAW BEAMS
        pairs.forEach(([a, b]) => {

            let dx = b.x - a.x;
            let dz = b.z - a.z;
            let length = Math.sqrt(dx * dx + dz * dz);

            let beam = new THREE.Mesh(
                new THREE.BoxGeometry(length, D, B),
                beamMat
            );

            beam.position.set(
                (a.x + b.x) / 2,
                beamY,
                (a.z + b.z) / 2
            );

            beam.rotation.y = Math.atan2(dz, dx);

            scene.add(beam);
        });
    }

    // ================== > 4 BEAMS ==================
    else {

        let cols = Math.ceil(Math.sqrt(beamCount + 1));
        let rows = Math.ceil((beamCount + 1) / cols);

        let positions = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {

                let x = c * spacing;
                let z = r * spacing;

                positions.push({ x, z, r, c });

                let footing = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 0.5, 1.5),
                    footingMat
                );
                footing.position.set(x, 0.25, z);
                scene.add(footing);

                let column = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, beamY, 0.4),
                    columnMat
                );
                column.position.set(x, beamY / 2, z);
                scene.add(column);
            }
        }

        let beamsCreated = 0;

        for (let i = 0; i < positions.length; i++) {

            if (beamsCreated >= beamCount) break;

            let p = positions[i];

            let right = positions.find(pt => pt.r === p.r && pt.c === p.c + 1);
            if (right && beamsCreated < beamCount) {

                let beam = new THREE.Mesh(
                    new THREE.BoxGeometry(spacing, D, B),
                    beamMat
                );

                beam.position.set((p.x + right.x) / 2, beamY, p.z);
                scene.add(beam);
                beamsCreated++;
            }

            let front = positions.find(pt => pt.r === p.r + 1 && pt.c === p.c);
            if (front && beamsCreated < beamCount) {

                let beam = new THREE.Mesh(
                    new THREE.BoxGeometry(B, D, spacing),
                    beamMat
                );

                beam.position.set(p.x, beamY, (p.z + front.z) / 2);
                scene.add(beam);
                beamsCreated++;
            }
        }
    }

    // CAMERA
    let size = spacing * 3;
    camera.position.set(size, size, size);
    camera.lookAt(0, 0, 0);

    controls.target.set(0, 0, 0);
    controls.update();

    // ANIMATION
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

function setSlabMix() {
    document.getElementById("slabMix").value =
        document.getElementById("slabGrade").value;
}

function calculateSlab() {

    console.log("Slab Calculate Clicked");

    let L = parseFloat(document.getElementById("slabLength").value || 0);
    let B = parseFloat(document.getElementById("slabBreadth").value || 0);
    let T = parseFloat(document.getElementById("slabThickness").value || 0);

    let count = parseInt(document.getElementById("slabCount").value || 1);

    let mix = document.getElementById("slabMix").value.split(":").map(Number);

    if (L <= 0 || B <= 0 || T <= 0) {
        alert("Enter valid slab dimensions");
        return;
    }

    // ✅ VOLUME
    let volume = L * B * T * count;
    let dryVolume = volume * 1.54;

    let total = mix[0] + mix[1] + mix[2];

    let cement = (dryVolume * mix[0] / total) / 0.035;
    let sand = (dryVolume * mix[1] / total);
    let agg = (dryVolume * mix[2] / total);

    document.getElementById("slabResult").innerHTML = `
        Concrete Volume = ${volume.toFixed(2)} m³<br>
        Dry Volume = ${dryVolume.toFixed(2)} m³<br>
        Cement = ${Math.ceil(cement)} bags<br>
        Sand = ${sand.toFixed(2)} m³<br>
        Aggregate = ${agg.toFixed(2)} m³
    `;

    // ✅ CALL 3D (your latest function)
    drawSlab3D(L, B, T, count);
}
function drawSlab3D(L, B, T, count) {

    let container = document.getElementById("slab3D");
    if (!container) return;

    container.innerHTML = "";

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // CAMERA
    let camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
    );

    // RENDERER
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
        container.clientWidth || 500,
        container.clientHeight || 300
    );
    container.appendChild(renderer.domElement);

    // CONTROLS ✅ FULL CONTROL
    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 5;
    controls.maxDistance = 2000;

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 30, 20);
    scene.add(light);

    // FIXED STRUCTURE SIZES
    let footingSize = 1.5;
    let footingDepth = 0.5;

    let columnWidth = 0.4;
    let columnHeight = 3;

    let beamWidth = 0.3;
    let beamDepth = 0.4;

    let beamY = footingDepth + columnHeight;

    // ✅ GRID (NO GAP BETWEEN SLABS)
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);

    let totalWidth = cols * L;
    let totalDepth = rows * B;

    let offsetX = totalWidth / 2 - L / 2;
    let offsetZ = totalDepth / 2 - B / 2;

    for (let i = 0; i < count; i++) {

        let r = Math.floor(i / cols);
        let c = i % cols;

        let baseX = c * L - offsetX;
        let baseZ = r * B - offsetZ;

        // FOOTING POSITIONS
        let footingPositions = [
            [0, 0],
            [L, 0],
            [0, B],
            [L, B]
        ];

        // FOOTINGS
        footingPositions.forEach(pos => {

            let footing = new THREE.Mesh(
                new THREE.BoxGeometry(footingSize, footingDepth, footingSize),
                new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
            );

            footing.position.set(
                pos[0] + baseX,
                footingDepth / 2,
                pos[1] + baseZ
            );

            scene.add(footing);
        });

        // COLUMNS
        footingPositions.forEach(pos => {

            let column = new THREE.Mesh(
                new THREE.BoxGeometry(columnWidth, columnHeight, columnWidth),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );

            column.position.set(
                pos[0] + baseX,
                footingDepth + columnHeight / 2,
                pos[1] + baseZ
            );

            scene.add(column);
        });

        // BEAMS (RECTANGLE)
        // X-direction
        [0, B].forEach(z => {
            let beam = new THREE.Mesh(
                new THREE.BoxGeometry(L, beamDepth, beamWidth),
                new THREE.MeshStandardMaterial({ color: 0x0000ff })
            );

            beam.position.set(
                L / 2 + baseX,
                beamY,
                z + baseZ
            );

            scene.add(beam);
        });

        // Z-direction
        [0, L].forEach(x => {
            let beam = new THREE.Mesh(
                new THREE.BoxGeometry(beamWidth, beamDepth, B),
                new THREE.MeshStandardMaterial({ color: 0x0000ff })
            );

            beam.position.set(
                x + baseX,
                beamY,
                B / 2 + baseZ
            );

            scene.add(beam);
        });

        // SLAB
        let slab = new THREE.Mesh(
            new THREE.BoxGeometry(L, T, B),
            new THREE.MeshStandardMaterial({ color: 0xcccccc })
        );

        slab.position.set(
            L / 2 + baseX,
            beamY + beamDepth / 2 + T / 2,
            B / 2 + baseZ
        );

        scene.add(slab);
    }

    // ✅ AUTO CAMERA FIT (MAIN FIX)
    let maxDim = Math.max(totalWidth, totalDepth);
    let distance = maxDim * 1.5;

    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);

    controls.target.set(0, 0, 0);
    controls.update();

    // ANIMATION
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

function setWallMix() {
    document.getElementById("wallMix").value =
        document.getElementById("wallGrade").value;
}

function calculateWall() {

    let L = wallL.value * wallLUnit.value;
    let H = wallH.value * wallHUnit.value;
    let T = wallT.value * wallTUnit.value;

    let mix = wallMix.value.split(":").map(Number);

    if (!L || !H || !T) {
        alert("Enter all values");
        return;
    }
    let area = L * H;
    let volume = L * H * T;
    let dry = volume * 1.33;

    let total = mix[0] + mix[1];

    let cement = (dry * mix[0] / total) / 0.035;
    let sand = dry * mix[1] / total;

    wallResult.innerHTML = `
        Area of Wall = ${area.toFixed(2)} m² <br>
        Wet Volume = ${volume.toFixed(2)} m³ <br>
        Dry Volume = ${dry.toFixed(2)} m³ <br>
        Cement = ${Math.ceil(cement)} bags <br>
        Sand = ${sand.toFixed(2)} m³
    `;
}

function setPlasterMix() {
    document.getElementById("plasterMix").value =
        document.getElementById("plasterGrade").value;
}

function calculatePlaster() {

    let L = plasterL.value * plasterLUnit.value;
    let H = plasterH.value * plasterHUnit.value;
    let T = plasterT.value * plasterTUnit.value;

    let mix = plasterMix.value.split(":").map(Number);

    if (!L || !H || !T) {
        alert("Enter all values");
        return;
    }

    let area = L * H;
    let volume = area * T;
    let dry = volume * 1.33;

    let total = mix[0] + mix[1];

    let cement = (dry * mix[0] / total) / 0.035;
    let sand = dry * mix[1] / total;

    plasterResult.innerHTML = `
        Area of Wall = ${area.toFixed(2)} m² <br>
        Wet Volume = ${volume.toFixed(2)} m³ <br>
        Dry Volume = ${dry.toFixed(2)} m³ <br>
        Cement = ${Math.ceil(cement)} bags <br>
        Sand = ${sand.toFixed(2)} m³
    `;
}
