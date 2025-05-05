import { useState } from "react";

function MetadataUpdater({ contract }) {
  const [tokenId, setTokenId] = useState("");
  const [newCID, setNewCID] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateMetadata = async () => {
    if (!tokenId || !newCID) {
      alert("Token ID and new CID are required");
      return;
    }

    try {
      setStatus("⏳ Updating metadata...");
      setLoading(true);
      const tx = await contract.updateTokenMetadata(tokenId, newCID);
      await tx.wait();
      setStatus(`✅ Metadata for Token ID ${tokenId} updated!`);
    } catch (err) {
      console.error("Metadata update failed:", err);
      setStatus("❌ Failed to update metadata");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>🛠️ Update Metadata</h3>

      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        style={{ marginBottom: "10px", display: "block" }}
      />

      <input
        type="text"
        placeholder="New IPFS CID"
        value={newCID}
        onChange={(e) => setNewCID(e.target.value)}
        style={{ marginBottom: "10px", display: "block" }}
      />

      <button onClick={handleUpdateMetadata} disabled={loading || !tokenId || !newCID}>
        ♻️ Update Metadata
      </button>

      {status && <p>{loading ? "🔄 " : ""}{status}</p>}
    </div>
  );
}

export default MetadataUpdater;
