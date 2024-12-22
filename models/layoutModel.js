import { urlencoded } from "express";
import mongoose from "mongoose";

const faqSchema = mongoose.Schema({
  question: String,
  answer: String,
});

const categorySchema = mongoose.Schema({
  title: String,
});

const bannerImageSchema = mongoose.Schema({
  public_id: String,
  url: String,
});

const layoutSchema = mongoose.Schema({
  type: {
    type: String,
  },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: String,
    subTitle: String,
  },
});

const layoutModel = mongoose.model("Layout", layoutSchema);
export default layoutModel;
