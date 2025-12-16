import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getDevMood } from '@/lib/utils'

interface DevStatus {
    totalCoins: number
    totalDonations: number
    mood: 'dying' | 'hungry' | 'neutral' | 'happy'
    lastFed: Date | null
    recentDonors: Array<{
        name: string
        amount: number
        item: string
        timestamp: Date
    }>
}

const DEFAULT_DEV_STATUS: DevStatus = {
    totalCoins: 0,
    totalDonations: 0,
    mood: 'dying',
    lastFed: null,
    recentDonors: []
}

export function useDevStatus() {
    const [devStatus, setDevStatus] = useState<DevStatus>(DEFAULT_DEV_STATUS)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const devStatusRef = doc(db, 'devStatus', 'current')

        const unsubscribe = onSnapshot(devStatusRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data()
                setDevStatus({
                    totalCoins: data.totalCoins || 0,
                    totalDonations: data.totalDonations || 0,
                    mood: getDevMood(data.totalCoins || 0),
                    lastFed: data.lastFed?.toDate() || null,
                    recentDonors: data.recentDonors || []
                })
            } else {
                setDevStatus(DEFAULT_DEV_STATUS)
            }
            setLoading(false)
        }, (error) => {
            console.error('Error fetching dev status:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return { devStatus, loading }
}
