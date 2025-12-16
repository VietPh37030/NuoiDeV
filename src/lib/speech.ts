// ElevenLabs Text-to-Speech API
// Giọng đọc tiếng Việt chất lượng cao

const ELEVENLABS_API_KEY = '79f665c37439b86f0826c3f881b9cbc7b81c5bbb5777662ca7ad8bbae18217c1'

// Vietnamese voice - Hùng (giọng nam Việt Nam - rõ ràng)
const VIETNAMESE_VOICE_ID = 'LPldyaIkUUSOPCRFrgYJ' // Hùng - Vietnamese male

export interface ElevenLabsOptions {
    stability?: number      // 0 - 1 (default 0.5)
    similarity?: number     // 0 - 1 (default 0.75)
    style?: number          // 0 - 1 (default 0)
    speakerBoost?: boolean
}

class ElevenLabsTTS {
    private apiKey: string
    private voiceId: string
    private currentAudio: HTMLAudioElement | null = null
    private isPlaying: boolean = false

    constructor(apiKey: string, voiceId: string = VIETNAMESE_VOICE_ID) {
        this.apiKey = apiKey
        this.voiceId = voiceId
    }

    // Đọc text
    async speak(text: string, options: ElevenLabsOptions = {}): Promise<void> {
        // Dừng nếu đang nói
        this.stop()

        // Làm sạch text (bỏ emoji)
        const cleanText = this.cleanText(text)
        if (!cleanText) {
            return
        }

        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.apiKey
                    },
                    body: JSON.stringify({
                        text: cleanText,
                        model_id: 'eleven_turbo_v2_5', // Model mới, hỗ trợ đa ngôn ngữ tốt
                        language_code: 'vi', // Chỉ định tiếng Việt
                        voice_settings: {
                            stability: options.stability ?? 0.6,
                            similarity_boost: options.similarity ?? 0.8,
                            style: options.style ?? 0.2,
                            use_speaker_boost: options.speakerBoost ?? true
                        }
                    })
                }
            )

            if (!response.ok) {
                const error = await response.text()
                console.error('ElevenLabs API error:', error)
                return
            }

            // Chuyển response thành audio blob
            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)

            // Phát audio
            return new Promise((resolve) => {
                this.currentAudio = new Audio(audioUrl)
                this.isPlaying = true

                this.currentAudio.onended = () => {
                    this.isPlaying = false
                    URL.revokeObjectURL(audioUrl)
                    resolve()
                }

                this.currentAudio.onerror = () => {
                    this.isPlaying = false
                    URL.revokeObjectURL(audioUrl)
                    resolve()
                }

                this.currentAudio.play().catch((e) => {
                    console.error('Audio play error:', e)
                    this.isPlaying = false
                    resolve()
                })
            })

        } catch (error) {
            console.error('ElevenLabs TTS error:', error)
        }
    }

    // Dừng nói
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause()
            this.currentAudio.currentTime = 0
            this.currentAudio = null
        }
        this.isPlaying = false
    }

    // Kiểm tra đang nói không
    get isSpeaking(): boolean {
        return this.isPlaying
    }

    // Đổi voice
    setVoice(voiceId: string) {
        this.voiceId = voiceId
    }

    // Làm sạch text: bỏ emoji
    private cleanText(text: string): string {
        return text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
            .replace(/[*_~`]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    }
}

// Singleton instance
const tts = new ElevenLabsTTS(ELEVENLABS_API_KEY)

export function speak(text: string, options?: ElevenLabsOptions): Promise<void> {
    return tts.speak(text, options)
}

export function stopSpeaking() {
    tts.stop()
}

export function setVoice(voiceId: string) {
    tts.setVoice(voiceId)
}

// Các voice ID phổ biến cho tiếng Việt
export const VOICES = {
    ADAM: 'pNInz6obpgDQGcFmaJgB',       // Nam - giọng trầm
    CHARLIE: 'IKne3meq5aSn9XLyUdCD',    // Nam - trẻ
    ARNOLD: 'VR6AewLTigWG4xSOukaG',     // Nam - mạnh mẽ
    CHARLOTTE: 'XB0fDUnXU5powFXDhCwa',  // Nữ - nhẹ nhàng
    BELLA: 'EXAVITQu4vr4xnSDxMaL',      // Nữ - trẻ
}

export default tts
