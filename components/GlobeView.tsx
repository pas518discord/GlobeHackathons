import React, { useMemo, useRef, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Hackathon } from '../types';

interface GlobeViewProps {
  hackathons: Hackathon[];
  onSelect: (h: Hackathon) => void;
}

// Strategic labels for global orientation, mirroring clean mapping platforms
const COUNTRY_LABELS = [
  { name: 'United States', lat: 37.0902, lng: -95.7129 },
  { name: 'Canada', lat: 56.1304, lng: -106.3468 },
  { name: 'Brazil', lat: -14.2350, lng: -51.9253 },
  { name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
  { name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { name: 'France', lat: 46.2276, lng: 2.2137 },
  { name: 'India', lat: 20.5937, lng: 78.9629 },
  { name: 'China', lat: 35.8617, lng: 104.1954 },
  { name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { name: 'Australia', lat: -25.2744, lng: 133.7751 },
  { name: 'Russia', lat: 61.5240, lng: 105.3188 },
  { name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  { name: 'Mexico', lat: 23.6345, lng: -102.5528 },
  { name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  { name: 'Nigeria', lat: 9.0820, lng: 8.6753 },
  { name: 'Turkey', lat: 38.9637, lng: 35.2433 },
  { name: 'Spain', lat: 40.4637, lng: -3.7492 },
  { name: 'Italy', lat: 41.8719, lng: 12.5674 },
  { name: 'Norway', lat: 60.4720, lng: 8.4689 },
  { name: 'Indonesia', lat: -0.7893, lng: 113.9213 },
  { name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

const latLngToVector3 = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const ProximityManager = ({ children }: { children?: React.ReactNode }) => {
  const { camera } = useThree();
  const [zoom, setZoom] = useState(5.5);

  useFrame(() => {
    const dist = camera.position.length();
    if (Math.abs(dist - zoom) > 0.05) {
      setZoom(dist);
    }
  });

  return (
    <group>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { cameraDist: zoom });
        }
        return child;
      })}
    </group>
  );
};

const CountryLabel: React.FC<{ name: string; lat: number; lng: number; cameraDist?: number }> = ({ name, lat, lng, cameraDist = 5.5 }) => {
  const pos = useMemo(() => latLngToVector3(lat, lng, 2.01), [lat, lng]);
  
  const isVisible = cameraDist < 7.5;
  const opacity = Math.min(0.8, Math.max(0, (7.5 - cameraDist) / 2));

  if (!isVisible) return null;

  return (
    <Html
      position={pos}
      center
      distanceFactor={6}
      occlude
      className="pointer-events-none select-none transition-opacity duration-700"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center">
        <div className="w-1 h-1 bg-slate-400/50 rounded-full mb-1"></div>
        <div className="text-[7px] font-black text-slate-600 whitespace-nowrap uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-[2px] shadow-sm">
          {name}
        </div>
      </div>
    </Html>
  );
};

const HackathonMarker: React.FC<{ h: Hackathon; onClick: () => void; cameraDist?: number }> = ({ h, onClick, cameraDist = 5.5 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => {
    if (!h.coordinates) return new THREE.Vector3(0, 0, 0);
    return latLngToVector3(h.coordinates.lat, h.coordinates.lng, 2.03);
  }, [h.coordinates]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      const s = 1 + Math.sin(time * 5) * 0.2;
      meshRef.current.scale.set(s, s, s);
    }
    if (ringRef.current) {
      const s = 1 + (time % 1) * 2;
      ringRef.current.scale.set(s, s, s);
      const ringMat = ringRef.current.material as THREE.MeshBasicMaterial;
      ringMat.opacity = Math.max(0, 0.4 * (1 - (time % 1)));
    }
  });

  if (!h.coordinates) return null;

  const isDiscovered = cameraDist < 7;
  const opacity = Math.min(1, Math.max(0, (6.8 - cameraDist) / 1.5));

  if (!isDiscovered) return null;

  return (
    <group position={position}>
      <mesh 
        ref={meshRef} 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial 
          color={h.locationType === 'Online' ? '#3b82f6' : '#ef4444'} 
          transparent
          opacity={opacity}
        />
      </mesh>
      
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.08, 32]} />
        <meshBasicMaterial 
          color={h.locationType === 'Online' ? '#3b82f6' : '#ef4444'} 
          transparent 
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {cameraDist < 3.8 && (
         <Html position={[0, 0.12, 0]} center distanceFactor={10} occlude>
           <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded border border-slate-200 whitespace-nowrap shadow-xl scale-75 origin-bottom">
             <span className="text-[7px] font-black text-slate-800 uppercase tracking-tighter italic block">{h.name}</span>
             <span className="text-[5px] font-bold text-slate-500 uppercase block">{h.location}</span>
           </div>
         </Html>
      )}
    </group>
  );
};

