<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2><span></span> 评价中心</h2>
      <p class="desc">对食材和菜谱进行多维评价，管理历史评价</p>
    </div>

    <div class="tab-bar" style="margin-bottom:20px">
      <button :class="['tab-btn', tab==='food' && 'active']" @click="tab='food'">食材评价</button>
      <button :class="['tab-btn', tab==='recipe' && 'active']" @click="tab='recipe'">菜谱评价</button>
      <button :class="['tab-btn', tab==='my' && 'active']" @click="tab='my';loadMyReviews()">我的评价</button>
    </div>

    <!-- 食材评价 -->
    <div class="section-card" v-show="tab==='food'">
      <h3 class="section-title"> 食材评价</h3>
      <div class="form-grid-2">
        <div class="form-row"><label>食材名称</label><input class="ipt" v-model="food.foodName" placeholder="如：西红柿" /></div>
        <div class="form-row"><label>口味 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=food.taste }" @click="food.taste=n">★</span></div>
        </div>
        <div class="form-row"><label>营养 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=food.nutrition }" @click="food.nutrition=n">★</span></div>
        </div>
        <div class="form-row"><label>新鲜度 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=food.freshness }" @click="food.freshness=n">★</span></div>
        </div>
        <div class="form-row"><label>性价比 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=food.cost }" @click="food.cost=n">★</span></div>
        </div>
        <div class="form-row"><label>评论</label><textarea class="ipt" v-model="food.comment" rows="2" placeholder="可选评论"></textarea></div>
      </div>
      <div style="margin-top:12px">
        <button class="btn-primary" :disabled="foodLoading || !food.foodName" @click="submitFood">提交评价</button>
      </div>
    </div>

    <!-- 菜谱评价 -->
    <div class="section-card" v-show="tab==='recipe'">
      <h3 class="section-title"> 菜谱评价</h3>
      <div class="form-grid-2">
        <div class="form-row"><label>菜谱 ID</label><input class="ipt" v-model="recipe.recipeId" placeholder="菜谱 ID" /></div>
        <div class="form-row"><label>口味 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=recipe.taste }" @click="recipe.taste=n">★</span></div>
        </div>
        <div class="form-row"><label>难度 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=recipe.difficulty }" @click="recipe.difficulty=n">★</span></div>
        </div>
        <div class="form-row"><label>营养 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=recipe.nutrition }" @click="recipe.nutrition=n">★</span></div>
        </div>
        <div class="form-row"><label>颜值 (1-5)</label>
          <div class="star-row"><span v-for="n in 5" :key="n" class="star" :class="{ active: n<=recipe.presentation }" @click="recipe.presentation=n">★</span></div>
        </div>
        <div class="form-row"><label>评论</label><textarea class="ipt" v-model="recipe.comment" rows="2" placeholder="可选评论"></textarea></div>
      </div>
      <div style="margin-top:12px">
        <button class="btn-primary" :disabled="recipeLoading || !recipe.recipeId" @click="submitRecipe">提交评价</button>
      </div>
    </div>

    <!-- 我的评价 -->
    <div v-show="tab==='my'">
      <div class="section-card">
        <h3 class="section-title">我的食材评价</h3>
        <div v-if="myFood.length" class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>食材</th><th>口味</th><th>营养</th><th>新鲜</th><th>性价比</th><th>评论</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="r in myFood" :key="r.id">
                <td>{{ r.foodName }}</td>
                <td>{{ r.tasteRating }}</td>
                <td>{{ r.nutritionRating }}</td>
                <td>{{ r.freshnessRating }}</td>
                <td>{{ r.costRating }}</td>
                <td>{{ r.comment || '-' }}</td>
                <td><button class="btn-ghost sm danger" @click="deleteFoodReview(r.id)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" v-else><div class="empty-icon"></div><p>暂无食材评价</p></div>
      </div>

      <div class="section-card">
        <h3 class="section-title">我的菜谱评价</h3>
        <div v-if="myRecipe.length" class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>菜谱ID</th><th>口味</th><th>难度</th><th>营养</th><th>颜值</th><th>评论</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="r in myRecipe" :key="r.id">
                <td>{{ r.recipeId }}</td>
                <td>{{ r.tasteRating }}</td>
                <td>{{ r.difficultyRating }}</td>
                <td>{{ r.nutritionRating }}</td>
                <td>{{ r.presentationRating }}</td>
                <td>{{ r.comment || '-' }}</td>
                <td><button class="btn-ghost sm danger" @click="deleteRecipeReview(r.id)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" v-else><div class="empty-icon"></div><p>暂无菜谱评价</p></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  feedbackSubmit, feedbackByUser,
  recipeReviewSubmit, recipeReviewsByUser,
  foodReviewDelete as apiFoodDel, recipeReviewDelete as apiRecipeDel
} from '@/api/client'

