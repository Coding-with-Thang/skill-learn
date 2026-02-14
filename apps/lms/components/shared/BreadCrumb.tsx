"use client"

import * as React from "react"
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

  // Use /home for authenticated users, / for unauthenticated
  const homeUrl = isSignedIn ? '/home' : '/';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={homeUrl}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs?.map((crumb) => (
          <React.Fragment key={crumb.name}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={crumb.href.startsWith("/") ? crumb.href : `/${crumb.href}`}>
                {crumb.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
        {endtrail && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{endtrail}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}