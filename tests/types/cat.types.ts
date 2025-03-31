export interface Cat {
  id: string;
  name: string;
  sex: 'Male' | 'Female';
  age: number;
  breed: string;
  colour: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewCat {
  name: string;
  sex: 'Male' | 'Female';
  age: number;
  breed: string;
  colour: string;
  likes: string[];
}

export interface ApiResponse<T> {
  status: 'OK' | 'FAILED';
  data: T;
}

export interface ErrorResponse {
  status: 'FAILED';
  data: {
    error: string;
  };
}
