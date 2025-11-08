/**
 * 3D Animations (P2.1)
 * Three.js integration for 3D graphics and animations
 * 3D models, particle systems, camera controls
 */

export interface Scene3D {
  id: string;
  name: string;
  slideId: string;
  width: number;
  height: number;
  backgroundColor: string;
  camera: Camera3D;
  objects: Object3D[];
  lights: Light3D[];
  animations: Animation3D[];
  settings: SceneSettings;
  createdAt: Date;
}

export interface Camera3D {
  type: 'perspective' | 'orthographic';
  position: Vector3;
  rotation: Vector3;
  fov?: number; // Field of view (for perspective)
  zoom: number;
  controls?: {
    enabled: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    enableZoom?: boolean;
    enablePan?: boolean;
  };
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Object3D {
  id: string;
  name: string;
  type: '3d_model' | 'primitive' | 'text3d' | 'particle_system';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  visible: boolean;
  castShadow: boolean;
  receiveShadow: boolean;
  material?: Material3D;
  geometry?: Geometry3D;
  modelUrl?: string; // For 3D models (GLB, GLTF)
  particleConfig?: ParticleConfig;
  textConfig?: Text3DConfig;
}

export interface Material3D {
  type: 'basic' | 'standard' | 'phong' | 'physical' | 'toon';
  color: string;
  emissive?: string;
  metalness?: number; // 0-1
  roughness?: number; // 0-1
  opacity?: number; // 0-1
  transparent?: boolean;
  wireframe?: boolean;
  map?: string; // Texture URL
  normalMap?: string;
  envMap?: string;
}

export interface Geometry3D {
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'custom';
  parameters?: Record<string, any>;
}

export interface Light3D {
  id: string;
  name: string;
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  color: string;
  intensity: number;
  position?: Vector3; // Not for ambient
  target?: Vector3; // For directional/spot
  distance?: number; // For point/spot
  angle?: number; // For spot (radians)
  penumbra?: number; // For spot (0-1)
  castShadow?: boolean;
}

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  opacity: number;
  texture?: string;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  lifespan?: number; // seconds
  gravity?: number;
}

export interface Text3DConfig {
  text: string;
  font: string;
  size: number;
  height: number; // Extrusion depth
  curveSegments?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
}

export interface Animation3D {
  id: string;
  name: string;
  objectId: string;
  type: 'position' | 'rotation' | 'scale' | 'morph' | 'camera' | 'custom';
  duration: number; // seconds
  delay?: number; // seconds
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  loop?: boolean;
  yoyo?: boolean; // Reverse animation on alternate loops
  keyframes: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  time: number; // 0-1 (percentage of duration)
  value: Vector3 | number | any;
}

export interface SceneSettings {
  antialias: boolean;
  shadows: boolean;
  shadowMapSize: number;
  fog?: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  postProcessing?: {
    bloom?: boolean;
    motionBlur?: boolean;
    depthOfField?: boolean;
  };
}

export interface ModelLoader {
  format: 'gltf' | 'glb' | 'obj' | 'fbx' | 'stl';
  url: string;
  scale?: number;
  autoCenter?: boolean;
}

export interface RenderConfig {
  pixelRatio: number;
  alpha: boolean;
  preserveDrawingBuffer: boolean;
}

/**
 * 3D Animations Manager
 * Three.js integration for 3D graphics
 */
export class ThreeDAnimationsManager {
  private scenes: Map<string, Scene3D>;
  private loadedModels: Map<string, any>; // THREE.Group
  private animationMixers: Map<string, any>; // THREE.AnimationMixer
  private activeScene: string | null = null;

  constructor() {
    this.scenes = new Map();
    this.loadedModels = new Map();
    this.animationMixers = new Map();
  }

