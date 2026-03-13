<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2><span></span> 管理后台</h2>
      <p class="desc">用户管理、数据导入、模型训练、系统运维</p>
    </div>

    <div class="tab-bar" style="margin-bottom:20px">
      <button v-for="t in tabs" :key="t.key" :class="['tab-btn', tab===t.key && 'active']"
              @click="tab=t.key">{{ t.label }}</button>
    </div>

    <!-- 1. 用户管理 -->
    <div v-show="tab==='users'">
      <div class="section-card">
        <div class="section-head-row">
          <h3 class="section-title"> 用户列表</h3>
          <button class="btn-ghost sm" @click="loadUsers" :disabled="usersLoading">刷新</button>
        </div>
        <div v-if="users.length" class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>用户名</th><th>角色</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.id }}</td>
                <td>{{ u.username }}</td>
                <td><span class="status-tag" :class="u.role==='ROLE_ADMIN'?'green':'blue'">{{ u.role==='ROLE_ADMIN'?'管理员':'用户' }}</span></td>
                <td>
                  <button class="btn-ghost sm" v-if="u.role!=='ROLE_ADMIN'" @click="setRole(u.id,'ROLE_ADMIN')">设为管理员</button>
                  <button class="btn-ghost sm" v-if="u.role!=='ROLE_USER'" @click="setRole(u.id,'ROLE_USER')">设为用户</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" v-else-if="!usersLoading"><div class="empty-icon"></div><p>点击刷新加载用户列表</p></div>
      </div>
    </div>

    <!-- 2. 数据导入 -->
    <div v-show="tab==='data'">
      <div class="section-card">
        <h3 class="section-title"> 数据导入</h3>
        <p class="desc">导入入口已按用途整理：单文件路径导入、目录全量导入、上传食材文件导入。</p>

        <div class="advice-card import-block">
          <h4>单文件路径导入</h4>
          <p class="desc">适合单独导入一个 food.json 或 recipe.json 文件。</p>
          <div class="form-row">
            <label>JSON 文件路径</label>
            <input class="ipt" v-model="dataPath" placeholder="例如：D:/javaProject/data/food.json" />
          </div>
          <div class="form-inline" style="margin-top:12px;gap:8px">
            <button class="btn-primary sm" :disabled="importing || !dataPath" @click="doImport('food')">导入食材文件</button>
            <button class="btn-primary sm" :disabled="importing || !dataPath" @click="doImport('recipe')">导入菜谱文件</button>
          </div>
        </div>

        <div class="advice-card import-block">
          <h4>目录全量导入</h4>
          <p class="desc">扫描目录下的 food*.json 和 recipe*.json，按既定顺序批量导入。</p>
          <div class="form-inline" style="gap:8px">
            <button class="btn-primary sm" :disabled="importing" @click="doImport('all')">执行全量导入</button>
          </div>
        </div>

        <div class="advice-card import-block">
          <h4>上传食材文件</h4>
          <p class="desc">用于直接上传单个食材 JSON 文件，不再区分单独的“更新”入口。</p>
          <div class="form-row">
            <label>本地文件</label>
            <input type="file" accept=".json" @change="onFile" class="ipt" />
          </div>
          <div class="form-inline" style="margin-top:12px;gap:8px">
            <button class="btn-primary sm" :disabled="importing || !uploadFile" @click="doImport('upload')">上传并导入食材</button>
          </div>
        </div>
      </div>

      <div class="section-card" v-if="importTask.id">
        <div class="section-head-row">
          <h3 class="section-title">导入进度</h3>
          <button class="btn-ghost sm" @click="refreshImportStatus" :disabled="!importTask.id">搜索进度</button>
          <button class="btn-ghost sm danger" @click="cancelImport" :disabled="importTask.done">取消</button>
        </div>
        <div class="progress-bar"><div class="progress-fill" :style="{width: importTask.pct+'%'}"></div></div>
        <p class="desc">{{ importTask.msg }} ({{ importTask.pct }}%)</p>
        <p class="desc" v-if="importTask.totalFiles > 0">
          已处理文件：{{ importTask.processedFiles }} / {{ importTask.totalFiles }} 个
          <span v-if="importTask.failedFiles > 0" style="color: #ff6b6b">（{{ importTask.failedFiles }} 个失败）</span>
        </p>
        <p class="desc" v-if="importTask.totalItems > 0 || (importTask.successCount + importTask.failCount) > 0">
          <template v-if="importTask.totalItems > 0">
            累计条目进度：{{ importTask.successCount + importTask.failCount }} / {{ importTask.totalItems }} 条
          </template>
          <template v-else>
            累计已处理条目：{{ importTask.successCount + importTask.failCount }} 条
          </template>
          <span v-if="importTask.failCount > 0" style="color: #ff6b6b">（{{ importTask.failCount }} 条失败）</span>
        </p>
        <p class="desc" v-if="importTask.id">
          条目处理结果：成功 {{ importTask.successCount }} 条，
          <span :style="{ color: importTask.failCount > 0 ? '#ff6b6b' : 'inherit' }">失败 {{ importTask.failCount }} 条</span>
        </p>
      </div>

      <div class="section-card">
        <div class="section-head-row">
          <h3 class="section-title"> 数据统计</h3>
          <button class="btn-ghost sm" @click="loadStats">刷新</button>
        </div>
        <div class="metric-row" v-if="stats">
          <div class="metric-card"><span class="metric-label">食材数</span><span class="metric-value">{{ stats.foodCount ?? '' }}</span></div>
          <div class="metric-card green-card"><span class="metric-label">菜谱数</span><span class="metric-value">{{ stats.recipeCount ?? '' }}</span></div>
          <div class="metric-card blue-card"><span class="metric-label">食材节点</span><span class="metric-value">{{ stats.ingredientCount ?? '' }}</span></div>
        </div>
      </div>
    </div>

    <!-- 3. 模型训练 -->
    <div v-show="tab==='train'">
      <div class="section-card">
        <h3 class="section-title"> 模型训练</h3>
        <p class="desc">触发后台模型训练流程，训练需要较长时间</p>
        <div class="form-inline" style="gap:10px">
          <button class="btn-primary" :disabled="training" @click="doTrain('metapath')">训练 Metapath2Vec</button>
          <button class="btn-primary" :disabled="training" @click="doTrain('graphsage')">训练 GraphSAGE</button>
        </div>
        <div class="section-card" v-if="trainTask.id" style="margin-top:14px">
          <div class="section-head-row">
            <h3 class="section-title">训练进度</h3>
            <button class="btn-ghost sm" :disabled="trainingRefreshLoading" @click="refreshTrainingStatus">刷新状态</button>
          </div>
          <p class="desc" v-if="trainTask.model">当前模型: {{ trainTask.modelLabel }}</p>
          <div class="progress-bar"><div class="progress-fill" :style="{width: trainTask.pct + '%'}"></div></div>
          <p class="desc">{{ trainTask.phase || '训练进行中' }} ({{ trainTask.pct }}%)</p>
          <p class="desc" v-if="trainTask.status">状态: {{ trainTask.status }}</p>
          <div class="advice-card" v-if="trainTask.log">
            <h4>最新日志</h4>
            <div class="advice-text">{{ trainTask.log }}</div>
          </div>
        </div>
        <div class="advice-card" v-if="trainResult">
          <h4>训练结果</h4>
          <div class="advice-text">{{ trainResult }}</div>
        </div>
      </div>

      <div class="section-card">
        <h3 class="section-title"> 嵌入管理</h3>
        <div class="form-inline" style="gap:10px">
          <input class="ipt" v-model="embedName" placeholder="食材名（单个生成）" style="flex:1" />
          <button class="btn-primary sm" :disabled="embLoading" @click="doEmbed('single')">生成嵌入</button>
          <button class="btn-primary sm" :disabled="embLoading" @click="doEmbed('missing')">补齐缺失</button>
          <button class="btn-ghost sm" :disabled="embLoading" @click="doEmbed('reload')">重载 ONNX</button>
        </div>
        <p class="success-text" v-if="embedMsg">{{ embedMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  adminListUsers, adminSetRole,
  importFoodByPath, dataStats, importFoodFile,
  importRecipeByPath, importAllWithPath, importProgress, importRunning, importCancel,
  trainMetapath2vec, trainGraphsage, trainProgress, trainRunning,
  generateEmbedding, generateEmbeddingMissing, reloadOnnx
} from '@/api/client'

const toast = useToast()
const tabs = [
  { key: 'users', label: '用户管理' },
  { key: 'data', label: '数据导入' },
  { key: 'train', label: '模型训练' }
]
const tab = ref('users')
const err = (e) => e?.response?.data?.message || e.message || '操作失败'

/* --- 用户管理 --- */
const users = reactive([])
const usersLoading = ref(false)
const loadUsers = async () => {
  usersLoading.value = true
  try {
    const res = await adminListUsers()
    users.splice(0); (Array.isArray(res) ? res : []).forEach(u => users.push(u))
  } catch (e) { toast.error(err(e)) }
  finally { usersLoading.value = false }
}
const setRole = async (id, role) => {
  try {
    await adminSetRole(id, role)
    const u = users.find(x => x.id === id)
    if (u) u.role = role
    toast.success('角色已更新')
  } catch (e) { toast.error(err(e)) }
}
onMounted(loadUsers)

/* --- 数据导入 --- */
const dataPath = ref('')
const uploadFile = ref(null)
const importing = ref(false)
const stats = ref(null)
const importTask = reactive({ 
  id: '', 
  pct: 0, 
  msg: '', 
  done: false, 
  totalFiles: 0,
  processedFiles: 0,
  failedFiles: 0,
  totalItems: 0, 
  successCount: 0, 
  failCount: 0 
})
const IMPORT_TASK_STORAGE_KEY = 'admin.import.taskId'
let pollTimer = null
let trainPollTimer = null

const onFile = (e) => { uploadFile.value = e.target.files[0] || null }

const doImport = async (mode) => {
  importing.value = true
  try {
    if (mode === 'food') { const res = await importFoodByPath(dataPath.value || undefined); startPoll(res); toast.info('食材异步导入已启动') }
    else if (mode === 'recipe') { const res = await importRecipeByPath(dataPath.value || undefined); startPoll(res); toast.info('菜谱异步导入已启动') }
    else if (mode === 'all') { const res = await importAllWithPath(dataPath.value || undefined); startPoll(res); toast.info('全量异步导入已启动') }
    else if (mode === 'upload') { await importFoodFile(uploadFile.value); toast.success('文件上传导入完成') }
  } catch (e) { toast.error(err(e)) }
  finally { importing.value = false }
}

const startPoll = async (res, silent = false) => {
  const taskId = typeof res === 'string' ? res : res?.taskId || res?.id || ''
  if (!taskId) return
  localStorage.setItem(IMPORT_TASK_STORAGE_KEY, taskId)
  importTask.id = taskId; importTask.pct = 0; importTask.msg = '进行中'; importTask.done = false
  importTask.totalFiles = 0; importTask.processedFiles = 0; importTask.failedFiles = 0
  importTask.totalItems = 0; importTask.successCount = 0; importTask.failCount = 0
  try {
    const p = await importProgress(taskId)
    applyImportProgress(p)
    if (importTask.done && !silent) {
      toast.success('导入完成')
    }
  } catch {
  }
}

const applyImportProgress = (p) => {
  importTask.pct = p?.percent ?? p?.progress ?? p?.percentage ?? 0
  importTask.msg = p?.phase || p?.status || p?.message || '进行中'
  importTask.totalFiles = p?.totalFiles || 0
  importTask.processedFiles = p?.processedFiles || 0
  importTask.failedFiles = p?.failedFiles || 0
  importTask.totalItems = p?.totalItems || 0
  importTask.successCount = p?.successCount || 0
  importTask.failCount = p?.failCount || 0
  const status = (p?.status || '').toUpperCase()
  importTask.done = importTask.pct >= 100 || p?.done || p?.completed || status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED'
  if (importTask.done) {
    localStorage.removeItem(IMPORT_TASK_STORAGE_KEY)
  }
}

const refreshImportStatus = async () => {
  if (!importTask.id) return
  try {
    const p = await importProgress(importTask.id)
    applyImportProgress(p)
    toast.success('导入状态已刷新')
  } catch (e) {
    toast.error(err(e))
  }
}

const cancelImport = async () => {
  try { await importCancel(importTask.id); importTask.done = true; toast.info('已取消') }
  catch (e) { toast.error(err(e)) }
}

const loadStats = async () => {
  try { stats.value = await dataStats() } catch (e) { toast.error(err(e)) }
}
onMounted(loadStats)

const restoreRunningImport = async () => {
  try {
    const running = await importRunning()
    if (running?.taskId && running?.status === 'RUNNING') {
      tab.value = 'data'
      startPoll(running.taskId, true)
      return
    }

    const lastTaskId = localStorage.getItem(IMPORT_TASK_STORAGE_KEY)
    if (!lastTaskId) return
    const p = await importProgress(lastTaskId)
    tab.value = 'data'
    importTask.id = lastTaskId
    applyImportProgress(p)
    if (!importTask.done) {
      startPoll(lastTaskId, true)
    }
  } catch {
  }
}

onMounted(restoreRunningImport)

const restoreRunningTraining = async () => {
  try {
    const runningTask = await trainRunning()
    if (runningTask?.taskId && runningTask?.status === 'RUNNING') {
      startTrainPoll(runningTask.taskId, runningTask.model || 'metapath', true)
    }
  } catch {
  }
}

onMounted(restoreRunningTraining)

/* --- 模型训练 --- */
const training = ref(false)
const trainingRefreshLoading = ref(false)
const trainResult = ref('')
const trainTask = reactive({ id: '', pct: 0, phase: '', status: '', log: '', model: '', modelLabel: '', done: false })
const doTrain = async (model) => {
  training.value = true; trainResult.value = ''
  try {
    const fn = model === 'metapath' ? trainMetapath2vec : trainGraphsage
    const res = await fn()
    const taskId = typeof res === 'string' ? res : (res?.taskId || res?.id || '')
    if (!taskId) {
      trainResult.value = typeof res === 'string' ? res : (res?.message || JSON.stringify(res))
      training.value = false
      return
    }
    startTrainPoll(taskId, model)
    toast.info('训练任务已启动')
  } catch (e) { training.value = false; toast.error(err(e)) }
}

const startTrainPoll = (taskId, model, silent = false) => {
  trainTask.id = taskId
  trainTask.model = model
  trainTask.modelLabel = model === 'graphsage' ? 'GraphSAGE' : 'Metapath2Vec'
  trainTask.pct = 0
  trainTask.phase = '任务已提交'
  trainTask.status = 'RUNNING'
  trainTask.log = ''
  trainTask.done = false
  training.value = true
  if (trainPollTimer) clearInterval(trainPollTimer)
  if (!silent) {
    trainResult.value = ''
  }
  trainPollTimer = setInterval(async () => {
    try {
      const p = await trainProgress(taskId)
      trainTask.pct = p?.progress ?? p?.percent ?? 0
      trainTask.phase = p?.phase || '训练进行中'
      trainTask.status = p?.status || ''
      trainTask.model = p?.model || trainTask.model
      trainTask.modelLabel = trainTask.model === 'graphsage' ? 'GraphSAGE' : 'Metapath2Vec'
      const fallbackLog = Array.isArray(p?.logs) && p.logs.length ? p.logs[p.logs.length - 1] : ''
      trainTask.log = p?.lastLog || fallbackLog
      if (p?.done || p?.status === 'COMPLETED' || p?.status === 'FAILED') {
        trainTask.done = true
        training.value = false
        clearInterval(trainPollTimer)
        trainResult.value = p?.result || p?.phase || trainTask.log || '训练已结束'
        if (p?.status === 'COMPLETED') toast.success('训练已完成')
        else toast.error(trainResult.value)
      }
    } catch (e) {
      training.value = false
      trainTask.done = true
      clearInterval(trainPollTimer)
      toast.error(err(e))
    }
  }, 2000)
}

const refreshTrainingStatus = async () => {
  if (!trainTask.id) return
  trainingRefreshLoading.value = true
  try {
    const p = await trainProgress(trainTask.id)
    trainTask.pct = p?.progress ?? p?.percent ?? 0
    trainTask.phase = p?.phase || trainTask.phase
    trainTask.status = p?.status || trainTask.status
    trainTask.model = p?.model || trainTask.model
    trainTask.modelLabel = trainTask.model === 'graphsage' ? 'GraphSAGE' : 'Metapath2Vec'
    const fallbackLog = Array.isArray(p?.logs) && p.logs.length ? p.logs[p.logs.length - 1] : ''
    trainTask.log = p?.lastLog || fallbackLog
    toast.success('训练状态已刷新')
  } catch (e) {
    toast.error(err(e))
  } finally {
    trainingRefreshLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (trainPollTimer) clearInterval(trainPollTimer)
})

/* --- 嵌入 --- */
const embLoading = ref(false)
const embedName = ref('')
const embedMsg = ref('')
const doEmbed = async (mode) => {
  embLoading.value = true; embedMsg.value = ''
  try {
    if (mode === 'single') { await generateEmbedding(embedName.value); embedMsg.value = '嵌入已生成 ' }
    else if (mode === 'missing') { await generateEmbeddingMissing(); embedMsg.value = '缺失嵌入已补齐 ' }
    else { await reloadOnnx(); embedMsg.value = 'ONNX 模型已重载 ' }
    toast.success(embedMsg.value)
  } catch (e) { toast.error(err(e)) }
  finally { embLoading.value = false }
}
</script>

<style scoped>
.metric-row { display: flex; gap: 14px; flex-wrap: wrap; }
.advice-card { background: var(--bg); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-top: 14px; }
.advice-card h4 { margin: 0 0 8px; font-size: 14px; color: var(--accent); }
.advice-text { font-size: 14px; line-height: 1.8; white-space: pre-wrap; color: var(--text); }
.import-block { margin-top: 16px; }
</style>
