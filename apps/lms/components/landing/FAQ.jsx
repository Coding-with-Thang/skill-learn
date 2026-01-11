"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@skill-learn/ui/components/collapsible";
import { Plus, Minus } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does the AI personalize employee training?",
      answer: "Our AI analyzes each employee's performance, skill levels, and learning behavior to recommend personalized courses and quizzes. It adapts in real-time to provide customized feedback and coaching that matches individual learning styles and career goals."
    },
    {
      question: "Can we upload our own training content?",
      answer: "Yes, absolutely! Skill-Learn allows you to upload your own training materials, including documents, videos, presentations, and custom quizzes. Our platform supports multiple content formats and integrates seamlessly with your existing training programs."
    },
    {
      question: "Does the platform integrate with our existing tools?",
      answer: "Skill-Learn offers integrations with popular HR systems, learning management systems, and collaboration tools. Our API allows for custom integrations with your existing tech stack to ensure a smooth workflow."
    },
    {
      question: "Is the platform secure and compliant?",
      answer: "Security is our top priority. Skill-Learn is SOC 2 compliant, uses enterprise-grade encryption, and follows industry best practices for data protection. We're also GDPR compliant and regularly undergo security audits."
    },
    {
      question: "How do pricing and user limits work?",
      answer: "Our pricing is flexible and scales with your organization. We offer plans based on the number of users, with volume discounts for larger teams. Contact us for a custom quote tailored to your needs."
    },
    {
      question: "Can the platform support multiple languages?",
      answer: "Yes, Skill-Learn supports multiple languages and can be customized for different regions. Our platform automatically detects user preferences and can deliver content in the user's preferred language."
    },
    {
      question: "How quickly can we get started?",
      answer: "Getting started is quick and easy! You can set up your account in minutes and start adding content immediately. Our onboarding team is available to help you configure the platform and import your existing training materials."
    },
    {
      question: "How quickly can I see results?",
      answer: "Most users see 2x improvement in 30 days. Our AI-driven approach accelerates learning by focusing on exactly what each employee needs to know."
    },
    {
      question: "What if I don't like it?",
      answer: "We offer a 100% money-back guarantee, no questions asked. If you're not satisfied within the first 30 days, we'll refund your subscription in full."
    }
  ];

  const handleOpenChange = (index, open) => {
    if (open) {
      setOpenIndex(index);
    } else if (openIndex === index) {
      setOpenIndex(-1);
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          FAQs
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Collapsible
              key={index}
              open={openIndex === index}
              onOpenChange={(open) => handleOpenChange(index, open)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <span className="text-left font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-gray-600 shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-600 shrink-0" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="p-4 pt-2 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}

