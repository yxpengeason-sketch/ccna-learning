/* ================= 陷阱避坑（CCNA 200-301 官方 6 大領域結構化資料・CCSI 審核完整版 v2） ================= */
const pitModules = [
  ['Network Fundamentals', [

    ['Subnetting / Wildcard Mask 計算反轉錯誤',
     '把 Subnet Mask 直接當作反遮罩，例如將 <code>/27 (255.255.255.224)</code> 寫成 <code>0.0.0.224</code>。',
     '標準計算公式為 <code>255.255.255.255 − Subnet Mask</code>。<br><code>/27 (255.255.255.224)</code> ➡️ 塊長為 32 (256−224)，反遮罩最後一組八位元即為 <code>32 − 1 = 31</code>，故為 <code>0.0.0.31</code>。',
     '反遮罩算式全用 255 減；塊長減一即是末位元'],

    ['可用 IP 數量與網段/廣播位址混淆',
     '將網路位址 (Network ID) 或廣播位址 (Broadcast ID) 當作可指派給主機的可用 IP；考試忽略 <code>/31</code> 點對點特例。',
     '一般子網路可用主機數公式為 <code>2^h − 2</code>（扣除網路與廣播）；<br>唯獨 <b>RFC 3021 點對點鏈路 <code>/31</code></b> 具備 2 個可用位址且無廣播概念；<code>/32</code> 為單一主機位址（常用於 Loopback 介面）。',
     '一般網段減二可用，/31 點對點無廣播免減'],

    ['TCP vs UDP 可靠性與三次交握機制混淆',
     '誤以為 UDP 也會進行三次交握建立連線，或認為 TCP「有連線」就代表資料一定不會遺失。',
     '• <b>TCP</b>：連線導向，<b>三方交握手 (SYN → SYN/ACK → ACK)</b> 建立連線、四次揮手拆除；提供確認重傳 (ACK)、排序、流量控制 (Window)。<br>• <b>UDP</b>：無連線、無交握、不保證送達，開銷低延遲小，適合 DNS 查詢、VoIP、串流。<br>常見埠對照：HTTP 80 / HTTPS 443 / SSH 22 / Telnet 23 / SMTP 25 走 TCP；DNS 53、DHCP 67-68、SNMP 161、TFTP 69 走 UDP。',
     'TCP 三次握手可靠重傳，UDP 不握手快而不保證'],

    ['OSI 七層 vs TCP/IP 四層封裝與 PDU 對應錯誤',
     '將 PDU 名稱與層級配錯，例如把 Segment 稱為第三層的 PDU，或把 Frame 誤當成第四層單元。',
     'OSI 由下而上：① Physical（Bits 位元）➡️ ② Data Link（Frame 訊框）➡️ ③ Network（Packet 封包）➡️ ④ Transport（Segment 區段）➡️ ⑤ Session / ⑥ Presentation / ⑦ Application（Data）。<br>TCP/IP 四層：Network Access（合併 OSI 1-2）、Internet（OSI 3）、Transport（OSI 4）、Application（OSI 5-7 合併）。<br>封裝方向由上往下加 Header，解封裝反之。',
     '一二三四層依序是 Bit、Frame、Packet、Segment'],

    ['IPv6 位址縮寫與壓縮規則錯誤',
     '在同一 IPv6 位址中連續使用兩次 <code>::</code> 壓縮符號，或將組內的「尾隨零」誤刪。',
     'RFC 5952 規範：<code>::</code> 在一個位址中<b>僅限出現一次</b>；每組 16-bit 只能刪除「前導零 (Leading zeros)」，絕不可刪除尾隨零（如 <code>0040</code> 只能縮為 <code>40</code>，縮為 <code>4</code> 則數值改變）。',
     '雙冒號唯一縮一次，只刪前導不刪尾'],

    ['IPv6 特殊位址類型與 EUI-64 生成規則混淆',
     '搞錯各類 IPv6 位址前綴用途，或以為 EUI-64 是直接複製 MAC 位址當 Interface ID。',
     '• <b>FE80::/10</b> Link-Local：鏈路本地自動生成，不可路由跨段。<br>• <b>FC00::/7 (FD00::/8)</b> Unique Local：私有內部使用（近似 IPv4 私網）。<br>• <b>FF00::/8</b> Multicast：組播（IPv6 無廣播）。<br><b>EUI-64 規則</b>：48-bit MAC 中間插入 <code>FF:FE</code> 變 64-bit，並將第 7 個 bit（U/L bit）<b>翻轉</b>。例如 MAC 開頭 <code>00:</code> 翻轉後變 <code>02:</code>。',
     'EUI-64 插 FFFE 再翻第七位元，Link-Local FE80 打底'],

    ['銅纜與光纖選型及連接器規格混淆',
     '在長距離骨幹場景誤選 UTP 雙絞線，或搞混 Single-mode 與 Multi-mode 光纖適用的收發器。',
     '• <b>UTP Cat5e/6</b>：100 公尺上限（90m 水平布線 + 10m 跳線），RJ45 接頭。<br>• <b>Single-mode Fiber (SMF)</b>：核心細（~9μm），黃色外皮，搭配 Laser 光源，適合<b>長距離（數十公里）</b>，常用 LC 接頭。<br>• <b>Multi-mode Fiber (MMF)</b>：核心粗（50/62.5μm），橘色外皮，LED/VCSEL 光源，適合<b>短距離（≤550m）大樓內部</b>。',
     'UTP 百米封頂，SMF 黃皮跑長距離、MMF 橘皮短程樓內'],

    ['SLAAC 位址分配與 DHCPv6 運作機制混淆',
     '誤以為 SLAAC（無狀態位址自動配置）是由 DHCPv6 Server 提供 IP 位址與預設閘道。',
     'SLAAC 依賴路由器發送的 <b>RA (Router Advertisement)</b> 訊息取得 <code>/64</code> 網路前綴，主機透過 EUI-64 或隨機演算法自組 Interface ID；預設閘道一律指向路由器的 Link-Local 位址 (<code>FE80::/10</code>)。<br>Stateless DHCPv6 僅補充 DNS 資訊 (M=0, O=1)；Stateful DHCPv6 全權分配 IP (M=1)，此時 O 旗標被忽略。',
     'RA 廣播給前綴自己組，DHCPv6 補 DNS 或全包'],

    ['無線射頻頻段特性與重疊頻道誤判',
     '誤以為 5 GHz 的穿透力比 2.4 GHz 強，或不知 2.4 GHz 只有哪三個頻道互不重疊。',
     '• <b>2.4 GHz</b>：波長較長 ➡️ 穿牆強、覆蓋廣，但速率低且易受微波爐／藍牙干擾；僅 <b>Channel 1、6、11</b> 三個互不重疊頻道。<br>• <b>5 GHz</b>：頻道多、干擾少、速率高，但衰減快、穿透弱。<br>相鄰 AP 必須部署在不重疊頻道上，避免 Co-Channel / Adjacent-Channel 干擾。',
     '2.4G 穿牆強只剩 1/6/11，5G 快而短命'],

    ['路由仲裁順序（LPM vs AD vs Metric）混淆',
     '誤以為 Administrative Distance (AD) 越低的路由永遠優先轉發，或 Metric 小就必然勝出。',
     '路由查表三部曲順序絕對不可顛倒：<br>① <b>最長前綴匹配 (Longest Prefix Match, LPM)</b> ➡️ 遮罩最長最優先。<br>② <b>管理距離 (AD)</b> ➡️ 僅在前綴長度完全相同時比較路由來源可信度。<br>③ <b>度量值 (Metric)</b> ➡️ 前綴與 AD 皆相同時比較開銷值。<br>例如 <code>10.1.1.0/24</code> OSPF (AD 110) 必然勝過 <code>10.1.0.0/16</code> Static (AD 1)。',
     '最長前綴排第一、前綴相同比 AD、AD 相同比 Metric']
  ]],

  ['Network Access', [

    ['Port Security 違規模式行為差異 (Violation Modes)',
     '誤以為三種違規模式都會將連接埠關閉 (Shutdown)，或認為 Protect 模式會產生日誌。',
     '三種模式行為完全不同：<br>• <code>protect</code>：靜默丟棄違規封包，不累加違規計數、不發送 Syslog/SNMP。<br>• <code>restrict</code>：丟棄違規封包，<b>主動累加計數器並發送 Syslog/SNMP 告警</b>，埠維持 Up。<br>• <code>shutdown</code>（預設）：將介面置入 <code>err-disabled</code> 狀態並關閉。<br>🔄 恢復方式：手動 <code>shutdown</code> ➡️ <code>no shutdown</code> 或配置 <code>errdisable recovery cause psecure-violation</code>。',
     'protect 靜默丟包、restrict 記帳發告警、shutdown 斷電鎖埠'],

    ['Port Security Sticky MAC 儲存本質誤解',
     '以為 Sticky MAC（黏性學習）在重開機後會自動保留於設備中。',
     'Sticky 模式是將動態學習到的 MAC 自動寫入 <b><code>running-config</code></b>（RAM 中）；若未執行 <code>copy running-config startup-config</code>，設備重啟後設定完全遺失。',
     'Sticky 存進 run-config，必須手動存檔才防斷電'],

    ['EtherChannel 協商模式不匹配導致無法綑綁',
     '使用 PAgP 的 <code>desirable</code> 與 LACP 的 <code>active</code> 對接，或兩端皆配置 <code>auto</code> / <code>passive</code>。',
     '跨協定完全不通！匹配矩陣如下：<br>• LACP：<code>active ↔ active/passive</code>（不可雙 passive）。<br>• PAgP：<code>desirable ↔ desirable/auto</code>（不可雙 auto）。<br>• Static (On)：<code>on ↔ on</code>（不發送任何協商封包）。<br>驗證 <code>show etherchannel summary</code> 標記速查：<br>• <code>(P)</code> = Bundled 正常綑綁<br>• <code>(s)</code> = Suspended（VLAN/速率/雙工/Trunk 模式不相容）<br>• <code>(I)</code> = Individual 獨立運作<br>• <code>(D)</code> = 未啟用',
     'LACP 不理 PAgP，雙 passive/雙 auto 永不起，on 只對 on'],

    ['Native VLAN 與 802.1Q 封裝行為混淆',
     '誤以為 Native VLAN 通過 Trunk 也會打上 4-byte 802.1Q 標籤，或兩端 Native VLAN 不一致仍可正常轉發。',
     'Native VLAN 預設為明文未打標 (Untagged) 穿越 Trunk；兩端 Native VLAN ID 不匹配會造成 <b>VLAN 洩漏 (VLAN Hopping) 與 CDP Native Mismatch 錯誤</b>。<br>安全最佳實務：將 Native VLAN 移至獨立未使用的編號（如 VLAN 999）。',
     'Native 預設不打標，兩端 ID 必須對齊防洩漏'],

    ['DTP 協商結果誤判與安全性漏洞',
     '兩端交換器介面皆設為 <code>dynamic auto</code> 卻期待能自動形成 Trunk。',
     '<code>dynamic auto ↔ dynamic auto</code> 協商結果為 <b>Access Port</b>（皆被動等待對方發起）。只有 <code>dynamic desirable ↔ auto/desirable</code> 才會形成 Trunk。<br>安全最佳實務：面向終端埠強制配置 <code>switchport mode access</code> + <code>switchport nonegotiate</code> 關閉 DTP。',
     '雙 auto 變 access，安全埠強制 nonegotiate'],

    ['STP Root Guard vs BPDU Guard 防禦目標搞混',
     '誤以為 Root Guard 用於連接終端的 Edge Port，或以為 Root Guard 防禦的是劣質 BPDU。',
     '• <b>BPDU Guard</b>：部署於連接終端的 Access/Edge Ports（搭配 PortFast），收到任何 BPDU 即刻進入 <code>err-disabled</code>。<br>• <b>Root Guard</b>：部署於指定下游交換器的 Designated Ports，防禦收到<b>優勢 BPDU (Superior BPDU)</b> 搶佔根橋地位，觸發後置入 <code>root-inconsistent</code> 狀態（BPDU 消失後自動恢復）。',
     'BPDU Guard 顧終端邊界，Root Guard 顧下游防搶根'],

    ['CDP vs LLDP 發現協定特性混淆',
     '誤以為 CDP 是業界開放標準可跨廠商運作，或不知道兩者預設啟用狀態與訊息週期。',
     '• <b>CDP (Cisco Discovery Protocol)</b>：<b>Cisco 專有</b>，預設<b>啟用</b>，每 60 秒發送一次，Holdtime 180 秒。<br>• <b>LLDP (IEEE 802.1AB)</b>：<b>開放標準</b>跨廠牌通用，預設<b>關閉</b>，需手動 <code>lldp run</code> 啟用；每 30 秒發送一次，Holdtime 120 秒。<br>兩者皆可取得鄰居設備型號、埠 ID、管理 IP，但均存在資訊洩露風險（面向外部建議關閉）。',
     'CDP 思科Cisco專有預設開，LLDP 開放標準要手動開'],

    ['QoS Trust Boundary 與分類標記位置誤判',
     '讓所有接入交換機都重新標記 QoS，或搞混 Layer 2 與 Layer 3 標記欄位所在位置。',
     '最佳實務是在<b>信任邊界 (Trust Boundary)</b> —— 最靠近流量來源的接入交換機 —— 進行分類與標記，之後全程信任傳遞。<br>• <b>L2 標記</b>：802.1Q Header 內 3-bit <b>CoS</b>（0–7）。<br>• <b>L3 標記</b>：IP Header ToS 欄位的 <b>DSCP</b>（6-bit，共 64 值）。<br>語音流量慣用 EF (Expedited Forwarding, DSCP 46)。',
     '邊界一次標好全程信任，CoS 在二層、DSCP 在三層'],

    ['Wireless 架構 Autonomous AP vs Lightweight AP+WLC 模式搞混',
     '以為 Lightweight AP 自己處理認證與 SSID 配置，或不知道 Control/Data Plane 如何分離。',
     '• <b>Autonomous AP</b>：每台獨立配置（CLI/GUI），適合小規模。<br>• <b>Lightweight AP + WLC</b>：AP 只負責 RF 收發，全部 Intelligence 集中在 WLC，兩者透過 <b>CAPWAP</b> 隧道通訊：<br>&nbsp;&nbsp;— <b>Control Channel (UDP 5246)</b>：加密的管理訊息、設定推送。<br>&nbsp;&nbsp;— <b>Data Channel (UDP 5247)</b>：客戶端資料封裝（本地或集中切換）。<br>WLAN/SSID 定義在 WLC 上統一下發至所有 AP。',
     'Lightweight AP 只管天線，CAPWAP 5246 控制 5247 傳資料'],

    ['WLC 上 WLAN 配置四要素順序與綁定遺漏',
     '在 WLC 建立 WLAN 後忘記套用 Interface 或 Policy Profile，導致 SSID 廣播出來卻連不上。',
     'WLC 新增一個可用 WLAN 的關鍵步驟缺一不可：<br>① 定義 <b>SSID 名稱</b>與 VLAN 對應。<br>② 綁定 <b>Interface（VLAN）</b>——決定客戶端所屬子網。<br>③ 設定<b>安全策略</b>（WPA2-Personal PSK 或 WPA2-Enterprise 802.1X 指向 RADIUS）。<br>④ <b>啟用 WLAN 狀態</b>並確認已指派至目標 AP Group。<br>驗證：<code>show wlan summary</code> 確認 Admin Status 為 Enabled。',
     'SSID 綁介面配安全再啟用，四步缺一 SSID 白搭']
  ]],

  ['IP Connectivity', [

    ['Inter-VLAN Routing：Router-on-a-Stick 子介面配置陷阱',
     '在 Router-on-a-Stick 場景忘了在子介面下配置 <code>encapsulation dot1q</code>，或忘了 <code>no shutdown</code>，或誤以為物理介面 shutdown 不影響子介面。',
     'Router-on-a-Stick 三要件缺一即全斷：<br>① 物理介面必須 <code>no shutdown</code>（<b>物理口 down，底下所有子介面全部失效</b>）。<br>② 每個子介面執行 <code>encapsulation dot1q &lt;vlan-id&gt;</code>（必須在配 IP 之前設定）。<br>③ 子介面 VLAN ID 必須與交換機 Trunk 允許清單及 Native VLAN 規劃一致。<br>Native VLAN 對應的子介面可省略 tag 參數：<code>encapsulation dot1q 99 native</code>。',
     '物理口不 no shut 子介面全死，先 dot1q 再配 IP'],

    ['Inter-VLAN Routing：SVI 方案前置條件遺漏',
     '在三層交換機上建立了 SVI 卻無法互通，忽略 <code>ip routing</code> 未啟用或 VLAN 不存在。',
     'L3 Switch SVI 能 Up 且可路由的四個前提：<br>① 全域啟用 <b><code>ip routing</code></b>（預設關閉！）。<br>② 對應的 <b>VLAN 必須存在</b>（<code>vlan &lt;id&gt;</code> 已建立）。<br>③ 至少有一個 Active Port 屬於該 VLAN（或有 Trunk 攜帶該 VLAN），否則 SVI 顯示 <b>down/down</b>。<br>④ SVI 自身 <code>no shutdown</code>。<br>與 Router-on-a-Stick 相比：SVI 走硬體 ASIC 轉發速度更快、不需額外實體鏈路。',
     'SVI 要 ip routing 加 VLAN 有活躍埠才會 Up'],

    ['OSPF 鄰居狀態卡在 ExStart / Exchange 階段',
     '鄰居起不來時只檢查密碼與 IP，忽略介面 MTU 數值與 Router-ID 重複問題。',
     '分階段精確定位：<br>① <b>停在 Down / Init</b> ➡️ 檢查 Hello/Dead Timer、Area ID、Subnet Mask 或認證密碼不一致（Hello 封包被直接丟棄）。<br>② <b>卡在 ExStart / Exchange</b> ➡️ 兩端介面 <b>MTU 不匹配</b>（交換 DBD 封包協商失敗，可 <code>ip ospf mtu-ignore</code> 排除）、<b>Router-ID 重複</b>（Duplicate RID 直接拒絕 DBD），或網路遮罩不一致。',
     '停 Init 查三件套（Timer/Area/認證），卡 ExStart 查 MTU 與 RID 重複'],

    ['OSPF DR/BDR 選舉非搶佔性誤解',
     '在運作中的 OSPF 網路上新增一台 Priority 255 的全新路由器，以為會立刻奪取成為 DR。',
     'OSPF DR/BDR 選舉具備<b>非搶佔性 (Non-preemptive)</b>，一旦選出 DR/BDR，後加入的高優先級設備只能成為 DROther；唯有當前 DR 故障或重啟進程 (<code>clear ip ospf process</code>) 才會重新選舉。<br>優先順序：① 最高介面 Priority（0 不參選）➡️ ② 最高 Router ID。',
     'DR 選舉先到先得不搶佔，Priority 0 永不參選'],

    ['Static Route 出介面 vs 下一跳 IP 寫法陷阱',
     '在乙太網路 (Multi-access) 介面上配置靜態路由時，僅指定出介面（如 <code>ip route 10.1.1.0 255.255.255.0 gi0/0</code>）。',
     '乙太網路為多路存取介面，若未指定下一跳 IP，路由器會對所有目標主機發起 ARP Request，造成 <b>ARP 廣播洪泛與嚴重的 Proxy ARP 依賴</b>；P2P/Serial 點對點鏈路才適用純出介面寫法。',
     '乙太網必寫下一跳 IP，Serial 點對點才用出介面'],

    ['浮動靜態路由 AD 設計不當導致主備倒置',
     '規劃備援路由時，靜態路由未手動調整 AD 值，或 AD 值設得比主要動態路由更低。',
     '靜態路由預設 AD 為 1；若欲備援 OSPF (AD 110)，浮動靜態路由的 AD 必須<b>大於 110</b>（如 <code>ip route ... 120</code>），平時沉睡不寫入 RIB，僅在主路由失效時才浮出裝表。<br>驗證主備切換：<code>show ip route static</code> 觀察浮動路由是否已裝表。',
     '備援路徑 AD 要調高，高於動態協定才沉睡'],

    ['路由表四要素讀法與代碼意義誤判',
     '`show ip route` 看到 <code>S* 0.0.0.0/0</code> 就以為是靜態黑洞，或不清楚輸出開頭字母代碼與 [AD/Metric] 的含義。',
     '路由表每一筆格式：<code>代碼 Prefix [AD/Metric] via 下一跳, 出介面</code>。<br>常見代碼：<code>C</code> 直連、<code>L</code> 本機、<code>S</code> 靜態（<code>S*</code> 為預設路由候選）、<code>D</code> EIGRP、<code>O</code> OSPF、<code>R</code> RIP。<br><code>[90/130816]</code> 表示 AD 90、Metric 130816 —— AD 用於比較不同來源同前綴路由，Metric 用於同協定內選路。',
     '看懂代碼與 [AD/Metric]，C直連 S靜態 O是OSPF'],

    ['OSPF Passive-Interface 宣告與行為誤解',
     '誤以為設定 <code>passive-interface</code> 後，該介面所屬的網段就不會被 OSPF 宣告給其他鄰居。',
     '<code>passive-interface</code> 僅是<b>停止在該介面上收發 Hello 封包</b>（不與該介面上的設備建立鄰居關係），但該介面的直連網段依然會透過 LSA 正常宣告給全網其他鄰居。常用於面向終端使用者的 LAN 介面。',
     'Passive 介面不發 Hello 建鄰居，直連網段照樣廣告出去']
  ]],

  ['IP Services', [

    ['PAT 配置遺漏 overload 關鍵字',
     '希望多台內網主機共用單一公網 IP 上網，但在 NAT 指令末端漏寫 <code>overload</code>。',
     '沒有 <code>overload</code> 關鍵字時，設備會將其視為動態一對一 NAT；當唯一的外部公網 IP 被第一台主機占用後，後續所有主機皆因無可用 IP 映射而無法連網。',
     '多對一上網必加 overload，等於 Port 埠號位址轉換'],

    ['NAT Inside / Outside 介面方向掛反',
     '將 <code>ip nat inside</code> 設在連接 ISP 的外網介面，<code>ip nat outside</code> 設在連接 LAN 的內網介面。',
     '方向掛反會導致 NAT 轉發引擎完全無法識別連線發起方向，封包直接被原樣轉發或丟棄。檢驗指令：<code>show ip nat statistics</code> 比對 Inside 與 Outside 介面標記。',
     'LAN 介面掛 inside、WAN 出口掛 outside，方向掛反不轉換'],

    ['ACL 隱含 deny any 與放置原則陷阱',
     '自訂 ACL 未寫 permit 就直接套用導致全斷，或把 Standard ACL 放在靠近來源的位置造成過度攔截。',
     '每個 ACL 末尾都有一條<b>看不見的隱含 <code>deny any</code></b> —— 比對不到任何 permit 就全部丟棄。<br><b>放置原則</b>：<br>• <b>Standard ACL</b>（只比對 Source）：放在<b>靠近目的地</b>的路由器，避免誤殺其他合法流量。<br>• <b>Extended ACL</b>（可比對 Source+Destination+Port）：放在<b>靠近來源</b>的路由器，盡早過濾節省頻寬。<br>規則<b>由上而下逐條比對、命中即停</b>，新增規則插入在中間不會自動生效排序。',
     '隱含 deny any 藏尾端，Standard 靠目的、Extended 靠來源'],

    ['ACL 方向 (in/out) 判斷顛倒',
     '以為「out」是指從本機發出的流量，或在介面上掛反 in/out 導致策略完全失效甚至鎖死管理連線。',
     'ACL 方向永遠以<b>路由器自身視角</b>判定：<br>• <b>in</b>：流量<b>進入本介面</b>、尚未經過路由表查詢之前先過濾。<br>• <b>out</b>：流量已完成路由查詢、<b>正要離開本介面</b>時過濾。<br>⚠️ 遠端修改 ACL 前，務必先用 <code>reload in 5</code> 保命或避免把 vty 管理網段 deny 掉。',
     'in 是進門先檢查，out 是出門才檢查，永遠站在路由器角度看'],

    ['SSH vs Telnet 安全性與配置要件遺漏',
     '只配置了 <code>transport input ssh</code> 卻沒產生 RSA 金鑰，導致 vty 完全登不進去。',
     'Telnet 全明文傳輸（含密碼）應禁用；SSH 加密整個 Session。<br>SSH 可用四要件：<br>① <code>ip domain-name</code> 已設定。<br>② <code>crypto key generate rsa</code>（金鑰 ≥ 768 bits，建議 2048）。<br>③ 本地使用者帳號 + <code>vty 下 login local</code>。<br>④ <code>transport input ssh</code> 禁止 Telnet。<br>版本差異：<b>SSHv2</b> 才是安全主流，SSHv1 存在已知漏洞。',
     '域名金鑰帳號 transport 四件套齊才能 SSH'],

    ['DHCP Relay (ip helper-address) 配置介面位置錯誤',
     '將 <code>ip helper-address</code> 配置在靠近 DHCP Server 的路由器介面上。',
     '<code>ip helper-address</code> 必須配置在<b>接收客戶端廣播的「入口介面 (Ingress Interface)」</b>上；路由器收到廣播後會將其封裝為單播，並填入 <code>giaddr</code>（該介面 IP）轉發給遠端 DHCP Server 選池。',
     'Helper-address 設在靠近 Client 的介面，轉單播帶 giaddr 選池'],

    ['SNMP v2c 與 SNMPv3 安全模式混淆',
     '誤以為 SNMPv3 所有模式都有加密，或以為 v2c 的 community string 是安全的認證手段。',
     '• <b>SNMPv2c</b>：community string 為<b>明文</b>傳輸（等同密碼裸奔），無加密無完整認證。<br>• <b>SNMPv3 三種安全等級</b>：<br>&nbsp;&nbsp;— <code>noAuthNoPriv</code>：不認證不加密（等同沒防護）。<br>&nbsp;&nbsp;— <code>authNoPriv</code>：認證（MD5/SHA）但不加密。<br>&nbsp;&nbsp;— <code>authPriv</code>：認證 + 加密（DES/AES）——<b>唯一推薦等級</b>。',
     'v2c 明文 community，v3 要 authPriv 才是真安全'],

    ['DNS 解析流程與 name-server 行為誤解',
     '誤以為路由器會向 DHCP Server 取得 DNS 後自動代理解析，或搞混 Stub Resolver 與 Authoritative Server 角色。',
     'DNS 解析鏈：Client Stub ➡️ Recursive Resolver（遞迴查詢代勞）➡️ Root ➡️ TLD ➡️ Authoritative（權威回覆最終紀錄）。<br>路由器上 <code>ip name-server</code> 讓設備自身可解析主機名；<code>ip host &lt;name&gt; &lt;ip&gt;</code> 為本地靜態映射（優先於 DNS）。A 紀錄對應 IPv4、AAAA 對應 IPv6、CNAME 為別名。',
     '遞迴代問權威答，ip host 本地映射最優先'],

    ['NTP Stratum 16 狀態誤判為正常同步',
     '在 <code>show ntp status</code> 輸出中看到 Stratum 16，誤以為時鐘已成功完成同步。',
     'NTP Stratum 範圍為 1–15；<b>Stratum 16 代表「未同步 (Unsynchronized)」或時間源無效不可信</b>。必須確認輸出顯示 <code>Clock is synchronized</code> 且 Stratum ≤ 15 方為正常。',
     'Stratum 16 代表未同步，synchronized 才是真對時'],

    ['Syslog 嚴重度等級數字方向搞反',
     '誤以為 Severity 7 比 Severity 0 更嚴重、更緊急。',
     'Syslog 等級 <b>0 (Emergency，系統宕機不可用) 最緊急</b>；<b>7 (Debugging) 最輕微</b>。<br>當設定 <code>logging trap warning (4)</code> 時，代表設備會發送 0、1、2、3、4 級別的所有日誌給伺服器（包含門檻以下全部級別）。<br>完整八級：0 Emergency / 1 Alert / 2 Critical / 3 Error / 4 Warning / 5 Notification / 6 Informational / 7 Debugging。',
     '數字越小越危急（0 宕機 7 調試），Trap 門檻包含以下全部']
  ]],

  ['Security Fundamentals', [

    ['enable password vs enable secret 儲存安全盲點',
     '以為啟用了 <code>service password-encryption</code> 就能確保 <code>enable password</code> 的絕對安全。',
     '<code>service password-encryption</code> 僅將明文轉為 <b>Type 7 弱混淆編碼</b>，可被工具秒殺破解；<code>enable secret</code> 採用單向不可逆雜湊（Type 5 MD5 或 Type 8/9 SCRYPT/PBKDF2），且系統優先採用 secret。',
     'Type 7 是防偷看弱編碼，enable secret 才是真雜湊'],

    ['TACACS+ vs RADIUS 架構與加密範疇混淆',
     '考試將 TACACS+ 與 RADIUS 的傳輸協定埠號與加密欄位相互顛倒。',
     '• <b>TACACS+ (思科Cisco專有)</b>：走 <b>TCP 49</b>，對<b>整個封包 Payload 全程加密</b>，AAA 三功能獨立，支援逐指令授權（設備管理首選）。<br>• <b>RADIUS (開放標準)</b>：走 <b>UDP 1812/1813</b>（舊版相容埠 1645/1646），僅對<b>密碼欄位加密</b>，認證與授權合併（網路存取 802.1X 首選）。',
     'TACACS+ 走 TCP49 全加密分三權，RADIUS 走 UDP 密碼加密合二為一'],

    ['DHCP Snooping Untrusted 埠防禦行為盲點',
     '全域啟用 DHCP Snooping 後，忘記將連接合法 DHCP 伺服器或上行 Trunk 設為 Trusted。',
     'Snooping 啟用後，交換器所有介面預設為 <b>Untrusted</b>；Untrusted 介面收到 <b>DHCP Offer 或 DHCP ACK 封包會直接丟棄</b>，導致終端全部拿不到 IP。必須手動在伺服器埠配置 <code>ip dhcp snooping trust</code>。',
     'Snooping 預設全 Untrusted，合法 Server 埠務必手動 Trust'],

    ['DAI (動態 ARP 檢驗) 對 DHCP Snooping 的依賴性',
     '在未啟用 DHCP Snooping 或未建立綁定表的 VLAN 上直接開啟 DAI。',
     'DAI 強烈依賴 <b>DHCP Snooping Binding Table</b> 來驗證 ARP 封包（比對 IP-to-MAC 映射）；若無綁定表且未配置 <code>arp access-list</code>，Untrusted 埠的所有合法 ARP 請求皆會被全部丟棄。',
     'DAI 查表靠 Snooping，無綁定表會誤殺所有 ARP'],

    ['VPN 分類與 IPsec 核心組成混淆',
     '搞混 Site-to-Site 與 Remote Access VPN 適用場景，或不知道 IPsec 由哪些協定組成。',
     '• <b>Site-to-Site VPN</b>：閘道對閘道（Router/Firewall 之間），終端無感，適合分公司互連。<br>• <b>Remote Access VPN</b>：個別終端設備撥入企業網路（AnyConnect 等）。<br><b>IPsec 兩階段</b>：① IKE (UDP 500) 協商 SA 建立安全通道；② 以 <b>ESP (IP Protocol 50)</b> 提供機密性 + 完整性 + 抗重播（<b>AH Protocol 51</b> 僅完整性不加密，且過 NAT 有問題）。<br>核心四要素：Confidentiality（加密演算法）、Integrity（Hash）、Authentication（認證）、Anti-Replay（序號）。',
     'Site-to-Site 閘道對閘道，IKE 先談判 ESP 來加密，AH 不加密怕 NAT'],

    ['WLAN 安全演進與 WPA2/WPA3 模式選擇錯誤',
     '以為 WPA2-Personal 已是最高安全等級，或不清楚 WEP/TKIP 為何已被淘汰。',
     '安全演進鏈：<br>• <b>WEP</b>：靜態金鑰、RC4 弱加密，數分鐘可破解 ➡️ 已淘汰。<br>• <b>WPA</b>：臨時方案，仍用 RC4/TKIP ➡️ 已淘汰。<br>• <b>WPA2</b>：<b>AES-CCMP</b> 加密。Personal 模式 = Pre-Shared Key（PSK）；Enterprise 模式 = <b>802.1X/EAP</b> 搭配 RADIUS Server 個別認證。<br>• <b>WPA3</b>：Personal 改用 <b>SAE (Simultaneous Authentication of Equals)</b> 取代 PSK 四次握手，<b>抗離線字典攻擊</b>；提供 PMF (Protected Management Frames) 。<br>Enterprise 場景一律走 802.1X，個人場景優先 WPA3-SAE。',
     'WEP/WPA 早淘汰，WPA2 用 AES、WPA3 SAE 防字典，企業一律 802.1X'],

    ['登入安全強化措施遺漏',
     '只設定密碼就認為設備管理已安全，忽略暴力破解防護與 Session 逾時控制。',
     '三項基礎強化缺一即留破口：<br>① <code>login block-for 120 attempts 3 within 60</code> —— 60 秒內失敗 3 次，鎖定登入 120 秒（防暴力破解）。<br>② <code>exec-timeout 10 0</code> —— 閒置 10 分鐘自動登出 vty/console。<br>③ <code>service password-encryption</code> 至少遮蔽明文（配合 Type 8/9 雜湊更佳）。<br>vty 線上務必搭配 ACL 限制管理來源 IP。',
     'block-for 防爆破、exec-timeout 防掛線、vty 掛 ACL 限來源']
  ]],

  ['Automation & Programmability', [

    ['JSON 資料格式語法規範陷阱',
     '在 JSON 物件中使用「單引號」、鍵名未加雙引號，或在最後一個元素後加「尾隨逗號 (Trailing comma)」。',
     '嚴格規範：JSON 的<b>鍵名 (Key) 與字串值必須使用雙引號 <code>""</code></b>（禁止單引號）；陣列或物件的最後一個元素後<b>嚴禁加逗號</b>；JSON 不支援 <code>#</code> 或 <code>//</code> 註解。',
     'JSON 鍵名必加雙引號，無尾隨逗號不支援註解'],

    ['XML vs JSON vs YAML 三大資料格式定位混淆',
     '搞混三種格式各自的語法特徵與典型用途，例如以為 YAML 用括號巢狀、XML 用縮排表達層級。',
     '• <b>JSON</b>：花括號 <code>{}</code> 物件 + 方括號 <code>[]</code> 陣列，鍵值對雙引號，REST API 主流格式。<br>• <b>XML</b>：成對標籤 <code>&lt;tag&gt;&lt;/tag&gt;</code> 包裹，冗長但結構嚴謹，NETCONF 使用。<br>• <b>YAML</b>：<b>縮進 (Indentation)</b> 表達層級、<code>-</code> 表列表、<code>:</code> 表鍵值，Ansible Playbook 使用。<br>三者皆為人類可讀的資料序列化格式。',
     'JSON 括號走 API、XML 標籤陪 NETCONF、YAML 縮排寫 Playbook'],

    ['REST API HTTP 狀態碼 401 vs 403 混淆',
     '將 <code>401 Unauthorized</code> 與 <code>403 Forbidden</code> 的定義搞混。',
     '• <b>401 Unauthorized</b>：代表「<b>身分未驗證 (Unauthenticated)</b>」，缺少 Token 或帳密無效。<br>• <b>403 Forbidden</b>：代表「<b>身分已驗證但權限不足</b>」，伺服器拒絕執行。<br>其他高頻碼：<b>200</b> OK 成功、<b>201</b> Created 建立成功（POST 回應）、<b>400</b> Bad Request 請求語法錯、<b>404</b> Not Found 資源不存在、<b>500</b> Internal Server Error 伺服器端故障。',
     '401 沒帶身分證（未驗證），403 帶了證件沒權限，201 建好 404 找無'],

    ['HTTP Method 與 CRUD 操作對應錯誤',
     '將 PUT 與 PATCH 的語義混為一談，或把 DELETE 對應到讀取操作。',
     'CRUD 對照：<br>• <b>Create</b> ➡️ <b>POST</b>（新增資源）。<br>• <b>Read</b> ➡️ <b>GET</b>（讀取，不修改狀態）。<br>• <b>Update</b> ➡️ <b>PUT</b>（<b>全量替換</b>整個資源）/ <b>PATCH</b>（<b>部分更新</b>指定欄位）。<br>• <b>Delete</b> ➡️ <b>DELETE</b>（刪除資源）。<br>RESTful 特徵：URI 定位資源、Method 表達動作、Stateless 無狀態通訊。',
     'POST 建 GET 讀，PUT 全換 PATCH 局部改，DELETE 刪光光'],

    ['API 身份驗證方式 Basic Auth vs Token/API Key 混淆',
     '以為 Basic Auth 把帳密放 Header 就是安全做法，或不理解 Token 的有效期機制。',
     '• <b>Basic Auth</b>：帳密做 <b>Base64 编码</b>（非加密！）放入 <code>Authorization</code> Header —— Base64 可秒解，必須搭配 HTTPS 才有基本保障。<br>• <b>Token / API Key</b>：登入換取憑證後攜帶存取，通常具備<b>有效期限</b>與<b>範圍 (Scope)</b> 限制，洩露風險可控、可撤銷。<br>實務建議：一律 HTTPS + Token 機制，避免 Basic Auth 直傳。',
     'Basic 只是 Base64 化妝不是加密，Token 有效期可撤銷才是王道'],

    ['組態管理工具 Ansible vs Terraform 定位混淆',
     '誤以為 Ansible 是 Agent-based 且主要用於 IaC 基礎架構佈建。',
     '• <b>Ansible</b>：<b>Agentless (免代理)</b>，走 SSH/NETCONF，採用 <b>Push (推式)</b> 與 <b>YAML Playbook</b>，專注於<b>組態管理與自動化任務</b>。<br>• <b>Terraform</b>：Agentless，採用 <b>HCL</b>，宣告式管理，專注於<b>基礎架構即代碼 (IaC) 資源佈建</b>。<br>• <b>Puppet / Chef</b>：<b>Agent-based</b>（節點需裝代理程式），Pull (拉式) 為主，適合大規模持續性組態管理。',
     'Ansible Agentless+Push+YAML 做配置，Terraform IaC 佈建，Puppet/Chef 要裝代理'],

    ['SDN 架構北向 vs 南向 API 方向搞反',
     '把 Controller 與 Device 之間的介面當作北向 API，或搞不清 SDN 三層各自角色。',
     'SDN 三層架構由上而下：<br>① <b>Application Layer</b>（業務應用）↔ ② <b>Control Layer</b>（控制器如 DNA Center / SDN Controller）↔ ③ <b>Infrastructure Layer</b>（交換機/路由器設備）。<br>• <b>北向 API (Northbound)</b>：Application ➡️ Controller（通常是 REST API）。<br>• <b>南向 API (Southbound)</b>：Controller ➡️ Network Devices（NETCONF/RESTCONF/OpenFlow）。<br>核心思想：<b>Management Plane / Control Plane / Data Plane 分離集中化</b>。',
     '北向接應用南向管設備，Controller 居中發號施令'],

    ['NETCONF vs RESTCONF 協定特性混淆',
     '搞混兩者的傳輸埠、編碼格式與適用場景。',
     '• <b>NETCONF</b>：<b>TCP 830</b> 傳輸（SSH 加密）、<b>XML</b> 編碼、支援<b>交易式配置</b>（commit/rollback 整批生效或全退），YANG 為資料模型。<br>• <b>RESTCONF</b>：<b>HTTPS 443</b>、支援 <b>XML 或 JSON</b> 編碼、RESTful 風格易整合 Web 工具，同樣基於 YANG 模型。<br>兩者皆是南向 API，皆以 YANG 描述設備資料結構 —— YANG 是共通的資料建模語言。',
     'NETCONF 走 830 XML 能回滾，RESTCONF 走 443 可 JSON，共用 YANG 模型'],

    ['Cisco Catalyst Center (DNA Center) 功能定位誤解',
     '以為 DNA Center 只是一般的網管 SNMP 平台，或不清楚其 Intent-based 核心能力。',
     '<b>Catalyst Center (原 DNA Center)</b> 是 Cisco 的 <b>Intent-Based Networking (IBN)</b> 控制器平台，核心能力：<br>① <b>Assurance</b>：Telemetry 遙測 + AI 分析，主動偵測異常與根因分析。<br>② <b>Provision</b>：意圖翻譯為配置並自動下發至設備。<br>③ <b>Design</b>：階層式網路設計模板（Hierarchy/Topology）。<br>④ <b>Policy</b>：基於身份的策略統一下發（配合 ISE）。<br>與傳統 SNMP 網管的差異：從「被動監控」升級為「主動保證 + 自動修復」。',
     'DNA Center 四大功能 Design/Policy/Provision/Assurance，意圖驅動自動下發']
  ]]
];


