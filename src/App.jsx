import React, { useState } from "react";
import allQuestions from "./data/questions.json";
import "./styles.css";

function App() {
  const [questions, setQuestions] = useState(shuffle([...allQuestions]));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState(null); // "richtig", "teilweise", "falsch"
  const [showFeedback, setShowFeedback] = useState(false);
  const [wrongList, setWrongList] = useState([]);
  const [rightList, setRightList] = useState([]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    const userAnswer = userInput.toLowerCase().trim();
    const expected = currentQuestion.answer.toLowerCase();

    const isExact = expected === userAnswer;
    const isPartial = userAnswer.length > 4 && expected.includesAny(userAnswer);

    if (isExact) {
      setStatus("richtig");
      setRightList([...rightList, currentQuestion]);
    } else if (isPartial) {
      setStatus("teilweise");
      setWrongList([...wrongList, { ...currentQuestion, userText: userInput }]);
    } else {
      setStatus("falsch");
      setWrongList([...wrongList, { ...currentQuestion, userText: userInput }]);
    }

    setShowFeedback(true);
  };

  const handleNext = () => {
  let updatedList = [...questions];

  if (status !== "richtig") {
    const insertOffset = Math.floor(Math.random() * 4) + 3; // 3–6 Fragen weiter hinten
    const insertPos = Math.min(currentIndex + insertOffset, questions.length);
    updatedList.splice(insertPos, 0, currentQuestion);
  }

  setQuestions(updatedList);
  setCurrentIndex((prev) => prev + 1);
  setUserInput("");
  setStatus(null);
  setShowFeedback(false);
};


  const finishQuiz = () => {
    saveResultsToFile("questions_wrong.json", wrongList);
    saveResultsToFile("questions_right.json", rightList);
    alert("Quiz abgeschlossen!");
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">🤖 Robotik Quiz (Freitext-Modus)</h1>

      {currentIndex < questions.length ? (
        <div className="space-y-4">
          <p className="text-lg font-medium">
            {currentIndex + 1}. {currentQuestion.text}
          </p>

          <textarea
            rows={4}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={showFeedback}
            placeholder="Deine Antwort eingeben..."
            className="w-full border px-3 py-2 rounded"
          />

          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Antwort absenden
            </button>
          ) : (
            <div className="space-y-2">
              {status === "richtig" && <p className="text-green-600">✅ Richtig!</p>}
              {status === "teilweise" && <p className="text-yellow-600">🟡 Teilweise korrekt. Richtige Antwort: {currentQuestion.answer}</p>}
              {status === "falsch" && <p className="text-red-600">❌ Falsch. Richtige Antwort: {currentQuestion.answer}</p>}

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
  const words = input.split(/\W+/).filter((w) => w.length > 4);
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
