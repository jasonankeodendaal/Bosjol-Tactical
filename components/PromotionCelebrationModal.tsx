import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import type { Tier, Rank, Badge } from '../types';
import { Volume2, RotateCcw, Share2, X } from 'lucide-react';

export interface PromotionCelebrationData {
    newTier?: Tier;
    oldTier?: Tier;
    newBadges?: Badge[];
    xpGained?: number;
    currentXp?: number;
    bonusXp?: number;
    rewards?: string[];
    finalXp?: number;
}

interface PromotionCelebrationModalProps {
    promotion: PromotionCelebrationData;
    onDismiss: () => void;
    ranks?: Rank[];
}

export const PromotionCelebrationModal: React.FC<PromotionCelebrationModalProps> = ({
    promotion,
    onDismiss,
    ranks = []
}) => {
    const { 
        oldTier, 
        newTier, 
        newBadges = [], 
        xpGained = 55, 
        bonusXp = 0, 
        rewards = [], 
        finalXp = 2134 
    } = promotion;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [audioMuted, setAudioMuted] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Derive tier names
    const mainTierName = newTier?.name || 'ÉLITE I';

    const allTiers = useMemo(() => {
        return ranks
            .flatMap(rank => rank.tiers || [])
            .filter(Boolean)
            .sort((a, b) => a.minXp - b.minXp);
    }, [ranks]);

    const currentTierIndex = useMemo(() => {
        if (!newTier || !allTiers.length) return 2;
        const idx = allTiers.findIndex(t => t.id === newTier.id);
        return idx !== -1 ? idx : 2;
    }, [allTiers, newTier]);

    const prevTierName = useMemo(() => {
        if (oldTier?.name) return oldTier.name;
        if (currentTierIndex > 0 && allTiers[currentTierIndex - 1]) return allTiers[currentTierIndex - 1].name;
        return 'VETERANO V';
    }, [oldTier, currentTierIndex, allTiers]);

    const nextTierName = useMemo(() => {
        if (currentTierIndex < allTiers.length - 1 && allTiers[currentTierIndex + 1]) return allTiers[currentTierIndex + 1].name;
        return 'ÉLITE II';
    }, [currentTierIndex, allTiers]);

    const targetXp = useMemo(() => {
        if (currentTierIndex < allTiers.length - 1 && allTiers[currentTierIndex + 1]) {
            return allTiers[currentTierIndex + 1].minXp;
        }
        return 2200;
    }, [currentTierIndex, allTiers]);

    // Audio SFX synthesis on mount
    const playFanfare = () => {
        if (audioMuted) return;
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            
            // Sub bass impact
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(170, now);
            subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.4);
            subGain.gain.setValueAtTime(0.8, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
            subOsc.connect(subGain);
            subGain.connect(ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 1.4);

            // Triumph Brass Arpeggio
            const frequencies = [329.63, 440, 554.37, 659.25, 880, 1108.73, 1318.51];
            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const noteTime = now + (idx * 0.07);

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.85);
            });
        } catch {
            // Audio context restrictions
        }
    };

    useEffect(() => {
        playFanfare();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Helper: Create 3D Hexagon Extruded Geometry
    const createHexagonGeometry = (radius: number, depth: number, bevel: number) => {
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();

        const extrudeSettings = {
            depth,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        };

        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    };

    // Helper: Create Canvas 2D Textures for 3D Text Panels
    const createTextTexture = (text: string, options: {
        fontSize?: number;
        color?: string;
        bgColor?: string;
        borderColor?: string;
        glowColor?: string;
        width?: number;
        height?: number;
        fontWeight?: string;
    } = {}) => {
        const canvas = document.createElement('canvas');
        const w = options.width || 512;
        const h = options.height || 128;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(canvas);

        ctx.clearRect(0, 0, w, h);

        if (options.bgColor) {
            ctx.fillStyle = options.bgColor;
            ctx.beginPath();
            ctx.roundRect(10, 10, w - 20, h - 20, 16);
            ctx.fill();
        }

        if (options.borderColor) {
            ctx.strokeStyle = options.borderColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(10, 10, w - 20, h - 20, 16);
            ctx.stroke();
        }

        ctx.font = `${options.fontWeight || '900'} ${options.fontSize || 48}px "Plus Jakarta Sans", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (options.glowColor) {
            ctx.shadowColor = options.glowColor;
            ctx.shadowBlur = 18;
        }

        ctx.fillStyle = options.color || '#ffffff';
        ctx.fillText(text, w / 2, h / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    };

    // WebGL Three.js CGI 3D Rendering Engine
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // 1. Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050508, 0.035);

        // 2. Camera setup
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 11);

        // 3. WebGL Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        // 4. CGI 3D Lighting Rig
        const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.9);
        scene.add(ambientLight);

        // Key Gold Spotlight
        const goldPointLight = new THREE.PointLight(0xf59e0b, 8, 25);
        goldPointLight.position.set(0, 1, 6);
        scene.add(goldPointLight);

        // Top Rim Directional Light
        const rimLight = new THREE.DirectionalLight(0xffedd5, 3.5);
        rimLight.position.set(-5, 8, 5);
        scene.add(rimLight);

        // Bottom Metallic Fill Light
        const blueRim = new THREE.DirectionalLight(0x38bdf8, 2.0);
        blueRim.position.set(5, -6, -3);
        scene.add(blueRim);

        // Red Accent Light
        const redLight = new THREE.PointLight(0xef4444, 4, 15);
        redLight.position.set(0, -3, 3);
        scene.add(redLight);

        // 5. CGI Materials
        const goldMetallicMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            metalness: 0.95,
            roughness: 0.22,
            emissive: 0xd97706,
            emissiveIntensity: 0.15
        });

        const darkCoreMat = new THREE.MeshStandardMaterial({
            color: 0x09090b,
            metalness: 0.8,
            roughness: 0.4
        });

        const shinyBlueShieldMat = new THREE.MeshStandardMaterial({
            color: 0x1d4ed8,
            metalness: 0.9,
            roughness: 0.15,
            emissive: 0x1e40af,
            emissiveIntensity: 0.25
        });

        const silverChevronMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            metalness: 0.98,
            roughness: 0.1
        });

        // 6. MAIN 3D CAROUSEL GROUP
        const carouselGroup = new THREE.Group();
        scene.add(carouselGroup);

        // --- CENTER 3D HERO MEDALLION ---
        const centerGroup = new THREE.Group();

        // Center Outer Hexagon Frame
        const centerHexGeo = createHexagonGeometry(1.6, 0.35, 0.08);
        centerHexGeo.center();
        const centerHexMesh = new THREE.Mesh(centerHexGeo, goldMetallicMat);
        centerGroup.add(centerHexMesh);

        // Center Inner Inset Hexagon
        const innerHexGeo = createHexagonGeometry(1.35, 0.2, 0.04);
        innerHexGeo.center();
        const innerHexMesh = new THREE.Mesh(innerHexGeo, darkCoreMat);
        innerHexMesh.position.z = 0.12;
        centerGroup.add(innerHexMesh);

        // 3D Metallic Shield / Emblem in Center
        const shieldShape = new THREE.Shape();
        shieldShape.moveTo(0, 0.7);
        shieldShape.lineTo(0.6, 0.4);
        shieldShape.lineTo(0.5, -0.4);
        shieldShape.lineTo(0, -0.8);
        shieldShape.lineTo(-0.5, -0.4);
        shieldShape.lineTo(-0.6, 0.4);
        shieldShape.closePath();

        const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.03,
            bevelSegments: 3
        });
        shieldGeo.center();
        const shieldMesh = new THREE.Mesh(shieldGeo, shinyBlueShieldMat);
        shieldMesh.position.z = 0.25;
        centerGroup.add(shieldMesh);

        // 3D Chevrons on Shield
        for (let i = 0; i < 3; i++) {
            const chevShape = new THREE.Shape();
            chevShape.moveTo(0, 0.2);
            chevShape.lineTo(0.28, -0.05);
            chevShape.lineTo(0.28, -0.15);
            chevShape.lineTo(0, 0.1);
            chevShape.lineTo(-0.28, -0.15);
            chevShape.lineTo(-0.28, -0.05);
            chevShape.closePath();

            const chevGeo = new THREE.ExtrudeGeometry(chevShape, {
                depth: 0.08,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.02
            });
            chevGeo.center();
            const chevMesh = new THREE.Mesh(chevGeo, silverChevronMat);
            chevMesh.position.set(0, 0.25 - i * 0.2, 0.38);
            centerGroup.add(chevMesh);
        }

        // Top Triangle HUD Bracket
        const triShape = new THREE.Shape();
        triShape.moveTo(0, 0.25);
        triShape.lineTo(0.2, -0.15);
        triShape.lineTo(-0.2, -0.15);
        triShape.closePath();
        const triGeo = new THREE.ExtrudeGeometry(triShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02 });
        triGeo.center();
        const triMesh = new THREE.Mesh(triGeo, goldMetallicMat);
        triMesh.position.set(0, 1.95, 0.1);
        centerGroup.add(triMesh);

        carouselGroup.add(centerGroup);

        // --- LEFT 3D PREVIOUS RANK MEDALLION ---
        const leftGroup = new THREE.Group();
        leftGroup.position.set(-3.8, 0.1, -0.8);
        leftGroup.scale.set(0.72, 0.72, 0.72);

        const leftHexGeo = createHexagonGeometry(1.4, 0.25, 0.05);
        leftHexGeo.center();
        const leftHexMesh = new THREE.Mesh(leftHexGeo, goldMetallicMat);
        leftGroup.add(leftHexMesh);

        const leftInnerMesh = new THREE.Mesh(innerHexGeo, darkCoreMat);
        leftInnerMesh.position.z = 0.1;
        leftGroup.add(leftInnerMesh);

        const leftShieldMesh = new THREE.Mesh(shieldGeo, shinyBlueShieldMat);
        leftShieldMesh.position.z = 0.2;
        leftShieldMesh.scale.set(0.7, 0.7, 0.7);
        leftGroup.add(leftShieldMesh);

        carouselGroup.add(leftGroup);

        // --- RIGHT 3D NEXT RANK MEDALLION ---
        const rightGroup = new THREE.Group();
        rightGroup.position.set(3.8, 0.1, -0.8);
        rightGroup.scale.set(0.72, 0.72, 0.72);

        const rightHexMesh = new THREE.Mesh(leftHexGeo, goldMetallicMat);
        rightGroup.add(rightHexMesh);

        const rightInnerMesh = new THREE.Mesh(innerHexGeo, darkCoreMat);
        rightInnerMesh.position.z = 0.1;
        rightGroup.add(rightInnerMesh);

        const rightShieldMesh = new THREE.Mesh(shieldGeo, shinyBlueShieldMat);
        rightShieldMesh.position.z = 0.2;
        rightShieldMesh.scale.set(0.7, 0.7, 0.7);
        rightGroup.add(rightShieldMesh);

        // 3D Lock Box Mesh
        const lockGeo = new THREE.BoxGeometry(0.35, 0.35, 0.15);
        const lockMesh = new THREE.Mesh(lockGeo, goldMetallicMat);
        lockMesh.position.set(0.7, 0.7, 0.3);
        rightGroup.add(lockMesh);

        carouselGroup.add(rightGroup);

        // --- 3D CURVED LIGHT ARCS & RINGS (TOP & BOTTOM BORDER BEAMS) ---
        const topArcGeo = new THREE.TorusGeometry(4.8, 0.035, 16, 100, Math.PI * 0.8);
        const arcMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const topArcMesh = new THREE.Mesh(topArcGeo, arcMat);
        topArcMesh.rotation.x = Math.PI / 2.2;
        topArcMesh.rotation.z = Math.PI * 0.1;
        topArcMesh.position.set(0, 2.5, -0.5);
        scene.add(topArcMesh);

        const bottomArcMesh = new THREE.Mesh(topArcGeo, arcMat);
        bottomArcMesh.rotation.x = -Math.PI / 2.2;
        bottomArcMesh.rotation.z = -Math.PI * 0.9;
        bottomArcMesh.position.set(0, -2.5, -0.5);
        scene.add(bottomArcMesh);

        // 3D Orbiting Center Rings
        const orbitRingGeo = new THREE.TorusGeometry(2.1, 0.018, 12, 80);
        const orbitRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
        const orbitRingMesh = new THREE.Mesh(orbitRingGeo, orbitRingMat);
        orbitRingMesh.position.z = 0.05;
        centerGroup.add(orbitRingMesh);

        // --- 3D HORIZONTAL LENS FLARE BEAM ---
        const flareGeo = new THREE.CylinderGeometry(0.04, 0.04, 14, 16);
        const flareMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.85
        });
        const flareMesh = new THREE.Mesh(flareGeo, flareMat);
        flareMesh.rotation.z = Math.PI / 2;
        flareMesh.position.set(0, 0, -0.2);
        carouselGroup.add(flareMesh);

        // --- 3D CGI TEXT PANELS (3D LABELS) ---
        // 1. Center Tier Title Text Panel
        const titleTex = createTextTexture(mainTierName, {
            fontSize: 64,
            color: '#ffffff',
            glowColor: '#facc15',
            width: 512,
            height: 128
        });
        const titlePlaneGeo = new THREE.PlaneGeometry(3.6, 0.9);
        const titlePlaneMat = new THREE.MeshBasicMaterial({ map: titleTex, transparent: true });
        const titlePlaneMesh = new THREE.Mesh(titlePlaneGeo, titlePlaneMat);
        titlePlaneMesh.position.set(0, -1.95, 0.2);
        scene.add(titlePlaneMesh);

        // 2. Left Tier Label Panel
        const leftTex = createTextTexture(prevTierName, {
            fontSize: 42,
            color: '#fde047',
            width: 256,
            height: 64
        });
        const leftPlaneGeo = new THREE.PlaneGeometry(1.8, 0.45);
        const leftPlaneMat = new THREE.MeshBasicMaterial({ map: leftTex, transparent: true, opacity: 0.9 });
        const leftPlaneMesh = new THREE.Mesh(leftPlaneGeo, leftPlaneMat);
        leftPlaneMesh.position.set(-3.8, -1.2, -0.5);
        scene.add(leftPlaneMesh);

        // 3. Right Tier Label Panel
        const rightTex = createTextTexture(nextTierName, {
            fontSize: 42,
            color: '#fde047',
            width: 256,
            height: 64
        });
        const rightPlaneMesh = new THREE.Mesh(leftPlaneGeo, new THREE.MeshBasicMaterial({ map: rightTex, transparent: true, opacity: 0.9 }));
        rightPlaneMesh.position.set(3.8, -1.2, -0.5);
        scene.add(rightPlaneMesh);

        // 4. Gain Stats Panel ("Rango obtenido +55" & "NUEVO RANGO")
        const statsTex = createTextTexture(`Rango obtenido +${xpGained}   [ NUEVO RANGO ]`, {
            fontSize: 36,
            color: '#34d399',
            glowColor: '#10b981',
            width: 768,
            height: 96
        });
        const statsPlaneGeo = new THREE.PlaneGeometry(4.8, 0.6);
        const statsPlaneMat = new THREE.MeshBasicMaterial({ map: statsTex, transparent: true });
        const statsPlaneMesh = new THREE.Mesh(statsPlaneGeo, statsPlaneMat);
        statsPlaneMesh.position.set(0, -2.55, 0.2);
        scene.add(statsPlaneMesh);

        // 5. 3D Progress Bar Panel
        const pbCanvas = document.createElement('canvas');
        pbCanvas.width = 512;
        pbCanvas.height = 64;
        const pbCtx = pbCanvas.getContext('2d');
        if (pbCtx) {
            pbCtx.fillStyle = 'rgba(24, 24, 27, 0.9)';
            pbCtx.beginPath();
            pbCtx.roundRect(10, 16, 492, 32, 16);
            pbCtx.fill();
            pbCtx.strokeStyle = '#f59e0b';
            pbCtx.lineWidth = 2;
            pbCtx.stroke();

            const pct = Math.min(1, Math.max(0.2, finalXp / targetXp));
            const grad = pbCtx.createLinearGradient(12, 0, 480 * pct, 0);
            grad.addColorStop(0, '#d97706');
            grad.addColorStop(0.5, '#facc15');
            grad.addColorStop(1, '#fef08a');

            pbCtx.fillStyle = grad;
            pbCtx.beginPath();
            pbCtx.roundRect(12, 18, (488) * pct, 28, 14);
            pbCtx.fill();

            pbCtx.font = '700 22px monospace';
            pbCtx.fillStyle = '#ffffff';
            pbCtx.textAlign = 'center';
            pbCtx.fillText(`${finalXp} / ${targetXp} RP`, 256, 38);
        }
        const pbTex = new THREE.CanvasTexture(pbCanvas);
        const pbPlaneGeo = new THREE.PlaneGeometry(3.6, 0.45);
        const pbPlaneMat = new THREE.MeshBasicMaterial({ map: pbTex, transparent: true });
        const pbPlaneMesh = new THREE.Mesh(pbPlaneGeo, pbPlaneMat);
        pbPlaneMesh.position.set(0, -3.1, 0.2);
        scene.add(pbPlaneMesh);

        // --- 3D PARTICLE SYSTEM ENGINE ---
        const particleCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const pPositions = new Float32Array(particleCount * 3);
        const pVelocities: { x: number; y: number; z: number }[] = [];

        for (let i = 0; i < particleCount; i++) {
            pPositions[i * 3] = (Math.random() - 0.5) * 16;
            pPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;

            pVelocities.push({
                x: (Math.random() - 0.5) * 0.008,
                y: Math.random() * 0.018 + 0.005,
                z: (Math.random() - 0.5) * 0.008
            });
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

        const pMat = new THREE.PointsMaterial({
            color: 0xfacc15,
            size: 0.06,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const particleSystem = new THREE.Points(pGeo, pMat);
        scene.add(particleSystem);

        // 7. ANIMATION RENDER LOOP
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Rotations & 3D dynamic motions
            centerGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.18;
            centerGroup.rotation.x = Math.cos(elapsedTime * 0.6) * 0.08;
            leftGroup.rotation.y = -0.2 + Math.sin(elapsedTime * 0.7) * 0.1;
            rightGroup.rotation.y = 0.2 + Math.cos(elapsedTime * 0.7) * 0.1;

            orbitRingMesh.rotation.z = elapsedTime * 0.6;
            flareMesh.rotation.y = elapsedTime * 0.5;

            // Update 3D particles
            const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
            const arr = posAttr.array as Float32Array;

            for (let i = 0; i < particleCount; i++) {
                arr[i * 3 + 1] += pVelocities[i].y;
                arr[i * 3] += pVelocities[i].x;
                arr[i * 3 + 2] += pVelocities[i].z;

                if (arr[i * 3 + 1] > 6) {
                    arr[i * 3 + 1] = -5;
                    arr[i * 3] = (Math.random() - 0.5) * 16;
                }
            }
            posAttr.needsUpdate = true;

            // Parallax camera rotation based on mouse coordinates
            camera.position.x += (mousePos.x * 0.8 - camera.position.x) * 0.05;
            camera.position.y += (-mousePos.y * 0.6 - camera.position.y) * 0.05;
            camera.lookAt(0, -0.2, 0);

            renderer.render(scene, camera);
        };

        animate();

        // Handle Resize
        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            pGeo.dispose();
            pMat.dispose();
            goldMetallicMat.dispose();
            darkCoreMat.dispose();
            shinyBlueShieldMat.dispose();
            silverChevronMat.dispose();
        };
    }, [mainTierName, prevTierName, nextTierName, xpGained, finalXp, targetXp, mousePos]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`🏆 I reached rank ${mainTierName} in Bosjol Airsoft! +${xpGained} RP Gained!`);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 3500);
        }
    };

    return (
        <div 
            id="promotion-celebration-viewport"
            className="fixed inset-0 z-[140] flex items-center justify-center bg-zinc-950/95 text-white overflow-hidden select-none cursor-pointer"
            onClick={onDismiss}
        >
            {/* AMBIENT RADIAL LIGHTING BACKDROP */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-90"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.08) 45%, rgba(9, 9, 11, 0.98) 80%, rgba(0, 0, 0, 1) 100%)'
                }}
            />

            {/* TOP UTILITY CONTROLS */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setAudioMuted(!audioMuted);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-amber-400 hover:bg-amber-500/20 transition-all shadow-md"
                    title={audioMuted ? "Unmute SFX" : "Mute SFX"}
                >
                    <Volume2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        playFanfare();
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-amber-400 hover:bg-amber-500/20 transition-all shadow-md flex items-center gap-1.5 text-xs font-mono font-bold"
                    title="Replay Fanfare SFX"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden xs:inline">REPLAY</span>
                </button>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-amber-400 transition-all shadow-md pointer-events-auto"
                title="Close"
            >
                <X className="w-5 h-5" />
            </button>

            {/* FULLSCREEN THREE.JS WEBGL CANVAS CONTAINER */}
            <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center my-auto pointer-events-auto"
            >
                <canvas ref={canvasRef} className="w-full h-full object-contain block" />

                {/* BOTTOM CLICK TO CONTINUE FLOATING PROMPT */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center"
                >
                    <p className="text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-widest font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        CLICK ANYWHERE TO CONTINUE
                    </p>
                </motion.div>
            </div>

            {/* BOTTOM LEFT SHARE ACTION BUTTON */}
            <div className="absolute bottom-4 left-4 z-50 pointer-events-auto">
                <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700 text-white hover:border-amber-400 hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2 text-xs font-mono font-bold"
                    title="Share Rank Promotion"
                >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">{shareCopied ? 'COPIED TO CLIPBOARD!' : 'SHARE'}</span>
                </button>
            </div>
        </div>
    );
};
