export function parseSpecificationText(text = '') {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}|:|\|/);
      const label = (parts[0] || '').trim();
      const value = parts.slice(1).join(' ').trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);
}

export function stringifySpecifications(specifications = []) {
  return specifications.map((item) => `${item.label}: ${item.value}`).join('\n');
}
