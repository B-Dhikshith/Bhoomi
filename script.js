                                                                                                                                                                                                                                                               // ---------------- MENU ----------------
function toggleMenu() {
    let menu = document.getElementById("sidebar");
    menu.style.left = (menu.style.left === "0px") ? "-250px" : "0px";
}

function toggleSubMenu() {
    let submenu = document.getElementById("concreteSubmenu");
    submenu.classList.toggle("show");
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
    container.innerHTML = "";

    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
    camera.position.set(10, 10, 15);
    camera.lookAt(0, 0, 0);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 300);
    renderer.setClearColor(0xffffff);
    container.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    // LIGHT
    let ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    // SOIL
    let soil = new THREE.Mesh(
        new THREE.BoxGeometry(50, 1, 50),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    soil.position.y = -0.5;
    scene.add(soil);

    // GRID
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

    function animate() {
        requestAnimationFrame(animate);
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

        // safety check
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
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // LIGHTS
        let light1 = new THREE.DirectionalLight(0xffffff, 1);
        light1.position.set(10, 20, 10);
        scene.add(light1);

        let light2 = new THREE.AmbientLight(0x404040);
        scene.add(light2);

        // MATERIALS
        let columnMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        let footingMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });

        // FOOTING (ALWAYS RECTANGLE)
        let footingLength = L * 2;
        let footingBreadth = B * 2;
        let footingDepth = 0.5;

        // SPACING (NO OVERLAP)
        let spacing = Math.max(footingLength, footingBreadth) * 2;

        let colsPerRow = Math.ceil(Math.sqrt(count));

        for (let i = 0; i < count; i++) {

            let row = Math.floor(i / colsPerRow);
            let col = i % colsPerRow;

            let x = col * spacing;
            let z = row * spacing;

            // FOOTING (RECTANGLE ONLY)
            let footingGeo = new THREE.BoxGeometry(
                footingLength,
                footingDepth,
                footingBreadth
            );

            let footing = new THREE.Mesh(footingGeo, footingMat);
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

        // CAMERA POSITION
        let totalSize = spacing * colsPerRow;

        camera.position.set(totalSize, totalSize, totalSize);
        camera.lookAt(totalSize / 2, 0, totalSize / 2);

        // CONTROLS (SAFE CHECK)
        if (THREE.OrbitControls) {
            let controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }

            animate();
        } else {
            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();
        }

    } catch (error) {
        console.error("3D Error:", error);
    }
}

