const openBtn = document.getElementById("openContractBtn");
const closeBtn = document.getElementById("closeContractBtn");
const xCloseBtn = document.getElementById("xCloseContractBtn");
const modal = document.getElementById("contractModal");
const statusNote = document.getElementById("contractViewStatus");
const contractReadConfirm = document.getElementById("contractReadConfirm");

const signatureBox = document.getElementById("signatureBox");
const otpBox = document.getElementById("otpBox");
const startQuestionsBtn = document.getElementById("startQuestionsBtn");
const signedName = document.getElementById("signedName");
const nationalId = document.getElementById("nationalId");

const questionModal = document.getElementById("questionModal");
const questionTitle = document.getElementById("questionTitle");
const questionBody = document.getElementById("questionBody");
const questionActions = document.getElementById("questionActions");

const finalChoicesSummary = document.getElementById("finalChoicesSummary");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const finalSubmitBtn = document.getElementById("finalSubmitBtn");
const otpCode = document.getElementById("otpCode");

const canvas = document.getElementById("signatureCanvas");
const clearSignatureBtn = document.getElementById("clearSignatureBtn");

let contractReadAndClosed = false;
let signatureIsNotEmpty = false;
let demoOtp = null;

const answers = {
  hiddenFaultAccepted: null,
  insuranceOption: null,
  insuranceWarningAccepted: false,
  purchaseLimit: null
};

/* قرارداد */

function openContract() {
  modal.classList.remove("hidden");
}

function closeContractWithApproval() {
  if (!contractReadConfirm || !contractReadConfirm.checked) {
    alert("برای ادامه، ابتدا باید مطالعه کامل متن قرارداد را تأیید کنید.");
    return;
  }

  modal.classList.add("hidden");
  contractReadAndClosed = true;
  signatureBox.classList.remove("hidden");
  signatureBox.scrollIntoView({ behavior: "smooth", block: "start" });

  statusNote.textContent = "متن قرارداد با تأیید مطالعه بسته شد. اکنون می‌توانید مرحله امضا را تکمیل کنید.";
  statusNote.classList.add("success");
  statusNote.classList.remove("warning");
}

function closeContractWithoutApproval() {
  modal.classList.add("hidden");

  if (!contractReadAndClosed) {
    statusNote.textContent = "متن قرارداد بدون تأیید مطالعه بسته شد. برای ادامه باید دوباره قرارداد را باز کنید و مطالعه را تأیید نمایید.";
    statusNote.classList.remove("success");
    statusNote.classList.add("warning");
  }
}

openBtn.addEventListener("click", openContract);

contractReadConfirm.addEventListener("change", () => {
  closeBtn.disabled = !contractReadConfirm.checked;
});

closeBtn.addEventListener("click", closeContractWithApproval);

xCloseBtn.addEventListener("click", closeContractWithoutApproval);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    alert("برای ادامه، باید داخل متن قرارداد گزینه مطالعه را تأیید کنید و دکمه «متن قرارداد را مطالعه کردم و می‌بندم» را بزنید.");
  }
});

/* امضای دیجیتال */

function setupSignatureCanvas() {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;

  function fitCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    if (!rect.width || !rect.height) return;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#b9f3df";
  }

  setTimeout(fitCanvas, 300);
  window.addEventListener("resize", fitCanvas);

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : event;

    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  function startDraw(event) {
    event.preventDefault();
    drawing = true;
    signatureIsNotEmpty = true;

    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!drawing) return;

    event.preventDefault();
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function stopDraw() {
    drawing = false;
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDraw);

  clearSignatureBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureIsNotEmpty = false;
  });
}

setupSignatureCanvas();

function validateSignatureStep() {
  const nameValue = signedName.value.trim();
  const nationalValue = nationalId.value.trim();

  if (!contractReadAndClosed) {
    alert("ابتدا باید متن قرارداد را مطالعه و تأیید کنید.");
    return false;
  }

  if (!nameValue) {
    alert("نام و نام خانوادگی جهت امضا را وارد کنید.");
    return false;
  }

  if (!/^\d{10}$/.test(nationalValue)) {
    alert("کد ملی باید دقیقاً ۱۰ رقم باشد.");
    return false;
  }

  if (!signatureIsNotEmpty) {
    alert("امضای دیجیتال باید ثبت شود.");
    return false;
  }

  return true;
}

startQuestionsBtn.addEventListener("click", () => {
  if (!validateSignatureStep()) return;
  showHiddenFaultQuestion();
});

