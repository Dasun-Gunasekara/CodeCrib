const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const snippetsPath = path.join(rootDir, 'src', 'data', 'snippets.json');
const quizPath = path.join(rootDir, 'src', 'data', 'quiz.json');
const categoriesPath = path.join(rootDir, 'src', 'data', 'categories.json');

const results = [];
const fail = (label, message) => results.push({ label, ok: false, message });
const pass = (label, message = '') => results.push({ label, ok: true, message });

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail('valid JSON', `${path.basename(filePath)}: ${error.message}`);
    return null;
  }
}

const validDifficulties = new Set(['Beginner', 'Intermediate', 'Advanced']);
const categories = readJson(categoriesPath);
const snippets = readJson(snippetsPath);
const quiz = readJson(quizPath);

if (Array.isArray(categories)) {
  pass('valid JSON', 'categories.json parsed successfully');
} else {
  fail('valid JSON', 'categories.json could not be parsed');
}

if (Array.isArray(snippets)) {
  pass('valid JSON', 'snippets.json parsed successfully');
} else {
  fail('valid JSON', 'snippets.json could not be parsed');
}

if (Array.isArray(quiz)) {
  pass('valid JSON', 'quiz.json parsed successfully');
} else {
  fail('valid JSON', 'quiz.json could not be parsed');
}

