import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDevStatus } from '@/hooks/useDevStatus'
import { useAuth } from '@/hooks/useAuth'
import { useRecentDonations } from '@/hooks/useRecentDonations'
import { useInventory } from '@/hooks/useInventory'
import IanAvatar from '@/components/IanAvatar'
import TransactionHistory from '@/components/TransactionHistory'
import DonateModal from '@/components/DonateModal'
import { getMoodMessage, formatCoin, getDevMood, ITEMS } from '@/lib/utils'
import { getQuickResponse, generateIanResponse } from '@/lib/gemini'
import { speak, stopSpeaking } from '@/lib/speech'
import { Heart, Users, Coins, TrendingUp, Sparkles, ArrowRight, Send, Gift, Package, Volume2, VolumeX } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
    const { devStatus, loading } = useDevStatus()
    const { user, userData, signInWithGoogle } = useAuth()
    const { donations: recentDonations } = useRecentDonations(5)
    const { inventory, getItemQuantity } = useInventory()

    // Avatar state
    const [avatarEmotion, setAvatarEmotion] = useState<'happy' | 'neutral' | 'hungry' | 'excited' | 'dying'>('neutral')
    const [dialogue, setDialogue] = useState('')
    const [chatInput, setChatInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [showDonateModal, setShowDonateModal] = useState(false)
    const [voiceEnabled, setVoiceEnabled] = useState(true)

    // Set initial emotion based on dev status
    useEffect(() => {
        const mood = getDevMood(devStatus.totalCoins)
        setAvatarEmotion(mood)
    }, [devStatus.totalCoins])

    // Speak dialogue when it changes
    useEffect(() => {
        if (dialogue && voiceEnabled && !isThinking) {
            speak(dialogue)
        }
        return () => stopSpeaking()
    }, [dialogue, voiceEnabled, isThinking])

    // Greet user on login
    useEffect(() => {
        if (user && userData) {
            const greeting = getQuickResponse('login', userData.displayName || undefined)
            setDialogue(greeting.text)
            setAvatarEmotion(greeting.emotion)
        }
    }, [user, userData])

    // Handle chat with AI
    const handleChat = async () => {
        if (!chatInput.trim() || isThinking) return

        setIsThinking(true)
        stopSpeaking()
        setDialogue('🤔 Đang suy nghĩ...')

        try {
            const response = await generateIanResponse(chatInput, {
                userName: userData?.displayName || undefined,
                userCoins: userData?.coins,
                devMood: avatarEmotion,
            })

            setDialogue(response.text)
            setAvatarEmotion(response.emotion)
        } catch (error) {
            setDialogue('Ơ, dev bị lag rồi... thử lại nha! 🫠')
        } finally {
            setIsThinking(false)
            setChatInput('')
        }
    }

    const handleDialogueEnd = () => {
        setTimeout(() => {
            if (!isThinking) {
                setDialogue('')
            }
        }, 3000)
    }

    // Handle donation response
    const handleDonateResponse = (response: { text: string; emotion: 'happy' | 'neutral' | 'hungry' | 'excited' }) => {
        setDialogue(response.text)
        setAvatarEmotion(response.emotion)
    }

    // Count total items in inventory
    const totalInventoryItems = inventory.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <section className="relative text-center py-8 md:py-12">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        <span className="gradient-text">Nuôi Dev</span>
                        <br />
                        <span className="text-white">Sống Sót</span> 🎮
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
                        Ủng hộ <span className="text-primary font-semibold">Phạm Việt Anh (Ian Phạm)</span> bằng
                        những item vui nhộn. Chat với dev AI thông minh! 💪
                    </p>
                </motion.div>
            </section>

            {/* Ian Avatar Section */}
            <section className="mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <IanAvatar
                        emotion={avatarEmotion}
                        dialogue={dialogue}
                        isTalking={isThinking}
                        onDialogueEnd={handleDialogueEnd}
                    />

                    {/* Chat Input */}
                    <div className="mt-4 flex gap-2 max-w-md mx-auto">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                            placeholder="Nói gì với dev đi..."
                            className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 
                         focus:outline-none focus:border-primary transition-colors"
                            disabled={isThinking}
                        />
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`p-3 rounded-xl transition-colors ${voiceEnabled
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-surface text-gray-400'
                                }`}
                            title={voiceEnabled ? 'Tắt giọng nói' : 'Bật giọng nói'}
                        >
                            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            onClick={handleChat}
                            disabled={isThinking || !chatInput.trim()}
                            className="btn-primary px-4 flex items-center gap-2"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <button
                            onClick={() => {
                                const r = getQuickResponse('greeting', userData?.displayName || undefined)
                                setDialogue(r.text)
                                setAvatarEmotion(r.emotion)
                            }}
                            className="btn-secondary text-sm"
                        >
                            👋 Chào
                        </button>
                        {user && totalInventoryItems > 0 && (
                            <button
                                onClick={() => setShowDonateModal(true)}
                                className="btn-primary text-sm flex items-center gap-1"
                            >
                                <Gift size={16} />
                                Tặng quà ({totalInventoryItems})
                            </button>
                        )}
                        <Link to="/store" className="btn-secondary text-sm flex items-center gap-1">
                            <Sparkles size={16} />
                            Cửa hàng
                        </Link>
                        {!user && (
                            <button onClick={signInWithGoogle} className="btn-secondary text-sm">
                                🔐 Đăng nhập
                            </button>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Coins className="text-yellow-400" />}
                    value={formatCoin(devStatus.totalCoins)}
                    label="Tổng Coins nhận"
                    delay={0}
                />
                <StatCard
                    icon={<Heart className="text-red-400" />}
                    value={devStatus.totalDonations.toString()}
                    label="Lượt ủng hộ"
                    delay={0.1}
                />
                <StatCard
                    icon={<Users className="text-blue-400" />}
                    value="128"
                    label="Supporters"
                    delay={0.2}
                />
                <StatCard
                    icon={<TrendingUp className="text-green-400" />}
                    value={avatarEmotion === 'dying' ? 'Critical!' : 'Alive'}
                    label="Dev Status"
                    delay={0.3}
                />
            </section>

            {/* Transaction History & About */}
            <section className="grid md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <TransactionHistory donations={recentDonations} title="Ủng hộ gần đây" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-2xl p-6"
                >
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="text-red-400" />
                        Về dự án này
                    </h3>

                    <div className="space-y-4 text-gray-300">
                        <p>
                            🎮 <strong>NuoiDev</strong> là một dự án vui nhộn để các bạn có thể ủng hộ
                            dev bằng cách mua các item "nuôi sống" dev.
                        </p>

                        <p>
                            🤖 <strong>AI thông minh</strong> - Dev có thể chat với bạn nhờ Gemini AI!
                        </p>

                        <p>
                            💰 Mỗi <span className="text-yellow-400 font-semibold">1,000 VND</span> =
                            <span className="text-primary font-semibold"> 1 Coin</span>
                        </p>

                        <p>
                            📊 Mọi giao dịch đều minh bạch và hiển thị công khai.
                        </p>
                    </div>

                    <Link
                        to="/store"
                        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                    >
                        <Sparkles size={18} />
                        Ủng hộ ngay
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </section>

            {/* Donate Modal */}
            <DonateModal
                isOpen={showDonateModal}
                onClose={() => setShowDonateModal(false)}
                onDonate={handleDonateResponse}
            />
        </div>
    )
}

function StatCard({
    icon,
    value,
    label,
    delay
}: {
    icon: React.ReactNode
    value: string
    label: string
    delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass rounded-2xl p-4 text-center card-hover"
        >
            <div className="flex justify-center mb-2">
                {icon}
            </div>
            <p className="text-2xl font-bold gradient-text">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
        </motion.div>
    )
}
