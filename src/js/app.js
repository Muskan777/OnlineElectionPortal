App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initWeb3()
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545',
      )
      web3 = new Web3(App.web3Provider)
    }
    return App.initContract()
  },

  initContract: function () {
    $.getJSON('Election.json', function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election)
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider)

      App.listenForEvents()

      return App.render()
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0,
            toBlock: 'latest',
          },
        )
        .watch(function (error, event) {
          //console.log('event triggered', event)
          // Reload when a new vote is recorded
          App.render()
        })
    })
  },

  render: function () {
    if (window.location.href === 'http://localhost:3000') {
      var electionInstance
      var loader = $('#loader')
      var content = $('#content')

      loader.show()
      content.hide()

      // Load account data
      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account
          $('#accountAddress').html('Your Account: ' + account)
        }
      })

      // Load contract data
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          // electionInstance.candidates(0).then(function (candidate) {
          //   console.log('votecount: ', candidate[1], 'C_id:', candidate[0])
          // })
          return electionInstance.candidate_count()
        })
        .then(function (candidatesCount) {
          var candidatesResults = $('#candidatesResults')
          candidatesResults.empty()
          var candidatesSelect = $('#candidatesSelect')
          candidatesSelect.empty()
          for (var i = 0; i < candidatesCount; i++) {
            return electionInstance.candidates(i).then(function (candidate) {
              var C_id = candidate[0].toNumber()
              var name = candidate[2].toString()
              var voteCount = candidate[1].toNumber()

              // Render candidate Result
              var candidateTemplate =
                '<tr><th>' +
                C_id +
                '</th><td>' +
                name +
                '</td><td>' +
                voteCount +
                '</td></tr>'
              candidatesResults.append(candidateTemplate)
              // Render candidate ballot option
              var candidateOption =
                "<option value='" + C_id + "' >" + name + '</ option>'
              candidatesSelect.append(candidateOption)
            })
          }
          return electionInstance.voters(App.account)
        })
        .then(function (hasVoted) {
          // Do not allow a user to vote
          if (hasVoted) {
            $('form').hide()
          }
          loader.hide()
          content.show()
        })
        .catch(function (error) {
          console.warn(error)
        })
    } else if (
      window.location.href === 'http://localhost:3000/admin_home.html'
    ) {
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.election_count()
        })
        .then(function (election_count) {
          var manage_elections = $('#manage_elections')
          manage_elections.empty()
          window.loca
          for (var i = 1; i <= election_count; i++) {
            electionInstance.elections(i).then(function (election) {
              var id = election[0]
              var name = election[1]

              // Render candidate Result
              //   var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
              //   candidatesResults.append(candidateTemplate);

              // Render candidate ballot option
              var manage_elections_template =
                "<option value='" + id + "' >" + name + '</ option>'
              manage_elections.append(manage_elections_template)
            })
          }
          //   return electionInstance.voters(App.account);
        })
    } else if (window.location.href === 'http://localhost:3000/voting.html') {
      var electionInstance
      var loader = $('#loader')
      var voting = $('#voting')

      loader.show()
      voting.hide()
      $('#done').hide()

      // Load account data
      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account
          $('#accountAddress').html('Your Account: ' + account)
        }
      })

      // Load contract data
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.candidate_count()
        })
        .then(function (candidatesCount) {
          var candidatesSelect = $('#candidatesSelect')
          candidatesSelect.empty()
          $('#done').hide()
          for (var i = 0; i < candidatesCount; i++) {
            electionInstance.candidates(i).then(function (candidate) {
              var C_id = candidate[0].toNumber()
              var name = candidate[2].toString()
              // Render candidate ballot option
              var candidateOption =
                "<option value='" + C_id + "' >" + name + '</ option>'
              candidatesSelect.append(candidateOption)
            })
          }
          return electionInstance.voters(App.account)
        })
        .then(function (hasVoted) {
          //console.log(hasVoted)
          // Do not allow a user to vote
          if (hasVoted) {
            $('form').hide()
            $('#done').show()
          }
          loader.hide()
          voting.show()
        })
        .catch(function (error) {
          console.warn(error)
        })
    } else if (
      window.location.href === 'http://localhost:3000/admin_add_voter.html'
    ) {
        // Get Election ID from the previous page
        var E_id = 1;
        var electionInstance;
        console.log(E_id);
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.user_count()
        })
        .then(function (user_count) {
          user_count = 3;
          console.log(user_count);

          var add_voter = $('#add_voter')
          add_voter.empty()
          window.loca
          for (var i = 2; i <= user_count; i++) {
            electionInstance.users(i).then(function (user) {
              var id = user[0];
              var name = user[2];
              var flag = 0;
              console.log("Loop");
              for(var j = 1; j <= electionInstance.voter_list_count; j++) {
                  electionInstance.voterlist(j).then(function (voter) {
                      if (id == voter[0] && E_id == voter[1]) {
                          flag = 1;
                          // break;
                      }
                  })
                  if (flag){
                    break;
                  }
              }
              if (!flag) {
                    var add_voter_template =
                    "<option value='" + id + "' >" + id + ": " + name + '</ option>';
                    add_voter.append(add_voter_template)
                      }
            })
          }
        })

        App.contracts.Election.deployed()
        .then(function (instance){
          electionInstance = instance;
        
        var display_old_voters = $('#already_registered_voters');
        for(var j = 1; j <= electionInstance.voter_list_count; j++) {
            electionInstance.voterlist(j).then(function (voter) {
                if (E_id == voter[1]) {
                    var id = voter[0];
                    electionInstance.users(id).then(function (user) {
                        var name = user[2];
                    })
                    var display_old_voters_template =
                    "<li>" + id + ": " + name + "</li>";
                    display_old_voters.append(display_old_voters_template);
                    
                }
            }
            )
        } 
        })
    }
  },

  // Listen for events emitted from the contract
  manage_election_event: function () {
    App.contracts.Election.deployed().then(function (instance) {
      var election_count = instance.election_count
      var manage_elections = $('#manage_elections')
      manage_elections.empty()

      for (var i = 1; i <= election_count; i++) {
        var E_id = instance.elections[i].E_id
        var name = instance.elections[i].E_name

        var manage_elections_template =
          "<option value='" + E_id + "' >" + E_id + name + '</ option>'

        manage_elections.append(manage_elections_template)
      }
    })
  },

  // Call to the below function will be made when the admin creates a new election 
  // by submitting the form
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
  },

  // Call to the below function will be made when the admin creates a new election 
    // by submitting the form
  create_election_event : function() {
      
      // Get the Election ID from the previous page somehow
      var E_id = 1;

      // Get the id of the user to be registered as a voter for the E_id
      var id = $("#add_voter").val();
      
      console.log(id);

      App.contracts.Election.deployed().then(function (instance) {
          // Add the user in the voterlist with the id and E_id
      instance.add_voter_by_admin(
          id,
          E_id
      )
      }
      )
  },


  castVote: function () {
    var C_id = $('#candidatesSelect').val()
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.vote(C_id, { from: App.account })
      })
      .then(function (result) {
        // Wait for votes to update
        $('#content').hide()
        $('#loader').show()
      })
      .catch(function (err) {
        console.error(err)
      })
  },
}

$(function () {
  $(window).load(function () {
    App.init()
  })
})
