let selectedCase=null;
let selectedTasks=[];

mysteryCases.forEach((c,i)=>{
 const el=document.createElement("div");
 el.className="item";
 el.innerHTML=`<b>${c.name}</b><br>${c.clue}`;
 el.onclick=()=>{document.querySelectorAll(".cases .item").forEach(x=>x.classList.remove("active"));el.classList.add("active");selectedCase=c};
 document.getElementById("cases").appendChild(el);
});

taskBank.forEach(t=>{
 const el=document.createElement("div");
 el.className="item";
 el.innerHTML=`<input type="checkbox"> ${t}`;
 el.onclick=()=>{el.querySelector("input").checked=!el.querySelector("input").checked; selectedTasks=[...document.querySelectorAll(".tasks input:checked")].map(x=>x.parentElement.innerText.trim())};
 document.getElementById("tasks").appendChild(el);
});

function generate(){
 if(!selectedCase) return alert("Выберите дело");
 document.getElementById("result").textContent =
`CASE: ${selectedCase.name}

LANGUAGE: ${language.value}
LEVEL: ${level.value}
AGE: ${age.value}

AUDIO SCRIPT:
Create a detective audio scene with witnesses, evidence and hidden clues.

WORKBOOK:
${selectedTasks.join(", ")}

RULE:
Every answer must be supported by an actual clue from the audio or documents.`;
}