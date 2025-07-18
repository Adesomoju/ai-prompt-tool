import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "../pdf-worker";
import * as pdfjsLib from "pdfjs-dist";

export default function PdfSummarizerTool({ onResult, resetTrigger }) {
  const [pdfText, setPdfText] = useState("");
  const [summary, setSummary] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPdfText("");
    setSummary("");
    setHistory([]);
    setHasSubmitted(false);
  }, [resetTrigger]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const extractTextFromPDF = async (file) => {
    const typedArray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let text = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      text += pageText + "\n";
    }

    return text.trim();
  };

  const typeText = (text, filename) => {
    let i = 0;
    let currentText = "";

    const typeNext = () => {
      if (i < text.length) {
        currentText += text[i];
        setSummary(currentText);
        i++;
        setTimeout(typeNext, 15);
      } else {
        setLoading(false);
        setHistory((prev) => [
          ...prev,
          { filename: filename || "Uploaded PDF", summary: currentText },
        ]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    typeNext();
  };

  // const typeText = (text) => {
  //   let i = 0;
  //   let currentText = "";
  //   const typeNext = () => {
  //     if (i < text.length) {
  //       currentText += text[i];
  //       setSummary(currentText);
  //       i++;
  //       setTimeout(typeNext, 15);
  //     } else {
  //       setLoading(false);
  //       setHistory((prev) => [
  //         ...prev,
  //         { filename: history.at(-1)?.filename || "Uploaded PDF", summary: currentText },
  //       ]);
  //     }
  //   };
  //   typeNext();
  // };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    setLoading(true);
    setPdfText("");
    setSummary("");
    setHasSubmitted(true);
    if (onResult) onResult();

    const text = await extractTextFromPDF(file);
    setPdfText(text);

    const prompt = `Please summarize the following PDF content in clear bullet points:\n\n${text.slice(
      0,
      8000
    )}...`; // Trim long PDFs

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
      const textOutput =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (textOutput) {
        setSummary("");
        typeText(textOutput, file.name);
      } else {
        setSummary("No summary returned.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setSummary("An error occurred while summarizing the PDF.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${
        hasSubmitted ? "h-[85vh]" : ""
      }`}
    >
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)] space-y-4 p-4">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className="bg-gray-100  dark:bg-gray-800 text-black dark:text-gray-100 p-3 rounded-lg"
          >
            <p className="font-semibold text-blue-700 dark:text-blue-400">
              📄 {entry.filename}
            </p>
            <div className="mt-2 whitespace-pre-line">
              <ReactMarkdown>{entry.summary}</ReactMarkdown>
            </div>
          </div>
        ))}
        {summary && !history.length && (
          <div className="bg-gray-100  dark:bg-gray-800 text-black dark:text-gray-100 p-3 rounded-lg">
            <p className="font-semibold text-blue-700 dark:text-blue-400">
              📄 Uploaded PDF
            </p>
            <div className="mt-2 whitespace-pre-line">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-white p-4 border-gray-200 dark:bg-gray-900 dark:border-gray-700 transition">
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload a PDF file:
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          disabled={loading}
          className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
          ref={fileInputRef}
        />
        {loading && (
          <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
            Summarizing...
          </p>
        )}
      </div>
    </div>
  );
}
