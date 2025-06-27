import { useState } from "react";
import PRDCreator from "../components/prdcreator";

export default function Home({ isAuthenticated }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        setPassword("");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      // Clear the authentication cookie
      document.cookie =
        "prd-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setAuthenticated(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-white/50 p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              PRD Creator Access
            </h1>
            <p className="text-gray-600">
              Enter password to access the company PRD creator
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                placeholder="Enter password"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Access PRD Creator"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 z-50 px-3 py-1 text-sm bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-md border border-gray-200 transition-all"
      >
        Logout
      </button>
      <PRDCreator />
    </div>
  );
}

// Server-side authentication check
export async function getServerSideProps({ req }) {
  const isAuthenticated = req.cookies["prd-auth"] === "true";
  return { props: { isAuthenticated } };
}
