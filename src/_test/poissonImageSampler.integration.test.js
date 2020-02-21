import poissonImageSampler from "../poissonImageSampler";

describe('poissonImageSampler()', () => {
  const ogErrorMock = console.error;
  const ogWarnMock = console.warn;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = ogErrorMock;
    console.warn = ogWarnMock;
  });

  test('returns an array with values', () => {
    expect.assertions(2);

    const grid = poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 } });

    expect(grid).toBeInstanceOf(Array);
    expect(grid.filter(Boolean).length).toBeGreaterThan(0);
  });

  test('created array contains correct objects', () => {
    expect.assertions(5);

    const grid = poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 } }).filter(Boolean);

    expect(grid[0]).toBeInstanceOf(Object);
    expect(Object.keys(grid[0])).toStrictEqual(['x', 'y', 'radius']);
    Object.keys(grid[0]).forEach(key => {
      expect(typeof grid[0][key]).toEqual('number');
    });
  });

  test('returns empty array when bounds are too small', () => {
    expect.assertions(1);

    const grid = poissonImageSampler({ bounds: { x: 0, y: 0, width: 0, height: 0 } });

    expect(grid).toEqual([]);
  });

  test('returns empty array when bounds are missing', () => {
    expect.assertions(3);

    const grid = poissonImageSampler();

    expect(grid).toEqual([]);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Please provide valid bounds in options object: { bounds: { x, y, width, height } }');
  });

  test('returns empty array when bounds are invalid', () => {
    expect.assertions(3);

    const grid = poissonImageSampler({ bounds: { x: 0, y: 0 } });

    expect(grid).toEqual([]);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Please provide valid bounds in options object: { bounds: { x, y, width, height } }');
  });

  test('uses default radius if not set and warns', () => {
    expect.assertions(2);

    poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 }, minDist: 5, maxTries: 30 });

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(`The options.radius is not set. Falling back to default of ${5}`);
  });

  test('uses default minDist if not set and warns', () => {
    expect.assertions(2);

    poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 }, radius: 5, maxTries: 30 });

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(`The options.minDist is not set. Falling back to default of ${20}`);
  });

  test('uses default maxTries if not set and warns', () => {
    expect.assertions(2);

    poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 }, radius: 5, minDist: 20 });

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(`The options.maxTries is not set. Falling back to default of ${30}`);
  });

  test('uses default radius if invalid radius is set and warns', () => {
    expect.assertions(2);

    poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 }, radius: 'a', minDist: 20, maxTries: 30 });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(`The given radius value is not a valid number. Falling back to default of ${5}`);
  });

  test('uses default minDist if invalid minDist is set and errors', () => {
    expect.assertions(2);

    poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 }, radius: 5, minDist: 'a', maxTries: 30 });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(`The given minDist value is not a valid number. Falling back to default of ${20}`);
  });

  test('uses default maxTries if invalid maxTries is set and errors', () => {
    expect.assertions(2);

    poissonImageSampler({ bounds: { x: 0, y: 0, width: 500, height: 500 }, radius: 5, minDist: 20, maxTries: 'a' });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(`The given maxTries value is not a valid number. Falling back to default of ${30}`);
  });
});