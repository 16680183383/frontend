<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2><span></span> 菜谱推荐</h2>
      <p class="desc">个性化多维推荐、关键词搜索、偏好标记、食材收藏</p>
    </div>

    <!-- 推荐区 tabs -->
    <div class="section-card">
      <div class="section-head-row">
        <h3 class="section-title">个性推荐</h3>
        <div class="tab-bar" style="width:auto">
          <button :class="['tab-btn', recTab==='path' && 'active']" @click="recTab='path'">路径推荐</button>
          <button :class="['tab-btn', recTab==='embed' && 'active']" @click="recTab='embed'">向量推荐</button>
        </div>
      </div>
      <p class="desc" v-if="recTab==='path'">基于收藏食材图谱扩散，发现新菜谱</p>
      <p class="desc" v-else>基于向量相似度的高精度推荐</p>
      <div class="form-inline">
        <button class="btn-primary sm" :disabled="recLoading" @click="fetchRec">
          {{ recLoading ? '推荐中' : '刷新推荐' }}
        </button>
      </div>
      <div class="card-grid" v-if="recList.length">
        <div class="item-card clickable" v-for="item in recList" :key="item.name" @click="showDetail(item.name)">
          <p class="card-title">{{ item.name }}</p>
          <p class="card-desc">{{ item.ingredients || '暂无食材信息' }}</p>
          <div class="card-meta">
            <span class="tag blue" v-if="item.score">匹配 {{ (item.score * 100).toFixed(0) }}%</span>
          </div>
          <div class="card-actions" @click.stop>
            <button class="btn-primary sm" :disabled="prefLoading" @click.stop="quickLike(item)">❤ 收藏</button>
            <button class="btn-ghost sm" :disabled="prefLoading" @click.stop="quickDislike(item)">不感兴趣</button>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else-if="!recLoading">
        <div class="empty-icon"></div>
        <p>点击「刷新推荐」获取个性化菜谱</p>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="section-card">
      <h3 class="section-title"> 搜索菜谱</h3>
      <div class="form-inline">
        <div class="form-row" style="flex:1;min-width:200px">
          <input class="ipt" v-model="searchKw" placeholder="输入关键词搜索菜谱" @keyup.enter="searchHandler" />
        </div>
        <button class="btn-primary" :disabled="searchLoading || !searchKw" @click="searchHandler">
          {{ searchLoading ? '搜索中' : '搜索' }}
        </button>
      </div>
      <div class="card-grid" v-if="searchResults.length">
        <div class="item-card clickable" v-for="item in searchResults" :key="item.recipeId || item.name" @click="showDetail(item.recipeId || item.name)">
          <p class="card-title">{{ item.name }}</p>
          <p class="card-desc">{{ item.ingredients || '暂无食材信息' }}</p>
          <div class="card-actions" @click.stop>
            <button class="btn-primary sm" :disabled="prefLoading" @click.stop="quickLike(item)">❤ 收藏</button>
            <button class="btn-ghost sm" :disabled="prefLoading" @click.stop="quickDislike(item)">不感兴趣</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 偏好标记 -->
    <div class="section-card">
      <h3 class="section-title"> 偏好标记</h3>
      <div class="form-grid-2">
        <div class="form-row">
          <label>菜谱名称</label>
          <div class="form-inline">
            <input class="ipt" style="flex:1" v-model="pref.recipeId" placeholder="菜谱名称（可从搜索结果复制）" />
            <button class="btn-primary sm" :disabled="prefLoading || !pref.recipeId" @click="prefAction('like')"> 收藏</button>
            <button class="btn-ghost sm" :disabled="prefLoading || !pref.recipeId" @click="prefAction('dislike')">不感兴趣</button>
          </div>
        </div>
        <div class="form-row">
          <label>食材偏好</label>
          <div class="form-inline">
            <input class="ipt" style="flex:1" v-model="pref.ingredient" placeholder="食材名称" />
            <input class="ipt" style="flex:1" v-model="pref.reason" placeholder="理由（可选）" />
            <button class="btn-primary sm" :disabled="prefLoading || !pref.ingredient" @click="prefAction('fav')">喜爱</button>
            <button class="btn-ghost sm danger" :disabled="prefLoading || !pref.ingredient" @click="prefAction('bad')">避雷</button>
          </div>
        </div>
      </div>
      <p class="success-text" v-if="pref.status">{{ pref.status }}</p>
    </div>

    <!-- 我的偏好 -->
    <div class="section-card">
      <div class="section-head-row">
        <h3 class="section-title"> 我的偏好</h3>
        <button class="btn-ghost sm" @click="loadMyPrefs">刷新</button>
      </div>
      <div v-if="myPrefs.loaded">
        <div v-if="myPrefs.recipes.length || myPrefs.ingredients.length">
          <div v-if="myPrefs.recipes.length">
            <p style="font-weight:600;margin-bottom:6px;font-size:13px;color:var(--accent)">菜谱偏好（recipe_preferences 表）</p>
            <table class="mini-table">
              <thead><tr><th>菜谱ID/名称</th><th>偏好类型</th></tr></thead>
              <tbody>
                <tr v-for="r in myPrefs.recipes" :key="r.id">
                  <td>{{ r.recipeId }}</td>
                  <td>
                    <span :class="r.preference === 'LIKE' ? 'tag green' : 'tag gray'">{{ r.preference === 'LIKE' ? '收藏' : '不感兴趣' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="myPrefs.ingredients.length" style="margin-top:12px">
            <p style="font-weight:600;margin-bottom:6px;font-size:13px;color:var(--accent)">食材偏好（ingredient_preferences 表）</p>
            <table class="mini-table">
              <thead><tr><th>食材名称</th><th>偏好类型</th><th>理由</th></tr></thead>
              <tbody>
                <tr v-for="r in myPrefs.ingredients" :key="r.id">
                  <td>{{ r.ingredientName }}</td>
                  <td>
                    <span :class="r.preference === 'FAVORITE' ? 'tag green' : 'tag red'">{{ r.preference === 'FAVORITE' ? '喜爱' : (r.preference === 'DISLIKES' ? '避雷' : r.preference) }}</span>
                  </td>
                  <td>{{ r.reason || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="empty-state" v-else>
          <p>暂无偏好记录</p>
        </div>
      </div>
    </div>

    <!-- 菜谱详情弹窗 -->
    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="detail.show" @click.self="closeDetail">
          <div class="modal-card">
            <div class="modal-header">
              <h3>{{ detail.data?.name || '菜谱详情' }}</h3>
              <button class="btn-icon" @click="closeDetail">✕</button>
            </div>

            <!-- 操作按钮行 -->
            <div class="modal-actions" v-if="detail.data">
              <button
                :class="['btn-action', modalPrefState === 'LIKE' && 'liked']"
                :disabled="detail.prefLoading"
                @click="modalLike"
              >{{ modalPrefState === 'LIKE' ? '❤ 已收藏' : '❤ 收藏菜谱' }}</button>
              <button
                :class="['btn-action', modalPrefState === 'NOT_INTERESTED' && 'dimmed']"
                :disabled="detail.prefLoading"
                @click="modalDislike"
              >{{ modalPrefState === 'NOT_INTERESTED' ? '👎 不感兴趣 ✓' : '👎 不感兴趣' }}</button>
              <button class="btn-action cart" @click="detail.showCart = !detail.showCart">🛒 加入购物清单</button>
            </div>

            <!-- 加入购物清单 inline 确认 -->
            <div class="modal-cart-row" v-if="detail.showCart">
              <span class="cart-label">份数：</span>
              <input type="number" v-model.number="detail.servings" min="1" max="20" class="ipt cart-ipt" />
              <button class="btn-primary sm" :disabled="detail.cartLoading" @click="confirmAddCart">{{ detail.cartLoading ? '加入中…' : '确认加入' }}</button>
              <button class="btn-ghost sm" @click="detail.showCart = false">取消</button>
            </div>

            <div class="modal-body" v-if="detail.data">
              <!-- 食材标签（带逐个喜爱/避雷按钮）-->
              <div class="detail-section" v-if="detailIngredients.length">
                <h4>🥬 食材</h4>
                <div class="ing-list">
                  <div class="ing-item" v-for="ing in detailIngredients" :key="ing">
                    <span class="ing-name">{{ ing }}</span>
                    <button
                      :class="['ing-btn', ingPrefState(ing) === 'FAVORITE' && 'ing-liked']"
                      :disabled="detail.ingPrefLoading === ing"
                      @click="modalFavIng(ing)"
                      title="喜爱该食材"
                    >❤</button>
                    <button
                      :class="['ing-btn danger', ingPrefState(ing) === 'DISLIKES' && 'ing-bad']"
                      :disabled="detail.ingPrefLoading === ing"
                      @click="modalBadIng(ing)"
                      title="避雷该食材"
                    >👎</button>
                  </div>
                </div>
              </div>
              <!-- 详细用量 -->
              <div class="detail-section" v-if="detail.data.nutritionInfo">
                <h4>📊 用量</h4>
                <p>{{ detail.data.nutritionInfo }}</p>
              </div>
              <!-- 步骤 -->
              <div class="detail-section" v-if="detail.data.steps">
                <h4>📝 做法</h4>
                <div class="steps-text">{{ detail.data.steps }}</div>
              </div>
            </div>
            <div class="modal-body" v-else>
              <p style="color:var(--muted)">加载中…</p>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  recipeRecommendPath, recipeRecommendEmbedding, recipeSearch, recipeDetail,
  likeRecipe, dislikeRecipe, favoriteIngredient, dislikeIngredient, getUserPreferences,
  shoppingGenerate
} from '@/api/client'

const toast = useToast()
const userId = computed(() => localStorage.getItem('userId') || '')
const recTab = ref('path')
const recList = reactive([])
const recLoading = ref(false)
const searchKw = ref('')
const searchResults = reactive([])
const searchLoading = ref(false)
const prefLoading = ref(false)
const pref = reactive({ recipeId: '', ingredient: '', reason: '', status: '' })
const detail = reactive({
  show: false,
  data: null,
  prefLoading: false,
  ingPrefLoading: '',
  showCart: false,
  cartLoading: false,
  servings: 2
})
const myPrefs = reactive({ loaded: false, recipes: [], ingredients: [] })

// 当前菜谱详情的偏好状态
const modalPrefState = computed(() => {
  if (!detail.data) return null
  const found = myPrefs.recipes.find(r => r.recipeId === detail.data.name)
  return found?.preference || null
})

// 将 ingredients 字符串分割为数组
const detailIngredients = computed(() => {
  const s = detail.data?.ingredients
  if (!s) return []
  return s.split(/[,，、\n]+/).map(t => t.trim()).filter(Boolean)
})

const ingPrefState = (ingName) => {
  const found = myPrefs.ingredients.find(i => i.ingredientName === ingName)
  return found?.preference || null
}

const errMsg = (e) => e?.response?.data?.message || e.message || '请求失败'

const fetchRec = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  recLoading.value = true
  try {
    recList.splice(0)
    const fn = recTab.value === 'path' ? recipeRecommendPath : recipeRecommendEmbedding
    const res = await fn(userId.value, 12, 50)
    const list = Array.isArray(res) ? res : res?.recipes || res?.data || []
    list.forEach(r => recList.push(r))
    if (!recList.length) toast.info('暂无推荐数据，请先标记一些偏好')
  } catch (e) { toast.error(errMsg(e)) }
  finally { recLoading.value = false }
}

const searchHandler = async () => {
  searchLoading.value = true
  try {
    searchResults.splice(0)
    const res = await recipeSearch(searchKw.value)
    const list = Array.isArray(res) ? res : res?.recipes || res?.data || []
    list.forEach(r => searchResults.push(r))
    if (!searchResults.length) toast.info('未找到匹配的菜谱')
  } catch (e) { toast.error(errMsg(e)) }
  finally { searchLoading.value = false }
}

const showDetail = async (name) => {
  if (!name) return
  detail.show = true
  detail.data = null
  detail.showCart = false
  try {
    const res = await recipeDetail(name)
    detail.data = res
  } catch (e) { toast.error(errMsg(e)); detail.show = false }
}

const closeDetail = () => {
  detail.show = false
  detail.showCart = false
}

// 弹窗内菜谱收藏 / 不感兴趣
const modalLike = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  detail.prefLoading = true
  try {
    await likeRecipe(userId.value, detail.data.name)
    toast.success(`已收藏「${detail.data.name}」`)
    await loadMyPrefs()
  } catch (e) { toast.error(errMsg(e)) }
  finally { detail.prefLoading = false }
}

const modalDislike = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  detail.prefLoading = true
  try {
    await dislikeRecipe(userId.value, detail.data.name)
    toast.success(`已标记「${detail.data.name}」不感兴趣`)
    await loadMyPrefs()
  } catch (e) { toast.error(errMsg(e)) }
  finally { detail.prefLoading = false }
}

