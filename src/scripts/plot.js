import * as d3 from "d3";
import * as Util from "./plot_utils";

const YEARS = [2021, 2020, 2019, 2018, 2017]
const DEFAULT_YEAR = 2021;
const DEFAULT_Y = "PTS";
const DEFAULT_X = "MP";
const DEFAULT_A = "VORP";
const DISPLAYABLE_COLS = ["Age", "G","GS","MP","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","eFG%","FT","FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TOV","PF","PTS", "PER","TS%","3PAr","FTr","ORB%","DRB%","TRB%","AST%","STL%","BLK%","TOV%","USG%","OWS","DWS","WS","WS/48","OBPM","DBPM","BPM","VORP"];
// const OTHER_COLS = ["RK", "Player", "Pos", "Tm", "All-Star"]
const DESCRIPTIONS = {
  "Age": "Player's age on Februrary 1st of the season",
  "G": "Games Played",
  "GS": "Games Started",
  "MP": "Minutes Played Per Game",
  "FG": "Field Goals Scored Per Game",
  "FGA": "Field Goal Attempts Per Game",
  "FG%": "Field Goals %",
  "3P": "3-point Field Goals Scored Per Game",
  "3PA": "3-point Field Goal Attempts Per Game",
  "3P%": "3-point Field Goals %",
  "2P": "2-point Field Goals Scored Per Game",
  "2PA": "2-point Field Goal Attempts Per Game",
  "2P%": "2-point Field Goals %",
  "eFG%": "Effective Field Goal % - adjusts for the fact that a 3-point field goal is worth more than a 2-point field goal",
  "FT": "Free Throws Per Game",
  "FTA": "Free Throw Attempts Per Game",
  "FT%": "Free Throw %",
  "ORB": "Offensive Rebounds Per Game",
  "DRB": "Defensive Rebounds Per Game",
  "TRB": "Total Rebounds Per Game",
  "AST": "Assits Per Game",
  "STL": "Steals Per Game",
  "BLK": "Blocks Per Game",
  "TOV": "Turnovers Per Game",
  "PF": "Personal Fouls Per Game",
  "PTS": "Points Per Game",
  "PER": "Player Efficiency Rating - measure of per-minute production standardized such that the league average is 15",
  "TS%": "True Shooting % - measure of shooting efficiency that takes into account 2-point field goals, 3-point field goals, and free throws",
  "3PAr": " 3-Point Attempt Rate - % of FG attempts from 3-point range",
  "FTr": "Free Throw Attempt Rate - number of FT attempts per FG attempt",
  "ORB%": "Offensive Rebound % - estimate of the % of available offensive rebounds a player grabbed while they were on the floor",
  "DRB%": "Defensive Rebound % - estimate of the % of available defensive rebounds a player grabbed while they were on the floor",
  "TRB%": "Total Rebound % - estimate of the % of available rebounds a player grabbed while they were on the floor",
  "AST%": "Assist % - estimate of the % of teammate field goals a player assisted while they were on the floor",
  "STL%": "Steal % - estimate of the % of opponent possessions that end with a steal by the player while they were on the floor",
  "BLK%": "Block % - estimate of the % of opponent two-point field goal attempts blocked by the player while they were on the floor",
  "TOV%": "Turnover % - estimate of turnovers committed per 100 plays",
  "USG%": "Usage % - estimate of the % of team plays used by a player while they were on the floor",
  "OWS": "Offensive Win Shares - estimate of the number of wins contributed by a player due to offense",
  "DWS": "Defensive Win Shares - estimate of the number of wins contributed by a player due to defense",
  "WS": "Win Shares - estimate of the number of wins contributed by a player",
  "WS/48": "Win Shares Per 48 Minutes - estimate of the number of wins contributed by a player per 48 minutes (league average is approximately .100)",
  "OBPM": "Offensive Box Plus/Minus - box score estimate of the offensive points per 100 possessions a player contributed above a league-average player, translated to an average team",
  "DBPM": "Defensive Box Plus/Minus - box score estimate of the defensive points per 100 possessions a player contributed above a league-average player, translated to an average team",
  "BPM": "Box Plus/Minus - box score estimate of the points per 100 possessions a player contributed above a league-average player, translated to an average team",
  "VORP": "Value over Replacement Player - box score estimate of the points per 100 TEAM possessions that a player contributed above a replacement-level (-2.0) player, translated to an average team and prorated to an 82-game season"
}

export default class Plot {

  constructor() {
    this.getStats();
  }

  buildScatter(allYears) {
    let data = allYears[DEFAULT_YEAR]
    let xStat = DEFAULT_X;
    let yStat = DEFAULT_Y;
    let aStat = DEFAULT_A;
    let year = DEFAULT_YEAR;

    // Add li for stats description
    const statsUl = d3.select(".stats-list");
    for (const [key, val] of Object.entries(DESCRIPTIONS)) {
      statsUl.append("li").html(`<strong>${key}</strong> - ${val}`)
    }

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
      .text(xStat);

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
      .attr("x", -Util.HEIGHT/2 + 14)
      .attr("y", -30)
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
      .on("mouseleave", () => circlesTooltip.style("visibility", "hidden"))
      .attr("cx", d => xScale(d[xStat]))
      .attr("cy", d => yScale(d[yStat]))
      .attr("r", d => aScale(d[aStat]))
      .attr("class", d => d["All-Star"] === true ? "all-star" : null);

    // Div for selecting stats/year
    const selects = d3.select(".scatter").append("div").attr("class", "scatter-selects")

    // Legend
    const legend = selects.append("svg").attr("width", 140).attr("height", 120);

    // for circle size
    legend.append("circle").attr("class", "legend")
      .attr("cx", 5)
      .attr("cy", 25)
      .attr("r", 4);
    legend.append("text").text("---")
      .attr("x", 15)
      .attr("y", 29);
    legend.append("circle").attr("class", "legend")
      .attr("cx", 45)
      .attr("cy", 25)
      .attr("r", 8);
    const aLabel = legend.append("text").text(aStat)
      .attr("x", 58)
      .attr("y", 32);

    // for All-Stars
    legend.append("circle").attr("class", "all-star")
      .attr("cx", 45)
      .attr("cy", 50)
      .attr("r", 7);
    legend.append("text").text("All-Stars")
      .attr("x", 58)
      .attr("y", 57);

    // for non All-stars
    legend.append("circle")
      .attr("cx", 45)
      .attr("cy", 75)
      .attr("r", 7);
    legend.append("text").text("Not All-Stars")
      .attr("x", 58)
      .attr("y", 82);

    // Year options and label
    const yearSelectLabel = selects.append("label").text("Season: ");
    const yearSelect = yearSelectLabel.append("select")
      .attr("class", "year-select");
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
    const ySelectLabel = selects.append("label").text("Y-axis: ");
    const ySelect = ySelectLabel.append("select")
      .attr("class", "y-select");
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
    });

    // X-axis options and label
    const xSelectLabel = selects.append("label").text("X-axis: ");
    const xSelect = xSelectLabel.append("select")
      .attr("class", "x-select");
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
    });

    // Area options and label
    const aSelectLabel = selects.append("label").text("Circle size: ");
    const aSelect = aSelectLabel.append("select")
      .attr("class", "a-select");
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
            <p>${DESCRIPTIONS[stat]}</p>`
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
            <p>${DESCRIPTIONS[stat]}</p>`
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
            <p>${DESCRIPTIONS[stat]}</p>`
          );
      })
      .on("mousemove", (event) => {
        labelTooltip
          .style("left", event.pageX - 240 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseleave", () => labelTooltip.style("visibility", "hidden"));

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
