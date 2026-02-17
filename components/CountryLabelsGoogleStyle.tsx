
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const latLngToVector3 = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

interface CountryLabelData {
  name: string;
  lat: number;
  lng: number;
  importance: 1 | 2 | 3 | 4 | 5;
  fontSize?: number;
}

export const GOOGLE_STYLE_COUNTRY_LABELS: CountryLabelData[] = [
  { name: 'USA', lat: 39.0, lng: -98.0, importance: 1, fontSize: 0.14 },
  { name: 'Canada', lat: 56.1304, lng: -106.3468, importance: 1, fontSize: 0.12 },
  { name: 'China', lat: 35.8617, lng: 104.1954, importance: 1, fontSize: 0.13 },
  { name: 'Brazil', lat: -14.2350, lng: -51.9253, importance: 1, fontSize: 0.12 },
  { name: 'India', lat: 20.5937, lng: 78.9629, importance: 1, fontSize: 0.12 },
  { name: 'Australia', lat: -25.2744, lng: 133.7751, importance: 1, fontSize: 0.11 },
  { name: 'UK', lat: 54.0, lng: -2.0, importance: 2, fontSize: 0.09 },
  { name: 'Germany', lat: 51.1657, lng: 10.4515, importance: 2, fontSize: 0.09 },
  { name: 'Japan', lat: 36.2048, lng: 138.2529, importance: 2, fontSize: 0.09 },
  { name: 'Russia', lat: 61.5240, lng: 105.3188, importance: 1, fontSize: 0.14 },
  { name: 'South Africa', lat: -30.5595, lng: 22.9375, importance: 1, fontSize: 0.10 },
  { name: 'France', lat: 46.2276, lng: 2.2137, importance: 2, fontSize: 0.09 },
];

const LABEL_VISIBILITY = {
  tier1: { maxDistance: 15 },
  tier2: { maxDistance: 9 },
  tier3: { maxDistance: 7 },
  tier4: { maxDistance: 5.5 },
  tier5: { maxDistance: 4.5 },
};

const GoogleStyleCountryLabel: React.FC<{ label: CountryLabelData; cameraDistance: number }> = ({ label, cameraDistance }) => {
  const groupRef = useRef<THREE.Group>(null);
  // Radius 2.05 to sit just above borders
  const pos = useMemo(() => latLngToVector3(label.lat, label.lng, 2.05), [label.lat, label.lng]);
  const isVisible = cameraDistance <= LABEL_VISIBILITY[`tier${label.importance}` as keyof typeof LABEL_VISIBILITY].maxDistance;
  
  // Fix the orientation to the globe surface instead of rotating to face camera
  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0); // Face the center of the globe
      groupRef.current.rotateY(Math.PI); // Rotate 180 to face outward
    }
  }, []);

  if (!isVisible) return null;
  
  return (
    <group ref={groupRef} position={pos}>
      <Text
        fontSize={label.fontSize || 0.07}
        color="#E1A36F" 
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015} 
        outlineColor="#2A3C42"
        material-toneMapped={false}
        material-depthTest={true}
      >
        {label.name}
      </Text>
    </group>
  );
};

export const GoogleStyleCountryLabels: React.FC<{ cameraDistance: number }> = ({ cameraDistance }) => (
  <>
    {GOOGLE_STYLE_COUNTRY_LABELS.map(l => (
      <GoogleStyleCountryLabel key={l.name} label={l} cameraDistance={cameraDistance} />
    ))}
  </>
);
