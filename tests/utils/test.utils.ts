import { test as base, APIRequestContext } from '@playwright/test';
import { Cat, NewCat, ApiResponse, ErrorResponse } from '../types/cat.types';

export type TestFixtures = {
  createdCatIds: string[];
};

// Extend the test context with our custom utilities
export const test = base.extend<TestFixtures>({
  createdCatIds: [async ({}, use) => {
    const ids: string[] = [];
    await use(ids);
  }, { scope: 'test' }]
});

// Setup and teardown hooks
export const setupTest = () => {
  test.beforeEach(async ({ createdCatIds }) => {
    createdCatIds.length = 0;
  });

  test.afterEach(async ({ request, createdCatIds }) => {
    if (createdCatIds.length === 0) return;

    for (const id of [...createdCatIds].reverse()) {
      try {
        const response = await request.delete(`${API_URL}/cats/${id}`, {
          failOnStatusCode: false
        });
        if (!response.ok() && response.status() !== 404) {
          console.warn(`Failed to delete test cat ${id}: ${response.status()}`);
        }
      } catch (error) {
        console.warn(`Error during cleanup of cat ${id}:`, error);
      }
    }
    createdCatIds.length = 0;
  });
};

// Common constants
export const API_URL = 'http://localhost:3000/api/v1';

// Helper functions
export async function createTestCat(
  request: APIRequestContext, 
  cat: NewCat, 
  ids: string[]
): Promise<Cat> {
  try {
    const response = await request.post(`${API_URL}/cats`, { 
      data: cat,
      failOnStatusCode: false 
    });
    
    if (!response.ok()) {
      const error = await response.json() as ErrorResponse;
      throw new Error(`Failed to create test cat: ${error.data.error}`);
    }

    const { data } = await response.json() as ApiResponse<Cat>;
    ids.push(data.id);
    return data;
  } catch (error) {
    throw new Error(`Failed to create test cat: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getValidCat(name?: string): NewCat {
  return {
    name: name || `TestCat_${Date.now()}`,
    sex: "Female",
    age: 3,
    breed: "Test Breed",
    colour: "White",
    likes: ["testing", "debugging"]
  };
}
