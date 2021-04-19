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
        uint256 E_id;
        // string profile_path;
        string email;
        // Permissions:- 0: Voter, 1: Candidate, 2: Admin, -1: Invalid
        uint256 permissions;
    }

    struct candidate {
        uint256 C_id;
        uint256 vote_count;
        string C_name;
    }

    struct election {
        uint256 E_id;
        string E_name;
        // time will be stored in milliseconds on blockchain, and JS will handle it accordingly.
        // Campaigning time will start just after time for candidate registration is over and
        // will end 24 hrs prior to polling
        uint256 time_cand_register_end;
        uint256 time_polling_starts;
        uint256 time_polling_ends;
    }

    struct campaign{
        uint256 id;
        string hash;
        // string description;
        uint256 c_id; 
        uint256 E_id;
        string name;
    }

    //Fetch Campaign Data
    mapping(uint256 => campaign) public campaigns;

    // Store Campaign Count
    uint256 public campaign_count = 0;    

    event CampaignCreated(
        uint id,
        string hash,
        // string description,
        uint256 c_id,
        uint256 E_id,
        string name
    );

    // Fetch Users
    mapping(uint256 => user) public users;

    // store elections
    mapping(uint256 => election) public elections;

    // Array of candidate struct to store candidates
    candidate[] public candidates;

    // voted event
    event votedEvent(uint256 indexed _C_id);

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store Candidates Count
    uint256 public user_count = 0;

    // Store Eletions Count
    uint256 public election_count = 0;

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
    }

    // Add users(Voters), but first add Admin
    // Remember user_count is same as id
    function add_user(
        address _add,
        string memory _name,
        uint256 _e_id,
        string memory _email,
        uint256 _permissions
    ) public {
        user_count++;
        users[user_count].id = user_count;
        users[user_count].add = _add;
        users[user_count].name = _name;
        users[user_count].E_id = _e_id;
        users[user_count].email = _email;
        users[user_count].permissions = _permissions;
    }

    uint256 public candidate_count = 0;

    // Add candidates after getting requests from voters and after the registration date has passed
    function add_candidate(uint256 _C_id, string memory _C_name) public {
        // Require that the user is not an Admin
        require(users[_C_id].id != 0, "The User is not an Admin");
        // Require that the user is a voter and also not invalid
        require(users[_C_id].permissions == 0, "The User is a voter initially");

        // Check if we can change the user struct value
        users[_C_id].permissions = 1;
        candidates.push(
            candidate({C_id: _C_id, vote_count: 0, C_name: _C_name})
        );
        candidate_count++;
    }

    function vote(uint256 _C_id) public {
        // Require that the user is not the admin
        require(users[1].add != msg.sender, "The User is not an Admin");
        // Require to check that the voter hasn't voted before
        require(!voters[msg.sender], "The voter hasn't voted before");

        //Election id of candidate and voter are same
        uint256 curElectionId;
        uint256 i = 0;
        for (i = 2; i <= user_count; i++) {
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

    function uploadImage(string memory _imgHash) public{

    // Make sure the image hash exists
    require(bytes(_imgHash).length > 0);
    // Make sure image description exists
    //require(bytes(_description).length > 0);
    // Make sure uploader address exists
    require(msg.sender!=address(0));


    //Increment campaign count
    campaign_count++;
    uint256 i = 0;
    uint256 u_id;
    uint256 e_id;
    string memory name;
    for (i = 2; i <= user_count; i++) {
        if (users[i].add == msg.sender) {
            u_id = users[i].id;
            e_id = users[i].E_id;
            name = users[i].name;
            break;    
        }
    }

    //that user is a candidate in the election
    require(users[u_id].permissions == 1);

    //Add image to contract
    //passing fifth argument 1 as of now, needs to be changed
    campaigns[campaign_count] = campaign(campaign_count,_imgHash, u_id, e_id, name); 

    //Triger the event
    emit CampaignCreated(campaign_count, _imgHash, u_id, e_id, name);

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
        add_candidate(3, "candidate 1");
        add_election("Gykhana", 5000, 6000, 7000);
        add_election("Sec", 5000, 6000, 7000);
    }
}
