const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      validate(name) {
        if (validator.isEmpty(name)) {
          throw new Error("Enter topic name");
        }
        if (!validator.isLength(name, { min: 3 })) {
          throw new Error("Use 3 characters or more for topic name");
        }
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(description) {
        if (validator.isEmpty(description)) {
          throw new Error("Enter topic description");
        }
        if (!validator.isLength(description, { min: 5 })) {
          throw new Error("Use 6 characters or more for topic description");
        }
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tagString: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Tag",
        },
      ],
    },
    chats: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Message",
        },
      ],
    },
    tasks: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Task",
        },
      ],
    },
    isSelfArchived: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Topic", topicSchema);
