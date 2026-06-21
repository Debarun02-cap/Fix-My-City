//Local Modules
const Complaint = require("../models/complaint");
const Status = require("../models/status");
const Photo = require("../models/photo");

exports.adminHome = (req, res, next) => {
  Complaint.fetchAll((registeredComplaints) => {
    const ids = registeredComplaints.map(c => c.id);
    Status.getLatestForIds(ids, (statusMap) => {
      res.json({
        success: true,
        complaints: registeredComplaints,
        statusMap: statusMap
      });
    });
  });
}
exports.getComplaintDetails = (req, res, next) => {
  const complaintId = req.params.complaintId;
  Complaint.findById(complaintId, complaint => {
    if (!complaint) {
      console.log("Error");
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    Status.getForComplaint(complaintId, (statusUpdates) => {
      res.json({
        success: true,
        complaint,
        statusUpdates
      });
    });
  });
}

exports.getupdateStatus = (req, res, next) => {
  const complaintId = req.params.complaintId;
  Complaint.findById(complaintId, complaint => {
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }
    res.json({
      success: true,
      complaint
    });
  });
}

exports.postUpdateStatus = (req, res, next) => {
  const complaintId = req.params.complaintId;
  const { workstatus, title, description, dateTime } = req.body;

  // Handle photo upload - save to MongoDB
  if (req.file) {
    Photo.savePhoto(req.file.buffer, req.file.mimetype, (err, photoId) => {
      if (err) {
        console.error('Error saving photo:', err);
        return res.status(500).json({
          success: false,
          message: "Error saving photo"
        });
      }

      const status = new Status(workstatus, title, description, photoId, dateTime);
      if (req.session && req.session.user) {
        status.userId = req.session.user.id;
      }

      Status.addToStatus(complaintId, status, (err) => {
        if (err) {
          console.error('Failed to save status:', err);
          return res.status(500).json({
            success: false,
            message: "Failed to save status update"
          });
        }
        return res.json({
          success: true,
          message: "Status updated successfully"
        });
      });
    });
  } else {
    // No photo uploaded
    const status = new Status(workstatus, title, description, '', dateTime);
    if (req.session && req.session.user) {
      status.userId = req.session.user.id;
    }

    Status.addToStatus(complaintId, status, (err) => {
      if (err) {
        console.error('Failed to save status:', err);
        return res.status(500).json({
          success: false,
          message: "Failed to save status update"
        });
      }
      return res.json({
        success: true,
        message: "Status updated successfully"
      });
    });
  }
}
