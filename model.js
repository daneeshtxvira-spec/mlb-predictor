function clamp(x,a=0.001,b=0.999){return Math.max(a,Math.min(b,x));}
function pyth(rs,ra){const e=MLB_CONFIG.pythExponent; const a=Math.pow(Math.max(rs,0.01),e),b=Math.pow(Math.max(ra,0.01),e); return a/(a+b);}
function log5(a,b){return clamp((a-a*b)/(a+b-2*a*b));}
function roundHalf(x){return Math.round(x*2)/2;}
function normalCDF(x,mean,sd){return 0.5*(1+erf((x-mean)/(sd*Math.SQRT2)));}
function erf(x){const s=x<0?-1:1; x=Math.abs(x); const t=1/(1+0.3275911*x); const y=1-((((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t)*Math.exp(-x*x); return s*y;}
function calculateModel(homeName,awayName,home,away,leagueRun){
 const ph=pyth(home.rs,home.ra), pa=pyth(away.rs,away.ra), neutral=log5(ph,pa);
 const local=clamp((neutral*MLB_CONFIG.homeWin)/(neutral*MLB_CONFIG.homeWin+(1-neutral)*MLB_CONFIG.awayWin));
 const projHome=(home.homeRS*away.awayRA)/leagueRun;
 const projAway=(away.awayRS*home.homeRA)/leagueRun;
 const total=projHome+projAway, line=roundHalf(total);
 const over=clamp(1-normalCDF(line, total, MLB_CONFIG.runSD));
 const under=1-over;
 const favorite=local>=0.5?homeName:awayName;
 const favProb=local>=0.5?local:1-local;
 const diff=projHome-projAway;
 const favDiff=local>=0.5?diff:-diff;
 const fav15=clamp(1-normalCDF(1.5, favDiff, MLB_CONFIG.runSD));
 const dog15=1-fav15;
 const opts=[
  {label:homeName+' ML',p:local,key:'homeML'},
  {label:awayName+' ML',p:1-local,key:'awayML'},
  {label:'Over '+line,p:over,key:'over'},
  {label:'Under '+line,p:under,key:'under'},
  {label:favorite+' -1.5',p:fav15,key:'fav15'},
  {label:(favorite===homeName?awayName:homeName)+' +1.5',p:dog15,key:'dog15'}
 ].sort((a,b)=>b.p-a.p);
 return {ph,pa,neutral,local,projHome,projAway,total,line,over,under,favorite,favProb,fav15,dog15,diff,options};
}
