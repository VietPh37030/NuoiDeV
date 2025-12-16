import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { formatCoin } from '@/lib/utils'
import {
    Home,
    Store,
    Wallet,
    User,
    LogIn,
    LogOut,
    Coins,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const { user, userData, signInWithGoogle, logout, loading } = useAuth()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navLinks = [
        { to: '/', label: 'Trang chủ', icon: Home },
        { to: '/store', label: 'Cửa hàng', icon: Store },
        { to: '/wallet', label: 'Ví', icon: Wallet },
    ]

    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🎮</span>
                        <span className="font-bold text-xl gradient-text">NuoiDev</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive(to)
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
                        ) : user && userData ? (
                            <>
                                {/* Coin Balance */}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                                    <Coins size={16} className="text-yellow-400" />
                                    <span className="font-semibold text-yellow-400">
                                        {formatCoin(userData.coins)}
                                    </span>
                                </div>

                                {/* Profile Link */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    {userData.photoURL ? (
                                        <img
                                            src={userData.photoURL}
                                            alt={userData.displayName || 'User'}
                                            className="w-8 h-8 rounded-full border-2 border-primary"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                    )}
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    title="Đăng xuất"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="btn-primary flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                <span>Đăng nhập</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <div className="flex flex-col gap-2">
                            {navLinks.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(to)
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </Link>
                            ))}

                            {user && userData ? (
                                <>
                                    <div className="flex items-center gap-2 px-4 py-3 text-yellow-400">
                                        <Coins size={20} />
                                        <span className="font-semibold">{formatCoin(userData.coins)} Coins</span>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                                    >
                                        <User size={20} />
                                        <span>Hồ sơ</span>
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10"
                                    >
                                        <LogOut size={20} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { signInWithGoogle(); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-primary/10"
                                >
                                    <LogIn size={20} />
                                    <span>Đăng nhập với Google</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
