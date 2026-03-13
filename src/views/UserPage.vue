<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2>健康档案</h2>
      <p class="desc">记录基础信息，定制饮食建议。过敏、病史等会影响推荐结果，请保持最新。</p>
    </div>

    <!-- BMI / BMR 指标卡 -->
    <div class="metric-row">
      <div class="metric-card">
        <span class="metric-label">BMI</span>
        <span class="metric-value">{{ metrics.bmi || '—' }}</span>
        <span class="metric-note">{{ metrics.bmiNote }}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">估算 BMR</span>
        <span class="metric-value">{{ metrics.bmr || '—' }}</span>
        <span class="metric-note">Mifflin-St Jeor 公式，仅供参考</span>
      </div>
    </div>

    <!-- 表单 -->
    <div class="section-card">
      <h3 class="section-title">填写 / 更新</h3>
      <form @submit.prevent="saveProfile">
        <div class="grid-two">
          <div class="form-row">
            <label>昵称（可选）</label>
            <input class="ipt" v-model="profile.nickname" placeholder="用于展示" />
          </div>
          <div class="form-row">
            <label>性别</label>
            <select class="ipt" v-model="profile.gender">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div class="form-row">
            <label>年龄</label>
            <input class="ipt" type="number" min="1" v-model.number="profile.age" placeholder="岁" />
          </div>
          <div class="form-row">
            <label>体重 (kg)</label>
            <input class="ipt" type="number" step="0.1" min="1" v-model.number="profile.weight" placeholder="例如 62" />
          </div>
          <div class="form-row">
            <label>身高 (cm)</label>
            <input class="ipt" type="number" step="0.5" min="80" v-model.number="profile.height" placeholder="例如 170" />
          </div>
          <div class="form-row">
            <label>活动强度</label>
            <select class="ipt" v-model="profile.activityLevel">
              <option value="sedentary">久坐</option>
              <option value="light">轻度（每周 1-3 次轻运动）</option>
              <option value="moderate">中度（每周 3-5 次）</option>
              <option value="active">重度（高强度或体力劳动）</option>
            </select>
          </div>
          <div class="form-row">
            <label>目标</label>
            <select class="ipt" v-model="profile.goal">
              <option value="fat_loss">减脂</option>
              <option value="muscle_gain">增肌</option>
              <option value="maintain">维持健康</option>
            </select>
          </div>
          <div class="form-row">
            <label>偏好口味</label>
            <select class="ipt" v-model="profile.flavorPref">
              <option value="light">清淡</option>
              <option value="spicy">辛辣</option>
              <option value="sweet">甜口</option>
            </select>
          </div>
        </div>

        <div class="form-row" style="margin-top:16px">
          <label>过敏原（自由填写，多个可用逗号、顿号或换行分隔）</label>
          <textarea class="ipt" rows="3" v-model="allergenInput" placeholder="例如：花生，虾，牛奶蛋白"></textarea>
        </div>

        <div class="form-row">
          <label>病史 / 禁忌（自由填写，多个可用逗号、顿号或换行分隔）</label>
          <textarea class="ipt" rows="3" v-model="illnessInput" placeholder="例如：高血压，糖尿病，痛风"></textarea>
        </div>

        <div class="grid-two" style="margin-top:12px">
          <div class="form-row">
            <label>其他偏好（选填）</label>
            <textarea class="ipt" rows="3" v-model="profile.preferences" placeholder="例：喜欢高蛋白、地中海风味"></textarea>
          </div>
          <div class="form-row">
            <label>限制项（选填）</label>
            <textarea class="ipt" rows="3" v-model="profile.restrictions" placeholder="例：晚餐不吃主食，控制糖/盐"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保存并更新' }}</button>
          <span v-if="status" class="status-msg">{{ status }}</span>
        </div>
      </form>
    </div>

    <!-- 档案状态 -->
    <div class="section-card">
      <h3 class="section-title">档案状态</h3>
      <div class="state-grid">
        <div class="state-item"><span class="state-label">上次同步</span><span>{{ lastSynced || '尚未同步' }}</span></div>
        <div class="state-item"><span class="state-label">过敏原</span><span>{{ profile.allergens.length ? profile.allergens.join('、') : '无' }}</span></div>
        <div class="state-item"><span class="state-label">病史/禁忌</span><span>{{ profile.illnesses.length ? profile.illnesses.join('、') : '无' }}</span></div>
        <div class="state-item"><span class="state-label">目标</span><span>{{ goalLabel }}</span></div>
      </div>
    </div>

    <!-- 危险操作 -->
    <div class="section-card danger-zone">
      <h3 class="section-title" style="color:#ef4444">危险操作</h3>
      <p class="desc">删除账户及档案数据不可恢复，请谨慎操作。</p>
      <button class="btn-danger" :disabled="deleting" @click="deleteProfile">{{ deleting ? '删除中…' : '删除账户' }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchUserInfo, updateUser, deleteUser } from '@/api/client';
import { useToast } from '@/composables/useToast';

const toast = useToast();

const router = useRouter();
const userId = Number(localStorage.getItem('userId')) || 0;
const profile = reactive({
  nickname: '',
  gender: 'male',
  age: null,
  weight: null,
  height: null,
  activityLevel: 'sedentary',
  goal: 'maintain',
  allergens: [],
  illnesses: [],
  flavorPref: 'light',
  preferences: '',
  restrictions: ''
});

