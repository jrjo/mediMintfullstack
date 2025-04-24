import { useState } from "react";
import JSZip from "jszip";

function FolderUploader() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploadStatus("⏳ Zipping files...");
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.webkitRelativePath || file.name, file);
    });

    const blob = await zip.generateAsync({ type: "blob" });

    const formData = new FormData();
    formData.append("file", blob, "dicom-dataset.zip");

    setUploadStatus("📤 Uploading ZIP to backend...");

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/upload_zip`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      setUploadStatus(`✅ Uploaded! CID: ${result.cid}`);
    } else {
      setUploadStatus(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div>
      <input
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFileChange}
      />
      <button onClick={handleUpload}>Upload Folder to IPFS</button>
      <p>{uploadStatus}</p>
    </div>
  );
}

export default FolderUploader;
