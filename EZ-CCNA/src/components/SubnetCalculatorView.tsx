import React, { useState, useEffect } from 'react';
import {
  calcSubnetData,
  genNetQ,
  genHostsQ,
  genMaskQ,
  genSameNetQ,
  genSummaryQ,
  SubnetQuestionData,
  bin8
} from '../utils/quizUtils';
import { Calculator, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export const SubnetCalculatorView: React.FC = () => {
  // Calculator state
  const [ipInput, setIpInput] = useState<string>('192.168.1.77');
  const [cidrInput, setCidrInput] = useState<number>(24);
  const [calcResult, setCalcResult] = useState<ReturnType<typeof calcSubnetData>>(null);

  // Subnet generator drill state
  const [qType, setQType] = useState<'net' | 'hosts' | 'mask' | 'same' | 'summary'>('net');
  const [currentQ, setCurrentQ] = useState<SubnetQuestionData | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [sOk, setSOk] = useState<number>(0);
  const [sNg, setSNg] = useState<number>(0);

  // Run calculation whenever IP or CIDR changes
  useEffect(() => {
    const res = calcSubnetData(ipInput, cidrInput);
    setCalcResult(res);
  }, [ipInput, cidrInput]);

  // Load new random subnet practice question
  const generateNewQuestion = (type = qType) => {
    const gens = {
      net: genNetQ,
      hosts: genHostsQ,
      mask: genMaskQ,
      same: genSameNetQ,
      summary: genSummaryQ
    };
    const fn = gens[type] || genNetQ;
    setCurrentQ(fn());
    setUserAnswer(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    generateNewQuestion(qType);
  }, [qType]);

  const handleAnswer = (ans: boolean | number) => {
    if (!currentQ || isAnswered) return;
    setUserAnswer(ans);
    setIsAnswered(true);

    const isCorrect = ans === currentQ.answer;
    if (isCorrect) {
      setSOk(prev => prev + 1);
    } else {
      setSNg(prev => prev + 1);
    }
  };

  const handleResetScore = () => {
    setSOk(0);
    setSNg(0);
  };

  const totalDrills = sOk + sNg;
  const drillAccuracy = totalDrills > 0 ? Math.round((sOk / totalDrills) * 100) : 0;

  // Binary rendering helper
  const renderColoredBinary = (binArr: string[], cidr: number) => {
    let bitCount = 0;
    return binArr.map((octet, octIdx) => (
      <React.Fragment key={octIdx}>
        {octIdx > 0 && <span className="text-slate-600 mx-1">.</span>}
        {octet.split('').map((bit, bitIdx) => {
          const isNetBit = bitCount < cidr;
          bitCount++;
          return (
            <span
              key={bitIdx}
              className={`font-mono font-bold ${
                isNetBit ? 'text-sky-400' : 'text-slate-500'
              }`}
            >
              {bit}
            </span>
          );
        })}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Tool 1: IPv4 Subnetting Calculator */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
          <Calculator className="h-4 w-4" />
          <span>CCNA 官方考綱重點：二進位位元對齊與 VLSM 計算</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-4">IPv4 子網計算機 (Subnet Calculator)</h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              IPv4 位址：
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={e => setIpInput(e.target.value)}
              placeholder="例如 192.168.1.77"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              前綴長度 (CIDR)：
            </label>
            <select
              value={cidrInput}
              onChange={e => setCidrInput(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {Array.from({ length: 25 }, (_, i) => i + 8).map(c => (
                <option key={c} value={c}>
                  /{c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {calcResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">網路位址 (Network ID)</span>
                <span className="font-mono text-sm font-bold text-sky-400">
                  {calcResult.netStr}/{calcResult.cidr}
                </span>
                {calcResult.isNet && (
                  <span className="ml-1 text-[11px] text-amber-400">← 當前輸入為網路起點</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">子網路遮罩 (Mask / Wildcard)</span>
                <span className="font-mono text-sm font-bold text-slate-100">
                  {calcResult.maskStr}
                </span>
                <span className="text-slate-500 text-[11px] block">
                  Wildcard: {calcResult.wildStr}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">廣播位址 (Broadcast ID)</span>
                <span className="font-mono text-sm font-bold text-rose-400">
                  {calcResult.bcStr}
                </span>
                {calcResult.isBc && (
                  <span className="ml-1 text-[11px] text-rose-400">← 為廣播位址 (不可配給主機)</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">可用主機範圍 (Usable Range)</span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {calcResult.firstIpStr} ～ {calcResult.lastIpStr}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">可用主機總數 (Usable Hosts)</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {calcResult.usableHosts.toLocaleString()} 台
                </span>
                {calcResult.cidr === 31 && (
                  <span className="text-[11px] text-slate-400 block">
                    (RFC 3021 點對點鏈路，免減 2)
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">IP 屬性與範圍</span>
                <span className="text-xs font-semibold text-amber-300">
                  {calcResult.classification.label}
                </span>
              </div>
            </div>

            {/* Binary Visualization Box */}
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs leading-loose">
              <div className="text-slate-400 mb-2 font-sans font-semibold">
                二進位對齊視覺化（<span className="text-sky-400">藍色</span> = 網路位元 /{' '}
                <span className="text-slate-500">灰色</span> = 主機位元）：
              </div>
              <div className="overflow-x-auto">
                <div>
                  <span className="text-slate-500 inline-block w-14">IP :</span>
                  {renderColoredBinary(calcResult.parts.map(bin8), calcResult.cidr)}
                </div>
                <div>
                  <span className="text-slate-500 inline-block w-14">Mask :</span>
                  {renderColoredBinary(
                    [
                      (calcResult.maskInt >>> 24) & 255,
                      (calcResult.maskInt >>> 16) & 255,
                      (calcResult.maskInt >>> 8) & 255,
                      calcResult.maskInt & 255
                    ].map(bin8),
                    calcResult.cidr
                  )}
                </div>
                <div className="border-t border-slate-800 my-1 pt-1">
                  <span className="text-slate-500 inline-block w-14">Net :</span>
                  {renderColoredBinary(
                    [
                      (calcResult.netInt >>> 24) & 255,
                      (calcResult.netInt >>> 16) & 255,
                      (calcResult.netInt >>> 8) & 255,
                      calcResult.netInt & 255
                    ].map(bin8),
                    calcResult.cidr
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-rose-400">
            請輸入正確的四位元組 IPv4 位址（例如 10.1.2.3 或 172.16.5.10）。
          </div>
        )}
      </div>

      {/* Tool 2: Dynamic Subnetting Practice Engine (5 Question Types) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>CCNA 5 大經典題型動態演練</span>
            </div>
            <h2 className="text-lg font-bold text-white">Subnetting 隨機實戰速算題庫</h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              答對 <b className="text-emerald-400 font-mono">{sOk}</b> / 答錯{' '}
              <b className="text-rose-400 font-mono">{sNg}</b> (正確率：
              <b className="text-sky-400 font-mono">{totalDrills > 0 ? `${drillAccuracy}%` : '—'}</b>)
            </span>
            <button
              onClick={handleResetScore}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="重設答題統計"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Types Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[
            { id: 'net', label: '① 網路位址判定' },
            { id: 'hosts', label: '② 可用主機數' },
            { id: 'mask', label: '③ 需求求遮罩' },
            { id: 'same', label: '④ 同子網判定' },
            { id: 'summary', label: '⑤ 路由彙總' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setQType(t.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                qType === t.id
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Question Area */}
        {currentQ && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="text-sm font-semibold text-slate-200 leading-relaxed mb-4">
              {currentQ.q}
            </div>

            {/* Answer Buttons */}
            {currentQ.type === 'yn' ? (
              <div className="flex gap-3">
                <button
                  disabled={isAnswered}
                  onClick={() => handleAnswer(true)}
                  className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isAnswered && currentQ.answer === true
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                      : isAnswered && userAnswer === true && currentQ.answer !== true
                      ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                      : 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  ✔ 是 (Yes，為網路位址 / 同一子網)
                </button>

                <button
                  disabled={isAnswered}
                  onClick={() => handleAnswer(false)}
                  className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isAnswered && currentQ.answer === false
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                      : isAnswered && userAnswer === false && currentQ.answer !== false
                      ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                      : 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  ✘ 不是 (No)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options?.map((opt, optIdx) => {
                  let optStyle = 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-850';
                  if (isAnswered) {
                    if (optIdx === currentQ.answer) {
                      optStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                    } else if (userAnswer === optIdx) {
                      optStyle = 'border-rose-500 bg-rose-500/20 text-rose-200';
                    } else {
                      optStyle = 'border-slate-800 bg-slate-950 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(optIdx)}
                      className={`p-3 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${optStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback & Explanation */}
            {isAnswered && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {userAnswer === currentQ.answer ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> 🎉 答對了！秒殺成功！
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> 😢 答錯了，請記住速算法門！
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => generateNewQuestion(qType)}
                    className="px-3 py-1 rounded bg-sky-600 text-xs font-semibold text-white hover:bg-sky-500 transition-colors cursor-pointer"
                  >
                    下一題隨機演練 ➔
                  </button>
                </div>

                <div
                  className="rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-300"
                  dangerouslySetInnerHTML={{ __html: currentQ.explain }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
