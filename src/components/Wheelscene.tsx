/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    ACESFilmicToneMapping,
    Clock,
    Color,
    DirectionalLight,
    Euler,
    ExtrudeGeometry,
    Group,
    MathUtils,
    Mesh,
    MeshPhysicalMaterial,
    PerspectiveCamera,
    Quaternion,
    Raycaster,
    Scene,
    Shape,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
    ClampToEdgeWrapping,
    LinearFilter,
    HemisphereLight,
} from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


// --- Type Definitions ---
type Item = {
    image: string;
    link?: string;
    openInNewTab?: boolean;
};

type LightProps = {
    enableLights: boolean;
    hemisphereLight: { skyColor: string; groundColor: string; intensity: number };
    keyLight: { color: string; intensity: number; positionX: number; positionY: number; positionZ: number };
    fillLight: { color: string; intensity: number; positionX: number; positionY: number; positionZ: number };
}

export type WheelSceneProps = {
    items: Item[];
    wheelRadius: number;
    cardWidth: number;
    cardHeight: number;
    extrusion: number;
    borderRadius: number;
    backgroundColor: string;
    imageFit: "cover" | "fit" | "fill";
    sceneTransform: { scale: number; positionX: number; positionY: number; positionZ: number; rotationX: number; rotationY: number; rotationZ: number; }
    cardTransform: { rotationX: number; rotationY: number; rotationZ: number; }
    interaction: { enableClick: boolean; enableScroll: boolean; dragSensitivity: number; flickSensitivity: number; clickSpeed: number; enableHover: boolean; hoverScale: number; hoverOffsetY: number; hoverSlideOut: number; }
    animation: { autoRotate: boolean; autoRotateDirection: "left" | "right"; autoRotateSpeed: number; bendingIntensity: number; bendingRange: number; bendingConstraint: "center" | "top" | "bottom" | "left" | "right"; }
    effects: { enableBloom: boolean; bloomStrength: number; bloomRadius: number; bloomThreshold: number; }
    lighting: LightProps;
};

/**
 * Parses a CSS color string to extract a THREE.Color and an alpha value.
 */
function parseColorAndAlpha(colorStr: string): { color: Color; alpha: number } {
    const color = new Color();
    let alpha = 1;

    if (!colorStr || colorStr === 'transparent') {
        return { color: new Color(0x000000), alpha: 0 };
    }
    
    try {
        const rgbaMatch = colorStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d\.]+))?\)$/);
        if (rgbaMatch) {
            color.setRGB(
                parseInt(rgbaMatch[1]) / 255,
                parseInt(rgbaMatch[2]) / 255,
                parseInt(rgbaMatch[3]) / 255
            );
            if (rgbaMatch[4] !== undefined) {
                alpha = parseFloat(rgbaMatch[4]);
            }
        } else {
            color.set(colorStr);
        }
    } catch (e) {
        console.error("Invalid color string:", colorStr, "Defaulting to transparent.");
        color.set(0x000000);
        alpha = 0;
    }

    return { color, alpha };
}

/**
 * Creates a rounded rectangle shape for Three.js.
 */
const createRoundedRectShape = (w: number, h: number, r: number) => {
    const shape = new Shape();
    const radius = Math.min(r, w / 2, h / 2);
    shape.moveTo(-w / 2 + radius, h / 2);
    shape.lineTo(w / 2 - radius, h / 2);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - radius);
    shape.lineTo(w / 2, -h / 2 + radius);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2 - radius, -h / 2);
    shape.lineTo(-w / 2 + radius, -h / 2);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + radius);
    shape.lineTo(-w / 2, h / 2 - radius);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2 + radius, h / 2);
    return shape;
};

/**
 * A robust shallow comparison for the items array.
 */
const itemsAreEqual = (a: Item[], b: Item[]): boolean => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].image !== b[i].image || a[i].link !== b[i].link) {
            return false;
        }
    }
    return true;
};

export class WheelScene {
    // --- Scene components ---
    container!: HTMLDivElement;
props!: WheelSceneProps;
clock!: Clock;
raycaster!: Raycaster;
renderer!: WebGLRenderer;
scene!: Scene;
camera!: PerspectiveCamera;
composer!: EffectComposer;
bloomPass!: UnrealBloomPass;
baseGroup!: Group;
spinGroup!: Group;
animationFrameId!: number;

