const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import * as ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegPath);

import * as streamifier from 'streamifier';

/**
 * Convert input audio buffer (e.g. M4A) to WAV 16kHz mono PCM buffer
 */
export async function convertToWav(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const inputStream = streamifier.createReadStream(buffer);

    ffmpeg(inputStream)
      .inputFormat('m4a') // specify input format if needed
      .audioChannels(1) // mono
      .audioFrequency(16000) // 16kHz sample rater
      .audioCodec('pcm_s16le') // 16-bit PCM little endian
      .format('wav')
      .on('error', (err) => reject(err))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on('data', (chunk) => chunks.push(chunk));
  });
}
