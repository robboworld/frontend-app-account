/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * LMS notifications API (openedx/core/djangoapps/notifications/urls.py): the list, unseen counts,
 * "seen" per app and "read" per notification or per app.
 */
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const apiUrl = (path = '') => `${getConfig().LMS_BASE_URL}/api/notifications/${path}`;

export const PAGE_SIZE = 20;

export const getNotifications = async ({ appName = '', page = 1 } = {}) => {
  const params = { page, page_size: PAGE_SIZE };
  if (appName) {
    params.app_name = appName;
  }
  const { data } = await getAuthenticatedHttpClient().get(apiUrl(), { params });
  return camelCaseObject(data);
};

export const getNotificationCounts = async () => {
  const { data } = await getAuthenticatedHttpClient().get(apiUrl('count/'));
  // App names are ids (learner_progress), not keys to camelCase: they go back into ?app_name=.
  const { count_by_app_name: countByAppName, ...rest } = data;
  return { ...camelCaseObject(rest), countByAppName: countByAppName || {} };
};

export const markAppSeen = async (appName) => {
  await getAuthenticatedHttpClient().put(apiUrl(`mark-seen/${appName}/`));
};

export const markNotificationRead = async (notificationId) => {
  await getAuthenticatedHttpClient().patch(apiUrl('read/'), { notification_id: notificationId });
};

export const markAppRead = async (appName) => {
  await getAuthenticatedHttpClient().patch(apiUrl('read/'), { app_name: appName });
};
