// --- Data ---
import { cardDataArray } from "./data.js";

let cardData = [...cardDataArray];

const pastelColors = [
  "#fef9c3",
  "#ecfccb",
  "#dcfce7",
  "#d1fae5",
  "#ccfbf1",
  "#cffafe",
  "#e0f2fe",
  "#dbeafe",
  "#e0e7ff",
  "#ede9fe",
  "#f3e8ff",
  "#fae8ff",
  "#fce7f3",
  "#ffe4e6",
  "#fee2e2",
  "#ffedd5",
];

// --- State ---
let swipeState = {};
let cards = [];
let firedCount = 0;
let raisedCount = 0;
let abmahnungenCount = 0;
let hrbpName = "";
let hrbpNumber = "";
let uniqueJobTitles = [];
let uniqueDepartments = [];
let suggestionIndex = -1; // For keyboard navigation
let currentSuggestions = []; // For keyboard navigation

// --- DOM Elements ---
const startupScreen = document.getElementById("startup-screen");
const mainAppArea = document.getElementById("main-app-area");
const hrbpNameInput = document.getElementById("hrbp-name");
const hrbpNumberInput = document.getElementById("hrbp-number");
const startButton = document.getElementById("start-button");
const startupError = document.getElementById("startup-error");
const topMenu = document.getElementById("top-menu");
const userNameDisplay = document.getElementById("user-name-display");
const userNumberDisplay = document.getElementById("user-number-display");
const userMenuTrigger = document.getElementById("user-menu-trigger");
const logoutDropdown = document.getElementById("logout-dropdown");
const logoutButton = document.getElementById("logout-button");
const cardStack = document.getElementById("card-stack");
const fireButton = document.getElementById("fire-button");
const raiseButton = document.getElementById("raise-button");
const abmahnungButton = document.getElementById("abmahnung-button");
const putBackButton = document.getElementById("put-back-button");
const actionButtons = [fireButton, raiseButton, abmahnungButton, putBackButton];
const noMoreCardsDiv = document.getElementById("no-more-cards");
const actionButtonsDiv = document.getElementById("action-buttons");
const resetButton = document.getElementById("reset-button");
const firedCountSpan = document.getElementById("fired-count");
const raisedCountSpan = document.getElementById("raised-count");
const abmahnungenCountSpan = document.getElementById("abmahnungen-count");
const approvalNotification = document.getElementById("approval-notification");
const approvalBox = document.getElementById("approval-box");
const approvalText = document.getElementById("approval-text");
const approvalEmployeeName = document.getElementById("approval-employee-name");
const closeApprovalButton = document.getElementById("close-approval-button");
const addEmployeeButton = document.getElementById("add-employee-button");
const resetEmployeesButton = document.getElementById("reset-employees-button");
const addEmployeeModal = document.getElementById("add-employee-modal");
const addEmployeeBox = document.getElementById("add-employee-box");
const saveEmployeeButton = document.getElementById("save-employee-button");
const cancelAddButton = document.getElementById("cancel-add-button");
const addEmployeeError = document.getElementById("add-employee-error");
const newNameInput = document.getElementById("newName");
const newJobTitleInput = document.getElementById("newJobTitle");
const newDepartmentInput = document.getElementById("newDepartment");
const newYearsInput = document.getElementById("newYears");
const newPerformanceInput = document.getElementById("newPerformance");
const newSummaryInput = document.getElementById("newSummary");
const newScenarioInput = document.getElementById("newScenario");
const jobTitleSuggestions = document.getElementById("jobTitle-suggestions");
const departmentSuggestions = document.getElementById("department-suggestions");

const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenuDropdown = document.getElementById("mobile-menu-dropdown");
const mobileHistoryContent = document.getElementById("mobile-history-content");
const mobileAddButton = document.getElementById("mobile-add-button");
const mobileResetButton = document.getElementById("mobile-reset-button");
const mobileLogoutButton = document.getElementById("mobile-logout-button");
const mobileUserNameDisplay = document.getElementById(
  "mobile-user-name-display"
);
const mobileUserNumberDisplay = document.getElementById(
  "mobile-user-number-display"
);

// Required fields for validation
const requiredInputs = [
  newNameInput,
  newJobTitleInput,
  newDepartmentInput,
  newYearsInput,
  newPerformanceInput,
  newSummaryInput,
];

// --- Interaction Variables ---
let isDragging = false;
let startX = 0,
  startY = 0;