    // --- Lights ---
    hemisphereLight?: HemisphereLight | null;
    keyLight?: DirectionalLight | null;
    fillLight?: DirectionalLight | null;


    // --- Interaction & Physics State ---
    isDragging = false;
    dragStart = { x: 0, y: 0 };
    lastPointerX = 0;
    pointerVelocity = 0;
    rotationSpeed = 0; 
    lastFrameRotationY = 0; 
    friction = 0.90;
    clickThreshold = 10;
    dragSensitivity!: number;
    flickSensitivity!: number;
    scrollSensitivity = 0.0009;
    idleRotationSpeed!: number;

    // --- Zoom State ---
    minZoom!: number;
    maxZoom!: number;

    // --- Hover & Immersive State ---
    hoveredGroup: Group | null = null;
    immersiveGroup: Group | null = null;
    animationSpeed!: number;

    // --- Animation targets for smooth transitions ---
    targetGroupRotation!: Euler;
targetGroupPosition!: Vector3;
targetGroupScale!: Vector3;
targetBackgroundColor!: Color;
targetRendererClearAlpha!: number;
    constructor(container: HTMLDivElement, props: WheelSceneProps) {
        this.container = container;
        this.props = props;
        this.init();
    }

    init() {
        if (!this.container) return;

        this.clock = new Clock();
        this.raycaster = new Raycaster();
        this.dragSensitivity = this.props.interaction.dragSensitivity / 100;
        this.flickSensitivity = this.props.interaction.flickSensitivity / 100;
        this.animationSpeed = this.props.interaction.clickSpeed;
        this.idleRotationSpeed = this.props.animation.autoRotate
            ? (this.props.animation.autoRotateSpeed * Math.PI / 180) * (this.props.animation.autoRotateDirection === 'left' ? -1 : 1)
            : 0;

        const { color: bgColor, alpha: bgAlpha } = parseColorAndAlpha(this.props.backgroundColor);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(bgColor, bgAlpha);
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.autoClear = false;
        this.container.appendChild(this.renderer.domElement);
        this.container.style.cursor = "grab";
        this.container.style.touchAction = "none";

        this.scene = new Scene();
        this.scene.background = null;
        this.camera = new PerspectiveCamera(55, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, this.props.wheelRadius * 2.8);
        this.minZoom = this.props.wheelRadius * 1.5;
        this.maxZoom = this.props.wheelRadius * 4.0;
        this.camera.lookAt(0, 0, 0);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(
            new Vector2(this.container.clientWidth, this.container.clientHeight),
            this.props.effects.bloomStrength,
            this.props.effects.bloomRadius,
            this.props.effects.bloomThreshold
        );
        this.bloomPass.enabled = this.props.effects.enableBloom;
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(this.bloomPass);

        this.setupLights();

        this.baseGroup = new Group();
        this.baseGroup.rotation.order = "YXZ";
        const { sceneTransform } = this.props;
        this.baseGroup.scale.set(sceneTransform.scale, sceneTransform.scale, sceneTransform.scale);
        this.baseGroup.position.set(sceneTransform.positionX, sceneTransform.positionY, sceneTransform.positionZ);
        this.baseGroup.rotation.set(MathUtils.degToRad(sceneTransform.rotationX), MathUtils.degToRad(sceneTransform.rotationY), MathUtils.degToRad(sceneTransform.rotationZ));
        this.scene.add(this.baseGroup);

        this.spinGroup = new Group();
        this.baseGroup.add(this.spinGroup);
        this.lastFrameRotationY = this.spinGroup.rotation.y;

        this.targetGroupPosition = this.baseGroup.position.clone();
        this.targetGroupScale = this.baseGroup.scale.clone();
        this.targetGroupRotation = this.baseGroup.rotation.clone();
        this.targetBackgroundColor = bgColor.clone();
        this.targetRendererClearAlpha = bgAlpha;

        this.createCards();
        this.setupEventListeners();
        this.onResize();
        this.animate();
    }
    
