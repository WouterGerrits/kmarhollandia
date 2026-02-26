// Check login
if(localStorage.getItem("loggedIn") !== "true"){
  window.location.href = "login.html";
}

// Rol ophalen
const role = localStorage.getItem("role");

// Dossiers ophalen
let dossiers = JSON.parse(localStorage.getItem("dossiers") || "[]");

// Elementen
const dossierList = document.getElementById("dossierList");
const dossierForm = document.getElementById("dossierForm");
const titelInput = document.getElementById("titelInput");
const roepnummerInput = document.getElementById("roepnummerInput");
const geboortedatumInput = document.getElementById("geboortedatumInput");
const infoInput = document.getElementById("infoInput");
const afbeeldingInput = document.getElementById("afbeeldingInput");
const searchInput = document.getElementById("searchInput");

// Discord webhook log functie
function sendDiscordLog(action, dossier, before = null) {
  const webhookUrl = "https://discord.com/api/webhooks/1476712827224854552/X7MZIrB8ft88By3QyuJonQtNuLjNtAuL4Xsf2nBpcyFoet9yE6_8sCAumIw2H2XAONTn";
  
  let content = `📌 **Actie:** ${action}\n`;
  
  if(before){
    content += `**Voor:**\n📄 Naam: ${before.titel}\n📇 Roepnummer: ${before.roepnummer}\n👤 Geboortedatum: ${before.geboortedatum || "Niet opgegeven"}\n📝 Info: ${before.info}\n🕒 Datum: ${before.datum}\n\n`;
    content += `**Na:**\n📄 Naam: ${dossier.titel}\n📇 Roepnummer: ${dossier.roepnummer}\n👤 Geboortedatum: ${dossier.geboortedatum || "Niet opgegeven"}\n📝 Info: ${dossier.info}\n🕒 Datum: ${dossier.datum}`;
  } else {
    content += `📄 Naam: ${dossier.titel}\n📇 Roepnummer: ${dossier.roepnummer}\n👤 Geboortedatum: ${dossier.geboortedatum || "Niet opgegeven"}\n📝 Info: ${dossier.info}\n🕒 Datum: ${dossier.datum}`;
  }

  fetch(webhookUrl, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({content})
  }).catch(err => console.error("Webhook error:", err));
}

// Render dossiers
function render(filteredDossiers = dossiers){
  dossierList.innerHTML = "";
  const displayDossiers = [...filteredDossiers].reverse(); // Nieuwste eerst

  displayDossiers.forEach((d) => {
    const origineleIndex = dossiers.indexOf(d);
    const geboortedatumFormatted = d.geboortedatum ? d.geboortedatum.split("-").reverse().join("-") : "";

    const div = document.createElement("div");
    div.className = "dossier-card";

    div.innerHTML = `
      <h3>${d.titel}</h3>
      <p><strong>Roepnummer:</strong> ${d.roepnummer}</p>
      ${geboortedatumFormatted ? `<p><strong>Geboortedatum:</strong> ${geboortedatumFormatted}</p>` : ""}
      <p>${d.info}</p>
      <p><em>Aangemaakt op: ${d.datum}</em></p>
      ${d.afbeeldingen && d.afbeeldingen.length ? d.afbeeldingen.map(img => `<img src="${img}" alt="Afbeelding" style="max-width:200px;margin-right:5px;margin-top:5px;">`).join('') : ""}
      <div style="margin-top:0.5rem;">
        ${role === "korpsleiding" ? `
          <button onclick="editDossier(${origineleIndex})">Bewerken</button>
          <button onclick="deleteDossier(${origineleIndex})">Verwijderen</button>` : ""}
      </div>
    `;
    dossierList.appendChild(div);
  });
}

// Opslaan
function save(){
  localStorage.setItem("dossiers", JSON.stringify(dossiers));
  render();
}

// Nieuw dossier toevoegen
if(dossierForm){
  dossierForm.addEventListener("submit", function(e){
    e.preventDefault();

    const files = Array.from(afbeeldingInput.files);
    const datum = new Date().toLocaleString();
    const titel = titelInput.value.trim();
    const roepnummer = roepnummerInput.value.trim();
    const geboortedatum = geboortedatumInput.value;
    const info = infoInput.value.trim();

    if(!titel || !roepnummer || !geboortedatum || !info){
      alert("Vul alle verplichte velden in!");
      return;
    }

    const images = [];
    let loaded = 0;

    function finalizeDossier(imgs){
      const nieuwDossier = {titel, roepnummer, geboortedatum, info, afbeeldingen: imgs, datum};
      dossiers.push(nieuwDossier);
      save();
      dossierForm.reset();
      sendDiscordLog("Dossier toegevoegd", nieuwDossier);
    }

    if(files.length === 0){
      finalizeDossier([]);
    } else {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e){
          images.push(e.target.result);
          loaded++;
          if(loaded === files.length){
            finalizeDossier(images);
          }
        }
        reader.readAsDataURL(file);
      });
    }
  });
}

// Bewerken
window.editDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te bewerken!");

  const d = dossiers[i];
  const before = {...d}; // Maak copy van oude values

  const newTitel = prompt("Naam:", d.titel);
  const newRoepnummer = prompt("Roepnummer:", d.roepnummer);
  const newGeboortedatum = prompt("Geboortedatum (DD-MM-JJJJ):", d.geboortedatum || "");
  const newInfo = prompt("Info:", d.info);

  if(newTitel && newRoepnummer && newInfo){
    d.titel = newTitel;
    d.roepnummer = newRoepnummer;
    d.geboortedatum = newGeboortedatum;
    d.info = newInfo;
    save();
    sendDiscordLog("Dossier bewerkt", d, before); // Stuur Before + After
  }
}

// Verwijderen
window.deleteDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te verwijderen!");
  if(confirm("Weet je zeker dat je dit dossier wilt verwijderen?")){
    const removed = dossiers.splice(i,1)[0];
    save();
    sendDiscordLog("Dossier verwijderd", removed);
  }
}

// Zoekfunctie
if(searchInput){
  searchInput.addEventListener("input", function(){
    const query = this.value.toLowerCase();
    const filtered = dossiers.filter(d =>
      d.titel.toLowerCase().includes(query) ||
      (d.geboortedatum && d.geboortedatum.toLowerCase().includes(query)) ||
      d.roepnummer.toLowerCase().includes(query)
    );
    render(filtered);
  });
}

// Initial render
render();

