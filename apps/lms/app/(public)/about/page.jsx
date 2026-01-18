'use client';

import Image from 'next/image';
import { ArrowRight, Sparkles, Target, Users, Lightbulb, TrendingUp, Shield, Heart, Zap, Coffee } from 'lucide-react';
import { Dancing_Script } from 'next/font/google';

const dancingScript = Dancing_Script({
    subsets: ['latin'],
    weight: ['600'],
    display: 'swap',
});

const teamMembers = [
    {
        name: 'Thang Nguyen',
        role: 'CEO & Founder',
        image: 'https://images.unsplash.com/photo-1708531375354-484e4ac78453?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFzaWFuJTIwbWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D'
    },
    // {
    //     name: 'Jessica Martinez',
    //     role: 'Head of Product',
    //     image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80'
    // },
    // {
    //     name: 'Michael Chen',
    //     role: 'Lead Designer',
    //     image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80'
    // },
    // {
    //     name: 'Sarah Williams',
    //     role: 'CTO',
    //     image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80'
    // }
];

export default function AboutPage() {
    return (
        <main className="w-full bg-white">
            {/* HERO SECTION */}
            <section className="relative bg-white py-16 md:py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                Igniting <span className="relative italic text-purple-600 inline-block">
                                    Potential
                                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#9333ea" />
                                                <stop offset="100%" stopColor="#ec4899" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M2 9C50 3 100 7 198 5" stroke="url(#underlineGradient)" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </span>,<br />
                                Building Futures.
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-md">
                                We empower the future of learning with AI-driven insights and personalized growth paths. Our mission is to make skill development accessible, engaging, and impactful for everyone.
                            </p>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                                </div>
                                <span className="text-gray-600">2.4k</span>
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="relative">
                            <div className="relative w-full aspect-square max-w-md mx-auto lg:ml-auto rounded-3xl overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=600&fit=crop&q=80"
                                    alt="Professional headshot"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HUMANIZING TECH SECTION */}
            <section className="relative bg-gray-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Image */}
                        <div className="relative order-2 lg:order-1">
                            <div className="relative w-full aspect-square max-w-md mx-auto lg:mr-auto rounded-3xl overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&q=80"
                                    alt="Team member"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Stats Badge */}
                            <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">100+</div>
                                    <div className="text-xs text-gray-500">Courses</div>
                                </div>
                                <div className="w-px h-12 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">150+</div>
                                    <div className="text-xs text-gray-500">Instructors</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="space-y-6 order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                Humanizing Tech<br />
                                with <span className="text-cyan-500">Purpose</span>.
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg">
                                Technology should enhance human potential, not replace it. We combine cutting-edge AI with human-centered design to create learning experiences that truly resonate and drive meaningful growth.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR GUIDING LIGHT SECTION */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Guiding Light</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Core principles that drive everything we do
                        </p>
                    </div>

                    {/* Principles Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Precision-Aligned */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Precision-Aligned</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Every feature is meticulously crafted to align with your learning goals.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Led Anywhere */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Led Anywhere</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Learn on your terms, wherever you are with intelligent technology.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Human-Centered */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Human-Centered</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Technology that enhances human potential, not replaces it.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Innovation First */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Innovation First</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Constantly evolving with cutting-edge learning methodologies.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Growth Mindset */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Growth Mindset</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Fostering continuous improvement and lifelong learning.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust & Security */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Trust & Security</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Your data and privacy are protected with enterprise-grade security.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* OUR CULTURE SECTION */}
            <section className="py-20 md:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Culture</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                At Skill-Learn, we believe that the best work happens when people feel empowered, inspired, and supported. We're building a space where creativity meets technology.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">People First</h4>
                                        <p className="text-gray-500">We nurture talent and value every voice in our community.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Fast Iteration</h4>
                                        <p className="text-gray-500">We move quickly, learn from mistakes, and scale what works.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Coffee className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Work-Life Harmony</h4>
                                        <p className="text-gray-500">We optimize for focus and results, not hours at the desk.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-12">
                                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
                                        <Image
                                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop"
                                            alt="Culture image 1"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
                                        <Image
                                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=800&fit=crop"
                                            alt="Culture image 2"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
                                        <Image
                                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=800&fit=crop"
                                            alt="Culture image 3"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
                                        <Image
                                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=800&fit=crop"
                                            alt="Culture image 4"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background blur */}
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-[100px] -z-10 opacity-60"></div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-100 rounded-full blur-[100px] -z-10 opacity-60"></div>
                        </div>
                    </div>
                </div>
            </section>
            {/* MINDS BEHIND THE MISSION */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Minds Behind<br />the Mission
                        </h2>
                    </div>

                    {/* Team Grid */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="group w-full sm:w-[calc(50%-2rem)] lg:w-[calc(25%-3rem)] max-w-[280px]">
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                                    <p className="text-sm text-gray-600">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-white">
                {/* Curved Divider */}
                <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
                    </svg>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12">
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-[3rem] p-8 md:p-16 lg:p-20 shadow-xl">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="space-y-6">
                                <p className="text-sm font-semibold text-cyan-600 tracking-wider uppercase">
                                    Join the Collective
                                </p>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                    Want to shape<br />
                                    the <span className={`${dancingScript.className} text-blue-600 italic`}>future</span> of<br />
                                    learning?
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-md">
                                    We are looking for dreamers, builders, and disruptors who are ready to redefine how talent is developed in the AI era.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
                                        View Open Positions <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Right Decorative Card */}
                            <div className="relative">
                                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md mx-auto lg:ml-auto">
                                    <div className="space-y-8">
                                        {/* Purple Icon */}
                                        <div className="flex justify-between items-start">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Placeholder Lines */}
                                        <div className="space-y-3">
                                            <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                                            <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                                            <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                                        </div>

                                        {/* Apply Now Button */}
                                        <div className="pt-4">
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Apply Now</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}