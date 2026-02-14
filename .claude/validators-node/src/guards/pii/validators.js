/**
 * BMAD Guardrails: PII Validators
 * ================================
 * Algorithmic validators for various PII formats.
 * These validate that detected patterns are actually valid IDs,
 * not just strings that happen to match the pattern.
 */
/**
 * Luhn algorithm for credit cards and Swedish personnummer.
 * Validates the checksum of a number.
 */
export function validateLuhn(number) {
    const digits = number.replace(/\D/g, '').split('').map(Number);
    if (digits.length < 13 || digits.length > 19) {
        return false;
    }
    let checksum = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = digits[i];
        if ((digits.length - 1 - i) % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        checksum += digit;
    }
    return checksum % 10 === 0;
}
/**
 * IBAN MOD 97-10 validation.
 * International Bank Account Number validation.
 */
export function validateIban(iban) {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (cleaned.length < 15 || cleaned.length > 34) {
        return false;
    }
    // Move first 4 chars to end
    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
    // Convert letters to numbers (A=10, B=11, etc.)
    let converted = '';
    for (const char of rearranged) {
        if (char >= '0' && char <= '9') {
            converted += char;
        }
        else if (char >= 'A' && char <= 'Z') {
            converted += (char.charCodeAt(0) - 55).toString();
        }
        else {
            return false; // Invalid character
        }
    }
    // Calculate modulo 97 on the large number
    // Process in chunks to avoid overflow
    let remainder = 0;
    for (let i = 0; i < converted.length; i += 7) {
        const chunk = converted.slice(i, i + 7);
        remainder = parseInt(remainder.toString() + chunk, 10) % 97;
    }
    return remainder === 1;
}
/**
 * ABA Routing Number validation.
 * US bank routing number with weighted checksum.
 */
export function validateAbaRouting(routing) {
    const digits = routing.replace(/\D/g, '');
    if (digits.length !== 9) {
        return false;
    }
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    let total = 0;
    for (let i = 0; i < 9; i++) {
        total += parseInt(digits[i], 10) * weights[i];
    }
    return total % 10 === 0;
}
/**
 * UK NHS Number validation (MOD 11).
 * 10-digit number with weighted checksum.
 */
export function validateNhsNumber(nhs) {
    const digits = nhs.replace(/\D/g, '');
    if (digits.length !== 10) {
        return false;
    }
    const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    let total = 0;
    for (let i = 0; i < 9; i++) {
        total += parseInt(digits[i], 10) * weights[i];
    }
    const remainder = total % 11;
    const checkDigit = remainder === 0 ? 0 : 11 - remainder;
    // Check digit must be less than 10 and match the 10th digit
    if (checkDigit >= 10) {
        return false;
    }
    return checkDigit === parseInt(digits[9], 10);
}
/**
 * German Tax ID (Steuer-ID) validation.
 * 11 digits, first digit non-zero, at least one digit appears 2+ times in first 10.
 */
export function validateGermanTaxId(taxId) {
    const digits = taxId.replace(/\D/g, '');
    if (digits.length !== 11) {
        return false;
    }
    // First digit cannot be 0
    if (digits[0] === '0') {
        return false;
    }
    // Count frequency of each digit in first 10 digits
    const freq = new Map();
    for (let i = 0; i < 10; i++) {
        const d = digits[i];
        freq.set(d, (freq.get(d) || 0) + 1);
    }
    // At least one digit must appear 2+ times
    let hasDoubleOrTriple = false;
    for (const count of freq.values()) {
        if (count >= 2) {
            hasDoubleOrTriple = true;
            break;
        }
    }
    return hasDoubleOrTriple;
}
/**
 * Spanish DNI validation.
 * 8 digits + control letter.
 */
export function validateSpanishDni(dni) {
    const cleaned = dni.toUpperCase();
    const match = cleaned.match(/^(\d{8})([A-Z])$/);
    if (!match) {
        return false;
    }
    const number = parseInt(match[1], 10);
    const letter = match[2];
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const expectedLetter = letters[number % 23];
    return letter === expectedLetter;
}
/**
 * Spanish NIE validation.
 * X/Y/Z + 7 digits + control letter.
 */
export function validateSpanishNie(nie) {
    const cleaned = nie.toUpperCase();
    const match = cleaned.match(/^([XYZ])(\d{7})([A-Z])$/);
    if (!match) {
        return false;
    }
    const prefix = match[1];
    const number = match[2];
    const letter = match[3];
    // Map prefix to digit
    const prefixMap = { X: '0', Y: '1', Z: '2' };
    const fullNumber = parseInt(prefixMap[prefix] + number, 10);
    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const expectedLetter = letters[fullNumber % 23];
    return letter === expectedLetter;
}
/**
 * Dutch BSN (Burgerservicenummer) validation.
 * 9 digits with "11-proof" checksum.
 */
export function validateDutchBsn(bsn) {
    const digits = bsn.replace(/\D/g, '');
    if (digits.length !== 9) {
        return false;
    }
    const weights = [9, 8, 7, 6, 5, 4, 3, 2, -1];
    let total = 0;
    for (let i = 0; i < 9; i++) {
        total += parseInt(digits[i], 10) * weights[i];
    }
    return total % 11 === 0;
}
/**
 * Polish PESEL validation.
 * 11 digits with weighted checksum.
 */
export function validatePolishPesel(pesel) {
    const digits = pesel.replace(/\D/g, '');
    if (digits.length !== 11) {
        return false;
    }
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let total = 0;
    for (let i = 0; i < 10; i++) {
        total += parseInt(digits[i], 10) * weights[i];
    }
    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit === parseInt(digits[10], 10);
}
/**
 * Portuguese NIF validation.
 * 9 digits with weighted checksum.
 */
export function validatePortugueseNif(nif) {
    const digits = nif.replace(/\D/g, '');
    if (digits.length !== 9) {
        return false;
    }
    // First digit must be 1, 2, 5, 6, 8, or 9
    if (!['1', '2', '5', '6', '8', '9'].includes(digits[0])) {
        return false;
    }
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    let total = 0;
    for (let i = 0; i < 8; i++) {
        total += parseInt(digits[i], 10) * weights[i];
    }
    const remainder = total % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;
    return checkDigit === parseInt(digits[8], 10);
}
/**
 * Swedish Personnummer validation.
 * 10 digits (after removing separator) validated with Luhn.
 */
export function validateSwedishPersonnummer(pn) {
    // Remove separators (- or +)
    const digits = pn.replace(/[-+]/g, '');
    if (digits.length !== 10) {
        return false;
    }
    // Use Luhn algorithm on 10 digits
    let checksum = 0;
    for (let i = 0; i < 10; i++) {
        let digit = parseInt(digits[i], 10);
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        checksum += digit;
    }
    return checksum % 10 === 0;
}
//# sourceMappingURL=validators.js.map