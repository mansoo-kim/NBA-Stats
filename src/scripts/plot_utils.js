import * as d3 from "d3";
import { LARGE } from "./constants"

export const scaleX = (data, column) => {
  return d3.scaleLinear()
    .domain(d3.extent(data, d => d[column]))
    .range([LARGE.LEFT_MARGIN, LARGE.WIDTH-LARGE.RIGHT_MARGIN])
    .nice();
}

export const scaleY = (data, column) => {
  return d3.scaleLinear()
    .domain(d3.extent(data, d => d[column]))
    .range([LARGE.HEIGHT-LARGE.BOTTOM_MARGIN, LARGE.TOP_MARGIN])
    .nice();
}

export const scaleA = (data, column) => {
  const scale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[column]))
    .range([Math.PI*Math.pow(3, 2), Math.PI*Math.pow(13, 2)]);

  return (d) => {
    const area = scale(d);
    return Math.sqrt(area/ Math.PI);
  };
}

export const updateAxis = (axis, f, scale) => {
  axis.transition().duration(1000).call(f(scale));
}

export const updateCirclesX = (circles, scale, column) => {
  circles.transition().duration(1000).attr("cx", d => scale(d[column]));
}

export const updateCirclesY = (circles, scale, column) => {
  circles.transition().duration(1000).attr("cy", d => scale(d[column]));
}

export const updateCirclesA = (circles, scale, column) => {
  circles.transition().duration(1000).attr("r", d => scale(d[column]));
}

export const updateCircles = (circles, xScale, yScale, aScale, xStat, yStat, aStat) => {
  circles
    .transition().duration(1000)
    .attr("cx", d => xScale(d[xStat]))
    .attr("cy", d => yScale(d[yStat]))
    .attr("r", d => aScale(d[aStat]))
    .attr("class", d => d["All-Star"] === true ? "all-star" : null);
}
