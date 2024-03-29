// Important requires
const UserModel = require("./user.model");
const { hashSync, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
var axios = require("axios").default;
const Token = require("../Token/token.model");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const userValidSchema =
  require("../../utils/ValidationSchemas/User.ValidationSchema").userValidSchemaRegister;
const userValidSchemaLogin =
  require("../../utils/ValidationSchemas/User.ValidationSchema").userValidSchemaLogin;
const createError = require("http-errors");
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
      return res.status(403).json({
        success: false,
        message: "User already exists!",
      });
    }
    const user = await UserModel.create({
      firstName: validResult.firstName,
      lastName: validResult.lastName,
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

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.CLIENT_URL}users/${user.id}/verify/${token.token}`;
    const html = `<h2>Click on the below link to verify your email</h2> <a href=${url}>${url}</a>`;
    await sendEmail(user.email, "Verify Email", html);

    return res.status(201).json({
      success: true,
      message: "An email is sent to your account. Please verify",
      user: {
        id: user._id,
        email: user.email,
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
    const validResult = await userValidSchemaLogin.validateAsync(req.body);
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

    // Email not verified
    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
      }

      const url = `${process.env.CLIENT_URL}users/${user.id}/verify/${token.token}`;
      const html = `<h2>Click on the below link to verify your email</h2> <a href=${url}>${url}</a>`;
      await sendEmail(user.email, "Verify Email", html);

      return res.status(400).send({
        message: "An Email sent to your account please verify",
      });
    }

    const timestamp = Date.now();

    // User matched
    const payload = {
      id: user._id,
      timestamp,
    };

    // Generate an access token
    const token = jwt.sign(payload, process.env.SECRET_STRING, {
      expiresIn: "1h",
    });

    // Generate a refresh token
    const refreshToken = jwt.sign(payload, process.env.SECRET_STRING_REFRESH, {
      expiresIn: "1d",
    });

    await UserModel.updateOne(
      { _id: user._id },
      { refreshToken: encrypt(refreshToken) }
    );

    // Send the token back to the user
    return res.status(200).send({
      success: true,
      message: "Logged in successfully!",
      token: "Bearer " + token,
      refresh: "Bearer " + encrypt(refreshToken),
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

const getProfileDetails = async (req, res) => {
  const data = {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    birthDate:
      req.user.birthDate === null || req.user.birthDate === undefined
        ? ""
        : req.user.birthDate,
    phoneNo: req.user.phoneNo === undefined ? "" : req.user.phoneNo,
    gender: req.user.gender === undefined ? "" : req.user.gender,
    title: req.user.title === undefined ? "" : req.user.title,
    address: req.user.address === undefined ? "" : req.user.address,
    bio: req.user.bio === undefined ? "" : req.user.bio,
  };

  return res.status(200).send(data);
};

const updateProfile = async (req, res) => {
  // Send the request using axios
  axios
    .post(`${process.env.USER_MANAGEMENT_URL}api/users/profile`, {
      request: req.body,
      userid: req.user.id,
    })
    .then((response) => {
      return res.status(200).send({ sucess: "true" });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send(error);
    });
};

const verifyToken = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(400).send({ message: "Invalid or Expired link" });

    await UserModel.updateOne({ _id: user._id }, { verified: true });
    await token.remove();
    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const validateLink = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(400).send({ message: "Invalid or Expired link" });

    res.status(200).send({ message: "Valid Link" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(400).send({ message: "Invalid or Expired link" });

    await token.remove();

    await UserModel.updateOne(
      { _id: user._id },
      { password: hashSync(req.body.password, 10) }
    );

    res.status(200).send({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) return res.status(400).send({ message: "Invalid Email" });

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const url = `${process.env.CLIENT_URL}users/${user.id}/forget/${token.token}`;
    const html = `<h2>Click on the below link to go to the reset password page, to change your password</h2> <a href=${url}>${url}</a>`;
    await sendEmail(user.email, "Reset Password", html);

    return res.status(200).send({
      message:
        "An Email sent to your account. Click on the link to reset password",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getHistory = async (req, res) => {
  // Send the request using axios
  axios
    .post(`${process.env.USER_MANAGEMENT_URL}api/texts/`, {
      userID: req.user.id,
    })
    .then((response) => {
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
};

const getMeetingData = async (req, res, next) => {
  try {
    console.log(req.params.meetingID);
    const meetingID = req.params.meetingID;
    const response = await axios.post(
      `${process.env.USER_MANAGEMENT_URL}api/userstories/meeting/`,
      {
        userID: req.user.id,
        textID: meetingID,
      }
    );
    if (response.status === 200) {
      return res.status(200).send(response.data);
    } else {
      return res.status(response.status).send(response.data);
    }
  } catch (error) {
    console.error(error.message);
    if (error?.response) {
      console.log(error.response?.status);
      return res
        .status(error.response?.status)
        .send(error.response?.data.error);
    } else if (error?.request) {
      return res.status(500).send(error.request);
    } else {
      res.status(500).send(error.message);
    }
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    console.log(req.params.meetingID);
    const meetingID = req.params.meetingID;
    const response = await axios.delete(
      `${process.env.USER_MANAGEMENT_URL}api/texts/id/${meetingID}/`
    );
    console.log(response.data);
    if (response.status === 200) {
      return res.status(200).send(response.data);
    } else {
      return res.status(response.status).send(response.data);
    }
  } catch (error) {
    console.error(error.message);
    if (error?.response) {
      console.log(error.response?.status);
      return res
        .status(error.response?.status)
        .send(error.response?.data.error);
    } else if (error?.request) {
      return res.status(500).send(error.request);
    } else {
      res.status(500).send(error.message);
    }
  }
};

const refreshRoute = (req, res) => {
  // Extract the token from the header
  const authHeader = req.headers["authorization"];
  var refreshToken = authHeader && authHeader.split(" ")[1];
  // Check whether the refresh token is null or not
  if (refreshToken == null) return res.sendStatus(401);
  refreshToken = decrypt(refreshToken.toString());
  // Verify the refresh token
  jwt.verify(
    refreshToken,
    process.env.SECRET_STRING_REFRESH,
    (err, payload) => {
      console.log(err);
      // Send forbidden status
      if (err) return res.sendStatus(403);
      const timestamp = Date.now();
      // User matched
      const accessPayload = {
        id: payload.id,
        timestamp,
      };
      // Generate new access token
      // Generate an access token
      const accessToken = jwt.sign(accessPayload, process.env.SECRET_STRING, {
        expiresIn: "1h",
      });
      res.status(200).send({ accessToken: accessToken });
    }
  );
};
//Encrypting text
function encrypt(text) {
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.AES_KEY),
    process.env.AES_IV
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("hex");
}

// Decrypting text
function decrypt(text) {
  let encryptedText = Buffer.from(text, "hex");

  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.AES_KEY),
    process.env.AES_IV
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  register,
  login,
  protected,
  getProfileDetails,
  updateProfile,
  verifyToken,
  forgetPassword,
  validateLink,
  resetPassword,
  getHistory,
  refreshRoute,
  encrypt,
  getMeetingData,
  deleteMeeting,
};
