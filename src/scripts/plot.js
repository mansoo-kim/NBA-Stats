import * as d3 from "d3";
import * as Util from "./plot_utils";
import * as Constants from "./constants";

const SCATTER = Constants.SCATTER;
const YEARS = [2021, 2020, 2019, 2018, 2017]
const DEFAULT_YEAR = 2021;
const DEFAULT_Y = "PTS";
const DEFAULT_X = "MP";
const DEFAULT_A = "VORP";
// const OTHER_COLS = ["RK", "Player", "Pos", "Tm", "All-Star"]

export default class Plot {

  constructor() {
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
    this.svg = d3.select(".scatter").append("svg").attr("width", SCATTER.WIDTH).attr("height", SCATTER.HEIGHT);

    // X-Axis
    let xScale = Util.scaleX(data, xStat);

    const xGridF = scale => d3.axisBottom(scale)
      .tickSize(-SCATTER.HEIGHT + SCATTER.TOP_MARGIN + SCATTER.BOTTOM_MARGIN)
      .tickFormat("");

    const xGrid = this.svg.append("g")
      .attr("transform", `translate(0, ${SCATTER.HEIGHT - SCATTER.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xGridF(xScale));

    const xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    const xAxis = this.svg.append("g")
      .attr("transform", `translate(0, ${SCATTER.HEIGHT - SCATTER.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xAxisF(xScale));

    const xLabel = xAxis.append("text")
      .attr("class", "axis-label")
      .attr("x", SCATTER.WIDTH/2)
      .attr("y", 50)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(xStat);

    // Y-Axis
    let yScale = Util.scaleY(data, yStat)

    const yGridF = scale => d3.axisLeft(scale)
      .tickSize(-SCATTER.WIDTH + SCATTER.LEFT_MARGIN + SCATTER.RIGHT_MARGIN)
      .tickFormat("");

    const yGrid = this.svg.append("g")
      .attr("transform", `translate(${SCATTER.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yGridF(yScale));

    const yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    const yAxis = this.svg.append("g")
      .attr("transform", `translate(${SCATTER.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yAxisF(yScale));

    const yLabel = yAxis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -SCATTER.HEIGHT/2 + 14)
      .attr("y", -40)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(yStat);

    // Area for Circles
    let aScale = Util.scaleA(data, aStat);

    // Hover text tooltip for circles
    const circlesTooltip = d3.select(".scatter").append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute");

    // Circles
    let circles = this.svg.append("g")
      .attr("class", "scatter-circles")
      .selectAll("circle").data(data).enter().append("circle");

    circles
      .on("mouseenter", (_, d) => {
        const imgTag = (d["Tm"] !== "TOT") ? `<img src="src/assets/images/team-logos/${d["Tm"]}.png" width="30px">` : "";
        circlesTooltip
        .style("visibility", "visible")
        .html(
          `<div class="tooltip-logo-line"><strong>${d["Player"]}</strong>${imgTag}</div>
          <p>${yStat}: ${d[yStat]}</p>
          <p>${xStat}: ${d[xStat]}</p>
          <p>${aStat}: ${d[aStat]}</p>`
        );
      })
      .on("mousemove", (event) => {
        circlesTooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseleave", () => circlesTooltip.style("visibility", "hidden"))
      .attr("cx", d => xScale(d[xStat]))
      .attr("cy", d => yScale(d[yStat]))
      .attr("r", d => aScale(d[aStat]))
      .attr("class", d => d["All-Star"] === true ? "all-star" : null);


    // Div for selecting stats/year
    const legendSelect = d3.select(".scatter").append("div").attr("class", "legend-selects");

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
      xScale = Util.scaleX(data, xStat);
      yScale = Util.scaleY(data, yStat);
      aScale = Util.scaleA(data, aStat);
      Util.updateAxis(xGrid, xGridF, xScale);
      Util.updateAxis(yGrid, yGridF, yScale);
      Util.updateAxis(xAxis, xAxisF, xScale);
      Util.updateAxis(yAxis, yAxisF, yScale);
      circles = circles.data(data);
      circles.exit().remove();
      circles.enter().append("circle")
        .on("mouseenter", (_, d) => {
          circlesTooltip
          .style("visibility", "visible")
          .html(
            `<strong>${d["Player"]}</strong>
            <p>${yStat}: ${d[yStat]}</p>
            <p>${xStat}: ${d[xStat]}</p>
            <p>${aStat}: ${d[aStat]}</p>`
          );
        })
        .on("mousemove", (event) => {
          circlesTooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 40 + "px");
        })
        .on("mouseleave", () => circlesTooltip.style("visibility", "hidden"));
      circles = this.svg.select(".scatter-circles").selectAll("circle");
      Util.updateCircles(circles, xScale, yScale, aScale, xStat, yStat, aStat);
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
      yScale = Util.scaleY(data, yStat);
      Util.updateAxis(yGrid, yGridF, yScale);
      Util.updateAxis(yAxis, yAxisF, yScale);
      Util.updateCirclesY(circles, yScale, yStat);
      yLabel.text(yStat);
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
      xScale = Util.scaleX(data, xStat);
      Util.updateAxis(xGrid, xGridF, xScale);
      Util.updateAxis(xAxis, xAxisF, xScale);
      Util.updateCirclesX(circles, xScale, xStat);
      xLabel.text(xStat);
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

    // Hover text tooltip for axis/area labels
    const labelTooltip = d3.select(".scatter").append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute");

    xLabel
      .on("mouseenter", () => {
        let stat = xLabel.text();
        labelTooltip
          .style("visibility", "visible")
          .html(
            `<strong>${stat}</strong>
            <p>${Constants.DESCRIPTIONS[stat]}</p>`
          );
      })
      .on("mousemove", (event) => {
        labelTooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", () => labelTooltip.style("visibility", "hidden"));

    yLabel
      .on("mouseenter", () => {
        let stat = yLabel.text();
        labelTooltip
          .style("visibility", "visible")
          .html(
            `<strong>${stat}</strong>
            <p>${Constants.DESCRIPTIONS[stat]}</p>`
          );
      })
      .on("mousemove", (event) => {
        labelTooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", () => labelTooltip.style("visibility", "hidden"));

    aLabel
      .on("mouseenter", () => {
        let stat = aLabel.text();
        labelTooltip
          .style("visibility", "visible")
          .html(
            `<strong>${stat}</strong>
            <p>${Constants.DESCRIPTIONS[stat]}</p>`
          );
      })
      .on("mousemove", (event) => {
        labelTooltip
          .style("left", event.pageX - 275 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", () => labelTooltip.style("visibility", "hidden"));

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
