import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import 'basiclightbox/dist/basicLightbox.min.css';
import './index.js';

inject();
injectSpeedInsights();
