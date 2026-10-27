/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Notification settings of one scope (all courses or one course). Each type gets a mode —
 * «Нет / На сайте / По почте / Везде» — and, when email is on, how often letters come.
 * Types only the course team gets (learner progress, ORA to grade, reports) are set apart.
 */
import React, {
  useLayoutEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import camelCase from 'lodash.camelcase';
import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, OverlayTrigger, Spinner, Tooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import { RobboErrorNotice } from '../robbo-errors';
import useScopePreferences, {
  CADENCES, MODES, channelsOf, modeOf,
} from './data/scopePreferences';
import messages from './messages';

// Apps only the course team gets (robbo, LMS notifications/base_notification.py).
export const TEAM_APPS = new Set(['learner_progress', 'authoring']);
// Course-team types inside the stock apps.
const TEAM_TYPES = new Set(['ora_staff_notifications', 'content_reported']);
const MODE_ORDER = [MODES.OFF, MODES.WEB, MODES.EMAIL, MODES.BOTH];

// The picked option is marked by one «thumb» under the options that slides to it (position and width
// measured from the option itself, so long or translated labels fit). The text keeps one weight:
// picking does not make it wider.
const useThumb = (containerRef, mode) => {
  const [thumb, setThumb] = useState(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const measure = () => {
      const active = container.querySelector('.notification-mode__option--active');
      if (!active) {
        setThumb(null);
        return;
      }
      setThumb({
        x: active.offsetLeft, y: active.offsetTop, w: active.offsetWidth, h: active.offsetHeight,
      });
    };
    measure();
    // The first position is set without sliding from the corner.
    const frame = window.requestAnimationFrame(() => {
      placed.current = true;
    });
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(container);
    }
    return () => {
      window.cancelAnimationFrame(frame);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [containerRef, mode]);

  return { thumb, animated: placed.current };
};

const thumbStyle = (thumb) => ({
  '--thumb-x': `${thumb.x}px`,
  '--thumb-y': `${thumb.y}px`,
  '--thumb-w': `${thumb.w}px`,
  '--thumb-h': `${thumb.h}px`,
});

const ModePicker = ({
  name, label, mode, locked, onChange,
}) => {
  const intl = useIntl();
  const containerRef = useRef(null);
  const { thumb, animated } = useThumb(containerRef, mode);
  const current = channelsOf(mode);
  // A locked channel (non_editable in the LMS) keeps its value: modes that would change it are off.
  const allowed = (option) => {
    const next = channelsOf(option);
    return locked.every((channel) => next[channel] === undefined || next[channel] === current[channel]);
  };
  return (
    <div className="notification-mode" role="radiogroup" aria-label={label} ref={containerRef}>
      {thumb && (
        <span
          aria-hidden="true"
          className={classNames('notification-mode__thumb', { 'notification-mode__thumb--animated': animated })}
          // Geometry only (custom properties); the look lives in index.scss.
          style={thumbStyle(thumb)}
        />
      )}
      {MODE_ORDER.map((option) => (
        <label
          key={option}
          htmlFor={`${name}-${option}`}
          className={classNames('notification-mode__option', {
            'notification-mode__option--active': option === mode,
            'notification-mode__option--disabled': !allowed(option),
          })}
        >
          <input
            id={`${name}-${option}`}
            type="radio"
            name={name}
            value={option}
            checked={option === mode}
            disabled={!allowed(option)}
            onChange={() => onChange(option)}
          />
          <span>{intl.formatMessage(messages.notificationMode, { mode: option })}</span>
        </label>
      ))}
      {/* The same labels in the picked colour, cut out by the thumb's shape: the colour slides with
          the thumb instead of jumping to the new option. Decorative, so hidden from screen readers. */}
      {thumb && (
        <span
          aria-hidden="true"
          className={classNames('notification-mode__highlight', {
            'notification-mode__highlight--animated': animated,
          })}
          style={thumbStyle(thumb)}
        >
          {MODE_ORDER.map((option) => (
            <span key={option} className="notification-mode__option notification-mode__option--copy">
              <span>{intl.formatMessage(messages.notificationMode, { mode: option })}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
};

ModePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(MODE_ORDER).isRequired,
  locked: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

const ScopeEditor = ({
  courseId, revision, onChanged,
}) => {
  const intl = useIntl();
  const {
    status, apps, error, saveError, setMode, setCadence,
  } = useScopePreferences(courseId, { revision, onChanged });

  if (status === 'loading') {
    return (
      <div className="notification-editor__loading">
        <Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.notificationLoading)} />
      </div>
    );
  }
  if (status === 'failed') {
    return <RobboErrorNotice error={error} />;
  }

  const typeTitle = (typeId) => intl.formatMessage(messages.notificationTitle, { text: camelCase(typeId) });
  const typeInfo = (type) => intl.formatMessage(messages.notificationInfo, { id: camelCase(type.id) }) || type.info;
  const scopeKey = courseId || 'account';

  return (
    <div className="notification-editor">
      {saveError && <RobboErrorNotice error={saveError} className="mb-3" />}

      {apps.map((app) => {
        const teamApp = TEAM_APPS.has(app.id);
        return (
          <section
            key={app.id}
            className={classNames('notification-editor__app', { 'notification-editor__app--team': teamApp })}
            aria-label={intl.formatMessage(messages.notificationAppTitle, { key: app.id })}
          >
            <h4 className="notification-editor__app-title">
              {intl.formatMessage(messages.notificationAppTitle, { key: app.id })}
              {teamApp && <span className="notification-team-chip">{intl.formatMessage(messages.notificationTeamOnly)}</span>}
            </h4>
            <ul className="notification-editor__types">
              {app.types.map((type) => {
                const mode = modeOf(type);
                const info = typeInfo(type);
                return (
                  <li key={type.id} className="notification-editor__type">
                    <div className="notification-editor__type-name">
                      <span>{typeTitle(type.id)}</span>
                      {!teamApp && TEAM_TYPES.has(type.id) && (
                        <span className="notification-team-chip">{intl.formatMessage(messages.notificationTeamOnly)}</span>
                      )}
                      {info && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`${scopeKey}-${type.id}-info`}>{info}</Tooltip>}
                        >
                          <button type="button" className="notification-editor__info" aria-label={info}>
                            <Icon src={InfoOutline} />
                          </button>
                        </OverlayTrigger>
                      )}
                    </div>
                    <div className="notification-editor__controls">
                      <ModePicker
                        name={`${scopeKey}-${app.id}-${type.id}`}
                        label={typeTitle(type.id)}
                        mode={mode}
                        locked={type.locked}
                        onChange={(next) => setMode(app.id, type.id, next)}
                      />
                      {channelsOf(mode).email && (
                        <label
                          className="notification-editor__cadence"
                          htmlFor={`${scopeKey}-${app.id}-${type.id}-cadence`}
                        >
                          <span>{intl.formatMessage(messages.notificationCadenceLabel)}</span>
                          <select
                            id={`${scopeKey}-${app.id}-${type.id}-cadence`}
                            value={CADENCES.includes(type.cadence) ? type.cadence : 'Immediately'}
                            onChange={(event) => setCadence(app.id, type.id, event.target.value)}
                          >
                            {CADENCES.map((cadence) => (
                              <option key={cadence} value={cadence}>
                                {intl.formatMessage(messages.emailCadence, { text: cadence })}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

ScopeEditor.propTypes = {
  courseId: PropTypes.string.isRequired,
  revision: PropTypes.number,
  onChanged: PropTypes.func,
};

ScopeEditor.defaultProps = {
  revision: 0,
  onChanged: undefined,
};

export default ScopeEditor;
