import { motion } from 'framer-motion'
import { Gift, Clock, User as UserIcon } from 'lucide-react'

interface Donation {
    id: string
    userName: string
    userPhoto?: string
    itemName: string
    itemEmoji: string
    coinAmount: number
    timestamp: Date
}

interface TransactionHistoryProps {
    donations: Donation[]
    title?: string
}

export default function TransactionHistory({ donations, title = "Lịch sử ủng hộ" }: TransactionHistoryProps) {
    const formatTime = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        return `${diffDays} ngày trước`
    }

    if (donations.length === 0) {
        return (
            <div className="glass rounded-2xl p-6 text-center">
                <Gift size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Chưa có ai ủng hộ. Hãy là người đầu tiên! 🎁</p>
            </div>
        )
    }

    return (
        <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gift size={24} className="text-primary" />
                {title}
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {donations.map((donation, index) => (
                    <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        {/* User Avatar */}
                        {donation.userPhoto ? (
                            <img
                                src={donation.userPhoto}
                                alt={donation.userName}
                                className="w-10 h-10 rounded-full border border-primary/30"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <UserIcon size={20} className="text-primary" />
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                                <span className="text-white">{donation.userName}</span>
                                <span className="text-gray-400 mx-2">đã tặng</span>
                                <span className="text-2xl">{donation.itemEmoji}</span>
                                <span className="text-primary ml-1">{donation.itemName}</span>
                            </p>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Clock size={12} />
                                <span>{formatTime(donation.timestamp)}</span>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="text-yellow-400 font-bold">
                            +{donation.coinAmount}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
