// App.jsx – erweitert für Speicherung in question_false.json & question_right.json

import React, { useEffect, useState } from "react";
import questionsData from "./data/questions.json";

function App() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const wrong = getWrongAnswers();
    const right = getCorrectAnswers();
    saveResultsToFile("question_false.json", wrong);
    saveResultsToFile("question_right.json", right);
  };

  const handleRetry = () => {
    const confirmClear = window.confirm("Willst du den Lernstand (richtig/falsch) wirklich löschen?");
    if (confirmClear) {
      localStorage.removeItem("quiz_fehler");
      downloadFile("question_false.json", "[]");
      downloadFile("question_right.json", "[]");
      window.location.reload();
    }
  };

  const getWrongAnswers = () =>
    questionsData.filter((q) => answers[q.id] !== q.correct.toString());

  const getCorrectAnswers = () =>
    questionsData.filter((q) => answers[q.id] === q.correct.toString());

  const saveResultsToFile = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const correctCount = questionsData.filter(
    (q) => answers[q.id] === q.correct.toString()
  ).length;

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">🤖 Intelligente Robotik – Quiz</h1>

      {questionsData.map((q) => (
        <div key={q.id} className="mb-6 border-b pb-4">
          <p className="font-medium">{q.text}</p>
          <div className="space-x-4 mt-2">
            <label>
              <input
                type="radio"
                name={`q${q.id}`}
                value="true"
                disabled={submitted}
                checked={answers[q.id] === "true"}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
              />
              Richtig
            </label>
            <label>
              <input
                type="radio"
                name={`q${q.id}`}
                value="false"
                disabled={submitted}
                checked={answers[q.id] === "false"}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
              />
              Falsch
            </label>
          </div>
          {submitted && (
            <div className="mt-2 text-sm">
              {answers[q.id] === q.correct.toString() ? (
                <span className="text-green-600">✅ Richtig</span>
              ) : (
                <span className="text-red-600">
                  ❌ Falsch – {q.explanation}
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Auswerten
        </button>
      ) : (
        <div className="mt-4">
          <p>
            Du hast <strong>{correctCount}</strong> von <strong>{questionsData.length}</strong> richtig beantwortet.
          </p>
          <button
            onClick={handleRetry}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            Neuer Versuch
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
