import * as d3 from "d3";
import * as Util from "./vis_utils";
import * as Constants from "./constants";
import Graph from "./graph";

const SCATTER = Constants.LARGE;
const YEARS = [2021, 2020, 2019, 2018, 2017]
const DEFAULT_YEAR = 2021;
const DEFAULT_Y = "PTS";
const DEFAULT_X = "MP";
const DEFAULT_A = "VORP";
// const OTHER_COLS = ["RK", "Player", "Pos", "Tm", "All-Star"]

export default class Vis {

  constructor() {
    this.tooltip = d3.select(".tooltip");
    this.getStats();
  }

  getData() {
    return this.allData;
  }

  buildScatter(allYears) {

    this.allData = allYears;
    let data = allYears[DEFAULT_YEAR]
    let xStat = DEFAULT_X;
    let yStat = DEFAULT_Y;
    let aStat = DEFAULT_A;
    let year = DEFAULT_YEAR;

    // SVG
    this.plot = new Graph(".vis-scatter", SCATTER)
    this.plot.buildXAxis(xStat, d3.extent(data, d => d[xStat]));
    this.plot.buildYAxis(yStat, d3.extent(data, d => d[yStat]));

    // Area for Circles
    let aScale = Util.scaleA(data, aStat);

    // Circles
    let circles = this.plot.svg.append("g")
      .attr("class", "scatter-circles")
      .selectAll("circle").data(data).enter().append("circle");

    circles
      .on("mouseenter", (_, d) => {
        const imgTag = (d["Tm"] !== "TOT") ? `<img src="src/assets/images/team-logos/${d["Tm"]}.png" width="30px">` : "";
        this.tooltip
        .style("visibility", "visible")
        .html(
          `<div class="tooltip-logo-line"><strong>${d["Player"]}</strong>${imgTag}</div>
          <p>${yStat}: ${d[yStat]}</p>
          <p>${xStat}: ${d[xStat]}</p>
          <p>${aStat}: ${d[aStat]}</p>`
        );
      })
      .on("mousemove", (event) => {
        this.tooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseleave", () => this.tooltip.style("visibility", "hidden"))
      .attr("cx", d => this.plot.xScale(d[xStat]))
      .attr("cy", d => this.plot.yScale(d[yStat]))
      .attr("r", d => aScale(d[aStat]))
      .attr("class", d => d["All-Star"] === true ? "all-star" : null);


    // Div for selecting stats/year
    const legendSelect = d3.select(".vis-scatter").append("div").attr("class", "legend-selects");

    // Legend
    const legend = legendSelect.append("svg").attr("width", 162).attr("height", 120);

    // for circle size
    legend.append("circle").attr("class", "legend")
      .attr("cx", 7)
      .attr("cy", 25)
      .attr("r", 4);
    legend.append("text").text("---")
      .attr("x", 17)
      .attr("y", 29);
    legend.append("circle").attr("class", "legend")
      .attr("cx", 47)
      .attr("cy", 25)
      .attr("r", 8);
    const aLabel = legend.append("text").text(aStat).attr("class", "strong")
      .attr("x", 66)
      .attr("y", 32);

    // for All-Stars
    legend.append("circle").attr("class", "all-star")
      .attr("cx", 47)
      .attr("cy", 50)
      .attr("r", 7);
    legend.append("text").text("All-Stars")
      .attr("x", 66)
      .attr("y", 57);

    // for non All-stars
    legend.append("circle")
      .attr("cx", 47)
      .attr("cy", 75)
      .attr("r", 7);
    legend.append("text").text("Not All-Stars")
      .attr("x", 66)
      .attr("y", 82);

    // Div for selects
    const selects = legendSelect.append("div").attr("class", "scatter-selects");

    // Year options and label
    const yearSelectGroup = selects.append("div");
    yearSelectGroup.append("label").text("Season");
    const yearSelect = yearSelectGroup.append("select");
    const yearOptions = yearSelect
      .selectAll("option")
      .data(YEARS)
      .enter()
      .append("option")
      .text(d => `${d-1} - ${d}`)
      .attr("value", d => d)
      .property("selected", d => d === year);

    yearSelect.on("change", (event) => {
      data = allYears[event.target.value];
      this.plot.updateXAxis({ data, column: xStat, label: xStat });
      this.plot.updateYAxis({ data, column: yStat, label: yStat });
      aScale = Util.scaleA(data, aStat);
      circles = circles.data(data);
      circles.exit().remove();
      circles.enter().append("circle")
        .on("mouseenter", (_, d) => {
          this.tooltip
          .style("visibility", "visible")
          .html(
            `<strong>${d["Player"]}</strong>
            <p>${yStat}: ${d[yStat]}</p>
            <p>${xStat}: ${d[xStat]}</p>
            <p>${aStat}: ${d[aStat]}</p>`
          );
        })
        .on("mousemove", (event) => {
          this.tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 40 + "px");
        })
        .on("mouseleave", () => this.tooltip.style("visibility", "hidden"));
      circles = this.plot.svg.select(".scatter-circles").selectAll("circle");
      Util.updateCircles(circles, this.plot.xScale, this.plot.yScale, aScale, xStat, yStat, aStat);
    });

    // Y-axis options and label
    const ySelectGroup = selects.append("div");
    ySelectGroup.append("label").text("Y-axis");
    const ySelect = ySelectGroup.append("select");
    const yOptions = ySelect
      .selectAll("option")
      .data(Constants.DISPLAYABLE_COLS)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
      .property("selected", d => d === yStat);

    ySelect.on("change", (event) => {
      yStat = event.target.value;
      this.plot.updateYAxis({ data, column: yStat, label: yStat });
      Util.updateCirclesY(circles, this.plot.yScale, yStat);
    });

    // X-axis options and label
    const xSelectGroup = selects.append("div");
    xSelectGroup.append("label").text("X-axis");
    const xSelect = xSelectGroup.append("select");
    const xOptions = xSelect
      .selectAll("option")
      .data(Constants.DISPLAYABLE_COLS)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
      .property("selected", d => d === xStat);

    xSelect.on("change", (event) => {
      xStat = event.target.value;
      this.plot.updateXAxis({ data, column: xStat, label: xStat });
      Util.updateCirclesX(circles, this.plot.xScale, xStat);
    });

    // Area options and label
    const aSelectGroup = selects.append("div");
    aSelectGroup.append("label").text("Circle Size");
    const aSelect = aSelectGroup.append("select");
    const aOptions = aSelect
      .selectAll("option")
      .data(Constants.DISPLAYABLE_COLS)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
      .property("selected", d => d === aStat);

    aSelect.on("change", (event) => {
      aStat = event.target.value;
      aScale = Util.scaleA(data, aStat);
      Util.updateCirclesA(circles, aScale, aStat);
      aLabel.text(aStat);
    });

    this.plot.addLabelTooltip(this.plot.xLabel, () => {
      let stat = this.plot.xLabel.text();
      this.tooltip
        .style("visibility", "visible")
        .html(
          `<strong>${stat}</strong>
          <p>${Constants.DESCRIPTIONS[stat]}</p>`
        );
    });

    this.plot.addLabelTooltip(this.plot.yLabel, () => {
      let stat = this.plot.yLabel.text();
      this.tooltip
        .style("visibility", "visible")
        .html(
          `<strong>${stat}</strong>
          <p>${Constants.DESCRIPTIONS[stat]}</p>`
        );
    });

    aLabel
      .on("mouseenter", () => {
        let stat = aLabel.text();
        this.tooltip
          .style("visibility", "visible")
          .html(
            `<strong>${stat}</strong>
            <p>${Constants.DESCRIPTIONS[stat]}</p>`
          );
      })
      .on("mousemove", (event) => {
        this.tooltip
          .style("left", event.pageX - 275 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", () => this.tooltip.style("visibility", "hidden"));

  }

  async getStats() {
    const allYears = {};
    for (let year of YEARS) {
      let data = await d3.csv(`src/data/${year-1}-${year}-stats.csv`);
      for (let datum of data) {
          for (let col of Constants.DISPLAYABLE_COLS) {
            datum[col] = +datum[col]
          }
          datum["All-Star"] = (datum["All-Star"] === "true");
        }
        allYears[year] = data;
    }

    this.buildScatter(allYears);
  }
}
