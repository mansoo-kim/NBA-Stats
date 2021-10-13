import * as d3 from "d3";
import { DESCRIPTIONS, DISPLAYABLE_COLS, SMALL } from "./constants"

export const setupModal = () => {
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

export const setupStatsDescriptions = () => {
  // Populate list of stats and their descriptions
  const statsUl = d3.select(".stats-list");
  for (const [key, val] of Object.entries(DESCRIPTIONS)) {
    statsUl.append("li").html(`<strong>${key}</strong> - ${val}`)
  }
}

export const setupMLInputSelects = () => {
  // Populate input selects
  const selects = d3.select(".train-stats-selects");
  for (let i=0; i < SMALL.NUM_STATS; i++) {
    const selectGroup = selects.append("div");
    selectGroup.append("label").text(`Stat ${i+1}`);
    const select = selectGroup.append("select").attr("class", `select-${i+1}`);
    select
      .selectAll("option")
      .data(["Select", ...DISPLAYABLE_COLS])
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
  }

  const selectGroup = selects.append("div");
    selectGroup.append("label").text("Output Stat");
    const select = selectGroup.append("select").attr("class", "output-select");
    select
      .selectAll("option")
      .data(["Select", ...DISPLAYABLE_COLS])
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d)
}

export const setupMLButtons = (plot, ml) => {
  const trainButton = document.getElementById("train-button");
  const clearButton = document.getElementById("clear-button");

  trainButton.addEventListener("click", () => {
    const data = plot.getData();
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
    clearButton.disabled = true;
    ml.run(data, columns, outputColumn);
  });


  clearButton.addEventListener("click", () => {
    ml.reset();
  });
}
