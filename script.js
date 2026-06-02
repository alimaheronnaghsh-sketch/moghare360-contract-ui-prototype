const openBtn = document.getElementById("openContractBtn");
const closeBtn = document.getElementById("closeContractBtn");
const xCloseBtn = document.getElementById("xCloseContractBtn");
const modal = document.getElementById("contractModal");
const confirmBox = document.getElementById("confirmBox");
const statusNote = document.getElementById("contractViewStatus");

let contractViewed = false;

function openContract() {
  modal.classList.remove("hidden");
  contractViewed = true;
}

function closeContract() {
  modal.classList.add("hidden");

  if (contractViewed) {
    confirmBox.classList.remove("disabled");

    if (statusNote) {
      statusNote.textContent = "متن قرارداد مشاهده و بسته شد. اکنون می‌توانید تأییدها را تکمیل کنید.";
      statusNote.classList.add("success");
    }
  }
}

openBtn.addEventListener("click", openContract);
closeBtn.addEventListener("click", closeContract);

if (xCloseBtn) {
  xCloseBtn.addEventListener("click", closeContract);
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeContract();
  }
});
