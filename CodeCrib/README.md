# CodeCrib

CodeCrib is an offline programming snippet and cheat-sheet library for students. It bundles examples for six languages and keeps personal snippets, notes, favorites, quiz results, progress, onboarding state, and display preferences on the device.

## Features

- Search snippets by title, description, or tag; filter by language, category, and difficulty; sort alphabetically, by date, or by difficulty.
- View syntax-highlighted examples, copy code, favorite snippets, and find related examples.
- Create, edit, and delete personal snippets; undo a recent deletion from the library.
- Keep private per-snippet notes and revisit recent searches.
- Practice with a randomized 10-question quiz, instant explanations, and wrong-answer review.
- Track viewing activity, favorite count, quiz average, best score, recent quiz scores, and learning streak.
- Choose system, light, or dark appearance, adjust code text size, and enable or disable copy haptics.
- Three-slide first-launch onboarding.
- Help/About guidance and an error-recovery boundary are included.
- No remote services, network APIs, remote images, or remote fonts are used; app artwork and icon fonts are bundled locally.

## Screenshots

No app screenshots have been captured or included yet. Add genuine simulator or device captures at these paths when available; the table below does not represent screenshots.

| Home | Snippet library | Snippet details |
| --- | --- | --- |
| _Add `screenshots/home.png`_ | _Add `screenshots/library.png`_ | _Add `screenshots/details.png`_ |

| Quiz | Progress | Settings |
| --- | --- | --- |
| _Add `screenshots/quiz.png`_ | _Add `screenshots/progress.png`_ | _Add `screenshots/settings.png`_ |

## Tech stack

- Expo SDK 58, React Native, and JavaScript
- React Navigation native stack and bottom tabs
- React Context for snippets, theme, and display preferences
- AsyncStorage for user data and preferences
- Expo Clipboard, Haptics, Splash Screen, Status Bar, and Vector Icons
- Safe Area Context and React Native Screens

## Design decisions

- **Offline-first:** Snippets, quizzes, and categories ship as local JSON, while personal content and preferences use AsyncStorage. This keeps the core study flows available without an account or network connection and keeps user data on the device.
- **Shuffle quiz choices, track answers by text:** Randomizing question and option order reduces reliance on memorized answer positions. The quiz retains the correct answer text and maps it to the shuffled option list for display; scoring also compares answer text rather than a fixed option index.
- **Keep filters in a sheet:** Search and the snippet list remain uncluttered while less-frequently changed difficulty, category, and sort controls are grouped together. Draft selections can be reviewed and applied or reset in one place.

## Known limitations

- The bundled examples and quiz bank are finite and can only be updated with an app release.
- Personal snippets, favorites, notes, and progress are stored on this device; there is no account, cloud sync, or built-in backup/import-export.
- Automated checks cover bundled data and linting, but there is no configured unit-test suite. Device, screen-reader, and installed-app airplane-mode checks remain manual; see [TESTING.md](./TESTING.md).
- Genuine app screenshots have not yet been captured. A web preview was not validated because the web runtime dependencies are not installed.

## Project structure

```text
CodeCrib/
├── App.js
├── app.json
├── package.json
├── package-lock.json
├── README.md
├── TESTING.md
├── screenshots/
│   └── .gitkeep
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── favicon.png
│   └── images/
│       ├── logo.png
│       └── logo-dark.png
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── TabNavigator.js
│   │   └── SnippetsStack.js
│   ├── screens/
│   │   ├── HelpAboutScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── HomeScreen.js, SnippetListScreen.js, SnippetDetailsScreen.js
│   │   ├── AddEditSnippetScreen.js, FavoritesScreen.js
│   │   └── QuizScreen.js, QuizResultScreen.js, ProgressScreen.js, SettingsScreen.js
│   ├── components/
│   │   ├── ErrorBoundary.js
│   │   ├── UndoSnackbar.js
│   │   └── Reusable cards, controls, dialogs, headers, and status components
│   ├── context/
│   │   ├── AppPreferencesContext.js
│   │   ├── SnippetsContext.js
│   │   └── ThemeContext.js
│   ├── storage/      # storage.js, keys.js
│   ├── data/         # snippets.json, quiz.json, categories.json
│   ├── utils/        # highlight.js, quizBuilder.js, search.js, date.js
│   └── theme/        # colors.js, typography.js, spacing.js
└── index.js
```

## Local data and offline behavior

- `src/data/snippets.json`, `src/data/quiz.json`, and `src/data/categories.json` are bundled with the app.
- The app merges bundled snippets with personal snippets stored in AsyncStorage. Favorites, per-snippet notes, recent searches, recently viewed snippets, unique snippets viewed, activity dates, quiz history, onboarding completion, theme mode, code size, and haptics preference are stored locally as well.
- AsyncStorage keys are centralized in `src/storage/keys.js`; JSON serialization and storage errors are handled in `src/storage/storage.js`.
- The app does not fetch remote data. Artwork and branding are local PNGs; icons use the bundled Expo vector-icon font.
- `scripts/validate-data.js` enforces quiz answer integrity, language/difficulty distribution, snippet counts, categories, tags, and example coverage.

## Assignment evidence

See [ASSIGNMENT_EVIDENCE.md](./ASSIGNMENT_EVIDENCE.md) for a concise map from the offline, data-quality, persistence, architecture, and validation requirements to their implementation files and checks.

### Verify offline

Install or open the app on a device first. Enable airplane mode, then use the checklist in [TESTING.md](./TESTING.md) to verify browsing, editing, favorites, quizzes, progress, settings, and restart persistence. The initial Expo development server connection is separate from the app's runtime data: for a strict offline launch test, use an installed preview/release build rather than relying on Metro over Wi-Fi.

## Setup

Requirements: Node.js and npm. The web target runs in a modern browser; Android or iOS simulator/device support is needed for native testing.

```sh
npm install
npm run web
```

`npm run web` starts the Expo web development server and opens CodeCrib in a browser. Use `npx expo start` for the Expo CLI prompts to open a simulator or device with Expo Go. Native clipboard/haptics and splash-screen presentation should also be checked in a development or release build.

Useful validation commands:

```sh
npm run validate:data
npx expo lint
npx expo-doctor
npx expo export --platform web
npx expo export --platform android
```

## Project status

In this update, `npm run validate:data`, `npx expo lint`, and `npx expo export --platform web` completed successfully. The web app also loaded through onboarding and into Home in a browser at 360×640. Expo health checks, physical-device behavior, accessibility service checks, and installed-app launch/persistence in airplane mode were not verified in this update; use the manual checklist in [TESTING.md](./TESTING.md).

## Future improvements

- Add more student-reviewed examples and language-specific quiz questions.
- Add import/export of personal snippets using local files.
- Add automated unit tests for persistence, filtering, and quiz scoring.

## Folder details

- `src/navigation/`: root stack, tab navigation, and snippet stack.
- `src/screens/`: onboarding, library, detail, quiz, progress, and settings screens.
- `src/components/`: reusable cards, code display, filters, dialogs, and buttons.
- `src/context/`: app-wide library, theme, and display-preference state.
- `src/storage/`: centralized storage keys and AsyncStorage helpers.
- `src/data/`: bundled offline snippet, quiz, and category JSON.
- `src/utils/`: tokenization, search, date, and activity helpers.
- `src/theme/`: colors, type scale, spacing, and radii.
