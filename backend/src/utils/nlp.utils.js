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

const MONTH_NAMES = Object.keys(monthMap).join('|')

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

        // "veinticinco de febrero de 2026" / "25 de febrero"
        const dayMatch = lower.match(
            new RegExp(`(?:el\\s+)?(\\w[\\w\\s]*?)\\s+de\\s+(${MONTH_NAMES})`)
        )
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

        // Bare day number "28" — assume current/next month
        const bareDay = lower.match(/^(\d{1,2})$/)
        if (bareDay) {
            const day = parseInt(bareDay[1])
            const now = new Date()
            let month = now.getMonth()
            let year = now.getFullYear()
            if (day < now.getDate()) { month++; if (month > 11) { month = 0; year++ } }
            return formatDate(new Date(year, month, day))
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

/** Gets digits contributed by a single token. "seis"→"6", "doce"→"12", "684"→"684", other→null */
export function tokenToDigits(token) {
    if (/^\d+$/.test(token)) return token
    if (numberMap[token] !== undefined) return String(numberMap[token])
    return null
}

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
 * ORDER-INDEPENDENT segment extractor.
 * Tracks lastMetaEnd = position after the LAST metadata section.
 * Everything after that is the product list.
 * Works regardless of whether fields appear as: name→date→phone or name→phone→date.
 */
export const segmentTranscript = (transcript) => {
    const text = transcript.toLowerCase().trim()
    const result = { nameText: null, dateText: null, phoneText: null, productListText: null, rawText: text }

    let lastMetaEnd = 0

    // ── Name ────────────────────────────────────────────────────────────────────
    const nameM = text.match(
        /(?:pedido\s+para|nombre(?:\s+del)?\s+cliente)\s+(.+?)(?=\s+(?:fecha|tel[eé]fono|tlf|móvil)|,|$)/i
    )
    if (nameM) {
        result.nameText = nameM[1].trim()
        lastMetaEnd = Math.max(lastMetaEnd, nameM.index + nameM[0].length)
    }

    // ── Date ────────────────────────────────────────────────────────────────────
    // Only extract the ACTUAL date value (not everything until end of string)
    const DATE_VALUE_RE = new RegExp(
        `(\\d{1,2}(?:[\\/\\-]\\d{1,2}(?:[\\/\\-]\\d{4})?)|` +       // 25/02/2026
        `(?:[a-záéíóúñ]+(?:\\s+y\\s+\\w+)?)\\s+de\\s+(?:${MONTH_NAMES})(?:\\s+de\\s+\\d{4})?|` + // treinta de febrero de 2026
        `\\d{1,2})`,                                                   // bare "28"
        'i'
    )
    const dateKwM = text.match(/(?:fecha(?:\s+de)?\s+recogida|recogida\s+d[ií]a|d[ií]a)\s+/i)
    if (dateKwM) {
        const afterKw = text.slice(dateKwM.index + dateKwM[0].length)
        const dateValM = afterKw.match(DATE_VALUE_RE)
        if (dateValM && afterKw.startsWith(dateValM[1])) {
            result.dateText = dateValM[1].trim()
            const dateEndInFull = dateKwM.index + dateKwM[0].length + dateValM[1].length
            lastMetaEnd = Math.max(lastMetaEnd, dateEndInFull)
        }
    }

    // ── Phone (token-by-token, stops at exactly 9 digits) ─────────────────────
    const phoneKwM = text.match(/(?:tel[eé]fonos?|tlf|móvil)\s+/i)
    if (phoneKwM) {
        const afterKw = text.slice(phoneKwM.index + phoneKwM[0].length)
        const tokens = afterKw.split(/\s+/)
        let phone = ''
        let consumedCount = 0

        for (const token of tokens) {
            const digits = tokenToDigits(token)
            if (digits === null) {
                if (phone.length > 0) break
                consumedCount++
                continue
            }
            phone += digits
            consumedCount++
            if (phone.length >= 9) break
        }

        if (phone.length >= 9) result.phoneText = phone.slice(0, 12)

        const consumedText = tokens.slice(0, consumedCount).join(' ')
        const phoneEndInFull = phoneKwM.index + phoneKwM[0].length + consumedText.length
        lastMetaEnd = Math.max(lastMetaEnd, phoneEndInFull)
    }

    // ── Product list = everything AFTER the last metadata section ───────────────
    if (lastMetaEnd > 0 && lastMetaEnd < text.length) {
        const rest = text.slice(lastMetaEnd).replace(/^[\s,]+/, '').trim()
        if (rest.length > 3) result.productListText = rest
    }

    return result
}

export const extractClientInfo = (transcript) => {
    const result = {}
    try {
        const segments = segmentTranscript(transcript)
        if (segments.nameText) {
            result.clientName = segments.nameText
                .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').trim()
        }
        if (segments.dateText) {
            const parsedDate = parseSpanishDate(segments.dateText)
            if (parsedDate) result.pickupDate = parsedDate
        }
        if (segments.phoneText) {
            result.clientPhone = segments.phoneText
        }
    } catch (e) { /* return partial */ }
    return result
}
