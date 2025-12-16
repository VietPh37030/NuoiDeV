import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text3D, Center } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

interface DevCharacterProps {
    mood: 'dying' | 'hungry' | 'neutral' | 'happy'
}

function DevModel({ mood }: DevCharacterProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Colors based on mood
    const moodColors = {
        dying: '#EF4444',
        hungry: '#F59E0B',
        neutral: '#3B82F6',
        happy: '#10B981'
    }

    const moodEmojis = {
        dying: '😭',
        hungry: '😐',
        neutral: '😊',
        happy: '🎉'
    }

    // Bounce animation speed based on mood
    const floatSpeed = mood === 'happy' ? 2 : mood === 'neutral' ? 1.5 : 1
    const floatIntensity = mood === 'happy' ? 2 : mood === 'neutral' ? 1 : 0.5

    return (
        <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={floatIntensity}>
            <group>
                {/* Body */}
                <mesh ref={meshRef} position={[0, 0, 0]}>
                    <capsuleGeometry args={[0.5, 1, 4, 16]} />
                    <meshStandardMaterial
                        color={moodColors[mood]}
                        emissive={moodColors[mood]}
                        emissiveIntensity={0.2}
                    />
                </mesh>

                {/* Head */}
                <mesh position={[0, 1.2, 0]}>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial
                        color="#FFE4C4"
                    />
                </mesh>

                {/* Eyes */}
                <mesh position={[-0.12, 1.25, 0.35]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color={mood === 'dying' ? '#666' : '#333'} />
                </mesh>
                <mesh position={[0.12, 1.25, 0.35]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial color={mood === 'dying' ? '#666' : '#333'} />
                </mesh>

                {/* Laptop */}
                <mesh position={[0, -0.2, 0.6]} rotation={[-0.3, 0, 0]}>
                    <boxGeometry args={[0.6, 0.02, 0.4]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[0, 0.1, 0.8]} rotation={[0.8, 0, 0]}>
                    <boxGeometry args={[0.6, 0.4, 0.02]} />
                    <meshStandardMaterial color="#333" emissive="#8B5CF6" emissiveIntensity={0.3} />
                </mesh>

                {/* Arms */}
                <mesh position={[-0.6, 0, 0.3]} rotation={[0, 0, 0.5]}>
                    <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
                    <meshStandardMaterial color={moodColors[mood]} />
                </mesh>
                <mesh position={[0.6, 0, 0.3]} rotation={[0, 0, -0.5]}>
                    <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
                    <meshStandardMaterial color={moodColors[mood]} />
                </mesh>

                {/* Mood indicator ring */}
                <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1, 0.05, 8, 32]} />
                    <meshStandardMaterial
                        color={moodColors[mood]}
                        emissive={moodColors[mood]}
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </group>
        </Float>
    )
}

function Scene({ mood }: DevCharacterProps) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8B5CF6" />
            <DevModel mood={mood} />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
            />
        </>
    )
}

export default function DevCharacter({ mood }: DevCharacterProps) {
    return (
        <div className="w-full h-[400px] relative">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <Scene mood={mood} />
            </Canvas>

            {/* Mood indicator overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full">
                <span className={`text-lg font-semibold status-${mood}`}>
                    {mood === 'dying' && '😭 Đang chết đói!'}
                    {mood === 'hungry' && '😐 Hơi đói...'}
                    {mood === 'neutral' && '😊 Đang ổn!'}
                    {mood === 'happy' && '🎉 Vui lắm!'}
                </span>
            </div>
        </div>
    )
}
