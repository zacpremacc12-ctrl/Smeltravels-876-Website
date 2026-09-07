/**
 * Real-time credit/debit card validation utilities for SMELTRAVELS876.
 * Enforces legal card numbers (Luhn algorithm / Mod 10), legal future expiration dates,
 * and matching security codes (CVV/CID).
 */

export interface CardValidationResult {
  isValid: boolean;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'keycard' | 'unknown';
  brandName: string;
  errors: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardName?: string;
  };
}

/**
 * Validates card number against the standard ISO/IEC 7812 Luhn Algorithm (Mod 10).
 * Every legal Visa, Mastercard, Amex, and Discover card mathematically satisfies this test.
 */
export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Detects card brand based on industry standard IIN/BIN prefix patterns.
 */
export function detectCardBrand(cardNumber: string): {
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'keycard' | 'unknown';
  name: string;
} {
  const digits = cardNumber.replace(/\D/g, '');

  if (/^4/.test(digits)) {
    return { brand: 'visa', name: 'Visa' };
  }
  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return { brand: 'mastercard', name: 'Mastercard' };
  }
  if (/^3[47]/.test(digits)) {
    return { brand: 'amex', name: 'American Express' };
  }
  if (/^(6011|65|64[4-9]|622)/.test(digits)) {
    return { brand: 'discover', name: 'Discover' };
  }
  if (/^5081/.test(digits)) {
    return { brand: 'keycard', name: 'NCB Keycard' };
  }

  return { brand: 'unknown', name: 'Payment Card' };
}

/**
 * Runs a rigorous legal check on the card number, expiry date, CVV, and name.
 */
export function validateCardDetails(
  cardNumber: string,
  cardExpiry: string,
  cardCvv: string,
  cardName: string
): CardValidationResult {
  const errors: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardName?: string;
  } = {};

  const cleanNumber = (cardNumber || '').replace(/\D/g, '');
  const { brand, name: brandName } = detectCardBrand(cleanNumber);

  // 1. Legal Card Number Check (Format, Length, & Luhn Checksum)
  if (!cleanNumber) {
    errors.cardNumber = 'Card number is required.';
  } else if (cleanNumber.length < 13) {
    errors.cardNumber = 'Card number is incomplete (minimum 13 digits required).';
  } else if (brand === 'amex' && cleanNumber.length !== 15) {
    errors.cardNumber = 'American Express card numbers must be exactly 15 digits.';
  } else if (brand !== 'amex' && cleanNumber.length !== 16 && cleanNumber.length !== 13 && cleanNumber.length !== 19) {
    errors.cardNumber = `Invalid card length (${cleanNumber.length} digits). Standard cards have 16 digits.`;
  } else if (!isValidLuhn(cleanNumber)) {
    errors.cardNumber = 'Invalid card number. Failed checksum check (Luhn algorithm). Please verify your card number.';
  }

  // 2. Legal Expiry Date Check
  const cleanExpiry = (cardExpiry || '').trim();
  if (!cleanExpiry) {
    errors.cardExpiry = 'Expiration date is required.';
  } else {
    const match = cleanExpiry.match(/^(\d{1,2})\/(\d{2}|\d{4})$/);
    if (!match) {
      errors.cardExpiry = 'Enter a valid expiration date in MM/YY format (e.g. 08/28).';
    } else {
      const expMonth = parseInt(match[1], 10);
      let expYear = parseInt(match[2], 10);
      if (expYear < 100) expYear += 2000;

      if (expMonth < 1 || expMonth > 12) {
        errors.cardExpiry = 'Invalid month. Month must be between 01 and 12.';
      } else {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1 to 12

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          const formattedExp = `${String(expMonth).padStart(2, '0')}/${String(expYear).slice(-2)}`;
          errors.cardExpiry = `Card has expired (${formattedExp} is in the past). Please enter a valid card with a future expiration date.`;
        } else if (expYear > currentYear + 25) {
          errors.cardExpiry = 'Invalid expiration year. Expiry date cannot be more than 25 years in the future.';
        }
      }
    }
  }

  // 3. Correct Security Code (CVV/CVC/CID) Check
  const cleanCvv = (cardCvv || '').trim().replace(/\D/g, '');
  if (!cleanCvv) {
    errors.cardCvv = 'Security code (CVV) is required.';
  } else if (brand === 'amex') {
    if (cleanCvv.length !== 4) {
      errors.cardCvv = 'American Express requires a 4-digit CID security code located on the front of the card.';
    }
  } else {
    if (cleanCvv.length !== 3 && cleanCvv.length !== 4) {
      errors.cardCvv = 'Security code (CVV) must be 3 digits (located on the signature strip).';
    }
  }

  // 4. Cardholder Name Check
  const cleanName = (cardName || '').trim();
  if (!cleanName) {
    errors.cardName = 'Cardholder name is required as printed on the card.';
  } else if (cleanName.length < 2) {
    errors.cardName = 'Please enter the full legal cardholder name.';
  } else if (!/^[a-zA-Z\s\-'.]+$/.test(cleanName)) {
    errors.cardName = 'Cardholder name should contain letters only.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    brand,
    brandName,
    errors,
  };
}
