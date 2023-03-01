const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
    },
    birthDate: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    gender: {
      type: String,
    },
    title: {
      type: String,
    },
    companyName: {
      type: String,
    },
    address: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", (next) => {
  bcrypt.hash(this.password, 8, (err, hash) => {
    if (err) {
      console.log(`Hash error ${err} with user ${this.username} `);
      return next(err);
    }
    this.password = hash;
    next();
  });
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
