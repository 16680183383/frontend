<template>
  <div class="layout">
    <SideBar :items="nav" />
    <section class="content">
      <UserHeader title="体验中心" subtitle="选择模块进入对应工具" :user="user" @logout="logout" />

      <div class="hero">
        <div>
          <p class="eyebrow">智能饮食助手 · 全量接口</p>
          <h1>从入口模块开始，逐步调用后端能力</h1>
          <p class="muted">每个模块都映射对应 Controller，点击卡片展开操作面板。</p>
          <div class="chips">
            <span class="chip">Diet</span>
            <span class="chip">Graph</span>
            <span class="chip">Recipes</span>
            <span class="chip">Shopping</span>
            <span class="chip">Feedback</span>
            <span class="chip">User</span>
          </div>
        </div>
        <div class="hero-visual">
          <div class="orb" />
          <div class="orb small" />
        </div>
      </div>

      <div class="module-grid">
        <div
          v-for="m in modules"
          :key="m.key"
          class="module-card"
          :class="{ active: activeModule.value === m.key }"
          @click="setModule(m.key)"
        >
          <span class="icon-circle big">
            <component :is="m.icon" />
          </span>
          <div>
            <h3>{{ m.title }}</h3>
            <p class="muted">{{ m.desc }}</p>
          </div>
          <span class="pill">{{ m.routes }}</span>
        </div>
      </div>

      <div v-if="activeModule.value === 'user'" class="card wide" id="panel-user">
        <h3>用户接口</h3>
        <div class="form-grid">
          <label>查询用户 ID</label>
          <input class="input" v-model.number="userOps.detailId" placeholder="用户 ID" />
          <button class="btn ghost" @click="run(fetchUserInfoHandler)">获取详情</button>

          <label>更新昵称</label>
          <input class="input" v-model="userOps.nickname" placeholder="新的昵称（可选）" />
          <button class="btn ghost" @click="run(updateUserHandler)">更新</button>

          <label>删除用户 ID</label>
          <input class="input" v-model.number="userOps.deleteId" placeholder="用户 ID" />
          <button class="btn ghost" @click="run(deleteUserHandler)">删除</button>
        </div>
        <pre v-if="userOps.result" class="code">{{ userOps.result }}</pre>
      </div>

      <div v-if="activeModule.value === 'diet'" class="card wide" id="panel-diet">
        <h3>饮食分析 (DietController)</h3>
        <div class="form-grid">
          <label>食材名称 / 意图</label>
          <input class="input" v-model="diet.foodName" placeholder="如: 鸡胸肉" />
          <select class="input" v-model="diet.intent">
            <option value="COMP">互补</option>
            <option value="INCOMP">相克</option>
            <option value="OVERLAP">相似</option>
            <option value="RECIPE">关联菜谱</option>
            <option value="ALL">全量</option>
          </select>
          <label>TopK / AI 说明</label>
          <input class="input" type="number" min="1" max="50" v-model.number="diet.topK" />
          <label class="muted"><input type="checkbox" v-model="diet.includeAiAdvice" /> includeAiAdvice</label>
          <button class="btn ghost" @click="run(analyzeDietHandler)">智能分析</button>
          <button class="btn ghost" @click="run(analyzeDietAllHandler)">全维度分析</button>

          <label>相似菜谱 (recipeName)</label>
          <input class="input" v-model="diet.similarName" placeholder="菜谱名称" />
          <button class="btn ghost" @click="run(similarHandler)">查询相似菜谱</button>

          <label>搭配推荐 (name)</label>
          <input class="input" v-model="diet.pairName" placeholder="食材名称" />
          <button class="btn ghost" @click="run(pairingHandler)">获取搭配</button>

          <label>关联探索</label>
          <input class="input" v-model="diet.relationFood" placeholder="食材名称" />
          <select class="input" v-model="diet.relationIntent">
            <option value="COMP">COMP</option>
            <option value="INCOMP">INCOMP</option>
            <option value="OVERLAP">OVERLAP</option>
            <option value="RECIPE">RECIPE</option>
          </select>
          <input class="input" type="number" min="1" max="50" v-model.number="diet.relationTopK" placeholder="topK" />
          <input class="input" type="number" min="0" max="10" v-model.number="diet.recipeLimit" placeholder="recipeLimit" />
          <button class="btn ghost" @click="run(relationHandler)">探索关联</button>
        </div>
        <pre v-if="diet.result" class="code">{{ diet.result }}</pre>
      </div>

      <div v-if="activeModule.value === 'graph'" class="card wide" id="panel-graph">
        <h3>图谱/智能配伍 (FoodGraphController)</h3>
        <div class="form-grid">
          <label>语义搜索</label>
          <input class="input" v-model="graph.semanticName" placeholder="食材名称" />
          <input class="input" type="number" min="1" max="20" v-model.number="graph.semanticLimit" />
          <button class="btn ghost" @click="run(semanticHandler)">语义替换</button>

          <label>智能配伍</label>
          <input class="input" v-model="graph.pairFood" placeholder="主食材" />
          <input class="input" type="number" min="2" max="10" v-model.number="graph.pairLimit" />
          <button class="btn ghost" @click="run(graphPairingHandler)">生成配伍</button>

          <label>智能组菜方案</label>
          <input class="input" v-model="graph.mealFood" placeholder="主食材" />
          <input class="input" type="number" min="2" max="10" v-model.number="graph.mealLimit" />
          <button class="btn ghost" @click="run(mealPlanHandler)">生成</button>

          <label>安全检测 (以逗号分隔)</label>
          <input class="input" v-model="graph.safetyFoods" placeholder="食材1,食材2" />
          <button class="btn ghost" @click="run(safetyHandler)">检测相克</button>

          <label>创意菜 (剩余食材，以逗号分隔)</label>
          <input class="input" v-model="graph.creativeFoods" placeholder="西红柿,鸡蛋" />
          <button class="btn ghost" @click="run(creativeHandler)">生成创意</button>
        </div>
        <pre v-if="graph.result" class="code">{{ graph.result }}</pre>
      </div>

      <div v-if="activeModule.value === 'recipe'" class="card wide" id="panel-recipe">
        <h3>菜谱接口 (RecipeController)</h3>
        <div class="form-grid">
          <label>搜索菜谱</label>
          <input class="input" v-model="recipe.keyword" placeholder="关键词" />
          <button class="btn ghost" @click="run(recipeSearchHandler)">搜索</button>

          <label>推荐菜谱</label>
          <button class="btn ghost" @click="run(recipeRecommendHandler)">获取推荐</button>

          <label>菜谱详情 ID</label>
          <input class="input" type="number" v-model.number="recipe.detailId" />
          <button class="btn ghost" @click="run(recipeDetailHandler)">详情</button>

          <label>推荐历史 用户ID</label>
          <input class="input" type="number" v-model.number="recipe.historyUserId" />
          <button class="btn ghost" @click="run(recipeHistoryHandler)">获取历史</button>
        </div>
        <pre v-if="recipe.result" class="code">{{ recipe.result }}</pre>
      </div>

      <div v-if="activeModule.value === 'shop'" class="card wide" id="panel-shop">
        <h3>购物清单 (ShoppingListController)</h3>
        <div class="form-grid">
          <label>生成 (recipeIds 逗号分隔)</label>
          <input class="input" v-model="shop.recipeIds" placeholder="1,2,3" />
          <button class="btn ghost" @click="run(shoppingGenerateHandler)">生成购物清单</button>

          <label>按用户获取</label>
          <input class="input" type="number" v-model.number="shop.userId" placeholder="用户ID" />
          <button class="btn ghost" @click="run(shoppingGetHandler)">获取</button>

          <label>清空用户清单</label>
          <input class="input" type="number" v-model.number="shop.clearUserId" placeholder="用户ID" />
          <button class="btn ghost" @click="run(shoppingClearHandler)">清空</button>
        </div>
        <pre v-if="shop.result" class="code">{{ shop.result }}</pre>
      </div>

      <div v-if="activeModule.value === 'feedback'" class="card wide" id="panel-feedback">
        <h3>反馈 (FeedbackController)</h3>
        <div class="form-grid">
          <label>提交反馈</label>
          <input class="input" v-model.number="fb.userId" placeholder="用户ID" />
          <input class="input" v-model.number="fb.recipeId" placeholder="菜谱ID" />
          <input class="input" v-model.number="fb.rating" type="number" min="1" max="5" placeholder="评分" />
          <input class="input" v-model="fb.comments" placeholder="评论" />
          <button class="btn ghost" @click="run(feedbackSubmitHandler)">提交</button>

          <label>按菜谱查看反馈</label>
          <input class="input" v-model.number="fb.recipeQuery" placeholder="菜谱ID" />
          <button class="btn ghost" @click="run(feedbackByRecipeHandler)">查看</button>

          <label>按用户查看反馈</label>
          <input class="input" v-model.number="fb.userQuery" placeholder="用户ID" />
          <button class="btn ghost" @click="run(feedbackByUserHandler)">查看</button>
        </div>
        <pre v-if="fb.result" class="code">{{ fb.result }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SideBar from '@/components/SideBar.vue';
import UserHeader from '@/components/UserHeader.vue';
import {
  fetchUserInfo,
  updateUser,
  deleteUser,
  analyzeDiet,
  analyzeDietAll,
  dietSimilarRecipes,
  dietPairings,
  dietExploreRelations,
  semanticSearch,
  graphPairing,
  mealPlan,
  safetyCheck,
  creativeCooking,
  recipeRecommend,
  recipeSearch,
  recipeDetail,
  recipeHistory,
  shoppingGenerate,
  shoppingByUser,
  shoppingClear,
  feedbackSubmit,
  feedbackByRecipe,
  feedbackByUser
} from '@/api/client';

// 简单图标组件
const IconDiet = () => '🍽️';
const IconGraph = () => '🧠';
const IconRecipe = () => '📖';
const IconCart = () => '🛒';
const IconFeedback = () => '💬';
const IconUser = () => '👤';

const router = useRouter();
const route = useRoute();
const nav = [
  { label: '主页', hint: '你的饮食面板', routeName: 'user', icon: 'user' },
  { label: '模块', hint: '选择入口', routeName: 'user', icon: 'chart' }
];

const user = computed(() => ({
  username: localStorage.getItem('username') || 'User',
  nickname: localStorage.getItem('nickname') || '',
  avatarUrl: localStorage.getItem('avatarUrl') || '',
  role: localStorage.getItem('role') || 'USER'
}));

const userOps = reactive({ detailId: Number(localStorage.getItem('userId')) || null, nickname: '', deleteId: null, result: '' });
const diet = reactive({
  foodName: '', intent: 'COMP', topK: 5, includeAiAdvice: false,
  similarName: '', pairName: '', relationFood: '', relationIntent: 'COMP', relationTopK: 5, recipeLimit: 3,
  result: ''
});
const graph = reactive({ semanticName: '', semanticLimit: 5, pairFood: '', pairLimit: 3, mealFood: '', mealLimit: 3, safetyFoods: '', creativeFoods: '', result: '' });
const recipe = reactive({ keyword: '', detailId: null, historyUserId: null, result: '' });
const shop = reactive({ recipeIds: '', userId: null, clearUserId: null, result: '' });
const fb = reactive({ userId: null, recipeId: null, rating: null, comments: '', recipeQuery: null, userQuery: null, result: '' });

const modules = reactive([
  { key: 'diet', title: '饮食分析', desc: '智能分析/搭配/关联探索', icon: IconDiet, routes: '/api/v1/diet' },
  { key: 'graph', title: '图谱与配伍', desc: '语义替换、配伍、组菜、禁忌', icon: IconGraph, routes: '/api/v1/food|recommend|safety' },
  { key: 'recipe', title: '菜谱中心', desc: '搜索、推荐、历史、详情', icon: IconRecipe, routes: '/api/recipes' },
  { key: 'shop', title: '购物清单', desc: '生成/查询/清空购物单', icon: IconCart, routes: '/api/shoppinglist' },
  { key: 'feedback', title: '反馈', desc: '提交与查询反馈', icon: IconFeedback, routes: '/api/feedback' },
  { key: 'user', title: '用户资料', desc: '查询、更新、删除用户', icon: IconUser, routes: '/api/users' }
]);

const activeModule = reactive({ value: String(route.params.module || route.query.module || 'diet') });

const setModule = (key) => {
  activeModule.value = key;
  router.replace({ path: `/user/${key}`, query: { ...route.query } });
};

watch(
  () => route.fullPath,
  () => {
    const nextKey = String(route.params.module || route.query.module || 'diet');
    if (nextKey) activeModule.value = nextKey;
  }
);

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const format = (data) => JSON.stringify(data, null, 2);
const run = async (fn) => { await fn(); };

// 用户
const fetchUserInfoHandler = async () => {
  userOps.result = '';
  const data = await fetchUserInfo(userOps.detailId);
  userOps.result = format(data);
};

const updateUserHandler = async () => {
  userOps.result = '';
  const targetId = userOps.detailId || Number(localStorage.getItem('userId')) || 0;
  const data = await updateUser(targetId, { nickname: userOps.nickname });
  userOps.result = format(data);
};

const deleteUserHandler = async () => {
  userOps.result = '';
  const data = await deleteUser(userOps.deleteId);
  userOps.result = format(data);
};

// Diet
const analyzeDietHandler = async () => {
  diet.result = format(await analyzeDiet({ foodName: diet.foodName, intent: diet.intent, topK: diet.topK, includeAiAdvice: diet.includeAiAdvice, userId: userOps.detailId }));
};
const analyzeDietAllHandler = async () => {
  diet.result = format(await analyzeDietAll({ foodName: diet.foodName, intent: diet.intent, topK: diet.topK, includeAiAdvice: diet.includeAiAdvice, userId: userOps.detailId }));
};
const similarHandler = async () => {
  diet.result = format(await dietSimilarRecipes(diet.similarName));
};
const pairingHandler = async () => {
  diet.result = format(await dietPairings(diet.pairName));
};
const relationHandler = async () => {
  diet.result = format(await dietExploreRelations({ foodName: diet.relationFood, intent: diet.relationIntent, topK: diet.relationTopK, recipeLimit: diet.recipeLimit, userId: userOps.detailId }));
};

// Graph
const semanticHandler = async () => { graph.result = format(await semanticSearch(graph.semanticName, graph.semanticLimit)); };
const graphPairingHandler = async () => { graph.result = format(await graphPairing({ foodName: graph.pairFood, limit: graph.pairLimit })); };
const mealPlanHandler = async () => { graph.result = format(await mealPlan({ foodName: graph.mealFood, pairingLimit: graph.mealLimit, userId: userOps.detailId })); };
const safetyHandler = async () => {
  const foods = graph.safetyFoods.split(',').map(f => f.trim()).filter(Boolean);
  graph.result = format(await safetyCheck({ foods, userId: userOps.detailId }));
};
const creativeHandler = async () => {
  const ingredients = graph.creativeFoods.split(',').map(f => f.trim()).filter(Boolean);
  graph.result = format(await creativeCooking({ ingredients, userId: userOps.detailId }));
};

// Recipes
const recipeSearchHandler = async () => { recipe.result = format(await recipeSearch(recipe.keyword)); };
const recipeRecommendHandler = async () => { recipe.result = format(await recipeRecommend(userOps.detailId)); };
const recipeDetailHandler = async () => { recipe.result = format(await recipeDetail(recipe.detailId)); };
const recipeHistoryHandler = async () => { recipe.result = format(await recipeHistory(recipe.historyUserId)); };

// Shopping list
const shoppingGenerateHandler = async () => {
  const recipeIds = shop.recipeIds.split(',').map(id => Number(id.trim())).filter(Boolean);
  shop.result = format(await shoppingGenerate({ recipeIds }));
};
const shoppingGetHandler = async () => { shop.result = format(await shoppingByUser(shop.userId)); };
const shoppingClearHandler = async () => { shop.result = format(await shoppingClear(shop.clearUserId)); };

// Feedback
const feedbackSubmitHandler = async () => {
  fb.result = format(await feedbackSubmit({ userId: fb.userId, recipeId: fb.recipeId, rating: fb.rating, comments: fb.comments }));
};
const feedbackByRecipeHandler = async () => { fb.result = format(await feedbackByRecipe(fb.recipeQuery)); };
const feedbackByUserHandler = async () => { fb.result = format(await feedbackByUser(fb.userQuery)); };
</script>

<style scoped>
.content { background: rgba(12, 17, 24, 0.85); min-height: 100vh; }
.panel-grid { display: grid; gap: 16px; padding: 18px; }
.card.wide { padding: 18px; }
.form-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); align-items: center; }
.form-grid label { color: var(--muted); font-weight: 600; }
.code { background: #0b1016; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); max-height: 260px; overflow: auto; }
.btn.ghost { background: rgba(255,255,255,0.06); color: var(--text); box-shadow: none; }
</style>
