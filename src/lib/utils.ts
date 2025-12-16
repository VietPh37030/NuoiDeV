import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCoin(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount)
}

export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

export function vndToCoins(vnd: number): number {
    return Math.floor(vnd / 1000)
}

export function coinsToVnd(coins: number): number {
    return coins * 1000
}

export function getDevMood(totalCoins: number): 'dying' | 'hungry' | 'neutral' | 'happy' {
    if (totalCoins <= 0) return 'dying'
    if (totalCoins < 100) return 'hungry'
    if (totalCoins < 500) return 'neutral'
    return 'happy'
}

export function getMoodEmoji(mood: string): string {
    switch (mood) {
        case 'dying': return '😭'
        case 'hungry': return '😐'
        case 'neutral': return '😊'
        case 'happy': return '🎉'
        default: return '😊'
    }
}

export function getMoodMessage(mood: string): string {
    switch (mood) {
        case 'dying': return 'Dev đang chết đói! Cứu dev với! 💀'
        case 'hungry': return 'Dev hơi đói rồi, cho dev xin tí đi! 🥺'
        case 'neutral': return 'Dev đang ổn, cảm ơn mọi người! 💪'
        case 'happy': return 'Dev đang vui lắm! Cảm ơn các bạn! 🎊'
        default: return 'Dev đang chờ ủng hộ!'
    }
}

export const ITEMS = [
    {
        id: 'sextoy',
        name: 'Sextoy',
        emoji: '🔞',
        price: 1,
        description: 'Quà 18+ cho dev... thôi đùa thôi 😳',
        category: 'meme'
    },
    {
        id: 'mi-goi',
        name: 'Mì Gói',
        emoji: '🍜',
        price: 5,
        description: 'Món ăn cứu đói kinh điển của dev',
        category: 'food'
    },
    {
        id: 'tra-sua',
        name: 'Trà Sữa',
        emoji: '🧋',
        price: 15,
        description: 'Năng lượng để code xuyên đêm',
        category: 'drink'
    },
    {
        id: 'server',
        name: 'Server',
        emoji: '💻',
        price: 100,
        description: 'Server để host project',
        category: 'tech'
    },
    {
        id: 'card-game',
        name: 'Card Game',
        emoji: '🎴',
        price: 50,
        description: 'Giải trí sau giờ code',
        category: 'entertainment'
    },
    {
        id: 'tien-cho-gai',
        name: 'Tiền Cho Gái',
        emoji: '💸',
        price: 200,
        description: 'Để dev có người yêu (đùa thôi 😂)',
        category: 'meme'
    }
]

export const TOP_UP_OPTIONS = [
    { coins: 1, vnd: 1000, label: '1 Coin' },
    { coins: 2, vnd: 2000, label: '2 Coins', popular: true },
    { coins: 5, vnd: 5000, label: '5 Coins' },
    { coins: 10, vnd: 10000, label: '10 Coins', bonus: 1 },
]
