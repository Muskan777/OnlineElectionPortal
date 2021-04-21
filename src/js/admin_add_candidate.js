else if (
      window.location.toString().includes('http://localhost:3000/admin_add_voter.html')
    ) {
        // Get Election ID from the previous page
        var E_id = parseInt(window.location.hash.substr(-1));
        var electionInstance;
        var already_registered_voters = [];
        console.log("E_id : " + E_id);
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
                    already_registered_voters.push(voter[0].toNumber());
                }
            })
          }              
              electionInstance.user_count().then(function (user_count) {
              for(var j = 2; j <= user_count.toNumber(); j++) {
                  electionInstance.users(j).then(function (user) {
                        var id = user[0].toNumber();
                        var name = user[2];

                      if (!already_registered_voters.includes(id)) {
                        console.log("Not a registered voter for this E_id: " + id);
                        var add_voter_template =
                        "<option value='" + id + "' >" + id + ": " + name + '</ option>';
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
        var display_old_voters = $('#already_registered_voters');
        display_old_voters.empty()
        for(var j = 1; j <= voter_list_count; j++) {
            electionInstance.voterlist(j).then(function (voter) {
                if (E_id == voter[1].toNumber()) {
                    var id = voter[0].toNumber();
                    electionInstance.users(id).then(function (user) {
                        console.log("Already Regsitered for this E_id: " + id);
                        var name = user[2];
                        var display_old_voters_template =
                        "<li> id: " + id + ", Name: " + name + "</li>";
                        display_old_voters.append(display_old_voters_template);
                    })
                }
            }
            )
        } 
        })
    }, 40)
    } 







else if (
    window.location.toString().includes('http://localhost:3000/admin_add_candidate.html')
    ) {
        // Get Election ID from the previous page
        var E_id = parseInt(window.location.hash.substr(-1));
        var electionInstance;
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.candidate_count()
        })
        .then(function (candidate_count) {
          var add_candidate = $('#add_candidate')
          add_candidate.empty()
          window.loca
          for (var i = 2; i <= candidate_count; i++) {
            electionInstance.candidates[i].then(function (candidate) {
              var C_id = candidate[0];
              var name = candidate[2];
              var cand_E_id = candidate[3];
            //   var flag = 0;
              electionInstance.user_count().then(function (user_count){

              })
                electionInstance.users(C_id).then(function (user) {
                    // Check that the user permissions are for voter only and 
                    // he's not already a candidate or blacklisted or an admin
                    if (user[4].toNumber() == 0 && E_id == cand_E_id) {
                        var add_candidate_template =
                        "<option value='" + C_id + "' >" + C_id + ": " + name + '</ option>';
                        add_candidate.append(add_candidate_template)
                    }
                })
            })
          }
        })

        App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.candidate_count()
        })
        .then(function (candidate_count) {
        var display_old_candidates = $('#already_registered_candidates');
        for(var j = 1; j <= candidate_count; j++) {
            electionInstance.candidates[i].then(function (candidate) {
                if (E_id == candidate[1]) {
                    var C_id = candidate[0];
                    electionInstance.users(id).then(function (user) {
                        var id = user[0];
                        var name = user[2];
                        // Check the permissions in the user struct if they are 1
                        if (user[4].toNumber() == 1){
                            var display_old_candidates_template =
                            "<li>" + id + ": " + name + "</li>";
                            display_old_candidates.append(display_old_candidates_template);
                        }
                        
                    })
                    
                    
                }
            }
            )
        } 
    }


    // Call to the below function will be made when the admin creates a new election 
    // by submitting the form
    admin_add_candidate_event : function() {

        // Get the id of the user to be registered as a candidate for the E_id
        var C_id = $("#add_candidate").val();
        
        console.log(C_id);

        App.contracts.Election.deployed().then(function (instance) {
            // Change the user permission of the uesr with C_id to 1 to show that he's 
            // an approved candidate
            instance.candidate_approved_by_admin(
                C_id
            )
        }
        )
    }