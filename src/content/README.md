# Root Cause Content

## Questions

Every language + category combination is a JSON array in `questions/`:

- `python-general.json`, `python-vibe.json`
- `javascript-general.json`, `javascript-vibe.json`
- `typescript-general.json`, `typescript-vibe.json`
- `dart-general.json`, `dart-vibe.json`

### Schema

```json
{
  "id": "py-gen-003",
  "language": "python",
  "category": "general",
  "difficulty": "easy | medium | hard",
  "prompt": "What's the bug?",
  "code": "def foo():\n    pass",
  "choices": [
    { "id": "a", "text": "..." },
    { "id": "b", "text": "..." },
    { "id": "c", "text": "..." },
    { "id": "d", "text": "..." }
  ],
  "correctChoiceId": "b",
  "explanation": "2 to 3 sentence teaching explanation.",
  "tags": ["optional", "tags"]
}
```

### Rules

- `id` must be unique across all files.
- Use exactly four choices with ids `a`, `b`, `c`, `d`.
- `correctChoiceId` must reference one of the choice ids.
- Escape code blocks with `\n` for line breaks.
- Keep explanations focused on the underlying concept, not the specific answer text.

### Category meaning

- `general`: Real world bugs developers hit.
- `vibe`: AI generated code pitfalls (hallucinated APIs, wrong imports, plausible-looking logic errors, outdated syntax).

## Typing Snippets

Per-language arrays in `typing/`:

```json
{
  "id": "py-s-01",
  "language": "python",
  "code": "from typing import Optional",
  "description": "typing imports"
}
```

Keep snippets realistic. Mix lengths: 20 to 40 chars easy, 40 to 80 medium, 80 to 150 hard. Never more than 150 characters.
