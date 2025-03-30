import Image from "next/image"

export default function Loader() {
  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <Image
        src="/loader.gif"
        alt="Loading..."
        height={300}
        width={300}
      />
      <p className="my-4 text-xl">Loading...</p>
    </div>
  )
}