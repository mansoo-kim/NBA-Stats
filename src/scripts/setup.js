export default () => {

  const aboutButton = document.getElementById("about-button");
  const modalContainer = document.getElementById("modal-container");

  aboutButton.addEventListener("click", () => {
    modalContainer.classList.add("visible");
  });

  modalContainer.addEventListener("click", () => {
    modalContainer.classList.remove("visible");
  });

}
