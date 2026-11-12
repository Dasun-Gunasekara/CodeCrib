# CodeCrib testing checklist

## Prepare an offline test

- [ ] Install/open the app and allow the first launch to finish before disconnecting.
- [ ] For an independent launch test, use an installed development, preview, or release build rather than a Metro-dependent Expo Go session.
- [ ] Enable airplane mode and verify Wi-Fi and mobile data are disabled.
- [ ] Force-close and relaunch the installed app while airplane mode remains enabled.
- [ ] Confirm the app opens without a network error or remote-content placeholder.

## Onboarding and navigation

- [ ] On a fresh install, verify the three onboarding slides appear and can be advanced, revisited, or skipped.
- [ ] Finish onboarding, force-close, and relaunch; verify onboarding does not repeat.
- [ ] Move between Home, Library, Favorites, Quiz, Progress, and Settings using the bottom tabs.
- [ ] Open Help & About from Settings; verify the offline and privacy guidance is available.
- [ ] Open a snippet detail and return to the previous screen.
- [ ] Verify back navigation and safe-area spacing on a small phone.
- [ ] Trigger a recoverable render error in a disposable development build; verify ErrorBoundary announces the problem and offers Try again.

## Home and local snippet library

- [ ] Verify the daily snippet and its detail view load offline.
- [ ] Verify all six language cards show the correct snippet count.
- [ ] Open a language card; verify the library opens with that language selected.
- [ ] Verify quick stats and recently viewed snippets update after opening examples.
- [ ] Search by title, description, and tag; clear the search and verify results return.
- [ ] Submit a search, force-close/relaunch, and verify recent searches persist; reopen one and clear the history.
- [ ] Combine language, difficulty, and category filters; verify the count and results update.
- [ ] Try a query with no results and verify the empty state is shown.
- [ ] Test A–Z, newest, and difficulty sorting.
- [ ] Pull to refresh while offline and verify the bundled/local library remains usable.

## Details, favorites, and personal snippets

- [ ] Open a snippet and verify language, difficulty, tags, description, code, and common-mistake note.
- [ ] Add, edit, clear, and relaunch with a personal note; verify it is kept locally and is specific to that snippet.
- [ ] Verify code highlighting distinguishes keywords, strings, numbers, and comments.
- [ ] Copy code; verify the clipboard contains the displayed snippet and the app shows feedback.
- [ ] Favorite and unfavorite both bundled and personal snippets.
- [ ] Open Favorites, open a saved item, and remove a favorite from the list.
- [ ] Add a personal snippet with valid fields; verify it appears in search and details.
- [ ] Submit the add form with missing or over-limit values; verify validation prevents saving.
- [ ] Edit a personal snippet and verify the updated values persist after force-close/relaunch.
- [ ] Confirm bundled examples cannot be edited or deleted.
- [ ] Delete a personal snippet, cancel once, then confirm; verify it disappears from the library, favorites, and recent views.
- [ ] Use the library Undo snackbar immediately after deletion; verify the snippet, favorite state, recent-view position, and note are restored.

## Quiz and progress

- [ ] Start a quiz; verify up to 10 questions are chosen from the selected language/difficulty match and fewer matches are handled with the actual count.
- [ ] Select an answer; verify options lock, correct/incorrect feedback appears, and an explanation is shown.
- [ ] Confirm the displayed options do not change after selecting an answer or while moving to the next question.
- [ ] Complete a quiz; verify the final score and wrong-answer review.
- [ ] Verify a new quiz result is saved locally and remains after relaunch.
- [ ] Take another quiz and verify Progress shows the average, best score, and last five results.
- [ ] Open snippets and finish a quiz; verify viewed count and streak update.
- [ ] Clear quiz history in Settings and verify score metrics and chart reset.

## Settings and persistence

- [ ] Choose System, Light, and Dark themes; verify appearance changes and persists after relaunch.
- [ ] Choose Small, Medium, and Large code text sizes; verify the code block updates and the choice persists after relaunch.
- [ ] Toggle haptic feedback; verify copy feedback still appears and vibration follows the selected preference.
- [ ] In Light and Dark themes, check text, metadata, chips, icons, error states, dialogs, and navigation controls for readable contrast.
- [ ] Clear favorites and verify the list is empty without deleting snippets.
- [ ] Reset personal data and verify user snippets, favorites, viewing activity, streak, and scores are removed while bundled examples remain.
- [ ] Verify reset also clears personal notes and recent searches but leaves theme, code-size, and haptics preferences intact.
- [ ] Verify About information is visible in airplane mode.
- [ ] Trigger an available local-storage failure or corrupt test value in a disposable install; verify the error is surfaced and the app remains recoverable.

## Accessibility and branding

- [ ] Navigate the app with VoiceOver or TalkBack; verify buttons, filters, search, quiz answers, notes, dialogs, and the Undo action have meaningful labels and state.
- [ ] Verify focus/target sizes are usable and that text remains readable at the device's larger accessibility text settings.
- [ ] Verify the app icon, adaptive icon, splash, onboarding mark, and Help/About mark use the same local CodeCrib branding.
- [ ] Capture genuine screenshots for the placeholders in `README.md`; do not commit placeholder artwork as if it were an app screenshot.

## Release checks

- [x] Run `npm run validate:data` and confirm all 60 quiz answers and language distributions pass.
- [x] Run `npx expo lint`.
- [x] Run `npx expo-doctor`.
- [x] Run `npx expo export --platform android`.
- [ ] Inspect the installed preview/release build with airplane mode enabled; no app feature should require a network request.
