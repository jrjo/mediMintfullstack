import { useState, useEffect } from "react";

function DoctorActions({ contract, walletAddress }) {
  const [cid, setCid] = useState("");
  const [hashID, setHashID] = useState("");
  const [sigCount, setSigCount] = useState(0);
  const [required, setRequired] = useState(3);

  useEffect(() => {
    const fetchSignatureCount = async () => {
      if (cid && contract) {
        const hash = await contract.generateHashID(cid);
        setHashID(hash);
        const count = await contract.signatureCount(hash);
        setSigCount(count.toNumber());
      }
    };
    fetchSignatureCount();
  }, [cid, contract]);

  const handleRequestSignature = async (cid) => {
    if (!cid || !contract) {
      alert("Please enter a CID first");
      return;
    }
  
    try {
      console.log("🔐 Requesting signature for CID:", cid);
      const tx = await contract.requestSignature(cid); // Directly use CID dan untuk manggil metamasknya
      console.log("📤 Signature transaction sent:", tx.hash);
      await tx.wait();
      alert("🖋️ Signature request submitted and doctor has signed");
  
      // Re-generate hash and update count after request
      const hash = await contract.generateHashID(cid);
      setHashID(hash);
      const count = await contract.signatureCount(hash);
      setSigCount(count.toNumber());
    } catch (err) {
      console.error("❌ Signature request failed:", err);
      alert("Signature request failed. See console for details.");
    }
  };

  const handleMintNFT = async (cid) => {
    if (!cid || !hashID) {
      alert("CID or HashID missing");
      return;
    }
    console.log("🪙 Minting NFT with CID and HashID:", cid, hashID);
    await contract.mintBundle(cid, hashID);
  };

  return (
    <div>
      <h3>Doctor Actions</h3>
      <input
        type="text"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        placeholder="Enter IPFS CID"
        style={{ marginBottom: "10px", display: "block" }}
      />
      <p>
        ✍️ Signature Progress: <strong>{sigCount}</strong> / {required}
      </p>
      <button
        onClick={() => handleRequestSignature(cid)}
        disabled={!cid}
      >
        🖋️ Request Signature
      </button>
      <button
        onClick={() => handleMintNFT(cid)}
        disabled={!cid || sigCount < required}
        style={{ marginLeft: "10px" }}
      >
        🪙 Mint NFT
      </button>
    </div>
  );
}

export default DoctorActions;
