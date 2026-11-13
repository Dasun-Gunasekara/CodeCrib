const difficultyOrder = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

export function filterAndSortSnippets(snippets, filters) {
  const query = filters.query.trim().toLocaleLowerCase();
  const filtered = snippets.filter((snippet) => {
    const matchesText =
      !query ||
      [snippet.title, snippet.description, ...(snippet.tags || [])]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query);

    return (
      matchesText &&
      (filters.language === 'All' || snippet.language === filters.language) &&
      (filters.difficulty === 'All' || snippet.difficulty === filters.difficulty) &&
      (filters.category === 'All' || snippet.category === filters.category)
    );
  });

  return filtered.sort((left, right) => {
    if (filters.sort === 'Newest') {
      return String(right.createdAt).localeCompare(String(left.createdAt));
    }

    if (filters.sort === 'Difficulty') {
      return difficultyOrder[left.difficulty] - difficultyOrder[right.difficulty];
    }

    return left.title.localeCompare(right.title);
  });
}
