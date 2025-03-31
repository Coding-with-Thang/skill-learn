export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-red-100">
            <h3 className="mt-3 px-3 text-lg">Test</h3>
          </div>
          <div className="aspect-video rounded-xl bg-red-100" />
          <div className="aspect-video rounded-xl bg-red-100" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-red-100 md:min-h-min" />
      </div>
    </>
  );
}
