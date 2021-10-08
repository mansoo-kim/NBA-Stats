import * as d3 from "d3";

const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"

export default class Plot {

  constructor(dimensions) {
    [this.x, this.y] = dimensions;
    this.svg = d3.select(".scatter").append("svg")
    this.getYear(2021);
  }

  getYear(year) {
    d3.text(`src/data/${year-1}-${year}-per-game.csv`).then(text => {
      this.data2021 = d3.csvParse(text);
      console.log(this.data2021)
    })
  }
}
