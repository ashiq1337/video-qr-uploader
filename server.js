const express = require('express')
const multer = require('multer')
const fs = require('fs')
const QRCode = require('qrcode')

const app = express()
const port = process.env.PORT || 3000

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + '-' + file.originalname.replace(/\s/g, '-').toLowerCase()
    cb(null, fileName)
  },
})

const upload = multer({ storage })

// Serve uploaded videos
app.use('/uploads', express.static('uploads'))

// Endpoint to upload videos
app.post('/upload', upload.single('video'), (req, res) => {
  res.json({ message: 'Video uploaded successfully' })
})

// Endpoint to fetch all videos
app.get('/videos', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    const videos = files.map((file) => ({
      name: file,
      url: `/uploads/${file}`,
    }))
    res.json(videos)
  })
})

// Endpoint to generate a QR code for a video URL
app.get('/qrcode/:videoName', (req, res) => {
  const videoUrl = req.protocol + '://' + req.get('host') + '/uploads/' + req.params.videoName
  QRCode.toDataURL(videoUrl, (err, qrCodeUrl) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json({ qrCodeUrl })
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
