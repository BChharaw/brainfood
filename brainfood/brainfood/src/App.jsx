import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import SettingsPanel from './components/SettingsPanel';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [preferredTopics, setPreferredTopics] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [safeMode, setSafeMode] = useState(true);
  const loaderRef = useRef(null);
  const observerRef = useRef(null);

  const containsAdultContent = (article) => {
    const forbiddenWords = ["porn", "xxx", "erotic", "sex", "adult"];
    const text = (article.title + " " + article.extract).toLowerCase();
    return forbiddenWords.some(word => text.includes(word));
  };

  const fetchArticle = async (attempt = 1) => {
    try {
      let article;
      if (preferredTopics.trim() !== "") {
        const topics = preferredTopics.split(",").map(t => t.trim()).filter(Boolean);
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(randomTopic)}&format=json&origin=*`
        );
        const data = await res.json();
        if (data.query.search.length > 0) {
          const randomResult = data.query.search[Math.floor(Math.random() * data.query.search.length)];
          const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(randomResult.title)}`
          );
          article = await summaryRes.json();
        } else {
          const randomRes = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
          article = await randomRes.json();
        }
      } else {
        const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        article = await res.json();
      }

      if (safeMode && containsAdultContent(article) && attempt < 5) {
        return await fetchArticle(attempt + 1);
      }
      return article;
    } catch (error) {
      console.error("Error fetching article:", error);
      return null;
    }
  };

  const addArticle = useCallback(async () => {
    const newArticle = await fetchArticle();
    if (newArticle) {
      setArticles(prev => [...prev, newArticle]);
    }
  }, [preferredTopics, safeMode]);

  useEffect(() => {
    const init = async () => {
      const initialArticles = [];
      for (let i = 0; i < 5; i++) {
        const article = await fetchArticle();
        if (article) {
          initialArticles.push(article);
        }
      }
      setArticles(initialArticles);
    };
    init();
  }, [preferredTopics, safeMode]);

  useEffect(() => {
    if (!loaderRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          addArticle();
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );

    observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [addArticle]);

  useEffect(() => {
    if (articles.length > 20) {
      setArticles(prev => prev.slice(10));
    }
  }, [articles]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openSettings={() => setSettingsOpen(true)}
      />

      <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {articles.map((article, index) => (
          <ArticleCard
            key={index}
            article={article}
            onViewMore={() => setSelectedArticle(article)}
          />
        ))}
        <div ref={loaderRef} className="py-10 text-center">
          <p>Loading more...</p>
        </div>
      </div>

      {settingsOpen && (
        <SettingsPanel
          preferredTopics={preferredTopics}
          setPreferredTopics={setPreferredTopics}
          safeMode={safeMode}
          setSafeMode={setSafeMode}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};

export default App;