const pl = document.getElementById('pit-list');
let pitTotal = 0;
let activePitModule = 'all';

// 計算全部陷阱總數
const allPitCount = pitModules.reduce((sum, [, items]) => sum + items.length, 0);

// 建立現代化搜尋與篩選工具列 DOM
const pitTools = document.createElement('div');
pitTools.id = 'pit-tools';
pitTools.className = 'pit-tools';

pitTools.innerHTML = `
  <div class="pit-search-wrapper">
    <span class="pit-search-icon">⚠️</span>
    <input id="pit-search" type="text" placeholder="搜尋觀念陷阱、情境關鍵字或排錯口訣（例如：OSPF, ExStart, Sticky, 401）..." autocomplete="off">
    <button class="pit-search-clear" id="pit-search-clear" title="清除搜尋">✕</button>
  </div>
  <div class="pit-filter-group" id="pit-filters">
    <button class="active" data-m="all">全部 <span class="pill-badge">${allPitCount}</span></button>
    ${pitModules.map(([moduleName, items], i) => `
      <button data-m="${i}">${moduleName.split('（')[0]} <span class="pill-badge">${items.length}</span></button>
    `).join('')}
  </div>
`;

pl.parentNode.insertBefore(pitTools, pl);

const pitSearchInput = document.getElementById('pit-search');
const pitClearBtn = document.getElementById('pit-search-clear');

