export default function Features() {
  return (
    <section id="features" className="py-16 bg-white text-gray-800">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-semibold">Why Skill-Learn?</h2>
        <p className="mt-4 text-xl">Unlock your learning potential with our gamified approach.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Interactive Quizzes</h3>
            <p className="mt-4">Test your knowledge with engaging quizzes that challenge your skills in real-time.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Progress Tracking</h3>
            <p className="mt-4">Track your progress and earn badges as you improve your knowledge.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Leaderboards</h3>
            <p className="mt-4">Compete with others and climb the ranks as you become an expert!</p>
          </div>
        </div>
      </div>
    </section>
  );
}