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
const kentekenInput = document.getElementById("kentekenInput");
const geboortedatumInput = document.getElementById("geboortedatumInput");
const infoInput = document.getElementById("infoInput");
const afbeeldingInput = document.getElementById("afbeeldingInput");
const searchInput = document.getElementById("searchInput");

// Datum formatter
function formatDateTime(dateObj = new Date()){
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  const dag = String(d.getDate()).padStart(2,'0');
  const maand = String(d.getMonth()+1).padStart(2,'0');
  const jaar = d.getFullYear();
  const uren = String(d.getHours()).padStart(2,'0');
  const minuten = String(d.getMinutes()).padStart(2,'0');
  const seconden = String(d.getSeconds()).padStart(2,'0');
  return `${dag}-${maand}-${jaar} ${uren}:${minuten}:${seconden}`;
}

// Discord webhook
function sendDiscordLog(action, dossier, before = null) {

  const webhookUrl = "https://discord.com/api/webhooks/1476712827224854552/X7MZIrB8ft88By3QyuJonQtNuLjNtAuL4Xsf2nBpcyFoet9yE6_8sCAumIw2H2XAONTn";

  let content = `📌 **Actie:** ${action}\n`;

  if(before){
    content += `\n**VOOR:**\n`;
    content += `👤 Naam: ${before.titel}\n`;
    content += `📇 Roepnummer: ${before.roepnummer}\n`;
    content += `🚗 Kenteken: ${before.kenteken || "Geen"}\n`;
    content += `🎂 Geboortedatum: ${before.geboortedatum || "Niet opgegeven"}\n`;
    content += `📝 Info: ${before.info}\n\n`;

    content += `**NA:**\n`;
    content += `👤 Naam: ${dossier.titel}\n`;
    content += `📇 Roepnummer: ${dossier.roepnummer}\n`;
    content += `🚗 Kenteken: ${dossier.kenteken || "Geen"}\n`;
    content += `🎂 Geboortedatum: ${dossier.geboortedatum || "Niet opgegeven"}\n`;
    content += `📝 Info: ${dossier.info}\n`;
    content += `📅 Datum: ${formatDateTime(dossier.datum)}`;

  } else {

    content += `👤 Naam: ${dossier.titel}\n`;
    content += `📇 Roepnummer: ${dossier.roepnummer}\n`;
    content += `🚗 Kenteken: ${dossier.kenteken || "Geen"}\n`;
    content += `🎂 Geboortedatum: ${dossier.geboortedatum || "Niet opgegeven"}\n`;
    content += `📝 Info: ${dossier.info}\n`;
    content += `📅 Datum: ${formatDateTime(dossier.datum)}`;

  }

  fetch(webhookUrl,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({content})
  }).catch(err=>console.error("Webhook error:",err));
}


// Render dossiers
function render(filteredDossiers = dossiers){

  dossierList.innerHTML = "";

  const displayDossiers = [...filteredDossiers].reverse();

  displayDossiers.forEach((d)=>{

    const origineleIndex = dossiers.indexOf(d);

    const geboortedatumFormatted = d.geboortedatum 
      ? d.geboortedatum.split("-").reverse().join("-") 
      : "";

    const div = document.createElement("div");

    div.className = "dossier-card";

    div.innerHTML = `
      <h3>${d.titel}</h3>

      <p><strong>Roepnummer:</strong> ${d.roepnummer}</p>

      <p><strong>Kenteken:</strong> ${d.kenteken || "Niet opgegeven"}</p>

      ${geboortedatumFormatted ? `<p><strong>Geboortedatum:</strong> ${geboortedatumFormatted}</p>` : ""}

      <p>${d.info}</p>

   <p><em>Aangemaakt op: ${formatDateTime(d.datum)}</em></p>

      ${d.afbeeldingen && d.afbeeldingen.length
        ? d.afbeeldingen.map(img => `<img src="${img}" style="max-width:200px;margin-top:5px;margin-right:5px;">`).join("")
        : ""
      }

      <div style="margin-top:8px;">

      ${role === "korpsleiding"
        ? `
        <button onclick="editDossier(${origineleIndex})">Bewerken</button>
        <button onclick="deleteDossier(${origineleIndex})">Verwijderen</button>
        `
        : ""
      }

      </div>
    `;

    dossierList.appendChild(div);

  });

}


// Opslaan
function save(){
  localStorage.setItem("dossiers",JSON.stringify(dossiers));
  render();
}


// Nieuw dossier
if(dossierForm){

  dossierForm.addEventListener("submit",function(e){

    e.preventDefault();

    const files = Array.from(afbeeldingInput.files);

   const datum = new Date().toISOString(); // ISO opslaan met datum+tijd

    const titel = titelInput.value.trim();

    const roepnummer = roepnummerInput.value.trim();

    const kenteken = kentekenInput.value.trim();

    const geboortedatum = geboortedatumInput.value;

    const info = infoInput.value.trim();

    if(!titel || !roepnummer || !geboortedatum || !info){
      alert("Vul alle verplichte velden in!");
      return;
    }

    const images = [];

    let loaded = 0;

    function finalizeDossier(imgs){

      const nieuwDossier = {
        titel,
        roepnummer,
        kenteken,
        geboortedatum,
        info,
        afbeeldingen:imgs,
        datum
      };

      dossiers.push(nieuwDossier);

      save();

      dossierForm.reset();

      sendDiscordLog("Dossier toegevoegd",nieuwDossier);
    }


    if(files.length === 0){
      finalizeDossier([]);
    }

    else{

      files.forEach(file=>{

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

  if(role !== "korpsleiding") return alert("Geen rechten!");

  const d = dossiers[i];

  const before = {...d};

  const newTitel = prompt("Naam:",d.titel);

  const newRoepnummer = prompt("Roepnummer:",d.roepnummer);

  const newKenteken = prompt("Kenteken:",d.kenteken || "");

  const newGeboortedatum = prompt("Geboortedatum:",d.geboortedatum || "");

  const newInfo = prompt("Info:",d.info);

  if(newTitel && newRoepnummer && newInfo){

    d.titel = newTitel;

    d.roepnummer = newRoepnummer;

    d.kenteken = newKenteken;

    d.geboortedatum = newGeboortedatum;

    d.info = newInfo;

    save();

    sendDiscordLog("Dossier bewerkt",d,before);

  }

}


// Verwijderen
window.deleteDossier = function(i){

  if(role !== "korpsleiding") return alert("Geen rechten!");

  if(confirm("Weet je zeker dat je dit dossier wilt verwijderen?")){

    const removed = dossiers.splice(i,1)[0];

    save();

    sendDiscordLog("Dossier verwijderd",removed);

  }

}


// Zoekfunctie
if(searchInput){

  searchInput.addEventListener("input",function(){

    const query = this.value.toLowerCase();

    const filtered = dossiers.filter(d =>

      d.titel.toLowerCase().includes(query) ||

      d.roepnummer.toLowerCase().includes(query) ||

      (d.kenteken && d.kenteken.toLowerCase().includes(query)) ||

      (d.geboortedatum && d.geboortedatum.toLowerCase().includes(query))

    );

    render(filtered);

  });

}


// Initial render
render();
