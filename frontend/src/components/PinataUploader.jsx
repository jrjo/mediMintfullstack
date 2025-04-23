import { useState } from "react";
import { PinataSDK } from 'pinata'

const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: import.meta.env.VITE_GATEWAY_URL
})
function PinataUploader() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [link, setLink] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus("Getting upload URL...");
      const urlResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`, {
        method: "GET",
        headers: {
          // Add auth headers if needed
        },
      });

      const data = await urlResponse.json();
      setUploadStatus("Uploading file...");

      const upload = await pinata.upload.public.file(file).url(data.url)
      
      if(upload.cid){
        setUploadStatus('File uploaded successfully!')
        const ipfsLink = await pinata.gateways.public.convert(upload.cid)
        setLink(ipfsLink)
      }else{
        setUploadStatus('Upload failed!')
      }
    }catch (error){
      setUploadStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }


      /* const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(data.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const ipfsCID = data.cid; // Assuming server returns this
      const gatewayLink = await pinata.gateways.public.convert(ipfsCID);

      setUploadStatus("✅ File uploaded successfully!");
      setLink(gatewayLink);
    } catch (error) {
      console.error(error);
      setUploadStatus(`❌ Error: ${error.message}`);
    } */
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: 8, marginTop: 20 }}>
      <h3>📤 Upload File to IPFS</h3>
      <input type="file" onChange={handleFileChange} />
      <br />
      <button style={{ marginTop: 10 }} onClick={handleUpload} disabled={!file}>
        Upload to Pinata
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
      {link && (
        <p>
          🔗 <a href={link} target="_blank" rel="noopener noreferrer">View File on IPFS</a>
        </p>
      )}
    </div>
  );
}

export default PinataUploader;
