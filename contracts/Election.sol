// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Election {
    // Model a base USER
    struct user {
        // Admin has the UserId 1
        uint256 id;
        address add;
        string name;
        // string C_pwd;
        // string profile_path;
        string email;
        // Permissions:- 0: Voter, 1: Candidate, 2: Admin
        int256 permissions;
        uint256 cand_index;
        string pwd;
    }

    struct candidate {
        uint256 C_id;
        uint256 vote_count;
        string C_name;
        uint256 E_id;
        // C_info: Achievements, clubs etc.
        string C_info;
        bool deleted;
    }

    struct election {
        uint256 E_id;
        string E_name;
        // time will be stored in seconds on blockchain, and JS will handle it accordingly.
        // Campaigning time will start just after time for candidate registration is over and
        // will end 24 hrs prior to polling
        uint256 time_cand_register_end;
        uint256 time_polling_starts;
        uint256 time_polling_ends;
        bool deleted;
    }

    struct report {
        uint256 reportId;
        uint256 E_id;
        uint256 reported_user;
        string reason;
    }

    struct voter {
        uint256 id;
        uint256 E_id;
        bool voted;
        bool reportedByUser;
        bool blacklisted_by_admin;
        bool deleted;
    }

    struct campaign {
        uint256 id;
        string description;
        // string description;
        uint256 c_id;
        uint256 E_id;
        string name;
        // bool deleted;
    }

    event trigger_event();

    // event CampaignCreated(
    //     uint256 id,
    //     string hash,
    //     // string description,
    //     uint256 c_id,
    //     uint256 E_id,
    //     string name
    // );

    //Fetch Campaign Data
    mapping(uint256 => campaign) public campaigns;

    // Store Campaign Count
    uint256 public campaign_count = 0;

    // Fetch Users
    mapping(uint256 => user) public users;

    //addresses mapping with ids
    mapping(address => uint256) public addresses;

    // store elections
    mapping(uint256 => election) public elections;

    mapping(uint256 => voter) public voterlist;

    mapping(uint256 => report) public reports;

    // Array of candidate struct to store candidates
    candidate[] public candidates;

    // voted event
    // event votedEvent(uint256 indexed _C_id);

    // Store Candidates Count
    uint256 public user_count = 0;
    uint256 public voter_list_count = 0;

    // Store Eletions Count
    uint256 public election_count = 0;
    uint256 public report_count = 0;

    // Add elections
    // Remember election_count is same as E_id for a particular election.
    function add_election(
        string memory _E_name,
        uint256 _time_cand_register_end,
        uint256 _time_polling_starts,
        uint256 _time_polling_ends
    ) public {
        // Check in JS that the time entered are accordingly after the current time.
        // i.e current_time < cand_time < poll_start < poll_end;
        election_count++;
        elections[election_count].E_id = election_count;
        elections[election_count].E_name = _E_name;
        elections[election_count]
            .time_cand_register_end = _time_cand_register_end;
        elections[election_count].time_polling_starts = _time_polling_starts;
        elections[election_count].time_polling_ends = _time_polling_ends;

        // Call the event
        emit trigger_event();
    }

    // Edit elections
    // Remember election_count is same as E_id for a particular election.
    function edit_election(
        uint256 _E_id,
        string memory _E_name,
        uint256 _time_cand_register_end,
        uint256 _time_polling_starts,
        uint256 _time_polling_ends
    ) public {
        // elections[election_count].E_id = election_count;
        elections[_E_id].E_name = _E_name;
        elections[_E_id].time_cand_register_end = _time_cand_register_end;
        elections[_E_id].time_polling_starts = _time_polling_starts;
        elections[_E_id].time_polling_ends = _time_polling_ends;

        // Call the event
        emit trigger_event();
    }

    function report_by_user(
        uint256 _reportedUser,
        uint256 _E_id,
        string memory _reason
    ) public {
        uint256 i;
        for (i = 1; i <= voter_list_count; i++) {
            if (
                voterlist[i].id == _reportedUser && voterlist[i].E_id == _E_id
            ) {
                require(
                    !voterlist[i].reportedByUser,
                    "User is already reported"
                );
                require(
                    !voterlist[i].reportedByUser,
                    "User wasn't reported earlier"
                );
                voterlist[i].reportedByUser = true;
            }
        }
        report_count++;
        reports[report_count].reportId = report_count;
        reports[report_count].E_id = _E_id;
        reports[report_count].reported_user = _reportedUser;
        reports[report_count].reason = _reason;

        // Call the event
        emit trigger_event();
    }

    function blacklist_by_admin(uint256 _id, uint256 _E_id) public {
        uint256 i;
        for (i = 1; i <= voter_list_count; i++) {
            if (voterlist[i].id == _id && voterlist[i].E_id == _E_id) {
                voterlist[i].blacklisted_by_admin = true;
            }
        }
        // Call the event
        emit trigger_event();
    }

    // Add users(Voters), but first add Admin
    // Remember user_count is same as id
    function add_user(
        address _add,
        string memory _name,
        string memory _email,
        string memory _pwd,
        int256 _permissions
    ) public {
        user_count++;
        users[user_count].id = user_count;
        users[user_count].add = _add;
        users[user_count].name = _name;
        users[user_count].email = _email;
        users[user_count].cand_index = 5000;
        users[user_count].permissions = _permissions;
        addresses[_add] = user_count;
        users[user_count].pwd = _pwd;

        // Call the event
        emit trigger_event();
    }

    uint256 public candidate_count = 0;
    uint256 i = 0;
    uint256 j = 0;

    // user has applied for the candidature in a particular election
    function add_candidate(
        uint256 _C_id,
        string memory _C_name,
        uint256 _E_id,
        string memory _C_info
    ) public {
        // Require that the user is not an Admin
        require(users[_C_id].id != 1, "The User is not an Admin");

        require(
            users[_C_id].cand_index == 5000,
            "Require the candidate was not an approved candidate previously"
        );

        uint256 cflag = 0;
        //Require that user was voter for that particular election as well
        for (i = 1; i <= voter_list_count; i++) {
            if ((voterlist[i].id == _C_id) && (voterlist[i].E_id == _E_id)) {
                cflag = 1;
                break;
            }
        }
        require(
            cflag == 1,
            "require that user is voter in same election initially"
        );

        cflag = 0;
        for (i = 1; i <= voter_list_count; i++) {
            if (
                (voterlist[i].id == _C_id) &&
                (voterlist[i].E_id == _E_id) &&
                (voterlist[i].blacklisted_by_admin != true)
            ) {
                cflag = 1;
                break;
            }
        }

        require(cflag == 1, "require that user not reported for this election");

        cflag = 0;
        //check if the candidate has not applied previously for this election;
        for (i = 0; i < candidate_count; i++) {
            if (candidates[i].C_id == _C_id && candidates[i].E_id == _E_id) {
                cflag = 1;
            }
        }

        require(
            cflag == 0,
            "Candidate should not have applied previously for this election"
        );

        // Check if we can change the user struct value
        candidates.push(
            candidate({
                C_id: _C_id,
                vote_count: 0,
                C_name: _C_name,
                E_id: _E_id,
                C_info: _C_info,
                deleted: false
            })
        );
        candidate_count++;

        // Call the event
        emit trigger_event();
    }

    //approves candidature after candidate applies for the election
    function candidate_approved_by_admin(uint256 _C_id) public {
        require(
            users[_C_id].permissions == 0,
            "Require the candidate was not an approved candidate previously"
        );
        users[_C_id].permissions = 1;
        uint256 i = 0;
        for (; i < candidate_count; i++) {
            if (candidates[i].C_id == _C_id) {
                users[_C_id].cand_index = i;
                break;
            }
        }

        // Call the event
        emit trigger_event();
    }

    function add_voter_by_admin(uint256 _E_id, uint256 _id) public {
        voter_list_count++;
        voterlist[voter_list_count].E_id = _E_id;
        voterlist[voter_list_count].id = _id;
        voterlist[voter_list_count].voted = false;
        voterlist[voter_list_count].reportedByUser = false;
        voterlist[voter_list_count].blacklisted_by_admin = false;

        // Call the event
        emit trigger_event();
    }

    // JS will always call delete, and delete depending on the
    // type of delete
    // type 0: Eletion, 1: Voter, 2: Candidate
    // For Delete eletion, id will be 0
    function admin_delete(
        uint256 _id,
        uint256 _E_id,
        uint256 _type
    ) public {
        uint256 i;

        require(_E_id > 0, "Eletion IDs are always positive");
        require(
            _E_id <= election_count,
            "Eletion IDs are always less than or equal to election_count"
        );

        // Delete Election
        if (_type == 0) {
            elections[_E_id].deleted = true;
        }
        // Delete Voter
        else if (_type == 1) {
            require(_id > 1, "User ID should be greater than 1(admin)");
            require(
                _id <= user_count,
                "User ID should be less than or equal to user_count"
            );

            for (i = 1; i <= voter_list_count; i++) {
                if (voterlist[i].E_id == _E_id && voterlist[i].id == _id) {
                    voterlist[i].deleted = true;
                }
            }
        }
        // Delete Candidate
        else if (_type == 2) {
            require(_id > 1, "User ID should be greater than 1(admin)");
            require(
                _id <= user_count,
                "User ID should be less than or equal to user_count"
            );

            uint256 _cand_index = users[_id].cand_index;
            require(
                _cand_index < 5000,
                "The user should be an already registerd candidate"
            );
            candidates[_cand_index].deleted = true;
        }

        // Call the event
        emit trigger_event();
    }

    // function delete_voter_by_admin(uint256 _voter_index)  public{
    //     voterlist[_voter_index].deleted = true;

    //     // Call the event
    //     emit trigger_event()
    // }

    function vote(
        uint256 _C_id,
        uint256 _E_id,
        uint256 _id
    ) public {
        // Require that the user is not the admin
        require(users[1].add != msg.sender, "The User is not an Admin");

        // Require that the _C_id is present in the candidates list
        require(
            users[_C_id].permissions == 1,
            "Candidate is a part of candidate list"
        );

        //Election id of candidate and voter are same
        // Require to check that the voter hasn't voted before
        for (i = 1; i <= voter_list_count; i++) {
            if (voterlist[i].id == _id && voterlist[i].E_id == _E_id) {
                require(!voterlist[i].voted, "The voter hasn't voted before");
                voterlist[i].voted = true;
                break;
            }
        }

        for (j = 0; j < candidate_count; j++) {
            if (candidates[j].C_id == _C_id) {
                candidates[j].vote_count++;
            }
        }

        // trigger voted event
        // emit votedEvent(_C_id);

        // Call the event
        emit trigger_event();
    }

    function uploadCampaign(string memory _desc, uint256 _E_id) public {
        // Make sure the image hash exists
        require(bytes(_desc).length > 0);
        // Make sure image description exists
        //require(bytes(_description).length > 0);
        // Make sure uploader address exists
        require(msg.sender != address(0));

        //Increment campaign count
        campaign_count++;
        uint256 i = 0;
        uint256 u_id;
        uint256 e_id;
        string memory name;
        uint256 cnd_index;
        for (i = 2; i <= user_count; i++) {
            if (users[i].add == msg.sender) {
                u_id = users[i].id;
                name = users[i].name;
                cnd_index = users[i].cand_index;
                break;
            }
        }

        //that user is a candidate in the election
        e_id = candidates[cnd_index].E_id;
        require(e_id == _E_id);

        //Add image to contract
        //passing fifth argument 1 as of now, needs to be changed
        campaigns[campaign_count] = campaign(
            campaign_count,
            _desc,
            u_id,
            e_id,
            name
        );

        // Call the event
        emit trigger_event();
    }

    // Constructor
    constructor() public {
        // Add admin first

        //Rhugaved
        // add_user(
        //     0x22e9140a50BdB2659b9E473dAa645685C4f409E5,
        //     "admin",
        //     "admin@coep.ac.in",
        //     "123",
        //     2
        // );
        // add_user(
        //     0x1BFf1D5FF4234912Efc5fE4FE6Fe8038366A30E1,
        //     "voter 1",
        //     "voter1@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0xCD56ad160221d01ea132F05D4057665A97C6934D,
        //     "voter 2",
        //     "voter2@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x2D89b40E5C820Ee508577ac851DF5e1Bb095C037,
        //     "cand 1",
        //     "cand1@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x6f7B8dF18264EeF57c112a94ce06cc2fa705ab71,
        //     "cand 2",
        //     "cand2@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x33fF69744215B3E8b8389D70C2A358BFB3fA16ae,
        //     "Reported",
        //     "reported@gmail.com",
        //     "123",
        //     0
        // );

        //himansh
        add_user(
            0xCBAD3fB515C349Bfee52b12AfCc75B90Ce93d61F,
            "admin",
            "admin@coep.ac.in",
            "123",
            2
        );
        // add_user(
        //     0x347498952f9a102aAf611d66b4A9eb1c822AcF5A,
        //     "voter 1",
        //     "voter1@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x108dd6Db4E153BcE120bf8EF9E1473f32dea9248,
        //     "voter 2",
        //     "voter2@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x43e25608d87fE3faA8686Ac89A4Fe98d57A4b3cb,
        //     "cand 1",
        //     "cand1@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x2c2E70D6c73B51D84B0eD7BF52994A6C74Fe74aB,
        //     "cand 2",
        //     "cand2@gmail.com",
        //     "123",
        //     0
        // );

        //muskan
        // add_user(
        //     0x7D8d4E73350E695e351E80705B8B6F30bAcF00CC,
        //     "admin",
        //     "admin@coep.ac.in",
        //     "123",
        //     2
        // );
        // add_user(
        //     0x2aeE3162bB87A4Ed18eE0abB27f6d2CE3F5A6720,
        //     "voter 1",
        //     "voter1@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x145d98eBca32EC5C25e49D76D95cEc2E4cA2852E,
        //     "voter 2",
        //     "voter2@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x7F5542Cd4C3f34ad08747273E42CB8855eDD23d4,
        //     "cand 1",
        //     "cand1@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x339531797eBa4492570C40Cc40dfee612dd9540F,
        //     "cand 2",
        //     "cand2@gmail.com",
        //     "123",
        //     0
        // );
        // add_user(
        //     0x12a79A0f247F3912e45A8B3EdAec0fdD46C5C660,
        //     "Reported",
        //     "reported@gmail.com",
        //     "123",
        //     0
        // );
        // add_voter_by_admin(1, 2);
        // add_voter_by_admin(1, 3);
        // add_voter_by_admin(2, 3);
        // add_election("Gykhana", 5000, 1618926000, 1618940000);
        // add_election("Sec", 5000, 6000, 7000);
        // add_candidate(3, "candidate 1", 1);
        // add_candidate(2, "voter 1", 1);
        // candidate_approved_by_admin(2);
        // candidate_approved_by_admin(3);
        // report_by_user(2, 1, "Fake");
    }
}
