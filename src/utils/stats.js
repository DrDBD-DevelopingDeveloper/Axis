export function computeStats(doneMap) {
    const today = new Date();
    let cT=0,cD=0,gT=0,gD=0,eT=0,eD=0;
  
    for (let i=0;i<7;i++) {
      const d=new Date(today);
      d.setDate(d.getDate()-i);
      const key=d.toISOString().slice(0,10);
  
      Object.keys(doneMap).forEach(k=>{
        if(!k.startsWith(key)) return;
        if(k.endsWith("|gym")){gT++; if(doneMap[k]) gD++;}
        else if(k.includes("|gym|")){eT++; if(doneMap[k]) eD++;}
        else{cT++; if(doneMap[k]) cD++;}
      });
    }
  
    return {
      classPct: cT?Math.round(cD*100/cT):0,
      gymPct: gT?Math.round(gD*100/gT):0,
      exercisePct: eT?Math.round(eD*100/eT):0,
    };
  }
  