App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  buffer: {},

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
          console.log('event triggered', event)
          // Reload when a new vote is recorded
          App.render()
        })
    })
  },

  render: function () {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        if (account == null) {
          alert('No account connected, Connect your blockchain account first!')
          return
        } else {
          App.account = account
          $('#accountAddress').html('Your Account: ' + account)
        }
      }
    })
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
      // console.log(App.ifloggedin)
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return instance.addresses(App.account)
        })
        .then(function (u_id){
          console.log(u_id.toNumber())
          if(App.loggedIN(u_id.toNumber())){
            return electionInstance.election_count()
          }
          else{
            alert("It looks like some error has occured. You have been logged out!!!\n Please LogIN again to continue.")
            window.location.href = 'http://localhost:3000'
            return App.render()
          }
        })
        .then(function (election_count) {
          var manage_elections = $('#manage_elections')
          manage_elections.empty()
          window.loca
          for (var i = 1; i <= election_count; i++) {
            electionInstance.elections(i).then(function (election) {
              var id = election[0].toNumber()
              var name = election[1]

              // Render candidate Result
              //   var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
              //   candidatesResults.append(candidateTemplate);

              // Render candidate ballot option
              var manage_elections_template =
                "<option value='" + id + "' >" + id + ': ' + name + '</ option>'
              manage_elections.append(manage_elections_template)
            })
          }
          //   return electionInstance.voters(App.account);
        })
    } else if (
      window.location
        .toString()
        .includes('http://localhost:3000/admin_manage_election.html')
    ) {
      var E_id = parseInt(window.location.hash.substr(-1))
      console.log(E_id)
      var Election_id_show = $('#Election_id_show')
      Election_id_show.append('Election Id : ' + E_id)
    }
    // else if (
    //   window.location
    //     .toString()
    //     .includes('http://localhost:3000/admin_add_voter.html')
    // ) {
    //   // Get Election ID from the previous page
    //   var E_id = parseInt(window.location.hash.substr(-1))
    //   var electionInstance
    //   var already_registered_voters = []
    //   console.log('E_id : ' + E_id)
    //   setTimeout(function () {
    //     App.contracts.Election.deployed()
    //       .then(function (instance) {
    //         electionInstance = instance
    //         return electionInstance.voter_list_count()
    //       })
    //       .then(function (voter_list_count) {
    //         var add_voter = $('#add_voter')
    //         add_voter.empty()
    //         window.loca
    //         for (var i = 1; i <= voter_list_count.toNumber(); i++) {
    //           electionInstance.voterlist(i).then(function (voter) {
    //             if (E_id == voter[1].toNumber()) {
    //               already_registered_voters.push(voter[0].toNumber())
    //             }
    //           })
    //         }
    //         electionInstance.user_count().then(function (user_count) {
    //           for (var j = 2; j <= user_count.toNumber(); j++) {
    //             electionInstance.users(j).then(function (user) {
    //               var id = user[0].toNumber()
    //               var name = user[2]

    //               if (!already_registered_voters.includes(id)) {
    //                 console.log('Not a registered voter for this E_id: ' + id)
    //                 var add_voter_template =
    //                   "<option value='" +
    //                   id +
    //                   "' >" +
    //                   id +
    //                   ': ' +
    //                   name +
    //                   '</ option>'
    //                 add_voter.append(add_voter_template)
    //               }
    //             })
    //           }
    //         })
    //       })

    //     App.contracts.Election.deployed()
    //       .then(function (instance) {
    //         electionInstance = instance
    //         return electionInstance.voter_list_count()
    //       })
    //       .then(function (voter_list_count) {
    //         var display_old_voters = $('#already_registered_voters')
    //         display_old_voters.empty()
    //         for (var j = 1; j <= voter_list_count; j++) {
    //           electionInstance.voterlist(j).then(function (voter) {
    //             if (E_id == voter[1].toNumber()) {
    //               var id = voter[0].toNumber()
    //               electionInstance.users(id).then(function (user) {
    //                 console.log('Already Regsitered for this E_id: ' + id)
    //                 var name = user[2]
    //                 var display_old_voters_template =
    //                   '<li> id: ' + id + ', Name: ' + name + '</li>'
    //                 display_old_voters.append(display_old_voters_template)
    //               })
    //             }
    //           })
    //         }
    //       })
    //   }, 40)
    // }
    //else if (
    //   window.location
    //     .toString()
    //     .includes('http://localhost:3000/admin_add_candidate.html')
    // ) {
    //   // Get Election ID from the previous page
    //   var E_id = parseInt(window.location.hash.substr(-1))
    //   console.log('E_id: ' + E_id)
    //   var electionInstance
    //   App.contracts.Election.deployed()
    //     .then(function (instance) {
    //       electionInstance = instance
    //       return electionInstance.candidate_count()
    //     })
    //     .then(function (candidate_count) {
    //       var add_candidate = $('#add_candidate')
    //       add_candidate.empty()
    //       window.loca
    //       for (var i = 0; i < candidate_count.toNumber(); i++) {
    //         electionInstance.candidates(i).then(function (candidate) {
    //           var C_id = candidate[0].toNumber()
    //           var name = candidate[2]
    //           var cand_E_id = candidate[3].toNumber()
    //           //   var flag = 0;
    //           electionInstance.user_count().then(function (user_count) {})
    //           electionInstance.users(C_id).then(function (user) {
    //             // Check that the user permissions are for voter only and
    //             // he's not already a candidate or blacklisted or an admin
    //             if (user[4].toNumber() == 0 && E_id == cand_E_id) {
    //               var add_candidate_template =
    //                 "<option value='" +
    //                 C_id +
    //                 "' >" +
    //                 C_id +
    //                 ': ' +
    //                 name +
    //                 '</ option>'
    //               add_candidate.append(add_candidate_template)
    //             }
    //           })
    //         })
    //       }
    //     })

    //   App.contracts.Election.deployed()
    //     .then(function (instance) {
    //       electionInstance = instance
    //       return electionInstance.candidate_count()
    //     })
    //     .then(function (candidate_count) {
    //       var display_old_candidates = $('#already_registered_candidates')
    //       console.log(candidate_count.toNumber())
    //       for (var j = 0; j <= candidate_count.toNumber(); j++) {
    //         // console.log(j)
    //         electionInstance.candidates(j).then(function (candidate) {
    //           console.log(
    //             'Cand_id: ' +
    //               candidate[0].toNumber() +
    //               'E_id : ' +
    //               candidate[3].toNumber(),
    //           )
    //           if (E_id == candidate[3].toNumber()) {
    //             var C_id = candidate[0].toNumber()
    //             console.log('C_id: ' + C_id)
    //             electionInstance.users(C_id).then(function (user) {
    //               console.log('hello')

    //               var id = user[0].toNumber()
    //               var name = user[2]
    //               // Check the permissions in the user struct if they are 1
    //               if (user[4].toNumber() == 1) {
    //                 var display_old_candidates_template =
    //                   '<li>' + id + ': ' + name + '</li>'
    //                 display_old_candidates.append(
    //                   display_old_candidates_template,
    //                 )
    //               }
    //             })
    //           }
    //         })
    //       }
    //     })
    // }
    else if (window.location.href === 'http://localhost:3000/voter_home.html') {
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
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
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
    } else if (
      window.location.href.includes('http://localhost:3000/candidate.html')
    ) {
      E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )
    } else if (
      window.location.href.includes('http://localhost:3000/voting.html')
    ) {
      E_id = parseInt(window.location.hash.substr(-1))
      $('#vote').html(
        '<a class="nav-link" href="http://localhost:3000/voting.html#E_id=' +
          E_id +
          '">Vote</a>',
      )
      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
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
      // Load account data
      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account
          $('#accountAddress').html('Your Account: ' + account)
        }
      })

      setTimeout(function () {
        App.contracts.Election.deployed()
          .then(function (instance) {
            electionInstance = instance
            return electionInstance.candidate_count()
          })
          .then(function (candidatesCount) {
            for (var i = 0; i < candidatesCount.toNumber(); i++) {
              electionInstance.candidates(i).then(function (candidate) {
                if (candidate[3].toNumber() == E_id) {
                  electionInstance
                    .users(candidate[0].toNumber())
                    .then(function (user) {
                      if (user[4].toNumber() == 1) {
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
            return electionInstance.voter_list_count()
          })
          .then(function (voter_list_count) {
            var add_voter = $('#add_voter')
            add_voter.empty()
            window.loca
            for (var i = 1; i <= voter_list_count.toNumber(); i++) {
              electionInstance.voterlist(i).then(function (voter) {
                if (E_id == voter[1].toNumber()) {
                  already_registered_voters.push(voter[0].toNumber())
                }
              })
            }
            electionInstance.user_count().then(function (user_count) {
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
                      id +
                      ': ' +
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
            return electionInstance.voter_list_count()
          })
          .then(function (voter_list_count) {
            var display_old_voters = $('#already_registered_voters')
            display_old_voters.empty()
            for (var j = 1; j <= voter_list_count; j++) {
              electionInstance.voterlist(j).then(function (voter) {
                if (E_id == voter[1].toNumber()) {
                  var id = voter[0].toNumber()
                  electionInstance.users(id).then(function (user) {
                    console.log('Already Regsitered for this E_id: ' + id)
                    var name = user[2]
                    var display_old_voters_template =
                      '<li> id: ' + id + ', Name: ' + name + '</li>'
                    display_old_voters.append(display_old_voters_template)
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
          return electionInstance.candidate_count()
        })
        .then(function (candidate_count) {
          var add_candidate = $('#add_candidate')
          add_candidate.empty()
          for (var i = 0; i < candidate_count.toNumber(); i++) {
            electionInstance.candidates(i).then(function (candidate) {
              var C_id = candidate[0].toNumber()
              var name = candidate[2]
              var cand_E_id = candidate[3].toNumber()
              //   var flag = 0;
              electionInstance.users(C_id).then(function (user) {
                // Check that the user permissions are for voter only and
                // he's not already a candidate or blacklisted or an admin
                if (user[4].toNumber() == 0 && E_id == cand_E_id) {
                  var add_candidate_template =
                    "<option value='" +
                    C_id +
                    "' >" +
                    C_id +
                    ': ' +
                    name +
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
                    var display_old_candidates_template =
                      '<li>' + id + ': ' + name + '</li>'
                    display_old_candidates.append(
                      display_old_candidates_template,
                    )
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
          return electionInstance.report_count()
        })
        .then(function (report_count) {
          var add_to_reported = $('#add_to_reported')
          add_to_reported.empty()
          window.loca
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
            for (var j = 1; j <= voter_list_count; j++) {
              electionInstance.voterlist(j).then(function (voter) {
                var id = voter[0].toNumber()
                // Check that the E_ids are same, also the id of the uesr whose complait is received matches the
                // voters id and also that the admin has not already added the voter to the blacklist
                console.log(voter[4])
                if (
                  voter[1].toNumber() == E_id &&
                  all_reqorts_received.includes(id) &&
                  voter[4] == false
                ) {
                  var x = all_reqorts_received.indexOf(id)
                  var reason = all_reqorts_received_reasons[x]
                  var add_to_reported_template =
                    "<option value='" +
                    id +
                    "' >" +
                    id +
                    ': ' +
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

          for (var j = 1; j <= voter_list_count; j++) {
            electionInstance.voterlist(j).then(function (voter) {
              var id = voter[0].toNumber()
              if (voter[1].toNumber() == E_id && voter[4] == true) {
                electionInstance.users(id).then(function (user) {
                  name = user[2]
                  var display_already_blacklisted_template =
                    '<li>' + id + ': ' + name + '</li>'
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

      $('#report').html(
        '<a class="nav-link" href="http://localhost:3000/report.html#E_id=' +
          E_id +
          '">Report</a>',
      )

      var electionInstance
      setTimeout(function () {
        App.contracts.Election.deployed()
          .then(function (instance) {
            electionInstance = instance
            return electionInstance.voter_list_count()
          })
          .then(function (votersCount) {
            for (var i = 1; i <= votersCount.toNumber(); i++) {
              electionInstance.voterlist(i).then(function (voter) {
                if (!voter[4] && voter[1] == E_id) {
                  electionInstance
                    .users(voter[0].toNumber())
                    .then(function (user) {
                      var voterOption =
                        "<option value='" +
                        user[0] +
                        "' >" +
                        user[2] +
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
    } else if (
      window.location.href.includes('http://localhost:3000/campaign.html')
    ) {
      //add front-end for campaign
      E_id = parseInt(window.location.hash.substr(-1))

      var electionInstance
      var loader = $('#loader')
      var content = $('#content')

      loader.show()
      content.hide()

      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.campaign_count()
        })
        .then(function (campaign_count) {
          var display_campaign = $('display-campaign')
          display_campaign.empty()
          for (var i = 1; i < campaign_count; i++) {
            return electionInstance.campaigns(i).then(function (campaign) {
              if (campaign[3] == E_id) {
                //require(e_id == curr_e_id)
                var hash = campaign[1]
                var Cand_id = campaign[2]
                var Cand_name = campaign[4]

                var update_campaign =
                  '<h2>' +
                  Cand_id +
                  ' ' +
                  Cand_name +
                  '</h2><br><br><img src={`https://ipfs.infura.io/ipfs/' +
                  hash +
                  "`} style={{ maxWidth: '420px'}}/>"

                display_campaign.append(update_campaign)
              }
            })
          }
          return electionInstance.addresses(App.account)
        })
        .then(function (id) {
          return electionInstance.users(id.toNumber())
        })
        .then(function (user) {
          return electionInstance.candidates(user[5].toNumber())
        })
        .then(function (candidate) {
          if (candidate[3] != E_id) {
            $('form').hide()
          }
        })
        .catch(function (error) {
          console.warn(error)
        })
      loader.hide()
      content.show()
    }
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
    window.location.href = 'http://localhost:3000/create_election.html'
  },

  // Call to the below function will be made when the admin creates a new election
  // by submitting the form
  admin_add_voter: function () {
    // Get the Election ID from the previous page somehow
    var E_id = parseInt(window.location.hash.substr(-1))

    // Get the id of the user to be registered as a voter for the E_id
    var id = $('#add_voter').val()

    console.log(id)

    App.contracts.Election.deployed().then(function (instance) {
      // Add the user in the voterlist with the id and E_id
      instance.add_voter_by_admin(id, E_id)
    })
    window.location.href =
      'http://localhost:3000/admin_add_voter.html#E_id=' + E_id
  },

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
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        return electionInstance.addresses(App.account)
      })
      .then(function (id) {
        uid = id.toNumber()
        console.log(E_id, uid, username)
        return electionInstance.add_candidate(uid, username, E_id, {
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
                if (candidate[3] == ElectionIDForVoter) {
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
    var ElecInstance
    var loader = $('#loader')
    var content = $('#content')

    loader.show()
    content.hide()

    var name = $('#name').val()
    var mail = $('#mail').val()
    var pwd = $('#pwd').val()
    console.log(name, mail, pwd)
    App.contracts.Election.deployed()
      .then(function (instance) {
        ElecInstance = instance
        return instance.add_user(App.account, name, mail, pwd, 0, {
          from: App.account,
        })
      })
      .then(function () {
        return ElecInstance.user_count()
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
    loader.hide()
    content.show()
  },

  captureFile: function (event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      buffer = reader.result
      // this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', buffer)
    }
  },

  uploadImage: function () {
    var loader = $('#loader')
    var content = $('#content')

    loader.show()
    content.hide()

    console.log('Uploading to IPFS...')
    const E_id = parseInt(window.location.hash.substr(-1))
    var hash

    //Adding to IPFS
    ipfs.add(buffer, (error, result) => {
      console.log('IPFS : ', result)
      if (error) {
        console.error(error)
        return
      }
      hash = result[0].hash
    })
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.uploadImage(hash, E_id, { from: App.account })
      })
      .catch(function (err) {
        console.error(err)
      })
    loader.hide()
    content.show()
    return App.render()
  },

  loggedIN: function(u_id){
    console.log(u_id, localStorage.id)
    if(u_id == localStorage.id){
      return true;
    }
    else{
      return false;
    }
  },
}

$(function () {
  $(window).load(function () {
    App.init()
  })
})

function sleep(milliseconds) {
  const date = Date.now()
  let currentDate = null
  do {
    currentDate = Date.now()
  } while (currentDate - date < milliseconds)
}
