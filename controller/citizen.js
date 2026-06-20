//Local module
const Complaint = require("../models/complaint");
const Status = require("../models/status");
const Photo = require("../models/photo");

exports.userHome = (req, res, next) => {
  Complaint.fetchAll((registeredComplaints) => {
    const ids = registeredComplaints.map(c => c.id);
    Status.getLatestForIds(ids, (statusMap) => {
      res.json({
        registeredComplaints: registeredComplaints,
        statusMap: statusMap,
        isLoggedIn: req.isLoggedIn
      });
    });
  });
}
exports.getRegister = (req, res, next) => {
  res.render('citizen/register', { isLoggedIn: req.isLoggedIn });
}


exports.postRegister = (req, res, next) => {
  if (!req.body) {
    return res.status(400).send('Invalid request: Missing form data. Please ensure the form is submitted correctly.');
  }
  console.log("complaint registered " + req.body.title);

  // Handle photo upload - save to MongoDB
  if (req.file) {
    Photo.savePhoto(req.file.buffer, req.file.mimetype, (err, photoId) => {
      if (err) {
        console.error('Error saving photo:', err);
        return res.status(500).send('Error saving photo');
      }

      const complaint = new Complaint(req.body.issuetype, req.body.title, req.body.description, photoId, req.body.locationUrl);
      if (req.session && req.session.user) {
        complaint.userId = req.session.user.id;
      }
      complaint.save();
      res.render('citizen/registeredSuccess', { isLoggedIn: req.isLoggedIn });
    });
  } else {
    // No photo uploaded
    const complaint = new Complaint(req.body.issuetype, req.body.title, req.body.description, '', req.body.locationUrl);
    if (req.session && req.session.user) {
      complaint.userId = req.session.user.id;
    }
    complaint.save();
    res.render('citizen/registeredSuccess', { isLoggedIn: req.isLoggedIn });
  }
}

exports.getComplaintDetails = (req, res, next) => {
  const complaintId = req.params.complaintId;
  Complaint.findById(complaintId, complaint => {
    if (!complaint) {
      console.log("Error");
      return res.redirect('/user/home');
    }

    Status.getForComplaint(complaintId, (statusUpdates) => {
      res.render('citizen/complaintDetails', {
        complaint: complaint,
        statusUpdates: statusUpdates,
        isLoggedIn: req.isLoggedIn
      });
    });
  });
}
