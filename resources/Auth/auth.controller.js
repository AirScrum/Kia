// Important requires
const UserModel = require("./user.model");
const { compareSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const userValidSchema =
  require("../../utils/ValidationSchemas/User.ValidationSchema").userValidSchemaRegister;
// Function to register
const register = async (req, res) => {
  try {
    /**
     * Validation on data
     */
    const validResult = await userValidSchema.validateAsync(req.body);
    const userExists = await UserModel.findOne({ email: validResult.email })
      .lean()
      .exec();
    if (userExists) {
      throw new Error("User Already Exists!");
    }
    // Make a new instance of user schema
    const user = new UserModel({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      birthDate: req.body.birthDate,
    });

    // Save instance to mongoDB
    user
      .save()
      .then((user) => {
        res.send({
          success: true,
          message: "User created successfully.",
          user: {
            id: user._id,
            email: user.email,
          },
        });
      })
      .catch((err) => {
        res.send({
          success: false,
          message: "Something went wrong",
          error: err,
        });
      });
  } catch (error) {
    console.error(error);
    if (error.isJoi) {
      res.status(422).end();
    } else {
      res.status(400).end();
    }
  }
};

// Function to login
const login = (req, res) => {
  /**
   * Validation on data
   */

  // Check whether the credentials entered matches the data in the database or not to verify users
  UserModel.findOne({ email: req.body.email }).then((user) => {
    // No user found or incorrect password
    if (!user || !compareSync(req.body.password, user.password)) {
      return res.status(401).send({
        success: false,
        message: "Could not find the user",
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
  });
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
