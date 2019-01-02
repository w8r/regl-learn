const regl = require('regl')(document.body)
const d3 = require('d3')
const topojson = require('topojson-client')

// The default us-atlas topojson size is 960x600.  If we wanted to dynamically compute the bounds
// of this we could loop through every point in the geometry and get the extent. See
// https://github.com/topojson/us-atlas#us/10m.json for details.
const width = 960
const height = 600

const x = d3
  .scaleLinear()
  .range([-1, 1])
  .domain([0, width])

const y = d3
  .scaleLinear()
  .range([1, -1])
  .domain([0, height])

// You can't actually tweak this on many environments.  Drawing thick lines with
// webgl is much more complex.  See https://github.com/jpweeks/regl-line-builder for a
// convenient API
const lineWidth = 1

const drawLines = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform float uShift;

    void main() {
      gl_Position = vec4(position + vec2(uShift), 0, 1);
    }`,

  attributes: {
    position: (context, props) => {
      return props.positions
    }
  },

  elements: (context, props) => {
    return props.elements
  },

  uniforms: {
    color: [0.13, 0.13, 0.13, 1],
    uShift: ({ tick }) => tick / 1000
  },

  lineWidth
})

/* eslint-disable github/no-then */
d3.json('https://unpkg.com/us-atlas@1/us/10m.json').then(us => {
  const usMesh = topojson.mesh(us)

  regl.clear({
    color: [1, 0.98, 0.84375, 1],
    depth: 1
  })

  const vCount = usMesh.coordinates.reduce((acc, m) => acc + m.length, 0);
  const positions = [], indexes = [];

  let cnt = 0;
  for (const mesh of usMesh.coordinates) {

    for (let i = 0; i < mesh.length; i++) {
      // Map xy points to the webgl coordinate system
      const d = mesh[i];
      positions.push([x(d[0]), y(d[1])]);

      // Build a list of indexes that map to the positions array
      // [[0, 1], [1, 2], ...]
      if (i + 1 < mesh.length) indexes.push([cnt + i, cnt + i + 1]);
    }
    cnt += mesh.length;
  }

  const elements = regl.elements({
    primitive: 'lines',
    data: indexes
  });

  regl.frame(({ tick }) => {
    regl.clear({
      color: [1, 0.98, 0.84375, 1],
      depth: 1
    })
    drawLines({ elements, positions });
  });
})
