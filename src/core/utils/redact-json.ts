const redactBlacklist: Array<string> = ['password', 'newPassword'];

/**
 * Redacts sensitive data of nested JSON by key blacklist.
 * @param obj
 * @returns
 */
export const redactJson = (obj: any): any => {
  if (typeof obj !== 'object') return obj;

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      redactJson(obj[key]);
    } else if (typeof obj[key] === 'string' && redactBlacklist.includes(key)) {
      obj[key] = '[REDACTED]';
    }
  });
  return obj;
};
