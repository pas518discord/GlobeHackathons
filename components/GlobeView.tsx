import React, { useMemo, useRef, Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Hackathon } from '../types.ts';
import { HackathonDatabaseManager } from '../services/HackathonDatabase.ts';
import { ZoomVisibilityManager, getMarkerScaleForDistance } from '../services/ZoomBasedVisibility.ts';
import { GoogleStyleCountryLabels } from './CountryLabelsGoogleStyle.tsx';

const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

interface GlobeViewProps {
  hackathons: Hackathon[];
  onSelect: (h: Hackathon) => void;
}

const GeoJsonBorders: React.FC = () => {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("GeoJSON Load Error:", err));
  }, []);

  const borderLines = useMemo(() => {
    if (!geoData) return [];
    const lines: THREE.Vector3[][] = [];

    geoData.features.forEach((feature: any) => {
      const { type, coordinates } = feature.geometry;
      if (type === 'Polygon') {
        coordinates.forEach((ring: any) => {
          const pts = ring.map((coord: any) => latLngToVector3(coord[1], coord[0], 2.025));
          lines.push(pts);
        });
      } else if (type === 'MultiPolygon') {
        coordinates.forEach((polygon: any) => {
          polygon.forEach((ring: any) => {
            const pts = ring.map((coord: any) => latLngToVector3(coord[1], coord[0], 2.025));
            lines.push(pts);
          });
        });
      }
    });
    return lines;
  }, [geoData]);

  return (
    <group>
      {/* Borders in Calico Yellow #DEC484 */}
      {borderLines.map((points, i) => (
        <Line key={i} points={points} color="#DEC484" lineWidth={1.5} transparent opacity={0.9} />
      ))}
    </group>
  );
};

