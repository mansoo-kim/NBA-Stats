import * as d3 from "d3";

const YEARS = [2021, 2020]
const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const COL_NAMES = ["Rk","Player","Pos","Age","Tm","G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const NAN_COLS = ["Player", "Pos", "Tm"]

export default class Plot {

  constructor(dimensions) {
    [this.width, this.height] = dimensions;
    this.getStats();
  }

  buildScatter(allData) {
    console.log(allData);

    // SVG
    this.svg = d3.select(".scatter").append("svg").attr("width", this.width).attr("height", this.height);

    // X-Axis
    let bottomAxis = d3.axisBottom(d3.scaleLinear().domain([0, 40]).range([0, this.width]));
    let xAxis = this.svg.append("g").attr("transform", `translate(0, ${this.height})`).call(bottomAxis);

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
