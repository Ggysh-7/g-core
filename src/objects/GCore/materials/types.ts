import * as THREE from 'three'

export type MaterialMode = 'metal' | 'glass' | 'holographic'

export interface GCoreMaterialPresets {
  metal: THREE.MeshPhysicalMaterialParameters
  glass: THREE.MeshPhysicalMaterialParameters
  holographic: THREE.MeshPhysicalMaterialParameters
}

export const MATERIAL_PRESETS: GCoreMaterialPresets = {
  metal: {
    color: '#CECECE',
    metalness: 1.0,
    roughness: 0.04,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 1.0,
    ior: 2.4,
  },
  glass: {
    color: '#E8F0FF',
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.94,
    thickness: 1.8,
    envMapIntensity: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    ior: 1.52,
    specularIntensity: 1.0,
    specularColor: '#FFFFFF',
  },
  holographic: {
    color: '#D0D8FF',
    metalness: 0.85,
    roughness: 0.12,
    transmission: 0.35,
    thickness: 0.8,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    ior: 1.8,
    iridescence: 1.0,
    iridescenceIOR: 1.5,
    iridescenceThicknessRange: [100, 800],
    specularIntensity: 1.0,
    specularColor: '#FFFFFF',
  },
} as const
