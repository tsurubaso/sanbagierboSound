//ffmpeg.js

const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

function deleteRegion(inputFile, start, end) {
  return new Promise((resolve) => {
    const output = inputFile.replace(/\.(\w+)$/, "_edited.$1");

    const args = [
      "-i", inputFile,
      "-filter_complex",
      // Remove the region by concatenating "before" + "after"
      `[0:a]atrim=end=${start}[p1];` +
      `[0:a]atrim=start=${end}[p2];` +
      `[p1][p2]concat=n=2:v=0:a=1[out]`,
      "-map", "[out]",
      "-y",
      output
    ];

    const ff = spawn(ffmpegPath, args);

    ff.on("close", () => resolve(output));
  });
}

module.exports = { deleteRegion };
