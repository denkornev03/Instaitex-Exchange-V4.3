
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

const CONFIG = { size: 1 };
const COLORS = {
    sky: 0x4aa3df, white: 0xffffff, whiteShade: 0xe0e0e0, glass: 0x222244,
    rail: 0x888899, pylon: 0xdddddd, cable: 0xaaaaaa, water: 0x3b85d1,
    gunMetal: 0x2a2a2a, gold: 0xffcc00, wood: 0x8b4513, red: 0xcc0000,
};

interface SkyPodSceneProps { isNightVision?: boolean; }

const SkyPodScene: React.FC<SkyPodSceneProps> = ({ isNightVision = false }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const requestRef = useRef<number | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
    const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(COLORS.sky);
        scene.fog = new THREE.Fog(COLORS.sky, 60, 250);
        sceneRef.current = scene;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(-48, 36, 72);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimized
        
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 15, 0);
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.minDistance = 1;
        controls.maxDistance = 2000;
        controls.maxPolarAngle = Math.PI;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        ambientLightRef.current = ambientLight;

        const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
        dirLight.position.set(50, 80, 30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024; // Optimized
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);
        dirLightRef.current = dirLight;

        // --- Helper for Merging Voxels ---
        const boxGeo = new THREE.BoxGeometry(CONFIG.size, CONFIG.size, CONFIG.size);
        boxGeo.scale(0.95, 0.95, 0.95);

        // Helper to batch static geometry
        class InstanceBatcher {
            batches: { [color: number]: THREE.Matrix4[] } = {};
            
            add(x: number, y: number, z: number, color: number) {
                if (!this.batches[color]) this.batches[color] = [];
                const mat = new THREE.Matrix4().makeTranslation(x * CONFIG.size, y * CONFIG.size, z * CONFIG.size);
                this.batches[color].push(mat);
            }

            addToScene(scene: THREE.Scene) {
                Object.keys(this.batches).forEach(key => {
                    const color = parseInt(key);
                    const matrices = this.batches[color];
                    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.1 });
                    const mesh = new THREE.InstancedMesh(boxGeo, mat, matrices.length);
                    mesh.castShadow = true; mesh.receiveShadow = true;
                    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
                    scene.add(mesh);
                });
            }
        }

        // Helper to merge moving groups
        const createMergedGroup = (generateFn: (add: (x:number, y:number, z:number, mat: THREE.Material) => void) => void) => {
            const geometriesByMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>();
            
            generateFn((x, y, z, mat) => {
                const g = boxGeo.clone();
                g.translate(x * CONFIG.size, y * CONFIG.size, z * CONFIG.size);
                if (!geometriesByMaterial.has(mat)) geometriesByMaterial.set(mat, []);
                geometriesByMaterial.get(mat)?.push(g);
            });

            const group = new THREE.Group();
            geometriesByMaterial.forEach((geos, mat) => {
                if (geos.length > 0) {
                    const merged = mergeGeometries(geos);
                    const mesh = new THREE.Mesh(merged, mat);
                    mesh.castShadow = true; mesh.receiveShadow = true;
                    group.add(mesh);
                }
            });
            return group;
        };

        // Materials
        const matBody = new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.1 });
        const matBodyShade = new THREE.MeshStandardMaterial({ color: COLORS.whiteShade, roughness: 0.1 });
        const matGlass = new THREE.MeshStandardMaterial({ color: COLORS.glass, roughness: 0.0, metalness: 0.8 });
        const matConnector = new THREE.MeshStandardMaterial({ color: COLORS.rail, roughness: 0.1 });
        const matGun = new THREE.MeshStandardMaterial({ color: COLORS.gunMetal, roughness: 0.1 });

        // 1. Pod (Merged)
        const podGroup = createMergedGroup((add) => {
            const w = 6, h = 5, l = 10;
            for (let x = -l/2; x < l/2; x++) {
                for (let y = 0; y < h; y++) {
                    for (let z = -w/2; z < w/2; z++) {
                        const edgeX = x===-l/2 || x===l/2-1;
                        const edgeY = y===0 || y===h-1;
                        const edgeZ = z===-w/2 || z===w/2-1;
                        if ((edgeX && edgeY) || (edgeY && edgeZ) || (edgeX && edgeZ)) continue;
                        let mat = matBody;
                        if (z===w/2-1 || z===-w/2) if (x>-3 && x<3 && y>1 && y<4) mat = matGlass;
                        if (x===l/2-1 && y>1 && y<4 && Math.abs(z)<2) mat = matGlass;
                        if (y===0) mat = matBodyShade;
                        add(x, y, z, mat);
                    }
                }
            }
            for(let y=h; y<h+3; y++) { add(-2,y,0, matConnector); add(-1,y,0, matConnector); }
            add(4,1,0, matConnector);
        });

        // Minigun (Merged)
        const minigunGroup = createMergedGroup((add) => {
            add(0,0,0, matGun); add(1,0,0, matGun); add(1,-1,0, matGun); add(2,-0.5,0, matGun);
        });
        minigunGroup.position.set(0, -1, 0);
        podGroup.add(minigunGroup);

        // Speedometer
        const speedCanvas = document.createElement('canvas'); speedCanvas.width = 256; speedCanvas.height = 128;
        const speedCtx = speedCanvas.getContext('2d');
        const speedMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(speedCanvas), transparent: true, side: THREE.DoubleSide });
        const speedometer = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), speedMat);
        speedometer.position.set(0, 3, 5);
        podGroup.add(speedometer);
        podGroup.position.y = 15;
        scene.add(podGroup);

        // 2. Static Environment (Instanced)
        const envBatcher = new InstanceBatcher();
        const occupied = new Set<string>();
        const railY = 22;
        for (let x = -120; x < 120; x++) {
            envBatcher.add(x, railY, 0, COLORS.rail);
            if (x % 2 === 0) envBatcher.add(x, railY + 1, 0, COLORS.rail);
        }
        const createPylon = (baseX: number) => {
            for (let h = -20; h < 35; h += 0.25) {
                const xOff = Math.sin(h * 0.05) * 5;
                const zOff = Math.cos(h * 0.05) * 2;
                for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++) {
                    const k = `${Math.round(baseX+xOff+dx)},${Math.round(h)},${Math.round(10+zOff+dz)}`;
                    if(!occupied.has(k)) { occupied.add(k); envBatcher.add(Math.round(baseX+xOff+dx), Math.round(h), Math.round(10+zOff+dz), COLORS.pylon); }
                }
            }
            // Simplified Arm
            const armStartX = baseX + Math.sin(35 * 0.05) * 5;
            for (let i = 0; i <= 60; i++) {
                const t = i / 60;
                const cx = THREE.MathUtils.lerp(armStartX, baseX - 10, t);
                const cy = THREE.MathUtils.lerp(35, railY + 2, t);
                const cz = THREE.MathUtils.lerp(10 + Math.cos(35 * 0.05) * 2, 0, t);
                envBatcher.add(Math.round(cx), Math.round(cy + Math.sin(t*Math.PI)*5), Math.round(cz), COLORS.pylon);
            }
        };
        createPylon(40); createPylon(-40);
        envBatcher.addToScene(scene);

        // 3. River (Instanced)
        const matWater = new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: 0.05, metalness: 0.3 });
        const riverXRange = 250, riverZRange = 70;
        const xCount = riverXRange * 2, zCount = riverZRange * 2;
        const riverMesh = new THREE.InstancedMesh(boxGeo, matWater, xCount * zCount);
        riverMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        riverMesh.receiveShadow = true;
        const dummy = new THREE.Object3D();
        let idx = 0;
        for(let x = -riverXRange; x < riverXRange; x++) {
            for(let z = -riverZRange; z < riverZRange; z++) {
                dummy.position.set(x, -8, z); dummy.updateMatrix();
                riverMesh.setMatrixAt(idx++, dummy.matrix);
            }
        }
        scene.add(riverMesh);

        // Boat (Merged)
        const boatMatWood = new THREE.MeshStandardMaterial({ color: COLORS.wood, roughness: 0.1 });
        const boatMatWhite = new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.1 });
        const boatMatRed = new THREE.MeshStandardMaterial({ color: COLORS.red, roughness: 0.1 });
        const boatGroup = createMergedGroup((add) => {
            for(let x=-4; x<=4; x++) for(let z=-2; z<=2; z++) {
                add(x,0,z, boatMatWood);
                if(x===-4||x===4||z===-2||z===2) add(x,1,z, boatMatWood);
            }
            for(let y=0; y<8; y++) add(0,y,0, boatMatWood);
            for(let y=3; y<7; y++) for(let z=-3; z<3; z++) {
                add(Math.sin(z*0.5)*0.5, y, z, (z+y)%2===0 ? boatMatWhite : boatMatRed);
            }
        });
        scene.add(boatGroup);

        // Logic & Animation
        const boatState = { x: -150, z: 20, speed: 0.15, health: 100, isSinking: false, sinkTimer: 0 };
        const bullets: any[] = []; const particles: any[] = [];
        const clock = new THREE.Clock();
        let lastFireTime = 0;

        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Pod Move
            podGroup.position.x = Math.sin(time * 0.5) * 100;
            podGroup.position.y = railY - 6.5 + Math.sin(time * 2) * 0.1;
            podGroup.rotation.z = -Math.cos(time * 0.5) * 0.05;

            // Boat Logic
            if (!boatState.isSinking) {
                boatState.x += boatState.speed;
                if (boatState.x > 150) { boatState.x = -150; boatState.health = 100; }
                boatGroup.position.set(boatState.x, -7, boatState.z);
                boatGroup.rotation.z = Math.sin(time*2)*0.05;
                if (boatState.health <= 0) { boatState.isSinking = true; boatState.sinkTimer = 0; }
            } else {
                boatState.sinkTimer += 0.02;
                boatGroup.position.y -= 0.1;
                if (boatState.sinkTimer > 3) { boatState.isSinking = false; boatState.health = 100; boatState.x = -150; }
            }

            // River Wave
            for(let i=0; i<riverMesh.count; i++) {
                riverMesh.getMatrixAt(i, dummy.matrix);
                dummy.position.setFromMatrixPosition(dummy.matrix);
                dummy.position.y = -8 + Math.sin(dummy.position.x * 0.3 + time) * 0.5;
                dummy.updateMatrix();
                riverMesh.setMatrixAt(i, dummy.matrix);
            }
            riverMesh.instanceMatrix.needsUpdate = true;

            // Simple Speedometer
            if (speedCtx && speedMat.map) {
                const vel = Math.abs(100 * 0.5 * Math.cos(time * 0.5));
                speedCtx.clearRect(0, 0, 256, 128);
                speedCtx.fillStyle = '#00ffff'; speedCtx.font = 'bold 90px monospace';
                speedCtx.fillText(`${Math.round(vel)}`, 100, 80);
                speedMat.map.needsUpdate = true;
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            renderer.dispose();
            scene.clear();
        };
    }, []);

    // Night Vision Effect
    useEffect(() => {
        if (!sceneRef.current) return;
        if (isNightVision) {
            sceneRef.current.background = new THREE.Color(0x051a05);
            sceneRef.current.fog = new THREE.Fog(0x051a05, 10, 150);
            if (ambientLightRef.current) ambientLightRef.current.color.setHex(0xccffcc);
            if (dirLightRef.current) { dirLightRef.current.color.setHex(0x88ff88); dirLightRef.current.position.set(-20, 40, -20); }
        } else {
            sceneRef.current.background = new THREE.Color(COLORS.sky);
            sceneRef.current.fog = new THREE.Fog(COLORS.sky, 60, 250);
            if (ambientLightRef.current) ambientLightRef.current.color.setHex(0xffffff);
            if (dirLightRef.current) { dirLightRef.current.color.setHex(0xfffaed); dirLightRef.current.position.set(50, 80, 30); }
        }
    }, [isNightVision]);

    return (
        <div ref={mountRef} className="absolute inset-0 z-0 bg-[#3b75ba] transition-all duration-700"
            style={{ filter: isNightVision ? 'sepia(1) hue-rotate(60deg) saturate(2.5) contrast(1.2) brightness(0.9)' : 'none' }}>
            {isNightVision && (
                <div className="absolute inset-0 pointer-events-none z-10" 
                     style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 3px)' }}></div>
            )}
        </div>
    );
};

export default SkyPodScene;
