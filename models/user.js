const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Schema = mongoose.Schema;
const saltRounds = 12;

const userSchema = new Schema(
  {
    name: {
      firstName: {
        type: String,
        trim: true,
        required: true,
        validate(firstName) {
          if (validator.isEmpty(firstName)) {
            throw new Error("Enter first name");
          }
        },
      },
      lastName: {
        type: String,
        trim: true,
        required: true,
        validate(lastName) {
          if (validator.isEmpty(lastName)) {
            throw new Error("Enter last name");
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
          throw new Error("Enter valid email");
        }
        if (validator.isEmpty(email)) {
          throw new Error("Enter email");
        }
      },
    },
    phone: {
      type: String,
      trim: true,
      minlength: 10,
      required: true,
      validate(phone) {
        if (!validator.isLength(phone, { min: 10, max: 10 })) {
          throw new Error("Enter valid phone number");
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
          throw new Error("Use 6 characters or more for password");
        }
        if (validator.isEmpty(password)) {
          throw new Error("Enter password");
        }
      },
    },
    socialMedia: {
      twitter: {
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
              throw new Error("Enter short description");
            }
          },
        },
        designation: {
          type: String,
          trim: true,
        },
      },
      //image upload functionality to be added
      avatarUrl: {
        type: String,
        default: null,
      },
      /////////////////
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
    isBlocked: {
      type: Boolean,
      default: false,
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
    tasksAssigned: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Task",
        },
      ],
    },
    tasksCreated: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Task",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
