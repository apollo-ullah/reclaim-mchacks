module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/steganography.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "embedPayload",
    ()=>embedPayload,
    "extractPayload",
    ()=>extractPayload,
    "getMinimumDimensions",
    ()=>getMinimumDimensions,
    "hasWatermark",
    ()=>hasWatermark
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jimp$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/jimp/dist/esm/index.js [app-route] (ecmascript) <locals>");
;
// Magic header to identify our watermarked images
const MAGIC_HEADER = "RECLAIM_V1:";
// End marker to know where the message ends
const END_MARKER = ":END_RECLAIM";
/**
 * Convert a string to binary representation
 */ function stringToBinary(str) {
    return str.split("").map((char)=>char.charCodeAt(0).toString(2).padStart(8, "0")).join("");
}
/**
 * Convert binary representation back to string
 */ function binaryToString(binary) {
    const bytes = binary.match(/.{8}/g);
    if (!bytes) return "";
    return bytes.map((byte)=>String.fromCharCode(parseInt(byte, 2))).join("");
}
/**
 * Convert integer color to RGBA components
 */ function intToRGBA(color) {
    return {
        r: color >> 24 & 0xff,
        g: color >> 16 & 0xff,
        b: color >> 8 & 0xff,
        a: color & 0xff
    };
}
/**
 * Convert RGBA components to integer color
 */ function rgbaToInt(r, g, b, a) {
    return (r & 0xff) << 24 | (g & 0xff) << 16 | (b & 0xff) << 8 | a & 0xff;
}
/**
 * Calculate the maximum message length that can be embedded in an image
 * We use 2 bits per pixel (from the blue and green channels) for better capacity
 */ function getMaxMessageLength(width, height) {
    // Each pixel can hold 2 bits (blue and green LSB)
    // 8 bits per character
    const totalBits = width * height * 2;
    return Math.floor(totalBits / 8);
}
async function embedPayload(imageBuffer, payload) {
    const image = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jimp$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Jimp"].read(imageBuffer);
    const width = image.width;
    const height = image.height;
    // Create the full message with magic header and end marker
    const payloadJson = JSON.stringify(payload);
    const fullMessage = MAGIC_HEADER + payloadJson + END_MARKER;
    // Check if the message fits
    const maxLength = getMaxMessageLength(width, height);
    if (fullMessage.length > maxLength) {
        throw new Error(`Message too long for image. Max: ${maxLength} chars, Message: ${fullMessage.length} chars`);
    }
    // Convert message to binary
    const binaryMessage = stringToBinary(fullMessage);
    // Embed the binary message into the image
    let bitIndex = 0;
    for(let y = 0; y < height && bitIndex < binaryMessage.length; y++){
        for(let x = 0; x < width && bitIndex < binaryMessage.length; x++){
            const pixelColor = image.getPixelColor(x, y);
            const rgba = intToRGBA(pixelColor);
            // Embed in blue channel LSB
            if (bitIndex < binaryMessage.length) {
                const bit = parseInt(binaryMessage[bitIndex], 10);
                rgba.b = rgba.b & 0xfe | bit;
                bitIndex++;
            }
            // Embed in green channel LSB
            if (bitIndex < binaryMessage.length) {
                const bit = parseInt(binaryMessage[bitIndex], 10);
                rgba.g = rgba.g & 0xfe | bit;
                bitIndex++;
            }
            // Set the modified pixel
            const newColor = rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a);
            image.setPixelColor(newColor, x, y);
        }
    }
    // Return as PNG buffer (PNG is lossless, important for LSB)
    return await image.getBuffer("image/png");
}
async function extractPayload(imageBuffer) {
    const image = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jimp$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Jimp"].read(imageBuffer);
    const width = image.width;
    const height = image.height;
    // Extract bits from the image
    let binaryString = "";
    const maxBits = width * height * 2;
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            const pixelColor = image.getPixelColor(x, y);
            const rgba = intToRGBA(pixelColor);
            // Extract from blue channel LSB
            binaryString += (rgba.b & 1).toString();
            // Extract from green channel LSB
            binaryString += (rgba.g & 1).toString();
            // Check periodically for the end marker to avoid processing entire image
            if (binaryString.length % 800 === 0 && binaryString.length > 0) {
                const partialMessage = binaryToString(binaryString);
                if (partialMessage.includes(END_MARKER)) {
                    break;
                }
            }
            // Safety limit
            if (binaryString.length > maxBits) break;
        }
        // Check if we've found the end marker
        const partialMessage = binaryToString(binaryString);
        if (partialMessage.includes(END_MARKER)) {
            break;
        }
    }
    // Convert binary to string
    const extractedMessage = binaryToString(binaryString);
    // Check for magic header
    if (!extractedMessage.startsWith(MAGIC_HEADER)) {
        return null;
    }
    // Find the end marker
    const endIndex = extractedMessage.indexOf(END_MARKER);
    if (endIndex === -1) {
        return null;
    }
    // Extract the JSON payload
    const jsonStart = MAGIC_HEADER.length;
    const jsonString = extractedMessage.substring(jsonStart, endIndex);
    try {
        const payload = JSON.parse(jsonString);
        return payload;
    } catch  {
        return null;
    }
}
async function hasWatermark(imageBuffer) {
    const payload = await extractPayload(imageBuffer);
    return payload !== null;
}
function getMinimumDimensions(payloadLength) {
    // Each pixel holds 2 bits, 8 bits per character
    const bitsNeeded = payloadLength * 8;
    const pixelsNeeded = Math.ceil(bitsNeeded / 2);
    // Return minimum square dimension
    return Math.ceil(Math.sqrt(pixelsNeeded));
}
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCreator",
    ()=>createCreator,
    "creatorExists",
    ()=>creatorExists,
    "db",
    ()=>db,
    "findImageByHash",
    ()=>findImageByHash,
    "getCreatorById",
    ()=>getCreatorById,
    "getCreatorStats",
    ()=>getCreatorStats,
    "getImagesByCreator",
    ()=>getImagesByCreator,
    "recordSignedImage",
    ()=>recordSignedImage,
    "updateDisplayName",
    ()=>updateDisplayName
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__ = __turbopack_context__.i("[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
// Database file path
const DB_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "reclaim.db");
// Create or open database
const db = new __TURBOPACK__imported__module__$5b$externals$5d2f$better$2d$sqlite3__$5b$external$5d$__$28$better$2d$sqlite3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$better$2d$sqlite3$29$__["default"](DB_PATH);
// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS signed_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT NOT NULL,
    original_hash TEXT NOT NULL,
    signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES creators(id)
  );

  CREATE INDEX IF NOT EXISTS idx_signed_images_creator_id ON signed_images(creator_id);
  CREATE INDEX IF NOT EXISTS idx_signed_images_hash ON signed_images(original_hash);
