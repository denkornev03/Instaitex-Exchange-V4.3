
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CONFIG = {
    colors: {
        bg: 0x1a1a1a,
        teal: 0x00B2B2,
        white: 0xFFFFFF
    },
    voxelSize: 0.55,
    gridGap: 0.05,
    ringRadius: 35,
    ringLayers: 8,
};

const GafferScene = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colors.bg);
        scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.002);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 30, 140);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // OPTIMIZATION: Cap Pixel Ratio
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.minDistance = 1;
        controls.maxDistance = 2000;
        controls.maxPolarAngle = Math.PI;

        // --- OPTIMIZED VOXEL GENERATION WITH INSTANCED MESH ---
        const boxGeo = new THREE.BoxGeometry(CONFIG.voxelSize, CONFIG.voxelSize, CONFIG.voxelSize);
        
        // Materials
        const matTeal = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.teal, roughness: 0.2, metalness: 0.3,
            emissive: CONFIG.colors.teal, emissiveIntensity: 1.2
        });
        const matWhite = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.white, roughness: 0.2, metalness: 0.3,
            emissive: 0xffffff, emissiveIntensity: 1.5
        });

        // Store instance data separately
        const tealInstances: { x: number, y: number, z: number, phase: number }[] = [];
        const whiteInstances: { x: number, y: number, z: number, phase: number }[] = [];

        // Helper to parse text to voxels
        const createTextData = (text: string, yPos: number, targetArray: any[], scaleX = 1, zOffset = 0) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 200; canvas.height = 50;
            ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.fillStyle = 'white'; ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            for (let y = 0; y < canvas.height; y += 1) {
                for (let x = 0; x < canvas.width; x += 1) {
                    if (data[(y * canvas.width + x) * 4] > 128) {
                        targetArray.push({
                            x: (x - canvas.width / 2) * (CONFIG.voxelSize + CONFIG.gridGap) * scaleX,
                            y: (canvas.height - y) * (CONFIG.voxelSize + CONFIG.gridGap) + yPos,
                            z: zOffset,
                            phase: Math.random() * Math.PI * 2
                        });
                    }
                }
            }
        };

        const createRingData = (targetArray: any[]) => {
            const layers = CONFIG.ringLayers;
            const thicknessStep = CONFIG.voxelSize + CONFIG.gridGap;
            const startRadius = CONFIG.ringRadius - (layers - 1) * thicknessStep * 0.5;
            for (let l = 0; l < layers; l++) {
                const r = startRadius + l * thicknessStep;
                const count = Math.floor((2 * Math.PI * r) / (CONFIG.voxelSize + CONFIG.gridGap));
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    targetArray.push({
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r,
                        z: 0,
                        phase: angle * 6
                    });
                }
            }
        };

        createTextData("GAFFER", -6, tealInstances, 0.9, 0);
        createTextData("STUDIO", -24, whiteInstances, 0.9, 0);
        createRingData(tealInstances);

        // Create Instanced Meshes
        const createInstancedMesh = (instances: any[], material: THREE.Material) => {
            if (instances.length === 0) return null;
            const mesh = new THREE.InstancedMesh(boxGeo, material, instances.length);
            mesh.castShadow = true; mesh.receiveShadow = true;
            return mesh;
        };

        const meshTeal = createInstancedMesh(tealInstances, matTeal);
        const meshWhite = createInstancedMesh(whiteInstances, matWhite);
        if (meshTeal) scene.add(meshTeal);
        if (meshWhite) scene.add(meshWhite);

        // Background Circle
        const circleGeo = new THREE.CircleGeometry(33, 64);
        const circleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const blackCircle = new THREE.Mesh(circleGeo, circleMat);
        blackCircle.position.set(0, 0, -2);
        scene.add(blackCircle);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const spotLight = new THREE.SpotLight(0xffffff, 2500);
        spotLight.position.set(50, 100, 50); spotLight.angle = Math.PI / 5; spotLight.castShadow = true;
        // Optimization: Reduce shadow map size
        spotLight.shadow.mapSize.width = 1024; spotLight.shadow.mapSize.height = 1024;
        scene.add(spotLight);
        const rimLight = new THREE.PointLight(CONFIG.colors.teal, 1000, 100);
        rimLight.position.set(-40, 40, -40); scene.add(rimLight);
        const fillLight = new THREE.PointLight(0xffaa00, 400, 100);
        fillLight.position.set(40, -20, 40); scene.add(fillLight);

        // Raycaster logic
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let startPos = { x: 0, y: 0 };

        const onPointerDown = (e: PointerEvent) => { startPos = { x: e.clientX, y: e.clientY }; };
        const onPointerUp = (e: PointerEvent) => {
            if (Math.sqrt(Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2)) < 5) {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                // Simple intersection check with bounding volumes is enough for redirect
                if (raycaster.intersectObject(blackCircle).length > 0 || 
                   (meshTeal && raycaster.intersectObject(meshTeal).length > 0) ||
                   (meshWhite && raycaster.intersectObject(meshWhite).length > 0)) {
                    window.open('https://gaffer-studio.ru', '_blank');
                }
            }
        };
        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('pointerup', onPointerUp);

        // Animation
        const clock = new THREE.Clock();
        const dummy = new THREE.Object3D();

        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            if (meshTeal) {
                tealInstances.forEach((data, i) => {
                    const offset = Math.sin(time * 2 + data.phase) * 0.5;
                    const scale = 1 + Math.sin(time * 3 + data.phase) * 0.15;
                    dummy.position.set(data.x, data.y, data.z + offset);
                    dummy.scale.setScalar(scale);
                    dummy.updateMatrix();
                    meshTeal.setMatrixAt(i, dummy.matrix);
                });
                meshTeal.instanceMatrix.needsUpdate = true;
            }

            if (meshWhite) {
                whiteInstances.forEach((data, i) => {
                    const offset = Math.sin(time * 2 + data.phase) * 0.5;
                    const scale = 1 + Math.sin(time * 3 + data.phase) * 0.15;
                    dummy.position.set(data.x, data.y, data.z + offset);
                    dummy.scale.setScalar(scale);
                    dummy.updateMatrix();
                    meshWhite.setMatrixAt(i, dummy.matrix);
                });
                meshWhite.instanceMatrix.needsUpdate = true;
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement) {
                renderer.domElement.removeEventListener('pointerdown', onPointerDown);
                renderer.domElement.removeEventListener('pointerup', onPointerUp);
            }
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            renderer.dispose();
            scene.clear();
        };
    }, []);

    return <div ref={containerRef} className="absolute inset-0 z-0 bg-[#1a1a1a]" />;
};

export default GafferScene;