// 弹窗内食材喜爱 / 避雷
const modalFavIng = async (ingName) => {
  if (!userId.value) { toast.warn('请先登录'); return }
  detail.ingPrefLoading = ingName
  try {
    await favoriteIngredient(userId.value, ingName)
    toast.success(`已标记「${ingName}」为喜爱食材`)
    await loadMyPrefs()
  } catch (e) { toast.error(errMsg(e)) }
  finally { detail.ingPrefLoading = '' }
}

const modalBadIng = async (ingName) => {
  if (!userId.value) { toast.warn('请先登录'); return }
  detail.ingPrefLoading = ingName
  try {
    await dislikeIngredient(userId.value, ingName, '')
    toast.success(`已标记「${ingName}」为避雷食材`)
    await loadMyPrefs()
  } catch (e) { toast.error(errMsg(e)) }
  finally { detail.ingPrefLoading = '' }
}

// 弹窗内确认加入购物清单
const confirmAddCart = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  detail.cartLoading = true
  try {
    await shoppingGenerate({
      userId: userId.value,
      recipeName: detail.data.name,
      servings: detail.servings
    })
    toast.success(`「${detail.data.name}」已加入购物清单`)
    detail.showCart = false
  } catch (e) { toast.error(errMsg(e)) }
  finally { detail.cartLoading = false }
}

