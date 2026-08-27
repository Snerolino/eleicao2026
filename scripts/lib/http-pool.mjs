export async function fetchConcurrent(tasks, { concurrency = 16, retries = 2, fetchImpl = fetch } = {}) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= tasks.length) return;
      const task = tasks[index];
      let lastError;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const response = await fetchImpl(task.url, { headers: task.headers, redirect: 'follow', signal: AbortSignal.timeout(task.timeoutMs ?? 20_000) });
          const body = await response.text();
          if (![429, 502, 503, 504].includes(response.status) || attempt === retries) {
            results[index] = await task.parse({ response, body });
            lastError = null;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
        } catch (error) {
          lastError = error;
          if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
        }
      }
      if (lastError) results[index] = await task.onError(lastError);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}
