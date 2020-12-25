const Tag = require("../../models/tag");
const {
  tagRemovedError,
} = require("../variables/errorMessages");

module.exports = {
  getTagTopics: async (args, req) => {
    try {
      const tag = await Tag.findById(args.tagFindInput._id).populate({
        path: "topics",
        populate: { path: "createdBy tags" },
      }).lean();
      if (!tag) {
        throw new Error(tagRemovedError);
      }
      return tag;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
}
