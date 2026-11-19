const $ = id => document.getElementById(id);
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d");
const W = 1000, H = 520, FLOOR = 438;
const roster = [
 {name:"The Donald",tag:"THE ART OF THE DEAL",icon:"🦅",color:"#d3a34d",dark:"#704523",line:"YOU'RE FIRED!"},
 {name:"Elon Musk",tag:"FINAL BOSS OF REPLIES",icon:"🚀",color:"#8bb8d8",dark:"#344b69",line:"TO THE MOON!"},
 {name:"M. Modi",tag:"THE MAN KI BAATDOWN",icon:"🧔",color:"#e7a65f",dark:"#774228",line:"MITRON, GUARD UP!"},
 {name:"Xi Jinping",tag:"CHAIRMAN OF THE COMBO",icon:"🐼",color:"#df6864",dark:"#713238",line:"MESSAGE MODERATED."},
 {name:"Kim Jong-Un",tag:"SUPREME HAIRCUT",icon:"🥋",color:"#b3a0e5",dark:"#554b7c",line:"A VERY SPECIAL MOVE."},
 {name:"Zuck",tag:"THE META MENACE",icon:"🦎",color:"#6bc8c9",dark:"#245d69",line:"I KNOW YOUR HITBOX."},
 {name:"V. Pootin",tag:"THE LONG TABLE LEGEND",icon:"🐻",color:"#a4aebc",dark:"#394453",line:"STRATEGIC RETREAT."},
 {name:"Bernie S.",tag:"THE COMBO IS FOR ALL",icon:"🧣",color:"#e5a1b0",dark:"#79394f",line:"I AM ONCE AGAIN ASKING..."},
 {name:"Riri",tag:"THE UNBOTHERED BOSS",icon:"💎",color:"#df82ad",dark:"#753c69",line:"DON'T TRY ME."},
 {name:"Tay-Tay",tag:"THE ERAS OF PAIN",icon:"🐍",color:"#b6bf6e",dark:"#4f6033",line:"BAD BLOOD. GREAT COMBO."}
];
const maps = {
 summit:{label:"THE EMERGENCY SUMMIT",sky:"#27364d",glow:"#e4b875",floor:"#262d3b",accent:"#86dff0"},
 neon:{label:"NEON CAPITAL",sky:"#272044",glow:"#fb5ea6",floor:"#171b31",accent:"#7bdbff"},
 moon:{label:"ORBITAL BOARDROOM",sky:"#172b42",glow:"#a7caff",floor:"#202b3b",accent:"#9fb8ff"}
};
const mapNames = {summit:"THE EMERGENCY SUMMIT",neon:"NEON CAPITAL",moon:"ORBITAL BOARDROOM"};
const controls = [
 {left:"a",right:"d",jump:"w",down:"s",block:"q",light:"f",heavy:"g",special:"h"},
 {left:"ArrowLeft",right:"ArrowRight",jump:"ArrowUp",down:"ArrowDown",block:"i",light:"j",heavy:"k",special:"l"}
];
const moves = {
 light:{startup:.09,active:.095,recovery:.22,damage:7,range:78,stun:.19,knock:190,label:"JAB"},
 heavy:{startup:.22,active:.12,recovery:.43,damage:14,range:112,stun:.34,knock:310,label:"CRUSH"},
 special:{startup:.29,active:.06,recovery:.48,damage:18,range:0,stun:.39,knock:390,label:"SIGNATURE"}
};
let chosen = [0,1];
let keys = new Set(), pressed = new Set();
let fighters = [], projectiles = [], particles = [];
let game = {phase:"idle",round:1,score:[0,0],clock:99,intro:0,freeze:0,shake:0,arena:"summit",lastTime:0,comment:"Pick your fighter and prepare to get ratio'd."};
let lastHud = 0;