/* ابزار Pop-up */

function openQuestionModal() {
  questionModal.classList.remove("hidden");
}

function closeQuestionModal() {
  questionModal.classList.add("hidden");
}

function setQuestion(title, bodyHtml, actionsHtml) {
  questionTitle.textContent = title;
  questionBody.innerHTML = bodyHtml;
  questionActions.innerHTML = actionsHtml;
  openQuestionModal();
}

/* سؤال ۱ */

function showHiddenFaultQuestion() {
  setQuestion(
    "۱. تأیید خرابی‌های پنهان و کامپیوتری",
    `
      <p>
        آیا می‌پذیرید که مسئولیت مالی خرابی‌های پنهان، کامپیوتری، برقی، نرم‌افزاری، ECU، سنسورها
        و ایرادات غیرقابل مشاهده در لحظه پذیرش، پس از اعلام و ثبت در پرونده، بر عهده شما خواهد بود؟
      </p>
      <p class="warning-text">
        بدون پذیرش این بند، امکان ادامه فرآیند پذیرش و عقد قرارداد آنلاین وجود ندارد.
      </p>
    `,
    `
      <button class="btn primary" type="button" onclick="acceptHiddenFault()">می‌پذیرم</button>
      <button class="btn danger" type="button" onclick="rejectHiddenFault()">نمی‌پذیرم</button>
    `
  );
}

function acceptHiddenFault() {
  answers.hiddenFaultAccepted = true;
  showInsuranceQuestion();
}

function rejectHiddenFault() {
  answers.hiddenFaultAccepted = false;
  closeQuestionModal();
  otpBox.classList.add("hidden");

  alert("بدون پذیرش مسئولیت خرابی‌های پنهان و کامپیوتری، امکان ادامه فرآیند پذیرش و عقد قرارداد آنلاین وجود ندارد.");
}

/* سؤال ۲ */

function showInsuranceQuestion() {
  setQuestion(
    "۲. تست رانندگی و بیمه بدنه",
    `
      <p>
        در صورت نیاز به تست رانندگی، جابه‌جایی خودرو یا حادثه احتمالی، وضعیت اجازه تست و استفاده از بیمه بدنه را مشخص کنید.
      </p>

      <label class="radio-row">
        <input type="radio" name="qInsurance" value="allowed">
        <span>اجازه تست رانندگی و استفاده از بیمه بدنه خودرو را در صورت حادثه احتمالی می‌دهم.</span>
      </label>

      <label class="radio-row">
        <input type="radio" name="qInsurance" value="not_allowed">
        <span>اجازه تست رانندگی / استفاده از بیمه بدنه را نمی‌دهم.</span>
      </label>

      <label class="radio-row">
        <input type="radio" name="qInsurance" value="not_available">
        <span>خودرو بیمه بدنه ندارد / از وضعیت بیمه بدنه اطلاع ندارم.</span>
      </label>

      <div id="qInsuranceWarning" class="warning-box hidden">
        <strong>هشدار مهم</strong>
        <p>
          در این حالت خودرو ممکن است بدون تست رانندگی نهایی تحویل شود یا مشتری باید پیش از اتمام کار
          در محل مجموعه حاضر شود تا تست رانندگی با حضور یا مسئولیت ایشان انجام شود.
        </p>

        <label class="check-row">
          <input type="checkbox" id="qInsuranceWarningAccepted">
          <span>هشدار فوق را مطالعه کردم و تأیید می‌کنم.</span>
        </label>
      </div>
    `,
    `
      <button class="btn primary" type="button" onclick="submitInsuranceQuestion()">ادامه</button>
    `
  );

  const radios = document.querySelectorAll('input[name="qInsurance"]');
  const warning = document.getElementById("qInsuranceWarning");
  const warningAccepted = document.getElementById("qInsuranceWarningAccepted");

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "not_allowed" || radio.value === "not_available") {
        warning.classList.remove("hidden");
      } else {
        warning.classList.add("hidden");
        warningAccepted.checked = false;
      }
    });
  });
}

