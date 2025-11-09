"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BuiltForEveryone() {
  const features = [
    {
      title: "For Professionals",
      description: "Researching a new employee candidate or a new project"
    },
    {
      title: "For Managers & Leaders",
      description: "Get a clear view of the performance of your team and company"
    },
    {
      title: "View how your people are doing",
      description: "Track employees and see how they search through Skill-Learn's adaptive learning system."
    }
  ];

  return (
    <section id="solutions" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built <span className="text-gray-400 text-2xl md:text-3xl">for everyone</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Thousands of businesses, from startups to enterprises, use Skill-Learn to handle employee development.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">All employee data at once</h3>
            <p className="text-gray-600">
              Manage all your employee data in one place. Track progress, performance, and development across your entire organization.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Coaching has never been easier</h3>
            <p className="text-gray-600">
              Our AI-powered coaching system provides personalized feedback and guidance to help every employee reach their full potential.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

