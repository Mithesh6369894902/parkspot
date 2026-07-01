const SQFT_PER_TWO_WHEELER = 30;
const SQFT_PER_FOUR_WHEELER = 120;
const DEFAULT_TWO_WHEELER_RATIO = 0.6;

function calculateAreaSqFt(boundary) {
  if (!boundary || boundary.length < 3) return 0;
  let area = 0;
  const n = boundary.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [xi, yi] = boundary[i];
    const [xj, yj] = boundary[j];
    area += xi * yj;
    area -= xj * yi;
  }
  area = Math.abs(area) / 2;
  const sqMetersToSqFt = 10.7639;
  return Math.round(area * 111319.9 * 111319.9 * sqMetersToSqFt);
}

function calculateCapacity(areaSqFt, twoWheelerRatio = DEFAULT_TWO_WHEELER_RATIO) {
  if (areaSqFt <= 0) return { totalSpots: 0, twoWheelerSpots: 0, fourWheelerSpots: 0 };
  const totalTwoWheelerArea = areaSqFt * twoWheelerRatio;
  const totalFourWheelerArea = areaSqFt * (1 - twoWheelerRatio);
  const twoWheelerSpots = Math.floor(totalTwoWheelerArea / SQFT_PER_TWO_WHEELER);
  const fourWheelerSpots = Math.floor(totalFourWheelerArea / SQFT_PER_FOUR_WHEELER);
  const totalSpots = twoWheelerSpots + fourWheelerSpots;
  return { totalSpots, twoWheelerSpots, fourWheelerSpots };
}

module.exports = { calculateAreaSqFt, calculateCapacity, SQFT_PER_TWO_WHEELER, SQFT_PER_FOUR_WHEELER };
