
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Drone { mesh: THREE.Object3D; velocity: THREE.Vector3; isActive: boolean; respawnTimer: number; }
interface Particle { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number; }

class CyberAudioEngine {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    reverbNode: ConvolverNode | null = null;
    trainGain: GainNode | null = null;
    isPlaying: boolean = false;
    nextNoteTime: number = 0;
    schedulerTimer: number | null = null;
    tempo: number = 100;
    lookahead: number = 25.0;
    scheduleAheadTime: number = 0.1;
    currentNote: number = 0;
    scale: number[] = [65.41, 77.78, 87.31, 98.00, 116.54, 130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13, 349.23, 392.00, 466.16];

    async init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);
        this.reverbNode = this.ctx.createConvolver();
        const rate = this.ctx.sampleRate;
        const len = rate * 3;
        const buff = this.ctx.createBuffer(2, len, rate);
        for(let i=0;i<len;i++) {
            const dec = Math.pow(1-i/len, 2);
            buff.getChannelData(0)[i] = (Math.random()*2-1)*dec;
            buff.getChannelData(1)[i] = (Math.random()*2-1)*dec;
        }
        this.reverbNode.buffer = buff;
        this.reverbNode.connect(this.masterGain);
    }
    start() { if(!this.ctx) this.init(); if(this.ctx?.state==='suspended') this.ctx.resume(); this.isPlaying=true; this.startDrone(); this.startTrainRumble(); if(this.ctx) this.nextNoteTime=this.ctx.currentTime; this.scheduler(); }
    stop() { this.isPlaying=false; if(this.ctx) this.ctx.suspend(); if(this.schedulerTimer) clearTimeout(this.schedulerTimer); }
    setTrainVolume(v: number) { if(this.trainGain && this.ctx) this.trainGain.gain.setTargetAtTime(v*3, this.ctx.currentTime, 0.1); }
    startTrainRumble() {
        if(!this.ctx || !this.masterGain) return;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate*2, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        let l=0; for(let i=0;i<d.length;i++) { d[i]=(l+(Math.random()*2-1)*0.02)/1.02; l=d[i]; d[i]*=3.5; }
        const s = this.ctx.createBufferSource(); s.buffer=b; s.loop=true;
        const f = this.ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=120;
        this.trainGain = this.ctx.createGain(); this.trainGain.gain.value=0;
        s.connect(f); f.connect(this.trainGain); this.trainGain.connect(this.masterGain); s.start();
    }
    startDrone() { /* Simplified */ }
    scheduler() { if(!this.isPlaying) return; while(this.nextNoteTime < (this.ctx?.currentTime||0)+0.1) { this.nextNote(); } this.schedulerTimer=window.setTimeout(()=>this.scheduler(), 25); }
    nextNote() { this.nextNoteTime += 60/100*0.25; this.currentNote++; if(this.currentNote===16) this.currentNote=0; }
    triggerExplosion() {
        if(!this.ctx || !this.masterGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator(); osc.frequency.setValueAtTime(100, t); osc.frequency.exponentialRampToValueAtTime(0.01, t+0.5);
        const g = this.ctx.createGain(); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.5);
        osc.connect(g); g.connect(this.masterGain); osc.start(t); osc.stop(t+0.5);
    }
}

const VOXEL_SIZE = 1;
const PALETTE = {
    sky: 0x050510, white: 0xCCCCCC, grey: 0x444444, darkGrey: 0x222222,
    teal: 0x00F3FF, orange: 0xFF5722, glass: 0x001133, grass: 0x111111,
    mountain: 0x1A1A1A, snow: 0xFF0099, red: 0xFF003C, yellow: 0xF7E600,
    black: 0x000000, water: 0x0044FF
};
const NEON_COLORS = [PALETTE.teal, PALETTE.orange, PALETTE.snow, PALETTE.red, PALETTE.yellow, PALETTE.water];

function getTrackOffset(x: number) { return x < 50 ? 0 : ((x-50)**2)/300; }
function getTrackAngle(x: number) { return x < 50 ? 0 : Math.atan2(x-50, 150); }
function addVoxel(data: any, x: number, y: number, z: number, c: number) {
    if(!data[c]) data[c]=[]; data[c].push(Math.round(x), Math.round(y), Math.round(z));
}

