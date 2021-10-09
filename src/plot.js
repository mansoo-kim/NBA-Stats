import * as d3 from "d3";
import { scaleX, scaleY, updateAxis, updateCirclesX, updateCirclesY } from "./update_utils";
import { WIDTH, HEIGHT, BOTTOM_MARGIN, LEFT_MARGIN, TOP_MARGIN, RIGHT_MARGIN} from "./constants";

const YEARS = [2020, 2021]
const DEFAULT_YEAR = 2021
const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const COL_NAMES = ["Rk","Player","Pos","Age","Tm","G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const DISPLAYABLE_COLS = ["Age", "G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS"]
const NAN_COLS = ["Player", "Pos", "Tm"]

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
    const xScale = scaleX(data, xStat);

    const xGridF = scale => d3.axisBottom(scale)
      .tickSize(-HEIGHT + TOP_MARGIN + BOTTOM_MARGIN)
      .tickFormat("");

    const xGrid = this.svg.append("g")
      .attr("transform", `translate(0, ${HEIGHT - BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xGridF(xScale));

    const xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    const xAxis = this.svg.append("g")
      .attr("transform", `translate(0, ${HEIGHT - BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xAxisF(xScale));

    const xLabel = xAxis.append("text")
      .attr("class", "axis-label")
      .attr("x", WIDTH/2)
      .attr("y", 40)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(xStat)

    // Y-Axis
    const yScale = scaleY(data, yStat)

    const yGridF = scale => d3.axisLeft(scale)
      .tickSize(-WIDTH + LEFT_MARGIN + RIGHT_MARGIN)
      .tickFormat("");

    const yGrid = this.svg.append("g")
      .attr("transform", `translate(${LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yGridF(yScale));

    const yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    const yAxis = this.svg.append("g")
      .attr("transform", `translate(${LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yAxisF(yScale));

    const yLabel = yAxis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -HEIGHT/2)
      .attr("y", -30)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(yStat)

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
          .style("left", event.pageX - 35 + "px")
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
        .attr("value", d => d)
        .property("selected", d => d === xStat);

      xSelect.on("change", (event) => {
        console.log(event.target.value);
        xStat = event.target.value;
        let newXScale = scaleX(data, xStat);
        updateAxis(xGrid, xGridF, newXScale);
        updateAxis(xAxis, xAxisF, newXScale);
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
        .attr("value", d => d)
        .property("selected", d => d === yStat);

      ySelect.on("change", (event) => {
        console.log(event.target.value);
        yStat = event.target.value;
        let newYScale = scaleY(data, yStat);
        updateAxis(yGrid, yGridF, newYScale);
        updateAxis(yAxis, yAxisF, newYScale);
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
        .attr("value", d => d)
        .property("selected", d => d === DEFAULT_YEAR);

      yearSelect.on("change", (event) => {
        console.log(event.target.value);
        let newData = allData[event.target.value];
        let newXScale = scaleX(newData, xStat);
        let newYScale = scaleY(newData, yStat);
        updateAxis(xGrid, xGridF, newXScale);
        updateAxis(yGrid, yGridF, newYScale);
        updateAxis(xAxis, xAxisF, newXScale);
        updateAxis(yAxis, yAxisF, newYScale);
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
