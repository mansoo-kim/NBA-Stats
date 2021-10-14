import * as d3 from "d3";

export default class Graph {

  constructor(startingDiv, CONSTANTS) {
    this.constants = CONSTANTS
    this.tooltip = d3.select(".tooltip");

    this.svg = d3.select(startingDiv).append("svg").attr("width", this.constants.WIDTH).attr("height", this.constants.HEIGHT);
  }

  addTitle(title) {
    this.svg.append("text")
      .attr("x", this.constants.WIDTH/2)
      .attr("y", this.constants.TOP_MARGIN*2/3)
      .attr("class", "graph-title")
      .attr('text-anchor', 'middle')
      .text(title);
  }

  buildXAxis(label, domain) {
    this.initialX = { label, domain}
    // X-axis and grid
    this.xScale = d3.scaleLinear()
      .domain(domain)
      .range([this.constants.LEFT_MARGIN, this.constants.WIDTH-this.constants.RIGHT_MARGIN])
      .nice();

    this.xGridF = scale => d3.axisBottom(scale)
      .tickSize(-this.constants.HEIGHT + this.constants.TOP_MARGIN + this.constants.BOTTOM_MARGIN)
      .tickFormat("");

    this.xGrid = this.svg.append("g")
      .attr("transform", `translate(0, ${this.constants.HEIGHT - this.constants.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(this.xGridF(this.xScale));

    this.xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    this.xAxis = this.svg.append("g")
      .attr("transform", `translate(0, ${this.constants.HEIGHT - this.constants.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(this.xAxisF(this.xScale));

    this.xLabel = this.xAxis.append("text")
      .attr("class", "axis-label")
      .attr("x", this.constants.WIDTH/2)
      .attr("y", 50)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(label);
  }

  buildYAxis(label, domain) {
    this.initialY = { label, domain};
    // Y-axis and grid
    this.yScale = d3.scaleLinear()
      .domain(domain)
      .range([this.constants.HEIGHT-this.constants.BOTTOM_MARGIN, this.constants.TOP_MARGIN])
      .nice();

    this.yGridF = scale => d3.axisLeft(scale)
      .tickSize(-this.constants.WIDTH + this.constants.LEFT_MARGIN + this.constants.RIGHT_MARGIN)
      .tickFormat("");

    this.yGrid = this.svg.append("g")
      .attr("transform", `translate(${this.constants.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(this.yGridF(this.yScale));

    this.yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    this.yAxis = this.svg.append("g")
      .attr("transform", `translate(${this.constants.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(this.yAxisF(this.yScale));

    this.yLabel = this.yAxis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -this.constants.HEIGHT/2 + 14)
      .attr("y", -40)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text(label);
  }

  updateXAxis({ domain, data, column, label }) {
    if (!domain) domain = d3.extent(data, d => d[column])

    this.xScale = d3.scaleLinear()
      .domain(domain)
      .range([this.constants.LEFT_MARGIN, this.constants.WIDTH-this.constants.RIGHT_MARGIN])
      .nice();

    this.xGrid.transition().duration(1000).call(this.xGridF(this.xScale));
    this.xAxis.transition().duration(1000).call(this.xAxisF(this.xScale));
    this.xLabel.text(label);
  }

  updateYAxis({ domain, data, column, label }) {
    if (!domain) domain = d3.extent(data, d => d[column])

    this.yScale = d3.scaleLinear()
      .domain(domain)
      .range([this.constants.HEIGHT-this.constants.BOTTOM_MARGIN, this.constants.TOP_MARGIN])
      .nice();

    this.yGrid.transition().duration(1000).call(this.yGridF(this.yScale));
    this.yAxis.transition().duration(1000).call(this.yAxisF(this.yScale));
    this.yLabel.text(label);
  }

  addLabelTooltip(label, onEnter) {
    label
      .on("mouseenter", onEnter)
      .on("mousemove", (event) => {
        this.tooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 25 + "px")
      })
      .on("mouseleave", () => this.tooltip.style("visibility", "hidden"));
  }

  reset() {
    this.updateXAxis(this.initialX);
    this.updateYAxis(this.initialY);
  }

}
