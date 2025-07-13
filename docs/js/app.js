import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import 'basiclightbox/dist/basicLightbox.min.css';
import './main.js';

inject();
injectSpeedInsights();
