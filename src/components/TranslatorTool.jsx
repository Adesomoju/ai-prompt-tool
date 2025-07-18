import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function TranslatorTool({ onResult, resetTrigger }) {
  const [inputText, setInputText] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    setInputText("");
    setResult("");
    setHistory([]);
    setHasSubmitted(false);
  }, [resetTrigger]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const typeText = (text, detectedLang) => {
    setResult("");
    let i = 0;
    let displayed = "";

    const typeNext = () => {
      if (i < text.length) {
        displayed += text[i];
        setResult(displayed);
        i++;
        setTimeout(typeNext, 20);
      } else {
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].response = displayed;
          updated[updated.length - 1].language = detectedLang;
          return updated;
        });
        setLoading(false);
      }
    };

    typeNext();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newPrompt = inputText.trim();
    setInputText("");
    setResult("");
    setLoading(true);
    setHasSubmitted(true);
    if (onResult) onResult();

    setHistory((prev) => [
      ...prev,
      { prompt: newPrompt, response: "", language: "" },
    ]);

    const prompt = `
Detect the language of this text and translate it into English.
Return only the following format:

Language: <Detected Language>
Translation:
<Translated Text>

Text:
${newPrompt}`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const model = import.meta.env.VITE_GEMINI_MODEL;
    const apiUrl = `${
      import.meta.env.VITE_GEMINI_API_URL
    }/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (rawText) {
        const match = rawText.match(
          /Language:\s*(.+)\n+Translation:\s*([\s\S]*)/i
        );
        const detectedLang = match?.[1]?.trim() || "Unknown";
        const translation = match?.[2]?.trim() || "No translation available.";
        typeText(translation, detectedLang);
      } else {
        setResult("No translation returned.");
        setLoading(false);
      }
    } catch (err) {
      setResult("Error occurred during translation.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${
        hasSubmitted ? "h-[85vh]" : ""
      }`}
    >
      {/* Scrollable conversation history */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)] space-y-4 p-4">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className="bg-gray-100 p-3 rounded-lg dark:bg-gray-800 text-black dark:text-gray-100"
          >
            <p className="font-semibold text-blue-700 dark:text-blue-400">
              You: {entry.prompt}
            </p>
            {entry.language && (
              <p className="text-sm text-gray-500 mt-1 italic">
                Detected Language: {entry.language}
              </p>
            )}
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

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white p-4 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
      >
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md resize-none dark:border-gray-600 dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
          rows={3}
          placeholder="Paste or type in any language..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Translating..." : "Translate to English"}
        </button>
      </form>
    </div>
  );
}
