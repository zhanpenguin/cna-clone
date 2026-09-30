import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { api } from "./api.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import {
  AboutPage,
  MyFeedPage,
  BookmarksPage,
  SignInPage,
  WatchPage,
  ListenPage,
  NewslettersPage,
  GamesPage,
  FastPage,
  AppPage,
  ExplainsPage,
  InteractivesPage,
  SpecialReportsPage,
  BrandStudioPage,
  AdvertisePage,
  ContactPage,
  PresentersPage,
  CorrespondentsPage,
  RssPage,
} from "./pages/Features.jsx";

export const DataContext = createContext(null);

export function useData() {
  return useContext(DataContext);
}

function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  const set = (next) => {
    setValue((prev) => {
      const val = typeof next === "function" ? next(prev) : next;
      localStorage.setItem(key, JSON.stringify(val));
      return val;
    });
  };
  return [value, set];
}

export function DataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // User preferences (reader features)
  const [edition, setEdition] = usePersistentState("cna_edition", "sg");
  const [bookmarks, setBookmarks] = usePersistentState("cna_bookmarks", []);
  const [myfeedTopics, setMyfeedTopics] = usePersistentState("cna_myfeed", []);
  const [user, setUser] = usePersistentState("cna_user", null);

  const refresh = async () => {
    const [cats, arts, trend, setts] = await Promise.all([
      api.categories(),
      api.articles(),
      api.trending(),
      api.settings(),
    ]);
    setCategories(cats);
    setArticles(arts);
    setTrending(trend);
    setSettings(setts || {});
    setLoading(false);
  };

  useEffect(() => {
    refresh().catch((err) => {
      console.error("Failed to load data", err);
      setLoading(false);
    });
  }, []);

  const toggleBookmark = (id) => {
    setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
  };

  const toggleTopic = (topic) => {
    setMyfeedTopics((t) => (t.includes(topic) ? t.filter((x) => x !== topic) : [...t, topic]));
  };

  const signIn = (profile) => setUser(profile);
  const signOut = () => setUser(null);

  const value = useMemo(
    () => ({
      categories,
      articles,
      trending,
      settings,
      loading,
      refresh,
      edition,
      setEdition,
      bookmarks,
      toggleBookmark,
      myfeedTopics,
      toggleTopic,
      user,
      signIn,
      signOut,
    }),
    [categories, articles, trending, settings, loading, edition, bookmarks, myfeedTopics, user]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function Shell() {
  const { categories, articles, loading } = useData();
  const breaking = articles.filter((a) => a.breaking).slice(0, 6);

  if (loading) {
    return (
      <div className="wrap" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Loading…</h2>
      </div>
    );
  }

  return (
    <>
      <Header categories={categories} breakingArticles={breaking} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/search/:query" element={<SearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/myfeed" element={<MyFeedPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/listen" element={<ListenPage />} />
          <Route path="/newsletters" element={<NewslettersPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/fast" element={<FastPage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/explains" element={<ExplainsPage />} />
          <Route path="/interactives" element={<InteractivesPage />} />
          <Route path="/special-reports" element={<SpecialReportsPage />} />
          <Route path="/brand-studio" element={<BrandStudioPage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/presenters" element={<PresentersPage />} />
          <Route path="/correspondents" element={<CorrespondentsPage />} />
          <Route path="/rss" element={<RssPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer categories={categories} />
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}
