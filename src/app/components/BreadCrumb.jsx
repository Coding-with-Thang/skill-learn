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
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem key={crumb.name}>
                  <BreadcrumbLink href={`/${crumb.href}`}>{crumb.name}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
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