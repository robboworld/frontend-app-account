/**
 * Copyright (C) 2026 Robbo <https://robbo.ru>
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Part of the Robbo Open edX MFE overrides. See NOTICE at repository root.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import { loadWhatsNewPlacement, saveWhatsNewPlacement } from './data';
import messages from './messages';
import buttonPreviewEn from './images/whats-new-button-en.png';
import buttonPreviewRu from './images/whats-new-button-ru.png';
import menuPreviewEn from './images/whats-new-menu-en.png';
import menuPreviewRu from './images/whats-new-menu-ru.png';

// Right part of the header (2x, 380×245 CSS px) with a neutral name, one set per interface language.
const PREVIEWS = {
  button: { en: buttonPreviewEn, ru: buttonPreviewRu },
  menu: { en: menuPreviewEn, ru: menuPreviewRu },
};

const OPTIONS = [
  {
    value: 'button', title: messages.whatsNewButton, help: messages.whatsNewButtonHelp, alt: messages.whatsNewButtonAlt,
  },
  {
    value: 'menu', title: messages.whatsNewMenu, help: messages.whatsNewMenuHelp, alt: messages.whatsNewMenuAlt,
  },
];

export const useWhatsNewPlacement = () => {
  const [state, setState] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    loadWhatsNewPlacement().then((result) => {
      if (!cancelled) {
        setState(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
};

// «Настройка интерфейса»: for the course team and staff only (learners always have «Что нового» in the
// profile menu). The choice is saved at once and the header on this page follows it. Styles: _style.scss.
const RobboCustomization = ({ sectionRef }) => {
  const intl = useIntl();
  const status = useWhatsNewPlacement();
  const [placement, setPlacement] = React.useState(null);
  const [saveState, setSaveState] = React.useState(null);
  const lang = intl.locale && intl.locale.toLowerCase().startsWith('en') ? 'en' : 'ru';

  React.useEffect(() => {
    if (status) {
      setPlacement(status.placement);
    }
  }, [status]);

  if (!status || !status.canChoose) {
    return null;
  }

  const handleChange = (event) => {
    const previous = placement;
    const next = event.target.value;
    setPlacement(next);
    setSaveState('pending');
    saveWhatsNewPlacement(next)
      .then(() => setSaveState('saved'))
      .catch(() => {
        setPlacement(previous);
        setSaveState('error');
      });
  };

  return (
    <div className="account-section robbo-customization" id="customization" ref={sectionRef}>
      <h2 className="section-heading h4">{intl.formatMessage(messages.heading)}</h2>
      <p>{intl.formatMessage(messages.description)}</p>
      <div className="robbo-customization__field" role="radiogroup" aria-labelledby="robbo-customization-whats-new">
        <div className="robbo-customization__head">
          <h3 className="robbo-customization__label" id="robbo-customization-whats-new">
            {intl.formatMessage(messages.whatsNewLabel)}
          </h3>
          <span
            className={`robbo-customization__status robbo-customization__status--${saveState || 'idle'}`}
            role="status"
            aria-live="polite"
          >
            {saveState === 'saved' && intl.formatMessage(messages.saved)}
            {saveState === 'error' && intl.formatMessage(messages.saveError)}
          </span>
        </div>
        <div className="robbo-customization__options">
          {OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`robbo-customization__option${placement === option.value ? ' is-selected' : ''}`}
            >
              <span className="robbo-customization__preview">
                <img src={PREVIEWS[option.value][lang]} alt={intl.formatMessage(option.alt)} width="380" height="245" />
              </span>
              <span className="robbo-customization__choice">
                <input
                  type="radio"
                  name="robbo-whats-new-placement"
                  value={option.value}
                  checked={placement === option.value}
                  onChange={handleChange}
                />
                <span className="robbo-customization__title">{intl.formatMessage(option.title)}</span>
              </span>
              <span className="robbo-customization__help">{intl.formatMessage(option.help)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

RobboCustomization.propTypes = {
  sectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

RobboCustomization.defaultProps = {
  sectionRef: undefined,
};

export default RobboCustomization;
