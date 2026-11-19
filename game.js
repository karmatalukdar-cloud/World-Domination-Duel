const characters = [
 {id:"donald",name:"The Donald",role:"CEO of Caps Lock",emoji:"🦅",line:"I have a concept of a plan!",taunt:"Nobody bonks harder. Nobody."},
 {id:"elon",name:"Elon Musk",role:"CEO of Reply Guys",emoji:"🚀",line:"This punch is 𝕏-traordinary.",taunt:"I will acquire your health bar."},
 {id:"biden",name:"Joe B.",role:"Retired Ice Cream Influencer",emoji:"🍦",line:"C'mon, man. That's a bonk.",taunt:"Where am I? Oh, right. Your side."},
 {id:"putin",name:"V. Pootin",role:"Professional Long Table Owner",emoji:"🐻",line:"I have a very small table.",taunt:"Strategic sitting position."},
 {id:"kim",name:"Kim Jong-Un",role:"Supreme Haircut Officer",emoji:"🥋",line:"My haircut has nuclear range.",taunt:"This arena is now my arena."},
 {id:"zuck",name:"Zuck",role:"Lizard in a Hoodie",emoji:"🦎",line:"I have sent you a friend request.",taunt:"Your bonk data is valuable."},
 {id:"modi",name:"M. Modi",role:"CEO of Mann Ki Baat",emoji:"🧔",line:"Mitron, this is a surgical bonk.",taunt:"Make the health bar great again."},
 {id:"xi",name:"Xi Jinping",role:"Chairman of the Group Chat",emoji:"🐼",line:"This message has been moderated.",taunt:"No funny business in my arena."},
 {id:"bernie",name:"Bernie S.",role:"Senator of Side-Eye",emoji:"🧣",line:"I am once again asking you to block.",taunt:"The bonks belong to the people."},
 {id:"taylor",name:"Tay-Tay",role:"Department of Breakup Anthems",emoji:"🐍",line:"I can make a hit out of this.",taunt:"Your damage era starts now."},
 {id:"rihanna",name:"Riri",role:"CEO of Making It Look Easy",emoji:"💎",line:"Please don't make me do this.",taunt:"Stay in your lane, respectfully."},
 {id:"warren",name:"Warren B.",role:"Grandpa of Compound Interest",emoji:"💸",line:"I invested in this punch in 1965.",taunt:"Time in the market, not timing the bonk."}
];
const $ = id => document.getElementById(id);
let selected=[0,1], players=[], running=false, timeLeft=60, timerId=null, keys={};
function renderRoster(){
 [1,2].forEach((n)=>{const el=$("roster"+n);el.innerHTML="";characters.forEach((c,i)=>{const b=document.createElement("button");b.className="pick"+(selected[n-1]===i?" active":"");b.innerHTML=`<span>${c.emoji}</span>${c.name}`;b.addEventListener("click",()=>{selected[n-1]=i;updateSelection();});el.appendChild(b);});});
}
function updateSelection(){[1,2].forEach(n=>{const c=characters[selected[n-1]];$("name"+n).textContent=c.name;$("role"+n).textContent=c.role;$("preview"+n).querySelector(".big-avatar").textContent=c.emoji;});renderRoster();}
function say(n,text){const el=$("speech"+n);el.textContent=text;el.classList.add("show");clearTimeout(el._hide);el._hide=setTimeout(()=>el.classList.remove("show"),1050);}
function startGame(){
 clearInterval(timerId);players=[{x:22,hp:100,dir:1,el:$("fighter1"),avatar:$("avatar1"),char:characters[selected[0]],cool:0,jump:0},{x:68,hp:100,dir:-1,el:$("fighter2"),avatar:$("avatar2"),char:characters[selected[1]],cool:0,jump:0}];
 $("fightName1").textContent=players[0].char.name.toUpperCase();$("fightName2").textContent=players[1].char.name.toUpperCase();
 $("avatar1").textContent=players[0].char.emoji;$("avatar2").textContent=players[1].char.emoji;$("tag1").textContent=players[0].char.name;$("tag2").textContent=players[1].char.name;
 $("stageTitle").textContent=$("stage").selectedOptions[0].text.toUpperCase();$("battlefield").className="battlefield "+$("stage").value;
 $("gameSection").classList.remove("hidden");$("resultOverlay").classList.add("hidden");$("announcer").textContent="The cameras are rolling. Please behave like adults. (They won't.)";
 timeLeft=60;running=true;updateHUD();positionPlayers();$("timer").textContent=timeLeft;
 timerId=setInterval(()=>{if(!running)return;timeLeft--;$("timer").textContent=timeLeft;if(timeLeft<=0)finishGame();},1000);
 $("gameSection").scrollIntoView({behavior:"smooth",block:"start"});
}
function positionPlayers(){players.forEach((p,i)=>{p.el.style.left=p.x+"%";p.el.style.bottom=(50+p.jump)+"px";});}
function updateHUD(){players.forEach((p,i)=>{$("health"+(i+1)).style.width=p.hp+"%";$("healthText"+(i+1)).textContent=p.hp+"%";});}
function attack(i){if(!running)return;const p=players[i],o=players[1-i],now=Date.now();if(now<p.cool)return;p.cool=now+500;p.el.classList.remove("attacking");void p.el.offsetWidth;p.el.classList.add("attacking");setTimeout(()=>p.el.classList.remove("attacking"),280);say(i+1,p.char.line);
 const distance=Math.abs(p.x-o.x);if(distance<17){o.hp=Math.max(0,o.hp-12);o.el.classList.remove("hurt");void o.el.offsetWidth;o.el.classList.add("hurt");setTimeout(()=>o.el.classList.remove("hurt"),300);$("impact").textContent=["BONK!","RATIO'D!","YIKES!","FACT-CHECKED!","SKILL ISSUE!"][Math.floor(Math.random()*5)];$("impact").classList.remove("show");void $("impact").offsetWidth;$("impact").classList.add("show");say(2-i,o.char.taunt);$("announcer").textContent=p.char.name+" landed a devastating diplomatic incident.";updateHUD();if(o.hp<=0)finishGame(i);}else{$("announcer").textContent="Whiff! That attack had the accuracy of a vague campaign promise.";}}
