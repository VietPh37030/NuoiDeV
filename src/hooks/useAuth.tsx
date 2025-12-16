import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
    User,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'

interface UserData {
    uid: string
    displayName: string | null
    email: string | null
    photoURL: string | null
    coins: number
    createdAt: Date
    lastLogin: Date
}

interface AuthContextType {
    user: User | null
    userData: UserData | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    logout: () => Promise<void>
    refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUserData = async (uid: string) => {
        const userRef = doc(db, 'users', uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData)
        }
    }

    const createUserDocument = async (user: User) => {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
            // New user - create document
            const newUserData: UserData = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                coins: 0,
                createdAt: new Date(),
                lastLogin: new Date()
            }
            await setDoc(userRef, {
                ...newUserData,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            })
            setUserData(newUserData)
        } else {
            // Existing user - update last login
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
            await fetchUserData(user.uid)
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)
            if (user) {
                await createUserDocument(user)
            } else {
                setUserData(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            await createUserDocument(result.user)
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            setUserData(null)
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }

    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user.uid)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signInWithGoogle,
            logout,
            refreshUserData
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
