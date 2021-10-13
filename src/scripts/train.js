import { DISPLAYABLE_COLS, LINE } from "./constants"
import * as d3 from "d3";

export default class ML {

  constructor() {
    this.buildTrainingLine();
  }

  buildTrainingLine() {
    // SVG
    this.svg = d3.select(".line-plot").append("svg").attr("width", LINE.WIDTH).attr("height", LINE.HEIGHT);

    // X-axis and grid
    let xScale = d3.scaleLinear()
      .domain([0, LINE.NUM_EPOCHS])
      .range([LINE.LEFT_MARGIN, LINE.WIDTH-LINE.RIGHT_MARGIN]);

    const xGridF = scale => d3.axisBottom(scale)
      .tickSize(-LINE.HEIGHT + LINE.TOP_MARGIN + LINE.BOTTOM_MARGIN)
      .tickFormat("");

    const xGrid = this.svg.append("g")
      .attr("transform", `translate(0, ${LINE.HEIGHT - LINE.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xGridF(xScale));

    const xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    const xAxis = this.svg.append("g")
      .attr("transform", `translate(0, ${LINE.HEIGHT - LINE.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xAxisF(xScale));

    const xLabel = xAxis.append("text")
      .attr("class", "axis-label")
      .attr("x", LINE.WIDTH/2)
      .attr("y", 50)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text("Epoch");

    // Y-axis and grid
    let yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([LINE.HEIGHT-LINE.BOTTOM_MARGIN, LINE.TOP_MARGIN]);

    const yGridF = scale => d3.axisLeft(scale)
      .tickSize(-LINE.WIDTH + LINE.LEFT_MARGIN + LINE.RIGHT_MARGIN)
      .tickFormat("");

    const yGrid = this.svg.append("g")
      .attr("transform", `translate(${LINE.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yGridF(yScale));

    const yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    const yAxis = this.svg.append("g")
      .attr("transform", `translate(${LINE.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yAxisF(yScale));

     const yLabel = yAxis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -LINE.HEIGHT/2 + 14)
      .attr("y", -40)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text("Loss");
  }

  prepData(allData, columns) {
    let oneLargeArray = [];
    for (let key in allData) {
      oneLargeArray = oneLargeArray.concat(allData[key]);
    }

    const trainingSize = Math.floor(oneLargeArray.length*0.8)

    oneLargeArray = this.shuffle(oneLargeArray);

    const trainingDataAllColumns = oneLargeArray.slice(0,trainingSize);
    const testingDataAllColumns = oneLargeArray.slice(trainingSize);

    const trainingData = [];
    for (let datum of trainingDataAllColumns) {
      const inputs = {}
      for (let column of columns) {
        inputs[column] = datum[column];
      }
      const output = { allStar: datum["All-Star"] ? "true" : "false" };
      trainingData.push([inputs, output]);
    }

    const testingInputs = [];
    const testingLabels = [];
    for (let datum of testingDataAllColumns) {
      const inputs = {}
      for (let column of columns) {
        inputs[column] = datum[column];
      }
      const output = datum["All-Star"] ? "true" : "false";
      testingInputs.push(inputs);
      testingLabels.push(output);
    }

    return [trainingData, testingInputs, testingLabels];
  }

  shuffle(arr) {
    // from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
    for (let i=arr.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*i);
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr;
  }

  train(allData, columns=DISPLAYABLE_COLS) {
    const [trainingData, testingInputs, testingLabels] = this.prepData(allData, columns);

    const options = {
      task: 'classification',
      debug: true
    }

    const nn = ml5.neuralNetwork(options);

    for (let datum of trainingData) {
      nn.addData(...datum);
    }

    nn.normalizeData();

  //   const trainingOptions = {
  //     epochs: 32,
  //     batchSize: 12
  //   }
  //   nn.train(trainingOptions, finishedTraining);

  //   function finishedTraining(){
  //     classify();
  //   }

  //   function classify(){
  //     for (let [i, datum] of testingInputs.entries()) {
  //       console.log(datum, testingLabels[i]);
  //       nn.classify(datum, handleResults);
  //     }
  //   }

  //   function handleResults(error, result) {
  //       if(error){
  //         console.error(error);
  //         return;
  //       }
  //       console.log(result);
  //   }
  }
}
