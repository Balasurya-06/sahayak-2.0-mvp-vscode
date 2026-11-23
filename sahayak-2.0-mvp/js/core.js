// ===================== SAHAYAK 2.0 MVP : core logic (no DOM) =====================
const RNGf=seed=>{let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const gauss=r=>{let u=0,v=0;while(!u)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const shuffle=(r,a)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=s=>String(s).toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const gramsOf=(s,n=3)=>{const t=' '+norm(s)+' ';const m=new Map();for(let i=0;i<=t.length-n;i++){const g=t.slice(i,i+n);m.set(g,(m.get(g)||0)+1)}return m};

// ---------- Knowledge: departments (illustrative names, charter days and keyword lists) ----------
const DEPTS=[
{id:'water',name:'Water Supply',intent:'utility',charter:7,median:4,kw:{
 en:['water','supply','tap','pipe','pipeline','leak','leakage','drinking','borewell','tank','contaminated'],
 ta:['தண்ணீர்','குடிநீர்','குழாய்','குழாயில்','கசிவு','போர்வெல்','தொட்டி'],
 hi:['पानी','जल','नल','पाइप','पाइपलाइन','रिसाव','टंकी']}},
{id:'electricity',name:'Electricity',intent:'utility',charter:5,median:3,kw:{
 en:['electricity','power','current','light','streetlight','transformer','voltage','meter','outage','bill','wire','pole'],
 ta:['மின்சாரம்','மின்தடை','மின்கம்பம்','மின்மாற்றி','விளக்கு','மீட்டர்','கட்டணம்'],
 hi:['बिजली','करंट','बत्ती','ट्रांसफार्मर','मीटर','कटौती','तार','खंभा']}},
{id:'roads',name:'Roads & Bridges',intent:'civic',charter:15,median:12,kw:{
 en:['road','pothole','potholes','damaged','bridge','footpath','speed','breaker','highway','repair','asphalt'],
 ta:['சாலை','குழி','சாலையில்','பள்ளம்','பாலம்','நடைபாதை','நெடுஞ்சாலை','சேதம்'],
 hi:['सड़क','गड्ढा','गड्ढे','पुल','फुटपाथ','हाईवे','मरम्मत']}},
{id:'sanitation',name:'Sanitation & Waste',intent:'civic',charter:7,median:5,kw:{
 en:['garbage','waste','trash','drain','drainage','sewage','overflow','dustbin','cleaning','mosquito','sanitation','toilet'],
 ta:['குப்பை','கழிவு','சாக்கடை','கழிவுநீர்','வடிகால்','தூய்மை','கொசு','கழிப்பறை'],
 hi:['कचरा','कूड़ा','नाली','सीवर','सफाई','मच्छर','शौचालय','गंदगी']}},
{id:'revenue',name:'Revenue & Land Records',intent:'documents',charter:30,median:22,kw:{
 en:['land','record','patta','survey','mutation','certificate','income','revenue','village','officer','registration','boundary','encroachment'],
 ta:['பட்டா','நிலம்','சிட்டா','அடங்கல்','சான்றிதழ்','வருவாய்','கிராம','பதிவு','எல்லை','ஆக்கிரமிப்பு'],
 hi:['जमीन','पट्टा','खसरा','खतौनी','नामांतरण','प्रमाणपत्र','राजस्व','पटवारी','रजिस्ट्री','सीमा','कब्जा']}},
{id:'pension',name:'Social Welfare & Pension',intent:'welfare',charter:30,median:18,kw:{
 en:['pension','old','age','widow','disabled','disability','welfare','allowance','ration','card','benefit','scheme'],
 ta:['ஓய்வூதியம்','முதியோர்','விதவை','மாற்றுத்திறனாளி','நலத்திட்டம்','ரேஷன்','அட்டை'],
 hi:['पेंशन','वृद्धावस्था','विधवा','विकलांग','कल्याण','भत्ता','राशन','कार्ड','योजना']}},
{id:'education',name:'Education & Scholarship',intent:'welfare',charter:30,median:25,kw:{
 en:['scholarship','student','school','college','fees','stipend','admission','education','textbook','semester'],
 ta:['கல்வி','உதவித்தொகை','மாணவர்','பள்ளி','கல்லூரி','கட்டணம்','சேர்க்கை'],
 hi:['छात्रवृत्ति','विद्यार्थी','स्कूल','कॉलेज','फीस','प्रवेश','शिक्षा']}},
{id:'health',name:'Public Health',intent:'welfare',charter:10,median:6,kw:{
 en:['hospital','doctor','medicine','clinic','ambulance','health','nurse','treatment','dispensary','vaccine','vaccination'],
 ta:['மருத்துவமனை','மருத்துவர்','மருந்து','ஆம்புலன்ஸ்','சுகாதார','செவிலியர்','சிகிச்சை','தடுப்பூசி'],
 hi:['अस्पताल','डॉक्टर','दवा','एम्बुलेंस','स्वास्थ्य','नर्स','इलाज','टीका']}},
{id:'fire',name:'Fire & Disaster Relief (new)',intent:'disaster',charter:3,median:2,isNew:true,kw:{
 en:['fire','accident','rescue','flood','disaster','emergency','relief','cyclone','collapse'],
 ta:['தீ','விபத்து','மீட்பு','வெள்ளம்','பேரிடர்','நிவாரணம்','புயல்'],
 hi:['आग','दुर्घटना','बचाव','बाढ़','आपदा','राहत','तूफान']}}];
const ROUTE_DEPTS=DEPTS.filter(d=>!d.isNew);
const docOf=d=>[...d.kw.en,...d.kw.ta,...d.kw.hi].join(' ');

// Free-text phrases used ONLY for testing (different wording from the keyword lists)
const PHRASES={
water:{en:['No water coming in the tap since three days','Our street pipe is leaking and the road is wet','Drinking water supply is dirty and smells bad','The overhead tank in our colony never gets filled','Water lorry has not come, borewell is dry'],ta:['மூன்று நாட்களாக குழாயில் தண்ணீர் வரவில்லை','குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது'],hi:['तीन दिन से नल में पानी नहीं आ रहा','पाइपलाइन फट गई है और पानी बह रहा है']},
electricity:{en:['Power cut every evening for a week','Street light near our house is not working','The transformer is making sparks, please repair','Electricity bill is wrong, meter reading is too high','Electric pole is leaning and wires are hanging low'],ta:['ஒரு வாரமாக மின்தடை ஏற்படுகிறது','தெரு விளக்கு எரியவில்லை'],hi:['एक हफ्ते से बिजली नहीं आ रही','ट्रांसफार्मर में चिंगारी निकल रही है']},
roads:{en:['Big pothole on the main road causing accidents','Road is completely damaged after the rain','Footpath is broken and unsafe for walking','The bridge near the market has cracks','Please relay the road, it has not been repaired for years'],ta:['சாலையில் பெரிய குழி விழுந்துள்ளது','மழைக்குப் பிறகு சாலை சேதமடைந்துவிட்டது'],hi:['मुख्य सड़क पर बड़ा गड्ढा है','बारिश के बाद सड़क खराब हो गई है']},
sanitation:{en:['Garbage has not been collected for ten days','Drain is overflowing and mosquitoes are breeding','Dustbin is full and the waste is spread on the street','Public toilet is dirty and not cleaned','Sewage water is flowing onto the road'],ta:['குப்பை பல நாட்களாக அள்ளப்படவில்லை','சாக்கடை நிரம்பி வழிகிறது கொசு தொல்லை'],hi:['दस दिन से कचरा नहीं उठाया गया','नाली भरकर बह रही है और मच्छर हो गए हैं']},
revenue:{en:['I applied for patta transfer but no action for months','Need community certificate, village officer is not signing','Land survey record has wrong name and area','Someone has encroached our field boundary','Income certificate application is pending'],ta:['பட்டா மாற்றத்திற்கு மனு செய்தும் நடவடிக்கை இல்லை','வருமான சான்றிதழ் இன்னும் வழங்கப்படவில்லை'],hi:['जमीन के रिकॉर्ड में नाम गलत है','आय प्रमाणपत्र के लिए आवेदन लंबित है']},
pension:{en:['My old age pension has not come for four months','Widow pension stopped without any reason','Ration card correction is pending','Disability allowance not credited to the bank','Welfare scheme money was not received'],ta:['முதியோர் ஓய்வூதியம் நான்கு மாதங்களாக வரவில்லை','ரேஷன் அட்டை திருத்தம் நிலுவையில் உள்ளது'],hi:['वृद्धावस्था पेंशन चार महीने से नहीं आई','विधवा पेंशन बिना कारण बंद हो गई']},
education:{en:['Scholarship amount for my college is still not received','School is asking fees even though it is free for us','My son\'s admission was rejected unfairly','Free textbooks have not reached the school','Student stipend is pending for two semesters'],ta:['கல்லூரி உதவித்தொகை இன்னும் வரவில்லை','பள்ளியில் சேர்க்கை மறுக்கப்படுகிறது'],hi:['छात्रवृत्ति की राशि अभी तक नहीं मिली','स्कूल में प्रवेश नहीं दिया जा रहा']},
health:{en:['Doctor is not available at the primary health centre','Hospital has no medicine for fever and diabetes','Ambulance did not arrive for the emergency call','Nurse behaved badly and refused treatment','Vaccination camp was cancelled without notice'],ta:['ஆரம்ப சுகாதார நிலையத்தில் மருத்துவர் இல்லை','மருத்துவமனையில் மருந்து இல்லை'],hi:['अस्पताल में डॉक्टर नहीं मिलते','एम्बुलेंस समय पर नहीं आई']},
fire:{en:['Fire broke out in the godown and nobody came','Flood water entered our homes, need rescue and relief','Cyclone damage, relief materials not distributed','Building collapsed and people are trapped','Emergency disaster help needed in our village'],ta:['கிடங்கில் தீ விபத்து ஏற்பட்டது','வெள்ளத்தில் வீடுகள் மூழ்கின நிவாரணம் தேவை'],hi:['गोदाम में आग लग गई','बाढ़ से घर डूब गए राहत चाहिए']}};
const TEST_PLACES=['Peelamedu','Gandhipuram','Saravanampatti','Eachanari','RS Puram'];
function typo(rng,text){return text.split(' ').map(w=>{const ch=Array.from(w);if(ch.length>=4&&rng()<0.4){const i=1+Math.floor(rng()*(ch.length-2));if(rng()<0.5)ch.splice(i,1);else[ch[i],ch[i+1]]=[ch[i+1],ch[i]]}return ch.join('')}).join(' ')}
function buildTestSet(){const out=[];let k=0;const rng=RNGf(99);DEPTS.forEach(d=>{['en','ta','hi'].forEach(l=>PHRASES[d.id][l].forEach(p=>{
 out.push({text:p,y:d.id,lang:l,v:'clean'});out.push({text:'Sir, please help. '+p+' at '+TEST_PLACES[k++%TEST_PLACES.length],y:d.id,lang:l,v:'context'});out.push({text:typo(rng,p),y:d.id,lang:l,v:'noisy'})}))});return out}

// ---------- Initial confirmed-resolution counts (synthetic history) for P(d | intent) ----------
const initCounts=()=>({utility:{water:120,electricity:140,roads:8},civic:{roads:90,sanitation:110,water:6},documents:{revenue:80,pension:5},welfare:{pension:100,education:70,health:90,revenue:6}});

// ---------- Finder: TF-IDF (character 3-grams) similarity + frequency prior ----------
function buildIndex(depts){const docs=depts.map(d=>gramsOf(docOf(d)));const df=new Map();docs.forEach(m=>m.forEach((_,g)=>df.set(g,(df.get(g)||0)+1)));const N=docs.length;
 const idf=g=>Math.log((N+1)/((df.get(g)||0)+1))+1;
 const vecs=docs.map(m=>{const v=new Map();let nn=0;m.forEach((c,g)=>{const w=Math.log(1+c)*idf(g);v.set(g,w);nn+=w*w});nn=Math.sqrt(nn);v.forEach((w,g)=>v.set(g,w/nn));return v});
 return{vecs,idf,N,depts}}
function simVec(index,text){const q=gramsOf(text);const w=new Map();let nn=0;q.forEach((c,g)=>{const x=Math.log(1+c)*index.idf(g);w.set(g,x);nn+=x*x});nn=Math.sqrt(nn)||1;
 return index.vecs.map(v=>{let s=0;w.forEach((x,g)=>{const y=v.get(g);if(y)s+=x*y});return s/nn})}
function route(index,counts,text,opt){const{alpha=0.6,delta=0.15,minSim=0.04}=opt||{};const cos=simVec(index,text);const maxC=Math.max(...cos);const depts=index.depts;
 const intent=depts[cos.indexOf(maxC)].intent;const row=counts[intent]||{};let tot=0;depts.forEach(d=>tot+=(row[d.id]||0));
 const rows=depts.map((d,i)=>{const prior=((row[d.id]||0)+1)/(tot+depts.length);const cosN=maxC>1e-9?cos[i]/maxC:0;
  return{id:d.id,name:d.name,cos:cos[i],cosN,prior,score:alpha*cosN+(1-alpha)*Math.log(prior)}});
 rows.sort((a,b)=>b.score-a.score);const margin=rows[0].score-rows[1].score;
 return{intent,rows,top:rows[0],margin,human:maxC<minSim||margin<delta,maxCos:maxC}}
function keywordRank(depts,text){const toks=new Set(norm(text).split(' '));
 const sc=depts.map((d,i)=>{const ws=new Set([...d.kw.en,...d.kw.ta,...d.kw.hi].map(norm));let c=0;toks.forEach(t=>{if(ws.has(t))c++});return{id:d.id,c,i}});
 return sc.sort((a,b)=>b.c-a.c||a.i-b.i).map(x=>x.id)}
function evalRouting(index,counts,tests,opt){const T=tests.filter(t=>index.depts.some(d=>d.id===t.y));const V={};const add=(v,k,ok1,ok3)=>{const o=(V[v]=V[v]||{n:0});o.n+=k==='n'?1:0;if(k!=='n'){o[k]=o[k]||{k1:0,k3:0};o[k].k1+=ok1;o[k].k3+=ok3}};
 let auto=0,autoOk=0;
 T.forEach(t=>{[t.v,'all'].forEach(v=>add(v,'n'));const r=route(index,counts,t.text,opt);const ids=r.rows.map(x=>x.id);
  const r0=route(index,counts,t.text,Object.assign({},opt,{alpha:1}));const i0=r0.rows.map(x=>x.id);const kr=keywordRank(index.depts,t.text);
  [t.v,'all'].forEach(v=>{add(v,'full',+(ids[0]===t.y),+ids.slice(0,3).includes(t.y));add(v,'cosOnly',+(i0[0]===t.y),+i0.slice(0,3).includes(t.y));add(v,'keyword',+(kr[0]===t.y),+kr.slice(0,3).includes(t.y))});
  if(!r.human){auto++;if(ids[0]===t.y)autoOk++}});
 const out={n:T.length,humanShare:1-auto/T.length,autoAcc:auto?autoOk/auto:0,by:{}};
 Object.keys(V).forEach(v=>{const o=V[v];out.by[v]={n:o.n};['full','cosOnly','keyword'].forEach(k=>out.by[v][k]={top1:o[k].k1/o.n,top3:o[k].k3/o.n})});return out}

// ---------- Tracker: Kaplan-Meier learned timers ----------
function genHistory(d,rng,N=120){const a=[];for(let i=0;i<N;i++)a.push(Math.max(0.5,d.median*Math.exp(0.55*gauss(rng))));return a}
function buildHistory(seed=7){const out={};DEPTS.forEach((d,k)=>{const r=RNGf(seed*100+k);const all=genHistory(d,r);const ntr=Math.round(all.length*0.7);
 const train=all.slice(0,ntr).map(t=>{const age=10+r()*80;return t<=age?{t,e:1}:{t:age,e:0}});out[d.id]={train,test:all.slice(ntr)}});return out}
function km(obs){const s=obs.map(o=>({t:o.t,e:o.e})).sort((a,b)=>a.t-b.t);let n=s.length,S=1;const curve=[{t:0,S:1,n,e:0}];let i=0;
 while(i<s.length){const t=s[i].t;let e=0,c=0,j=i;while(j<s.length&&s[j].t===t){s[j].e?e++:c++;j++}if(e>0){S*=1-e/n;curve.push({t,S,n,e})}n-=e+c;i=j}return curve}
const FIXED_LADDER=[7,15,30,60,90];
function learnedTimers(d,hist,o){const{q=0.8,m=[2,3,4,6],nmin=20}=o||{};
 if(hist.length<nmin)return{source:'fallback',t:FIXED_LADDER.slice(0,4),legal:FIXED_LADDER[4],curve:[],tq:null};
 const curve=km(hist);let tq=null;for(const p of curve){if(p.S<=1-q+1e-12){tq=p.t;break}}
 let t1=Math.max(1,Math.min(d.charter,tq===null?d.charter:Math.ceil(tq)));
 const T=[t1];[m[0],m[1],m[2]].forEach(k=>T.push(Math.max(T[T.length-1]+1,Math.round(k*t1))));
 return{source:'learned',t:T,legal:Math.max(T[3]+1,Math.round(m[3]*t1)),curve,tq,capped:tq===null||Math.ceil(tq)>d.charter}}
function evalTimers(depts,H,o){const rows=[];depts.forEach(d=>{const lt=learnedTimers(d,H[d.id].train,o);const t1=lt.t[0],f1=FIXED_LADDER[0],test=H[d.id].test;
 const nd=(x)=>test.filter(t=>t>x&&t<=d.charter).length/test.length;const lateBreach=(x)=>{const br=test.filter(t=>t>d.charter);return br.length?(x>d.charter?1:0):0};
 rows.push({id:d.id,name:d.name,charter:d.charter,fixed:f1,learned:t1,capped:lt.capped,needlessFixed:nd(f1),needlessLearned:nd(t1),lateFixed:lateBreach(f1),lateLearned:lateBreach(t1),esc1Fixed:test.filter(t=>t>f1).length/test.length,esc1Learned:test.filter(t=>t>t1).length/test.length})});
 const avg=k=>rows.reduce((s,r)=>s+r[k],0)/rows.length;return{rows,needlessFixed:avg('needlessFixed'),needlessLearned:avg('needlessLearned'),lateFixed:avg('lateFixed'),lateLearned:avg('lateLearned')}}
function median(a){const s=a.slice().sort((x,y)=>x-y);const n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):0}

// ---------- Metrics ----------
function wer(ref,hyp){const r=norm(ref).split(' ').filter(Boolean),h=norm(hyp).split(' ').filter(Boolean);if(!r.length)return h.length?1:0;
 const d=Array.from({length:r.length+1},(_,i)=>[i,...Array(h.length).fill(0)]);for(let j=1;j<=h.length;j++)d[0][j]=j;
 for(let i=1;i<=r.length;i++)for(let j=1;j<=h.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(r[i-1]===h[j-1]?0:1));return d[r.length][h.length]/r.length}

// ---------- Learner: softmax classifier on hashed character n-grams (stand-in for fine-tuning MuRIL) ----------
const HD=1024;const fnv=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function featOf(text){const acc=new Map();gramsOf(text).forEach((c,k)=>{const j=fnv(k)%HD;acc.set(j,(acc.get(j)||0)+Math.log(1+c))});let nn=0;acc.forEach(v=>nn+=v*v);nn=Math.sqrt(nn)||1;const idx=[],val=[];acc.forEach((v,j)=>{idx.push(j);val.push(v/nn)});return{idx,val}}
class LR{constructor(K){this.K=K;this.W=Array.from({length:K},()=>new Float32Array(HD));this.b=new Float32Array(K)}
 logits(f){const z=new Float32Array(this.K);for(let k=0;k<this.K;k++){let s=this.b[k];const w=this.W[k];for(let t=0;t<f.idx.length;t++)s+=w[f.idx[t]]*f.val[t];z[k]=s}return z}
 predict(f){const z=this.logits(f);let b=0;for(let k=1;k<this.K;k++)if(z[k]>z[b])b=k;return b}
 fit(data,epochs,lr,rng){const order=data.map((_,i)=>i);for(let e=0;e<epochs;e++){shuffle(rng,order);for(const i of order){const s=data[i],z=this.logits(s.f);let m=-1e9;for(const v of z)if(v>m)m=v;let sum=0;const p=Array.from(z,v=>{const x=Math.exp(v-m);sum+=x;return x});
   for(let k=0;k<this.K;k++){const g=(p[k]/sum-(k===s.y?1:0))*lr*(s.w||1);const w=this.W[k];for(let t=0;t<s.f.idx.length;t++)w[s.f.idx[t]]-=g*s.f.val[t];this.b[k]-=g*0.1}}}return this}
 clone(){const c=new LR(this.K);c.W=this.W.map(w=>Float32Array.from(w));c.b=Float32Array.from(this.b);return c}}
function avgModels(ms,ws){const tot=ws.reduce((a,b)=>a+b,0);const o=new LR(ms[0].K);ms.forEach((m,i)=>{const f=ws[i]/tot;for(let k=0;k<o.K;k++){for(let j=0;j<HD;j++)o.W[k][j]+=f*m.W[k][j];o.b[k]+=f*m.b[k]}});return o}
const TPL={en:['{a} problem in our area','no action on {a} {b}','please solve {a} and {b} issue','{a} {b} complaint','{a} {b} not working'],ta:['{a} {b} பிரச்சினை','எங்கள் பகுதியில் {a} {b}','{a} சரிசெய்ய வேண்டும்'],hi:['हमारे इलाके में {a} {b} की समस्या','{a} {b} ठीक करें']};
function genText(rng,d,lang){const kws=d.kw[lang];const a=pick(rng,kws),b=pick(rng,kws);let t=pick(rng,TPL[lang]).replace('{a}',a).replace('{b}',b);
 if(rng()<0.2){const o=pick(rng,DEPTS);t+=' '+pick(rng,o.kw[lang])}return t}
function genSamples(rng,deptWeights,langMix,n){const ids=Object.keys(deptWeights);const tot=ids.reduce((s,k)=>s+deptWeights[k],0);const L=Object.keys(langMix);const lt=L.reduce((s,k)=>s+langMix[k],0);const out=[];
 for(let i=0;i<n;i++){let x=rng()*tot,id=ids[0];for(const k of ids){x-=deptWeights[k];if(x<=0){id=k;break}}let y=rng()*lt,lang=L[0];for(const k of L){y-=langMix[k];if(y<=0){lang=k;break}}
  const di=DEPTS.findIndex(d=>d.id===id);out.push({f:featOf(genText(rng,DEPTS[di],lang)),y:di,text:''})}return out}
function testSamples(ids){const out=[];DEPTS.forEach((d,i)=>{if(!ids.includes(d.id))return;['en','ta','hi'].forEach(l=>PHRASES[d.id][l].forEach(p=>out.push({f:featOf(p),y:i})))});return out}
const accOf=(m,S)=>S.length?S.filter(s=>m.predict(s.f)===s.y).length/S.length:0;
const OLD_IDS=ROUTE_DEPTS.map(d=>d.id);
function runContinual(seed=11,o){const{epochs=10,lr=0.6,lambda=1,buf=6}=o||{};const rng=RNGf(seed);const w={};OLD_IDS.forEach(id=>w[id]=1);
 const base=genSamples(rng,w,{en:3,ta:2,hi:2},320);const m0=new LR(DEPTS.length).fit(base,8,lr,rng);const tOld=testSamples(OLD_IDS),tNew=testSamples(['fire']);
 const nw=genSamples(rng,{fire:1},{en:3,ta:2,hi:2},24);
 const naive=m0.clone().fit(nw,epochs,lr,rng);
 const by={};base.forEach(s=>{(by[s.y]=by[s.y]||[]).push(s)});const B=[];Object.values(by).forEach(a=>B.push(...a.slice(0,buf)));
 const rep=m0.clone().fit([...nw,...B.map(s=>({...s,w:lambda}))],epochs,lr,rng);
 return{before:{old:accOf(m0,tOld),neu:accOf(m0,tNew)},naive:{old:accOf(naive,tOld),neu:accOf(naive,tNew)},replay:{old:accOf(rep,tOld),neu:accOf(rep,tNew)},bufferSize:B.length,nOld:tOld.length,nNew:tNew.length}}
const FED_STATES=[{name:'State A',n:300,w:{water:3,electricity:3,roads:2,sanitation:2,revenue:1,pension:1,education:0.5,health:0.5},mix:{en:3,ta:3,hi:0.2}},
 {name:'State B',n:120,w:{revenue:3,pension:3,education:3,water:1,electricity:1,roads:0.5,sanitation:0.5,health:1},mix:{en:3,ta:0.2,hi:3}},
 {name:'State C',n:30,w:{health:4,sanitation:2,water:1,roads:1},mix:{en:3,ta:1,hi:1}}];
function runFederated(seed=21,o){const{rounds:R=5,local=2,lr=0.5}=o||{};const rng=RNGf(seed);const data=FED_STATES.map(s=>genSamples(rng,s.w,s.mix,s.n));const T=testSamples(OLD_IDS);const total=R*local;
 let g=new LR(DEPTS.length);for(let r=0;r<R;r++){const ms=data.map(d=>g.clone().fit(d,local,lr,rng));g=avgModels(ms,data.map(d=>d.length))}
 const single=data.map(d=>new LR(DEPTS.length).fit(d,total,lr,rng));const pooled=new LR(DEPTS.length).fit([].concat(...data),total,lr,rng);
 return{federated:accOf(g,T),pooled:accOf(pooled,T),single:single.map(m=>accOf(m,T)),singleMean:single.reduce((s,m)=>s+accOf(m,T),0)/single.length,sizes:data.map(d=>d.length),nTest:T.length}}
