export const mockToday = {
  day_count: 23,
  streak: 7,
  weight: 72.3,
  weight_trend: -0.4,
  target_weight: 65,
  calories_consumed: 1280,
  calories_target: 1800,
  calories_burned: 320,
  workout_minutes: 35,
  water_cups: 5,
  water_target: 8,
  tasks: [
    { id: '1', title: '记录早餐', type: 'diet', completed: true, completed_at: '08:15' },
    { id: '2', title: '完成30分钟运动', type: 'workout', completed: true, completed_at: '10:30' },
    { id: '3', title: '记录午餐', type: 'diet', completed: true, completed_at: '12:45' },
    { id: '4', title: '喝满8杯水', type: 'water', completed: false, completed_at: null },
    { id: '5', title: '记录晚餐', type: 'diet', completed: false, completed_at: null },
    { id: '6', title: '称体重', type: 'weight', completed: true, completed_at: '07:30' },
  ],
  ai_tip: '你已经连续打卡7天了！今天热量摄入控制得不错，下午可以来一杯无糖酸奶补充蛋白质哦~',
};

export const mockTrainingLibrary = [
  {
    id: 'w1', name: '全身燃脂HIIT', category: 'hiit', duration: 20, calories: 250,
    level: '中级', icon: 'fire', description: '高强度间歇训练，快速燃脂',
    exercises: [
      { name: '开合跳', duration: 30, rest: 10 },
      { name: '高抬腿', duration: 30, rest: 10 },
      { name: '波比跳', duration: 20, rest: 15 },
      { name: '深蹲跳', duration: 25, rest: 10 },
      { name: '登山跑', duration: 30, rest: 10 },
      { name: '俯卧撑', duration: 20, rest: 15 },
    ],
  },
  {
    id: 'w2', name: '腹肌撕裂者', category: 'strength', duration: 15, calories: 150,
    level: '初级', icon: 'muscle', description: '针对核心腹肌的高效训练',
    exercises: [
      { name: '仰卧卷腹', duration: 30, rest: 10 },
      { name: '俄罗斯转体', duration: 25, rest: 10 },
      { name: '平板支撑', duration: 30, rest: 15 },
      { name: '自行车卷腹', duration: 25, rest: 10 },
    ],
  },
  {
    id: 'w3', name: '快走燃脂', category: 'cardio', duration: 30, calories: 200,
    level: '入门', icon: 'run', description: '适合初学者的有氧运动',
    exercises: [
      { name: '热身慢走', duration: 60, rest: 0 },
      { name: '快走', duration: 120, rest: 30 },
      { name: '快走加速', duration: 120, rest: 30 },
      { name: '放松慢走', duration: 60, rest: 0 },
    ],
  },
  {
    id: 'w4', name: '上肢力量', category: 'strength', duration: 25, calories: 180,
    level: '中级', icon: 'dumbbell', description: '手臂、肩膀、胸部力量训练',
    exercises: [
      { name: '俯卧撑', duration: 30, rest: 15 },
      { name: '钻石俯卧撑', duration: 20, rest: 15 },
      { name: '三头肌撑', duration: 25, rest: 10 },
      { name: '手臂画圈', duration: 30, rest: 10 },
    ],
  },
  {
    id: 'w5', name: '睡前拉伸', category: 'stretch', duration: 10, calories: 50,
    level: '入门', icon: 'yoga', description: '放松肌肉，改善睡眠质量',
    exercises: [
      { name: '颈部拉伸', duration: 30, rest: 5 },
      { name: '肩部拉伸', duration: 30, rest: 5 },
      { name: '坐姿前屈', duration: 30, rest: 5 },
      { name: '蝴蝶式', duration: 30, rest: 5 },
    ],
  },
  {
    id: 'w6', name: '臀腿塑形', category: 'strength', duration: 20, calories: 200,
    level: '中级', icon: 'leg', description: '臀部和腿部力量训练',
    exercises: [
      { name: '深蹲', duration: 30, rest: 10 },
      { name: '弓步蹲', duration: 25, rest: 10 },
      { name: '臀桥', duration: 30, rest: 10 },
      { name: '侧卧抬腿', duration: 25, rest: 10 },
      { name: '蹲跳', duration: 20, rest: 15 },
    ],
  },
];

