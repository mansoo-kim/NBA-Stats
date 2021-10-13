import { SMALL } from "./constants"
import Graph from "./graph";
import * as d3 from "d3";

const EPOCHS = 10;

export default class ML {

  constructor() {
    this.buildTrainingLinePlot();
    this.buildResultsScatter();
  }

  buildResultsScatter() {
   this.resultsScatter = new Graph(".result-scatter", SMALL);
   this.resultsScatter.buildXAxis("True Values", [0,1]);
   this.resultsScatter.buildYAxis("Predicted Values", [0,1]);

   this.circlesTooltip = d3.select(".result-scatter").append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute");
  }


  buildTrainingLinePlot() {
    this.trainingLine = new Graph(".training-line", SMALL);
    this.trainingLine.buildXAxis("Epoch", [0,EPOCHS-1]);
    this.trainingLine.buildYAxis("Loss", [0,1]);

    // Create path that will be updated as training occurs
    this.path = this.trainingLine.svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#c9082a")
      .attr("stroke-width", 1.5);
    this.trainingLosses = []
  }

  async run(allData, inputColumns, outputColumn) {
    this.outputColumn = outputColumn;
    const { trainingInputs, trainingY, testingInputs, testingY, outputMin, outputMax } = this.prepData(allData, inputColumns, outputColumn);

    const model = this.createModel(inputColumns.length);

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
    if (epoch === 0) this.trainingLine.updateYAxis({ domain: [0, logs.loss], label: "Loss"})
    this.trainingLosses.push({epoch, logs});
    this.path.datum(this.trainingLosses)
      .attr("d", d3.line()
        .x(d => this.trainingLine.xScale(d.epoch))
        .y(d => this.trainingLine.yScale(d.logs.loss))
      );
  }

  async train(model, inputs, labels) {
    const batchSize = 32;
    const epochs = EPOCHS;

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
        new tf.CustomCallback({
          onEpochEnd: this.lossUpdateCallback.bind(this),
        })
      ]
    });

  }

  test(model, testingInputs) {
    return model.predict(testingInputs);
  }

  async updateResults(yTrueTensor, yPredTensor, outputMin, outputMax) {
    // Un-normalize Y values
    const unNormTrue = yTrueTensor.mul(outputMax.sub(outputMin)).add(outputMin);
    const unNormPred = yPredTensor.mul(outputMax.sub(outputMin)).add(outputMin);
    const yTrue = await unNormTrue.array();
    const yPred = await unNormPred.array();

    const zipped = yTrue.map((el, i)  => {
      return [el[0], yPred[i][0]]
    });

    let flattened = [
      ...d3.extent(zipped, d => d[0]),
      ...d3.extent(zipped, d => d[1])
    ]
    let domain = d3.extent(flattened);

    this.resultsScatter.updateXAxis({domain, label: `True ${this.outputColumn}`})
    this.resultsScatter.updateYAxis({domain, label: `Predicted ${this.outputColumn}`})

    this.circles = this.resultsScatter.svg.append("g")
      .attr("class", "scatter-circles")
      .selectAll("circle").data(zipped).enter().append("circle")
      .attr("cx", d => this.resultsScatter.xScale(d[0]))
      .attr("cy", d => this.resultsScatter.yScale(d[1]))
      .attr("r", _ => 5)
      .on("mouseenter", (_, d) => {
        this.circlesTooltip
          .style("visibility", "visible")
          .html(
            `<p>Predicted: ${d[1].toFixed(2)}</p>
            <p>True: ${d[0].toFixed(2)}</p>`
        );
      })
      .on("mousemove", (event) => {
        this.circlesTooltip
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseleave", () => this.circlesTooltip.style("visibility", "hidden"));
  }
}
