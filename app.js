const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={mode:'auto',selectedCase:null,skills:['Listening','Speaking'],evidence:['Interrogation','Email / chat'],tasks:[]};
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)};

function renderCases(){
 const q=$('#caseSearch').value.toLowerCase().trim(), filter=$('#caseFilter').value;
 const items=mysteryCases.filter(c=>(filter==='all'||c.category===filter)&&(!q||[c.title,c.goal,c.grammar,...c.focus].join(' ').toLowerCase().includes(q)));
 $('#caseCountBadge').textContent=`${items.length} из 30`;
 $('#caseGrid').innerHTML=items.map((c,i)=>`<article class="case-card ${state.selectedCase?.title===c.title?'selected':''}" data-title="${c.title.replace(/"/g,'&quot;')}"><span class="number">CASE ${String(mysteryCases.indexOf(c)+1).padStart(2,'0')}</span><h3>${c.title}</h3><p>${c.goal}</p><div class="mini-tags"><span>${c.ages}</span>${c.levels.slice(0,3).map(x=>`<span>${x}</span>`).join('')}<span>${c.category}</span></div></article>`).join('');
 $$('.case-card').forEach(el=>el.onclick=()=>{state.selectedCase=mysteryCases.find(c=>c.title===el.dataset.title);renderCases();renderRecommendations();toast('Дело выбрано')});
}

function renderEvidence(){
 $('#evidenceOptions').innerHTML=evidenceTypes.map(e=>`<div class="evidence-card ${state.evidence.includes(e.title)?'selected':''}" data-evidence="${e.title}"><strong>${e.title}</strong><small>${e.desc}</small></div>`).join('');
 $$('.evidence-card').forEach(el=>el.onclick=()=>{
  const v=el.dataset.evidence; if(state.evidence.includes(v))state.evidence=state.evidence.filter(x=>x!==v); else if(state.evidence.length<5)state.evidence.push(v); else return toast('Можно выбрать до 5 материалов'); renderEvidence();
 });
}

function recommendedTaskTitles(){
 const c=state.selectedCase; const recommended=new Set(c?.recommended||[]);
 const skillSet=new Set(state.skills);
 taskBank.filter(t=>skillSet.has(t.skill)).slice(0,12).forEach(t=>recommended.add(t.title));
 ['Case Prediction','Evidence Board','Final Verdict + Evidence Standard'].forEach(x=>recommended.add(x));
 return recommended;
}

function renderRecommendations(){
 const rec=[...recommendedTaskTitles()].slice(0,9);
 $('#recommendationStrip').innerHTML=rec.map(x=>`<span class="rec-pill">★ ${x}</span>`).join('');
 renderTasks();
}

function renderTasks(){
 const q=$('#taskSearch').value.toLowerCase().trim(), skill=$('#taskSkillFilter').value, rec=recommendedTaskTitles();
 const filtered=taskBank.filter(t=>(skill==='all'||t.skill===skill)&&(!q||[t.title,t.description,t.skill].join(' ').toLowerCase().includes(q)));
 $('#taskGrid').innerHTML=filtered.map(t=>{const added=state.tasks.some(x=>x.id===t.id);return `<article class="task-card ${rec.has(t.title)?'recommended':''}"><div class="task-meta"><span>${t.skill}</span><span>${t.stage}</span>${rec.has(t.title)?'<span>recommended</span>':''}</div><h4>${t.title}</h4><p>${t.description}</p><button data-task="${t.id}" ${added?'disabled':''}>${added?'Добавлено':'Добавить'}</button></article>`}).join('');
 $$('[data-task]').forEach(b=>b.onclick=()=>addTask(b.dataset.task));
}

