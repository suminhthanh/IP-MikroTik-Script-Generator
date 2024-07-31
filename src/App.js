import React, { useState } from "react";

function App() {
  const [url, setUrl] = useState(
    "https://cdn-lite.ip2location.com/datasets/VN.json?_=1722422038192"
  );
  const [ipListName, setIpListName] = useState("IPVietNam");
  const [mikrotikScript, setMikrotikScript] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch(url);
      const data = await response.json();

      let script = "/ip firewall address-list\n";
      data.data.forEach((item) => {
        const startIp = item[0];
        const numAddresses = parseInt(item[2].replace(/,/g, ""), 10);
        const prefixLen = 32 - (numAddresses - 1).toString(2).length;
        const cidrNotation = `${startIp}/${prefixLen}`;
        script += `add list=${ipListName}="${cidrNotation}"\n`;
      });

      setMikrotikScript(script);
    } catch (err) {
      setError("Error fetching or processing data. Please check the URL.");
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(mikrotikScript)
      .then(() => {
        // Optionally show a success message or change button text
        alert("Script copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy script: ", err);
      });
  };

  const handleDownload = () => {
    const blob = new Blob([mikrotikScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ipListName}.rsc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          IP MikroTik Script Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-gray-700 font-bold mb-2">
              Enter JSON URL:
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <label htmlFor="ipListName" className="block text-gray-700 font-bold mb-2">
            Enter Name address:
          </label>
          <input
            type="text"
            id="ipListName"
            value={ipListName}
            onChange={(e) => setIpListName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
          >
            Generate Script
          </button>
        </form>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        {mikrotikScript && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Generated Script:
            </h2>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleCopy}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mb-4"
              >
                Copy Script
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mb-4"
              >
                Download Script
              </button>
            </div>
            <pre className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap">
              {mikrotikScript}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
