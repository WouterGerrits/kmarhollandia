// Check login
if(localStorage.getItem("loggedIn") !== "true"){
  window.location.href = "login.html";
}

// Bepaal rol
const role = localStorage.getItem("role");

// Haal dossiers op
let dossiers = JSON.parse(localStorage.getItem("dossiers") || "[]");

const dossierList = document.getElementById("dossierList");
const dossierForm = document.getElementById("dossierForm");
const titelInput = document.getElementById("titelInput");
const infoInput = document.getElementById("infoInput");
const afbeeldingInput = document.getElementById("afbeeldingInput");
const geboortedatumInput = document.getElementById("geboortedatumInput");

// Render dossiers
function render(filteredDossiers = dossiers) {
  dossierList.innerHTML = "";

  filteredDossiers.forEach((d, i) => {
    const origineleIndex = dossiers.indexOf(d);

    const div = document.createElement("div");
    div.className = "dossier-card";

    div.innerHTML = `
      <h3>${d.titel}</h3>
      ${d.geboortedatum ? `<p><strong>Geboortedatum:</strong> ${d.geboortedatum}</p>` : ""}
      <p>${d.info}</p>
      <p><em>Aangemaakt op: ${d.datum}</em></p>
      ${d.afbeeldingen.map(img => 
        `<img src="${img}" alt="Afbeelding" style="max-width:200px;margin-right:5px;">`
      ).join('')}
      <div style="margin-top:0.5rem;">
        ${role === "korpsleiding" ? `
          <button onclick="editDossier(${origineleIndex})">Bewerken</button>
          <button onclick="deleteDossier(${origineleIndex})">Verwijderen</button>
        ` : ""}
      </div>
    `;

    dossierList.appendChild(div);
  });
}

// Opslaan
function save() {
  localStorage.setItem("dossiers", JSON.stringify(dossiers));
  render();
}

// Nieuw dossier toevoegen
if(dossierForm){
  dossierForm.addEventListener("submit", function(e){
    e.preventDefault();

    const files = Array.from(afbeeldingInput.files);
    const datum = new Date().toLocaleString();
    const geboortedatum = geboortedatumInput.value;

    if(titelInput.value && infoInput.value){
      const images = [];
      let loaded = 0;

      if(files.length === 0){
        dossiers.push({
          titel: titelInput.value,
          geboortedatum: geboortedatum,
          info: infoInput.value,
          afbeeldingen: [],
          datum
        });
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
            dossiers.push({
              titel: titelInput.value,
              geboortedatum: geboortedatum,
              info: infoInput.value,
              afbeeldingen: images,
              datum
            });
            save();
            dossierForm.reset();
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
  const newTitel = prompt("Titel:", d.titel);
  const newGeboortedatum = prompt("Geboortedatum (YYYY-MM-DD):", d.geboortedatum || "");
  const newInfo = prompt("Info:", d.info);

  if(newTitel && newInfo){
    dossiers[i].titel = newTitel;
    dossiers[i].geboortedatum = newGeboortedatum;
    dossiers[i].info = newInfo;
    save();
  }
}

// Verwijderen
window.deleteDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te verwijderen!");

  if(confirm("Weet je zeker dat je dit dossier wilt verwijderen?")){
    dossiers.splice(i,1);
    save();
  }
}

// Zoekfunctie (titel + geboortedatum)
const searchInput = document.getElementById("searchInput");

if(searchInput){
  searchInput.addEventListener("input", function() {
    const query = this.value.toLowerCase();

    const filtered = dossiers.filter(d =>
      d.titel.toLowerCase().includes(query) ||
      (d.geboortedatum && d.geboortedatum.includes(query))
    );

    render(filtered);
  });
}

// Initial render
render();