const Globe = () => {
  // Use professional textures
  const landTexture = useTexture('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
  const topologyTexture = useTexture('https://unpkg.com/three-globe/example/img/earth-topology.png');
  
  return (
    <group>
      {/* Ocean Core: Clean white/light-blue base like mappicker */}
      <Sphere args={[2, 128, 128]}>
        <meshStandardMaterial 
          color="#f1f5f9" 
          roughness={0.9} 
          metalness={0.1}
        />
      </Sphere>

      {/* Landmass Layer: Light gray land with subtle borders */}
      <Sphere args={[2.005, 128, 128]}>
        <meshStandardMaterial 
          transparent
          alphaMap={landTexture} // Uses the brightness of this texture to mask the sphere
          color="#e2e8f0" // Mappicker's light gray land
          bumpMap={topologyTexture}
          bumpScale={0.02}
          roughness={0.6}
          metalness={0.2}
        />
      </Sphere>

      {/* Subtle Grid Overlay: Extremely faint as in pro maps */}
      <Sphere args={[2.01, 64, 32]}>
        <meshBasicMaterial 
          color="#cbd5e1" 
          wireframe 
          transparent 
          opacity={0.08} 
        />
      </Sphere>
      
      {/* Soft Rim Highlight */}
      <Sphere args={[2.02, 64, 64]}>
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Atmosphere Glow: Soft and clean white/blue */}
      <Sphere args={[2.1, 64, 64]}>
        <meshBasicMaterial 
          color="#f8fafc" 
          transparent 
          opacity={0.04} 
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};

const GlobeView: React.FC<GlobeViewProps> = ({ hackathons, onSelect }) => {
  return (
    <div className="w-full h-full min-h-[500px] bg-[#f8fafc] rounded-3xl border border-slate-200 relative overflow-hidden group/view shadow-inner">
      {/* Clean HUD Elements */}
      <div className="absolute top-8 left-8 z-10 space-y-1 bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 shadow-sm pointer-events-none border-l-4 border-l-blue-500">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Map_Interface_v3</h3>
        <p className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Global_Hack_Registry</p>
        <div className="flex items-center gap-2 mt-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
           <span className="text-[8px] font-bold text-slate-500 uppercase mono tracking-widest">Live_Geodata_Feed</span>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 z-10 p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-slate-200 pointer-events-none">
        <div className="flex items-center gap-4 text-[9px] mono font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Virtual
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div> Onsite
          </div>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-10 text-right bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 pointer-events-none">
        <div className="text-[9px] text-slate-400 mono mb-1 uppercase font-black tracking-[0.2em]">Nodes_Detected</div>
        <div className="text-4xl font-black italic text-slate-900 leading-none">{hackathons.length}</div>
      </div>

      <Canvas camera={{ position: [0, 0, 5.5], fov: 40 }}>
        <Suspense fallback={<Html center className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-[10px] mono">Initializing_Atlas...</Html>}>
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <pointLight position={[-10, -5, -10]} intensity={1} color="#e2e8f0" />
          
          <Globe />
          
          <ProximityManager>
            {COUNTRY_LABELS.map((country) => (
              <CountryLabel key={country.name} {...country} />
            ))}
            {hackathons.map((h) => (
              <HackathonMarker key={h.id} h={h} onClick={() => onSelect(h)} />
            ))}
          </ProximityManager>
          
          <OrbitControls 
            enablePan={false} 
            minDistance={2.4} 
            maxDistance={8} 
            autoRotate 
            autoRotateSpeed={0.3}
            dampingFactor={0.06}
            rotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
      
      {/* Clean Overlays */}
      <div className="absolute inset-0 pointer-events-none border border-slate-200 rounded-3xl overflow-hidden pointer-events-none">
        {/* Soft radial vignette for depth on light theme */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(241,245,249,0.5)_100%)]"></div>
        {/* Interaction Hint */}
        <div className="absolute bottom-8 right-8 mono text-[7px] text-slate-400 uppercase font-black tracking-widest bg-white/40 px-4 py-2 rounded-full border border-slate-200 transition-opacity duration-500 group-hover/view:opacity-100 opacity-0">
          Scroll_To_Explore
        </div>
      </div>
    </div>
  );
};

export default GlobeView;