const saving = ref(false);
const deleting = ref(false);
const status = ref('');
const lastSynced = ref('');
const allergenInput = ref('');
const illnessInput = ref('');

const splitMultiValue = (text) => {
  if (!text) return [];
  return [...new Set(
    text
      .split(/[\n,，、；;]+/)
      .map(item => item.trim())
      .filter(Boolean)
  )];
};

const metrics = computed(() => {
  if (!profile.height || !profile.weight) return { bmi: '', bmiNote: '补全身高体重以计算', bmr: '' };
  const heightM = profile.height / 100;
  const bmiVal = (profile.weight / (heightM * heightM)).toFixed(1);
  const bmrVal = profile.gender === 'male'
    ? Math.round(10 * profile.weight + 6.25 * profile.height - 5 * (profile.age || 25) + 5)
    : Math.round(10 * profile.weight + 6.25 * profile.height - 5 * (profile.age || 25) - 161);
  let bmiNote = '正常范围 18.5-23.9';
  if (bmiVal < 18.5) bmiNote = '偏瘦，注意增肌与蛋白';
  else if (bmiVal > 23.9) bmiNote = '偏高，控制总热量与糖盐';
  return { bmi: bmiVal, bmiNote, bmr: bmrVal };
});

const goalLabel = computed(() => {
  switch (profile.goal) {
    case 'fat_loss': return '减脂';
    case 'muscle_gain': return '增肌';
    default: return '维持健康';
  }
});

const loadProfile = async () => {
  if (!userId) return;
  try {
    const res = await fetchUserInfo(userId);
    if (!res) return;
    profile.nickname = res.nickname || '';
    profile.gender = res.gender || 'male';
    profile.age = res.age ?? null;
    profile.weight = res.weight ?? null;
    profile.height = res.height ?? null;
    profile.activityLevel = res.activityLevel || 'sedentary';
    profile.goal = res.goal || 'maintain';
    profile.allergens = Array.isArray(res.allergens) ? res.allergens : [];
    profile.illnesses = Array.isArray(res.illnesses) ? res.illnesses : [];
    allergenInput.value = profile.allergens.join('，');
    illnessInput.value = profile.illnesses.join('，');
    profile.flavorPref = res.flavorPref || 'light';
    profile.preferences = res.preferences || '';
    profile.restrictions = res.restrictions || '';
    lastSynced.value = new Date().toLocaleString();
  } catch (e) {
    status.value = '获取用户信息失败，请检查登录状态';
    toast.error('加载健康档案失败');
  }
};

const saveProfile = async () => {
  if (!userId) {
    status.value = '请先登录再保存档案';
    return;
  }
  saving.value = true;
  status.value = '';
  try {
    profile.allergens = splitMultiValue(allergenInput.value);
    profile.illnesses = splitMultiValue(illnessInput.value);
    await updateUser(userId, {
      nickname: profile.nickname,
      gender: profile.gender,
      age: profile.age,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      allergens: profile.allergens,
      illnesses: profile.illnesses,
      flavorPref: profile.flavorPref,
      preferences: profile.preferences,
      restrictions: profile.restrictions
    });
    status.value = '已保存并同步健康档案';
    toast.success('健康档案已更新');
    lastSynced.value = new Date().toLocaleString();
  } catch (e) {
    status.value = '保存失败，请稍后重试';
    toast.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const deleteProfile = async () => {
  if (!userId) {
    status.value = '请先登录';
    return;
  }
  if (!confirm('确认删除账户与健康档案？此操作不可恢复。')) return;
  deleting.value = true;
  try {
    await deleteUser(userId);
    localStorage.clear();
    router.push('/login');
  } catch (e) {
    status.value = '删除失败，请稍后再试';
  } finally {
    deleting.value = false;
  }
};

onMounted(loadProfile);
</script>

<style scoped>
.metric-row { display: flex; gap: 16px; flex-wrap: wrap; }
.metric-card {
  flex: 1; min-width: 200px;
  padding: 20px; border-radius: 14px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff; display: flex; flex-direction: column; gap: 4px;
}
.metric-label { font-size: 13px; opacity: .85; font-weight: 600; }
.metric-value { font-size: 32px; font-weight: 800; }
.metric-note { font-size: 12px; opacity: .75; }

.grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media(max-width:640px){ .grid-two{ grid-template-columns:1fr; } }

.form-actions { display: flex; align-items: center; gap: 14px; margin-top: 18px; }
.status-msg { font-size: 13px; color: #888; }

.state-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.state-item {
  padding: 12px; border-radius: 10px; background: #fafafa;
  border: 1px dashed #e0e0e0; display: flex; flex-direction: column; gap: 4px;
}
.state-label { font-size: 12px; color: #999; font-weight: 600; }

.danger-zone { border: 1px solid rgba(239,68,68,.25); }
.btn-danger {
  padding: 8px 20px; border-radius: 8px; border: 1px solid #ef4444;
  background: #fff; color: #ef4444; font-weight: 600; cursor: pointer; transition: all .2s;
}
.btn-danger:hover { background: #ef4444; color: #fff; }
.btn-danger:disabled { opacity: .5; cursor: not-allowed; }
</style>
