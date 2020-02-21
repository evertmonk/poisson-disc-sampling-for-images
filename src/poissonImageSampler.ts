// Types
// ---------------------
/**
 * @typedef {Object} Bounds
 * @property {number} x - Left
 * @property {number} y - Top
 * @property {number} width - Right
 * @property {number} height - Bottom
 */
type Bounds = { x: number; y: number; width: number; height: number; }

/**
 * @typedef {Object} Sample
 * @property {number} x - Position
 * @property {number} y - Position
 * @property {number} radius - Size / 2
 */
type Sample = { x: number; y: number; radius: number; }

/**
 * @typedef {(Sample|undefined)[]} SampleList - Array of samples
 */
type SampleList = (Sample | undefined)[];

/**
 * @typedef {Object} Options
 * @property {Bounds} bounds - Bounds of container that will render samples
 * @property {number=} minDist - Minimum distance that samples need to be apart
 * @property {number=} maxTries - Maximum amount of tries until sample is dead
 */
type Options = { bounds: Bounds; minDist?: number; maxTries?: number; }

// Functions
// ---------------------
/**
 * Return a random floating number between the given min and max value.
 *
 * @private
 * @function clampRandom
 * @param {number} min - Smallest allowed value
 * @param {number} max - Biggest allowed value
 * @return {number}
 */
