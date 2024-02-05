const express = require("express");
const fs = require("fs");
const app = express();

app.get("/", (req, res) => {
  const videoPath = "./video/video.mp4";
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;
  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

//wildcard route ----------------------------------------------
app.get("*", (req, res) => {
  try {
    const obj = {
      status: false,
      error: "route doesn't exists",
    };
    res.status(404).json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

//listening on port 3000 --------------------------------------
const port = 3000;
app.listen(port, function () {
  console.log("app listening on port : " + port);
});
