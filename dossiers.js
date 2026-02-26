// Check login
if(localStorage.getItem("loggedIn") !== "true"){
  window.location.href = "login.html";
}

// Bepaal rol
const role = localStorage.getItem("role"); // "korpsleiding" of "agent"

// Haal dossiers op uit localStorage
let dossiers = JSON.parse(localStorage.getItem("dossiers") || "[]");

const dossierList = document.getElementById("dossierList");
const dossierForm = document.getElementById("dossierForm");
const titelInput = document.getElementById("titelInput");
const infoInput = document.getElementById("infoInput");
const afbeeldingInput = document.getElementById("afbeeldingInput");

// Toon of verberg bewerk/verwijder buttons afhankelijk van rol
function render() {
  dossierList.innerHTML = "";
  dossiers.forEach((d, i) => {
    const div = document.createElement("div");
    div.className = "dossier-card";
    div.innerHTML = `
      <h3>${d.titel}</h3>
      <p>${d.info}</p>
      <p><em>Aangemaakt op: ${d.datum}</em></p>
      ${d.afbeeldingen.map(img => `<img src="${img}" alt="Afbeelding" style="max-width:200px;margin-right:5px;">`).join('')}
      <div style="margin-top:0.5rem;">
        ${role === "korpsleiding" ? `<button onclick="editDossier(${i})">Bewerken</button>
        <button onclick="deleteDossier(${i})">Verwijderen</button>` : ""}
      </div>
    `;
    dossierList.appendChild(div);
  });
}

// Sla dossiers op
function save() {
  localStorage.setItem("dossiers", JSON.stringify(dossiers));
  render();
}

// Voeg nieuw dossier toe via formulier
if(dossierForm){
  dossierForm.addEventListener("submit", function(e){
    e.preventDefault();
    const files = Array.from(afbeeldingInput.files);
    const datum = new Date().toLocaleString();

    if(titelInput.value && infoInput.value){
      const images = [];
      let loaded = 0;

      if(files.length === 0){
        dossiers.push({
          titel: titelInput.value,
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

// Bewerken dossier (alleen Korpsleiding)
window.editDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te bewerken!");
  const d = dossiers[i];
  const newTitel = prompt("Titel:", d.titel);
  const newInfo = prompt("Info:", d.info);
  if(newTitel && newInfo){
    dossiers[i].titel = newTitel;
    dossiers[i].info = newInfo;
    save();
  }
}

// Verwijderen dossier (alleen Korpsleiding)
window.deleteDossier = function(i){
  if(role !== "korpsleiding") return alert("Je hebt geen rechten om dossiers te verwijderen!");
  if(confirm("Weet je zeker dat je dit dossier wilt verwijderen?")){
    dossiers.splice(i,1);
    save();
  }
}

// Initial render
render();

// Zoekfunctie
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function() {
  const query = this.value.toLowerCase();
  dossierList.innerHTML = "";

  dossiers.forEach((d, i) => {
    if(d.titel.toLowerCase().includes(query)) {
      const div = document.createElement("div");
      div.className = "dossier-card";

      let buttons = "";
      if(role === "korpsleiding") {
        buttons = `
          <button class="edit" onclick="editDossier(${i})">Bewerken</button>
          <button class="delete" onclick="deleteDossier(${i})">Verwijderen</button>
        `;
      }

      div.innerHTML = `
        <h3>${d.titel}</h3>
        <p>${d.info}</p>
        <p><em>Aangemaakt op: ${d.datum}</em></p>
        ${d.afbeeldingen.map(img => `<img src="${img}" alt="Afbeelding">`).join('')}
        <div style="margin-top:0.5rem;">${buttons}</div>
      `;
      dossierList.appendChild(div);
    }
  });
});