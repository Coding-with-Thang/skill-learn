"use client";
import { useState, useEffect } from "react";

export default function TestPage() {
  const [testResponse, setTestResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test with native fetch first
        console.log("Testing /api/test endpoint with fetch...");
        const testResult = await fetch("/api/test");
        const testData = await testResult.json();
        console.log("Test response:", testData);
        setTestResponse(testData);

        // Test auth endpoint
        try {
          console.log("Testing auth token with fetch...");
          const authResult = await fetch("/api/auth/getToken");
          const authData = await authResult.json();
          console.log("Auth response:", authData);
        } catch (authError) {
          console.error("Auth test failed:", authError);
        }

      } catch (error) {
        console.error("API test failed:", error);
        setError(error.message || "API test failed");
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

      {loading && (
        <div className="text-gray-600">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h2 className="text-red-800 font-semibold">Error:</h2>
          <pre className="text-red-600 mt-2 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {testResponse && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h2 className="text-green-800 font-semibold">Test Response:</h2>
          <pre className="text-green-600 mt-2 whitespace-pre-wrap">
            {JSON.stringify(testResponse, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Debug Information:</h2>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h3 className="font-semibold">Current Environment:</h3>
          <pre className="mt-2 text-sm">
            {JSON.stringify({
              currentUrl: typeof window !== 'undefined' ? window.location.href : '',
              nodeEnv: process.env.NODE_ENV,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 