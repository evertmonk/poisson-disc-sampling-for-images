import poissonImageSampler from './poissonImageSampler';

function renderSamples(parent: any, grid: any) {
  grid.forEach((sample: any, i: number): void => parent.appendChild(createSampleElement(sample, i)));
}

function createSampleElement(sample: any, i: number) {
  const el = document.createElement('div');
  const elSize = sample.radius * 2;

  el.classList.add('dot');
  el.style.left = sample.x + 'px';
  el.style.top = sample.y + 'px';
  el.style.width = elSize + 'px';
  el.style.height = elSize + 'px';

  const sqEl = document.createElement('div');
  const sqElSize = images[sample.index].size;

  sqEl.classList.add('square');
  sqEl.style.width = sqElSize + 'px';
  sqEl.style.height = sqElSize + 'px';
  sqEl.style.background = `url(https://picsum.photos/seed/${i * Math.random()}/${sqElSize}/${sqElSize}) center no-repeat`;

  el.appendChild(sqEl);

  return el;
}

const parent = document.getElementById('root');

const images = [
  { size: 10 },
  { size: 20 },
  { size: 40 },
  { size: 80 },
  { size: 160 },
  { size: 320 },
];

if (parent) {
  const { x, y, width, height } = parent.getBoundingClientRect();
  const grid = poissonImageSampler({ bounds: { x, y, width, height }, images, minDist: 20, maxTries: 30 });
  renderSamples(parent, grid);
}