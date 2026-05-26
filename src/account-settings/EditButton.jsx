/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import messages from './AccountSettingsPage.messages';

const EditButton = ({
  onClick, className, intl,
}) => (
  <Button
    variant="link"
    size="sm"
    className={['account-settings__edit-btn', className].filter(Boolean).join(' ')}
    onClick={onClick}
  >
    <FontAwesomeIcon className="mr-1" icon={faPencilAlt} />
    {intl.formatMessage(messages['account.settings.editable.field.action.edit'])}
  </Button>
);

EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  intl: intlShape.isRequired,
};

EditButton.defaultProps = {
  className: null,
};

export default injectIntl(EditButton);
