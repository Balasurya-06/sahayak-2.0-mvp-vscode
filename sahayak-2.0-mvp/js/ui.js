// ===================== UI =====================
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pct=x=>(100*x).toFixed(1)+'%';
const LANGS={en:'English',ta:'தமிழ் (Tamil)',hi:'हिन्दी (Hindi)'};
const PINS={'641':{state:'Tamil Nadu',district:'Coimbatore'},'600':{state:'Tamil Nadu',district:'Chennai'},'625':{state:'Tamil Nadu',district:'Madurai'},'560':{state:'Karnataka',district:'Bengaluru'},'682':{state:'Kerala',district:'Kochi'},'110':{state:'Delhi',district:'New Delhi'}};
const WARDS={Coimbatore:['Eachanari','Saravanampatti','Peelamedu','Gandhipuram','RS Puram','Singanallur','Ukkadam','Podanur','ஈச்சனாரி','சரவணம்பட்டி','பீளமேடு','காந்திபுரம்'],Chennai:['T Nagar','Adyar','Velachery','Anna Nagar','Tambaram'],Madurai:['Thallakulam','Simmakkal','KK Nagar'],Bengaluru:['Whitefield','Jayanagar','Indiranagar'],Kochi:['Edappally','Kakkanad'],'New Delhi':['Dwarka','Rohini']};
const LEVELS=['Divisional Officer','District Officer','State Commissioner','State Grievance Cell'];
const SAMPLES=[
 {n:'English · water, clear voice note',lang:'en',text:'no water coming in the tap since three days at eachanari',conf:0.91},
 {n:'Tamil · water',lang:'ta',text:'மூன்று நாட்களாக குழாயில் தண்ணீர் வரவில்லை சரவணம்பட்டி',conf:0.84},
 {n:'Hindi + English · power cut',lang:'hi',text:'बिजली दो दिन से नहीं आ रही peelamedu',conf:0.80},
 {n:'English · street light',lang:'en',text:'street light is not working near gandhipuram',conf:0.77},
 {n:'English · location missing (follow-up demo)',lang:'en',text:'garbage has not been collected for ten days',conf:0.88},
 {n:'English · low confidence (ask to repeat)',lang:'en',text:'pension stopped near peelamedu',conf:0.52}];
const MSG={
 filed:{en:(c)=>`Your complaint ${c.id} is filed with ${c.deptName} (${c.office}). We will follow up for you.`,ta:(c)=>`உங்கள் புகார் ${c.id} ${c.deptName} (${c.office}) துறையில் பதிவு செய்யப்பட்டது. நாங்கள் தொடர்ந்து கவனிப்போம்.`,hi:(c)=>`आपकी शिकायत ${c.id} ${c.deptName} (${c.office}) में दर्ज कर ली गई है। हम आगे की कार्रवाई पर नज़र रखेंगे।`},
 esc:{en:(c,a,n)=>`Your complaint ${c.id} was escalated to level ${n}: ${a}.`,ta:(c,a,n)=>`உங்கள் புகார் ${c.id} நிலை ${n} ஆக உயர்த்தப்பட்டு ${a} அவர்களுக்கு அனுப்பப்பட்டது.`,hi:(c,a,n)=>`आपकी शिकायत ${c.id} स्तर ${n} पर ${a} को भेजी गई है।`},
 legal:{en:()=>`Still no resolution. A legal notice draft is ready and waits for human review. Nothing is sent without approval.`,ta:()=>`இன்னும் தீர்வு இல்லை. சட்ட அறிவிப்பு வரைவு தயாராக உள்ளது, மனித மதிப்பாய்வுக்காக காத்திருக்கிறது. ஒப்புதல் இல்லாமல் எதுவும் அனுப்பப்படாது.`,hi:()=>`अभी समाधान नहीं हुआ। कानूनी नोटिस का मसौदा तैयार है और मानव समीक्षा की प्रतीक्षा में है। बिना अनुमोदन कुछ नहीं भेजा जाएगा।`},
 ask:{en:(c)=>`The portal says complaint ${c.id} is resolved. Is your problem really fixed?`,ta:(c)=>`புகார் ${c.id} தீர்க்கப்பட்டதாக போர்ட்டல் கூறுகிறது. உங்கள் பிரச்சினை உண்மையில் சரியாகிவிட்டதா?`,hi:(c)=>`पोर्टल के अनुसार शिकायत ${c.id} हल हो गई है। क्या आपकी समस्या सच में ठीक हो गई?`},
 reopen:{en:()=>`Thank you. We have reopened the complaint and escalation continues.`,ta:()=>`நன்றி. புகார் மீண்டும் திறக்கப்பட்டது; உயர்த்தும் நடவடிக்கை தொடரும்.`,hi:()=>`धन्यवाद। शिकायत फिर से खोल दी गई है और एस्केलेशन जारी रहेगा।`},
 closed:{en:()=>`Glad it is fixed. Complaint closed.`,ta:()=>`சரியாகிவிட்டது என்பதில் மகிழ்ச்சி. புகார் மூடப்பட்டது.`,hi:()=>`खुशी है कि समस्या हल हुई। शिकायत बंद कर दी गई।`}};
const READBACK={en:(t,l,u)=>`Your complaint: ${t}. Place: ${l}. Urgency: ${u}. Is this correct?`,ta:(t,l,u)=>`உங்கள் புகார்: ${t}. இடம்: ${l}. முக்கியத்துவம்: ${u}. இது சரியா?`,hi:(t,l,u)=>`आपकी शिकायत: ${t}. स्थान: ${l}. प्राथमिकता: ${u}. क्या यह सही है?`};
const TTS_LANG={en:'en-IN',ta:'ta-IN',hi:'hi-IN'};

