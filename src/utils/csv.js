export function parseCSV(text) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h=>h.trim());
    return lines.slice(1).map(line=>{
      const vals=line.split(",").map(v=>v.trim());
      const o={};
      headers.forEach((h,i)=>o[h]=vals[i]);
      return o;
    });
  }
  
  export function dayStringToIndex(d) {
    return {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[d];
  }
  