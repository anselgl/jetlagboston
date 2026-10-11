import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseCSV,readOwnership,readHistory,readTeams,owner,eligibility} from './dist/game.js';
import {stationDotSvg} from './dist/transit.js';
const territories=JSON.parse(fs.readFileSync('dist/data/territories.json')),teams=JSON.parse(fs.readFileSync('dist/config.json')).teams;
test('permanent IDs preserve game state across repeated renames and settings row reordering',()=>{
 const settings=(name)=>`Team,Color,Enabled,Team ID\n${name},#F3CE3E,Yes,team-4\nBlue,#2273E5,Yes,team-1`;
 const ownership='Territory ID,Claimed By,Locked By\n'+territories.map(t=>`${t.id},Team 4,team-4`).join('\n');
 const history='Team,Territory ID,Reveal Order,Status,Team ID\nOld name,milton,1,Active,team-4';
 for(const name of ['Purple','Yellow','Golden Geese']){
  const ts=readTeams(settings(name));assert.equal(ts[0].id,'team-4');assert.equal(ts[0].name,name);
  assert.equal(readOwnership(ownership,territories,ts).milton.locked,'team-4');
  const records=readHistory(history,territories,ts);assert.equal(records[0].team,'team-4');
  assert.equal(eligibility(records,'team-4','allston',true).allowed,false);
 }
});
test('sheet errors identify the feed, data row, and field',()=>{
 assert.throws(()=>readHistory('Team,Territory ID,Reveal Order,Status\nBlue,milton,1,Typo',territories,teams),/History, data row 2, Status/);
 assert.throws(()=>readTeams('Team,Color,Enabled,Team ID\nBlue,blue,Yes,team-1'),/Team settings, data row 2, Color/);
 assert.throws(()=>readOwnership('Territory ID,Claimed By,Locked By\nmilton,Typo,',territories,teams),/Ownership, data row 2, claimed_by/);
});
test('ownership errors point to the actual cell even when columns move',()=>{
 const csv='Territory,Locked By,Territory ID,Claimed By\nMilton,,milton,Blie';
 assert.throws(()=>readOwnership(csv,territories,teams),error=>error.message.includes('Ownership!D2 (Milton)')&&error.message.includes('"Blie"')&&error.message.includes('Choose a team from the dropdown'));
 assert.throws(()=>readOwnership('Territory ID,Claimed By,Locked By\nmilton,,Typo',territories,teams),/Ownership!C2 \(Milton\)/);
});
test('Yellow is third and Green fourth with permanent identity preserved',()=>{
 const ts=readTeams('Team,Color,Enabled,Slot,Team ID\nBlue,#2273E5,Yes,Blue,team-1\nRed,#EC4F39,Yes,Red,team-2\nYellow,#F3CE3E,Yes,Yellow,team-4\nGreen,#25835B,Yes,Green,team-3');
 assert.deepEqual(ts.map(t=>t.name),['Blue','Red','Yellow','Green']);
 const csv='Territory ID,Claimed By,Locked By\n'+territories.map(t=>`${t.id},Team 3,Team 4`).join('\n');
 assert.deepEqual(readOwnership(csv,territories,ts).milton,{claimed:'team-4',locked:'team-3'});
});
test('Slot is the editable display name while IDs and old labels retain ownership',()=>{
 const settings='Team,Color,Enabled,Aliases,Slot,Team ID\nBlue,#2273E5,Yes,,Ocean Otters,team-1\nRed,#EC4F39,Yes,,Red,team-2\nYellow,#F3CE3E,Yes,Golden Geese,Sunshine,team-4\nGreen,#25835B,Yes,,Green,team-3';
 const ts=readTeams(settings);assert.deepEqual(ts.map(t=>t.name),['Ocean Otters','Red','Sunshine','Green']);
 const csv='Territory ID,Claimed By,Locked By\n'+territories.map(t=>`${t.id},Blue,Golden Geese`).join('\n');
 assert.deepEqual(readOwnership(csv,territories,ts).milton,{claimed:'team-1',locked:'team-4'});
 const records=readHistory('Team,Territory ID,Reveal Order,Status,Team ID\nYellow,milton,1,Active,team-4',territories,ts);
 assert.equal(eligibility(records,'team-4','allston',true).allowed,false);
 assert.throws(()=>readTeams(settings.replace('Sunshine','Ocean Otters')),/Slot.*unique/);
});
test('explicit IDs reject damage instead of silently matching display names',()=>{
 const settings='Team,Color,Enabled,Team ID\nBlue,#2273E5,Yes,team-1\nYellow,#F3CE3E,Yes,team-4';
 const ts=readTeams(settings);
 assert.throws(()=>readTeams(settings.replace('team-4','team-1')),/unique nonempty IDs/);
 assert.throws(()=>readTeams(settings.replace('team-4','yellow')),/permanent ID/);
 assert.throws(()=>readHistory('Team,Territory ID,Reveal Order,Status,Team ID\nBlue,milton,1,Active,',territories,ts),/History, data row 2, Team/);
 assert.throws(()=>readTeams(settings.replace('Yellow','Team 1')),/Ambiguous team name/);
});
test('lock overrides original ownership',()=>assert.equal(owner({claimed:'Blue',locked:'Red'}),'Red'));
test('renamed teams retain original claims and challenge history',()=>{
  const renamed=readTeams('Team,Color,Enabled\nBlue,#2273E5,Yes\nRed,#EC4F39,Yes\nGreen,#25835B,Yes\nYellow,#F3CE3E,Yes');
  const csv='Territory ID,Claimed By,Locked By\n'+territories.map(t=>`${t.id},Purple,yellow`).join('\n');
  const ownership=readOwnership(csv,territories,renamed);
  assert.deepEqual(ownership.milton,{claimed:'Yellow',locked:'Yellow'});
  const history=readHistory('Team,Territory ID,Reveal Order,Status\nPurple,milton,1,Active',territories,renamed);
  assert.equal(history[0].team,'Yellow');
  assert.equal(eligibility(history,'Yellow','allston',true).allowed,false);
  assert.equal(renamed[3].color,'#F3CE3E');
  const later=readTeams('Team,Color,Enabled,Aliases\nBlue,#2273E5,Yes,\nRed,#EC4F39,Yes,\nGreen,#25835B,Yes,\nGold,#F3CE3E,Yes,Yellow');
  assert.equal(readOwnership(csv,territories,later).milton.locked,'Gold');
});
test('team selector supports 2–4 teams and rejects broken settings',()=>{
  const names=['Blue','Red','Green','Purple','Orange','Teal','Pink','Gold'];
  const csv=count=>'team,color,enabled\n'+names.map((id,i)=>`${id},#2273E5,${i<count?'Yes':'No'}`).join('\n');
  for(const count of [2,3,4])assert.equal(readTeams(csv(count)).length,count);
  assert.throws(()=>readTeams(csv(1)),/between 2 and 4/);
  assert.throws(()=>readTeams(csv(4).replace('Green,#2273E5','Blue,#2273E5')),/unique/);
  assert.throws(()=>readTeams(csv(4).replace('#2273E5','blue')),/color/);
  assert.throws(()=>readTeams(csv(5)),/between 2 and 4/);
  const four=readTeams(csv(4));
  const records=readHistory('team,territory_id,reveal_order,status\nGreen,allston,1,Active\nPurple,allston,1,Active',territories,four);
  assert.equal(eligibility(records,'Green','back-bay',true).allowed,false);
  assert.equal(eligibility(records,'Blue','back-bay',true).allowed,true);
});
test('CSV handles quoted commas, embedded newline, escaped quotes and BOM',()=>assert.deepEqual(parseCSV('\uFEFFid,note\r\n1,"Hello, ""Boston""\nagain"\r\n').rows,[{id:'1',note:'Hello, "Boston"\nagain'}]));
test('sheet headers support capitalization, spaces and column reordering',()=>{
  const active=readTeams('Enabled,Color,TEAM\nYes,#2273E5,Blue\nYes,#EC4F39,Red');
  const csv='LOCKED BY,Territory,Claimed By,Territory ID\n'+territories.map(t=>`Red,"${t.name}",Blue,${t.id}`).join('\n');
  assert.equal(owner(readOwnership(csv,territories,active).milton),'Red');
  const records=readHistory('Status,Reveal Order,Territory ID,Team\nActive,1,milton,Blue',territories,active);
  assert.equal(eligibility(records,'Blue','allston',true).allowed,false);
  assert.throws(()=>parseCSV('Claimed By,claimed_by\nBlue,Red'),/Duplicate CSV columns/);
});
test('all 37 territories have geographic features and templates',()=>{const g=JSON.parse(fs.readFileSync('dist/data/territories.geojson'));assert.equal(territories.length,37);assert.equal(g.features.length,37);assert.equal(new Set(g.features.map(f=>f.properties.id)).size,37);for(const t of territories){assert.ok(g.features.some(f=>f.properties.id===t.id&&f.geometry.coordinates.length));assert.ok(fs.existsSync('dist/'+t.challengePath));}assert.equal(Object.keys(readOwnership(fs.readFileSync('sheets/Ownership.csv','utf8'),territories,teams)).length,37);assert.equal(readHistory(fs.readFileSync('sheets/Team-history.csv','utf8'),territories,teams).length,74);});
test('bad ownership feed rejected before replacing board',()=>{assert.throws(()=>readOwnership('territory_id,claimed_by,locked_by\nback-bay,Unknown,',territories,teams),/Unknown team/);assert.throws(()=>readOwnership('territory_id,claimed_by,locked_by\nback-bay,Blue,',territories,teams),/every territory/);});
test('Longwood is separate from Fenway and Chinatown has one exterior boundary',()=>{
  const source=JSON.parse(fs.readFileSync('dist/data/boston-new.geojson')).features;
  const game=JSON.parse(fs.readFileSync('dist/data/territories.geojson')).features;
  const longwood=game.find(f=>f.properties.id==='longwood');
  assert.deepEqual(longwood.geometry.coordinates,[source.find(f=>f.properties.name==='Longwood').geometry.coordinates]);
  assert.deepEqual(game.find(f=>f.properties.id==='fenway-kenmore').geometry.coordinates,[source.find(f=>f.properties.name==='Fenway').geometry.coordinates]);
  const chinatown=game.find(f=>f.properties.id==='chinatown-leather-district');
  assert.equal(chinatown.properties.name,'Chinatown');assert.equal(chinatown.geometry.type,'Polygon');assert.equal(chinatown.geometry.coordinates.length,1);
  // A point on the former internal shared edge is no longer on the exterior.
  assert.ok(!chinatown.geometry.coordinates[0].some(p=>p[0]===-71.059719&&p[1]===42.350138));
});
test('one active challenge per team',()=>{assert.equal(eligibility([{team:'Blue',territory_id:'a',status:'Active',order:1}],'Blue','b',true).allowed,false);assert.equal(eligibility([{team:'Red',territory_id:'a',status:'Active',order:1}],'Blue','b',true).allowed,true);});
test('MBTA overlay covers subway, extensions, Silver Line and commuter rail',()=>{
  const data=JSON.parse(fs.readFileSync('dist/data/mbta-routes.geojson'));
  for(const id of ['Red','Blue','Orange','Green-B','Green-C','Green-D','Green-E','Mattapan','741','CR-Worcester','CR-Fairmount'])assert.ok(data.features.some(f=>f.properties.routeId===id),id);
  assert.ok(data.features.some(f=>f.properties.routeId==='Green-E'&&f.geometry.coordinates.some(p=>p[1]>42.4)));
  for(const f of data.features){assert.equal(f.geometry.type,'LineString');assert.ok(f.geometry.coordinates.length>1);assert.match(f.properties.color,/^#[0-9A-F]{6}$/i);assert.ok(!f.properties.routeId.startsWith('Shuttle'));assert.ok(f.geometry.coordinates.every(([x,y])=>x>-73&&x<-69&&y>41&&y<44));}
});
test('retry eligibility respects card and later reveals',()=>{const failed=[{team:'Blue',territory_id:'a',status:'Failed',order:1}];assert.equal(eligibility(failed,'Blue','a',true).allowed,true);assert.equal(eligibility(failed,'Blue','a',false).allowed,false);assert.equal(eligibility([...failed,{team:'Blue',territory_id:'b',status:'Failed',order:2}],'Blue','a',true).allowed,false);});
test('station data covers every displayed route and preserves transfer connections',()=>{
  const routes=JSON.parse(fs.readFileSync('dist/data/mbta-routes.geojson')).features;
  const stations=JSON.parse(fs.readFileSync('dist/data/mbta-stations.geojson')).features;
  assert.equal(new Set(stations.map(s=>s.properties.id)).size,stations.length);
  for(const id of new Set(routes.map(r=>r.properties.routeId)))assert.ok(stations.some(s=>s.properties.routes.some(r=>r.id===id)),id);
  for(const s of stations){assert.equal(s.geometry.type,'Point');const [lng,lat]=s.geometry.coordinates;assert.ok(lng>-73&&lng<-69&&lat>41&&lat<44);for(const r of s.properties.routes)assert.ok(routes.some(f=>f.properties.routeId===r.id&&f.properties.color===r.color));}
  const south=stations.find(s=>s.properties.name==='South Station');
  for(const id of ['Red','CR-Worcester','741'])assert.ok(south.properties.routes.some(r=>r.id===id));
  for(const name of ['Medford/Tufts','Wonderland','Riverside','Mattapan'])assert.ok(stations.some(s=>s.properties.name===name),name);
  const park=stations.find(s=>s.properties.name==='Park Street');
  const icon=stationDotSvg(park.properties.routes);
  assert.equal((icon.match(/fill="#00843D"/g)||[]).length,1,'Green branches share one color sector');
  assert.ok(icon.includes('#DA291C'),'Red connection remains visible');
  assert.throws(()=>stationDotSvg([{color:'red" onclick="alert(1)'}]),/Invalid station colors/);
});
test('history rejects duplicate orders and incomplete results',()=>{assert.throws(()=>readHistory('team,territory_id,reveal_order,status\nBlue,back-bay,1,Active\nBlue,cambridge,1,Failed',territories,teams),/Duplicate reveal order/);assert.throws(()=>readHistory('team,territory_id,reveal_order,status\nBlue,back-bay,,Failed',territories,teams),/positive reveal order/);});
