import * as d3 from "d3";
import * as Constants from "./constants"

export default () => {
  setupModal();
  setupStatsDescriptions();
}

const setupModal = function() {
  const aboutButton = document.getElementById("about-button");
  const modalContainer = document.getElementById("modal-container");
  const aboutDiv = document.getElementById("about-div");

  aboutButton.addEventListener("click", () => {
    modalContainer.classList.remove("hidden");
  });

  modalContainer.addEventListener("click", () => {
    modalContainer.classList.add("hidden");
  });

  aboutDiv.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

const setupStatsDescriptions = function() {
  console.log("here");
  const statsUl = d3.select(".stats-list");
  for (const [key, val] of Object.entries(Constants.DESCRIPTIONS)) {
    statsUl.append("li").html(`<strong>${key}</strong> - ${val}`)
  }
}
