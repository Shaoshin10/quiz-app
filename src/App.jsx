// App.jsx – gleiche Logik, aber visuell als Tabelle gestaltet

import React, { useEffect, useState } from "react";
import questionsData from "./data/questions.json";
import "./styles.css";

function App() {
  const [answers, setAnswers] = useState({});
  const [explanations, setExplanations] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleTextChange = (id, value) => {
    setExplanations({ ...explanations, [id]: value });
  };

  const includesKeyConcept = (userText, explanation) => {
    if (!userText) return false;
    const keywords = explanation.toLowerCase().split(/[^a-zäöüß]+/).filter(k => k.length > 4);
    return keywords.some(word => userText.toLowerCase().includes(word));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const wrong = [];
    const right = [];

    questionsData.forEach(q => {
      const userAns = answers[q.id];
      const userText = explanations[q.id] || "";

      if (userAns === q.correct.toString()) {
        right.push(q);
      } else {
        if (userAns === "false" && q.correct === true && includesKeyConcept(userText, q.explanation)) {
          q.note = "Teilweise richtig (Erklärung akzeptabel)";
        }
        wrong.push({ ...q, userText });
      }
    });

    saveResultsToFile("question_false.json", wrong);
    saveResultsToFile("question_right.json", right);
  };

  const handleRetry = () => {
    const confirmClear = window.confirm("Willst du den Lernstand (richtig/falsch) wirklich löschen?");
    if (confirmClear) {
      downloadFile("question_false.json", "[]");
      downloadFile("question_right.json", "[]");
      window.location.reload();
    }
  };

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
    <div className="p-4 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">🤖 Intelligente Robotik – Quiz</h1>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nr.</th>
            <th className="border p-2 text-left">Aussage</th>
            <th className="border p-2 text-center">Antwort</th>
            <th className="border p-2 text-center">Erklärung (falls falsch)</th>
            <th className="border p-2 text-center">Auswertung</th>
          </tr>
        </thead>
        <tbody>
          {questionsData.map((q, index) => {
            const userAnswer = answers[q.id];
            const userText = explanations[q.id] || "";
            const isCorrect = userAnswer === q.correct.toString();
            const isPartial = !isCorrect && includesKeyConcept(userText, q.explanation);

            return (
              <tr key={q.id} className="align-top">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2 w-1/3">{q.text}</td>
                <td className="border p-2 text-center">
                  <label>
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value="true"
                      disabled={submitted}
                      checked={userAnswer === "true"}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                    /> Richtig
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value="false"
                      disabled={submitted}
                      checked={userAnswer === "false"}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                    /> Falsch
                  </label>
                </td>
                <td className="border p-2">
                  {!submitted && userAnswer === "false" && (
                    <textarea
                      rows="2"
                      className="w-full border px-2 py-1"
                      placeholder="Wie wäre es richtig formuliert?"
                      value={explanations[q.id] || ""}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                    ></textarea>
                  )}
                  {submitted && !isCorrect && (
                    <p className="text-sm italic">{userText}</p>
                  )}
                </td>
                <td className="border p-2 text-sm">
                  {submitted && (
                    isCorrect ? (
                      <span className="text-green-600">✅ Richtig</span>
                    ) : isPartial ? (
                      <span className="text-yellow-600">🟡 Teilweise richtig – {q.explanation}</span>
                    ) : (
                      <span className="text-red-600">❌ Falsch – {q.explanation}</span>
                    )
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded"
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
              className="mt-2 bg-green-600 text-white px-6 py-2 rounded"
            >
              Neuer Versuch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
