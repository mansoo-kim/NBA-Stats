import * as d3 from "d3";

export const WIDTH = 1000;
export const HEIGHT = 600;
export const BOTTOM_MARGIN = 60;
export const LEFT_MARGIN = 60;
export const TOP_MARGIN = 60;
export const RIGHT_MARGIN = 60;

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

export const scaleA = (data, column) => {
  return d3.scaleLinear()
    .domain(d3.extent(data, d => Math.sqrt(d[column])))
    .range([2, 10]);
}

export const updateAxis = (axis, f, scale) => {
  return axis.call(f(scale));
}

export const updateCirclesX = (circles, scale, column) => {
  return circles.attr("cx", d => scale(d[column]));
}

export const updateCirclesY = (circles, scale, column) => {
  return circles.attr("cy", d => scale(d[column]));
}

export const updateCirclesA = (circles, scale, column) => {
  return circles.attr("r", d => scale(Math.sqrt(d[column])));
}
