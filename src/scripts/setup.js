export default () => {

  const aboutButton = document.getElementById("about-button");
  const modalContainer = document.getElementById("modal-container");
  const aboutDiv = document.getElementById("about-div");

  aboutButton.addEventListener("click", () => {
    modalContainer.classList.add("visible");
  });

  modalContainer.addEventListener("click", () => {
    modalContainer.classList.remove("visible");
  });

  aboutDiv.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

}