  /**
   * Create 3D scene
   */
  createScene(
    slideId: string,
    name: string,
    width: number,
    height: number,
    settings?: Partial<SceneSettings>
  ): Scene3D {
    const scene: Scene3D = {
      id: this.generateId(),
      name,
      slideId,
      width,
      height,
      backgroundColor: '#000000',
      camera: {
        type: 'perspective',
        position: { x: 0, y: 0, z: 5 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 75,
        zoom: 1,
        controls: {
          enabled: true,
          autoRotate: false,
          enableZoom: true,
          enablePan: true
        }
      },
      objects: [],
      lights: [
        {
          id: this.generateId(),
          name: 'Ambient Light',
          type: 'ambient',
          color: '#404040',
          intensity: 0.5
        },
        {
          id: this.generateId(),
          name: 'Directional Light',
          type: 'directional',
          color: '#ffffff',
          intensity: 0.8,
          position: { x: 5, y: 5, z: 5 },
          castShadow: true
        }
      ],
      animations: [],
      settings: {
        antialias: true,
        shadows: true,
        shadowMapSize: 2048,
        ...settings
      },
      createdAt: new Date()
    };

    this.scenes.set(scene.id, scene);
    return scene;
  }

  /**
   * Add primitive object
   */
  addPrimitive(
    sceneId: string,
    type: Geometry3D['type'],
    material: Material3D,
    options?: {
      position?: Vector3;
      rotation?: Vector3;
      scale?: Vector3;
      name?: string;
    }
  ): Object3D | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const object: Object3D = {
      id: this.generateId(),
      name: options?.name || `${type} ${scene.objects.length + 1}`,
      type: 'primitive',
      position: options?.position || { x: 0, y: 0, z: 0 },
      rotation: options?.rotation || { x: 0, y: 0, z: 0 },
      scale: options?.scale || { x: 1, y: 1, z: 1 },
      visible: true,
      castShadow: true,
      receiveShadow: true,
      material,
      geometry: { type, parameters: this.getDefaultGeometryParams(type) }
    };

    scene.objects.push(object);
    return object;
  }

  /**
   * Get default geometry parameters
   */
  private getDefaultGeometryParams(type: Geometry3D['type']): Record<string, any> {
    switch (type) {
      case 'box':
        return { width: 1, height: 1, depth: 1 };
      case 'sphere':
        return { radius: 1, widthSegments: 32, heightSegments: 32 };
      case 'cylinder':
        return { radiusTop: 1, radiusBottom: 1, height: 2, radialSegments: 32 };
      case 'cone':
        return { radius: 1, height: 2, radialSegments: 32 };
      case 'torus':
        return { radius: 1, tube: 0.4, radialSegments: 16, tubularSegments: 100 };
      case 'plane':
        return { width: 2, height: 2 };
      default:
        return {};
    }
  }

  /**
   * Load 3D model
   */
  async load3DModel(
    sceneId: string,
    modelUrl: string,
    options?: {
      position?: Vector3;
      rotation?: Vector3;
      scale?: Vector3;
      name?: string;
    }
  ): Promise<Object3D | null> {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    // In production, would use THREE.GLTFLoader, THREE.OBJLoader, etc.
    // For now, simulate loading
    const object: Object3D = {
      id: this.generateId(),
      name: options?.name || 'Imported Model',
      type: '3d_model',
      position: options?.position || { x: 0, y: 0, z: 0 },
      rotation: options?.rotation || { x: 0, y: 0, z: 0 },
      scale: options?.scale || { x: 1, y: 1, z: 1 },
      visible: true,
      castShadow: true,
      receiveShadow: true,
      modelUrl
    };

    scene.objects.push(object);
    return object;
  }

  /**
   * Add 3D text
   */
  add3DText(
    sceneId: string,
    text: string,
    config: Partial<Text3DConfig>,
    material: Material3D,
    options?: {
      position?: Vector3;
      rotation?: Vector3;
    }
  ): Object3D | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const object: Object3D = {
      id: this.generateId(),
      name: `Text: ${text.substring(0, 20)}`,
      type: 'text3d',
      position: options?.position || { x: 0, y: 0, z: 0 },
      rotation: options?.rotation || { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      castShadow: true,
      receiveShadow: true,
      material,
      textConfig: {
        text,
        font: 'helvetiker',
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        ...config
      }
    };

    scene.objects.push(object);
    return object;
  }

