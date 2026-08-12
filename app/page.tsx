"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { destinies, type DestinyId, type Zone, type ZoneId, zones } from "./data";

type Screen = "home" | "zone" | "album" | "result";
type Progress = { completed: ZoneId[]; destiny: DestinyId | null };
const initialProgress: Progress = { completed: [], destiny: null };

function useAmbientMusic(muted: boolean) {
  const audioRef = useRef<{ context: AudioContext; timer: ReturnType<typeof setInterval> } | null>(null);

  useEffect(() => {
    if (muted || typeof window === "undefined") {
      if (audioRef.current) {
        clearInterval(audioRef.current.timer);
        void audioRef.current.context.close();
        audioRef.current = null;
      }
      return;
    }

    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    master.gain.value = 0.075;
    filter.type = "lowpass";
    filter.frequency.value = 1150;
    filter.Q.value = 0.8;
    master.connect(filter).connect(context.destination);

    const pad = [146.83, 220, 293.66].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 4 - 4;
      gain.gain.value = index === 1 ? 0.12 : 0.075;
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return oscillator;
    });

    const notes = [440, 523.25, 587.33, 659.25, 587.33, 523.25];
    let noteIndex = 0;
    const playBell = () => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndex++ % notes.length];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      oscillator.connect(gain).connect(master);
      oscillator.start(now);
      oscillator.stop(now + 2.7);
    };
    playBell();
    const timer = setInterval(playBell, 3200);
    audioRef.current = { context, timer };

    return () => {
      clearInterval(timer);
      pad.forEach((oscillator) => oscillator.stop());
      void context.close();
      audioRef.current = null;
    };
  }, [muted]);
}

function TopBar({ progress, muted, onMute, onHome, onAlbum, showBack = false }:{progress:Progress;muted:boolean;onMute:()=>void;onHome:()=>void;onAlbum:()=>void;showBack?:boolean}) {
  return <header className="topbar">
    <button className={`round-button ${showBack ? "" : "ghost-space"}`} onClick={onHome} aria-label="返回玉米星球">{showBack ? "←" : ""}</button>
    <div className="top-actions">
      <button className="pill-button" onClick={onAlbum}><span>记忆册</span><strong>{progress.completed.length}/7</strong></button>
      <button className="round-button" onClick={onMute} aria-label={muted ? "打开声音" : "静音"}>{muted ? "♩" : "♪"}</button>
    </div>
  </header>;
}

function Home({progress, muted, onMute, onOpenZone, onAlbum, onResult}:{progress:Progress;muted:boolean;onMute:()=>void;onOpenZone:(id:ZoneId)=>void;onAlbum:()=>void;onResult:()=>void}) {
  return <main className="home-screen">
    <div className="home-sky" />
    <TopBar progress={progress} muted={muted} onMute={onMute} onHome={()=>{}} onAlbum={onAlbum}/>
    <section className="home-title">
      <p>一粒种子的北方记忆</p>
      <h1>萝北玉米星球</h1>
      <span>点击星球上的符号，去看看我从哪儿来、又会到哪儿去</span>
    </section>
    <div className="planet-wrap" aria-label="七个探索区域">
      <img className="planet" src="/assets/planet.webp" alt="漂浮在东北夜空中的玉米星球" />
      {zones.map(zone => {
        const done = progress.completed.includes(zone.id);
        return <button key={zone.id} className={`zone-pin ${done ? "done" : ""}`} style={zone.position} onClick={()=>onOpenZone(zone.id)} aria-label={`探索${zone.name}${done ? "，已完成" : ""}`}>
          <span className="pin-icon">{done ? "✓" : zone.icon}</span>
          {done && <span className="pin-name">{zone.name}</span>}
        </button>;
      })}
    </div>
    <aside className="seed-guide">
      <img src="/assets/seed.webp" alt="戴红色花布头巾的萌发玉米种子" />
      <div className="speech">{progress.completed.length === 0 ? "嘿，跟紧点儿。我的记忆散在这颗星球上啦。" : progress.completed.length < 7 ? `找回 ${progress.completed.length} 段记忆了，咱接着走！` : "七段都找齐了！来看看这一路都去了哪儿。"}</div>
    </aside>
    {progress.completed.length === 7 && <button className="result-cta" onClick={onResult}>查看我的完整旅程 <span>→</span></button>}
    <div className="scroll-hint">自由探索 · 没有标准顺序</div>
  </main>;
}