let currentX = 0,
  currentY = 0;
let activeCard = null;
let isFlipping = false;
const FLIP_ANIMATION_DURATION = 600;
let pointerDownTime = 0;
let potentialClick = false;
const CLICK_MAX_DURATION = 250;
const MOVE_THRESHOLD = 10;

// --- Helper Functions ---
function disableActionButtons() {
  actionButtons.forEach((button) => (button.disabled = true));
}
function enableActionButtons() {
  if (
    !approvalNotification.classList.contains("show") &&
    (cards.length > 0 || activeCard)
  ) {
    actionButtons.forEach((button) => (button.disabled = false));
  } else {
    disableActionButtons();
  }
}

// --- Core Functions ---
function createCardElement(cardInfo) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.id = cardInfo.id;
  const randomColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)];
  card.style.backgroundColor = randomColor;
  const cardInner = document.createElement("div");
  cardInner.classList.add("card-inner");
  const cardFront = document.createElement("div");
  cardFront.classList.add("card-front");
  cardFront.innerHTML = ` <div class="employee-header"> <h3>${
    cardInfo.name
  }</h3> <span>${cardInfo.department}</span> </div> <p class="job-title">${
    cardInfo.jobTitle
  }</p> <h4 class="summary-title">Letzte Bewertung / Szenario</h4> <p class="summary-text">${
    cardInfo.scenario || cardInfo.lastReviewSummary
  }</p> `;
  const cardBack = document.createElement("div");
  cardBack.classList.add("card-back");
  cardBack.innerHTML = ` <h4>Details</h4> <p class="detail-item"><strong>Name:</strong> <span>${
    cardInfo.name
  }</span></p> <p class="detail-item"><strong>Position:</strong> <span>${
    cardInfo.jobTitle
  }</span></p> <p class="detail-item"><strong>Abteilung:</strong> <span>${
    cardInfo.department
  }</span></p> <p class="detail-item"><strong>Jahre im Unternehmen:</strong> <span>${
    cardInfo.yearsInCompany
  }</span></p> <p class="detail-item"><strong>Leistung:</strong> <span>${
    cardInfo.performanceScore
  }/5</span></p> <h4>Letzte Bewertung / Szenario Notizen</h4> <p>${
    cardInfo.lastReviewSummary
  }</p> ${
    cardInfo.scenario
      ? `<h4>Aktuelles Szenario</h4><p>${cardInfo.scenario}</p>`
      : ""
  } `;
  cardBack.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFlip(card);
  });
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);
  const fireIndicator = document.createElement("div");
  fireIndicator.classList.add("swipe-indicator", "fire");
  fireIndicator.innerHTML = `<i class="fas fa-user-slash"></i> Kündigen`;
  card.appendChild(fireIndicator);
  const raiseIndicator = document.createElement("div");
  raiseIndicator.classList.add("swipe-indicator", "raise");
  raiseIndicator.innerHTML = `<i class="fas fa-thumbs-up"></i> Lob`;
  card.appendChild(raiseIndicator);
  const abmahnungIndicator = document.createElement("div");
  abmahnungIndicator.classList.add("swipe-indicator", "abmahnung");
  abmahnungIndicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Abmahnung`;
  card.appendChild(abmahnungIndicator);
  const putBackIndicator = document.createElement("div");
  putBackIndicator.classList.add("swipe-indicator", "put-back");
  putBackIndicator.innerHTML = `<i class="fas fa-undo"></i> Zurücklegen`;
  card.appendChild(putBackIndicator);
  return card;
}
function toggleFlip(cardElement) {
  if (isFlipping || !cardElement || isDragging || cardElement !== activeCard) {
    return;
  }
  isFlipping = true;
  cardElement.classList.toggle("is-flipped");
  setTimeout(() => {
    isFlipping = false;
  }, FLIP_ANIMATION_DURATION);
}
function updateUniqueLists() {
  uniqueJobTitles = [...new Set(cardData.map((item) => item.jobTitle))].sort();
  uniqueDepartments = [
    ...new Set(cardData.map((item) => item.department)),
  ].sort();
}
function loadCards() {
  console.log("loadCards called");
  cardStack.innerHTML = "";
  cards = [...cardData];
  swipeState = {};
  updateUniqueLists();
  cards.forEach((cardInfo) => {
    cardStack.appendChild(createCardElement(cardInfo));
  });
  resetHistoryDisplay();
  updateCardStackVisuals();
  updateActiveCard();
  checkEndState();
  enableActionButtons();
  console.log("loadCards finished.");
}
function updateCardStackVisuals() {
  const cardElements = cardStack.querySelectorAll(".card");
  const numElements = cardElements.length;
  cardElements.forEach((card, index) => {
    card.style.zIndex = numElements - 1 - index;
    if (index < 3) {
      card.style.opacity = "1";
      card.style.transform = `translateY(${index * 10}px) scale(${
        1 - index * 0.02
      })`;
    } else {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px) scale(0.94)";
      card.style.pointerEvents = "none";
    }
    card.classList.remove("is-flipped");
  });
}
function updateActiveCard() {
  const cardElements = cardStack.querySelectorAll(".card");
  let topCardElement = null;
  let maxZ = -1;
  cardElements.forEach((card) => {
    const z = parseInt(card.style.zIndex || "0");
    if (card.style.opacity === "1" && z > maxZ) {
      maxZ = z;
      topCardElement = card;
    }
  });
  if (activeCard && activeCard !== topCardElement) {
    activeCard.removeEventListener("pointerdown", handlePointerDown);
    if (activeCard.style.opacity === "1") {
      activeCard.style.pointerEvents = "none";
    }
  }
  activeCard = topCardElement;
  if (activeCard) {
    activeCard.style.pointerEvents = "auto";
    activeCard.removeEventListener("pointerdown", handlePointerDown);
    activeCard.addEventListener("pointerdown", handlePointerDown);
  }
}

// --- Pointer Handlers for Click vs Drag ---
function handlePointerDown(event) {
  if (
    !activeCard ||
    event.currentTarget !== activeCard ||
    isDragging ||
    isFlipping
  )
    return;
  startX = event.clientX;
  startY = event.clientY;
  pointerDownTime = Date.now();
  potentialClick = true;
  isDragging = false;
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerUp);
}
function handlePointerMove(event) {
  if (!activeCard) return;
  const moveX = Math.abs(event.clientX - startX);
  const moveY = Math.abs(event.clientY - startY);
  if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
    potentialClick = false;
    if (!isDragging) {
      isDragging = true;
      activeCard.classList.add("dragging");
      activeCard.style.willChange = "transform";
    }
  }
  if (isDragging) {
    currentX = event.clientX - startX;
    currentY = event.clientY - startY;
    const rotate = currentX * 0.05;
    activeCard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;
    const absX = Math.abs(currentX);
    const absY = Math.abs(currentY);
    const opThreshold = activeCard.offsetWidth * 0.15;
    activeCard.classList.remove(
      "show-raise",
      "show-fire",
      "show-abmahnung",
      "show-put-back"
    );
    if (absX > opThreshold || absY > opThreshold) {
      if (absX > absY) {
        activeCard.classList.add(currentX > 0 ? "show-raise" : "show-fire");
      } else {
        activeCard.classList.add(
          currentY < 0 ? "show-abmahnung" : "show-put-back"
        );
      }
    }
  }
}
function handlePointerUp(event) {
  if (!activeCard && !isDragging) return;
  document.removeEventListener("pointermove", handlePointerMove);
  document.removeEventListener("pointerup", handlePointerUp);
  document.removeEventListener("pointercancel", handlePointerUp);
  const clickDuration = Date.now() - pointerDownTime;
  const cardElementToEnd = activeCard;
  if (
    potentialClick &&
    clickDuration < CLICK_MAX_DURATION &&
    cardElementToEnd
  ) {
    isDragging = false;
    potentialClick = false;
    toggleFlip(cardElementToEnd);
    currentX = 0;
    currentY = 0;
    startX = 0;
    startY = 0;
    pointerDownTime = 0;
  } else if (isDragging && cardElementToEnd) {
    isDragging = false;
    potentialClick = false;
    activeCard = null;
    cardElementToEnd.classList.remove("dragging");
    cardElementToEnd.style.willChange = "auto";
    const decisionThresholdX = cardElementToEnd.offsetWidth * 0.25;
    const decisionThresholdY = cardElementToEnd.offsetHeight * 0.2;
    const absX = Math.abs(currentX);
    const absY = Math.abs(currentY);
    let action = null;
    if (absX > decisionThresholdX || absY > decisionThresholdY) {
      if (absX > absY) {
        action = currentX > 0 ? "raise" : "fire";
      } else {
        action = currentY < 0 ? "abmahnung" : "put-back";
      }
    }
    if (action) {
      disableActionButtons();
      if (action === "put-back") {
        putBackCard(cardElementToEnd);
      } else {
        swipe(action, cardElementToEnd);
      }
    } else {
      cardElementToEnd.style.transition = "transform 0.3s ease";
      const cardElements = Array.from(cardStack.querySelectorAll(".card"));
      const visualIndex = cardElements.indexOf(cardElementToEnd);
      const resetTransform =
        visualIndex >= 0 && visualIndex < 3
          ? `translateY(${visualIndex * 10}px) scale(${1 - visualIndex * 0.02})`
          : `translateY(0px) scale(1)`;
      cardElementToEnd.style.transform = resetTransform;
      cardElementToEnd.classList.remove(
        "show-raise",
        "show-fire",
        "show-abmahnung",
        "show-put-back"
      );
      setTimeout(() => {
        updateActiveCard();
        enableActionButtons();
      }, 300);
    }
    currentX = 0;
    currentY = 0;
    startX = 0;
    startY = 0;
    pointerDownTime = 0;
  } else {
    potentialClick = false;
    isDragging = false;
    currentX = 0;
    currentY = 0;
    startX = 0;
    startY = 0;
    pointerDownTime = 0;
    if (cardElementToEnd) {
      updateActiveCard();
    }
    enableActionButtons();
  }
}

// --- Approval Notification Functions ---
function showApprovalNotification(type, employeeName) {
  console.log(`Approval check triggered: ${type} for ${employeeName}`);
  let title = "Entscheidung genehmigt!";
  let message = `Aktion für ${employeeName} genehmigt.`;
  let boxClass = "";
  if (type === "raise") {
    title = "Match für Lob";
    message = `Lob für ${employeeName} hat Zustimmung des Vorgesetzten.`;
    boxClass = "raise-approved";
  } else if (type === "fire") {
    title = "Match für Kündigung";
    message = `Der Vorgesetzte möchte auch kündingen: Kündigungsprozess für ${employeeName} gestartet.`;
    boxClass = "fire-approved";
  } else if (type === "abmahnung") {
    title = "Abmahnung";
    message = `Abmahnung für ${employeeName} wurde abgeschickt.`;
    boxClass = "abmahnung-logged";
  }
  approvalText.textContent = title;
  approvalEmployeeName.textContent = message;
  approvalBox.className =
    "relative z-10 p-8 rounded-lg shadow-xl text-center text-white transform scale-0 transition-transform duration-300 ease-out max-w-[90%] w-[400px]";
  approvalBox.classList.add(boxClass);
  approvalNotification.classList.remove("hidden");
  setTimeout(() => {
    approvalNotification.classList.add("show");
    disableActionButtons();
  }, 10);
}
function hideApprovalNotification() {
  approvalNotification.classList.remove("show");
  setTimeout(() => {
    approvalNotification.classList.add("hidden");
    enableActionButtons();
  }, 300);
}

// --- Swipe/Action Functions ---
function swipe(action, cardElement) {
  if (!cardElement) {
    enableActionButtons();
    return;
  }
  const cardId = cardElement.dataset.id;
  const cardInfo = cardData.find((c) => c.id == cardId);
  let needsApproval = false;
  let approvalCheck = false;
  let approvalType = action;
  if (cardInfo) {
    const randomCheck = Math.random();
    if (
      action === "raise" &&
      typeof cardInfo.supervisorAgreesRaiseProb === "number"
    ) {
      needsApproval = true;
      approvalCheck = randomCheck < cardInfo.supervisorAgreesRaiseProb;
    } else if (
      action === "fire" &&
      typeof cardInfo.hrApprovesFireProb === "number"
    ) {
      needsApproval = true;
      approvalCheck = randomCheck < cardInfo.hrApprovesFireProb;
    } else if (
      action === "abmahnung" &&
      typeof cardInfo.abmahnungLoggedProb === "number"
    ) {
      needsApproval = true;
      approvalCheck = randomCheck < cardInfo.abmahnungLoggedProb;
    }
  }
  if (cardInfo) {
    swipeState[cardId] = action;
    updateHistoryDisplay(cardInfo, action);
    console.log(`Card ${cardId} (${cardInfo.name}) action: ${action}`);
  } else {
    console.error(`Card data not found for ID: ${cardId}`);
  }
  const cardIndex = cards.findIndex((c) => c.id == cardId);
  if (cardIndex > -1) {
    cards.splice(cardIndex, 1);
  } else {
    console.warn(`Card data ID ${cardId} not found in 'cards' array.`);
  }
  cardElement.style.transition = "transform 0.4s ease, opacity 0.4s ease";
  let endX = 0,
    endY = 0,
    rotate = 0;
  if (action === "abmahnung") {
    endX = currentX / 5;
    endY = -window.innerHeight;
    rotate = currentX * 0.01;
  } else if (action === "raise") {
    endX = window.innerWidth * 1.2;
    endY = currentY;
    rotate = 15;
  } else if (action === "fire") {
    endX = -window.innerWidth * 1.2;
    endY = currentY;
    rotate = -15;
  }
  cardElement.style.transform = `translate(${endX}px, ${endY}px) rotate(${rotate}deg)`;
  cardElement.style.opacity = "0";
  cardElement.style.pointerEvents = "none";
  if (needsApproval && approvalCheck) {
    setTimeout(() => {
      showApprovalNotification(approvalType, cardInfo.name);
    }, 150);
  }
  setTimeout(() => {
    if (cardElement.parentNode === cardStack) {
      cardStack.removeChild(cardElement);
    }
    updateCardStackVisuals();
    updateActiveCard();
    checkEndState();
    if (!approvalNotification.classList.contains("show")) {
      enableActionButtons();
    }
  }, 400);
}
function putBackCard(cardElement) {
  if (!cardElement) {
    enableActionButtons();
    return;
  }
  const cardId = cardElement.dataset.id;
  const cardIndex = cards.findIndex((c) => c.id == cardId);
  console.log(`Card ${cardId} put back`);
  if (cardIndex > -1) {
    const cardInfo = cards[cardIndex];
    cardElement.classList.remove("is-flipped");
    cardElement.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    cardElement.style.transform = `translateY(100px) scale(0.9)`;
    cardElement.style.opacity = "0";
    cardElement.style.pointerEvents = "none";
    setTimeout(() => {
      if (cardElement.parentNode === cardStack) {
        cardStack.removeChild(cardElement);
      }
      cards.splice(cardIndex, 1);
      cards.push(cardInfo);
      const newCardElement = createCardElement(cardInfo);
      cardStack.appendChild(newCardElement);
      updateCardStackVisuals();
      updateActiveCard();
      checkEndState();
      enableActionButtons();
    }, 300);
  } else {
    console.error(`Card data ID ${cardId} not found in 'cards' array.`);
    cardElement.style.transition = "transform 0.3s ease";
    cardElement.style.transform = `translateY(0px) scale(1)`;
    cardElement.classList.remove(
      "is-flipped",
      "show-raise",
      "show-fire",
      "show-warning",
      "show-put-back"
    );
    setTimeout(() => {
      updateActiveCard();
      enableActionButtons();
    }, 300);
  }
}
function updateHistoryDisplay(cardInfo, action) {
  if (!cardInfo) return;
  if (action === "raise") {
    raisedCount++;
    raisedCountSpan.textContent = raisedCount;
  } else if (action === "fire") {
    firedCount++;
    firedCountSpan.textContent = firedCount;
  } else if (action === "abmahnung") {
    abmahnungenCount++;
    abmahnungenCountSpan.textContent = abmahnungenCount;
  }
}
function resetHistoryDisplay() {
  firedCount = 0;
  raisedCount = 0;
  abmahnungenCount = 0;
  firedCountSpan.textContent = "0";
  raisedCountSpan.textContent = "0";
  abmahnungenCountSpan.textContent = "0";
}
function checkEndState() {
  const isEmpty = cards.length === 0;
  const noActiveInteraction = !activeCard && !isDragging;
  if (isEmpty && noActiveInteraction) {
    noMoreCardsDiv.classList.remove("hidden");
    actionButtonsDiv.classList.add("hidden");
    disableActionButtons();
  } else {
    noMoreCardsDiv.classList.add("hidden");
    actionButtonsDiv.classList.remove("hidden");
  }
}

// --- Logout Function ---
function logout() {
  console.log("Logging out...");
  localStorage.removeItem("hrbpName");
  localStorage.removeItem("hrbpNumber");
  hrbpName = "";
  hrbpNumber = "";
  mainAppArea.style.display = "none";
  startupScreen.style.display = "flex";
  hrbpNameInput.value = "";
  hrbpNumberInput.value = "";
  startupError.textContent = "";
  cardStack.innerHTML = "";
  cards = [];
  swipeState = {};
  resetHistoryDisplay();
  activeCard = null;
  isDragging = false;
  isFlipping = false;
  hideApprovalNotification();
  noMoreCardsDiv.classList.add("hidden");
  actionButtonsDiv.classList.add("hidden");
}
// --- Reset Function (Session Only) ---
function resetApp() {
  console.log("Resetting session...");
  isDragging = false;
  activeCard = null;
  currentX = 0;
  currentY = 0;
  isFlipping = false;
  potentialClick = false;
  pointerDownTime = 0;
  loadCards();
  noMoreCardsDiv.classList.add("hidden");
  actionButtonsDiv.classList.remove("hidden");
  hideApprovalNotification();
}

// --- Startup Logic ---
function initializeApp() {
  console.log("Initializing App...");
  startupScreen.style.display = "flex";
  mainAppArea.style.display = "none";
  const savedName = localStorage.getItem("hrbpName");
  const savedNumber = localStorage.getItem("hrbpNumber");

  cardData = shuffleArray(cardData);
  if (savedName && savedNumber) {
    console.log("Saved user found:", savedName);
    hrbpName = savedName;
    hrbpNumber = savedNumber;
    proceedToMainApp();
  } else {
    console.log("No saved user found, showing startup.");
  }
}
function proceedToMainApp() {
  console.log("Proceeding to main app...");
  userNameDisplay.textContent = hrbpName;
  userNumberDisplay.textContent = hrbpNumber;
  startupScreen.style.display = "none";
  mainAppArea.style.display = "flex";
  console.log("Main app area display style:", mainAppArea.style.display);
  loadCards();
}

function openAddModal() {
  addEmployeeModal.classList.add("show");
  addEmployeeError.textContent = "";
  newNameInput.value = "";
  newJobTitleInput.value = "";
  newDepartmentInput.value = "";
  newYearsInput.value = "";
  newPerformanceInput.value = "";
  newSummaryInput.value = "";
  newScenarioInput.value = "";
  updateUniqueLists();
}
function closeAddModal() {
  addEmployeeModal.classList.remove("show");
  jobTitleSuggestions.classList.add("hidden");
  departmentSuggestions.classList.add("hidden");
  requiredInputs.forEach((input) => input.classList.remove("input-error"));
  addEmployeeError.textContent = "";
} // Clear errors on close
function saveNewEmployee() {
  addEmployeeError.textContent = "";
  let isValid = true;
  requiredInputs.forEach((input) => {
    input.classList.remove("input-error");
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add("input-error");
    }
    if (input.type === "number") {
      const value = parseFloat(input.value);
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      if (
        isNaN(value) ||
        (input.min !== "" && value < min) ||
        (input.max !== "" && value > max)
      ) {
        isValid = false;
        input.classList.add("input-error");
      }
    }
  });

  if (!isValid) {
    addEmployeeError.textContent =
      "Bitte füllen Sie alle Pflichtfelder korrekt aus.";
    return;
  }

  const newId = Date.now();
  const newEmployee = {
    id: newId,
    name: newNameInput.value.trim(),
    jobTitle: newJobTitleInput.value.trim(),
    department: newDepartmentInput.value.trim(),
    yearsInCompany: parseInt(newYearsInput.value),
    performanceScore: parseFloat(newPerformanceInput.value),
    lastReviewSummary: newSummaryInput.value.trim(),
    scenario: newScenarioInput.value.trim() || null,
    supervisorAgreesRaiseProb: 0.5,
    hrApprovesFireProb: 0.5,
    abmahnungLoggedProb: 0.9,
  };
  cardData.push(newEmployee);
  console.log("Added new employee:", newEmployee);
  closeAddModal();
  loadCards();
}

// --- Suggestions Logic ---
function showSuggestions(inputElement, suggestionsElement, suggestionsList) {
  const value = inputElement.value.toLowerCase();
  suggestionsElement.innerHTML = "";
  suggestionIndex = -1; // Reset index
  if (!value) {
    suggestionsElement.classList.add("hidden");
    return;
  }
  currentSuggestions = suggestionsList.filter((item) =>
    item.toLowerCase().includes(value)
  ); // Store current suggestions
  if (currentSuggestions.length > 0) {
    currentSuggestions.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("suggestion-item");
      div.textContent = item;
      div.dataset.index = index; // Store index
      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        inputElement.value = item;
        suggestionsElement.classList.add("hidden");
      });
      suggestionsElement.appendChild(div);
    });
    suggestionsElement.classList.remove("hidden");
  } else {
    suggestionsElement.classList.add("hidden");
  }
}
// Handle keyboard navigation for suggestions
function handleSuggestionKeyDown(event, inputElement, suggestionsElement) {
  const items = suggestionsElement.querySelectorAll(".suggestion-item");
  if (!items.length || suggestionsElement.classList.contains("hidden")) return;

  let currentHighlight = suggestionsElement.querySelector(
    ".suggestion-highlight"
  );
  let currentIndex = currentHighlight
    ? parseInt(currentHighlight.dataset.index)
    : -1;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (currentHighlight)
      currentHighlight.classList.remove("suggestion-highlight");
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].classList.add("suggestion-highlight");
    items[currentIndex].scrollIntoView({ block: "nearest" });
    suggestionIndex = currentIndex; // Update global index if needed
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (currentHighlight)
      currentHighlight.classList.remove("suggestion-highlight");
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    items[currentIndex].classList.add("suggestion-highlight");
    items[currentIndex].scrollIntoView({ block: "nearest" });
    suggestionIndex = currentIndex; // Update global index if needed
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (currentHighlight) {
      inputElement.value = currentHighlight.textContent;
      suggestionsElement.classList.add("hidden");
    } else {
      suggestionsElement.classList.add("hidden"); // Hide if enter pressed with no selection
    }
  } else if (event.key === "Escape") {
    suggestionsElement.classList.add("hidden");
  }
}

// --- Event Listeners ---
startButton.addEventListener("click", () => {
  const name = hrbpNameInput.value.trim();
  const number = hrbpNumberInput.value.trim();
  if (name && number) {
    hrbpName = name;
    hrbpNumber = number;
    localStorage.setItem("hrbpName", hrbpName);
    localStorage.setItem("hrbpNumber", hrbpNumber);
    startupError.textContent = "";
    proceedToMainApp();
  } else {
    startupError.textContent =
      "Bitte geben Sie Name und Mitarbeiternummer ein.";
  }
});
hrbpNumberInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startButton.click();
  }
});
abmahnungButton.addEventListener("click", () => {
  if (activeCard && !abmahnungButton.disabled) {
    disableActionButtons();
    swipe("abmahnung", activeCard);
  }
});
fireButton.addEventListener("click", () => {
  if (activeCard && !fireButton.disabled) {
    disableActionButtons();
    swipe("fire", activeCard);
  }
});
raiseButton.addEventListener("click", () => {
  if (activeCard && !raiseButton.disabled) {
    disableActionButtons();
    swipe("raise", activeCard);
  }
});
putBackButton.addEventListener("click", () => {
  if (activeCard && !putBackButton.disabled) {
    disableActionButtons();
    putBackCard(activeCard);
  }
});
resetButton.addEventListener("click", resetApp);
closeApprovalButton.addEventListener("click", hideApprovalNotification);
userMenuTrigger.addEventListener("click", (event) => {
  event.stopPropagation();
  logoutDropdown.classList.toggle("hidden");
  logoutDropdown.classList.toggle("visible");
});
logoutButton.addEventListener("click", logout);
document.addEventListener("click", (event) => {
  if (
    userMenuTrigger &&
    logoutDropdown &&
    !userMenuTrigger.contains(event.target) &&
    !logoutDropdown.contains(event.target)
  ) {
    logoutDropdown.classList.add("hidden");
    logoutDropdown.classList.remove("visible");
  }
});
addEmployeeButton.addEventListener("click", openAddModal);
cancelAddButton.addEventListener("click", closeAddModal);
saveEmployeeButton.addEventListener("click", saveNewEmployee);
addEmployeeModal.addEventListener("click", (event) => {
  if (event.target === addEmployeeModal) {
    closeAddModal();
  }
});

resetEmployeesButton.addEventListener("click", () => {
  loadCards();
  noMoreCardsDiv.classList.add("hidden");
  actionButtonsDiv.classList.remove("hidden");
  hideApprovalNotification();
});

// Suggestions Listeners
newJobTitleInput.addEventListener("input", () =>
  showSuggestions(newJobTitleInput, jobTitleSuggestions, uniqueJobTitles)
);
newDepartmentInput.addEventListener("input", () =>
  showSuggestions(newDepartmentInput, departmentSuggestions, uniqueDepartments)
);
newJobTitleInput.addEventListener("blur", () =>
  setTimeout(() => jobTitleSuggestions.classList.add("hidden"), 150)
); // Delay hide on blur
newDepartmentInput.addEventListener("blur", () =>
  setTimeout(() => departmentSuggestions.classList.add("hidden"), 150)
); // Delay hide on blur
// Keyboard nav for suggestions
newJobTitleInput.addEventListener("keydown", (e) =>
  handleSuggestionKeyDown(e, newJobTitleInput, jobTitleSuggestions)
);
newDepartmentInput.addEventListener("keydown", (e) =>
  handleSuggestionKeyDown(e, newDepartmentInput, departmentSuggestions)
);

mobileMenuButton.addEventListener("click", toggleMobileMenu);
mobileAddButton.addEventListener("click", () => {
  openAddModal();
  toggleMobileMenu();
}); // Close menu after action
mobileResetButton.addEventListener("click", () => {
  resetApp();
  toggleMobileMenu();
}); // Close menu after action
mobileLogoutButton.addEventListener("click", () => {
  logout();
  toggleMobileMenu();
}); // Close menu after action

// Remove error style on input
requiredInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim()) {
      input.classList.remove("input-error");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (!activeCard) return;

  if (approvalNotification.classList.contains("show")) {
    if (event.key === "Enter") {
      hideApprovalNotification();
    }
    return;
  }

  if (approvalNotification.classList.contains("show")) return; // Don't allow while approval is shown

  switch (event.key) {
    case "ArrowRight":
      if (!raiseButton.disabled) {
        disableActionButtons();
        swipe("raise", activeCard);
      }
      break;
    case "ArrowLeft":
      if (!fireButton.disabled) {
        disableActionButtons();
        swipe("fire", activeCard);
      }
      break;
    case "ArrowUp":
      if (!abmahnungButton.disabled) {
        disableActionButtons();
        swipe("abmahnung", activeCard);
      }
      break;
    case "ArrowDown":
      if (!putBackButton.disabled) {
        disableActionButtons();
        putBackCard(activeCard);
      }
      break;
    case " ":
      event.preventDefault();
      toggleFlip(activeCard);
      break;
    default:
      break;
  }
});

function shuffleArray(array) {
  const shuffledArray = [...array];
  let currentIndex = shuffledArray.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[currentIndex],
    ];
  }

  return shuffledArray;
}

// --- Mobile Menu Logic ---
function toggleMobileMenu() {
  const isVisible = !mobileMenuDropdown.classList.contains("hidden");
  if (!isVisible) {
    // Populate history before showing
    populateMobileHistory();
    // Populate user info
    if (mobileUserNameDisplay) mobileUserNameDisplay.textContent = hrbpName;
    if (mobileUserNumberDisplay)
      mobileUserNumberDisplay.textContent = hrbpNumber;
  }
  mobileMenuDropdown.classList.toggle("hidden");
  mobileMenuDropdown.classList.toggle("visible");
}

function populateMobileHistory() {
  if (!mobileHistoryContent) return;
  mobileHistoryContent.innerHTML = "<h3>Verlauf</h3>"; // Clear previous, add title
  const sections = [
    {
      title: "Abmahnungen",
      count: abmahnungenCount,
      icon: "fa-exclamation-triangle",
      color: "text-orange-600",
    },
    {
      title: "Gekündigt",
      count: firedCount,
      icon: "fa-user-slash",
      color: "text-red-600",
    },
    {
      title: "Erhöhungen",
      count: raisedCount,
      icon: "fa-thumbs-up",
      color: "text-green-600",
    },
  ];
  sections.forEach((sec) => {
    const sectionDiv = document.createElement("div");
    sectionDiv.classList.add("history-section"); // Use existing styles (adjust if needed)
    sectionDiv.innerHTML = `
            <h2><i class="fas ${sec.icon} ${sec.color}"></i> ${sec.title} <span class="history-count">${sec.count}</span></h2>
        `;
    mobileHistoryContent.appendChild(sectionDiv);
  });
}

// --- Initial Load ---
window.onload = () => {
  initializeApp();
};
