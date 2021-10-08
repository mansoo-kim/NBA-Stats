import * as d3 from "d3";

const WIDTH = 1000;
const HEIGHT = 600;
const BOTTOM_MARGIN = 30;
const LEFT_MARGIN = 30;
const TOP_MARGIN = 30;
const RIGHT_MARGIN = 30;

export const scaleX = (data, column) => {
  return d3.scaleLinear()
    .domain(d3.extent(data, d => d[column]))
    .range([LEFT_MARGIN, WIDTH-RIGHT_MARGIN])
    .nice();
}

export const scaleY = (data, column) => {
  return d3.scaleLinear()
    .domain(d3.extent(data, d => d[column]))
    .range([HEIGHT-BOTTOM_MARGIN, TOP_MARGIN])
    .nice();
}

export const updateXAxis = (axis, f, scale) => {
  return axis.call(f(scale));
}

export const updateYAxis = (axis, f, scale) => {
  return axis.call(f(scale));
}

export const updateCirclesX = (circles, scale, column) => {
  return circles.attr("cx", d => scale(d[column]))
}

export const updateCirclesY = (circles, scale, column) => {
  return circles.attr("cy", d => scale(d[column]))
}
