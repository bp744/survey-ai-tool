'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface AnalysisSuggestion {
  templateSuggestion: string;
  questionImprovement: string | null;
  optionImprovements: string[] | null;
  logicFeedback?: string | null;
  reasoning: string;
  originalQuestion: string;
  originalOptions: string[];
  questionId?: string;
  questionType?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisSuggestion[]>([]);
  const [error, setError] = useState<string>('');
  const [questionCount, setQuestionCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.docx')) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a .docx file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to analyze document');
        setLoading(false);
        return;
      }

      setQuestionCount(data.questionCount);
      setResults(data.analysis);
    } catch (err) {
      setError('An error occurred while analyzing the document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Survey Question Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your survey document to get AI-powered suggestions for better
            questions and templates
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drag and drop your document here
            </h3>
            <p className="text-gray-600 mb-4">or click to select a file</p>
            <p className="text-sm text-gray-500">Supported format: .docx</p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".docx"
              className="hidden"
            />
          </div>

          {file && (
            <div className="mt-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setResults([]);
                  setQuestionCount(0);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Change
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-3 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Analyzing Document...
                </>
              ) : (
                'Analyze Document'
              )}
            </button>
          )}
        </div>

        {/* Results Section */}
        {questionCount > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Analysis Results
              </h2>
              <p className="text-gray-600">
                Found {questionCount} question(s) in your document. Showing
                analysis for the first {results.length}.
              </p>
            </div>

            <div className="space-y-8">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors"
                >
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Question {index + 1}
                      {result.questionId && (
                        <span className="text-sm text-gray-600 font-normal ml-3">
                          ({result.questionId})
                        </span>
                      )}
                    </h3>

                    {result.questionType && (
                      <div className="mb-3 inline-block bg-purple-100 px-3 py-1 rounded-full">
                        <p className="text-sm text-purple-700 font-medium">
                          Type: {result.questionType}
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 font-medium mb-2">
                        Original Question:
                      </p>
                      <p className="text-gray-900">{result.originalQuestion}</p>

                      {result.originalOptions.length > 0 && (
                        <div className="mt-3 ml-4">
                          <p className="text-sm text-gray-600 font-medium mb-2">
                            Options:
                          </p>
                          <ul className="space-y-1">
                            {result.originalOptions.map((option, i) => (
                              <li
                                key={i}
                                className="text-gray-700 text-sm list-disc list-inside"
                              >
                                {option}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Template Suggestion */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Suggested Template
                        </h4>
                        <p className="text-indigo-600 font-medium text-lg">
                          {result.templateSuggestion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Question Improvement */}
                  {result.questionImprovement &&
                    result.questionImprovement !== 'No improvement needed.' && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Question Improvement
                        </h4>
                        <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                          <p className="text-gray-700">
                            <span className="font-medium">Suggested: </span>
                            {result.questionImprovement}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Option Improvements */}
                  {result.optionImprovements &&
                    result.optionImprovements.length > 0 &&
                    !result.optionImprovements.every((opt) =>
                      opt.includes('No improvements needed')
                    ) && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Option Improvements
                        </h4>
                        <div className="space-y-2">
                          {result.optionImprovements.map((option, i) => (
                            <div
                              key={i}
                              className="bg-green-50 p-3 rounded border-l-4 border-green-400"
                            >
                              <p className="text-gray-700 text-sm">
                                {option}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Logic Feedback */}
                  {result.logicFeedback &&
                    result.logicFeedback !== 'No improvements needed.' && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Skip/Disqualify Logic Feedback
                        </h4>
                        <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-400">
                          <p className="text-gray-700">
                            {result.logicFeedback}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Reasoning */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Reasoning
                    </h4>
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-gray-700 text-sm">
                        {result.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
