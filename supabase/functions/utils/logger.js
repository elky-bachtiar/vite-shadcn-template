// Simple logger utility for Edge Functions
export class Logger {
  constructor(context = 'EdgeFunction') {
    this.context = context;
  }

  debug(message, data) {
    console.debug(`[Debug] ${message}`, data);
  }

  info(message, data) {
    console.log(`[Info] ${message}`, data);
  }

  warn(message, data) {
    console.warn(`[Warning] ${message}`, data);
  }

  error(message, error) {
    console.error(`[Error] ${message}`, error);
  }
}
