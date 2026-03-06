function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createLinkifier(glossary) {
  const entries = [...glossary]
    .filter((entry) => entry.term && entry.url)
    .sort((a, b) => b.term.length - a.term.length)
    .map((entry) => ({
      ...entry,
      regex: new RegExp(`\\b${escapeRegex(entry.term)}\\b`, "gi")
    }));

  return (text) => {
    if (!text) return "";
    let html = text;
    for (const entry of entries) {
      html = html.replace(entry.regex, (match) => {
        return `<a href="${entry.url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      });
    }
    return html;
  };
}
