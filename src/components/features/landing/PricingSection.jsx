"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function PricingCard({ title, price, features, cta, highlighted, badge }) {
  return (
    <div className={`relative p-8 rounded-2xl border ${highlighted ? 'border-brand-teal shadow-2xl scale-105 z-10 bg-white' : 'border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow'}`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-brand-teal to-brand-dark-blue text-white text-sm font-semibold rounded-full">
          {badge}
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {price !== "Custom" && <span className="text-gray-600">/month</span>}
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-gray-600">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className={`w-full py-6 text-lg ${highlighted ? 'bg-gradient-to-r from-brand-teal to-brand-dark-blue hover:from-brand-teal-dark hover:to-brand-dark-blue text-white' : 'bg-white text-brand-teal border-2 border-brand-teal/20 hover:bg-brand-teal/5'}`}
      >
        {cta}
      </Button>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. No hidden fees.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {/* Free Tier */}
          <PricingCard
            title="Free Forever"
            price="$0"
            features={["up to 5 users", "Unlimited courses", "Basic analytics", "Community access"]}
            cta="Start Free"
          />
          {/* Pro Tier - HIGHLIGHTED */}
          <PricingCard
            title="Pro"
            price="$12.99"
            badge="Most Popular"
            features={["up to 100 users", "Unlimited courses", "AI coaching", "Priority support", "Certification badges"]}
            cta="Start 14-Day Trial"
            highlighted
          />
          {/* Enterprise */}
          <PricingCard
            title="Enterprise"
            price="Custom"
            features={["Custom integrations", "Dedicated support", "SLA", "Advanced security"]}
            cta="Contact Sales"
          />
        </div>
      </div>
    </section>
  );
}
