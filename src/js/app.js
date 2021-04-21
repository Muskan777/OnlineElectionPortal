const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  iscandidate: false,

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
      ){
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
    } else if(
      window.location.href == "http://localhost:3000/campaign.html" ){
        //add front-end for campaign 
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
          window.loca
          for(var i = 1; i < campaign_count; i++){
            return electionInstance.campaigns(i).then(function (campaign) {
              var e_id = campaign[3]
              //require(e_id == curr_e_id)
              var hash = campaign[1]
              var Cand_id = campaign[2]
              var Cand_name = campaign[4]

              var update_campaign = 
                "<h2>" + Cand_id + " " + Cand_name + "</h2><br><br><img src={`https://ipfs.infura.io/ipfs/" + hash + "`} style={{ maxWidth: '420px'}}/>"

              display_campaign.append(update_campaign)                  
            })
          }
          return electionInstance.voters(App.account)
        })
        .then( function (iscandidate) {
          if(iscandidate == false){
            $('form').hide()
          }
          loader.hide()
          content.show()
        })
        .catch(function (error) {
          console.warn(error)
        })
      } else if(
        window.location.href == "http://localhost:3000/login.html" ){
          //add front-end for campaign 
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
            else{
              alert("No account connected, Connect your blockchain account first!");
              return;
            }
          })

          loader.hide()
          content.show()
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
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      Election: null,
      images: [],
      loading: true,
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.captureFile = this.captureFile.bind(this)
  },
  
  captureFile: function(event) {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  },

  uploadImage: function()  {
    console.log("Uploading to IPFS...")

    //Adding to IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS : ', result)
      if(error) {
        console.error(error)
        return
      }
      
      this.setState({ loading: true })
      this.state.Election.methods.uploadImage(result[0].hash).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
    return App.render()
  },

  login: function(){
    var loader = $('#loader')
    var content = $('#content')
          
    loader.show()
    content.hide()

    var U_id = $('#u_id').val()
    var pwd = $('#pwd').val()
    App.contracts.Election.deployed()
      .then(function (instance){
        return instance.authenticate(U_id, pwd)
      })
      .then(function (result){
        if (result == 2){
          window.location.href = "http://localhost:3000/admin_home.html";
        }
        else if((result == 0) || (result == 1)){
          window.location.href = "http://localhost:3000/voter_home.html";
        }
        else{
          alert("invalid Login Credentials!!\n Please try Again.");
        }
      })
      .catch(function (err) {
        console.error(err)
      })
      loader.hide()
      content.show()
  },

  register: function(){
    var loader = $('#loader')
    var content = $('#content')
          
    loader.show()
    content.hide()

    var name = $('#name').val()
    var mail = $('#mail').val()
    var pwd = $('#pwd').val()
    App.contracts.Election.deployed()
      .then(function (instance){
        return instance.register(name, mail, pwd, { from: App.account })
      })
      .then(function (result){
        alert("Congratulations! You are now registered to our Portal\n Your UserID is " + result +".\n Please use this UserID to login.");
      })
      .catch(function (err) {
        console.error(err)
      })
      loader.hide()
      content.show()
  }

}

$(function () {
  $(window).load(function () {
    App.init()
  })
})
