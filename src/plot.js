import * as d3 from "d3";

const YEARS = [2021, 2020]
const DEFAULT_YEAR = 2021
const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const COL_NAMES = ["Rk","Player","Pos","Age","Tm","G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const NAN_COLS = ["Player", "Pos", "Tm"]
const BOTTOM_MARGIN = 30;
const LEFT_MARGIN = 30;

export default class Plot {

  constructor(dimensions) {
    [this.width, this.height] = dimensions;
    this.getStats();
  }

  buildScatter(allData) {
    let data = allData[DEFAULT_YEAR]
    console.log(data);

    // SVG
    this.svg = d3.select(".scatter").append("svg").attr("width", this.width).attr("height", this.height);

    d3.select()

    // X-Axis
    let xScale = d3.scaleLinear().domain([0, d3.max(data, d => d[DEFAULT_X])]).range([LEFT_MARGIN, this.width])
    let bottomAxis = d3.axisBottom(xScale);
    let xAxis = this.svg.append("g").attr("transform", `translate(0, ${this.height - BOTTOM_MARGIN})`).call(bottomAxis);

    // Y-Axis
    let yScale = d3.scaleLinear().domain([0, d3.max(data, d => d[DEFAULT_Y])]).range([this.height-BOTTOM_MARGIN, 0])
    let leftAxis = d3.axisLeft(yScale);
    let yAxis = this.svg.append("g").attr("transform", `translate(${LEFT_MARGIN}, 0)`).call(leftAxis);
  }


  async getStats() {
    let allData = {}
    for (let year of YEARS) {
      let data = await d3.csv(`src/data/${year-1}-${year}-per-game.csv`);
      for (let datum of data) {
          for (let col of COL_NAMES) {
            if (!NAN_COLS.includes(col)) datum[col] = +datum[col]
          }
        }
      allData[year] = data;
    }

    this.buildScatter(allData);
  }
}
