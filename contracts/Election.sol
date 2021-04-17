// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election {
    // Model a base USER
    struct user {
        uint256 id;
        address add;
        string name;
        // string C_pwd;
        uint256 E_id;
        // string profile_path;
        string email;
        // Permissions:- 0: Voter, 1: Candidate, 2: Admin
        uint256 permissions;
    }

    struct candidate {
        uint256 C_id;
        uint256 vote_count;
    }

    // Fetch Candidte
    mapping(uint256 => user) public users;

    candidate[] public candidates;

    // voted event
    event votedEvent(uint256 indexed _C_id);

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store Candidates Count
    uint256 public user_count = 0;

    // Add users(Voters), but first add Admin
    function add_user(
        address _add,
        string memory _name,
        uint256 _e_id,
        string memory _email,
        uint256 _permissions
    ) public {
        user_count++;
        users[user_count].id = user_count; /* = users(user_count, _add, _name, _e_id, _email, _permissions); */
        users[user_count].add = _add;
        users[user_count].name = _name;
        users[user_count].E_id = _e_id;
        users[user_count].email = _email;
        users[user_count].permissions = _permissions;
    }

    // Add candidates after getting requests from voters and after the registration date has passed
    function add_candidate(uint256 _C_id) public {
        // Require that the user is not an Admin
        require(users[_C_id].id != 0, "The User is not an Admin");
        // Require that the user is a voter
        require(users[_C_id].permissions == 0, "The User is a voter initially");

        // Check if we can change the user struct value
        users[_C_id].permissions = 1;
        candidates.push(candidate({C_id: _C_id, vote_count: 0}));
    }

    function vote(uint256 _C_id) public {
        // Require that the user is not the admin
        require(users[0].add != msg.sender, "The User is not an Admin");
        // Require to check that the voter hasn't voted before
        require(!voters[msg.sender], "The voter hasn't voted before");

        //Election id of candidate and voter are same
        uint256 curElectionId;
        uint256 i = 0;
        for (i = 2; i < user_count; i++) {
            if (users[i].add == msg.sender) {
                curElectionId = users[i].E_id;
                break;
            }
        }
        require(users[_C_id].E_id == curElectionId);

        uint256 flag = 0;
        i = 0;
        for (; i < candidates.length; i++) {
            if (candidates[i].C_id == _C_id) {
                // candidates[i].vote_count++;
                flag = 1;
                break;
            }
        }
        // Require that the _C_id is present in the candidates list
        require(flag == 1, "Candidate not part of candidate list");
        candidates[i].vote_count++;
        voters[msg.sender] = true;

        // trigger voted event
        emit votedEvent(_C_id);
    }

    // Constructor
    constructor() public {
        // Add admin first
        add_user(
            0x7D8d4E73350E695e351E80705B8B6F30bAcF00CC,
            "admin",
            0,
            "admin@coep.ac.in",
            2
        );
        add_user(
            0x42263Ea939bd28d268499f1191F2F4CAA5294553,
            "voter 1",
            1,
            "voter1@gmail.com",
            0
        );
        add_user(
            0xD85974B619F77067D9959ac4a92f9644f76C5899,
            "candidate 1",
            1,
            "voter2@gmail.com",
            0
        );
        add_candidate(3);
    }
}
