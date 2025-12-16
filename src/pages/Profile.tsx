import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { formatCoin, formatVND, ITEMS } from '@/lib/utils'
import {
    User as UserIcon,
    Mail,
    Calendar,
    Coins,
    ShoppingBag,
    LogOut,
    Gift,
    History,
    TrendingUp
} from 'lucide-react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Purchase {
    id: string
    itemId: string
    itemName: string
    itemEmoji: string
    coinSpent: number
    createdAt: Date
}

export default function Profile() {
    const { user, userData, logout } = useAuth()
    const navigate = useNavigate()
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [totalSpent, setTotalSpent] = useState(0)

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }

        const fetchPurchases = async () => {
            try {
                const purchasesRef = collection(db, 'purchases')
                const q = query(
                    purchasesRef,
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                )

                const snapshot = await getDocs(q)
                const purchaseData: Purchase[] = []
                let spent = 0

                snapshot.forEach((doc) => {
                    const data = doc.data()
                    purchaseData.push({
                        id: doc.id,
                        itemId: data.itemId,
                        itemName: data.itemName,
                        itemEmoji: data.itemEmoji,
                        coinSpent: data.coinSpent,
                        createdAt: data.createdAt?.toDate() || new Date()
                    })
                    spent += data.coinSpent
                })

                setPurchases(purchaseData)
                setTotalSpent(spent)
            } catch (error) {
                console.error('Error fetching purchases:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPurchases()
    }, [user, navigate])

    if (!user || !userData) {
        return null
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 mb-8"
            >
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    {userData.photoURL ? (
                        <img
                            src={userData.photoURL}
                            alt={userData.displayName || 'User'}
                            className="w-24 h-24 rounded-full border-4 border-primary glow-primary"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                            <UserIcon size={40} />
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold gradient-text mb-2">
                            {userData.displayName || 'Người dùng'}
                        </h1>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>Tham gia: {formatDate(userData.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="btn-secondary flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6 text-center"
                >
                    <Coins size={32} className="mx-auto text-yellow-400 mb-3" />
                    <p className="text-2xl font-bold gradient-text">{formatCoin(userData.coins)}</p>
                    <p className="text-gray-400 text-sm">Coins hiện tại</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6 text-center"
                >
                    <TrendingUp size={32} className="mx-auto text-green-400 mb-3" />
                    <p className="text-2xl font-bold text-green-400">{formatCoin(totalSpent)}</p>
                    <p className="text-gray-400 text-sm">Đã ủng hộ</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6 text-center col-span-2 md:col-span-1"
                >
                    <Gift size={32} className="mx-auto text-primary mb-3" />
                    <p className="text-2xl font-bold text-primary">{purchases.length}</p>
                    <p className="text-gray-400 text-sm">Items đã tặng</p>
                </motion.div>
            </div>

            {/* Purchase History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-3xl p-6"
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <History className="text-primary" />
                    Lịch sử ủng hộ
                </h2>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Đang tải...</p>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag size={64} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-4">Bạn chưa ủng hộ item nào</p>
                        <a href="/store" className="btn-primary inline-flex items-center gap-2">
                            <Gift size={18} />
                            Ghé cửa hàng
                        </a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {purchases.map((purchase, index) => (
                            <motion.div
                                key={purchase.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-4xl">{purchase.itemEmoji}</span>

                                <div className="flex-1">
                                    <p className="font-semibold">{purchase.itemName}</p>
                                    <p className="text-gray-500 text-sm">{formatDate(purchase.createdAt)}</p>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-yellow-400">-{purchase.coinSpent}</p>
                                    <p className="text-gray-500 text-xs">coins</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
