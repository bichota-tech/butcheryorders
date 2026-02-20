/**
 * NLP Utilities for Spanish voice command parsing
 * Handles: structured order dictation, date/phone/name extraction
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
 * Supports: "25 de febrero", "25 de febrero de 2026", "25/02", "25/02/2026"
 */
export const parseSpanishDate = (text) => {
    try {
        text = text.trim()
        const lower = text.toLowerCase()

        // Check for DD/MM/YYYY or DD-MM-YYYY
        const slashMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/)
        if (slashMatch) {
            const day = parseInt(slashMatch[1])
            const month = parseInt(slashMatch[2]) - 1
            const year = slashMatch[3] ? parseInt(slashMatch[3]) : new Date().getFullYear()
            const date = new Date(year, month, day)
            return formatDate(date)
        }

        // Spoken date: "diecinueve de febrero de 2026" / "25 de febrero"
        // Match: (day word or digit) "de" (month word)
        const dayMatch = lower.match(/(?:el\s+)?(\w[\w\s]*?)\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/)
        if (dayMatch) {
            const dayStr = dayMatch[1].trim()
            const monthStr = dayMatch[2].trim()

            const day = isNaN(dayStr) ? numberMap[dayStr] : parseInt(dayStr)
            const month = monthMap[monthStr]

            let year = new Date().getFullYear()
            const yearMatch = lower.match(/de\s+(\d{4})/)
            if (yearMatch) {
                year = parseInt(yearMatch[1])
            }

            if (day && month !== undefined) {
                return formatDate(new Date(year, month, day))
            }
        }

        return null
    } catch (e) {
        return null
    }
}

function formatDate(date) {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

/**
 * Converts a sequence of number words or digit groups into a phone string
 * e.g. "seis ocho cuatro uno dos tres cuatro cinco seis" -> "684123456"
 * e.g. "684 123 456" -> "684123456"
 */
export const wordsToPhone = (text) => {
    const words = text.toLowerCase().trim().split(/[\s\-]+/)
    let phone = ''

    for (const word of words) {
        // If it's a pure number token (e.g. "684" or "456"), add all digits
        if (/^\d+$/.test(word)) {
            phone += word
        } else if (numberMap[word] !== undefined && numberMap[word] <= 9) {
            // Single digits spoken as words: "seis" -> 6
            phone += numberMap[word]
        }
        // Stop if we already have enough digits for a valid spanish phone
        if (phone.length >= 12) break
    }

    return phone.length >= 9 ? phone.slice(0, 12) : null
}

/**
 * Segments the full transcript into structured parts:
 *   { header, dateText, phoneText, productListText }
 *
 * Expected format (flexible):
 * "Pedido para $name, Fecha de recogida $date, teléfono $phone, $products..."
 */
export const segmentTranscript = (transcript) => {
    const text = transcript.toLowerCase().trim()

    const result = {
        nameText: null,
        dateText: null,
        phoneText: null,
        productListText: null,
        rawText: text
    }

    // ── 1. Name ──────────────────────────────────────────────────────────────
    // "Pedido para María González" or "nombre del cliente María"
    const nameMatch = text.match(
        /(?:pedido\s+para|nombre(?:\s+del)?\s+cliente)\s+([^,]+?)(?:\s*,|\s+(?:fecha|teléfono|tel[eé]fono|tlf|y\s+|$))/i
    )
    if (nameMatch) {
        result.nameText = nameMatch[1].trim()
    }

    // ── 2. Date ───────────────────────────────────────────────────────────────
    // "Fecha de recogida 25 de febrero" or "fecha 18/02"
    const dateMatch = text.match(
        /(?:fecha(?:\s+de)?\s+recogida|fecha)\s+([^,]+?)(?:\s*,|\s+(?:teléfono|tel[eé]fono|tlf|nombre|$))/i
    )
    if (dateMatch) {
        result.dateText = dateMatch[1].trim()
    }

    // ── 3. Phone ──────────────────────────────────────────────────────────────
    // "teléfono 684123456" — capture everything until the next comma or end
    const phoneMatch = text.match(
        /(?:tel[eé]fonos?|tlf|móvil)\s+([^,]+?)(?:\s*,|$)/i
    )
    if (phoneMatch) {
        result.phoneText = phoneMatch[1].trim()
    }

    // ── 4. Product list ───────────────────────────────────────────────────────
    // Everything after the last of (phone / fecha / nombre) sections
    // Strategy: find the last comma that separates header from product list
    // The product list comes after all metadata fields.
    // We detect it by checking position after the last matched keyword.

    let productStart = -1
    const anchors = [
        /(?:tel[eé]fonos?|tlf|móvil)\s+[\d\w\s]+/i,  // after phone number
    ]
    for (const anchor of anchors) {
        const m = anchor.exec(text)
        if (m) {
            const end = m.index + m[0].length
            if (end > productStart) productStart = end
        }
    }

    // If we found an end of the header section, the rest is products
    if (productStart !== -1) {
        // Skip the comma/space after the header
        let rest = text.slice(productStart).replace(/^[\s,]+/, '').trim()
        if (rest.length > 0) {
            result.productListText = rest
        }
    }

    return result
}


/**
 * Extracts client name, phone, and pickup date from a structured transcript.
 * Uses segmentTranscript to correctly parse "Pedido para X, Fecha Y, Teléfono Z, products..."
 */
export const extractClientInfo = (transcript) => {
    const result = {}

    try {
        const segments = segmentTranscript(transcript)

        // Name
        if (segments.nameText) {
            result.clientName = segments.nameText
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
                .trim()
        }

        // Date
        if (segments.dateText) {
            const parsedDate = parseSpanishDate(segments.dateText)
            if (parsedDate) {
                result.pickupDate = parsedDate
            }
        }

        // Phone
        if (segments.phoneText) {
            const parsedPhone = wordsToPhone(segments.phoneText)
            if (parsedPhone) {
                result.clientPhone = parsedPhone
            }
        }
    } catch (e) {
        // Fallback: return whatever we got
    }

    return result
}
