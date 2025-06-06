import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";

export default function BreadCrumbCom({ crumbs, endtrail }) {
  return (
    <div className="my-4 px-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
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