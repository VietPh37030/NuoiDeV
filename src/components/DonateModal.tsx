import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Sparkles } from 'lucide-react'
import { ITEMS } from '@/lib/utils'
import { useInventory } from '@/hooks/useInventory'
import { useAuth } from '@/hooks/useAuth'
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getQuickResponse } from '@/lib/gemini'

interface DonateModalProps {
    isOpen: boolean
    onClose: () => void
    onDonate: (response: { text: string; emotion: 'happy' | 'neutral' | 'hungry' | 'excited' }) => void
}

export default function DonateModal({ isOpen, onClose, onDonate }: DonateModalProps) {
    const { user, userData } = useAuth()
    const { inventory, removeItem, getItemQuantity } = useInventory()
    const [donating, setDonating] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [successItem, setSuccessItem] = useState<typeof ITEMS[0] | null>(null)

    // Get items with quantity > 0
    const availableItems = ITEMS.filter(item => getItemQuantity(item.id) > 0)

    const handleDonate = async (item: typeof ITEMS[0]) => {
        if (!user || donating) return

        setDonating(item.id)

        try {
            // Remove from inventory
            const removed = await removeItem(item.id, 1)
            if (!removed) {
                alert('Không đủ item trong kho!')
                setDonating(null)
                return
            }

            // Record donation
            await addDoc(collection(db, 'itemDonations'), {
                userId: user.uid,
                userName: userData?.displayName || 'Ẩn danh',
                itemId: item.id,
                itemName: item.name,
                itemEmoji: item.emoji,
                coinAmount: item.price,
                createdAt: serverTimestamp()
            })

            // Update dev status
            const devStatusRef = doc(db, 'devStatus', 'current')
            await updateDoc(devStatusRef, {
                totalCoins: increment(item.price),
                totalDonations: increment(1),
                lastDonation: serverTimestamp()
            })

            // Get AI response based on item
            let response
            if (item.id === 'sextoy') {
                response = getQuickResponse('donate_sextoy', userData?.displayName || undefined)
            } else {
                response = getQuickResponse('donate', userData?.displayName || undefined)
            }

            setSuccessItem(item)
            setSuccess(true)
            onDonate(response)

            // Auto close after voice finishes (5s để đủ thời gian nói)
            setTimeout(() => {
                setSuccess(false)
                setSuccessItem(null)
                onClose()
            }, 5000)

        } catch (error) {
            console.error('Error donating:', error)
            alert('Có lỗi xảy ra!')
        } finally {
            setDonating(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-strong rounded-2xl p-6 w-full max-w-md relative z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

                <AnimatePresence mode="wait">
                    {success && successItem ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{ duration: 0.5 }}
                                className="text-6xl mb-4"
                            >
                                {successItem.emoji}
                            </motion.div>
                            <h3 className="text-xl font-bold text-green-400 mb-2">
                                Đã tặng {successItem.name}!
                            </h3>
                            <p className="text-gray-400">Dev cảm ơn bạn nhiều! 💕</p>
                        </motion.div>
                    ) : (
                        <motion.div key="items">
                            <div className="text-center mb-6">
                                <Gift className="mx-auto text-primary mb-2" size={40} />
                                <h2 className="text-2xl font-bold gradient-text">Tặng quà cho Dev</h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    Chọn item từ kho đồ để tặng
                                </p>
                            </div>

                            {availableItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="mb-4">Kho đồ trống! 📦</p>
                                    <a href="/store" className="btn-primary">
                                        Ghé cửa hàng mua đồ
                                    </a>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                    {availableItems.map((item) => (
                                        <motion.button
                                            key={item.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={donating !== null}
                                            onClick={() => handleDonate(item)}
                                            className={`glass rounded-xl p-4 text-center transition-all
                                                ${donating === item.id ? 'ring-2 ring-primary animate-pulse' : 'hover:border-primary/50'}
                                            `}
                                        >
                                            <span className="text-3xl block mb-2">{item.emoji}</span>
                                            <p className="font-semibold text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                x{getItemQuantity(item.id)} trong kho
                                            </p>
                                            {donating === item.id && (
                                                <Sparkles className="mx-auto mt-2 text-primary animate-spin" size={16} />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