function freshApp(){return{tab:'file',counts:initCounts(),hist:buildHistory(),index:buildIndex(ROUTE_DEPTS),
 params:{alpha:0.6,delta:0.15,tau:0.75,q:0.8,m:[2,3,4,6],nmin:20},form:{lang:'en',src:'WhatsApp voice note',pin:'641021',mobile:'',text:'',sample:0},
 asr:null,stage:'idle',pending:null,complaints:[],sel:null,last:null,session:{voice:0,voiceClean:0,werSum:0,werN:0,filed:0},audit:[],useFixed:false,cont:null,fed:null,play:null}}
let App=freshApp();
const TESTS=buildTestSet();
const dep=id=>DEPTS.find(d=>d.id===id);
function log(agent,action,detail){App.audit.unshift({t:new Date().toLocaleTimeString(),agent,action,detail:detail||''});App.audit=App.audit.slice(0,80);if($('audit'))renderAudit()}
function renderAudit(){$('auditBody').innerHTML=App.audit.length?App.audit.slice(0,12).map(a=>`<div class="log"><span class="mono">${esc(a.t)}</span> <b>${esc(a.agent)}</b> ${esc(a.action)} <span class="muted">${esc(a.detail)}</span></div>`).join(''):'<div class="muted">No actions yet.</div>'}
function speak(text,lang){try{const u=new SpeechSynthesisUtterance(text);u.lang=TTS_LANG[lang]||'en-IN';speechSynthesis.cancel();speechSynthesis.speak(u);return true}catch(e){return false}}

// ---------------- Listener ----------------
function setForm(k,v){App.form[k]=v}
function loadSample(){const s=SAMPLES[+App.form.sample];App.form.lang=s.lang;App.form.text=s.text;App.asr={text:s.text,conf:s.conf,voice:true,simulated:true};App.stage='idle';App.pending=null;log('Listener','loaded simulated voice note',`${s.n} · confidence ${s.conf}`);render()}
function startMic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const st=$('micStatus');
 if(!SR){st.textContent='Voice capture is not available in this view (needs Chrome and microphone permission). Use a sample voice note, or open the downloaded file in Chrome.';return}
 try{const r=new SR();r.lang=TTS_LANG[App.form.lang];r.interimResults=false;r.maxAlternatives=1;st.textContent='Listening… speak your complaint';
  r.onresult=e=>{const a=e.results[0][0];App.form.text=a.transcript;App.asr={text:a.transcript,conf:a.confidence>0?a.confidence:null,voice:true,simulated:false};log('Listener','speech recognised (browser service)',`confidence ${a.confidence?a.confidence.toFixed(2):'n/a'}`);App.stage='idle';render()};
  r.onerror=e=>{st.textContent='Microphone error: '+e.error+'. Check permission, or use a sample voice note.'};r.onend=()=>{if(st.textContent.startsWith('Listening'))st.textContent='No speech heard. Try again.'};r.start()}catch(e){st.textContent='Could not start voice capture: '+e.message}}
function placeIn(text,pin){const info=PINS[String(pin).slice(0,3)];const list=info?WARDS[info.district]||[]:[];const n=norm(text);return list.find(w=>n.includes(norm(w)))||null}
function listen(){const f=App.form;const text=(f.text||'').trim();if(!text)return;const a=App.asr;const voice=!!(a&&a.voice);const edited=voice&&norm(a.text)!==norm(text);
 const conf=voice&&!edited?a.conf:null;
 App.pending={text,lang:f.lang,voice,edited,conf,asrText:voice?a.text:null,corrected:edited,loc:placeIn(text,f.pin),simulated:voice&&a.simulated};
 if(conf!==null&&conf<App.params.tau){App.stage='lowconf';log('Listener','blocked: low confidence',`c=${conf} < τ=${App.params.tau}`);render();return}
 if(!App.pending.loc){App.stage='needloc';log('Listener','location missing → one follow-up question');render();return}
 App.stage='readback';log('Listener','read-back prepared',`loc=${App.pending.loc}`);render()}
function addLoc(){const v=($('locin').value||'').trim();if(!v)return;App.pending.loc=v;App.pending.corrected=true;App.stage='readback';log('Listener','location added by citizen',v);render()}
function urgencyOf(t){return /fire|flood|accident|emergency|ambulance|collapse|trapped|தீ|ஆம்புலன்ஸ்|விபத்து|आग|एम्बुलेंस|दुर्घटना/i.test(t)?'high':'normal'}
function readbackText(){const p=App.pending;return READBACK[p.lang](p.text,p.loc,urgencyOf(p.text))}
function rejectReadback(){App.pending.corrected=true;App.pending.edited=true;App.stage='idle';log('Listener','citizen rejected read-back → edit and retry');render()}
async function sha(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return(fnv(s)>>>0).toString(16).padStart(8,'0').repeat(8)}}
async function confirmFile(){const p=App.pending,f=App.form;const info=PINS[String(f.pin).slice(0,3)]||null;
 const salt='demo-salt-'+(App.salt=App.salt||Math.random().toString(36).slice(2));const h=f.mobile?(await sha(salt+f.mobile)).slice(0,12):'(none)';
 if(p.voice){App.session.voice++;if(!p.corrected)App.session.voiceClean++;if(p.asrText){App.session.werSum+=wer(p.asrText,p.text);App.session.werN++}}
 const r=route(App.index,App.counts,p.text,{alpha:App.params.alpha,delta:App.params.delta});const id='SAH-'+(1001+App.session.filed++);
 const c={id,text:p.text,lang:p.lang,loc:p.loc,pin:f.pin,state:info?info.state:'unknown',district:info?info.district:'unknown',urgency:urgencyOf(p.text),src:f.src,hash:h,route:r,dept:null,deptName:'',office:'',filedAt:new Date().toLocaleTimeString(),sim:{day:0,status:'open'},msgs:[],draft:null,voice:p.voice};
 c.chat={ts:c.filedAt,src:f.src,h,intent:r.intent,u:c.urgency,loc:p.loc,payload:p.text};
 App.complaints.push(c);App.sel=id;App.last=c;
 log('Listener','complaint structured',`${id} · intent=${r.intent} · urgency=${c.urgency}`);
 if(r.human||!info){App.stage='human';log('Finder','handed to human operator',r.human?`margin ${r.margin.toFixed(2)} < δ ${App.params.delta}`:'state unknown')}
 else{assign(c,r.top.id,'auto')}
 App.stage=c.dept?'filed':'human';render()}
