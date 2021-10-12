import setup from "./scripts/setup";
import Plot from "./scripts/plot";
import ML from "./scripts/train";

setup();
const plot = new Plot();
const ml = new ML();

const trainButton = document.getElementById("train-button");

trainButton.addEventListener("click", () => {
  const data = plot.getData();
  ml.train(data);
});
