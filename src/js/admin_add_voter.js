else if (
      window.location.href === 'http://localhost:3000/admin_add_voter.html'
    ) {
        // Get Election ID from the previous page
        var E_id = 1;
        var electionInstance;
        console.log(E_id);
        setTimeout(function () {
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance
          return electionInstance.user_count()
        })
        .then(function (user_count) {
        //   user_count = 3;
          console.log(user_count.toNumber());

          var add_voter = $('#add_voter')
          add_voter.empty()
          window.loca
          for (var i = 2; i <= user_count.toNumber(); i++) {
            electionInstance.users(i).then(function (user) {
              var id = user[0].toNumber();
              var name = user[2];
              var flag = 0;
              voter_list_count = electionInstance.voter_list_count().toNumber();
              console.log(voter_list_count);

              for(var j = 1; j <= voter_list_count; j++) {
                  electionInstance.voterlist(j).then(function (voter) {
                      if (id == voter[0].toNumber() && E_id == voter[1].toNumber()) {
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
          var voter_list_count = electionInstance.voter_list_count().toNumber();
        var display_old_voters = $('#already_registered_voters');
        display_old_voters.empty()
        for(var j = 1; j <= voter_list_count; j++) {
            electionInstance.voterlist(j).then(function (voter) {
                if (E_id == voter[1].toNumber()) {
                    var id = voter[0].toNumber();
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
    }, 40)
    }


    // Call to the below function will be made when the admin adds a new voter 
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
  