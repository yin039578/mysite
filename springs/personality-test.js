// personality-test.js
// 新版心理測驗互動腳本，RWD、手機友善、雷達圖（Chart.js）

const questions = [
  ["獨當一面", "綜整研判", "變化多元", "創新獨特", "規劃組織", "井然有序", "同理情感", "接觸人群"],
  ["實事求是", "問題解析", "實驗嘗試", "規劃遠景", "掌控管理", "資料彙整", "支持輔導", "建立關係"],
  ["追根究底", "邏輯思考", "創新研發", "無拘無束", "建立規則", "行政處理", "傾聽他人", "團隊合作"],
  ["績效導向", "數據分析", "發揮想像", "推銷想法", "協調支援", "注重細節", "感性溫馨", "教育咨詢"],
  ["明快決策", "分析推理", "創意設計", "新奇刺激", "執行計畫", "按部就班", "關懷弱勢", "協助他人"]
];

const styleDesc = [
  {
    name: "開創型",
    key: "I",
    color: "#ff9800",
    desc: "想法鮮活多變，勇於嘗試，強調創新與嘗試。優點：創意思考、勇於嘗試。缺點：天馬行空、不切實際。"
  },
  {
    name: "情感型",
    key: "F",
    color: "#e57373",
    desc: "人際互動特質強，樂於助人，強調團隊和諧。優點：關懷可親、樂於助人。缺點：感情用事、優柔寡斷。"
  },
  {
    name: "組織型",
    key: "O",
    color: "#64b5f6",
    desc: "事務管理特質強，強調按部就班，謹慎可靠。優點：組織條理、按部就班。缺點：較少彈性、不愛變通。"
  },
  {
    name: "理智型",
    key: "R",
    color: "#81c784",
    desc: "邏輯分析特質強，重視證據、數據，追根究底。優點：邏輯分析、就事論事。缺點：義正嚴辭、心直口快。"
  }
];

const answerMap = [
  ["R", "R", "I", "I", "O", "O", "F", "F"],
  ["R", "R", "I", "I", "O", "O", "F", "F"],
  ["R", "R", "I", "I", "O", "O", "F", "F"],
  ["R", "R", "I", "I", "O", "O", "F", "F"],
  ["R", "R", "I", "I", "O", "O", "F", "F"]
];

const stepSelectNum = [4, 2, 1];

let state = {
  page: 'start', // start | question | result
  qIndex: 0, // 0~4
  subStep: 0, // 0~2
  selected: [[], [], [], [], []],
  score: { R: 0, I: 0, O: 0, F: 0 }
};

function render() {
  const app = document.getElementById('app');
  if (state.page === 'start') {
    app.innerHTML = `
      <div class="title">個人風格心理測驗</div>
      <div class="desc">只需 5 分鐘，了解你的行事風格與優缺點！</div>
      <div class="actions">
        <button class="btn" onclick="startTest()">開始測驗</button>
      </div>
    `;
  } else if (state.page === 'question') {
    const q = questions[state.qIndex];
    const selectNum = stepSelectNum[state.subStep];
    // 取得前一輪已選的index
    let prevSelected = [];
    if (state.subStep > 0) {
      prevSelected = state.selected[state.qIndex][state.subStep - 1] || [];
    }
    app.innerHTML = `
      <div class="title">第 ${state.qIndex + 1} 題</div>
      <div class="question">請選出 <span style="color:#ff9800;font-weight:bold;">${selectNum}</span> 個與你較符合的項目</div>
      <div class="options">
        ${q.map((text, i) => {
          const selectedArr = state.selected[state.qIndex][state.subStep] || [];
          const checked = selectedArr.includes(i);
          // 只有第一輪可全選，第二、三輪只能從上一輪已選的選
          let disabled = '';
          if (state.subStep > 0 && !prevSelected.includes(i)) {
            disabled = 'disabled';
          } else if (!checked && selectedArr.length >= selectNum) {
            disabled = 'disabled';
          }
          return `
            <label class="option${checked ? ' selected' : ''}${disabled ? ' option-disabled' : ''}" onclick="${disabled ? '' : `toggleOption(${i})`}">
              <input type="checkbox" ${checked ? 'checked' : ''} ${disabled} onchange="toggleOption(${i})" onclick="event.stopPropagation()">
              ${text}
            </label>
          `;
        }).join('')}
      </div>
      <div class="actions">
        <button class="btn" onclick="nextStep()">下一步</button>
      </div>
      <div class="desc" style="font-size:0.98rem;color:#888;">（每一題會分三輪，依序選4、2、1個項目）</div>
    `;
  } else if (state.page === 'result') {
    const { R, I, O, F } = state.score;
    app.innerHTML = `
      <div class="title">測驗結果</div>
      <div class="score-list" style="display: flex; flex-wrap: wrap; gap: 1.2rem; margin: 1.2rem 0 0.5rem 0; width: 100%; justify-content: space-between;">
        <div class="score-item" style="color:${styleDesc[3].color}; flex: 1 1 25%; min-width: 0; text-align: center;">理智型：${R}</div>
        <div class="score-item" style="color:${styleDesc[0].color}; flex: 1 1 25%; min-width: 0; text-align: center;">開創型：${I}</div>
        <div class="score-item" style="color:${styleDesc[2].color}; flex: 1 1 25%; min-width: 0; text-align: center;">組織型：${O}</div>
        <div class="score-item" style="color:${styleDesc[1].color}; flex: 1 1 25%; min-width: 0; text-align: center;">情感型：${F}</div>
      </div>
      <canvas id="radarChart" width="320" height="320" style="margin:1.2rem auto 0 auto;display:block;"></canvas>
      <div class="style-desc">${getStyleDesc()}</div>
      <div class="actions">
        <button class="btn" onclick="restart()">重新測驗</button>
      </div>
    `;
    setTimeout(drawRadar, 0);
  }
}

