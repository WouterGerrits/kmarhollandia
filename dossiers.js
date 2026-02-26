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

// Render dossiers
function render(filteredDossiers = dossiers){
  dossierList.innerHTML = "";

  filteredDossiers.forEach((d, i) => {
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
      ${d.afbeeldingen.map(img => `<img src="${img}" alt="Afbeelding">`).join('')}
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

    if(files.length === 0){
      dossiers.push({titel, roepnummer, geboortedatum, info, afbeeldingen: [], datum});
      save();
      dossierForm.reset();
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e){
        images.push(e.target.result);
        loaded++;
        if(loaded === files.length){
          dossiers.push({titel, roepnummer, geboortedatum, info, afbeeldingen: images, datum});
          save();
          dossierForm.reset();
        }
      }
      reader.readAsDataURL(file);
    });
  });
}

// Bewerken (alleen Korpsleiding)
window.editDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te bewerken!");

  const d = dossiers[i];
  const newTitel = prompt("Titel:", d.titel);
  const newRoepnummer = prompt("Roepnummer:", d.roepnummer);
  const newGeboortedatum = prompt("Geboortedatum (DD-MM-YYYY):", d.geboortedatum || "");
  const newInfo = prompt("Info:", d.info);

  if(newTitel && newRoepnummer && newInfo){
    d.titel = newTitel;
    d.roepnummer = newRoepnummer;
    d.geboortedatum = newGeboortedatum;
    d.info = newInfo;
    save();
  }
}

// Verwijderen (alleen Korpsleiding)
window.deleteDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te verwijderen!");
  if(confirm("Weet je zeker dat je dit dossier wilt verwijderen?")){
    dossiers.splice(i,1);
    save();
  }
}

// Zoekfunctie (titel, geboortedatum, roepnummer)
if(searchInput){
  searchInput.addEventListener("input", function(){
    const query = this.value.toLowerCase();
    const filtered = dossiers.filter(d =>
      d.titel.toLowerCase().includes(query) ||
      d.geboortedatum.toLowerCase().includes(query) ||
      d.roepnummer.toLowerCase().includes(query)
    );
    render(filtered);
  });
}

// Initial render
render();