function renderPitfalls() {
  pl.innerHTML = '';
  pitTotal = 0;
  const kw = (pitSearchInput.value || '').trim().toLowerCase();

  pitClearBtn.style.display = kw ? 'block' : 'none';

  pitModules.forEach(([modName, items], i) => {
    if (activePitModule !== 'all' && activePitModule != i) return;

    // 深層全文比對：標題、陷阱情境、破解邏輯、口訣
    const visible = items.filter(([title, scenario, solution, mnemonic]) => {
      if (!kw) return true;
      return title.toLowerCase().includes(kw) ||
             scenario.toLowerCase().includes(kw) ||
             solution.toLowerCase().includes(kw) ||
             mnemonic.toLowerCase().includes(kw);
    });

    if (!visible.length) return;

    const h = document.createElement('h3');
    h.className = 'pit-module-title';
    h.innerHTML = `<span>${modName}</span><span class="cnt">${visible.length} 陷阱</span>`;

    const wrap = document.createElement('div');
    visible.forEach(([title, scenario, solution, mnemonic]) => {
      pitTotal++;
      const d = document.createElement('details');
      d.className = 'pitfall';

      // 搜尋中或單一模組篩選時自動展開
      if (kw || activePitModule !== 'all') {
        d.open = true;
      }

      d.innerHTML = `
        <summary>⚠️ ${title}</summary>
        <div class="body pit-body">
          <div class="pit-box-danger">
            <b>❌【高頻混淆陷阱】</b>
            <div>${scenario}</div>
          </div>
          <div class="pit-box-fix">
            <b>✅【官方破解邏輯】</b>
            <div>${solution}</div>
          </div>
          <div class="pit-mnemonic-bar">
            <span>💡 觀念秒殺：</span>
            <span>${mnemonic}</span>
          </div>
        </div>
      `;
      wrap.appendChild(d);
    });

    pl.appendChild(h);
    pl.appendChild(wrap);
  });

  // 無匹配結果提示
  if (pitTotal === 0) {
    pl.innerHTML = `
      <div style="text-align:center;padding:36px 16px;color:var(--text-muted)">
        <p style="font-size:1.1rem;margin-bottom:8px">🔍 找不到與「<b style="color:var(--accent-amber)">${kw}</b>」相關的觀念陷阱</p>
        <p style="font-size:0.85rem;color:var(--text-dim)">建議嘗試搜尋簡短關鍵字（例如：STP、NAT、OSPF、SSH、TACACS）</p>
      </div>
    `;
  }
}

// 綁定過濾按鈕點擊事件
document.getElementById('pit-filters').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    document.getElementById('pit-filters').querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activePitModule = b.dataset.m;
    renderPitfalls();
  };
});

pitSearchInput.oninput = renderPitfalls;

pitClearBtn.onclick = () => {
  pitSearchInput.value = '';
  pitSearchInput.focus();
  renderPitfalls();
};

// 初始渲染
renderPitfalls();
