"use client";
import { useState } from 'react';
import { parseSurveyDoc } from './actions';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setFeedback("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Convert the uploaded .docx into raw text
      const { text, error: parseError } = await parseSurveyDoc(formData);
      
      if (parseError) {
        throw new Error("Could not read the .docx file. Please check the file format.");
      }

      // 2. Send the text to our Gemini API route
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ surveyText: text }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gemini API failed to respond. Check your API Key.");
      }

      // 3. Display the AI analysis
      setFeedback(data.feedback);
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Sight Screen AI</h1>
          <p className="text-lg text-gray-600">Upload your questionnaire for instant design feedback.</p>
        </header>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex flex-col items-center justify-center border-4 border-dashed border-blue-100 rounded-xl p-10 hover:border-blue-300 transition-colors bg-blue-50/30">
            <label className="flex flex-col items-center cursor-pointer">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition active:scale-95">
                {loading ? "Analyzing Survey..." : "Select .docx Questionnaire"}
              </span>
              <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
            </label>
            <p className="mt-4 text-sm text-gray-500 font-medium italic">
              Ready to review Cricket Association Research flows.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex">
                <div className="flex-shrink-0">⚠️</div>
                <div className="ml-3 font-medium">{error}</div>
              </div>
            </div>
          )}

          {/* AI Feedback Results */}
          {feedback && (
            <div className="mt-10 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-6 flex items-center">
                <span className="mr-2">📝</span> AI Consultant Report
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
                <div className="prose prose-blue max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {feedback}
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-gray-400 text-sm">
          Powered by Gemini API & Sight Screen Insights
        </footer>
      </div>
    </div>
  );
}