function assign(c,deptId,how){const d=dep(deptId);c.dept=deptId;c.deptName=d.name;c.office=`${d.name} Office, ${c.district}`;c.sim={day:0,status:'open'};
 c.msgs=[{day:0,text:MSG.filed[c.lang](c)}];log('Finder',(how==='auto'?'routed & filed':'operator assigned & filed'),`${c.id} → ${d.name} (${c.office})`);c.draft=null}
function operatorAssign(){const c=App.last;assign(c,$('opsel').value,'operator');App.stage='filed';render()}

// ---------------- Tracker ----------------
function plan(c){const d=dep(c.dept);const lt=App.useFixed?{source:'fixed',t:FIXED_LADDER.slice(0,4),legal:FIXED_LADDER[4],curve:[],tq:null}:learnedTimers(d,App.hist[d.id].train,{q:App.params.q,m:App.params.m,nmin:App.params.nmin});
 const ev=[{day:0,type:'filed'}];lt.t.forEach((t,i)=>ev.push({day:t,type:'esc',level:i+1,auth:`${d.name} – ${LEVELS[i]}`}));ev.push({day:lt.legal,type:'legal'});return{lt,ev,d}}
function cur(){return App.complaints.find(c=>c.id===App.sel)}
function selectC(id){App.sel=id;render()}
function setDay(v){const c=cur();if(!c||c.sim.status==='resolved')return;c.sim.day=+v;renderTrackBody()}
function stepDay(n){const c=cur();if(!c||c.sim.status!=='open')return;const{lt}=plan(c);c.sim.day=Math.min(lt.legal+10,c.sim.day+n);renderTrackBody()}
function nextEvent(){const c=cur();if(!c||c.sim.status!=='open')return;const{ev}=plan(c);const n=ev.find(e=>e.day>c.sim.day);if(n){c.sim.day=n.day;renderTrackBody()}}
function togglePlay(){if(App.play){clearInterval(App.play);App.play=null;renderTrackBody();return}const c=cur();if(!c)return;App.play=setInterval(()=>{const c=cur();if(!c||c.sim.status!=='open'){clearInterval(App.play);App.play=null;renderTrackBody();return}const{lt}=plan(c);if(c.sim.day>=lt.legal+10){clearInterval(App.play);App.play=null}else c.sim.day++;renderTrackBody()},250);renderTrackBody()}
function portalResolved(){const c=cur();if(!c||c.sim.status!=='open')return;c.sim.status='ask';c.msgs.push({day:c.sim.day,text:MSG.ask[c.lang](c),ask:true});log('Tracker','portal status → RESOLVED, asking citizen',c.id);renderTrackBody()}
function answer(yes){const c=cur();c.msgs.forEach(m=>{if(m.ask)m.ask=false;});
 if(yes){c.sim.status='resolved';c.msgs.push({day:c.sim.day,text:MSG.closed[c.lang]()});const d=dep(c.dept);const row=App.counts[d.intent]=App.counts[d.intent]||{};row[d.id]=(row[d.id]||0)+1;log('Messenger','citizen confirmed fix → closed',`${c.id}; +1 confirmed example for ${d.name} (learning data)`)}
 else{c.sim.status='open';c.msgs.push({day:c.sim.day,text:MSG.reopen[c.lang]()});log('Messenger','citizen said NO → reopened',c.id)}renderTrackBody()}
function toggleFixed(v){App.useFixed=v;Object.values(App.complaints).forEach(c=>{c.draft=null});renderTrackBody()}
const STAT_S1='ILLUSTRATIVE DEMO TEXT, not the actual law: a state Right to Public Services Act normally fixes a time limit for each notified service and allows a first appeal when the limit is missed.';
function makeDraft(c,ev){const d=dep(c.dept);const esc_=ev.filter(e=>e.type==='esc'&&e.day<=c.sim.day);const lines=[];
 lines.push({t:`The complainant filed complaint ${c.id} on day 0 regarding: "${c.text}" at ${c.loc}.`,cite:['T1']});
 esc_.forEach((e,i)=>lines.push({t:`The complaint was escalated on day ${e.day} to ${e.auth} (level ${e.level}).`,cite:['T'+(i+2)]}));
 lines.push({t:`The Citizen's Charter for ${d.name} sets a resolution time of ${d.charter} days; ${c.sim.day} days have elapsed.`,cite:['C1']});
 lines.push({t:`A delay beyond the notified time limit entitles the complainant to appeal under the applicable Right to Public Services provision.`,cite:['S1']});
 lines.push({t:`You are requested to resolve the matter within [period to be set by the reviewer].`,cite:['R1']});
 return lines.map((l,i)=>`${i+1}. ${l.t} [${l.cite.join(',')}]`).join('\n')}
function groundCheck(txt){const ls=txt.split('\n').filter(x=>x.trim());return{n:ls.length,bad:ls.filter(l=>!/\[[A-Z]\d+(,[A-Z]\d+)*\]/.test(l)).length}}
function reviewer(act){const c=cur();if(act==='approve'){c.draft.status='approved';log('Advocate','reviewer APPROVED notice',`${c.id} (sending is simulated: nothing is transmitted)`)}
 else if(act==='reject'){c.draft.status='rejected';log('Advocate','reviewer REJECTED notice',c.id)}else if(act==='edit'){c.draft.editing=true}else if(act==='save'){c.draft.text=$('dtx').value;c.draft.editing=false;c.draft.status='pending';log('Advocate','reviewer edited draft',c.id)}renderTrackBody()}
