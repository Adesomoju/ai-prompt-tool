import { useState, useEffect } from "react";
import CalorieTool from "./components/CalorieTool";
import TranslatorTool from "./components/TranslatorTool";
import PdfSummarizerTool from "./components/PdfSummarizerTool";
import { FaUtensils, FaLanguage, FaFilePdf } from "react-icons/fa";

const tabs = [
  { label: "Calorie Info", icon: <FaUtensils className="inline-block mr-2" /> },
  { label: "Translation", icon: <FaLanguage className="inline-block mr-2" /> },
  { label: "PDF Summary", icon: <FaFilePdf className="inline-block mr-2" /> },
];

function App() {
  const [activeTab, setActiveTab] = useState("Calorie Info");
  const [hasResult, setHasResult] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "auto";
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Calorie Info":
        return (
          <CalorieTool
            onResult={() => setHasResult(true)}
            resetTrigger={resetTrigger}
          />
        );
      case "Translation":
        return (
          <TranslatorTool
            onResult={() => setHasResult(true)}
            resetTrigger={resetTrigger}
          />
        );
      case "PDF Summary":
        return (
          <PdfSummarizerTool
            onResult={() => setHasResult(true)}
            resetTrigger={resetTrigger}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-500">
      {/* Mobile Header with Toggle Button */}
      <header className="md:hidden flex items-center justify-between p-4 shadow bg-white dark:bg-gray-800 z-40 relative">
        <h1 className="text-xl font-bold">AI Tools</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-2xl"
        >
          {sidebarOpen ? "✖️" : "☰"}
        </button>
      </header>

      <aside
        className={`fixed md:relative top-0 left-0 z-40 h-full w-64 bg-gray-100 dark:bg-gray-900 p-4 transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Header with hamburger on mobile */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">AI Tools</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-xl md:hidden"
            aria-label="Close sidebar"
          >
            ✖️
          </button>
        </div>
        <nav>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`w-full flex text-sm items-center gap-2 px-4 py-2 rounded-md text-left transition-all
                ${
                  activeTab === tab.label
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                setResetTrigger((prev) => prev + 1);
                setHasResult(false);
              }}
              className="w-full text-sm border font-semibold border-dashed dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-200 border-gray-400 px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 transition-all"
            >
              + New Chat
            </button>
          </div>

          <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md transition"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <span className="text-lg">{darkMode ? "🌞" : "🌙"}</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-white dark:bg-gray-800 overflow-auto rounded-2xl shadow-lg p-6 m-5">
        {!hasResult && (
          <div className="max-w-3xl mx-auto p-4 animate-fade-in">
            <h1 className="text-2xl dark:text-yellow-400 font-bold mb-6 text-center">
              What can I help you with 😎
            </h1>
            <section className="mb-6">
              <p className="text-md text-gray-700 dark:text-gray-300">
                Choose a tool from the tabs below to get started. Each tool is
                designed to help you with specific tasks, whether it's tracking
                calories, translating text, or summarizing PDF documents.
              </p>
            </section>
          </div>
        )}

        <section>
          <div className="max-w-3xl mx-auto p-4">{renderContent()}</div>
        </section>
      </main>
    </div>
  );
}

export default App;
