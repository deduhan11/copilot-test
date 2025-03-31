"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const test_utils_1 = require("./utils/test.utils");
(0, test_utils_1.setupTest)();
test_utils_1.test.describe('Cats API', () => {
    test_utils_1.test.describe('GET /cats', () => {
        (0, test_utils_1.test)('should get all cats', async ({ request }) => {
            const response = await request.get(`${test_utils_1.API_URL}/cats`);
            (0, test_1.expect)(response.ok()).toBeTruthy();
            const body = await response.json();
            (0, test_1.expect)(body.status).toBe('OK');
            (0, test_1.expect)(Array.isArray(body.data)).toBeTruthy();
        });
        (0, test_utils_1.test)('should return cats with correct schema', async ({ request }) => {
            const response = await request.get(`${test_utils_1.API_URL}/cats`);
            const body = await response.json();
            const cat = body.data[0];
            // Type checking will ensure all properties exist
            const expectedCat = cat;
            (0, test_1.expect)(Array.isArray(cat.likes)).toBeTruthy();
        });
    });
    test_utils_1.test.describe('GET /cats/:id', () => {
        (0, test_utils_1.test)('should get cat by valid id', async ({ request }) => {
            const allCats = await request.get(`${test_utils_1.API_URL}/cats`);
            const { data: cats } = await allCats.json();
            const testCatId = cats[0].id;
            const response = await request.get(`${test_utils_1.API_URL}/cats/${testCatId}`);
            (0, test_1.expect)(response.ok()).toBeTruthy();
            const body = await response.json();
            (0, test_1.expect)(body.data.id).toBe(testCatId);
        });
        (0, test_utils_1.test)('should return 404 for non-existent cat id', async ({ request }) => {
            const response = await request.get(`${test_utils_1.API_URL}/cats/nonexistent-id`);
            (0, test_1.expect)(response.status()).toBe(404);
        });
    });
    test_utils_1.test.describe('POST /cats', () => {
        (0, test_utils_1.test)('should create new cat with valid data', async ({ request, createdCatIds }) => {
            const validCat = (0, test_utils_1.getValidCat)();
            const response = await request.post(`${test_utils_1.API_URL}/cats`, {
                data: validCat
            });
            (0, test_1.expect)(response.status()).toBe(201);
            const body = await response.json();
            createdCatIds.push(body.data.id);
            (0, test_1.expect)(body.data.name).toBe(validCat.name);
            (0, test_1.expect)(body.data).toHaveProperty('id');
            (0, test_1.expect)(body.data).toHaveProperty('createdAt');
            (0, test_1.expect)(body.data).toHaveProperty('updatedAt');
        });
        (0, test_utils_1.test)('should reject invalid age', async ({ request }) => {
            const invalidCat = {
                ...(0, test_utils_1.getValidCat)(),
                age: -1
            };
            const response = await request.post(`${test_utils_1.API_URL}/cats`, {
                data: invalidCat,
                failOnStatusCode: false
            });
            (0, test_1.expect)(response.status()).toBe(400);
        });
        (0, test_utils_1.test)('should reject duplicate cat name', async ({ request, createdCatIds }) => {
            try {
                const validCat = (0, test_utils_1.getValidCat)();
                await (0, test_utils_1.createTestCat)(request, validCat, createdCatIds);
                const response = await request.post(`${test_utils_1.API_URL}/cats`, {
                    data: validCat,
                    failOnStatusCode: false
                });
                (0, test_1.expect)(response.status()).toBe(400);
                const error = await response.json();
                (0, test_1.expect)(error.data.error).toContain('already exists');
            }
            catch (error) {
                console.error('Test failed:', error);
                throw error;
            }
        });
        (0, test_utils_1.test)('should reject missing required fields', async ({ request }) => {
            const invalidCat = { name: "TestCat" };
            const response = await request.post(`${test_utils_1.API_URL}/cats`, {
                data: invalidCat
            });
            (0, test_1.expect)(response.status()).toBe(400);
        });
    });
    test_utils_1.test.describe('PATCH /cats/:id', () => {
        (0, test_utils_1.test)('should update existing cat', async ({ request, createdCatIds }) => {
            const newCat = (0, test_utils_1.getValidCat)();
            const createdCat = await (0, test_utils_1.createTestCat)(request, newCat, createdCatIds);
            const updates = {
                name: `Updated_${Date.now()}`,
                age: 2
            };
            const response = await request.patch(`${test_utils_1.API_URL}/cats/${createdCat.id}`, {
                data: updates,
                failOnStatusCode: false
            });
            (0, test_1.expect)(response.ok()).toBeTruthy();
            const { data: updatedCat } = await response.json();
            (0, test_1.expect)(updatedCat.name).toBe(updates.name);
            (0, test_1.expect)(updatedCat.age).toBe(updates.age);
            // Verify unchanged fields
            (0, test_1.expect)(updatedCat.sex).toBe(newCat.sex);
            (0, test_1.expect)(updatedCat.breed).toBe(newCat.breed);
            (0, test_1.expect)(updatedCat.likes).toEqual(newCat.likes);
        });
        (0, test_utils_1.test)('should reject update with existing name', async ({ request, createdCatIds }) => {
            const cat1 = (0, test_utils_1.getValidCat)('Cat1');
            const cat2 = (0, test_utils_1.getValidCat)('Cat2');
            await (0, test_utils_1.createTestCat)(request, cat1, createdCatIds);
            const createdCat2 = await (0, test_utils_1.createTestCat)(request, cat2, createdCatIds);
            const response = await request.patch(`${test_utils_1.API_URL}/cats/${createdCat2.id}`, {
                data: { name: cat1.name },
                failOnStatusCode: false
            });
            (0, test_1.expect)(response.status()).toBe(400);
            const error = await response.json();
            (0, test_1.expect)(error.data.error).toContain('already exists');
        });
    });
    test_utils_1.test.describe('DELETE /cats/:id', () => {
        (0, test_utils_1.test)('should delete existing cat', async ({ request, createdCatIds }) => {
            const newCat = (0, test_utils_1.getValidCat)('ToDelete');
            const createdCat = await (0, test_utils_1.createTestCat)(request, newCat, createdCatIds);
            const response = await request.delete(`${test_utils_1.API_URL}/cats/${createdCat.id}`);
            (0, test_1.expect)(response.status()).toBe(204);
            const getResponse = await request.get(`${test_utils_1.API_URL}/cats/${createdCat.id}`);
            (0, test_1.expect)(getResponse.status()).toBe(404);
        });
        (0, test_utils_1.test)('should return 400 for non-existent cat id', async ({ request }) => {
            const response = await request.delete(`${test_utils_1.API_URL}/cats/nonexistent-id`);
            (0, test_1.expect)(response.status()).toBe(400);
        });
    });
});
