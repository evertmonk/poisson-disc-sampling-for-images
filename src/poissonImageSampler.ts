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
 * @property {number} index - Index of used image
 */
type Sample = { x: number; y: number; radius: number; index: number; }

/**
 * @typedef {(Sample|undefined)[]} SampleList
 */
type SampleList = (Sample | undefined)[];

/**
 * @typedef {Object} Image
 * @property {number} size - Size of the image (Must be square)
 */
type Image = { size: number; }

/**
 * @typedef {Image[]} ImageArray
 */
type ImageList = Image[];

/**
 * @typedef {Object} Options
 * @property {Bounds} bounds - Bounds of container that will render samples
 * @property {ImageList} images - List of image sizes that can be used
 * @property {number=} minDist - Minimum distance that samples need to be apart
 * @property {number=} maxTries - Maximum amount of tries until sample is dead
 * @property {boolean=} isCircle - let sampler know image is circular
 */
type Options = { bounds: Bounds; images: ImageList, minDist?: number; maxTries?: number; isCircle?: boolean }

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
 * Returns the minimum radius that is needed to hold the given size as a square
 *
 * @private
 * @function getRadiusForSize
 * @param {number} size - The size of the square
 * @return {number}
 */
export function getRadiusForSize(size: number): number {
  return Math.sqrt(Math.pow(size, 2) * 2) * 0.5;
}

/**
 * Create a Sample on a random location within given bounds
 *
 * @private
 * @function createFirstSample
 * @param {Bounds} bounds - Bounds of container
 * @param {Image} image - Image size
 * @param {boolean} isCircle - Defines if sample is circular
 * @return {Sample}
 */
export function createFirstSample(bounds: Bounds, image: Image, isCircle: boolean): Sample {
  const {x, y, width, height} = bounds;
  const { size } = image;

  return {
    x: clampRandom(x + size, width + x - size),
    y: clampRandom(y + size, height + y - size),
    radius: isCircle ? size : getRadiusForSize(size),
    index: 0,
  };
}

/**
 * Create a Sample in a spherical distance between minDist and minDist * 2 from given sample
 *
 * @private
 * @function createSampleFromSample
 * @param {Sample} sample - The sample that is used as a reference for positioning the new sample
 * @param {ImageList} images - List of imageSizes
 * @param {number} minDist - Minimum distance between samples
 * @param {boolean} isCircle - Defines if sample is circular
 * @return {Sample}
 */
export function createSampleFromSample(sample: Sample, images: ImageList, minDist: number, isCircle: boolean): Sample {
  const randomImageIndex = Math.floor(Math.random() * images.length);
  const { size } = images[randomImageIndex];
  const angle: number = Math.random() * Math.PI * 2;
  const minRadius: number = minDist + size + sample.radius;
  const maxRadius: number = minRadius + minDist;

  return {
    x: sample.x + Math.cos(angle) * clampRandom(minRadius, maxRadius),
    y: sample.y + Math.sin(angle) * clampRandom(minRadius, maxRadius),
    radius: isCircle ? size : getRadiusForSize(size),
    index: randomImageIndex,
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
    sample.x - sample.radius >= 0 &&
    sample.x + sample.radius <= bounds.width &&
    sample.y - sample.radius >= 0 &&
    sample.y + sample.radius <= bounds.height
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
 * @param {number} range - range of neighbours to check
 * @param {SampleList} grid - List of samples that represents a two dimensional grid
 */
export function isAllowedToDraw(
  sample: Sample,
  cellSize: number,
  cols: number,
  minDist: number,
  grid: SampleList,
  range: number,
): boolean {
  const col: number = Math.floor(sample.x / cellSize);
  const row: number = Math.floor(sample.y / cellSize);
  // Check all the neighbours around the generated sample to check if it can be placed    [ ] [ ] [ ]
  // See the visualization of the two loops that run below this comment                   [ ] [x] [ ]
  // x marks the position of the generated sample                                         [ ] [ ] [ ]
  for (let i: number = -range; i <= range; i += 1) {
    for (let j: number = -range; j <= range; j += 1) {
      const neighbour: Sample | undefined = grid[col + i + (row + j) * cols];

      // When there's a neighbour within the minimum distance, this means that the sample cannot be placed
      if (
        neighbour &&
        Math.hypot(neighbour.x - sample.x, neighbour.y - sample.y) < (minDist + sample.radius + neighbour.radius)
      ) {
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
 * Checks if given imageList is a valid array with valid objects
 *
 * @private
 * @function hasValidImageList
 * @param {*} imageList - Radius of sample
 * @return {boolean}
 */
export function hasValidImageList(imageList: any): boolean {
  return Array.isArray(imageList) &&
    imageList.length > 0 &&
    typeof imageList.reduce((t: number, v: Image) => v && v.size ? t + v.size : '', 0) === 'number';
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

  // When the given images are invalid, it does not have any use to run the sampler
  // So warn the user to provide valid images and return an empty array to prevent breaking the users code
  if (!hasValidImageList(options && options.images)) {
    console.error('Please provide valid images in options object: { image: { size } }');
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
  const BOUNDS: Bounds = options.bounds;
  const IMAGES: ImageList = options.images;
  const IS_CIRCLE: boolean = options.isCircle || false;
  // We are sure that the radius, minDist and maxTries are numbers if they are going to be used because of the checks above
  const MIN_DIST: number = validMinDist ? options.minDist! : DEFAULT_MIN_DIST;
  const MAX_TRIES: number = validMaxTries ? options.maxTries! : DEFAULT_MAX_TRIES;

  // In order to create the grid, first calculate the size of a single cell and check how many cells and rows need
  // to be created in order to fill the given bounds
  const minRadius = Math.min(...options.images.map(v => v.size));
  const maxRadius = Math.max(...options.images.map(v => v.size));
  const CELL_SIZE: number = (MIN_DIST + minRadius * 2) / Math.sqrt(2);
  const COLS: number = Math.floor(BOUNDS.width / CELL_SIZE);
  const ROWS: number = Math.floor(BOUNDS.height / CELL_SIZE);
  const RANGE: number = Math.ceil((MIN_DIST + maxRadius * 2) / CELL_SIZE);

  // There are two arrays, the grid is a representation of a two dimensional grid in a one dimensional array.
  // The grid will be used to check if a newly generated sample can be added to the grid
  const GRID: SampleList = [];
  // The active list is a list of all samples that can be used to generate new samples
  const ACTIVE: Sample[] = [];

  // To start filling the grid with samples there needs to be a sample to start the sampling of others
  const sample: Sample = createFirstSample(BOUNDS, IMAGES[0], IS_CIRCLE);
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
      const newSample: Sample = createSampleFromSample(activeSample, IMAGES, MIN_DIST, IS_CIRCLE);

      // Make sure the sample is placed within the bounds and can be placed next to the other samples
      // If it's not valid, try again
      if (!isInBounds(newSample, col, row, COLS, ROWS, BOUNDS)) continue;
      if (!isAllowedToDraw(newSample, CELL_SIZE, COLS, MIN_DIST, GRID, RANGE)) continue;

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