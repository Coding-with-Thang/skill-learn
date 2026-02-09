import { redirect } from "next/navigation";

/**
 * Redirect /cms and /cms/* to the CMS app URL.
 * The LMS and CMS are separate deployments; this domain serves the LMS.
 * Set NEXT_PUBLIC_CMS_URL in the LMS Vercel project (e.g. https://cms.yourdomain.com).
 */
export default async function CmsRedirectPage({ params }) {
  const base = process.env.NEXT_PUBLIC_CMS_URL;
  if (!base) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            CMS not configured
          </h1>
          <p className="text-muted-foreground text-sm">
            Set <code className="bg-muted px-1 rounded">NEXT_PUBLIC_CMS_URL</code> in
            this app&apos;s environment (e.g. https://cms.yourdomain.com) so
            /cms redirects to the Super Admin portal.
          </p>
        </div>
      </div>
    );
  }

  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  const path = Array.isArray(slug) && slug.length > 0 ? slug.join("/") : "";
  const cmsPath = path ? `/${path}` : "";
  const target = `${base.replace(/\/$/, "")}/cms${cmsPath}`;
  redirect(target);
}
