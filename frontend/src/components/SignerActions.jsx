import { useState } from "react";

function SignerActions({ contract }) {
  const [hashID, setHashID] = useState("");
  const [status, setStatus] = useState("");

  const handleSignRequest = async () => {
    if (!hashID) {
      alert("Please enter a hash ID");
      return;
    }

    try {
      setStatus("⏳ Signing request...");
      const tx = await contract.signRequest(hashID);
      await tx.wait();
      setStatus("✅ Signature submitted successfully!");
    } catch (error) {
      console.error("Signing failed:", error);
      setStatus("❌ Failed to sign request.");
    }
  };

  return (
    <div>
      <h3>Signer Actions (Patient or Hospital)</h3>
      <input
        type="text"
        value={hashID}
        onChange={(e) => setHashID(e.target.value)}
        placeholder="Enter HashID from Doctor"
        style={{ marginBottom: "10px", display: "block" }}
      />
      <button onClick={handleSignRequest} disabled={!hashID}>
        ✍️ Sign Request
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default SignerActions;