function SceneInteraction({zone, done, currentDestiny, onComplete}:{zone:Zone;done:boolean;currentDestiny:DestinyId|null;onComplete:(destiny?:DestinyId)=>void}) {
  const [amount,setAmount]=useState(done ? 100 : 0);
  const [weather,setWeather]=useState({title:"等待风来", detail:"云层里还藏着一条天气消息。"});
  const [choice,setChoice]=useState("");
  const [pressing,setPressing]=useState(false);
  const [replaying,setReplaying]=useState(false);
  const activeDone=done&&!replaying;
  const holdTimer=useRef<ReturnType<typeof setInterval>|null>(null);
  const soilStart=useRef<number|null>(null);
  const soilBase=useRef(0);
  const stopHold=()=>{if(holdTimer.current) clearInterval(holdTimer.current);holdTimer.current=null;setPressing(false);};
  const startHold=()=>{if(activeDone||holdTimer.current)return;setPressing(true);holdTimer.current=setInterval(()=>setAmount(v=>Math.min(100,v+2)),50);};
  useEffect(()=>{if(amount>=100&&!activeDone){stopHold();onComplete();}},[amount,activeDone]);
  useEffect(()=>()=>{if(holdTimer.current)clearInterval(holdTimer.current)},[]);

  if(activeDone && zone.id!=="processing") return <div className="completed-note"><span>✓</span><p>这段记忆已经找回。田野里的变化已经发生，但你仍然可以重看卡牌，或者再体验一次互动。</p><div className="choice-row"><button onClick={()=>onComplete()}>再看一次卡牌</button><button onClick={()=>{setAmount(0);setChoice("");setReplaying(true)}}>再体验一次</button></div></div>;
  if(zone.id==="luobei") return <div className="map-interaction"><div className="map-lines"/><button className="coordinate" onClick={()=>onComplete()}><span>⌖</span><b>点亮萝北</b></button><p>沿着河流与山脉，找到正在呼吸的光点</p></div>;
  if(zone.id==="soil") return <div className="soil-interaction"><div className="sprout-reveal" style={{transform:`translateY(${60-amount*.6}px)`,opacity:amount/100}}>♧</div><div className="soil-dragger" role="slider" tabIndex={0} aria-label="向上拖动土层" aria-valuemin={0} aria-valuemax={100} aria-valuenow={amount} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);soilStart.current=e.clientY;soilBase.current=amount}} onPointerMove={e=>{if(soilStart.current!==null)setAmount(Math.min(100,Math.max(0,soilBase.current+(soilStart.current-e.clientY)*1.35)))}} onPointerUp={e=>{soilStart.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{soilStart.current=null}} onKeyDown={e=>{if(e.key==="ArrowUp"||e.key==="ArrowRight")setAmount(v=>Math.min(100,v+10));if(e.key==="ArrowDown"||e.key==="ArrowLeft")setAmount(v=>Math.max(0,v-10))}}><div className="soil-fill" style={{height:`${amount}%`}}/><span>☝</span><strong>{amount<100?"按住这里向上拖":"根系醒来了"}</strong><small>{Math.round(amount)}%</small></div><button className="soil-tap-help" onClick={()=>setAmount(v=>Math.min(100,v+25))}>拖动不方便？点这里继续松土</button><p>手指按住深色土层向上推；也可以连续点击辅助按钮。</p></div>;
  if(zone.id==="weather") return <div className="weather-interaction"><button className="cloud-button" onClick={()=>{const values=[{title:"晴光穿过云层",detail:"阳光落在叶片上，玉米把光慢慢存进籽粒。"},{title:"秋雨落进田野",detail:"雨水补充了土壤水分，也提醒人们留意田间湿度。"},{title:"一阵早霜来了",detail:"温度突然降低，生长节奏也跟着按下了慢放键。"}];setWeather(values[Math.floor(Math.random()*values.length)]);setAmount(v=>v+1)}}>☁<span>碰一碰云</span></button><div className="weather-result"><strong>{weather.title}</strong><small>{weather.detail}</small></div><button className="cream-button" disabled={amount===0} onClick={()=>onComplete()}>记住这场天气</button></div>;
  if(zone.id==="field") return <div className="dialogue-interaction"><div className="bug">●<span>小邻居</span></div><p>虫子问：“长成一片森林，是什么感觉？”</p><div className="choice-row"><button onClick={()=>setChoice("风一吹，整片青纱帐就一起沙沙说话。叶片接住阳光，根在看不见的地方继续往深处走。")}>听见风</button><button onClick={()=>setChoice("先把根扎稳，再把夏天一节一节举高。生长不是一瞬间，是每天都多一点点。")}>继续长</button></div>{choice && <div className="reply"><span>{choice}</span><button onClick={()=>onComplete()}>把这句话写进记忆</button></div>}</div>;
  if(zone.id==="harvest") return <div className="harvest-interaction"><div className="harvester" style={{transform:`translateX(${amount*.85}%)`}}>▰</div><div className="hold-track"><i style={{width:`${amount}%`}}/></div><button className={`hold-button ${pressing?"pressing":""}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);startHold()}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);stopHold()}} onPointerCancel={stopHold} onContextMenu={e=>e.preventDefault()} onKeyDown={e=>{if((e.key===" "||e.key==="Enter")&&!e.repeat)startHold()}} onKeyUp={stopHold}>按住不放<br/>启动收割机</button><p>{amount < 100 ? `${amount}% · ${pressing?"机器正在穿过田野":"按住圆形按钮约 3 秒"}` : "田野把金黄装进了口袋"}</p></div>;
  if(zone.id==="transport") return <div className="route-interaction"><p>粮食已经烘干。下一站往哪儿走？两条路没有好坏，只会看见不同的沿途。</p><div className="route-map"><span className="silo">♜</span><i/><span className="destination">◎</span></div><div className="choice-row"><button onClick={()=>setChoice("公路")}>沿公路出发</button><button onClick={()=>setChoice("铁路")}>搭火车远行</button></div>{choice&&<div className="route-moving"><strong>正在沿{choice}出发 →</strong><span>{choice==="公路"?"卡车从粮仓驶出，穿过村庄与暮色，把秋天送往下一站。":"车厢在夜里连成一条发亮的线，粮食跟着铁轨去往更远的地方。"}</span><button className="cream-button" onClick={()=>onComplete()}>收下秋天车站卡</button></div>}</div>;
  return <div className="destiny-interaction"><p>{currentDestiny?"你已经选过一种命运，也可以继续翻开另外三种。最后一次选择会写进结果页。":"一粒玉米，可以用四种方式抵达人间。先选一种看看，之后仍可回来体验其他去向。"}</p><div className="destiny-grid">{destinies.map(d=><button className={currentDestiny===d.id?"selected":""} key={d.id} onClick={()=>onComplete(d.id)}><span>{d.name}</span><small>{d.title}</small>{currentDestiny===d.id&&<b>当前选择</b>}</button>)}</div><em>没有更好的答案，只有不同的旅程 · 可以反复选择</em></div>;
}

function ZoneScreen({zone,progress,muted,onMute,onHome,onAlbum,onUnlock}:{zone:Zone;progress:Progress;muted:boolean;onMute:()=>void;onHome:()=>void;onAlbum:()=>void;onUnlock:(id:ZoneId,destiny?:DestinyId)=>void}) {
  return <main className="scene-screen" style={{"--scene":`url(${zone.scene})`} as React.CSSProperties}>
    <div className="scene-backdrop" />
    <TopBar progress={progress} muted={muted} onMute={onMute} onHome={onHome} onAlbum={onAlbum} showBack/>
    <section className="scene-heading"><span>{zone.number}/07 · {zone.eyebrow}</span><h1>{zone.name}</h1><p>{zone.prompt}</p></section>
    <section className="interaction-panel"><SceneInteraction zone={zone} done={progress.completed.includes(zone.id)} currentDestiny={progress.destiny} onComplete={(destiny)=>onUnlock(zone.id,destiny)}/></section>
    <div className="scene-character"><img src="/assets/seed.webp" alt="小玉米"/><span>咱试试看！</span></div>
  </main>;
}

function CardModal({zone,destiny,onClose}:{zone:Zone;destiny:DestinyId|null;onClose:()=>void}) {
  const [flipped,setFlipped]=useState(false); const [notes,setNotes]=useState(false);
  const destinyData=zone.id==="processing" ? destinies.find(d=>d.id===destiny) : null;
  const card=destinyData?.card ?? zone.card; const title=destinyData?.title ?? zone.cardTitle; const poetic=destinyData?.poetic ?? zone.poetic; const fact=destinyData?.fact ?? zone.fact; const quote=destinyData?.quote ?? zone.quote;
  return <div className="modal-shell" role="dialog" aria-modal="true" aria-label={`获得${title}`}>
    <div className="modal-stars"/>
    <button className="modal-close" onClick={onClose} aria-label="关闭卡牌">×</button>
    <p className="unlock-label">{zone.id==="processing" ? "命运解锁" : "记忆解锁"} · {zone.number}/07</p>
    <div className={`flip-card ${flipped ? "is-flipped" : ""}`} onClick={()=>setFlipped(true)}>
      <div className="card-face card-back"><div className="back-emblem">♧</div><span>萝北玉米星球</span><small>点击翻开记忆</small></div>
      <div className="card-face card-front"><img src={card} alt={`${title}卡面`}/></div>
    </div>
    {flipped && <div className="card-actions"><h2>{title}</h2><p>{poetic}</p><button className="cream-button" onClick={()=>setNotes(!notes)}>{notes ? "收起田野注记" : "查看田野注记"}</button>{notes&&<div className="field-notes"><p>{fact}</p><blockquote>“{quote}”</blockquote><small>{zone.id==="processing" ? "具体本地产业来源待调研补充。" : `来源：${zone.source}`}</small></div>}<button className="text-button" onClick={onClose}>收进记忆册，继续探索 →</button></div>}
  </div>;
}

function Album({progress,onHome,onOpenCard,onResult}:{progress:Progress;onHome:()=>void;onOpenCard:(zone:Zone)=>void;onResult:()=>void}) {
  return <main className="collection-screen"><header className="collection-header"><button className="round-button" onClick={onHome}>←</button><div><p>一粒种子的旅行档案</p><h1>我的记忆册</h1></div><span>{progress.completed.length}/7</span></header>
    <section className="collection-intro"><p>卡牌按照玉米的旅程排列。未找到的记忆，暂时还藏在夜色里。</p><div className="progress-line"><i style={{width:`${progress.completed.length/7*100}%`}}/></div></section>
    <section className="card-grid">{zones.map(zone=>{const unlocked=progress.completed.includes(zone.id);const destiny=destinies.find(d=>d.id===progress.destiny);const card=zone.id==="processing"&&destiny ? destiny.card : zone.card;return <button key={zone.id} className={`album-card ${unlocked?"":"locked"}`} disabled={!unlocked} onClick={()=>onOpenCard(zone)}>{unlocked?<img src={card} alt={`${zone.name}卡面`}/>:<div className="mini-card-back"><span>♧</span><small>{zone.number}/07</small></div>}<strong>{unlocked ? (zone.id==="processing"&&destiny?destiny.title:zone.cardTitle) : "记忆尚未找到"}</strong></button>})}</section>
    {progress.completed.length===7&&<button className="result-cta album-result" onClick={onResult}>生成完整旅程 <span>→</span></button>}
  </main>;
}

function loadPosterImage(src:string) {
  return new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src});
}

function drawWrappedText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,maxWidth:number,lineHeight:number,maxLines=4) {
  const characters=Array.from(text);let line="";let lineNumber=0;
  for(const character of characters){const test=line+character;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y+lineNumber*lineHeight);line=character;lineNumber++;if(lineNumber>=maxLines-1)break}else line=test}
  if(line&&lineNumber<maxLines)ctx.fillText(line,x,y+lineNumber*lineHeight);
}

async function makeJourneyPoster(progress:Progress) {
  const destiny=destinies.find(d=>d.id===progress.destiny)??destinies[0];
  const width=1080,headerHeight=600,stepHeight=470,footerHeight=430,height=headerHeight+zones.length*stepHeight+footerHeight;
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
  ctx.fillStyle="#e9dfc7";ctx.fillRect(0,0,width,height);
  const gradient=ctx.createLinearGradient(0,0,0,headerHeight);gradient.addColorStop(0,"#071a2c");gradient.addColorStop(1,"#17342e");ctx.fillStyle=gradient;ctx.fillRect(0,0,width,headerHeight);
  ctx.textAlign="center";ctx.fillStyle="#dfb94e";ctx.font="28px serif";ctx.fillText("萝北玉米星球 · 完整旅程",width/2,105);
  ctx.fillStyle="#f4dfa0";ctx.font="bold 82px serif";ctx.fillText("从黑土地，抵达人间",width/2,235);
  ctx.fillStyle="#eee2c3";ctx.font="30px sans-serif";ctx.fillText("一粒玉米找回了来处，也选好了去向。",width/2,310);
  ctx.strokeStyle="#caa64e";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(180,385);ctx.lineTo(900,385);ctx.stroke();
  ctx.fillStyle="#f0cf70";ctx.font="24px sans-serif";ctx.fillText("七段记忆 · 一种由自己选择的命运",width/2,445);

  const cardSources=zones.map(zone=>zone.id==="processing"?destiny.card:zone.card);
  const images=await Promise.all(cardSources.map(loadPosterImage));
  zones.forEach((zone,index)=>{const y=headerHeight+index*stepHeight;const isDestiny=zone.id==="processing";const title=isDestiny?destiny.title:zone.cardTitle;const poetic=isDestiny?destiny.poetic:zone.poetic;
    if(index%2===0){ctx.fillStyle="#f3ead4";ctx.fillRect(0,y,width,stepHeight)}
    ctx.fillStyle="#16332a";ctx.beginPath();ctx.arc(92,y+84,42,0,Math.PI*2);ctx.fill();ctx.fillStyle="#efcc6a";ctx.font="bold 24px sans-serif";ctx.textAlign="center";ctx.fillText(zone.number,92,y+93);
    ctx.fillStyle="#8a6738";ctx.font="23px sans-serif";ctx.textAlign="left";ctx.fillText(zone.eyebrow,160,y+66);
    ctx.fillStyle="#233126";ctx.font="bold 42px serif";ctx.fillText(title,160,y+120);
    ctx.fillStyle="#5f5a48";ctx.font="29px serif";drawWrappedText(ctx,poetic,160,y+178,510,47,4);
    const cardW=236,cardH=295,cardX=780,cardY=y+72;ctx.shadowColor="#3c2c1c55";ctx.shadowBlur=20;ctx.drawImage(images[index],cardX,cardY,cardW,cardH);ctx.shadowBlur=0;
    if(index<zones.length-1){ctx.strokeStyle="#ad8947";ctx.setLineDash([8,12]);ctx.beginPath();ctx.moveTo(92,y+132);ctx.lineTo(92,y+stepHeight+42);ctx.stroke();ctx.setLineDash([])}
  });
  const footerY=headerHeight+zones.length*stepHeight;ctx.fillStyle="#132d29";ctx.fillRect(0,footerY,width,footerHeight);ctx.textAlign="center";ctx.fillStyle="#d5ae50";ctx.font="24px sans-serif";ctx.fillText("我的最终去向",width/2,footerY+90);ctx.fillStyle="#f1d577";ctx.font="bold 72px serif";ctx.fillText(destiny.name,width/2,footerY+180);ctx.fillStyle="#f0e2bd";ctx.font="30px serif";drawWrappedText(ctx,destiny.quote,width/2,footerY+245,760,44,3);ctx.fillStyle="#aebbae";ctx.font="20px sans-serif";ctx.fillText("萝北玉米星球 · 记忆旅程",width/2,footerY+370);
  return new Promise<string>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(URL.createObjectURL(blob)):reject(new Error("Image export failed")),"image/png"));
}

function Result({progress,onHome}:{progress:Progress;onHome:()=>void}) {
  const destiny=destinies.find(d=>d.id===progress.destiny) ?? destinies[0];
  const [poster,setPoster]=useState<string|null>(null);const [creating,setCreating]=useState(false);
  useEffect(()=>()=>{if(poster)URL.revokeObjectURL(poster)},[poster]);
  const createPoster=async()=>{setCreating(true);try{if(poster)URL.revokeObjectURL(poster);setPoster(await makeJourneyPoster(progress))}finally{setCreating(false)}};
  return <main className="result-screen"><header className="result-hero"><button className="round-button" onClick={onHome}>←</button><p>萝北玉米星球 · 完整旅程</p><h1>从黑土地<br/>抵达人间</h1><span>一粒玉米找回了来处，也选好了去向。</span><img src="/assets/seed.webp" alt="完成旅行的小玉米"/></header>
    <section className="journey"><div className="journey-line"/>{zones.map((zone,index)=>{const isDestiny=zone.id==="processing";return <article className="journey-step" key={zone.id}><div className="step-number">{zone.number}</div><div className="journey-copy"><small>{zone.eyebrow}</small><h2>{isDestiny?destiny.title:zone.cardTitle}</h2><p>{isDestiny?destiny.poetic:zone.poetic}</p></div><img src={isDestiny?destiny.card:zone.card} alt={`${zone.name}记忆卡`}/>{index<6&&<span className="down-mark">↓</span>}</article>})}</section>
    <footer className="result-footer"><span>我的最终去向</span><h2>{destiny.name}</h2><p>{destiny.quote}</p><button className="cream-button" disabled={creating} onClick={createPoster}>{creating?"正在生成长图…":"生成旅程长图"}</button><button className="text-button" onClick={onHome}>回到玉米星球</button><small>内容中的地方产业信息将在正式调研后继续核实与补充。</small></footer>
    {poster&&<div className="poster-preview" role="dialog" aria-modal="true" aria-label="旅程长图预览"><div className="poster-toolbar"><div><strong>旅程长图已生成</strong><span>手机可长按图片保存，电脑可点击下载。</span></div><button onClick={()=>setPoster(null)} aria-label="关闭长图预览">×</button></div><img src={poster} alt="萝北玉米星球完整旅程长图"/><a href={poster} download={`萝北玉米星球_${destiny.name}_旅程.png`}>下载图片</a></div>}
  </main>;
}

export default function HomePage() {
  const [screen,setScreen]=useState<Screen>("home"); const [active,setActive]=useState<ZoneId>("luobei"); const [progress,setProgress]=useState<Progress>(initialProgress); const [muted,setMuted]=useState(true); const [card,setCard]=useState<Zone|null>(null); const [hydrated,setHydrated]=useState(false); const audioRef=useRef<HTMLAudioElement|null>(null);
  useEffect(()=>{try{const saved=localStorage.getItem("luobei-corn-progress-v1");if(saved)setProgress(JSON.parse(saved));const sound=localStorage.getItem("luobei-corn-muted");if(sound)setMuted(sound!=="false")}catch{}setHydrated(true)},[]);
  useEffect(()=>{if(hydrated)localStorage.setItem("luobei-corn-progress-v1",JSON.stringify(progress))},[progress,hydrated]);
  useEffect(()=>{if(hydrated)localStorage.setItem("luobei-corn-muted",String(muted))},[muted,hydrated]);
  const activeZone=useMemo(()=>zones.find(z=>z.id===active)!,[active]);
  const openZone=(id:ZoneId)=>{setActive(id);setScreen("zone")};
  const unlock=(id:ZoneId,destiny?:DestinyId)=>{setProgress(prev=>({completed:prev.completed.includes(id)?prev.completed:[...prev.completed,id],destiny:destiny??prev.destiny}));setCard(zones.find(z=>z.id===id)!)};
  const closeCard=()=>{const returnToDestiny=card?.id==="processing";setCard(null);setScreen(returnToDestiny?"zone":"home")};
  const toggleSound=()=>{const nextMuted=!muted;setMuted(nextMuted);if(nextMuted){audioRef.current?.pause()}else if(audioRef.current){audioRef.current.volume=.42;void audioRef.current.play().catch(()=>setMuted(true))}};
  if(!hydrated)return <main className="loading-screen"><div className="loading-seed">♧</div><p>正在唤醒玉米星球…</p></main>;
  return <><audio ref={audioRef} src="/assets/night-field.wav" loop preload="auto" aria-hidden="true"/>{screen==="home"&&<Home progress={progress} muted={muted} onMute={toggleSound} onOpenZone={openZone} onAlbum={()=>setScreen("album")} onResult={()=>setScreen("result")}/>} {screen==="zone"&&<ZoneScreen zone={activeZone} progress={progress} muted={muted} onMute={toggleSound} onHome={()=>setScreen("home")} onAlbum={()=>setScreen("album")} onUnlock={unlock}/>} {screen==="album"&&<Album progress={progress} onHome={()=>setScreen("home")} onOpenCard={setCard} onResult={()=>setScreen("result")}/>} {screen==="result"&&<Result progress={progress} onHome={()=>setScreen("home")}/>} {card&&<CardModal zone={card} destiny={progress.destiny} onClose={closeCard}/>}</>;
}