function addTask(id){
 if(state.tasks.length>=10)return toast('Максимум 10 заданий'); const src=taskBank.find(t=>t.id===id); if(!src)return; state.tasks.push({...src,items:src.defaultItems,difficulty:'Medium'});renderSelected();renderTasks();
}
function removeTask(i){state.tasks.splice(i,1);renderSelected();renderTasks()}
function renderSelected(){
 $('#selectedCount').textContent=`${state.tasks.length} / 10 заданий`;
 $('#selectedTasks').innerHTML=state.tasks.length?state.tasks.map((t,i)=>`<div class="selected-item"><div class="selected-top"><b>${i+1}. ${t.title}</b><button data-remove="${i}">×</button></div><div class="selected-controls"><input data-items="${i}" value="${t.items}" title="Количество пунктов"><select data-diff="${i}"><option ${t.difficulty==='Easy'?'selected':''}>Easy</option><option ${t.difficulty==='Medium'?'selected':''}>Medium</option><option ${t.difficulty==='Hard'?'selected':''}>Hard</option></select></div></div>`).join(''):'<div class="empty">Добавьте задания из каталога</div>';
 $$('[data-remove]').forEach(b=>b.onclick=()=>removeTask(+b.dataset.remove));
 $$('[data-items]').forEach(inp=>inp.onchange=()=>state.tasks[+inp.dataset.items].items=inp.value);
 $$('[data-diff]').forEach(sel=>sel.onchange=()=>state.tasks[+sel.dataset.diff].difficulty=sel.value);
}

function autoBuild(){
 const c=state.selectedCase||mysteryCases[0]; if(!state.selectedCase){state.selectedCase=c;renderCases()}
 const duration=$('#duration').value; const target=duration.startsWith('20')?4:duration.startsWith('30')?5:duration.startsWith('45')?6:duration.startsWith('60')?8:10;
 const wanted=['Case Prediction',...(c.recommended||[]),'Evidence Board','Final Verdict + Evidence Standard'];
 state.skills.forEach(skill=>{const candidate=taskBank.find(t=>t.skill===skill&&!wanted.includes(t.title)); if(candidate)wanted.splice(wanted.length-1,0,candidate.title)});
 state.tasks=[]; [...new Set(wanted)].slice(0,target).forEach(title=>{const src=taskBank.find(t=>t.title===title); if(src)state.tasks.push({...src,items:src.defaultItems,difficulty:'Medium'})});
 renderSelected();renderTasks();toast(`Подобрано ${state.tasks.length} заданий`);
}

function lessonData(){return {language:$('#language').value||'English',level:$('#level').value,age:$('#age').value,duration:$('#duration').value,vocab:$('#vocab').value.trim()||'not specified — use age-appropriate thematic vocabulary',grammar:$('#grammar').value.trim()||'not specified — do not force a grammar target',skills:state.skills.join(', '),format:$('#classFormat').value,difficulty:$('#difficulty').value,integration:$('#integration').value,tone:$('#tone').value,newVocab:$('#newVocab').value,hints:$('#hints').value,evidenceCount:$('#evidenceCount').value,audioLength:$('#audioLength').value,speakers:$('#speakers').value,transcript:$('#transcript').value,accent:$('#accent').value.trim()||'neutral / appropriate for the target language',speechRate:$('#speechRate').value,sfx:$('#sfx').value};}

