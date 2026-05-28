const API_BASE='/api';

let authToken='';

let socket=null;

/*
====================================================
LOGIN
====================================================
*/

async function login(){

const username=
document.getElementById(
'username'
).value;

const password=
document.getElementById(
'password'
).value;

try{

const response=
await fetch(
`${API_BASE}/auth/login`,
{
method:'POST',
headers:{
'Content-Type':
'application/json'
},
body:JSON.stringify({
username,
password
})
}
);

const result=
await response.json();

if(result.success){

authToken=
result.token;

localStorage.setItem(
'token',
authToken
);

document.getElementById(
'authSection'
).style.display='none';

document.getElementById(
'dashboardSection'
).style.display='block';

initializeDashboard();

}
else{

alert(
result.message||
'Invalid credentials'
);

}

}
catch(error){

console.log(error);

alert(
'Server connection failed'
);

}

}

/*
====================================================
INITIALIZE
====================================================
*/

async function initializeDashboard(){

await loadDashboard();

await loadEnterpriseMetrics();

loadOperationalAlerts();

await loadFleetTable();

await loadIntelligenceHistory();

initializeSocket();

}

/*
====================================================
DASHBOARD
====================================================
*/

async function loadDashboard(){

try{

const response=
await fetch(
`${API_BASE}/health`
);

const result=
await response.json();

document.getElementById(
'dashboardData'
).innerHTML=`

<div class="card">
<h3>Platform Status</h3>
<h2>${result.system}</h2>
</div>

<div class="card">
<h3>Database</h3>
<h2>${result.database}</h2>
</div>

<div class="card">
<h3>WebSocket</h3>
<h2>${result.websocket}</h2>
</div>

<div class="card">
<h3>Version</h3>
<h2>${result.version}</h2>
</div>

`;

}
catch(error){

console.log(error);

}

}

/*
====================================================
METRICS
====================================================
*/

async function loadEnterpriseMetrics(){

document.getElementById(
'enterpriseMetrics'
).innerHTML=`

<div class="card">
<h3>AI Engine</h3>
<h2>ACTIVE</h2>
</div>

<div class="card">
<h3>Security</h3>
<h2>ENABLED</h2>
</div>

<div class="card">
<h3>Monitoring</h3>
<h2>LIVE</h2>
</div>

<div class="card">
<h3>Environment</h3>
<h2>PRODUCTION READY</h2>
</div>

`;

}

/*
====================================================
ALERTS
====================================================
*/

function loadOperationalAlerts(){

document.getElementById(
'operationalAlerts'
).innerHTML=`

<div class="alert-card-medium">
<h3>SYSTEM STATUS</h3>
<p>
All enterprise services operational
</p>
</div>

`;

}

/*
====================================================
FLEET
====================================================
*/

async function loadFleetTable(){

try{

const response=
await fetch(
`${API_BASE}/ais/vessels`,
{
headers:{
Authorization:
`Bearer ${authToken}`
}
}
);

const result=
await response.json();

const vessels=
result.data||[];

const tableBody=
document.getElementById(
'fleetTableBody'
);

tableBody.innerHTML='';

vessels.forEach(vessel=>{

tableBody.innerHTML+=`

<tr>

<td>${vessel.name}</td>

<td>${vessel.vesselType}</td>

<td>${vessel.speed}</td>

<td>${vessel.destination}</td>

<td>
${new Date(
vessel.eta
).toLocaleString()}
</td>

<td>
${vessel.provider||'AIS'}
</td>

<td>
${vessel.navigationStatus}
</td>

</tr>

`;

});

}
catch(error){

console.log(error);

}

}

/*
====================================================
HISTORY
====================================================
*/

async function loadIntelligenceHistory(){

try{

const response=
await fetch(
`${API_BASE}/intelligence/history`,
{
headers:{
Authorization:
`Bearer ${authToken}`
}
}
);

const result=
await response.json();

const history=
result.data||[];

const container=
document.getElementById(
'historyLogs'
);

container.innerHTML='';

history.forEach(item=>{

container.innerHTML+=`

<div class="stream-item">

<div class="stream-time">

${new Date(
item.createdAt
).toLocaleString()}

</div>

<strong>
${item.category}
</strong>

<br><br>

${item.message}

</div>

`;

});

}
catch(error){

console.log(error);

}

}

/*
====================================================
SOCKET
====================================================
*/

function initializeSocket(){

socket=io();

socket.on(
'live-intelligence',
(data)=>{

const panel=
document.getElementById(
'liveStreamPanel'
);

panel.innerHTML=`

<div class="stream-item">

<div class="stream-time">

${new Date(
data.timestamp
).toLocaleString()}

</div>

Market:
${data.marketSentiment}

<br>

Weather:
${data.weatherRisk}

<br>

Efficiency:
${data.operationalEfficiency}

</div>

`+panel.innerHTML;

}
);

}

/*
====================================================
AUTO REFRESH
====================================================
*/

setInterval(()=>{

if(authToken){

loadDashboard();

loadFleetTable();

loadIntelligenceHistory();

}

},30000);

/*
====================================================
WINDOW
====================================================
*/

window.onload=()=>{

localStorage.removeItem(
'token'
);

document.getElementById(
'authSection'
).style.display='block';

document.getElementById(
'dashboardSection'
).style.display='none';

};