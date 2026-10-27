import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  ActionRow, AlertModal, Button, Container, Icon,
} from '@openedx/paragon';
import { Notifications, NotificationsOff } from '@openedx/paragon/icons';

import { selectShowPreferences } from './data/selectors';
import messages from './messages';
import NotificationScopes from './NotificationScopes';
import ActionProgress, { BusyLabel } from './ActionProgress';
import { disableAllNotifications } from './data/robboApi';
import { RobboErrorNotice } from '../robbo-errors';
import { useFeedbackWrapper } from '../hooks';
import { feedMessages, getNotificationCounts } from '../notifications-feed';

const NotificationSettings = () => {
  useFeedbackWrapper();
  const intl = useIntl();
  const showPreferences = useSelector(selectShowPreferences());
  const [newCount, setNewCount] = useState(0);

  // Robbo: the notifications page (/account/notifications) is reached from here; the badge is the unseen count.
  useEffect(() => {
    if (!showPreferences) {
      return;
    }
    getNotificationCounts().then((data) => setNewCount(data.count || 0)).catch(logError);
  }, [showPreferences]);

  // Robbo: «Отключить все уведомления» — every type of every course to «Нет» (LMS robbo_notifications).
  const [confirmOff, setConfirmOff] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState(null);
  const [disabledDone, setDisabledDone] = useState(false);
  // Bumped after «Отключить все»: the open settings panels reload.
  const [resetKey, setResetKey] = useState(0);

  const disableAll = async () => {
    setDisabling(true);
    setDisableError(null);
    try {
      await disableAllNotifications();
      setDisabledDone(true);
      setResetKey((key) => key + 1);
      setConfirmOff(false);
    } catch (err) {
      setDisableError(err);
    } finally {
      setDisabling(false);
    }
  };

  return (
    showPreferences && (
      <Container className="notification-preferences px-0">
        <div className="notification-preferences__header">
          <h2 className="notification-heading">
            {intl.formatMessage(messages.notificationHeading)}
          </h2>
          <Link to="/notifications" className="btn btn-outline-primary notification-preferences__feed-link">
            <Icon src={Notifications} aria-hidden="true" />
            {intl.formatMessage(feedMessages.openAll)}
            {newCount > 0 && (
              <span className="robbo-notifications__badge">
                {intl.formatMessage(feedMessages.openAllNew, { count: newCount })}
              </span>
            )}
          </Link>
        </div>
        <div className="mb-4">
          <div className="text-gray-700 font-size-14 mb-2">
            {intl.formatMessage(messages.accountNotificationDescription)}
          </div>
          {/* Robbo: when letters come; the English edX learner guide link is dropped. */}
          <div className="text-gray-700 font-size-14 mb-2">
            {intl.formatMessage(messages.notificationCadenceDescription, {
              dailyTime: intl.formatMessage(messages.notificationDailyTime),
              weeklyTime: intl.formatMessage(messages.notificationWeeklyTime),
            })}
          </div>
        </div>
        <div className="notification-disable-all">
          <Button variant="outline-primary" size="sm" iconBefore={NotificationsOff} onClick={() => setConfirmOff(true)}>
            {intl.formatMessage(messages.notificationDisableAll)}
          </Button>
          <span className="notification-disable-all__status" role="status">
            {disabledDone && intl.formatMessage(messages.notificationDisableAllDone)}
          </span>
        </div>
        {disableError && <RobboErrorNotice error={disableError} className="mb-3" />}
        <AlertModal
          title={intl.formatMessage(messages.notificationDisableAllTitle)}
          isOpen={confirmOff}
          // While switching off the dialog stays open: it shows the progress.
          isBlocking={disabling}
          onClose={() => !disabling && setConfirmOff(false)}
          footerNode={(
            <ActionRow>
              <Button variant="tertiary" disabled={disabling} onClick={() => setConfirmOff(false)}>
                {intl.formatMessage(messages.notificationDisableAllCancel)}
              </Button>
              <Button variant="primary" disabled={disabling} aria-busy={disabling} onClick={disableAll}>
                <BusyLabel busy={disabling}>
                  {intl.formatMessage(
                    disabling ? messages.notificationDisableAllBusy : messages.notificationDisableAllConfirm,
                  )}
                </BusyLabel>
              </Button>
            </ActionRow>
          )}
        >
          {disabling ? (
            <ActionProgress label={intl.formatMessage(messages.notificationDisableAllProgress)} />
          ) : (
            <p>{intl.formatMessage(messages.notificationDisableAllBody)}</p>
          )}
        </AlertModal>
        {/* Robbo: heading and text above the card, like the other account sections. */}
        <div className="notification-preferences__card">
          <NotificationScopes resetKey={resetKey} onChanged={() => setDisabledDone(false)} />
        </div>
      </Container>
    )
  );
};

export default NotificationSettings;
