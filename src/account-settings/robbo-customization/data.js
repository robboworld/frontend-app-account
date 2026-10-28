/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// «Что нового» API of the LMS (robbo_changelog): `status` tells whether the user may choose where
// «Что нового» sits (course team and staff) and where it is now; `placement` saves the choice.
const apiUrl = (path) => `${getConfig().LMS_BASE_URL.replace(/\/$/, '')}/api/robbo/v1/whats-new/${path}`;

// Headers on the page ask the widget to re-read the status, so the change shows without a reload.
export const WHATS_NEW_REFRESH_EVENT = 'robbo-whats-new:refresh';

let statusPromise = null;

// One request for the section and the jump nav; null when «Что нового» is unavailable.
export const loadWhatsNewPlacement = () => {
  if (!statusPromise) {
    statusPromise = getAuthenticatedHttpClient()
      .get(apiUrl('status'))
      .then(({ data }) => ({
        canChoose: Boolean(data.can_choose_placement),
        placement: data.in_menu ? 'menu' : 'button',
      }))
      .catch(() => null);
  }
  return statusPromise;
};

export const saveWhatsNewPlacement = async (placement) => {
  const { data } = await getAuthenticatedHttpClient().post(apiUrl('placement'), { placement });
  statusPromise = Promise.resolve({ canChoose: true, placement: data.placement });
  window.dispatchEvent(new Event(WHATS_NEW_REFRESH_EVENT));
  return data.placement;
};
