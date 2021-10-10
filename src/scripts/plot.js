import * as d3 from "d3";
import * as Util from "./plot_utils";

const YEARS = [2021, 2020, 2019, 2018, 2017]
const DEFAULT_YEAR = 2021
const DEFAULT_Y = "PTS"
const DEFAULT_X = "MP"
const DEFAULT_A = "VORP" // A for Area
const DISPLAYABLE_COLS = ["Age", "G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS", "PER","TS%","3PAr","FTr","ORB%","DRB%","TRB%","AST%","STL%","BLK%","TOV%","USG%","OWS","DWS","WS","WS/48","OBPM","DBPM","BPM","VORP"]
// const OTHER_COLS = ["RK", "Player", "Pos", "Tm", "All-Star"]

export default class Plot {

  constructor() {
    this.getStats();
  }

  buildScatter(allYears) {
    console.log(allYears);
    let data = allYears[DEFAULT_YEAR]
    let xStat = DEFAULT_X;
    let yStat = DEFAULT_Y;
    let aStat = DEFAULT_A;
    let year = DEFAULT_YEAR;

    // SVG
    this.svg = d3.select(".scatter").append("svg").attr("width", Util.WIDTH).attr("height", Util.HEIGHT);

    // X-Axis
    let xScale = Util.scaleX(data, xStat);

    const xGridF = scale => d3.axisBottom(scale)
      .tickSize(-Util.HEIGHT + Util.TOP_MARGIN + Util.BOTTOM_MARGIN)
      .tickFormat("");

    const xGrid = this.svg.append("g")
      .attr("transform", `translate(0, ${Util.HEIGHT - Util.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xGridF(xScale));

    const xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    const xAxis = this.svg.append("g")
      .attr("transform", `translate(0, ${Util.HEIGHT - Util.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xAxisF(xScale));

    const xLabel = xAxis.append("text")
      .attr("class", "axis-label")
      .attr("x", Util.WIDTH/2)
      .attr("y", 40)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(xStat)

    // Y-Axis
    let yScale = Util.scaleY(data, yStat)

    const yGridF = scale => d3.axisLeft(scale)
      .tickSize(-Util.WIDTH + Util.LEFT_MARGIN + Util.RIGHT_MARGIN)
      .tickFormat("");

    const yGrid = this.svg.append("g")
      .attr("transform", `translate(${Util.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yGridF(yScale));

    const yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    const yAxis = this.svg.append("g")
      .attr("transform", `translate(${Util.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yAxisF(yScale));

    const yLabel = yAxis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -Util.HEIGHT/2)
      .attr("y", -30)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(yStat)

    // Area for Circles
    let aScale = Util.scaleA(data, aStat);

    // Hover text tooltip for circles
    const circlesLabel = d3.select(".tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute");

    // Create circles
    const createNewCircles = () => {
      return this.svg.selectAll("circle").data(data).enter().append("circle")
      .attr("cx", d => xScale(d[xStat]))
      .attr("cy", d => yScale(d[yStat]))
      .attr("r", d => aScale(Math.sqrt(d[aStat])))
      .attr("class", d => d["All-Star"] === true ? "all-star" : null)
      .on("mouseenter", (_, d) => {
        circlesLabel
        .style("visibility", "visible")
        .html(
          `<strong>${d["Player"]}</strong>
          <p>${yStat}: ${d[yStat]}</p>
          <p>${xStat}: ${d[xStat]}</p>
          <p>${aStat}: ${d[aStat]}</p>`
        )
      })
      .on("mousemove", (event) => {
        circlesLabel
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px")
      })
      .on("mouseleave", () => circlesLabel.style("visibility", "hidden"));
    }

    // Circles
    let circles = createNewCircles();

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
      xScale = Util.scaleX(data, xStat);
      Util.updateAxis(xGrid, xGridF, xScale);
      Util.updateAxis(xAxis, xAxisF, xScale);
      Util.updateCirclesX(circles, xScale, xStat);
      xLabel.text(xStat);
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
      yScale = Util.scaleY(data, yStat);
      Util.updateAxis(yGrid, yGridF, yScale);
      Util.updateAxis(yAxis, yAxisF, yScale);
      Util.updateCirclesY(circles, yScale, yStat);
      yLabel.text(yStat);
    })

    // Options for Area
    const aSelect = d3.select(".a-select")
    const aOptions = aSelect
      .selectAll("option")
      .data(DISPLAYABLE_COLS)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
      .property("selected", d => d === aStat);

    aSelect.on("change", (event) => {
      console.log(event.target.value);
      aStat = event.target.value;
      aScale = Util.scaleA(data, aStat);
      Util.updateCirclesA(circles, aScale, aStat);
    })

    // Options for Year Select
    const yearSelect = d3.select(".year-select")
    const yearOptions = yearSelect
      .selectAll("option")
      .data(YEARS)
      .enter()
      .append("option")
      .text(d => `${d-1} - ${d}`)
      .attr("value", d => d)
      .property("selected", d => d === year);

    yearSelect.on("change", (event) => {
      console.log(event.target.value);
      data = allYears[event.target.value];
      xScale = Util.scaleX(data, xStat);
      yScale = Util.scaleY(data, yStat);
      aScale = Util.scaleA(data, aStat);
      Util.updateAxis(xGrid, xGridF, xScale);
      Util.updateAxis(yGrid, yGridF, yScale);
      Util.updateAxis(xAxis, xAxisF, xScale);
      Util.updateAxis(yAxis, yAxisF, yScale);
      circles.remove();
      circles = createNewCircles();
    })
  }

  async getStats() {
    const allYears = {};
    for (let year of YEARS) {
      let data = await d3.csv(`src/data/${year-1}-${year}-stats.csv`);
      for (let datum of data) {
          for (let col of DISPLAYABLE_COLS) {
            datum[col] = +datum[col]
          }
          datum["All-Star"] = (datum["All-Star"] === "true");
        }
        allYears[year] = data;
    }

    this.buildScatter(allYears);
  }
}