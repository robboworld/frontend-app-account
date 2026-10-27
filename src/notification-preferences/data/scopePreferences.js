/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Preferences of one scope — all courses ('') or one course — with their own state, so the
 * «Для всех курсов» panel and an open course stay on screen together (the upstream Redux slice
 * holds a single scope). A type is edited as a mode: off / site / email / both, plus the email
 * cadence. «Для всех курсов» is read and saved through the Robbo account-settings API (stored
 * settings), a course through the stock PATCH configurations/<course>.
 */
import { useCallback, useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const MODES = {
  OFF: 'off',
  WEB: 'web',
  EMAIL: 'email',
  BOTH: 'both',
};

export const CADENCES = ['Immediately', 'Daily', 'Weekly'];

export const modeOf = ({ web, email }) => {
  if (web && email) {
    return MODES.BOTH;
  }
  if (web) {
    return MODES.WEB;
  }
  return email ? MODES.EMAIL : MODES.OFF;
};

export const channelsOf = (mode) => ({
  web: mode === MODES.WEB || mode === MODES.BOTH,
  email: mode === MODES.EMAIL || mode === MODES.BOTH,
});

const apiUrl = (path) => `${getConfig().LMS_BASE_URL}/api/notifications/${path}`;

const robboUrl = (path) => `${getConfig().LMS_BASE_URL}/api/robbo/v1/notifications/${path}`;

// «Для всех курсов» is stored on the LMS (robbo_account.py): its own settings, not an aggregate of
// the courses. A course keeps the stock per-course API.
const fetchScope = async (courseId) => {
  if (!courseId) {
    const { data } = await getAuthenticatedHttpClient().get(robboUrl('account-settings/'));
    return data.data;
  }
  const { data } = await getAuthenticatedHttpClient().get(apiUrl(`configurations/${courseId}`));
  return data.notification_preference_config;
};

const saveChannel = async (courseId, app, type, channel, value) => {
  const body = {
    notification_app: app,
    notification_type: type,
    notification_channel: channel,
    value,
  };
  if (courseId) {
    await getAuthenticatedHttpClient().patch(apiUrl(`configurations/${courseId}`), body);
    return;
  }
  // Changes the stored settings and the courses that still follow them; courses with their own
  // value keep it.
  await getAuthenticatedHttpClient().post(robboUrl('account-settings/'), body);
};

// Robbo types in a reading order (the LMS keeps none): learner, then team, then Studio.
const TYPE_ORDER = [
  'learner_deadline_soon', 'learner_section_released', 'learner_grade_changed', 'learner_certificate_issued',
  'learner_added_to_course', 'learner_enrolled', 'learner_test_completed', 'learner_low_score',
  'learner_all_tests_completed', 'learner_ora_submitted', 'learner_all_ora_submitted', 'learner_course_completed', 'learner_missed_deadline',
  'submission_review_overdue', 'learner_inactive', 'learner_unenrolled', 'course_weekly_report',
  'added_to_course_team', 'course_published_by_coauthor', 'course_import_export',
];
const typeRank = (typeId) => {
  const rank = TYPE_ORDER.indexOf(typeId);
  return rank === -1 ? -1 : rank;
};

/** Apps → visible types (stock types in the LMS order, learner progress in TYPE_ORDER). Push is not offered. */
export const scopeApps = (config) => Object.entries(config || {}).map(([appId, app]) => ({
  id: appId,
  types: Object.entries(app.notification_types || {})
    .filter(([typeId]) => typeId !== 'core' || (app.core_notification_types || []).length > 0)
    .sort(([a], [b]) => typeRank(a) - typeRank(b))
    .map(([typeId, type]) => ({
      id: typeId,
      web: Boolean(type.web),
      email: Boolean(type.email),
      cadence: type.email_cadence,
      info: type.info || '',
      locked: app.non_editable?.[typeId] || [],
    })),
})).filter((app) => app.types.length > 0);

/**
 * { status: 'loading'|'ready'|'failed', apps, error, saveError, setMode, setCadence, reload }.
 * `revision` reloads quietly (another scope changed); `onChanged` fires after every save.
 */
const useScopePreferences = (courseId, { revision = 0, onChanged } = {}) => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const reload = useCallback(async (quiet = false) => {
    if (!quiet) {
      setStatus('loading');
    }
    try {
      setConfig(await fetchScope(courseId));
      setStatus('ready');
      setError(null);
    } catch (err) {
      setError(err);
      setStatus('failed');
    }
  }, [courseId]);

  useEffect(() => {
    reload(false);
  }, [reload]);

  useEffect(() => {
    if (revision > 0) {
      reload(true);
    }
  }, [revision]); // eslint-disable-line react-hooks/exhaustive-deps

  const patchLocal = (appId, typeId, changes) => setConfig((prev) => ({
    ...prev,
    [appId]: {
      ...prev[appId],
      notification_types: {
        ...prev[appId].notification_types,
        [typeId]: { ...prev[appId].notification_types[typeId], ...changes },
      },
    },
  }));

  const run = useCallback(async (appId, typeId, changes, requests) => {
    const before = config[appId].notification_types[typeId];
    setSaveError(null);
    patchLocal(appId, typeId, changes);
    try {
      // Sequential: the LMS rewrites the whole config on every call.
      // eslint-disable-next-line no-restricted-syntax
      for (const [channel, value] of requests) {
        // eslint-disable-next-line no-await-in-loop
        await saveChannel(courseId, appId, typeId, channel, value);
      }
      if (onChanged) {
        onChanged(courseId);
      }
    } catch (err) {
      patchLocal(appId, typeId, before);
      setSaveError(err);
      reload(true);
    }
  }, [config, courseId, onChanged, reload]);

  const setMode = useCallback((appId, typeId, mode) => {
    const current = config[appId].notification_types[typeId];
    const next = channelsOf(mode);
    const requests = ['web', 'email']
      .filter((channel) => Boolean(current[channel]) !== next[channel])
      .map((channel) => [channel, next[channel]]);
    // Email switched on with no usable cadence: send it right away by default.
    const changes = { ...next };
    if (next.email && !current.email && !CADENCES.includes(current.email_cadence)) {
      requests.push(['email_cadence', 'Immediately']);
      changes.email_cadence = 'Immediately';
    }
    if (requests.length) {
      run(appId, typeId, changes, requests);
    }
  }, [config, run]);

  const setCadence = useCallback((appId, typeId, cadence) => {
    run(appId, typeId, { email_cadence: cadence }, [['email_cadence', cadence]]);
  }, [run]);

  return {
    status, apps: scopeApps(config), error, saveError, setMode, setCadence, reload,
  };
};

export default useScopePreferences;