    update(newProps: WheelSceneProps) {
        const needsRebuild =
            !itemsAreEqual(this.props.items, newProps.items) ||
            this.props.borderRadius !== newProps.borderRadius ||
            this.props.extrusion !== newProps.extrusion ||
            this.props.imageFit !== newProps.imageFit;

        if (needsRebuild) {
            this.destroy();
            this.props = newProps;
            this.init();
            return;
        }

        this.updateLights(newProps.lighting);

        const cardTransformChanged =
            this.props.cardTransform.rotationX !== newProps.cardTransform.rotationX ||
            this.props.cardTransform.rotationY !== newProps.cardTransform.rotationY ||
            this.props.cardTransform.rotationZ !== newProps.cardTransform.rotationZ;

        if (cardTransformChanged) {
            this.spinGroup.children.forEach((cardGroup, i) => {
                if (cardGroup instanceof Group) {
                    const angle = (i / newProps.items.length) * Math.PI * 2;
                    const baseEuler = new Euler(0, angle + Math.PI / 2, 0, "YXZ");
                    const cardRotationEuler = new Euler(
                        MathUtils.degToRad(newProps.cardTransform.rotationX),
                        MathUtils.degToRad(newProps.cardTransform.rotationY),
                        MathUtils.degToRad(newProps.cardTransform.rotationZ),
                        "YXZ"
                    );
                    const cardRotationQuaternion = new Quaternion().setFromEuler(cardRotationEuler);
                    const finalQuaternion = new Quaternion().setFromEuler(baseEuler).multiply(cardRotationQuaternion);
                    cardGroup.userData.originalQuaternion = finalQuaternion;
                }
            });
        }

        const layoutChanged =
            this.props.wheelRadius !== newProps.wheelRadius ||
            this.props.cardWidth !== newProps.cardWidth ||
            this.props.cardHeight !== newProps.cardHeight;
        const bendingConstraintChanged = this.props.animation.bendingConstraint !== newProps.animation.bendingConstraint;
    
        if (layoutChanged || bendingConstraintChanged) {
            this.spinGroup.children.forEach((cardGroup, i) => {
                if (cardGroup instanceof Group && cardGroup.userData) {
                    const angle = (i / newProps.items.length) * Math.PI * 2;
                    const newPosition = new Vector3(Math.sin(angle) * newProps.wheelRadius, 0, Math.cos(angle) * newProps.wheelRadius);
                    cardGroup.userData.targetPosition.copy(newPosition);

                    cardGroup.userData.targetMeshScale.set(
                        newProps.cardWidth / cardGroup.userData.geometryWidth,
                        newProps.cardHeight / cardGroup.userData.geometryHeight,
                        1
                    );

                    const offset = new Vector3();
                    switch (newProps.animation.bendingConstraint) {
                        case "top":    offset.y = -newProps.cardHeight / 2; break;
                        case "bottom": offset.y =  newProps.cardHeight / 2; break;
                        case "left":   offset.x =  newProps.cardWidth / 2; break;
                        case "right":  offset.x = -newProps.cardWidth / 2; break;
                    }
                    cardGroup.userData.targetMeshPosition.copy(offset);
                }
            });
        }

        const { sceneTransform, backgroundColor, interaction, animation, effects } = newProps;
        this.targetGroupPosition.set(sceneTransform.positionX, sceneTransform.positionY, sceneTransform.positionZ);
        this.targetGroupScale.set(sceneTransform.scale, sceneTransform.scale, sceneTransform.scale);
        this.targetGroupRotation.set(MathUtils.degToRad(sceneTransform.rotationX), MathUtils.degToRad(sceneTransform.rotationY), MathUtils.degToRad(sceneTransform.rotationZ));
        const { color: newBgColor, alpha: newBgAlpha } = parseColorAndAlpha(backgroundColor);
        this.targetBackgroundColor.copy(newBgColor);
        this.targetRendererClearAlpha = newBgAlpha;
        
        this.dragSensitivity = interaction.dragSensitivity / 100;
        this.flickSensitivity = interaction.flickSensitivity / 100;
        this.animationSpeed = interaction.clickSpeed;
        this.idleRotationSpeed = animation.autoRotate
            ? (animation.autoRotateSpeed * Math.PI / 180) * (animation.autoRotateDirection === 'left' ? -1 : 1)
            : 0;
        
        this.bloomPass.enabled = effects.enableBloom;
        this.bloomPass.strength = effects.bloomStrength;
        this.bloomPass.radius = effects.bloomRadius;
        this.bloomPass.threshold = effects.bloomThreshold;

        this.props = newProps;
    }