const TelemetryHUD: React.FC<{ 
  total: number;
  visible: number;
  dist: number;
}> = ({ total, visible, dist }) => {
  const stats = useMemo(() => HackathonDatabaseManager.getStats(), [total]);
  const zoomLabel = ZoomVisibilityManager.getZoomLevelLabel(dist);
  
  return (
    <div className="absolute top-8 right-8 z-10 p-6 bg-[#2A3C42]/95 backdrop-blur-xl rounded-2xl border border-[#DEC484]/30 pointer-events-none shadow-3d min-w-[280px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#E1A36F] animate-pulse shadow-[0_0_10px_#E1A36F]"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E1A36F]">Node_Telemetry</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-[10px] text-[#E2D8A5] font-mono mb-1 uppercase tracking-widest">Global Nodes</p>
          <p className="text-4xl font-black text-white tracking-tighter">{stats.total}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-[#DEC484]/20 pt-4">
          <div>
            <p className="text-[9px] text-[#E2D8A5] font-mono uppercase">Visible</p>
            <p className="text-xl font-black text-[#6F9F9C]">{visible}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-[#E2D8A5] font-mono uppercase">Range</p>
            <p className="text-xs font-bold text-white uppercase">{zoomLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstancedMarkers: React.FC<{
  hackathons: Hackathon[];
  onSelect: (h: Hackathon) => void;
  cameraDist: number;
  selectedId: string | null;
}> = ({ hackathons, onSelect, cameraDist, selectedId }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const MAX_COUNT = 1000;

  useEffect(() => {
    if (meshRef.current) {
      const colorArray = new Float32Array(MAX_COUNT * 3);
      for (let i = 0; i < MAX_COUNT; i++) {
        tempColor.set('#000000');
        tempColor.toArray(colorArray, i * 3);
      }
      meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
    }
  }, []);

  const positions = useMemo(() => {
    return hackathons.map(h => h.coordinates ? latLngToVector3(h.coordinates.lat, h.coordinates.lng, 2.08) : null);
  }, [hackathons]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < MAX_COUNT; i++) {
        tempObject.scale.set(0, 0, 0);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    hackathons.forEach((h, i) => {
      if (i >= MAX_COUNT) return;
      const pos = positions[i];
      if (!pos) return;

      const tier = h.discoveryTier || 3;
      const baseScale = getMarkerScaleForDistance(cameraDist, tier);
      const isSelected = h.id === selectedId;
      const isHovered = i === hoveredIndex;

      const pulse = 1 + Math.sin(time * 5 + i) * 0.1;
      const finalScale = baseScale * pulse * (isSelected || isHovered ? 2.5 : 1);

      tempObject.position.copy(pos);
      tempObject.scale.set(finalScale, finalScale, finalScale);
      tempObject.lookAt(0, 0, 0);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      // Color Logic: Online = Green, Offline = Red
      let colorHex = "#ffffff";
      if (isSelected) {
        colorHex = "#fbbf24"; // Highlight Yellow
      } else if (h.locationType === 'Online') {
        colorHex = "#22c55e"; // Green
      } else {
        colorHex = "#ef4444"; // Red
      }

      tempColor.set(colorHex);
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[new THREE.SphereGeometry(0.02, 12, 12), undefined, MAX_COUNT]}
        onClick={(e) => { 
          e.stopPropagation(); 
          if (e.instanceId !== undefined && e.instanceId < hackathons.length) {
              onSelect(hackathons[e.instanceId]);
          }
        }}
        onPointerMove={(e) => {
            e.stopPropagation();
            if (e.instanceId !== undefined && e.instanceId < hackathons.length) {
                if (hoveredIndex !== e.instanceId) setHoveredIndex(e.instanceId);
            }
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHoveredIndex(null);
        }}
      >
        <meshStandardMaterial metalness={0.9} roughness={0.1} emissiveIntensity={2} />
      </instancedMesh>

      {hoveredIndex !== null && hackathons[hoveredIndex] && positions[hoveredIndex] && (
        <Html position={positions[hoveredIndex]!} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div className="transform -translate-x-1/2 -translate-y-[200%]">
                <div className="bg-[#2A3C42]/90 text-white px-3 py-2 rounded-xl border border-[#DEC484]/30 backdrop-blur-md shadow-xl flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap mb-1">
                        {hackathons[hoveredIndex].name}
                    </span>
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-md ${hackathons[hoveredIndex].locationType === 'Online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {hackathons[hoveredIndex].locationType}
                    </span>
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#2A3C42]/90 mx-auto"></div>
            </div>
        </Html>
      )}
    </>
  );
};

const GlobeWithTexture: React.FC = () => {
  const [texError, setTexError] = useState(false);
  const landTexture = useTexture(
    'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
    (texture) => {
      if (texture instanceof THREE.Texture) {
        texture.anisotropy = 16;
      }
    }
  );

  return (
    <>
      {/* Ocean Sphere - Smalt Blue #577E89 */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#577E89" roughness={0.6} metalness={0.1} />
      </Sphere>
      
      {/* Land Sphere - Hampton #E2D8A5 (Grayish/Beige) */}
      <Sphere args={[2.01, 64, 64]}>
        <meshStandardMaterial 
          map={texError ? null : landTexture} 
          transparent 
          opacity={0.9} 
          color="#E2D8A5" 
          metalness={0.1} 
          roughness={0.9} 
          emissive="#2A3C42"
        />
      </Sphere>
      
      {/* Atmosphere Glow - Sea Nymph #6F9F9C */}
      <Sphere args={[2.02, 64, 64]}>
         <meshPhongMaterial
            color="#6F9F9C"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
         />
      </Sphere>
    </>
  );
}

const LoadingIndicator = () => (
  <Html center>
    <div className="flex flex-col items-center gap-4 min-w-[200px]">
      <div className="w-12 h-12 border-4 border-[#E1A36F] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#2A3C42] text-[10px] font-black uppercase tracking-[0.3em]">Neural_Syncing...</p>
    </div>
  </Html>
);

const GlobeView: React.FC<GlobeViewProps> = ({ hackathons, onSelect }) => {
  const [cameraDist, setCameraDist] = useState(5.5);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const visibleNodes = useMemo(() => 
    ZoomVisibilityManager.getVisibleHackathons(hackathons, cameraDist), 
    [hackathons, cameraDist]
  );

  const handleMarkerSelect = useCallback((h: Hackathon) => {
    setSelectedId(h.id);
    onSelect(h);
    setAutoRotate(false);
  }, [onSelect]);

  return (
    <div className="w-full h-full relative bg-[#F4F1E4] overflow-hidden rounded-[1.8rem]">
      <div className="absolute top-8 left-8 z-10 p-6 bg-[#2A3C42]/95 backdrop-blur-xl rounded-2xl border border-[#DEC484]/30 pointer-events-none shadow-3d">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#E1A36F] animate-ping"></div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Global_Scout</h3>
        </div>
        <p className="text-[10px] font-mono text-[#E2D8A5] uppercase mt-1">Camera_Z: {cameraDist.toFixed(2)}</p>
      </div>

      <TelemetryHUD total={hackathons.length} visible={visibleNodes.length} dist={cameraDist} />

      <div className="absolute bottom-8 left-8 z-20 flex gap-3">
        <button onClick={() => setAutoRotate(!autoRotate)} className="px-5 py-2.5 bg-[#2A3C42]/95 border border-[#DEC484]/40 rounded-xl text-white text-[10px] font-black uppercase hover:border-[#E1A36F] transition-all shadow-xl backdrop-blur-md pointer-events-auto">
          {autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={<LoadingIndicator />}>
          <ambientLight intensity={1.5} color="#ffffff" />
          <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={1.0} color="#6F9F9C" />
          
          <group rotation={[0, -Math.PI / 2, 0]}>
            <GlobeWithTexture />
            <GeoJsonBorders />
            <GoogleStyleCountryLabels cameraDistance={cameraDist} />
            <InstancedMarkers hackathons={visibleNodes} onSelect={handleMarkerSelect} cameraDist={cameraDist} selectedId={selectedId} />
          </group>

          <OrbitControls 
            enablePan={false} 
            minDistance={2.5} 
            maxDistance={10} 
            autoRotate={autoRotate} 
            autoRotateSpeed={0.5}
            onChange={(e) => setCameraDist((e?.target as any)?.object?.position.length() || 5.5)}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlobeView;