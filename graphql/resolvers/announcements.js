const Announcement = require("../../models/announcements");

module.exports = {
  announcements: async () => {
    try {
      let announcements = await Announcement.find().populate("user topic");
      return announcements.map((result) => {
        return { ...result._doc };
      });
    } catch (err) {
      throw err;
    }
  },
  createAnnouncement: async (args,req) => {
    if (!req.isAuth) {
      throw new Error("Not Authenticated!");
    }
    console.log('authenticated')
    try {
      let announcement = new Announcement({
        announcement: args.announcementInput.announcement,
        user: args.announcementInput.userId,
        topic: args.announcementInput.topicId,
      });
      let result = await announcement.save();
      console.log('saved')
      return { ...result._doc };
    } catch (err) {
      throw err;
    }
  },
};
