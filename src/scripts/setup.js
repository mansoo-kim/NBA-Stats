import * as d3 from "d3";
import { DESCRIPTIONS, DISPLAYABLE_COLS, LINE } from "./constants"

export default () => {
  setupModal();
  setupStatsDescriptions();
  setupMLInputSelects();
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
  // Populate list of stats and their descriptions
  const statsUl = d3.select(".stats-list");
  for (const [key, val] of Object.entries(DESCRIPTIONS)) {
    statsUl.append("li").html(`<strong>${key}</strong> - ${val}`)
  }
}

const setupMLInputSelects = function() {
  // Populate input selects
  const selects = d3.select(".train-stats-selects");
  for (let i=0; i < LINE.NUM_STATS; i++) {
    const selectGroup = selects.append("div");
    selectGroup.append("label").text(`Stat ${i+1}`);
    const select = selectGroup.append("select").attr("class", `select-${i+1}`);
    select.append("option").property("default", "true").text("Select");
    select
      .selectAll("option")
      .data(DISPLAYABLE_COLS)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
  }

  const selectGroup = selects.append("div");
    selectGroup.append("label").text("Output Stat");
    const select = selectGroup.append("select");
    select.append("option").property("default", "true").text("Select");
    select
      .selectAll("option")
      .data(DISPLAYABLE_COLS)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
}