function kmSvg(lt,d,q){const W=560,H=230,L=40,R=10,T=14,B=30;const XM=Math.min(90,Math.max(20,Math.ceil(Math.max(d.charter*2.2,(lt.tq||0)*1.5,lt.t[0]*1.6)/5)*5));const X=t=>L+(W-L-R)*Math.min(t,XM)/XM,Y=s=>T+(H-T-B)*(1-s);
 let pts=`${X(0)},${Y(1)}`;let prev=1;lt.curve.forEach(p=>{if(p.t>XM)return;pts+=` ${X(p.t)},${Y(prev)} ${X(p.t)},${Y(p.S)}`;prev=p.S});pts+=` ${X(XM)},${Y(prev)}`;
 const t1=lt.t[0];let g='';const stp=XM<=30?5:10;for(let v=0;v<=XM;v+=stp){g+=`<line x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${H-B}" stroke="#e3e9f0"/><text x="${X(v)}" y="${H-B+14}" font-size="10" text-anchor="middle" fill="#667">${v}</text>`}
 for(let i=0;i<=4;i++){g+=`<text x="${L-5}" y="${Y(i/4)+3}" font-size="10" text-anchor="end" fill="#667">${(i/4).toFixed(2)}</text>`}
 return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Kaplan-Meier curve">${g}<polyline points="${pts}" fill="none" stroke="#1F3A5F" stroke-width="2"/>
 <line x1="${L}" x2="${W-R}" y1="${Y(1-q)}" y2="${Y(1-q)}" stroke="#E0A800" stroke-dasharray="4 3"/><text x="${W-R}" y="${Y(1-q)-4}" font-size="10" text-anchor="end" fill="#8a6d00">S(t) = 1 − q = ${(1-q).toFixed(2)}</text>
 <line x1="${X(d.charter)}" x2="${X(d.charter)}" y1="${T}" y2="${H-B}" stroke="#c0392b" stroke-dasharray="5 3"/><text x="${X(d.charter)+3}" y="${T+10}" font-size="10" fill="#c0392b">Charter ${d.charter}d</text>
 <line x1="${X(Math.min(7,XM))}" x2="${X(Math.min(7,XM))}" y1="${T}" y2="${H-B}" stroke="#999" stroke-dasharray="2 3"/><text x="${X(Math.min(7,XM))+3}" y="${T+22}" font-size="10" fill="#777">Phase I: 7d</text>
 <line x1="${X(t1)}" x2="${X(t1)}" y1="${T}" y2="${H-B}" stroke="#2A7F8E" stroke-width="2"/><text x="${X(t1)+3}" y="${T+34}" font-size="10" fill="#2A7F8E" font-weight="700">Learned t₁ = ${t1}d</text>
 <text x="${(L+W)/2}" y="${H-3}" font-size="10" text-anchor="middle" fill="#667">days since filing</text></svg>`}

// ---------------- Views ----------------
function bar(v,cls){return `<div class="bar"><i class="${cls||''}" style="width:${Math.max(0,Math.min(1,v))*100}%"></i></div>`}
function finderTable(r){return `<table><tr><th>Department</th><th>Similarity (rescaled)</th><th>P(d | intent)</th><th>Score</th></tr>${r.rows.slice(0,5).map((x,i)=>`<tr class="${i===0?'top':''}"><td>${esc(dep(x.id).name)}</td><td>${bar(x.cosN)}<span class="mono">${x.cosN.toFixed(2)}</span> <span class="muted">(raw ${x.cos.toFixed(2)})</span></td><td class="mono">${x.prior.toFixed(3)}</td><td class="mono">${x.score.toFixed(3)}</td></tr>`).join('')}</table>
 <p class="muted">Intent detected: <b>${esc(r.intent)}</b> · margin between top two = <b>${r.margin.toFixed(3)}</b> (δ = ${App.params.delta}) · best raw similarity ${r.maxCos.toFixed(3)}</p>`}
function viewFile(){const f=App.form,p=App.pending,s=App.stage;
 let out=`<div class="card"><h3>1 · Listener: voice or text complaint</h3><div class="row">
 <label>Language<select onchange="setForm('lang',this.value)">${Object.entries(LANGS).map(([k,v])=>`<option value="${k}" ${f.lang===k?'selected':''}>${v}</option>`).join('')}</select></label>
 <label>Channel<select onchange="setForm('src',this.value)">${['WhatsApp voice note','SMS','Web form'].map(x=>`<option ${f.src===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>PIN code<input value="${esc(f.pin)}" oninput="setForm('pin',this.value)" size="8"></label>
 <label>Mobile (optional, stored only as salted hash)<input value="${esc(f.mobile)}" oninput="setForm('mobile',this.value)" size="12" inputmode="numeric"></label></div>
 <div class="row"><button class="btn" onclick="startMic()">🎤 Record voice note</button><span class="muted">or</span>
 <select onchange="setForm('sample',this.value)">${SAMPLES.map((x,i)=>`<option value="${i}" ${+f.sample===i?'selected':''}>${esc(x.n)}</option>`).join('')}</select><button class="btn ghost" onclick="loadSample()">Load simulated voice note</button></div>
 <div class="muted" id="micStatus">Real voice needs Chrome + microphone permission (works in the downloaded file). Simulated notes carry a fixed ASR confidence.</div>
 <label class="full">Transcript (the citizen can correct it)<textarea rows="3" oninput="setForm('text',this.value)">${esc(f.text)}</textarea></label>
 ${App.asr&&App.asr.voice?`<div class="chip">ASR confidence c = ${App.asr.conf===null?'n/a':App.asr.conf.toFixed(2)} · τ = ${App.params.tau}${App.asr.simulated?' · simulated':''}</div>`:''}
 <div class="row"><button class="btn" onclick="listen()">Run Listener →</button><span class="muted">Rule: file only if c ≥ τ and a location is known</span></div></div>`;
 if(s==='lowconf')out+=`<div class="card warn"><h3>Not filed: speech confidence too low</h3><p>c = ${p.conf} is below τ = ${App.params.tau}. The Listener asks the citizen to repeat instead of guessing.</p><button class="btn ghost" onclick="speak('Sorry, I could not understand. Please record again.','${p.lang}')">🔊 Play the spoken request</button></div>`;
 if(s==='needloc')out+=`<div class="card warn"><h3>One follow-up question</h3><p>No known place name was found in the complaint (district: ${esc((PINS[String(f.pin).slice(0,3)]||{}).district||'unknown')}). The Listener asks exactly one question: <b>“Which village or ward?”</b></p><div class="row"><input id="locin" placeholder="e.g. Peelamedu" size="20"><button class="btn" onclick="addLoc()">Add location</button></div></div>`;
 if(s==='readback'){const rb=readbackText();out+=`<div class="card"><h3>2 · Read-back and confirmation</h3><p class="quote">${esc(rb)}</p><div class="row"><button class="btn ghost" onclick="speak(readbackText(),'${p.lang}')">🔊 Play read-back</button><button class="btn" onclick="confirmFile()">✔ Yes, correct: file it</button><button class="btn ghost" onclick="rejectReadback()">✎ No, I will correct it</button></div><div class="muted">Raw audio is never stored; only the confirmed text is kept.</div></div>`}
 if((s==='filed'||s==='human')&&App.last){const c=App.last,r=c.route;
  out+=`<div class="card"><h3>3 · Structured complaint ĉ (Eq. 1)</h3><pre>${esc(JSON.stringify(c.chat,null,1))}</pre></div>`;
  out+=`<div class="card"><h3>4 · Finder: hierarchical routing</h3><p><b>State</b> from PIN ${esc(c.pin)} → <b>${esc(c.state)}</b>, district <b>${esc(c.district)}</b>.</p>${finderTable(r)}`;
  if(s==='human')out+=`<div class="warn box"><b>Not sure enough to auto-route</b> (${r.maxCos<0.04?'very low similarity':'margin below δ'}). The complaint goes to the district help-desk operator, who picks the department:<div class="row"><select id="opsel">${ROUTE_DEPTS.map(d=>`<option value="${d.id}" ${d.id===r.top.id?'selected':''}>${esc(d.name)}</option>`).join('')}</select><button class="btn" onclick="operatorAssign()">Assign & file</button></div></div>`;
  else out+=`<div class="ok box">Auto-routed to <b>${esc(c.deptName)}</b>, office: <b>${esc(c.office)}</b>. Complaint <b>${esc(c.id)}</b> filed. <button class="btn" onclick="setTab('track')">Track & escalate →</button></div>`;
  out+=`</div>`}
 out+=`<div class="card"><h3>Knowledge graph (versioned nodes)</h3><div class="muted">State → District → Department → Office → escalation chain. When a department is renamed or merged the old node is kept and linked.</div><table><tr><th>Department</th><th>Version</th><th>Charter</th><th>Escalation chain</th></tr>${ROUTE_DEPTS.map(d=>`<tr><td>${esc(d.name)}${d.former?` <span class="muted">(formerly “${esc(d.former)}” v1 · linked)</span>`:''}</td><td>v${d.ver||1}</td><td>${d.charter} d</td><td class="muted">Section Officer → ${LEVELS.join(' → ')}</td></tr>`).join('')}</table><button class="btn ghost" onclick="mergeDemo()">Simulate: rename “Water Supply” → “Water & Drainage Board” (v2)</button></div>`;
 return out}
function mergeDemo(){const d=dep('water');if(d.former)return;d.former=d.name;d.name='Water & Drainage Board';d.ver=2;log('Knowledge graph','node renamed (v1 → v2), old node linked not deleted','water');render()}
function viewTrack(){if(!App.complaints.length)return `<div class="card"><h3>No complaints yet</h3><p>File one in the first tab, or create a demo complaint.</p><button class="btn" onclick="demoComplaint()">Create demo complaint (water, Peelamedu)</button></div>`;
 return `<div class="card"><div class="row"><label>Complaint<select onchange="selectC(this.value)">${App.complaints.filter(c=>c.dept).map(c=>`<option value="${c.id}" ${c.id===App.sel?'selected':''}>${c.id} · ${esc(c.deptName)} · ${esc(c.loc)}</option>`).join('')}</select></label>
 <label class="chk"><input type="checkbox" ${App.useFixed?'checked':''} onchange="toggleFixed(this.checked)"> Use Phase I fixed ladder (7/15/30/60/90) for comparison</label></div></div><div id="trackBody"></div>`}
async function demoComplaint(){App.form.text='No water coming in the tap since three days near Peelamedu';App.asr=null;App.form.sample=0;listen();if(App.stage==='readback')await confirmFile();if(App.stage==='human'){assign(App.last,'water','operator');App.stage='filed'}render()}
function renderTrackBody(){const el=$('trackBody');if(!el)return;const c=cur();if(!c||!c.dept){el.innerHTML='';return}const{lt,ev,d}=plan(c);const day=c.sim.day,max=lt.legal+10;
 const evs=ev.filter(e=>e.day<=day);const msgs=[...c.msgs.filter(m=>!m.esc)];
 // messenger feed derived from events + stored msgs
 const feed=[];feed.push(c.msgs[0]);ev.forEach(e=>{if(e.day<=day){if(e.type==='esc')feed.push({day:e.day,text:MSG.esc[c.lang](c,e.auth,e.level)});if(e.type==='legal'&&c.sim.status!=='resolved')feed.push({day:e.day,text:MSG.legal[c.lang]()})}});c.msgs.slice(1).forEach(m=>feed.push(m));feed.sort((a,b)=>a.day-b.day);
 const lvl=evs.filter(e=>e.type==='esc').length;const legal=day>=lt.legal&&c.sim.status!=='resolved';
 let h=`<div class="grid2"><div class="card"><h3>Tracker: learned timers (Eq. 5–6)</h3>${lt.source==='learned'?kmSvg(lt,d,App.params.q):'<p class="muted">Using the fixed ladder: no survival curve.</p>'}
 <p class="muted">${lt.source==='learned'?`Kaplan–Meier fitted on ${App.hist[d.id].train.length} synthetic past complaints for <b>${esc(d.name)}</b> (censored cases kept). First escalation t₁ = min(Charter ${d.charter} d, day when ${(App.params.q*100).toFixed(0)}% are normally resolved${lt.tq===null?' – never reached':' = '+lt.tq.toFixed(1)}) = <b>${lt.t[0]} d</b>${lt.capped?' (capped by the Charter)':''}.`:'Phase I: the same 7-day first step for every department.'}</p>
 <table><tr><th>Level</th><th>Escalate on day</th><th>Authority</th></tr><tr><td>0</td><td>0</td><td>${esc(d.name)} – Section Officer (filed)</td></tr>${lt.t.map((t,i)=>`<tr class="${day>=t?'top':''}"><td>${i+1}</td><td>${t}</td><td>${esc(d.name)} – ${LEVELS[i]}</td></tr>`).join('')}<tr class="${day>=lt.legal?'top':''}"><td>Legal</td><td>${lt.legal}</td><td>Advocate drafts notice → human review</td></tr></table></div>
 <div class="card"><h3>Simulated time · day <b>${day}</b> · level <b>${lvl}</b> · status <b>${c.sim.status==='resolved'?'CLOSED (citizen confirmed)':c.sim.status==='ask'?'asking citizen':'open'}</b></h3>
 <input type="range" min="0" max="${max}" value="${day}" onchange="setDay(this.value)" ${c.sim.status!=='open'?'disabled':''} class="full">
 <div class="row"><button class="btn ghost" onclick="stepDay(1)">+1 day</button><button class="btn ghost" onclick="stepDay(7)">+7 days</button><button class="btn ghost" onclick="nextEvent()">Next event ⏭</button><button class="btn ghost" onclick="togglePlay()">${App.play?'⏸ Pause':'▶ Play'}</button></div>
 <div class="row"><button class="btn" onclick="portalResolved()" ${c.sim.status!=='open'?'disabled':''}>Portal marks it “RESOLVED”</button></div>
 <h4>Messenger (${LANGS[c.lang]})</h4><div class="feed">${feed.map(m=>`<div class="bubble"><span class="muted">day ${m.day}</span><br>${esc(m.text)}${m.ask&&c.sim.status==='ask'?`<div class="row"><button class="btn" onclick="answer(true)">Yes, fixed</button><button class="btn ghost" onclick="answer(false)">No, still broken</button></div>`:''}</div>`).join('')}</div></div></div>`;
 if(legal){if(!c.draft)c.draft={text:makeDraft(c,ev),status:'pending',editing:false};const g=groundCheck(c.draft.text);
  h+=`<div class="card"><h3>Advocate: retrieval-grounded legal notice (human review required)</h3><div class="grid2"><div><h4>Retrieved evidence</h4><div class="evid"><b>S1</b> ${esc(STAT_S1)}</div><div class="evid"><b>C1</b> Citizen's Charter (illustrative): ${esc(d.name)} complaints to be resolved within ${d.charter} days.</div><div class="evid"><b>T1…</b> The complaint's own timeline: filing and each escalation above.</div></div>
  <div><h4>Draft ${c.draft.status==='approved'?'<span class="tag ok">approved by reviewer</span>':c.draft.status==='rejected'?'<span class="tag bad">rejected</span>':'<span class="tag">awaiting reviewer</span>'}</h4>${c.draft.editing?`<textarea id="dtx" rows="9" class="full">${esc(c.draft.text)}</textarea><button class="btn" onclick="reviewer('save')">Save edit</button>`:`<pre class="draft">${esc(c.draft.text)}</pre>`}
  <div class="muted">Grounding check: ${g.n-g.bad} of ${g.n} sentences cite retrieved evidence${g.bad?` · <b style="color:#c0392b">${g.bad} unsupported</b>`:''}.</div>
  <div class="row"><button class="btn" ${g.bad||c.draft.status==='approved'?'disabled':''} onclick="reviewer('approve')">Approve & send (simulated)</button><button class="btn ghost" onclick="reviewer('edit')">Edit</button><button class="btn ghost" onclick="reviewer('reject')">Reject</button></div>
  <div class="muted">Nothing is sent without approval. In this demo “send” only writes to the audit log.</div></div></div></div>`}
 el.innerHTML=h}
function runCont(){const b=+($('cbuf')||{}).value,l=+($('clam')||{}).value;App.cont=runContinual(11,{buf:isNaN(b)?6:b,lambda:isNaN(l)?1:l});App.contP={buf:isNaN(b)?6:b,lambda:isNaN(l)?1:l};log('Learner','continual-learning demo run','replay='+App.contP.buf+'/dept, λ='+App.contP.lambda);render()}
function runFed(){App.fed=runFederated(21);log('Learner','federated demo run','3 simulated states, 5 rounds');render()}
function viewLearn(){const c=App.cont,f=App.fed;const row=(n,v,cls)=>`<tr><td>${n}</td><td>${bar(v,cls)}</td><td class="mono">${pct(v)}</td></tr>`;
 let h=`<div class="card"><h3>Continual learning with experience replay (Eq. 4)</h3><p>A new department (<b>Fire & Disaster Relief</b>) appears. The classifier is fine-tuned on the new examples only (“naive”), or on new examples plus a small replay buffer of old ones. Trained on synthetic keyword-template text, tested on separate hand-written phrases.</p>
 <div class="row"><label>Replay examples per department<input id="cbuf" type="number" min="0" max="12" value="${App.contP?App.contP.buf:6}" style="width:70px"></label><label>Replay weight λ<input id="clam" type="number" min="0" max="3" step="0.5" value="${App.contP?App.contP.lambda:1}" style="width:70px"></label><button class="btn" onclick="runCont()">Run continual-learning demo</button></div>`;
 if(c)h+=`<table><tr><th colspan="3">Accuracy on the ${c.nOld} old-department test phrases</th></tr>${row('Before the new department',c.before.old)}${row('After naive fine-tuning (no replay)',c.naive.old,'bad')}${row('After fine-tuning with replay',c.replay.old,'good')}</table>
 <table><tr><th colspan="3">Accuracy on the ${c.nNew} new-department test phrases</th></tr>${row('Before',c.before.neu)}${row('Naive fine-tuning',c.naive.neu)}${row('With replay',c.replay.neu,'good')}</table><p class="muted">Replay buffer size: ${c.bufferSize} examples. Without replay the model forgets the old departments (catastrophic forgetting).</p>`;
 h+=`</div><div class="card"><h3>Federated averaging across states (Eq. 7)</h3><p>Three simulated states with different data sizes and department mixes train locally; only model weights are averaged (weighted by n<sub>s</sub>). Compared with a model trained on one state alone and with pooled data (which privacy rules would not allow).</p><button class="btn" onclick="runFed()">Run federated demo</button>`;
 if(f)h+=`<table><tr><th colspan="3">Accuracy on ${f.nTest} test phrases (8 departments)</th></tr>${['A','B','C'].map((n,i)=>row(`State ${n} alone (n = ${f.sizes[i]})`,f.single[i])).join('')}${row('Average single-state model',f.singleMean)}${row('Federated (weights only)',f.federated,'good')}${row('Pooled data (upper bound)',f.pooled)}</table>`;
 return h+`</div><div class="note">Stand-in: the paper fine-tunes a MuRIL encoder; this demo uses a small softmax classifier over hashed character n-grams so it runs in the browser. The behaviour (forgetting, replay, FedAvg) is the same idea. Data are synthetic.</div>`}
function resultsText(R,T){const L=[];L.push('SAHAYAK 2.0 MVP self-test (SYNTHETIC data; prototype, not a field result)');L.push(`Parameters: alpha=${App.params.alpha}, delta=${App.params.delta}, tau=${App.params.tau}, q=${App.params.q}, m=${App.params.m.join(',')}`);
 L.push(`Routing test set: ${R.n} phrases (hand-written, EN/TA/HI), human-operator share ${pct(R.humanShare)}, accuracy on auto-routed ${pct(R.autoAcc)}`);
 ['all','clean','context','noisy'].forEach(v=>{const b=R.by[v];L.push(`  ${v} (n=${b.n}): keyword top-1 ${pct(b.keyword.top1)} | similarity-only top-1 ${pct(b.cosOnly.top1)}, top-3 ${pct(b.cosOnly.top3)} | similarity+prior top-1 ${pct(b.full.top1)}, top-3 ${pct(b.full.top3)}`)});
 L.push(`Timers (synthetic held-out history): needless first escalations fixed ${pct(T.needlessFixed)} vs learned ${pct(T.needlessLearned)}; charter-breaching complaints escalated only after the breach: fixed ${pct(T.lateFixed)} vs learned ${pct(T.lateLearned)}`);
 if(App.cont)L.push(`Continual learning: old-dept accuracy before ${pct(App.cont.before.old)}, naive ${pct(App.cont.naive.old)}, replay ${pct(App.cont.replay.old)}; new-dept: naive ${pct(App.cont.naive.neu)}, replay ${pct(App.cont.replay.neu)}`);
 if(App.fed)L.push(`Federated: single-state mean ${pct(App.fed.singleMean)}, federated ${pct(App.fed.federated)}, pooled ${pct(App.fed.pooled)}`);
 const s=App.session;L.push(`Live voice use this session: ${s.voice} voice complaints, ${s.voice?pct(s.voiceClean/s.voice):'n/a'} filed with no correction, mean WER ${s.werN?pct(s.werSum/s.werN):'n/a'}`);return L.join('\n')}
function calcWer(){const r=$('wr').value,h=$('wh').value;$('wout').textContent=r.trim()?'WER = '+pct(wer(r,h)):''}
function viewEval(){const R=evalRouting(App.index,App.counts,TESTS,{alpha:App.params.alpha,delta:App.params.delta});const T=evalTimers(ROUTE_DEPTS,App.hist,{q:App.params.q,m:App.params.m,nmin:App.params.nmin});const s=App.session;
 const vr=(v,n)=>{const b=R.by[v];return `<tr><td>${n} <span class="muted">(n=${b.n})</span></td><td>${pct(b.keyword.top1)}</td><td>${pct(b.cosOnly.top1)}</td><td>${pct(b.cosOnly.top3)}</td><td><b>${pct(b.full.top1)}</b></td><td><b>${pct(b.full.top3)}</b></td></tr>`};
 return `<div class="note"><b>Read this before quoting numbers.</b> These are prototype self-test numbers on <b>synthetic or hand-written data</b> inside this demo. They show the method works end to end. They are <b>not</b> the field-pilot or real-portal results the paper describes. Report them as “prototype self-test”.</div>
 <div class="card"><h3>Routing (H2): accuracy on ${R.n} test phrases</h3><table><tr><th>Test variant</th><th>Keyword router<br>top-1</th><th>Similarity only<br>top-1</th><th>Similarity only<br>top-3</th><th>Full Finder<br>top-1</th><th>Full Finder<br>top-3</th></tr>${vr('all','All')}${vr('clean','Clean phrases')}${vr('context','With extra words and place')}${vr('noisy','Speech-error-like typos')}</table>
 <p class="muted">Sent to the human operator (margin &lt; δ): <b>${pct(R.humanShare)}</b> · accuracy on auto-routed complaints: <b>${pct(R.autoAcc)}</b>. The test phrases share some vocabulary with the router's keyword lists, so clean-text scores are high for every method; the typo rows show the difference character n-grams make.</p></div>
 <div class="card"><h3>Escalation timers (H3): fixed ladder vs learned timers</h3><table><tr><th>Department</th><th>Charter</th><th>1st escalation<br>fixed → learned</th><th>Needless escalation<br>fixed → learned</th></tr>${T.rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.charter} d</td><td>${r.fixed} → <b>${r.learned}</b> d${r.capped?' (cap)':''}</td><td>${pct(r.needlessFixed)} → <b>${pct(r.needlessLearned)}</b></td></tr>`).join('')}<tr class="top"><td colspan="3"><b>Average</b></td><td><b>${pct(T.needlessFixed)} → ${pct(T.needlessLearned)}</b></td></tr></table>
 <p class="muted">“Needless escalation” = a complaint was escalated although it was resolved within its Charter time anyway. Held-out 30% of a synthetic resolution history (censored cases used when fitting). Charter-breaching complaints first escalated only <i>after</i> the breach: fixed ladder ${pct(T.lateFixed)} of departments vs learned ${pct(T.lateLearned)} (the Charter cap).</p></div>
 <div class="card"><h3>Voice (H1): measured from your own use of this demo</h3><p>Voice complaints filed: <b>${s.voice}</b> · filed with no correction: <b>${s.voice?pct(s.voiceClean/s.voice):'n/a'}</b> · mean word error rate between the recogniser's text and the citizen-confirmed text: <b>${s.werN?pct(s.werSum/s.werN):'n/a'}</b></p><p class="muted">Simulated notes count too, so for a real figure record real voice notes in Chrome (the browser's speech service, not IndicWhisper) and say so.</p>
 <div class="row"><label>Reference text<input id="wr" size="30" value="no water coming in the tap"></label><label>Recogniser output<input id="wh" size="30" value="no water coming in the tab"></label><button class="btn ghost" onclick="calcWer()">Compute WER</button><b id="wout"></b></div></div>
 <div class="card"><h3>Results snapshot (copy into your notes)</h3><textarea rows="12" class="full mono" readonly onclick="this.select()">${esc(resultsText(R,T))}</textarea><div class="muted">Includes the continual-learning and federated numbers once you have run them in the Learner tab.</div></div>`}
function viewAbout(){return `<div class="card"><h3>What is real and what is a stand-in</h3><table><tr><th>Paper component</th><th>In this MVP</th><th>Production version</th></tr>
 <tr><td>Speech recognition</td><td>Browser Web Speech API (Chrome) or simulated notes with fixed confidence</td><td>IndicWhisper on a GPU server</td></tr>
 <tr><td>Read-back</td><td>Browser text-to-speech</td><td>Indian-language TTS engine</td></tr>
 <tr><td>Department similarity</td><td>TF-IDF over character 3-grams</td><td>MuRIL encoder embeddings</td></tr>
 <tr><td>Prior P(d | intent)</td><td>Counts with add-one smoothing (real formula)</td><td>Counts from confirmed resolutions</td></tr>
 <tr><td>Knowledge graph</td><td>In-memory table, versioned names</td><td>Neo4j</td></tr>
 <tr><td>Learned timers</td><td>Real Kaplan–Meier code on <b>synthetic</b> resolution history</td><td>Same maths on real portal history (lifelines)</td></tr>
 <tr><td>Portal</td><td>Simulated clock and “resolved” button</td><td>Daily status polling with rate limits</td></tr>
 <tr><td>Legal drafting</td><td>Template built only from retrieved snippets (illustrative text) + human review</td><td>Retrieval-augmented language model over real statutes and Charters</td></tr>
 <tr><td>Continual / federated learning</td><td>Softmax classifier trained in the browser</td><td>Fine-tuning MuRIL; federated framework across states</td></tr>
 <tr><td>Channels</td><td>Web page</td><td>WhatsApp Business API, SMS, web form</td></tr></table></div>
 <div class="card"><h3>How to present it honestly</h3><ul><li>Call this an <b>MVP / working prototype</b> that demonstrates every feature of the design.</li><li>Quote its numbers only as <b>prototype self-test on synthetic data</b>.</li><li>Department names, Charter days and legal text here are illustrative, not official.</li><li>Real results need real data and a real pilot; the paper's pilot claims should match what you actually ran.</li></ul></div>`}
