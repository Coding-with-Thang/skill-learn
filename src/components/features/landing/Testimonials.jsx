"use client";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "I really loved Skill-Learn. It only took me 1 month to learn about something in my company!",
      author: "Sarah Johnson",
      role: "Marketing Manager"
    },
    {
      quote: "I really loved Skill-Learn. It only took me 1 month to learn about something in my company!",
      author: "Michael Chen",
      role: "Software Engineer"
    },
    {
      quote: "I really loved Skill-Learn. It only took me 1 month to learn about something in my company!",
      author: "Emily Rodriguez",
      role: "HR Director"
    }
  ];

  return (
    <section className="bg-gray-800 text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-6">
              <div className="w-16 h-16 bg-gray-600 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {testimonial.author.charAt(0)}
                </span>
              </div>
              <p className="text-gray-200 mb-4 italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="text-sm text-gray-400">
                <p className="font-semibold">{testimonial.author}</p>
                <p>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

