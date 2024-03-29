const axios = require("axios");
const updateUserStory = async (req, res, next) => {
  try {
    const userStoryID = req.params.id;
    const data = req.body;
    const response = await axios.put(
      `${process.env.USER_MANAGEMENT_URL}api/userstories/${userStoryID}/`,
      data
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
const deleteUserStory = async (req, res, next) => {
  try {
    const userStoryID = req.params.id;
    const response = await axios.delete(
      `${process.env.USER_MANAGEMENT_URL}api/userstories/${userStoryID}/`
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
const createUserStory = async (req, res, next) => {
  try {
    const data = req.body;
    const response = await axios.post(
      `${process.env.USER_MANAGEMENT_URL}api/userstories/`,
      data
    );
    if (response.status === 201) {
      return res.status(201).send(response.data);
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
module.exports = {
  updateUserStory,
  deleteUserStory,
  createUserStory,
};