    setupLights() {
        const { lighting } = this.props;
        if (lighting.enableLights) {
            this.hemisphereLight = new HemisphereLight(lighting.hemisphereLight.skyColor, lighting.hemisphereLight.groundColor, lighting.hemisphereLight.intensity);
            this.scene.add(this.hemisphereLight);

            this.keyLight = new DirectionalLight(lighting.keyLight.color, lighting.keyLight.intensity);
            this.keyLight.position.set(lighting.keyLight.positionX, lighting.keyLight.positionY, lighting.keyLight.positionZ);
            this.scene.add(this.keyLight);

            this.fillLight = new DirectionalLight(lighting.fillLight.color, lighting.fillLight.intensity);
            this.fillLight.position.set(lighting.fillLight.positionX, lighting.fillLight.positionY, lighting.fillLight.positionZ);
            this.scene.add(this.fillLight);
        }
    }

    removeLights() {
        if (this.hemisphereLight) this.scene.remove(this.hemisphereLight);
        if (this.keyLight) this.scene.remove(this.keyLight);
        if (this.fillLight) this.scene.remove(this.fillLight);
        this.hemisphereLight = null;
        this.keyLight = null;
        this.fillLight = null;
    }

    updateLights(newLighting: LightProps) {
        const oldLighting = this.props.lighting;
        if (newLighting.enableLights !== oldLighting.enableLights) {
            if (newLighting.enableLights) {
                this.setupLights();
            } else {
                this.removeLights();
            }
        } else if (newLighting.enableLights && this.hemisphereLight && this.keyLight && this.fillLight) {
            this.hemisphereLight.color.set(newLighting.hemisphereLight.skyColor);
            this.hemisphereLight.groundColor.set(newLighting.hemisphereLight.groundColor);
            this.hemisphereLight.intensity = newLighting.hemisphereLight.intensity;
            
            this.keyLight.color.set(newLighting.keyLight.color);
            this.keyLight.intensity = newLighting.keyLight.intensity;
            this.keyLight.position.set(newLighting.keyLight.positionX, newLighting.keyLight.positionY, newLighting.keyLight.positionZ);

            this.fillLight.color.set(newLighting.fillLight.color);
            this.fillLight.intensity = newLighting.fillLight.intensity;
            this.fillLight.position.set(newLighting.fillLight.positionX, newLighting.fillLight.positionY, newLighting.fillLight.positionZ);
        }
    }

