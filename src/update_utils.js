import * as d3 from "d3";
import { WIDTH, HEIGHT, BOTTOM_MARGIN, LEFT_MARGIN, TOP_MARGIN, RIGHT_MARGIN} from "./constants";


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
