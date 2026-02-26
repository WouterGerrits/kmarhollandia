// login.js

function login() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  // KMAR Korpsleiding
  if(user === "luitenantgeneraal" && pass === "Kmarhrb2103!") {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('role', 'korpsleiding');
    localStorage.setItem('organisatie', 'kmar');
    window.location.href = "dossiers.html";
    return;
  }

  // KMAR Agent
  if(user === "kmaragent1" && pass === "Kmar2026!") {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('role', 'agent');
    localStorage.setItem('organisatie', 'kmar');
    window.location.href = "dossiers.html";
    return;
  }

  // Politie Korpsleiding
  if(user === "polkorpsleiding" && pass === "Politiedsi1452!") {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('role', 'korpsleiding');
    localStorage.setItem('organisatie', 'politie');
    window.location.href = "dossiers.html";
    return;
  }

  // Politie Agent
  if(user === "politieagent1" && pass === "Politie0391!") {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('role', 'agent');
    localStorage.setItem('organisatie', 'politie');
    window.location.href = "dossiers.html";
    return;
  }

  // Ongeldige login
  errorMsg.innerText = "Ongeldige gebruikersnaam of wachtwoord!";
}

// Check login status op dossiers.html
function checkLogin() {
  if(localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = "login.html";
  }
}