function settingsHtml(){const p=App.params;const sl=(k,l,min,max,st)=>`<label>${l} = <b>${p[k]}</b><input type="range" min="${min}" max="${max}" step="${st}" value="${p[k]}" oninput="App.params.${k}=+this.value;this.parentNode.querySelector('b').textContent=this.value" onchange="setParams()"></label>`;
 return sl('alpha','α (meaning vs history)',0,1,0.05)+sl('delta','δ (human-handoff margin)',0,0.6,0.05)+sl('tau','τ (min. speech confidence)',0.3,0.95,0.05)+sl('q','q (escalate when slower than this share)',0.5,0.95,0.05)}
function setParams(){if(App.tab==='eval'||App.tab==='track')render()}
const VIEWS={file:viewFile,track:viewTrack,learn:viewLearn,eval:viewEval,about:viewAbout};
const TABS=[['file','1 · File complaint'],['track','2 · Track & escalate'],['learn','3 · Learner'],['eval','4 · Results'],['about','5 · About']];
function setTab(t){App.tab=t;render()}
function render(){$('nav').innerHTML=TABS.map(([k,v])=>`<button class="tab ${App.tab===k?'on':''}" onclick="setTab('${k}')">${v}</button>`).join('');$('view').innerHTML=VIEWS[App.tab]();if(!$('setbody').children.length||App.tab==='eval')$('setbody').innerHTML=settingsHtml();if(App.tab==='track')renderTrackBody();renderAudit()}
function resetApp(){if(App.play)clearInterval(App.play);DEPTS.forEach(d=>{if(d.former){d.name=d.former;d.former=null;d.ver=1}});App=freshApp();render()}
window.addEventListener('DOMContentLoaded',()=>{render()});
