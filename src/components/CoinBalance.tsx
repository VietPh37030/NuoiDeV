import { motion } from 'framer-motion'
import { Coins, TrendingUp } from 'lucide-react'
import { formatCoin } from '@/lib/utils'

interface CoinBalanceProps {
    coins: number
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export default function CoinBalance({ coins, showLabel = true, size = 'md' }: CoinBalanceProps) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl'
    }

    const iconSizes = {
        sm: 20,
        md: 28,
        lg: 40
    }

    return (
        <motion.div
            className="glass rounded-2xl p-6 glow-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {showLabel && (
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-sm uppercase tracking-wider">Số dư của bạn</span>
                </div>
            )}

            <div className="flex items-center gap-3">
                <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    <Coins size={iconSizes[size]} className="text-yellow-400" />
                </motion.div>

                <motion.span
                    className={`font-bold gradient-text ${sizeClasses[size]}`}
                    key={coins}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                    {formatCoin(coins)}
                </motion.span>

                <span className="text-gray-400 text-lg">Coins</span>
            </div>
        </motion.div>
    )
}
