import setup from "./scripts/setup";
import Vis from "./scripts/vis";
import ML from "./scripts/ml";

setup();
const plot = new Vis();
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
  columns = [... new Set(columns)].filter( d => d !== "Select")

  const outputColumn = columns[columns.length-1];
  columns = columns.slice(0,columns.length-1);
  console.log(columns, outputColumn)
  ml.run(data, columns, outputColumn);
});
