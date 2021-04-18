App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
    
        
      return App.render();
    });
  },

  // Listen for events emitted from the contract
  manage_election_event: function() {
    App.contracts.Election.deployed().then(function(instance) {
        var election_count = instance.election_count;
        var manage_elections = $("#manage_elections");
        manage_elections.empty();

        for(var i = 1; i <= election_count; i++) {
            var E_id = instance.elections[i].E_id;
            var name = instance.elections[i].E_name;
            
            var manage_elections_template = "<option value='" + E_id + "' >" + E_id + name + "</ option>";

            manage_elections.append(manage_elections_template);

        }
    });
  },

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
  },
};


(function() {
  $(window).load(function() {
    App.init();
  });
});
