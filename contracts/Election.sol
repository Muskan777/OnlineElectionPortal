// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election {
    // Model a base USER
    struct user {
        uint id;
        address add;
        string name;
        // string C_pwd;
        uint E_id;
        // string profile_path;
        string email;
        // Permissions:- 0: Voter, 1: Candidate, 2: Admin
        uint permissions;
    }

struct candidate {
    uint C_id;
    uint vote_count;
}

    // Fetch Candidte
    mapping(uint => user) public users;

    candidate[] public candidates;

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store Candidates Count
    uint public user_count = 0;

    // Add users(Voters), but first add Admin
    function add_user(address _add, string memory _name, uint _e_id, string memory _email, uint _permissions) private {
        user_count++;
        users[user_count].id = user_count; /* = users(user_count, _add, _name, _e_id, _email, _permissions); */
        users[user_count].add = _add;
        users[user_count].name = _name;
        users[user_count].E_id = _e_id;
        users[user_count].email = _email;
        users[user_count].permissions = _permissions;
        
    }
    
    // Add candidates after getting requests from voters and after the registration date has passed
    function add_candidate(uint _C_id) private {
        // Require that the user is not an Admin
        require(
            users[_C_id].id != 0,
            "The User is not an Admin"
        );
        // Require that the user is a voter
        require(
            users[_C_id].permissions == 0, 
            "The User is a voter initially"
        );

        // Check if we can change the user struct value 
        users[_C_id].permissions = 1;
        candidates.push(candidate({
            C_id: _C_id, 
            vote_count: 0
        }));
        
    }

    function vote(uint _C_id) private{
        // Require that the user is not the admin
        require(
            users[0].add != msg.sender,
            "The User is not an Admin"
        );
        // Require to check that the voter hasn't voted before
        require(
            voters[msg.sender], 
            "The voter hasn't voted before"
        );
        uint flag = 0;
        uint i = 0;
        for(; i < candidates.length; i++) {
            if (candidates[i].C_id == _C_id) {
                // candidates[i].vote_count++;
                flag = 1;
                break;
            }
        }
        // Require that the _C_id is present in the candidates list
        require(
            flag, 
            "Candidate not part of candidate list"
        );
        candidates[i].vote_count++;
        voters[msg.sender] = true;

    }

    // Constructor
    constructor() public {
        // Add admin first
        // add_user(0x23423434, "admin", 0, "admin@coep.ac.in", 2);

    }
}