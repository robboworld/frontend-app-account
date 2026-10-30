/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * One notification: what happened, the course and the time. The whole card is a link to
 * content_url; following it marks the notification read first (read != seen: "seen" only
 * resets the new-counter when the page is opened).
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import {
  Campaign, Assignment, Grading, Forum, Flag, HowToReg, Event, EventBusy, EmojiEvents, MenuBook, Groups, PersonAdd,
  PersonRemove, TrendingDown, PersonOff, HourglassTop, BarChart, Publish, ImportExport, School,
} from '@openedx/paragon/icons';

import messages from './messages';
import notificationText from './notificationText';

const TYPE_ICONS = {
  course_updates: Campaign,
  ora_staff_notifications: Assignment,
  ora_grade_assigned: Grading,
  content_reported: Flag,
  learner_progress: HowToReg,
  learner_deadline_soon: Event,
  learner_section_released: MenuBook,
  learner_certificate_issued: EmojiEvents,
  learner_certificate_offer: EmojiEvents,
  learner_grade_changed: Grading,
  learner_added_to_course: School,
  learner_enrolled: PersonAdd,
  learner_unenrolled: PersonRemove,
  learner_low_score: TrendingDown,
  learner_missed_deadline: EventBusy,
  learner_inactive: PersonOff,
  submission_review_overdue: HourglassTop,
  course_weekly_report: BarChart,
  course_published_by_coauthor: Publish,
  course_import_export: ImportExport,
  added_to_course_team: Groups,
};

// learner_progress types without a caption and icon of their own share «Прогресс ученика».
const OWN_LOOK = new Set(Object.keys(TYPE_ICONS));

const isPlainLeftClick = (event) => (
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
);

const NotificationItem = ({ notification, onRead }) => {
  const intl = useIntl();
  const {
    id, notificationType, appName, contentUrl, contentContext = {}, lastRead, created,
  } = notification;
  // learner_* types (course team) share one caption and icon.
  const group = appName === 'learner_progress' && !OWN_LOOK.has(notificationType)
    ? 'learner_progress' : notificationType;
  const unread = !lastRead;
  const courseName = contentContext.courseName || notification.courseName || '';

  const handleClick = useCallback(async (event) => {
    if (!unread) {
      return;
    }
    if (!isPlainLeftClick(event) || !contentUrl) {
      onRead(id);
      return;
    }
    event.preventDefault();
    await onRead(id);
    window.location.assign(contentUrl);
  }, [unread, contentUrl, onRead, id]);

  const body = (
    <>
      <span className="robbo-notifications__icon" aria-hidden="true">
        <Icon src={TYPE_ICONS[group] || Forum} />
      </span>
      <span className="robbo-notifications__body">
        <span className="robbo-notifications__type">
          {intl.formatMessage(messages.typeLabel, { type: group })}
        </span>
        <span className="robbo-notifications__text">{notificationText(intl, notification)}</span>
        <span className="robbo-notifications__meta">
          {courseName && <span className="robbo-notifications__course">{courseName}</span>}
          <time dateTime={created}>
            {intl.formatTime(created, { hour: '2-digit', minute: '2-digit' })}
          </time>
        </span>
      </span>
      {unread && (
        <span className="robbo-notifications__dot">
          <span className="sr-only">{intl.formatMessage(messages.unread)}</span>
        </span>
      )}
    </>
  );

  const className = classNames('robbo-notifications__item', { 'robbo-notifications__item--unread': unread });

  return (
    <li className="robbo-notifications__row">
      {contentUrl ? (
        <a className={className} href={contentUrl} onClick={handleClick}>{body}</a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    notificationType: PropTypes.string.isRequired,
    appName: PropTypes.string,
    content: PropTypes.string,
    contentUrl: PropTypes.string,
    contentContext: PropTypes.shape({}),
    courseName: PropTypes.string,
    lastRead: PropTypes.string,
    created: PropTypes.string.isRequired,
  }).isRequired,
  onRead: PropTypes.func.isRequired,
};

export default React.memo(NotificationItem);
