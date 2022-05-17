import React, { useState, useEffect } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import Web3 from "web3";

import "./App.css";

const App = () => {
  const [inputs, setInputs] = useState({ itemName: "", cost: 0 });
  const [loading, setLoading] = useState(false);
  const [itemManagerCon, setItemManagerCon] = useState({});
  const [userAccounts, setUserAccounts] = useState([]);
  // const [ ]
  let currentAccount;
  const { ethereum } = window;

  if (!ethereum) {
    alert("Please install metamask.");
  }

  const handleInputChange = (event) => {
    event.preventDefault();
    const target = event.target;
    const value = target.value;
    const name = target.name;
    setInputs((prevState) => ({ ...prevState, [name]: value }));

    console.log(inputs);
  };

  const loadApp = async () => {
    await ethereum.enable();
    let web3 = new Web3(Web3.givenProvider || "http://localhost:3000");
    let provider = ethereum;
    if (typeof provider !== "undefined") {
      provider
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          currentAccount = accounts[0];
          console.log(`selected account is ${currentAccount}`);
        })
        .catch((err) => {
          console.log(err);
        });
      window.ethereum.on("accountsChanged", function (accounts) {
        currentAccount = accounts[0];
        console.log(`Selected account changed to ${currentAccount}`);
      });
    }

    const accounts = await web3.eth.getAccounts();
    setUserAccounts(accounts);
    const networkId = await web3.eth.net.getId();

    const itemManager = new web3.eth.Contract(
      ItemManagerContract.abi,
      ItemManagerContract.networks[networkId] &&
        ItemManagerContract.networks[networkId].address
    );
    setItemManagerCon(itemManager);

    const item = new web3.eth.Contract(
      ItemContract.abi,
      ItemContract.networks[networkId] &&
        ItemContract.networks[networkId].address
    );
    // listenToPaymentEvent();
  };

  useEffect(() => {
    setLoading(true);
    loadApp();
    setLoading(false);
  }, []);

  const handleSubmit = async () => {
    const { itemName, cost } = inputs;
    let result = await itemManagerCon.methods
      .createItem(itemName, cost)
      .send({ from: userAccounts[0] });
    console.log(result);
  };

  // const listenToPaymentEvent = () => {
  //   itemManagerCon.events.SupplyChainStep().on("data", async (evt)=> {
  //     if (evt.returnValues._step == 1) {
  //       let item = await itemManagerCon.methods
  //         .items(evt.returnValues._itemIndex)
  //         .call();
  //       console.log(item);
  //       alert("Item " + item._identifier + " was paid, deliver it now!");
  //     }
  //     console.log(evt);
  //   });
  // };

  return (
    <div className="App">
      <h1>Supply Chain</h1>
      <h2>Items</h2>
      <h2>Add Items</h2>
      cost in wei :{" "}
      <input
        type="text"
        name="cost"
        value={inputs.cost}
        onChange={handleInputChange}
      />
      Items identifier :{" "}
      <input
        type="text"
        name="itemName"
        value={inputs.itemName}
        onChange={handleInputChange}
      />
      {!loading ? (
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      ) : null}
    </div>
  );
};

export default App;
