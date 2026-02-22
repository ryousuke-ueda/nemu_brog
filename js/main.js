const yearElement = document.getElementById("year");
const articlesListElement = document.getElementById("articles-list");
const prevArticleLinkElement = document.getElementById("prev-article-link");
const nextArticleLinkElement = document.getElementById("next-article-link");
const articlesCacheKey = "unity-blog-articles-cache";

const fallbackArticles = [
  {
    title: "Unity学習ログ #01: 環境構築メモ",
    date: "2026-02-22",
    summary: "Unity Hubの導入、プロジェクト作成、初期設定の確認。",
    url: "./articles/001.html"
  },
  {
    title: "Unity学習ログ #02: シーンとゲームオブジェクトの基本",
    date: "2026-02-22",
    summary: "Scene、Hierarchy、Inspector の基本操作を整理。",
    url: "./articles/002.html"
  },
  {
    title: "Unity学習ログ #03: C#スクリプトの最初の一歩",
    date: "2026-02-22",
    summary: "MonoBehaviour、Update、Debug.Log を試して挙動を確認。",
    url: "./articles/003.html"
  },
  {
    "title": "Unity学習ログ #04: The,テスト記事",
    "date": "2026-02-22",
    "summary": "追加できるかどうかのテストだけよん。",
    "url": "./articles/004.html"
  }
];

function renderArticles(articles) {
  if (!articlesListElement) {
    return;
  }

  articlesListElement.innerHTML = articles
    .map(
      (article) => `
        <li class="article-item">
          <a class="article-link" href="${article.url}">${article.title}</a>
          <p class="article-meta">公開日: ${article.date}</p>
          <p class="article-summary">${article.summary}</p>
        </li>
      `
    )
    .join("");
}

function renderArticlePager(articles) {
  if (!prevArticleLinkElement && !nextArticleLinkElement) {
    return;
  }

  const currentFileName = decodeURIComponent(window.location.pathname).split("/").pop();
  const currentIndex = articles.findIndex((article) => article.url.split("/").pop() === currentFileName);

  if (currentIndex < 0) {
    if (prevArticleLinkElement) {
      prevArticleLinkElement.hidden = true;
    }
    if (nextArticleLinkElement) {
      nextArticleLinkElement.hidden = true;
    }
    return;
  }

  const prevArticle = articles[currentIndex - 1];
  const nextArticle = articles[currentIndex + 1];

  if (prevArticleLinkElement) {
    if (prevArticle) {
      prevArticleLinkElement.href = prevArticle.url;
      prevArticleLinkElement.textContent = `前の記事: ${prevArticle.title}`;
      prevArticleLinkElement.hidden = false;
    } else {
      prevArticleLinkElement.hidden = true;
    }
  }

  if (nextArticleLinkElement) {
    if (nextArticle) {
      nextArticleLinkElement.href = nextArticle.url;
      nextArticleLinkElement.textContent = `次の記事: ${nextArticle.title}`;
      nextArticleLinkElement.hidden = false;
    } else {
      nextArticleLinkElement.hidden = true;
    }
  }
}

function isValidArticles(articles) {
  return Array.isArray(articles);
}

function saveArticlesCache(articles) {
  if (!isValidArticles(articles)) {
    return;
  }

  try {
    localStorage.setItem(articlesCacheKey, JSON.stringify(articles));
  } catch (error) {
  }
}

function loadArticlesCache() {
  try {
    const cached = localStorage.getItem(articlesCacheKey);
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);
    return isValidArticles(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function renderWithArticles(articles) {
  renderArticles(articles);
  renderArticlePager(articles);
}

async function loadArticles() {
  try {
    const response = await fetch("../data/articles.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }

    const articles = await response.json();
    if (!isValidArticles(articles)) {
      throw new Error("Invalid JSON format");
    }

    saveArticlesCache(articles);
    renderWithArticles(articles);
  } catch (error) {
    const cachedArticles = loadArticlesCache();
    if (cachedArticles) {
      renderWithArticles(cachedArticles);
      return;
    }

    renderWithArticles(fallbackArticles);
  }
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

loadArticles();
