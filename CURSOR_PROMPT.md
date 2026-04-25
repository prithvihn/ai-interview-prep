# AI Interview Prep — Cursor Prompt

Copy and paste the entire prompt below into Cursor's Composer (Cmd+I or the Composer panel).

---

## PROMPT

Build a full React + Vite AI interview preparation web app called **InterviewPrep** with the following exact folder structure and specs:

---

### Tech Stack
- React 18 + Vite 5
- Tailwind CSS 3
- React Router v6
- Recharts (for score charts)
- Axios (for API calls)
- Web Speech API (SpeechRecognition) — browser built-in, zero cost
- SpeechSynthesis API — browser built-in TTS
- No other UI libraries

---

### Project Structure

Create exactly this structure under `frontend/`:

```
frontend/
  src/
    pages/
      Home.jsx          ← landing page
      Upload.jsx        ← step 1: job description + resume
      Interview.jsx     ← step 2: live interview room
      Report.jsx        ← step 3: results + score report
      Progress.jsx      ← bonus: session history dashboard
    components/
      ResumeDropzone.jsx   ← drag & drop file upload
      AnalysisCard.jsx     ← AI output card (expandable)
      QuestionBank.jsx     ← sidebar question list with filters
      InterviewRoom.jsx    ← main interview room orchestrator
      SpeechButton.jsx     ← mic toggle with pulse animation
      TranscriptPane.jsx   ← live scrolling transcript
      FeedbackCard.jsx     ← per-answer score + strengths + improvements
      ReportTimeline.jsx   ← vertical timeline of all answers
      ScoreChart.jsx       ← Recharts bar + radar charts
    hooks/
      useSpeechRecognition.js  ← wraps Web Speech API
      useTTS.js                ← wraps SpeechSynthesis
      useInterview.js          ← central session state + localStorage persistence
    utils/
      api.js        ← axios instance + all API call functions
      delivery.js   ← filler word detection + WPM calculation
      storage.js    ← localStorage helpers (session, resume, reports)
    App.jsx
    main.jsx
    index.css
  .env              ← VITE_API_URL=http://localhost:8000
  vite.config.js
  tailwind.config.js
  postcss.config.js
  package.json
  index.html
```

---

### Design & Theme (match interviewsby.ai style)

- **Background**: `#09090f` (near-black)
- **Surface**: `#111118`
- **Card**: `#16161f`
- **Border**: `#1e1e2e`
- **Accent**: `#22c55e` (green)
- **Muted text**: `#6b7280`
- **Font display**: `Bricolage Grotesque` (Google Fonts)
- **Font body**: `DM Sans` (Google Fonts)
- **Font mono**: `JetBrains Mono`
- Dark minimal aesthetic: clean cards, subtle borders, green accents
- Load fonts via Google Fonts in `index.html`
- Add noise texture overlay using inline SVG data-URI on `body::before`
- Add background gradient orbs (blurred, low opacity)

---

### Tailwind Config

Extend with custom colors: `bg`, `surface`, `card`, `border`, `accent`, `accent-dim`, `muted`, `subtle`.
Add custom fonts: `display`, `sans`, `mono`.
Add custom animations: `fade-up`, `pulse-green`, `blink`, `wave` (for waveform bars), `ping-slow` (for recording ring).

---

### Component Specs

#### `ResumeDropzone.jsx`
- Drag & drop area
- Accepts PDF, DOC, DOCX up to 10MB
- Shows file name + size when file selected
- Shows green "Ready to upload" badge
- `onFile(file)` prop callback

#### `AnalysisCard.jsx`
- Expandable card with chevron toggle
- Props: `title`, `content`, `type` (feedback/sample/tip/warning), `loading`
- Each type has distinct icon, ring color, badge color
- Loading state shows animated skeleton lines

#### `QuestionBank.jsx`
- Category filter tabs at top
- Scrollable list of questions
- Active question highlighted with accent border
- Answered questions show green dot indicator
- Difficulty badge (easy=green, medium=yellow, hard=red)
- Props: `questions`, `currentIndex`, `answeredIds`, `onSelect`

