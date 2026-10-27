/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * LMS lms/djangoapps/robbo_notifications/api.py: the user's courses with what the list sorts by,
 * and «Отключить все уведомления».
 */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const apiUrl = (path) => `${getConfig().LMS_BASE_URL}/api/robbo/v1/notifications/${path}`;

/** [{id, name, start, created, enrolled, learners, team, details, customized}] */
export const getCourses = async () => {
  const { data } = await getAuthenticatedHttpClient().get(apiUrl('courses/'));
  return data.courses || [];
};

/** «Отключить все уведомления»: every type of every course of the user to off. {changed} */
export const disableAllNotifications = async () => {
  const { data } = await getAuthenticatedHttpClient().post(apiUrl('disable-all/'));
  return data;
};

/** «Вернуть общие настройки»: the stored settings «Для всех курсов» back into these courses. {reset} */
export const resetCourses = async (courseIds) => {
  const { data } = await getAuthenticatedHttpClient().post(apiUrl('courses/reset/'), { course_ids: courseIds });
  return data;
};

/** Learners a course-team member hears about: {mode, selected, learners, total}. Course team only. */
export const getCourseLearners = async (courseId, query = '') => {
  const { data } = await getAuthenticatedHttpClient().get(apiUrl('learners/'), {
    params: { course_id: courseId, q: query || undefined, limit: 50 },
  });
  return data;
};

/** mode 'all', or 'selected' with learnerIds. Returns the same shape as getCourseLearners. */
export const setCourseLearners = async (courseId, mode, learnerIds = []) => {
  const { data } = await getAuthenticatedHttpClient().post(apiUrl('learners/'), {
    course_id: courseId, mode, learner_ids: learnerIds,
  });
  return data;
};
