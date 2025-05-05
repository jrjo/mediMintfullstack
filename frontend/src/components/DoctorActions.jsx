import { useState, useEffect } from "react";
import MetadataUpdater from "./MetadataUpdater";

function DoctorActions({ contract, walletAddress }) {
  const [cid, setCid] = useState(localStorage.getItem('lastCID') || "");
  const [hashID, setHashID] = useState(localStorage.getItem('lastHashID') || "");
  const [sigCount, setSigCount] = useState(0);
  const [required, setRequired] = useState(3);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSignatureCount = async () => {
      if (cid && contract) {
        try {
          const hash = await contract.generateBundleID(cid);
          setHashID(hash);
          const count = await contract.signatureWeights(hash);
          setSigCount(count.toNumber());

          // Save updated CID and hashID to localStorage
          localStorage.setItem('lastCID', cid);
          localStorage.setItem('lastHashID', hash);
        } catch (err) {
          console.error("Failed to fetch hash/signatures:", err);
          setHashID("");
          setSigCount(0);
        }
      } else {
        setHashID("");
        setSigCount(0);
      }
    };
    fetchSignatureCount();
  }, [cid, contract]);

  const handleRequestSignature = async (cid) => {
    if (!cid) {
      alert("Please enter a CID first");
      return;
    }
    console.log("🔐 Requesting signature for CID:", cid);
    try {
      setStatus("⏳ Signing request...");
      setLoading(true);
      const tx = await contract.requestSignature(cid);
      await tx.wait();
      setStatus("🖋️ Signature request submitted!");
      setLoading(false);

      // 🔁 Manually refresh hashID and sigCount
      const hash = await contract.generateBundleID(cid);
      setHashID(hash);
      const count = await contract.signatureWeights(hash);
      setSigCount(count.toNumber());

      // Save again after request
      localStorage.setItem('lastCID', cid);
      localStorage.setItem('lastHashID', hash);
    } catch (err) {
      console.error("Signature request failed:", err);
      setStatus("❌ Request failed");
      setLoading(false);
    }
  };

  const handleMintNFT = async (cid) => {
    if (!cid || !hashID) {
      alert("CID or HashID missing");
      return;
    }
    console.log("🪙 Minting NFT with CID and HashID:", cid, hashID);
    try {
      setStatus("⏳ Minting NFT...");
      setLoading(true);
      const tx = await contract.mintBundle(cid, hashID);
      const receipt = await tx.wait();
      
      let mintedTokenId = null;
      if (receipt && receipt.events) {
        for (const event of receipt.events) {
          if (event.event === "ImageBundleUploaded") {   // <--- Change to your correct event name
            mintedTokenId = event.args.tokenId.toString();
            break;
          }
        }
      }
    
      if (!mintedTokenId) {
        console.warn("⚠️ TokenId not found in events. Check your contract event.");
        mintedTokenId = "Unknown";
      }
      // ✅ After mint, show info
      setStatus(`✅ NFT minted!
        \nContract Address: ${contract.address}
        \nToken ID: ${mintedTokenId}
        \n🔗 [View on Etherscan](https://etherscan.io/tx/${tx.hash})
        \n🖼️ [View Image on IPFS](https://gateway.pinata.cloud/ipfs/${cid})
      `);


      // ✅ After mint, clear localStorage
      localStorage.removeItem('lastCID');
      localStorage.removeItem('lastHashID');
      setCid("");
      setHashID("");
      setSigCount(0);
    } catch (err) {
      console.error("Minting failed:", err);
      setStatus("❌ Minting failed");
    }
    setLoading(false);
  };

  const handleCopyHashID = async () => {
    if (hashID) {
      await navigator.clipboard.writeText(hashID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClearCID = () => {
    localStorage.removeItem('lastCID');
    localStorage.removeItem('lastHashID');
    setCid("");
    setHashID("");
    setSigCount(0);
    setStatus("🧹 Cleared CID and HashID");
  };

  return (
    <div>
      <h3>Doctor Actions</h3>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="text"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="Enter IPFS CID"
          style={{ flex: 1, marginRight: "10px" }}
        />
      </div>
      <button
        onClick={handleClearCID}
        disabled={loading}
        style={{ marginLeft: "10px", backgroundColor: "#f8d7da", color: "#721c24", padding: "4px 8px", border: "1px solid #f5c6cb", borderRadius: "4px" }}
      >
        🧹 Clear CID
      </button>

      {hashID && (
        <div style={{ marginBottom: "10px" }}>
          <strong>HashID:</strong> <span style={{ wordBreak: "break-all" }}>{hashID}</span>
          <button 
            onClick={handleCopyHashID} 
            style={{ marginLeft: "10px", padding: "4px 8px" }}
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
      )}

      <p>
        ✍️ Signature Progress: <strong>{sigCount}</strong> / {required}
      </p>

      {status && (
        <p>
          {loading && <span style={{ marginRight: "5px" }}>🔄</span>}
          {status}
        </p>
      )}

      <button
        onClick={() => handleRequestSignature(cid)}
        disabled={!cid || loading}
      >
        🖋️ Request Signature
      </button>

      <button
        onClick={() => handleMintNFT(cid)}
        disabled={!cid || sigCount < required || loading}
        style={{ marginLeft: "10px" }}
      >
        🪙 Mint NFT
      </button>
      <hr />

      <h4>🔄 Update Metadata</h4>
      <MetadataUpdater contract={contract} />
    </div>
    
  );
}

export default DoctorActions;
