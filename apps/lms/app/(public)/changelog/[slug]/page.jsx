import Link from "next/link";
import { prisma } from "@skill-learn/database";
import { Badge } from "@skill-learn/ui/components/badge";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import {
  Bell,
  ChevronLeft,
  Terminal,
  Calendar,
  CheckCircle2,
  Zap,
  Info,
  Bug,
  Layout,
  ExternalLink,
  Twitter,
  Linkedin,
  Copy,
  ArrowRight
} from "lucide-react";
import { notFound } from "next/navigation";

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

export default async function ChangelogDetailPage({ params }) {
  const { slug } = params;

  const update = await prisma.changelog.findUnique({
    where: { slug },
  });

  if (!update || !update.published) {
    notFound();
  }

  const relatedUpdates = await prisma.changelog.findMany({
    where: {
      id: { not: update.id },
      published: true
    },
    take: 3,
    orderBy: { releaseDate: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50/10">
      {/* Header Container */}
      <div className="container px-4 mx-auto max-w-5xl pt-12">
        <div className="mb-8">
          <Link href="/changelog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-teal-600 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Changelog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-teal-500 text-white border-0 uppercase text-[10px] font-bold px-3 py-1">
                  New Release
                </Badge>
                <span className="text-sm font-semibold text-slate-400">
                  {update.version} • {new Date(update.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                {update.title}
              </h1>

              {update.imageUrl && (
                <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl shadow-slate-200">
                  <img
                    src={update.imageUrl}
                    alt={update.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              )}
            </div>

            <div className="space-y-10">
              {/* Overview */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-teal-500 fill-teal-500/20" /> Overview
                </h2>
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                  <p>{update.content}</p>
                </div>
              </section>

              {/* Boxed Featured Items (Matching Mockup 2 style) */}
              <Card className="bg-teal-50/30 border-teal-100 rounded-3xl shadow-sm border-2 border-dashed">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">What&apos;s New</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Interactive Learning Hub</h4>
                        <p className="text-slate-600 text-sm">A dedicated space for 3D assets that students can rotate, explode, and explore with physics-based interactions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Dynamic Skill Trees</h4>
                        <p className="text-slate-600 text-sm">Visual progress tracking that branches as learners complete specific curriculum nodes, inspired by RPG systems.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Grid Placeholder */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border group">
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center">
                    <Layout className="w-12 h-12 text-slate-400 opacity-20" />
                  </div>
                </div>
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border group">
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center">
                    <Layout className="w-12 h-12 text-slate-400 opacity-20" />
                  </div>
                </div>
              </div>

              {/* Lists Section */}
              <div className="grid grid-cols-1 gap-12">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">Improvements</h2>
                  <ul className="space-y-3">
                    {["Optimized WebGL rendering for smoother performance on mobile devices.",
                      "Enhanced dark mode contrast for better readability in late-night study sessions.",
                      "Faster dashboard loading times by pre-caching essential curriculum assets."].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">Bug Fixes</h2>
                  <ul className="space-y-3">
                    {["Fixed an issue where video progress wasn't saving correctly on iOS Safari.",
                      "Resolved a layout shift in the student sidebar when resizing the browser.",
                      "Patched a security vulnerability in the asset upload pipeline."].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              </div>

              {/* Share Section */}
              <div className="pt-8 border-t flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Share Update</span>
                  <div className="flex gap-2">
                    {[Twitter, Linkedin, Copy].map((Ico, i) => (
                      <button key={i} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all">
                        <Ico className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <button className="text-teal-600 font-bold flex items-center gap-2 hover:underline">
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-white border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
              <CardContent className="p-8 space-y-8">
                {/* Stats */}
                <div className="flex justify-between divide-x border-b pb-8">
                  <div className="pr-6">
                    <div className="text-3xl font-black text-teal-500">{update.newFeaturesCount || 12}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">New Features</div>
                  </div>
                  <div className="px-6 border-l">
                    <div className="text-3xl font-black text-slate-800">{update.bugFixesCount || 45}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bug Fixes</div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    {update.authorImage ? (
                      <img src={update.authorImage} alt={update.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{update.authorName || 'Elias Nguyen'}</div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Release Lead</div>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-3">
                  {update.apiDocsUrl && (
                    <Link href={update.apiDocsUrl} className="w-full">
                      <Button className="w-full justify-start bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 rounded-2xl h-12">
                        <Terminal className="w-4 h-4 mr-3" /> API Docs
                      </Button>
                    </Link>
                  )}
                  {update.githubRepoUrl && (
                    <Link href={update.githubRepoUrl} className="w-full">
                      <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-900 font-bold hover:bg-slate-50 rounded-2xl h-12">
                        <ExternalLink className="w-4 h-4 mr-3" /> GitHub Repo
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Subscribe */}
                <div className="pt-8 border-t space-y-4">
                  <h4 className="font-bold text-slate-900">Never miss an update</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Join 5,000+ developers getting release notes delivered straight to their inbox.
                  </p>
                  <form className="space-y-2">
                    <input type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-xl border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                    <Button className="w-full bg-slate-900 text-white font-bold h-12 rounded-xl">
                      Subscribe
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Updates Section */}
      {relatedUpdates.length > 0 && (
        <section className="container px-4 mx-auto max-w-5xl py-24 mt-12 border-t">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Related Updates</h2>
            <Link href="/changelog" className="text-teal-600 font-bold flex items-center gap-2 hover:underline">
              View Changelog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedUpdates.map(u => (
              <Link key={u.id} href={`/changelog/${u.slug}`}>
                <Card className="h-full border-slate-100 hover:border-teal-200 transition-all group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      {u.imageUrl ? (
                        <img src={u.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={u.title} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-50 to-blue-50" />
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-0 text-[10px] uppercase font-bold">
                          {u.version}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">
                        {new Date(u.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{u.title}</h3>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
