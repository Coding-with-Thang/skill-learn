export default function AboutPage() {

    const features = [
        { featureTitle: "Seasoned Expertise", featureDescription: "Our team comprises experienced HR veterans who have excelled at the highest echelons of the industry, accumulating close to a century of combined experience. We bring unparalleled expertise relevant to current trends that will drive your business forward.", featureImage: "text-green-600" },
        { featureTitle: "Direct Engagement", featureDescription: "No intermediaries or inexperienced 'handlers' here. With Skill-Learn, you deal directly with seasoned professionals, ensuring a one-to-one connection that eliminates unnecessary layers and ensures personalized attention.", featureImage: "text-orange-600" },
        { featureTitle: "Efficiency Unleashed", featureDescription: "We understand that your time is precious. Skill-Learn empowers leaders and managers by handling HR intricacies, allowing you to focus on what you do best – growing your business. Our fast, efficient, and effective solutions propel your HR into high gear.", featureImage: "text-blue-600" },
        { featureTitle: "Optimized Investment", featureDescription: "We don't just grow teams; we align people practices with your business goals, ensuring that every investment in your personnel contributes directly to your success.", featureImage: "text-red-600" },
        { featureTitle: "Tailored Solutions", featureDescription: "From foundational services to advanced strategic planning, Skill-Learn builds HR solutions custom-fit to your organization's specific needs. We transition seamlessly from managing people to creating an incredible culture aligned with your business's strategic direction.", featureImage: "text-yellow-600" },
    ];

    return (
        <div className="flex flex-col w-full h-auto">
            <div className="w-full h-96 bg-[#337F60] flex justify-center items-center">
                <h1 className="text-6xl text-white">Your people fuel your success. We fuel your people.</h1>
            </div>

            <div className="w-full h-auto flex p-16 gap-8">
                <div className="w-[40%] flex justify-center items-center">
                    <div className="w-72 h-72 rounded-full bg-green-700"></div>
                </div>
                <div className="flex justify-center items-center p-8">
                    <p className="text-3xl max-w-[50ch]">Skill-Learn was founded on the belief that organizations need exceptional workplaces — places that attract great people, keep them engaged, and unlock their full potential.</p>
                </div>
            </div>

            <div className="w-full h-auto flex p-16 gap-8 bg-[#212153]">
                <div className="w-[60%] flex justify-center items-center p-8">
                    <div>
                        <h1 className="text-4xl mb-5 text-white">We unlock the full potential of your PEOPLE.</h1>
                        <p className="text-3xl max-w-[50ch] text-gray-300">Don't lose slight of your best asset for the success of your business - your people. Skill-Learn will help unlock the full potential of your people and keep them growing and engaged.</p>
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <div className="w-72 h-72 rounded-full bg-green-700"></div>
                </div>
            </div>
            <div className="p-8 flex flex-col items-center">
                <h1 className="text-6xl font-semibold text-center my-8">Skill-Learn's Core Principles</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-16">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center p-4 mx-auto">
                            <div className="w-72 h-72 rounded-full bg-green-700"></div>
                            <h3 className="text-3xl font-semibold mt-6 mb-2">{feature.featureTitle}</h3>
                            <p className="text-lg text-gray-600">{feature.featureDescription}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-96 bg-[#337F60] flex justify-center items-center">
                <h1 className="text-white text-4xl">Your Next Level Starts Now. Join Skill-Learn</h1>
                <button className="px-4 py-10">Contact Us Today</button>
            </div>
        </div>
    )
}