function startTest() {
  state = {
    page: 'question',
    qIndex: 0,
    subStep: 0,
    selected: [[], [], [], [], []],
    score: { R: 0, I: 0, O: 0, F: 0 }
  };
  render();
}

function toggleOption(idx) {
  const arr = state.selected[state.qIndex][state.subStep] || [];
  const selectNum = stepSelectNum[state.subStep];
  // 只允許從上一輪已選的選
  if (state.subStep > 0) {
    const prevArr = state.selected[state.qIndex][state.subStep - 1] || [];
    if (!prevArr.includes(idx)) return;
  }
  if (arr.includes(idx)) {
    state.selected[state.qIndex][state.subStep] = arr.filter(i => i !== idx);
  } else {
    if (arr.length < selectNum) {
      state.selected[state.qIndex][state.subStep] = [...arr, idx];
    } else {
      return;
    }
  }
  render();
}

function nextStep() {
  const selectNum = stepSelectNum[state.subStep];
  const selectedItems = state.selected[state.qIndex][state.subStep] || [];
  if (selectedItems.length !== selectNum) {
    alert(`請選擇 ${selectNum} 個項目`);
    return;
  }
  // 計分
  selectedItems.forEach(idx => {
    const key = answerMap[state.qIndex][idx];
    state.score[key]++;
  });
  if (state.subStep < 2) {
    state.subStep++;
  } else {
    state.qIndex++;
    state.subStep = 0;
  }
  if (state.qIndex === questions.length) {
    state.page = 'result';
  }
  render();
}

function getStyleDesc() {
  const { R, I, O, F } = state.score;
  const total = R + I + O + F;
  const percent = (num) => {
    return total === 0 ? 0 : Math.round((num / total) * 100);
  };
  const styleList = [
    { ...styleDesc[3], value: R },
    { ...styleDesc[0], value: I },
    { ...styleDesc[2], value: O },
    { ...styleDesc[1], value: F }
  ];
  return `
    <div style="margin:1.2rem 0 0.5rem 0;display:flex;flex-direction:column;gap:0.7rem;">
      ${styleList.map(s => `
        <div style="display:flex;align-items:center;gap:0.7rem;">
          <span style="min-width:60px;font-weight:bold;font-size:1.08rem;color:${s.color}">${s.name}</span>
          <div style="flex:1;background:#f0f0f0;border-radius:0.6rem;height:1.1rem;overflow:hidden;margin:0 0.3rem;">
            <div style="height:100%;border-radius:0.6rem;transition:width 0.5s;width:${percent(s.value)}%;background:${s.color};"></div>
          </div>
          <span style="min-width:38px;text-align:right;font-size:1.05rem;font-weight:bold;color:#333;">${percent(s.value)}%</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:1.2rem;font-size:1rem;color:#444;text-align:left;">
      ${styleList.filter(s => s.value === Math.max(R, I, O, F)).map(s => `<b style=\"color:${s.color}\">${s.name}</b>：${s.desc}`).join('<br>')}
    </div>
  `;
}

function drawRadar() {
  const ctx = document.getElementById('radarChart').getContext('2d');
  const { R, I, O, F } = state.score;
  // 避免全為 0，否則 Chart.js 會出錯
  const allZero = (R === 0 && I === 0 && O === 0 && F === 0);
  const dataArr = allZero ? [1, 1, 1, 1] : [R, I, O, F];
  // 最大值自動調整，最小 4，最大 24
  const maxScore = Math.max(4, Math.max(R, I, O, F), 24);
  if (window.radarChartObj) window.radarChartObj.destroy && window.radarChartObj.destroy();
  window.radarChartObj = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['理智型', '開創型', '組織型', '情感型'],
      datasets: [{
        label: '個人風格',
        data: dataArr,
        backgroundColor: 'rgba(255,152,0,0.15)',
        borderColor: '#ff9800',
        pointBackgroundColor: ['#81c784','#ff9800','#64b5f6','#e57373'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          min: 0,
          max: maxScore,
          ticks: { stepSize: 4, color: '#888', font: { size: 12 } },
          pointLabels: { color: '#333', font: { size: 14 } }
        }
      }
    }
  });
}

// 移除 JS 檔案中的 CSS 樣式區塊，只保留 JS 程式碼

render();
