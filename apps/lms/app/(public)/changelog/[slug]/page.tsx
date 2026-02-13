import Link from "next/link";
import { prisma } from "@skill-learn/database";
import { Badge } from "@skill-learn/ui/components/badge";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { Button } from "@skill-learn/ui/components/button";
import {
  ChevronLeft,
  Terminal,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { notFound } from "next/navigation";

// Fallback image for changelog entries without images
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTRkOGNkIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGc1NDY2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC13ZWlnaHQ9IjYwMCIgb3BhY2l0eT0iMC44Ij5DaGFuZ2Vsb2c8L3RleHQ+PC9zdmc+'

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
  const { slug } = await params;

  let update;
  let relatedUpdates = [];

  try {
    update = await prisma.changelog.findUnique({
      where: { slug },
    });

    if (!update || !update.published) {
      notFound();
    }

    relatedUpdates = await prisma.changelog.findMany({
      where: {
        id: { not: update.id },
        published: true
      },
      take: 3,
      orderBy: { releaseDate: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching changelog detail:', error);
    notFound();
  }

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
                {update.version && (
                  <span className="text-sm font-semibold text-slate-600">
                    {update.version}
                  </span>
                )}
                <span className="text-sm font-semibold text-slate-400">
                  {new Date(update.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <h1 className="text-4xl md:text-brand-teal font-black tracking-tight text-slate-900 leading-[1.1]">
                {update.title}
              </h1>

              <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl shadow-slate-200">
                <img
                  src={update.imageUrl || FALLBACK_IMAGE}
                  alt={update.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="space-y-10">
              {/* Tags */}
              {update.tags && update.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {update.tags.map(tag => (
                    <Badge key={tag} className={`${getTagStyles(tag)} border px-3 py-1 text-xs font-semibold uppercase tracking-wider`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Content */}
              <section className="space-y-4">
                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {update.content}
                </div>
              </section>

              {/* Author */}
              {update.authorName && (
                <div className="pt-8 border-t">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {update.authorImage ? (
                        <img src={update.authorImage} alt={update.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Author</div>
                      <div className="font-bold text-slate-900 text-lg">{update.authorName}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-white border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden sticky top-8">
              <CardContent className="p-8 space-y-8">
                {/* Stats */}
                {(update.newFeaturesCount > 0 || update.bugFixesCount > 0) && (
                  <div className="flex justify-between divide-x border-b pb-8">
                    {update.newFeaturesCount > 0 && (
                      <div className="pr-6">
                        <div className="text-3xl font-black text-teal-500">{update.newFeaturesCount}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">New Features</div>
                      </div>
                    )}
                    {update.bugFixesCount > 0 && (
                      <div className={`${update.newFeaturesCount > 0 ? 'px-6 border-l' : ''}`}>
                        <div className="text-3xl font-black text-slate-800">{update.bugFixesCount}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bug Fixes</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Author */}
                {update.authorName && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                      {update.authorImage ? (
                        <img src={update.authorImage} alt={update.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-teal-400 to-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{update.authorName}</div>
                      <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Author</div>
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="space-y-3">
                  {update.apiDocsUrl && (
                    <Link href={update.apiDocsUrl} className="w-full">
                      <Button className="w-full justify-start bg-teal-500 text-slate-900 font-bold hover:bg-teal-400 rounded-4xl h-12">
                        <Terminal className="w-4 h-4 mr-3" /> API Docs
                      </Button>
                    </Link>
                  )}
                  {update.githubRepoUrl && (
                    <Link href={update.githubRepoUrl} className="w-full">
                      <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-900 font-bold hover:bg-slate-50 rounded-4xl h-12">
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
        <section className="container px-4 mx-auto max-w-5xl py-24 mt-24 border-t">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Related Updates</h2>
            <Link href="/changelog" className="text-teal-600 font-bold flex items-center gap-2 hover:underline">
              View Changelog <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedUpdates.map(u => (
              <Link key={u.id} href={`/changelog/${u.slug}`}>
                <Card className="h-full border-slate-100 hover:border-teal-200 transition-all group rounded-4xl overflow-hidden shadow-sm hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="aspect-16/10 bg-slate-100 overflow-hidden relative">
                      <img
                        src={u.imageUrl || FALLBACK_IMAGE}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={u.title}
                      />
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
