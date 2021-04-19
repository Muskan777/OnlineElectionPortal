App = {
    // web3Provider: null,
    // contracts: {},
    // account: '0x0',
    // hasVoted: false,
  
//     init: function() {
//       return App.initWeb3();
//     },
  
//     initWeb3: function() {
//       // TODO: refactor conditional
//       if (typeof web3 !== 'undefined') {
//         // If a web3 instance is already provided by Meta Mask.
//         App.web3Provider = web3.currentProvider;
//         web3 = new Web3(web3.currentProvider);
//       } else {
//         // Specify default instance if no web3 instance provided
//         App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//         web3 = new Web3(App.web3Provider);
//       }
//       return App.initContract();
//     },
  
//     initContract: function() {
//       $.getJSON("Election.json", function(election) {
//         // Instantiate a new truffle contract from the artifact
//         App.contracts.Election = TruffleContract(election);
//         // Connect provider to interact with contract
//         App.contracts.Election.setProvider(App.web3Provider);
      
//         // return App.render();
//       });
//     },
  
    // Listen for events emitted from the contract
    create_election_event : function() { 
      var E_name = $("#E_name").val();
      var date_cand_register_end = $("#date_cand_register_end").val();
      var date_polling_starts = $("#date_polling_starts").val();
      var date_polling_ends = $("#date_polling_ends").val();
      var time_cand_register_end = $("#time_cand_register_end").val();
      var time_polling_starts = $("#time_polling_starts").val();
      var time_polling_ends = $("#time_polling_ends").val();

      console.log(E_name);
      console.log(date_cand_register_end);
      console.log(date_polling_starts);
      console.log(date_polling_ends);
      console.log(time_cand_register_end);
      console.log(time_polling_starts);
      console.log(time_polling_ends);

      // Make a string of the form: "yyyy-MM-ddTHH:mm:ss" and then use new Date(resultDateString) to convert to date
      // and use date.getTime()/1000 to convert to time since Epoch in seconds.
      var cand_register_end = date_cand_register_end + "T" + time_cand_register_end;
      var polling_starts = date_polling_starts + "T" + time_polling_starts;
      var polling_ends = date_polling_ends + "T" + time_polling_ends;

      cand_register_end = new Date(cand_register_end);
      polling_starts = new Date(polling_starts);
      polling_ends = new Date(polling_ends);

      // Use getTime() to get epoch time in milliseconds, dividing by 1000 to get seconds;
      cand_register_end = cand_register_end.getTime()/1000;
      polling_starts = polling_starts.getTime()/1000;
      polling_ends = polling_ends.getTime()/1000;

      var current_time = new Date();
      current_time = current_time.getTime();
      if (current_time > cand_register_end || cand_register_end > polling_starts || polling_starts > polling_ends) {
        window.alert("Incorrect Time/Date entered");
        throw new Error;
      }
      

      App.contracts.Election.deployed().then(function (instance) {
        var election_count = instance.election_count
        instance.add_election(
          E_name,
          cand_register_end,
          polling_starts, 
          polling_ends
        )
      }
      )
    }
}
  


      // App.contracts.Election.deployed().then(function(instance) {
      //     var election_count = instance.add_election;
            
      //     for(var i = 1; i <= election_count; i++) {
      //         var E_id = instance.elections[i].E_id;
      //         var name = instance.elections[i].E_name;
              
      //         var manage_elections_template = "<option value='" + E_id + "' >" + E_id + name + "</ option>";
  
      //         manage_elections.append(manage_elections_template);
  
      //     }
      // });
    
    /* ,
  
    render: function() {
      var electionInstance;
      // var load`er = $("#loader");
      // var content = $("#content");
  
      // loader.hide();
      // content.hide`();
  
      // Load account data
      // web3.eth.getCoinbase(function(err, account) {
      //   if (err === null) {
      //     App.account = account;
      //     $("#accountAddress").html("Your Account: " + account);
      //   }
      // });
  
  
      // Load contract data
      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.election_count();
      }).then(function(election_count) {
          var manage_elections = $("#manage_elections");
        manage_elections.empty();
  
        
  
        for (var i = 1; i <= election_count; i++) {
          electionInstance.elections(i).then(function(election) {
            var id = election[0];
            var name = election[1];
  
            // Render candidate Result
          //   var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          //   candidatesResults.append(candidateTemplate);
  
            // Render candidate ballot option
            var manage_elections_template = "<option value='" + id + "' >" + name + "</ option>"
            manage_elections.append(manage_elections_template);
          });
        }
      //   return electionInstance.voters(App.account);
      });
  
  
  
      /* // Load contract data
      App.contracts.Election.deployed().then(function(instance) {
          electionInstance = instance;
          var election_count = instance.election_count;
          var manage_elections = $("#manage_elections");
          manage_elections.empty();
  
          for(var i = 1; i <= election_count; i++) {
              var E_id = instance.elections[i].E_id;
              var name = instance.elections[i].E_name;
              
              var manage_elections_template = "<option value='" + E_id + "' >" + E_id + name + "</ option>";
  
              manage_elections.append(manage_elections_template);
  
          }
      }).catch(function(error) {
        console.warn(error);
      }); */
    // },
  
  
  
  // (function() {
  //   $(window).load(function() {
  //     App.init();
  //   });
  // });
   