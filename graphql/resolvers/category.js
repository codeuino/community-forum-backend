const User = require("../../models/user");
const Category = require("../../models/category");
const topic = require("../../models/topic");
const {
  authenticationError,
  categoryRemovedError,
  blockRemoveUserError,
  noAuthorizationError,
} = require("./errorMessages");
const {
  categoryDeleteResult,
  categoryArchiveResult,
} = require("./resultMessages");

module.exports = {
  categories: async () => {
    try {
      let categories = await Category.find({}).lean();
      return categories.map((category) => {
        return { ...category._doc };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createCategory: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if ((req.currentUser.isBlocked || req.currentUser.isRemoved)) {
      throw new Error(blockRemoveUserError);
    }
    try {
      let category = new Category({
        name: args.categoryInput.categoryName,
        description: args.categoryInput.description,
        createdBy: req.currentUser,
      });
      const saveCategory = await category.save();
      const user = await User.findById(req.currentUser.id);
      user.categoriesCreated.push(category);
      await user.save();
      return { ...saveCategory._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getCategoryTopics: async (args) => {
    try {
      const category = await Category.findById(
        args.categoryFindInput._id
      ).populate('topics', ['name', 'description', 'tags', 'isArchived']);
      if (!category) {
        throw new Error(categoryRemovedError);
      }
      return category.topics;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  archiveCategory: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const category = await Category.findById(args.categoryFindInput._id);
      if (
        category.createdBy.toString() === req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        category[isArchived] = true;
        await Topic.updateMany({parentCategory: args.categoryFindInput._id}, {isArchived: true});
        await category.save();
        return { result: categoryArchiveResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateCategory: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if ((req.currentUser.isBlocked || req.currentUser.isRemoved)) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const category = await Category.findById(args.categoryInput._id);
      if (
        category.createdBy.toString() === req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        category[name] = args.categoryInput.name;
        category[description] = args.categoryInput.description;
        const updateCategory = await category.save();
        return { ...updateCategory._doc };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteCategory: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if ((req.currentUser.isBlocked || req.currentUser.isRemoved)) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const category = await Category.findById(args.categoryFindInput._id);
      if(
        category.createdBy.toString() === req.currentUser.id || 
        req.currentUser.isModerator
      ) {
        await Topic.deleteMany({parentCategory: args.categoryFindInput._id});
        await Message.deleteMany({parentCategory: args.categoryFindInput._id});
        await category.remove();
        const user = await User.findById(req.currentUser.id);
        user.categoriesCreated.filter(
          (categoryId) => categoryId.toString() !== args.categoryFindInput._id
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
};
