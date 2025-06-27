import React, { useState } from "react";
import { FileText, Copy, Download, Loader2 } from "lucide-react";

const PRDCreator = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    question6: "",
    question7: "",
    question8: "",
  });
  const [generatedPRD, setGeneratedPRD] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  // Sample examples
  const sampleExamples = [
    {
      name: "Team Dashboard",
      icon: "📊",
      data: {
        question1:
          "A real-time team collaboration dashboard that shows current work status, upcoming deadlines, and team availability",
        question2:
          "Remote team leads and project managers who struggle with visibility into who's working on what and when projects will be completed",
        question3:
          "Live status updates, team availability calendar, automated task assignments, and drag-and-drop timeline view. Success measured by 30% reduction in status meetings and 25% faster project delivery times",
        question4:
          "React frontend with Node.js backend, integrates with existing Slack and Jira APIs, real-time updates via WebSocket, PostgreSQL database",
        question5:
          "Complex user permission systems, advanced analytics/reporting, mobile app (web-responsive only), integration with non-standard project management tools",
        question6:
          "Phase 1: Core dashboard and task view (4 weeks), Phase 2: Calendar integration and notifications (3 weeks), Phase 3: Advanced filtering and automation (3 weeks)",
        question7:
          "Potential API rate limits from third-party services, user adoption challenges, data synchronization complexity with multiple tools",
        question8:
          "Must integrate seamlessly with current Slack workflows, should not require extensive user training, aligns with company goal of improving remote work efficiency",
      },
    },
    {
      name: "Shopping App",
      icon: "🛍️",
      data: {
        question1:
          "A mobile shopping app with AI-powered personalized recommendations and instant checkout",
        question2:
          "Busy professionals aged 25-45 who want to shop efficiently and discover products tailored to their style without spending hours browsing",
        question3:
          "AI style recommendations, one-tap checkout, size prediction, AR try-on feature, price tracking, and wishlist sharing. Success measured by 40% increase in average order value and 60% reduction in cart abandonment",
        question4:
          "React Native for mobile, Python/Django backend with ML recommendation engine, Stripe for payments, AWS for cloud infrastructure, Redis for caching",
        question5:
          "Web version (mobile-first only), complex loyalty programs, social media integration, international shipping (US only initially)",
        question6:
          "Phase 1: Basic shopping and checkout (6 weeks), Phase 2: AI recommendations and user profiles (4 weeks), Phase 3: AR features and advanced personalization (6 weeks)",
        question7:
          "AI model accuracy concerns, payment processing compliance, inventory management complexity, user privacy regulations",
        question8:
          "Must comply with PCI DSS standards, should leverage existing customer data responsibly, aligns with business strategy to increase digital sales and customer retention",
      },
    },
    {
      name: "Fitness Tracker",
      icon: "💪",
      data: {
        question1:
          "A fitness tracking app that combines workout planning, nutrition logging, and social motivation features",
        question2:
          "Fitness enthusiasts and beginners who want an all-in-one solution to plan workouts, track progress, and stay motivated through community support",
        question3:
          "Custom workout builder, meal tracking with barcode scanning, progress photos, community challenges, and coaching tips. Success measured by 70% user retention after 3 months and 45% improvement in workout consistency",
        question4:
          "Flutter for cross-platform mobile, Firebase for backend and real-time features, Google Fit/Apple HealthKit integration, computer vision for exercise form analysis",
        question5:
          "Personal trainer booking, advanced nutrition analysis, wearable device integration beyond basic health apps, premium subscription features",
        question6:
          "Phase 1: Workout logging and basic tracking (5 weeks), Phase 2: Nutrition features and progress tracking (4 weeks), Phase 3: Social features and community challenges (4 weeks)",
        question7:
          "Health data privacy regulations, user engagement and retention challenges, accuracy of fitness tracking algorithms, app store approval processes",
        question8:
          "Must comply with HIPAA guidelines for health data, should integrate with popular fitness ecosystems, aligns with company mission to promote healthy lifestyles through technology",
      },
    },
  ];

  const handleExampleClick = () => {
    const nextIndex = (currentExampleIndex + 1) % sampleExamples.length;
    setCurrentExampleIndex(nextIndex);
    setFormData(sampleExamples[nextIndex].data);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Convert markdown to HTML
  const renderMarkdown = (text) => {
    let html = text
      .replace(
        /\`\`\`([\s\S]*?)\`\`\`/g,
        '<pre class="bg-gray-100 p-4 rounded mb-4 overflow-x-auto"><code>$1</code></pre>'
      )
      .replace(/\`(.*?)\`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>'
      )
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h3>'
      )
      .replace(/^\* (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/^\- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(
        /(<li class="mb-1">.*<\/li>)/s,
        '<ul class="list-disc list-inside mb-4">$1</ul>'
      )
      .replace(/^(?!<[h|u|p|l])(.*$)/gim, '<p class="mb-4">$1</p>');

    return html;
  };

  const generatePRD = async () => {
    setIsGenerating(true);
    setError("");
    setGeneratedPRD("");

    try {
      const response = await fetch("/api/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PRD");
      }

      const data = await response.json();

      // Add a note about which method was used
      const sourceNote =
        data.source === "claude"
          ? "<!-- Generated using Claude AI -->\n\n"
          : "<!-- Generated using template (no Claude API key) -->\n\n";

      const fullPRD = sourceNote + data.prd;

      // Stream the response for better UX
      const words = fullPRD.split(" ");
      let fullResponse = "";

      for (let i = 0; i < words.length; i++) {
        fullResponse += words[i] + " ";
        setGeneratedPRD(fullResponse);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    } catch (err) {
      setError(err.message || "Failed to generate PRD. Please try again.");
      console.error("Error generating PRD:", err);
    }

    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPRD);
  };

  const downloadPRD = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedPRD], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "prd.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Left Side - Input Section */}
      <div className="w-1/2 p-8 overflow-y-auto relative z-10">
        <div className="mb-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Company PRD Creator
              </h1>
              <p className="text-gray-700">
                Turn your ideas into comprehensive product requirement documents
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1 text-sm bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-md border border-gray-200 transition-all shadow-sm backdrop-blur-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-white/50 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                8 Key Questions
              </h2>
              <button
                onClick={handleExampleClick}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-white/60 hover:bg-white/80 text-gray-700 rounded-full transition-all backdrop-blur-sm border border-white/40 hover:shadow-md"
              >
                <span>{sampleExamples[currentExampleIndex].icon}</span>
                <span>Try: {sampleExamples[currentExampleIndex].name}</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {[
              {
                label: "1. What product or feature are you building?",
                key: "question1",
                placeholder:
                  "e.g., A real-time collaboration dashboard for remote teams...",
              },
              {
                label:
                  "2. Who are your target users and what specific problem does this solve?",
                key: "question2",
                placeholder:
                  "e.g., Remote team managers who struggle with visibility...",
              },
              {
                label:
                  "3. What are the key features and how will you measure success?",
                key: "question3",
                placeholder:
                  "e.g., Live status updates, team activity feed... Success measured by 40% reduction...",
              },
              {
                label:
                  "4. What technology stack and key integrations are required?",
                key: "question4",
                placeholder:
                  "e.g., React frontend, Node.js backend, integrates with Slack/Jira APIs...",
              },
              {
                label:
                  "5. What features or capabilities are explicitly out of scope?",
                key: "question5",
                placeholder:
                  "e.g., Advanced analytics, mobile app, complex user permissions...",
              },
              {
                label:
                  "6. What is your proposed timeline and development phases?",
                key: "question6",
                placeholder:
                  "e.g., Phase 1: Core features (4 weeks), Phase 2: Integrations (3 weeks)...",
              },
              {
                label:
                  "7. What are the main risks, challenges, or dependencies?",
                key: "question7",
                placeholder:
                  "e.g., API rate limits, user adoption challenges, data synchronization...",
              },
              {
                label:
                  "8. What business requirements and strategic alignment considerations apply?",
                key: "question8",
                placeholder:
                  "e.g., Must integrate with existing workflows, compliance requirements...",
              },
            ].map((question) => (
              <div key={question.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.label}
                </label>
                <textarea
                  value={formData[question.key]}
                  onChange={(e) =>
                    handleInputChange(question.key, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                  rows="3"
                  placeholder={question.placeholder}
                />
              </div>
            ))}

            <button
              onClick={generatePRD}
              disabled={
                isGenerating ||
                !formData.question1 ||
                !formData.question2 ||
                !formData.question3 ||
                !formData.question4 ||
                !formData.question5 ||
                !formData.question6
              }
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PRD...
                </>
              ) : (
                "Generate PRD"
              )}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </div>
      </div>

      {/* Right Side - Document Section */}
      <div className="w-1/2 bg-white/90 backdrop-blur-lg border-l border-white/50 flex flex-col relative z-10">
        {generatedPRD && (
          <div className="border-b border-white/50 p-4 flex items-center justify-end bg-white/90 backdrop-blur-sm">
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-md transition-colors backdrop-blur-sm"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={downloadPRD}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50/80 rounded-md transition-colors backdrop-blur-sm"
                title="Download as markdown"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {generatedPRD ? (
              <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(generatedPRD),
                }}
              />
            ) : (
              <div className="text-gray-500 text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Your PRD will appear here after answering the questions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRDCreator;
