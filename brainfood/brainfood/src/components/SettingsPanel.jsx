import React, { useState, useEffect } from 'react';

const COHERE_API_KEY = ""; // Replace with your actual API key
const COHERE_GENERATE_URL = "https://api.cohere.ai/v1/generate";

const presetTopics = {
  "Artificial Intelligence": ["artificial intelligence", "AI", "machine learning", "neural network", "deep learning"],
  "Technology": ["technology", "tech", "gadgets", "innovation"],
  "Science": ["science", "physics", "chemistry", "biology"],
  "Health": ["health", "medicine", "wellness", "fitness"]
};

const SettingsPanel = ({ preferredTopics, setPreferredTopics, safeMode, setSafeMode, seenArticles, setSeenArticles, onClose }) => {
  const [userInterest, setUserInterest] = useState('');
  const [tempTopics, setTempTopics] = useState(preferredTopics);
  const [cohereGeneratedTopics, setCohereGeneratedTopics] = useState('');
  const [tempSafeMode, setTempSafeMode] = useState(safeMode);
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Helper function for cookies
  const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
  };

  const getCookie = (name) => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Load settings from cookies on mount
  useEffect(() => {
    const savedTopics = getCookie("preferredTopics");
    const savedSafeMode = getCookie("safeMode");
    const savedSeenArticles = getCookie("seenArticles");

    if (savedTopics) setTempTopics(savedTopics);
    if (savedSafeMode) setTempSafeMode(savedSafeMode === "true");
    if (savedSeenArticles) setSeenArticles(new Set(JSON.parse(savedSeenArticles)));
  }, []);

  const togglePreset = (presetName) => {
    setSelectedPresets((prev) =>
      prev.includes(presetName) ? prev.filter((p) => p !== presetName) : [...prev, presetName]
    );
  };

  // Fetch recommendations from Cohere API with debugging alert
  const fetchRecommendations = async () => {
    setLoadingTopics(true);
  
    const prompt = `The user wants to learn about: "${userInterest}". 
    Generate a list of exactly 100 relevant topics in machine learning that can be used to query the Wikipedia API for related articles.
    The list must be strictly comma-separated, containing only topic names.
    Do not include numbering, explanations, introductions, or extra text.`;
  
    const requestData = {
      model: "command",
      prompt: prompt,
      max_tokens: 800, // Prevent cutoff
      temperature: 0.1, // Lower for consistency
    };
  
    try {
      const response = await fetch(COHERE_GENERATE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      const data = await response.json();
      let rawText = data.generations?.[0]?.text?.trim() || "No response text";
  
      // Extract the best probable comma-separated list
      const extractedList = extractCommaSeparatedList(rawText);
  
      // Debugging alert with detailed breakdown
      alert(
        // `API Request:\n${JSON.stringify(requestData, null, 2)}\n\n` +
        // `Raw API Response:\n${JSON.stringify(data, null, 2)}\n\n` +
        // `Raw Text Extracted:\n${rawText}\n\n` +
        `Post-Processed Extracted List:\n${extractedList || "No valid list found"}`
      );
  
      if (extractedList) {
        setCohereGeneratedTopics(extractedList);
      } else {
        console.warn("No valid comma-separated list found.");
      }
    } catch (error) {
      console.error("Cohere API error:", error);
      alert(`Error fetching recommendations: ${error.message}`);
    }
    setLoadingTopics(false);
  };
  
  /**
   * Extracts a well-formed comma-separated list from API output.
   * Ensures at least 10 items and removes potential leading/trailing noise.
   */
  const extractCommaSeparatedList = (text) => {
    if (!text) return null;
  
    // Split by both commas and new line characters
    let topicsArray = text.split(/,|\n/).map((t) => t.trim());
  
    // Remove numbering at the start (e.g., "1. Decision trees")
    topicsArray = topicsArray.map((t) => t.replace(/^\d+\.\s*/, ""));
  
    // Remove items that are longer than 25 characters
    topicsArray = topicsArray.filter((t) => t.length > 0 && t.length <= 25);
  
    // Remove duplicates
    topicsArray = [...new Set(topicsArray)];
  
    // Remove first and last items as a precaution (potential extra text)
    if (topicsArray.length > 12) {
      topicsArray = topicsArray.slice(1, -1);
    }
  
    // Ensure the final list has at least 10 items and at most 100
    if (topicsArray.length >= 10 && topicsArray.length <= 100) {
      return topicsArray.join(", ");
    }
  
    return null;
  };
  const handleSave = () => {
    let combinedTopics = tempTopics ? tempTopics.split(",").map(t => t.trim()).filter(Boolean) : [];

    selectedPresets.forEach(preset => {
      combinedTopics = combinedTopics.concat(presetTopics[preset]);
    });

    if (cohereGeneratedTopics) {
      combinedTopics = combinedTopics.concat(cohereGeneratedTopics.split(","));
    }

    // Remove duplicates
    combinedTopics = [...new Set(combinedTopics)];
    const topicsString = combinedTopics.join(", ");

    setPreferredTopics(topicsString);
    setSafeMode(tempSafeMode);

    // Save preferences in cookies
    setCookie("preferredTopics", topicsString, 30);
    setCookie("safeMode", tempSafeMode, 30);
    setCookie("seenArticles", JSON.stringify([...seenArticles]), 30);

    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Settings</h2>

        {/* User Interest Input */}
        <label className="block mb-2">What do you want to learn about?</label>
        <input
          type="text"
          value={userInterest}
          onChange={(e) => setUserInterest(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Describe your interests..."
        />

        {/* Fetch AI Recommendations */}
        <button
          onClick={fetchRecommendations}
          disabled={loadingTopics}
          className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded w-full"
        >
          {loadingTopics ? "Generating..." : "Suggest Topics"}
        </button>

        {/* Advanced Mode Toggle */}
        <label className="flex items-center mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={advancedMode}
            onChange={() => setAdvancedMode(!advancedMode)}
            className="mr-2"
          />
          Enable Advanced Mode
        </label>

        {advancedMode && (
          <>
            {/* User Editable List */}
            <label className="block mt-4 mb-2">Your Preferred Topics:</label>
            <input
              type="text"
              value={tempTopics}
              onChange={(e) => setTempTopics(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />

            {/* AI Editable List */}
            <label className="block mt-4 mb-2">Cohere Suggested Topics:</label>
            <input
              type="text"
              value={cohereGeneratedTopics}
              onChange={(e) => setCohereGeneratedTopics(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </>
        )}

        {/* Buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;