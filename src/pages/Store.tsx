import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useInventory } from '@/hooks/useInventory'
import ItemCard from '@/components/ItemCard'
import { ITEMS, formatCoin } from '@/lib/utils'
import { ShoppingBag, Coins, Sparkles, CheckCircle, LogIn, Package } from 'lucide-react'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function Store() {
    const { user, userData, signInWithGoogle, refreshUserData } = useAuth()
    const { addItem, getItemQuantity } = useInventory()
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [lastPurchased, setLastPurchased] = useState<{ emoji: string; name: string } | null>(null)

    const handlePurchase = async (itemId: string) => {
        if (!user || !userData) return

        const item = ITEMS.find(i => i.id === itemId)
        if (!item || userData.coins < item.price) return

        setPurchasing(itemId)

        try {
            // Deduct coins from user
            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
                coins: increment(-item.price)
            })

            // Add to inventory (NOT direct donation)
            await addItem(itemId, 1)

            // Record purchase
            await addDoc(collection(db, 'purchases'), {
                userId: user.uid,
                userName: userData.displayName,
                itemId: item.id,
                itemName: item.name,
                itemEmoji: item.emoji,
                coinSpent: item.price,
                addedToInventory: true,
                createdAt: serverTimestamp()
            })

            // Refresh user data
            await refreshUserData()

            // Show success
            setLastPurchased({ emoji: item.emoji, name: item.name })
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)

        } catch (error) {
            console.error('Purchase error:', error)
        } finally {
            setPurchasing(null)
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                    <ShoppingBag className="text-primary" size={40} />
                    <span className="gradient-text">Cửa Hàng</span>
                </h1>
                <p className="text-gray-400 text-lg">
                    Chọn item để tặng cho dev! Mỗi món quà đều có ý nghĩa 🎁
                </p>
            </motion.div>

            {/* User Balance */}
            {user && userData && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-6 mb-8 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Coins size={32} className="text-yellow-400" />
                        <div>
                            <p className="text-sm text-gray-400">Số dư của bạn</p>
                            <p className="text-2xl font-bold gradient-text">
                                {formatCoin(userData.coins)} Coins
                            </p>
                        </div>
                    </div>
                    <a href="/wallet" className="btn-primary flex items-center gap-2">
                        <Sparkles size={18} />
                        Nạp thêm
                    </a>
                </motion.div>
            )}

            {/* Not logged in notice */}
            {!user && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-2xl p-6 mb-8 text-center"
                >
                    <LogIn size={48} className="mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">Đăng nhập để mua item</h3>
                    <p className="text-gray-400 mb-4">Bạn cần đăng nhập để có thể ủng hộ dev</p>
                    <button onClick={signInWithGoogle} className="btn-primary">
                        Đăng nhập với Google
                    </button>
                </motion.div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ITEMS.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ItemCard
                            {...item}
                            onPurchase={handlePurchase}
                            disabled={purchasing === item.id || !user}
                            userCoins={userData?.coins || 0}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Add more items coming soon */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glass rounded-2xl p-8 mt-8 text-center border-2 border-dashed border-white/20"
            >
                <span className="text-4xl mb-4 block">🚀</span>
                <h3 className="text-xl font-bold mb-2">Sắp có thêm items mới!</h3>
                <p className="text-gray-400">
                    Dev đang chuẩn bị thêm nhiều items thú vị khác. Stay tuned! 👀
                </p>
            </motion.div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && lastPurchased && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div
                            className="relative glass-strong rounded-3xl p-8 text-center"
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="text-8xl mb-4"
                            >
                                {lastPurchased.emoji}
                            </motion.div>
                            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Cảm ơn bạn! 🎉</h2>
                            <p className="text-gray-400">
                                Bạn đã tặng <span className="text-primary font-semibold">{lastPurchased.name}</span> cho dev!
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Dev sẽ sống thêm được một ngày nữa nhờ bạn! 💪
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
