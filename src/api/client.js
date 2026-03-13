import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const unwrap = (res) => res.data?.data ?? res.data;

// 用户与认证
export async function login(username, password) {
  const res = await api.post('/users/login', { username, password });
  return unwrap(res);
}

export async function register(payload) {
  const res = await api.post('/users/register', payload);
  return unwrap(res);
}

export async function fetchUserInfo(id) {
  const res = await api.get('/users/detail', { params: { id } });
  return unwrap(res);
}

export async function updateUser(id, body) {
  const res = await api.put('/users/update', body, { params: { id } });
  return unwrap(res);
}

export async function deleteUser(id) {
  const res = await api.delete('/users/delete', { params: { id } });
  return unwrap(res);
}

// 饮食智能分析 (/api/v1/diet)
export async function analyzeDiet(body) {
  const res = await api.post('/v1/diet/analyze', body);
  return unwrap(res);
}

export async function analyzeDietAll(body) {
  const res = await api.post('/v1/diet/all', body);
  return unwrap(res);
}

export async function dietSimilarRecipes(recipeName) {
  const res = await api.get('/v1/diet/recipes/similar', { params: { recipeName } });
  return unwrap(res);
}

export async function dietPairings(name, limit = 5) {
  const res = await api.post('/v1/food/pairing', { foodName: name, limit });
  return unwrap(res);
}

export async function dietExploreRelations(body) {
  const res = await api.post('/v1/diet/relations/explore', body);
  return unwrap(res);
}

// 图谱/智能配伍 (/api/v1)
export async function semanticSearch(name, limit = 5) {
  const res = await api.get('/v1/food/search/semantic', { params: { name, limit } });
  return unwrap(res);
}

export async function graphPairing(body) {
  const res = await api.post('/v1/food/pairing', body);
  return unwrap(res);
}

export async function mealPlan(body) {
  const res = await api.post('/v1/recommend/meal-plan', body);
  return unwrap(res);
}

export async function safetyCheck(body) {
  const res = await api.post('/v1/safety/check', body);
  return unwrap(res);
}

export async function creativeCooking(body) {
  const res = await api.post('/v1/recommend/creative', body);
  return unwrap(res);
}

// 菜谱相关 (/api/recipes)
export async function recipeRecommend(userId, limit = 10) {
  const res = await api.get('/recipes/recommend', { params: { userId, limit } });
  return unwrap(res);
}

export async function recipeRecommendPath(userId, limit = 10) {
  const res = await api.get('/recipes/recommend/path', { params: { userId, limit } });
  return unwrap(res);
}

export async function recipeRecommendEmbedding(userId, limit = 10, searchLimit = 50) {
  const res = await api.get('/recipes/recommend/embedding', { params: { userId, limit, searchLimit } });
  return unwrap(res);
}

export async function recipeSearch(keyword) {
  const res = await api.get('/recipes/search', { params: { keyword } });
  return unwrap(res);
}

export async function recipeDetail(id) {
  const res = await api.get('/recipes/detail', { params: { id } });
  return unwrap(res);
}

export async function recipeHistory(userId) {
  const res = await api.get('/recipes/history', { params: { userId } });
  return unwrap(res);
}

// 偏好标记 (/api/preferences)
export async function likeRecipe(userId, recipeId) {
  const res = await api.post('/preferences/recipes/like', { userId, recipeId });
  return unwrap(res);
}

export async function dislikeRecipe(userId, recipeId) {
  const res = await api.post('/preferences/recipes/dislike', { userId, recipeId });
  return unwrap(res);
}

export async function favoriteIngredient(userId, ingredientName) {
  const res = await api.post('/preferences/ingredients/favorite', { userId, ingredientName });
  return unwrap(res);
}

export async function dislikeIngredient(userId, ingredientName, reason) {
  const res = await api.post('/preferences/ingredients/dislike', { userId, ingredientName, reason });
  return unwrap(res);
}

export async function getUserPreferences(userId) {
  const res = await api.get('/preferences/user', { params: { userId } });
  return unwrap(res);
}

// 购物清单 (/api/shoppinglist)
export async function shoppingGenerate(body) {
  const res = await api.post('/shoppinglist/generate', body);
  return unwrap(res);
}

export async function shoppingByUser(userId) {
  const res = await api.get('/shoppinglist/by-user', { params: { userId } });
  return unwrap(res);
}

export async function shoppingClear(userId) {
  const res = await api.delete('/shoppinglist/clear', { params: { userId } });
  return unwrap(res);
}

// 反馈 (/api/reviews)
export async function feedbackSubmit(body) {
  const res = await api.post('/reviews/food', body);
  return unwrap(res);
}

