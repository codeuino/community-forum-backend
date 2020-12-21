const User = require("../../models/user");
const Category = require("../../models/category");
const Topic = require("../../models/topic");
const Message = require("../../models/message");
const Tag = require("../../models/tag");
const {
  authenticationError,
  categoryNotFoundError,
  categoryRemovedError,
  noAuthorizationError,
} = require("../variables/errorMessages");
const {
  categoryDeleteResult,
  categoryArchiveResult,
  categoryUnarchiveResult,
} = require("../variables/resultMessages");

module.exports = {
  categories: async () => {
    try {
      let categories = await Category.find({}).populate("createdBy").lean();
      return categories;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createCategory: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isBlocked) {
      throw new Error(noAuthorizationError);
    }
    try {
      let category = new Category({
        name: args.categoryInput.name,
        description: args.categoryInput.description,
        createdBy: req.currentUser.id,
      });
      const saveCategory = await category.save();
      const user = await User.findById(req.currentUser.id);
      user.categoriesCreated.push(category);
      await user.save();
      category = await Category.findById(saveCategory._id)
        .populate("createdBy")
        .lean();
      return category;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getCategory: async (args) => {
    try {
      const category = await Category.findById(args.categoryFindInput._id)
        .populate("createdBy")
        .lean();
      if (!category) {
        throw new Error(categoryRemovedError);
      }
      return category;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getCategoryTopics: async (args) => {
    try {
      const category = await Category.findById(args.categoryFindInput._id)
        .populate({
          path: "topics",
          populate: { path: "createdBy tags" },
        })
        .lean();
      if (!category) {
        throw new Error(categoryRemovedError);
      }
      return category.topics;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateCategory: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      let category = await Category.findById(args.categoryInput._id);
      if (!category) {
        throw new Error(categoryNotFoundError);
      }
      if (
        category.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        category.name = args.categoryInput.name;
        category.description = args.categoryInput.description;
        await category.save();
        category = await Category.findById(args.categoryInput._id)
          .populate("createdBy")
          .lean();
        return category;
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteCategory: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const category = await Category.findById(args.categoryFindInput._id);
      if (!category) {
        throw new Error(categoryNotFoundError);
      }
      if (
        category.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        const topics = await Topic.find({
          parentCategory: args.categoryFindInput._id,
        });
        for (const topic of topics) {
          for (const stringTag of topic.tags) {
            const tag = await Tag.findById(stringTag);
            tag.topics = tag.topics.filter(
              (topicId) => topicId.toString() != topic._id
            );
            if (tag.topics.length == 0) {
              await tag.remove();
            } else {
              await tag.save();
            }
          }
          await topic.remove();
        }
        await Message.deleteMany({
          parentCategory: args.categoryFindInput._id,
        });
        await category.remove();
        const user = await User.findById(category.createdBy);
        user.categoriesCreated = user.categoriesCreated.filter(
          (categoryId) => categoryId.toString() != args.categoryFindInput._id
        );
        await user.save();
        return {
          result: categoryDeleteResult,
        };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  archiveCategory: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const category = await Category.findById(args.categoryFindInput._id);
      if (!category) {
        throw new Error(categoryNotFoundError);
      }
      if (
        category.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        category.isArchived = true;
        await Topic.updateMany(
          { parentCategory: args.categoryFindInput._id },
          { isArchived: true }
        );
        await category.save();
        return { result: categoryArchiveResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  unarchiveCategory: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const category = await Category.findById(args.categoryFindInput._id);
      if (!category) {
        throw new Error(categoryNotFoundError);
      }
      if (
        category.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        category.isArchived = false;
        await Topic.updateMany(
          { parentCategory: args.categoryFindInput._id },
          { isArchived: false }
        );
        await category.save();
        return { result: categoryUnarchiveResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
