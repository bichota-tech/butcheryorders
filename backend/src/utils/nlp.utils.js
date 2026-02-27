/**
 * NLP Utilities for Spanish voice command parsing
 */

const numberMap = {
    'cero': 0, 'uno': 1, 'una': 1, 'un': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
    'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
    'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'dieciseis': 16, 'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
    'veinte': 20, 'veintiuno': 21, 'veintiún': 21, 'veintidos': 22, 'veintidós': 22,
    'veintitres': 23, 'veintitrés': 23, 'veinticuatro': 24, 'veinticinco': 25,
    'veintiseis': 26, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
    'treinta': 30, 'treinta y uno': 31, 'treinta y una': 31
}

const monthMap = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
}

/**
 * Parses a spoken Spanish date string into YYYY-MM-DD
 */
export const parseSpanishDate = (text) => {
    try {
        text = text.trim()
        const lower = text.toLowerCase()

        // DD/MM/YYYY or DD-MM-YYYY
        const slashMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/)
        if (slashMatch) {
            const day = parseInt(slashMatch[1])
            const month = parseInt(slashMatch[2]) - 1
            const year = slashMatch[3] ? parseInt(slashMatch[3]) : new Date().getFullYear()
            return formatDate(new Date(year, month, day))
        }

        // "veinticinco de febrero" / "25 de febrero"
        const dayMatch = lower.match(/(?:el\s+)?(\w[\w\s]*?)\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/)
        if (dayMatch) {
            const dayStr = dayMatch[1].trim()
            const monthStr = dayMatch[2].trim()
            const day = isNaN(dayStr) ? numberMap[dayStr] : parseInt(dayStr)
            const month = monthMap[monthStr]
            let year = new Date().getFullYear()
            const yearMatch = lower.match(/de\s+(\d{4})/)
            if (yearMatch) year = parseInt(yearMatch[1])
            if (day && month !== undefined) return formatDate(new Date(year, month, day))
        }

        return null
    } catch (e) { return null }
}

function formatDate(date) {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

/**
 * Gets the digit string contributed by a single word/token.
 * "seis"→"6", "doce"→"12", "veintinueve"→"29", "684"→"684"
 * Returns null if the token is not numeric.
 */
function tokenToDigits(token) {
    if (/^\d+$/.test(token)) return token
    if (numberMap[token] !== undefined) return String(numberMap[token])
    return null
}

/**
 * Converts a free-form text with number words/digits into a phone string.
 * Accepts multi-digit words: "seis doce veintinueve..." → "612295..."
 */
export const wordsToPhone = (text) => {
    const words = text.toLowerCase().trim().split(/[\s\-]+/)
    let phone = ''
    for (const word of words) {
        const d = tokenToDigits(word)
        if (d !== null) phone += d
        if (phone.length >= 12) break
    }
    return phone.length >= 9 ? phone.slice(0, 12) : null
}

/**
 * Segments transcript into: name, date, phone (9 digits), and product list.
 *
 * Key algorithm for phone: parse tokens one-by-one after "teléfono" keyword,
 * accumulate digits until 9 are reached, then treat the rest as products.
 * This correctly handles groups like "seis doce veintinueve..." without consuming products.
 */
export const segmentTranscript = (transcript) => {
    const text = transcript.toLowerCase().trim()
    const result = { nameText: null, dateText: null, phoneText: null, productListText: null, rawText: text }

    // ── 1. Name ────────────────────────────────────────────────────────────────
    const nameM = text.match(
        /(?:pedido\s+para|nombre(?:\s+del)?\s+cliente)\s+(.+?)(?=\s+(?:fecha|tel[eé]fono|tlf)|,|$)/i
    )
    if (nameM) result.nameText = nameM[1].trim()

    // ── 2. Date ────────────────────────────────────────────────────────────────
    const dateM = text.match(
        /(?:fecha(?:\s+de)?\s+recogida)\s+(.+?)(?=\s+(?:tel[eé]fono|tlf|móvil|nombre)|,|$)/i
    )
    if (dateM) result.dateText = dateM[1].trim()

    // ── 3. Phone + product boundary ────────────────────────────────────────────
    // Find "teléfono" keyword, then consume tokens one-by-one until 9 digits.
    const phoneKwM = text.match(/(?:tel[eé]fonos?|tlf|móvil)\s+/i)
    if (phoneKwM) {
        const afterKw = text.slice(phoneKwM.index + phoneKwM[0].length)
        const tokens = afterKw.split(/\s+/)
        let phone = ''
        let consumedCount = 0

        for (const token of tokens) {
            const digits = tokenToDigits(token)
            if (digits === null) {
                // Non-numeric token → end of phone number
                if (phone.length > 0) break
                // If no digits yet, keep looking (e.g. skip "del" before number)
                consumedCount++
                continue
            }
            phone += digits
            consumedCount++
            if (phone.length >= 9) break
        }

        if (phone.length >= 9) {
            result.phoneText = phone.slice(0, 12)
        }

        // Product list = everything after the consumed phone tokens
        const consumedText = tokens.slice(0, consumedCount).join(' ')
        // Find exact position of consumed text in afterKw, then take the rest
        const consumedLen = afterKw.indexOf(consumedText) + consumedText.length
        const rest = afterKw.slice(consumedLen).replace(/^[\s,]+/, '').trim()
        if (rest.length > 3) {
            result.productListText = rest
        }
    }

    return result
}

/**
 * Extracts clientName, clientPhone, pickupDate from a structured transcript.
 */
export const extractClientInfo = (transcript) => {
    const result = {}
    try {
        const segments = segmentTranscript(transcript)

        if (segments.nameText) {
            result.clientName = segments.nameText
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
                .trim()
        }
        if (segments.dateText) {
            const parsedDate = parseSpanishDate(segments.dateText)
            if (parsedDate) result.pickupDate = parsedDate
        }
        if (segments.phoneText) {
            result.clientPhone = segments.phoneText
        }
    } catch (e) { /* fallback: return partial */ }

    return result
}
