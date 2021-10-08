import * as d3 from "d3";

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

    // X-Axis
    let xScale = d3.scaleLinear().domain([d3.min(data, d => d[DEFAULT_X]), d3.max(data, d => d[DEFAULT_X])]).range([LEFT_MARGIN, this.width-RIGHT_MARGIN])
    let xAxis = this.svg.append("g").attr("transform", `translate(0, ${this.height - BOTTOM_MARGIN})`).call(d3.axisBottom(xScale));

    // Y-Axis
    let yScale = d3.scaleLinear().domain([d3.min(data, d => d[DEFAULT_Y]), d3.max(data, d => d[DEFAULT_Y])]).range([this.height-BOTTOM_MARGIN, TOP_MARGIN])
    let yAxis = this.svg.append("g").attr("transform", `translate(${LEFT_MARGIN}, 0)`).call(d3.axisLeft(yScale));

    // Hover text tooltips for circles
    let circlesLabel = d3.select(".scatter").append("div")
      .style("visibility", "hidden")
      .style("position", "absolute");

    // Circles
    let circles = this.svg.selectAll("circle").data(data).enter().append("circle")
      .attr("cx", d => xScale(d[DEFAULT_X]))
      .attr("cy", d => yScale(d[DEFAULT_Y]))
      .attr("r", 5)
      .on("mouseover", function(event, d) {
        circlesLabel
          .style("visibility", "visible")
          .text(d["Player"].split("\\")[0])
          .style("left", (xScale(d[DEFAULT_X]) - 35) + "px")
          .style("top", (yScale(d[DEFAULT_Y]) - 25) + "px")
      })
      .on("mouseleave", () => circlesLabel.style("visibility", "hidden"));


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
