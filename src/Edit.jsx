import React, { useEffect, useState, require, keys, context, process } from "react";
import { ethers } from "ethers";
import abi from './utils/EtherLinks.json';
import './App.css';
import imgList from './images';
import jsonList from './links';
import logo from '../img/etherlinks.png';

const siteTitle = document.title;
const defaultProvider = ethers.getDefaultProvider('rinkeby');
const apiKey = 12; //process.env.ALCHEMY_API;
try {
  const alchemyProvider = new ethers.providers.AlchemyProvider('rinkeby', apiKey);
  console.log('- alchemy provider success');
  console.log(alchemyProvider);
} catch {
  const alchemyProvider = false;
  console.log('- error getting alchemy provider');
}

// if (alchemyProvider) {
//   console.log('- alchemy provider success');
//   console.log(alchemyProvider);
// }

// wish there was a way to test this locally . . . needing to deploy each time sucks

// At least the contract seems to work!
// CONTRACT IS LIVE: https://rinkeby.etherscan.io/address/0x92D8Ce5d7acEB460a8c494Ed42F35697649f445D
//           LATEST: https://rinkeby.etherscan.io/address/0x3E5E7CEeFf64F97756226cb5E42520b92Fdc2915

const App = () => {
  /****************/
  /* ETHEREUM APP */
  /****************/
  
  // ETH SETUP
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x3E5E7CEeFf64F97756226cb5E42520b92Fdc2915";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("Ethereum object exists");
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)

      } else {
        console.log("No authorized account found")
        setSiteTitle("no connected wallets");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("This app requires MetaMask to be installed and enabled");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 

      setSiteTitle(accounts[0]);
      
    } catch (error) {
      console.log(error)
    }
  }

  // Get fallback providers if no MetaMask or Alchemy connection
  function getProvider() {
    let p = defaultProvider;
    if (ethereum) {
      console.log('Ethereum object exists, using that');
      const provider = new ethers.providers.Web3Provider(ethereum);
      p = provider;
    } else if (alchemyProvider) {
      console.log('Ethereum object does not exist, using Alchemy provider')
      p = alchemyProvider;
    } else {
      console.log('Wallet and Alchemy providers do not exist, using default provider. Bandwidth is limited.')
    }
    return p;
  }
  
  const getData = async () => {
    let addr = '0x9c108F399662736C3F0A78DB655CFbC4dAD15BF2';

    let prov = await getProvider();
    
    const etherLinksContract = new ethers.Contract(contractAddress, abi.abi, prov);
    console.log('got contract');
    
    const profile = await etherLinksContract.getProfile(addr);
    console.log('got profile: ', profile);
    
    const links = await etherLinksContract.getLinks(addr);
    console.log('got links: ', links);

    return profile, links;
  }

  var profile, links = getData();
  
  setUserData(profile, links);

  const prepareUserArgs = async () => {
    let userArgs = getArgs();
    let addy = '555-0x251EaC00018f407723F663B418879FE22eE20E72';
    
    if (userArgs.endsWith('.eth')) {
      console.log(userArgs);
      addy = await defaultProvider.resolveName(userArgs);
      document.getElementById('walletText').innerHTML = addy;
      console.log(addy);
    } else if (userArgs.startsWith('0x') && userArgs.length() == 40) {
      addy = userArgs;
      document.getElementById('walletText').innerHTML = addy;
    } else {
      console.log('ERROR: Invalid input')
    }
    
    console.log('User supplied arguments resolve to:  %s', addy);
    return addy;
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    prepareUserArgs();
  }, [])

  
  /***************/
  /* GENERAL APP */
  /***************/
  
  // Query the URL for arguments, we will use these to determine target wallet
  function getArgs() {
    const queryString = window.location.search;
    let query = queryString.substring(1);
    
    return query;
  }
  
  function setSiteTitle(t) {
    document.title = siteTitle + ' - ' + t;
  }
  
  let linkList = [];

 
  for (var l in jsonList) {
    let link = jsonList[l];

    // Parse link for domain information to select icons
    const url = new URL(link.link);
    const urlHost = url.hostname.replace('www.','');
    let domain = urlHost.toUpperCase();
    let domainArray = domain.split('.');
    let domainType = domainArray.slice(-1)[0];
    let domainName = domainArray.slice(-2)[0];

    let img = imgList['WEBSITE'];
    if (domainName in imgList) {
      img = imgList[domainName];
    }

    // Prepare a new link object
    let newLink = {
      url: link.link,
      // type: link.type,
      // path: link.path,
      name: link.text,
      image: img,
      show: link.show
    };
    linkList.push(newLink);
  }

  function setUserData(p, i) {
    console.log(p);
  }
  
  return (
    <main>
      <div className="dataContainer">
        <div className="innerContainer">
          <div className="contentContainer">
            <img className="bigLogo" id="userLogo" src={logo} />
            <h2 id="userHeader">vert.eth</h2>
            <h4 id="walletText"></h4>
            <p id="userParagraph">I'm a passionate artist and developer building in the crypto and web3 space. Get connected below!</p>
            {!currentAccount && (
              <button className="waveButton" onClick={connectWallet}>
                Connect wallet
              </button>
            )} 
          </div>

          <div className="linkList">
            {linkList.map((a, i) => {
              if (a.show) {
                return (
                  <a className={"majorLink " + a.type} href={a.url} key={i + "_link"}  target="_blank" rel="noopener noreferrer">
                    <div className="linkContainer" key={i + "container"}>
                      <img className="linkIcons" src={a.image} id={a.name} />
                      {a.name}
                    </div>
                  </a>
                );
              }
            })}
            
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;

/*

NOTES
I think the next step is to take and resolve ENS? Should be relatively easy
After that I really need to start working on the contract etc

*/
