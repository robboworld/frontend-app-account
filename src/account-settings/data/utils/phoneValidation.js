/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX distribution. See NOTICE at repository root.
 */

import { isValidPhoneNumber as isValidLibPhoneNumber } from 'libphonenumber-js';
import { formatPhoneNumberIntl } from 'react-phone-number-input';

/** Russia: +7 and 10 national digits. */
export const RU_PHONE_PATTERN = /^\+7\d{10}$/;
/** Other countries: E.164, 8–15 digits after '+'. */
export const INTL_PHONE_PATTERN = /^\+(?!7)[1-9]\d{7,14}$/;

export function sanitizePhoneInput(value) {
  const raw = String(value ?? '');
  const hasPlus = raw.trimStart().startsWith('+');
  const digits = raw.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Normalize common Russian input (8…, 7…, 10 digits) to +7XXXXXXXXXX.
 */
export function normalizeRobboPhoneNumber(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return '';
  }
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  if (hasPlus) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  return `+${digits}`;
}

export function isValidPhoneNumber(value) {
  const normalized = normalizeRobboPhoneNumber(value);
  if (!normalized) {
    return true;
  }
  try {
    if (isValidLibPhoneNumber(normalized)) {
      return true;
    }
  } catch {
    // Fall through to regex fallback for pasted or legacy values.
  }
  return RU_PHONE_PATTERN.test(normalized) || INTL_PHONE_PATTERN.test(normalized);
}

/** Display E.164 value with country spacing (matches PhoneInput international format). */
export function formatPhoneNumberForDisplay(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return '';
  }
  return formatPhoneNumberIntl(trimmed) || trimmed;
}
