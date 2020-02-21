import poissonImageSampler from './poissonImageSampler';

function renderSamples(parent: any, grid: any) {
  grid.forEach((sample: any) => parent.appendChild(createSampleElement(sample)));
}

function createSampleElement(sample: any) {
  const el = document.createElement('div');
  el.classList.add('dot');
  el.style.left = sample.x + 'px';
  el.style.top = sample.y + 'px';
  el.style.width = sample.radius * 2 + 'px';
  el.style.height = sample.radius * 2 + 'px';

  return el;
}

const parent = document.getElementById('root');

if (parent) {
  const { x, y, width, height } = parent.getBoundingClientRect();
  const radius = 10;
  const grid = poissonImageSampler({ bounds: { x, y, width, height }, radius, minDist: radius * 2.2, maxTries: 30 });
  renderSamples(parent, grid);
}