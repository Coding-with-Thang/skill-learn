import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";

const API_ENDPOINTS = [
  { name: "Debug User", path: "/api/debug/user" },
  { name: "User Stats", path: "/api/user/stats" },
  { name: "User Performance", path: "/api/user/performance" },
  { name: "Points History", path: "/api/user/points/history" },
  { name: "Leaderboard", path: "/api/leaderboard" }
];

export default function AuthTest() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const [testResults, setTestResults] = useState(null);

  const checkAuth = async () => {
    // Don't run tests if not signed in
    if (!isSignedIn) {
      setTestResults({
        error: "Please sign in first to test the API endpoints",
        endpoints: {},
        errors: []
      });
      return;
    }

    setTestResults(null);
    const results = {
      token: null,
      endpoints: {},
      errors: [],
    };

    try {
      // Get token
      const token = await getToken();
      results.token = token ? "Token received" : "No token";
      console.log("Auth Token:", token);

      // Test all endpoints
      for (const endpoint of API_ENDPOINTS) {
        try {
          console.log(`Checking ${endpoint.name}...`);
          const response = await fetch(endpoint.path);
          const data = await response.json();

          results.endpoints[endpoint.name] = {
            status: response.status,
            data: data
          };

          if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
          }

          console.log(`${endpoint.name} Response:`, data);
        } catch (error) {
          console.error(`${endpoint.name} error:`, error);
          results.errors.push(`${endpoint.name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("General error:", error);
      results.errors.push(`General: ${error.message}`);
    }

    setTestResults(results);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 m-4 border rounded">
      <h2 className="text-lg font-bold mb-4">API Endpoints Test</h2>
      <div className="bg-gray-800 p-4 rounded text-sm mb-4">
        <h3 className="text-white mb-2">Auth Status:</h3>
        <pre className="text-green-400">
          {JSON.stringify(
            {
              isLoaded,
              isSignedIn,
              userId,
              sessionId,
              userEmail: user?.emailAddresses?.[0]?.emailAddress,
            },
            null,
            2
          )}
        </pre>
      </div>
      {testResults && (
        <div className="mt-4">
          {testResults.error ? (
            <div className="text-red-500 mb-4">{testResults.error}</div>
          ) : (
            <>
              <h3 className="font-bold mb-2">Test Results:</h3>
              <div className="space-y-4">
                {Object.entries(testResults.endpoints).map(([name, result]) => (
                  <div key={name} className="border rounded p-2">
                    <h4 className="font-semibold">{name}</h4>
                    <div className={`text-sm ${result.status === 200 ? 'text-green-500' : 'text-red-500'}`}>
                      Status: {result.status}
                    </div>
                    <pre className="bg-gray-800 p-2 rounded text-xs mt-1">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
              {testResults.errors.length > 0 && (
                <div className="mt-4 text-red-500">
                  <strong>Errors:</strong>
                  <ul className="list-disc pl-5">
                    {testResults.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <button
        onClick={checkAuth}
        className={`mt-4 px-4 py-2 rounded ${isSignedIn
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        disabled={!isSignedIn}
      >
        Test All Endpoints
      </button>
    </div>
  );
} 