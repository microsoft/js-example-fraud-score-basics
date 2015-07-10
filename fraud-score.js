#!/usr/bin/env node

//
// fraud-score.js
//

var rbroker       = require('rbroker'),
    RIn           = require('deployr').RInput,
    appConfig = require('./config/app')
    brokerConfig  = require('./config/broker'),
    taskConfig    = require('./config/task');

//
// Use process.env to override default brokerConfig.
//
useProcessEnvOverrides(brokerConfig)
console.log('fraud-score: Using DeployR Endpoint' +
  ' @ ' + brokerConfig.host + '/deployr');

//
// Initialize instance of Pooled Task Runtime.
//
var broker = rbroker.pooledTaskBroker(brokerConfig)
    .ready(function() {
      //
      // RBroker runtime initialization completed.
      //
      console.log('fraud-score: RBroker pool [ ' +
          broker.maxConcurrency() + ' ] created.');
    })
    .complete(function(rTask, rTaskResult) {
      //
      // Task completed handler. Data returned by
      // task is available on rTaskResult.
      //
    	console.log('fraud-score: Task scored ' + 
            rTaskResult.generatedObjects[0].value);
    })
    .error(function(err) {
      //
      // Task completed handler. Data returned by
      // task is available on rTaskResult.
      //
      console.log('fraud-score: error ' + err);
    })
    .idle(function() {
      //
      // RBroker becomes idle once all tasks have
      // completed or failed. This example application
      // uses the 'idle' event to shutdown the broker.
      //
      console.log('fraud-score: Simulation [ ' +
        appConfig.tasksize + ' Tasks ] completes.');
      
      broker.shutdown()
        .then(function() {
          console.log('fraud-score: RBroker released, exiting.');
        }, function() {
          console.log('fraud-score: RBroker shutdown failed.');
        })
    });

//
// RBroker Application Simulator
// 
var simulator = {
   simulateApp: function(dBroker) {
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

        var rTask = rbroker.pooledTask(taskConfig);

        //
        // Sumbit task on RBroker for execution on
        // the DeployR server.
        //
        dBroker.submit(rTask, false);
      }
   }  
};

//
// Run the RBroker Simulation
//
broker.simulateApp(simulator)

//
// Utility function to handle configuration overrides.
//
function useProcessEnvOverrides(brokerConfig) {
    brokerConfig.host = process.env.endpoint || brokerConfig.host
    brokerConfig.credentials.username =
      process.env.username || brokerConfig.credentials.username
    brokerConfig.credentials.password =
      process.env.password || brokerConfig.credentials.password
}
