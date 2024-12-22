import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const reviewSchema = mongoose.Schema(
  {
    user: Object,
    rating: {
      type: Number,

      default: 0,
    },
    commentReplies: [],
    comment: String,
  },
  { timestamps: true }
);

const linkSchema = mongoose.Schema({
  title: String,
  url: String,
});

const commentSchema = mongoose.Schema(
  {
    user: Object,
    question: String,
    questionReplies: [Object],
  },
  { timestamps: true }
);

const courseDataSchema = mongoose.Schema(
  {
    videoUrl: String,

    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    VideoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
  },
  { timestamps: true }
);

const courseSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    estimatedPrice: {
      type: Number,
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    tags: {
      type: [String],
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    demoUrl: {
      type: String,
      required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const courseModel = mongoose.model("Course", courseSchema);
export default courseModel;
