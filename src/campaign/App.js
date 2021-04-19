import React, { Component } from 'react';
import Web3 from 'web3';
// import Identicon from 'identicon.js';
// import './App.css';
// import Election from '../abis/Election.json'
// import Navbar from './Navbar'
import Main from './Main'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })


class App extends Component {

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  // Load web3.js 
  // Gets ethereum provider to get a connection with blockchain 
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })//check this 

    const networkId = await web3.eth.net.getId()
    const networkData = Election.networks[networkId]
    if(networkData) {
      const Election = new web3.eth.Contract(Election.abi, networkData.address)

      this.setState({ Election })
      const imagesCount = await Election.methods.imageCount().call()
    //   const postCount = await Election.methods.postCount().call()
      this.setState({ imagesCount })
    //   this.setState({ postCount })
      // Load images
      for (var i = 1; i <= imagesCount; i++) {
        const image = await Election.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }
    //   for (var i = 1; i <= postCount; i++) {
    //     const post = await Election.methods.posts(i).call()
    //     this.setState({
    //       posts: [...this.state.posts, post]
    //     })
    //   }

      // Sort images. Show highest tipped images first
    //   this.setState({
    //     images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
    //   })
    //   this.setState({ loading: false})

      
    } else {
      window.alert('Social Networks contract not deployed to detected network.')
    }
    

  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadImage = description => {
    console.log("Uploading to IPFS...")

    //Adding to IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS : ', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.Election.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }


  constructor(props) {
    super(props)
    this.state = {
      account: '',
      Election: null,
      images: [],
    //   postCount: 0,
    //   posts: [],
      loading: true,
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
                images={this.state.images}
                captureFile={this.captureFile}
                uploadImage={this.uploadImage}
            
            />
        }
      </div>
    );
  }
}

export default App;