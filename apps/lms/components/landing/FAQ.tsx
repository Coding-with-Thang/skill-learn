"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@skill-learn/ui/components/collapsible";
import { Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FAQ() {
  const t = useTranslations("landingFaq");
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = (t.raw("items") as { q: string; a: string }[]).map((item) => ({
    question: item.q,
    answer: item.a,
  }));

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
          {t("title")}
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