function submitInsuranceQuestion() {
  const selected = document.querySelector('input[name="qInsurance"]:checked');
  const warningAccepted = document.getElementById("qInsuranceWarningAccepted");

  if (!selected) {
    alert("لطفاً وضعیت تست رانندگی و بیمه بدنه را انتخاب کنید.");
    return;
  }

  if (
    (selected.value === "not_allowed" || selected.value === "not_available") &&
    (!warningAccepted || !warningAccepted.checked)
  ) {
    alert("برای ادامه، باید هشدار مربوط به تست رانندگی و بیمه بدنه را تأیید کنید.");
    return;
  }

  answers.insuranceOption = selected.value;
  answers.insuranceWarningAccepted =
    selected.value === "not_allowed" || selected.value === "not_available";

  showPurchaseQuestion();
}

/* سؤال ۳ */

function showPurchaseQuestion() {
  setQuestion(
    "۳. سقف اختیار خرید قطعه و خدمات مرتبط",
    `
      <p>
        سقف اختیار مجموعه برای خرید قطعه، خدمات مرتبط، خدمات بیرونی و اقلام مورد نیاز خودرو را مشخص کنید.
      </p>

      <label class="radio-row">
        <input type="radio" name="qPurchase" value="under_1b_rial">
        <span>کمتر از ۱,۰۰۰,۰۰۰,۰۰۰ ریال</span>
      </label>

      <label class="radio-row">
        <input type="radio" name="qPurchase" value="between_1b_2_5b_rial">
        <span>از ۱,۰۰۰,۰۰۰,۰۰۰ ریال تا ۲,۵۰۰,۰۰۰,۰۰۰ ریال</span>
      </label>

      <label class="radio-row">
        <input type="radio" name="qPurchase" value="unlimited">
        <span>بدون سقف، مطابق نیاز فنی خودرو و تشخیص مجموعه</span>
      </label>
    `,
    `
      <button class="btn primary" type="button" onclick="submitPurchaseQuestion()">ادامه به دریافت کد تأیید</button>
    `
  );
}

function submitPurchaseQuestion() {
  const selected = document.querySelector('input[name="qPurchase"]:checked');

  if (!selected) {
    alert("لطفاً سقف اختیار خرید قطعه و خدمات مرتبط را انتخاب کنید.");
    return;
  }

  answers.purchaseLimit = selected.value;

  closeQuestionModal();
  showOtpStep();
}

/* OTP */

function getInsuranceText(value) {
  if (value === "allowed") return "اجازه تست رانندگی و استفاده از بیمه بدنه داده شد.";
  if (value === "not_allowed") return "اجازه تست رانندگی / استفاده از بیمه بدنه داده نشد.";
  if (value === "not_available") return "خودرو بیمه بدنه ندارد / مشتری اطلاع ندارد.";
  return "ثبت نشده";
}

function getPurchaseText(value) {
  if (value === "under_1b_rial") return "کمتر از ۱,۰۰۰,۰۰۰,۰۰۰ ریال";
  if (value === "between_1b_2_5b_rial") return "از ۱,۰۰۰,۰۰۰,۰۰۰ تا ۲,۵۰۰,۰۰۰,۰۰۰ ریال";
  if (value === "unlimited") return "بدون سقف، مطابق نیاز فنی خودرو و تشخیص مجموعه";
  return "ثبت نشده";
}

function showOtpStep() {
  finalChoicesSummary.innerHTML = `
    <h3>خلاصه تأییدهای ثبت‌شده</h3>
    <p><strong>خرابی‌های پنهان:</strong> پذیرفته شد.</p>
    <p><strong>تست رانندگی و بیمه بدنه:</strong> ${getInsuranceText(answers.insuranceOption)}</p>
    <p><strong>سقف اختیار خرید:</strong> ${getPurchaseText(answers.purchaseLimit)}</p>
  `;

  otpBox.classList.remove("hidden");
  otpBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

sendOtpBtn.addEventListener("click", () => {
  demoOtp = "123456";
  alert("کد تأیید دمو: 123456\nدر سایت اصلی، این کد با پیامک واقعی ارسال خواهد شد.");
});

finalSubmitBtn.addEventListener("click", () => {
  if (!demoOtp) {
    alert("ابتدا کد تأیید را دریافت کنید.");
    return;
  }

  if (!otpCode.value.trim()) {
    alert("کد تأیید پیامکی را وارد کنید.");
    return;
  }

  if (otpCode.value.trim() !== demoOtp) {
    alert("کد تأیید واردشده صحیح نیست. در نسخه دمو کد 123456 است.");
    return;
  }

  alert("قرارداد با موفقیت در نسخه دمو تأیید شد. در سایت اصلی، در این مرحله قرارداد ذخیره و JobCard فعال می‌شود.");
});
