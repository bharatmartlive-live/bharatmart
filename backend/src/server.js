import { app } from './app.js';
import { env } from './config/env.js';
import { warmDatabase } from './config/db.js';
import { warmProductCache } from './services/productService.js';

function startKeepAlive() {
  if (!env.enableKeepAlive || !env.keepAliveUrl) return;

  const ping = async () => {
    try {
      await fetch(env.keepAliveUrl, { cache: 'no-store' });
      console.log('Keep-alive ping ok.');
    } catch (error) {
      console.error('Keep-alive ping failed:', error.message);
    }
  };

  setInterval(ping, 1000 * 60 * 10).unref?.();
}

app.listen(env.port, () => {
  console.log(`BharatMart API running on port ${env.port}`);
  warmDatabase();
  warmProductCache();
  startKeepAlive();
});
