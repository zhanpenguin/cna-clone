export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} minute${min > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "a day ago";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function categoryName(article, categories) {
  const cat = categories.find((c) => c.slug === article.category);
  return cat ? cat.name : article.category;
}

export function categorySlugToName(slug, categories) {
  const cat = categories.find((c) => c.slug === slug);
  return cat ? cat.name : slug;
}

export function todayLabel() {
  return new Date().toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
