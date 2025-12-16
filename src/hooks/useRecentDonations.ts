import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface RecentDonation {
    id: string
    userName: string
    itemName: string
    itemEmoji: string
    coinAmount: number
    timestamp: Date
}

export function useRecentDonations(limitCount: number = 5) {
    const [donations, setDonations] = useState<RecentDonation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const donationsRef = collection(db, 'itemDonations')
        const q = query(
            donationsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const donationList: RecentDonation[] = []

            snapshot.forEach((doc) => {
                const data = doc.data()
                donationList.push({
                    id: doc.id,
                    userName: data.userName || 'Ẩn danh',
                    itemName: data.itemName || 'Item',
                    itemEmoji: data.itemEmoji || '🎁',
                    coinAmount: data.coinAmount || 0,
                    timestamp: data.createdAt?.toDate() || new Date()
                })
            })

            setDonations(donationList)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [limitCount])

    return { donations, loading }
}
