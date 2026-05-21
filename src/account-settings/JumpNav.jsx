import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { HashLink } from 'react-router-hash-link';
import Scrollspy from 'react-scrollspy';
import messages from './AccountSettingsPage.messages';

const JumpNav = ({
  intl,
}) => {
  const stickToTop = useWindowSize().width > breakpoints.small.minWidth;
  const [currentSectionId, setCurrentSectionId] = useState('basic-information');

  const handleScrollSpyUpdate = useCallback((sectionEl) => {
    setCurrentSectionId(sectionEl?.id || 'basic-information');
  }, []);

  const sectionLink = (sectionId, message) => (
    <HashLink
      to={`#${sectionId}`}
      aria-current={currentSectionId === sectionId ? 'page' : undefined}
    >
      {message}
    </HashLink>
  );

  return (
    <div className={classNames('jump-nav px-2.25', { 'jump-nav-sm position-sticky pt-3': stickToTop })}>
      <Scrollspy
        items={[
          'basic-information',
          'profile-information',
          'notifications',
          'site-preferences',
          'linked-accounts',
          'delete-account',
        ]}
        className="list-unstyled"
        currentClassName="jump-nav__item--current"
        offset={-64}
        onUpdate={handleScrollSpyUpdate}
      >
        <li>
          {sectionLink('basic-information', intl.formatMessage(messages['account.settings.section.account.information']))}
        </li>
        <li>
          {sectionLink('profile-information', intl.formatMessage(messages['account.settings.section.profile.information']))}
        </li>
        <li>
          {sectionLink('notifications', intl.formatMessage(messages['notification.preferences.notifications.label']))}
        </li>
        <li>
          {sectionLink('site-preferences', intl.formatMessage(messages['account.settings.section.site.preferences']))}
        </li>
        <li>
          {sectionLink('linked-accounts', intl.formatMessage(messages['account.settings.section.linked.accounts']))}
        </li>
        {getConfig().ENABLE_ACCOUNT_DELETION
          && (
          <li>
            {sectionLink('delete-account', intl.formatMessage(messages['account.settings.jump.nav.delete.account']))}
          </li>
          )}
      </Scrollspy>
    </div>
  );
};

JumpNav.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(JumpNav);
