var express = require("express");
var router = express.Router();

var userModel = require("../models/user.model");

const { isAdmin, verifyToken } = require("../middleware/token.middleware");

// approve (only admin can approve)
router.put("/:id/approve",verifyToken,isAdmin,async function (req, res, next) {
  try {
    let id = req.params.id;
    let user = await userModel.findByIdAndUpdate(id,{ approved: true },{ new: true },);
    return res.status(200).send({
      status: "200",
      message: "approve success.",
      data: [],
    });
  } catch (error) {
      res.status(500).send({
        status: "500",
        message: error,
        data: null,
      });
    }
  },
);

module.exports = router;
