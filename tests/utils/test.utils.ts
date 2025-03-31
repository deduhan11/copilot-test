import { test as base, APIRequestContext } from '@playwright/test';
import { Cat } from '../types/Cat';
import { NewCat } from '../types/NewCat';
import { ApiResponse, ErrorResponse } from '../types/ApiResponse';

export type TestFixtures = {
  createdCatIds: string[];
};

export const test = base.extend<TestFixtures>({
  createdCatIds: [async ({}, use) => {
    const ids: string[] = [];
    await use(ids);
  }, { scope: 'test' }]
});

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

export const API_URL = 'http://localhost:3000/api/v1';

export async function createTestCat(
  request: APIRequestContext, 
  cat: NewCat, 
  ids: string[]
): Promise<Cat> {
  const response = await request.post(`${API_URL}/cats`, { 
    data: cat,
    failOnStatusCode: false 
  });
    
  const { data } = await response.json() as ApiResponse<Cat>;
  ids.push(data.id);
  return data;
}
