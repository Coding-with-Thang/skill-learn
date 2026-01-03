import { CheckCircle, Handshake, Rocket, BarChart3, Sliders, Play } from 'lucide-react';
import Image from 'next/image';
import Reveal from '@/components/shared/Reveal';

const principles = [
    {
        title: 'Seasoned Expertise',
        text: "Pioneering insights and experience for future-proof growth.",
        icon: CheckCircle,
    },
    {
        title: 'Direct Engagement',
        text: 'Personalized attention, cutting through complexity.',
        icon: Handshake,
    },
    {
        title: 'Efficiency Unleashed',
        text: 'Swift, impactful solutions for peak HR performance.',
        icon: Rocket,
    },
    {
        title: 'Optimized Investment',
        text: 'Every personnel investment driving direct success.',
        icon: BarChart3,
    },
    {
        title: 'Tailored Solutions',
        text: 'Custom-fit HR strategies, from foundation to frontier.',
        icon: Sliders,
    },
];

export default function AboutPage() {
    return (
        <main className="w-full">
            {/* HERO */}
            <section className="relative min-h-[70vh] flex items-center bg-brand-teal text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-60 pointer-events-none" aria-hidden="true">
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/profound.png?alt=media&token=17cca178-6400-431e-85fc-1bc26c2a91e1"
                        alt="Diverse team collaborating with green tech overlay"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                </div>

                <Reveal className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Igniting Potential, Building Futures.</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90">At Skill-Learn, we believe in the boundless capacity of human talent. We are dedicated to nurturing growth and fostering innovation within every organization we touch.</p>
                </Reveal>
            </section>

            {/* STORY / SEED */}
            <section className="relative bg-background/0 dark:bg-background py-20 md:py-28">
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" aria-hidden="true">
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/grow.png?alt=media&token=29ab7fc4-91c2-4522-8329-d97058f6361f"
                        alt="Abstract representation of growth and innovation"
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <Reveal className="order-2 md:order-1">
                        <div className="bg-black/50 dark:bg-black/60 p-8 rounded-lg">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">The Seed of an Idea</h2>
                            <p className="text-lg text-white/90 leading-relaxed">Skill-Learn was born from a simple yet profound realization: the heart of every successful enterprise lies in its people. We envisioned workplaces that are productive and exceptional — places that attract, engage, and empower individuals to reach their highest potential.</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* POTENTIAL */}
            <section className="relative bg-surface-light dark:bg-surface-dark py-20 md:py-24">
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" aria-hidden="true">
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/unnamed.png?alt=media&token=14ee642f-e888-425c-a546-48f3935ecba4"
                        alt="Diverse professionals collaborating and achieving goals"
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <Reveal className="md:order-1">
                        <div className="md:order-1 bg-black/10 dark:bg-black/60 p-8 rounded-lg text-white">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Unlocking True Potential</h2>
                            <p className="text-lg leading-relaxed">Your people are your most valuable asset. We ensure they don&apos;t just stay — they thrive. Skill-Learn provides the tools and insights to cultivate a dynamic environment where continuous growth and engagement become the norm.</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* CORE PRINCIPLES */}
            <section className="py-20 sm:py-28 bg-background dark:bg-background text-foreground">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold">Our Guiding Light: Core Principles</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">These values define who we are and how we partner for success — innovation and humanity at our core.</p>
                    </div>

                    <div className="relative">
                        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-px h-full bg-brand-teal/30" />
                        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                            {principles.map((p, i) => {
                                const Icon = p.icon;
                                return (
                                    <Reveal key={p.title} className={`flex items-center ${i % 2 === 0 ? 'md:justify-end text-right md:pr-8' : 'md:justify-start md:pl-8'}`}>
                                        <div className="max-w-md w-full">
                                            <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center z-10">
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-lg">
                                                <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                                                <p className="text-sm text-muted-foreground">{p.text}</p>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative min-h-[40vh] flex items-center bg-brand-teal text-white py-20">
                <div className="absolute inset-0 z-0 opacity-60 pointer-events-none" aria-hidden="true">
                    <Image
                        src="https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/galaxy.png?alt=media&token=8cf178ff-c3f1-47a8-b87f-ce9a93516c46"
                        alt="connections graphic"
                        fill
                        sizes="100vw"
                        className="object-cover" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <Reveal>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Empower Your People and Transform Your Future?</h2>
                        <button className="inline-flex items-center gap-3 bg-white text-brand-teal px-8 py-3 rounded-md font-semibold text-lg hover:shadow-xl transition-all">
                            <Play className="w-4 h-4" /> Begin Your Journey With Us
                        </button>
                    </Reveal>
                </div>
            </section>
        </main>
    );
}