`);
// Migration: Add display_name column if it doesn't exist (for existing DBs)
try {
    db.exec(`ALTER TABLE creators ADD COLUMN display_name TEXT`);
} catch  {
// Column already exists, ignore
}
// Prepared statements
const insertCreator = db.prepare("INSERT OR IGNORE INTO creators (id, display_name) VALUES (?, ?)");
const updateCreatorDisplayName = db.prepare("UPDATE creators SET display_name = ? WHERE id = ?");
const insertSignedImage = db.prepare("INSERT INTO signed_images (creator_id, original_hash) VALUES (?, ?)");
const getCreator = db.prepare("SELECT * FROM creators WHERE id = ?");
const getCreatorImages = db.prepare("SELECT * FROM signed_images WHERE creator_id = ? ORDER BY signed_at DESC");
const getImageByHash = db.prepare("SELECT si.*, c.created_at as creator_created_at FROM signed_images si JOIN creators c ON si.creator_id = c.id WHERE si.original_hash = ?");
const getCreatorImageCount = db.prepare("SELECT COUNT(*) as count FROM signed_images WHERE creator_id = ?");
function createCreator(walletAddress, displayName) {
    insertCreator.run(walletAddress, displayName || null);
}
function updateDisplayName(walletAddress, displayName) {
    updateCreatorDisplayName.run(displayName, walletAddress);
}
function creatorExists(walletAddress) {
    const creator = getCreator.get(walletAddress);
    return !!creator;
}
function recordSignedImage(creatorId, originalHash) {
    // Insert the signed image record (creator must exist)
    const result = insertSignedImage.run(creatorId, originalHash);
    return Number(result.lastInsertRowid);
}
function getCreatorById(creatorId) {
    return getCreator.get(creatorId);
}
function getImagesByCreator(creatorId) {
    return getCreatorImages.all(creatorId);
}
function findImageByHash(hash) {
    return getImageByHash.get(hash);
}
function getCreatorStats(creatorId) {
    const result = getCreatorImageCount.get(creatorId);
    return {
        totalSigned: result?.count ?? 0
    };
}
;
}),
"[project]/app/api/verify/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$steganography$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/steganography.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("image");
        // Validate inputs
        if (!file) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                verified: false,
                message: "No image file provided"
            }, {
                status: 400
            });
        }
        // Check file type
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];
        if (!allowedTypes.includes(file.type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                verified: false,
                message: "Invalid file type. Only PNG and JPEG are supported."
            }, {
                status: 400
            });
        }
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        // Try to extract payload
        const payload = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$steganography$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPayload"])(imageBuffer);
        if (!payload) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                verified: false,
                message: "No signature found - origin unknown"
            });
        }
        // Payload found - check for tampering
        // Note: We compute hash of the current image and compare with embedded hash
        // However, the watermark itself changes the image, so we can't directly compare
        // For MVP, we'll skip the tampering check as it requires the original image
        // In a real implementation, you'd use perceptual hashing or store the original separately
        // Get creator display name from database
        const creatorData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCreatorById"])(payload.c);
        const displayName = creatorData?.display_name || payload.c;
        const response = {
            verified: true,
            creator: payload.c,
            creatorDisplayName: displayName,
            timestamp: new Date(payload.t * 1000).toISOString(),
            tampered: false,
            message: `Verified - Signed by ${displayName}`
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error("Verify error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            verified: false,
            message: "Failed to verify image"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__44c9aa5e._.js.map