const prefAction = async (action) => {
  if (!userId.value) { toast.warn('请先登录'); return }
  prefLoading.value = true; pref.status = ''
  try {
    if (action === 'like') await likeRecipe(userId.value, pref.recipeId)
    if (action === 'dislike') await dislikeRecipe(userId.value, pref.recipeId)
    if (action === 'fav') await favoriteIngredient(userId.value, pref.ingredient)
    if (action === 'bad') await dislikeIngredient(userId.value, pref.ingredient, pref.reason)
    pref.status = '操作成功 '
    toast.success('偏好已记录')
    await loadMyPrefs()
  } catch (e) { pref.status = ''; toast.error(errMsg(e)) }
  finally { prefLoading.value = false }
}

// 搜索结果卡片快捷收藏
const quickLike = async (item) => {
  if (!userId.value) { toast.warn('请先登录'); return }
  const name = item.recipeId || item.name
  prefLoading.value = true
  try {
    await likeRecipe(userId.value, name)
    toast.success(`已收藏「${item.name}」`)
    await loadMyPrefs()
  } catch (e) { toast.error(errMsg(e)) }
  finally { prefLoading.value = false }
}

const quickDislike = async (item) => {
  if (!userId.value) { toast.warn('请先登录'); return }
  const name = item.recipeId || item.name
  prefLoading.value = true
  try {
    await dislikeRecipe(userId.value, name)
    toast.success(`已标记「${item.name}」不感兴趣`)
    await loadMyPrefs()
  } catch (e) { toast.error(errMsg(e)) }
  finally { prefLoading.value = false }
}

