import * as d3 from "d3";

const WIDTH = 1000;
const HEIGHT = 600;
const YEARS = [2021, 2020]
const DEFAULT_YEAR = 2021
const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const COL_NAMES = ["Rk","Player","Pos","Age","Tm","G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const NAN_COLS = ["Player", "Pos", "Tm"]
const BOTTOM_MARGIN = 30;
const LEFT_MARGIN = 30;
const TOP_MARGIN = 30;
const RIGHT_MARGIN = 30;

export const scaleX = (data, column) => {
  return d3.scaleLinear()
    .domain([d3.min(data, d => d[column]), d3.max(data, d => d[column])])
    .range([LEFT_MARGIN, WIDTH-RIGHT_MARGIN]);
}

export const scaleY = (data, column) => {
  return d3.scaleLinear()
    .domain([d3.min(data, d => d[column]), d3.max(data, d => d[column])])
    .range([HEIGHT-BOTTOM_MARGIN, TOP_MARGIN]);
}

export const updateXAxis = (axis, scale) => {
  return axis.call(d3.axisBottom(scale));
}

export const updateYAxis = (axis, scale) => {
  return axis.call(d3.axisLeft(scale));
}
