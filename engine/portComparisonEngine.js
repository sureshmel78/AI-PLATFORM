class PortComparisonEngine {

generateComparison(){

return {

generatedAt:
new Date()
.toISOString(),

ports:[

{
port:'VOC PORT',
risk:'LOW',
delayHours:3,
berthOccupancy:72,
anchorageQueue:2,
marketPosition:'STRONG'
},

{
port:'CHENNAI',
risk:'MEDIUM',
delayHours:12,
berthOccupancy:84,
anchorageQueue:8,
marketPosition:'MODERATE'
},

{
port:'COCHIN',
risk:'LOW',
delayHours:4,
berthOccupancy:68,
anchorageQueue:3,
marketPosition:'STABLE'
},

{
port:'COLOMBO',
risk:'HIGH',
delayHours:24,
berthOccupancy:95,
anchorageQueue:15,
marketPosition:'VERY STRONG'
},

{
port:'VIZHINJAM',
risk:'LOW',
delayHours:2,
berthOccupancy:61,
anchorageQueue:1,
marketPosition:'EMERGING'
}

]

};

}

}

module.exports =
new PortComparisonEngine();