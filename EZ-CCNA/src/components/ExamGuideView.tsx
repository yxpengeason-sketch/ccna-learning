import React from 'react';
import { Award, Clock, Terminal, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ExamGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 48 Hours Strategy Banner */}
      <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900/80 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1.5">
              考前 48 小時黃金策略：不做全新題，聚焦三大核心
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="block">
                1. <b>重跑錯題本 Lab</b>：針對 OSPF、VLAN Trunk、ACL、NAT 等配置盲點重敲指令，建立肌肉記憶。
              </span>
              <span className="block">
                2. <b>高頻翻卡快篩</b>：快速過濾模組重點卡片，鎖定協定埠號、Timer 與 AD 值，以及WLAN相關題型。
              </span>
              <span className="block">
                3. <b>考場證件確認</b>：Pearson VUE 考場嚴格要求<b>雙證件</b>（主要證件：效期內護照或身分證；次要證件：健保卡/駕照/信用卡，需含英文姓名拼音或本人簽名）。
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 Tactics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <div className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-2">
            <Clock className="h-4 w-4" />
            <span>⏱️ 考場配速原則</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            CCNA 正式考試<b>沒有「Previous」返回按鈕</b>，一旦提交即無法修改：
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
            <li>單選/多選題：控制在 <b>≤ 50~60 秒/題</b>。</li>
            <li>實機題（Labs）：預留 <b>6~8 分鐘/題</b>。</li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-2">
            <Terminal className="h-4 w-4" />
            <span>🧪 實作答題 SOP</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            進入實機題畫面請嚴格遵循四步排查流程：
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
            <li><b>① 摸底</b>：先下 <code>show run</code> 與 <code>show ip int br</code>。</li>
            <li><b>② 防呆</b>：確認介面 <code>no shut</code> 與 VLAN 已建立。</li>
            <li><b>③ 配置</b>：鍵入目標指令。</li>
            <li><b>④ 雙向 Ping</b>：端對端確認連通。</li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-2">
            <Save className="h-4 w-4" />
            <span>💾 實作題存檔步驟</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            部分題型未保存組態將無法被閱卷系統正確抓取狀態：
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
            <li>每完成一台設備配置，在特權模式（#）執行：</li>
            <li className="font-mono text-amber-300">copy run start 或 wr </li>
            <li>交卷前再次確認所有裝置皆已完成存檔。</li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>🧐 多選題避坑訣竅</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            考古題庫中多選題（Choose 2 / 3）佔比約 15%~20%：
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
            <li><b>動詞對應</b>：注意 Configure、Verify 還是 Describe。</li>
            <li><b>絕對詞陷阱</b>：出現 Always、Never 提高警覺。</li>
            <li><b>協定層級</b>：確認是 L2、L3 還是 L4。</li>
          </ul>
        </div>
      </div>

      {/* 6 Domains Verification Matrix Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          <span>CCNA 200-301 官方 6 大領域自我驗收矩陣</span>
        </h3>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-semibold">
                <th className="py-3 px-4 w-1/4">考綱領域與官方權重</th>
                <th className="py-3 px-4 w-1/2">核心必備考點與秒殺觀念</th>
                <th className="py-3 px-4 w-1/4">關鍵驗證指令 (Verify CLI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 leading-relaxed">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100">1. Network Fundamentals</div>
                  <span className="text-[11px] font-mono text-sky-400">權重 20%</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div>• IPv4 VLSM Block Size 速算（含 /31 點對點與 /32 主機）</div>
                  <div>• IPv6 縮寫規範（RFC 5952）、分類（Global 2000::/3, Link-Local fe80::/10）</div>
                  <div>• TCP 三向交握、常見 Port 埠號、單模 (SMF) vs 多模 (MMF) 光纖</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 space-y-1">
                  <div>show version</div>
                  <div>show interfaces [status]</div>
                  <div>show ipv6 interface brief</div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100">2. Network Access</div>
                  <span className="text-[11px] font-mono text-sky-400">權重 20%</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div>• 802.1Q Trunk 封裝、Native VLAN 不打標與安全隔離</div>
                  <div>• Rapid PVST+ 根橋選舉（最低 Priority &gt; 最低 MAC）、PortFast/BPDU Guard</div>
                  <div>• EtherChannel 模式匹配（LACP active/passive vs PAgP desirable/auto）</div>
                  <div>• WLC 與 AP 架構（Split-MAC、CAPWAP、WPA3-SAE Dragonfly 握手）</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 space-y-1">
                  <div>show vlan brief</div>
                  <div>show interfaces trunk</div>
                  <div>show spanning-tree vlan X</div>
                  <div>show etherchannel summary</div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100">3. IP Connectivity</div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">權重 25% (核心)</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div>• 路由仲裁黃金律：<b>① 最長前綴匹配 (LPM) &gt; ② AD 值 &gt; ③ Metric</b></div>
                  <div>• 靜態路由（下一跳 IP vs 出介面）、浮動靜態路由備援設計</div>
                  <div>• Single-Area OSPFv2/v3 鄰居 7 大必要條件、DR/BDR 選舉（非搶佔性）、Cost 計算</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 space-y-1">
                  <div>show ip route [prefix]</div>
                  <div>show ip ospf neighbor</div>
                  <div>show ip ospf interface brief</div>
                  <div>show standby brief</div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100">4. IP Services</div>
                  <span className="text-[11px] font-mono text-sky-400">權重 10%</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div>• NAT/PAT 轉換邏輯（overload 關鍵字、Inside Local vs Inside Global）</div>
                  <div>• DHCP DORA 四步驟、跨網段 ip helper-address（轉單播至 UDP 67）</div>
                  <div>• NTP Stratum 階層、Syslog 嚴重度等級（0 Emergency ~ 7 Debugging）、QoS CoS (L2) vs DSCP (L3)</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 space-y-1">
                  <div>show ip nat translations</div>
                  <div>show ip dhcp binding</div>
                  <div>show ntp status</div>
                  <div>show logging</div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100">5. Security Fundamentals</div>
                  <span className="text-[11px] font-mono text-sky-400">權重 15%</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div>• Layer 2 防禦四件套：Port Security（Protect/Restrict/Shutdown）、DHCP Snooping、DAI、IPSG</div>
                  <div>• ACL 匹配規則（Top-Down 逐條比對、末端隱含 Deny Any、Standard 靠目的 vs Extended 靠來源）</div>
                  <div>• AAA 架構（TACACS+ TCP 49 全加密 vs RADIUS UDP 1812 密碼加密）、SSH 安全登入配置</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 space-y-1">
                  <div>show port-security interface</div>
                  <div>show ip dhcp snooping binding</div>
                  <div>show ip arp inspection</div>
                  <div>show access-lists</div>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-100">6. Automation &amp; Programmability</div>
                  <span className="text-[11px] font-mono text-sky-400">權重 10%</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div>• Controller-Based SDN 架構（Catalyst Center / DNA-C）、三平面職責（Control vs Data vs Management）</div>
                  <div>• 北向 API（REST/JSON）vs 南向 API（NETCONF XML/SSH 830, RESTCONF HTTPS 443）</div>
                  <div>• REST API CRUD 動詞映射與 HTTP 狀態碼（200 OK, 201 Created, 401 Unauthorized, 404 Not Found）</div>
                  <div>• 自動化組態工具定位（Ansible: Agentless/Push/YAML vs Terraform: IaC/HCL）</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 space-y-1">
                  <div>curl / Postman API 呼叫</div>
                  <div>JSON / YAML 語法格式校驗</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center py-6 text-base font-extrabold text-sky-400 tracking-wider">
          🏆 預祝高分一次通過 CCNA 200-301！ 💪
        </div>
      </div>
    </div>
  );
};