export const mockTrainingStats = {
  total_workouts: 18,
  total_duration_minutes: 342,
  total_calories: 3250,
  week_workouts: 4,
};

export const mockTrainingHistory = [
  { id: 'h1', workout_id: 'w1', workout_name: '全身燃脂HIIT', duration_seconds: 1200, calories_burned: 245, log_date: '06-24' },
  { id: 'h2', workout_id: 'w5', workout_name: '睡前拉伸', duration_seconds: 600, calories_burned: 48, log_date: '06-23' },
  { id: 'h3', workout_id: 'w2', workout_name: '腹肌撕裂者', duration_seconds: 900, calories_burned: 148, log_date: '06-22' },
  { id: 'h4', workout_id: 'w6', workout_name: '臀腿塑形', duration_seconds: 1100, calories_burned: 195, log_date: '06-21' },
];

export const mockDiet = {
  meals: {
    breakfast: [
      { id: 'm1', name: '全麦面包 2片', calories: 180, protein: 8, carbs: 30, fat: 3 },
      { id: 'm2', name: '水煮蛋 2个', calories: 140, protein: 12, carbs: 1, fat: 10 },
      { id: 'm3', name: '脱脂牛奶 250ml', calories: 80, protein: 8, carbs: 12, fat: 0 },
    ],
    lunch: [
      { id: 'm4', name: '鸡胸肉 150g', calories: 230, protein: 35, carbs: 0, fat: 8 },
      { id: 'm5', name: '糙米饭 150g', calories: 180, protein: 4, carbs: 38, fat: 1 },
      { id: 'm6', name: '西兰花 100g', calories: 30, protein: 3, carbs: 5, fat: 0 },
    ],
    dinner: [
      { id: 'm7', name: '清蒸鱼 200g', calories: 220, protein: 30, carbs: 0, fat: 10 },
      { id: 'm8', name: '凉拌黄瓜', calories: 20, protein: 1, carbs: 4, fat: 0 },
    ],
    snack: [
      { id: 'm9', name: '苹果 1个', calories: 80, protein: 0, carbs: 20, fat: 0 },
    ],
  },
  total_calories: 1160,
  target_calories: 1800,
  total_protein: 101,
  total_carbs: 110,
  total_fat: 32,
};

export const mockFoods = [
  { name: '鸡胸肉 100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: '水煮蛋 1个', calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  { name: '全麦面包 1片', calories: 90, protein: 4, carbs: 15, fat: 1.5 },
  { name: '糙米饭 100g', calories: 120, protein: 2.5, carbs: 25, fat: 0.8 },
  { name: '西兰花 100g', calories: 30, protein: 3, carbs: 5, fat: 0.3 },
  { name: '三文鱼 100g', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: '牛肉 100g', calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: '豆腐 100g', calories: 76, protein: 8, carbs: 2, fat: 4 },
  { name: '酸奶 200ml', calories: 120, protein: 6, carbs: 16, fat: 3 },
  { name: '香蕉 1根', calories: 105, protein: 1, carbs: 27, fat: 0.4 },
  { name: '脱脂牛奶 250ml', calories: 80, protein: 8, carbs: 12, fat: 0 },
  { name: '苹果 1个', calories: 80, protein: 0, carbs: 20, fat: 0 },
];

const genDates = (n: number) => {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
};

export const mockTrends = {
  weight_data: genDates(7).map((date, i) => ({
    date,
    weight: 73.5 - i * 0.18 + (Math.random() - 0.5) * 0.3,
  })).map(d => ({ ...d, weight: Math.round(d.weight * 10) / 10 })),
  calorie_data: genDates(7).map(date => ({
    date,
    calories: Math.round(1400 + Math.random() * 600),
  })),
  workout_data: genDates(7).map(date => ({
    date,
    calories: Math.round(Math.random() > 0.3 ? 150 + Math.random() * 200 : 0),
    duration: Math.round(Math.random() > 0.3 ? 20 + Math.random() * 30 : 0),
  })),
  period_loss: 1.2,
  total_loss: 3.5,
  avg_calories: 1650,
  workout_days: 5,
  current_weight: 72.3,
  target_weight: 65,
};
