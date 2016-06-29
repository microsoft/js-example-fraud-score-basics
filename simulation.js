//
// simulation.js
//
// RBroker Framework RTask App Simulation.
//
var rbroker    = require('rbroker'),
    RIn        = rbroker.RInput,
    taskConfig = require('./config/task'),
    appConfig  = require('./config/app');

module.exports = {

   simulateApp: function(pooledBroker) {
      //
      // Each task represents a request by an employee
      // at a fictitious bank to detect the liklihood of
      // fraudulent activity on a given bank account.
      //
      console.log('fraud-score: Simulation [ ' +
        appConfig.tasksize + ' Tasks ] begins.');

      for(var i=0; i<appConfig.tasksize; i++) {

          var bal    = Math.abs(Math.random() * 25000),
              trans  = Math.abs(Math.random() * 100),
              credit = Math.abs(Math.random() * 75);

          taskConfig.rinputs = [RIn.numeric('bal', bal),
                                RIn.numeric('trans', trans),
                                RIn.numeric('credit', credit)];

        //
        // Build instance of RTask based on taskConfig.
        //
        var rTask = rbroker.pooledTask(taskConfig);

        //
        // Sumbit task on RBroker for execution on
        // the DeployR server.
        //
        pooledBroker.submit(rTask, false);
      }
   }  
}
