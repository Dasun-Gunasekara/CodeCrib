# Assignment evidence

This evidence map points to the implementation and repeatable checks for CodeCrib's project requirements.

| Requirement | Evidence |
| --- | --- |
| Offline-first content | Bundled datasets in `src/data/`; local AsyncStorage helpers in `src/storage/storage.js`; centralized keys in `src/storage/keys.js`; no network-request or remote-image patterns were found in `src/` or `App.js`. |
| Dataset quality | `scripts/validate-data.js` checks snippet/question counts, six-language distribution, answer keys, difficulty balance, categories, tags, and long examples. Run `npm run validate:data`. |
| Existing app architecture | React Navigation is configured in `src/navigation/`; shared local state is managed by `src/context/SnippetsContext.js`, `src/context/ThemeContext.js`, and `src/context/AppPreferencesContext.js`. |
| Local persistence and privacy | Personal snippets, notes, favorites, recent searches, quiz history, activity, and preferences are stored through AsyncStorage; Settings supports clearing or resetting local data. |
| Offline app assets | Expo app icon, adaptive icon, web favicon, and splash logo are local files in `assets/`; the same logo is used in onboarding and Help/About. |
| Validation and release checks | `npm run validate:data`, `npx expo lint`, `npx expo-doctor`, and `npx expo export --platform android` are the project checks. Device-specific airplane-mode and assistive-technology checks are documented in `TESTING.md` and must be run on an installed app. |

The source audit covered `src/` and `App.js` for `fetch`, `XMLHttpRequest`, Axios, WebSocket, remote URLs, and URI-backed images. No matches were found. This is a source review, not a substitute for inspecting network traffic from an installed build.