export async function feedbackByRecipe(foodName) {
  const res = await api.get('/reviews/food/item', { params: { foodName } });
  return unwrap(res);
}

export async function feedbackByUser(userId) {
  const res = await api.get('/reviews/food/user', { params: { userId } });
  return unwrap(res);
}

// 数据导入与统计 (/api/data) - 管理员
export async function importFoodByPath(path) {
  const res = await api.post('/data/import-food-path', null, { params: { path } });
  return unwrap(res);
}

export async function dataStats() {
  const res = await api.get('/data/stats');
  return unwrap(res);
}

export async function importFoodFile(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/data/import-food-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return unwrap(res);
}

// ─── User Memory ───
export async function fetchUserMemory(userId) {
  const res = await api.get('/users/memory', { params: { userId } });
  return unwrap(res);
}

// ─── Pairing Detail (AI Insight) ───
export async function graphPairingDetail(body) {
  const res = await api.post('/v1/food/pairing/detail', body);
  return unwrap(res);
}

// ─── Recipe Reviews ───
export async function recipeReviewSubmit(body) {
  const res = await api.post('/reviews/recipe', body);
  return unwrap(res);
}
export async function recipeReviewUpdate(reviewId, body) {
  const res = await api.put(`/reviews/recipe/${encodeURIComponent(reviewId)}`, body);
  return unwrap(res);
}
export async function recipeReviewDelete(reviewId) {
  const res = await api.delete(`/reviews/recipe/${encodeURIComponent(reviewId)}`);
  return unwrap(res);
}
export async function recipeReviewsByUser(userId) {
  const res = await api.get('/reviews/recipe/user', { params: { userId } });
  return unwrap(res);
}
export async function recipeReviewsByItem(recipeId) {
  const res = await api.get('/reviews/recipe/item', { params: { recipeId } });
  return unwrap(res);
}
export async function recipeReviewDetail(userId, recipeId) {
  const res = await api.get('/reviews/recipe/detail', { params: { userId, recipeId } });
  return unwrap(res);
}

// ─── Food Review (edit / delete / detail) ───
export async function foodReviewUpdate(reviewId, body) {
  const res = await api.put(`/reviews/food/${encodeURIComponent(reviewId)}`, body);
  return unwrap(res);
}
export async function foodReviewDelete(reviewId) {
  const res = await api.delete(`/reviews/food/${encodeURIComponent(reviewId)}`);
  return unwrap(res);
}
export async function foodReviewDetail(userId, foodName) {
  const res = await api.get('/reviews/food/detail', { params: { userId, foodName } });
  return unwrap(res);
}

// ─── Admin: User Management ───
export async function adminListUsers() {
  const res = await api.get('/users/admin/list');
  return unwrap(res);
}
export async function adminSetRole(userId, role) {
  const res = await api.put('/users/admin/role', null, { params: { userId, role } });
  return unwrap(res);
}
export async function adminUserDetail(id) {
  const res = await api.get('/users/admin/detail', { params: { id } });
  return unwrap(res);
}

// ─── Admin: Data Operations (extended) ───
export async function importRecipeByPath(path) {
  const res = await api.post('/data/import-recipe-path', null, { params: { path } });
  return unwrap(res);
}
export async function importAllWithPath(path) {
  const res = await api.post('/data/import-all', null, { params: { path } });
  return unwrap(res);
}
export async function importProgress(taskId) {
  const res = await api.get('/data/import-progress', { params: { taskId } });
  return unwrap(res);
}
export async function importRunning() {
  const res = await api.get('/data/import-running');
  return unwrap(res);
}
export async function importCancel(taskId) {
  const res = await api.post('/data/import-cancel', null, { params: { taskId } });
  return unwrap(res);
}
export async function trainMetapath2vec() {
  const res = await api.post('/data/train/metapath2vec');
  return unwrap(res);
}
export async function trainGraphsage() {
  const res = await api.post('/data/train/graphsage');
  return unwrap(res);
}
export async function trainProgress(taskId) {
  const res = await api.get('/data/train-progress', { params: { taskId } });
  return unwrap(res);
}
export async function trainRunning() {
  const res = await api.get('/data/train-running');
  return unwrap(res);
}
export async function generateEmbedding(name) {
  const res = await api.post('/data/generate-embedding', null, { params: { name } });
  return unwrap(res);
}
export async function generateEmbeddingMissing() {
  const res = await api.post('/data/generate-embedding-missing');
  return unwrap(res);
}
export async function reloadOnnx() {
  const res = await api.post('/data/reload-onnx');
  return unwrap(res);
}

export default api;
