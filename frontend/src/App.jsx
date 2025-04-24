import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./components/contract";
import MetamaskButton from "./components/MetamaskButton";
import DoctorActions from "./components/DoctorActions";
import SignerActions from "./components/SignerActions";
import Unauthorized from "./components/Unauthorized";
//import BundlePreview from "./components/BundlePreview";
import PinataUploader from "./components/PinataUploader";
import FolderUploader from "./components/FolderUploader";
import GetSepoliaBalance from "./components/GetSepoliaBalance";
import.meta.env.VITE_GATEWAY_URL
import.meta.env.VITE_SERVER_URL
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    if (walletAddress) {
      initializeContract();
    }
  }, [walletAddress]);

  async function initializeContract() {
    if (typeof window.ethereum === "undefined") {
      console.error("MetaMask is not installed.");
      alert("Please install MetaMask to use this app.");
      return;
    }
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
  
      const doctor = await contractInstance.doctor();
      const patient = await contractInstance.patient();
      const hospital = await contractInstance.hospital();
  
      const addr = walletAddress.toLowerCase();
      if (addr === doctor.toLowerCase()) setRole("Doctor");
      else if (addr === patient.toLowerCase()) setRole("Patient");
      else if (addr === hospital.toLowerCase()) setRole("Hospital");
      else setRole("Unknown");
  
      console.log("Role detected:", role);
    } catch (error) {
      console.error("Contract init error:", error);
    }
  }
  

  return (
    <div>
      <h1>🩺 Welcome to MediMint</h1>
      <MetamaskButton onWalletConnected={setWalletAddress} />
  
      {walletAddress && (
        <div>
          <p>🟢 Connected Wallet: {walletAddress}</p>
          <p>🧑‍⚕️ Role: <strong>{role || "Detecting..."}</strong></p>
          
          {role === "Doctor" && (
            <>
              <DoctorActions contract={contract} />
              
              <PinataUploader />
              <FolderUploader />
              <GetSepoliaBalance />
              {/* <BundlePreview contract={contract} tokenId={1} />  */}
              {/* test with tokenId 1 */}
            </>
          )}
          {role === "Patient" && (
            <>
              <SignerActions contract={contract} />
      
              <GetSepoliaBalance />
              {/* <BundlePreview contract={contract} tokenId={1} />  */}
              {/* test with tokenId 1 */}
            </>
          )}
          {role === "Hospital" && (
            <>
              <SignerActions contract={contract} />
        
              <GetSepoliaBalance />
              {/* <BundlePreview contract={contract} tokenId={1} />  */}
              {/* test with tokenId 1 */}
            </>
          )}
          {/* {(role === "Patient" || role === "Hospital") && <SignerActions contract={contract} />} */}
          {role === "Unknown" && <Unauthorized />}
        </div>
      )}
    </div>
  );
}

export default App;
