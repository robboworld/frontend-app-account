/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 *
 * /account/notifications — the learner's notifications; the header bell shows the latest ones.
 * Filters by app with "new" badges, groups by day, marks everything seen on open and an item
 * read when it is followed. Settings stay on /account/#notifications.
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { HashLink } from 'react-router-hash-link';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { Button, Icon, Spinner } from '@openedx/paragon';
import { DoneAll, NotificationsNone, Settings } from '@openedx/paragon/icons';

import { RobboErrorNotice } from '../robbo-errors';
import {
  getNotificationCounts, getNotifications, markAppRead, markAppSeen, markNotificationRead,
} from './data/api';
import { getCourses } from '../notification-preferences/data/robboApi';
import messages from './messages';
import NotificationItem from './NotificationItem';

const ALL = 'all';
const APP_ORDER = ['updates', 'learning', 'grading', 'discussion', 'learner_progress', 'authoring'];
// Apps only the course team gets: their filter is shown to the team (or while such notifications are new).
const TEAM_APPS = new Set(['learner_progress', 'authoring']);

const dayKey = (iso) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const useDayLabel = () => {
  const intl = useIntl();
  return useCallback((iso) => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (dayKey(iso) === dayKey(now.toISOString())) {
      return intl.formatMessage(messages.today);
    }
    if (dayKey(iso) === dayKey(yesterday.toISOString())) {
      return intl.formatMessage(messages.yesterday);
    }
    const sameYear = new Date(iso).getFullYear() === now.getFullYear();
    return intl.formatDate(iso, { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) });
  }, [intl]);
};