    createCards() {
        if (!Array.isArray(this.props.items) || this.props.items.length === 0) return;

        const { items, cardWidth, cardHeight, borderRadius, extrusion, wheelRadius, cardTransform, animation } = this.props;
        const textureLoader = new TextureLoader();

        const cardBaseMaterial = new MeshPhysicalMaterial({
            color: new Color("#ffffff"),
            roughness: 0.4,
            metalness: 0.0,
            clearcoat: 0.1,
            clearcoatRoughness: 0.3,
            transparent: true,
        });

        items.forEach((item, i) => {
            const frontMaterial = cardBaseMaterial.clone() as MeshPhysicalMaterial;
            frontMaterial.emissive = new Color(0xFFFFFF); 
            frontMaterial.emissiveIntensity = 0;

            textureLoader.load(item.image, (texture) => {
                texture.wrapS = ClampToEdgeWrapping;
                texture.wrapT = ClampToEdgeWrapping;
                const cardAspect = cardWidth / cardHeight;
                const imageAspect = texture.image.width / texture.image.height;
                texture.repeat.set(1, 1);
                texture.offset.set(0, 0);
                switch (this.props.imageFit) {
                    case 'fill': break;
                    case 'fit':
                        if (imageAspect > cardAspect) {
                            texture.repeat.y = imageAspect / cardAspect;
                            texture.offset.y = (1 - texture.repeat.y) / 2;
                        } else {
                            texture.repeat.x = cardAspect / imageAspect;
                            texture.offset.x = (1 - texture.repeat.x) / 2;
                        }
                        break;
                    case 'cover':
                    default:
                        if (imageAspect > cardAspect) {
                            texture.repeat.x = cardAspect / imageAspect;
                            texture.offset.x = (1 - texture.repeat.x) / 2;
                        } else {
                            texture.repeat.y = imageAspect / cardAspect;
                            texture.offset.y = (1 - texture.repeat.y) / 2;
                        }
                        break;
                }
                texture.minFilter = LinearFilter;
                texture.magFilter = LinearFilter;
                texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                texture.colorSpace = SRGBColorSpace;
                frontMaterial.map = texture;
                frontMaterial.emissiveMap = texture;
                frontMaterial.needsUpdate = true;
            });

            const shape = createRoundedRectShape(cardWidth, cardHeight, borderRadius);
            const extrudeSettings = { depth: extrusion, bevelEnabled: false };
            const geometry = new ExtrudeGeometry(shape, extrudeSettings);

            const uvAttribute = geometry.attributes.uv;
            const positionAttribute = geometry.attributes.position;
            for (let i = 0; i < positionAttribute.count; i++) {
                const z = positionAttribute.getZ(i);
                const x = positionAttribute.getX(i);
                const y = positionAttribute.getY(i);
                if (Math.abs(z - extrudeSettings.depth) < 0.0001) {
                    uvAttribute.setXY(i, (x + cardWidth / 2) / cardWidth, (y + cardHeight / 2) / cardHeight);
                } else if (Math.abs(z) < 0.0001) {
                    uvAttribute.setXY(i, 1 - ((x + cardWidth / 2) / cardWidth), (y + cardHeight / 2) / cardHeight);
                }
            }
            uvAttribute.needsUpdate = true;

            const sideMaterial = cardBaseMaterial.clone();
            (sideMaterial.color as Color).set(0xf0f0f0);
            
            const cardGroup = new Group();
            const mesh = new Mesh(geometry, [frontMaterial, sideMaterial]);
            const offset = new Vector3();
            switch (animation.bendingConstraint) {
                case "top": offset.y = -cardHeight / 2; break;
                case "bottom": offset.y = cardHeight / 2; break;
                case "left": offset.x = cardWidth / 2; break;
                case "right": offset.x = -cardWidth / 2; break;
            }
            mesh.position.copy(offset);
            cardGroup.add(mesh);

            const angle = (i / items.length) * Math.PI * 2;
            const position = new Vector3(Math.sin(angle) * wheelRadius, 0, Math.cos(angle) * wheelRadius);
            cardGroup.position.copy(position);

            const euler = new Euler(0, angle + Math.PI / 2, 0, "YXZ");
            
            const cardRotationEuler = new Euler(MathUtils.degToRad(cardTransform.rotationX), MathUtils.degToRad(cardTransform.rotationY), MathUtils.degToRad(cardTransform.rotationZ), "YXZ");
            const cardRotationQuaternion = new Quaternion().setFromEuler(cardRotationEuler);
            const finalQuaternion = new Quaternion().setFromEuler(euler).multiply(cardRotationQuaternion);

            cardGroup.userData = { 
                item, 
                targetPosition: position.clone(), 
                originalQuaternion: finalQuaternion, 
                isFadingOut: false, 
                physics: { angle: 0, velocity: 0 },
                targetMeshScale: new Vector3(1, 1, 1),
                targetMeshPosition: offset.clone(),
                geometryWidth: cardWidth,
                geometryHeight: cardHeight,
            };
            cardGroup.quaternion.copy(cardGroup.userData.originalQuaternion);
            this.spinGroup.add(cardGroup);
        });
    }

