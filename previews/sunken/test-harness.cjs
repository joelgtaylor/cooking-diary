const fs=require('node:fs'),path=require('node:path');
const {game}=require('../../keen/tests/game-harness.cjs');
function previewGame(options={}){
 const html=fs.readFileSync(options.htmlPath||path.join(__dirname,'index.html'),'utf8');
 const elements=new Map(),actions=[],events={};let doc;
 const gradient={addColorStop(){}};
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>gradient),set:(o,k,v)=>(o[k]=v,true)});
 function element(id,attrs=''){
  const el={id,hidden:/\bhidden\b/.test(attrs),disabled:false,dataset:{},style:{display:'',setProperty(k,v){this[k]=v;}},textContent:'',value:'100',checked:false,clientWidth:1280,clientHeight:720,listeners:{},children:[],classList:{toggle(){},remove(){}},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},setAttribute(k,v){this[k]=v;},focus(){doc.activeElement=this;},matches(){return false;},getContext:()=>ctx,getClientRects(){return this.hidden?[]:[{}];},querySelectorAll(){return [...elements.values()].filter(e=>e.tag==='button');},querySelector(){return element('small-'+id);},replaceChildren(){this.children=[];},append(x){this.children.push(x);},setPointerCapture(){},getBoundingClientRect(){return{left:0,top:400,right:156,bottom:556,width:156,height:156};},closest(){return this.dataset.action?this:null;}};
  elements.set(id,el);return el;
 }
 for(const m of html.matchAll(/<([\w-]+)([^>]*\bid="([^"]+)"[^>]*)>/g)){const el=element(m[3],m[2]);el.tag=m[1];}
 for(const m of html.matchAll(/<button[^>]*data-action="([^"]+)"[^>]*>/g)){const el=element('action-'+m[1]);el.dataset.action=m[1];actions.push(el);}
 doc={hidden:false,fullscreenElement:null,activeElement:null,getElementById:id=>elements.get(id)||null,querySelectorAll:s=>s==='[data-action]'?actions:[],querySelector:s=>actions.find(e=>s.includes('"'+e.dataset.action+'"')),addEventListener(type,fn,capture){(events[type]??=[]).push({fn,capture});},createElement:tag=>element('created-'+Math.random()),elementFromPoint:()=>null};
 const a=game({}, {html,context:ctx,search:'',globals:{document:doc,innerWidth:1280,innerHeight:720,matchMedia:()=>({matches:false})}});
 a.run('completeArtworkLoading()');
 function fire(el,type,props={}){const event={button:0,pointerId:1,key:'',code:'',detail:1,clientX:25,clientY:478,repeat:false,target:el,preventDefault(){},stopPropagation(){},...props};for(const fn of el.listeners[type]||[])fn(event);}
 function key(key,code=key,type='keydown'){
  let stopped=false;const e={key,code,repeat:false,target:elements.get('gameStage'),preventDefault(){},stopImmediatePropagation(){stopped=true;}};
  for(const {fn}of [...(events[type]||[])].sort((a,b)=>Number(b.capture)-Number(a.capture))){fn(e);if(stopped)break;}
 }
 return {...a,elements,actions,doc,key,fire,click:id=>fire(elements.get(id),'click'),pointer:(action,type,props)=>fire(actions.find(e=>e.dataset.action===action),type,props)};
}
module.exports={previewGame};
