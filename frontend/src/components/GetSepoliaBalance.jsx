import React, { useState } from "react";
import { ethers } from "ethers";

function GetSepoliaBalance() {
  const [balanceInfo, setBalanceInfo] = useState({ address: "", eth: "" });

  const getMyEthBalance = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not available");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const balance = await provider.getBalance(address);
      const ethBalance = ethers.utils.formatEther(balance);

      setBalanceInfo({
        address,
        eth: ethBalance,
      });
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-xl w-full max-w-md mx-auto text-center">
      <h3 className="text-lg font-bold mb-4">Check Sepolia ETH Balance</h3>
      <button
        onClick={getMyEthBalance}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
      >
        Get ETH Balance
      </button>

      {balanceInfo.address && (
        <div className="mt-4 text-left">
          <p><strong>Address:</strong> {balanceInfo.address}</p>
          <p><strong>ETH:</strong> {balanceInfo.eth} Sepolia ETH</p>
        </div>
      )}
    </div>
  );
}

export default GetSepoliaBalance;
