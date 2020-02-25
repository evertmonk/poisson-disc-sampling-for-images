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

  sqEl.classList.add('square');
  sqEl.style.width = elSize + 'px';
  sqEl.style.height = elSize + 'px';
  sqEl.style.background = `url(https://picsum.photos/seed/${i * Math.random()}/${elSize}/${elSize}) center no-repeat`;
  sqEl.style.borderRadius = '50%';

  el.appendChild(sqEl);

  return el;
}

const parent = document.getElementById('root');

const images = [
  // { size: 10 },
  // { size: 20 },
  // { size: 40 },
  { size: 90 },
  { size: 60 },
  // { size: 320 },
];

if (parent) {
  const { x, y, width, height } = parent.getBoundingClientRect();
  const grid = poissonImageSampler({ bounds: { x, y, width, height }, images, minDist: 15, maxTries: 40, isCircle: true });
  renderSamples(parent, grid);
}