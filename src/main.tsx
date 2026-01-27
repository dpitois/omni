import { render } from 'preact';
import { App } from './app';
import './index.css';

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

if (typeof window !== 'undefined') {
  registerSW({ immediate: true });
}

render(<App />, document.getElementById('app')!);
