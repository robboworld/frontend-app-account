/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Where the settings apply (replaces the upstream course dropdown): «Для всех курсов» and every
 * course as a row with its status («Свои настройки» / «Как для всех»). The «Для всех курсов» panel
 * and one course open independently; each runs its own ScopeEditor. A change in one scope reloads
 * the others (an account-wide change rewrites every course). A course with its own settings can be
 * put back to the account-wide ones.
 */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  ActionRow, AlertModal, Button, Icon,
} from '@openedx/paragon';
import {
  ExpandLess, ExpandMore, Restore, Search,
} from '@openedx/paragon/icons';

import { RobboErrorNotice } from '../robbo-errors';
import { getCourses, resetCourses } from './data/robboApi';
import messages from './messages';
import ScopeEditor from './ScopeEditor';
import LearnerFollow from './LearnerFollow';
import ActionProgress, { BusyLabel } from './ActionProgress';

const ACCOUNT_SCOPE = '';
// Search and sorting above the course rows once there is more than one course.
const TOOLBAR_FROM = 2;
export const SORTS = ['nameAsc', 'nameDesc', 'learners', 'newest', 'oldest'];
// Learners see names only: start dates and learner numbers are for the course team and global staff /
// admins (the LMS sends them with details = true), so sorting by them is for them too.
const LEARNER_SORTS = ['nameAsc', 'nameDesc'];
const SORT_STORAGE_KEY = 'robbo.notifications.courseSort';

const readSort = () => {
  try {
    const saved = window.localStorage.getItem(SORT_STORAGE_KEY);
    return SORTS.includes(saved) ? saved : 'nameAsc';
  } catch (e) {
    return 'nameAsc';
  }
};

const saveSort = (sort) => {
  try {
    window.localStorage.setItem(SORT_STORAGE_KEY, sort);
  } catch (e) {
    // Private mode: the choice lasts until the page reloads.
  }
};

// Course age: its start date, else when it appeared on the site.
const courseTime = (course) => Date.parse(course.start || course.created || '') || 0;

const sortCourses = (courses, sort, collator) => {
  const byName = (a, b) => collator.compare(a.name || '', b.name || '');
  const comparators = {
    nameAsc: byName,
    nameDesc: (a, b) => byName(b, a),
    learners: (a, b) => ((b.learners ?? -1) - (a.learners ?? -1)) || byName(a, b),
    newest: (a, b) => (courseTime(b) - courseTime(a)) || byName(a, b),
    oldest: (a, b) => (courseTime(a) - courseTime(b)) || byName(a, b),
  };
  return [...courses].sort(comparators[sort] || byName);
};

const ScopeRow = ({
  id, title, hint, status, open, onToggle, children,
}) => {
  const panelId = `notification-scope-${id || 'account'}`;
  return (
    <li className={classNames('notification-scope', { 'notification-scope--open': open })}>
      <button
        type="button"
        className="notification-scope__head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="notification-scope__title">
          <span className="notification-scope__name">{title}</span>
          {hint && <span className="notification-scope__hint">{hint}</span>}
        </span>
        {status}
        <Icon src={open ? ExpandLess : ExpandMore} className="notification-scope__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="notification-scope__body" id={panelId}>
          {children}
        </div>
      )}
    </li>
  );
};

ScopeRow.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  hint: PropTypes.node,
  status: PropTypes.node,
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

ScopeRow.defaultProps = {
  hint: null,
  status: null,
};

