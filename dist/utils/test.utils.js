"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL = exports.setupTest = exports.test = void 0;
exports.createTestCat = createTestCat;
exports.getValidCat = getValidCat;
const test_1 = require("@playwright/test");
// Extend the test context with our custom utilities
exports.test = test_1.test.extend({
    createdCatIds: [async ({}, use) => {
            const ids = [];
            await use(ids);
        }, { scope: 'test' }]
});
// Setup and teardown hooks
const setupTest = () => {
    exports.test.beforeEach(async ({ createdCatIds }) => {
        createdCatIds.length = 0;
    });
    exports.test.afterEach(async ({ request, createdCatIds }) => {
        if (createdCatIds.length === 0)
            return;
        for (const id of [...createdCatIds].reverse()) {
            try {
                const response = await request.delete(`${exports.API_URL}/cats/${id}`, {
                    failOnStatusCode: false
                });
                if (!response.ok() && response.status() !== 404) {
                    console.warn(`Failed to delete test cat ${id}: ${response.status()}`);
                }
            }
            catch (error) {
                console.warn(`Error during cleanup of cat ${id}:`, error);
            }
        }
        createdCatIds.length = 0;
    });
};
exports.setupTest = setupTest;
// Common constants
exports.API_URL = 'http://localhost:3000/api/v1';
// Helper functions
async function createTestCat(request, cat, ids) {
    try {
        const response = await request.post(`${exports.API_URL}/cats`, {
            data: cat,
            failOnStatusCode: false
        });
        if (!response.ok()) {
            const error = await response.json();
            throw new Error(`Failed to create test cat: ${error.data.error}`);
        }
        const { data } = await response.json();
        ids.push(data.id);
        return data;
    }
    catch (error) {
        throw new Error(`Failed to create test cat: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function getValidCat(name) {
    return {
        name: name || `TestCat_${Date.now()}`,
        sex: "Female",
        age: 3,
        breed: "Test Breed",
        colour: "White",
        likes: ["testing", "debugging"]
    };
}
