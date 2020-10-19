const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Schema = mongoose.Schema;
const saltRounds = 12;

const userSchema = new Schema({
  name: {
    firstName: {
      type: String,
      trim: true,
      required: true,
      validate(firstName) {
        if (validator.isEmpty(firstName)) {
          throw new Error("First Name is required");
        }
      },
    },
    lastName: {
      type: String,
      trim: true,
      validate(lastName) {
        if (validator.isEmpty(lastName)) {
          throw new Error("Last Name is required");
        }
      },
    },
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true,
    validate(email) {
      if (!validator.isEmail(email)) {
        throw new Error("Invalid Email");
      }
      if (validator.isEmpty(email)) {
        throw new Error("Email is required");
      }
    },
  },
  phone: {
    type: String,
    trim: true,
    minlength: 10,
    validate(phone) {
      if (!validator.isLength(phone, { min: 10, max: 10 })) {
        throw new Error("Invalid Phone Number: Atleast 10 characters long");
      }
    },
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: 6,
    validate(password) {
      if (!validator.isLength(password, { min: 6 })) {
        throw new Error("Invalid Password: Atleast 6 characters long");
      }
      if (validator.isEmpty(password)) {
        throw new Error("Password is required");
      }
    },
  },
  socialMedia: {
    youtube: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    github: {
      type: String,
    },
    linkedin: {
      type: String,
    },
  },
  info: {
    about: {
      shortDescription: {
        type: String,
        required: true,
        validate(shortDescription) {
          if (validator.isEmpty(shortDescription)) {
            throw new Error("Short Description is required");
          }
        },
      },
      designation: {
        type: String,
        trim: true,
      },
    },
    avatarUrl: {
      type: String,
      default: null,
    },
  },
  isFirstAdmin: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isModerator: {
    type: Boolean,
    default: false,
  },
  isActivated: {
    type: Boolean,
    default: true,
  },
  isRemoved: {
    type: Boolean,
    default: false,
  },
  categoriesCreated: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  topicsCreated: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    select: true,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
