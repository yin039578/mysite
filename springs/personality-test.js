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
    name: "開創",
    key: "I",
    color: "#ff9800", // 橘色
    desc: "想法鮮活多變，勇於嘗試，強調創新與嘗試。優點：創意思考、勇於嘗試。缺點：天馬行空、不切實際。"
  },
  {
    name: "情感",
    key: "F",
    color: "#e57373", // 紅色
    desc: "人際互動特質強，樂於助人，強調團隊和諧。優點：關懷可親、樂於助人。缺點：感情用事、優柔寡斷。"
  },
  {
    name: "組織",
    key: "O",
    color: "#81c784", // 綠色
    desc: "事務管理特質強，強調按部就班，謹慎可靠。優點：組織條理、按部就班。缺點：較少彈性、不愛變通。"
  },
  {
    name: "理智",
    key: "R",
    color: "#64b5f6", // 藍色
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
      <div class="start-page" style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:400px;">
        <div class="title">個人風格心理測驗</div>
        <div class="desc">從按照每個題組前的指示，從您日常的工作、生活、學習….經驗，依序挑選出讓您覺得來勁忘我、如魚得水、心想事成、欲罷不能的工作要素。</div>
        <div class="actions">
          <button class="btn" onclick="startTest()">開始測驗</button>
        </div>
      </div>
    `;
  } else if (state.page === 'question') {
    const q = questions[state.qIndex];
    const selectNum = stepSelectNum[state.subStep];
    let prevSelected = [];
    if (state.subStep > 0) {
      prevSelected = state.selected[state.qIndex][state.subStep - 1] || [];
    }
    // 進度條
    const progress = Math.round(((state.qIndex * 3 + state.subStep + 1) / (questions.length * 3)) * 100);
    app.innerHTML = `
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${progress}%;"></div></div>
      <div class="title">第 ${state.qIndex + 1} 題</div>
      <div class="question">請先從以下<span style="color:#ff9800;font-weight:bold;">${selectNum}個</span>選項中，挑選出 4個 讓您覺得來勁忘我、如魚得水、心想事成、欲罷不能的工作要素。</div>
      <div class="options" style="width:100%;max-width:700px;margin:0 auto;">
        ${q.map((text, i) => {
          const selectedArr = state.selected[state.qIndex][state.subStep] || [];
          const checked = selectedArr.includes(i);
          let disabled = false;
          let faded = false;
          if (state.subStep > 0 && !prevSelected.includes(i)) {
            disabled = true;
            faded = true;
          } else if (!checked && selectedArr.length >= selectNum) {
            disabled = true;
          }
          return `
            <label class="option${checked ? ' selected' : ''}${disabled ? ' option-disabled' : ''}" style="${faded ? 'opacity:0.4;pointer-events:none;' : ''};margin-bottom:0.2rem;position:relative;" onclick="${disabled ? '' : `toggleOption(${i})`}">
              <input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="toggleOption(${i})" onclick="event.stopPropagation()" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;">
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
      <div class="result">
        <div class="title">個人風格檢核結果</div>
        <div class="score-list" style="display: flex; flex-wrap: wrap; gap: 1.2rem; margin: 1.2rem 0 0.5rem 0; width: 100%; justify-content: center;">
          <div class="score-item" style="color:${styleDesc[3].color}; flex: 1 1 40%; min-width: 180px; max-width: 260px; text-align: center;">${styleDesc[3].name}：<span style='color:${styleDesc[3].color}'>${R}</span></div>
          <div class="score-item" style="color:${styleDesc[0].color}; flex: 1 1 40%; min-width: 180px; max-width: 260px; text-align: center;">${styleDesc[0].name}：<span style='color:${styleDesc[0].color}'>${I}</span></div>
          <div class="score-item" style="color:${styleDesc[2].color}; flex: 1 1 40%; min-width: 180px; max-width: 260px; text-align: center;">${styleDesc[2].name}：<span style='color:${styleDesc[2].color}'>${O}</span></div>
          <div class="score-item" style="color:${styleDesc[1].color}; flex: 1 1 40%; min-width: 180px; max-width: 260px; text-align: center;">${styleDesc[1].name}：<span style='color:${styleDesc[1].color}'>${F}</span></div>
        </div>
        <div class="style-feature-block" style="max-width:480px;margin:2rem auto 1.2rem auto;padding:1.2rem 1.5rem;background:#f8fafc;border-radius:1.2rem;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          ${getFeatureDesc()}
        </div>
        <div class="actions" style="margin-top:1.5rem;">
          <button class="btn" onclick="restart()">重新測驗</button>
        </div>
      </div>
    `;
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
  // 只在每題三輪結束後計分
  if (state.subStep < 2) {
    state.subStep++;
    render();
  } else {
    // 三輪都選完，計分
    const points = [1, 2, 2];
    for (let s = 0; s < 3; s++) {
      const arr = state.selected[state.qIndex][s] || [];
      arr.forEach(idx => {
        const key = answerMap[state.qIndex][idx];
        state.score[key] += points[s];
      });
    }
    state.qIndex++;
    state.subStep = 0;
    if (state.qIndex === questions.length) {
      state.page = 'result';
    }
    render();
  }
}

function restart() {
  state = {
    page: 'start',
    qIndex: 0,
    subStep: 0,
    selected: [[], [], [], [], []],
    score: { R: 0, I: 0, O: 0, F: 0 }
  };
  render();
}

function getFeatureDesc() {
  // 依分數最高型別顯示特點描述
  const { R, I, O, F } = state.score;
  const styleList = [
    {
      key: 'R',
      name: '理智型風格',
      color: styleDesc[3].color,
      feature: {
        behavior: '邏輯分析特質強，重視證據、數據，追根究底。',
        advantage: '邏輯分析、就事論事。',
        disadvantage: '義正嚴辭、心直口快。'
      }
    },
    {
      key: 'I',
      name: '開創型風格',
      color: styleDesc[0].color,
      feature: {
        behavior: '想法鮮活多變，勇於嘗試，強調創新與嘗試。',
        advantage: '創意思考、勇於嘗試。',
        disadvantage: '天馬行空、不切實際。'
      }
    },
    {
      key: 'O',
      name: '組織型風格',
      color: styleDesc[2].color,
      feature: {
        behavior: '事務管理特質強，強調按部就班，謹慎可靠。',
        advantage: '組織條理、按部就班。',
        disadvantage: '較少彈性、不愛變通。'
      }
    },
    {
      key: 'F',
      name: '情感型風格',
      color: styleDesc[1].color,
      feature: {
        behavior: '人際互動特質強，樂於助人，強調團隊和諧。',
        advantage: '關懷可親、樂於助人。',
        disadvantage: '感情用事、優柔寡斷。'
      }
    }
  ];
  const maxType = ['R','I','O','F'].reduce((a,b) => state.score[a] >= state.score[b] ? a : b);
  const style = styleList.find(s => s.key === maxType);
  return `
    <div style="color:${style.color};">
      <div style="font-weight:bold;font-size:1.18rem;margin-bottom:0.7rem;">${style.name}</div>
      <div style="margin-bottom:0.4rem;"><span style="font-weight:bold;">行為展現：</span>${style.feature.behavior}</div>
      <div style="margin-bottom:0.4rem;"><span style="font-weight:bold;">優勢特質：</span>${style.feature.advantage}</div>
      <div><span style="font-weight:bold;">可能缺點：</span>${style.feature.disadvantage}</div>
    </div>
  `;
}

render();