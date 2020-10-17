const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const orgSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    validate(name) {
      if (validator.isEmpty(name)) {
        throw new Error("Organization Name is required");
      }
      if (!validator.isLength(name, { min: 3 })) {
        throw new Error("Invalid Organization Name: Atleast 3 characters long");
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
          throw new Error("Short Description is required");
        }
        if (!validator.isLength(shortDescription, { min: 5 })) {
          throw new Error(
            "Invalid Short Description: Atleast 5 characters long"
          );
        }
      },
    },
    longDescription: {
      type: String,
      trim: true,
      minlength: 10,
      validate(longDescription) {
        if (!validator.isLength(longDescription, { min: 10 })) {
          throw new Error(
            "Invalid Long Description: Atleast 10 characters long"
          );
        }
      },
    },
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  imgUrl: {
    type: String,
    trim: true,
    validator(imgUrl) {
      if (!validator.isURL(imgUrl)) {
        throw new Error("Invalid Image URL");
      }
    },
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      validate(email) {
        if (validator.isEmpty(email)) {
          throw new Error("Organization email is required");
        }
        if (!validator.isEmail(email)) {
          throw new Error("Invalid Organization email");
        }
      },
    },
    website: {
      type: String,
      trim: true,
      required: true,
      validate(website) {
        if (validator.isEmpty(website)) {
          throw new Error("Organization website is required");
        }
        if (!validator.isURL(website)) {
          throw new Error("Invalid Organization website");
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
    ]
  },
  moderatorIds: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ]
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isUnderMaintenance: {
    type: Boolean,
    default: false,
  },
  blockedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  totalUsers: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Organization", orgSchema);
