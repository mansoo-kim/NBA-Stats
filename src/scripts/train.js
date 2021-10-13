import { DISPLAYABLE_COLS, LINE } from "./constants"
import * as d3 from "d3";

export default class ML {

  constructor() {
    this.buildTrainingLine();
  }

  buildTrainingLine() {
    // SVG
    this.svg = d3.select(".line-plot").append("svg").attr("width", LINE.WIDTH).attr("height", LINE.HEIGHT);

    // Create path that will be updated as training occurs
    this.path = this.svg.append("path")
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

    const xGrid = this.svg.append("g")
      .attr("transform", `translate(0, ${LINE.HEIGHT - LINE.BOTTOM_MARGIN})`)
      .attr("class", "axis")
      .call(xGridF(this.xScale));

    const xAxisF = scale => d3.axisBottom(scale).tickSize(10);

    const xAxis = this.svg.append("g")
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

    const yGrid = this.svg.append("g")
      .attr("transform", `translate(${LINE.LEFT_MARGIN}, 0)`)
      .attr("class", "axis")
      .call(yGridF(this.yScale));

    const yAxisF = scale => d3.axisLeft(scale).tickSize(10);

    const yAxis = this.svg.append("g")
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

  async run(allData, columns=DISPLAYABLE_COLS) {
    const { trainingInputs, trainingLabels, testingInputs, testingLabels, positivesCount, negativesCount } = this.prepData(allData, columns);

    const model = this.createModel();
    tfvis.show.modelSummary({name: 'Model Summary'}, model);


    await this.train(model, trainingInputs, trainingLabels, positivesCount, negativesCount);

    this.test(model, testingInputs, testingLabels);
  }

  prepData(allData, columns) {
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
      for (let column of columns) {
        inputs.push(datum[column]);
      }
      return inputs;
    });
    const trainingLabels = trainingDataAllColumns.map(datum =>  datum["All-Star"] ? 1 : 0);

    let positivesCount = 0;
    for (let label of trainingLabels) {
      positivesCount += label;
    }
    let negativesCount = trainingLabels.length - positivesCount;

    const trainingInputTensor = tf.tensor2d(trainingInputs, [trainingInputs.length, LINE.NUM_STATS]);
    const trainingLabelTensor = tf.tensor2d(trainingLabels, [trainingLabels.length, 1]);


    const testingInputs = testingDataAllColumns.map(datum => {
      let inputs = [];
      for (let column of columns) {
        inputs.push(datum[column]);
      }
      return inputs;
    });
    const testingLabels = testingDataAllColumns.map(datum => datum["All-Star"] ? 1 : 0);

    const testingInputTensor = tf.tensor2d(testingInputs, [testingInputs.length, LINE.NUM_STATS]);
    const testingLabelTensor = tf.tensor2d(testingLabels, [testingLabels.length, 1]);

    // Normalize inputs
    const inputMin = trainingInputTensor.min(0);
    const inputMax = trainingInputTensor.max(0);

    const normalizedTrainingInputs = trainingInputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedTestinggInputs = testingInputTensor.sub(inputMin).div(inputMax.sub(inputMin));

    return  {
      trainingInputs: normalizedTrainingInputs,
      trainingLabels: trainingLabelTensor,
      testingInputs: normalizedTestinggInputs,
      testingLabels: testingLabelTensor,
      positivesCount,
      negativesCount };
  }

  createModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 4, inputShape: [LINE.NUM_STATS], useBias: true}))
    model.add(tf.layers.dense({units: 1, useBias: true, activation: 'sigmoid'}));
    return model;
  }

  async train(model, inputs, labels, positivesCount, negativesCount) {
    const batchSize = 32;
    const epochs = 50;

    const weightNegative = 1/negativesCount * (positivesCount+negativesCount)/2
    const weightPositive = 1/positivesCount * (positivesCount+negativesCount)/2

    const weight = { 0: weightNegative, 1: weightPositive }

    console.log(weight);

    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.sigmoidCrossEntropy,
      metrics: ['precision', 'mse', 'binaryAccuracy'],
    });

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      classWeight: weight,
      callbacks: tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse', 'precision', 'binaryAccuracy'],
        { height: 200, callbacks: ['onEpochEnd'] }
      )
    });

  }

  test(model, testingInputs, testingLabels) {
    const preds = model.predict(testingInputs);
    console.log(preds.print());
    console.log(testingLabels.print());
    console.log(tf.metrics.precision(testingLabels, preds).print());
    console.log(tf.metrics.recall(testingLabels, preds).print());
    console.log(tf.metrics.binaryAccuracy(testingLabels, preds).print());
  }
}
