<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2><span></span> 购物清单</h2>
      <p class="desc">根据菜谱生成购物清单，一键管理所需食材</p>
    </div>

    <!-- 生成购物清单 -->
    <div class="section-card">
      <h3 class="section-title">生成清单</h3>
      <div class="form-grid-2">
        <div class="form-row"><label>菜谱名称</label><input class="ipt" v-model="gen.recipeName" placeholder="输入菜谱名称" @keyup.enter="generate" /></div>
        <div class="form-row"><label>份数</label><input class="ipt" v-model.number="gen.servings" type="number" min="1" max="20" /></div>
      </div>
      <div style="margin-top:12px">
        <button class="btn-primary" :disabled="genLoading || !gen.recipeName" @click="generate">生成购物清单</button>
      </div>
    </div>

    <!-- 我的购物清单 -->
    <div class="section-card">
      <div class="section-head-row">
        <h3 class="section-title">我的清单</h3>
        <div>
          <button class="btn-ghost sm" @click="loadList" :disabled="listLoading">刷新</button>
          <button class="btn-ghost sm danger" @click="clearList" :disabled="!shopList.length" style="margin-left:8px">清空</button>
        </div>
      </div>
      <div v-if="shopList.length">
        <div class="shop-grid">
          <div class="shop-item" v-for="item in groupedShopList" :key="item.name">
            <div class="shop-name">{{ item.name }}</div>
            <div class="shop-qty">{{ item.quantity }}个</div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else-if="!listLoading">
        <div class="empty-icon"></div>
        <p>还没有购物清单，生成一个试试吧</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { shoppingGenerate, shoppingByUser, shoppingClear } from '@/api/client'

const toast = useToast()
const userId = computed(() => localStorage.getItem('userId') || '')
const genLoading = ref(false)
const listLoading = ref(false)
const gen = reactive({ recipeName: '', servings: 2 })
const shopList = reactive([])
const err = (e) => e?.response?.data?.message || e.message || '请求失败'

const groupedShopList = computed(() => {
  const grouped = new Map()
  for (const entry of shopList) {
    const name = typeof entry === 'string'
      ? entry
      : (entry?.name || entry?.ingredientName || '')
    if (!name) continue
    const count = Number(entry?.quantity || entry?.amount || 1)
    grouped.set(name, (grouped.get(name) || 0) + count)
  }
  return Array.from(grouped.entries()).map(([name, quantity]) => ({ name, quantity }))
})

const generate = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  genLoading.value = true
  try {
    await shoppingGenerate({ userId: userId.value, recipeName: gen.recipeName, servings: gen.servings })
    toast.success('购物清单已生成')
    gen.recipeName = ''
    await loadList()
  } catch (e) { toast.error(err(e)) }
  finally { genLoading.value = false }
}

const loadList = async () => {
  if (!userId.value) return
  listLoading.value = true
  try {
    const res = await shoppingByUser(userId.value)
    shopList.splice(0)
    const list = Array.isArray(res) ? res : res?.items || res?.data || []
    list.forEach(r => shopList.push(r))
  } catch (e) { toast.error(err(e)) }
  finally { listLoading.value = false }
}

const clearList = async () => {
  try {
    await shoppingClear(userId.value)
    shopList.splice(0)
    toast.success('清单已清空')
  } catch (e) { toast.error(err(e)) }
}

onMounted(() => { if (userId.value) loadList() })
</script>

<style scoped>
.shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-top: 12px; }
.shop-item { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
.shop-name { font-weight: 600; font-size: 14px; color: var(--text); }
.shop-qty { font-size: 13px; color: var(--accent); font-weight: 500; }
</style>
