<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2><span></span> 饮食分析</h2>
      <p class="desc">输入食材名称，获取互补/相克/相似分析、AI 建议与关联探索</p>
    </div>

    <!-- 智能分析 -->
    <div class="section-card">
      <h3 class="section-title"> 智能分析</h3>
      <div class="form-inline">
        <div class="form-row" style="flex:1;min-width:160px">
          <label>食材名称</label>
          <input class="ipt" v-model="diet.foodName" placeholder="如：鸡胸肉" @keyup.enter="analyzeDietHandler" />
        </div>
        <div class="form-row" style="width:130px">
          <label>分析维度</label>
          <select class="ipt select" v-model="diet.intent">
            <option value="COMP">互补</option>
            <option value="INCOMP">相克</option>
            <option value="OVERLAP">相似</option>
            <option value="RECIPE">关联菜谱</option>
            <option value="ALL">全量</option>
          </select>
        </div>
        <div class="form-row" style="width:80px">
          <label>数量</label>
          <input class="ipt num" type="number" min="1" max="50" v-model.number="diet.topK" />
        </div>
        <div class="form-row" style="align-self:flex-end">
          <label class="check-label"><input type="checkbox" v-model="diet.includeAiAdvice" /> AI 建议</label>
        </div>
      </div>
      <div class="form-inline" style="margin-top:4px">
        <button class="btn-primary" :disabled="loading.analyze || !diet.foodName" @click="analyzeDietHandler">
          {{ loading.analyze ? '分析中' : '开始分析' }}
        </button>
        <button class="btn-ghost" :disabled="loading.analyzeAll || !diet.foodName" @click="analyzeDietAllHandler">
          {{ loading.analyzeAll ? '分析中' : '全维度分析' }}
        </button>
      </div>

      <div class="tag-list" v-if="analysisList.length">
        <span class="tag accent" v-for="item in analysisList" :key="item.name">{{ item.name }}
          <span v-if="item.score" style="opacity:.6;margin-left:4px">{{ (item.score * 100).toFixed(0) }}%</span>
        </span>
      </div>
      <template v-for="item in analysisList" :key="item.name + '-advice'">
        <div class="advice-card" v-if="item.aiAnalysisHtml" v-html="item.aiAnalysisHtml"></div>
      </template>
      <p class="error-text" v-if="diet.error">{{ diet.error }}</p>
    </div>

    <!-- 相似菜谱 -->
    <div class="section-card">
      <h3 class="section-title"> 相似菜谱</h3>
      <div class="form-inline">
        <div class="form-row" style="flex:1;min-width:200px">
          <input class="ipt" v-model="diet.similarName" placeholder="菜谱名称" @keyup.enter="similarHandler" />
        </div>
        <button class="btn-ghost" :disabled="loading.similar || !diet.similarName" @click="similarHandler">
          {{ loading.similar ? '查询中' : '查询相似' }}
        </button>
      </div>
      <div class="card-grid" v-if="similarList.length">
        <div class="item-card" v-for="r in similarList" :key="r.id || r.name">
          <p class="card-title">{{ r.name }}</p>
          <p class="card-desc">{{ r.ingredients || '暂无信息' }}</p>
        </div>
      </div>
    </div>

    <!-- 搭配推荐 -->
    <div class="section-card">
      <h3 class="section-title"> 搭配推荐</h3>
      <div class="form-inline">
        <div class="form-row" style="flex:1;min-width:200px">
          <input class="ipt" v-model="diet.pairName" placeholder="食材名称" @keyup.enter="pairingHandler" />
        </div>
        <button class="btn-ghost" :disabled="loading.pair || !diet.pairName" @click="pairingHandler">
          {{ loading.pair ? '生成中' : '获取搭配' }}
        </button>
      </div>
      <div v-if="pairResult.sourceFood" class="advice-card">
        <p><strong>主食材：</strong>{{ pairResult.sourceFood }}</p>
        <div class="tag-list" style="margin-top:8px">
          <span class="tag green" v-for="s in pairResult.suggestions" :key="s">{{ s }}</span>
        </div>
        <p style="margin-top:8px;font-size:13px;color:var(--muted)">共 {{ pairResult.total }} 个建议</p>
      </div>
    </div>

    <!-- 关联探索 -->
    <div class="section-card">
      <h3 class="section-title"> 关联探索</h3>
      <div class="form-inline">
        <div class="form-row" style="flex:1;min-width:160px">
          <label>食材</label>
          <input class="ipt" v-model="diet.relationFood" placeholder="食材名称" />
        </div>
        <div class="form-row" style="width:120px">
          <label>类型</label>
          <select class="ipt select" v-model="diet.relationIntent">
            <option value="COMP">互补</option>
            <option value="INCOMP">相克</option>
            <option value="OVERLAP">相似</option>
            <option value="RECIPE">菜谱</option>
          </select>
        </div>
        <div class="form-row" style="width:75px">
          <label>TopK</label>
          <input class="ipt num" type="number" min="1" max="50" v-model.number="diet.relationTopK" />
        </div>
        <div class="form-row" style="width:75px">
          <label>菜谱数</label>
          <input class="ipt num" type="number" min="0" max="10" v-model.number="diet.recipeLimit" />
        </div>
        <button class="btn-ghost" style="align-self:flex-end" :disabled="loading.relation || !diet.relationFood" @click="relationHandler">
          {{ loading.relation ? '探索中' : '探索' }}
        </button>
      </div>
      <pre class="result-box" v-if="diet.relationResult">{{ diet.relationResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { analyzeDiet, analyzeDietAll, dietSimilarRecipes, dietPairings, dietExploreRelations } from '@/api/client'

const toast = useToast()
const userId = computed(() => Number(localStorage.getItem('userId')) || null)

const diet = reactive({
  foodName: '', intent: 'COMP', topK: 5, includeAiAdvice: false,
  similarName: '', pairName: '',
  relationFood: '', relationIntent: 'COMP', relationTopK: 5, recipeLimit: 3,
  relationResult: '', error: ''
})
const analysisList = reactive([])
const similarList = reactive([])
const pairResult = reactive({ sourceFood: '', suggestions: [], total: 0 })
const loading = reactive({ analyze: false, analyzeAll: false, similar: false, pair: false, relation: false })

const formatRich = (text = '') => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
const errMsg = (e) => e?.response?.data?.message || e.message || '请求失败'

const processResult = (res) => {
  const list = Array.isArray(res) ? res : res?.data || res?.results || []
  list.forEach(item => analysisList.push({
    ...item,
    aiAnalysisHtml: item.aiAnalysis ? formatRich(item.aiAnalysis) : ''
  }))
}

const analyzeDietHandler = async () => {
  loading.analyze = true; diet.error = ''
  try {
    analysisList.splice(0)
    processResult(await analyzeDiet({ foodName: diet.foodName, intent: diet.intent, topK: diet.topK, includeAiAdvice: diet.includeAiAdvice, userId: userId.value }))
    if (!analysisList.length) toast.info('未找到相关分析结果')
  } catch (e) { diet.error = errMsg(e) }
  finally { loading.analyze = false }
}

const analyzeDietAllHandler = async () => {
  loading.analyzeAll = true; diet.error = ''
  try {
    analysisList.splice(0)
    const res = await analyzeDietAll({ foodName: diet.foodName, intent: diet.intent, topK: diet.topK, includeAiAdvice: diet.includeAiAdvice, userId: userId.value })
    const all = res?.complementary || res?.incompatible || res?.similar ? [...(res.complementary||[]), ...(res.incompatible||[]), ...(res.similar||[]), ...(res.recipes||[])] : null
    if (all) all.forEach(item => analysisList.push({ ...item, aiAnalysisHtml: item.aiAnalysis ? formatRich(item.aiAnalysis) : '' }))
    else processResult(res)
  } catch (e) { diet.error = errMsg(e) }
  finally { loading.analyzeAll = false }
}

const similarHandler = async () => {
  loading.similar = true
  try {
    similarList.splice(0)
    const res = await dietSimilarRecipes(diet.similarName)
    const list = Array.isArray(res) ? res : res?.recipes || res?.data || []
    list.forEach(r => similarList.push(r))
  } catch (e) { toast.error(errMsg(e)) }
  finally { loading.similar = false }
}

const pairingHandler = async () => {
  loading.pair = true
  try {
    const res = await dietPairings(diet.pairName)
    Object.assign(pairResult, { sourceFood: res?.sourceFood || diet.pairName, suggestions: res?.suggestions || [], total: res?.total ?? 0 })
  } catch (e) { toast.error(errMsg(e)) }
  finally { loading.pair = false }
}

const relationHandler = async () => {
  loading.relation = true
  try {
    const res = await dietExploreRelations({ foodName: diet.relationFood, intent: diet.relationIntent, topK: diet.relationTopK, recipeLimit: diet.recipeLimit, userId: userId.value })
    diet.relationResult = JSON.stringify(res, null, 2)
  } catch (e) { toast.error(errMsg(e)) }
  finally { loading.relation = false }
}
</script>

<style scoped>
/* All styles from global design system */
</style>
