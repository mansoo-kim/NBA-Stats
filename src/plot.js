import * as d3 from "d3";
import { scaleX, scaleY, updateXAxis, updateYAxis, updateCirclesX, updateCirclesY } from "./update_utils";

const WIDTH = 1000;
const HEIGHT = 600;
const YEARS = [2021, 2020]
const DEFAULT_YEAR = 2021
const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const COL_NAMES = ["Rk","Player","Pos","Age","Tm","G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const DISPLAYABLE_COLS = ["Age", "G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const NAN_COLS = ["Player", "Pos", "Tm"]
const BOTTOM_MARGIN = 30;
const LEFT_MARGIN = 30;
const TOP_MARGIN = 30;
const RIGHT_MARGIN = 30;

export default class Plot {

  constructor() {
    this.getStats();
  }

  buildScatter(allData) {
    console.log(allData);
    let data = allData[DEFAULT_YEAR]
    let xStat = DEFAULT_X;
    let yStat = DEFAULT_Y;

    // SVG
    this.svg = d3.select(".scatter").append("svg").attr("width", WIDTH).attr("height", HEIGHT);

    // X-Axis
    const xScale = scaleX(data, xStat)

    const xAxis = this.svg.append("g")
      .attr("transform", `translate(0, ${HEIGHT - BOTTOM_MARGIN})`)
      .call(d3.axisBottom(xScale));

    // Y-Axis
    const yScale = scaleY(data, yStat)

    const yAxis = this.svg.append("g")
      .attr("transform", `translate(${LEFT_MARGIN}, 0)`)
      .call(d3.axisLeft(yScale));

    // Hover text tooltips for circles
    const circlesLabel = d3.select(".tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute");

    // Circles
    let circles = this.svg.selectAll("circle").data(data).enter().append("circle")
      .attr("cx", d => xScale(d[xStat]))
      .attr("cy", d => yScale(d[yStat]))
      .attr("r", 5)
      .on("mouseenter", (_, d) => {
        circlesLabel
        .style("visibility", "visible")
        .html(
          `<strong>${d["Player"].split("\\")[0]}</strong>
          <p>${yStat}: ${d[yStat]}</p>
          <p>${xStat}: ${d[xStat]}</p>`
        )
      })
      .on("mousemove", (event) => {
        circlesLabel
          .style("left", event.pageX - 30 + "px")
          .style("top", event.pageY - 55 + "px")
      })
      .on("mouseleave", () => circlesLabel.style("visibility", "hidden"));

      // Options for X-axis
      const xSelect = d3.select(".x-select")
      const xOptions = xSelect
        .selectAll("option")
        .data(DISPLAYABLE_COLS)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

      xSelect.on("change", (event) => {
        console.log(event.target.value);
        xStat = event.target.value;
        let newXScale = scaleX(data, xStat);
        updateXAxis(xAxis, newXScale);
        updateCirclesX(circles, newXScale, xStat);
      })

      // Options for Y-axis
      const ySelect = d3.select(".y-select")
      const yOptions = ySelect
        .selectAll("option")
        .data(DISPLAYABLE_COLS)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

      ySelect.on("change", (event) => {
        console.log(event.target.value);
        yStat = event.target.value;
        let newYScale = scaleY(data, yStat);
        updateYAxis(yAxis, newYScale);
        updateCirclesY(circles, newYScale, yStat);
      })

      // Options for Year Select
      const yearSelect = d3.select(".year-select")
      const yearOptions = yearSelect
        .selectAll("option")
        .data(YEARS)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

      yearSelect.on("change", (event) => {
        console.log(event.target.value);
        let newData = allData[event.target.value];
        let newXScale = scaleX(newData, xStat);
        let newYScale = scaleY(newData, yStat);
        updateXAxis(xAxis, newXScale);
        updateYAxis(yAxis, newYScale);
        console.log(circles);
        circles = this.svg.selectAll("circle").data(newData).enter().append("circle");
        console.log(circles);
        updateCirclesX(circles, newXScale, xStat);
        console.log(circles);
        updateCirclesY(circles, newYScale, yStat);
        console.log(circles);
      })

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
