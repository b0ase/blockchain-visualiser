
'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

function MiningPoolPieChart() {
  const chartRef = useRef<THREE.Group>(null!)

  // BTC Mining Pool data - BREAKING DOWN THE MISLEADING 'OTHERS' CATEGORY
  const miningPools = [
    { name: 'AntPool', percentage: 18.5, color: '#FF0000' },        // Bright Red
    { name: 'Poolin', percentage: 15.2, color: '#00FF00' },         // Bright Green
    { name: 'BTC.com', percentage: 12.8, color: '#0000FF' },        // Bright Blue
    { name: 'F2Pool', percentage: 10.3, color: '#FFFF00' },         // Bright Yellow
    { name: 'Binance', percentage: 8.9, color: '#FF00FF' },         // Bright Magenta
    { name: 'Foundry USA', percentage: 6.0, color: '#FFA500' },     // Orange
    { name: 'ViaBTC', percentage: 4.5, color: '#800080' },          // Purple
    { name: 'Braiins', percentage: 3.5, color: '#008080' },         // Teal
    { name: 'Luxor', percentage: 2.8, color: '#FFC0CB' },           // Pink
    { name: 'SBI Crypto', percentage: 2.2, color: '#A52A2A' },      // Brown
    { name: 'BitFury', percentage: 2.5, color: '#FF6347' },         // Tomato Red
    { name: 'Kano CKPool', percentage: 2.0, color: '#32CD32' },     // Lime Green
    { name: 'SpiderPool', percentage: 1.8, color: '#8A2BE2' },      // Blue Violet
    { name: 'Huobi Pool', percentage: 1.5, color: '#FFD700' },      // Gold
    { name: 'OKEx Pool', percentage: 1.3, color: '#DC143C' },       // Crimson
    { name: 'BTC.TOP', percentage: 1.2, color: '#00CED1' },         // Dark Turquoise
    { name: '58COIN', percentage: 1.0, color: '#FF69B4' },          // Hot Pink
    { name: 'YourPool', percentage: 0.8, color: '#CD5C5C' },        // Indian Red
    { name: 'BitClub', percentage: 0.7, color: '#F0E68C' },         // Khaki
    { name: 'BTCC', percentage: 0.6, color: '#98FB98' },            // Pale Green
    { name: 'HashNest', percentage: 0.5, color: '#DDA0DD' },        // Plum
    { name: 'Tiny Pools', percentage: 1.4, color: '#D3D3D3' }       // Light Gray (remaining small pools)
  ]

  useFrame((state) => {
    if (chartRef.current) {
      // Simple rotation only - no dynamic scaling
      chartRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  // Create perpendicular line from pie chart center
  const linePoints = [
    new THREE.Vector3(0, 0, 0),     // Pie chart center
    new THREE.Vector3(0, 0, 10)     // Straight up in Z direction
  ]

  return (
    <group>
      <group ref={chartRef} position={[0, -25, 0]}>
        {/* Pie chart base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[8, 8, 0.2, 64]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Generate pie slices */}
        {miningPools.map((pool, index) => {
          const startAngle = miningPools.slice(0, index).reduce((sum, p) => sum + p.percentage, 0) / 100 * Math.PI * 2
          const angle = (pool.percentage / 100) * Math.PI * 2

          return (
            <mesh key={pool.name} position={[0, 0.1, 0]}>
              <cylinderGeometry args={[7, 7, 0.1, 32, 1, false, startAngle, angle]} />
              <meshStandardMaterial color={pool.color} />
            </mesh>
          )
        })}

        {/* Labels */}
        {miningPools.map((pool, index) => {
          const angle = ((pool.percentage / 2) + miningPools.slice(0, index).reduce((sum, p) => sum + p.percentage, 0)) / 100 * Math.PI * 2
          const radius = 10
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius

          return (
            <Text
              key={`label-${pool.name}`}
              position={[x, 0.5, z]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {`${pool.name}\n${pool.percentage}%`}
            </Text>
          )
        })}

        {/* Title - moved to background */}
        <group position={[0, 3, -1]}>
          <Text
            fontSize={0.3}
            color="#666666"
            anchorX="center"
            anchorY="middle"
          >
            BTC Mining Pools
          </Text>
        </group>

        {/* Subtitle with total - moved to background */}
        <group position={[0, 2, -1]}>
          <Text
            fontSize={0.2}
            color="#555555"
            anchorX="center"
            anchorY="middle"
          >
            Global Hash Rate Distribution
          </Text>
        </group>

        {/* SPIRAL OF MINING POOL BALLS - Sort by size for positioning */}
        {(() => {
          // Create sorted copy to avoid modifying original array
          const poolsBySize = [...miningPools].sort((a, b) => a.percentage - b.percentage);

          return poolsBySize.map((pool, sortedIndex) => {
            // Scale ball size proportionally to pie slice percentages - MAXIMUM DRAMATIC
            const minSize = 0.1; // Really small minimum ball size
            const maxSize = 3.0; // Reasonable maximum ball size

            // SIMPLE EXACT SCALING: AntPool exactly 18x larger than Tiny Pools
            let ballSize;
            if (pool.percentage === 18.5) {
              // AntPool: maximum size
              ballSize = maxSize;
            } else if (pool.percentage === 1.4) {
              // Tiny Pools: exactly 18x smaller than AntPool
              ballSize = maxSize / 18.0; // 3.0 / 18 = 0.167
            } else {
              // Linear interpolation between AntPool (18.5%) and Tiny Pools (1.4%) extremes
              const antPoolPercent = 18.5;
              const tinyPoolsPercent = 1.4;
              const antPoolSize = maxSize;
              const tinyPoolsSize = maxSize / 18.0;

              // Calculate position between the two extremes
              const ratio = (pool.percentage - tinyPoolsPercent) / (antPoolPercent - tinyPoolsPercent);
              ballSize = tinyPoolsSize + ratio * (antPoolSize - tinyPoolsSize);
              ballSize = Math.max(minSize, Math.min(maxSize, ballSize)); // Clamp
            }

            // SPIRAL POSITIONING: Use sorted index directly
            const poolIndex = sortedIndex;

          // Create spiral path from pie chart (Y=0) up to blockchain blocks (Y~40 - halved height)
          const totalPools = miningPools.length;
          const spiralRadius = 12; // Distance from center axis
          const spiralHeight = 40; // Total height of spiral (halved - ends at ~1GB block)
          const startHeight = 2; // Start just above pie chart

          // Calculate position along spiral (from bottom to top)
          const progress = poolIndex / (totalPools - 1); // 0 to 1
          const angle = progress * Math.PI * 4; // 4 full rotations
          const spiralY = startHeight + progress * (spiralHeight - startHeight);

          // Spiral position around Y-axis
          const x = Math.cos(angle) * spiralRadius;
          const z = Math.sin(angle) * spiralRadius;

          // Final positioning with ball size scaling
          const finalHeight = 8 + (ballSize * 0.5); // Scale height with ball size

          return (
            <group key={`miner-${pool.name}-${sortedIndex}`} position={[x, spiralY, z]}>
              {/* Mining pool ball - sized by pool percentage */}
              <mesh>
                <sphereGeometry args={[ballSize, 16, 16]} />
                <meshStandardMaterial
                  color={pool.color}
                  emissive={pool.color}
                  emissiveIntensity={0.15 + (ballSize / maxSize) * 0.35} // More emissive for larger balls
                  metalness={0.3}
                  roughness={0.2}
                />
              </mesh>

              {/* Glow effect scaled to ball size */}
              <mesh>
                <sphereGeometry args={[ballSize * 1.3, 16, 16]} />
                <meshBasicMaterial
                  color={pool.color}
                  transparent
                  opacity={0.06 + (ballSize / maxSize) * 0.12} // More glow for larger balls
                />
              </mesh>

              {/* Pool name label */}
              <Text
                position={[0, ballSize + 1.0, 0]}
                fontSize={0.25 + (ballSize / maxSize) * 0.15} // Larger text for bigger balls
                color={pool.color}
                anchorX="center"
                anchorY="middle"
              >
                {pool.name}
              </Text>

              {/* Percentage label */}
              <Text
                position={[0, ballSize + 0.4, 0]}
                fontSize={0.18 + (ballSize / maxSize) * 0.12} // Larger text for bigger balls
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {pool.percentage}%
              </Text>
            </group>
          );
        });
        })()}
      </group>

      {/* ONE CHAIN of blocks - getting bigger every 10 minutes! */}
      {(() => {
        const blocks = [];
        const totalBlocks = 100; // Just show 100 blocks in the chain

        for (let i = 0; i < totalBlocks; i++) {
          const progress = i / (totalBlocks - 1);
          const blockNumber = i + 1;
          const size = 1 + (i * 1999 / 99); // Linear progression: 1MB to 2000MB (2GB)

          // ULTRA DRAMATIC scaling - each block gets MASSIVELY bigger!
          const visualScale = Math.pow(progress + 0.01, 2) * 2; // Quadratic growth
          const clampedScale = Math.max(0.1, Math.min(5.0, visualScale));

          // Calculate position with small gaps and first block above pie chart at bottom
          const gap = 0.2; // Small gap between blocks
          let y = -23; // Start just above pie chart (which is at Y=-25)

          for (let j = 0; j < i; j++) {
            const prevProgress = j / (totalBlocks - 1);
            const prevScale = Math.pow(prevProgress + 0.01, 2) * 2;
            const prevClampedScale = Math.max(0.1, Math.min(5.0, prevScale));
            y += prevClampedScale + gap; // Add height + small gap for each previous block
          }

          // Add pulsing for the biggest blocks
          const isBigBlock = clampedScale > 2.5;

            blocks.push(
              <group key={`block-${i}`} position={[0, y, 0]}>
              {/* Main block */}
              <mesh>
                <boxGeometry args={[clampedScale, clampedScale, clampedScale]} />
                <meshStandardMaterial
                  color={`hsl(${240 + (progress * 120)}, 90%, 60%)`}
                  emissive={`hsl(${240 + (progress * 120)}, 80%, 40%)`}
                  emissiveIntensity={0.3 + progress * 0.7}
                  metalness={0.4}
                  roughness={0.1}
                />
              </mesh>

              {/* Pulsing glow for massive blocks */}
              {isBigBlock && (
                <mesh>
                  <boxGeometry args={[clampedScale * 1.3, clampedScale * 1.3, clampedScale * 1.3]} />
                  <meshBasicMaterial
                    color={`hsl(${240 + (progress * 120)}, 100%, 90%)`}
                    transparent
                    opacity={0.15}
                  />
                </mesh>
              )}

              {/* Size label - moved to right side */}
              <Text
                position={[clampedScale + 0.8, 0, 0]}
                fontSize={0.25}
                color="#00ff88"
                anchorX="left"
                anchorY="middle"
              >
                {i === 0 ? '1MB' : size < 1000 ? `${Math.round(size)}MB` : `${(size/1000).toFixed(1)}GB`}
              </Text>
            </group>
          );
        }

        return blocks;
      })()}

      {/* Timeline that follows the actual block positions with gaps */}
      {(() => {
        const timelinePoints = [0, -23, 0]; // Start above pie chart at bottom
        const gap = 0.2;
        let currentY = -23; // Start from first block position

        for (let i = 1; i <= 50; i++) { // Sample points for smooth line
          const progress = i / 50;
          const scale = Math.pow(progress + 0.01, 2) * 2;
          const clampedScale = Math.max(0.1, Math.min(5.0, scale));
          currentY += (clampedScale + gap) / 50; // Include gap in smooth interpolation
          timelinePoints.push(0, currentY, 0);
        }

        return (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(timelinePoints), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ff88" linewidth={4} />
          </line>
        );
      })()}

      {/* Final massive block marker */}
      {(() => {
        const gap = 0.2;
        let totalHeight = -23; // Start from first block position
        for (let i = 0; i < 100; i++) {
          const progress = i / 99;
          const scale = Math.pow(progress + 0.01, 2) * 2;
          const clampedScale = Math.max(0.1, Math.min(5.0, scale));
          if (i < 99) { // Don't add gap after the last block
            totalHeight += clampedScale + gap;
          } else {
            totalHeight += clampedScale;
          }
        }

        return (
          <Text
            position={[0, totalHeight + 3, 0]}
            fontSize={1.5}
            color="#ff4444"
            anchorX="center"
            anchorY="middle"
          >
            FINAL BLOCK • 2GB
          </Text>
        );
      })()}
    </group>
  )
}

export default function BlockchainVisualizer() {
  const [spacePressed, setSpacePressed] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false);
      }
    };

    // Add listeners to document instead of window for better canvas compatibility
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-screen relative" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)' }}>
      <Canvas
        camera={{ position: [0, 35, 50], fov: 55 }}
        onCreated={({ gl }) => {
          // Ensure canvas doesn't capture keyboard events
          gl.domElement.tabIndex = -1;
        }}
      >
        <MiningPoolPieChart />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          enablePan={spacePressed}
          enableRotate={!spacePressed}
          enableZoom={true}
          target={[0, -17, 0]} // Focus zoom on mining pool balls area
          minDistance={5}     // Minimum zoom distance
          maxDistance={200}   // Maximum zoom distance
          maxPolarAngle={Math.PI / 2} // Prevent going below ground
        />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={0.3} />
      </Canvas>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-4 rounded-lg text-[#00ff88] font-mono text-sm border border-[#00ff88]/20">
        <h3 className="text-lg font-bold mb-2">📊 BTC Mining Pools</h3>
        <p>6 Major Pools</p>
        <p className="text-yellow-400 font-bold">⛓️ BLOCKCHAIN ABOVE PIE CHART</p>
        <p className="text-xs mt-1">Pie chart below the chain!</p>
        <div className="text-xs mt-2 space-y-1">
          <p>📊 100 blocks with small gaps</p>
          <p>🎯 Block #1 (1MB) above pie chart</p>
          <p>⏰ Every 10 minutes: +1 block</p>
          <p>📈 Size: 1MB → 40MB → 80MB → ... → 2GB</p>
          <p>💎 Quadratic growth scaling</p>
          <p>✨ Pulsing glow on big blocks</p>
          <p>🏮 Floating colored mining balls</p>
          <p className="text-cyan-400">🔍 Fixed pie chart size</p>
          <p className="text-yellow-400">⚡ Normal zoom controls</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-lg text-[#00ff88] font-mono text-sm border border-[#00ff88]/20">
        <p>Mouse: Orbit around pie chart</p>
        <p>Space + Mouse: Pan/Drag</p>
        <p>Scroll: Zoom to pie chart center</p>
        <p className="text-xs mt-1 opacity-75">🎯 Zoom focuses on pie chart</p>
      </div>
    </div>
  )

}
