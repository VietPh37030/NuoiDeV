import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'

export interface InventoryItem {
    itemId: string
    quantity: number
}

export function useInventory() {
    const { user } = useAuth()
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    // Listen to inventory changes in real-time
    useEffect(() => {
        if (!user) {
            setInventory([])
            setLoading(false)
            return
        }

        const inventoryRef = doc(db, 'inventories', user.uid)

        const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data()
                setInventory(data.items || [])
            } else {
                setInventory([])
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    // Add item to inventory
    const addItem = async (itemId: string, quantity: number = 1) => {
        if (!user) return

        const inventoryRef = doc(db, 'inventories', user.uid)
        const snapshot = await getDoc(inventoryRef)

        if (snapshot.exists()) {
            const data = snapshot.data()
            const items: InventoryItem[] = data.items || []
            const existingIndex = items.findIndex(i => i.itemId === itemId)

            if (existingIndex >= 0) {
                items[existingIndex].quantity += quantity
            } else {
                items.push({ itemId, quantity })
            }

            await updateDoc(inventoryRef, { items })
        } else {
            await setDoc(inventoryRef, {
                userId: user.uid,
                items: [{ itemId, quantity }]
            })
        }
    }

    // Remove item from inventory (when donating)
    const removeItem = async (itemId: string, quantity: number = 1) => {
        if (!user) return false

        const inventoryRef = doc(db, 'inventories', user.uid)
        const snapshot = await getDoc(inventoryRef)

        if (!snapshot.exists()) return false

        const data = snapshot.data()
        const items: InventoryItem[] = data.items || []
        const existingIndex = items.findIndex(i => i.itemId === itemId)

        if (existingIndex < 0 || items[existingIndex].quantity < quantity) {
            return false
        }

        items[existingIndex].quantity -= quantity
        if (items[existingIndex].quantity <= 0) {
            items.splice(existingIndex, 1)
        }

        await updateDoc(inventoryRef, { items })
        return true
    }

    // Get quantity of specific item
    const getItemQuantity = (itemId: string): number => {
        const item = inventory.find(i => i.itemId === itemId)
        return item?.quantity || 0
    }

    return {
        inventory,
        loading,
        addItem,
        removeItem,
        getItemQuantity
    }
}