#### `SpeechButton.jsx`
- Large circular button (56px)
- Green when idle, red when recording
- Two animated pulse rings when recording (`recording-ring` animation)
- Mic SVG icon when idle, stop square when recording
- Props: `isListening`, `onToggle`, `disabled`

#### `TranscriptPane.jsx`
- Dark scrollable text area (min-h 140px, max-h 320px)
- Shows final transcript in white, interim in muted italic
- Blinking cursor when listening
- Red REC badge top-right when isListening
- Auto-scrolls to bottom on new text
- Props: `transcript`, `interimTranscript`, `isListening`, `placeholder`

#### `FeedbackCard.jsx`
- Loading: animated skeleton
- No feedback: placeholder message
- With feedback: circular SVG score gauge, strengths list, improvements list, sample answer
- Score color: green ≥80, yellow ≥55, red otherwise
- Props: `feedback` `{ score, strengths, improvements, sampleAnswer }`, `loading`

#### `ReportTimeline.jsx`
- Vertical timeline with absolute left line
- Colored dot per answer (green/yellow/red by score)
- Each entry: card with question text, score badge, transcript preview, duration
- Props: `answers[]`

#### `ScoreChart.jsx`
- Two modes: `bar` (BarChart) and `radar` (RadarChart)
- All Recharts styling matches dark theme: bg `#16161f`, border `#1e1e2e`, rounded tooltip
- Bar colors: green/yellow/red by score
- Radar shows: Clarity, Relevance, Confidence, Structure, Delivery
- Props: `answers[]`, `type`

#### `InterviewRoom.jsx`
- Left sidebar: QuestionBank (hidden on mobile, slide-in with toggle)
- Main area: top bar (progress), question text, interaction area
- 4 phases: `question` → `recording` → `reviewing` → `feedback`
- question phase: reads question aloud with TTS, shows TranscriptPane + SpeechButton
- recording phase: live transcript, timer in header
- reviewing phase: full transcript + WPM stat + filler word count + Re-record / Submit buttons
- feedback phase: FeedbackCard + Try Again / Next Question buttons
- Props: `session` (useInterview return), `onFinish`

---

### Hooks

#### `useSpeechRecognition.js`
- Wraps `window.SpeechRecognition || window.webkitSpeechRecognition`
- Options: `lang` (default `en-US`), `continuous` (default `true`)
- Returns: `transcript`, `interimTranscript`, `fullTranscript`, `isListening`, `isSupported`, `error`, `start()`, `stop()`, `reset()`
- Keeps `finalRef` for accumulating final results across multiple `onresult` events

#### `useTTS.js`
- Wraps `window.speechSynthesis`
- Options: `rate`, `pitch`, `volume`, `lang`
- Auto-selects a Google en-US voice if available
- Returns: `speak(text)`, `cancel()`, `pause()`, `resume()`, `isSpeaking`, `isPaused`, `isSupported`

#### `useInterview.js`
- Central state: `sessionId`, `jobTitle`, `jobDescription`, `resumeId`, `questions[]`, `currentIndex`, `answers[]`, `status`, `startedAt`, `endedAt`
- Persists to localStorage on every state change
- Built-in countdown timer (elapsed seconds) with `startTimer()`, `stopTimer()`, `resetTimer()`
- Methods: `initSession(payload)`, `setQuestions(questions)`, `submitAnswer(transcript, duration)`, `setFeedback(questionId, feedback)`, `nextQuestion()`, `prevQuestion()`, `finishSession()`, `resetSession()`
- Derived: `currentQuestion`, `isLastQuestion`

---

### Utils

#### `api.js`
- Axios instance with `VITE_API_URL` base URL
- Functions: `uploadResume(file)`, `analyzeResume(resumeId)`, `generateQuestions(payload)`, `getQuestions(sessionId)`, `startSession(payload)`, `submitAnswer(payload)`, `getFeedback(answerId)`, `getReport(sessionId)`, `getAllReports()`

