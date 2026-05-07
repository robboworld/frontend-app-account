import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'formdata-polyfill';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import {
  subscribe, initialize, APP_INIT_ERROR, APP_READY, mergeConfig, getConfig,
} from '@edx/frontend-platform';
import React, { StrictMode } from 'react';
// eslint-disable-next-line import/no-unresolved
import { createRoot } from 'react-dom/client';
import { Route, Routes, Outlet } from 'react-router-dom';

import configureStore from './data/configureStore';
import AccountSettingsPage, { NotFoundPage } from './account-settings';
import IdVerificationPageSlot from './plugin-slots/IdVerificationPageSlot';
import messages from './i18n';
import { RobboFooter, RobboHeader } from './robbo-layout';

import './index.scss';
import Head from './head/Head';

const initYandexMetrika = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const cfg = getConfig();
  if (!cfg.ENABLE_YANDEX_METRIKA || cfg.YANDEX_METRIKA_COUNTER_ID == null || cfg.YANDEX_METRIKA_COUNTER_ID === '') {
    return;
  }
  const counterId = Number(cfg.YANDEX_METRIKA_COUNTER_ID);
  if (!Number.isFinite(counterId) || counterId <= 0) {
    return;
  }
  const src = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`;
  const alreadyLoaded = Array.from(document.scripts || []).some(
    (scriptEl) => scriptEl.src === src || scriptEl.src.indexOf('https://mc.yandex.ru/metrika/tag.js') === 0,
  );
  if (!alreadyLoaded) {
    const scriptEl = document.createElement('script');
    scriptEl.async = true;
    scriptEl.src = src;
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(scriptEl, firstScript);
    } else {
      document.head.appendChild(scriptEl);
    }
  }
  window.ym = window.ym || function ymShim() { (window.ym.a = window.ym.a || []).push(arguments); };
  window.ym.l = 1 * new Date();
  window.ym(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: window.location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
};

const rootNode = createRoot(document.getElementById('root'));
subscribe(APP_READY, () => {
  initYandexMetrika();
  rootNode.render(
    <StrictMode>
      <AppProvider store={configureStore()}>
        <Head />
        <Routes>
          <Route element={(
            <div className="robbo-layout-page">
              <RobboHeader collapseNavIntoUserMenuOnNarrow />
              <main className="flex-grow-1" id="main">
                <Outlet />
              </main>
              <RobboFooter />
            </div>
        )}
          >
            <Route
              path="/id-verification/*"
              element={<IdVerificationPageSlot />}
            />
            <Route path="/" element={<AccountSettingsPage />} />
            <Route path="/notfound" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  rootNode.render(<ErrorPage message={error.message} />);
});

initialize({
  messages,
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
  handlers: {
    config: () => {
      mergeConfig({
        SUPPORT_URL: process.env.SUPPORT_URL,
        SHOW_EMAIL_CHANNEL: process.env.SHOW_EMAIL_CHANNEL || 'false',
        ENABLE_COPPA_COMPLIANCE: (process.env.ENABLE_COPPA_COMPLIANCE || false),
        ENABLE_ACCOUNT_DELETION: (process.env.ENABLE_ACCOUNT_DELETION !== 'false'),
        COUNTRIES_WITH_DELETE_ACCOUNT_DISABLED: JSON.parse(process.env.COUNTRIES_WITH_DELETE_ACCOUNT_DISABLED || '[]'),
        ENABLE_DOB_UPDATE: (process.env.ENABLE_DOB_UPDATE || false),
        MARKETING_EMAILS_OPT_IN: (process.env.MARKETING_EMAILS_OPT_IN || false),
        PASSWORD_RESET_SUPPORT_LINK: process.env.PASSWORD_RESET_SUPPORT_LINK,
        LEARNER_FEEDBACK_URL: process.env.LEARNER_FEEDBACK_URL,
      }, 'App loadConfig override handler');
    },
  },
});
