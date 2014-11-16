if (!Detector.webgl)
    Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer;
var plane, cube;
var vector, raycaster, isShiftDown = false;

var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;

var angle;

var objects = [];

var myMyo = Myo.create();
myMyo.on('gyroscope', function(data) {
    angle = Math.floor(data.y);
});

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(new THREE.Vector3());

    scene = new THREE.Scene();

    // roll-over helpers

    rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
    rollOverMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true
    });
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    scene.add(rollOverMesh);

    // cubes

    cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0xfeb74c,
        ambient: 0x00ff80,
        shading: THREE.FlatShading,
        map: THREE.ImageUtils.loadTexture("textures/square-outline-textured.png")
    });
    cubeMaterial.ambient = cubeMaterial.color;

    // grid

    var size = 500,
        step = 50;

    var geometry = new THREE.Geometry();

    for (var i = -size; i <= size; i += step) {

        geometry.vertices.push(new THREE.Vector3(-size, 0, i));
        geometry.vertices.push(new THREE.Vector3(size, 0, i));

        geometry.vertices.push(new THREE.Vector3(i, 0, -size));
        geometry.vertices.push(new THREE.Vector3(i, 0, size));

    }

    var material = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.2,
        transparent: true
    });

    var line = new THREE.Line(geometry, material);
    line.type = THREE.LinePieces;
    scene.add(line);

    //

    vector = new THREE.Vector3();
    raycaster = new THREE.Raycaster();

    var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    plane = new THREE.Mesh(geometry);
    plane.visible = false;
    scene.add(plane);

    objects.push(plane);

    // Lights

    var ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0xf0f0f0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);

    //

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

    event.preventDefault();

    vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera);

    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
        rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);

    }

    render();

}

function onDocumentMouseDown(event) {

    event.preventDefault();

    vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera);

    raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

        var intersect = intersects[0];

        // delete cube

        if (isShiftDown) {

            if (intersect.object != plane) {

                scene.remove(intersect.object);

                objects.splice(objects.indexOf(intersect.object), 1);

            }

            // create cube
        } else {

            var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            scene.add(voxel);

            objects.push(voxel);
        }
        render();
    }
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16:
            isShiftDown = true;
            break;
    }
}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 16:
            isShiftDown = false;
            break;
    }
}

function animate(){
	requestAnimationFrame( animate );
	render();
}

function render() {
	var timer = Date.now() * 0.0005;
	//console.log('Timer '+ Math.cos(timer) * 10);
	console.log('Angle: ' + Math.cos(angle * (Math.PI/180)) * 10);
	camera.position.x = camera.position.x + Math.cos(angle * (Math.PI/180)) * 10;
	camera.position.z = camera.position.z + Math.sin(angle * (Math.PI/180)) * 10;

	camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
