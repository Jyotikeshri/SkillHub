import layoutModel from "../models/layoutModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchError } from "../middleware/catchAsyncError.js";
import cloudinary from "cloudinary";

export const createLayout = catchError(async (req, res, next) => {
  try {
    const { type } = req.body;
    const isTypeExist = await layoutModel.findOne({ type });
    if (isTypeExist) {
      return next(new ErrorHandler(`${type} already exist`, 400));
    }

    let result;

    if (type === "Banner") {
      const { image, title, subTitle } = req.body;
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "layout",
      });
      const banner = {
        type: "Banner",
        banner: {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        },
      };
      result = await layoutModel.create(banner);
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const faqItems = await Promise.all(
        faq.map(async (item) => {
          return {
            question: item.question,
            answer: item.answer,
          };
        })
      );
      result = await layoutModel.create({ type: "FAQ", faq: faqItems });
    }
    if (type === "Categories") {
      const { categories } = req.body;
      const categoriesItems = await Promise.all(
        categories.map(async (item) => {
          return {
            title: item.title,
          };
        })
      );
      result = await layoutModel.create({
        type: "Categories",
        categories: categoriesItems,
      });
    }
    res.status(200).json({
      success: true,
      message: "Layout created successfully",
      result,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// edit layout
export const editLayout = catchError(async (req, res, next) => {
  try {
    const { type } = req.body;

    if (type === "Banner") {
      const bannerData = await layoutModel.findOne({ type: "Banner" });
      const { image, title, subTitle } = req.body;

      const data = image.startsWith("https")
        ? bannerData
        : await cloudinary.v2.uploader.upload(image, {
            folder: "layout",
          });

      const banner = {
        type: "Banner",
        image: {
          public_id: image.startsWith("https")
            ? bannerData?.banner?.image?.public_id
            : data?.public_id,
          url: image.startsWith("https")
            ? bannerData.banner.image.url
            : data?.secure_url,
        },
        title,
        subTitle,
      };

      await layoutModel.findByIdAndUpdate(bannerData?._id, { banner });
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const FaqItem = await layoutModel.findOne({ type: "FAQ" });
      const faqItems = await Promise.all(
        faq.map(async (item) => {
          return {
            question: item.question,
            answer: item.answer,
          };
        })
      );
      await layoutModel.findByIdAndUpdate(FaqItem?._id, {
        type: "FAQ",
        faq: faqItems,
      });
    }
    if (type === "Categories") {
      const { categories } = req.body;
      const CategoriesItem = await layoutModel.findOne({ type: "Categories" });
      const categoriesItems = await Promise.all(
        categories.map(async (item) => {
          return {
            title: item.title,
          };
        })
      );
      await layoutModel.findByIdAndUpdate(CategoriesItem?._id, {
        type: "Categories",
        categories: categoriesItems,
      });
    }
    res.status(200).json({
      success: true,
      message: "Layout updated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get layout by type
export const getLayoutByType = catchError(async (req, res, next) => {
  const { type } = req.params;

  const layout = await layoutModel.findOne({ type });

  if (!layout) {
    return res.status(404).json({
      success: false,
      message: "Layout not found",
    });
  }
  try {
    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
