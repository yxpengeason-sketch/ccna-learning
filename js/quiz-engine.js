/* ================= 核心輔助演算法 ================= */

/**
 * 標準 Fisher-Yates (Knuth) 無偏隨機洗牌演算法
 * @template T
 * @param {T[]} array 原始陣列
 * @returns {T[]} 洗牌後的全新陣列副本
 */
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 判斷是否為複選題
function isMultiSelect(item) {
  return Array.isArray(item.a);
}

// 取得題目選項字母 (0 -> A, 1 -> B ...)
function getOptionLetter(idx) {
  return String.fromCharCode(65 + idx);
}

// 格式化選項標籤與文字（支援單選與多選索引）
function formatOptionsText(item, target) {
  if (Array.isArray(target)) {
    return target
      .sort((a, b) => a - b)
      .map(idx => `[${getOptionLetter(idx)}] ${item.o[idx]}`)
      .join('；');
  }
  return `[${getOptionLetter(target)}] ${item.o[target]}`;
}

// 題目唯一識別 Key 生成函式（綁定題幹原始特徵，不受亂序影響）
function getQuestionKey(item) {
  return `Q_${item.m}_${item.q.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').slice(0, 32)}`;
}



/* ==========================================================================
   CCNA 200-301 錯題專項重考渲染引擎與即時銷題機制 (Wrongbook Quiz Engine)
   - 支援 renderQuiz('wrongbook') 模式：僅自未克服錯題庫中動態出題
   - 雙層無偏隨機洗牌：題目順序與選項位置重新映射，防範死記位置
   - 答對即時消除 (Instant Remediation)：即時標記 resolved 並動態更新按鈕徽章
   - 漸進式銷題：重考不刪除歷史資料，答對即時標記攻克 (resolved: true)
   - 錯題本防窺遮蔽：進入錯題重考時自動隱藏 #wrongbook-panel，杜絕看答案
   - 雙層 Fisher-Yates 隨機洗牌：題目與選項指標重新映射，防止位置記憶
   - 零錯題空狀態 (Zero-State) 與專項通關結算面板
   ========================================================================== */

/* ==========================================================================
   CCNA 200-301 錯題專項沉浸鎖定與安全退出控制器 (Quiz Lockdown Controller)
   - 進入錯題重考時自動鎖定其他分類按鈕，模擬考場鎖定環境
   - 攔截非錯題按鈕點擊，提供二階段放棄確認彈窗
   - 測驗結算 (showFinal) 或確認放棄時自動釋放鎖定狀態
   ========================================================================== */

/* ==========================================================================
   CCNA 200-301 全域測驗模式切換器與結算動作排程器 (Unified Mode Switcher)
   - 封裝 switchToQuizMode(targetMode)，徹底消除行內引號轉義導致的點擊死鎖
   - 自動調度解鎖 (setQuizFilterLockdown)、篩選列高亮、題庫渲染與視圖平滑滾動
   - 重構 showFinal 結算按鈕與空狀態卡片，提供 100% 穩健的單向資料流
   ========================================================================== */

/* ==========================================================================
   CCNA 200-301 分類導航解鎖與直接事件綁定修復引擎
   - 移除脆弱的冒泡阻斷，採用直接事件綁定 (Direct Event Binding)
   - 確保 DOM 初始化與每次解鎖時立即同步事件監聽
   ========================================================================== */


/**
 * 全域測驗模式切換控制器 (Unified Mode Switcher)
 * @param {string|number} targetMode 目標模式：'all' | 'wrongbook' | 0~5
 */
