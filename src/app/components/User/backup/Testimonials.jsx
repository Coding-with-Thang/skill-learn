export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 text-black">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-semibold">What Our Users Are Saying</h2>
        <div className="mt-8 space-y-8">
          <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
            <p className="text-lg">
              Skill-Learn has completely transformed the way I approach
              learning. Its so much fun!
            </p>
            <span className="block mt-4 text-xl font-semibold">Jane Doe</span>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
            <p className="text-lg">
              The quizzes are challenging and rewarding. I love the competitive
              leaderboard!
            </p>
            <span className="block mt-4 text-xl font-semibold">John Smith</span>
          </div>
        </div>
      </div>
    </section>
  );
}

