import { useEffect, useState } from "react";

function BundlePreview({ contract, tokenId }) {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!contract) return;
    loadBundleData();
  }, [contract]);

  const loadBundleData = async () => {
    try {
      // utk ERC721
      // const access = await contract.checkAccess(tokenId);
      // if (!access) {
      //   setError("❌ You are not authorized to view this bundle.");
      //   return;
      // }

      const rawURI = await contract.uri(tokenId); // for ERC-1155
      console.log("🔗 Token URI:", rawURI);

      const gateway = import.meta.env.VITE_GATEWAY_URL;

      let finalURI = rawURI;
      if (rawURI.startsWith("ipfs://")) {
        const cid = rawURI.replace("ipfs://", "");
        finalURI = `${gateway}/ipfs/${cid}`;
      } else if (rawURI.includes("pinata.cloud/ipfs/")) {
        const cid = rawURI.split("/ipfs/")[1];
        finalURI = `${gateway}/ipfs/${cid}`;
      }

      console.log("🌐 Fetching from:", finalURI);

      const res = await fetch(finalURI);

      if (!res.ok) {
        throw new Error("❌ Metadata not found at " + finalURI);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("⚠️ Not JSON:", text);
        throw new Error("Returned content is not JSON");
      }

      const data = await res.json();
      console.log("📦 Loaded Metadata:", data);
      setMetadata(data);
    } catch (err) {
      console.error("🧯 Bundle load error:", err);
      setError(err.message);
    }
  };

  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;
  if (!metadata) return <p>⏳ Loading metadata for Token #{tokenId}...</p>;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem" }}>
      <h3>🧾 Bundle Metadata Preview</h3>
      {metadata.image && <img src={metadata.image} alt="Preview" style={{ maxWidth: "200px" }} />}
      <p><strong>Name:</strong> {metadata.name}</p>
      <p><strong>Description:</strong> {metadata.description}</p>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
}

export default BundlePreview;
