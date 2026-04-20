async function addVessel(){

await fetch("/vessels",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
name:vName.value,
dwt:vDwt.value,
location:vLoc.value
})
});

loadDeals();

}

async function addCargo(){

await fetch("/cargo",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
commodity:cCom.value,
loadPort:cLoad.value,
qty:cQty.value
})
});

loadDeals();

}

async function loadDeals(){

const res = await fetch("/deals");
const data = await res.json();

deals.innerHTML="";

data.forEach(d=>{

deals.innerHTML += `
<tr>
<td>${d.vessel}</td>
<td>${d.cargo}</td>
<td>${d.score}</td>
</tr>
`;

});

}

loadDeals();