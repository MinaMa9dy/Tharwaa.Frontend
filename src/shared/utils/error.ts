export function getErrorMessage(err: any, fallback: string): string {
  const data = err.response?.data;
  if (!data) return err.message || fallback;

  // 1. Check for standard ASP.NET validation errors details
  if (data.errors && typeof data.errors === 'object') {
    const messages: string[] = [];
    for (const key in data.errors) {
      if (Array.isArray(data.errors[key])) {
        messages.push(...data.errors[key]);
      } else if (typeof data.errors[key] === 'string') {
        messages.push(data.errors[key]);
      }
    }
    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  // 2. Check for custom ResultPattern validation error details
  if (data.error?.details && typeof data.error.details === 'object') {
    const messages: string[] = [];
    for (const key in data.error.details) {
      if (Array.isArray(data.error.details[key])) {
        messages.push(...data.error.details[key]);
      } else if (typeof data.error.details[key] === 'string') {
        messages.push(data.error.details[key]);
      }
    }
    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  // 3. Fallback to direct message
  return data.message || err.message || fallback;
}
