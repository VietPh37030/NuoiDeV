import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

type EmotionType = 'happy' | 'neutral' | 'hungry' | 'excited' | 'dying'

interface IanAvatarModelProps {
    emotion: EmotionType
    isTalking: boolean
}

function IanAvatarModel({ emotion, isTalking }: IanAvatarModelProps) {
    const group = useRef<THREE.Group>(null)
    const { scene } = useGLTF('/models/ian.glb')
    const [morphMesh, setMorphMesh] = useState<THREE.SkinnedMesh | null>(null)

    // Find mesh with morph targets for facial expressions
    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
                setMorphMesh(child)
            }
        })
    }, [scene])

    // Animate based on emotion
    useFrame((state) => {
        if (!group.current) return

        const time = state.clock.elapsedTime

        // Different animations based on emotion
        switch (emotion) {
            case 'happy':
            case 'excited':
                // Bouncy happy movement
                group.current.position.y = -0.4 + Math.sin(time * 3) * 0.03
                group.current.rotation.y = Math.sin(time * 2) * 0.15
                group.current.rotation.z = Math.sin(time * 4) * 0.02
                break

            case 'hungry':
                // Slow tired movement
                group.current.position.y = -0.4 + Math.sin(time * 0.8) * 0.02
                group.current.rotation.y = Math.sin(time * 0.5) * 0.05
                group.current.rotation.z = Math.sin(time * 0.3) * 0.03
                group.current.rotation.x = 0.05 // Slight forward lean
                break

            case 'dying':
                // Very slow, droopy
                group.current.position.y = -0.45 + Math.sin(time * 0.5) * 0.01
                group.current.rotation.y = Math.sin(time * 0.3) * 0.02
                group.current.rotation.x = 0.1 // Forward lean
                group.current.rotation.z = Math.sin(time * 0.2) * 0.02
                break

            case 'neutral':
            default:
                // Gentle breathing idle
                group.current.position.y = -0.4 + Math.sin(time * 1.2) * 0.015
                group.current.rotation.y = Math.sin(time * 0.8) * 0.05
                group.current.rotation.z = 0
                group.current.rotation.x = 0
                break
        }

        // Talking animation - add mouth movement when talking
        if (isTalking && morphMesh && morphMesh.morphTargetInfluences && morphMesh.morphTargetDictionary) {
            const jawIndex = morphMesh.morphTargetDictionary['jawOpen'] ?? morphMesh.morphTargetDictionary['mouthOpen']
            if (jawIndex !== undefined) {
                morphMesh.morphTargetInfluences[jawIndex] = 0.2 + Math.sin(time * 15) * 0.15
            }
        }

        // Morph targets for expressions
        if (morphMesh && morphMesh.morphTargetInfluences && morphMesh.morphTargetDictionary) {
            const dict = morphMesh.morphTargetDictionary
            const influences = morphMesh.morphTargetInfluences

            const smileIndex = dict['mouthSmile'] ?? dict['mouthSmileLeft']
            const sadIndex = dict['mouthFrownLeft'] ?? dict['mouthSadLeft']
            const browIndex = dict['browInnerUp']

            // Reset all
            if (smileIndex !== undefined) influences[smileIndex] *= 0.9
            if (sadIndex !== undefined) influences[sadIndex] *= 0.9
            if (browIndex !== undefined) influences[browIndex] *= 0.9

            // Apply based on emotion
            switch (emotion) {
                case 'happy':
                case 'excited':
                    if (smileIndex !== undefined) influences[smileIndex] = 0.8
                    if (browIndex !== undefined) influences[browIndex] = 0.3
                    break
                case 'hungry':
                case 'dying':
                    if (sadIndex !== undefined) influences[sadIndex] = 0.6
                    break
            }
        }
    })

    return (
        <group ref={group} position={[0, -0.4, 0]} scale={0.95}>
            <primitive object={scene} />
        </group>
    )
}

interface IanAvatarProps {
    emotion?: EmotionType
    dialogue?: string
    isTalking?: boolean
    onDialogueEnd?: () => void
}

export default function IanAvatar({
    emotion = 'neutral',
    dialogue,
    isTalking = false,
    onDialogueEnd
}: IanAvatarProps) {
    const [displayText, setDisplayText] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    // Typewriter effect for dialogue
    useEffect(() => {
        if (!dialogue) {
            setDisplayText('')
            setIsTyping(false)
            return
        }

        setIsTyping(true)
        setDisplayText('')
        let index = 0

        const interval = setInterval(() => {
            if (index < dialogue.length) {
                setDisplayText(dialogue.slice(0, index + 1))
                index++
            } else {
                clearInterval(interval)
                setIsTyping(false)
                setTimeout(() => {
                    onDialogueEnd?.()
                }, 2000)
            }
        }, 40)

        return () => clearInterval(interval)
    }, [dialogue, onDialogueEnd])

    // Map emotion to glow color
    const emotionColors: Record<EmotionType, string> = {
        happy: 'rgba(16, 185, 129, 0.4)',
        excited: 'rgba(6, 182, 212, 0.5)',
        neutral: 'rgba(16, 185, 129, 0.2)',
        hungry: 'rgba(245, 158, 11, 0.4)',
        dying: 'rgba(239, 68, 68, 0.5)',
    }

    const emotionLabels: Record<EmotionType, string> = {
        happy: '😊 Vui vẻ',
        excited: '🎉 Hào hứng',
        neutral: '😐 Bình thường',
        hungry: '😢 Đói bụng',
        dying: '💀 Sắp chết',
    }

    return (
        <div className="relative w-full h-[700px]">
            {/* 3D Canvas */}
            <div
                className="w-full h-full rounded-3xl overflow-hidden"
                style={{
                    boxShadow: `0 0 60px ${emotionColors[emotion]}`,
                    background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(10, 15, 13, 0.8) 100%)'
                }}
            >
                <Canvas camera={{ position: [0, 0.5, 2.8], fov: 38 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[5, 5, 5]} intensity={1.2} />
                    <pointLight position={[-5, 3, 5]} intensity={0.7} color="#10B981" />
                    <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
                    <Environment preset="apartment" />
                    <IanAvatarModel emotion={emotion} isTalking={isTyping} />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        target={[0, 0.5, 0]}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 1.8}
                        maxAzimuthAngle={Math.PI / 3}
                        minAzimuthAngle={-Math.PI / 3}
                    />
                </Canvas>
            </div>

            {/* Dialogue bubble */}
            <AnimatePresence>
                {displayText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md"
                    >
                        <div className="glass-strong rounded-2xl p-4 text-center">
                            <p className="text-lg">
                                {displayText}
                                {isTyping && <span className="animate-pulse">|</span>}
                            </p>
                        </div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 glass-strong" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emotion indicator */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border border-white/20 bg-black/40 backdrop-blur-sm`}>
                {emotionLabels[emotion]}
            </div>
        </div>
    )
}

// Preload model
useGLTF.preload('/models/ian.glb')
