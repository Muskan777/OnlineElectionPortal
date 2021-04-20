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
    } else if (
      window.location.href === 'http://localhost:3000/voter_home.html'
    ) {
      // Load account data
      const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds))
      }
      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account
          $('#accountAddress').html('Your Account: ' + account)
        }
      })
      var uid

      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.addresses(App.account)
        })
        .then(function (index) {
          return electionInstance.users(index.toNumber())
        })
        .then(function (user) {
          $('#id').html(user[0].toNumber())
          uid = user[0].toNumber()
          $('#name').html(user[2])
          $('#email').html(user[3])
          $('#address').html(user[1])
          return electionInstance.voter_list_count()
        })
        .then(function (votersCount) {
          var ElectionSelect = $('#getElectionList')
          ElectionSelect.empty()
          for (var i = 1; i <= votersCount; i++) {
            electionInstance.voterlist(i).then(function (voter) {
              if (voter[0].toNumber() == uid) {
                electionInstance
                  .elections(voter[1].toNumber())
                  .then(function (election) {
                    var E_name = election[1]
                    var E_id = election[0].toNumber()
                    var ElectionOption =
                      "<option value='" + E_id + "'>" + E_name + '</option>'
                    ElectionSelect.append(ElectionOption)
                  })
              }
            })
          }
        })
    } else if (
      window.location.href.includes('http://localhost:3000/Voter.html')
    ) {
      E_id = parseInt(window.location.hash.substr(-1))
    } else if (
      window.location.href.includes('http://localhost:3000/candidate.html')
    ) {
      E_id = parseInt(window.location.hash.substri(-1))
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
  create_election_event: function () {
    var E_name = $('#E_name').val()
    var date_cand_register_end = $('#date_cand_register_end').val()
    var date_polling_starts = $('#date_polling_starts').val()
    var date_polling_ends = $('#date_polling_ends').val()
    var time_cand_register_end = $('#time_cand_register_end').val()
    var time_polling_starts = $('#time_polling_starts').val()
    var time_polling_ends = $('#time_polling_ends').val()

    console.log(E_name)
    console.log(date_cand_register_end)
    console.log(date_polling_starts)
    console.log(date_polling_ends)
    console.log(time_cand_register_end)
    console.log(time_polling_starts)
    console.log(time_polling_ends)

    // Make a string of the form: "yyyy-MM-ddTHH:mm:ss" and then use new Date(resultDateString) to convert to date
    // and use date.getTime()/1000 to convert to time since Epoch in seconds.
    var cand_register_end =
      date_cand_register_end + 'T' + time_cand_register_end
    var polling_starts = date_polling_starts + 'T' + time_polling_starts
    var polling_ends = date_polling_ends + 'T' + time_polling_ends

    cand_register_end = new Date(cand_register_end)
    polling_starts = new Date(polling_starts)
    polling_ends = new Date(polling_ends)

    // Use getTime() to get epoch time in milliseconds, dividing by 1000 to get seconds;
    cand_register_end = cand_register_end.getTime() / 1000
    polling_starts = polling_starts.getTime() / 1000
    polling_ends = polling_ends.getTime() / 1000

    var current_time = new Date()
    current_time = current_time.getTime()
    if (
      current_time > cand_register_end ||
      cand_register_end > polling_starts ||
      polling_starts > polling_ends
    ) {
      window.alert('Incorrect Time/Date entered')
      throw new Error()
    }

    App.contracts.Election.deployed().then(function (instance) {
      var election_count = instance.election_count
      instance.add_election(
        E_name,
        cand_register_end,
        polling_starts,
        polling_ends,
      )
    })
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

  manage_election_for_user: function () {
    var ElectionIDForVoter = $('#getElectionList').val()
    var candidatesCount
    var electionInstance
    setTimeout(function () {
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.candidate_count()
        })
        .then(function (cnt) {
          candidatesCount = cnt
          return electionInstance.addresses(App.account)
        })
        .then(function (id) {
          id_num = id.toNumber()
          return electionInstance.users(id_num)
        })
        .then(function (user) {
          if (user[4].toNumber() == 1 && user[5].toNumber() < 5000) {
            electionInstance
              .candidates(user[5].toNumber())
              .then(function (candidate) {
                console.log(candidate[3], ElectionIDForVoter)
                if (candidate[3] == ElectionIDForVoter) {
                  console.log('User is candidate')
                  window.location.href =
                    'http://localhost:3000/candidate.html#manage_elections=' +
                    ElectionIDForVoter
                } else {
                  console.log('user is voter')
                  window.location.href =
                    'http://localhost:3000/Voter.html#manage_elections=' +
                    ElectionIDForVoter
                }
              })
          } else {
            console.log('user is voter')
            window.location.href =
              'http://localhost:3000/Voter.html#manage_elections=' +
              ElectionIDForVoter
          }
        })
    }, 40)
  },
}

$(function () {
  $(window).load(function () {
    App.init()
  })
})
