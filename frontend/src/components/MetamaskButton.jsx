import { useState, useEffect } from "react";

function MetamaskButton({ onWalletConnected }) {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          onWalletConnected(accounts[0]);
        } else {
          setWalletAddress(null);
          onWalletConnected(null);
        }
      });
    }
  }, []);

  async function checkIfWalletIsConnected() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        onWalletConnected(accounts[0]);
      }
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      onWalletConnected(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }

  return (
    <div>
      {walletAddress ? (
        <>
          <button onClick={connectWallet}>🔁 Switch Account</button>
        </>
      ) : (
        <button onClick={connectWallet}>🦊 Connect MetaMask</button>
      )}
    </div>
  );
}

export default MetamaskButton;