const NotificationScopes = ({ resetKey, onChanged }) => {
  const intl = useIntl();
  const [coursesList, setCoursesList] = useState(null);
  const [coursesError, setCoursesError] = useState(null);
  const [accountOpen, setAccountOpen] = useState(true);
  const [openCourseId, setOpenCourseId] = useState(null);
  // Bumped after every save; every open scope except the one that saved reloads quietly.
  const [revision, setRevision] = useState({ n: 0, by: null });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(readSort);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);

  useEffect(() => {
    getCourses().then(setCoursesList).catch((err) => {
      setCoursesError(err);
      setCoursesList([]);
    });
  }, []);

  const hasDetails = useMemo(() => (coursesList || []).some((course) => course.details), [coursesList]);
  const sorts = hasDetails ? SORTS : LEARNER_SORTS;
  // A saved team-only sort does not apply to a learner.
  const activeSort = sorts.includes(sort) ? sort : 'nameAsc';

  const courses = useMemo(() => {
    const collator = new Intl.Collator(intl.locale, { sensitivity: 'base', numeric: true });
    return sortCourses(coursesList || [], activeSort, collator);
  }, [coursesList, activeSort, intl.locale]);

  const changeSort = useCallback((value) => {
    setSort(value);
    saveSort(value);
  }, []);

  // Start and learners only where the LMS gives them (team courses; every course for global staff).
  const courseHint = (course) => {
    if (!course.details) {
      return null;
    }
    const parts = [];
    if (course.start) {
      parts.push(intl.formatMessage(messages.notificationCourseStart, {
        date: intl.formatDate(course.start, { day: 'numeric', month: 'long', year: 'numeric' }),
      }));
    }
    parts.push(intl.formatMessage(messages.notificationCourseLearners, { count: course.learners || 0 }));
    return parts.join(' · ');
  };
  // Courses with their own settings: the LMS compares each course with the stored settings
  // «Для всех курсов» (robbo_account.py) and sends `customized`.
  const customized = useMemo(
    () => new Set((coursesList || []).filter((course) => course.customized).map((course) => course.id)),
    [coursesList],
  );
  const refresh = useCallback(() => {
    getCourses().then(setCoursesList).catch(logError);
  }, []);

  const visibleCourses = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(intl.locale);
    return needle ? courses.filter((course) => (course.name || '').toLocaleLowerCase(intl.locale).includes(needle)) : courses;
  }, [courses, query, intl.locale]);

  const toggleCourse = useCallback((courseId) => {
    setResetError(null);
    setOpenCourseId((current) => (current === courseId ? null : courseId));
  }, []);

  const handleChanged = useCallback((scopeId) => {
    setRevision((prev) => ({ n: prev.n + 1, by: scopeId }));
    refresh();
    if (onChanged) {
      onChanged();
    }
  }, [refresh, onChanged]);

  useEffect(() => {
    if (resetKey > 0) {
      setRevision((prev) => ({ n: prev.n + 1, by: null }));
      refresh();
    }
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const revisionFor = (scopeId) => (revision.by === scopeId ? 0 : revision.n);

  const handleReset = useCallback(async (courseId) => {
    setResetting(true);
    setResetError(null);
    try {
      await resetCourses([courseId]);
      setRevision((prev) => ({ n: prev.n + 1, by: null }));
      refresh();
    } catch (err) {
      setResetError(err);
    } finally {
      setResetting(false);
    }
  }, [refresh]);

  // Robbo: «Сбросить свои настройки во всех курсах» — every course with its own settings back to the
  // account-wide ones (one course after another, as «Вернуть общие настройки» does for one).
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);
  const [resetAllProgress, setResetAllProgress] = useState({ done: 0, total: 0 });
  const [resetAllError, setResetAllError] = useState(null);
  const [resetAllDone, setResetAllDone] = useState(0);

  const handleResetAll = useCallback(async () => {
    const ids = [...customized];
    setResettingAll(true);
    setResetAllError(null);
    setResetAllProgress({ done: 0, total: ids.length });
    let done = 0;
    try {
      // eslint-disable-next-line no-restricted-syntax
      for (const courseId of ids) {
        // eslint-disable-next-line no-await-in-loop
        await resetCourses([courseId]);
        done += 1;
        setResetAllProgress({ done, total: ids.length });
      }
      setConfirmResetAll(false);
    } catch (err) {
      setResetAllError(err);
    } finally {
      setResetAllDone(done);
      setResettingAll(false);
      setRevision((prev) => ({ n: prev.n + 1, by: null }));
      refresh();
    }
  }, [customized, refresh]);

  if (coursesList === null) {
    return null;
  }
  // Robbo: notifications are for everyone; without courses there is nothing to set up yet.
  if (courses.length === 0) {
    return (
      <div className="notification-scopes__none">
        {coursesError && <RobboErrorNotice error={coursesError} className="mb-3" />}
        <p className="notification-scopes__none-title">{intl.formatMessage(messages.notificationNoCoursesTitle)}</p>
        <p className="notification-scopes__courses-hint">{intl.formatMessage(messages.notificationNoCoursesBody)}</p>
      </div>
    );
  }

  const statusBadge = (courseId) => (customized.has(courseId) ? (
    <span className="notification-course-badge">{intl.formatMessage(messages.notificationCourseCustomized)}</span>
  ) : (
    <span className="notification-scope__status">{intl.formatMessage(messages.notificationCourseAsAccount)}</span>
  ));

  return (
    <div className="notification-scopes">
      <ul className="notification-scopes__list">
        <ScopeRow
          id={ACCOUNT_SCOPE}
          title={intl.formatMessage(messages.notificationAccountScopeName)}
          hint={intl.formatMessage(messages.notificationDropdownApplies)}
          open={accountOpen}
          onToggle={() => setAccountOpen((value) => !value)}
        >
          <ScopeEditor
            courseId={ACCOUNT_SCOPE}
            revision={revisionFor(ACCOUNT_SCOPE)}
            onChanged={handleChanged}
          />
        </ScopeRow>
      </ul>

      {courses.length > 0 && (
        <>
          <div className="notification-scopes__courses-head">
            <div className="notification-scopes__courses-title">
              <h3 className="notification-scopes__heading">{intl.formatMessage(messages.notificationCoursesHeading)}</h3>
              {customized.size > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  iconBefore={Restore}
                  onClick={() => {
                    setResetAllError(null);
                    setConfirmResetAll(true);
                  }}
                >
                  {intl.formatMessage(messages.notificationResetAll, { count: customized.size })}
                </Button>
              )}
            </div>
            <p className="notification-scopes__courses-hint">{intl.formatMessage(messages.notificationCoursesHint)}</p>
            <p className="notification-scopes__courses-hint" role="status">
              {resetAllDone > 0 && intl.formatMessage(messages.notificationResetAllDone, { count: resetAllDone })}
            </p>
          </div>
          {resetAllError && <RobboErrorNotice error={resetAllError} className="mb-3" />}
          <AlertModal
            title={intl.formatMessage(messages.notificationResetAllTitle)}
            isOpen={confirmResetAll}
            // While resetting the dialog stays open: it shows the progress.
            isBlocking={resettingAll}
            onClose={() => !resettingAll && setConfirmResetAll(false)}
            footerNode={(
              <ActionRow>
                <Button variant="tertiary" disabled={resettingAll} onClick={() => setConfirmResetAll(false)}>
                  {intl.formatMessage(messages.notificationDisableAllCancel)}
                </Button>
                <Button variant="primary" disabled={resettingAll} aria-busy={resettingAll} onClick={handleResetAll}>
                  <BusyLabel busy={resettingAll}>
                    {intl.formatMessage(
                      resettingAll ? messages.notificationResetAllBusy : messages.notificationResetAllConfirm,
                    )}
                  </BusyLabel>
                </Button>
              </ActionRow>
            )}
          >
            {resettingAll ? (
              <ActionProgress
                label={intl.formatMessage(messages.notificationResetAllProgress, {
                  current: Math.min(resetAllProgress.done + 1, resetAllProgress.total),
                  total: resetAllProgress.total,
                })}
                done={resetAllProgress.done}
                total={resetAllProgress.total}
              />
            ) : (
              <p>{intl.formatMessage(messages.notificationResetAllBody, { count: customized.size })}</p>
            )}
          </AlertModal>
          {coursesError && <RobboErrorNotice error={coursesError} className="mb-3" />}
          {courses.length >= TOOLBAR_FROM && (
            <div className="notification-scopes__toolbar">
              <div className="notification-scopes__search">
                <Icon src={Search} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  aria-label={intl.formatMessage(messages.notificationCourseSearch)}
                  placeholder={intl.formatMessage(messages.notificationCourseSearch)}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <label className="notification-scopes__sort" htmlFor="notification-course-sort">
                <span>{intl.formatMessage(messages.notificationCourseSortLabel)}</span>
                <select id="notification-course-sort" value={activeSort} onChange={(event) => changeSort(event.target.value)}>
                  {sorts.map((option) => (
                    <option key={option} value={option}>
                      {intl.formatMessage(messages.notificationCourseSort, { sort: option })}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <ul className="notification-scopes__list">
            {visibleCourses.map((course) => (
              <ScopeRow
                key={course.id}
                id={course.id}
                title={(
                  <>
                    {course.name}
                    {course.team && (
                      <span className="notification-team-chip notification-scope__team">
                        {intl.formatMessage(messages.notificationYouAreTeam)}
                      </span>
                    )}
                  </>
                )}
                hint={courseHint(course)}
                status={statusBadge(course.id)}
                open={course.id === openCourseId}
                onToggle={() => toggleCourse(course.id)}
              >
                {customized.has(course.id) && (
                  <div className="notification-scope__reset">
                    <span>{intl.formatMessage(messages.notificationCourseResetHint)}</span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={resetting}
                      aria-busy={resetting}
                      onClick={() => handleReset(course.id)}
                    >
                      <BusyLabel busy={resetting}>
                        {intl.formatMessage(
                          resetting ? messages.notificationCourseResetBusy : messages.notificationCourseReset,
                        )}
                      </BusyLabel>
                    </Button>
                  </div>
                )}
                {resetError && <RobboErrorNotice error={resetError} className="mb-3" />}
                {/* Course team only: which learners the member hears about. */}
                {course.team && <LearnerFollow courseId={course.id} />}
                <ScopeEditor
                  courseId={course.id}
                  revision={revisionFor(course.id)}
                  onChanged={handleChanged}
                />
              </ScopeRow>
            ))}
          </ul>
          {visibleCourses.length === 0 && (
            <p className="notification-scopes__empty">{intl.formatMessage(messages.notificationCourseSearchEmpty)}</p>
          )}
        </>
      )}
    </div>
  );
};

NotificationScopes.propTypes = {
  // Bumped after «Отключить все уведомления»: every open scope reloads.
  resetKey: PropTypes.number,
  onChanged: PropTypes.func,
};

NotificationScopes.defaultProps = {
  resetKey: 0,
  onChanged: undefined,
};

export default NotificationScopes;
