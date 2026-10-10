export function stationDotSvg(routes){
  const colors=[...new Set(routes.map(r=>r.color))];
  if(!colors.length||colors.some(color=>!/^#[0-9a-f]{6}$/i.test(color)))throw Error('Invalid station colors');
  let fill;
  if(colors.length===1)fill=`<circle cx="12" cy="12" r="9" fill="${colors[0]}"/>`;
  else fill=colors.map((color,i)=>{
    const point=angle=>[12+9*Math.cos(angle),12+9*Math.sin(angle)].map(n=>n.toFixed(3)).join(' ');
    const start=-Math.PI/2+i*2*Math.PI/colors.length,end=start+2*Math.PI/colors.length;
    return `<path d="M12 12 L${point(start)} A9 9 0 0 1 ${point(end)} Z" fill="${color}"/>`;
  }).join('');
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${fill}<circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2.5"/></svg>`;
}
