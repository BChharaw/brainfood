import React, { useEffect, useState } from 'react';

const COHERE_API_KEY = ""; // Replace with your actual API key
const COHERE_GENERATE_URL = "https://api.cohere.ai/v1/generate";

const ArticleDetail = ({ article, onClose, darkMode }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [showWikipediaContent, setShowWikipediaContent] = useState(false);

  useEffect(() => {
    fetchAISummary();
  }, [article.title]);

  useEffect(() => {
    if (showWikipediaContent) {
      fetchFullArticle();
    }
  }, [showWikipediaContent]);

  // Fetch AI Summary from Cohere
  const fetchAISummary = async () => {
    setLoadingSummary(true);
    try {
      const requestData = {
        model: "command",
        prompt: `Generate a concise summary (5-7 sentences) of the topic "${article.title}" based on the following Wikipedia introduction: "${article.extract}". The summary should be factual and well-structured.`,
        max_tokens: 150,
        temperature: 0.3,
      };

      const response = await fetch(COHERE_GENERATE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (data.generations && data.generations.length > 0) {
        setAiSummary(data.generations[0].text.trim());
      } else {
        setAiSummary("AI summary unavailable.");
      }
    } catch (error) {
      console.error("Error fetching AI summary:", error);
      setAiSummary("AI summary could not be retrieved.");
    }
    setLoadingSummary(false);
  };

  // Fetch Full Wikipedia Article
  const fetchFullArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(article.title)}`
      );
      if (!res.ok) throw new Error('Failed to fetch article content');
      const html = await res.text();
      setHtmlContent(html);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto slide-in transition-colors duration-300 ${
        darkMode ? 'bg-[#121212] text-gray-200' : 'bg-[#f4f4f4] text-gray-900'
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 p-4 shadow-md flex justify-between items-center transition-colors ${
          darkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white text-gray-900'
        }`}
      >
        <h2 className="text-lg md:text-xl font-semibold tracking-wide">{article.title}</h2>
        <button onClick={onClose} className="text-3xl hover:opacity-70">&times;</button>
      </div>

      {/* AI Summary */}
      <div className="p-4 max-w-3xl mx-auto text-[17px] leading-relaxed">
        {loadingSummary ? (
          <p className="text-center opacity-70">Generating AI summary...</p>
        ) : (
          <div className="bg-gray-700 text-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">AI Summary</h3>
            <p>{aiSummary}</p>
          </div>
        )}
      </div>

      {/* Wikipedia Content (Shown Only After Click) */}
      {!showWikipediaContent ? (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowWikipediaContent(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Pull More Info from Wikipedia
          </button>
        </div>
      ) : (
        <div className="p-4 max-w-3xl mx-auto text-[17px] leading-relaxed">
          {loading && <p className="text-center opacity-70">Loading full article...</p>}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <div 
              className={`article-content ${darkMode ? 'dark-mode' : 'light-mode'}`}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            ></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;