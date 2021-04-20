else if (
      window.location.href === 'http://localhost:3000/admin_add_voter.html'
    ) {
        // Get Election ID from the previous page
        E_id = ;
        
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.user_count()
        })
        .then(function (user_count) {
          var add_voter = $('#add_voter')
          add_voter.empty()
          window.loca
          for (var i = 2; i <= user_count; i++) {
            electionInstance.users(i).then(function (user) {
              var id = user[0];
              var name = user[2];
              var flag = 0;
              for(var j = 1; j <= electionInstance.voter_list_count; j++) {
                  electionInstance.voterlist(j).then(function (voter) {
                      if (id == voter[0] && E_id == voter[1]) {
                          flag = 1;
                          break;
                      }
                  })
              }
              if (!flag) {
                    var add_voter_template =
                    "<option value='" + id + "' >" + id + ": " + name + '</ option>';
                    add_voter.append(add_voter_template)
                      }
            })
          }
        })

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
    }


    // Call to the below function will be made when the admin creates a new election 
    // by submitting the form
    create_election_event : function() {
        
        // Get the Election ID from the previous page somehow
        var E_id = ;

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
    }