if (Array.isArray(snippets)) {
  const seenIds = new Set();
  const seenTitles = new Set();
  let emptyField = false;
  const snippetCategories = new Set();
  const longExamplesByLanguage = {};
  const bannedSnippetPatterns = [/fetch\s*\(/i, /axios/i, /http:\/\//i, /https:\/\//i];

  for (const snippet of snippets) {
    if (!snippet || typeof snippet !== 'object') {
      emptyField = true;
      continue;
    }

    if (!snippet.id || seenIds.has(snippet.id)) {
      fail('unique snippet ids', `Duplicate snippet id: ${snippet.id || 'missing'}`);
    }
    if (snippet.id) seenIds.add(snippet.id);

    if (!snippet.title || seenTitles.has(snippet.title)) {
      fail('unique snippet titles', `Duplicate or empty title: ${snippet.title || 'missing'}`);
    }
    if (snippet.title) seenTitles.add(snippet.title);

    for (const key of ['language', 'category', 'difficulty', 'description', 'code', 'commonMistake']) {
      if (!snippet[key] || String(snippet[key]).trim() === '') {
        fail('no empty required field', `Snippet ${snippet.id || 'unknown'} is missing ${key}`);
        emptyField = true;
      }
    }

    if (!Array.isArray(snippet.tags) || snippet.tags.length < 3 || snippet.tags.length > 5 || snippet.tags.some((tag) => !tag || !String(tag).trim())) {
      fail('snippet tags', `Snippet ${snippet.id || 'unknown'} must have 3 to 5 non-empty tags`);
      emptyField = true;
    }
    if (snippet.category) snippetCategories.add(snippet.category);
    const lineCount = typeof snippet.code === 'string' ? snippet.code.split(/\r?\n/).length : 0;
    if (lineCount >= 10 && lineCount <= 15) {
      longExamplesByLanguage[snippet.language] = (longExamplesByLanguage[snippet.language] || 0) + 1;
    }

    if (!validDifficulties.has(snippet.difficulty)) {
      fail('valid difficulty values', `Snippet ${snippet.id || 'unknown'} has invalid difficulty: ${snippet.difficulty}`);
    }

    const snippetText = JSON.stringify(snippet);
    const bannedMatch = bannedSnippetPatterns.find((pattern) => pattern.test(snippetText));
    if (bannedMatch) {
      fail('offline-safe snippet data', `Snippet ${snippet.id || 'unknown'} contains a banned network reference: ${bannedMatch}`);
    }
  }

  if (!emptyField) {
    pass('no empty required field', 'All required snippet fields are populated');
  }

  if (seenIds.size === snippets.length) {
    pass('unique snippet ids', `Found ${seenIds.size} unique snippet ids`);
  }
  if (seenTitles.size === snippets.length) {
    pass('unique snippet titles', `Found ${seenTitles.size} unique snippet titles`);
  }

  const difficultyCounts = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  const languageDifficultyCounts = {};
  for (const snippet of snippets) {
    if (snippet && snippet.difficulty) {
      difficultyCounts[snippet.difficulty] += 1;
      const language = snippet.language || 'unknown';
      if (!languageDifficultyCounts[language]) {
        languageDifficultyCounts[language] = { Beginner: 0, Intermediate: 0, Advanced: 0 };
      }
      languageDifficultyCounts[language][snippet.difficulty] += 1;
    }
  }

  if (Object.values(difficultyCounts).every((count) => count > 0)) {
    pass('valid difficulty values', `Difficulty totals: ${JSON.stringify(difficultyCounts)}`);
  }

  const languageCounts = {};
  for (const snippet of snippets) {
    if (!snippet || !snippet.language) continue;
    languageCounts[snippet.language] = (languageCounts[snippet.language] || 0) + 1;
  }

  const categoryLanguages = new Set((categories || []).map((entry) => entry.language));
  const missingLanguages = [...categoryLanguages].filter((language) => languageCounts[language] !== 10);
  const unknownLanguages = Object.keys(languageCounts).filter((language) => !categoryLanguages.has(language));
  if (snippets.length === categoryLanguages.size * 10 && missingLanguages.length === 0 && unknownLanguages.length === 0) {
    pass('10 snippets per language', `Counts: ${JSON.stringify(languageCounts)}`);
  } else {
    fail(
      '10 snippets per language',
      `Expected 10 for each listed language; counts: ${JSON.stringify(languageCounts)}`,
    );
  }

  if (missingLanguages.length === 0) {
    pass('every language exists in categories.json', 'All snippet languages exist in categories.json');
  } else {
    fail('every language exists in categories.json', `Missing or incomplete: ${missingLanguages.join(', ')}`);
  }
  if (unknownLanguages.length > 0) {
    fail('every language exists in categories.json', `Unknown: ${unknownLanguages.join(', ')}`);
  }
  if (snippetCategories.size >= 14 && snippetCategories.size <= 16) {
    pass('merged snippet categories', `Found ${snippetCategories.size} distinct categories`);
  } else {
    fail('merged snippet categories', `Expected about 15 categories; found ${snippetCategories.size}`);
  }
  const shortLanguageCoverage = [...categoryLanguages].filter((language) => (longExamplesByLanguage[language] || 0) < 2);
  if (shortLanguageCoverage.length === 0) {
    pass('long snippet examples', 'Each language has at least 2 examples of 10 to 15 lines');
  } else {
    fail('long snippet examples', `Fewer than 2 qualifying examples: ${shortLanguageCoverage.join(', ')}`);
  }
}

if (Array.isArray(quiz)) {
  const seenQuestionIds = new Set();
  const seenQuestions = new Set();
  const countsByLanguage = {};
  const difficultyCountsByLanguage = {};
  const codeQuestionsByLanguage = {};
  const answerDistribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const answerKeyReview = [];

  for (const question of quiz) {
    if (!question || typeof question !== 'object') {
      fail('question integrity', 'Encountered invalid question entry');
      continue;
    }

    if (!question.id || seenQuestionIds.has(question.id)) {
      fail('unique quiz ids', `Duplicate or missing quiz id: ${question.id || 'missing'}`);
    }
    if (question.id) seenQuestionIds.add(question.id);
    if (Object.hasOwn(question, 'answerIndex')) {
      fail('text-based answer key', `Question ${question.id || 'unknown'} still has the obsolete answerIndex field`);
    }

    if (!question.question || !String(question.question).trim()) {
      fail('valid question content', `Question ${question.id || 'unknown'} is missing question text`);
    }
    if (!question.explanation || !String(question.explanation).trim()) {
      fail('valid question content', `Question ${question.id || 'unknown'} is missing its explanation`);
    }

    if (question.question && seenQuestions.has(String(question.question).trim())) {
      fail('question uniqueness', `Duplicate question text: ${question.question}`);
    }
    if (question.question) seenQuestions.add(String(question.question).trim());

    if (!Array.isArray(question.options) || question.options.length !== 4 || question.options.some((option) => !option || !String(option).trim())) {
      fail('question options', `Question ${question.id || 'unknown'} has invalid options`);
    } else {
      const distinctOptions = new Set(question.options.map((option) => String(option).trim()));
      if (distinctOptions.size !== 4) {
        fail('question options', `Question ${question.id || 'unknown'} must have four distinct options`);
      }
      if (question.options.filter((option) => option === question.answer).length !== 1) {
        fail('single correct option', `Question ${question.id || 'unknown'} must contain exactly one correct option`);
      }
    }

    const answerText = typeof question.answer === 'string' ? question.answer.trim() : '';
    if (!answerText) {
      fail('answer key review', `Question ${question.id || 'unknown'} is missing a correct answer`);
    } else if (!Array.isArray(question.options) || !question.options.includes(answerText)) {
      fail('answer key review', `Question ${question.id || 'unknown'} answer is not one of the options`);
    } else {
      answerKeyReview.push({ id: question.id, question: question.question, answer: answerText });
      const correctIndex = question.options.indexOf(answerText);
      answerDistribution[correctIndex] += 1;
    }

    if (!validDifficulties.has(question.difficulty)) {
      fail('difficulties', `Question ${question.id || 'unknown'} has invalid difficulty: ${question.difficulty}`);
    }

    if (question.language) {
      countsByLanguage[question.language] = (countsByLanguage[question.language] || 0) + 1;
      if (!difficultyCountsByLanguage[question.language]) {
        difficultyCountsByLanguage[question.language] = { Beginner: 0, Intermediate: 0, Advanced: 0 };
      }
      if (validDifficulties.has(question.difficulty)) {
        difficultyCountsByLanguage[question.language][question.difficulty] += 1;
      }
      if (/what does this code [^?]*\?|what is wrong with this code\?/i.test(question.question)) {
        codeQuestionsByLanguage[question.language] = (codeQuestionsByLanguage[question.language] || 0) + 1;
      }
      if (Array.isArray(categories) && !categories.some((entry) => entry.language === question.language)) {
        fail('quiz language coverage', `Question ${question.id || 'unknown'} uses unknown language ${question.language}`);
      }
    } else {
      fail('quiz language coverage', `Question ${question.id || 'unknown'} is missing its language`);
    }
  }

  const expectedLanguages = new Set((categories || []).map((entry) => entry.language));
  const missingQuestionLanguages = [...expectedLanguages].filter((language) => countsByLanguage[language] !== 10);
  if (
    quiz.length === expectedLanguages.size * 10 &&
    missingQuestionLanguages.length === 0 &&
    Object.keys(countsByLanguage).every((language) => expectedLanguages.has(language))
  ) {
    pass('10 questions per language', `Counts: ${JSON.stringify(countsByLanguage)}`);
  } else {
    fail('10 questions per language', `Expected 10 for each listed language; counts: ${JSON.stringify(countsByLanguage)}`);
  }

  const expectedDifficultyCounts = { Beginner: 4, Intermediate: 3, Advanced: 3 };
  const invalidDifficultyLanguages = [...expectedLanguages].filter((language) => {
    const counts = difficultyCountsByLanguage[language] || {};
    return Object.entries(expectedDifficultyCounts).some(([difficulty, expected]) => counts[difficulty] !== expected);
  });
  if (invalidDifficultyLanguages.length === 0) {
    pass('difficulty distribution', 'Each language has 4 Beginner, 3 Intermediate, and 3 Advanced questions');
  } else {
    fail('difficulty distribution', `Expected 4/3/3 per language; invalid: ${invalidDifficultyLanguages.join(', ')}`);
  }

  const insufficientCodeLanguages = [...expectedLanguages].filter((language) => (codeQuestionsByLanguage[language] || 0) < 2);
  if (insufficientCodeLanguages.length === 0) {
    pass('code-based questions', 'At least 2 code-output or bug-spotting questions per language');
  } else {
    fail('code-based questions', `Fewer than 2 code-based questions: ${insufficientCodeLanguages.join(', ')}`);
  }

  if (Math.max(...Object.values(answerDistribution)) - Math.min(...Object.values(answerDistribution)) <= 2) {
    pass('answer-position distribution', `Distribution: ${JSON.stringify(answerDistribution)}`);
  } else {
    fail('answer-position distribution', `Distribution: ${JSON.stringify(answerDistribution)}`);
  }

  if (answerKeyReview.length === quiz.length) {
    pass('answer key review', `Reviewed ${answerKeyReview.length} questions`);
  } else {
    fail('answer key review', `Reviewed ${answerKeyReview.length} of ${quiz.length} questions`);
  }
}

const summary = results.map((result) => `${result.ok ? 'PASS' : 'FAIL'} ${result.label}${result.message ? `: ${result.message}` : ''}`).join('\n');
const exitCode = results.some((result) => !result.ok) ? 1 : 0;

if (Array.isArray(quiz) && quiz.length > 0) {
  const reviewLines = quiz
    .filter((question) => question && question.id && question.question && question.answer)
    .map((question) => `${question.id} | ${question.question} | [${question.options.indexOf(question.answer)}] ${question.answer}`);

  console.log('\nANSWER KEY REVIEW');
  if (reviewLines.length > 0) {
    console.log(reviewLines.join('\n'));
  } else {
    console.log('No answer review available.');
  }
}

console.log(summary || 'No checks run.');
console.log(exitCode === 0 ? '\nRESULT: PASS' : '\nRESULT: FAIL');
process.exit(exitCode);
