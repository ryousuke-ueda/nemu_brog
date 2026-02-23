const yearElement = document.getElementById("year");
const articlesListElement = document.getElementById("articles-list");
const prevArticleLinkElement = document.getElementById("prev-article-link");
const nextArticleLinkElement = document.getElementById("next-article-link");
const articlesCacheKey = "unity-blog-articles-cache";
const isArticlePage = decodeURIComponent(window.location.pathname).split("/").includes("articles");
const articlesDataPath = isArticlePage ? "../data/articles.json" : "./data/articles.json";

const fallbackArticles = [
  {
    "title": "はじめの一歩",
    "date": "2026-02-23",
    "summary": "今回作ろうとしてるプロジェクト・構想の大まかなまとめ！",
    "url": "articles/001.html"
  }
]
;

function toArticleHref(articleUrl) {
  const normalized = String(articleUrl || "").replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized) {
    return "#";
  }

  if (isArticlePage) {
    const fileName = normalized.split("/").pop();
    return fileName ? `./${fileName}` : "#";
  }

  return `./${normalized}`;
}

function renderArticles(articles) {
  if (!articlesListElement) {
    return;
  }

  articlesListElement.innerHTML = articles
    .map(
      (article) => `
        <li class="article-item">
          <a class="article-link" href="${toArticleHref(article.url)}">${article.title}</a>
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
      prevArticleLinkElement.href = toArticleHref(prevArticle.url);
      prevArticleLinkElement.textContent = `前の記事: ${prevArticle.title}`;
      prevArticleLinkElement.hidden = false;
    } else {
      prevArticleLinkElement.hidden = true;
    }
  }

  if (nextArticleLinkElement) {
    if (nextArticle) {
      nextArticleLinkElement.href = toArticleHref(nextArticle.url);
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
    const response = await fetch(articlesDataPath, { cache: "no-store" });
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
