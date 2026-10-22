import { createRoot } from 'react-dom/client';
import Platform from '../app/components/Platform';
import { demoRequest } from './state';
import '../app/globals.css';
import '../app/mobile-red.css';
import './preview.css';

createRoot(document.getElementById('root')!).render(
  <Platform preview request={demoRequest} />,
);
