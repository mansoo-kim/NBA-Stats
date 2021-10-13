import { DISPLAYABLE_COLS, LINE } from "./constants"
import Graph from "./graph";
import * as d3 from "d3";

export default class ML {

  constructor() {
    this.buildTrainingLinePlot();
    this.buildResultsScatter();
  }

  buildResultsScatter() {
   this.resultsScatter = new Graph(".result-scatter", LINE);
   this.resultsScatter.buildXAxis("True Values", [0,1]);
   this.resultsScatter.buildYAxis("Predicted Values", [0,1]);
  }


  buildTrainingLinePlot() {
    // SVG
    this.svgLine = d3.select(".line-plot").append("svg").attr("width", LINE.WIDTH).attr("height", LINE.HEIGHT);

    // Create path that will be updated as training occurs
    this.path = this.svgLine.append("path")
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5);
    this.trainingLosses = []

    // X-axis and grid
    this.xScale = d3.scaleLinear()
      .domain([0, LINE.NUM_EPOCHS])
      .range([LINE.LEFT_MARGIN, LINE.WIDTH-LINE.RIGHT_MARGIN]);

    const xGridF = scale => d3.axisBottom(scale)
      .tickSize(-LINE.HEIGHT + LINE.TOP_MARGIN + LINE.BOTTOM_MARGIN)
      .tickFormat("");

    const xGrid = this.svgLine.append("g")
      .attr("transform", `translate(0, ${LINE.HEIGHT - LINE.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xGridF(this.xScale));

    const xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    const xAxis = this.svgLine.append("g")
      .attr("transform", `translate(0, ${LINE.HEIGHT - LINE.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xAxisF(this.xScale));

    const xLabel = xAxis.append("text")
      .attr("class", "axis-label")
      .attr("x", LINE.WIDTH/2)
      .attr("y", 50)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text("Epoch");

    // Y-axis and grid
    this.yScale = d3.scaleLinear()
      .domain([0, 0.3])
      .range([LINE.HEIGHT-LINE.BOTTOM_MARGIN, LINE.TOP_MARGIN]);

    const yGridF = scale => d3.axisLeft(scale)
      .tickSize(-LINE.WIDTH + LINE.LEFT_MARGIN + LINE.RIGHT_MARGIN)
      .tickFormat("");

    const yGrid = this.svgLine.append("g")
      .attr("transform", `translate(${LINE.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yGridF(this.yScale));

    const yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    const yAxis = this.svgLine.append("g")
      .attr("transform", `translate(${LINE.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yAxisF(this.yScale));

     const yLabel = yAxis.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -LINE.HEIGHT/2 + 14)
      .attr("y", -40)
      .attr('text-anchor', 'middle')
      .attr("fill", "black")
      .text("Loss");
  }

  async run(allData, inputColumns, outputColumn) {
    this.outputColumn = outputColumn;
    const { trainingInputs, trainingY, testingInputs, testingY, outputMin, outputMax } = this.prepData(allData, inputColumns, outputColumn);

    let arr = await testingYTensor.array();
    console.log(arr);

    const model = this.createModel(inputColumns.length);
    // tfvis.show.modelSummary({name: 'Model Summary'}, model);

    await this.train(model, trainingInputs, trainingY);

    const preds = this.test(model, testingInputs);

    this.updateResults(testingY, preds, outputMin, outputMax);
  }

  prepData(allData, inputColumns, outputColumn) {
    let oneLargeArray = [];
    for (let key in allData) {
      oneLargeArray = oneLargeArray.concat(allData[key]);
    }

    const trainingSize = Math.floor(oneLargeArray.length*0.8)

    tf.util.shuffle(oneLargeArray);

    const trainingDataAllColumns = oneLargeArray.slice(0,trainingSize);
    const testingDataAllColumns = oneLargeArray.slice(trainingSize);

    const trainingInputs = trainingDataAllColumns.map(datum => {
      let inputs = [];
      for (let column of inputColumns) {
        inputs.push(datum[column]);
      }
      return inputs;
    });
    const trainingY = trainingDataAllColumns.map(datum =>  datum[outputColumn]);

    const trainingInputTensor = tf.tensor2d(trainingInputs, [trainingInputs.length, inputColumns.length]);
    const trainingYTensor = tf.tensor2d(trainingY, [trainingY.length, 1]);

    const testingInputs = testingDataAllColumns.map(datum => {
      let inputs = [];
      for (let column of inputColumns) {
        inputs.push(datum[column]);
      }
      return inputs;
    });
    const testingY = testingDataAllColumns.map(datum => datum[outputColumn]);

    const testingInputTensor = tf.tensor2d(testingInputs, [testingInputs.length, inputColumns.length]);
    const testingYTensor = tf.tensor2d(testingY, [testingY.length, 1]);

    // Normalize inputs
    const inputMin = trainingInputTensor.min(0);
    const inputMax = trainingInputTensor.max(0);

    const normalizedTrainingInputs = trainingInputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedTestinggInputs = testingInputTensor.sub(inputMin).div(inputMax.sub(inputMin));

    // Normalize Y output values
    const outputMin = trainingYTensor.min();
    const outputMax = trainingYTensor.max();

    const normalizedTrainingY = trainingYTensor.sub(outputMin).div(outputMax.sub(outputMin));
    const normalizedTestingY = testingYTensor.sub(outputMin).div(outputMax.sub(outputMin));

    return  {
      trainingInputs: normalizedTrainingInputs,
      trainingY: normalizedTrainingY,
      testingInputs: normalizedTestinggInputs,
      testingY: normalizedTestingY,
      outputMin,
      outputMax
    };
  }

  createModel(inputShape) {
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 3, inputShape: [inputShape], useBias: true}))
    model.add(tf.layers.dense({units: 1, useBias: true}));
    return model;
  }

  lossUpdateCallback(epoch, logs) {
    // console.log(epoch, logs);
    this.trainingLosses.push({epoch, logs});
    this.path.datum(this.trainingLosses)
      .attr("d", d3.line()
        .x(d => this.xScale(d.epoch))
        .y(d => this.yScale(d.logs.loss))
      );
  }

  async train(model, inputs, labels) {
    const batchSize = 32;
    const epochs = 10;

    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse'],
    });

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: [
        // tfvis.show.fitCallbacks(
        //   { name: 'Training Performance' },
        //   ['loss', 'mse'],
        //   { height: 200, callbacks: ['onEpochEnd'] }
        // ),
        new tf.CustomCallback({
          onEpochEnd: this.lossUpdateCallback.bind(this),
        })
      ]
    });

  }

  test(model, testingInputs) {
    return model.predict(testingInputs);
  }

  async updateResults(yTrue, yPred, outputMin, outputMax) {

    const unNormTrue = yTrue.mul(outputMax.sub(outputMin)).add(outputMin);
    const unNormPred = yPred.mul(outputMax.sub(outputMin)).add(outputMin);
    const trueY = await unNormTrue.array();
    const predY = await unNormPred.array();

    const zipped = trueY.map((el, i)  => {
      return [el[0], predY[i][0]]
    });

    this.resultsScatter.updateXAxis(zipped, 0, `True ${this.outputColumn}`)
    this.resultsScatter.updateYAxis(zipped, 1, `Predicted ${this.outputColumn}`)

    let circles = this.resultsScatter.svg.append("g")
      .attr("class", "scatter-circles")
      .selectAll("circle").data(zipped).enter().append("circle")
      .attr("cx", d => this.resultsScatter.xScale(d[0]))
      .attr("cy", d => this.resultsScatter.yScale(d[1]))
      .attr("r", _ => 5)
  }
}
