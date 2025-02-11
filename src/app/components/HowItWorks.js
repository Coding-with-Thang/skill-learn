export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 text-gray-800">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-semibold">How It Works</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Choose a Course</h3>
            <p className="mt-4">
              Pick a subject and start learning at your own pace!
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Take Quizzes</h3>
            <p className="mt-4">
              Test your knowledge through fun quizzes to level up.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Play Games</h3>
            <p className="mt-4">
              Take a load of work by playing games after completing Courses.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Earn Rewards</h3>
            <p className="mt-4">
              Get rewarded with points, badges, and a place on the leaderboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
