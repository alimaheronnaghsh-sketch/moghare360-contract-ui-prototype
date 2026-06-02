const openBtn = document.getElementById("openContractBtn");
const closeBtn = document.getElementById("closeContractBtn");
const modal = document.getElementById("contractModal");
const confirmBox = document.getElementById("confirmBox");

openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  confirmBox.classList.remove("disabled");
});
