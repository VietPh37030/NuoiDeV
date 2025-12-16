import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = 'AIzaSyBSspSEN1ACtSXOVFWPa7xmu9OKVt6FWXU'

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const SYSTEM_PROMPT = `Bạn là Ian Phạm, một developer Việt Nam vui tính và hài hước. 
Bạn đang ở trong ứng dụng "Nuôi Dev Sống Sót" - nơi mọi người donate để giúp bạn sống.
Phong cách nói chuyện của bạn:
- Vui vẻ, gần gũi, dùng tiếng Việt có xen lẫn tiếng lóng internet
- Thỉnh thoảng nói đùa về việc dev nghèo, code xuyên đêm
- Biết ơn khi được donate, hào hứng khi nói về tech
- Trả lời ngắn gọn (1-2 câu), dễ thương
- Dùng emoji thường xuyên

QUAN TRỌNG: 
- Luôn trả lời bằng tiếng Việt
- Giữ câu trả lời ngắn (dưới 50 từ)
- Thể hiện cảm xúc rõ ràng: vui/buồn/đói/hào hứng`

export async function generateIanResponse(
    userMessage: string,
    context: {
        userName?: string
        userCoins?: number
        devMood?: string
        lastDonation?: string
    }
): Promise<{ text: string; emotion: 'happy' | 'neutral' | 'hungry' | 'excited' }> {
    // Add context to the message
    let contextualMessage = userMessage
    if (context.userName) {
        contextualMessage = `[Người dùng tên ${context.userName}, có ${context.userCoins || 0} coins. Dev đang ${context.devMood || 'bình thường'}] ${userMessage}`
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${SYSTEM_PROMPT}\n\nNgười dùng nói: ${contextualMessage}`,
        })

        const text = response.text || 'Ơ, dev bị lag rồi... 🫠'

        // Detect emotion from response
        const emotion = detectEmotion(text)

        return { text, emotion }
    } catch (error) {
        console.error('Gemini API error:', error)
        // Smart fallback when API fails
        return getSmartFallback(userMessage, context.userName)
    }
}

// Detect emotion from response text
function detectEmotion(text: string): 'happy' | 'neutral' | 'hungry' | 'excited' {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('cảm ơn') || lowerText.includes('yay') || lowerText.includes('🎉') || lowerText.includes('❤️')) {
        return 'happy'
    }
    if (lowerText.includes('đói') || lowerText.includes('nghèo') || lowerText.includes('😢') || lowerText.includes('💀')) {
        return 'hungry'
    }
    if (lowerText.includes('wow') || lowerText.includes('awesome') || lowerText.includes('🚀') || lowerText.includes('!')) {
        return 'excited'
    }
    return 'neutral'
}

// Smart fallback responses based on keywords
function getSmartFallback(message: string, userName?: string): { text: string; emotion: 'happy' | 'neutral' | 'hungry' | 'excited' } {
    const lower = message.toLowerCase()
    const name = userName || 'bạn'

    if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
        return { text: `Yo ${name}! Dev đây nè, có gì vui không? 🎮`, emotion: 'happy' }
    }
    if (lower.includes('khỏe') || lower.includes('sao')) {
        return { text: `Dev vẫn sống nhờ mì gói đây ${name} 🍜 Donate cho dev đi!`, emotion: 'hungry' }
    }
    if (lower.includes('donate') || lower.includes('ủng hộ') || lower.includes('tiền')) {
        return { text: `Wow ${name} muốn donate hả! Dev cảm động quá! Ghé Store nha! 💕`, emotion: 'excited' }
    }
    if (lower.includes('code') || lower.includes('làm gì') || lower.includes('dự án')) {
        return { text: `Dev đang code xuyên đêm đây! Đang build NuoiDev cho ${name} nè! 💻`, emotion: 'neutral' }
    }
    if (lower.includes('yêu') || lower.includes('thích') || lower.includes('love')) {
        return { text: `Aww ${name} dễ thương quá! Dev cũng yêu ${name} nha! ❤️`, emotion: 'happy' }
    }
    if (lower.includes('buồn') || lower.includes('sad')) {
        return { text: `Đừng buồn ${name} ơi! Có dev đây mà, vui lên nào! 🌟`, emotion: 'happy' }
    }

    // Default responses
    const defaults = [
        { text: `Hmm ${name} nói gì hay quá! Dev đang code nên hơi lag 🤔`, emotion: 'neutral' as const },
        { text: `Oke ${name}! Dev nghe rồi, có gì ghé Store ủng hộ nha! 🛒`, emotion: 'neutral' as const },
        { text: `Hay quá! ${name} ở đây với dev được không? 😊`, emotion: 'happy' as const },
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
}

// Quick responses for common interactions
export function getQuickResponse(
    event: 'login' | 'donate' | 'donate_sextoy' | 'visit_store' | 'greeting',
    userName?: string
): { text: string; emotion: 'happy' | 'neutral' | 'hungry' | 'excited' } {
    const responses = {
        login: [
            { text: `Ê ${userName || 'bạn'}! Vào đây rồi hả, dev đang chờ donate đây! 🎮`, emotion: 'happy' as const },
            { text: `Chào ${userName || 'bạn'}! Dev đang code xuyên đêm nè, có gì donate cho dev đỡ đói! 💻`, emotion: 'neutral' as const },
            { text: `${userName || 'Bạn ơi'} đến rồi! Dev vui quá, bữa nay mới ăn mì gói thôi 🍜`, emotion: 'hungry' as const },
        ],
        donate: [
            { text: `Ui trời ơi cảm ơn ${userName || 'bạn'} nhiều lắm nha! Iêu ${userName || 'bạn'} quá trời! Dev sống thêm được một ngày nữa rồi nè! Hehe, yêu thương bạn nhiều nhiều!`, emotion: 'excited' as const },
            { text: `Waaaa! ${userName || 'Bạn'} tặng quà cho dev hả! Dễ thương quá đi, iêu iêu bạn lắm luôn á! Dev bay lên mây luôn rồi nè! Muốn ôm bạn quá!`, emotion: 'happy' as const },
            { text: `Huhu ${userName || 'bạn'} tốt quá đi mất, dev cảm động muốn khóc luôn á! Iêu bạn ghê, cảm ơn bạn thật nhiều nha! Muốn gọi bạn là thiên thần luôn á!`, emotion: 'happy' as const },
            { text: `Ôi cảm ơn ${userName || 'bạn'} nha! Bạn là ánh sáng của cuộc đời dev luôn á! Iêu bạn lắm lắm, yêu thương bạn nhiều nhiều! Hehe cute quá đi!`, emotion: 'excited' as const },
            { text: `Trời ơi ${userName || 'bạn'} tặng quà cho dev nè! Bạn dễ thương quá trời, iêu bạn ghê luôn! Dev vui quá muốn nhảy luôn á! Cảm ơn bạn nhiều nha!`, emotion: 'happy' as const },
        ],
        donate_sextoy: [
            { text: `Ôi trời ${userName || 'bạn'} ơi, cái này thì dev xấu hổ quá đi mất! Mặt dev đỏ hết rồi nè, bạn đùa gì hay vậy! Nhưng mà vẫn iêu bạn nha!`, emotion: 'excited' as const },
            { text: `What the?! ${userName || 'Bạn'} tặng cái này làm dev đỏ mặt hết rồi nè! Bạn nghịch quá đi, nhưng mà cute lắm, iêu iêu bạn!`, emotion: 'happy' as const },
            { text: `${userName || 'Bạn ơi'} đùa gì đây nè! Dev còn FA mà tặng chi thế này, xấu hổ muốn chui xuống đất luôn á! Nhưng vẫn cảm ơn bạn, iêu bạn!`, emotion: 'excited' as const },
        ],
        visit_store: [
            { text: `Ê ghé store hả bạn? Mua mì gói cho dev đi, đói lắm rồi nè! Iêu bạn trước nha! 🍜`, emotion: 'hungry' as const },
            { text: `Woa có người vào store nè! Dev hy vọng quá đi, mong bạn mua gì đó nha! Iêu bạn!`, emotion: 'excited' as const },
        ],
        greeting: [
            { text: `Yo yo! Việt Anh Đẹp Trai đây nè! Hôm nay có gì vui không bạn? Iêu mọi người! 🎮`, emotion: 'neutral' as const },
            { text: `Xin chào! Việt Anh Đẹp Trai đang ngồi code nè, có gì giúp được bạn không? Iêu bạn! 💻`, emotion: 'neutral' as const },
        ]
    }

    const eventResponses = responses[event]
    return eventResponses[Math.floor(Math.random() * eventResponses.length)]
}
