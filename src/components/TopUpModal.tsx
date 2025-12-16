import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

// Vercel API URL - thay đổi sau khi deploy
const VERCEL_API_URL = 'https://nuoidev-webhook.vercel.app'

interface TopUpModalProps {
    isOpen: boolean
    onClose: () => void
    coins: number
    vnd: number
    bonus?: number
}

type PaymentStatus = 'waiting' | 'checking' | 'success' | 'timeout'

export default function TopUpModal({ isOpen, onClose, coins, vnd, bonus }: TopUpModalProps) {
    const { user } = useAuth()
    const [paymentCode, setPaymentCode] = useState('')
    const [status, setStatus] = useState<PaymentStatus>('waiting')
    const [countdown, setCountdown] = useState(300) // 5 phút
    const [actualCoins, setActualCoins] = useState(0)

    // Bank account info - SePay MB Bank
    const bankInfo = {
        bankName: 'MB Bank',
        accountNumber: '0378117461',
        accountName: 'PHAM VIET ANH',
    }

    // Tạo payment code khi mở modal
    useEffect(() => {
        if (isOpen) {
            const code = `NUOID${Date.now()}`
            setPaymentCode(code)
            setStatus('waiting')
            setCountdown(300)
            setActualCoins(0)

            // Tạo pending transaction nếu user đã login
            if (user) {
                createPendingTransaction(code)
            }
        }
    }, [isOpen, user])

    // Tạo pending transaction qua Vercel API
    const createPendingTransaction = async (code: string) => {
        try {
            await fetch(`${VERCEL_API_URL}/api/create-transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.uid,
                    coins,
                    vnd,
                    paymentCode: code
                })
            })
            console.log('Created pending transaction:', code)
        } catch (error) {
            console.error('Error creating pending transaction:', error)
        }
    }

    // Poll trạng thái thanh toán qua Vercel API
    const checkPayment = useCallback(async () => {
        if (!paymentCode || status === 'success') return

        try {
            const response = await fetch(`${VERCEL_API_URL}/api/check-payment?code=${paymentCode}`)
            const result = await response.json()

            if (result.status === 'completed') {
                setStatus('success')
                setActualCoins(result.coins || coins)
            }
        } catch (error) {
            console.error('Error checking payment:', error)
        }
    }, [paymentCode, status, coins])

    // Poll mỗi 5 giây
    useEffect(() => {
        if (!isOpen || status === 'success' || status === 'timeout') return

        const interval = setInterval(() => {
            checkPayment()
            setCountdown(prev => {
                if (prev <= 0) {
                    setStatus('timeout')
                    return 0
                }
                return prev - 5
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [isOpen, status, checkPayment])

    // VietQR URL
    const vietQrUrl = `https://img.vietqr.io/image/970422-${bankInfo.accountNumber}-compact2.png?amount=${vnd}&addInfo=${encodeURIComponent(paymentCode)}&accountName=${encodeURIComponent(bankInfo.accountName)}`

    // Format countdown
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleClose = () => {
        setStatus('waiting')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-strong rounded-2xl p-6 w-full max-w-md relative z-10"
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        /* Success State */
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                            >
                                <CheckCircle2 size={80} className="mx-auto text-green-400 mb-4" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-green-400 mb-2">
                                Thanh toán thành công!
                            </h2>
                            <p className="text-gray-400 mb-4">
                                Bạn đã nhận được
                            </p>
                            <p className="text-4xl font-bold gradient-text">
                                +{actualCoins} Coins
                            </p>
                            <button
                                onClick={handleClose}
                                className="btn-primary mt-6 w-full"
                            >
                                Đóng
                            </button>
                        </motion.div>
                    ) : (
                        /* Payment State */
                        <motion.div key="payment">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold gradient-text mb-2">Nạp Coins</h2>
                                <p className="text-gray-400">
                                    Nạp {coins} coins {bonus ? `+ ${bonus} bonus` : ''}
                                </p>
                                <p className="text-3xl font-bold text-primary mt-2">
                                    {formatVND(vnd)}
                                </p>
                            </div>

                            {/* Status indicator */}
                            <div className="flex items-center justify-center gap-2 mb-4 text-sm">
                                {status === 'waiting' && (
                                    <>
                                        <Clock size={16} className="text-yellow-400" />
                                        <span className="text-yellow-400">
                                            Đang chờ thanh toán... {formatTime(countdown)}
                                        </span>
                                    </>
                                )}
                                {status === 'checking' && (
                                    <>
                                        <Loader2 size={16} className="text-blue-400 animate-spin" />
                                        <span className="text-blue-400">Đang kiểm tra...</span>
                                    </>
                                )}
                                {status === 'timeout' && (
                                    <span className="text-red-400">Hết thời gian chờ</span>
                                )}
                            </div>

                            {/* QR Section */}
                            <div className="bg-white rounded-xl p-4 mb-6">
                                <div className="aspect-square relative">
                                    <img
                                        src={vietQrUrl}
                                        alt="VietQR Payment"
                                        className="w-full h-full object-contain rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                </div>
                                <p className="text-center text-gray-600 text-sm mt-2">
                                    Quét mã VietQR để thanh toán
                                </p>
                            </div>

                            {/* Bank Transfer Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                    Hoặc chuyển khoản trực tiếp
                                </h3>

                                <div className="space-y-2">
                                    <InfoRow label="Ngân hàng" value={bankInfo.bankName} />
                                    <InfoRow label="Số tài khoản" value={bankInfo.accountNumber} />
                                    <InfoRow label="Tên tài khoản" value={bankInfo.accountName} />
                                    <InfoRow label="Số tiền" value={formatVND(vnd)} />
                                    <InfoRow
                                        label="Nội dung CK"
                                        value={paymentCode}
                                        highlight
                                    />
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
                                    <p className="text-yellow-400 text-sm">
                                        ⚠️ Chuyển đúng nội dung để hệ thống tự động xác nhận!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

function InfoRow({
    label,
    value,
    highlight
}: {
    label: string
    value: string
    highlight?: boolean
}) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? 'bg-primary/20 border border-primary/30' : 'bg-white/5'
            }`}>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`font-mono font-semibold ${highlight ? 'text-primary' : ''}`}>
                    {value}
                </p>
            </div>
            <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
                {copied ? (
                    <Check size={16} className="text-green-400" />
                ) : (
                    <Copy size={16} className="text-gray-400" />
                )}
            </button>
        </div>
    )
}
