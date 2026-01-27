import { render } from 'preact';
import { OutlinerWrapper } from './components/OutlinerWrapper';
import './index.css';

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

if (typeof window !== 'undefined') {
  registerSW({ immediate: true });
}

render(<OutlinerWrapper />, document.getElementById('app')!);