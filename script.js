const $ = (id) => document.getElementById(id);
const canvas = $("wheel"), ctx = canvas.getContext("2d");
const COLORS = ["#b5ff62","#a2ec63","#78c94a","#d4ff9c","#4f8f37","#c4f68a","#8bd950","#e2ffb7"];
let selectedTopic = null, rotation = 0, spinning = false, mode = "prep";
let researchMinutes = 5, speakMinutes = 5, stage = "prep", duration = 60, remaining = 60;
let interval = null, running = false, soundOn = false, toastTimeout = null;
const bank = window.TOPIC_BANK || [];
$("topicCount").textContent = `${bank.length.toLocaleString()}+`;
function getFilteredTopics(){const cat=$("categorySelect").value;return cat==="all"?bank:bank.filter(x=>x[0]===cat)}
function wheelSegments(){
  const topics=getFilteredTopics();
  const n=Math.min(18,Math.max(1,topics.length));
  const step=Math.max(1,Math.floor(topics.length/n));
  return Array.from({length:n},(_,i)=>topics[Math.min(topics.length-1,i*step)]);
}
function drawWheel(rot=rotation){
  const w=canvas.width, h=canvas.height, cx=w/2, cy=h/2, r=244;
  ctx.clearRect(0,0,w,h);
  const topics=wheelSegments(); const n=topics.length; const slice=Math.PI*2/n;
  for(let i=0;i<n;i++){
    const a=rot+i*slice-Math.PI/2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a,a+slice);ctx.closePath();
    ctx.fillStyle=COLORS[i%COLORS.length];ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#101710";ctx.stroke();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a+slice/2);ctx.textAlign="right";ctx.fillStyle=i%4===0?"#13200e":"#172414";
    ctx.font="500 10px 'DM Mono', monospace";
    let label=topics.length?topics[i][1]:"TOPIC";
    if(label.length>24)label=label.slice(0,22)+"…";
    ctx.fillText(label, r-15, 4);ctx.restore();
  }
  ctx.beginPath();ctx.arc(cx,cy,r+1,0,Math.PI*2);ctx.strokeStyle="#49633c";ctx.lineWidth=3;ctx.stroke();
}
function chooseTopic(){const topics=getFilteredTopics();if(!topics.length)return null;return topics[Math.floor(Math.random()*topics.length)]}
function setTopic(topic){if(!topic)return;selectedTopic=topic;$("topicText").textContent=topic[1];$("topicCategory").textContent=topic[0].toUpperCase();drawWheel();if(soundOn)beep(660,.07)}
function spin(){
  if(spinning)return;const segments=wheelSegments();if(!segments.length)return;
  spinning=true;$("spinBtn").disabled=true;
  const targetIndex=Math.floor(Math.random()*segments.length);
  const slice=Math.PI*2/segments.length;
  const targetMod=((-(targetIndex+.5)*slice)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
  const delta=((targetMod-(rotation%(Math.PI*2)))%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
  const start=rotation, end=start+Math.PI*2*(5+Math.random()*3)+delta;
  const started=performance.now(), dur=3200;
  function frame(now){const p=Math.min(1,(now-started)/dur),ease=1-Math.pow(1-p,4);rotation=start+(end-start)*ease;drawWheel(rotation);if(p<1)requestAnimationFrame(frame);else{spinning=false;$("spinBtn").disabled=false;setTopic(segments[targetIndex]);if(soundOn)beep(880,.15);toast("New topic unlocked. Let's go.");}}
  requestAnimationFrame(frame);
}
function beep(freq,seconds){try{const AC=window.AudioContext||window.webkitAudioContext;const a=new AC();const o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,a.currentTime+seconds);o.stop(a.currentTime+seconds)}catch(e){}}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove("show"),2200)}
function fmt(sec){return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`}
function setStage(s){
  stage=s;
  const isPrep=s==="prep",isResearch=s==="research",isSpeak=s==="speak";
  duration=isPrep?60:isResearch?researchMinutes*60:speakMinutes*60;remaining=duration;running=false;clearInterval(interval);interval=null;
  $("timerDisplay").textContent=fmt(remaining);
  $("timerStage").textContent=isPrep?"READY TO PREPARE":isResearch?"READY TO RESEARCH":"READY TO SPEAK";
  $("stageBadge").textContent=isPrep?"PREP":isResearch?"RESEARCH":"SPEAK";
  $("timerHint").textContent=isPrep?"One minute to organise your thoughts. This time is fixed.":isResearch?"Research the topic first. Look for a few useful facts or examples.":"Speak out loud until the timer ends. Keep going even if you make mistakes.";
  $("timerMainBtn").textContent="▶ START TIMER";$("progressBar").style.width="0%";
  ["Research","Prep","Speak"].forEach(x=>$("stage"+x).classList.toggle("current",x.toLowerCase()===s));
}
function nextStage(){
  clearInterval(interval);interval=null;running=false;
  if(stage==="research"){setStage("prep");toast("Research complete. You have one minute to prepare.");}
  else if(stage==="prep"){setStage("speak");toast("Preparation complete. Time to speak!");}
  else{remaining=0;updateTimer();$("timerStage").textContent="SESSION COMPLETE";$("stageBadge").textContent="DONE";$("timerHint").textContent="You did the work. Take a breath, then try another topic."; $("timerMainBtn").textContent="✓ FINISHED";$("progressBar").style.width="100%";toast("Session complete. Great job showing up.");}
}
function updateTimer(){ $("timerDisplay").textContent=fmt(remaining);$("progressBar").style.width=`${((duration-remaining)/duration)*100}%`; }
function nextStage(){
  clearInterval(interval);interval=null;running=false;
  if(stage==="prep"&&mode==="research"){setStage("research");toast("Prep complete. Research time!");}
  else if(stage==="prep"||stage==="research"){setStage("speak");toast("Time to speak. You’ve got this!");}
  else{remaining=0;updateTimer();$("timerStage").textContent="SESSION COMPLETE";$("stageBadge").textContent="DONE";$("timerHint").textContent="You did the work. Take a breath, then try another topic."; $("timerMainBtn").textContent="✓ FINISHED";$("progressBar").style.width="100%";toast("Session complete. Great job showing up.");}
}
function tick(){if(remaining>0){remaining--;updateTimer();if(soundOn&&remaining===0)beep(740,.25)}if(remaining<=0)nextStage()}
function startTimer(){if(running){clearInterval(interval);interval=null;running=false;$("timerMainBtn").textContent="▶ RESUME TIMER";return}if(remaining<=0){nextStage();return}running=true;$("timerMainBtn").textContent="Ⅱ PAUSE TIMER";interval=setInterval(tick,1000)}
function startSession(){
  setStage(mode==="research"?"research":"prep");
  $("timerHint").textContent=mode==="research"?"Research first, then prepare for one minute, then speak.":"Take one minute to prepare, then speak for your chosen duration.";
  toast(mode==="research"?"Deep-dive session ready: research first.":"Quick-start session ready.");
}
$("spinBtn").addEventListener("click",spin);$("rerollBtn").addEventListener("click",()=>setTopic(chooseTopic()));
$("categorySelect").addEventListener("change",()=>{drawWheel();setTopic(chooseTopic())});
$("copyTopicBtn").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(selectedTopic?selectedTopic[1]:$("topicText").textContent);toast("Topic copied to clipboard.")}catch(e){toast("Select and copy the topic text.")}});
document.querySelectorAll(".mode-card").forEach(btn=>btn.addEventListener("click",()=>{mode=btn.dataset.mode;document.querySelectorAll(".mode-card").forEach(b=>b.classList.toggle("active",b===btn));$("researchSetting").style.opacity=mode==="research"?"1":".55";$("researchSetting").style.pointerEvents=mode==="research"?"auto":"none";$("stageResearch").style.display=mode==="research"?"flex":"none";$("timerHint").textContent=mode==="research"?"Deep Dive: research first, then one minute to prepare, then speak.":"Quick Start: one minute to prepare, then speak.";setStage("prep")}));
document.querySelectorAll(".stepper button").forEach(btn=>btn.addEventListener("click",()=>{const target=btn.dataset.target,delta=Number(btn.dataset.delta);if(target==="researchMinutes"){researchMinutes=Math.max(1,Math.min(30,researchMinutes+delta));$(target).textContent=researchMinutes;$("researchStageTime").textContent=`${researchMinutes} min`}else{speakMinutes=Math.max(1,Math.min(30,speakMinutes+delta));$(target).textContent=speakMinutes;$("speakStageTime").textContent=`${speakMinutes} min`}if(stage==="research"&&target==="researchMinutes"||stage==="speak"&&target==="speakMinutes")setStage(stage)}));
$("startSessionBtn").addEventListener("click",startSession);$("timerMainBtn").addEventListener("click",startTimer);
$("resetBtn").addEventListener("click",()=>{setStage(stage);toast("Timer reset.")});
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundLabel").textContent=soundOn?"Sound on":"Sound off";if(soundOn)beep(660,.08)});
$("researchSetting").style.opacity=".55";$("researchSetting").style.pointerEvents="none";$("stageResearch").style.display="none";
drawWheel();setTopic(chooseTopic());setStage("prep");
