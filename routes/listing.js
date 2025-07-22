const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage })

/// req.params-used to get info from url like /:id
///re.body - data user n diya vo lane k liye

router.route("/")
    .get(wrapAsync(listingController.index)) //Index Route
    .post(isLoggedIn, validateListing,upload.single('listing[image]'), wrapAsync(listingController.createListing)); //Create Route
// wrapasync try catch ko ache se likhne m madad krta h

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))//Show Route
    .put(isLoggedIn, isOwner, validateListing,upload.single('listing[image]'), wrapAsync(listingController.updateListing))//Update Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));//Delete Route

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;