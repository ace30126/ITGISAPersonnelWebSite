import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

const el = document.getElementById('root');
if (!el) throw new Error('#root 가 없다. index.html 을 확인할 것.');

// index.html 의 부트 화면을 지우고 앱으로 교체한다.
el.innerHTML = '';

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
