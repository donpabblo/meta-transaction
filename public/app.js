"use strict";

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

let web3Modal;
let provider;
let signer;
let selectedAccount;

function init() {
  if (location.protocol !== 'https:') {
    const alert = document.querySelector("#alert-error-https");
    alert.style.display = "block";
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    return;
  }

  const providerOptions = {};

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}



async function fetchAccountData() {
  document.querySelector("#loader").style.display = "block";

  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  var chainName = "";
  if (chainId == 31337) {
    chainName = "localhost";
  } else {
    const chainData = evmChains.getChain(chainId);
    chainName = chainData.name;
  }

  document.querySelector("#network-name").textContent = chainName;
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  document.querySelector("#selected-account").textContent = selectedAccount;

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", 'api/env', true);
  xmlHttp.responseType = 'json';
  xmlHttp.onload = function () {
    var status = xmlHttp.status;
    if (status === 200) {
      const environment = xmlHttp.response;
      if (chainId != environment.network_id) {
        document.querySelector("#network-name").textContent = "Please switch to '" + environment.network + "' network";
        alert("Please switch to '" + environment.network + "' network");
      }
      document.querySelector("#prepare").style.display = "none";
      document.querySelector("#connected").style.display = "block";
    } else {
      console.error('ERROR', xmlHttp.response);
    }
    document.querySelector("#loader").style.display = "none";
  }
  xmlHttp.send();
}

async function refreshAccountData() {
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#connect-msg").style.display = "none";
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}


async function onConnect() {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
}

async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if (provider.close) {
    await provider.close();
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;
  signer = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}

async function getOwner() {
  document.querySelector("#owner").style.display = "none";
  document.querySelector("#loader").style.display = "block";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", 'api/owner', true);
  xmlHttp.responseType = 'json';
  xmlHttp.onload = function () {
    var status = xmlHttp.status;
    if (status === 200) {
      document.querySelector("#owner").style.display = "block";
      document.querySelector("#address-owner").textContent = xmlHttp.response.address;
      document.querySelector("#color-flag").textContent = xmlHttp.response.color;
    } else {
      console.error('ERROR', xmlHttp.response);
    }
    document.querySelector("#loader").style.display = "none";
  }
  xmlHttp.send();
}

async function sendMetaTx() {
  let color = document.querySelector("#color").value;
  if (color) {
    document.querySelector("#loader").style.display = "block";
    document.querySelector("#metatx").style.display = "none";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", 'api/metatx/' + selectedAccount + '/' + color, true);//TODO
    xmlHttp.responseType = 'json';
    xmlHttp.onload = function () {
      var status = xmlHttp.status;
      if (status === 200) {
        var metatx = xmlHttp.response.metatx;
        var callback = xmlHttp.response.callback;
        var params = [selectedAccount, JSON.stringify(metatx)];
        var method = 'eth_signTypedData_v4';
        provider.sendAsync(
          {
            method,
            params,
            selectedAccount,
          },
          function (err, result) {
            if (err) {
              document.querySelector("#loader").style.display = "none";
              return console.dir(err);
            }
            if (result.error) {
              alert(result.error.message);
              document.querySelector("#loader").style.display = "none";
            }
            if (result.error) return console.error('ERROR', result);
            console.log('TYPED SIGNED:' + JSON.stringify(result.result));

            var xhr = new XMLHttpRequest();
            xhr.open("POST", callback, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
              metatx: metatx,
              signature: result.result
            }));
            xhr.onload = function () {
              if (xhr.readyState == 4)
                if (xhr.status == 200) {
                  var json_data = JSON.parse(xhr.response);
                  document.querySelector("#metatx").style.display = "block";
                  document.querySelector("#fee").textContent = json_data.fee + ' GWEI';
                  document.querySelector("#paymaster").textContent = json_data.paymaster;
                }
              document.querySelector("#loader").style.display = "none";
            };
          }
        );
      } else {
        console.error('ERROR', xmlHttp.response);
        document.querySelector("#loader").style.display = "none";
      }
    };
    xmlHttp.send();
  } else {
    alert('Missing color')
  }
}

window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  document.querySelector("#btn-metatx").addEventListener("click", sendMetaTx);
  document.querySelector("#btn-owner").addEventListener("click", getOwner);
});