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
    console.log(error.response.status);
    return res.status(error.response.status).send(error.response.data.error);
  }
};
module.exports = {
  deleteMeeting,
};
