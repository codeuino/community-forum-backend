const Tag = require("../../models/tag");
const {
  tagRemovedError,
} = require("../variables/errorMessages");

module.exports = {
  getTagTopics: async () => {
    try {
      const tag = await Tag.findById(args.tagFindInput._id).populate({
        path: "topics",
        populate: { path: "createdBy tags" },
      });
      if (!tag) {
        throw new Error(tagRemovedError);
      }
      return tag.topics;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
}