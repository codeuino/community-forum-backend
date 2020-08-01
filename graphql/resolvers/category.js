const Category = require("../../models/category");

module.exports = {
  categories: async () => {
    try {
      let categories = await Category.find().populate("userId");
      return categories.map((result) => {
        return { ...result._doc };
      });
    } catch (err) {
      throw err;
    }
  },
  createCategories: async (args,req) => {
    if(!req.isAuth){
      throw new Error('Not Authenticated!')
    }
    try {
      let category = new Category({
        categoryName: args.categoryInput.categoryName,
      });
      let result = await category.save();
      return { ...result._doc };
    } catch (err) {
      throw err;
    }
  },
};
