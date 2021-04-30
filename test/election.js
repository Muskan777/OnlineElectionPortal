var Election = artifacts.require('./Election.sol')

contract('Election', function (accounts) {
  var electionInstance

  it('initializes with admin and one voter and one candidate', function () {
    return Election.deployed()
      .then(function (instance) {
        return instance.user_count()
      })
      .then(function (count) {
        assert.equal(3, count)
      })
  })

  it('initializes admins, candidates and voters with correct values', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        return electionInstance.users(1)
      })
      .then(function (admin) {
        assert.equal(admin[2], 'admin', 'contains the correct name')
        assert.equal(admin[3], 0, 'contains the correct election id')
        assert.equal(
          admin[4],
          'admin@coep.ac.in',
          'contains the correct email id',
        )
        return electionInstance.users(2)
      })
      .then(function (voter) {
        assert.equal(voter[2], 'voter 1', 'contains the correct name')
        assert.equal(voter[3], 1, 'contains the correct election id')
        assert.equal(
          voter[4],
          'voter1@gmail.com',
          'contains the correct email id',
        )
        return electionInstance.users(3)
      })
      .then(function (voter) {
        assert.equal(voter[2], 'candidate 1', 'contains the correct name')
        assert.equal(voter[3], 1, 'contains the correct election id')
        assert.equal(
          voter[4],
          'voter2@gmail.com',
          'contains the correct email id',
        )
        return electionInstance.candidates(0)
      })
      .then(function (candidate) {
        assert.equal(candidate[0], 3, 'contains the correct id')
        assert.equal(candidate[1], 0, 'contains the correct vote count')
      })
  })

  it('allows a voter to cast a vote', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        candidateId = 3
        return electionInstance.vote(candidateId, { from: accounts[9] })
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, 'an event was triggered')
        assert.equal(
          receipt.logs[0].event,
          'votedEvent',
          'the event type is correct',
        )
        assert.equal(
          receipt.logs[0].args._C_id.toNumber(),
          candidateId,
          'the candidate id is correct',
        )
        return electionInstance.voters(accounts[9])
      })
      .then(function (voted) {
        assert(voted, 'the voter was marked as voted')
        return electionInstance.candidates(0)
      })
      .then(function (candidate) {
        var voteCount = candidate[1]
        assert.equal(voteCount, 1, "increments the candidate's vote count")
      })
  })

  it('throws an exception for invalid candiates', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance
        return electionInstance.vote(99, { from: accounts[9] })
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf('revert') >= 0,
          'error message must contain revert',
        )
        return electionInstance.candidates(0)
      })
      .then(function (candidate1) {
        var voteCount = candidate1[1]
        assert.equal(voteCount, 1, 'candidate 1 did not receive any votes')
      })
  })
})