const NotificationsPage = () => {
  const intl = useIntl();
  const dayLabel = useDayLabel();
  const [counts, setCounts] = useState(null);
  const [filter, setFilter] = useState(ALL);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const seenSent = useRef(false);

  const [isTeam, setIsTeam] = useState(false);

  useEffect(() => {
    getNotificationCounts().then(setCounts).catch((err) => {
      setError(err);
      setLoading(false);
    });
    getCourses().then((courses) => setIsTeam(courses.some((course) => course.team))).catch(logError);
  }, []);

  const apps = useMemo(() => {
    const byApp = counts?.countByAppName || {};
    const shown = (app) => !TEAM_APPS.has(app) || isTeam || byApp[app] > 0;
    return APP_ORDER.filter((app) => app in byApp).concat(
      Object.keys(byApp).filter((app) => !APP_ORDER.includes(app)),
    ).filter(shown);
  }, [counts, isTeam]);

  // Opening the page resets the "new" counters; the badges keep the numbers seen on arrival.
  useEffect(() => {
    if (!counts || seenSent.current) {
      return;
    }
    seenSent.current = true;
    const unseenApps = Object.entries(counts.countByAppName || {})
      .filter(([, count]) => count > 0)
      .map(([app]) => app);
    if (!unseenApps.length) {
      return;
    }
    Promise.all(unseenApps.map((app) => markAppSeen(app).catch(logError)))
      // The header bell (robbo-layout/notificationsBell.jsx) refreshes its counter on this event.
      .then(() => window.dispatchEvent(new Event('robbo:notifications-changed')));
  }, [counts]);

  const load = useCallback(async (appName, pageNumber) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({ appName: appName === ALL ? '' : appName, page: pageNumber });
      setItems((prev) => (pageNumber === 1 ? data.results : prev.concat(data.results)));
      setHasMore(Boolean(data.next));
      setPage(pageNumber);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (counts?.showNotificationsTray) {
      load(filter, 1);
    } else if (counts) {
      setLoading(false);
    }
  }, [counts, filter, load]);

  const setRead = useCallback((predicate) => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((item) => (predicate(item) && !item.lastRead ? { ...item, lastRead: now } : item)));
  }, []);

  // A tick or «Прочитать все» in the header bell (robbo-notifications.js) while this page is open.
  useEffect(() => {
    const onBellRead = (event) => {
      const { ids, all } = event.detail || {};
      if (all) {
        setRead(() => true);
      } else if (Array.isArray(ids)) {
        setRead((item) => ids.includes(item.id));
      }
    };
    window.addEventListener('robbo:notifications-read', onBellRead);
    return () => window.removeEventListener('robbo:notifications-read', onBellRead);
  }, [setRead]);

  const handleRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setRead((item) => item.id === id);
    } catch (err) {
      logError(err);
    }
  }, [setRead]);

  const handleReadAll = useCallback(async () => {
    setActionError(null);
    const targets = filter === ALL ? apps : [filter];
    try {
      await Promise.all(targets.map(markAppRead));
      setRead((item) => filter === ALL || item.appName === filter);
    } catch (err) {
      setActionError(err);
    }
  }, [apps, filter, setRead]);

  const groups = useMemo(() => {
    const result = [];
    items.forEach((item) => {
      const key = dayKey(item.created);
      const last = result[result.length - 1];
      if (last && last.key === key) {
        last.items.push(item);
      } else {
        result.push({ key, label: dayLabel(item.created), items: [item] });
      }
    });
    return result;
  }, [items, dayLabel]);

  const hasUnread = items.some((item) => !item.lastRead);
  const enabled = Boolean(counts?.showNotificationsTray);

  const renderEmpty = () => {
    let title = filter === ALL ? messages.emptyTitle : messages.emptyFilterTitle;
    if (!enabled) {
      title = messages.disabledTitle;
    }
    return (
      <div className="robbo-notifications__empty">
        <Icon src={NotificationsNone} className="robbo-notifications__empty-icon" aria-hidden="true" />
        <p className="robbo-notifications__empty-title">{intl.formatMessage(title)}</p>
        <p className="robbo-notifications__empty-body">
          {intl.formatMessage(enabled ? messages.emptyBody : messages.disabledBody)}
        </p>
      </div>
    );
  };

  return (
    <div className="robbo-notifications">
      <Helmet>
        <title>{intl.formatMessage(messages.documentTitle, { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <header className="robbo-notifications__header">
        <div className="robbo-notifications__heading">
          <h1 className="robbo-notifications__title">{intl.formatMessage(messages.pageTitle)}</h1>
          {counts && (
            <p className="robbo-notifications__description">
              {intl.formatMessage(messages.pageDescription, { days: counts.notificationExpiryDays || 60 })}
            </p>
          )}
        </div>
        <div className="robbo-notifications__actions">
          {enabled && hasUnread && (
            <Button variant="outline-primary" size="sm" iconBefore={DoneAll} onClick={handleReadAll}>
              {intl.formatMessage(messages.markAllRead)}
            </Button>
          )}
          <HashLink className="robbo-notifications__settings-link" to="/#notifications">
            <Icon src={Settings} aria-hidden="true" />
            {intl.formatMessage(messages.settingsLink)}
          </HashLink>
        </div>
      </header>

      {enabled && apps.length > 1 && (
        <div className="robbo-notifications__filters" role="group" aria-label={intl.formatMessage(messages.filterAria)}>
          {[ALL, ...apps].map((app) => {
            const newCount = app === ALL ? counts.count : counts.countByAppName[app];
            return (
              <button
                key={app}
                type="button"
                className="robbo-notifications__filter"
                aria-pressed={filter === app}
                onClick={() => setFilter(app)}
              >
                {intl.formatMessage(messages.filterName, { app })}
                {newCount > 0 && (
                  <span className="robbo-notifications__badge">
                    <span aria-hidden="true">{newCount}</span>
                    <span className="sr-only">{intl.formatMessage(messages.filterNewCount, { count: newCount })}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {actionError && (
        <RobboErrorNotice error={actionError} className="mb-3" onDismiss={() => setActionError(null)} />
      )}
      {error && <RobboErrorNotice error={error} className="mb-3" />}

      {groups.map((group) => (
        <section key={group.key} className="robbo-notifications__group" aria-label={group.label}>
          <h2 className="robbo-notifications__day">{group.label}</h2>
          <ul className="robbo-notifications__list">
            {group.items.map((item) => (
              <NotificationItem key={item.id} notification={item} onRead={handleRead} />
            ))}
          </ul>
        </section>
      ))}

      {loading && (
        <div className="robbo-notifications__loading">
          <Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} />
        </div>
      )}
      {!loading && !error && items.length === 0 && renderEmpty()}
      {!loading && hasMore && (
        <div className="robbo-notifications__more">
          <Button variant="outline-primary" onClick={() => load(filter, page + 1)}>
            {intl.formatMessage(messages.loadMore)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