export function clampRandom(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Create a Sample on a random location within given bounds
 *
 * @private
 * @function createFirstSample
 * @param {Bounds} bounds - Bounds of container
 * @return {Sample}
 */
export function createFirstSample(bounds: Bounds): Sample {
  const {x, y, width, height} = bounds;
  const radius: number = 5;

  return {
    x: clampRandom(x + radius, width + x - radius),
    y: clampRandom(y + radius, height + y - radius),
    radius,
  };
}

/**
 * Create a Sample in a spherical distance between minDist and minDist * 2 from given sample
 *
 * @private
 * @function createSampleFromSample
 * @param {Sample} sample - The sample that is used as a reference for positioning the new sample
 * @param {number} minDist - Minimum distance between samples
 * @return {Sample}
 */
export function createSampleFromSample(sample: Sample, minDist: number): Sample {
  const angle: number = Math.random() * Math.PI * 2;
  const radius: number = 5;
  const minRadius: number = minDist + radius + sample.radius;
  const maxRadius: number = minRadius + minDist;

  return {
    x: sample.x + Math.cos(angle) * clampRandom(minRadius, maxRadius),
    y: sample.y + Math.sin(angle) * clampRandom(minRadius, maxRadius),
    radius,
  };
}

/**
 * Returns the index of two dimensional Sample in one dimensional grid
 *
 * @private
 * @function getIndexInGrid
 * @param {Sample} sample - Sample that needs to be put in grid
 * @param {number} cellSize - Size of cell in grid
 * @param {number} cols - Length of columns in grid
 * @return {number}
 */
export function getIndexInGrid(sample: Sample, cellSize: number, cols: number): number {
  const col: number = Math.floor(sample.x / cellSize);
  const row: number = Math.floor(sample.y / cellSize);

  return col + row * cols;
}

/**
 * Checks if the given sample is placed within the bounds of the grid and the provided bounds
 *
 * @private
 * @function isInBounds
 * @param {Sample} sample - The sample that needs to be checked
 * @param {number} col - Column number of sample
 * @param {number} row - Row number of sample
 * @param {number} cols - Length of columns in grid
 * @param {number} rows - Length of rows in grid
 * @param {Bounds} bounds - Bounds of container
 * @return {boolean}
 */
export function isInBounds(sample: Sample, col: number, row: number, cols: number, rows: number, bounds: Bounds): boolean {
  return (
    col < cols &&
    row < rows &&
    sample.x - sample.radius >= bounds.x &&
    sample.x + sample.radius <= bounds.x + bounds.width &&
    sample.y - sample.radius >= bounds.y &&
    sample.y + sample.radius <= bounds.y + bounds.height
  );
}

/**
 * Checks if the given sample can be placed without getting to close to other samples
 *
 * @private
 * @function isAllowedToDraw
 * @param {Sample} sample - The sample that needs to be checked
 * @param {number} cellSize - Size of cell in grid
 * @param {number} cols - Length of columns in grid
 * @param {number} minDist - Minimum distance between samples
 * @param {SampleList} grid - List of samples that represents a two dimensional grid
 */
export function isAllowedToDraw(
  sample: Sample,
  cellSize: number,
  cols: number,
  minDist: number,
  grid: SampleList,
): boolean {
  const col: number = Math.floor(sample.x / cellSize);
  const row: number = Math.floor(sample.y / cellSize);

  // Check all the neighbours around the generated sample to check if it can be placed    [ ] [ ] [ ]
  // See the visualization of the two loops that run below this comment                   [ ] [x] [ ]
  // x marks the position of the generated sample                                         [ ] [ ] [ ]
  for (let i: number = -1; i <= 1; i += 1) {
    for (let j: number = -1; j <= 1; j += 1) {
      const neighbour: Sample | undefined = grid[col + i + (row + j) * cols];

      // When there's a neighbour within the minimum distance, this means that the sample cannot be placed
      if (neighbour && Math.hypot(neighbour.x - sample.x, neighbour.y - sample.y) < minDist) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Checks if given bounds are valid numbers and have valid properties
 *
 * @private
 * @function hasValidBounds
 * @param {*} bounds - Bounds of container
 * @return {boolean}
 */
export function hasValidBounds(bounds: any): boolean {
  return bounds &&
    typeof bounds.x === 'number' &&
    typeof bounds.y === 'number' &&
    typeof bounds.width === 'number' &&
    typeof bounds.height === 'number';
}

/**
 * Checks if given minimum distance is a number
 *
 * @private
 * @function hasValidMinDist
 * @param {*} minDist - Minimum distance between samples
 * @return {boolean}
 */
export function hasValidMinDist(minDist: any): boolean { return typeof minDist === 'number'; }

/**
 * Checks if given maximum tries is a number
 *
 * @private
 * @function hasValidMaxTries
 * @param {*} maxTries - Maximum amount of tries until sample is dead
 * @return {boolean}
 */
export function hasValidMaxTries(maxTries: any): boolean { return typeof maxTries === 'number'; }

// Public functions
// ---------------------
/**
 * Runs the Poisson Disc Sampler
 *
 * @public
 * @function poissonImageSampler
 * @param {Options} options - Configurable options are: bounds, minDist, maxTries
 * @return {SampleList}
 */
export default function poissonImageSampler(options: Options): SampleList {
  // These values will be used if there's no given minDist and / or maxTries in options
  const DEFAULT_MIN_DIST: number = 20;
  const DEFAULT_MAX_TRIES: number = 30;

  // When the given bounds are invalid, it does not have any use to run the sampler
  // So warn the user to provide valid bounds and return an empty array to prevent breaking the users code
  if (!hasValidBounds(options && options.bounds)) {
    console.error('Please provide valid bounds in options object: { bounds: { x, y, width, height } }');
    return [];
  }

  // When the given minDist is invalid, warn the user that the sampler is falling back to it's default value
  const validMinDist = hasValidMinDist(options && options.minDist);
  if (!options.minDist) {
    console.warn(`The options.minDist is not set. Falling back to default of ${DEFAULT_MIN_DIST}`);
  } else if (!validMinDist) {
    console.error(`The given minDist value is not a valid number. Falling back to default of ${DEFAULT_MIN_DIST}`);
  }

  // When the given maxTries is invalid, warn the user that the sampler is falling back to it's default value
  const validMaxTries = hasValidMaxTries(options && options.maxTries);
  if (!options.maxTries) {
    console.warn(`The options.maxTries is not set. Falling back to default of ${DEFAULT_MAX_TRIES}`);
  } else if (!validMaxTries) {
    console.error(`The given maxTries value is not a valid number. Falling back to default of ${DEFAULT_MAX_TRIES}`);
  }

  // After all the validations, store the values for further calculations
  const BOUNDS = options.bounds;
  // We are sure that the minDist and maxTries are numbers if they are going to be used because of the checks above
  const MIN_DIST: number = validMinDist ? options.minDist! : DEFAULT_MIN_DIST;
  const MAX_TRIES: number = validMaxTries ? options.maxTries! : DEFAULT_MAX_TRIES;

  // In order to create the grid, first calculate the size of a single cell and check how many cells and rows need
  // to be created in order to fill the given bounds
  const CELL_SIZE: number = MIN_DIST / Math.sqrt(2);
  const COLS: number = Math.floor(BOUNDS.width / CELL_SIZE);
  const ROWS: number = Math.floor(BOUNDS.height / CELL_SIZE);

  // There are two arrays, the grid is a representation of a two dimensional grid in a one dimensional array.
  // The grid will be used to check if a newly generated sample can be added to the grid
  const GRID: SampleList = [];
  // The active list is a list of all samples that can be used to generate new samples
  const ACTIVE: Sample[] = [];

  // To start filling the grid with samples there needs to be a sample to start the sampling of others
  const sample: Sample = createFirstSample(BOUNDS);
  const col: number = Math.floor(sample.x / CELL_SIZE);
  const row: number = Math.floor(sample.y / CELL_SIZE);

  // Sometimes the sample is bigger than the bounds that are provided. If this is the case, it's not possible to
  // add any samples to the grid.
  // So warn the user to provide valid bounds and return an empty array to prevent breaking the users code
  if (!isInBounds(sample, col, row, COLS, ROWS, BOUNDS)) {
    console.error('The bounds are smaller than the generated samples. Please make sure the bounds are big enough to contain at least one sample');
    return [];
  }

  // When there's a valid sample generated the sampler can start sampling other samples
  GRID[getIndexInGrid(sample, CELL_SIZE, COLS)] = sample;
  ACTIVE.push(sample);

  // Run sampler
  while (ACTIVE.length) {
    // Get a random sample from the list of active samples that can be used to generate other samples
    const randomActiveIndex: number = Math.floor(Math.random() * ACTIVE.length);
    const activeSample: Sample = ACTIVE[randomActiveIndex];
    let hasFoundNewSample: boolean = false;

    // Try for n amount of times to generate a valid sample from the selected active sample
    for (let i: number = 0; i < MAX_TRIES; i += 1) {
      // Create a new sample based on position of selected active sample
      const newSample: Sample = createSampleFromSample(activeSample, MIN_DIST);

      // Make sure the sample is placed within the bounds and can be placed next to the other samples
      // If it's not valid, try again
      if (!isInBounds(newSample, col, row, COLS, ROWS, BOUNDS)) continue;
      if (!isAllowedToDraw(newSample, CELL_SIZE, COLS, MIN_DIST, GRID)) continue;

      // Add the new sample to the grid and also add it to the active list so it can be used to render new samples
      GRID[getIndexInGrid(newSample, CELL_SIZE, COLS)] = newSample;
      ACTIVE.push(newSample);
      hasFoundNewSample = true;
    }

    // No new samples can be generated from this sample, so remove it
    if (!hasFoundNewSample) ACTIVE.splice(randomActiveIndex, 1);
  }

  // All the samples have been generated and can be return to the user
  return GRID;
};