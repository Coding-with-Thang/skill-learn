import Image from "next/image"

export default function Loader() {
  return (
    <div className="loading flex flex-col gap-2 justify-center items-center">
      <p>Loading...</p>
      <Image
        src="/loader.gif"
        alt="Loading..."
        height={300}
        width={300}
      />
    </div>
  )
}