function updateBeamInputs() {

    let shape = document.getElementById("beamShape").value;
    let html = "";

    if (shape === "square") {
        html = `
        <label>Side:</label>
        <input type="number" id="beamSide">
        <select id="beamSideUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    else {
        html = `
        <label>Length:</label>
        <input type="number" id="beamLength">
        <select id="beamLengthUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>

        <label>Breadth:</label>
        <input type="number" id="beamBreadth">
        <select id="beamBreadthUnit">
            <option value="1">Meter</option>
            <option value="0.01" selected>Centimeter</option>
            <option value="0.3048">Feet</option>
            <option value="0.0254">Inch</option>
        </select>`;
    }

    // ✅ ADD HEIGHT ALWAYS (IMPORTANT FIX)
    html += `
    <label>Height:</label>
    <input type="number" id="beamHeight">
    <select id="beamHeightUnit">
        <option value="1">Meter</option>
        <option value="0.01" selected>Centimeter</option>
        <option value="0.3048">Feet</option>
        <option value="0.0254">Inch</option>
    </select>
    `;

    document.getElementById("beamInputs").innerHTML = html;
}

function setBeamMix() {
    document.getElementById("beamMix").value =
        document.getElementById("beamGrade").value;
}

function calculateBeam() {

    let shape = document.getElementById("beamShape").value;

    let H = document.getElementById("beamHeight").value *
            document.getElementById("beamHeightUnit").value;

    let count = parseInt(document.getElementById("beamCount").value || 1);

    let mix = document.getElementById("beamMix").value.split(":").map(Number);

    let L = 0, B = 0;

    if (shape === "square") {
        let side = document.getElementById("beamSide").value *
                   document.getElementById("beamSideUnit").value;

        L = B = side;
    }

    else {
        L = document.getElementById("beamLength").value *
            document.getElementById("beamLengthUnit").value;

        B = document.getElementById("beamBreadth").value *
            document.getElementById("beamBreadthUnit").value;
    }

    // ✅ SAFE CHECK (FIXED)
    if (isNaN(L) || isNaN(B) || isNaN(H) || L <= 0 || B <= 0 || H <= 0) {
        alert("Enter valid values");
        return;
    }

    let volume = L * B * H * count;

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
    drawBeam3D(null, L, B, H, 0.5, 3, H);
}

function drawBeam3D(dummy, columnWidth, columnDepth, columnHeight, footingDepth, spacing, H) {

    let container = document.getElementById("beam3D");
    if (!container) return;

    container.innerHTML = "";

    let beamCount = parseInt(document.getElementById("beamCount").value || 1);
    if (beamCount < 1) return;

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    let camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 30, 20);
    scene.add(light);

    let columnMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    let footingMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });
    let beamMat = new THREE.MeshStandardMaterial({ color: 0x0077ff });

    let beamHeight = 0.3;
    let beamY = footingDepth + columnHeight;

    let positions = [];

    // ================== ≤ 4 BEAMS ==================
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

    else if (beamCount === 3) {

        // ✅ OPEN L / U
        positions = [
            { x: 0, z: 0 },
            { x: spacing, z: 0 },
            { x: spacing, z: spacing },
            { x: 0, z: spacing }
        ];
    }

    else if (beamCount === 4) {

        // ✅ CLOSED SQUARE
        positions = [
            { x: 0, z: 0 },
            { x: spacing, z: 0 },
            { x: spacing, z: spacing },
            { x: 0, z: spacing }
        ];
    }

    // 🔹 DRAW FOOTINGS + COLUMNS
    positions.forEach(p => {

        let footing = new THREE.Mesh(
            new THREE.BoxGeometry(spacing / 2, footingDepth, spacing / 2),
            footingMat
        );
        footing.position.set(p.x, footingDepth / 2, p.z);
        scene.add(footing);

        let column = new THREE.Mesh(
            new THREE.BoxGeometry(columnWidth, columnHeight, columnDepth),
            columnMat
        );
        column.position.set(p.x, beamY - columnHeight / 2, p.z);
        scene.add(column);
    });

    // 🔹 CREATE BEAMS
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
            new THREE.BoxGeometry(length, beamHeight, columnDepth),
            beamMat
        );

        beam.position.set(
            (a.x + b.x) / 2,
            beamY + beamHeight / 2,
            (a.z + b.z) / 2
        );

        beam.rotation.y = Math.atan2(dz, dx);

        scene.add(beam);
    });

    // ================== > 4 BEAMS (GRID) ==================
    if (beamCount > 4) {

        positions = [];

        let cols = Math.ceil(Math.sqrt(beamCount + 1));
        let rows = Math.ceil((beamCount + 1) / cols);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {

                let x = c * spacing;
                let z = r * spacing;

                positions.push({ x, z, r, c });

                let footing = new THREE.Mesh(
                    new THREE.BoxGeometry(spacing / 2, footingDepth, spacing / 2),
                    footingMat
                );
                footing.position.set(x, footingDepth / 2, z);
                scene.add(footing);

                let column = new THREE.Mesh(
                    new THREE.BoxGeometry(columnWidth, columnHeight, columnDepth),
                    columnMat
                );
                column.position.set(x, beamY - columnHeight / 2, z);
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
                    new THREE.BoxGeometry(spacing, beamHeight, columnDepth),
                    beamMat
                );

                beam.position.set(
                    (p.x + right.x) / 2,
                    beamY + beamHeight / 2,
                    p.z
                );

                scene.add(beam);
                beamsCreated++;
            }

            let front = positions.find(pt => pt.r === p.r + 1 && pt.c === p.c);

            if (front && beamsCreated < beamCount) {

                let beam = new THREE.Mesh(
                    new THREE.BoxGeometry(columnWidth, beamHeight, spacing),
                    beamMat
                );

                beam.position.set(
                    p.x,
                    beamY + beamHeight / 2,
                    (p.z + front.z) / 2
                );

                scene.add(beam);
                beamsCreated++;
            }
        }
    }

    // CAMERA
    let totalSize = spacing * 5;
    camera.position.set(totalSize, totalSize, totalSize);
    camera.lookAt(0, 0, 0);

    //scene.add(new THREE.GridHelper(50, 50));

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}

function calculateSlab() {

    let L = document.getElementById("slabLength").value *
            document.getElementById("slabLengthUnit").value;

    let B = document.getElementById("slabBreadth").value *
            document.getElementById("slabBreadthUnit").value;

    let T = document.getElementById("slabThickness").value *
            document.getElementById("slabThicknessUnit").value;

    let count = parseInt(document.getElementById("slabCount").value || 1);

    let mix = document.getElementById("slabMix").value.split(":").map(Number);

    let slabType = document.getElementById("slabType").value;

    if (!L || !B || !T) {
        alert("Enter all values");
        return;
    }

    // ✅ Determine slab type automatically also (optional check)
    let ratio = L / B;

    let typeText = "";

    if (slabType === "oneway" || ratio >= 2) {
        typeText = "One Way Slab";
    } else {
        typeText = "Two Way Slab";
    }

    let volume = L * B * T * count;

    let dryVolume = volume * 1.54;

    let total = mix[0] + mix[1] + mix[2];

    let cement = (dryVolume * mix[0] / total) / 0.035;
    let sand = (dryVolume * mix[1] / total);
    let agg = (dryVolume * mix[2] / total);

    document.getElementById("slabResult").innerHTML = `
        <b>${typeText}</b><br><br>
        Concrete Volume = ${volume.toFixed(2)} m³<br>
        Dry Volume = ${dryVolume.toFixed(2)} m³<br>
        Cement = ${Math.ceil(cement)} bags<br>
        Sand = ${sand.toFixed(2)} m³<br>
        Coarse Aggregate = ${agg.toFixed(2)} m³
    `;

    drawSlab3D(L, B, T, count, slabType);
}

function drawSlab3D(L, B, T, count, slabType) {

    let container = document.getElementById("slab3D");
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
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    // ✅ FIXED STRUCTURE SIZES
    let footingSize = 1.5;
    let footingDepth = 0.5;

    let columnWidth = 0.4;
    let columnHeight = 3;

    let beamWidth = 0.3;
    let beamDepth = 0.4;

    // ✅ GRID (NO GAP)
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);

    for (let i = 0; i < count; i++) {

        let r = Math.floor(i / cols);
        let c = i % cols;

        // ✅ NO GAP POSITION
        let offsetX = c * L;
        let offsetZ = r * B;

        // ---------------- FOOTINGS ----------------
        let footingPositions = [
            [0, 0],
            [L, 0],
            [0, B],
            [L, B]
        ];

        footingPositions.forEach(pos => {

            let footing = new THREE.Mesh(
                new THREE.BoxGeometry(footingSize, footingDepth, footingSize),
                new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
            );

            footing.position.set(
                pos[0] + offsetX,
                footingDepth / 2,
                pos[1] + offsetZ
            );

            scene.add(footing);
        });

        // ---------------- COLUMNS ----------------
        footingPositions.forEach(pos => {

            let column = new THREE.Mesh(
                new THREE.BoxGeometry(columnWidth, columnHeight, columnWidth),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );

            column.position.set(
                pos[0] + offsetX,
                footingDepth + columnHeight / 2,
                pos[1] + offsetZ
            );

            scene.add(column);
        });

        let beamY = footingDepth + columnHeight;

        // ✅ ONE WAY SLAB
        if (slabType === "oneway") {

            if (L > B) {
                [0, L].forEach(xPos => {
                    let beam = new THREE.Mesh(
                        new THREE.BoxGeometry(beamWidth, beamDepth, B),
                        new THREE.MeshStandardMaterial({ color: 0x0000ff })
                    );

                    beam.position.set(
                        xPos + offsetX,
                        beamY,
                        B / 2 + offsetZ
                    );

                    scene.add(beam);
                });

            } else {
                [0, B].forEach(zPos => {
                    let beam = new THREE.Mesh(
                        new THREE.BoxGeometry(L, beamDepth, beamWidth),
                        new THREE.MeshStandardMaterial({ color: 0x0000ff })
                    );

                    beam.position.set(
                        L / 2 + offsetX,
                        beamY,
                        zPos + offsetZ
                    );

                    scene.add(beam);
                });
            }
        }

        // ✅ TWO WAY SLAB
        else {

            // X-direction beams
            [0, B].forEach(zPos => {
                let beam = new THREE.Mesh(
                    new THREE.BoxGeometry(L, beamDepth, beamWidth),
                    new THREE.MeshStandardMaterial({ color: 0x0000ff })
                );

                beam.position.set(
                    L / 2 + offsetX,
                    beamY,
                    zPos + offsetZ
                );

                scene.add(beam);
            });

            // Z-direction beams
            [0, L].forEach(xPos => {
                let beam = new THREE.Mesh(
                    new THREE.BoxGeometry(beamWidth, beamDepth, B),
                    new THREE.MeshStandardMaterial({ color: 0x0000ff })
                );

                beam.position.set(
                    xPos + offsetX,
                    beamY,
                    B / 2 + offsetZ
                );

                scene.add(beam);
            });
        }

        // ---------------- SLAB ----------------
        let slab = new THREE.Mesh(
            new THREE.BoxGeometry(L, T, B),
            new THREE.MeshStandardMaterial({ color: 0xcccccc })
        );

        slab.position.set(
            L / 2 + offsetX,
            beamY + beamDepth / 2 + T / 2,
            B / 2 + offsetZ
        );

        scene.add(slab);
    }

    // CAMERA
    

    // ✅ FIXED CAMERA (no zoom change on recalculation)
    // ✅ AUTO FIT CAMERA (IMPORTANT FIX)
    let totalWidth = cols * L;
    let totalDepth = rows * B;
    let maxDim = Math.max(totalWidth, totalDepth);

// 👉 Center of model
    let centerX = totalWidth / 2;
    let centerZ = totalDepth / 2;

// 👉 Distance based on size
    let distance = maxDim * 1.5;

// 👉 Set camera position dynamically
    camera.position.set(centerX + distance, distance, centerZ + distance);

// 👉 Look at center of structure
    camera.lookAt(centerX, 0, centerZ);

// 👉 Update controls target
    controls.target.set(centerX, 0, centerZ);
    controls.update();
    camera.lookAt(0, 0, 0);

    // GRID HELPER
    //scene.add(new THREE.GridHelper(50, 50));

    // ANIMATION
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