function generatePrompts(){
 if(!state.selectedCase)state.selectedCase=mysteryCases[0]; if(state.tasks.length<4)autoBuild(); const d=lessonData(),c=state.selectedCase,evidence=state.evidence.slice(0,+d.evidenceCount); while(evidence.length<+d.evidenceCount)evidence.push(evidenceTypes[evidence.length].title);
 const taskLines=state.tasks.map((t,i)=>`${i+1}. ${t.title} — skill: ${t.skill}; stage: ${t.stage}; items: ${t.items}; difficulty: ${t.difficulty}; purpose: ${t.description}`).join('\n');
 $('#audioPrompt').value=`# ROLE\nYou are an expert language-teaching materials writer, detective-story designer, CEFR-aware editor, and audio-script writer.\n\n# GOAL\nCreate a coherent, age-appropriate language-learning detective case in which learners must use the target language to solve the mystery. The mystery is not decoration: linguistic comprehension must reveal evidence.\n\n# LEARNER PROFILE\nLanguage: ${d.language}\nCEFR level: ${d.level}\nAge: ${d.age}\nLesson length: ${d.duration}\nClass format: ${d.format}\nPriority skills: ${d.skills}\nTarget vocabulary: ${d.vocab}\nTarget grammar: ${d.grammar}\nNew vocabulary policy: ${d.newVocab}\n\n# CASE\nTitle / scenario: ${c.title}\nCase goal: ${c.goal}\nSuggested language fit: ${c.grammar}\nCase difficulty: ${d.difficulty}\nTone: ${d.tone}\nInvestigation model: ${d.integration}\nCore clue types: ${c.clues.join(', ')}\n\n# EVIDENCE PACKAGE\nCreate exactly ${d.evidenceCount} materials:\n${evidence.map((x,i)=>`${i+1}. ${x}`).join('\n')}\nMain audio length: ${d.audioLength}\nNumber of speakers: ${d.speakers}\nAccent / variety: ${d.accent}\nSpeech rate: ${d.speechRate}\nSFX: ${d.sfx}\nTranscript policy: ${d.transcript}\n\n# STORY DESIGN RULES\n1. Establish one objectively solvable mystery with a clear solution before writing the dialogue.\n2. Build an evidence map first: every conclusion must point to a concrete line, document detail, time, object, wording choice, or cross-source contradiction.\n3. Do NOT introduce a decisive fact only in the final explanation.\n4. Do NOT reveal the solution explicitly before the final learner verdict.\n5. The final solution must require combining at least two independent clues.\n6. Include at least one plausible red herring, but make it possible to reject it from existing evidence.\n7. Keep content safe and age-appropriate; prefer missing objects, mix-ups, secrets, identity/location puzzles, or non-violent incidents.\n8. Make character voices distinct but linguistically accessible at ${d.level}.\n9. Target grammar/vocabulary must sound natural; never distort dialogue merely to include a form.\n10. If the learner is young or low-level, reduce lexical load before reducing the logic of the case.\n\n# OUTPUT\nA. CASE OVERVIEW — 100–180 words for the teacher.\nB. CAST — names, role, speaking style, what each person knows.\nC. SOLUTION — teacher-only, 2–4 sentences.\nD. EVIDENCE MAP — table: clue ID | source | exact detail | what it proves | whether essential/red herring.\nE. AUDIO/TTS SCRIPT — clear speaker labels, optional [SFX], natural pauses, no answer reveal.\nF. OTHER EVIDENCE MATERIALS — ready-to-use texts/data, each labelled.\nG. PRONUNCIATION / TTS NOTES — names, stress, difficult words if necessary.\nH. LANGUAGE CONTROL CHECK — confirm level, target vocabulary, grammar, and any unavoidable new words.\nI. CONSISTENCY CHECK — explicitly verify that every essential clue exists in the learner-facing materials.`;

 $('#workbookPrompt').value=`# ROLE\nYou are an expert language teacher, workbook author, task designer, and mystery-game editor.\n\n# INPUT\nUse the completed detective script and evidence package generated for the case “${c.title}”. Do not invent new facts that are absent from those materials.\n\nLearners: ${d.age} years old | ${d.level} | ${d.language}\nLesson: ${d.duration} | ${d.format}\nPriority skills: ${d.skills}\nVocabulary: ${d.vocab}\nGrammar: ${d.grammar}\nHints: ${d.hints}\nInvestigation structure: ${d.integration}\nEvidence Board: ${$('#evidenceBoard').checked?'YES':'NO'}\nAnswer key: ${$('#answerKey').checked?'YES — with brief explanations and source references':'NO'}\nFinal Verdict: ${$('#finalVerdict').checked?'REQUIRED':'OPTIONAL'}\n\n# SELECTED WORKBOOK TASKS\n${taskLines}\n\n# DESIGN PRINCIPLE\nThe workbook must feel like one investigation, not a stack of unrelated exercises. Whenever possible, the output of one task becomes the input, clue, question, or hypothesis for the next.\n\n# FOR EACH TASK PROVIDE\n- Task number and memorable title\n- Skill focus and micro-objective\n- Investigation stage: briefing / input / evidence / deduction / production / verdict\n- Student instruction in ${d.language}\n- Complete learner-facing task content\n- Exactly the requested number of items, unless the format logically uses minutes/roles instead\n- Answer type / expected output\n- Which clue(s) from the evidence map the task uses or unlocks\n- Optional hint according to the selected support level\n- Fast-finisher / extension where useful\n- Teacher note: what to listen for / common difficulty\n\n# QUALITY RULES\n1. Every factual answer must be traceable to the existing script/evidence.\n2. Never make the learner guess information they have not received.\n3. Do not reveal the final solution in instructions, examples, distractors, answer patterns, or early tasks.\n4. Distractors must be plausible but unambiguously wrong from the source material.\n5. For multiple-choice tasks, distribute correct options across positions rather than creating a pattern.\n6. Use recognition → controlled recall → deduction → spoken/written production when the selected task order allows it.\n7. Keep instructions shorter and simpler than the task language.\n8. If a task practices grammar, grammar must contribute to meaning or reconstruction of the case.\n9. If a task practices vocabulary, use the words in meaningful case contexts, not isolated lists only.\n10. Final Verdict must require: a conclusion + at least two independent pieces of evidence + one sentence rejecting the strongest red herring.\n\n# FINAL OUTPUT SECTIONS\n1. Workbook title + case briefing\n2. Tasks in the selected order\n${$('#evidenceBoard').checked?'3. Reusable Evidence Board: WHAT WE KNOW / SUSPECTS / EVIDENCE / QUESTIONS / WHAT CHANGED\n':''}${$('#finalVerdict').checked?'4. Final Verdict page\n':''}${$('#answerKey').checked?'5. Teacher Answer Key with evidence-source references\n':''}6. 3-minute optional reflection / exit ticket`;

 $('#teacherBrief').value=`LANGUAGE MYSTERY BUILDER — TEACHER BRIEF\n\nCASE: ${c.title}\nGOAL: ${c.goal}\nLEARNERS: ${d.language}, ${d.level}, age ${d.age}\nLESSON: ${d.duration}, ${d.format}\nFOCUS: ${d.skills}\nVOCABULARY: ${d.vocab}\nGRAMMAR: ${d.grammar}\n\nEVIDENCE (${evidence.length}): ${evidence.join(' • ')}\nAUDIO: ${d.audioLength}, ${d.speakers} speaker(s), ${d.speechRate}\n\nWORKBOOK ROUTE:\n${state.tasks.map((t,i)=>`${i+1}. ${t.title} [${t.skill}]`).join('\n')}\n\nDESIGN STANDARD:\nThe final answer must never depend on hidden information. Learners should be able to cite at least two independent clues when giving the verdict.`;
 toast('Промпты готовы');
}