    setupEventListeners() {
        this.container.addEventListener("pointerdown", this.onPointerDown);
        this.container.addEventListener("pointermove", this.onPointerMove);
        this.container.addEventListener("pointerup", this.onPointerUp);
        this.container.addEventListener("pointerleave", this.onPointerUp);
        this.container.addEventListener("pointercancel", this.onPointerCancel);
        if (this.props.interaction.enableScroll) {
            this.container.addEventListener("wheel", this.onWheel, { passive: false });
        }
        window.addEventListener("resize", this.onResize);
    }

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.container.removeEventListener("pointerdown", this.onPointerDown);
        this.container.removeEventListener("pointermove", this.onPointerMove);
        this.container.removeEventListener("pointerup", this.onPointerUp);
        this.container.removeEventListener("pointerleave", this.onPointerUp);
        this.container.removeEventListener("pointercancel", this.onPointerCancel);
        if (this.props.interaction.enableScroll) this.container.removeEventListener("wheel", this.onWheel);
        window.removeEventListener("resize", this.onResize);
        if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        this.renderer.dispose();
    }

    onResize = () => {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    };

    onPointerDown = (e: PointerEvent) => {
        if (!e.isPrimary || this.immersiveGroup) return;
        this.isDragging = true;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
        this.lastPointerX = e.clientX;
        this.pointerVelocity = 0;
        this.rotationSpeed = 0;
        this.container.style.cursor = "grabbing";
    };

    onPointerMove = (e: PointerEvent) => {
        if (!e.isPrimary) return;
        if (this.isDragging) {
            const currentX = e.clientX;
            const deltaX = currentX - this.lastPointerX;
            this.pointerVelocity = deltaX;
            this.lastPointerX = currentX;
            this.spinGroup.rotation.y += deltaX * this.dragSensitivity;
        } else {
             this.updateHover(e);
        }
    };

    onPointerUp = (e: PointerEvent) => {
        if (!e.isPrimary) return;
        const dragDistance = Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y);

        if (this.isDragging && dragDistance >= this.clickThreshold) {
            this.rotationSpeed = this.pointerVelocity * this.flickSensitivity;
        } else if (this.props.interaction.enableClick) {
            if (this.immersiveGroup) {
                 const { link, openInNewTab } = this.immersiveGroup.userData.item;
                 if (link && link !== "#") window.open(link, openInNewTab ? "_blank" : "_self");
                 this.exitImmersive();
            } else if (this.hoveredGroup) {
                this.enterImmersive(this.hoveredGroup);
            }
        }
        this.isDragging = false;
        if (!this.hoveredGroup && !this.immersiveGroup) this.container.style.cursor = "grab";
    };

    onPointerCancel = (e: PointerEvent) => {
        this.isDragging = false;
        this.rotationSpeed = 0;
        if (!this.hoveredGroup && !this.immersiveGroup) this.container.style.cursor = "grab";
    };

    onWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (this.immersiveGroup) return;
        if (e.ctrlKey || e.metaKey) {
            const zoomAmount = e.deltaY * 0.025;
            this.camera.position.z = MathUtils.clamp(this.camera.position.z + zoomAmount, this.minZoom, this.maxZoom);
        } else {
            this.rotationSpeed += e.deltaY * this.scrollSensitivity;
        }
    };

    updateHover = (e: PointerEvent) => {
        if (this.immersiveGroup || this.isDragging || !this.props.interaction.enableHover) {
            if (this.hoveredGroup) this.clearHover();
            return;
        };
        const pointer = new Vector2((e.clientX / this.container.clientWidth) * 2 - 1, -(e.clientY / this.container.clientHeight) * 2 + 1);
        this.raycaster.setFromCamera(pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.spinGroup.children, true);
        if (intersects.length > 0) {
            const intersectedGroup = intersects[0].object.parent as Group;
            if (this.hoveredGroup !== intersectedGroup) {
                this.clearHover();
                this.hoveredGroup = intersectedGroup;
                this.container.style.cursor = "pointer";
            }
        } else {
            this.clearHover();
        }
    };

    clearHover = () => {
        if (this.hoveredGroup) {
            this.hoveredGroup = null;
            if (!this.isDragging && !this.immersiveGroup) this.container.style.cursor = "grab";
        }
    };

    enterImmersive = (group: Group) => {
        this.immersiveGroup = group;
        this.clearHover();
        this.rotationSpeed = 0;
        this.spinGroup.children.forEach(child => { (child as Group).userData.isFadingOut = (child !== this.immersiveGroup); });
    }

    exitImmersive = () => {
        this.immersiveGroup = null;
        this.container.style.cursor = "grab";
        this.spinGroup.children.forEach(child => { (child as Group).userData.isFadingOut = false; });
    }

    animate = () => {
        this.animationFrameId = requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        const lerpFactor = Math.min(delta * 5, 1);

        this.baseGroup.position.lerp(this.targetGroupPosition, lerpFactor);
        this.baseGroup.scale.lerp(this.targetGroupScale, lerpFactor);
        const targetQuaternion = new Quaternion().setFromEuler(this.targetGroupRotation);
        this.baseGroup.quaternion.slerp(targetQuaternion, lerpFactor);

        const currentClearColor = new Color();
        this.renderer.getClearColor(currentClearColor);
        currentClearColor.lerp(this.targetBackgroundColor, lerpFactor);
        const newAlpha = MathUtils.lerp(this.renderer.getClearAlpha(), this.targetRendererClearAlpha, lerpFactor);
        this.renderer.setClearColor(currentClearColor, newAlpha);

        if (!this.isDragging && !this.immersiveGroup) {
            if (Math.abs(this.rotationSpeed) > 0.0001) {
                this.spinGroup.rotation.y += this.rotationSpeed;
                this.rotationSpeed *= this.friction;
            } else {
                this.rotationSpeed = 0;
                this.spinGroup.rotation.y += this.idleRotationSpeed * delta;
            }
        }

        const rotationDelta = this.spinGroup.rotation.y - this.lastFrameRotationY;

        this.spinGroup.children.forEach(child => {
            const cardGroup = child as Group;
            const mesh = cardGroup.children[0] as Mesh;
            const frontMaterial = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshPhysicalMaterial;
            
            if (this.immersiveGroup === cardGroup) {
                cardGroup.userData.physics.angle = 0;
                cardGroup.userData.physics.velocity = 0;

                const targetWorldPosition = new Vector3(0, 0, this.camera.position.z - this.props.cardWidth * 1.5);
                const targetLocalPosition = this.spinGroup.worldToLocal(targetWorldPosition.clone());
                cardGroup.position.lerp(targetLocalPosition, this.animationSpeed);

                const worldQuaternion = new Quaternion();
                this.spinGroup.getWorldQuaternion(worldQuaternion);
                const targetLocalQuaternion = worldQuaternion.invert();
                cardGroup.quaternion.slerp(targetLocalQuaternion, this.animationSpeed);

                mesh.scale.lerp(new Vector3(1, 1, 1), this.animationSpeed);
                mesh.position.lerp(new Vector3(0, 0, 0), this.animationSpeed);

            } else {
                const physics = cardGroup.userData.physics;
                let targetQuaternion = cardGroup.userData.originalQuaternion.clone();
                const { bendingIntensity, bendingRange, bendingConstraint } = this.props.animation;
                const targetAngle = -rotationDelta * bendingIntensity;
                const stiffness = 0.1, damping = 0.2;
                const springForce = (targetAngle - physics.angle) * stiffness;
                const dampingForce = -physics.velocity * damping;
                physics.velocity += springForce + dampingForce;
                physics.angle += physics.velocity;
                physics.angle = MathUtils.clamp(physics.angle, -bendingRange, bendingRange);
                const bendAxis = (bendingConstraint === 'left' || bendingConstraint === 'right') ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
                const physicsRotation = new Quaternion().setFromAxisAngle(bendAxis, physics.angle);
                targetQuaternion.multiply(physicsRotation);

                if (this.props.interaction.enableHover && this.hoveredGroup === cardGroup) {
                    const tiltQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), MathUtils.degToRad(-5));
                    targetQuaternion.multiply(tiltQuaternion);
                }
                cardGroup.quaternion.slerp(targetQuaternion, this.animationSpeed * 2.0);

                let finalTargetPosition = cardGroup.userData.targetPosition.clone();
                if (this.props.interaction.enableHover && this.hoveredGroup === cardGroup) {
                    finalTargetPosition.multiplyScalar(this.props.interaction.hoverScale);
                    finalTargetPosition.y += this.props.interaction.hoverOffsetY;
                    const outVector = cardGroup.userData.targetPosition.clone().normalize();
                    finalTargetPosition.add(outVector.multiplyScalar(this.props.interaction.hoverSlideOut));
                }
                cardGroup.position.lerp(finalTargetPosition, this.animationSpeed);

                mesh.scale.lerp(cardGroup.userData.targetMeshScale, lerpFactor);
                mesh.position.lerp(cardGroup.userData.targetMeshPosition, lerpFactor);
            }
            
            const targetEmissive = (this.hoveredGroup === cardGroup && !this.immersiveGroup) ? 0.7 : 0;
            frontMaterial.emissiveIntensity = MathUtils.lerp(frontMaterial.emissiveIntensity, targetEmissive, this.animationSpeed * 2);

            let targetOpacity = 1.0;
            if (this.immersiveGroup) targetOpacity = cardGroup.userData.isFadingOut ? 0.4 : 1.0;
            else if (this.hoveredGroup) targetOpacity = (this.hoveredGroup === cardGroup) ? 1.0 : 0.4;
            (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(mat => mat.opacity = MathUtils.lerp(mat.opacity, targetOpacity, this.animationSpeed));
        });
        
        this.lastFrameRotationY = this.spinGroup.rotation.y;
        this.renderer.clear();
        this.composer.render();
    };
}
