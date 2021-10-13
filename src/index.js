import setup from "./scripts/setup";
import Vis from "./scripts/vis";
import ML from "./scripts/ml";
import { SMALL } from "./scripts/constants";

setup();
const plot = new Vis();
const ml = new ML();
let data;

const trainButton = document.getElementById("train-button");

trainButton.addEventListener("click", () => {
  data ||= plot.getData();
  const outputColumn = document.querySelector(".output-select").value;

  // Must select an output stat to predict
  if (outputColumn === "Select") {
    return;
  }

  let columns = []
  for (let i=0; i < SMALL.NUM_STATS; i++) {
    const stat = document.querySelector(`.select-${i+1}`).value;
    if (stat !== "Select") columns.push(stat);
  }

  // Use set to get rid of duplicate columns
  columns = [...new Set(columns)]

  // Must select at least one output stat
  if (!columns.length) return;

  console.log(columns, outputColumn);

  trainButton.disabled = true;
  ml.run(data, columns, outputColumn);
});
