const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const orgSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      validate(name) {
        if (validator.isEmpty(name)) {
          throw new Error("Enter organization name");
        }
        if (!validator.isLength(name, { min: 3 })) {
          throw new Error("Use 3 characters or more for organization name");
        }
      },
    },
    description: {
      shortDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        validate(shortDescription) {
          if (validator.isEmpty(shortDescription)) {
            throw new Error("Enter short description");
          }
          if (!validator.isLength(shortDescription, { min: 5 })) {
            throw new Error("Use 5 characters or more for short description");
          }
        },
      },
      longDescription: {
        type: String,
        trim: true,
        minlength: 10,
        validate(longDescription) {
          if (!validator.isLength(longDescription, { min: 10 })) {
            throw new Error("Use 10 characters or more for long description");
          }
        },
      },
    },
    //TBD: Image upload functionality
    imgUrl: {
      type: String,
      trim: true,
      validator(imgUrl) {
        if (!validator.isURL(imgUrl)) {
          throw new Error("Enter valid image link");
        }
      },
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
        validate(email) {
          if (validator.isEmpty(email)) {
            throw new Error("Enter organization email");
          }
          if (!validator.isEmail(email)) {
            throw new Error("Enter valid organization email");
          }
        },
      },
      website: {
        type: String,
        trim: true,
        required: true,
        validate(website) {
          if (validator.isEmpty(website)) {
            throw new Error("Enter organization website URL");
          }
          if (!validator.isURL(website)) {
            throw new Error("Enter valid organization website URL");
          }
        },
      },
    },
    adminIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    moderatorIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    removedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalUsers: {
      type: Number,
      default: 0,
    },
    isUnderMaintenance: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organization", orgSchema);
