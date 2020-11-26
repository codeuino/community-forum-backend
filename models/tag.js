const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 3,
    validate(name) {
      if (validator.isEmpty(name)) {
        throw new Error("Enter tag name");
      }
      if (!validator.isLength(name, { min: 3 })) {
        throw new Error("Use 3 characters or more for tag name");
      }
    },
  },
  hexColorCode: {
    type: String,
    trim: true,
    default: "",
  },
  topics: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
  },
});

tagSchema.pre("save", function (next) {
  const randomColorCode = Math.floor(Math.random()*16777215).toString(16);
  const tag = this;
  if (tag.hexColorCode == "") {
    tag.hexColorCode = `#${randomColorCode}`;
  }
  next();
});

module.exports = mongoose.model("Tag", tagSchema);
