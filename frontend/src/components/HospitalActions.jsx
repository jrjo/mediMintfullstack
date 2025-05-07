import { useState, useEffect } from "react";

function HospitalActions({ contract }) {
  const [hashID, setHashID] = useState("");
  const [status, setStatus] = useState("");
  const [sigCount, setSigCount] = useState(0);
  const [required, setRequired] = useState(3);
  const [copied, setCopied] = useState(false);

  const [newDoctor, setNewDoctor] = useState(localStorage.getItem('newDoctorAddress') || "");
  const [changeDoctorHashID, setChangeDoctorHashID] = useState(localStorage.getItem('doctorChangeHashID') || "");

  const [newHospital, setNewHospital] = useState(localStorage.getItem('newHospitalAddress') || "");
  const [changeHospitalHashID, setChangeHospitalHashID] = useState(localStorage.getItem('hospitalChangeHashID') || "");

  const [hospitalSigCount, setHospitalSigCount] = useState(0);
  const [accountInfo, setAccountInfo] = useState({ doctor: '', patient: '', hospital: '' });

  useEffect(() => {
    const fetchSignatureProgress = async () => {
      if (changeDoctorHashID && contract) {
        try {
          const count = await contract.signatureWeights(changeDoctorHashID);
          setSigCount(count.toNumber());
        } catch (err) {
          console.error("Error fetching signature progress:", err);
          setSigCount(0);
        }
      }
    };
    fetchSignatureProgress();
  }, [changeDoctorHashID, contract]);

  useEffect(() => {
    const fetchHospitalSigProgress = async () => {
      if (changeHospitalHashID && contract) {
        try {
          const count = await contract.signatureWeights(changeHospitalHashID);
          setHospitalSigCount(count.toNumber());
        } catch (err) {
          console.error("Error fetching hospital signature progress:", err);
          setHospitalSigCount(0);
        }
      }
    };
    fetchHospitalSigProgress();
  }, [changeHospitalHashID, contract]);

  const handleFetchRoles = async () => {
    if (!contract) return;
    try {
      const doctor = await contract.doctor();
      const patient = await contract.patient();
      const hospital = await contract.hospital();
      setAccountInfo({ doctor, patient, hospital });
      setStatus("✅ Fetched role addresses from contract");
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setStatus("❌ Failed to fetch role addresses");
    }
  };

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

  const handleRequestDoctorChange = async () => {
    if (!newDoctor) {
      alert("Enter new doctor address");
      return;
    }

    try {
      setStatus("⏳ Requesting doctor change...");
      const tx = await contract.requestRoleChange("changeDoctor", newDoctor);
      const receipt = await tx.wait();

      let hash = null;
      for (const event of receipt.events) {
        if (event.event === "SignRequestCreated") {
          hash = event.args.hashID;
          break;
        }
      }

      if (!hash) {
        console.error("Failed to extract hashID from event");
        return;
      }

      setChangeDoctorHashID(hash);
      localStorage.setItem('doctorChangeHashID', hash);
      localStorage.setItem('newDoctorAddress', newDoctor);
      setStatus("📨 Change doctor request submitted!");
    } catch (err) {
      console.error("Request failed:", err);
      setStatus("❌ Failed to request doctor change");
    }
  };

  const handleApplyDoctorChange = async () => {
    if (!changeDoctorHashID || !newDoctor) {
      alert("Missing hashID or new doctor address");
      return;
    }
    try {
      setStatus("⚙️ Applying doctor change...");
      const tx = await contract.applyDoctorChange(changeDoctorHashID, newDoctor);
      await tx.wait();
      setStatus("✅ Doctor change applied successfully!");
    } catch (err) {
      console.error("Apply doctor change failed:", err);
      setStatus("❌ Failed to apply doctor change");
    }
  };

  const handleRequestHospitalChange = async () => {
    if (!newHospital) {
      alert("Enter new hospital address");
      return;
    }

    try {
      setStatus("⏳ Requesting hospital change...");
      const tx = await contract.requestRoleChange("changeHospital", newHospital);
      const receipt = await tx.wait();

      let hash = null;
      for (const event of receipt.events) {
        if (event.event === "SignRequestCreated") {
          hash = event.args.hashID;
          break;
        }
      }

      if (!hash) {
        console.error("Failed to extract hashID from event");
        return;
      }

      setChangeHospitalHashID(hash);
      localStorage.setItem('hospitalChangeHashID', hash);
      localStorage.setItem('newHospitalAddress', newHospital);
      setStatus("📨 Change hospital request submitted!");
    } catch (err) {
      console.error("Request failed:", err);
      setStatus("❌ Failed to request hospital change");
    }
  };

  const handleApplyHospitalChange = async () => {
    if (!changeHospitalHashID || !newHospital) {
      alert("Missing hashID or new hospital address");
      return;
    }
    try {
      setStatus("⚙️ Applying hospital change...");
      const tx = await contract.applyHospitalChange(changeHospitalHashID, newHospital);
      await tx.wait();
      setStatus("✅ Hospital change applied successfully!");
    } catch (err) {
      console.error("Apply hospital change failed:", err);
      setStatus("❌ Failed to apply hospital change");
    }
  };

  const handleCopyChangeDoctorHashID = async () => {
    if (changeDoctorHashID) {
      await navigator.clipboard.writeText(changeDoctorHashID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleCopyChangeHospitalHashID = async () => {
    if (changeHospitalHashID) {
      await navigator.clipboard.writeText(changeHospitalHashID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClearDoctorChange = () => {
    setNewDoctor("");
    setChangeDoctorHashID("");
    setSigCount(0);
    localStorage.removeItem('doctorChangeHashID');
    localStorage.removeItem('newDoctorAddress');
    setStatus("🧹 Cleared doctor change request");
  };

  const handleClearHospitalChange = () => {
    setNewHospital("");
    setChangeHospitalHashID("");
    setHospitalSigCount(0);
    localStorage.removeItem('hospitalChangeHashID');
    localStorage.removeItem('newHospitalAddress');
    setStatus("🧹 Cleared hospital change request");
  };

  return (
    <div>
      <h3>Hospital Actions</h3>

      <button onClick={handleFetchRoles}>📋 View Current Role Addresses</button>
      {accountInfo.doctor && (
        <div style={{ marginTop: "10px" }}>
          <p><strong>🧑‍⚕️ Doctor:</strong> {accountInfo.doctor}</p>
          <p><strong>🏥 Hospital:</strong> {accountInfo.hospital}</p>
          <p><strong>👤 Patient:</strong> {accountInfo.patient}</p>
        </div>
      )}

      <input
        type="text"
        value={hashID}
        onChange={(e) => setHashID(e.target.value)}
        placeholder="Enter HashID"
        style={{ marginBottom: "10px", display: "block" }}
      />
      <button onClick={handleSignRequest} disabled={!hashID}>
        ✍️ Sign Request
      </button>

      <hr />

      <h4>Change Doctor</h4>
      <input
        type="text"
        value={newDoctor}
        onChange={(e) => {
          setNewDoctor(e.target.value);
          localStorage.setItem('newDoctorAddress', e.target.value);
        }}
        placeholder="Enter new doctor address"
        style={{ marginBottom: "10px", display: "block" }}
      />
      <button onClick={handleRequestDoctorChange} disabled={!newDoctor}>
        🔁 Request Doctor Change
      </button>
      <button onClick={handleApplyDoctorChange} disabled={!changeDoctorHashID || !newDoctor || sigCount < required} style={{ marginLeft: "10px" }}>
        ✅ Apply Doctor Change
      </button>
      <button onClick={handleClearDoctorChange} style={{ marginLeft: "10px" }}>
        🧹 Clear
      </button>

      {changeDoctorHashID && (
        <div style={{ marginTop: "10px" }}>
          <strong>ChangeDoctor HashID:</strong> <span style={{ wordBreak: "break-all" }}>{changeDoctorHashID}</span>
          <button onClick={handleCopyChangeDoctorHashID} style={{ marginLeft: "10px" }}>
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
      )}

      {changeDoctorHashID && (
        <p>
          ✍️ Signature Progress: <strong>{sigCount}</strong> / {required}
        </p>
      )}

      <hr />

      <h4>Change Hospital</h4>
      <input
        type="text"
        value={newHospital}
        onChange={(e) => {
          setNewHospital(e.target.value);
          localStorage.setItem('newHospitalAddress', e.target.value);
        }}
        placeholder="Enter new hospital address"
        style={{ marginBottom: "10px", display: "block" }}
      />
      <button onClick={handleRequestHospitalChange} disabled={!newHospital}>
        🔁 Request Hospital Change
      </button>
      <button onClick={handleApplyHospitalChange} disabled={!changeHospitalHashID || !newHospital || hospitalSigCount < required} style={{ marginLeft: "10px" }}>
        ✅ Apply Hospital Change
      </button>
      <button onClick={handleClearHospitalChange} style={{ marginLeft: "10px" }}>
        🧹 Clear
      </button>

      {changeHospitalHashID && (
        <div style={{ marginTop: "10px" }}>
          <strong>ChangeHospital HashID:</strong> <span style={{ wordBreak: "break-all" }}>{changeHospitalHashID}</span>
          <button onClick={handleCopyChangeHospitalHashID} style={{ marginLeft: "10px" }}>
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>
      )}

      {changeHospitalHashID && (
        <p>
          ✍️ Signature Progress: <strong>{hospitalSigCount}</strong> / {required}
        </p>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}

export default HospitalActions;
