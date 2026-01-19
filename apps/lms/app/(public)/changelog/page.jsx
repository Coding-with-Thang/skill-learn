import Link from "next/link";
import { prisma } from "@skill-learn/database";
import { Badge } from "@skill-learn/ui/components/badge";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import {
  Bell,
  Search,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Zap,
  Info
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";

// Simple utility for categories/tags styling
const getTagStyles = (tag) => {
  const styles = {
    new: "bg-blue-50 text-blue-600 border-blue-100",
    improved: "bg-teal-50 text-teal-600 border-teal-100",
    fixed: "bg-orange-50 text-orange-600 border-orange-100",
    security: "bg-red-50 text-red-600 border-red-100",
    enterprise: "bg-purple-50 text-purple-600 border-purple-100",
    default: "bg-slate-50 text-slate-600 border-slate-100"
  };
  return styles[tag.toLowerCase()] || styles.default;
};

export default async function ChangelogPage() {
  const updates = await prisma.changelog.findMany({
    where: { published: true },
    orderBy: { releaseDate: 'desc' },
  });

  // Extract years for archiving
  const years = [...new Set(updates.map(u => new Date(u.releaseDate).getFullYear()))].sort((a, b) => b - a);

  // Count by tag
  const tagCounts = {};
  updates.forEach(u => {
    u.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-slate-900 p-12 md:p-20 text-center relative overflow-hidden group">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/20 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-700" />

            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                What&apos;s New
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Follow the latest updates, feature releases, and improvements to the Skill-Learn platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full px-8 h-12 shadow-lg shadow-teal-500/20 group">
                  <Bell className="w-4 h-4 mr-2 group-hover:animate-ring" />
                  Subscribe to Updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 mx-auto max-w-7xl pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Timeline View */}
          <div className="lg:col-span-8 relative">
            {/* Timeline Line */}
            <div className="absolute left-[31px] top-4 bottom-0 w-px bg-slate-200 hidden md:block" />

            <div className="space-y-16">
              {updates.length > 0 ? updates.map((update) => (
                <div key={update.id} className="relative md:pl-16 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1 w-16 h-16 hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-[3px] border-white bg-teal-500 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_10px_rgba(20,184,166,0.3)] group-hover:scale-125 transition-transform duration-300" />
                  </div>

                  <div className="space-y-4">
                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-sm font-semibold tracking-wider uppercase">
                      <span className="text-teal-600">
                        {new Date(update.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{update.version}</span>
                    </div>

                    {/* Card */}
                    <Link href={`/changelog/${update.slug}`}>
                      <Card className="overflow-hidden border-slate-100 hover:border-teal-200 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 group/card bg-white rounded-2xl">
                        <CardContent className="p-0">
                          <div className="p-8 space-y-6">
                            <div className="flex flex-wrap gap-2">
                              {update.tags.map(tag => (
                                <Badge key={tag} className={`${getTagStyles(tag)} border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover/card:text-teal-600 transition-colors">
                              {update.title}
                            </h2>

                            <p className="text-slate-600 leading-relaxed text-lg line-clamp-3">
                              {update.content}
                            </p>

                            {update.imageUrl && (
                              <div className="relative aspect-video rounded-xl overflow-hidden border bg-slate-50 grayscale hover:grayscale-0 transition-all duration-700">
                                <img
                                  src={update.imageUrl}
                                  alt={update.title}
                                  className="object-cover w-full h-full transform group-hover/card:scale-105 transition-transform duration-700"
                                />
                              </div>
                            )}

                            {/* Bullet points (optional placeholder for mockup) */}
                            <ul className="space-y-3 pt-4">
                              <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                <span>Complete revamp of the user experience and interface for better accessibility.</span>
                              </li>
                              <li className="flex items-start gap-3 text-slate-600">
                                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                                <span>Advanced reporting tools with export functionality for enterprise teams.</span>
                              </li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-500">No updates yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Stay Updated Card */}
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Stay Updated</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Get the latest platform updates delivered straight to your inbox.
                  </p>
                </div>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="work@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                  <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold h-12 rounded-xl">
                    Subscribe
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Archive Section */}
            <div className="space-y-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Release Archive
              </h3>
              <div className="space-y-2">
                {years.map(year => (
                  <button key={year} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group">
                    <span className="text-slate-600 group-hover:text-slate-900 font-medium">{year} Updates</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-full h-6 px-2 min-w-[24px]">
                      {updates.filter(u => new Date(u.releaseDate).getFullYear() === year).length}
                    </Badge>
                  </button>
                ))}
                {years.length === 0 && <p className="text-xs text-slate-400">No archive available.</p>}
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-4 px-2 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Search className="w-4 h-4" /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tagCounts).map(([tag, count]) => (
                  <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-all text-sm font-medium text-slate-600">
                    {tag}
                    <span className="ml-2 text-[10px] opacity-50">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
