export default async function retry(fn, retries) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error; // Throw if max retries reached
    }
  }
}
