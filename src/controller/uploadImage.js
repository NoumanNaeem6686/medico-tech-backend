const express = require('express');
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../middlewares/multer");

 router.post('/upload', upload.single('image'), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (err, result){
    if(err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error"
      })
    }

    res.status(200).json({
      success: true,
      message:"Uploaded!",
      data: result
    })
  })
});

router.post('/deleteImage', async (req, res) => {
  const { id } = req.body;

  try {
    const result = await cloudinary.uploader.destroy(id);
    res.send({ message: 'Image deleted successfully', result });
  } catch (error) {
    console.error('Failed to delete image:', error);
    res.status(500).send({ message: 'Failed to delete image', error });
  }
});


module.exports = router;