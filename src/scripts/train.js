import { DISPLAYABLE_COLS } from "./constants"
import * as d3 from "d3";

const NUM_STATS = 5;

export default class ML {

  constructor() {
    this.buildTrainingLine();
  }

  buildTrainingLine() {
    const selects = d3.select(".train-stats-selects");
    for (let i=0; i < NUM_STATS; i++) {
      console.log("test")
      const selectGroup = selects.append("div");
      selectGroup.append("label").text(`Stat ${i+1}`);
      const select = selectGroup.append("select");
      select
        .selectAll("option")
        .data(DISPLAYABLE_COLS)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)
        .property("selected", d => d === DISPLAYABLE_COLS[i]);
    }
  }

  train = (allData, columns=DISPLAYABLE_COLS) => {
    const dataTraining = allData[2020];
    const dataTesting = allData[2021];

    const testingInputs = [];
    const testingLabels = [];

    for (let datum of dataTesting) {
      const inputs = {};
      for (let key of columns) {
        inputs[key] = datum[key];
      }

      const output = {
        allStar: datum["All-Star"] ? "true" : "false",
        Player: datum["Player"]
      }

      testingInputs.push(inputs);
      testingLabels.push(output);
    }

    const options = {
      task: 'classification',
      debug: true
    }

    const nn = ml5.neuralNetwork(options);

    for (let datum of dataTraining) {
      const inputs = {};
      for (let key of columns) {
        inputs[key] = datum[key];
      }
      const output = {
        allStar: datum["All-Star"] ? "All-Star" : "Not"
      };

      nn.addData(inputs, output);
    }

    nn.normalizeData();

    const trainingOptions = {
      epochs: 32,
      batchSize: 12
    }
    nn.train(trainingOptions, finishedTraining);

    function finishedTraining(){
      classify();
    }

    function classify(){
      for (let [i, datum] of testingInputs.entries()) {
        console.log(datum, testingLabels[i]);
        nn.classify(datum, handleResults);
      }
    }

    function handleResults(error, result) {
        if(error){
          console.error(error);
          return;
        }
        console.log(result);
    }
  }
}
