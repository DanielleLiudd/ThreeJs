var container, stats;
var camera, scene, raycaster, renderer,plane,controls;

var mouse = new THREE.Vector2(),offset = new THREE.Vector3(), INTERSECTED,SELECTED;
var radius = 500, theta = 0;
var frustumSize = 1000;
var objects =[];
init();
animate();

function init() {

	container = document.querySelector("#canvas");

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 300;
	
	scene = new THREE.Scene();

	scene.add( new THREE.AmbientLight( 0x505050 ) );
	var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 400 );
//	light.position.set( 1, 1, 1 ).normalize();
	light.castShadow = true;

	light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 2000 ) );
	light.shadow.bias = - 0.00022;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;

	scene.add( light );
	
	
	
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	
	plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
		new THREE.MeshBasicMaterial( { visible: false } )
	);
	scene.add( plane );

	var loader = new THREE.MTLLoader();
	loader.setBaseUrl( './resource/' );
	loader.setPath( './resource/' );
	loader.load( 'myobj.mtl', function( materials ) {

		materials.preload();

		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( './resource/' );
		objLoader.load( 'myobj.obj', function ( object ) {

			object.position.y = - 95;
			scene.add( object );
			
			object.children.forEach(function(item,i){
				item.uuid = "myfirstObj" + i;
				objects.push( item );
			})

		});

	});


	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x334455 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild( stats.dom );
	
	
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
				
	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	raycaster.setFromCamera( mouse, camera );

	if ( SELECTED ) {

		var intersects = raycaster.intersectObject( plane );

		if ( intersects.length > 0 ) {

			SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );

		}
		return;
	}

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			
			if(INTERSECTED.uuid){
				document.querySelector(".echarts").style.display = "block";
				draw(INTERSECTED.uuid)
			}
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		controls.enabled = false;

		SELECTED = intersects[ 0 ].object;

		var intersects = raycaster.intersectObject( plane );

		if ( intersects.length > 0 ) {

			offset.copy( intersects[ 0 ].point ).sub( plane.position );

		}

		container.style.cursor = 'move';

	}

}

function onDocumentMouseUp( event ) {

	event.preventDefault();

	controls.enabled = true;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}



function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
}


function render() {

	controls.update();
	renderer.render( scene, camera );
}

function draw(name){
	var myChart = echarts.init(document.querySelector(".echarts"));
	var labelRight = {
	    normal: {
	        position: 'right'
	    }
	};
	option = {
	    title: {
	        text: name,
	    },
	    tooltip : {
	        trigger: 'axis',
	        axisPointer : {            
	            type : 'shadow'     
	        }
	    },
	    grid: {
	        top: 80,
	        bottom: 30
	    },
	    xAxis: {
	        type : 'value',
	        position: 'top',
	        splitLine: {lineStyle:{type:'dashed'}},
	    },
	    yAxis: {
	        type : 'category',
	        axisLine: {show: false},
	        axisLabel: {show: false},
	        axisTick: {show: false},
	        splitLine: {show: false},
	        data : ['ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one']
	    },
	    series : [
	        {
	            name:'生活费',
	            type:'bar',
	            stack: '总量',
	            label: {
	                normal: {
	                    show: true,
	                    formatter: '{b}'
	                }
	            },
	            data:[
	                {value: -0.07, label: labelRight},
	                {value: -0.09, label: labelRight},
	                0.2, 0.44,
	                {value: -0.23, label: labelRight},
	                0.08,
	                {value: -0.17, label: labelRight},
	                0.47,
	                {value: -0.36, label: labelRight},
	                0.18
	            ]
	        }
	    ]
	};
	myChart.setOption(option,true);
}
