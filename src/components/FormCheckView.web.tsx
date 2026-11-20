import { createElement, useEffect } from 'react';
import type { FormCheckMessage } from './FormCheckView.types';

// On the website the form checker page sits next to the app, under the same address.
function pageUrl(exercise: string) {
  const base = window.location.pathname.replace(/\/check-form\/?$/, '');
  return `${base}/form-check/?exercise=${encodeURIComponent(exercise)}`;
}

export function FormCheckView({ exercise, onMessage }: { exercise: string; onMessage: (m: FormCheckMessage) => void }) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.source === 'form-check') onMessage(e.data);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return createElement('iframe', {
    src: pageUrl(exercise),
    title: 'Check Form',
    allow: 'camera; fullscreen',
    style: { border: 0, width: '100%', height: '100%', flex: 1, background: '#05070D' },
  });
}
