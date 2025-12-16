// Text-to-Speech using Web Speech API
// Giọng đọc tiếng Việt cho AI Avatar

export interface SpeechOptions {
    rate?: number    // 0.1 - 10 (default 1)
    pitch?: number   // 0 - 2 (default 1)
    volume?: number  // 0 - 1 (default 1)
}

class TextToSpeech {
    private synth: SpeechSynthesis
    private voices: SpeechSynthesisVoice[] = []
    private preferredVoice: SpeechSynthesisVoice | null = null
    private isReady: boolean = false

    constructor() {
        this.synth = window.speechSynthesis
        this.loadVoices()

        // Voices might load asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices()
        }
    }

    private loadVoices() {
        this.voices = this.synth.getVoices()

        // Tìm giọng tiếng Việt nam (ưu tiên giọng nam)
        const vietnameseVoices = this.voices.filter(v =>
            v.lang.includes('vi') || v.lang.includes('VI')
        )

        // Ưu tiên giọng nam (thường có tên chứa "male" hoặc không có "female")
        const maleVoice = vietnameseVoices.find(v =>
            v.name.toLowerCase().includes('male') ||
            !v.name.toLowerCase().includes('female')
        )

        if (maleVoice) {
            this.preferredVoice = maleVoice
        } else if (vietnameseVoices.length > 0) {
            this.preferredVoice = vietnameseVoices[0]
        } else {
            // Fallback: Google Vietnamese hoặc bất kỳ giọng nào có pitch thấp
            const googleVi = this.voices.find(v => v.name.includes('Google') && v.lang.includes('vi'))
            this.preferredVoice = googleVi || this.voices[0] || null
        }

        this.isReady = true
        console.log('🔊 TTS ready, voice:', this.preferredVoice?.name || 'default')
    }

    // Đọc text
    speak(text: string, options: SpeechOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject('Speech synthesis not supported')
                return
            }

            // Dừng nếu đang nói
            this.stop()

            // Làm sạch text (bỏ emoji)
            const cleanText = this.cleanText(text)
            if (!cleanText) {
                resolve()
                return
            }

            const utterance = new SpeechSynthesisUtterance(cleanText)

            // Cài đặt giọng
            if (this.preferredVoice) {
                utterance.voice = this.preferredVoice
            }

            // Cài đặt tiếng Việt
            utterance.lang = 'vi-VN'

            // Giọng nam: pitch thấp hơn (0.8-1.0)
            utterance.pitch = options.pitch ?? 0.85
            utterance.rate = options.rate ?? 1.0
            utterance.volume = options.volume ?? 1.0

            utterance.onend = () => resolve()
            utterance.onerror = (e) => {
                console.error('TTS error:', e)
                resolve() // Không reject để không break flow
            }

            this.synth.speak(utterance)
        })
    }

    // Dừng nói
    stop() {
        if (this.synth.speaking) {
            this.synth.cancel()
        }
    }

    // Kiểm tra đang nói không
    get isSpeaking(): boolean {
        return this.synth.speaking
    }

    // Làm sạch text: bỏ emoji, ký tự đặc biệt
    private cleanText(text: string): string {
        return text
            // Bỏ emoji
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // misc symbols
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // transport
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // flags
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // misc
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // dingbats
            .replace(/[\u{FE00}-\u{FEFF}]/gu, '')   // variations
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // supplemental
            // Bỏ ký tự đặc biệt thừa
            .replace(/[*_~`]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    }

    // Lấy danh sách voices có sẵn
    getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.voices
    }

    // Đổi voice
    setVoice(voiceName: string) {
        const voice = this.voices.find(v => v.name === voiceName)
        if (voice) {
            this.preferredVoice = voice
        }
    }
}

// Singleton instance
export const tts = new TextToSpeech()

// Helper function
export function speak(text: string, options?: SpeechOptions): Promise<void> {
    return tts.speak(text, options)
}

export function stopSpeaking() {
    tts.stop()
}
