// update_questions.js – ersetzt automatisch questions.json per GitHub API

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// 🔐 DEINE KONFIGURATION
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'quiz-app';
const OWNER = 'Shaoshin10';
const FILE_PATH = 'src/data/questions.json';
const BRANCH = 'master';

// 1. Lade lokale falsche Antworten (simuliert hier als Liste)
const wrongAnswers = [
  {
    id: 999,
    text: "Ein RGB-Sensor liefert Tiefeninformationen.",
    correct: false,
    explanation: "RGB-Sensoren liefern nur Farbinformationen, keine Tiefeninformationen."
  }
];

// 2. Neue Beispiel-Fragen
const newQuestions = [
  {
    id: 1,
    text: "SLAM steht für Simultaneous Localization and Mapping.",
    correct: true,
    explanation: "Bei SLAM wird gleichzeitig eine Karte erstellt und der Standort geschätzt."
  },
  {
    id: 2,
    text: "Ein Roboter mit sechs Freiheitsgraden kann sich nur drehen.",
    correct: false,
    explanation: "Er kann sich drehen und bewegen – Translation + Rotation."
  }
];

// 3. Fragen mischen (falsche + neue)
const updatedQuestions = [...wrongAnswers, ...newQuestions];
const updatedContent = JSON.stringify(updatedQuestions, null, 2);

// 4. GitHub API: SHA der aktuellen Datei holen
async function getCurrentFileSHA() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  const data = await res.json();
  return data.sha;
}

// 5. GitHub API: Datei ersetzen
async function updateFile() {
  const sha = await getCurrentFileSHA();
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  const body = {
    message: "🔁 Update questions.json automatisch",
    content: Buffer.from(updatedContent).toString('base64'),
    sha: sha,
    branch: BRANCH
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    },
    body: JSON.stringify(body)
  });

  const result = await res.json();
  console.log("✅ Datei aktualisiert:", result.content.path);
}

updateFile().catch(err => console.error("❌ Fehler:", err));
