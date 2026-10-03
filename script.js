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
const attendanceProgress = document.getElementById("attendanceProgress");
const progressBar = document.getElementById("progressBar");

const maxAttendees = 50;
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

function updateAttendanceDisplay() {
  const progress = Math.min((attendeeCount / maxAttendees) * 100, 100);

  attendeeCountDisplay.textContent = attendeeCount;
  progressBar.style.width = `${progress}%`;
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
    teamCounts: teamCounts,
    attendees: attendees,
  };

  localStorage.setItem(storageKey, JSON.stringify(attendanceData));
}

function loadAttendance() {
  const savedAttendance = localStorage.getItem(storageKey);

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
  saveAttendance();

  if (attendeeCount === maxAttendees) {
    showGoalCelebration();
  }

  greeting.textContent = `Welcome, ${attendeeName}! We're glad you're joining ${teamNames[selectedTeam]}.`;
  greeting.className = "success-message";
  greeting.style.display = "block";

  checkInForm.reset();
  attendeeNameInput.focus();
});

loadAttendance();