  /**
   * Add particle system
   */
  addParticleSystem(
    sceneId: string,
    config: ParticleConfig,
    options?: {
      position?: Vector3;
      name?: string;
    }
  ): Object3D | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const object: Object3D = {
      id: this.generateId(),
      name: options?.name || 'Particle System',
      type: 'particle_system',
      position: options?.position || { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      castShadow: false,
      receiveShadow: false,
      particleConfig: config
    };

    scene.objects.push(object);
    return object;
  }

  /**
   * Add light
   */
  addLight(sceneId: string, light: Omit<Light3D, 'id'>): Light3D | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const newLight: Light3D = {
      id: this.generateId(),
      ...light
    };

    scene.lights.push(newLight);
    return newLight;
  }

  /**
   * Create animation
   */
  createAnimation(
    sceneId: string,
    objectId: string,
    type: Animation3D['type'],
    keyframes: AnimationKeyframe[],
    options?: {
      name?: string;
      duration?: number;
      delay?: number;
      easing?: Animation3D['easing'];
      loop?: boolean;
      yoyo?: boolean;
    }
  ): Animation3D | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const animation: Animation3D = {
      id: this.generateId(),
      name: options?.name || `Animation ${scene.animations.length + 1}`,
      objectId,
      type,
      duration: options?.duration || 1,
      delay: options?.delay || 0,
      easing: options?.easing || 'linear',
      loop: options?.loop || false,
      yoyo: options?.yoyo || false,
      keyframes
    };

    scene.animations.push(animation);
    return animation;
  }

  /**
   * Update object transform
   */
  updateObject(
    sceneId: string,
    objectId: string,
    updates: {
      position?: Partial<Vector3>;
      rotation?: Partial<Vector3>;
      scale?: Partial<Vector3>;
      visible?: boolean;
    }
  ): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    const object = scene.objects.find(o => o.id === objectId);
    if (!object) return false;

    if (updates.position) {
      Object.assign(object.position, updates.position);
    }
    if (updates.rotation) {
      Object.assign(object.rotation, updates.rotation);
    }
    if (updates.scale) {
      Object.assign(object.scale, updates.scale);
    }
    if (updates.visible !== undefined) {
      object.visible = updates.visible;
    }

    return true;
  }

  /**
   * Remove object
   */
  removeObject(sceneId: string, objectId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    const index = scene.objects.findIndex(o => o.id === objectId);
    if (index === -1) return false;

    scene.objects.splice(index, 1);

    // Remove associated animations
    scene.animations = scene.animations.filter(a => a.objectId !== objectId);

    return true;
  }

  /**
   * Update camera
   */
  updateCamera(sceneId: string, updates: Partial<Camera3D>): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    Object.assign(scene.camera, updates);
    return true;
  }

  /**
   * Generate Three.js setup code
   */
  generateThreeJSCode(sceneId: string): string {
    const scene = this.scenes.get(sceneId);
    if (!scene) return '';

    return `
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('${scene.backgroundColor}');

// Create camera
const camera = new THREE.${scene.camera.type === 'perspective' ? 'PerspectiveCamera' : 'OrthographicCamera'}(
  ${scene.camera.fov || 75},
  ${scene.width} / ${scene.height},
  0.1,
  1000
);
camera.position.set(${scene.camera.position.x}, ${scene.camera.position.y}, ${scene.camera.position.z});

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: ${scene.settings.antialias} });
renderer.setSize(${scene.width}, ${scene.height});
renderer.shadowMap.enabled = ${scene.settings.shadows};
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Add controls
${scene.camera.controls?.enabled ? `
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = ${scene.camera.controls.autoRotate};
controls.enableZoom = ${scene.camera.controls.enableZoom};
controls.enablePan = ${scene.camera.controls.enablePan};
` : ''}

// Add lights
${scene.lights.map(light => this.generateLightCode(light)).join('\n')}

// Add objects
${scene.objects.map(obj => this.generateObjectCode(obj)).join('\n')}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  ${scene.camera.controls?.enabled ? 'controls.update();' : ''}
  renderer.render(scene, camera);
}
animate();
    `.trim();
  }

  /**
   * Generate light code
   */
  private generateLightCode(light: Light3D): string {
    switch (light.type) {
      case 'ambient':
        return `scene.add(new THREE.AmbientLight('${light.color}', ${light.intensity}));`;
      case 'directional':
        return `
const dirLight = new THREE.DirectionalLight('${light.color}', ${light.intensity});
dirLight.position.set(${light.position?.x}, ${light.position?.y}, ${light.position?.z});
${light.castShadow ? 'dirLight.castShadow = true;' : ''}
scene.add(dirLight);`;
      case 'point':
        return `
const pointLight = new THREE.PointLight('${light.color}', ${light.intensity}, ${light.distance || 0});
pointLight.position.set(${light.position?.x}, ${light.position?.y}, ${light.position?.z});
scene.add(pointLight);`;
      case 'spot':
        return `
const spotLight = new THREE.SpotLight('${light.color}', ${light.intensity}, ${light.distance || 0}, ${light.angle || Math.PI / 4});
spotLight.position.set(${light.position?.x}, ${light.position?.y}, ${light.position?.z});
scene.add(spotLight);`;
      default:
        return '';
    }
  }

  /**
   * Generate object code
   */
  private generateObjectCode(object: Object3D): string {
    if (object.type === 'primitive' && object.geometry) {
      const geomType = object.geometry.type.charAt(0).toUpperCase() + object.geometry.type.slice(1);
      return `
const geometry = new THREE.${geomType}Geometry(${this.paramsToString(object.geometry.parameters)});
const material = new THREE.MeshStandardMaterial({ color: '${object.material?.color}' });
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(${object.position.x}, ${object.position.y}, ${object.position.z});
mesh.rotation.set(${object.rotation.x}, ${object.rotation.y}, ${object.rotation.z});
mesh.scale.set(${object.scale.x}, ${object.scale.y}, ${object.scale.z});
mesh.castShadow = ${object.castShadow};
mesh.receiveShadow = ${object.receiveShadow};
scene.add(mesh);`;
    }
    return '';
  }

  /**
   * Convert params to string
   */
  private paramsToString(params?: Record<string, any>): string {
    if (!params) return '';
    return Object.values(params).join(', ');
  }

  /**
   * Export scene configuration
   */
  exportScene(sceneId: string): string {
    const scene = this.scenes.get(sceneId);
    if (!scene) return '{}';

    return JSON.stringify(scene, null, 2);
  }

  /**
   * Import scene configuration
   */
  importScene(jsonData: string): string | null {
    try {
      const sceneData = JSON.parse(jsonData);
      const scene: Scene3D = {
        ...sceneData,
        id: this.generateId(),
        createdAt: new Date()
      };
      this.scenes.set(scene.id, scene);
      return scene.id;
    } catch {
      return null;
    }
  }

  /**
   * Get all scenes
   */
  getScenes(): Scene3D[] {
    return Array.from(this.scenes.values());
  }

  /**
   * Get scene by ID
   */
  getScene(sceneId: string): Scene3D | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Delete scene
   */
  deleteScene(sceneId: string): boolean {
    return this.scenes.delete(sceneId);
  }

  /**
   * Get scene statistics
   */
  getSceneStats(sceneId: string): {
    objectCount: number;
    lightCount: number;
    animationCount: number;
    vertices: number;
    triangles: number;
  } | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    // Estimate vertices/triangles based on primitives
    let vertices = 0;
    let triangles = 0;

    scene.objects.forEach(obj => {
      if (obj.geometry?.type === 'sphere') {
        const segments = 32;
        vertices += (segments + 1) * (segments + 1);
        triangles += segments * segments * 2;
      } else if (obj.geometry?.type === 'box') {
        vertices += 24; // 8 unique * 3 faces
        triangles += 12; // 6 faces * 2 triangles
      }
    });

    return {
      objectCount: scene.objects.length,
      lightCount: scene.lights.length,
      animationCount: scene.animations.length,
      vertices,
      triangles
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all scenes
   */
  clearAll(): void {
    this.scenes.clear();
    this.loadedModels.clear();
    this.animationMixers.clear();
  }
}

// Singleton instance
export const threeDAnimationsManager = new ThreeDAnimationsManager();
