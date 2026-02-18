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
 * e.g. "diecinueve de febrero de 2026"
 */
export const parseSpanishDate = (text) => {
    try {
        const lower = text.toLowerCase()

        // Check for DD/MM/YYYY or DD-MM-YYYY
        const slashMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/)
        if (slashMatch) {
            const day = parseInt(slashMatch[1])
            const month = parseInt(slashMatch[2]) - 1 // JS months are 0-11
            const year = slashMatch[3] ? parseInt(slashMatch[3]) : new Date().getFullYear()

            const date = new Date(year, month, day)
            const yyyy = date.getFullYear()
            const mm = String(date.getMonth() + 1).padStart(2, '0')
            const dd = String(date.getDate()).padStart(2, '0')
            return `${yyyy}-${mm}-${dd}`
        }

        // Extract day
        let day = null
        // Check for "diecinueve" or digits "19"
        const dayMatch = lower.match(/(?:el\s+)?([a-zñáéíóú]+|\d+)\s+de\s+([a-zñ]+)/)

        if (dayMatch) {
            const dayStr = dayMatch[1]
            const monthStr = dayMatch[2]

            day = isNaN(dayStr) ? numberMap[dayStr] : parseInt(dayStr)
            const month = monthMap[monthStr]

            // Extract year (optional) - matches "de 2026" or "del 2026"
            let year = new Date().getFullYear()
            const yearMatch = lower.match(/(?:del?|de)\s+(\d{4})/)
            if (yearMatch) {
                year = parseInt(yearMatch[1])
            } else {
                // Handle year transition logic if needed (e.g. if order is for next year)
                // For now defaults to current year
            }

            if (day && month !== undefined) {
                // Create date (months are 0-indexed in JS Date)
                // Note: We use local date construction
                const date = new Date(year, month, day)
                // Return YYYY-MM-DD
                const yyyy = date.getFullYear()
                const mm = String(date.getMonth() + 1).padStart(2, '0')
                const dd = String(date.getDate()).padStart(2, '0')
                return `${yyyy}-${mm}-${dd}`
            }
        }
        return null
    } catch (e) {
        return null
    }
}

/**
 * Converts a sequence of number words or digits into a phone string
 * e.g. "cinco cinco cinco tres..." -> "5553..."
 */
export const wordsToPhone = (text) => {
    // Split by non-alphanumeric but keep digits
    const words = text.toLowerCase().split(/[\s-]+/)
    let phone = ''

    for (const word of words) {
        if (!isNaN(word)) {
            phone += word
        } else if (numberMap[word] !== undefined && numberMap[word] < 10) {
            phone += numberMap[word]
        }
    }

    return phone.length >= 9 ? phone : null
}

/**
 * Extracts client name, phone, and pickup date from transcript
 */
export const extractClientInfo = (transcript) => {
    const text = transcript.toLowerCase()
    const result = {}

    // 1. Extract Pickup Date
    // Look for pattern "fecha (de) (recogida) value" until next keyword
    const dateRegex = /(?:fecha|recogida)(?:\s+de)?(?:\s+recogida)?\s+(.+?)(?=\s+(?:teléfono|tlf|nombre|cliente|productos?|quiero|$))/i
    const dateMatch = text.match(dateRegex)
    if (dateMatch) {
        const possibleDate = dateMatch[1]
        const parsedDate = parseSpanishDate(possibleDate)
        if (parsedDate) {
            result.pickupDate = parsedDate
        }
    }

    // 2. Extract Phone
    const phoneRegex = /(?:teléfono|tlf|móvil)(?:\s+de)?(?:\s+contacto)?\s+(.+?)(?=\s+(?:fecha|recogida|nombre|cliente|productos?|quiero|$))/i
    const phoneMatch = text.match(phoneRegex)
    if (phoneMatch) {
        const possiblePhone = phoneMatch[1]
        const parsedPhone = wordsToPhone(possiblePhone)
        if (parsedPhone) {
            result.clientPhone = parsedPhone
        }
    }

    // 3. Extract Name
    const nameRegex = /(?:nombre|cliente)(?:\s+del)?(?:\s+cliente)?\s+(.+?)(?=\s+(?:teléfono|tlf|fecha|recogida|productos?|quiero|$))/i
    const nameMatch = text.match(nameRegex)
    if (nameMatch) {
        // Capitalize first letters
        result.clientName = nameMatch[1]
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
            .trim()
    }

    return result
}
