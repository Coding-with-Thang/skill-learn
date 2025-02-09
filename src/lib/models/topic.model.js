import mongoose from "mongoose";
const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  quiz: {
    type: [],
  },
  category: {
    type: String,
    default: "uncategorized",
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    required: true,
    unique: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});
const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);
export default Topic;
