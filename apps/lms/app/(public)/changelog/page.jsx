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

// Fallback image for changelog entries without images
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNGQ4Y2QiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwZzU0NjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iNjAwIiBvcGFjaXR5PSIwLjgiPkNoYW5nZWxvZzwvdGV4dD48L3N2Zz4='

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
  let updates = [];
  let years = [];
  let tagCounts = {};

  try {
    updates = await prisma.changelog.findMany({
      where: { published: true },
      orderBy: { releaseDate: 'desc' },
    });

    // Extract years for archiving
    years = [...new Set(updates.map(u => {
      try {
        return new Date(u.releaseDate).getFullYear();
      } catch {
        return new Date().getFullYear();
      }
    }))].sort((a, b) => b - a);

    // Count by tag
    updates.forEach(u => {
      if (u.tags && Array.isArray(u.tags)) {
        u.tags.forEach(tag => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    // Return empty state on error - prevents Server Component crash
    updates = [];
    years = [];
    tagCounts = {};
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              What&apos;s New
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Follow the latest updates, feature releases, and improvements to the Skill-Learn platform.
            </p>
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
                            {update.tags && update.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {update.tags.map(tag => (
                                  <Badge key={tag} className={`${getTagStyles(tag)} border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover/card:text-teal-600 transition-colors">
                              {update.title}
                            </h2>

                            <p className="text-slate-600 leading-relaxed text-lg line-clamp-3">
                              {update.content}
                            </p>

                            <div className="relative aspect-video rounded-xl overflow-hidden border bg-slate-50 grayscale hover:grayscale-0 transition-all duration-700">
                              <img
                                src={update.imageUrl || FALLBACK_IMAGE}
                                alt={update.title}
                                className="object-cover w-full h-full transform group-hover/card:scale-105 transition-transform duration-700"
                              />
                            </div>

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
