/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Course team only (the row shows it for team courses; the LMS refuses learners): which learners of
 * the course the member gets notifications about — all, or only selected ones. Narrows learner
 * progress and «Новые ответы на проверку» (LMS robbo_followers.py). Saved on every change.
 */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Close, Search } from '@openedx/paragon/icons';

import { RobboErrorNotice } from '../robbo-errors';
import { getCourseLearners, setCourseLearners } from './data/robboApi';
import messages from './messages';

const SEARCH_DELAY = 300;

const learnerName = (learner) => learner.name || learner.username;

const LearnerFollow = ({ courseId }) => {
  const intl = useIntl();
  const [state, setState] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      getCourseLearners(courseId, query)
        .then((data) => !cancelled && setState(data))
        .catch((err) => !cancelled && setError(err));
    }, query ? SEARCH_DELAY : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [courseId, query]);

  const selectedIds = useMemo(() => (state?.selected || []).map((learner) => learner.id), [state]);

  const save = useCallback(async (mode, ids) => {
    setSaving(true);
    setError(null);
    try {
      const data = await setCourseLearners(courseId, mode, ids);
      // Keep the current search results, take the saved selection.
      setState((prev) => ({
        ...data,
        learners: (prev?.learners || []).map((learner) => ({
          ...learner, followed: data.mode === 'all' || ids.includes(learner.id),
        })),
      }));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }, [courseId]);

  if (!state) {
    return null;
  }
  const selectedMode = state.mode === 'selected';
  const toggle = (learner) => {
    const ids = learner.followed && selectedMode
      ? selectedIds.filter((id) => id !== learner.id)
      : [...new Set([...selectedIds, learner.id])];
    save('selected', ids);
  };

  return (
    <fieldset className="notification-learners" disabled={saving}>
      <legend className="notification-learners__title">{intl.formatMessage(messages.notificationLearnersTitle)}</legend>
      <p className="notification-learners__hint">{intl.formatMessage(messages.notificationLearnersHint)}</p>
      <div className="notification-learners__modes">
        <label htmlFor={`learners-all-${courseId}`}>
          <input
            id={`learners-all-${courseId}`}
            type="radio"
            name={`learners-${courseId}`}
            checked={!selectedMode}
            onChange={() => save('all', [])}
          />
          {intl.formatMessage(messages.notificationLearnersAll, { count: state.total })}
        </label>
        <label htmlFor={`learners-selected-${courseId}`}>
          <input
            id={`learners-selected-${courseId}`}
            type="radio"
            name={`learners-${courseId}`}
            checked={selectedMode}
            onChange={() => save('selected', selectedIds)}
          />
          {intl.formatMessage(messages.notificationLearnersSelected, { count: selectedIds.length })}
        </label>
      </div>
      {error && <RobboErrorNotice error={error} className="mb-2" />}
      {selectedMode && (
        <>
          {selectedIds.length === 0 && (
            <p className="notification-learners__warning">{intl.formatMessage(messages.notificationLearnersNone)}</p>
          )}
          {selectedIds.length > 0 && (
            <ul className="notification-learners__chips">
              {state.selected.map((learner) => (
                <li key={learner.id}>
                  <span>{learnerName(learner)}</span>
                  <button
                    type="button"
                    aria-label={intl.formatMessage(messages.notificationLearnersRemove, { name: learnerName(learner) })}
                    onClick={() => save('selected', selectedIds.filter((id) => id !== learner.id))}
                  >
                    <Icon src={Close} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="notification-learners__search">
            <Icon src={Search} aria-hidden="true" />
            <input
              type="search"
              value={query}
              aria-label={intl.formatMessage(messages.notificationLearnersSearch)}
              placeholder={intl.formatMessage(messages.notificationLearnersSearch)}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <ul className="notification-learners__list">
            {state.learners.map((learner) => (
              <li key={learner.id}>
                <label htmlFor={`learner-${courseId}-${learner.id}`}>
                  <input
                    id={`learner-${courseId}-${learner.id}`}
                    type="checkbox"
                    checked={selectedIds.includes(learner.id)}
                    onChange={() => toggle({ ...learner, followed: selectedIds.includes(learner.id) })}
                  />
                  <span className="notification-learners__name">{learnerName(learner)}</span>
                  {learner.name && <span className="notification-learners__login">{learner.username}</span>}
                </label>
              </li>
            ))}
            {state.learners.length === 0 && (
              <li className="notification-learners__empty">{intl.formatMessage(messages.notificationLearnersEmpty)}</li>
            )}
          </ul>
          {state.total > state.learners.length && (
            <p className="notification-learners__hint">
              {intl.formatMessage(messages.notificationLearnersMore, {
                shown: state.learners.length, total: state.total,
              })}
            </p>
          )}
        </>
      )}
    </fieldset>
  );
};

LearnerFollow.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default LearnerFollow;
