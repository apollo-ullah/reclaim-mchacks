/**
 * Video processing utilities for Reclaim
 *
 * Handles:
 * 1. Extracting first frame for LSB watermarking
 * 2. Re-embedding watermarked first frame back into video
 * 3. Video duration validation (max 10 seconds)
 */

import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Helper to clean up temp files
 */
async function cleanup(...paths: string[]) {
  for (const p of paths) {
    await fs.unlink(p).catch(() => {});
  }
}

/**
 * Get video metadata including duration
 */
export async function getVideoMetadata(videoBuffer: Buffer): Promise<VideoMetadata> {
  const tempDir = os.tmpdir();
  const videoPath = path.join(tempDir, `reclaim-video-${randomUUID()}.mp4`);

  await fs.writeFile(videoPath, videoBuffer);

  try {
    const metadata = await new Promise<VideoMetadata>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to probe video: ${err.message}`));
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === "video");
        if (!videoStream) {
          reject(new Error("No video stream found"));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || "unknown",
        });
      });
    });

    return metadata;
  } finally {
    await cleanup(videoPath);
  }
}

/**
 * Extract the first frame from a video as PNG buffer
 */
export async function extractFirstFrame(videoBuffer: Buffer): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const sessionId = randomUUID();
  const videoPath = path.join(tempDir, `reclaim-video-${sessionId}.mp4`);
  const framePath = path.join(tempDir, `reclaim-frame-${sessionId}.png`);

  await fs.writeFile(videoPath, videoBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .frames(1)
        .outputOptions(["-vf", "select=eq(n\\,0)"])
        .output(framePath)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`Failed to extract frame: ${err.message}`)))
        .run();
    });

    const frameBuffer = await fs.readFile(framePath);
    return frameBuffer;
  } finally {
    await cleanup(videoPath, framePath);
  }
}

/**
 * Replace the first frame of a video with a watermarked version
 * This overlays the watermarked image on the first frame
 */
export async function embedWatermarkedFrame(
  videoBuffer: Buffer,
  watermarkedFrameBuffer: Buffer
): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const sessionId = randomUUID();
  const videoPath = path.join(tempDir, `reclaim-video-${sessionId}.mp4`);
  const framePath = path.join(tempDir, `reclaim-wm-frame-${sessionId}.png`);
  const outputPath = path.join(tempDir, `reclaim-output-${sessionId}.mp4`);

  await fs.writeFile(videoPath, videoBuffer);
  await fs.writeFile(framePath, watermarkedFrameBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      // Overlay the watermarked frame on the first frame only
      // Using complex filter to replace first frame
      ffmpeg(videoPath)
        .input(framePath)
        .complexFilter([
          // Overlay the watermarked frame on the first frame (t < 0.04 = ~1 frame at 24fps)
          {
            filter: "overlay",
            options: {
              enable: "lt(t,0.04)",
            },
            inputs: ["0:v", "1:v"],
            outputs: "v",
          },
        ])
        .outputOptions([
          "-map", "[v]",
          "-map", "0:a?", // Include audio if present
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "18", // High quality to preserve watermark
          "-c:a", "copy",
          "-movflags", "+faststart",
        ])
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(new Error(`Failed to embed frame: ${err.message}`)))
        .run();
    });

    const outputBuffer = await fs.readFile(outputPath);
    return outputBuffer;
  } finally {
    await cleanup(videoPath, framePath, outputPath);
  }
}

/**
 * Validate video duration (max 10 seconds)
 */
export async function validateVideoDuration(
  videoBuffer: Buffer,
  maxDuration: number = 10
): Promise<{ valid: boolean; duration: number; message?: string }> {
  try {
    const metadata = await getVideoMetadata(videoBuffer);

    if (metadata.duration > maxDuration) {
      return {
        valid: false,
        duration: metadata.duration,
        message: `Video is ${metadata.duration.toFixed(1)}s long. Maximum allowed is ${maxDuration}s.`,
      };
    }

    return {
      valid: true,
      duration: metadata.duration,
    };
  } catch (error) {
    return {
      valid: false,
      duration: 0,
      message: error instanceof Error ? error.message : "Failed to validate video",
    };
  }
}

/**
 * Check if ffmpeg is available on the system
 */
export async function isFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      resolve(!err);
    });
  });
}
