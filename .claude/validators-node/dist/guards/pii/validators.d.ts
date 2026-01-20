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
export declare function validateLuhn(number: string): boolean;
/**
 * IBAN MOD 97-10 validation.
 * International Bank Account Number validation.
 */
export declare function validateIban(iban: string): boolean;
/**
 * ABA Routing Number validation.
 * US bank routing number with weighted checksum.
 */
export declare function validateAbaRouting(routing: string): boolean;
/**
 * UK NHS Number validation (MOD 11).
 * 10-digit number with weighted checksum.
 */
export declare function validateNhsNumber(nhs: string): boolean;
/**
 * German Tax ID (Steuer-ID) validation.
 * 11 digits, first digit non-zero, at least one digit appears 2+ times in first 10.
 */
export declare function validateGermanTaxId(taxId: string): boolean;
/**
 * Spanish DNI validation.
 * 8 digits + control letter.
 */
export declare function validateSpanishDni(dni: string): boolean;
/**
 * Spanish NIE validation.
 * X/Y/Z + 7 digits + control letter.
 */
export declare function validateSpanishNie(nie: string): boolean;
/**
 * Dutch BSN (Burgerservicenummer) validation.
 * 9 digits with "11-proof" checksum.
 */
export declare function validateDutchBsn(bsn: string): boolean;
/**
 * Polish PESEL validation.
 * 11 digits with weighted checksum.
 */
export declare function validatePolishPesel(pesel: string): boolean;
/**
 * Portuguese NIF validation.
 * 9 digits with weighted checksum.
 */
export declare function validatePortugueseNif(nif: string): boolean;
/**
 * Swedish Personnummer validation.
 * 10 digits (after removing separator) validated with Luhn.
 */
export declare function validateSwedishPersonnummer(pn: string): boolean;
