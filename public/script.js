// Admin password (do not store in frontend in real apps)
const ADMIN_PASSWORD = "admin123";

// In-memory teams array (resets on refresh)
let teams = [];

// Admin login
function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminPanel').classList.remove('hidden');
    } else {
        alert('Incorrect password!');
    }
}

// Add new team
function addTeam() {
    const name = document.getElementById('teamName').value.trim();
    const score = parseInt(document.getElementById('teamScore').value, 10);
    
    if (!name || isNaN(score)) {
        alert('Please enter a valid team name and score!');
        return;
    }
    
    teams.push({ name, score });
    updateLeaderboard();
    updateTeamSelect();
    
    // Clear inputs
    document.getElementById('teamName').value = '';
    document.getElementById('teamScore').value = '';
}

// Update team score
function updateScore() {
    const selectedTeam = document.getElementById('teamSelect').value;
    const newScore = parseInt(document.getElementById('newScore').value, 10);
    
    if (isNaN(newScore)) {
        alert('Please enter a valid score!');
        return;
    }
    
    const team = teams.find(team => team.name === selectedTeam);
    if (team) {
        team.score = newScore;
        updateLeaderboard();
    }
    
    document.getElementById('newScore').value = '';
}

// Remove team
function removeTeam() {
    const selectedTeam = document.getElementById('teamSelect').value;
    teams = teams.filter(team => team.name !== selectedTeam);
    updateLeaderboard();
    updateTeamSelect();
}

// Update leaderboard display
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    
    // Sort teams by score (descending)
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    
    sortedTeams.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'team-row';
        if (index === 0) row.classList.add('first');
        if (index === 1) row.classList.add('second');
        if (index === 2) row.classList.add('third');
        
        row.innerHTML = `
            <span>${index + 1}</span>
            <span>${team.name}</span>
            <span>${team.score}</span>
        `;
        
        leaderboardList.appendChild(row);
    });
}

// Update team select dropdown
function updateTeamSelect() {
    const teamSelect = document.getElementById('teamSelect');
    teamSelect.innerHTML = '';
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
}

// Initial update
updateLeaderboard();
updateTeamSelect();


