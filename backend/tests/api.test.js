"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let app;
let mongo = null;
let skipTests = false; 
let skipReason = "";
(0, vitest_1.beforeAll)(async () => {
    process.env.JWT_SECRET = "test_secret";
    try {
        mongo = await mongodb_memory_server_1.MongoMemoryServer.create({ instance: { ip: "127.0.0.1" } });
        await mongoose_1.default.connect(mongo.getUri());
        const mod = await Promise.resolve().then(() => __importStar(require("../src/app")));
        app = mod.createApp();
    }
    catch (err) {
        skipTests = true;
        skipReason = err instanceof Error ? err.message : "mongodb-memory-server could not start";
        console.warn("Skipping API tests:", skipReason);
    }
});
(0, vitest_1.afterAll)(async () => {
    if (mongo) {
        await mongoose_1.default.connection.close();
        await mongo.stop();
    }
});
(0, vitest_1.beforeEach)(async () => {
    if (skipTests)
        return;
    const collections = await mongoose_1.default.connection.db.listCollections().toArray();
    await Promise.all(collections.map(({ name }) => mongoose_1.default.connection.db.collection(name).deleteMany({})));
});
(0, vitest_1.describe)("Auth + chores flow", () => {
    (0, vitest_1.it)("registers and logs in a user", async () => {
        if (skipTests)
            return;
        const email = "testuser@example.com";
        const password = "secret123";
        const registerRes = await (0, supertest_1.default)(app).post("/api/auth/register").send({ name: "Test", email, password });
        (0, vitest_1.expect)(registerRes.status).toBe(200);
        (0, vitest_1.expect)(registerRes.body.token).toBeTruthy();
        (0, vitest_1.expect)(registerRes.body.user.email).toBe(email);
        const loginRes = await (0, supertest_1.default)(app).post("/api/auth/login").send({ email, password });
        (0, vitest_1.expect)(loginRes.status).toBe(200);
        (0, vitest_1.expect)(loginRes.body.token).toBeTruthy();
        (0, vitest_1.expect)(loginRes.body.user.email).toBe(email);
    });
    (0, vitest_1.it)("creates household and seeds chores accessible via /api/chores", async () => {
        if (skipTests)
            return;
        const email = "household@example.com";
        const password = "secret123";
        const registerRes = await (0, supertest_1.default)(app).post("/api/auth/register").send({ name: "Householder", email, password });
        const token = registerRes.body.token;
        const householdRes = await (0, supertest_1.default)(app)
            .post("/api/households")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Test Household" });
        (0, vitest_1.expect)(householdRes.status).toBe(200);
        (0, vitest_1.expect)(householdRes.body.household.name).toBe("Test Household");
        const choresRes = await (0, supertest_1.default)(app).get("/api/chores").set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(choresRes.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(choresRes.body.chores)).toBe(true);
        (0, vitest_1.expect)(choresRes.body.chores.length).toBeGreaterThanOrEqual(4);
    });
});
(0, vitest_1.describe)("Approval rules", () => {
    const uniqueEmail = (prefix) => `${prefix}-${Date.now()}@example.com`;
    const createHouseholdWithUser = async () => {
        const email = uniqueEmail("owner");
        const password = "secret123";
        const registerRes = await (0, supertest_1.default)(app).post("/api/auth/register").send({ name: "Owner", email, password });
        const token = registerRes.body.token;
        const userId = registerRes.body.user.id;
        const hhRes = await (0, supertest_1.default)(app)
            .post("/api/households")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "HH" });
        return { token, userId, inviteCode: hhRes.body.household.inviteCode };
    };
    const getFirstChoreId = async (token) => {
        const choresRes = await (0, supertest_1.default)(app).get("/api/chores").set("Authorization", `Bearer ${token}`);
        return choresRes.body.chores[0]._id;
    };
    (0, vitest_1.it)("blocks second submission when user already has a pending approval", async () => {
        if (skipTests)
            return;
        const { token, userId } = await createHouseholdWithUser();
        const choreId = await getFirstChoreId(token);
        const entryRes = await (0, supertest_1.default)(app)
            .post("/api/calendar")
            .set("Authorization", `Bearer ${token}`)
            .send({ choreId, date: new Date().toISOString(), assignedToUserId: userId });
        const entryId = entryRes.body.entry._id;
        const firstSubmit = await (0, supertest_1.default)(app).post(`/api/calendar/${entryId}/submit`).set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(firstSubmit.status).toBe(200);
        const secondSubmit = await (0, supertest_1.default)(app).post(`/api/calendar/${entryId}/submit`).set("Authorization", `Bearer ${token}`);
        (0, vitest_1.expect)(secondSubmit.status).toBe(400);
        (0, vitest_1.expect)(secondSubmit.body.error).toMatch(/pending/i);
    });
    (0, vitest_1.it)("prevents approving your own submission and allows another household member", async () => {
        if (skipTests)
            return;
        const { token: tokenA, userId: userA, inviteCode } = await createHouseholdWithUser();
        const registerB = await (0, supertest_1.default)(app)
            .post("/api/auth/register")
            .send({ name: "Reviewer", email: uniqueEmail("reviewer"), password: "secret123" });
        const tokenB = registerB.body.token;
        await (0, supertest_1.default)(app).post("/api/households/join").set("Authorization", `Bearer ${tokenB}`).send({ inviteCode });
        const choreId = await getFirstChoreId(tokenA);
        const entryRes = await (0, supertest_1.default)(app)
            .post("/api/calendar")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ choreId, date: new Date().toISOString(), assignedToUserId: userA });
        const entryId = entryRes.body.entry._id;
        const submitRes = await (0, supertest_1.default)(app).post(`/api/calendar/${entryId}/submit`).set("Authorization", `Bearer ${tokenA}`);
        const approvalId = submitRes.body.approval._id;
        const selfReview = await (0, supertest_1.default)(app)
            .post(`/api/approvals/${approvalId}/review`)
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ action: "approve" });
        (0, vitest_1.expect)(selfReview.status).toBe(403);
        const otherReview = await (0, supertest_1.default)(app)
            .post(`/api/approvals/${approvalId}/review`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ action: "approve", comment: "ok" });
        (0, vitest_1.expect)(otherReview.status).toBe(200);
        (0, vitest_1.expect)(otherReview.body.approval.status).toBe("approved");
        (0, vitest_1.expect)(otherReview.body.entry.status).toBe("approved");
    });
});
