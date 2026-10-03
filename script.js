const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const winningTeam = document.getElementById("winningTeam");
const winningTeamVerb = document.getElementById("winningTeamVerb");
const attendeeList = document.getElementById("attendeeList");
const attendeeListCount = document.getElementById("attendeeListCount");
const attendeeCountDisplay = document.getElementById("attendeeCount");
const attendanceGoalDisplay = document.getElementById("attendanceGoal");
const attendanceProgress = document.getElementById("attendanceProgress");
const progressBar = document.getElementById("progressBar");
const adjustGoalButton = document.getElementById("adjustGoalBtn");
const resetAttendanceButton = document.getElementById("resetAttendanceBtn");
const adminModal = document.getElementById("adminModal");
const adminDialogForm = document.getElementById("adminDialogForm");
const adminDialogTitle = document.getElementById("adminDialogTitle");
const adminDialogMessage = document.getElementById("adminDialogMessage");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const attendanceGoalField = document.getElementById("attendanceGoalField");
const newAttendanceGoalInput = document.getElementById("newAttendanceGoal");
const resetConfirmationField = document.getElementById(
  "resetConfirmationField",
);
const confirmAttendanceReset = document.getElementById(
  "confirmAttendanceReset",
);
const adminDialogError = document.getElementById("adminDialogError");
const closeAdminDialogButton = document.getElementById("closeAdminDialogBtn");
const cancelAdminDialogButton = document.getElementById("cancelAdminDialogBtn");

let maxAttendees = 50;
const storageKey = "intelSummitAttendance";
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};
const teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
const attendees = [];

let attendeeCount = 0;
let activeAdminAction = "goal";

function updateAttendanceDisplay() {
  const progress = Math.min((attendeeCount / maxAttendees) * 100, 100);

  attendeeCountDisplay.textContent = attendeeCount;
  attendanceGoalDisplay.textContent = maxAttendees;
  progressBar.style.width = `${progress}%`;
  attendanceProgress.setAttribute("aria-valuemax", maxAttendees);
  attendanceProgress.setAttribute(
    "aria-valuenow",
    Math.min(attendeeCount, maxAttendees),
  );
  attendanceProgress.setAttribute(
    "aria-valuetext",
    `${attendeeCount} of ${maxAttendees} attendees`,
  );
}

function updateAttendeeCount() {
  attendeeCount = attendeeCount + 1;
  updateAttendanceDisplay();
}

function updateTeamAttendance(selectedTeam) {
  teamCounts[selectedTeam] = teamCounts[selectedTeam] + 1;
  document.getElementById(`${selectedTeam}Count`).textContent =
    teamCounts[selectedTeam];
}

function showGoalCelebration() {
  const teamKeys = Object.keys(teamCounts);
  let highestTeamCount = 0;
  let winningTeams = [];

  for (let i = 0; i < teamKeys.length; i++) {
    const team = teamKeys[i];

    if (teamCounts[team] > highestTeamCount) {
      highestTeamCount = teamCounts[team];
      winningTeams = [teamNames[team]];
    } else if (teamCounts[team] === highestTeamCount) {
      winningTeams.push(teamNames[team]);
    }
  }

  winningTeam.textContent = winningTeams.join(", ");

  if (winningTeams.length > 1) {
    winningTeamVerb.textContent = "share the win!";
  }

  celebrationMessage.hidden = false;
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  const attendeeWord = attendees.length === 1 ? "attendee" : "attendees";
  attendeeListCount.textContent = `${attendees.length} ${attendeeWord}`;

  if (attendees.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");

    emptyCell.colSpan = 2;
    emptyCell.className = "empty-attendee-list";
    emptyCell.textContent = "No attendee names saved yet.";
    emptyRow.appendChild(emptyCell);
    attendeeList.appendChild(emptyRow);
    return;
  }

  for (
    let attendeeIndex = 0;
    attendeeIndex < attendees.length;
    attendeeIndex++
  ) {
    const attendee = attendees[attendeeIndex];
    const attendeeRow = document.createElement("tr");
    const nameCell = document.createElement("td");
    const teamCell = document.createElement("td");
    const teamLabel = document.createElement("span");

    nameCell.textContent = attendee.name;
    teamLabel.className = `team-label ${attendee.team}`;
    teamLabel.textContent = teamNames[attendee.team];
    teamCell.appendChild(teamLabel);
    attendeeRow.appendChild(nameCell);
    attendeeRow.appendChild(teamCell);
    attendeeList.appendChild(attendeeRow);
  }
}

function saveAttendance() {
  const attendanceData = {
    attendeeCount: attendeeCount,
    maxAttendees: maxAttendees,
    teamCounts: teamCounts,
    attendees: attendees,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(attendanceData));
    return true;
  } catch (error) {
    return false;
  }
}

