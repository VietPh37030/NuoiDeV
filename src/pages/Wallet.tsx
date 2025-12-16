import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import CoinBalance from '@/components/CoinBalance'
import TopUpModal from '@/components/TopUpModal'
import { TOP_UP_OPTIONS, formatVND, formatCoin } from '@/lib/utils'
import { Wallet as WalletIcon, Plus, Sparkles, History, LogIn, Coins, Gift } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Wallet() {
    const { user, userData, signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [selectedOption, setSelectedOption] = useState<typeof TOP_UP_OPTIONS[0] | null>(null)

    if (!user) {
        return (
            <div className="max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 text-center"
                >
                    <WalletIcon size={64} className="mx-auto text-primary mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Ví của bạn</h1>
                    <p className="text-gray-400 mb-6">
                        Đăng nhập để xem số dư và nạp coins
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} />
                        Đăng nhập với Google
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                    <WalletIcon className="text-primary" size={40} />
                    <span className="gradient-text">Ví của bạn</span>
                </h1>
                <p className="text-gray-400">Quản lý coins và nạp thêm để ủng hộ dev</p>
            </motion.div>

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <CoinBalance coins={userData?.coins || 0} size="lg" />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4 mb-8"
            >
                <Link
                    to="/store"
                    className="glass rounded-2xl p-6 text-center card-hover border border-white/10 hover:border-primary/50"
                >
                    <Gift size={32} className="mx-auto text-primary mb-3" />
                    <p className="font-semibold">Ghé cửa hàng</p>
                    <p className="text-sm text-gray-400">Mua items tặng dev</p>
                </Link>

                <Link
                    to="/profile"
                    className="glass rounded-2xl p-6 text-center card-hover border border-white/10 hover:border-secondary/50"
                >
                    <History size={32} className="mx-auto text-secondary mb-3" />
                    <p className="font-semibold">Lịch sử</p>
                    <p className="text-sm text-gray-400">Xem các giao dịch</p>
                </Link>
            </motion.div>

            {/* Top Up Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-3xl p-6"
            >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="text-primary" />
                    Nạp Coins
                </h2>

                <p className="text-gray-400 mb-6">
                    Tỷ giá: <span className="text-yellow-400 font-semibold">1,000 VND = 1 Coin</span>
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {TOP_UP_OPTIONS.map((option, index) => (
                        <motion.button
                            key={option.coins}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            onClick={() => setSelectedOption(option)}
                            className={`relative glass rounded-2xl p-6 text-left border transition-all hover:scale-[1.02] ${option.popular
                                    ? 'border-primary glow-primary'
                                    : 'border-white/10 hover:border-primary/50'
                                }`}
                        >
                            {option.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs font-semibold">
                                    Phổ biến
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-3">
                                <Coins size={28} className="text-yellow-400" />
                                <span className="text-2xl font-bold">
                                    {formatCoin(option.coins)}
                                    {option.bonus && (
                                        <span className="text-primary text-sm ml-1">+{option.bonus}</span>
                                    )}
                                </span>
                            </div>

                            <p className="text-lg font-semibold text-primary">
                                {formatVND(option.vnd)}
                            </p>

                            {option.bonus && (
                                <p className="text-green-400 text-sm mt-1">
                                    🎁 Bonus {option.bonus} coins!
                                </p>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Custom amount hint */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Muốn nạp số khác? Liên hệ dev qua Facebook 📱
                </p>
            </motion.div>

            {/* Top Up Modal */}
            {selectedOption && (
                <TopUpModal
                    isOpen={!!selectedOption}
                    onClose={() => setSelectedOption(null)}
                    coins={selectedOption.coins}
                    vnd={selectedOption.vnd}
                    bonus={selectedOption.bonus}
                />
            )}
        </div>
    )
}
