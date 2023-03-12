// Important requires
const UserModel = require("./user.model");
const { hashSync, compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const userValidSchema =
  require("../../utils/ValidationSchemas/User.ValidationSchema").userValidSchemaRegister;
// Function to register
const register = async (req, res) => {
  try {
    /**
     * Validation on data
     */
    // Make a new instance of user schema
    const validResult = await userValidSchema.validateAsync(req.body);
    const userExists = await UserModel.findOne({ email: validResult.email })
      .lean()
      .exec();
    if (userExists) {
      throw new Error("User Already Exists!");
    }
    const user = await UserModel.create({
      fullName: validResult.fullName,
      email: validResult.email,
      password: hashSync(validResult.password, 10),
      birthDate: validResult.birthDate,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong",
        error: err,
      });
    }
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
      },
    });
  } catch (error) {
    console.error(error);
    // next(error)
    res.status(400).json({
      success: false,
      message: error.isJoi ? "Validation error" : "Something has gone wrong!",
      error: error,
    });
  }
};

// Function to login
const login = async (req, res) => {
  try {
    /**
     * Validation on data
     */
    const validResult = await userValidSchema.validateAsync(req.body);
    // Check whether the credentials entered matches the data in the database or not to verify users
    const user = await UserModel.findOne({ email: validResult.email });
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Incorrect Email/Password",
      });
    }
    if (!compareSync(validResult.password, user.password)) {
      return res.status(401).send({
        success: false,
        message: "Incorrect Email/Password",
      });
    }
    // User matched
    const payload = {
      id: user._id,
    };

    // Generate a token
    const token = jwt.sign(payload, process.env.SECRET_STRING, {
      expiresIn: "10h",
    });

    // Send the token back to the user
    return res.status(200).send({
      success: true,
      message: "Logged in successfully!",
      token: "Bearer " + token,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(401).json({
        success: false,
        message: "Login validation error. Invalid username/password",
        err: error,
      });
    }
    return res.status(401).json({
      success: false,
      message: "Something has gone wrong in login",
      err: error,
    });
  }
};

// Function to simulate protected routes
const protected = (req, res) => {
  return res.status(200).send({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
    },
  });
};

module.exports = { register, login, protected };
