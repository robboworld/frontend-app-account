/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * Progress of a bulk action in the notification settings («Отключить все», «Сбросить свои настройки
 * во всех курсах»): a line of text and a bar — filled step by step when the number of steps is known,
 * a running stripe otherwise — so a slow action does not look frozen. BusyLabel is the same idea
 * inside a button.
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Spinner } from '@openedx/paragon';

export const BusyLabel = ({ busy, children }) => (
  <span className="notification-busy">
    {busy && <Spinner animation="border" size="sm" className="notification-busy__spinner" aria-hidden="true" />}
    {children}
  </span>
);

BusyLabel.propTypes = {
  busy: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

const ActionProgress = ({ label, done, total }) => {
  const determinate = Number.isFinite(total) && total > 0;
  const percent = determinate ? Math.round((done / total) * 100) : null;
  return (
    <div className="notification-progress">
      <p className="notification-progress__label" aria-live="polite">{label}</p>
      <div
        // Known length: the bar fills step by step and a glint keeps running over the track, so the
        // first slow step does not look frozen. Unknown length: a stripe runs along the track.
        className={classNames('notification-progress__track', {
          'notification-progress__track--running': !determinate,
          'notification-progress__track--working': determinate && done < total,
        })}
        role="progressbar"
        aria-label={label}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? 100 : undefined}
        aria-valuenow={determinate ? percent : undefined}
      >
        <span
          className="notification-progress__bar"
          // Bar length only; the look lives in index.scss.
          style={determinate ? { '--progress': `${percent}%` } : undefined}
        />
      </div>
    </div>
  );
};

ActionProgress.propTypes = {
  label: PropTypes.string.isRequired,
  done: PropTypes.number,
  total: PropTypes.number,
};

ActionProgress.defaultProps = {
  done: 0,
  total: undefined,
};

export default ActionProgress;
