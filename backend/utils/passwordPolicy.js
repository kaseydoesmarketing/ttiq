/**
 * Password Policy Validator for TitleIQ
 *
 * Enforces strong password requirements to protect user accounts
 */

/**
 * Validate password against security policy
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[], score: number }
 */
export function validatePassword(password) {
  const errors = [];
  let score = 0;

  // Minimum length: 10 characters
  if (!password || password.length < 10) {
    errors.push('Password must be at least 10 characters long');
  } else {
    score += 1;
  }

  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Must contain number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Must contain special character
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  } else {
    score += 1;
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^abc123/i,
    /^letmein/i,
    /^welcome/i,
    /^monkey/i,
    /^dragon/i,
    /^master/i,
    /^admin/i
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains a common weak pattern');
      score = Math.max(0, score - 2);
      break;
    }
  }

  // Check for sequential characters
  if (/012|123|234|345|456|567|678|789|890/.test(password)) {
    errors.push('Password should not contain sequential numbers');
    score = Math.max(0, score - 1);
  }

  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    errors.push('Password should not contain sequential letters');
    score = Math.max(0, score - 1);
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (aaa, 111, etc.)');
    score = Math.max(0, score - 1);
  }

  // Bonus points for length
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Calculate final score (0-5)
  const finalScore = Math.min(5, Math.max(0, score));

  return {
    valid: errors.length === 0 && finalScore >= 3,
    errors,
    score: finalScore,
    strength: getStrengthLabel(finalScore)
  };
}

/**
 * Get human-readable strength label
 * @param {number} score - Password score (0-5)
 * @returns {string} - Strength label
 */
function getStrengthLabel(score) {
  if (score >= 5) return 'Very Strong';
  if (score >= 4) return 'Strong';
  if (score >= 3) return 'Good';
  if (score >= 2) return 'Weak';
  return 'Very Weak';
}

/**
 * Generate password requirements message for users
 * @returns {string} - Requirements message
 */
export function getPasswordRequirements() {
  return `Password must:
• Be at least 10 characters long
• Contain at least one lowercase letter
• Contain at least one uppercase letter
• Contain at least one number
• Contain at least one special character
• Not contain common weak patterns or sequential characters`;
}

export default {
  validatePassword,
  getPasswordRequirements
};
