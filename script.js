const clockElement = document.getElementById("clock");
const analogClockElement = document.getElementById("analogClock");
const dateElement = document.getElementById("date");
const watchFaceSelect = document.getElementById("watchFace");
const backgroundSelect = document.getElementById("background");
const musicSelect = document.getElementById("music");
const darkModeToggle = document.getElementById("darkModeToggle");
const fullScreenToggle = document.getElementById("fullScreenToggle");
const startTimerBtn = document.getElementById("startTimer");
const timerModal = document.getElementById("timerModal");
const startTimerBtnModal = document.getElementById("startTimerBtn");
const cancelTimerBtn = document.getElementById("cancelTimerBtn");
const warningModal = document.getElementById("warningModal");
const closeWarningBtn = document.getElementById("closeWarningBtn");
const audioElement = document.getElementById("audio");
const timerDisplay = document.getElementById("timerDisplay"); // New element for digital timer
const controlsContainer = document.querySelector(".controls"); // Select the controls container

let isDarkMode = false;
let isFullScreen = false;
let timerInterval;
let breakInterval;
let timerActive = false;
let remainingTime = 0;
let breakTime = 0;
let breakLength = 0;
let remainingBreakTime = 0;
let lastBreakTime = 0;  // To keep track of the last break time

// **Update clock and date every second**
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  dateElement.textContent = date;

  // **Update analog clock**
  const hourHand = document.querySelector(".hour-hand");
  const minuteHand = document.querySelector(".minute-hand");
  const secondHand = document.querySelector(".second-hand");
  const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
  const minuteDeg = now.getMinutes() * 6;
  const secondDeg = now.getSeconds() * 6;

  hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `translate(-50%, -100%) rotate(${secondDeg}deg)`;
}

setInterval(updateTime, 1000);

// **Change watch face**
watchFaceSelect.addEventListener("change", (e) => {
  const selectedFace = e.target.value;
  if (selectedFace === "analog") {
    clockElement.style.display = "none";
    analogClockElement.style.display = "block";
  } else {
    clockElement.style.display = "block";
    analogClockElement.style.display = "none";
    clockElement.className = `clock ${selectedFace}`;
  }
});

// **Change background**
backgroundSelect.addEventListener("change", (e) => {
  const selectedBackground = e.target.value;
  document.body.className = selectedBackground;
});

// **Play music**
musicSelect.addEventListener("change", (e) => {
  const selectedMusic = e.target.value;
  if (selectedMusic === "none") {
    audioElement.pause();
    audioElement.src = "";
  } else {
    audioElement.src = `sounds/${selectedMusic}.mp3`;
    audioElement.play();
  }
});

// **Toggle dark mode**
darkModeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);
  darkModeToggle.innerHTML = isDarkMode
    ? '<i class="fas fa-sun"></i> Light Mode'
    : '<i class="fas fa-moon"></i> Dark Mode';
});

// **Toggle full screen**
fullScreenToggle.addEventListener("click", () => {
  if (!isFullScreen) {
    document.documentElement.requestFullscreen();
    document.body.classList.add("full-screen");
  } else {
    document.exitFullscreen();
    document.body.classList.remove("full-screen");
  }
  isFullScreen = !isFullScreen;
});

// **Handle full screen change**
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    // Hide the controls when entering full-screen mode
    controlsContainer.style.display = "none";
  } else {
    // Show the controls when exiting full-screen mode
    controlsContainer.style.display = "block";
    isFullScreen = false; // Reset full-screen flag
  }
});

// **Timer functionality**
startTimerBtn.addEventListener("click", () => {
  timerModal.style.display = "flex";
});

startTimerBtnModal.addEventListener("click", () => {
  const activity = document.getElementById("activity").value;
  const duration = parseInt(document.getElementById("duration").value, 10);
  const breakTimeInput = parseInt(document.getElementById("breakTime").value, 10);
  breakLength = parseInt(document.getElementById("breakLength").value, 10); 

  if (activity && duration && breakTimeInput && breakLength) {
    timerModal.style.display = "none"; // Close the modal
    startDigitalTimer(duration * 60, breakTimeInput); // Start the timer
    document.documentElement.requestFullscreen(); // Request full-screen mode
  } else {
    alert("Please fill in all fields.");
  }
});

cancelTimerBtn.addEventListener("click", () => {
  timerModal.style.display = "none";
});

// **Start digital timer**
function startDigitalTimer(duration, breakIntervalTime) {
  remainingTime = duration;
  breakTime = breakIntervalTime;
  lastBreakTime = breakIntervalTime;
  timerActive = true;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      timerActive = false;
      alert("Timer finished! Take a break.");
      startBreakTimer(breakLength * 60); // Start break timer after main timer
      return;
    }

    // Check if it's time for a break
    if (remainingTime <= breakTime * 60 && remainingTime > (breakTime - 1) * 60) {
      pauseMainTimer(); // Pause the main timer when break time is reached
      showMessage("Break starts");
      startBreakTimer(breakLength * 60); // Start the break timer
    }

    remainingTime--;
    updateTimerDisplay();
  }, 1000);
}

// **Start the break timer**
function startBreakTimer(breakDuration) {
  remainingBreakTime = breakDuration;
  updateBreakTimerDisplay();

  breakInterval = setInterval(() => {
    if (remainingBreakTime <= 0) {
      clearInterval(breakInterval);
      showMessage("Break ended! Returning to main timer.");
      startDigitalTimer(remainingTime); // Resume main timer after break ends
      return;
    }

    if (remainingBreakTime === 10) {
      flashBreakTimer(); // Flash the break timer at 10 seconds
    }

    remainingBreakTime--;
    updateBreakTimerDisplay();
  }, 1000);
}

// **Update the digital timer display**
function updateTimerDisplay() {
  const minutes = String(Math.floor(remainingTime / 60)).padStart(2, "0");
  const seconds = String(remainingTime % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

// **Update the break timer display**
function updateBreakTimerDisplay() {
  const minutes = String(Math.floor(remainingBreakTime / 60)).padStart(2, "0");
  const seconds = String(remainingBreakTime % 60).padStart(2, "0");
  timerDisplay.textContent = `B: ${minutes}:${seconds}`;
}

// **Flash the break timer**
function flashBreakTimer() {
  timerDisplay.classList.add("flash"); // Add flashing class to timer
  setTimeout(() => {
    timerDisplay.classList.remove("flash"); // Remove flashing effect after a brief time
  }, 1000);
}

// **Pause the main timer**
function pauseMainTimer() {
  clearInterval(timerInterval);
  timerActive = false;
}

// **Show message**
function showMessage(message) {
  const messageContainer = document.getElementById("messageContainer");
  messageContainer.textContent = message;
}

// **Show warning message on mouse interaction**
document.addEventListener("mousemove", () => {
  if (timerActive) {
    warningModal.style.display = "flex";
  }
});

closeWarningBtn.addEventListener("click", () => {
  warningModal.style.display = "none";
});
