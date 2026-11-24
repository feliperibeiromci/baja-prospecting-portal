export function parseCounts(body) {
  const keys = ['icp1_count', 'icp2_count', 'icp3_count'];
  if (!body || typeof body !== 'object') throw new Error('Choose 0–5 companies for each ICP, with at least one company in total.');
  const counts = Object.fromEntries(keys.map(key => [key, body[key]]));
  if (keys.some(key => !Number.isInteger(counts[key]) || counts[key] < 0 || counts[key] > 5) ||
      keys.every(key => counts[key] === 0)) {
    throw new Error('Choose 0–5 companies for each ICP, with at least one company in total.');
  }
  return counts;
}
