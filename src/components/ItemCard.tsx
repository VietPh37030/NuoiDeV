import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemCardProps {
    id: string
    name: string
    emoji: string
    price: number
    description: string
    onPurchase: (id: string) => void
    disabled?: boolean
    userCoins: number
}

export default function ItemCard({
    id,
    name,
    emoji,
    price,
    description,
    onPurchase,
    disabled,
    userCoins
}: ItemCardProps) {
    const canAfford = userCoins >= price

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "item-card glass rounded-2xl p-6 cursor-pointer transition-all",
                "border border-white/10 hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && canAfford && onPurchase(id)}
        >
            {/* Emoji */}
            <div className="text-6xl mb-4 animate-float">
                {emoji}
            </div>

            {/* Name */}
            <h3 className="text-xl font-bold mb-2">{name}</h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4">{description}</p>

            {/* Price */}
            <div className={cn(
                "flex items-center justify-center gap-2 py-2 px-4 rounded-full",
                canAfford
                    ? "bg-primary/20 text-primary"
                    : "bg-red-500/20 text-red-400"
            )}>
                <Coins size={18} className="text-yellow-400" />
                <span className="font-bold">{price} Coins</span>
            </div>

            {/* Affordable indicator */}
            {!canAfford && (
                <p className="text-red-400 text-xs mt-2 text-center">
                    Không đủ coins 😢
                </p>
            )}
        </motion.div>
    )
}
