import React, { useEffect, useState } from 'react';

const ArticleModal = ({ title, onClose }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFullArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`
        );
        if (!res.ok) throw new Error('Failed to fetch article content');
        const html = await res.text();
        setHtmlContent(html);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFullArticle();
  }, [title]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black bg-opacity-80 shadow-md">
        <h2 className="text-xl font-semibold text-white truncate">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="text-white text-3xl hover:opacity-70">&times;</button>
      </div>
      <div className="p-4 text-white max-w-4xl mx-auto">
        {loading && <p className="text-center text-gray-300">Loading full article...</p>}
        {error && <p className="text-center text-red-400">Error: {error}</p>}
        {!loading && !error && (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default ArticleModal;