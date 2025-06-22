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
    localStorage.setItem("quiz_fehler", JSON.stringify(getWrongAnswers()));
  };

  const getWrongAnswers = () =>
    questionsData.filter((q) => answers[q.id] !== q.correct.toString());

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1>Roboter-Quiz</h1>
      {questionsData.map((q) => (
        <div key={q.id}>
          <p>{q.text}</p>
          <label>
            <input type="radio" name={q.id} value="true" onChange={() => handleAnswer(q.id, "true")} /> Richtig
          </label>
          <label>
            <input type="radio" name={q.id} value="false" onChange={() => handleAnswer(q.id, "false")} /> Falsch
          </label>
          {submitted && (
            <div>
              {answers[q.id] === q.correct.toString()
                ? "✅ Richtig"
                : `❌ Falsch – ${q.explanation}`}
            </div>
          )}
        </div>
      ))}
      {!submitted ? (
        <button onClick={handleSubmit}>Auswerten</button>
      ) : (
        <button onClick={handleRetry}>Neuer Versuch</button>
      )}
    </div>
  );
}

export default App;
