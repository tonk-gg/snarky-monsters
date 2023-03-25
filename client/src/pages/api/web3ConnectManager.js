import  { ethers, Contract } from "ethers"

import SnarkyMonstersGame from "./SnarkyMonstersGame.json"
const isProd = process.env.NODE_ENV === "production"
const PROD_ENDPOINT = ""
const LOCAL_ENDPOINT = "http://localhost:8545"

const LOCAL_CHAIN_ID = 1337n
const SCROLL_ALPHANET_CHAIN_ID = 534353n

const CHAIN_ID = isProd ? SCROLL_ALPHANET_CHAIN_ID : LOCAL_CHAIN_ID

const PROD_CONTRACT_ADDRESS = ''
const LOCAL_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

const requestSwitchNetwork = async (provider) => {        
    try {
        if (isProd) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: ethers.toQuantity(SCROLL_ALPHANET_CHAIN_ID), 
                        chainName:'Scroll Alpha Testnet',
                        rpcUrls:['https://alpha-rpc.scroll.io/l2'],                   
                        blockExplorerUrls:['https://blockscout.scroll.io'],  
                        nativeCurrency: { 
                        symbol:'ETH',   
                        decimals: 18
                        }     
                    }
                ]
            });
        } else {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: ethers.toQuantity(LOCAL_CHAIN_ID), 
                        chainName:'Localhost',
                        rpcUrls:['http://localhost:8545'],                   
                        nativeCurrency: { 
                        symbol:'ETH',   
                        decimals: 18
                        }     
                    }
                ]
            });
        }
      } catch (err) {
         console.log(err);
    }
}

class Web3ConnectManager {
    static instance = null
    constructor() {
        this.provider = null;
        this.account = null;
        this.signer = null;
        this.contract = null;
    }

    static getInstance() {
        if (!Web3ConnectManager.instance) {
            Web3ConnectManager.instance = new Web3ConnectManager()
        }
        return Web3ConnectManager.instance
    }

    async connectWallet() {
        if (window.ethereum == null) {
            throw new Error("MetaMask is not installed")
        } else {
            this.provider = new ethers.BrowserProvider(window.ethereum)
            // request the user's account
            const network = await this.provider.getNetwork()
            console.log(network.chainId);
            if (network.chainId !== CHAIN_ID) {
                await requestSwitchNetwork(this.provider)
            }
            const accounts = await this.provider.listAccounts()

            this.account = accounts[0]

            this.signer = await this.provider.getSigner()

            // log the account address
            // console.log('Connected to account:', this.account);

            this.contract =  new Contract(LOCAL_CONTRACT_ADDRESS, SnarkyMonstersGame.abi, this.provider)
        }
    }

    async sendConfirmation(gameId, gameHash) {
        try {
            const transaction = await this.contract.submitGame(gameId, gameHash)
            const tx = await transaction.wait()
        } catch (e) {
            console.error(error);
        }
    }

    async getTopScores() {
        try {
            return await this.contract.getTopScores()
        } catch (e) {
            console.error(e)
        }
    }

    async checkGameSubmitted(gameId) {
        try {
            return await this.contract.checkGameSubmitted(gameId)
        } catch (e) {
            console.error(e)
        }
    }

    async checkGameVerified(gameId) {
        try {
            return await this.contract.checkGameVerified(gameId)
        } catch (e) {
            console.error(e)
        }
    }
}

export default Web3ConnectManager