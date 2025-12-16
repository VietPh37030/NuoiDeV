import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import Store from '@/pages/Store'
import Wallet from '@/pages/Wallet'
import Profile from '@/pages/Profile'

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/store" element={<Store />} />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App
