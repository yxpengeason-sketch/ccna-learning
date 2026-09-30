import { Question, RuntimeQuestion, ExamConfig, WrongBookStore } from '../types';
import { CCNA_TAXONOMY, MODULE_META } from '../data/ccnaData';

/**
 * 標準 Fisher-Yates (Knuth) 無偏隨機洗牌演算法
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function isMultiSelect(item: Question | RuntimeQuestion): boolean {
  return Array.isArray(item.a);
}

export function getOptionLetter(idx: number): string {
  return String.fromCharCode(65 + idx);
}

export function formatOptionsText(item: { o: string[] }, target: number | number[]): string {
  if (Array.isArray(target)) {
    return target
      .slice()
      .sort((a, b) => a - b)
      .map(idx => `[${getOptionLetter(idx)}] ${item.o[idx] ?? ''}`)
      .join('；');
  }
  return `[${getOptionLetter(target)}] ${item.o[target] ?? ''}`;
}

export function getQuestionKey(item: { m: number; q: string }): string {
  return `Q_${item.m}_${item.q.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').slice(0, 32)}`;
}

/**
 * 加權考點概念識別引擎
 */
export function detectConcept(
  qInput: string | { q?: string; e?: string; m?: number },
  mIndex?: number
): string {
  let text = '';
  let targetM = typeof mIndex === 'number' ? mIndex : -1;

  if (typeof qInput === 'object' && qInput !== null) {
    text = (qInput.q || '') + ' ' + (qInput.e || '');
    if (typeof qInput.m === 'number') targetM = qInput.m;
  } else {
    text = String(qInput || '');
  }

  let bestConcept = '';
  let maxScore = -1;

  for (const item of CCNA_TAXONOMY) {
    let score = 0;

    if (targetM >= 0 && item.m === targetM) {
      score += 4;
    }

    for (const [token, weight] of item.tokens) {
      const w = weight as number;
      const t = token as string;
      if (text.toLowerCase().includes(t.toLowerCase())) {
        score += w;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestConcept = item.name;
    }
  }

  if (maxScore <= 0 || !bestConcept) {
    const fallbackMap: Record<number, string> = {
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

/**
 * 題目與選項雙層隨機化映射處理
 */
export function prepareRuntimeQuestion(rawItem: Question): RuntimeQuestion {
  const isMulti = isMultiSelect(rawItem);
  const numOptions = rawItem.o.length;

  const optIndices = Array.from({ length: numOptions }, (_, idx) => idx);
  const shuffledIndices = shuffleArray(optIndices);
  const shuffledOptions = shuffledIndices.map(idx => rawItem.o[idx]);

  let remappedAnswer: number | number[];
  if (isMulti) {
    remappedAnswer = (rawItem.a as number[])
      .map(origIdx => shuffledIndices.indexOf(origIdx))
      .sort((a, b) => a - b);
  } else {
    remappedAnswer = shuffledIndices.indexOf(rawItem.a as number);
  }

  return {
    raw: rawItem,
    m: rawItem.m,
    q: rawItem.q,
    e: rawItem.e,
    o: shuffledOptions,
    a: remappedAnswer,
    isMulti,
    requiredCount: isMulti ? (remappedAnswer as number[]).length : 1
  };
}

/**
 * 隨機抽題考試核心演算法 (Random Exam Draw Engine)
 * 支援：官方考綱配比加權抽題、全題庫隨機抽題、單元專項抽題、弱點衝刺抽題
 */
export function drawRandomExam(
  allQuestions: Question[],
  config: ExamConfig,
  wrongbook: WrongBookStore
): RuntimeQuestion[] {
  let selectedPool: Question[] = [];
  const targetCount = Math.min(config.questionCount, allQuestions.length);

  if (config.strategy === 'module' && typeof config.selectedModule === 'number') {
    // 1. 指定單元模組抽題
    const modulePool = allQuestions.filter(q => q.m === config.selectedModule);
    const shuffled = shuffleArray(modulePool);
    selectedPool = shuffled.slice(0, Math.min(targetCount, shuffled.length));
  } else if (config.strategy === 'weakness') {
    // 2. 弱點與未克服錯題優先抽題
    const unresolvedKeys = new Set(
      Object.entries(wrongbook)
        .filter(([, v]) => !v.resolved)
        .map(([k]) => k)
    );

    const wrongList = allQuestions.filter(q => unresolvedKeys.has(getQuestionKey(q)));
    const otherList = allQuestions.filter(q => !unresolvedKeys.has(getQuestionKey(q)));

    const shuffledWrong = shuffleArray(wrongList);
    const shuffledOthers = shuffleArray(otherList);

    selectedPool = [...shuffledWrong, ...shuffledOthers].slice(0, targetCount);
  } else if (config.strategy === 'weighted') {
    // 3. CCNA 官方考綱權重加權抽題 (20%, 20%, 25%, 10%, 15%, 10%)
    const moduleBuckets: Record<number, Question[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
    allQuestions.forEach(q => {
      if (moduleBuckets[q.m]) {
        moduleBuckets[q.m].push(q);
      }
    });

    const weights = MODULE_META.map(m => m.weight); // [20, 20, 25, 10, 15, 10]
    const chosen: Question[] = [];
    const chosenKeys = new Set<string>();

    // 初步按比例分配名額
    MODULE_META.forEach(meta => {
      const mIdx = meta.id;
      const bucket = shuffleArray(moduleBuckets[mIdx] || []);
      // 保證至少 1 題（若目標題數大於等於模組數）
      const quota = Math.max(1, Math.round((meta.weight / 100) * targetCount));
      const take = bucket.slice(0, Math.min(quota, bucket.length));
      take.forEach(item => {
        if (!chosenKeys.has(getQuestionKey(item))) {
          chosen.push(item);
          chosenKeys.add(getQuestionKey(item));
        }
      });
    });

    // 若不足 targetCount，從全體剩餘題目隨機補充
    if (chosen.length < targetCount) {
      const remaining = allQuestions.filter(q => !chosenKeys.has(getQuestionKey(q)));
      const extra = shuffleArray(remaining).slice(0, targetCount - chosen.length);
      chosen.push(...extra);
    } else if (chosen.length > targetCount) {
      // 若因四捨五入超出 targetCount，隨機修剪
      selectedPool = shuffleArray(chosen).slice(0, targetCount);
    } else {
      selectedPool = chosen;
    }
  } else {
    // 4. 全題庫無偏均勻隨機抽題
    selectedPool = shuffleArray(allQuestions).slice(0, targetCount);
  }

  // 雙層洗牌：打散題目出題順序 + 每題選項隨機重排映射
  const finalShuffled = shuffleArray(selectedPool);
  return finalShuffled.map(prepareRuntimeQuestion);
}

/* ================= 錯題本 LocalStorage 工具 ================= */
const WB_KEY = 'ccna-wrongbook';

export function loadWB(): WrongBookStore {
  try {
    const raw = localStorage.getItem(WB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('LocalStorage 讀取失敗', e);
    return {};
  }
}

export function saveWB(wb: WrongBookStore): void {
  try {
    localStorage.setItem(WB_KEY, JSON.stringify(wb));
  } catch (e) {
    console.warn('LocalStorage 儲存失敗', e);
  }
}

export function getUnresolvedWrongQuizList(allQuestions: Question[]): Question[] {
  const wb = loadWB();
  const unresolvedKeys = new Set(
    Object.entries(wb)
      .filter(([, v]) => !v.resolved)
      .map(([k]) => k)
  );
  if (!unresolvedKeys.size) return [];
  return allQuestions.filter(item => unresolvedKeys.has(getQuestionKey(item)));
}

export function recordWrong(runtimeItem: RuntimeQuestion, userPick: number | number[]): void {
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
}

export function resolveWrong(rawItem: Question | RuntimeQuestion): void {
  const wb = loadWB();
  const key = getQuestionKey(rawItem);
  if (wb[key]) {
    wb[key].resolved = true;
    saveWB(wb);
  }
}

export function clearWrongBookStorage(): void {
  saveWB({});
}

/* ================= IPv4 子網計算與隨機題庫工具 ================= */
export const fmt = (n: number) =>
  [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

export const toInt = (s: string) => {
  const p = s.trim().split('.').map(Number);
  return (((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
};

export const rnd = (n: number) => Math.floor(Math.random() * n);
export const bin8 = (x: number) => (x >>> 0).toString(2).padStart(8, '0');

export function classify(n: number) {
  const a = (n >>> 24) & 255;
  const b = (n >>> 16) & 255;
  if (a === 10) return { label: 'RFC 1918 私有位址 (Class A: 10.0.0.0/8)', type: 'private' };
  if (a === 172 && b >= 16 && b <= 31) return { label: 'RFC 1918 私有位址 (Class B: 172.16.0.0/12)', type: 'private' };
  if (a === 192 && b === 168) return { label: 'RFC 1918 私有位址 (Class C: 192.168.0.0/16)', type: 'private' };
  if (a === 127) return { label: 'Loopback 本地回環 (127.0.0.0/8)', type: 'loopback' };
  if (a === 169 && b === 254) return { label: 'APIPA 自動私用位址 (169.254.0.0/16)', type: 'apipa' };
  if (a === 100 && b >= 64 && b <= 127) return { label: 'CGNAT 電信級 NAT (100.64.0.0/10)', type: 'cgnat' };
  if (a >= 224 && a <= 239) return { label: 'Multicast 多播群播 (Class D: 224.0.0.0/4)', type: 'multicast' };
  if (a >= 240) return { label: '保留實驗位址 (Class E: 240.0.0.0/4)', type: 'reserved' };
  return { label: 'Internet 公有位址 (Public IPv4)', type: 'public' };
}

export function calcSubnetData(rawIp: string, cidr: number) {
  const parts = rawIp.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return null;
  }

  const ipInt = (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
  const maskInt = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
  const wildInt = (~maskInt) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const bcInt = (netInt | wildInt) >>> 0;

  const totalIps = Math.pow(2, 32 - cidr);
  let usableHosts: number;
  let firstIpInt: number;
  let lastIpInt: number;

  if (cidr === 32) {
    usableHosts = 1;
    firstIpInt = lastIpInt = netInt;
  } else if (cidr === 31) {
    usableHosts = 2;
    firstIpInt = netInt;
    lastIpInt = bcInt;
  } else {
    usableHosts = Math.max(0, totalIps - 2);
    firstIpInt = netInt + 1;
    lastIpInt = bcInt - 1;
  }

  const magicNum = cidr >= 24 ? Math.pow(2, 32 - cidr) : cidr >= 16 ? Math.pow(2, 24 - cidr) : Math.pow(2, 16 - cidr);

  return {
    ip: rawIp,
    cidr,
    ipInt,
    maskInt,
    wildInt,
    netInt,
    bcInt,
    netStr: fmt(netInt),
    maskStr: fmt(maskInt),
    wildStr: fmt(wildInt),
    bcStr: fmt(bcInt),
    firstIpStr: fmt(firstIpInt),
    lastIpStr: fmt(lastIpInt),
    usableHosts,
    magicNum,
    classification: classify(ipInt),
    isNet: ipInt === netInt && cidr < 31,
    isBc: ipInt === bcInt && cidr < 31,
    parts
  };
}

export function fmtOfMask(c: number): string {
  const m = c === 0 ? 0 : ((0xFFFFFFFF << (32 - c)) >>> 0);
  return fmt(m);
}

export function randPrivateNet(cidr: number): number[] {
  const base = [192, 172, 10][rnd(3)];
  const net = [
    base,
    base === 192 ? 168 : base === 172 ? 16 + rnd(16) : rnd(256),
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

export interface SubnetQuestionData {
  q: string;
  type: 'yn' | 'mc';
  options?: string[];
  answer: boolean | number;
  explain: string;
}

export function genNetQ(): SubnetQuestionData {
  const cidr = [24, 25, 26, 27, 28, 29, 30][rnd(7)];
  const net = randPrivateNet(cidr);
  const span = Math.pow(2, 32 - cidr);
  let ipArr: number[];
  let isAns: boolean;

  if (rnd(100) < 50) {
    ipArr = [...net];
    isAns = true;
  } else {
    ipArr = [...net];
    isAns = false;
    ipArr[3] = net[3] + 1 + rnd(span - 2);
  }

  const maskStr = fmtOfMask(cidr);
  const ipI = toInt(ipArr.join('.'));
  const mI = toInt(maskStr);
  const netI = (ipI & mI) >>> 0;
  const bcI = (netI | (~mI >>> 0)) >>> 0;

  return {
    q: `位址 ${ipArr.join('.')} 在遮罩 /${cidr} (${maskStr}) 下，是否為網路位址 (Network Address)？`,
    type: 'yn',
    answer: isAns,
    explain:
      `該子網 Block Size = 256 − ${maskStr.split('.')[3]} = ${span}。<br>` +
      `所屬網段為 <code>${fmt(netI)}/${cidr}</code>，廣播位址為 <code>${fmt(bcI)}</code>。<br>` +
      (isAns
        ? `該位址剛好等於網路起點 → <b>是網路位址</b>。`
        : ipArr.join('.') === fmt(bcI)
        ? `該位址為 <b>廣播位址 (${fmt(bcI)})</b>，不可指派給主機。`
        : `該位址為 <b>有效主機 IP</b>，非網路位址。`)
  };
}

export function genHostsQ(): SubnetQuestionData {
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
    q: `子網路 /${cidr} (遮罩 ${fmtOfMask(cidr)}) 最多可提供多少台可用主機 (Usable Hosts)？`,
    type: 'mc',
    options: arr.map(String),
    answer: arr.indexOf(correctAns),
    explain:
      `主機位元數 (Host bits) = 32 − ${cidr} = ${32 - cidr} bits。<br>` +
      `可用主機數 = <code>2^${32 - cidr} − 2</code> = <b>${correctAns.toLocaleString()}</b> 台。<br>` +
      `<span class="text-slate-400">口訣：減 2 是扣除 Network ID 與 Broadcast ID。</span>`
  };
}

export function genMaskQ(): SubnetQuestionData {
  const needPool: [number, string][] = [
    [1000, '/22'],
    [500, '/23'],
    [250, '/24'],
    [120, '/25'],
    [60, '/26'],
    [30, '/27'],
    [14, '/28'],
    [6, '/29'],
    [2, '/30']
  ];

  const [need, ansCidr] = needPool[rnd(needPool.length)];
  const ci = parseInt(ansCidr.slice(1), 10);
  const ansMask = fmtOfMask(ci);

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

  const opts = [...cidrs].sort((a, b) => a - b).map(fmtOfMask);
  const hbits = 32 - ci;
  const usableHosts = Math.pow(2, hbits) - 2;

  return {
    q: `某部門規劃需要至少 ${need.toLocaleString()} 台可用主機，應選用哪個子網路遮罩？（選滿足需求的最小遮罩）`,
    type: 'mc',
    options: opts,
    answer: opts.indexOf(ansMask),
    explain:
      `找滿足 <code>2^h − 2 ≥ ${need.toLocaleString()}</code> 的最小整數 h → ` +
      `<b>h = ${hbits} bits</b>（可用 ${usableHosts.toLocaleString()} 台）。<br>` +
      `網路遮罩長度 = 32 − ${hbits} = <b>${ansCidr}</b> (${ansMask})。`
  };
}

export function genSameNetQ(): SubnetQuestionData {
  const cidr = [25, 26, 27, 28, 29][rnd(5)];
  const net = randPrivateNet(cidr);
  const span = Math.pow(2, 32 - cidr);

  const ip1 = [...net];
  ip1[3] = net[3] + 1 + rnd(span - 3);

  const ip2 = [...net];
  let isSame = false;

  if (rnd(100) < 50) {
    isSame = true;
    ip2[3] = net[3] + 1 + rnd(span - 3);
    if (ip2[3] === ip1[3]) ip2[3] = ip2[3] === net[3] + 1 ? ip2[3] + 1 : ip2[3] - 1;
  } else {
    isSame = false;
    const nextNet = (net[3] + span) % 256;
    ip2[3] = nextNet + 1 + rnd(span - 3);
  }

  const maskStr = fmtOfMask(cidr);
  const net1 = toInt(ip1.join('.')) & toInt(maskStr);
  const net2 = toInt(ip2.join('.')) & toInt(maskStr);

  return {
    q: `兩台主機 IP 分別為 ${ip1.join('.')} 與 ${ip2.join('.')}，遮罩皆為 /${cidr} (${maskStr})。兩者是否屬於同一個子網？（能否直接進行 L2 通訊不需經過 Router 轉發？）`,
    type: 'yn',
    answer: isSame,
    explain:
      `遮罩 /${cidr} Block Size 為 <b>${span}</b>。<br>` +
      `IP1 (${ip1.join('.')}) 所屬子網為：<code>${fmt(net1)}/${cidr}</code><br>` +
      `IP2 (${ip2.join('.')}) 所屬子網為：<code>${fmt(net2)}/${cidr}</code><br>` +
      (isSame
        ? `兩者網路位址相同 → <b>在同一子網，可直接進行 L2 交換！</b>`
        : `兩者處於不同子網 → <b>跨網段，必須經由預設閘道 (Router/L3 Switch) 進行轉發！</b>`)
  };
}

export function genSummaryQ(): SubnetQuestionData {
  const baseA = [192, 172, 10][rnd(3)];
  const baseB = baseA === 192 ? 168 : baseA === 172 ? 16 : 0;
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
    q: `路由器欲對以下 4 個連續網段進行路由彙總 (Route Summarization)：${subnets.join('、')}。最佳的彙總路由 (Summary Route) 是？`,
    type: 'mc',
    options: opts,
    answer: opts.indexOf(correctSummary),
    explain:
      `1. 比對第 3 組八位元：${startC} 到 ${startC + 3} 共涵蓋 4 個 /24 網段。<br>` +
      `2. 4 = 2^2，需向網路位元借 2 位 (前綴縮減 2 位) → <code>24 − 2 = /22</code>。<br>` +
      `3. 起始網段為 <code>${correctSummary}</code>。`
  };
}
