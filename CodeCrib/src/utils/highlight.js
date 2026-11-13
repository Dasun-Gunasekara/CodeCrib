const keywords = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'new', 'class',
  'async', 'await', 'try', 'catch', 'throw', 'import', 'from', 'export', 'default', 'true',
  'false', 'null', 'undefined', 'def', 'in', 'not', 'and', 'or', 'None', 'True', 'False',
  'int', 'double', 'float', 'boolean', 'void', 'static', 'public', 'private', 'String',
  'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'JOIN', 'ON', 'AS', 'INSERT', 'INTO',
  'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'IS', 'NOT', 'NULL', 'COUNT',
]);

const tokenPattern = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|<!--[\s\S]*?-->|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b/g;

function classifyToken(token) {
  if (/^(\/\/|\/\*|#|<!--)/.test(token)) return 'comment';
  if (/^(["'`])/.test(token)) return 'string';
  if (/^\d/.test(token)) return 'number';
  if (keywords.has(token)) return 'keyword';
  return 'plain';
}

export function tokenizeCode(code) {
  const tokens = [];
  let cursor = 0;

  for (const match of code.matchAll(tokenPattern)) {
    if (match.index > cursor) {
      tokens.push({ text: code.slice(cursor, match.index), type: 'plain' });
    }

    tokens.push({ text: match[0], type: classifyToken(match[0]) });
    cursor = match.index + match[0].length;
  }

  if (cursor < code.length) {
    tokens.push({ text: code.slice(cursor), type: 'plain' });
  }

  return tokens;
}
