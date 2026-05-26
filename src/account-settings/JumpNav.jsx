import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { HashLink } from 'react-router-hash-link';
import Scrollspy from 'react-scrollspy';
import messages from './AccountSettingsPage.messages';

const JumpNav = ({
  intl,
}) => {
  const { width } = useWindowSize();
  const isSidebarNav = width >= breakpoints.large.minWidth;
  const [currentSectionId, setCurrentSectionId] = useState('basic-information');

  const sections = useMemo(() => {
    const items = [
      {
        id: 'basic-information',
        label: intl.formatMessage(messages['account.settings.section.account.information']),
      },
      {
        id: 'profile-information',
        label: intl.formatMessage(messages['account.settings.section.profile.information']),
      },
      {
        id: 'notifications',
        label: intl.formatMessage(messages['notification.preferences.notifications.label']),
      },
      {
        id: 'site-preferences',
        label: intl.formatMessage(messages['account.settings.section.site.preferences']),
      },
      {
        id: 'linked-accounts',
        label: intl.formatMessage(messages['account.settings.section.linked.accounts']),
      },
    ];

    if (getConfig().ENABLE_ACCOUNT_DELETION) {
      items.push({
        id: 'delete-account',
        label: intl.formatMessage(messages['account.settings.jump.nav.delete.account']),
      });
    }

    return items;
  }, [intl]);

  const scrollSpyItems = useMemo(() => sections.map((section) => section.id), [sections]);

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

  if (!isSidebarNav) {
    return null;
  }

  return (
    <div className={classNames('jump-nav', 'jump-nav--sidebar', 'jump-nav-sm', 'position-sticky')}>
      <Scrollspy
        items={scrollSpyItems}
        className="list-unstyled jump-nav__list"
        currentClassName="jump-nav__item--current"
        offset={-64}
        onUpdate={handleScrollSpyUpdate}
      >
        {sections.map(({ id, label }) => (
          <li key={id}>
            {sectionLink(id, label)}
          </li>
        ))}
      </Scrollspy>
    </div>
  );
};

JumpNav.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(JumpNav);
