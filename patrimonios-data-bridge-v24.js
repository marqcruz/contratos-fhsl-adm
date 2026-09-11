(()=>{
'use strict';
function expose(name,getter){
 try{
  const d=Object.getOwnPropertyDescriptor(window,name);
  if(d&&!d.configurable)return;
  Object.defineProperty(window,name,{configurable:true,enumerable:false,get(){try{return getter()||[]}catch(e){return[]}}});
 }catch(e){}
}
expose('units',()=>typeof units!=='undefined'?units:[]);
expose('locals',()=>typeof locals!=='undefined'?locals:[]);
expose('items',()=>typeof items!=='undefined'?items:[]);
expose('cats',()=>typeof cats!=='undefined'?cats:[]);
try{
 const d=Object.getOwnPropertyDescriptor(window,'currentUser');
 if(!d||d.configurable)Object.defineProperty(window,'currentUser',{configurable:true,enumerable:false,get(){try{return typeof currentUser!=='undefined'?currentUser:null}catch(e){return null}}});
}catch(e){}
})();