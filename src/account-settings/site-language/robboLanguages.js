/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 */

// The platform offers English and Russian only (DarkLang released languages). The profile's own language
// comes first: robbo/courses — English (online, skill — Russian first).
export const ROBBO_SITE_LANGUAGES = [
  { code: 'en', name: 'English', released: true },
  { code: 'ru', name: 'Русский', released: true },
];

// The language in use moves to the top; the others keep the platform order.
export const orderSiteLanguageOptions = (options, currentLanguage) => {
  const current = options.find(option => option.value === currentLanguage);
  return current ? [current, ...options.filter(option => option !== current)] : options;
};
