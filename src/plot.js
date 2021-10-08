import * as d3 from "d3";

const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const COL_NAMES = ["Rk","Player","Pos","Age","Tm","G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const NAN_COLS = ["Player", "Pos", "Tm"]

export default class Plot {

  constructor(dimensions) {
    [this.x, this.y] = dimensions;
    this.svg = d3.select(".scatter").append("svg")
    this.data = {};
    this.getYear(2021);
    this.getYear(2020);
  }

  buildScatter() {

  }

  getYear(year) {
    d3.text(`src/data/${year-1}-${year}-per-game.csv`).then(text => {
      this.data[year] = d3.csvParse(text);
      for (let datum of this.data[year]) {
        for (let col of COL_NAMES) {
          if (!NAN_COLS.includes(col)) {
            datum[col] = + datum[col]
          }
        }
      }
      console.log(this.data[year])
    })
  }
}