function renderRoster(){
 [0,1].forEach(side=>{
  const root=$("roster"+(side+1)); root.innerHTML="";
  roster.forEach((c,i)=>{
   const b=document.createElement("button");
   b.className="pick"+(chosen[side]===i?" active":"");
   b.type="button";
   b.innerHTML="<span>"+c.icon+"</span><small>"+c.name+"</small>";
   b.addEventListener("click",()=>{chosen[side]=i;updateChosen();});
   root.appendChild(b);
  });
 });
}
function updateChosen(){
 [0,1].forEach(i=>{
  const c=roster[chosen[i]],n=i+1;
  $("chosen"+n).querySelector(".chosen-icon").textContent=c.icon;
  $("chosenName"+n).textContent=c.name;
  $("chosenTag"+n).textContent=c.tag;
 });
 renderRoster();
}
function makeFighter(side){
 const c=roster[chosen[side]];
 return {side,char:c,x:side===0?300:700,y:FLOOR,vx:0,vy:0,face:side===0?1:-1,hp:100,meter:50,grounded:true,crouch:false,blocking:false,attack:null,stun:0,flash:0,walk:0,combo:0,comboTime:0,hasHit:false};
}
function startMatch(){
 game.score=[0,0];game.round=1;game.arena=$("stageSelect").value;
 $("cabinet").classList.add("hidden");$("fightScreen").classList.remove("hidden");
 $("arenaName").textContent=mapNames[game.arena];
 $("hudName1").textContent=roster[chosen[0]].name.toUpperCase();
 $("hudName2").textContent=roster[chosen[1]].name.toUpperCase();
 $("hudTitle1").textContent=roster[chosen[0]].tag;
 $("hudTitle2").textContent=roster[chosen[1]].tag;
 $("hudIcon1").textContent=roster[chosen[0]].icon;$("hudIcon2").textContent=roster[chosen[1]].icon;
 beginRound(1);
 $("fightScreen").scrollIntoView({behavior:"smooth",block:"start"});
}
function beginRound(n){
 game.round=n;game.clock=99;game.phase="intro";game.intro=1.5;game.freeze=0;game.shake=0;
 fighters=[makeFighter(0),makeFighter(1)];projectiles=[];particles=[];keys.clear();pressed.clear();
 $("roundNum").textContent=n;$("roundLabel").textContent="READY";$("clock").textContent="99";
 $("roundOverlay").classList.add("hidden");setComment("Round "+n+". Keep your guard up and your receipts ready.");
 updateHud(true);
}
function setComment(s){game.comment=s;$("commentary").textContent=s;}
function setKey(key,down){
 if(down){if(!keys.has(key))pressed.add(key);keys.add(key);}
 else keys.delete(key);
}
function normalize(k){return k.startsWith("Arrow")?k:k.toLowerCase();}
window.addEventListener("keydown",e=>{
 const k=normalize(e.key);
 if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();
 if(e.repeat)return;
 setKey(k,true);
});
window.addEventListener("keyup",e=>setKey(normalize(e.key),false));
window.addEventListener("blur",()=>{keys.clear();pressed.clear();});
document.querySelectorAll("[data-key]").forEach(btn=>{
 const k=btn.dataset.key;
 btn.addEventListener("pointerdown",e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);setKey(k,true);});
 const release=e=>{e.preventDefault();setKey(k,false);};
 btn.addEventListener("pointerup",release);btn.addEventListener("pointercancel",release);btn.addEventListener("lostpointercapture",()=>setKey(k,false));
});
function startAttack(f,kind){
 if(f.stun>0)return;
 const def=moves[kind];if(!def)return;
 if(kind==="special"&&f.meter<50){if(f.side===0)setComment("SPECIAL NEEDS 50 METER. LAND A FEW HITS FIRST.");return;}
 if(f.attack){
  const a=f.attack, canCancel=a.hit&&a.elapsed>a.def.startup*.65&&a.elapsed<a.def.startup+a.def.active+.1;
  if(!canCancel)return;
 }
 if(kind==="special")f.meter-=50;
 f.attack={kind,def,elapsed:0,hit:false,projectileMade:false,low:f.crouch};
 f.blocking=false;f.hasHit=false;
}
function inputFighter(f,dt){
 const c=controls[f.side],left=keys.has(c.left),right=keys.has(c.right);
 f.blocking=keys.has(c.block)&&!f.attack&&f.stun<=0;
 f.crouch=keys.has(c.down)&&f.grounded&&!f.attack&&f.stun<=0;
 if(pressed.has(c.jump)&&f.grounded&&f.stun<=0&&!f.attack){f.vy=-690;f.grounded=false;f.crouch=false;}
 if(pressed.has(c.special))startAttack(f,"special");
 else if(pressed.has(c.heavy))startAttack(f,"heavy");
 else if(pressed.has(c.light))startAttack(f,"light");
 if(f.stun>0){f.stun=Math.max(0,f.stun-dt);f.vx*=Math.pow(.08,dt);return;}
 let dir=(right?1:0)-(left?1:0);
 if(f.blocking)dir*=.28;
 if(f.crouch)dir*=.38;
 if(f.attack)dir*=.22;
 const speed=f.blocking?100:(f.crouch?115:315);
 f.vx=dir*speed;
 f.x+=f.vx*dt;
 if(Math.abs(f.vx)>5)f.walk+=dt*Math.abs(f.vx)/75;
 if(f.attack){
  const a=f.attack;a.elapsed+=dt;
  if(a.kind==="special"&&!a.projectileMade&&a.elapsed>=a.def.startup){
   a.projectileMade=true;
   projectiles.push({owner:f.side,x:f.x+f.face*36,y:f.y-(f.crouch?67:91),vx:f.face*690,life:1.3,damage:18,stun:.4,knock:390,color:f.char.color,low:a.low});
   setComment(f.char.name+" unleashes a signature move!");
  }
  if(a.elapsed>=a.def.startup+a.def.active+a.def.recovery)f.attack=null;
 }
 if(!f.grounded){f.vy+=1750*dt;f.y+=f.vy*dt;if(f.y>=FLOOR){f.y=FLOOR;f.vy=0;f.grounded=true;}}
 f.x=Math.max(65,Math.min(W-65,f.x));
}
function separateFighters(){
 const [a,b]=fighters;if(!a||!b)return;
 const dx=b.x-a.x,min=62;
 if(Math.abs(dx)<min&&Math.abs(a.y-b.y)<105){
  const push=(min-Math.abs(dx))/2;
  a.x-=Math.sign(dx||1)*push;b.x+=Math.sign(dx||1)*push;
 }
 a.face=b.x>=a.x?1:-1;b.face=-a.face;
}
function attackCollision(f){
 const a=f.attack;if(!a||a.hit||a.kind==="special")return;
 if(a.elapsed<a.def.startup||a.elapsed>a.def.startup+a.def.active)return;
 const target=fighters[1-f.side],dx=(target.x-f.x)*f.face;
 const range=a.def.range+(target.crouch?0:8);
 const yGap=Math.abs(target.y-f.y);
 if(dx>10&&dx<range&&yGap<105){
  a.hit=true;applyHit(f,target,a.def.damage,a.def.stun,a.def.knock,a.low,a.kind);
 }
}
function applyHit(attacker,target,damage,stun,knock,low,kind){
 const canBlock=target.blocking&&target.face===-attacker.face&&(!low||target.crouch);
 if(canBlock){
  const chip=kind==="heavy"?2:(kind==="special"?3:1);
  target.hp=Math.max(0,target.hp-chip);target.meter=Math.min(100,target.meter+5);attacker.meter=Math.min(100,attacker.meter+4);
  target.vx=attacker.face*75;game.shake=Math.max(game.shake,2);
  setComment("GUARD! "+target.char.name+" blocks the pressure. Find an opening.");
 }else{
  target.hp=Math.max(0,target.hp-damage);target.stun=stun;target.vx=attacker.face*knock;target.flash=.16;
  target.blocking=false;target.attack=null;target.meter=Math.min(100,target.meter+8);attacker.meter=Math.min(100,attacker.meter+15);
  if(attacker.comboTime>0)attacker.combo++;else attacker.combo=1;
  attacker.comboTime=1.25;
  const combo=attacker.combo>1?"  "+attacker.combo+" HIT COMBO!":"";
  setComment(attacker.char.name+" lands "+moves[kind].label+" — "+damage+" DAMAGE."+combo);
  burst((attacker.x+target.x)/2,target.y-75,target.char.color,kind==="heavy"?17:10);
  game.shake=kind==="heavy"||kind==="special"?8:4;game.freeze=.045;
 }
 attacker.hasHit=true;
 if(target.hp<=0)finishRound(attacker.side);
}
function updateProjectiles(dt){
 projectiles.forEach(p=>{
  p.x+=p.vx*dt;p.life-=dt;
  const target=fighters[1-p.owner];
  if(target&&Math.abs(target.x-p.x)<36&&Math.abs((target.y-80)-p.y)<80){
   applyHit(fighters[p.owner],target,p.damage,p.stun,p.knock,p.low,"special");p.life=0;
   burst(p.x,p.y,p.color,18);
  }
 });
 projectiles=projectiles.filter(p=>p.life>0&&p.x>-50&&p.x<W+50);
}
function burst(x,y,color,count){
 for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*330;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,life:.22+Math.random()*.36,max:.58,color,size:2+Math.random()*4});}
}
function updateParticles(dt){
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=700*dt;p.life-=dt;});
 particles=particles.filter(p=>p.life>0);
}
function finishRound(winner){
 if(game.phase!=="fight")return;
 game.phase="roundend";game.shake=12;
 if(winner!==-1)game.score[winner]++;
 const matchWon=game.score[0]>=2||game.score[1]>=2;
 const title=winner===-1?"DRAW!":(winner===0?fighters[0].char.name:fighters[1].char.name)+" WINS THE ROUND";
 $("overlayEyebrow").textContent=matchWon?"MATCH POINT":"ROUND "+game.round+" COMPLETE";
 $("overlayTitle").textContent=matchWon?(game.score[0]>game.score[1]?fighters[0].char.name:fighters[1].char.name).toUpperCase()+" TAKES IT!":title.toUpperCase();
 $("overlayText").textContent=matchWon?"Two rounds secured. The world order has changed.":(winner===-1?"Nobody takes the round. Run it again.":"The score is "+game.score[0]+" — "+game.score[1]+". Reset your stance.");
 $("overlayBtn").textContent=matchWon?"RUN IT BACK ↻":"NEXT ROUND ↗";
 $("overlayBtn").classList.remove("hidden");$("roundOverlay").classList.remove("hidden");
 updateHud(true);
}
function updateHud(force){
 const now=performance.now();if(!force&&now-lastHud<70)return;lastHud=now;
 if(fighters.length){
  fighters.forEach((f,i)=>{
   const n=i+1;$("health"+n).style.width=f.hp+"%";$("healthNum"+n).textContent=Math.ceil(f.hp);
   $("meter"+n).style.width=f.meter+"%";$("score"+n).textContent=game.score[i];
  });
 }
 $("clock").textContent=Math.ceil(game.clock);
}
function tick(dt){
 if(game.phase==="intro"){
  game.intro-=dt;
  if(game.intro<=0){game.phase="fight";$("roundLabel").textContent="FIGHT";setComment("FIGHT! Footsies first. Ego second.");}
 }
 if(game.phase==="fight"){
  game.clock=Math.max(0,game.clock-dt);
  fighters.forEach((f,i)=>{inputFighter(f,dt);if(f.comboTime>0)f.comboTime-=dt;else f.combo=0;});
  separateFighters();
  fighters.forEach(attackCollision);
  updateProjectiles(dt);
  if(game.clock<=0&&game.phase==="fight"){
   const winner=fighters[0].hp===fighters[1].hp?-1:(fighters[0].hp>fighters[1].hp?0:1);finishRound(winner);
  }
  updateHud(false);
 }
 updateParticles(dt);
 if(game.freeze>0){game.freeze-=dt;}
 if(game.shake>0)game.shake=Math.max(0,game.shake-26*dt);
 pressed.clear();
}
function drawBackground(){
 const m=maps[game.arena]||maps.summit;
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,m.sky);g.addColorStop(.7,"#1b2637");g.addColorStop(1,m.floor);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(500,190,10,500,190,400);glow.addColorStop(0,m.glow+"55");glow.addColorStop(1,m.glow+"00");ctx.fillStyle=glow;ctx.fillRect(0,0,W,420);
 if(game.arena==="moon"){
  ctx.fillStyle="#d4e5ff";ctx.beginPath();ctx.arc(770,106,57,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#9caecb";for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(748+i*17,91+(i%3)*17,5+i%3*2,0,Math.PI*2);ctx.fill();}
 }else{
  ctx.fillStyle="#ffffff22";ctx.beginPath();ctx.arc(180,105,34,0,Math.PI*2);ctx.fill();
 }
 // distant skyline / summit silhouettes
 for(let i=0;i<18;i++){
  const x=i*62-12,h=65+(i*47%95);
  ctx.fillStyle=i%2?"#101a2a99":"#18243a99";ctx.fillRect(x,350-h,45,h);
  ctx.fillStyle="#ffffff14";for(let j=0;j<3;j++)ctx.fillRect(x+8+j*11,350-h+12,3,4);
 }
 if(game.arena==="summit"){
  ctx.fillStyle="#c8d7df22";ctx.fillRect(0,302,W,4);
  ctx.fillStyle="#b2c6d4";ctx.font="bold 13px "+'monospace';ctx.textAlign="center";ctx.fillText("WORLD SUMMIT",500,290);
  // distant flags
  for(let i=0;i<9;i++){const x=70+i*110;ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,292);ctx.lineTo(x,250);ctx.stroke();ctx.fillStyle=["#e85c5c","#e7d45d","#5bb9df"][i%3];ctx.fillRect(x,250,19,11);}
 }else if(game.arena==="neon"){
  ctx.strokeStyle="#e35ab966";ctx.lineWidth=3;ctx.strokeRect(60,82,880,250);
  ctx.fillStyle="#ffffff18";ctx.font="bold 27px monospace";ctx.textAlign="center";ctx.fillText("NO SLEEP  /  NO PEACE",500,155);
 }else{
  ctx.strokeStyle="#9dbdff55";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(500,275,380,70,-.12,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#c4d9ff";ctx.font="bold 20px monospace";ctx.textAlign="center";ctx.fillText("ORBITAL BOARDROOM",500,190);
 }
 // floor
 const floorG=ctx.createLinearGradient(0,FLOOR,0,H);floorG.addColorStop(0,"#455165");floorG.addColorStop(.12,m.floor);floorG.addColorStop(1,"#0b101b");ctx.fillStyle=floorG;ctx.fillRect(0,FLOOR,W,H-FLOOR);
 ctx.strokeStyle=m.accent+"88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,FLOOR);ctx.lineTo(W,FLOOR);ctx.stroke();
 ctx.strokeStyle="#ffffff12";ctx.lineWidth=1;
 for(let i=-7;i<=7;i++){ctx.beginPath();ctx.moveTo(500+i*34,FLOOR);ctx.lineTo(500+i*110,H);ctx.stroke();}
 for(let y=FLOOR+25;y<H;y+=21){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
}
function roundedRect(x,y,w,h,r,color){
 ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
}
function drawFighter(f){
 ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.face,1);
 const crouch=f.crouch?0.78:1,walk=Math.sin(f.walk*2.8)*Math.min(1,Math.abs(f.vx)/180),att=f.attack;
 const active=att&&att.elapsed>=att.def.startup&&att.elapsed<=att.def.startup+att.def.active;
 const blocking=f.blocking,hit=f.flash>0;
 // ground shadow
 ctx.save();ctx.scale(1,.25);ctx.fillStyle="#0009";ctx.beginPath();ctx.ellipse(0,8,43,15,0,0,Math.PI*2);ctx.fill();ctx.restore();
 // aura and charge
 if(att&&att.kind==="special"){ctx.fillStyle=f.char.color+"2c";ctx.beginPath();ctx.arc(0,-77,75+Math.sin(att.elapsed*30)*5,0,Math.PI*2);ctx.fill();}
 if(hit){ctx.globalAlpha=.35;ctx.fillStyle="#fff";ctx.fillRect(-32,-138,64,140);}
 // legs
 ctx.lineCap="round";ctx.lineWidth=17;ctx.strokeStyle=f.char.dark;
 ctx.beginPath();ctx.moveTo(-11,-43*crouch);ctx.lineTo(-15-walk*11, -19);ctx.lineTo(-15-walk*13,0);ctx.stroke();
 ctx.beginPath();ctx.moveTo(11,-43*crouch);ctx.lineTo(15+walk*11,-19);ctx.lineTo(15+walk*13,0);ctx.stroke();
 roundedRect(-32-walk*13,-8,31,12,5,"#111722");roundedRect(3+walk*13,-8,31,12,5,"#111722");
 // torso
 const body=ctx.createLinearGradient(-24,-103,25,-42);body.addColorStop(0,f.char.color);body.addColorStop(1,f.char.dark);
 ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-23,-102*crouch);ctx.lineTo(22,-102*crouch);ctx.lineTo(28,-44*crouch);ctx.lineTo(-28,-44*crouch);ctx.closePath();ctx.fill();
 ctx.strokeStyle="#ffffff40";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-98*crouch);ctx.lineTo(0,-48*crouch);ctx.stroke();
 // tie / badge
 ctx.fillStyle="#f1e7d0";ctx.beginPath();ctx.moveTo(-5,-98*crouch);ctx.lineTo(5,-98*crouch);ctx.lineTo(3,-89*crouch);ctx.lineTo(0,-84*crouch);ctx.lineTo(-3,-89*crouch);ctx.closePath();ctx.fill();
 ctx.fillStyle="#141c29";ctx.fillRect(-4,-79*crouch,8,19);
 // arms
 ctx.lineCap="round";ctx.lineWidth=15;ctx.strokeStyle=f.char.color;
 if(blocking){
  ctx.beginPath();ctx.moveTo(-19,-91*crouch);ctx.lineTo(-31,-116*crouch);ctx.lineTo(-10,-121*crouch);ctx.stroke();
  ctx.beginPath();ctx.moveTo(19,-91*crouch);ctx.lineTo(32,-117*crouch);ctx.lineTo(12,-126*crouch);ctx.stroke();
 }else if(att&&att.kind==="heavy"){
  const t=active?1:(att.elapsed<att.def.startup?att.elapsed/att.def.startup:Math.max(0,1-(att.elapsed-att.def.startup-att.def.active)/att.def.recovery));
  ctx.beginPath();ctx.moveTo(19,-91*crouch);ctx.lineTo(29+34*t,-90*crouch);ctx.lineTo(48+38*t,-91*crouch);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-19,-91*crouch);ctx.lineTo(-32,-67);ctx.stroke();
 }else if(att&&att.kind==="light"){
  const t=active?1:Math.min(1,att.elapsed/att.def.startup);
  ctx.beginPath();ctx.moveTo(18,-91*crouch);ctx.lineTo(25+27*t,-86*crouch);ctx.lineTo(42+32*t,-82*crouch);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-19,-91*crouch);ctx.lineTo(-29,-66);ctx.stroke();
 }else{
  ctx.beginPath();ctx.moveTo(-19,-91*crouch);ctx.lineTo(-31,-64+walk*4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(19,-91*crouch);ctx.lineTo(31,-64-walk*4);ctx.stroke();
 }
 // gloves
 ctx.fillStyle="#f1c3a0";ctx.beginPath();ctx.arc(blocking?18:att?48:31,-(blocking?121:att?88:64),9,0,Math.PI*2);ctx.fill();
 // neck / head
 ctx.fillStyle="#d9a77e";ctx.fillRect(-8,-116*crouch,16,18);
 ctx.fillStyle=hit?"#fff": "#e6b48c";ctx.beginPath();ctx.ellipse(0,-128*crouch,24,25,0,0,Math.PI*2);ctx.fill();
 // hair
 ctx.fillStyle="#29242a";ctx.beginPath();ctx.ellipse(0,-142*crouch,24,13,0,Math.PI,Math.PI*2);ctx.fill();
 if(f.side===0&&f.char.name==="The Donald"){ctx.fillStyle="#e2b64e";ctx.beginPath();ctx.ellipse(5,-148*crouch,19,7,-.25,Math.PI,Math.PI*2);ctx.fill();}
 if(f.char.name==="Elon Musk"){ctx.fillStyle="#3a3238";ctx.beginPath();ctx.arc(-5,-147*crouch,14,Math.PI,Math.PI*2);ctx.fill();}
 // face
 ctx.fillStyle="#17202a";ctx.beginPath();ctx.arc(-8,-130*crouch,2.2,0,Math.PI*2);ctx.arc(8,-130*crouch,2.2,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#70483b";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-120*crouch,6,.2,Math.PI-.2);ctx.stroke();
 // character mark and side stripe
 ctx.fillStyle="#fff";ctx.font="17px sans-serif";ctx.textAlign="center";ctx.fillText(f.char.icon,0,-65*crouch);
 ctx.fillStyle=f.side===0?"#62e5ff":"#ff4e57";ctx.fillRect(-29,-99*crouch,5,43*crouch);
 if(active&&att.kind!=="special"){
  ctx.strokeStyle=f.side===0?"#9df7ff":"#ff9bab";ctx.lineWidth=5;ctx.globalAlpha=.7;
  ctx.beginPath();ctx.arc(48,-88,31,-.95,.82);ctx.stroke();ctx.globalAlpha=1;
 }
 ctx.restore();
}
function drawEffects(){
 projectiles.forEach(p=>{
  const g=ctx.createRadialGradient(p.x,p.y,2,p.x,p.y,28);g.addColorStop(0,"#fff");g.addColorStop(.2,p.color);g.addColorStop(1,p.color+"00");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,29,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=p.color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x-p.vx*.035,p.y);ctx.lineTo(p.x,p.y);ctx.stroke();
 });
 particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);});ctx.globalAlpha=1;
}
function draw(){
 ctx.save();
 if(game.shake>0)ctx.translate((Math.random()-.5)*game.shake,(Math.random()-.5)*game.shake);
 drawBackground();
 if(fighters.length){
  const ordered=[...fighters].sort((a,b)=>a.x-b.x);ordered.forEach(drawFighter);drawEffects();
  if(game.phase==="intro"){
   ctx.fillStyle="#05091488";ctx.fillRect(0,0,W,H);
   ctx.textAlign="center";ctx.fillStyle="#d5ff45";ctx.font="900 74px Barlow Condensed, Impact, sans-serif";ctx.fillText(game.intro>.65?"ROUND "+game.round:"FIGHT!",500,260);
  }else if(game.phase==="roundend"){
   ctx.fillStyle="#05091455";ctx.fillRect(0,0,W,H);ctx.textAlign="center";ctx.fillStyle="#d5ff45";ctx.font="900 78px Barlow Condensed, Impact, sans-serif";ctx.fillText("K.O.!",500,260);
  }
 }
 ctx.restore();
}
function frame(now){
 const dt=Math.min(.033,(now-(game.lastTime||now))/1000||0);game.lastTime=now;
 if(game.phase!=="idle"&&game.phase!=="matchend"&&game.freeze<=0)tick(dt);
 else if(game.freeze>0){game.freeze-=dt;updateParticles(dt);pressed.clear();}
 draw();requestAnimationFrame(frame);
}
function resizeCanvas(){
 const dpr=Math.min(window.devicePixelRatio||1,2);
 canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
}
function openOverlay(){
 const matchWon=game.score[0]>=2||game.score[1]>=2;
 $("overlayEyebrow").textContent=matchWon?"MATCH COMPLETE":"ROUND "+game.round+" COMPLETE";
 $("overlayTitle").textContent=matchWon?"VICTORY!":"K.O.!";
}
$("startBtn").addEventListener("click",startMatch);
$("restartBtn").addEventListener("click",startMatch);
$("backBtn").addEventListener("click",()=>{game.phase="idle";fighters=[];projectiles=[];$("fightScreen").classList.add("hidden");$("cabinet").classList.remove("hidden");$("cabinet").scrollIntoView({behavior:"smooth",block:"center"});});
$("overlayBtn").addEventListener("click",()=>{
 const matchWon=game.score[0]>=2||game.score[1]>=2;
 if(matchWon)startMatch();else beginRound(game.round+1);
});
resizeCanvas();window.addEventListener("resize",resizeCanvas);updateChosen();requestAnimationFrame(frame);
