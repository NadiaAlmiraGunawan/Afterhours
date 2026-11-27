const express = require("express");
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove,
  uploadImage,
  deleteImage,
} = require("../controllers/produk.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/", auth, getAll);
router.get("/:id", auth, getById);
router.post("/", auth, authorize("admin"), create);
router.put("/:id", auth, authorize("admin"), update);
router.delete("/:id", auth, authorize("admin"), remove);
router.post(
  "/:id/image",
  auth,
  authorize("admin"),
  upload.single("image"),
  uploadImage,
);
router.delete("/:id/image", auth, authorize("admin"), deleteImage);

module.exports = router;
