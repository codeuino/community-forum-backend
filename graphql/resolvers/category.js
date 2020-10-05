const Category = require("../../models/category");

module.exports = {
  categories: async () => {
    try {
      let categories = await Category.find();
      return categories.map((category) => {
        return { ...category._doc };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createCategories: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Please login to continue");
    }
    try {
      let category = new Category({
        categoryName: args.categoryInput.categoryName,
      });
      let saveCategory = await category.save();
      return { ...saveCategory._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
