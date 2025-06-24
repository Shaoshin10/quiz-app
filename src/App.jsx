// App.jsx – Einzelabfrage-Modus mit Feedback und Wiederholung falscher Fragen

import React, { useEffect, useState } from "react";
import allQuestions from "./data/questions.json";
import "./styles.css";

function App() {
  const [questions, setQuestions] = useState(shuffle([...allQuestions]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState(null); // "richtig", "falsch", "teilweise"
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrongList, setWrongList] = useState([]);
  const [rightList, setRightList] = useState([]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    const correct = currentQuestion.correct;
    const explanation = currentQuestion.explanation.toLowerCase();
    const answer = userInput.toLowerCase().trim();

    const isCorrect = (correct && answer === "richtig") || (!correct && answer === "falsch");
    const isPartial = !isCorrect && answer.length > 4 && explanation.includesAny(answer);

    if (isCorrect) {
      setStatus("richtig");
      setRightList([...rightList, currentQuestion]);
    } else if (isPartial) {
      setStatus("teilweise");
      setWrongList([...wrongList, { ...currentQuestion, userText: userInput }]);
    } else {
      setStatus("falsch");
      setWrongList([...wrongList, { ...currentQuestion, userText: userInput }]);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    let nextList = [...questions];
    if (status !== "richtig") {
      const randomIndex = Math.floor(Math.random() * (questions.length - currentIndex)) + currentIndex + 1;
      nextList.splice(randomIndex, 0, currentQuestion);
    }
    setQuestions(nextList);
    setCurrentIndex((prev) => prev + 1);
    setUserInput("");
    setStatus(null);
    setShowExplanation(false);
  };

  const finishQuiz = () => {
    saveResultsToFile("question_false.json", wrongList);
    saveResultsToFile("question_right.json", rightList);
    alert("Quiz abgeschlossen!");
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">🧠 Robotik Quiz – Einzelmodus</h1>

      {currentIndex < questions.length ? (
        <div className="space-y-4">
          <p className="text-lg font-medium">
            {currentIndex + 1}. {currentQuestion.text}
          </p>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showExplanation}
            placeholder="Richtig oder Falsch (ggf. mit Erklärung)"
            className="w-full border px-3 py-2 rounded"
          />

          {!showExplanation ? (
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Antwort absenden
            </button>
          ) : (
            <div className="space-y-2">
              {status === "richtig" && <p className="text-green-600">✅ Deine Antwort ist korrekt!</p>}
              {status === "teilweise" && <p className="text-yellow-600">🟡 Teilweise richtig – {currentQuestion.explanation}</p>}
              {status === "falsch" && <p className="text-red-600">❌ Falsch – {currentQuestion.explanation}</p>}

              <button
                onClick={handleNext}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Nächste Frage
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Du hast alle Fragen beantwortet.</p>
          <button
            onClick={finishQuiz}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Ergebnisse speichern & Quiz neu starten
          </button>
        </div>
      )}
    </div>
  );
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

String.prototype.includesAny = function (input) {
  const words = input.split(/[^a-zäöüß]+/).filter((w) => w.length > 4);
  return words.some((word) => this.includes(word));
};

function saveResultsToFile(filename, data) {
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
}

export default App;