function switchToQuizMode(targetMode) {
  // 僅在「真正離開錯題專項」時才解鎖
  if (targetMode !== 'wrongbook') {
    setQuizFilterLockdown(false);
  }

  // 2. 更新頂部按鈕高亮樣式 (.active)
  const filterBar = document.querySelector('#quiz .quiz-filter');
  if (filterBar) {
    filterBar.querySelectorAll('button').forEach(btn => {
      const btnMode = btn.dataset.m === 'all' 
        ? 'all' 
        : (btn.dataset.m === 'wrongbook' ? 'wrongbook' : parseInt(btn.dataset.m, 10));
      
      if (btnMode === targetMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 3. 調用核心測驗渲染
  renderQuiz(targetMode);

  // 4. 視圖平滑滾動至測驗計分面板
  const scoreBar = document.getElementById('score-bar');
  if (scoreBar) {
    scoreBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/**
 * 直接綁定分類篩選列按鈕事件 (Direct Event Binder)
 * 逐一為每顆按鈕指派原生 onclick，杜絕事件委派被 disabled 阻斷
 */
function bindQuizFilterEvents() {
  const filterBar = document.querySelector('#quiz .quiz-filter');
  if (!filterBar) return;

  filterBar.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      if (b.disabled || b.classList.contains('filter-locked')) return;

      const targetM = b.dataset.m === 'all' 
        ? 'all' 
        : (b.dataset.m === 'wrongbook' ? 'wrongbook' : parseInt(b.dataset.m, 10));
      const totalQuestions = parseInt(totalEl.textContent, 10) || 0;

      // 若目前在錯題重考進行中，彈出二階段放棄確認
      if (activeQuizFilter === 'wrongbook' && targetM !== 'wrongbook' && answered < totalQuestions && totalQuestions > 0) {
        const confirmExit = confirm(
          '⚠️ 目前正在進行錯題專項重考，確定要中途放棄並切換單元嗎？\n\n' +
          '• 點擊「確定」：放棄本次重測並切換至所選單元（未作答完畢的錯題仍會保留於錯題本中）\n' +
          '• 點擊「取消」：繼續完成本次錯題衝刺'
        );

        if (!confirmExit) {
          return;
        }
      }

      switchToQuizMode(targetM);
    };
  });
}



/**
 * 動態更新錯題專項重考按鈕之狀態與計數徽章
 */
function updateWrongQuizButtonState() {
  const unresolvedList = (typeof getUnresolvedWrongQuizList === 'function') 
    ? getUnresolvedWrongQuizList() 
    : [];
  const count = unresolvedList.length;

  // 1. 維護上方分類篩選列的錯題專項按鈕
  let filterBtn = document.querySelector('#quiz .quiz-filter button[data-m="wrongbook"]');
  const filterBar = document.querySelector('#quiz .quiz-filter');

  if (!filterBtn && filterBar) {
    filterBtn = document.createElement('button');
    filterBtn.dataset.m = 'wrongbook';
    filterBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    filterBtn.style.color = '#fca5a5';
    filterBar.appendChild(filterBtn);
    bindQuizFilterEvents(); // 動態插入後重新綁定事件
  }

  if (filterBtn) {
    filterBtn.innerHTML = `📕 錯題專項重考 (${count})`;
    filterBtn.disabled = (count === 0);
    filterBtn.style.opacity = count === 0 ? '0.45' : '1';
    filterBtn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
    filterBtn.style.background = count > 0 ? 'rgba(239, 68, 68, 0.12)' : '';
  }

  // 2. 維護錯題本面板標題列的專屬重考按鈕
  let wbQuizBtn = document.getElementById('btn-wb-requiz');
  const wbHeader = document.querySelector('#wrongbook-panel h3');
  if (!wbQuizBtn && wbHeader) {
    wbQuizBtn = document.createElement('button');
    wbQuizBtn.id = 'btn-wb-requiz';
    wbQuizBtn.className = 'btn';
    wbQuizBtn.style.cssText = 'padding: 5px 14px; font-size: 0.8rem; font-weight: 700; margin-left: auto; margin-right: 8px; background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;';
    wbQuizBtn.onclick = startWrongbookQuiz;
    
    const clearBtn = wbHeader.querySelector('.btn-wb-clear');
    if (clearBtn) {
      wbHeader.insertBefore(wbQuizBtn, clearBtn);
    } else {
      wbHeader.appendChild(wbQuizBtn);
    }
  }

  if (wbQuizBtn) {
    wbQuizBtn.innerHTML = `🎯 錯題專項重考 (${count} 題)`;
    wbQuizBtn.disabled = (count === 0);
    wbQuizBtn.style.opacity = count === 0 ? '0.45' : '1';
    wbQuizBtn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
  }
}



/* ==========================================================================
   CCNA 200-301 測驗分類事件委派與全域解鎖控制器 (Lockdown Controller v4.2)
   - 強制在所有非錯題模式（'all' 或 0~5 模組）下無條件解鎖分類按鈕
   - 杜絕初始化或返回全真題庫時按鈕殘留 disabled 狀態
   ========================================================================== */

/**
 * 控制測驗分類篩選列之鎖定狀態 (Comprehensive Filter Lockdown Controller)
 * @param {boolean} locked 是否進入鎖定狀態
 */
function setQuizFilterLockdown(locked) {
  const filterBar = document.querySelector('#quiz .quiz-filter');
  if (!filterBar) return;

  const buttons = filterBar.querySelectorAll('button');
  buttons.forEach(btn => {
    const isWrongbookBtn = (btn.dataset.m === 'wrongbook');

    if (locked) {
      if (!isWrongbookBtn) {
        btn.disabled = true;
        btn.classList.add('filter-locked');
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.35';
        btn.style.cursor = 'not-allowed';
      }
    } else {
      // 強制重設所有原生屬性，100% 恢復可點擊狀態
      btn.disabled = false;
      btn.classList.remove('filter-locked');
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '';
      btn.style.cursor = 'pointer';
    }
  });

  if (!locked && typeof updateWrongQuizButtonState === 'function') {
    updateWrongQuizButtonState();
  }
}


/**
 * 測驗動態渲染主流程（於入口處強制執行防呆解鎖）
 * @param {string|number} mod 模組索引 (0-5) | 'all' (全部題庫) | 'wrongbook' (錯題專項)
 */
function renderQuiz(mod) {
  activeQuizFilter = mod;
  qa.innerHTML = '';
  answered = 0;
  correct = 0;

  const isWrongbookMode = (mod === 'wrongbook');
  const wbPanel = document.getElementById('wrongbook-panel');

  // 1. 錯題防窺遮蔽控制
  if (wbPanel) {
    wbPanel.style.display = isWrongbookMode ? 'none' : '';
  }

  // 2. 任何非錯題模式（'all' 或 0~5 模組）進入時，強制 100% 絕對解鎖
  if (!isWrongbookMode) {
    setQuizFilterLockdown(false);
  }

  // 3. 依模式篩選目標題庫
  let rawList = [];
  if (isWrongbookMode) {
    rawList = (typeof getUnresolvedWrongQuizList === 'function') 
      ? getUnresolvedWrongQuizList() 
      : [];
  } else if (mod === 'all') {
    rawList = quiz;
  } else {
    rawList = quiz.filter(q => q.m === mod);
  }

  // 4. 錯題專項模式空狀態防呆 (Zero-State UI)
  if (isWrongbookMode && rawList.length === 0) {
    setQuizFilterLockdown(false);
    totalEl.textContent = '0';
    document.querySelectorAll('.q-total').forEach(el => el.textContent = '0');
    ansEl.textContent = '0';
    corEl.textContent = '0';
    document.getElementById('p-ans').textContent = '0';
    document.getElementById('p-cor').textContent = '0';
    document.getElementById('p-rate').textContent = '100%';
    document.getElementById('quiz-progress-fill').style.width = '100%';

    qa.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: var(--bg-surface); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 12px; margin: 20px 0; box-shadow: var(--shadow-sm);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
        <h3 style="color: #4ade80; font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">太棒了！目前沒有待克服的錯題！</h3>
        <p style="color: var(--text-muted); font-size: 0.92rem; max-width: 500px; margin: 0 auto 20px; line-height: 1.6;">
          你的錯題本目前無未攻克項目。核心觀念已掌握，請繼續挑戰全真模擬測驗維持考前作答手感。
        </p>
        <button onclick="switchToQuizMode('all')" class="btn" style="padding: 9px 24px; border-radius: 20px;">
          📚 返回全真題庫測驗
        </button>
      </div>
    `;
    updateWeakAnalysis([]);
    return;
  }

  // 5. 若為錯題專項且有題目，才啟動鎖定
  if (isWrongbookMode && rawList.length > 0) {
    setQuizFilterLockdown(true);
  }

  // 6. 第一層洗牌：題目順序隨機化
  const randomizedQuestions = shuffleArray(rawList);

  totalEl.textContent = randomizedQuestions.length;
  document.querySelectorAll('.q-total').forEach(el => el.textContent = randomizedQuestions.length);
  ansEl.textContent = '0';
  corEl.textContent = '0';
  document.getElementById('p-ans').textContent = '0';
  document.getElementById('p-cor').textContent = '0';
  document.getElementById('p-rate').textContent = '0%';
  document.getElementById('quiz-progress-fill').style.width = '0%';

  if (finalScoreEl) {
    finalScoreEl.style.display = 'none';
    finalScoreEl.innerHTML = '';
  }

  // 7. 第二層洗牌：選項順序隨機化與動態指標重映射
  const runtimeList = randomizedQuestions.map((rawItem, i) => {
    const isMulti = isMultiSelect(rawItem);
    const numOptions = rawItem.o.length;

    const optIndices = Array.from({ length: numOptions }, (_, idx) => idx);
    const shuffledIndices = shuffleArray(optIndices);
    const shuffledOptions = shuffledIndices.map(idx => rawItem.o[idx]);

    let remappedAnswer;
    if (isMulti) {
      remappedAnswer = rawItem.a
        .map(origIdx => shuffledIndices.indexOf(origIdx))
        .sort((a, b) => a - b);
    } else {
      remappedAnswer = shuffledIndices.indexOf(rawItem.a);
    }

    const runtimeItem = {
      raw: rawItem,
      m: rawItem.m,
      q: rawItem.q,
      e: rawItem.e,
      o: shuffledOptions,
      a: remappedAnswer,
      isMulti: isMulti,
      requiredCount: isMulti ? remappedAnswer.length : 1
    };

    const card = document.createElement('div');
    card.className = 'quiz-q';
    card.id = `quiz-q-${i}`;

    card.innerHTML = `
      <p>
        <b>Q${i + 1}.</b> ${runtimeItem.q}
        <span class="tag">${QM[runtimeItem.m]}</span>
        ${isWrongbookMode ? '<span class="tag" style="background:rgba(239,68,68,0.15); color:#f87171; border-color:rgba(239,68,68,0.35);">📕 錯題專項重考 (鎖定中)</span>' : ''}
        <span class="tag" style="background:${isMulti ? 'rgba(56,189,248,0.15)' : 'rgba(245,158,11,0.12)'}; color:${isMulti ? '#38bdf8' : '#f59e0b'}; border-color:${isMulti ? 'rgba(56,189,248,0.4)' : 'rgba(245,158,11,0.3)'}">
          ${isMulti ? `複選題 (選 ${runtimeItem.requiredCount} 項)` : '單選題'}
        </span>
      </p>
    `;

    const optContainer = document.createElement('div');
    optContainer.className = 'opt-container';
    const selectedIndices = new Set();

    runtimeItem.o.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.innerHTML = `<b>${getOptionLetter(optIdx)}.</b> ${optText}`;

      btn.onclick = () => {
        if (card.dataset.done) return;

        if (!isMulti) {
          processSubmission(card, runtimeItem, optIdx, [optIdx], runtimeList);
        } else {
          if (selectedIndices.has(optIdx)) {
            selectedIndices.delete(optIdx);
            btn.classList.remove('selected');
            btn.style.borderColor = '';
            btn.style.background = '';
          } else {
            if (selectedIndices.size < runtimeItem.requiredCount) {
              selectedIndices.add(optIdx);
              btn.classList.add('selected');
              btn.style.borderColor = 'var(--accent-cyan)';
              btn.style.background = 'rgba(14, 165, 233, 0.15)';
            }
          }
          const submitBtn = card.querySelector('.btn-submit-multi');
          if (submitBtn) {
            submitBtn.disabled = (selectedIndices.size !== runtimeItem.requiredCount);
            submitBtn.textContent = selectedIndices.size === runtimeItem.requiredCount
              ? `✔ 確認送出 (${selectedIndices.size}/${runtimeItem.requiredCount})`
              : `請選擇 ${runtimeItem.requiredCount} 項 (已選 ${selectedIndices.size})`;
          }
        }
      };
      optContainer.appendChild(btn);
    });

    card.appendChild(optContainer);

    if (isMulti) {
      const submitBox = document.createElement('div');
      submitBox.style.marginTop = '12px';
      submitBox.style.display = 'flex';
      submitBox.style.alignItems = 'center';
      submitBox.style.gap = '10px';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-submit-multi';
      submitBtn.disabled = true;
      submitBtn.textContent = `請選擇 ${runtimeItem.requiredCount} 項 (已選 0)`;
      submitBtn.style.padding = '8px 20px';

      submitBtn.onclick = () => {
        if (card.dataset.done || selectedIndices.size !== runtimeItem.requiredCount) return;
        const picks = Array.from(selectedIndices).sort((a, b) => a - b);
        processSubmission(card, runtimeItem, picks, picks, runtimeList);
      };

      submitBox.appendChild(submitBtn);
      card.appendChild(submitBox);
    }

    qa.appendChild(card);
    return runtimeItem;
  });

  updateWeakAnalysis(runtimeList);
}

/**
 * 統一交卷判分與即時漸進銷題處理
 */
function processSubmission(card, runtimeItem, userPick, userPicksArray, currentList) {
  card.dataset.done = '1';
  answered++;

  const isMulti = runtimeItem.isMulti;
  let isCorrect = false;

  const correctPicks = isMulti ? [...runtimeItem.a].sort((a, b) => a - b) : [runtimeItem.a];
  const userSorted = [...userPicksArray].sort((a, b) => a - b);

  if (isMulti) {
    isCorrect = (correctPicks.length === userSorted.length) &&
                correctPicks.every((val, idx) => val === userSorted[idx]);
  } else {
    isCorrect = (userPick === runtimeItem.a);
  }

  // 鎖定選項
  const optButtons = card.querySelectorAll('.opt');
  optButtons.forEach((b, idx) => {
    b.disabled = true;
    b.style.pointerEvents = 'none';

    const isAnswer = isMulti ? runtimeItem.a.includes(idx) : (idx === runtimeItem.a);
    const isPicked = userPicksArray.includes(idx);

    if (isAnswer) b.classList.add('correct');
    if (isPicked && !isAnswer) b.classList.add('wrong');
  });

  const submitBtn = card.querySelector('.btn-submit-multi');
  if (submitBtn) submitBtn.style.display = 'none';

  if (isCorrect) {
    correct++;
    resolveWrong(runtimeItem.raw);
  } else {
    recordWrong(runtimeItem, userPick);
  }

  if (typeof updateWrongQuizButtonState === 'function') {
    updateWrongQuizButtonState();
  }

  // 渲染詳解面板
  const ex = document.createElement('div');
  ex.className = 'explain';
  const correctText = formatOptionsText(runtimeItem, runtimeItem.a);
  ex.innerHTML = `
    ${isCorrect 
      ? '<span style="color:#4ade80;font-weight:700">✅ 答對了！' + (activeQuizFilter === 'wrongbook' ? '（已成功銷題）' : '') + '</span>' 
      : `<span style="color:#f87171;font-weight:700">❌ 答錯了！正確答案為：${correctText}</span>`
    }
    <div style="margin-top:6px;line-height:1.65">${runtimeItem.e}</div>
  `;
  card.appendChild(ex);

  // 更新計分條
  ansEl.textContent = answered;
  corEl.textContent = correct;
  document.getElementById('p-ans').textContent = answered;
  document.getElementById('p-cor').textContent = correct;
  const rate = Math.round((correct / answered) * 100) || 0;
  document.getElementById('p-rate').textContent = `${rate}%`;

  document.getElementById('quiz-progress-fill').style.width = `${(answered / currentList.length) * 100}%`;

  updateWeakAnalysis(currentList);
  if (answered === currentList.length) {
    showFinal(currentList);
  }
}


/**
 * 測驗結算面板（全面採用 switchToQuizMode 驅動）
 */
function showFinal(list) {
  if (!finalScoreEl) return;
  finalScoreEl.style.display = 'block';

  const isWrongbook = (activeQuizFilter === 'wrongbook');
  const pct = Math.round((correct / list.length) * 100);
  const remainingUnresolved = (typeof getUnresolvedWrongQuizList === 'function') 
    ? getUnresolvedWrongQuizList().length 
    : 0;
  const isPass = pct >= 82;

  let titleHtml = '';
  let descHtml = '';
  let buttonHtml = '';

  if (isWrongbook) {
    // ── 模式 A：錯題專項重考結算 ──
    const isAllCleaned = (pct === 100);

    titleHtml = `
      <h2 style="color:${isAllCleaned ? '#22c55e' : '#f59e0b'}; justify-content:center;">
        🎯 錯題專項結算：成功攻克 ${correct} / ${list.length} 題（克服率 ${pct}%）
      </h2>
    `;
    descHtml = `
      <p style="font-size:.95rem;margin:10px 0;color:#e2e8f0">
        ${isAllCleaned
          ? '🏆 <b>太強了！本次錯題已全數攻克並銷題！</b> 核心概念盲點已順利掃除。'
          : `⚠️ 本次重測攻克了 <b>${correct}</b> 題，尚有 <b>${list.length - correct}</b> 題待持續補強（目前錯題本總計剩餘 ${remainingUnresolved} 題未克服）。`}
      </p>
    `;

    buttonHtml = `
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:16px;">
        ${!isAllCleaned && remainingUnresolved > 0 ? `
          <!-- 1. 主行動 (Primary)：高亮橘漸層，引導立刻消滅剩餘錯題 -->
          <button onclick="switchToQuizMode('wrongbook')" class="btn" style="padding:10px 24px; border-radius:20px; font-weight:700; background:linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); box-shadow:0 4px 14px rgba(234,88,12,0.35); border:none;">
            🔄 繼續重測剩餘錯題 (${remainingUnresolved} 題)
          </button>
          
          <!-- 2. 次行動 (Secondary)：沉穩深藍邊框，引導檢視詳解與盲點 -->
          <button onclick="showWrongBookFromFinal()" class="btn" style="padding:10px 20px; border-radius:20px; font-weight:600; background:rgba(30,41,59,0.8); border:1px solid rgba(56,189,248,0.4); color:#38bdf8;">
            📕 查看錯題本狀態
          </button>

          <!-- 3. 第三行動 (Tertiary / Ghost)：直接呼叫控制器切換，杜絕字串轉義與死鎖 -->
          <button onclick="switchToQuizMode('all')" class="btn" style="padding:10px 20px; border-radius:20px; font-weight:500; background:#1e293b; color:#94a3b8; border:1px solid #334155;">
            📚 仍要返回全題庫 🔙
          </button>
        ` : `
          <!-- 全數攻克時：主行動升級為綠色返回全真題庫 -->
          <button onclick="switchToQuizMode('all')" class="btn" style="padding:10px 28px; border-radius:20px; font-weight:700; background:linear-gradient(135deg, #10b981 0%, #0ea5e9 100%); box-shadow:0 4px 14px rgba(16,185,129,0.35); border:none;">
            📚 返回全題庫測驗 👏
          </button>
          <button onclick="showWrongBookFromFinal()" class="btn" style="padding:10px 20px; border-radius:20px; font-weight:600; background:rgba(30,41,59,0.8); border:1px solid rgba(56,189,248,0.4); color:#38bdf8;">
            📕 檢視攻克紀錄
          </button>
        `}
      </div>
    `;
  } else {
    // ── 模式 B：常規模組/全真模擬結算 ──
    titleHtml = `
      <h2 style="color:${isPass ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444'}; justify-content:center;">
        🎯 測驗結算：${correct} / ${list.length}（得分率 ${pct}%）
      </h2>
    `;
    descHtml = `
      <p style="font-size:.95rem;margin:10px 0;color:#e2e8f0">
        ${isPass
          ? '🏆 <b>恭喜達到通過標準（≥82%）！</b> 核心概念扎實，請保持每日刷題手感。'
          : pct >= 65
          ? '⚠️ <b>接近及格門檻（65%~81%）！</b> 請針對下方「弱點診斷」標紅項目進行重點複習。'
          : '❌ <b>未達及格標準（<65%）！</b> 建議回到 30 天配速表重跑觀念與進到 Packet Tracer 實作。'}
      </p>
      ${remainingUnresolved > 0 ? `<p style="font-size:.85rem;color:#94a3b8">目前錯題本累積 ${remainingUnresolved} 題未克服，建議優先進行靶向重練。</p>` : ''}
    `;
    buttonHtml = `
      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-top:16px;">
        <button onclick="resetQuiz()" class="btn" style="padding:10px 24px; border-radius:20px; font-weight:700; background:linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border:none;">
          🔄 重新測驗本單元（重新洗牌）
        </button>
        ${remainingUnresolved > 0 ? `
          <button onclick="switchToQuizMode('wrongbook')" class="btn" style="padding:10px 22px; border-radius:20px; font-weight:700; background:rgba(239,68,68,0.18); color:#fca5a5; border:1px solid rgba(239,68,68,0.4);">
            📕 立即重練錯題 (${remainingUnresolved} 題)
          </button>
        ` : ''}
      </div>
    `;
  }

  finalScoreEl.innerHTML = `
    ${titleHtml}
    <div style="background:#0f172a;border-radius:8px;height:14px;overflow:hidden;margin:12px auto;max-width:500px">
      <div style="height:100%;width:${pct}%;background:${isPass || (isWrongbook && pct === 100) ? '#22c55e' : pct >= 65 ? '#f59e0b' : '#ef4444'};transition:width .6s ease-out"></div>
    </div>
    ${descHtml}
    ${buttonHtml}
  `;
  finalScoreEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 結算後手動恢復並滾動至錯題本面板
 */
function showWrongBookFromFinal() {
  const wbPanel = document.getElementById('wrongbook-panel');
  if (wbPanel) {
    wbPanel.style.display = '';
    renderWB();
    wbPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function resetQuiz() {
  renderQuiz(activeQuizFilter);
}





/*=分隔線=*/
/* ================= 錯題本管理 (LocalStorage) ================= */

function loadWB() {
  try {
    return JSON.parse(localStorage.getItem('ccna-wrongbook') || '{}');
  } catch (e) {
    localStorage.removeItem('ccna-wrongbook');
    return {};
  }
}

function saveWB(wb) {
  try {
    localStorage.setItem('ccna-wrongbook', JSON.stringify(wb));
  } catch (e) {
    console.warn('LocalStorage 儲存受限', e);
  }
}


/* ==========================================================================
   CCNA 200-301 錯題本專項資料關聯與路由橋接器 (Wrongbook Data Bridge)
   - 透過 getQuestionKey 將持久化錯題精準映射回原生題庫物件 (含完整 o 與 a)
   - 動態掛載與更新「📕 錯題專項重考」按鈕與計數徽章
   - 提供無未克服錯題時的防呆狀態鎖定
   ========================================================================== */

/**
 * 檢索未克服錯題之完整題庫實體陣列 (Unresolved Wrongbook Quiz Resolver)
 * @returns {Array<Object>} 包含完整 q, o, a, e, m 屬性之原生題目陣列
 */
function getUnresolvedWrongQuizList() {
  const wb = loadWB();
  // 萃取所有 resolved === false 的題幹 Key 集合
  const unresolvedKeys = new Set(
    Object.entries(wb)
      .filter(([, data]) => !data.resolved)
      .map(([key]) => key)
  );

  if (!unresolvedKeys.size) return [];

  // 從全域題庫中過濾出匹配的完整題目實體
  return quiz.filter(item => unresolvedKeys.has(getQuestionKey(item)));
}


/**
 * 觸發錯題專項重考模式 (Start Wrongbook Quiz Action)
 */
function startWrongbookQuiz() {
  const unresolvedList = getUnresolvedWrongQuizList();
  if (!unresolvedList.length) {
    alert('目前沒有未克服的錯題記錄！💪 保持下去！');
    return;
  }

  // 自動將上方篩選列切換至「錯題專項」
  const filterBtn = document.querySelector('#quiz .quiz-filter button[data-m="wrongbook"]');
  if (filterBtn) {
    document.querySelectorAll('#quiz .quiz-filter button').forEach(x => x.classList.remove('active'));
    filterBtn.classList.add('active');
  }

  renderQuiz('wrongbook');

  // 畫面平滑滾動至測驗作答區頂端
  const scoreBar = document.getElementById('score-bar');
  if (scoreBar) {
    scoreBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}





/**
 * 錯題本清空控制器 (Clear Wrongbook Controller)
 * 包含二階段確認、本地資料庫重設、UI 列表清空、按鈕狀態禁用與視圖感知更新
 */
function clearWrongBook() {
  const unresolvedList = getUnresolvedWrongQuizList();
  const totalCount = Object.keys(loadWB()).length;

  if (totalCount === 0) {
    alert('目前錯題本本來就是空的，無需清空！💪');
    return;
  }

  if (confirm(`確定要清空所有錯題記錄嗎？\n（包含 ${unresolvedList.length} 題未克服錯題與所有歷史統計）`)) {
    // 1. 重設 LocalStorage 為空物件
    saveWB({});

    // 2. 重新渲染錯題本列表
    renderWB();

    // 3. 強制即時更新所有重考按鈕之計數與禁用狀態
    updateWrongQuizButtonState();

    // 4. 視圖感知：若當前作答區剛好停留在「錯題專項」模式，立即刷新為空狀態卡片
    if (typeof activeQuizFilter !== 'undefined' && activeQuizFilter === 'wrongbook') {
      renderQuiz('wrongbook');
    }
  }
}

/**
 * 錯題記錄新增或累計更新 (Record Wrong Answer)
 */
function recordWrong(runtimeItem, userPick) {
  const wb = loadWB();
  const rawItem = runtimeItem.raw || runtimeItem;
  const key = getQuestionKey(rawItem);

  wb[key] = {
    q: runtimeItem.q,
    correct: formatOptionsText(runtimeItem, runtimeItem.a),
    yourAns: formatOptionsText(runtimeItem, userPick),
    m: runtimeItem.m,
    e: runtimeItem.e,
    resolved: false,
    count: (wb[key]?.count || 0) + 1,
    last: new Date().toLocaleDateString('zh-TW')
  };
  saveWB(wb);
  renderWB();
  updateWrongQuizButtonState();
}

/**
 * 錯題標記攻克消除 (Resolve Wrong Item)
 */
function resolveWrong(rawItem) {
  const wb = loadWB();
  const key = getQuestionKey(rawItem);
  if (wb[key]) {
    wb[key].resolved = true;
    saveWB(wb);
    renderWB();
    updateWrongQuizButtonState();
  }
}

/**
 * 渲染錯題本面板列表 (Render Wrongbook Panel UI)
 */
function renderWB() {
  const wb = loadWB();
  const list = document.getElementById('wb-list');
  if (!list) return;

  const entries = Object.values(wb);
  if (!entries.length) {
    list.innerHTML = '<p class="dim" style="font-size:.85rem">目前尚無錯題記錄。💪 保持下去！</p>';
    updateWrongQuizButtonState();
    return;
  }

  entries.sort((a, b) => (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0) || b.count - a.count);
  list.innerHTML = entries.map(it => `
    <div class="wb-item ${it.resolved ? 'resolved' : ''}">
      <div class="wb-q">${it.q}</div>
      <div class="wb-your">✗ 你的作答：${it.yourAns}</div>
      <div class="wb-ans">✓ 正確解答：${it.correct}</div>
      <div class="wb-meta">
        ${QM[it.m]} ｜ 累計答錯 ${it.count} 次 ｜ 最近作答：${it.last}
        ${it.resolved ? ' <span style="color:#22c55e;font-weight:bold">✅ 已克服</span>' : ''}
        <br>💡 ${it.e}
      </div>
    </div>
  `).join('');

  // 確保每次渲染列表時同步更新按鈕狀態
  updateWrongQuizButtonState();
}



/* =分隔線= */
/* ==弱點章節診斷分析 == */
/* ==========================================================================
   CCNA 200-301 精準技術特徵矩陣與加權識別引擎 (Weighted Taxonomy Engine)
   - 22 個官方考綱細粒度次領域 (Sub-domain Taxonomy)
   - 支援英文關鍵字權重計分 (Keyword Weight Scoring)
   - 模組領域關聯綁定 (Domain Affinity)，避免跨領域貪婪誤判
   - 100% 消除「綜合基礎」無效診斷
   ========================================================================== */

const CCNA_TAXONOMY = [
  // ── 1. Network Fundamentals (20%) ──
  {
    m: 0,
    name: '1.1 實體層排錯、纜線與光纖規格 (L1/Cabling/Optics)',
    tokens: [
      ['late collision', 10], ['late collisions', 10], ['collision', 4], ['duplex', 6],
      ['100-meter', 6], ['csma/cd', 8], ['single-mode', 8], ['multimode', 8],
      ['9-micron', 8], ['smf', 6], ['mmf', 6], ['cat6a', 6], ['cat5e', 6],
      ['1000base', 6], ['fiber', 4], ['straight-through', 6], ['crossover', 6],
      ['poe', 6], ['802.3at', 8], ['802.3af', 8], ['802.3bt', 8], ['cable', 4]
    ]
  },
  {
    m: 0,
    name: '1.2 IPv4 定址、VLSM 與子網劃分 (IPv4/Subnetting)',
    tokens: [
      ['rfc 3021', 10], ['/31', 8], ['/32', 6], ['/29', 6], ['/30', 6], ['/28', 6],
      ['/26', 6], ['/27', 6], ['/20', 6], ['usable host', 8], ['subnet mask', 8],
      ['wildcard mask', 8], ['255.255', 6], ['192.168', 5], ['172.16', 5], ['172.17', 5],
      ['10.0.0.0', 5], ['rfc 1918', 8], ['private ip', 6], ['apipa', 8],
      ['169.254', 8], ['loopback 127', 6], ['class c', 6], ['binary', 5]
    ]
  },
  {
    m: 0,
    name: '1.3 IPv6 定址、SLAAC 與 EUI-64 (IPv6 Fundamentals)',
    tokens: [
      ['eui-64', 10], ['slaac', 10], ['ipv6', 6], ['ff02::', 8], ['fe80::', 8],
      ['2001:', 6], ['compressed form', 8], ['link-local', 6], ['solicited-node', 8],
      ['router advertisement', 8], ['6to4', 8], ['nat64', 8], ['dual stack', 8]
    ]
  },
  {
    m: 0,
    name: '1.4 TCP/IP 與 OSI 模型封裝 (TCP/UDP/OSI Layers)',
    tokens: [
      ['three-way handshake', 10], ['syn-ack', 8], ['syn', 6], ['full-duplex', 6],
      ['tcp', 4], ['udp', 4], ['osi', 5], ['segment', 6], ['packet', 4],
      ['frame', 4], ['bit', 4], ['encapsulation', 6], ['pdu', 6], ['ttl', 6],
      ['checksum', 6], ['layer 4', 6], ['l2 / l3', 6]
    ]
  },
  {
    m: 0,
    name: '1.5 雲端運算架構與虛擬化技術 (Cloud/Virtualization)',
    tokens: [
      ['hybrid cloud', 10], ['public cloud', 8], ['private cloud', 8], ['iaas', 8],
      ['paas', 8], ['saas', 8], ['hypervisor', 10], ['esxi', 8], ['type 1', 8],
      ['type 2', 8], ['containers', 8], ['docker', 8], ['virtual machine', 6]
    ]
  },
  {
    m: 0,
    name: '1.6 基礎網路服務與拓撲 (Topology/ARP/DNS/Gateway)',
    tokens: [
      ['full mesh', 8], ['topology', 6], ['default gateway', 8], ['arp cache', 8],
      ['arp request', 8], ['arp', 5], ['127.0.0.1', 6], ['mx record', 8],
      ['dns cache', 8], ['dns', 5], ['spine', 8], ['leaf', 8]
    ]
  },

  // ── 2. Network Access (20%) ──
  {
    m: 1,
    name: '2.1 VLAN、Trunking 與 Native VLAN (VLAN/802.1Q)',
    tokens: [
      ['native vlan', 10], ['allowed vlan', 8], ['802.1q', 8], ['trunk', 6],
      ['voice vlan', 8], ['switchport', 6], ['dtp', 8], ['nonegotiate', 8],
      ['dynamic auto', 8], ['dynamic desirable', 8], ['vlan 1', 6], ['vtp', 8],
      ['transparent', 8], ['vlan', 4]
    ]
  },
  {
    m: 1,
    name: '2.2 STP/RSTP 根橋選舉與保護機制 (STP/RSTP/Guard)',
    tokens: [
      ['spanning-tree', 8], ['stp', 6], ['rstp', 8], ['root bridge', 8],
      ['bpdu guard', 10], ['root guard', 10], ['loop guard', 10], ['portfast', 8],
      ['alternate port', 8], ['backup port', 8], ['discarding', 6],
      ['superior bpdu', 10], ['24576', 8], ['28672', 8]
    ]
  },
  {
    m: 1,
    name: '2.3 EtherChannel 鏈路綑綁與模式 (EtherChannel/LACP)',
    tokens: [
      ['etherchannel', 10], ['lacp', 8], ['pagp', 8], ['channel-group', 8],
      ['active', 5], ['passive', 5], ['desirable', 6], ['port-channel', 8],
      ['min-links', 10], ['(su)', 8], ['(p)', 6]
    ]
  },
  {
    m: 1,
    name: '2.4 企業級無線網路 WLC 與 AP 架構 (Wireless/WLC/AP)',
    tokens: [
      ['wlc', 10], ['lightweight', 8], ['autonomous', 8], ['capwap', 10],
      ['split-mac', 10], ['2.4 ghz', 8], ['5 ghz', 8], ['channels 1, 6, and 11', 10],
      ['wpa2', 6], ['wpa3', 8], ['sae', 8], ['dragonfly', 8], ['roaming', 8],
      ['reassociation', 10], ['rrm', 8], ['rssi', 8], ['band select', 10],
      ['aaa override', 10], ['oeap', 10], ['flexconnect', 10], ['ssid', 6], ['rf', 5]
    ]
  },
  {
    m: 1,
    name: '2.5 交換器轉發原理與探索協定 (Switch/CDP/LLDP)',
    tokens: [
      ['mac address table', 8], ['cam table', 8], ['flooding', 6], ['unknown unicast', 8],
      ['cdp', 8], ['lldp', 8], ['802.1ab', 8], ['tlv', 8], ['holdtime', 6]
    ]
  },

  // ── 3. IP Connectivity (25%) ──
  {
    m: 2,
    name: '3.1 路由表解析與選路仲裁 (Routing Table/LPM/AD)',
    tokens: [
      ['longest prefix match', 10], ['administrative distance', 8], ['ad', 6],
      ['metric', 6], ['show ip route', 8], ['candidate default', 8],
      ['route print', 6], ['fib', 6], ['rib', 6], ['prefix', 5]
    ]
  },
  {
    m: 2,
    name: '3.2 靜態路由、預設與浮動備援 (Static/Default/Floating)',
    tokens: [
      ['static route', 8], ['default route', 8], ['0.0.0.0 0.0.0.0', 8],
      ['floating static', 10], ['gateway of last resort', 8], ['next-hop', 6],
      ['exit interface', 6], ['s*', 8]
    ]
  },
  {
    m: 2,
    name: '3.3 OSPFv2/OSPFv3 鄰居條件與狀態機 (OSPF Neighbors/LSA)',
    tokens: [
      ['ospf', 8], ['ospfv2', 8], ['ospfv3', 8], ['router id', 8], ['router-id', 8],
      ['area 0', 6], ['hello and dead', 10], ['hello', 4], ['dead', 4],
      ['exstart', 10], ['2-way', 8], ['dr/bdr', 10], ['224.0.0.5', 8], ['224.0.0.6', 8],
      ['type 1', 6], ['type 2', 6], ['lsa', 6], ['reference-bandwidth', 8],
      ['passive-interface', 8], ['default-information originate', 10]
    ]
  },
  {
    m: 2,
    name: '3.4 跨 VLAN 路由 SVI 與 ROAS (Inter-VLAN Routing)',
    tokens: [
      ['router-on-a-stick', 10], ['subinterface', 8], ['encapsulation dot1q', 8],
      ['svi', 8], ['interface vlan', 8], ['ip routing', 8]
    ]
  },
  {
    m: 2,
    name: '3.5 第一跳閘道備援協定 (FHRP/HSRP/VRRP/GLBP)',
    tokens: [
      ['fhrp', 8], ['hsrp', 8], ['vrrp', 8], ['glbp', 8], ['standby preempt', 10],
      ['standby', 6], ['virtual ip', 8], ['virtual mac', 8], ['0000.0c07.ac', 10],
      ['0000.5e00.01', 10], ['tracking', 6]
    ]
  },

  // ── 4. IP Services (10%) ──
  {
    m: 3,
    name: '4.1 NAT 與 PAT 埠位址轉換 (NAT/PAT/Overload)',
    tokens: [
      ['inside local', 10], ['inside global', 10], ['outside local', 8],
      ['outside global', 8], ['static nat', 8], ['dynamic nat', 8],
      ['pat', 8], ['overload', 8], ['ip nat inside', 8], ['ip nat outside', 8]
    ]
  },
  {
    m: 3,
    name: '4.2 DHCP 服務與 Relay 中繼代理 (DHCP/Relay Agent)',
    tokens: [
      ['dhcp', 6], ['dora', 10], ['discover', 6], ['offer', 6], ['request', 4],
      ['acknowledge', 6], ['ip helper-address', 10], ['udp 67', 8], ['udp 68', 8],
      ['option 43', 10], ['option 150', 10], ['option 66', 8], ['option 3', 8],
      ['default-router', 8], ['lease', 6]
    ]
  },
  {
    m: 3,
    name: '4.3 時間同步、日誌與監控 (NTP/Syslog/SNMP)',
    tokens: [
      ['ntp master', 10], ['ntp', 6], ['stratum', 8], ['synchronized', 8],
      ['syslog', 8], ['severity', 8], ['emergency', 6], ['debugging', 6],
      ['logging trap', 10], ['snmpv3', 10], ['snmpv2c', 8], ['snmp', 6],
      ['usm', 8], ['getbulk', 8], ['inform', 8], ['authpriv', 8], ['trap', 6],
      ['mib', 6], ['oid', 6]
    ]
  },
  {
    m: 3,
    name: '4.4 QoS 服務品質分類與標記 (QoS/CoS/DSCP)',
    tokens: [
      ['qos', 8], ['dscp', 8], ['cos', 8], ['expedited forwarding', 10],
      ['ef', 6], ['af31', 8], ['best effort', 6], ['policing', 8],
      ['shaping', 8], ['trust boundary', 10], ['queue', 6], ['buffer', 6]
    ]
  },

  // ── 5. Security Fundamentals (15%) ──
  {
    m: 4,
    name: '5.1 Layer 2 安全防護 (Port Sec/Snooping/DAI)',
    tokens: [
      ['port security', 10], ['port-security', 10], ['violation', 8], ['protect', 6],
      ['restrict', 6], ['shutdown', 5], ['sticky', 8], ['errdisable', 8],
      ['dhcp snooping', 10], ['untrusted', 8], ['trusted', 6],
      ['dynamic arp inspection', 10], ['dai', 8], ['arp spoofing', 8],
      ['cam overflow', 8], ['mac flooding', 8]
    ]
  },
  {
    m: 4,
    name: '5.2 ACL 存取控制清單 (Standard/Extended/Named ACL)',
    tokens: [
      ['access-list', 8], ['acl', 6], ['standard acl', 8], ['extended acl', 8],
      ['named acl', 8], ['implicit deny', 10], ['ip access-group', 8],
      ['access-class', 10], ['line vty', 6]
    ]
  },
  {
    m: 4,
    name: '5.3 AAA 架構、身分認證與密碼強化 (AAA/802.1X/Passwords)',
    tokens: [
      ['tacacs+', 10], ['radius', 8], ['802.1x', 10], ['supplicant', 8],
      ['authenticator', 8], ['authentication', 6], ['authorization', 6],
      ['accounting', 6], ['enable secret', 8], ['algorithm-type scrypt', 10],
      ['type 9', 8], ['type 8', 8], ['type 5', 8], ['type 7', 8],
      ['service password-encryption', 8], ['mfa', 8]
    ]
  },
  {
    m: 4,
    name: '5.4 VPN 隧道與密碼學基礎 (VPN/IPsec/Encryption)',
    tokens: [
      ['site-to-site', 8], ['remote access', 8], ['ipsec', 8], ['tunnel mode', 10],
      ['transport mode', 10], ['esp', 8], ['ah', 8], ['ike', 8], ['sha-256', 6],
      ['aes', 6], ['rsa', 6], ['symmetric', 6], ['asymmetric', 6], ['vpn', 6],
      ['phishing', 8], ['ransomware', 8], ['social engineering', 8], ['ids', 6], ['ips', 6]
    ]
  },

  // ── 6. Automation & Programmability (10%) ──
  {
    m: 5,
    name: '6.1 SDN 控制器與 DNA/Catalyst Center (SDN/DNA-C)',
    tokens: [
      ['sdn', 8], ['dna center', 10], ['catalyst center', 10], ['intent-based', 8],
      ['assurance', 8], ['fabric', 8], ['lisp', 8], ['vxlan', 8], ['control plane', 6],
      ['data plane', 6], ['management plane', 6], ['controller', 6]
    ]
  },
  {
    m: 5,
    name: '6.2 REST API、HTTP 狀態碼與資料格式 (REST/JSON/YAML)',
    tokens: [
      ['rest api', 8], ['rest', 6], ['northbound', 8], ['southbound', 8],
      ['200 ok', 8], ['201 created', 8], ['204 no content', 10],
      ['401 unauthorized', 8], ['403 forbidden', 10], ['404 not found', 8],
      ['500 internal server error', 8], ['json', 6], ['yaml', 6], ['xml', 6],
      ['yang', 8], ['netconf', 8], ['restconf', 8], ['postman', 8]
    ]
  },
  {
    m: 5,
    name: '6.3 自動化組態管理與 IaC 工具 (Ansible/Terraform/Python)',
    tokens: [
      ['ansible', 10], ['agentless', 8], ['playbook', 8], ['terraform', 10],
      ['iac', 8], ['puppet', 8], ['chef', 8], ['json.loads()', 8],
      ['requests', 6], ['netmiko', 8], ['python', 6]
    ]
  }
];

/**
 * 加權概念識別引擎 (Weighted Concept Detector - RegExp Bound)
 * @param {string|Object} qInput 題幹字串或題目物件實體
 * @param {number} [mIndex] 題目所屬的官方考綱模組編號 (0-5)
 * @returns {string} 精準對應的 CCNA 知識點名稱
 */
function detectConcept(qInput, mIndex) {
  let text = '';
  let targetM = (typeof mIndex === 'number') ? mIndex : -1;

  if (typeof qInput === 'object' && qInput !== null) {
    text = (qInput.q || '') + ' ' + (qInput.e || '');
    if (typeof qInput.m === 'number') targetM = qInput.m;
  } else {
    text = String(qInput || '');
  }

  let bestConcept = null;
  let maxScore = -1;

  for (const item of CCNA_TAXONOMY) {
    let score = 0;

    // 模組同域加成 (Domain Affinity Bonus)
    if (targetM >= 0 && item.m === targetM) {
      score += 4;
    }

    // 累計各 Token 正則測試加權得分
    for (const [reOrStr, weight] of item.tokens) {
      const isMatch = (reOrStr instanceof RegExp) 
        ? reOrStr.test(text) 
        : text.toLowerCase().includes(String(reOrStr).toLowerCase());

      if (isMatch) {
        score += weight;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestConcept = item.name;
    }
  }

  // 若完全無特徵命中，依模組預設兜底
  if (maxScore <= 0 || !bestConcept) {
    const fallbackMap = {
      0: '1.4 TCP/IP 與 OSI 模型封裝 (TCP/UDP/OSI Layers)',
      1: '2.1 VLAN、Trunking 與 Native VLAN (VLAN/802.1Q)',
      2: '3.1 路由表解析與選路仲裁 (Routing Table/LPM/AD)',
      3: '4.3 時間同步、日誌與監控 (NTP/Syslog/SNMP)',
      4: '5.2 ACL 存取控制清單 (Standard/Extended/Named ACL)',
      5: '6.2 REST API、HTTP 狀態碼與資料格式 (REST/JSON/YAML)'
    };
    return fallbackMap[targetM] || '1.4 TCP/IP 與 OSI 模型封裝 (TCP/UDP/OSI Layers)';
  }

  return bestConcept;
}


/* ==========================================================================
   CCNA 200-301 弱點診斷與考點導流推薦引擎 (Remediation & Routing Engine)
   - 深度整合 22 大考綱次領域之多維度補強矩陣
   - 動態錯誤率門檻視覺化 (危險紅 ≥40% / 警告黃 20~39% / 良好綠 <20%)
   - 提供「一鍵直達複習」跳轉互動，自動切換分頁並填入檢索關鍵字
   ========================================================================== */

/**
 * 22 大考點專屬深度複習導流矩陣 (Deep Remediation Matrix)
 */
const REMEDIATION_GUIDE = {
  '1.1 實體層排錯、纜線與光纖規格 (L1/Cabling/Optics)': {
    day: 'Day 1（實體層與纜線規格）',
    tab: 'tables',
    kw: '光纖',
    labKw: 'vlan',
    pitKw: '光纖',
    summary: '重點複習單模 (SMF 9µm Laser) vs 多模 (MMF 50µm LED) 光纖特性、雙絞線長度限制 (100m) 與 Late Collision 雙工排錯。'
  },
  '1.2 IPv4 定址、VLSM 與子網劃分 (IPv4/Subnetting)': {
    day: 'Day 3（IPv4 子網路劃分 — 每日 20 題）',
    tab: 'calc',
    kw: 'IPv4',
    labKw: 'RFC 3021',
    pitKw: 'Subnetting',
    summary: '善用本儀表板的「IPv4 Subnetting 計算機」演練 RFC 3021 /31 點對點鏈路與 /32 主機遮罩運算。'
  },
  '1.3 IPv6 定址、SLAAC 與 EUI-64 (IPv6 Fundamentals)': {
    day: 'Day 4（IPv6 位址類型與縮寫規則）',
    tab: 'tables',
    kw: 'IPv6',
    labKw: 'IPv6',
    pitKw: 'IPv6',
    summary: '聚焦 EUI-64 第 7 bit 反轉（U/L bit）、Link-Local (FE80::/10) 與 SLAAC 搭配 Router Advertisement (RA) 流程。'
  },
  '1.4 TCP/IP 與 OSI 模型封裝 (TCP/UDP/OSI Layers)': {
    day: 'Day 2（TCP/IP 與 OSI 七層對照、TCP 三向交握）',
    tab: 'tables',
    kw: 'TCP',
    labKw: 'vlan',
    pitKw: 'TCP',
    summary: '重溫 TCP 三向交握 (SYN→SYN-ACK→ACK)、常見 Port 埠號 (HTTP 80/HTTPS 443/SSH 22/DNS 53) 與 L1-L4 PDU 封裝。'
  },
  '1.5 雲端運算架構與虛擬化技術 (Cloud/Virtualization)': {
    day: 'Day 1（打地基：虛擬化與雲端服務）',
    tab: 'tables',
    kw: '虛擬化',
    labKw: 'SDN',
    pitKw: 'JSON',
    summary: '比較 Type 1 (Bare-Metal/ESXi) vs Type 2 (Hosted) Hypervisor，以及 Container 共享 OS Kernel 的輕量特性。'
  },
  '1.6 基礎網路服務與拓撲 (Topology/ARP/DNS/Gateway)': {
    day: 'Day 1–2（網路拓撲與基礎通訊）',
    tab: 'tables',
    kw: 'ARP',
    labKw: 'DNS',
    pitKw: 'DNS',
    summary: '理解跨網段封裝先發 ARP 請求預設閘道 MAC、Full-Mesh 連線數公式 $n(n-1)/2$ 與 DNS 遞迴查詢。'
  },
  '2.1 VLAN、Trunking 與 Native VLAN (VLAN/802.1Q)': {
    day: 'Day 5 與 Day 13（交換原理、VLAN 與 Trunking）',
    tab: 'labs',
    kw: 'Native VLAN',
    labKw: 'Trunking',
    pitKw: 'Native VLAN',
    summary: '重跑 Lab 2，注意 802.1Q Native VLAN 預設明文不打標，兩端 ID 不匹配將導致 VLAN 洩漏與廣播域合併。'
  },
  '2.2 STP/RSTP 根橋選舉與保護機制 (STP/RSTP/Guard)': {
    day: 'Day 15（STP/RSTP 根橋選舉與 Port Cost）',
    tab: 'tables',
    kw: 'STP',
    labKw: 'Rapid-PVST+',
    pitKw: 'STP',
    summary: '熟記 Bridge Priority (4096 倍數) + 最低 MAC 選舉原則；區分 BPDU Guard (邊緣鎖埠) 與 Root Guard (下游防奪權)。'
  },
  '2.3 EtherChannel 鏈路綑綁與模式 (EtherChannel/LACP)': {
    day: 'Day 16（EtherChannel 模式匹配矩陣）',
    tab: 'tables',
    kw: 'EtherChannel',
    labKw: 'EtherChannel',
    pitKw: 'EtherChannel',
    summary: '複習 LACP (active/passive) 與 PAgP (desirable/auto) 模式匹配矩陣，注意成員埠 (s) 代表參數不一致被掛起。'
  },
  '2.4 企業級無線網路 WLC 與 AP 架構 (Wireless/WLC/AP)': {
    day: 'Day 17–18（無線架構：Autonomous vs Lightweight、WPA3）',
    tab: 'tables',
    kw: 'WLAN',
    labKw: 'WLC',
    pitKw: 'Wireless',
    summary: '聚焦 Split-MAC 架構中 CAPWAP 控制 (UDP 5246) / 資料 (UDP 5247) 傳輸，以及 WPA3-SAE Dragonfly 抗字典攻擊機制。'
  },
  '2.5 交換器轉發原理與探索協定 (Switch/CDP/LLDP)': {
    day: 'Day 5 與 Day 19（交換原理與探索協定）',
    tab: 'tables',
    kw: 'CDP',
    labKw: 'LLDP',
    pitKw: 'CDP',
    summary: '區別 Cisco 專屬 CDP (預設啟用) 與 IEEE 802.1AB 開放標準 LLDP (需手動 lldp run)；掌握未知單播 Flooding 行為。'
  },
  '3.1 路由表解析與選路仲裁 (Routing Table/LPM/AD)': {
    day: 'Day 6（路由仲裁黃金律）',
    tab: 'tables',
    kw: 'Longest Prefix',
    labKw: '靜態路由',
    pitKw: '路由仲裁',
    summary: '落實查表三部曲：① 最長前綴匹配 (LPM) > ② 管理距離 (AD) > ③ 度量值 (Metric)；/28 路由必優先於 /24 路由。'
  },
  '3.2 靜態路由、預設與浮動備援 (Static/Default/Floating)': {
    day: 'Day 6 與 Day 11（靜態路由與浮動備援）',
    tab: 'labs',
    kw: '浮動備援',
    labKw: '靜態路由',
    pitKw: '浮動靜態',
    summary: '實作 Lab 13，理解浮動靜態路由 AD 必須大於動態協定 (如設為 120)，且乙太網路介面必須指定下一跳 IP。'
  },
  '3.3 OSPFv2/OSPFv3 鄰居條件與狀態機 (OSPF Neighbors/LSA)': {
    day: 'Day 8–9（OSPFv2 鄰居狀態機、Timer 與 DR 選舉）',
    tab: 'pitfalls',
    kw: 'OSPF',
    labKw: 'OSPFv2',
    pitKw: 'OSPF',
    summary: '排查 OSPF 鄰居 7 大匹配條件；卡在 ExStart 檢查 MTU 與重複 Router-ID；DR 選舉採最高 Priority 且不具搶佔性。'
  },
  '3.4 跨 VLAN 路由 SVI 與 ROAS (Inter-VLAN Routing)': {
    day: 'Day 13（VLAN 間路由：ROAS 與 SVI）',
    tab: 'labs',
    kw: 'SVI',
    labKw: 'ROAS',
    pitKw: 'ROAS',
    summary: '比對 Router-on-a-Stick 子介面 dot1q 封裝與 L3 Switch SVI (需 ip routing) 的轉發原理。'
  },
  '3.5 第一跳閘道備援協定 (FHRP/HSRP/VRRP/GLBP)': {
    day: 'Day 10（FHRP 第一跳冗餘與 HSRP）',
    tab: 'tables',
    kw: 'HSRP',
    labKw: 'HSRP',
    pitKw: 'FHRP',
    summary: '演練 HSRPv2 虛擬 MAC (0000.0C9F.Fxxx)、standby preempt 搶佔機制，以及 VRRP (Master/Backup) 開放標準差異。'
  },
  '4.1 NAT 與 PAT 埠位址轉換 (NAT/PAT/Overload)': {
    day: 'Day 12（NAT / PAT 完整演練）',
    tab: 'labs',
    kw: 'NAT',
    labKw: 'NAT',
    pitKw: 'PAT',
    summary: '實作 Lab 23，Inside/Outside 方向不可顛倒；PAT 多對一上網必須加上 overload 關鍵字以透過 L4 Port 區分連線。'
  },
  '4.2 DHCP 服務與 Relay 中繼代理 (DHCP/Relay Agent)': {
    day: 'Day 23（DHCP Relay 與 DORA 流程）',
    tab: 'labs',
    kw: 'DHCP',
    labKw: 'DHCP',
    pitKw: 'DHCP Relay',
    summary: '掌握 DORA 四步驟；ip helper-address 必須配置在靠近客戶端的入口介面，將廣播轉為單播並填入 giaddr 選池。'
  },
  '4.3 時間同步、日誌與監控 (NTP/Syslog/SNMP)': {
    day: 'Day 22（NTP、Syslog 嚴重度與 SNMPv3）',
    tab: 'tables',
    kw: 'Syslog',
    labKw: 'Syslog',
    pitKw: 'Syslog',
    summary: '記憶 Syslog 嚴重度 0 (Emergency) 至 7 (Debugging)；NTP Stratum 16 代表未同步；SNMPv3 authPriv 具備加密防護。'
  },
  '4.4 QoS 服務品質分類與標記 (QoS/CoS/DSCP)': {
    day: 'Day 23（QoS 分類標記、Policing 與 Shaping）',
    tab: 'tables',
    kw: 'QoS',
    labKw: 'QoS',
    pitKw: 'QoS',
    summary: '語音標記為 EF (DSCP 46 / CoS 5)；Policing (丟棄/重標記) 支援雙向，Shaping (佇列緩衝平滑) 僅支援 Outbound。'
  },
  '5.1 Layer 2 安全防護 (Port Sec/Snooping/DAI)': {
    day: 'Day 20（Port Security、DHCP Snooping 與 DAI）',
    tab: 'labs',
    kw: 'Port Security',
    labKw: 'Port Security',
    pitKw: 'Port Security',
    summary: '熟悉 Port Security 三大違規模式 (Protect/Restrict/Shutdown)；DAI 依賴 DHCP Snooping 建立的 IP-MAC 綁定表防 ARP 欺騙。'
  },
  '5.2 ACL 存取控制清單 (Standard/Extended/Named ACL)': {
    day: 'Day 11（ACL 基本語法與放置位置原則）',
    tab: 'tables',
    kw: 'ACL',
    labKw: 'ACL',
    pitKw: 'ACL',
    summary: 'Standard ACL (僅來源 IP) 放靠近目的地；Extended ACL (五元組) 放靠近來源；由上而下逐條匹配且末端隱含 Deny Any。'
  },
  '5.3 AAA 架構、身分認證與密碼強化 (AAA/802.1X/Passwords)': {
    day: 'Day 19（AAA 架構、802.1X 與密碼強化）',
    tab: 'tables',
    kw: 'TACACS+',
    labKw: 'AAA',
    pitKw: 'TACACS+',
    summary: 'TACACS+ (TCP 49 全加密/逐指令授權) vs RADIUS (UDP 1812/1813 僅加密密碼)；Type 9 Scrypt 雜湊具最高防破解強度。'
  },
  '5.4 VPN 隧道與密碼學基礎 (VPN/IPsec/Encryption)': {
    day: 'Day 20（Site-to-Site VPN 與 IPsec 機制）',
    tab: 'tables',
    kw: 'VPN',
    labKw: 'VPN',
    pitKw: 'VPN',
    summary: 'IPsec Tunnel Mode 加密整個原始封包並加新標頭；ESP (Protocol 50) 提供加密與認證，AH (Protocol 51) 僅認證不加密。'
  },
  '6.1 SDN 控制器與 DNA/Catalyst Center (SDN/DNA-C)': {
    day: 'Day 26（SDN 架構、Controller 與 DNA Center）',
    tab: 'tables',
    kw: 'Controller',
    labKw: 'SDN',
    pitKw: 'DNA Center',
    summary: 'SDN 將控制與管理平面集中於 Controller，資料平面留於本地線速轉發；DNA-C 提供 Assurance 遙測主動健康分析。'
  },
  '6.2 REST API、HTTP 狀態碼與資料格式 (REST/JSON/YAML)': {
    day: 'Day 24–25（REST API、HTTP 動詞與 JSON/YAML）',
    tab: 'tables',
    kw: 'REST API',
    labKw: 'REST API',
    pitKw: 'JSON',
    summary: 'CRUD 對應 POST(201)/GET(200)/PUT(200)/DELETE(204)；401 代表未驗證，403 代表權限不足；JSON 鍵名必須使用雙引號。'
  },
  '6.3 自動化組態管理與 IaC 工具 (Ansible/Terraform/Python)': {
    day: 'Day 27（Terraform、Ansible 與 Python 自動化）',
    tab: 'tables',
    kw: 'Ansible',
    labKw: 'Ansible',
    pitKw: 'Ansible',
    summary: 'Ansible 為 Agentless + Push 模式 (走 SSH/YAML Playbook)；Terraform 為宣告式 IaC 基礎設施佈建工具。'
  }
};

/**
 * 一鍵直達特定分頁與檢索功能 (Universal Jump & Search Navigator)
 * @param {string} targetTab 目標導航分頁 ID ('schedule' | 'takeaways' | 'tables' | 'labs' | 'pitfalls' | 'calc')
 * @param {string} searchKeyword 欲自動填入並觸發過濾的關鍵字
 */
function jumpToReview(targetTab, searchKeyword) {
  // 1. 切換上方導航列
  const navBtn = document.querySelector(`#nav button[data-s="${targetTab}"]`);
  if (navBtn) {
    navBtn.click();
  }

  // 2. 針對目標分頁自動注入搜尋字串並觸發過濾更新
  setTimeout(() => {
    if (targetTab === 'tables') {
      const searchInput = document.getElementById('cmp-search');
      if (searchInput && typeof renderCmp === 'function') {
        searchInput.value = searchKeyword || '';
        renderCmp();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (targetTab === 'labs') {
      const searchInput = document.getElementById('lab-search');
      if (searchInput && typeof renderLabs === 'function') {
        searchInput.value = searchKeyword || '';
        renderLabs();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (targetTab === 'pitfalls') {
      const searchInput = document.getElementById('pit-search');
      if (searchInput && typeof renderPitfalls === 'function') {
        searchInput.value = searchKeyword || '';
        renderPitfalls();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (targetTab === 'calc') {
      const calcSection = document.getElementById('calc');
      if (calcSection) {
        calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, 100);
}

/**
 * 重構：多維度弱點診斷雷達更新函式 (Enhanced Weakness Analysis Engine with Two-Tier RWD)
 * @param {Array<Object>} list 當前測驗題庫實體陣列
 */
function updateWeakAnalysis(list) {
  const box = document.getElementById('weak-analysis');
  if (!box) return;

  const stats = {};
  let totalAnsweredInView = 0;

  // 1. 統計各細粒度考點作答與錯誤數據
  list.forEach((item, i) => {
    const card = document.getElementById(`quiz-q-${i}`);
    if (!card || !card.dataset.done) return;

    totalAnsweredInView++;
    const concept = (typeof detectConcept === 'function') 
      ? detectConcept(item, item.m) 
      : (item.q || '基礎網路概念');

    if (!stats[concept]) {
      stats[concept] = { w: 0, t: 0 };
    }
    stats[concept].t++;

    if (card.querySelector('.opt.wrong')) {
      stats[concept].w++;
    }
  });

  // 2. 計算錯誤率並排序 (錯誤率高者優先，答錯數多者次之)
  const rows = Object.entries(stats)
    .filter(([, s]) => s.t >= 1)
    .map(([conceptName, s]) => ({
      concept: conceptName,
      w: s.w,
      t: s.t,
      rate: s.w / s.t
    }))
    .sort((a, b) => b.rate - a.rate || b.w - a.w);

  // 若尚無作答資料則隱藏面板
  if (!rows.length || totalAnsweredInView === 0) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'block';

  // 3. 渲染雙層自適應進度條 (Two-Tier Responsive Bars)
  const barsContainer = document.getElementById('weak-bars');
  if (barsContainer) {
    barsContainer.innerHTML = rows.map(r => {
      const pct = Math.round(r.rate * 100);
      const isDanger = pct >= 40;
      const isWarn = pct >= 20 && pct < 40;

      // 動態色階：≥40% 危險紅、20%~39% 警告黃、<20% 良好青綠
      const barColor = isDanger
        ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
        : isWarn
        ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(90deg, #10b981 0%, #0ea5e9 100%)';

      const badgeClass = isDanger
        ? 'weak-pct-danger'
        : isWarn
        ? 'weak-pct-warn'
        : 'weak-pct-good';

      return `
        <div class="weak-bar-row">
          <div class="weak-bar-header">
            <span class="weak-bar-label">${r.concept}</span>
            <span class="weak-pct-badge ${badgeClass}">
              錯 ${pct}% (${r.w}/${r.t})
            </span>
          </div>
          <div class="weak-bar-track">
            <div class="weak-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. 渲染深度補強診斷建議 (Deep Actionable Remediation Cards)
  const tipEl = document.getElementById('weak-tip');
  if (tipEl) {
    const highRiskList = rows.filter(r => r.rate >= 0.35 || (r.w >= 2 && r.rate > 0));

    if (highRiskList.length > 0) {
      tipEl.innerHTML = `
        <div style="font-size: 0.95rem; font-weight: 700; color: #fbbf24; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <span>🎯</span> 官方考綱深度補強建議（高頻失分領域）：
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${highRiskList.map(r => {
            const guide = (typeof REMEDIATION_GUIDE !== 'undefined' && REMEDIATION_GUIDE[r.concept]) ? REMEDIATION_GUIDE[r.concept] : {
              day: '對應考綱單元複習',
              tab: 'tables',
              kw: '',
              summary: '建議回到對應章節重溫核心觀念並加強實作演練。'
            };

            return `
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.3); border-left: 4px solid #ef4444; border-radius: 8px; padding: 12px 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
                  <span style="color: #ffffff; font-weight: 700; font-size: 0.9rem;">📌 ${r.concept}</span>
                  <span style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3);">
                    錯誤率 ${Math.round(r.rate * 100)}% (${r.w} 題)
                  </span>
                </div>
                <div style="color: #cbd5e1; font-size: 0.84rem; line-height: 1.6; margin-bottom: 8px;">
                  ${guide.summary}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding-top: 8px; border-top: 1px dashed rgba(51, 65, 85, 0.6); font-size: 0.8rem; color: #94a3b8;">
                  <span>📅 建議排程：<b style="color: #38bdf8;">${guide.day}</b></span>
                  <div style="display: flex; gap: 6px;">
                    ${guide.kw ? `
                      <button onclick="jumpToReview('${guide.tab}', '${guide.kw}')" style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 3px 10px; border-radius: 4px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        🔍 查對照表
                      </button>
                    ` : ''}
                    ${guide.labKw ? `
                      <button onclick="jumpToReview('labs', '${guide.labKw}')" style="background: rgba(16, 185, 129, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); padding: 3px 10px; border-radius: 4px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        🧪 查IOS指令+練實作 Lab
                      </button>
                    ` : ''}
                    ${guide.pitKw ? `
                      <button onclick="jumpToReview('pitfalls', '${guide.pitKw}')" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 3px 10px; border-radius: 4px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ⚠️ 看避坑卡
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      tipEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #4ade80; font-size: 0.9rem; font-weight: 600;">
          <span>✅</span> 各項核心技術答對率均達 70% 以上，觀念扎實！請繼續保持高頻刷題手感。
        </div>
      `;
    }
  }
}


/* =分隔線=*/
/* == IPv4 子網路計算機與實戰隨機題庫演練 == */

// 1. 下拉選單初始化（支援 /8 到 /32）
const sel = document.getElementById('cidr');
if (sel) {
  sel.innerHTML = '';
  for (let i = 8; i <= 32; i++) {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = `/${i}`;
    sel.appendChild(o);
  }
  sel.value = 24;
}

// 核心 IP / 遮罩二進位轉換與格式化工具
const fmt = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
const toInt = s => {
  const p = s.trim().split('.').map(Number);
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
};
const rnd = n => Math.floor(Math.random() * n);
const bin8 = x => (x >>> 0).toString(2).padStart(8, '0');

// IP 位址屬性與範圍精準判定 (CCNA 考綱範圍)
function classify(n) {
  const a = (n >>> 24) & 255;
  const b = (n >>> 16) & 255;
  
  if (a === 10) return '<span class="warn">🔒 RFC 1918 私有位址 (Class A: 10.0.0.0/8)</span>';
  if (a === 172 && b >= 16 && b <= 31) return '<span class="warn">🔒 RFC 1918 私有位址 (Class B: 172.16.0.0/12)</span>';
  if (a === 192 && b === 168) return '<span class="warn">🔒 RFC 1918 私有位址 (Class C: 192.168.0.0/16)</span>';
  if (a === 127) return '<span class="bad">🔄 Loopback 本地回環 (127.0.0.0/8)</span>';
  if (a === 169 && b === 254) return '<span class="bad">⚠️ APIPA 自動私用位址 (DHCP 失敗 / 169.254.0.0/16)</span>';
  if (a === 100 && b >= 64 && b <= 127) return '<span class="warn">🏢 CGNAT 電信級 NAT (100.64.0.0/10)</span>';
  if (a >= 224 && a <= 239) return '<span class="warn">📡 Multicast 多播群播位址 (Class D: 224.0.0.0/4)</span>';
  if (a >= 240) return '<span class="dim">🧪 保留實驗位址 (Class E: 240.0.0.0/4)</span>';
  return '<span class="ok">🌐 Internet 公有位址 (Public IPv4)</span>';
}

// 2. 子網路計算機核心運算與二進位著色
function calcSubnet() {
  const ipInput = document.getElementById('ip');
  if (!ipInput) return;

  const rawIp = ipInput.value.trim();
  const parts = rawIp.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    alert('請輸入有效的 IPv4 位址（例如：192.168.1.77）');
    return;
  }

  const cidr = parseInt(sel.value, 10);
  const ipInt = ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  
  // 遮罩與反遮罩 (Wildcard)
  const maskInt = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
  const wildInt = (~maskInt) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const bcInt = (netInt | wildInt) >>> 0;
  
  const totalIps = Math.pow(2, 32 - cidr);
  let usableHosts, firstIpInt, lastIpInt;
  let isNet = (ipInt === netInt) && cidr < 31;
  let isBc = (ipInt === bcInt) && cidr < 31;

  if (cidr === 32) {
    usableHosts = 1;
    firstIpInt = lastIpInt = netInt;
    isNet = false;
    isBc = false;
  } else if (cidr === 31) {
    usableHosts = 2; // RFC 3021 Point-to-Point
    firstIpInt = netInt;
    lastIpInt = bcInt;
    isNet = false;
    isBc = false;
  } else {
    usableHosts = totalIps - 2;
    firstIpInt = netInt + 1;
    lastIpInt = bcInt - 1;
  }

  // 二進位視覺化渲染（網路位元標藍、主機位元標灰）
  const ipBinArr = parts.map(bin8);
  const maskParts = [(maskInt >>> 24) & 255, (maskInt >>> 16) & 255, (maskInt >>> 8) & 255, maskInt & 255];
  const maskBinArr = maskParts.map(bin8);
  const netParts = [(netInt >>> 24) & 255, (netInt >>> 16) & 255, (netInt >>> 8) & 255, netInt & 255];
  const netBinArr = netParts.map(bin8);

  const formatColoredBin = (binArr) => {
    let bitCount = 0;
    return binArr.map(octet => {
      let out = '';
      for (let ch of octet) {
        if (bitCount < cidr) {
          out += `<span style="color:#38bdf8;font-weight:bold">${ch}</span>`;
        } else {
          out += `<span style="color:#94a3b8">${ch}</span>`;
        }
        bitCount++;
      }
      return out;
    }).join(' . ');
  };

  const magicNum = cidr >= 24 ? Math.pow(2, 32 - cidr) : (cidr >= 16 ? Math.pow(2, 24 - cidr) : Math.pow(2, 16 - cidr));

  const calcOut = document.getElementById('calc-out');
  calcOut.style.display = 'block';
  calcOut.innerHTML = `
    <div style="margin-bottom:6px">📌 <b>IP 屬性：</b> ${classify(ipInt)}</div>
    <div>🌐 <b>網路位址 (Network ID)：</b> <b style="color:#38bdf8">${fmt(netInt)}/${cidr}</b> ${isNet ? '<span class="warn">← 當前輸入即為網路位址</span>' : ''}</div>
    <div>🎭 <b>子網路遮罩 (Subnet Mask)：</b> <b>${fmt(maskInt)}</b>（Wildcard：<b>${fmt(wildInt)}</b>）</div>
    <div>📢 <b>廣播位址 (Broadcast ID)：</b> <b style="color:#f43f5e">${fmt(bcInt)}</b> ${isBc ? '<span class="bad">← 當前輸入為廣播位址 (不可配給主機)</span>' : ''}</div>
    <div>💻 <b>可用主機範圍 (Usable Range)：</b> <b>${fmt(firstIpInt)}</b> ～ <b>${fmt(lastIpInt)}</b></div>
    <div>🔢 <b>可用主機總數：</b> <b style="color:#22c55e">${usableHosts.toLocaleString()}</b> 台 ${cidr === 31 ? '<span class="dim">(RFC 3021 點對點鏈路特例，免減 2)</span>' : ''}</div>
    <div>⚡ <b>Magic Number (Block Size)：</b> <b>${magicNum > 256 ? '跨 Octet 彙總' : magicNum}</b></div>
    <pre class="bin" style="margin-top:10px">
<b>二進位位元對齊（藍色 = 網路位元 / 灰色 = 主機位元）：</b>
IP   : ${formatColoredBin(ipBinArr)}
Mask : ${formatColoredBin(maskBinArr)}
-------------------------------------------------------------
Net  : ${formatColoredBin(netBinArr)}</pre>
  `;
}



/* =分隔線= */
/* =隨機題組引擎=*/
/* ================= 隨機考題模組 (支援 CCNA 5 大題型與獨立重設計分) ================= */
let qData = null;
let sOk = 0;
let sNg = 0;
let qType = 'net';

/**
 * 格式化輸出子網路遮罩點分十進位字串
 * @param {number} c CIDR 前綴長度 (0~32)
 * @returns {string} 點分十進位字串 (如 255.255.255.0)
 */
function fmtOfMask(c) {
  const m = c === 0 ? 0 : ((0xFFFFFFFF << (32 - c)) >>> 0);
  return fmt(m);
}

/**
 * 重設 Subnetting 隨機演練之答題統計與正確率
 */
function resetSubnetScore() {
  sOk = 0;
  sNg = 0;
  const okEl = document.getElementById('s-ok');
  const ngEl = document.getElementById('s-ng');
  const rateEl = document.getElementById('s-rate');
  
  if (okEl) okEl.textContent = '0';
  if (ngEl) ngEl.textContent = '0';
  if (rateEl) rateEl.textContent = '—';
}

/**
 * 生成隨機 RFC 1918 私有網段
 * @param {number} cidr 前綴長度
 * @returns {number[]} 四個八位元陣列
 */
function randPrivateNet(cidr) {
  const base = [192, 172, 10][rnd(3)];
  let net = [
    base,
    base === 192 ? 168 : (base === 172 ? 16 + rnd(16) : rnd(256)),
    rnd(256),
    0
  ];
  const subBits = cidr - 24;
  if (subBits > 0) {
    const block = Math.pow(2, 8 - subBits);
    net[3] = rnd(Math.pow(2, subBits)) * block;
  } else if (cidr <= 24 && cidr >= 16) {
    const block = Math.pow(2, 24 - cidr);
    net[2] = rnd(Math.floor(256 / block)) * block;
    net[3] = 0;
  }
  return net;
}

/* ---------- 題型 ①：是否為網路位址 ---------- */
function genNetQ() {
  const cidr = [24, 25, 26, 27, 28, 29, 30][rnd(7)];
  const net = randPrivateNet(cidr);
  const span = Math.pow(2, 32 - cidr);
  let ipArr, isAns;

  if (rnd(100) < 50) {
    ipArr = [...net];
    isAns = true;
  } else {
    ipArr = [...net];
    isAns = false;
    ipArr[3] = net[3] + 1 + rnd(span - 2);
  }

  const maskStr = fmtOfMask(cidr);
  return {
    q: `❓ 位址 <b>${ipArr.join('.')}</b> 在遮罩 <b>/${cidr} (${maskStr})</b> 下，是否為<b>網路位址 (Network Address)</b>？`,
    type: 'yn',
    answer: isAns,
    explain() {
      const ipI = toInt(ipArr.join('.'));
      const mI = toInt(maskStr);
      const netI = (ipI & mI) >>> 0;
      const bcI = (netI | (~mI >>> 0)) >>> 0;
      return `💡 <b>解析速算：</b><br>` +
        `該子網Block Size = 256 − ${maskStr.split('.')[3]} = <b>${span}</b>。<br>` +
        `所屬網段為 <code>${fmt(netI)}/${cidr}</code>，廣播位址為 <code>${fmt(bcI)}</code>。<br>` +
        (isAns
          ? `該位址剛好等於網路起點 → <b>是網路位址</b>。`
          : ipArr.join('.') === fmt(bcI)
          ? `該位址為 <b>廣播位址 (${fmt(bcI)})</b>，不可指派給主機。`
          : `該位址為 <b>有效主機 IP</b>，非網路位址。`);
    }
  };
}

/* ---------- 題型 ②：求可用主機數 ---------- */
function genHostsQ() {
  const cidr = [22, 23, 24, 25, 26, 27, 28, 29, 30][rnd(9)];
  const total = Math.pow(2, 32 - cidr);
  const correctAns = cidr === 31 ? 2 : total - 2;

  const opts = new Set([correctAns, total, total - 2, cidr === 30 ? 2 : Math.pow(2, 32 - cidr - 1) - 2]);
  while (opts.size < 4) {
    const fake = correctAns + (rnd(11) - 5);
    if (fake > 0) opts.add(fake);
  }
  const arr = [...opts].sort((a, b) => a - b);

  return {
    q: `❓ 子網路 <b>/${cidr}</b> (遮罩 ${fmtOfMask(cidr)}) 最多可提供多少台<b>可用主機 (Usable Hosts)</b>？`,
    type: 'mc',
    options: arr.map(String),
    answer: arr.indexOf(correctAns),
    explain() {
      const hbits = 32 - cidr;
      return `💡 <b>公式秒殺：</b><br>` +
        `主機位元數 (Host bits) = 32 − ${cidr} = <b>${hbits} bits</b>。<br>` +
        `可用主機數 = <code>2^${hbits} − 2</code> = <b>${correctAns.toLocaleString()}</b> 台。<br>` +
        `<span class="dim">口訣：減 2 是扣除 Network ID 與 Broadcast ID。</span>`;
    }
  };
}

/* ---------- 題型 ③：反向 — 給主機數求遮罩 ---------- */
function genMaskQ() { 
  const needPool = [ 
    [1000, '/22'], [500, '/23'], [250, '/24'], [120, '/25'], 
    [60, '/26'], [30, '/27'], [14, '/28'], [6, '/29'], [2, '/30'] 
  ]; 

  const [need, ansCidr] = needPool[rnd(needPool.length)]; 
  const ci = parseInt(ansCidr.slice(1), 10);
  const ansMask = fmtOfMask(ci); 
 
  // 隨機偏移產生干擾項，Set 去重
  const offsets = shuffleArray([-1, 1, -2, 2]); 
  const cidrs = new Set([ci]); 

  for (const off of offsets) { 
    if (cidrs.size < 4) { 
      const c = ci + off; 
      if (c >= 8 && c <= 30) {
        cidrs.add(c); 
      }
    } 
  } 

  while (cidrs.size < 4) {
    cidrs.add(16 + rnd(12)); 
  } 
 
  // 排序（數值大小）後產生選項
  const opts = [...cidrs]
    .sort((a, b) => a - b)
    .map(fmtOfMask); 
 
  return { 
    q: `❓ 某部門規劃需要至少 <b>${need.toLocaleString()} 台</b> 可用主機，應選用哪個<b>子網路遮罩</b>？（選滿足需求的最小遮罩）`, 
    type: 'mc', 
    options: opts, 
    answer: opts.indexOf(ansMask), 

    explain() { 
      const hbits = 32 - ci;
      const usableHosts = Math.pow(2, hbits) - 2;

      return `💡 <b>推算邏輯：</b><br>` +
        `找滿足 <code>2^h − 2 ≥ ${need.toLocaleString()}</code> 的最小整數 h → ` +
        `<b>h = ${hbits} bits</b>（可用 ${usableHosts.toLocaleString()} 台）。<br>` +
        `網路遮罩長度 = 32 − ${hbits} = <b>${ansCidr}</b> (${ansMask})。`; 
    } 
  }; 
}

/* ---------- 題型 ④：判定兩 IP 是否在同一子網 (Same Subnet) ---------- */
function genSameNetQ() {
  const cidr = [25, 26, 27, 28, 29][rnd(5)];
  const net = randPrivateNet(cidr);
  const span = Math.pow(2, 32 - cidr);
  
  const ip1 = [...net];
  ip1[3] = net[3] + 1 + rnd(span - 3);

  let ip2 = [...net];
  let isSame = false;

  if (rnd(100) < 50) {
    isSame = true;
    ip2[3] = net[3] + 1 + rnd(span - 3);
    if (ip2[3] === ip1[3]) ip2[3] = (ip2[3] === net[3] + 1) ? ip2[3] + 1 : ip2[3] - 1;
  } else {
    isSame = false;
    const nextNet = (net[3] + span) % 256;
    ip2[3] = nextNet + 1 + rnd(span - 3);
  }

  const maskStr = fmtOfMask(cidr);
  return {
    q: `❓ 兩台主機 IP 分別為 <b>${ip1.join('.')}</b> 與 <b>${ip2.join('.')}</b>，遮罩皆為 <b>/${cidr} (${maskStr})</b>。<br>兩者是否屬於<b>同一個子網</b>？（能否直接進行 L2 通訊不需經過 Router 轉發？）`,
    type: 'yn',
    answer: isSame,
    explain() {
      const net1 = toInt(ip1.join('.')) & toInt(maskStr);
      const net2 = toInt(ip2.join('.')) & toInt(maskStr);
      return `💡 <b>Block Size速算判斷：</b><br>` +
        `遮罩 /${cidr} Block Size為 <b>${span}</b>。<br>` +
        `IP1 (${ip1.join('.')}) 所屬子網為：<code>${fmt(net1)}/${cidr}</code><br>` +
        `IP2 (${ip2.join('.')}) 所屬子網為：<code>${fmt(net2)}/${cidr}</code><br>` +
        (isSame
          ? `兩者網路位址相同 → <b>在同一子網，可直接進行 L2 交換！</b>`
          : `兩者處於不同子網 → <b>跨網段，必須經由預設閘道 (Router/L3 Switch) 進行轉發！</b>`);
    }
  };
}

/* ---------- 題型 ⑤：路由彙總最佳遮罩 (Route Summarization) ---------- */
function genSummaryQ() {
  const baseA = [192, 172, 10][rnd(3)];
  const baseB = baseA === 192 ? 168 : (baseA === 172 ? 16 : 0);
  const startC = [0, 4, 8, 12, 16, 32, 64][rnd(7)];
  
  const subnets = [
    `${baseA}.${baseB}.${startC}.0/24`,
    `${baseA}.${baseB}.${startC + 1}.0/24`,
    `${baseA}.${baseB}.${startC + 2}.0/24`,
    `${baseA}.${baseB}.${startC + 3}.0/24`
  ];

  const correctSummary = `${baseA}.${baseB}.${startC}.0/22`;
  const distractors = [
    `${baseA}.${baseB}.${startC}.0/21`,
    `${baseA}.${baseB}.${Math.max(0, startC - 4)}.0/22`,
    `${baseA}.${baseB}.0.0/16`
  ];

  const opts = [...new Set([correctSummary, ...distractors])].sort();

  return {
    q: `❓ 路由器欲對以下 4 個連續網段進行<b>路由彙總 (Route Summarization)</b>：<br>` +
       `<code>${subnets.join('、')}</code><br>最佳的彙總路由 (Summary Route) 是？`,
    type: 'mc',
    options: opts,
    answer: opts.indexOf(correctSummary),
    explain() {
      return `💡 <b>彙總速算法：</b><br>` +
        `1. 比對第 3 組八位元：${startC} 到 ${startC + 3} 共涵蓋 <b>4 個 /24 網段</b>。<br>` +
        `2. 4 = 2^2，需向網路位元借 2 位 (前綴縮減 2 位) → <code>24 − 2 = /22</code>。<br>` +
        `3. 起始網段為 <code>${correctSummary}</code>。`;
    }
  };
}

/* ---------- 隨機題目生成與互動渲染 ---------- */
function newQuiz() {
  const gens = {
    net: genNetQ,
    hosts: genHostsQ,
    mask: genMaskQ,
    same: genSameNetQ,
    summary: genSummaryQ
  };

  qData = (gens[qType] || genNetQ)();
  const qEl = document.getElementById('quiz-q');
  const outEl = document.getElementById('quiz-out');
  const btnBox = document.getElementById('quiz-btns');

  if (qEl) qEl.innerHTML = qData.q;
  if (outEl) outEl.style.display = 'none';
  if (btnBox) {
    btnBox.innerHTML = '';
    if (qData.type === 'yn') {
      btnBox.innerHTML = `
        <button class="btn-ans btn-yes" onclick="answerQuiz(true)">✔ 是 (Yes)</button>
        <button class="btn-ans btn-no" onclick="answerQuiz(false)">✘ 不是 (No)</button>
      `;
    } else {
      qData.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.style.marginRight = '8px';
        b.style.marginBottom = '6px';
        b.textContent = opt;
        b.onclick = () => answerQuiz(i);
        btnBox.appendChild(b);
      });
    }
  }
}

function answerQuiz(ans) {
  if (!qData) return;
  const correct = (qData.type === 'yn') ? (ans === qData.answer) : (ans === qData.answer);
  correct ? sOk++ : sNg++;

  document.getElementById('s-ok').textContent = sOk;
  document.getElementById('s-ng').textContent = sNg;
  const tot = sOk + sNg;
  document.getElementById('s-rate').textContent = tot === 0 ? '—' : `${Math.round((sOk / tot) * 100)}%`;

  // 禁用按鈕防止重複點擊
  document.querySelectorAll('#quiz-btns button').forEach(b => b.disabled = true);

  const out = document.getElementById('quiz-out');
  out.style.display = 'block';
  out.innerHTML = `
    ${correct ? '<span class="ok">🎉 答對了！</span>' : '<span class="bad">😢 答錯了～</span>'}<br>
    ${qData.type === 'yn'
      ? `正確答案：${qData.answer ? '<span class="ok">✔ 是 (Yes)</span>' : '<span class="bad">✘ 不是 (No)</span>'}<br>`
      : `正確答案：<b>${qData.options[qData.answer]}</b><br>`}
    ${qData.explain()}
  `;
  qData = null;
}

// 動態更新隨機演練題庫分頁標籤（點擊時自動調用 resetSubnetScore）
const sqTabs = document.getElementById('sq-tabs');
if (sqTabs) {
  sqTabs.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      sqTabs.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      qType = b.dataset.t;
      resetSubnetScore();
      newQuiz();
    };
  });
}

// 初始化執行
document.addEventListener('DOMContentLoaded', () => {
  bindQuizFilterEvents();
  renderQuiz('all');
  renderWB();
  calcSubnet();
  newQuiz();
});