function jump(i){if(!running)return;const p=players[i];if(p.jump>0)return;p.jump=70;p.el.classList.add("jumping");const start=Date.now();const t=setInterval(()=>{const d=Date.now()-start;p.jump=Math.max(0,70-Math.abs(350-d)*.4);p.el.style.bottom=(50+p.jump)+"px";if(d>350){clearInterval(t);p.jump=0;p.el.classList.remove("jumping");p.el.style.bottom="50px";}},16);}
function handleKey(k,down){const key=k.startsWith("Arrow")?k:k.toLowerCase();keys[key]=down;if(!down||!running)return;if(k.toLowerCase()==="f")attack(0);if(k.toLowerCase()==="l")attack(1);if(k.toLowerCase()==="w")jump(0);if(k==="ArrowUp")jump(1);}
document.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowUp"," "].includes(e.key))e.preventDefault();handleKey(e.key,true);});
document.addEventListener("keyup",e=>handleKey(e.key,false));
function moveLoop(){if(running){if(keys.a)players[0].x-=.55;if(keys.d)players[0].x+=.55;if(keys.ArrowLeft)players[1].x-=.55;if(keys.ArrowRight)players[1].x+=.55;players.forEach(p=>p.x=Math.max(2,Math.min(88,p.x)));positionPlayers();}requestAnimationFrame(moveLoop);}requestAnimationFrame(moveLoop);
document.querySelectorAll(".mobile-controls button").forEach(b=>{const key=b.dataset.key;b.addEventListener("pointerdown",e=>{e.preventDefault();handleKey(key,true);});["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>handleKey(key,false)));});
function finishGame(winner){if(!running)return;running=false;clearInterval(timerId);let win=winner===undefined?(players[0].hp===players[1].hp?-1:(players[0].hp>players[1].hp?0:1)):winner;
 $("resultEmoji").textContent=win<0?"🤝":"🏆";$("resultTitle").textContent=win<0?"A DIPLOMATIC STALEMATE":players[win].char.name.toUpperCase()+" WINS!";
 $("resultCopy").textContent=win<0?"Nobody won. Somehow, everyone lost.":players[win].char.name+" has secured the highly unofficial title of World's Most Bonkable. "+players[1-win].char.name+" is requesting a recount.";
 $("resultOverlay").classList.remove("hidden");}
$("startBtn").addEventListener("click",startGame);$("rematchBtn").addEventListener("click",startGame);$("playAgain").addEventListener("click",startGame);
updateSelection();