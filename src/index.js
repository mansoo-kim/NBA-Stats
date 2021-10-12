import setup from "./scripts/setup";
import Plot from "./scripts/plot";
import train from "./scripts/train";

setup();
const plot = new Plot();

const trainButton = document.getElementById("train-button");

trainButton.addEventListener("click", () => {
  const data = plot.getData();
  train(data);
});
