// login.js

function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');

  // Admin/Korpsleiding login
  if(user === "admin" && pass === "admin123") {
    localStorage.setItem('loggedIn', 'true'); 
    localStorage.setItem('role', 'korpsleiding'); // rol opslaan
    window.location.href = "dossiers.html";
    return;
  }

  // KMAR Agent login
  if(user === "agent" && pass === "agent123") {
    localStorage.setItem('loggedIn', 'true'); 
    localStorage.setItem('role', 'agent'); // rol opslaan
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