import fs from 'node:fs';
const names=['Allston','Back Bay','Bay Village','Beacon Hill','Brighton','Charlestown','Chinatown','Dorchester','Downtown','East Boston','Fenway–Kenmore','Hyde Park','Jamaica Plain','Mattapan','Mission Hill','North End','Roslindale','Roxbury','South Boston','South End','West End','West Roxbury','Seaport','Cambridge','Somerville','Everett','Chelsea','Revere','Malden','Medford','Brookline','Newton','Quincy','Braintree','Winthrop','Milton','Longwood'];
const slug=n=>n.toLowerCase().replace(/[–/]/g,'-').replace(/[^a-z0-9]+/g,'-');
function areaCenter(polygons){
  const origin=polygons[0][0][0];let areaSum=0,xSum=0,ySum=0;
  for(const polygon of polygons)for(const [index,ring] of polygon.entries()){
    let twiceArea=0,x=0,y=0;
    for(let i=1;i<ring.length;i++){
      const ax=ring[i-1][0]-origin[0],ay=ring[i-1][1]-origin[1],bx=ring[i][0]-origin[0],by=ring[i][1]-origin[1];
      const cross=ax*by-bx*ay;twiceArea+=cross;x+=(ax+bx)*cross;y+=(ay+by)*cross;
    }
    if(!twiceArea)continue;
    const area=Math.abs(twiceArea)*(index===0?1:-1);areaSum+=area;xSum+=area*x/(3*twiceArea);ySum+=area*y/(3*twiceArea);
  }
  if(!areaSum)throw Error('Cannot center empty geometry');
  return [origin[0]+xSum/areaSum,origin[1]+ySum/areaSum];
}
const b=JSON.parse(fs.readFileSync('dist/data/boston-new.geojson'));
const t=JSON.parse(fs.readFileSync('dist/data/towns.geojson'));
const aliases={'Chinatown':['Chinatown','Leather District'],'Fenway–Kenmore':['Fenway'],'Seaport':['South Boston Waterfront']};
const territories=names.map((name,i)=>({id:name==='Chinatown'?'chinatown-leather-district':slug(name),name,kind:i<23||name==='Longwood'?'Boston neighborhood':'Municipality',challengePath:`challenges/${name==='Chinatown'?'chinatown-leather-district':slug(name)}.md`,retryable:false,boundaryNote: name==='Fenway–Kenmore'?'Draft: Fenway boundary; Longwood is a separate territory. Review Kenmore coverage.': name==='Seaport'?'Draft: Boston South Boston Waterfront boundary; review against Google Maps.':'Draft geographic boundary; review against Google Maps.'}));
const features=territories.map(d=>{const matching=d.kind==='Municipality'?t.features.filter(f=>f.properties.TOWN===d.name.toUpperCase()):b.features.filter(f=>(aliases[d.name]||[d.name]).includes(f.properties.name));if(!matching.length)throw Error('Missing geometry '+d.name);const coordinates=matching.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates);return {type:'Feature',properties:{id:d.id,name:d.name},geometry:d.name==='Chinatown'?JSON.parse(fs.readFileSync('dist/data/chinatown-merged.geojson')).geometry:{type:'MultiPolygon',coordinates}};});
for(const feature of features)if(feature.properties.id==='everett')feature.properties.labelCenter=areaCenter(feature.geometry.coordinates);
fs.writeFileSync('dist/data/territories.json',JSON.stringify(territories,null,2));
fs.writeFileSync('dist/data/territories.geojson',JSON.stringify({type:'FeatureCollection',features}));
fs.writeFileSync('sheets/Ownership.csv','territory_id,territory,claimed_by,locked_by\n'+territories.map(d=>`${d.id},${d.name},,`).join('\n')+'\n');
fs.writeFileSync('sheets/Team-history.csv','team,territory_id,reveal_order,status\n'+territories.flatMap(d=>['Blue','Red'].map(team=>`${team},${d.id},,Not opened`)).join('\n')+'\n');
for(const d of territories)if(!fs.existsSync('dist/'+d.challengePath))fs.writeFileSync('dist/'+d.challengePath,`# Find your neighborhood\n\nDEMO CHALLENGE — replace before playing.\n\nFind a publicly accessible sign bearing the name of ${d.name}. Take a team photo with the sign while standing outdoors inside the game boundary.\n\n## Proof\nOne photo showing the team and the neighborhood or municipality name. Record completion in your team sheet.\n\n## Attempts\nOne attempt only. Failed or abandoned challenges cannot be retried.\n`);
