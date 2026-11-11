const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Không thể kết nối đến máy chủ.';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // JSON Server có thể trả về nội dung không phải JSON khi có lỗi.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const authApi = {
  async login(email, password) {
    const params = new URLSearchParams({ email: email.trim().toLowerCase(), password });
    const users = await request(`/users?${params.toString()}`);
    return users[0] || null;
  },

  async register(payload) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existing = await request(
      `/users?email=${encodeURIComponent(normalizedEmail)}`,
    );

    if (existing.length > 0) {
      throw new Error('Email này đã được sử dụng.');
    }

    return request('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        email: normalizedEmail,
        role: 'user',
        createdAt: new Date().toISOString(),
      }),
    });
  },
};

export const quizApi = {
  getAll: () => request('/quizzes?_sort=createdAt&_order=desc'),
  getPublished: () =>
    request('/quizzes?published=true&_sort=createdAt&_order=desc'),
  getById: (id) => request(`/quizzes/${id}`),
  create: (payload) =>
    request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (id) => request(`/quizzes/${id}`, { method: 'DELETE' }),
};

export const questionApi = {
  getAll: () => request('/questions'),
  getByQuiz: (quizId) =>
    request(`/questions?quizId=${quizId}&_sort=order&_order=asc`),
  create: (payload) =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (id) => request(`/questions/${id}`, { method: 'DELETE' }),
};

export const attemptApi = {
  getAll: () => request('/attempts?_sort=submittedAt&_order=desc'),
  getById: (id) => request(`/attempts/${id}`),
  getByUser: (userId) =>
    request(`/attempts?userId=${userId}&_sort=submittedAt&_order=desc`),
  getByQuiz: (quizId) =>
    request(`/attempts?quizId=${quizId}&_sort=submittedAt&_order=desc`),
  create: (payload) =>
    request('/attempts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  remove: (id) => request(`/attempts/${id}`, { method: 'DELETE' }),
};

export const userApi = {
  getAll: () => request('/users'),
};
