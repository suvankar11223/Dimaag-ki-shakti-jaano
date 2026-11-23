const REQUEST_TIMEOUT_MS = 20000;
const SCORE_MAX = 10;

const ENUMS = {
  gender: ["Female", "Male"],
  academic_level: ["Graduate", "High School", "Undergraduate"],
  most_used_platform: ["Facebook", "Instagram", "KakaoTalk", "LINE", "LinkedIn", "Snapchat", "TikTok", "Twitter", "VKontakte", "WeChat", "WhatsApp", "YouTube"],
  purpose_of_use: ["Education", "Entertainment", "Networking", "News"],
  stress_level: ["Low", "Medium", "High", "Very High"],
};
const LABELS = {
  gender: "gender",
  academic_level: "academic level",
  most_used_platform: "platform",
  purpose_of_use: "purpose",
  stress_level: "stress level",
};
const NUMBER_RULES = {
  age: { label: "Age", integer: true, min: 0, max: 100 },
  avg_daily_usage_hours: { label: "Screen time", integer: false, min: 0, max: 24 },
  daily_unlocks: { label: "Daily unlocks", integer: true, min: 0, max: 500 },
  study_hours: { label: "Study hours", integer: false, min: 0, max: 24 },
  physical_activity_hours: { label: "Physical activity", integer: false, min: 0, max: 24, allowZero: true },
  sleep_hours_per_night: { label: "Sleep hours", integer: false, min: 0, max: 24 },
};
const FIELD_ORDER = [
  "age", "gender", "country", "academic_level", "most_used_platform", "purpose_of_use",
  "avg_daily_usage_hours", "daily_unlocks", "study_hours", "physical_activity_hours",
  "sleep_hours_per_night", "stress_level",
];

const $ = (id) => document.getElementById(id);
const form = $("predictForm");
const submitBtn = $("submitBtn");
const errorBox = $("errorBox");

function drawGaugeTicks() {
  const group = $("ticks");
  const namespace = "http://www.w3.org/2000/svg";
  for (let i = 0; i <= 10; i += 1) {
    const angle = Math.PI * (1 - i / 10);
    const line = document.createElementNS(namespace, "line");
    line.setAttribute("x1", 110 + 100 * Math.cos(angle));
    line.setAttribute("y1", 110 - 100 * Math.sin(angle));
    line.setAttribute("x2", 110 + 106 * Math.cos(angle));
    line.setAttribute("y2", 110 - 106 * Math.sin(angle));
    group.appendChild(line);
  }
}

function fieldElement(name) {
  const element = form.elements[name];
  return element instanceof RadioNodeList ? element[0] : element;
}

function fieldWrapper(name) {
  const element = fieldElement(name);
  return element ? element.closest(".field") : null;
}

function setFieldError(name, message) {
  const wrapper = fieldWrapper(name);
  const output = $(`err-${name}`);
  if (!wrapper || !output) return;
  wrapper.classList.toggle("invalid", Boolean(message));
  output.textContent = message || "";
}

function validateField(name) {
  const raw = form.elements[name].value;
  if (name === "country") {
    return raw.length > 60 ? "Country name must be 60 characters or fewer." : "";
  }
  if (ENUMS[name]) {
    if (!raw) return `Please select ${LABELS[name]}.`;
    return ENUMS[name].includes(raw) ? "" : `Please select a valid ${LABELS[name]}.`;
  }
  const rule = NUMBER_RULES[name];
  if (raw === "") return `${rule.label} is required.`;
  const value = Number(raw);
  if (!Number.isFinite(value)) return `${rule.label} must be a number.`;
  if (rule.integer && !Number.isInteger(value)) return `${rule.label} must be a whole number.`;
  if (value < rule.min || (!rule.allowZero && value === rule.min)) {
    return rule.allowZero ? `${rule.label} cannot be negative.` : `${rule.label} must be greater than ${rule.min}.`;
  }
  if (value > rule.max) return `${rule.label} must be ${rule.max} or less.`;
  return "";
}

function validateAll() {
  const invalidFields = [];
  FIELD_ORDER.forEach((name) => {
    const message = validateField(name);
    setFieldError(name, message);
    if (message) invalidFields.push(name);
  });
  return invalidFields;
}

function buildPayload() {
  const payload = {};
  Object.keys(ENUMS).forEach((name) => {
    payload[name] = form.elements[name].value;
  });
  Object.entries(NUMBER_RULES).forEach(([name, rule]) => {
    const value = Number(form.elements[name].value);
    payload[name] = rule.integer ? Math.trunc(value) : value;
  });
  payload.country = form.elements.country.value.trim() || "Other";
  return payload;
}

function showError(title, message, details = []) {
  $("errorTitle").textContent = title;
  $("errorMessage").textContent = message || "";
  const list = $("errorList");
  list.replaceChildren();
  details.forEach((detail) => {
    const item = document.createElement("li");
    item.textContent = detail;
    list.appendChild(item);
  });
  errorBox.hidden = false;
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
  errorBox.hidden = true;
}

