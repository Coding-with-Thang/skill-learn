export default function Quiz() {
  return (
    <section className="flex flex-col justify-center items-center mt-10">
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-light text-gray-900 md:text-5xl lg:text-6xl">
        Quiz
      </h1>
      <div>
        <h3 className="mb-4 text-2xl font-bold leading-none tracking-light text-gray-900 md:text-3xl lg:text-4xl">Question #01</h3>
        <p className="text-2xl">Score: 0</p>
        <div className="shadow-2xl shadow-orange-500 my-10 p-10 w-[90%] rounded-lg flex flex-col justify-center items-center">Test</div>
      </div>
    </section>
  )
}