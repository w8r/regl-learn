const regl = require("regl")(document.body);
const d3 = require("d3");

// dimensions of the viewport we are drawing in
const width = window.innerWidth;
const height = window.innerHeight;

const lineWidth = 1;

var lines = regl.elements({
  primitive: "lines",
  // data represents the index of the `position` data
  data: [[0, 1], [1, 2], [2, 3], [3, 0]]
});

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

    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,

  attributes: {
    position: [
      [0.5, 0.5], // 0
      [0.5, -0.5], // 1
      [-0.5, -0.5], // 2
      [-0.5, 0.5] // 3
    ]
  },

  elements: lines,

  uniforms: {
    color: [1, 0, 0, 1]
  },

  lineWidth: lineWidth
});

regl.clear({
  color: [0, 0, 0, 1],
  depth: 1
});

drawLines({});