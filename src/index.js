import setup from "./scripts/setup";
import Plot from "./scripts/plot";
import ML from "./scripts/train";
import { LINE } from "./scripts/constants";

setup();
const plot = new Plot();
const ml = new ML();

const trainButton = document.getElementById("train-button");

trainButton.addEventListener("click", () => {
  const data = plot.getData();

  const selectsGroup = document.querySelector(".train-stats-selects");
  const selects = selectsGroup.querySelectorAll("select");

  let columns = [];

  for (let select of selects) {
    columns.push(select.value);
  }

  // Use set to get rid of duplicate column names
  columns = [... new Set(columns)]

  console.log(columns)
  // ml.train(data, columns);
});