function generateTrack(data: any, y: number, len: number) {
    for(let x=-len/2; x<len/2; x++) {
        const z = getTrackOffset(x);
        addVoxel(data, x, y, z-3, PALETTE.white); addVoxel(data, x, y, z+3, PALETTE.white);
        if(x%2===0) for(let i=-2; i<3; i++) addVoxel(data, x, y-1, z+i, PALETTE.black);
        if(x%4===0) addVoxel(data, x, y-1, z, PALETTE.teal);
    }
}

function generateSupport(data: any, x: number, trackY: number, groundY: number) {
    const color = PALETTE.darkGrey;
    const zTrackOffset = getTrackOffset(x);
    for (let y = groundY; y <= trackY; y++) {
        addVoxel(data, x, y, zTrackOffset - 6, color);
        addVoxel(data, x, y, zTrackOffset + 6, color);
    }
    for (let z = -6; z <= 6; z++) {
        addVoxel(data, x, trackY, zTrackOffset + z, color);
    }
}

function generateTopTrain(data: any) {
    const length = 30;
    const startX = -length / 2;
    for (let x = 0; x < length; x++) {
        const localX = startX + x;
        let width = 3; let height = 3;
        if (x < 5) { width = 1; height = 1; }
        else if (x < 8) { width = 2; height = 2; }
        else if (x > length - 5) { width = 2; height = 2; }

        for (let y = 0; y < height; y++) {
            for (let z = -width + 1; z < width; z++) {
                let color = PALETTE.white;
                if (y === 1 && Math.abs(z) === width - 1 && x > 8 && x < length - 5) color = PALETTE.glass;
                if (y === 0) color = PALETTE.black;
                addVoxel(data, localX, 1 + y, z, color);
            }
        }
        if (x > length - 6 && x < length - 1) addVoxel(data, localX, height + 1, 0, PALETTE.teal); 
    }
}

function generateGunship(data: any) {
    const length = 18; const startX = -length / 2;
    for (let x = 0; x < length; x++) {
        const localX = startX + x;
        for (let y = 0; y < 3; y++) for (let z = -1; z < 2; z++) {
            let color = PALETTE.darkGrey;
            if (x === 2 || x === length - 3) color = PALETTE.red;
            addVoxel(data, localX, y, z, color);
        }
    }
}

function generateDrone(data: any) {
    addVoxel(data, 0, 0, 0, PALETTE.black); addVoxel(data, 0, 0, 0, PALETTE.red); 
    addVoxel(data, 1, 1, 1, PALETTE.teal); addVoxel(data, -1, 1, -1, PALETTE.teal);
}

function generatePod(data: any) {
    const w = 3; const h = 5; const l = 8;
    for (let x = 0; x < l; x++) for (let y = 0; y < h; y++) for (let z = -w + 1; z < w; z++) {
        addVoxel(data, x - l/2, y - 8, z, y===1 ? PALETTE.orange : PALETTE.white);
    }
}

function generateBuilding(data: any, xPos: number, zPos: number, height: number) {
    for (let y = -5; y < height; y++) for (let x = 0; x < 6; x++) for (let z = 0; z < 6; z++) {
        if (x > 0 && x < 5 && z > 0 && z < 5 && y < height - 1) continue;
        let col = PALETTE.mountain;
        if (y > 0 && y % 3 !== 0 && (x + z) % 3 === 0) col = PALETTE.teal;
        addVoxel(data, xPos + x, y, zPos + z, col);
    }
}

function generateLandscape(data: any) {
    // Floor Grid
    for (let x = -300; x < 300; x += 2) {
        for (let z = -200; z < 200; z += 2) {
            let col = PALETTE.grass;
            if (Math.abs(x) % 24 < 2 || Math.abs(z) % 24 < 2) col = PALETTE.darkGrey;
            if (Math.random() > 0.999) col = PALETTE.teal;
            addVoxel(data, x, -6, z, col);
        }
    }
    
    // Dense City Generation - One Side Only
    const blockSize = 14;
    for (let x = -280; x < 280; x += blockSize) {
        // Calculate where the track is at this X
        const trackZ = getTrackOffset(x);
        
        for (let z = -180; z < 180; z += blockSize) {
            // Only generate buildings on the "background" side (negative Z relative to track)
            // This leaves the foreground open for better viewing
            if (z > trackZ - 20) continue;

            // Density check: Reduced from 60% to 20% (approx 3x less density)
            if(Math.random() > 0.8) {
                let height = 15 + Math.random() * 50;
                // Make background buildings taller for cinematic effect
                if (Math.abs(z) > 60 && Math.random() > 0.5) height += 40;
                
                generateBuilding(data, x, z, height);
            }
        }
    }
}

