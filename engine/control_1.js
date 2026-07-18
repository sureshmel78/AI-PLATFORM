class ControlEngine{

constructor(){

this.cache=
new Map();

}

/*
====================================================
RETRY
====================================================
*/

async retryOperation(

operation,
maxRetries=3,
delay=1000

){

let lastError;

for(

let attempt=1;
attempt<=maxRetries;
attempt++

){

try{

return await operation();

}
catch(error){

lastError=error;

console.log(

`Retry ${attempt}/${maxRetries}`

);

if(
attempt<maxRetries
){

await new Promise(
resolve=>

setTimeout(
resolve,delay)

);

}

}

}

throw lastError;

}

/*
====================================================
CACHE
====================================================
*/

setCache(

key,
value,
ttl=300000

){

const expiresAt=

Date.now()+ttl;

this.cache.set(

key,
{

value,
expiresAt

}

);

}

getCache(key){

const data=

this.cache.get(key);

if(
!data
){

return null;

}

if(

Date.now()
>
data.expiresAt

){

this.cache.delete(
key
);

return null;

}

return data.value;

}

clearCache(){

this.cache.clear();

}

}

module.exports=
new ControlEngine();