function loadAttendance() {
  let savedAttendance = null;

  try {
    savedAttendance = localStorage.getItem(storageKey);
  } catch (error) {
    savedAttendance = null;
  }

  if (savedAttendance !== null) {
    try {
      const attendanceData = JSON.parse(savedAttendance);
      const savedTeamCounts = attendanceData.teamCounts;

      if (
        Number.isInteger(attendanceData.attendeeCount) &&
        attendanceData.attendeeCount >= 0 &&
        Number.isInteger(savedTeamCounts.water) &&
        Number.isInteger(savedTeamCounts.zero) &&
        Number.isInteger(savedTeamCounts.power)
      ) {
        attendeeCount = attendanceData.attendeeCount;
        if (
          Number.isInteger(attendanceData.maxAttendees) &&
          attendanceData.maxAttendees > 0
        ) {
          maxAttendees = attendanceData.maxAttendees;
        }
        teamCounts.water = savedTeamCounts.water;
        teamCounts.zero = savedTeamCounts.zero;
        teamCounts.power = savedTeamCounts.power;

        if (Array.isArray(attendanceData.attendees)) {
          for (
            let attendeeIndex = 0;
            attendeeIndex < attendanceData.attendees.length;
            attendeeIndex++
          ) {
            const savedAttendee = attendanceData.attendees[attendeeIndex];

            if (
              savedAttendee &&
              typeof savedAttendee.name === "string" &&
              teamNames[savedAttendee.team] !== undefined
            ) {
              attendees.push({
                name: savedAttendee.name,
                team: savedAttendee.team,
              });
            }
          }
        }
      }
    } catch (error) {
      localStorage.removeItem(storageKey);
    }
  }

  updateAttendanceDisplay();
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
  renderAttendeeList();

  if (attendeeCount >= maxAttendees) {
    showGoalCelebration();
  }
}

function updateAttendanceGoal(newGoal) {
  maxAttendees = newGoal;
  updateAttendanceDisplay();

  if (attendeeCount >= maxAttendees) {
    showGoalCelebration();
  } else {
    celebrationMessage.hidden = true;
    winningTeam.textContent = "";
    winningTeamVerb.textContent = "is the winning team!";
  }

  const attendanceSaved = saveAttendance();
  greeting.textContent = attendanceSaved
    ? `Attendance goal updated to ${maxAttendees}.`
    : "Goal updated, but could not be saved by your browser.";
  greeting.className = "success-message";
  greeting.style.display = "block";
}

function resetAttendance() {
  attendeeCount = 0;
  teamCounts.water = 0;
  teamCounts.zero = 0;
  teamCounts.power = 0;
  attendees.length = 0;

  updateAttendanceDisplay();
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
  renderAttendeeList();

  celebrationMessage.hidden = true;
  winningTeam.textContent = "";
  winningTeamVerb.textContent = "is the winning team!";

  const attendanceSaved = saveAttendance();
  greeting.textContent = attendanceSaved
    ? "Attendance has been reset."
    : "Attendance was reset, but could not be saved by your browser.";
  greeting.className = "success-message";
  greeting.style.display = "block";
}

function openAdminDialog(action) {
  activeAdminAction = action;
  adminPasswordInput.value = "";
  adminDialogError.textContent = "";
  confirmAttendanceReset.checked = false;

  if (action === "goal") {
    adminDialogTitle.textContent = "Adjust attendance goal";
    adminDialogMessage.textContent =
      "Enter the password and choose a new whole-number goal.";
    attendanceGoalField.hidden = false;
    resetConfirmationField.hidden = true;
    newAttendanceGoalInput.value = maxAttendees;
  } else {
    adminDialogTitle.textContent = "Reset attendance";
    adminDialogMessage.textContent =
      "Enter the password and confirm that you want to clear all attendance.";
    attendanceGoalField.hidden = true;
    resetConfirmationField.hidden = false;
  }

  adminModal.hidden = false;
  adminPasswordInput.focus();
}

function closeAdminDialog() {
  adminModal.hidden = true;

  if (activeAdminAction === "goal") {
    adjustGoalButton.focus();
  } else {
    resetAttendanceButton.focus();
  }
}

function submitAdminAction(event) {
  event.preventDefault();

  if (adminPasswordInput.value !== "intel") {
    adminDialogError.textContent = "Incorrect password.";
    adminPasswordInput.focus();
    return;
  }

  if (activeAdminAction === "goal") {
    const newGoal = Number(newAttendanceGoalInput.value);

    if (!Number.isInteger(newGoal) || newGoal < 1) {
      adminDialogError.textContent = "Enter a whole number greater than 0.";
      newAttendanceGoalInput.focus();
      return;
    }

    updateAttendanceGoal(newGoal);
  } else {
    if (!confirmAttendanceReset.checked) {
      adminDialogError.textContent =
        "Check the box to confirm resetting attendance.";
      return;
    }

    resetAttendance();
  }

  closeAdminDialog();
}

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (attendeeName === "") {
    attendeeNameInput.value = "";
    attendeeNameInput.focus();
    return;
  }

  updateAttendeeCount();
  updateTeamAttendance(selectedTeam);
  attendees.push({
    name: attendeeName,
    team: selectedTeam,
  });
  renderAttendeeList();
  const attendanceSaved = saveAttendance();

  if (attendeeCount === maxAttendees) {
    showGoalCelebration();
  }

  const welcomeMessage = `Welcome, ${attendeeName}! We're glad you're joining ${teamNames[selectedTeam]}.`;
  if (attendanceSaved) {
    greeting.textContent = welcomeMessage;
  } else {
    greeting.textContent = `${welcomeMessage} This check-in could not be saved by your browser.`;
  }
  greeting.className = "success-message";
  greeting.style.display = "block";

  checkInForm.reset();
  attendeeNameInput.focus();
});

adjustGoalButton.addEventListener("click", function () {
  openAdminDialog("goal");
});
resetAttendanceButton.addEventListener("click", function () {
  openAdminDialog("reset");
});
adminDialogForm.addEventListener("submit", submitAdminAction);
closeAdminDialogButton.addEventListener("click", closeAdminDialog);
cancelAdminDialogButton.addEventListener("click", closeAdminDialog);
adminModal.addEventListener("click", function (event) {
  if (event.target === adminModal) {
    closeAdminDialog();
  }
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !adminModal.hidden) {
    closeAdminDialog();
  }
});

loadAttendance();