function validationMessages(detail) {
  if (!Array.isArray(detail)) {
    return [typeof detail === "string" ? detail : "The server rejected the input."];
  }
  return detail.map((item) => {
    const location = Array.isArray(item.loc) ? item.loc : [];
    const field = location[location.length - 1];
    const message = item.msg || "Invalid value";
    if (FIELD_ORDER.includes(field)) setFieldError(field, message);
    return `${String(field || "input").replace(/_/g, " ")}: ${message}`;
  });
}

function explainError(error) {
  if (error.name === "AbortError") {
    return { title: "Request timed out", message: "The prediction took too long. Check the service and try again." };
  }
  if (error instanceof TypeError) {
    return { title: "Cannot reach the prediction service", message: "Check that the FastAPI server is running, then refresh this page." };
  }
  if (error.status === 422) {
    return { title: "Please check your answers", message: "Some values do not match the model's accepted inputs.", details: validationMessages(error.body?.detail) };
  }
  if (error.status >= 500) {
    return { title: "Prediction failed", message: "The server could not complete the prediction. Check the server terminal for details." };
  }
  return { title: "Something went wrong", message: error.message || "Please try again." };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function predict(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const body = await requestJson("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!body || typeof body.predicted_mental_health_score !== "number") {
      throw new Error("The prediction service returned an unexpected response.");
    }
    return body.predicted_mental_health_score;
  } finally {
    clearTimeout(timer);
  }
}

function showState(state) {
  $("stateIdle").hidden = state !== "idle";
  $("stateLoading").hidden = state !== "loading";
  $("stateResult").hidden = state !== "result";
}

function setGauge(fraction) {
  $("gaugeFill").style.strokeDashoffset = String(100 * (1 - fraction));
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.classList.toggle("is-loading", loading);
  submitBtn.querySelector(".btn-label").textContent = loading ? "Reading the signal…" : "Generate my estimate";
  if (loading) {
    setGauge(0);
    showState("loading");
    if (window.matchMedia("(max-width: 940px)").matches) {
      $("resultPanel").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function animateNumber(element, score) {
  const start = performance.now();
  const duration = 1100;
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    element.textContent = (score * (1 - (1 - progress) ** 3)).toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function showResult(score, payload) {
  showState("result");
  animateNumber($("scoreValue"), score);
  setGauge(Math.max(0, Math.min(1, score / SCORE_MAX)));
  const items = [
    ["Age", payload.age],
    ["Platform", payload.most_used_platform],
    ["Screen", `${payload.avg_daily_usage_hours}h`],
    ["Sleep", `${payload.sleep_hours_per_night}h`],
    ["Stress", payload.stress_level],
  ];
  const list = $("summaryList");
  list.replaceChildren();
  items.forEach(([label, value]) => {
    const item = document.createElement("li");
    const strong = document.createElement("b");
    strong.textContent = `${label} `;
    item.append(strong, document.createTextNode(String(value)));
    list.appendChild(item);
  });
  if (window.matchMedia("(max-width: 940px)").matches) {
    $("resultPanel").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function checkApi() {
  const status = $("apiStatus");
  const text = $("apiStatusText");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch("/api/health", { signal: controller.signal });
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    status.className = "api-status online";
    text.textContent = "Model ready";
  } catch {
    status.className = "api-status offline";
    text.textContent = "Model unavailable – check the server";
  } finally {
    clearTimeout(timer);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();
  const invalidFields = validateAll();
  if (invalidFields.length) {
    showError("Please check the highlighted fields", `${invalidFields.length} field${invalidFields.length === 1 ? " needs" : "s need"} attention.`);
    fieldWrapper(invalidFields[0]).scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const payload = buildPayload();
  setLoading(true);
  try {
    const score = await predict(payload);
    showResult(score, payload);
  } catch (error) {
    const details = explainError(error);
    showState("idle");
    showError(details.title, details.message, details.details || []);
    if (error instanceof TypeError || error.name === "AbortError") checkApi();
  } finally {
    setLoading(false);
  }
});

FIELD_ORDER.forEach((name) => {
  const element = form.elements[name];
  const controls = element instanceof RadioNodeList ? Array.from(element) : [element];
  controls.forEach((control) => {
    control.addEventListener(control.tagName === "SELECT" || control.type === "radio" ? "change" : "input", () => {
      if (fieldWrapper(name).classList.contains("invalid")) setFieldError(name, validateField(name));
    });
    control.addEventListener("blur", () => {
      if (form.elements[name].value !== "") setFieldError(name, validateField(name));
    });
  });
});

$("errorClose").addEventListener("click", hideError);
$("resetBtn").addEventListener("click", () => {
  form.reset();
  FIELD_ORDER.forEach((name) => setFieldError(name, ""));
  hideError();
  setGauge(0);
  showState("idle");
});

drawGaugeTicks();
checkApi();