#### `delivery.js`
- `detectFillers(text)` → `{ word, count, indices }[]` — detects: um, uh, like, you know, basically, literally, sort of, kind of, i mean, right, so, well, actually, honestly, obviously, clearly
- `calcWPM(text, durationSeconds)` → number
- `rateWPM(wpm)` → `{ label, status: 'slow'|'good'|'fast' }` (good = 100–160 WPM)
- `deliveryScore(text, durationSeconds)` → 0–100 composite score

#### `storage.js`
- Prefix all keys with `ai_interview_`
- `storage.get/set/remove/clear`
- Typed helpers: `session.get/set/clear`, `resume.get/set/clear`, `reports.getAll/add/clear`
- `reports.add()` prepends and keeps last 20 reports

---

### Pages

#### `Home.jsx`
- Dark landing page matching interviewsby.ai aesthetic
- Nav: logo + "My Progress" link + "Start Free →" CTA button
- Hero: badge pill → H1 with green "job interview" → subtext → two CTA buttons → "no signup" note
- Quick-start role buttons: Software Engineer, Product Manager, Business Analyst, Data Analyst, Marketing Specialist, UX Designer, Customer Success, Sales
- How it works: 3 cards (Upload, Practice, Get Feedback) with emoji icons
- Testimonials: 3 cards with avatar initials
- Final CTA section
- Footer

#### `Upload.jsx`
- Step progress bar at top (3 steps)
- Job title input with quick-pick role buttons
- Tab switcher: "Job Description" | "Resume (optional)"
- Job description: `<textarea>` with 7 rows
- Resume tab: `<ResumeDropzone />`
- "Generate Questions & Start →" button (disabled until something is entered)
- Loading spinner state during question generation

#### `Interview.jsx`
- Loads session from localStorage, redirects to `/upload` if none found
- Injects 5 demo questions if no questions exist (these get replaced by real API in production)
- Header with session title + "End Interview" button
- Full-height `<InterviewRoom />` component
- Loading screen while initializing

#### `Report.jsx`
- Header with "My Progress" and "Practice Again" buttons
- Large centered score display with score ring
- Duration + question count meta
- Bar/Radar chart toggle
- `<ReportTimeline />` for answer review
- "What's next?" tip card
- Auto-saves session to localStorage on mount

#### `Progress.jsx`
- Summary stat cards: Sessions, Avg Score, Questions Answered, Best Score
- Session history list with mini progress bar per entry
- Empty state with CTA
- "Clear all history" button

---

### Routing (App.jsx)

```
/ → Home
/upload → Upload
/interview → Interview
/report → Report
/progress → Progress
```

---

### index.css

- Tailwind base/components/utilities
- Scrollbar styling (thin, dark)
- Green text `::selection`
- `.btn-primary`, `.btn-secondary`, `.card`, `.input`, `.badge`, `.section-label` utility classes
- `body::before` noise texture with inline SVG data-URI
- `.orb` class for background gradient orbs
- `recording-ring` keyframe animation
- `wave-bar` keyframe animation (for waveform icon)
- `.stagger` class for children animation delays

---

### Environment

`.env`:
```
VITE_API_URL=http://localhost:8000
```

Only one env variable. All API calls go through `src/utils/api.js`.

---

### Notes for Cursor

- Use `import React from 'react'` explicitly in every file
- No TypeScript — plain `.jsx` and `.js`
- No UI component libraries (shadcn, MUI, etc.) — only Tailwind
- All SVG icons inline — no icon library imports
- The backend/API is not part of this task — stub all API calls with `setTimeout` mock data
- Demo questions are hardcoded in `Interview.jsx` — they simulate what the API would return
- Feedback is mocked with `setTimeout(1500)` + random score in `InterviewRoom.jsx`
- The app must work fully offline with zero API calls (all mocked)

---

After generating all files, run:
```bash
cd frontend
npm install
npm run dev
```

The app should open at `http://localhost:3000` with a fully working interview practice flow.
