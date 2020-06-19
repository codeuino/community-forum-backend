const Category = require("../../models/category");

module.exports = {
  categories: async () => {
    try {
      let categories = await Category.find();
      return categories.map((result) => {
        return { ...result._doc };
      });
    } catch (err) {
      throw err;
    }
  },
  createCategories: async (args) => {
    try {
      let category = new Category({
        categoryName: args.categoryInput.categoryName,
        idName: args.categoryInput.idName,
      });
      let result = await category.save();
      return { ...result._doc };
    } catch (err) {
      throw err;
    }
  },
};
