<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2><span></span> 知识图谱</h2>
      <p class="desc">语义搜索、食材搭配、膳食计划、安全检查、创意烹饪</p>
    </div>

    <!-- Tab Bar -->
    <div class="tab-bar" style="margin-bottom:20px">
      <button v-for="t in tabs" :key="t.key" :class="['tab-btn', tab===t.key && 'active']"
              @click="tab=t.key">{{ t.label }}</button>
    </div>

    <!-- 1. 语义搜索 -->
    <div class="section-card" v-show="tab==='search'">
      <h3 class="section-title"> 语义搜索</h3>
      <p class="desc">根据食材名称在知识图谱中搜索相关节点</p>
      <div class="form-inline">
        <input class="ipt" v-model="search.name" placeholder="食材名称" @keyup.enter="doSearch" style="flex:1" />
        <input class="ipt" v-model.number="search.limit" placeholder="数量" style="width:80px" type="number" min="1" />
        <button class="btn-primary" :disabled="searching || !search.name" @click="doSearch">搜索</button>
      </div>
      <div class="card-grid" v-if="search.results.length">
        <div class="item-card" v-for="(r,i) in search.results" :key="i">
          <p class="card-title">{{ r.name || r }}</p>
          <p class="card-desc" v-if="r.score">相似度 {{ (r.score*100).toFixed(1) }}%</p>
          <p class="card-desc" v-if="r.labels">{{ r.labels }}</p>
        </div>
      </div>
    </div>

    <!-- 2. 食材搭配 -->
    <div class="section-card" v-show="tab==='pairing'">
      <h3 class="section-title"> AI 食材搭配</h3>
      <p class="desc">输入食材获取AI搭配建议和图谱分析</p>
      <div class="form-inline">
        <input class="ipt" v-model="pairing.food1" placeholder="食材 1" style="flex:1" @keyup.enter="doPairing" />
        <input class="ipt" v-model="pairing.food2" placeholder="食材 2" style="flex:1" @keyup.enter="doPairing" />
        <input class="ipt" v-model="pairing.goal" placeholder="目标（可选，如减脂）" style="flex:1" />
        <button class="btn-primary" :disabled="pairingLoading || !pairing.food1 || !pairing.food2" @click="doPairing">分析搭配</button>
      </div>
      <div class="advice-card" v-if="pairing.result">
        <h4>搭配建议</h4>
        <div class="advice-text">{{ pairing.result }}</div>
      </div>
    </div>

    <!-- 3. 膳食计划 -->
    <div class="section-card" v-show="tab==='meal'">
      <h3 class="section-title"> 膳食计划</h3>
      <p class="desc">AI根据你的健康目标生成个性化膳食方案</p>
      <div class="form-grid-2">
        <div class="form-row"><label>用户 ID</label><input class="ipt" v-model="meal.userId" /></div>
        <div class="form-row"><label>天数</label><input class="ipt" v-model.number="meal.days" type="number" min="1" max="14" /></div>
        <div class="form-row"><label>目标</label><input class="ipt" v-model="meal.goal" placeholder="减脂/增肌/均衡" /></div>
        <div class="form-row"><label>饮食限制</label><input class="ipt" v-model="meal.restrictions" placeholder="素食/无麸质等（可选）" /></div>
      </div>
      <div style="margin-top:12px">
        <button class="btn-primary" :disabled="mealLoading || !meal.userId" @click="doMeal">生成计划</button>
      </div>
      <div class="advice-card" v-if="meal.result">
        <h4>膳食方案</h4>
        <div class="advice-text">{{ meal.result }}</div>
      </div>
    </div>

    <!-- 4. 安全检查 -->
    <div class="section-card" v-show="tab==='safety'">
      <h3 class="section-title"> 食材安全检查</h3>
      <p class="desc">检查食材组合是否安全，识别相克与禁忌</p>
      <div class="form-inline">
        <input class="ipt" v-model="safety.foods" placeholder="多个食材用逗号分隔，如：螃蟹,柿子,牛奶" style="flex:1" @keyup.enter="doSafety" />
        <input class="ipt" v-model="safety.allergies" placeholder="过敏史（可选）" style="flex:0.6" />
        <button class="btn-primary" :disabled="safetyLoading || !safety.foods" @click="doSafety">检查</button>
      </div>
      <div class="advice-card" v-if="safety.result" :class="safety.safe ? 'safe' : 'warn'">
        <h4>{{ safety.safe ? ' 安全' : ' 注意' }}</h4>
        <div class="advice-text">{{ safety.result }}</div>
      </div>
    </div>

    <!-- 5. 创意烹饪 -->
    <div class="section-card" v-show="tab==='creative'">
      <h3 class="section-title"> 创意烹饪</h3>
      <p class="desc">输入现有食材，AI为你创造独特菜谱</p>
      <div class="form-grid-2">
        <div class="form-row"><label>可用食材</label><input class="ipt" v-model="creative.ingredients" placeholder="逗号分隔" /></div>
        <div class="form-row"><label>口味偏好</label><input class="ipt" v-model="creative.style" placeholder="川菜/粤菜/日式等" /></div>
        <div class="form-row"><label>时间限制</label><input class="ipt" v-model="creative.time" placeholder="如30分钟" /></div>
        <div class="form-row"><label>难度</label>
          <select class="ipt" v-model="creative.difficulty">
            <option value="">不限</option>
            <option value="简单">简单</option>
            <option value="中等">中等</option>
            <option value="困难">困难</option>
          </select>
        </div>
      </div>
      <div style="margin-top:12px">
        <button class="btn-primary" :disabled="creativeLoading || !creative.ingredients" @click="doCreative">生成创意菜谱</button>
      </div>
      <div class="advice-card" v-if="creative.result">
        <h4> 创意菜谱</h4>
        <div class="advice-text">{{ creative.result }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { semanticSearch, graphPairing, graphPairingDetail, mealPlan, safetyCheck, creativeCooking } from '@/api/client'

const toast = useToast()
const userId = computed(() => localStorage.getItem('userId') || '')

const tabs = [
  { key: 'search', label: '语义搜索' },
  { key: 'pairing', label: '食材搭配' },
  { key: 'meal', label: '膳食计划' },
  { key: 'safety', label: '安全检查' },
  { key: 'creative', label: '创意烹饪' }
]
const tab = ref('search')
const err = (e) => e?.response?.data?.message || e.message || '请求失败'

/* --- 语义搜索 --- */
const searching = ref(false)
const search = reactive({ name: '', limit: 5, results: [] })
const doSearch = async () => {
  searching.value = true; search.results = []
  try {
    const res = await semanticSearch(search.name, search.limit)
    search.results = Array.isArray(res) ? res : res?.data || []
    if (!search.results.length) toast.info('未搜到相关节点')
  } catch (e) { toast.error(err(e)) }
  finally { searching.value = false }
}

/* --- 食材搭配 --- */
const pairingLoading = ref(false)
const pairing = reactive({ food1: '', food2: '', goal: '', result: '' })
const doPairing = async () => {
  pairingLoading.value = true; pairing.result = ''
  try {
    const body = { food1: pairing.food1, food2: pairing.food2, goal: pairing.goal || undefined }
    const res = await graphPairing(body)
    pairing.result = typeof res === 'string' ? res : (res?.advice || res?.result || JSON.stringify(res, null, 2))
  } catch (e) { toast.error(err(e)) }
  finally { pairingLoading.value = false }
}

/* --- 膳食计划 --- */
const mealLoading = ref(false)
const meal = reactive({ userId: '', days: 3, goal: '均衡', restrictions: '', result: '' })
onMounted(() => { meal.userId = userId.value })
const doMeal = async () => {
  mealLoading.value = true; meal.result = ''
  try {
    const body = { userId: meal.userId, days: meal.days, goal: meal.goal, restrictions: meal.restrictions || undefined }
    const res = await mealPlan(body)
    meal.result = typeof res === 'string' ? res : (res?.plan || res?.result || JSON.stringify(res, null, 2))
  } catch (e) { toast.error(err(e)) }
  finally { mealLoading.value = false }
}

/* --- 安全检查 --- */
const safetyLoading = ref(false)
const safety = reactive({ foods: '', allergies: '', result: '', safe: true })
const doSafety = async () => {
  safetyLoading.value = true; safety.result = ''
  try {
    const body = { foods: safety.foods.split(/[,，]/).map(s => s.trim()).filter(Boolean), allergies: safety.allergies || undefined }
    const res = await safetyCheck(body)
    safety.result = typeof res === 'string' ? res : (res?.result || res?.advice || JSON.stringify(res, null, 2))
    safety.safe = !/危险|禁忌|相克|不宜|不建议|有害/.test(safety.result)
  } catch (e) { toast.error(err(e)) }
  finally { safetyLoading.value = false }
}

/* --- 创意烹饪 --- */
const creativeLoading = ref(false)
const creative = reactive({ ingredients: '', style: '', time: '', difficulty: '', result: '' })
const doCreative = async () => {
  creativeLoading.value = true; creative.result = ''
  try {
    const body = {
      ingredients: creative.ingredients.split(/[,，]/).map(s => s.trim()).filter(Boolean),
      style: creative.style || undefined,
      timeLimit: creative.time || undefined,
      difficulty: creative.difficulty || undefined
    }
    const res = await creativeCooking(body)
    creative.result = typeof res === 'string' ? res : (res?.recipe || res?.result || JSON.stringify(res, null, 2))
  } catch (e) { toast.error(err(e)) }
  finally { creativeLoading.value = false }
}
</script>

<style scoped>
.advice-card { background: var(--bg); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-top: 16px; }
.advice-card h4 { margin: 0 0 10px; font-size: 15px; color: var(--accent); }
.advice-text { font-size: 14px; line-height: 1.9; white-space: pre-wrap; color: var(--text); }
.advice-card.safe { border-color: var(--green); background: var(--green-light); }
.advice-card.safe h4 { color: var(--green); }
.advice-card.warn { border-color: var(--warn); background: var(--warn-light); }
.advice-card.warn h4 { color: var(--warn); }
</style>