const loadMyPrefs = async () => {
  if (!userId.value) return
  try {
    const res = await getUserPreferences(userId.value)
    myPrefs.recipes = res?.recipePreferences || []
    myPrefs.ingredients = res?.ingredientPreferences || []
    myPrefs.loaded = true
  } catch (e) { /* 静默 */ }
}

onMounted(() => { loadMyPrefs() })
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal-card {
  background: #fff; border-radius: 20px; width: min(600px, 95vw);
  max-height: 80vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,.15);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h3 { margin: 0; font-size: 18px; }
.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.detail-section { margin-bottom: 18px; }
.detail-section h4 { margin: 0 0 8px; font-size: 14px; color: var(--accent); }
.detail-section p { margin: 0; font-size: 14px; line-height: 1.7; color: var(--text-secondary); }
.steps-text { font-size: 14px; line-height: 2; color: var(--text); white-space: pre-wrap; }
.mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mini-table th, .mini-table td { padding: 6px 10px; border: 1px solid var(--border); text-align: left; }
.mini-table th { background: var(--bg-secondary, #f5f5f5); font-weight: 600; }
.tag.green { background: #e6f4ea; color: #2e7d32; padding: 2px 8px; border-radius: 10px; }
.tag.gray  { background: #f5f5f5; color: #666; padding: 2px 8px; border-radius: 10px; }
.tag.red   { background: #fce4e4; color: #c62828; padding: 2px 8px; border-radius: 10px; }

/* 卡片可点击 */
.item-card.clickable { cursor: pointer; transition: box-shadow .18s, transform .18s; }
.item-card.clickable:hover { box-shadow: 0 6px 24px rgba(0,0,0,.12); transform: translateY(-2px); }
.card-actions { display: flex; gap: 6px; margin-top: 8px; }

/* 弹窗操作行 */
.modal-actions {
  display: flex; gap: 10px; flex-wrap: wrap;
  padding: 12px 24px; border-bottom: 1px solid var(--border);
}
.btn-action {
  padding: 8px 18px; border-radius: 20px; border: 1.5px solid var(--border);
  background: #fff; cursor: pointer; font-size: 13px; font-weight: 600;
  color: var(--text); transition: all .18s;
}
.btn-action:hover { border-color: var(--accent); color: var(--accent); background: #f5f0ff; }
.btn-action.liked { background: #fce4e4; border-color: #e57373; color: #c62828; }
.btn-action.dimmed { background: #f5f5f5; border-color: #bbb; color: #888; }
.btn-action.cart { background: #e8f5e9; border-color: #66bb6a; color: #2e7d32; }
.btn-action.cart:hover { background: #c8e6c9; }

/* 加入购物清单行 */
.modal-cart-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 24px; background: #f9fbe7; border-bottom: 1px solid var(--border);
}
.cart-label { font-size: 13px; color: var(--text-secondary); }
.cart-ipt { width: 64px !important; padding: 4px 8px !important; text-align: center; }

/* 食材标签列表 */
.ing-list {
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;
}
.ing-item {
  display: flex; align-items: center; gap: 4px;
  background: var(--bg-secondary, #f5f5f5); border-radius: 20px;
  padding: 4px 10px; border: 1px solid var(--border);
}
.ing-name { font-size: 13px; color: var(--text); }
.ing-btn {
  background: none; border: none; cursor: pointer; font-size: 12px;
  padding: 0 2px; opacity: .55; transition: opacity .15s, transform .15s;
}
.ing-btn:hover { opacity: 1; transform: scale(1.25); }
.ing-btn:disabled { opacity: .3; cursor: not-allowed; }
.ing-btn.ing-liked { opacity: 1; }
.ing-btn.danger.ing-bad { opacity: 1; }
</style>