$$('#modeControl button').forEach(b=>b.onclick=()=>{$$('#modeControl button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.mode=b.dataset.mode;if(state.mode==='auto')autoBuild()});
$$('#skillChips button').forEach(b=>b.onclick=()=>{b.classList.toggle('selected');state.skills=$$('#skillChips button.selected').map(x=>x.dataset.value);renderRecommendations()});
$('#caseSearch').oninput=renderCases; $('#caseFilter').onchange=renderCases; $('#taskSearch').oninput=renderTasks; $('#taskSkillFilter').onchange=renderTasks;
$('#autoBuildBtn').onclick=autoBuild; $('#clearTasksBtn').onclick=()=>{state.tasks=[];renderSelected();renderTasks()};
$('#addCustomBtn').onclick=()=>{const title=$('#customTask').value.trim();if(!title)return;if(state.tasks.length>=10)return toast('Максимум 10 заданий');state.tasks.push({id:'custom-'+Date.now(),title,description:'Пользовательский формат',skill:'Custom',stage:'practice',items:'5',difficulty:'Medium'});$('#customTask').value='';renderSelected();renderTasks()};
$('#generateBtn').onclick=generatePrompts;
$$('.output-tabs button').forEach(b=>b.onclick=()=>{$$('.output-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.output').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.tab).classList.add('active')});
$('#copyBtn').onclick=async()=>{const active=$('.output.active');if(!active.value)return toast('Сначала сгенерируйте промпт');await navigator.clipboard.writeText(active.value);toast('Скопировано')};
$$('.step-link').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.target).scrollIntoView({behavior:'smooth'}));
$('#resetBtn').onclick=()=>{localStorage.removeItem('lmb-draft');location.reload()};
$('#saveDraftBtn').onclick=()=>{const d={state,fields:{language:$('#language').value,level:$('#level').value,age:$('#age').value,duration:$('#duration').value,vocab:$('#vocab').value,grammar:$('#grammar').value}};localStorage.setItem('lmb-draft',JSON.stringify(d));toast('Черновик сохранён в браузере')};

(function restore(){try{const raw=localStorage.getItem('lmb-draft');if(!raw)return;const d=JSON.parse(raw);Object.assign(state,d.state||{});Object.entries(d.fields||{}).forEach(([k,v])=>{const el=$('#'+k);if(el)el.value=v});$$('#skillChips button').forEach(b=>b.classList.toggle('selected',state.skills.includes(b.dataset.value)));}catch(e){}})();
renderCases();renderEvidence();renderSelected();renderRecommendations();
