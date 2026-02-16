import { useTranslations } from "next-intl";
import BreadCrumbCom from "@/components/shared/BreadCrumb"

export default function DiscoveryPage() {
  const t = useTranslations("discover");
  return (
    <section className="flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-8 md:px-12 py-8 gap-4">
      <BreadCrumbCom crumbs={[]} endtrail={t("title")} />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t("title")}</h1>
    </section>
  )
}