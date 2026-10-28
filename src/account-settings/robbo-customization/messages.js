/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'robbo.account.customization.heading',
    defaultMessage: 'Interface',
    description: 'Account settings section with interface options (course team and staff)',
  },
  description: {
    id: 'robbo.account.customization.description',
    defaultMessage: 'How the site header looks to you. Settings apply in every part of the site and only to your account.',
    description: 'Intro of the interface settings section',
  },
  whatsNewButtonAlt: {
    id: 'robbo.account.customization.whatsNew.button.alt',
    defaultMessage: 'Header with the «What\'s new» button next to notifications',
    description: 'Alt text of the header screenshot for the button option',
  },
  whatsNewMenuAlt: {
    id: 'robbo.account.customization.whatsNew.menu.alt',
    defaultMessage: 'Open profile menu with the «What\'s new» item, a dot on the profile button',
    description: 'Alt text of the header screenshot for the menu option',
  },
  whatsNewLabel: {
    id: 'robbo.account.customization.whatsNew.label',
    defaultMessage: 'Where to show «What\'s new»',
    description: 'Label of the choice where the «What\'s new» changes list sits in the header',
  },
  whatsNewButton: {
    id: 'robbo.account.customization.whatsNew.button',
    defaultMessage: 'Button next to notifications',
    description: 'Option: a separate «What\'s new» button in the header',
  },
  whatsNewButtonHelp: {
    id: 'robbo.account.customization.whatsNew.button.help',
    defaultMessage: 'A separate button in the header, the number of unread changes is on its icon.',
    description: 'Explanation of the header button option',
  },
  whatsNewMenu: {
    id: 'robbo.account.customization.whatsNew.menu',
    defaultMessage: 'Item in the profile menu',
    description: 'Option: «What\'s new» as an item of the profile menu',
  },
  whatsNewMenuHelp: {
    id: 'robbo.account.customization.whatsNew.menu.help',
    defaultMessage: 'In the menu under your name; a dot on the profile button shows that there are new changes.',
    description: 'Explanation of the profile menu option',
  },
  saved: {
    id: 'robbo.account.customization.saved',
    defaultMessage: 'Saved',
    description: 'Shown after the choice is saved',
  },
  saveError: {
    id: 'robbo.account.customization.saveError',
    defaultMessage: 'Could not save. Try again.',
    description: 'Shown when the choice could not be saved',
  },
});

export default messages;
