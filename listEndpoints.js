const listEndpoints = require('express-list-endpoints');
const app = require('./app');
endpointParam = process.argv[2];
let listedRoutes = listEndpoints(app);
if (endpointParam && typeof endpointParam !== 'undefined') {
  listedRoutes = listedRoutes.filter(pathObj => {
    return pathObj.path.includes(endpointParam);
  });
}
console.log('----------------- ROUTES -----------------');
console.log(listedRoutes);
console.log('------------- END ROUTES -----------------');
