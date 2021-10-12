import { DISPLAYABLE_COLS } from "./constants"
import * as d3 from "d3";

export default class ML {

  constructor(allData) {
    this.allData = allData;
  }

  train = (columns) => {
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
