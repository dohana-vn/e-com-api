function getTimestampSec(): number {
  return Math.floor(Date.now() / 1000);
}

function isTokenExpired(time: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return time <= now;
}

export { getTimestampSec, isTokenExpired };
