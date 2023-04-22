var axios = require("axios").default;
const deleteMeeting = async (req, res, next) => {
  try {
    console.log(req.params.meetingID);
    const meetingID = req.params.meetingID;
    const response = await axios.delete(
      `${process.env.USER_MANAGEMENT_URL}api/texts/${meetingID}/`
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
const getMeetingMetaData = async (req, res, next) => {
  try {
    console.log(req.params.meetingID);
    const meetingID = req.params.meetingID;
    var response = await axios.post(
      `${process.env.USER_MANAGEMENT_URL}api/texts/${meetingID}/`,
      {
        userID: req.user.id,
        meetingID: meetingID,
      }
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
module.exports = {
  deleteMeeting,
  getMeetingMetaData,
};
