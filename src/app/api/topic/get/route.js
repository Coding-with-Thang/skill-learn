import Topic from "@/lib/models/topic.model.js";
// import { connect } from "@/lib/mongodb/mongoose.js";

export const POST = async (req) => {
  await connect();
  const data = await req.json();
  try {
    const startIndex = parseInt(data.startIndex) || 0;
    const limit = parseInt(data.limit) || 9;
    const sortDirection = data.order === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(data.userId && { userId: data.userId }),
      ...(data.language &&
        data.language !== "null" &&
        data.language !== "undefined" && { language: data.language }),
      ...(data.category &&
        data.category !== "null" &&
        data.category !== "undefined" && { category: data.category }),
      ...(data.subcategory &&
        data.subcategory !== "null" &&
        data.subcategory !== "undefined" && { subcategory: data.subcategory }),
      ...(data.slug && { slug: data.slug }),
      ...(data.postId && { _id: data.postId }),
      ...(data.searchTerm && {
        $or: [
          { title: { $regex: data.searchTerm, $options: "i" } },
          { content: { $regex: data.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return new Response(JSON.stringify({ posts, totalPosts, lastMonthPosts }), {
      status: 200,
    });
  } catch (error) {
    console.log("Error getting posts: ", error);
  }
};