const toast = useToast()
const userId = computed(() => localStorage.getItem('userId') || '')
const tab = ref('food')
const foodLoading = ref(false)
const recipeLoading = ref(false)
const err = (e) => e?.response?.data?.message || e.message || '请求失败'

const food = reactive({ foodName: '', taste: 3, nutrition: 3, freshness: 3, cost: 3, comment: '' })
const recipe = reactive({ recipeId: '', taste: 3, difficulty: 3, nutrition: 3, presentation: 3, comment: '' })
const myFood = reactive([])
const myRecipe = reactive([])

const submitFood = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  foodLoading.value = true
  try {
    const overall = Math.round((food.taste + food.nutrition + food.freshness + food.cost) / 4)
    const res = await feedbackSubmit({
      userId: userId.value, foodName: food.foodName,
      tasteRating: food.taste, nutritionRating: food.nutrition,
      freshnessRating: food.freshness, costRating: food.cost,
      overallRating: overall,
      comment: food.comment || undefined
    })
    if (res && res.success === false) throw new Error(res.message || '提交失败')
    toast.success('食材评价已提交')
    food.foodName = ''; food.comment = ''
  } catch (e) { toast.error(err(e)) }
  finally { foodLoading.value = false }
}

const submitRecipe = async () => {
  if (!userId.value) { toast.warn('请先登录'); return }
  recipeLoading.value = true
  try {
    const overall = Math.round((recipe.taste + recipe.difficulty + recipe.nutrition + recipe.presentation) / 4)
    const res = await recipeReviewSubmit({
      userId: userId.value, recipeId: recipe.recipeId,
      tasteRating: recipe.taste, difficultyRating: recipe.difficulty,
      nutritionRating: recipe.nutrition, presentationRating: recipe.presentation,
      overallRating: overall,
      comment: recipe.comment || undefined
    })
    if (res && res.success === false) throw new Error(res.message || '提交失败')
    toast.success('菜谱评价已提交')
    recipe.recipeId = ''; recipe.comment = ''
  } catch (e) { toast.error(err(e)) }
  finally { recipeLoading.value = false }
}

const loadMyReviews = async () => {
  if (!userId.value) return
  try {
    const [fr, rr] = await Promise.all([
      feedbackByUser(userId.value).catch(() => []),
      recipeReviewsByUser(userId.value).catch(() => [])
    ])
    myFood.splice(0); (Array.isArray(fr) ? fr : []).forEach(r => myFood.push(r))
    myRecipe.splice(0); (Array.isArray(rr) ? rr : []).forEach(r => myRecipe.push(r))
  } catch { /* ignore */ }
}

const deleteFoodReview = async (id) => {
  try { await apiFoodDel(id); myFood.splice(myFood.findIndex(r => r.id === id), 1); toast.success('已删除') }
  catch (e) { toast.error(err(e)) }
}
const deleteRecipeReview = async (id) => {
  try { await apiRecipeDel(id); myRecipe.splice(myRecipe.findIndex(r => r.id === id), 1); toast.success('已删除') }
  catch (e) { toast.error(err(e)) }
}
</script>

<style scoped>
.data-table-wrap { overflow-x: auto; }
</style>
