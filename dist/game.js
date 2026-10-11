// Sheet headers may use Title Case, UPPERCASE, spaces, hyphens, or underscores.
export function normalizeHeader(header){return header.trim().toLowerCase().replace(/[\s-]+/g,'_');}
export function parseCSV(text){
  text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell==='')quoted=!quoted;else throw Error('Unexpected quote in CSV');}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw Error('Unclosed CSV quote');if(cell||row.length){row.push(cell);rows.push(row);}if(!rows.length)throw Error('Empty CSV');const headers=rows.shift().map(normalizeHeader);if(new Set(headers).size!==headers.length)throw Error('Duplicate CSV columns');return {headers,rows:rows.map(r=>{if(r.length!==headers.length)throw Error('CSV row has the wrong number of columns');return Object.fromEntries(headers.map((h,i)=>[h,r[i].trim()]));})};
}
function teamLookup(teams){
  const lookup=new Map();
  for(const team of teams)for(const name of [team.id,team.name,...(team.aliases||[])].filter(Boolean)){
    const key=name.toLowerCase();
    if(lookup.has(key)&&lookup.get(key)!==team.id)throw Error('Ambiguous team name: '+name);
    lookup.set(key,team.id);
  }
  return lookup;
}
function feed(text,label){try{return parseCSV(text);}catch(e){throw Error(label+': '+e.message);}}
function required(headers,keys,label){for(const key of keys)if(!headers.includes(key))throw Error(label+': missing column '+key);}
function invalid(label,row,field,message){throw Error(`${label}, data row ${row+2}, ${field}: ${message}`);}
export function readOwnership(text,territories,teams){
 const {headers,rows}=feed(text,'Ownership');required(headers,['territory_id','claimed_by','locked_by'],'Ownership');
 const ids=new Set(territories.map(t=>t.id)),valid=teamLookup(teams),state={};
 for(const [i,r] of rows.entries()){
  if(!ids.has(r.territory_id))invalid('Ownership',i,'Territory ID','Unknown territory: '+r.territory_id);
  if(state[r.territory_id])invalid('Ownership',i,'Territory ID','Duplicate territory: '+r.territory_id);
  for(const k of ['claimed_by','locked_by'])if(r[k]){
   const team=valid.get(r[k].toLowerCase());if(!team){const column=headers.indexOf(k)+1;let n=column,letter='';while(n){n--;letter=String.fromCharCode(65+n%26)+letter;n=Math.floor(n/26);}const territory=territories.find(t=>t.id===r.territory_id);invalid('Ownership',i,k,`Unknown team "${r[k]}" in Ownership!${letter}${i+2} (${territory.name}). Choose a team from the dropdown or clear this cell. Recognized teams: ${teams.map(t=>t.name||t.id).join(', ')}.`);}r[k]=team;
  }
  state[r.territory_id]={claimed:r.claimed_by,locked:r.locked_by};
 }
 const missing=territories.filter(t=>!state[t.id]);if(missing.length)throw Error('Ownership sheet must contain every territory; missing: '+missing.map(t=>t.name).join(', '));return state;
}
export function readHistory(text,territories,teams){
 const {headers,rows}=feed(text,'History');required(headers,['territory_id','reveal_order','status'],'History');
 if(!headers.includes('team_id')&&!headers.includes('team'))throw Error('History: missing column Team ID or Team');
 const ids=new Set(territories.map(t=>t.id)),valid=teamLookup(teams),seen=new Set(),orders=new Set();
 for(const [i,r] of rows.entries()){
  const value=headers.includes('team_id')?r.team_id:r.team;r.team=valid.get(value.toLowerCase());
  if(!r.team)invalid('History',i,'Team','Unknown history team: '+value);
  if(!ids.has(r.territory_id))invalid('History',i,'Territory ID','Unknown history territory: '+r.territory_id);
  const key=r.team+'/'+r.territory_id;if(seen.has(key))invalid('History',i,'Territory ID','Duplicate team/territory history row');seen.add(key);
  if(!['Not opened','Active','Succeeded','Failed','Abandoned'].includes(r.status))invalid('History',i,'Status','Invalid challenge status: '+r.status);
  if(r.status==='Not opened'){if(r.reveal_order)invalid('History',i,'Reveal Order','Unopened challenge has a reveal order');}
  else{
   if(!/^[1-9]\d*$/.test(r.reveal_order))invalid('History',i,'Reveal Order','Opened challenge needs a positive reveal order');
   const order=r.team+'/'+r.reveal_order;if(orders.has(order))invalid('History',i,'Reveal Order','Duplicate reveal order for a team');orders.add(order);
  }r.order=Number(r.reveal_order)||0;
 }return rows;
}
export function owner(state){return state?.locked||state?.claimed||'';}
export function readTeams(text){
  const {headers,rows}=feed(text,'Team settings');
  required(headers,['team','color','enabled'],'Team settings');
  const ids=new Set(),names=new Set(),active=[];
  for(const [index,row] of rows.entries()){
    const id=headers.includes('team_id')?row.team_id:row.team;
    const name=headers.includes('slot')?row.slot:row.team;
    if(headers.includes('team_id')&&!/^team-[1-4]$/.test(id))invalid('Team settings',index,'Team ID','Keep the permanent ID team-1, team-2, team-3, or team-4');
    if(!id||ids.has(id.toLowerCase()))invalid('Team settings',index,'Team ID','Teams need unique nonempty IDs');ids.add(id.toLowerCase());
    if(!name||names.has(name.toLowerCase()))invalid('Team settings',index,headers.includes('slot')?'Slot':'Team','Teams need unique nonempty names');names.add(name.toLowerCase());
    if(!/^#[a-f0-9]{6}$/i.test(row.color))invalid('Team settings',index,'Color','Invalid team color: '+row.team+'; use #RRGGBB');
    if(!['yes','no'].includes(row.enabled.toLowerCase()))invalid('Team settings',index,'Enabled','Team enabled must be Yes or No');
    // New sheets use permanent slots; legacy sheets preserve the original row-based aliases.
    const slot=/^team-[1-4]$/.test(id)?Number(id.slice(-1))-1:index;
    if(row.enabled.toLowerCase()==='yes')active.push({id,name,color:row.color,aliases:[row.team,["Blue","Red","Green","Purple"][slot],headers.includes('team_id')?'Team '+(headers.includes('slot')?index+1:slot+1):null,...(row.aliases||"").split("|")].map(name=>name?.trim()).filter(Boolean)});
  }
  if(active.length<2||active.length>4)throw Error('Enable between 2 and 4 teams');
  teamLookup(active);return active;
}
export function eligibility(history,team,territory){const records=history.filter(r=>r.team===team),active=records.filter(r=>r.status==='Active'),record=records.find(r=>r.territory_id===territory);if(active.length>1)return {allowed:false,message:'Your sheet has multiple active challenges. Resolve them before revealing another.'};if(active.length&&active[0].territory_id!==territory)return {allowed:false,message:'Resolve your active challenge before revealing another.'};if(record?.status==='Succeeded')return {allowed:true,revisit:true};if(record?.status==='Failed'||record?.status==='Abandoned'){return {allowed:false,message:'This challenge is finished. Failed or abandoned challenges cannot be retried.'};}return {allowed:true};}
