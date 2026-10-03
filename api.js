const TEAM_DATA=[
{id:133,name:'Oakland Athletics',short:'Athletics',abbr:'OAK',logo:'ath'},
{id:134,name:'Pittsburgh Pirates',short:'Pirates',abbr:'PIT',logo:'pit'},
{id:135,name:'San Diego Padres',short:'Padres',abbr:'SD',logo:'sd'},
{id:136,name:'Seattle Mariners',short:'Mariners',abbr:'SEA',logo:'sea'},
{id:137,name:'San Francisco Giants',short:'Giants',abbr:'SF',logo:'sf'},
{id:138,name:'St. Louis Cardinals',short:'Cardinals',abbr:'STL',logo:'stl'},
{id:139,name:'Tampa Bay Rays',short:'Rays',abbr:'TB',logo:'tb'},
{id:140,name:'Texas Rangers',short:'Rangers',abbr:'TEX',logo:'tex'},
{id:141,name:'Toronto Blue Jays',short:'Blue Jays',abbr:'TOR',logo:'tor'},
{id:142,name:'Minnesota Twins',short:'Twins',abbr:'MIN',logo:'min'},
{id:143,name:'Philadelphia Phillies',short:'Phillies',abbr:'PHI',logo:'phi'},
{id:144,name:'Atlanta Braves',short:'Braves',abbr:'ATL',logo:'atl'},
{id:145,name:'Chicago White Sox',short:'White Sox',abbr:'CWS',logo:'cws'},
{id:146,name:'Miami Marlins',short:'Marlins',abbr:'MIA',logo:'mia'},
{id:147,name:'New York Yankees',short:'Yankees',abbr:'NYY',logo:'nyy'},
{id:158,name:'Milwaukee Brewers',short:'Brewers',abbr:'MIL',logo:'mil'},
{id:159,name:'Los Angeles Angels',short:'Angels',abbr:'LAA',logo:'laa'},
{id:160,name:'Arizona Diamondbacks',short:'Diamondbacks',abbr:'ARI',logo:'ari'},
{id:161,name:'Chicago Cubs',short:'Cubs',abbr:'CHC',logo:'chc'},
{id:162,name:'Kansas City Royals',short:'Royals',abbr:'KC',logo:'kc'},
{id:163,name:'Detroit Tigers',short:'Tigers',abbr:'DET',logo:'det'},
{id:164,name:'Washington Nationals',short:'Nationals',abbr:'WSH',logo:'wsh'},
{id:165,name:'Baltimore Orioles',short:'Orioles',abbr:'BAL',logo:'bal'},
{id:166,name:'Tampa Bay Rays',short:'Rays',abbr:'TB',logo:'tb'},
{id:167,name:'Cincinnati Reds',short:'Reds',abbr:'CIN',logo:'cin'},
{id:168,name:'Los Angeles Dodgers',short:'Dodgers',abbr:'LAD',logo:'lad'},
{id:169,name:'Houston Astros',short:'Astros',abbr:'HOU',logo:'hou'},
{id:170,name:'Boston Red Sox',short:'Red Sox',abbr:'BOS',logo:'bos'},
{id:171,name:'Cleveland Guardians',short:'Guardians',abbr:'CLE',logo:'cle'},
{id:172,name:'Colorado Rockies',short:'Rockies',abbr:'COL',logo:'col'},
{id:173,name:'Arizona Diamondbacks',short:'Diamondbacks',abbr:'ARI',logo:'ari'},
{id:174,name:'Kansas City Royals',short:'Royals',abbr:'KC',logo:'kc'},
{id:175,name:'San Francisco Giants',short:'Giants',abbr:'SF',logo:'sf'}
];
// Normalize duplicate legacy IDs to the official 30-team set.
const MLB_TEAMS=[
[108,'Los Angeles Angels','Angels','LAA','laa'],[109,'Arizona Diamondbacks','Diamondbacks','ARI','ari'],[110,'Baltimore Orioles','Orioles','BAL','bal'],[111,'Boston Red Sox','Red Sox','BOS','bos'],[112,'Chicago Cubs','Cubs','CHC','chc'],[113,'Cincinnati Reds','Reds','CIN','cin'],[114,'Cleveland Guardians','Guardians','CLE','cle'],[115,'Colorado Rockies','Rockies','COL','col'],[116,'Detroit Tigers','Tigers','DET','det'],[117,'Houston Astros','Astros','HOU','hou'],[118,'Kansas City Royals','Royals','KC','kc'],[119,'Los Angeles Dodgers','Dodgers','LAD','lad'],[120,'Washington Nationals','Nationals','WSH','wsh'],[121,'New York Mets','Mets','NYM','nym'],[133,'Oakland Athletics','Athletics','OAK','ath'],[134,'Pittsburgh Pirates','Pirates','PIT','pit'],[135,'San Diego Padres','Padres','SD','sd'],[136,'Seattle Mariners','Mariners','SEA','sea'],[137,'San Francisco Giants','Giants','SF','sf'],[138,'St. Louis Cardinals','Cardinals','STL','stl'],[139,'Tampa Bay Rays','Rays','TB','tb'],[140,'Texas Rangers','Rangers','TEX','tex'],[141,'Toronto Blue Jays','Blue Jays','TOR','tor'],[142,'Minnesota Twins','Twins','MIN','min'],[143,'Philadelphia Phillies','Phillies','PHI','phi'],[144,'Atlanta Braves','Braves','ATL','atl'],[145,'Chicago White Sox','White Sox','CWS','chw'],[146,'Miami Marlins','Marlins','MIA','mia'],[147,'New York Yankees','Yankees','NYY','nyy'],[158,'Milwaukee Brewers','Brewers','MIL','mil']
].map(([id,name,short,abbr,logo])=>({id,name,short,abbr,logo}));
const UNIQUE_TEAMS=MLB_TEAMS;
let scheduleCache=new Map();
async function fetchJSON(url){const r=await fetch(url); if(!r.ok) throw new Error('MLB API '+r.status); return r.json();}
async function getSeasonSchedule(season,date){const key=season+'-'+date;if(scheduleCache.has(key)) return scheduleCache.get(key); const start=season+'-03-01'; const url=`${MLB_CONFIG.api}/schedule?sportId=1&gameType=R&startDate=${start}&endDate=${date}&hydrate=team`; const data=await fetchJSON(url); const games=(data.dates||[]).flatMap(d=>d.games||[]); scheduleCache.set(key,games); return games;}
function gameWon(g,teamId){const side=g.teams.home.team.id===teamId?g.teams.home:g.teams.away; return side.isWinner===true;}
function completed(g){return g.status && ['Final','Game Over','Completed Early'].includes(g.status.abstractGameState) || g.status?.codedGameState==='F';}
function buildTeamGames(games,teamId,cutoff){return games.filter(g=>completed(g)&&new Date(g.gameDate)<new Date(cutoff+'T00:00:00')).map(g=>{const home=g.teams.home,away=g.teams.away,isHome=home.team.id===teamId;const mine=isHome?home:away,opp=isHome?away:home;return {date:g.gameDate.slice(0,10),home:isHome,rs:mine.score||0,ra:opp.score||0,win:!!mine.isWinner};}).sort((a,b)=>a.date.localeCompare(b.date));}
function summary(list){const n=list.length; if(!n)return {n:0,rs:0,ra:0,rsG:0,raG:0}; const rs=list.reduce((s,g)=>s+g.rs,0),ra=list.reduce((s,g)=>s+g.ra,0);return {n,rs,ra,rsG:rs/n,raG:ra/n};}
function splitSummary(list,home){return summary(list.filter(g=>g.home===home));}
function first3(list){return list.slice(0,3);} function last10(list){return list.slice(-10);}
function weighted(a,b,c){return a*0.55+b*0.30+c*0.15;}
function makeProfile(list){const season=summary(list),l10=summary(last10(list)),f3=summary(first3(list));return {n:season.n,season,l10,f3,rs:weighted(season.rsG,l10.rsG,f3.rsG),ra:weighted(season.raG,l10.raG,f3.raG)};}
function leagueRuns(games){const completedGames=games.filter(completed); if(!completedGames.length)return 4.5; const total=completedGames.reduce((s,g)=>s+(g.teams.home.score||0)+(g.teams.away.score||0),0); return total/(completedGames.length*2);}
async function getTeamProfiles(homeId,awayId,season,date){const games=await getSeasonSchedule(season,date);const hg=buildTeamGames(games,homeId,date),ag=buildTeamGames(games,awayId,date);const hp=makeProfile(hg),ap=makeProfile(ag);const hHome=summary(hg.filter(g=>g.home)),hAway=summary(hg.filter(g=>!g.home)),aHome=summary(ag.filter(g=>g.home)),aAway=summary(ag.filter(g=>!g.home));return {games,hg,ag,hp,ap,hHome,hAway,aHome,aAway,lg:leagueRuns(games)};}
