// Important requires
const User = require("./user.model");
const createUser = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    if (!user) {
      return res.status(400).end();
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
  }
};
const getUser = () => async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await User.findOne({ _id: id }).lean().exec();
    if (!doc) {
      return res.status(404).end();
    }
    res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
const updateUser = () => async (req, res) => {
  try {
    const doc = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    });
    if (!doc) {
      return res.status(400).end();
    }
    res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const removeUser = () => async (req, res) => {
  try {
    const doc = await User.findOneAndRemove({
      _id: req.params.id,
    }).exec();
    if (!doc) {
      return res.status(400).end();
    }
    res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
module.exports = { createUser, updateUser, getUser, removeUser };
