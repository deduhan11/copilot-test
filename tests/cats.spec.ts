import { expect } from '@playwright/test';
import { Cat } from './types/Cat';
import { ApiResponse, ErrorResponse } from './types/ApiResponse';
import { test, API_URL, setupTest, createTestCat } from './utils/test.utils';
import { CatFactory } from './factories/catFactory';

setupTest();

test.describe('Cats API', () => {
  test.describe('GET /cats', () => {
    test('should get all cats', async ({ request }) => {
      const response = await request.get(`${API_URL}/cats`);
      expect(response.ok()).toBeTruthy();
      const body = await response.json() as ApiResponse<Cat[]>;
      expect(body.status).toBe('OK');
      expect(Array.isArray(body.data)).toBeTruthy();
    });

    test('should return cats with correct schema', async ({ request }) => {
      const response = await request.get(`${API_URL}/cats`);
      const body = await response.json() as ApiResponse<Cat[]>;
      const cat = body.data[0];
      
      expect(Array.isArray(cat.likes)).toBeTruthy();
    });
  });

  test.describe('GET /cats/:id', () => {
    test('should get cat by valid id', async ({ request, createdCatIds }) => {
      const testCat = await createTestCat(request, CatFactory.getValidCat(), createdCatIds);

      const response = await request.get(`${API_URL}/cats/${testCat.id}`);
      expect(response.ok()).toBeTruthy();
      const body = await response.json() as ApiResponse<Cat>;
      expect(body.data.id).toBe(testCat.id);
    });

    test('should return 404 for non-existent cat id', async ({ request }) => {
      const response = await request.get(`${API_URL}/cats/nonexistent-id`);
      expect(response.status()).toBe(404);
    });
  });

  test.describe('POST /cats', () => {
    test('should create new cat with valid data', async ({ request, createdCatIds }) => {
      const validCat = CatFactory.getValidCat();
      const response = await request.post(`${API_URL}/cats`, {
        data: validCat,
        failOnStatusCode: false
      });
      expect(response.status()).toBe(201);
      const body = await response.json() as ApiResponse<Cat>;
      createdCatIds.push(body.data.id);
      expect(body.data.name).toBe(validCat.name);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
    });

    test('should reject invalid age', async ({ request }) => {
      const invalidCat = CatFactory.getInvalidCatWithNegativeAge();
      const response = await request.post(`${API_URL}/cats`, {
        data: invalidCat,
        failOnStatusCode: false
      });
      expect(response.status()).toBe(400);
    });

    test('should reject duplicate cat name', async ({ request, createdCatIds }) => {
      const validCat = CatFactory.getValidCat();
      await createTestCat(request, validCat, createdCatIds);
      
      const response = await request.post(`${API_URL}/cats`, { 
        data: validCat,
        failOnStatusCode: false 
      });
      expect(response.status()).toBe(400);
      const error = await response.json() as ErrorResponse;
      expect(error.data.error).toContain('already exists');
    });

    test('should reject missing required fields', async ({ request }) => {
      const invalidCat = CatFactory.getMissingFieldsCat();
      const response = await request.post(`${API_URL}/cats`, {
        data: invalidCat,
        failOnStatusCode: false
      });
      expect(response.status()).toBe(400);
    });
  });

  test.describe('PATCH /cats/:id', () => {
    test('should update existing cat', async ({ request, createdCatIds }) => {
      const newCat = CatFactory.getValidCat();
      const createdCat = await createTestCat(request, newCat, createdCatIds);
      
      const updates = {
        name: `Updated_${Date.now()}`,
        age: 2
      };

      const response = await request.patch(`${API_URL}/cats/${createdCat.id}`, {
        data: updates,
        failOnStatusCode: false
      });
      expect(response.ok()).toBeTruthy();
      const { data: updatedCat } = await response.json() as ApiResponse<Cat>;
      expect(updatedCat.name).toBe(updates.name);
      expect(updatedCat.age).toBe(updates.age);
      expect(updatedCat.sex).toBe(newCat.sex);
      expect(updatedCat.breed).toBe(newCat.breed);
      expect(updatedCat.likes).toEqual(newCat.likes);
    });

    test('should reject update with existing name', async ({ request, createdCatIds }) => {
      const [cat1, cat2] = CatFactory.getPairOfCats();
      
      await createTestCat(request, cat1, createdCatIds);
      const createdCat2 = await createTestCat(request, cat2, createdCatIds);

      const response = await request.patch(`${API_URL}/cats/${createdCat2.id}`, {
        data: { name: cat1.name },
        failOnStatusCode: false
      });
      expect(response.status()).toBe(400);
      const error = await response.json() as ErrorResponse;
      expect(error.data.error).toContain('already exists');
    });
  });

  test.describe('DELETE /cats/:id', () => {
    test('should delete existing cat', async ({ request, createdCatIds }) => {
      const newCat = CatFactory.getValidCat('ToDelete');
      const createdCat = await createTestCat(request, newCat, createdCatIds);

      const response = await request.delete(`${API_URL}/cats/${createdCat.id}`);
      expect(response.status()).toBe(204);

      const getResponse = await request.get(`${API_URL}/cats/${createdCat.id}`);
      expect(getResponse.status()).toBe(404);
    });

    test('should return 400 for non-existent cat id', async ({ request }) => {
      const response = await request.delete(`${API_URL}/cats/nonexistent-id`);
      expect(response.status()).toBe(400);
    });
  });
});