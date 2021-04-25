App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  global_election_count: 0,

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

      return App.first_call_me()
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      var temp = 0;
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance
        .trigger_event(
          {},
          {},
        )
        .watch(function (error, event) {
          // console.log('event triggered', event)
          // Reload when a new vote is recorded
          temp = 1;
          console.log("Inside Event" + event)
          console.log("Inside Error" + error)

          App.render()
        })
        // if(!temp){
        //   console.log("Outside Event")
        //   App.render()
        // }
    })
  },
  first_call_me: function() {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        if (account == null) {
          alert('No account connected, Connect your blockchain account first!')
          return
        } else {
          App.account = account
          console.log("App.account: " + App.account)
          $('#accountAddress').html('Your Account: ' + account)
        }
      }
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

      loader.hide()
      content.show()
    } else if (
      window.location.href === 'http://localhost:3000/admin_home.html'
    ) {
      var loader = $("#loader");
      var content = $("#content");
      // loader.show();
      // content.hide();
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          console.log(App.account)
          return electionInstance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log("Logged In user ID: " + u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.election_count()
          } else {
          console.log("Logged OUT user ID: " + u_id.toNumber())

            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (election_count) {
          election_count = election_count.toNumber()
          console.log("Election_count: " + election_count)
              // var p = $("#pill");
              // p.empty()
              // p.html("")
                   
              var manage_elections = $('#manage_elections')
              manage_elections.empty()
              manage_elections.html("")  
          for (var i = 1; i <= election_count; i++) {
              // console.log("Iiii: " + i)
              // if(i == 1){
              //   var k = 1;
              //   console.log("K: " + k)
              // }
              
            electionInstance.elections(i).then(function (election) {
              // if(k == 1){
              //   // p.empty()
              //   manage_elections.empty()
              //   k++;
              // }
              // p.append("hT")   
              // console.log("I: " + i)
              // console.log(election)
              var id = election[0].toNumber()
              var name = election[1]
              var manage_elections_template =
                "<option value='" + id + "' >" + id + ': ' + name + '</ option>'

              console.log("In IF: " + manage_elections_template)

              manage_elections.append(manage_elections_template)
            })
          }
          return electionInstance.elections(App.global_election_count);
        // }).then(function(election){
        //   console.log(App.global_election_count)
        //   var election_created = election[5]
        //   if (election_created || App.global_election_count == 0) {
        //     loader.hide()
        //     content.show()
        //   }
        })
    }
    else if (
      window.location.href === 'http://localhost:3000/admin_home.html'
    ) {
      var loader = $("#loader");
      var content = $("#content");
      // loader.show();
      // content.hide();
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          console.log(App.account)
          return electionInstance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log("Logged In user ID: " + u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return 
          } else {
          console.log("Logged OUT user ID: " + u_id.toNumber())

            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        // .then(function (election_count) {
        // })
    }
    else if (
      window.location
        .toString()
        .includes('http://localhost:3000/admin_manage_election.html')
    ) {
      var E_id = parseInt(window.location.hash.substr(-1))
      console.log(E_id)
      var Election_id_show = $('#Election_id_show')
      Election_id_show.append('Election Id : ' + E_id)
      var electionInstance

      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance

          return electionInstance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.elections(E_id)
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (election) {
          var E_name = election[1]
          // The time we get here is in seconds, convert it to date and time format
          // to use as value in the form
          var time_cand_register_end = election[2].toNumber()
          var time_polling_starts = election[3].toNumber()
          var time_polling_ends = election[4].toNumber()

          // Added 19800 secs to the time for the IST offset, as toISOString
          // converts time to UTC
          time_cand_register_end = new Date(
            (time_cand_register_end + 19800) * 1000,
          )
          time_polling_starts = new Date((time_polling_starts + 19800) * 1000)
          time_polling_ends = new Date((time_polling_ends + 19800) * 1000)

          console.log(time_cand_register_end)
          console.log(time_polling_starts)
          console.log(time_polling_ends)

          time_cand_register_end = time_cand_register_end
            .toISOString()
            .split('T')
          time_polling_starts = time_polling_starts.toISOString().split('T')
          time_polling_ends = time_polling_ends.toISOString().split('T')

          date_cand_register_end = time_cand_register_end[0]
          time_cand_register_end = time_cand_register_end[1].split('.000Z')[0]
          date_polling_starts = time_polling_starts[0]
          time_polling_starts = time_polling_starts[1].split('.000Z')[0]
          date_polling_ends = time_polling_ends[0]
          time_polling_ends = time_polling_ends[1].split('.000Z')[0]

          // console.log(E_name)
          // console.log(date_cand_register_end)
          // console.log(date_polling_starts)
          // console.log(date_polling_ends)
          // console.log(time_cand_register_end)
          // console.log(time_polling_starts)
          // console.log(time_polling_ends)

          var _E_name = $('#E_name')
          _E_name.empty()
          _E_name.val(E_name)

          var _date_cand_register_end = $('#date_cand_register_end')
          _date_cand_register_end.empty()
          _date_cand_register_end.val(date_cand_register_end)

          var _date_polling_starts = $('#date_polling_starts')
          _date_polling_starts.empty()
          _date_polling_starts.val(date_polling_starts)

          var _date_polling_ends = $('#date_polling_ends')
          _date_polling_ends.empty()
          _date_polling_ends.val(date_polling_ends)

          var _time_cand_register_end = $('#time_cand_register_end')
          _time_cand_register_end.empty()
          _time_cand_register_end.val(time_cand_register_end)

          var _time_polling_starts = $('#time_polling_starts')
          _time_polling_starts.empty()
          _time_polling_starts.val(time_polling_starts)

          var _time_polling_ends = $('#time_polling_ends')
          _time_polling_ends.empty()
          _time_polling_ends.val(time_polling_ends)
        })
    } else if (
      window.location.href === 'http://localhost:3000/voter_home.html'
    ) {
      var uid

      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.addresses(App.account)
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
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
              if (voter[0].toNumber() == uid && !voter[5]) {
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
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )
      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.elections(E_id)
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (election) {
          $('#E_id').html(election[0].toNumber())
          $('#E_name').html(election[1])
          $('#time_cand_register_end').html(
            new Date(election[2].toNumber() * 1000),
          )
          $('#time_polling_starts').html(
            new Date(election[3].toNumber() * 1000),
          )
          $('#time_polling_ends').html(new Date(election[4].toNumber() * 1000))
        })
    } else if (
      window.location.href.includes('http://localhost:3000/candidate.html')
    ) {
      E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )
      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )

      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.elections(E_id)
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (election) {
          $('#E_id').html(election[0].toNumber())
          $('#E_name').html(election[1])
          $('#time_cand_register_end').html(
            new Date(election[2].toNumber() * 1000),
          )
          $('#time_polling_starts').html(
            new Date(election[3].toNumber() * 1000),
          )
          $('#time_polling_ends').html(new Date(election[4].toNumber() * 1000))
        })
    } else if (
      window.location.href.includes('http://localhost:3000/voting.html')
    ) {
      E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )
      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )

      var electionInstance
      var loader = $('#loader')
      var currUid
      var pollStart
      var pollEnd
      var currTime = new Date().getTime() / 1000
      loader.show()
      $('form').hide()
      $('#done').hide()
      $('#timenotsuitable').hide()
      $('#blocked').hide()

      setTimeout(function () {
        App.contracts.Election.deployed()
          .then(function (instance) {
            electionInstance = instance
            return instance.addresses(App.account)
          })
          .then(function (u_id) {
            console.log(u_id.toNumber())
            if (App.loggedIN(u_id.toNumber())) {
              return electionInstance.candidate_count()
            } else {
              alert(
                'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
              )
              window.location.href = 'http://localhost:3000'
              App.render()
            }
          })
          .then(function (candidatesCount) {
            //Empty candidates List for table
            $('#candidateList').empty()
            $('#candidatesSelect').empty()

            for (var i = 0; i < candidatesCount.toNumber(); i++) {
              electionInstance.candidates(i).then(function (candidate) {
                if (candidate[3].toNumber() == E_id) {
                  electionInstance
                    .users(candidate[0].toNumber())
                    .then(function (user) {
                      if (user[4].toNumber() == 1 && !candidate[5]) {
                        var candidateTemplate =
                          '<tr><th>' +
                          candidate[0] +
                          '</th><td>' +
                          candidate[2] +
                          '</td><td>' +
                          user[3] +
                          '</td></tr>'
                        $('#candidateList').append(candidateTemplate)
                        var candidateOption =
                          "<option value='" +
                          candidate[0] +
                          "' >" +
                          candidate[2] +
                          '</ option>'
                        $('#candidatesSelect').append(candidateOption)
                      }
                    })
                }
              })
            }
            return electionInstance.elections(E_id)
          })
          .then(function (election) {
            pollStart = election[3]
            pollEnd = election[4]
            return electionInstance.addresses(App.account)
          })
          .then(function (id) {
            currUid = id
            return electionInstance.voter_list_count()
          })
          .then(function (totalvoters) {
            for (var i = 1; i <= totalvoters.toNumber(); i++) {
              electionInstance.voterlist(i).then(function (voter) {
                if (
                  voter[0].toNumber() == currUid.toNumber() &&
                  voter[1] == E_id &&
                  voter[2] == false &&
                  voter[4] == false &&
                  currTime >= pollStart &&
                  currTime <= pollEnd
                ) {
                  loader.hide()
                  $('form').show()
                } else if (
                  voter[0].toNumber() == currUid.toNumber() &&
                  voter[1] == E_id &&
                  voter[2] == true &&
                  voter[4] == false &&
                  currTime >= pollStart &&
                  currTime <= pollEnd
                ) {
                  loader.hide()
                  $('#content').hide()
                  $('#done').show()
                } else if (
                  voter[0].toNumber() == currUid.toNumber() &&
                  voter[1] == E_id &&
                  voter[4] == true
                ) {
                  $('#content').hide()
                  $('#blocked').show()
                  loader.hide()
                } else if (currTime < pollStart || currTime > pollEnd) {
                  loader.hide()
                  $('#content').hide()
                  $('#timenotsuitable').show()
                }
              })
            }
          })
      }, 40)
    } else if (
      window.location
        .toString()
        .includes('http://localhost:3000/admin_add_voter.html')
    ) {
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      var electionInstance
      var already_registered_voters = []
      console.log('E_id : ' + E_id)
      setTimeout(function () {
        App.contracts.Election.deployed()
          .then(function (instance) {
            electionInstance = instance
            return instance.addresses(App.account)
          })
          .then(function (u_id) {
            console.log(u_id.toNumber())
            if (App.loggedIN(u_id.toNumber())) {
              return electionInstance.voter_list_count()
            } else {
              alert(
                'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
              )
              window.location.href = 'http://localhost:3000'
              App.render()
            }
          })
          .then(function (voter_list_count) {
            for (var i = 1; i <= voter_list_count.toNumber(); i++) {
              electionInstance.voterlist(i).then(function (voter) {
                if (E_id == voter[1].toNumber()) {
                  already_registered_voters.push(voter[0].toNumber())
                }
              })
            }
            electionInstance.user_count().then(function (user_count) {
              var add_voter = $('#add_voter')
              add_voter.empty()
              for (var j = 2; j <= user_count.toNumber(); j++) {
                electionInstance.users(j).then(function (user) {
                  var id = user[0].toNumber()
                  var name = user[2]

                  if (!already_registered_voters.includes(id)) {
                    console.log('Not a registered voter for this E_id: ' + id)
                    var add_voter_template =
                    "<option value='" +
                    id +
                    "' >" +
                    "ID: " + id +
                    '&emsp; Name: ' +
                    name +
                    '</ option>'
                    add_voter.append(add_voter_template)
                  }
                })
              }
            })
          })

        App.contracts.Election.deployed()
          .then(function (instance) {
            electionInstance = instance
            return instance.addresses(App.account)
          })
          .then(function (u_id) {
            console.log(u_id.toNumber())
            if (App.loggedIN(u_id.toNumber())) {
              return electionInstance.voter_list_count()
            } else {
              alert(
                'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
              )
              window.location.href = 'http://localhost:3000'
              App.render()
            }
          })
          .then(function (voter_list_count) {
            var display_old_voters = $('#already_registered_voters')
            var display_voters_to_delete = $('#delete_voter')
            var display_deleted_voters = $('#already_deleted_voters')
            display_old_voters.empty()
            display_voters_to_delete.empty()
            display_deleted_voters.empty()
            for (var j = 1; j <= voter_list_count; j++) {
              electionInstance.voterlist(j).then(function (voter) {
                if (E_id == voter[1].toNumber()) {
                  var id = voter[0].toNumber()
                  electionInstance.users(id).then(function (user) {
                    if(!voter[5]){
                      console.log('Already Regsitered for this E_id: ' + id)
                      var name = user[2]
                      var display_old_voters_template =
                      '<li>' + "<b>ID: </b>" + id + '<b>&emsp; Name: </b>' + name + '</li>'

                      var add_voter_template =
                      "<option value='" +
                      id +
                      "' >" +
                      "ID: " + id +
                      '&emsp; Name: ' +
                      name +
                      '</ option>'
                      display_voters_to_delete.append(add_voter_template)
                        // '<li> id: ' + id + ', Name: ' + name + '</li>'
                      display_old_voters.append(display_old_voters_template)
                    }
                    else if(voter[5]){
                      console.log('Already Deleted for this E_id: ' + id)
                      var name = user[2]
                      var display_deleted_voters_template =
                      '<li>' + "<b>ID: </b>" + id + '<b>&emsp; Name: </b>' + name + '</li>'

                      display_deleted_voters.append(display_deleted_voters_template)
                    }
                  })
                }
              })
            }
          })
      }, 40)
    } else if (
      window.location
        .toString()
        .includes('http://localhost:3000/admin_add_candidate.html')
    ) {
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      console.log('E_id: ' + E_id)
      var electionInstance
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.candidate_count()
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (candidate_count) {
          var add_candidate = $('#add_candidate')
          add_candidate.empty()
          for (var i = 0; i < candidate_count.toNumber(); i++) {
            electionInstance.candidates(i).then(function (candidate) {
              var C_id = candidate[0].toNumber()
              var name = candidate[2]
              var cand_E_id = candidate[3].toNumber()
              console.log(C_id + " " + name)
              //   var flag = 0;
              electionInstance.users(C_id).then(function (user) {
                // Check that the user permissions are for voter only and
                // he's not already a candidate or blacklisted or an admin
                if (user[4].toNumber() == 0 && E_id == cand_E_id) {
                  var add_candidate_template =
                    "<option value='" +
                    C_id +
                    "' >" +
                    "ID: " + C_id +
                    '&emsp; Name: ' +
                    user[2] +
                    '</ option>'
                  add_candidate.append(add_candidate_template)
                }
              })
            })
          }
          return electionInstance.candidate_count()
        })
        .then(function (candidate_count) {
          var display_old_candidates = $('#already_registered_candidates')
          var display_candidates_to_delete = $('#delete_candidate')
          var display_deleted_candidates = $('#already_deleted_candidates')
          display_old_candidates.empty()
          display_candidates_to_delete.empty()
          display_deleted_candidates.empty()
          for (var j = 0; j < candidate_count.toNumber(); j++) {
            electionInstance.candidates(j).then(function (candidate) {
              if (E_id == candidate[3].toNumber()) {
                var C_id = candidate[0].toNumber()
                console.log('C_id: ' + C_id)
                electionInstance.users(C_id).then(function (user) {
                  var id = user[0].toNumber()
                  var name = user[2]
                  // Check the permissions in the user struct if they are 1
                  if (user[4].toNumber() == 1) {
                    if(!candidate[5]){
                      var display_old_candidates_template =
                        // '<li>' + id + ': ' + name + '</li>'
                      '<li>' + "<b>ID: </b>" + id + '<b>&emsp; Name: </b>' + name + '</li>'

                      var add_candidate_template =
                      "<option value='" +
                      id +
                      "' >" +
                      "ID: " + id +
                      '&emsp; Name: ' +
                      name +
                      '</ option>'

                      display_candidates_to_delete.append(add_candidate_template)
                      display_old_candidates.append(display_old_candidates_template)
                    }
                     else if(candidate[5]){
                      console.log('Already Deleted for this E_id: ' + id)
                      // var name = user[2]
                      var display_deleted_candidates_template =
                      '<li>' + "<b>ID: </b>" + id + '<b>&emsp; Name: </b>' + name + '</li>'

                      display_deleted_candidates.append(display_deleted_candidates_template)
                    }
                  }
                })
              }
            })
          }
        })
    } else if (
      window.location
        .toString()
        .includes('http://localhost:3000/admin_accept_reports.html')
    ) {
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      var electionInstance
      var all_reqorts_received = []
      var all_reqorts_received_reasons = []
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.report_count()
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (report_count) {
          console.log("REPORT Count: " + report_count)
          for (var i = 1; i <= report_count; i++) {
            electionInstance.reports(i).then(function (report) {
              var report_id = report[0].toNumber()
              var id = report[2].toNumber()
              var report_E_id = report[1].toNumber()
              var reason = report[3].toString()

              if (report_E_id == E_id) {
                all_reqorts_received.push(id)
                all_reqorts_received_reasons.push(reason)
              }
            })
          }

          electionInstance.voter_list_count().then(function (voter_list_count) {
            var add_to_reported = $('#add_to_reported')
            add_to_reported.empty()
            console.log("Voter List Count: " + voter_list_count)
            for (var j = 1; j <= voter_list_count; j++) {
              console.log("J" + j)
              electionInstance.voterlist(j).then(function (voter) {
                var id = voter[0].toNumber()
                // console.log("J and ID: " + j + " " + id)
                // Check that the E_ids are same, also the id of the uesr whose complait is received matches the
                // voters id and also that the admin has not already added the voter to the blacklist
                if (
                  voter[1].toNumber() == E_id &&
                  all_reqorts_received.includes(id) &&
                  voter[4] == false &&
                  voter[5] == false
                ) {
                  console.log("UID: " + id)

                  var x = all_reqorts_received.indexOf(id)
                  var reason = all_reqorts_received_reasons[x]
                  var add_to_reported_template =
                    "<option value='" +
                    id +
                    "' >" +
                    "ID: " + id +
                    ', &emsp; Reason: ' +
                    reason +
                    '</ option>'
                  add_to_reported.append(add_to_reported_template)
                }
              })
            }
          })
        })

      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.voter_list_count()
        })
        .then(function (voter_list_count) {
          var display_already_blacklisted = $('#display_already_blacklisted')
          display_already_blacklisted.empty()
          for (var j = 1; j <= voter_list_count; j++) {
            electionInstance.voterlist(j).then(function (voter) {
              var id = voter[0].toNumber()
              if (voter[1].toNumber() == E_id && voter[4] == true) {
                electionInstance.users(id).then(function (user) {
                  name = user[2]
                  var display_already_blacklisted_template =
                    '<li>' + "<b>ID: </b>" + id + '<b>&emsp; Name: </b>' + name + '</li>'
                  display_already_blacklisted.append(
                    display_already_blacklisted_template,
                  )
                })
              }
            })
          }
        })
    }
    // else if (
    //     window.location.href.includes('http://localhost:3000/manage_election.html')
    //   ) {
    //     console.log("Print")
    //     E_id = parseInt(window.location.hash.substr(-1))
    //   }
    else if (
      window.location.href.includes('http://localhost:3000/report.html')
    ) {
      var electionInstance
      E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )
      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )

      var electionInstance
      var id
      setTimeout(function () {
        App.contracts.Election.deployed()
          .then(function (instance) {
            electionInstance = instance
            return instance.addresses(App.account)
          })
          .then(function (u_id) {
            id = u_id.toNumber()
            console.log("ID: " + id)
            if (App.loggedIN(u_id.toNumber())) {
              return electionInstance.voter_list_count()
            } else {
              alert(
                'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
              )
              window.location.href = 'http://localhost:3000'
              App.render()
            }
          })
          .then(function (votersCount) {
            $('#UserSelect').empty()
            for (var i = 1; i <= votersCount.toNumber(); i++) {
              electionInstance.voterlist(i).then(function (voter) {
                if (!voter[3] && voter[1].toNumber() == E_id && voter[0].toNumber() != id && !voter[5]) {
                  console.log("U_id and Voter ID: " + id + " " + voter[0].toNumber())
                  electionInstance
                    .users(voter[0].toNumber())
                    .then(function (user) {
                      var voterOption =
                        "<option value='" +
                        user[0].toNumber() +
                        "' >" + "ID: " + user[0].toNumber() +
                        "&emsp; Name: " + user[2] +
                        '</ option>'
                      $('#UserSelect').append(voterOption)
                    })
                }
              })
            }
          })
      }, 40)
    } else if (
      window.location.href.includes(
        'http://localhost:3000/applyforcandidacy.html',
      )
    ) {
      var electionInstance
      E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )

      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )

      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )

      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )

    // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      var electionInstance
      var id
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          id = u_id.toNumber()
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.candidate_count()
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (candidate_count) {
          console.log("candidate_count: " + candidate_count)

          electionInstance.users(id).then(function (user) {
            if (user[5].toNumber() < 5000){
              $('form').hide()
              window.alert("You are already a candidate in some election");
            }
            else {
              for(j = 0; j < candidate_count.toNumber(); j++){
              electionInstance.candidates(j).then(function (candidate){
                if (candidate[0].toNumber() == id && candidate[3].toNumber() == E_id){
                  $('form').hide()
                  window.alert("You have already applied for candidacy in this election");
                  }
                })
              }
            }
          })  
        })
    }
    // For admin view results
    else if (
      window.location
        .toString()
        .includes('http://localhost:3000/admin_view_results.html')
    ) {
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      var electionInstance
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.candidate_count()
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (candidate_count) {
          var display_result = $('#display_result_of_election')
          display_result.empty()
          for (var j = 0; j < candidate_count; j++) {
            electionInstance.candidates(j).then(function (candidate) {
              if (E_id == candidate[3].toNumber() && !candidate[5]) {
                var C_id = candidate[0].toNumber()
                var vote_count = candidate[1].toNumber()
                electionInstance.users(C_id).then(function (user) {
                  console.log('Already Regsitered for this E_id: ' + C_id)
                  var name = user[2]
                  var permissions = user[4].toNumber()
                  if (permissions == 1) {
                    
                    var display_result_template =
                          '<tr><td>' +
                          C_id +
                          '</td><td>' +
                          name +
                          '</td><td>' +
                          vote_count +
                          '</td></tr'
                    display_result.append(display_result_template)
                  }
                  
                  console.log(display_result)
                  if (display_result == []) {
                    $('#content').hide()
                  } else {
                    $('#done').hide()
                  }
                })
              }
            })
          }          
        })
    } else if (
      window.location.toString().includes('http://localhost:3000/result.html')
    ) {
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )
      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )
      console.log(E_id)
      var electionInstance
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.elections(E_id)
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (election) {
          time_polling_ends = election[4].toNumber()
          var current_time = Date.now() / 1000
          // Check that the voting period is over before
          // displaying result
          console.log(time_polling_ends + ' ' + current_time)
          if (current_time > time_polling_ends) {
            electionInstance.candidate_count().then(function (candidate_count) {
              console.log('candidate_count ' + candidate_count)
              var display_result = $('#display_result_of_election')
              display_result.empty()
              for (var j = 0; j < candidate_count; j++) {
                console.log('J= ' + j)
                electionInstance.candidates(j).then(function (candidate) {
                  console.log(candidate)

                  if (E_id == candidate[3].toNumber()  && !candidate[5]) {
                    var C_id = candidate[0].toNumber()
                    var vote_count = candidate[1].toNumber()
                    console.log(C_id + ' ' + vote_count)
                    electionInstance.users(C_id).then(function (user) {
                      console.log('Already Regsitered for this E_id: ' + C_id)
                      var name = user[2]
                      var permissions = user[4].toNumber()
                      console.log('permissions =' + permissions)
                      if (permissions == 1) {
                        console.log('HI')
                        var display_result_template =
                          '<tr><td>' +
                          C_id +
                          '</td><td>' +
                          name +
                          '</td><td>' +
                          vote_count +
                          '</td></tr>'
                        display_result.append(display_result_template)
                      }
                    })
                  }
                })
              }
            })
          } else {
            window.alert(
              "Voting hasn't ended yet. Can't diplay the result yet.",
            )
          }
        })
    }
    // New Campaigning page
    else if (
      window.location.toString().includes('http://localhost:3000/campaign.html')
    ) {
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      console.log('E_id: ' + E_id)
      var electionInstance
      var loader = $('#loader')
      var content = $('#content')

      loader.show()
      content.hide()
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#result').html(
        '<a class="nav-link" href="http://localhost:3000/result.html#E_id=' +
          E_id +
          '">View Results</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
      $('#campaign').html(
        '<a class="nav-link" href="http://localhost:3000/campaign.html#E_id=' +
          E_id +
          '">Campaigning Portal</a>',
      )
      $('#applyforcandidacy').html(
        '<a class="nav-link" href="http://localhost:3000/applyforcandidacy.html#E_id=' +
          E_id +
          '">Apply for Candidacy</a>',
      )
      var electionInstance
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.campaign_count()
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (campaign_count) {
          var display_campaign = $('#campaigning')
          display_campaign.empty()
          console.log(campaign_count.toNumber())
          for (var j = 1; j <= campaign_count.toNumber(); j++) {
            electionInstance.campaigns(j).then(function (campaign) {
              if (E_id == campaign[3].toNumber()) {
                var desc = campaign[1].toString()
                var Cand_id = campaign[2].toNumber()
                var Cand_name = campaign[4].toString()
                var cand_desc;
                return electionInstance
                  .users(Cand_id)
                  .then(function (user) {
                    return user[5].toNumber()
                  })
                  .then(function (cand_index) {
                    return electionInstance.candidates(cand_index)
                  })
                  .then(function (candidate) {
                    return candidate[4].toString()
                  })
                  .then(function (cand_desc) {
                    cand_desc = cand_desc
                    return electionInstance.voter_list_count()
                  })
                  .then(function (voter_list_count){
                    for(var k = 1; k <= voter_list_count.toNumber(); k++){
                      electionInstance.voterlist(k).then(function (voter){
                        if (voter[0].toNumber() == Cand_id && voter[1].toNumber() == E_id && !voter[4]){
                          var update_campaign =
                          '<li> <h3>' +
                          '<b>ID: &nbsp;</b>' +
                          Cand_id +
                          ' ' +
                          '&emsp; &emsp; &emsp; &emsp; &emsp; &emsp; <b>Name: &nbsp;</b>' +
                          Cand_name +
                          '</h3><br>' +
                          '<h4><b>Personal Info: &nbsp;</b>' +
                          cand_desc +
                          '</h4><br>' +
                          '<h4><b>Campaign Desc: &nbsp;</b>' +
                          desc +
                          '<h4></li><br><br>'
                          display_campaign.append(update_campaign)
                        }
                      })
                    }
                  })
                }
                })
              }
            // })
          
          return electionInstance.addresses(App.account)
        })
        .then(function (id) {
          Cand_id = id;
          console.log("Cand_id : " + Cand_id)
          return electionInstance.users(id.toNumber())
        })
        .then(function (user) {
          return user[5].toNumber()
        })
        .then(function (cand_index) {
          console.log("cand_index" + cand_index)
          if (cand_index > 4999) {
            $('form').hide()
          } else {
            return electionInstance.candidates(cand_index)
              .then(function (cand) {
                candidate = cand

                return electionInstance.voter_list_count()
                  })
                  .then(function (voter_list_count){
                    for(var k = 1; k <= voter_list_count.toNumber(); k++){
                      electionInstance.voterlist(k).then(function (voter){
                        if ((voter[0].toNumber() == Cand_id && voter[1].toNumber() == E_id && voter[4]) || candidate[5]){
                          console.log("HIDE ME")
                          $('form').hide()
                        }
                      })
                    }
                  })




                // console.log(candidate[3], E_id)
                // if (candidate[3] != E_id ) {
                //   $('form').hide()
                }
              })
          // }
        // })
        .catch(function (error) {
          console.warn(error)
        })
      loader.hide()
      content.show()
    }
    else if(window.location.toString().includes('http://localhost:3000/admin_view_campaign.html')){
      // Get Election ID from the previous page
      var E_id = parseInt(window.location.hash.substr(-1))
      console.log('E_id: ' + E_id)
      var electionInstance
      var loader = $('#loader')
      var content = $('#content')

      loader.show()
      content.hide()
      var electionInstance
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id) {
          console.log(u_id.toNumber())
          if (App.loggedIN(u_id.toNumber())) {
            return electionInstance.campaign_count()
          } else {
            alert(
              'It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.',
            )
            window.location.href = 'http://localhost:3000'
            App.render()
          }
        })
        .then(function (campaign_count) {
          var display_campaign = $('#campaign')
          display_campaign.empty()
          for (var j = 1; j <= campaign_count.toNumber(); j++) {
            electionInstance.campaigns(j).then(function (campaign) {
              if (E_id == campaign[3].toNumber()) {
                var desc = campaign[1].toString()
                var Cand_id = campaign[2].toNumber()
                var Cand_name = campaign[4].toString()
                return electionInstance
                  .users(Cand_id)
                  .then(function (user) {
                    return user[5].toNumber()
                  })
                  .then(function (cand_index) {
                    return electionInstance.candidates(cand_index)
                  })
                  .then(function (candidate) {
                    return candidate[4].toString()
                  })
                  .then(function (cand_desc) {
                    var update_campaign =
                      '<li> <h3>' +
                      '<b>ID: &nbsp;</b>' +
                      Cand_id +
                      ' ' +
                      '&emsp; &emsp; &emsp; &emsp; &emsp; &emsp; <b>Name: &nbsp;</b>' +
                      Cand_name +
                      '</h3><br>' +
                      '<h4><b>Personal Info: &nbsp;</b>' +
                      cand_desc +
                      '</h4><br>' +
                      '<h4><b>Campaign Desc: &nbsp;</b>' +
                      desc +
                      '<h4></li><br><br>'
                    console.log(update_campaign)
                    display_campaign.append(update_campaign)
                  })
              }
            })
          }
        })
        .catch(function (error) {
          console.warn(error)
        })
      loader.hide()
      content.show()
    }
    // else if (window.location.href == 'http://localhost:3000/campaign.html') {
    //   //add front-end for campaign
    //   var electionInstance
    //   var loader = $('#loader')
    //   var content = $('#content')

    //   loader.show()
    //   content.hide()

    //   App.contracts.Election.deployed()
    //     .then(function (instance) {
    //       electionInstance = instance
    //       return electionInstance.campaign_count()
    //     })
    //     .then(function (campaign_count) {
    //       var display_campaign = $('display-campaign')
    //       display_campaign.empty()
    //       for (var i = 1; i < campaign_count; i++) {
    //         return electionInstance.campaigns(i).then(function (campaign) {
    //           var e_id = campaign[3]
    //           //require(e_id == curr_e_id)
    //           var hash = campaign[1]
    //           var Cand_id = campaign[2]
    //           var Cand_name = campaign[4]

    //           var update_campaign =
    //             '<h2>' +
    //             Cand_id +
    //             ' ' +
    //             Cand_name +
    //             '</h2><br><br><img src={`https://ipfs.infura.io/ipfs/' +
    //             hash +
    //             "`} style={{ maxWidth: '420px'}}/>"

    //           display_campaign.append(update_campaign)
    //         })
    //       }
    //       return electionInstance.voters(App.account)
    //     })
    //     .then(function (iscandidate) {
    //       if (iscandidate == false) {
    //         $('form').hide()
    //       }
    //       loader.hide()
    //       content.show()
    //     })
    //     .catch(function (error) {
    //       console.warn(error)
    //     })
    // }
  },

  // Listen for events emitted from the contract
  manage_election_event: function () {
    var E_id = $('#manage_elections').val()
    console.log('Inside funtion manage_eletion_event. E_id: ' + E_id)
    window.location.href =
      'http://localhost:3000/admin_manage_election.html#manage_elections=' +
      E_id
  },

  Report: function () {
    var voter = parseInt($('#UserSelect').val())
    var reason = $('#reason').val()
    E_id = parseInt(window.location.hash.substr(-1))
    App.contracts.Election.deployed()
      .then(function (instance) {
        console.log(App.account)
        return instance.report_by_user(voter, E_id, reason, {
          from: App.account,
        })
      })
      .then(function () {
        console.log('HERE')
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

    console.log(cand_register_end)
    console.log(polling_starts)
    console.log(polling_ends)

    var current_time = new Date()
    current_time = current_time.getTime() / 1000
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
      var electionInstance = instance
      // instance.add_election(
      //   E_name,
      //   cand_register_end,
      //   polling_starts,
      //   polling_ends,
      // )
      console.log(E_name,
        cand_register_end,
        polling_starts,
        polling_ends)
      return electionInstance.add_election(
        E_name,
        cand_register_end,
        polling_starts,
        polling_ends,
        {
          from: App.account,
        },
      )
    })
    App.global_election_count++;
    window.location.href = 'http://localhost:3000/admin_home.html'
  },

  edit_election_event: function () {
    var E_id = parseInt(window.location.hash.substr(-1))
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

    console.log(cand_register_end)
    console.log(polling_starts)
    console.log(polling_ends)

    var current_time = new Date()
    current_time = current_time.getTime() / 1000
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
      var electionInstance = instance
      // instance.add_election(
      //   E_name,
      //   cand_register_end,
      //   polling_starts,
      //   polling_ends,
      // )
      return electionInstance.edit_election(
        E_id,
        E_name,
        cand_register_end,
        polling_starts,
        polling_ends,
        {
          from: App.account,
        },
      )
    })
    window.location.href =
      'http://localhost:3000/admin_manage_election.html#E_id=' + E_id
  },

  // Call to the below function will be made when the admin creates a new election
  // by submitting the form
  // admin_add_voter: function () {
  //   // Get the Election ID from the previous page somehow
  //   var E_id = parseInt(window.location.hash.substr(-1))

  //   // Get the id of the user to be registered as a voter for the E_id
  //   var id = $('#add_voter').val()

  //   console.log(id)

  //   App.contracts.Election.deployed().then(function (instance) {
  //     // Add the user in the voterlist with the id and E_id
  //     instance.add_voter_by_admin(id, E_id)
  //   })
  //   window.location.href =
  //     'http://localhost:3000/admin_add_voter.html#E_id=' + E_id
  // },

  castVote: function () {
    var C_id = $('#candidatesSelect').val()
    var electionInstance
    E_id = parseInt(window.location.hash.substr(-1))
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        return electionInstance.addresses(App.account)
      })
      .then(function (id) {
        uid = id.toNumber()
        return electionInstance.vote(C_id, E_id, uid, { from: App.account })
      })
      .then(function (result) {
        // Wait for votes to update
        $('#content').hide()
        $('#loader').show()
      })
      .catch(function (error) {
        console.log(error)
      })
  },

  applyForCandidacy: function () {
    var electionInstance
    var E_id = parseInt(window.location.hash.substr(-1))
    var username = $('#username').val()
    var info = $('#info').val()
    // var description = $('#description').val()

    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        return electionInstance.addresses(App.account)
      })
      .then(function (id) {
        uid = id.toNumber()
        console.log(E_id, uid, username)
        return electionInstance.add_candidate(uid, username, E_id, info, {
          from: App.account,
        })
      })
  },

  admin_add_voter: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    // Get the id of the user to be registered as a voter for the E_id
    var id = $('#add_voter').val()
    App.contracts.Election.deployed().then(function (instance) {
      // Add the user in the voterlist with the id and E_id
      return instance.add_voter_by_admin(E_id, id, { from: App.account })
    })
  },

  admin_delete_voter: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    // Get the id of the voter to be deleted as a voter for the E_id
    var id = $('#delete_voter').val()
    App.contracts.Election.deployed().then(function (instance) {
      // Delete the voter in the voterlist with the id and E_id and give type as 1 for voter
      return instance.admin_delete(id, E_id, 1, { from: App.account })
    })
  },

  admin_add_candidate: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    // Get the id of the user to be registered as a voter for the E_id
    var id = $('#add_candidate').val()
    App.contracts.Election.deployed().then(function (instance) {
      // Add the user in the voterlist with the id and E_id
      return instance.candidate_approved_by_admin(id, {
        from: App.account,
      })
    })
  },

  admin_delete_candidate: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    // Get the id of the user to be registered as a voter for the E_id
    var id = $('#delete_candidate').val()
    App.contracts.Election.deployed().then(function (instance) {
      // Delete the voter in the voterlist with the id and E_id and give type as 1 for voter
      return instance.admin_delete(id, E_id, 2, { from: App.account })
    })
  },

  // Call to the below function will be made when the admin accepts a report
  // by submitting the form
  admin_accept_report: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    // Get the id of the user to be blacklisted for that election
    var id = $('#add_to_reported').val()

    console.log(id + ' ' + E_id)

    App.contracts.Election.deployed().then(function (instance) {
      // Change the user permission of the uesr with C_id to 1 to show that he's
      // an approved candidate
      return instance.blacklist_by_admin(id, E_id, {
        from: App.account,
      })
    })
    console.log('heelo')
    window.location.href =
      'http://localhost:3000/admin_accept_reports.html#E_id=' + E_id
  },

  admin_add_voter_page_event: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    console.log('h')
    window.location.href =
      'http://localhost:3000/admin_add_voter.html#E_id=' + E_id
  },

  admin_add_candidate_page_event: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    console.log('heel')
    window.location.href =
      'http://localhost:3000/admin_add_candidate.html#E_id=' + E_id
  },

  admin_check_reports_page_event: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    console.log('heelo')
    window.location.href =
      'http://localhost:3000/admin_accept_reports.html#E_id=' + E_id
  },
  admin_view_results_event: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    console.log('hlo')
    window.location.href =
      'http://localhost:3000/admin_view_results.html#E_id=' + E_id
  },

  admin_view_campaign_event: function(){
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    window.location.href =
      'http://localhost:3000/admin_view_campaign.html#E_id=' + E_id
    
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
                if (candidate[3] == ElectionIDForVoter && !candidate[5]) {
                  window.location.href =
                    'http://localhost:3000/candidate.html#manage_elections=' +
                    ElectionIDForVoter
                } else {
                  window.location.href =
                    'http://localhost:3000/Voter.html#manage_elections=' +
                    ElectionIDForVoter
                }
              })
          } else {
            window.location.href =
              'http://localhost:3000/Voter.html#manage_elections=' +
              ElectionIDForVoter
          }
        })
    }, 40)
  },

  login: function () {
    var ElectionInstance
    var loader = $('#loader')
    var content = $('#content')
    var paswd

    loader.show()
    content.hide()

    var U_id = $('#u_id').val()
    var pwd = $('#pwd').val()
    console.log(U_id, pwd)
    App.contracts.Election.deployed()
      .then(function (instance) {
        ElectionInstance = instance
        return instance.users(U_id)
      })
      .then(function (user) {
        paswd = user[6]
        console.log(paswd)
        add = user[1]
        console.log(add)
        console.log(App.account)
        if (paswd == pwd && add == App.account) {
          localStorage.id = U_id
          var result = user[4].toNumber()
          console.log(result)
          if (result == 2) {
            window.location.href = 'http://localhost:3000/admin_home.html'
          } else {
            window.location.href = 'http://localhost:3000/voter_home.html'
          }
        } else {
          alert('invalid Login Credentials!!\n Please try Again.')
        }
      })
      .catch(function (err) {
        console.error(err)
      })
    loader.hide()
    content.show()
  },

  register: function () {
    var electionInstance
    var loader = $('#loader')
    var content = $('#content')

    loader.show()
    content.hide()

    var name = $('#name').val()
    var mail = $('#mail').val()
    var pwd = $('#pwd').val()
    var confirm_pwd = $('#confirm_pwd').val()
    if (pwd != confirm_pwd) {
      alert('Passwords do not match')
    } else {
      console.log(name, mail, pwd)
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.add_user(App.account, name, mail, pwd, 0, {
            from: App.account,
          })
        })
        .then(function () {
          return electionInstance.user_count()
        })
        .then(function (result) {
          console.log(result.toNumber())
          alert(
            'Congratulations! You are now registered to our Portal\n Your UserID is ' +
              result.toNumber() +
              '.\n Please use this UserID to login.',
          )
        })
        .catch(function (err) {
          console.error(err)
        })
    }
    loader.hide()
    content.show()
  },

  uploadCampaign: function () {
    var electionInstance
    var loader = $('#loader')
    var content = $('#content')

    loader.show()
    content.hide()
    // console.log('Uploading to IPFS...')
    // const E_id = parseInt(window.location.hash.substr(-1))

    // //Adding to IPFS
    // ipfs.add(this.state.buffer, (error, result) => {
    //   console.log('IPFS : ', result)
    //   if (error) {
    //     console.error(error)
    //     return
    //   }

    //   this.setState({ loading: true })
    //   this.state.Election.methods
    //     .uploadImage(result[0].hash)
    //     .send({ from: this.state.account })
    //     .on('transactionHash', (hash) => {
    //       this.setState({ loading: false })
    //     })
    // })
    // return App.render()
    var desc = $('#description').val()
    console.log(desc)
    const E_id = parseInt(window.location.hash.substr(-1))
    console.log(E_id)
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        return instance.uploadCampaign(desc, E_id, { from: App.account })
      })
      .catch(function (err) {
        console.error(err)
      })
    loader.hide()
    content.show()
    App.render()
  },

  loggedIN: function (u_id) {
    // console.log(u_id, localStorage.id)
    if (u_id == localStorage.id) {
      return true
    } else {
      return false
    }
  },

  logout: function () {
    localStorage.clear()
    alert('You Have been Successfully Logged Out!')
    window.location.href = 'http://localhost:3000'
    App.render()
  },
}

$(function () {
  $(window).load(function () {
    App.init()
  })
})
