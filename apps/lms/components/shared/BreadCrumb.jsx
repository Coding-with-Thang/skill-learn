"use client"

import { useUser } from '@clerk/nextjs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@skill-learn/ui/components/breadcrumb";

export default function BreadCrumbCom({ crumbs, endtrail }) {
  const { isSignedIn } = useUser();

  // Use /home for authenticated users, / for unauthenticated (though BreadCrumb is typically only used in protected routes)
  const homeUrl = isSignedIn ? '/home' : '/';

  return (
    <div className="my-4 px-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={homeUrl}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs !== undefined && crumbs !== null &&
            crumbs.map((crumb) => (
              <span key={crumb.name} className="flex gap-2 items-center justify-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${crumb.href}`}>{crumb.name}</BreadcrumbLink>
                </BreadcrumbItem>
              </span>
            ))
          }
          {endtrail && <BreadcrumbSeparator />}
          <BreadcrumbItem>
            <BreadcrumbPage>{endtrail}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}