function createVoxelGroup(data: any) {
    const group = new THREE.Group();
    const box = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
    Object.keys(data).forEach(key => {
        const c = parseInt(key);
        const pos = data[c];
        const count = pos.length/3;
        const isNeon = NEON_COLORS.includes(c);
        const mat = new THREE.MeshStandardMaterial({
            color: c, roughness: isNeon?0.2:0.8, metalness: isNeon?0.1:0.2,
            emissive: isNeon?c:0, emissiveIntensity: isNeon?2:0
        });
        const mesh = new THREE.InstancedMesh(box, mat, count);
        mesh.castShadow = !isNeon; mesh.receiveShadow = true;
        const dummy = new THREE.Object3D();
        for(let i=0; i<count; i++) {
            dummy.position.set(pos[i*3], pos[i*3+1], pos[i*3+2]);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        group.add(mesh);
    });
    return group;
}

const MetropolisScene = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [cameraMode, setCameraMode] = useState<'ORBIT'|'CHASE'>('ORBIT');
    
    const isPausedRef = useRef(false);
    const cameraModeRef = useRef('ORBIT');
    const audioRef = useRef<CyberAudioEngine | null>(null);
    
    const trainRef = useRef<THREE.Group | null>(null);
    const gunshipRef = useRef<THREE.Group | null>(null);
    const dronesRef = useRef<Drone[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const podsRef = useRef<THREE.Group | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);

    useEffect(() => { audioRef.current = new CyberAudioEngine(); return () => audioRef.current?.stop(); }, []);

    const togglePause = () => { setIsPaused(!isPaused); isPausedRef.current = !isPaused; };
    const toggleCamera = () => { 
        const m = cameraMode==='ORBIT'?'CHASE':'ORBIT'; setCameraMode(m); cameraModeRef.current=m;
    };

    useEffect(() => {
        if (!mountRef.current) return;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(PALETTE.sky);
        // Optimization: Reduce fog distance for mobile
        scene.fog = new THREE.Fog(PALETTE.sky, 100, 900);

        // Optimization: Reduce far plane
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
        camera.position.set(-80, 60, 120);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Optimization: Strict pixel ratio cap
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 20, 0);
        controls.enableDamping = true;
        controls.enablePan = true;
        controls.maxPolarAngle = Math.PI;
        controlsRef.current = controls;

        const sun = new THREE.DirectionalLight(0xaaccff, 0.8);
        sun.position.set(100, 150, 50);
        sun.castShadow = true;
        // Optimization: Reduce shadow map size to 512 for mobile
        sun.shadow.mapSize.width = 512; sun.shadow.mapSize.height = 512;
        scene.add(sun);
        scene.add(new THREE.HemisphereLight(0x6666ff, 0x111122, 0.6));

        // World Generation
        const staticData = {};
        // Optimization: Reduce track length from 500 to 300
        generateTrack(staticData, 40, 300);
        generateLandscape(staticData);
        [-60, 0, 60].forEach(x => generateSupport(staticData, x, 40, -10));
        scene.add(createVoxelGroup(staticData));

        const trainData = {}; generateTopTrain(trainData);
        const trainGroup = createVoxelGroup(trainData);
        scene.add(trainGroup);
        trainRef.current = trainGroup;

        const gunshipData = {}; generateGunship(gunshipData);
        const gunshipGroup = createVoxelGroup(gunshipData);
        scene.add(gunshipGroup);
        gunshipRef.current = gunshipGroup;

        const podsData = {}; generatePod(podsData);
        const podsGroup = createVoxelGroup(podsData);
        scene.add(podsGroup);
        podsRef.current = podsGroup;

        // Drones
        const droneData = {}; generateDrone(droneData);
        const droneTemplate = createVoxelGroup(droneData);
        // Optimization: Reduce drone count from 5 to 3
        for(let i=0; i<3; i++) {
            const d = droneTemplate.clone();
            scene.add(d);
            dronesRef.current.push({ mesh: d, velocity: new THREE.Vector3(), isActive: false, respawnTimer: Math.random()*100 });
        }

        // Particles
        const partGeo = new THREE.BoxGeometry(0.5,0.5,0.5);
        const partMat = new THREE.MeshBasicMaterial({color: PALETTE.red});

        setIsLoading(false);

        let animId: number;
        let trainX = 0;
        let podX = 40;

        const animate = () => {
            animId = requestAnimationFrame(animate);
            if(!isPausedRef.current) {
                // Match optimized track boundaries -150 to 150 (300 total length)
                trainX += 2.0; if(trainX > 150) trainX = -150;
                podX += 0.2; if(podX > 150) podX = -150;

                if(trainRef.current) {
                    trainRef.current.position.set(trainX, 40, getTrackOffset(trainX));
                    trainRef.current.rotation.y = -getTrackAngle(trainX);
                }
                if(gunshipRef.current) {
                    const gx = trainX - 28;
                    const finalGx = gx < -150 ? gx + 300 : gx;
                    gunshipRef.current.position.set(finalGx, 41, getTrackOffset(finalGx));
                    gunshipRef.current.rotation.y = -getTrackAngle(finalGx);
                }
                if(podsRef.current) {
                    podsRef.current.position.set(podX, 40, getTrackOffset(podX));
                    podsRef.current.rotation.y = -getTrackAngle(podX);
                }

                // Drones & Particles
                dronesRef.current.forEach(d => {
                    if(!d.isActive) {
                        d.respawnTimer--;
                        d.mesh.visible = false;
                        if(d.respawnTimer<=0) {
                            d.isActive=true; d.mesh.visible=true;
                            d.mesh.position.set((Math.random()-0.5)*200, 0, (Math.random()-0.5)*80);
                            d.velocity.set((Math.random()-0.5)*0.2, Math.random()*0.1, (Math.random()-0.5)*0.2);
                        }
                    } else {
                        d.mesh.position.add(d.velocity);
                        if(d.mesh.position.y > 60 || Math.random()>0.995) {
                            d.isActive=false; d.respawnTimer=50;
                            // Boom
                            if(audioRef.current) audioRef.current.triggerExplosion();
                            for(let k=0;k<3;k++) { // Reduced particles
                                const p = new THREE.Mesh(partGeo, partMat);
                                p.position.copy(d.mesh.position);
                                scene.add(p);
                                particlesRef.current.push({mesh: p, velocity: new THREE.Vector3((Math.random()-0.5), Math.random(), (Math.random()-0.5)), life: 40});
                            }
                        }
                    }
                });

                for(let i=particlesRef.current.length-1; i>=0; i--) {
                    const p = particlesRef.current[i];
                    p.life--;
                    p.mesh.position.add(p.velocity);
                    if(p.life<=0) { scene.remove(p.mesh); particlesRef.current.splice(i,1); }
                }
            }

            if(cameraModeRef.current === 'CHASE' && trainRef.current) {
                if(controlsRef.current) controlsRef.current.enabled = false;
                const p = trainRef.current.position;
                const rot = trainRef.current.rotation.y;
                const offZ = Math.sin(rot) * 40; const offX = Math.cos(rot) * 40;
                camera.position.lerp(new THREE.Vector3(p.x - offX, p.y+15, p.z + 25 + offZ), 0.1);
                camera.lookAt(p.x + Math.cos(rot)*100, p.y, p.z - Math.sin(rot)*100);
            } else {
                if(controlsRef.current) { controlsRef.current.enabled=true; controlsRef.current.update(); }
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if(!mountRef.current) return;
            camera.aspect = window.innerWidth/window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            if(mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
            scene.clear();
        };
    }, []);

    return (
        <div className="w-full h-full relative bg-black overflow-hidden">
            <div ref={mountRef} className="w-full h-full block" />
            <div className="absolute top-6 left-6 pointer-events-none select-none">
                <h1 className="text-4xl font-bold text-white drop-shadow tracking-tighter">NEO-VOXEL 2045</h1>
            </div>
            <div className="absolute bottom-6 right-6 pointer-events-auto z-40 flex gap-4">
                <button onClick={toggleCamera} className="px-6 py-2 border font-mono text-sm bg-black/50 border-white/20 text-white">[ CAM: {cameraMode} ]</button>
                <button onClick={togglePause} className="px-6 py-2 border font-mono text-sm bg-black/50 border-white/20 text-white">[ PAUSE: {isPaused?'ON':'OFF'} ]</button>
            </div>
        </div>
    );
};

export default MetropolisScene;
