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
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
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
"[project]/app/api/auth/check/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const wallet = searchParams.get("wallet");
    if (!wallet) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Wallet address required"
        }, {
            status: 400
        });
    }
    const creator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCreatorById"])(wallet);
    if (creator) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            exists: true,
            creator: {
                id: creator.id,
                display_name: creator.display_name,
                created_at: creator.created_at
            }
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        exists: false
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c68c36fc._.js.map