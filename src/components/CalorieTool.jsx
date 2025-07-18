import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function CalorieTool({ onResult, resetTrigger }) {
  // State variables
  const bottomRef = useRef(null);
  const [ingredients, setIngredients] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    setIngredients("");
    setResult("");
    setSubmittedPrompt("");
    setHistory([]);
    setHasSubmitted(false);
  }, [resetTrigger]);

  // Typewriter animation function
  const typeText = (text) => {
    setResult(""); // Clear before animation
    let i = 0;
    let displayedText = "";

    const typeNext = () => {
      if (i < text.length) {
        displayedText += text[i];
        setResult(displayedText);
        i++;
        setTimeout(typeNext, 20);
      } else {
        // Typing done, store result into history
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].response = displayedText;
          return updated;
        });
        setLoading(false);
      }
    };

    typeNext();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    const newPrompt = ingredients.trim();
    setIngredients("");
    setSubmittedPrompt(newPrompt);
    setLoading(true);
    setHasSubmitted(true);
    onResult();

    setHistory((prev) => [...prev, { prompt: newPrompt, response: "" }]);

    const prompt = `Estimate the calorie breakdown for the following meal or ingredients. Be concise and list estimated calories per item:
\n${ingredients}`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const model = import.meta.env.VITE_GEMINI_MODEL;
    const apiUrl = `${
      import.meta.env.VITE_GEMINI_API_URL
    }/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();
      console.log(data);
      const calories = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log(calories);
      if (calories) {
        typeText(calories);
      } else {
        setResult("No result returned.");
      }
    } catch (error) {
      setResult("Error during calorie estimation.");
    } finally {
      setLoading(false);
      setIngredients(""); // Clear input after typing
    }
  };

  // **General Estimate:**
  // - **Lean Fish (e.g., cod, tilapia):** 100–150 cal / 4 oz
  // - **Fatty Fish (e.g., salmon):** 200–300+ cal / 4 oz

  // **Examples:**
  // - **Cod (baked):** ~110 cal
  // - **Salmon (grilled):** ~250 cal
  // - **Fried Fish:** ~300+ cal

  // - **Lean Fish (e.g., cod, tilapia):** 100–150 cal / 4 oz
  // - **Fatty Fish (e.g., salmon):** 200–300+ cal / 4 oz

  // **Examples:**
  // - **Cod (baked):** ~110 cal
  // - **Salmon (grilled):** ~250 cal
  // - **Fried Fish:** ~300+ cal

  // - **Lean Fish (e.g., cod, tilapia):** 100–150 cal / 4 oz
  // - **Fatty Fish (e.g., salmon):** 200–300+ cal / 4 oz

  // **Examples:**
  // - **Cod (baked):** ~110 cal
  // - **Salmon (grilled):** ~250 cal
  // - **Fried Fish:** ~300+ cal

  // Let me know what type of fish and how it's prepared for more accuracy.`;

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${
        hasSubmitted ? "h-[85vh]" : ""
      }`}
    >
      {/* Scrollable conversation history */}
      <div className="flex-1 overflow-y-auto max-h-[calc(85vh-150px)] space-y-4 p-4">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-100  p-3 rounded-lg"
          >
            <p className="font-semibold text-blue-700 dark:text-blue-400">
              You: {entry.prompt}
            </p>
            <div className="mt-2 whitespace-pre-line">
              <ReactMarkdown>
                {idx === history.length - 1 && !entry.response
                  ? result
                  : entry.response}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Fixed input at bottom */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white p-4 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
      >
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md resize-none dark:border-gray-600 dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
          rows={3}
          placeholder="Enter your ingredients..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Generating..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
