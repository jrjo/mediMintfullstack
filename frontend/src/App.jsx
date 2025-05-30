import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./components/contract";
import MetamaskButton from "./components/MetamaskButton";
import DoctorActions from "./components/DoctorActions";
import SignerActions from "./components/SignerActions";
import PatientActions from "./components/PatientActions";
import HospitalActions from "./components/HospitalActions";
import Unauthorized from "./components/Unauthorized";
//import BundlePreview from "./components/BundlePreview";
import PinataUploader from "./components/PinataUploader";
import FolderUploader from "./components/FolderUploader";
import GetSepoliaBalance from "./components/GetSepoliaBalance";

import.meta.env.VITE_GATEWAY_URL;
import.meta.env.VITE_SERVER_URL;
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
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      const doctor = await contractInstance.doctor();
      const patient = await contractInstance.patient();
      const hospital = await contractInstance.hospital();
      const caller = await signer.getAddress();

      const addr = walletAddress.toLowerCase();

      console.log("🔍 Connected wallet address:", addr);
      console.log("🏥 Contract's hospital:", hospital.toLowerCase());
      console.log("🧑‍⚕️ Contract's doctor:", doctor.toLowerCase());
      console.log("👤 Contract's patient:", patient.toLowerCase());

      if (addr === doctor.toLowerCase()) {
        setRole("Doctor");
        console.log("✅ Role detected: Doctor");
      } else if (addr === patient.toLowerCase()) {
        setRole("Patient");
        console.log("✅ Role detected: Patient");
      } else if (addr === hospital.toLowerCase()) {
        setRole("Hospital");
        console.log("✅ Role detected: Hospital");
      } else {
        setRole("Unknown");
        console.log("⚠️ Role detected: Unknown");
      }
    } catch (error) {
      console.error("Contract init error:", error);
    }
  }

  const getRoleIcon = (role) => {
    console.log("🔍 Role detected:", role);
    switch (role) {
      case "Doctor":
        return "🧑‍⚕️";
      case "Hospital":
        return "🏥";
      case "Patient":
        return "🧍";
      default:
        return "🔍";
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center gap-5 min-h-screen w-screen">
      {/* Top-right balance component */}
      <div className="absolute top-4 right-4">
        {role === "Doctor" || role === "Hospital" || role === "Patient" ? (
          <GetSepoliaBalance walletAddress={walletAddress} />
          ) : (
            <div>
            </div>
          )}
      </div>


      <div className="flex flex-col gap-5 p-2">
        <h1 className="text-6xl bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
          🩺 Welcome to MediMint
        </h1>
        <p className="text-3xl text-center">
           Designed to manage bundled Medical Images
        </p>
        <MetamaskButton onWalletConnected={setWalletAddress} />
      </div>

      {walletAddress && (
        <div className="flex flex-col gap-5 p-2 w-full items-center justify-center">
          <div className="flex flex-col justify-start items-start text-start text-xl gap-5">
            <p>🟢 Connected Wallet: {walletAddress}</p>
            <p className="text-xl">
              {getRoleIcon(role)} Role:{" "}
              <strong>{role || "Detecting..."}</strong>
            </p>
          </div>

          {role === "Doctor" && (
            <div className="flex flex-col gap-2 w-full">
              <DoctorActions contract={contract} />
            </div>
          )}
          {role === "Patient" && (
            <div className="flex flex-col gap-2">
              <PatientActions contract={contract} />
            </div>
          )}
          {role === "Hospital" && (
            <div className="flex flex-col gap-2">
              <HospitalActions contract={contract} />
            </div>
          )}
          {role === "Unknown" && <Unauthorized />}
        </div>
      )}
    </div>
  );
}

export default App;
