export function getAnswerText(question) {
  return typeof question?.answer === 'string' ? question.answer.trim() : '';
}

export function getCorrectAnswerIndex(question) {
  const answerText = getAnswerText(question);
  const options = Array.isArray(question?.options) ? question.options : [];

  const index = options.findIndex((option) => option === answerText);
  return index >= 0 ? index : -1;
}

export function buildShuffledQuestion(question) {
  const options = Array.isArray(question?.options) ? [...question.options] : [];
  const shuffled = [...options];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const correctAnswerText = getAnswerText(question);

  return {
    ...question,
    options: shuffled,
    correctAnswerText,
    correctAnswerIndex: shuffled.findIndex((option) => option === correctAnswerText),
  };
}
