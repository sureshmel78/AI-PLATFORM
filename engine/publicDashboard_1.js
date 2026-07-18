const executiveDashboard =
require('./executiveDashboard');

class PublicDashboard {

async getDashboard(){

return await executiveDashboard
.generateDashboard();

}

}

module.exports =
new PublicDashboard();