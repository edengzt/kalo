const screens = ["home", "recipes", "add", "progress", "settings"];
const navButtons = document.querySelectorAll("[data-screen]");
function showScreen(name) {
  screens.forEach((screen) => {
    const node = document.getElementById(`screen-${screen}`);
    if (node) node.classList.toggle("active", screen === name);
  });
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === name);
  });
}
navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});
document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

// Illustrative November 2026 data for the visual prototype only.
const dayStatus = {
  1:"on", 2:"on", 3:"on", 4:"on", 5:"over", 6:"on", 7:"on",
  8:"on", 9:"over", 10:"on", 11:"on"
};
let shownMonth = new Date(2026, 10, 1);
let selectedDate = 11;
const daysNode = document.getElementById("calendar-days");
const monthTitle = document.querySelector(".calendar-card h2");
function renderCalendar() {
  const year = shownMonth.getFullYear();
  const month = shownMonth.getMonth();
  monthTitle.textContent = shownMonth.toLocaleDateString("en-US", {month:"long", year:"numeric"});
  daysNode.innerHTML = "";
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const previousCount = new Date(year, month, 0).getDate();
  for (let i = 0; i < 42; i += 1) {
    let day = i - firstDay + 1;
    let outside = false;
    if (day < 1) { day = previousCount + day; outside = true; }
    if (day > count) { day -= count; outside = true; }
    const button = document.createElement("button");
    button.className = "day";
    if (outside) button.classList.add("muted-day");
    if (!outside && day === selectedDate) button.classList.add("selected");
    if (!outside && day === 11 && month === 10 && year === 2026) button.classList.add("today");
    const status = !outside && month === 10 && year === 2026 ? dayStatus[day] : null;
    if (status === "over") button.classList.add("over");
    if (!status) button.classList.add("no-data");
    button.textContent = day;
    if (status || !outside) {
      const dot = document.createElement("i");
      dot.className = "status";
      button.appendChild(dot);
    }
    button.setAttribute("aria-label", `${shownMonth.toLocaleDateString("en-US",{month:"long"})} ${day}${status ? `, ${status === "on" ? "within goal" : "over goal"}` : ", no entry"}`);
    if (!outside) {
      button.addEventListener("click", () => {
        selectedDate = day;
        document.querySelector(".topbar-date").textContent = shownMonth.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
        renderCalendar();
      });
    }
    daysNode.appendChild(button);
  }
}
document.getElementById("prev-month").addEventListener("click", () => {
  shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
  selectedDate = 1; renderCalendar();
});
document.getElementById("next-month").addEventListener("click", () => {
  shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
  selectedDate = 1; renderCalendar();
});
document.getElementById("today-button").addEventListener("click", () => {
  shownMonth = new Date(2026, 10, 1); selectedDate = 11; renderCalendar();
});
renderCalendar();

// Lightweight visual interactions for the reference prototype.
document.querySelectorAll(".chips").forEach((group) => {
  group.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      group.querySelectorAll(".chip").forEach((item) => item.classList.remove("selected"));
      chip.classList.add("selected");
    });
  });
});
document.querySelectorAll(".add-circle").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = "✓";
    button.classList.add("added");
  });
});
const recipeSearch = document.getElementById("recipe-search");
if (recipeSearch) {
  recipeSearch.addEventListener("input", () => {
    const query = recipeSearch.value.toLowerCase();
    document.querySelectorAll(".recipe-card").forEach((card) => {
      card.style.display = card.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
}
