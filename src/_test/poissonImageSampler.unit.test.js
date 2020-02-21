import * as util from "../poissonImageSampler";

describe('clampRandom()', () => {
  test('returns a random value between min and max', () => {
    expect.assertions(200);
    const min = 1;
    const max = 2;

    for (let i = 0; i < 100; i += 1) {
      const result = util.clampRandom(min, max);

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });
});

describe('createFirstSample()', () => {
  test('returns a sample that is within bounds', () => {
    expect.assertions(200);
    const bounds = { x: 20, y: 20, width: 40, height: 40 };

    for (let i = 0; i < 50; i += 1) {
      const result = util.createFirstSample(bounds);

      expect(result.x).toBeGreaterThanOrEqual(bounds.x);
      expect(result.x).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(result.y).toBeGreaterThanOrEqual(bounds.y);
      expect(result.y).toBeLessThanOrEqual(bounds.y + bounds.height);
    }
  });
});

describe('createSampleFromSample()', () => {
  test('returns a sample', () => {
    expect.assertions(5);
    const sample = { x: 100, y: 100, radius: 5 };
    const minDist = 20;
    const newSample = util.createSampleFromSample(sample, minDist);

    expect(newSample).toBeInstanceOf(Object);
    expect(Object.keys(newSample)).toStrictEqual(['x', 'y', 'radius']);
    Object.keys(newSample).forEach(key => {
      expect(typeof newSample[key]).toEqual('number');
    });
  });

  test('returns a sample that is between minDist and minDist * 2 from given sample', () => {
    expect.assertions(200);
    const sample = { x: 100, y: 100, radius: 5 };
    const minDist = 20;
    const minRadius = minDist + sample.radius + 5;

    for (let i = 0; i < 100; i += 1) {
      const newSample = util.createSampleFromSample(sample, minDist);
      const dist = Math.hypot(newSample.x - sample.x, newSample.y - sample.y);

      expect(dist).toBeGreaterThanOrEqual(minRadius);
      expect(dist).toBeLessThanOrEqual(minRadius + minDist);
    }
  });
});

describe('getIndexInGrid()', () => {
  test('returns index (44) of sample in grid', () => {
    expect.assertions(1);
    const cellSize = 10;
    const cols = 10;
    const sample = { x: 45, y: 45, radius: 5 };

    const index = util.getIndexInGrid(sample, cellSize, cols);

    expect(index).toEqual(44);
  });
});

describe('isInBounds()', () => {
  const cols = 99;
  const rows = 99;
  const bounds = { x: 0, y: 0, width: 100, height: 100 };

  test('returns false if col > cols', () => {
    expect.assertions(1);
    const sample = { x: 10, y: 10, radius: 5 };
    const col = 100;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns false if row > rows', () => {
    expect.assertions(1);
    const sample = { x: 10, y: 10, radius: 5 };
    const col = 1;
    const row = 100;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns false if sample x - radius < bounds.x', () => {
    expect.assertions(1);
    const sample = { x: 4, y: 10, radius: 5 };
    const col = 1;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns false if sample x + radius > bounds.x + bounds.width', () => {
    expect.assertions(1);
    const sample = { x: 96, y: 10, radius: 5 };
    const col = 1;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns false if sample y - radius < bounds.y', () => {
    expect.assertions(1);
    const sample = { x: 10, y: 4, radius: 5 };
    const col = 1;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns false if sample y + radius > bounds.y + bounds.height', () => {
    expect.assertions(1);
    const sample = { x: 10, y: 96, radius: 5 };
    const col = 1;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns false if sample y + radius > bounds.y + bounds.height', () => {
    expect.assertions(1);
    const sample = { x: 10, y: 96, radius: 5 };
    const col = 1;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(false);
  });

  test('returns true if sample is within bounds', () => {
    expect.assertions(1);
    const sample = { x: 10, y: 10, radius: 5 };
    const col = 1;
    const row = 1;

    const result = util.isInBounds(sample, col, row, cols, rows, bounds);
    expect(result).toBe(true);
  });
});

describe('isAllowedToDraw()', () => {
  const cellSize = 10;
  const cols = 3;
  const grid = [
    {x: 1, y: 1, radius: 5 }, {x: 11, y: 1, radius: 5 }, {x: 21, y: 1, radius: 5 },
    {x: 1, y: 11, radius: 5 }, undefined, {x: 21, y: 11, radius: 5 },
    {x: 1, y: 21, radius: 5 }, {x: 11, y: 21, radius: 5 }, {x: 21, y: 21, radius: 5 }
  ];

  test('returns false if all neighbors are filled and distance is too small', () => {
    expect.assertions(1);
    const sample = { x: 11, y: 11, radius: 5 };
    const minDist = 20;

    const result = util.isAllowedToDraw(sample, cellSize, cols, minDist, grid);
    expect(result).toBe(false);
  });

  test('returns true if there are no neighbors', () => {
    expect.assertions(1);
    const sample = { x: 11, y: 11, radius: 5 };
    const minDist = 20;
    const emptyGrid = [
      undefined, undefined, undefined,
      undefined, undefined, undefined,
      undefined, undefined, undefined,
    ];

    const result = util.isAllowedToDraw(sample, cellSize, cols, minDist, emptyGrid);
    expect(result).toBe(true);
  });

  test('returns true if distance between neighbour is big enough', () => {
    expect.assertions(1);
    const sample = { x: 11, y: 11, radius: 5 };
    const minDist = 2;

    const result = util.isAllowedToDraw(sample, cellSize, cols, minDist, grid);
    expect(result).toBe(true);
  });
});

describe('hasValidBounds()', () => {
  test('returns false if x is not defined', () => {
    expect.assertions(1);
    const bounds = { y: 0, width: 0, height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if y is not defined', () => {
    expect.assertions(1);
    const bounds = { x: 0, width: 0, height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if width is not defined', () => {
    expect.assertions(1);
    const bounds = { x: 0, y: 0, height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if height is not defined', () => {
    expect.assertions(1);
    const bounds = { x: 0, y: 0, width: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if x is not a number', () => {
    expect.assertions(1);
    const bounds = { x: 'a', y: 0, width: 0, height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if y is not a number', () => {
    expect.assertions(1);
    const bounds = { x: 0, y: 'a', width: 0, height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if width is not a number', () => {
    expect.assertions(1);
    const bounds = { x: 0, y: 0, width: 'a', height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns false if height is not a number', () => {
    expect.assertions(1);
    const bounds = { x: 0, y: 0, width: 0, height: 'a' };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(false);
  });

  test('returns true if bounds are valid', () => {
    expect.assertions(1);
    const bounds = { x: 0, y: 0, width: 0, height: 0 };
    const result = util.hasValidBounds(bounds);

    expect(result).toBe(true);
  });
});

describe('hasValidMinDist()', () => {
  test('returns false if minDist is undefined', () => {
    expect.assertions(1);
    const result = util.hasValidMinDist();

    expect(result).toBe(false);
  });

  test('returns false if minDist is not a number', () => {
    expect.assertions(1);
    const result = util.hasValidMinDist('a');

    expect(result).toBe(false);
  });

  test('returns true if minDist is a number', () => {
    expect.assertions(1);
    const result = util.hasValidMinDist(0);

    expect(result).toBe(true);
  });
});

describe('hasValidMaxTries()', () => {
  test('returns false if maxTries is undefined', () => {
    expect.assertions(1);
    const result = util.hasValidMaxTries();

    expect(result).toBe(false);
  });

  test('returns false if maxTries is not a number', () => {
    expect.assertions(1);
    const result = util.hasValidMaxTries('a');

    expect(result).toBe(false);
  });

  test('returns true if maxTries is a number', () => {
    expect.assertions(1);
    const result = util.hasValidMaxTries(0);

    expect(result).toBe(true);
  });
});
