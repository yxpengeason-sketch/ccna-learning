/* ================= 易混淆對照表（38 條 · 模組分類） ================= */
const cmpModules=[

['Network Fundamentals', [
    ['OSI L2 vs L3 設備', [
      ['', 'Layer 2 Switch', 'Layer 3 Router', 'Multilayer Switch (L3 Switch)', ''],
      ['主要功能', 'MAC 位址學習與訊框轉發、劃分 VLAN、分割碰撞網域', '跨網段封包路徑選擇 (Routing)、連接 WAN、隔離廣播網域', '結合硬體線速交換與跨 VLAN 內部路由 (SVI)，提供高吞吐網段轉發', 'L2 隔絕碰撞；L3 隔絕廣播'],
      ['轉發依據與硬體', 'MAC Address Table (CAM 表)', 'Routing Table (RIB/FIB) 搭配 ARP Table (Adjacency 表)', '專用 ASIC / CEF (Cisco Express Forwarding) 硬體引擎', 'L3 Switch 兼具兩者，以 CEF 實現線速轉發']
    ]],

    ['碰撞網域 (Collision Domain) vs 廣播網域 (Broadcast Domain)', [
      ['', '碰撞網域 (Collision Domain)', '廣播網域 (Broadcast Domain)', ''],
      ['核心定義與範圍', '同一實體網段上可能發生訊號碰撞的範圍（Hub / 半雙工環境）', '單一廣播訊號 (如 ARP Request, 255.255.255.255) 能夠傳播抵達的設備集合', 'Switch 預設：每port獨立碰撞網域；全機同屬單一廣播網域'],
      ['設備隔離能力', 'Switch 每個實體Port皆為獨立碰撞網域（Hub 則全機共用 1 個）', 'Router 每個介面皆完全隔離廣播網域（Switch 需透過劃分 VLAN 隔離）', '路由器 (L3) 阻斷廣播；交換器 (L2) 阻斷碰撞']
    ]],

    ['TCP vs UDP & TCP 旗標控制', [
      ['', 'TCP (傳輸控制協定)', 'UDP (使用者資料報協定)', ''],
      ['連線與可靠性', '面向連線 (三向交握 SYN ➡️ SYN-ACK ➡️ ACK)；<br> 具 ACK 確認、重傳、流量控制 (Windowing)', '無連線 (Connectionless)；Best-effort 盡力傳輸，<br> 無重傳與流量控制，開銷低且延遲極小', 'TCP 著重可靠性；UDP 著重即時性 (VoIP/串流)'],
      ['旗標與標頭長度', '基本標頭 20 Bytes（含 Options 最長 60 Bytes）；常用旗標：SYN (同步)、ACK (確認)、FIN (結束)、RST (重置)', '標頭固定 8 Bytes (來源port、目的port、長度、校驗和)；無控制旗標', '⭐CCNA 核心考點：<br> TCP 基本 20 Bytes vs UDP 固定 8 Bytes 標頭開銷；UDP 為唯一固定長度'],
      ['常見協定與port號', 'FTP (20/21)、SSH (22)、Telnet (23)、HTTP (80)、HTTPS (443)、BGP (179)', 'DNS (53 查詢)、DHCP (67/68)、TFTP (69)、NTP (123)、SNMP (161)、Syslog (514)', '秒殺考點：<br> DNS 查詢走 UDP 53，<br> Zone Transfer 走 TCP 53']
    ]],

    ['銅纜實體層故障排除 (Troubleshooting)', [
      ['', '故障指標 / 狀態', '根本原因 (Root Cause)', '排查指令與判定標準', ''],
      ['雙工與速率不相容', 'Late Collisions (延遲碰撞) 激增、網路吞吐極慢', '一端強制 Full-Duplex、另一端 Auto-negotiation（Auto 端協商失敗降為 Half）', 'show interfaces <id> 檢查 Duplex，兩端需一致設為 Auto 或 Full', '雙工不匹配是 Late Collisions 的頭號元兇'],
      ['介面狀態語意', 'UP / UP (正常)；Admin Down (手動 shutdown)；Down / Down (L1 實體斷線/未供電)', 'UP / Down (L2 封裝不相容、Keepalive 遺失、時脈未配、Port Security err-disabled)', 'show interfaces 檢查 line status 與 protocol status', 'UP / Down 多為 L2 協定或安全違規問題'],
      ['實體層錯誤計數', 'CRC Errors / Input Errors 激增', '實體線路損壞、水晶頭接觸不良、嚴重 EMI 電磁干擾或線材超長 (>100m)', '更換線材、重做接頭或遠離高壓電磁干擾源', 'CRC 錯誤通常指示 L1 實體纜線或接頭損壞']
    ]],

    ['單模 (SMF) vs 多模 (MMF) 與光纖接頭規格', [
      ['', '單模光纖 (SMF / 10GBASE-LR)', '多模光纖 (MMF / 10GBASE-SR)', ''],
      ['傳輸特性與規格', '雷射 (Laser) 光源、波長 1310/1550 nm、芯徑細 (9 µm)、無模態色散，<br> 距離達 10km+', 'LED / VCSEL 光源、波長 850 nm、芯徑粗 (50/62.5 µm)、受限模態色散，<br> 距離約 300m', 'LR = Long Reach (單模)；<br> SR = Short Reach (多模)'],
      ['外觀與接頭標準', '外皮顏色為黃色 (Yellow)；SFP 模組拉環通常為藍色', '外皮為橘色 (OM1/OM2) 或水藍色 (OM3/OM4)；模組拉環通常為黑色/米色', '常用接頭：LC (SFP 迷你雙工)、SC (大方頭)、ST (圓卡扣)']
    ]],

    ['無線區域網路 (WLAN) 基本原理', [
      ['', '2.4 GHz 頻段', '5 GHz 頻段', ''],
      ['頻道劃分與干擾', '僅 1、6、11 三個非重疊頻道 (20MHz)；<br> 頻道少易受同頻干擾 (CCI) 及藍牙/微波爐干擾', '具備 20+ 個非重疊頻道 (UNII 頻段)；支援 20/40/80/160 MHz 頻寬綁定，干擾極低', '多 AP 部署 2.4G 必須交錯採用 1-6-11 頻道'],
      ['傳播特性與信號指標', '波長長、穿透力 (穿牆) 強、覆蓋廣，但速率較低且頻寬窄', '波長短、穿透力弱、衰減快、覆蓋小，但速率極快且容量大', 'RSSI 負值越接近 0 越好 (建議 > -67 dBm)；SNR 越大越好'],
      ['拓樸與架構名詞', 'BSS (基本服務集)：由單一 AP 及其 Client 組成；BSSID 為 AP 的 Radio MAC', 'ESS (擴充服務集)：多個 AP 組成相同 SSID 的漫遊網路；DS 為後端分散系統 (Switch)', 'SSID 為無線識別名稱；Split-MAC 集中管理仰賴 CAPWAP']
    ]],

    ['UTP 直通線 vs 跳接線 (Straight-Through vs Crossover)', [
      ['', '直通線 (Straight-through)', '跳接線 (Crossover)', ''],
      ['線序標準與接法', '兩端皆為 T568B（或兩端皆為 T568A）', '一端為 T568A、另一端為 T568B（Pin 1-3、2-6 對調）', 'T568B 線序：白橙、橙、白綠、藍、白藍、綠、白棕、棕'],
      ['適用設備連接', '連接不同層次設備：PC ↔ Switch、Router ↔ Switch、Server ↔ Switch', '連接同類傳輸引腳設備：Switch ↔ Switch、Router ↔ Router、PC ↔ PC、Router ↔ PC', 'PC 與 Router 傳輸引腳相同 (1/2 發送)，互連需跳接線'],
      ['Auto-MDIX 特性', '自動辨識線序並反轉收發引腳，現代 Gigabit/10G 介面預設強制支援', '若要手動啟用 Auto-MDIX，介面速率 (speed) 與雙工 (duplex) 必須設為 auto', '考題若無 Auto-MDIX 需按標準線序選擇']
    ]],

    ['IPv4 私有位址 vs APIPA vs Loopback Address', [
      ['', 'RFC 1918 私有位址', 'APIPA (自動私有位址)', 'Loopback Address', ''],
      ['位址範圍劃分', 'Class A: 10.0.0.0/8<br>Class B: 172.16.0.0/12<br>Class C: 192.168.0.0/16', '169.254.0.0/16 <br> (169.254.0.1 – 169.254.255.254)', '127.0.0.0/8 (常用 127.0.0.1)', '私有 IP 與 APIPA 皆為非公網路由位址'],
      ['用途與運作機制', '企業內部私網使用，出外網需透過 NAT 轉換；節省公網 IPv4 位址', 'DHCP 伺服器無回應時由 OS 自動指派 (Link-Local)，無法跨路由器轉發', '測試本機作業系統 TCP/IP 協定堆疊是否正常運作', '考題出現 169.254.x.x 代表 DHCP 請求失敗']
    ]],

    ['IPv6 位址類型 (Link-Local vs Global Unicast vs Unique Local)', [
      ['', 'Link-Local (本機鏈路位址)', 'Global Unicast (全球單播位址)', 'Unique Local (唯一區域位址)', ''],
      ['前綴範圍與規範', 'FE80::/10 (通常為 fe80::/64)', '2000::/3 (範圍 2000:: 到 3FFF::)', 'FC00::/7 (目前普遍使用 FD00::/8)', 'IPv6 介面啟用即自動產生 Link-Local'],
      ['通訊範圍與用途', '僅在單一本地鏈路有效，路由器不轉發；用於 NDP 與動態路由 Next-Hop', '全球唯一、公網可直接路由；相當於 IPv4 公網 IP，端對端直通', '企業私網內部路由，不於網際網路路由；相當於 IPv4 私有位址', 'EUI-64：MAC 中間插 FFFE，第 7 bit (U/L) 反轉']
    ]],

    ['虛擬化 Hypervisor Type 1 vs Type 2 vs 容器 (Containers)', [
      ['', 'Type 1 (Bare-Metal 原生型)', 'Type 2 (Hosted 宿主型)', 'Containers (容器技術)', ''],
      ['底層架構與平台', '直接安裝於實體伺服器硬體之上（如 VMware ESXi, KVM, Hyper-V, Cisco UCS）', '安裝於現有 Host 作業系統之上（如 VMware Workstation, VirtualBox）', '共用 Host OS 核心 (Kernel)，基於 Docker / K8s 引擎運行', 'Type 1 專為資料中心設計；Containers 啟動秒級'],
      ['效能與資源開銷', '效能極高、無宿主 OS 額外負擔、虛擬機 (VM) 間完全隔離', '受限於宿主 OS 資源負載與延遲，多用於個人測試與開發環境', '極度輕量化、開銷最低、高密度部署，但隔離安全性略低於 VM', 'NFV 與雲端架構主流採用 Type 1 與容器技術']
    ]]
  ]
],


['Network Access',[
['STP vs RSTP', [
        ['','STP','RSTP',''],
        ['Port角色', 'Root / Designated / Non-designated', '新增 Alternate (替代) 與 Backup (備援) Port', 'RSTP 有備胎，省去 Listening/Learning 時間'],
        ['Port狀態', 'Blocking ➡️ Listening ➡️ Learning ➡️ Forwarding', '簡化為 Discarding ➡️ Learning ➡️ Forwarding', '三態取代四態，廢除 Listening 狀態'],
        ['收斂時間', '傳統 STP 需 30–50 秒（受限於計時器）', 'RSTP 數秒內（透過 Edge Port 與 Proposal / Agreement 握手機制）', '考題問最快收斂或 802.1w 選 RSTP'],
        ['計時器依賴', '依賴根橋發送的 Hello / Forward Delay / Max Age', '改為鄰居間「事件驅動」主動握手', 'RSTP 遺失 3 個 Hello 即判定拓樸變更']
    ]],

['STP 防護四件套 (PortFast / BPDU Guard / Root Guard / Loop Guard)', [
      ['', 'PortFast', 'BPDU Guard', 'Root Guard', 'Loop Guard', ''],
      ['核心功能', '繞過 Listen/Learn，直接進入 Forwarding 狀態', '收到任何 BPDU 即刻關閉介面（進入 err-disabled）', '防止外部/下游交換器搶佔成為 Root Bridge', '防止單向鏈路故障使 Blocking 埠意外進入 Forwarding', '防護機制是 CCNA 考題必考焦點'],
      ['觸發後狀態', '立即進入 Forwarding (加速終端連線與 DHCP 獲取)', 'err-disabled (需 shutdown/no shut 或 errdisable recovery)', 'root-inconsistent 狀態（阻塞流量，BPDU 消失後自動恢復）', 'loop-inconsistent 狀態（阻塞流量，恢復接收 BPDU 後自動還原）', 'Root/Loop Guard 具備自動恢復機制，BPDU Guard 預設需手動復原'],
      ['部署位置', '僅配置在連接終端 (Host/Server) 的 Access 埠', '配置在啟用 PortFast 的邊界埠 (Access Ports)', '配置在指定下游交換器的 Designated Port (禁止設於 Root Port)', '配置在非 Designated Ports (Root Port 或 Alternate 阻塞埠)', '口訣：PortFast/BPDU 顧邊緣、Root 顧下游、Loop 顧備援']
    ]],

['VLAN Access Port vs Trunk Port', [
      ['', 'Access Port', 'Trunk Port', ''],
      ['承載 VLAN 數', '僅允許承載單一 Data VLAN 流量（可外加一個 Voice VLAN）', '承載多個 VLAN（透過 802.1Q 標籤區分不同網段流量）', 'Voice VLAN 採用 802.1p/Q 優先級標籤穿越 Access port'],
      ['連接對象', 'End Host（如 PC、印表機、伺服器、IP Phone）', 'Switch ↔ Switch、Switch ↔ Router（單臂路由）、Switch ↔ AP', 'Trunk 使用標準 IEEE 802.1Q（Tag 佔用 4-byte 欄位）'],
      ['原生 VLAN', '無 Native VLAN 概念（預設全為未打標訊框）', 'Native VLAN 預設明文傳輸（Untagged），兩端 Native ID 必須一致', 'Native VLAN ID 不匹配會引發 CDP 報錯與 VLAN 洩漏']
    ]],

['802.1Q Native VLAN 行為', [
        ['', 'Native VLAN', 'Data VLAN / Trunk 行為', ''],
        ['標籤狀態', '預設明文穿越（Untagged）', '其餘所有 Data VLAN 通過 Trunk 皆強制打上 4-byte 標籤', '兩端 Native ID 不一致會引發不相容、VLAN 洩漏或跳躍攻擊（Hopping）'],
        ['安全建議', '修改預設 VLAN 1 為未使用的獨立編號（如 VLAN 999）', '強制 Native VLAN 打標：<br> 全域指令 vlan dot1q tag native（多數平台標準做法）；部分平台另支援介面下 switchport trunk native vlan tag', '使用 show interfaces trunk 或 show vlan id 驗證一致性']
    ]],

['EtherChannel：LACP vs PAgP vs Static', [
        ['', 'LACP', 'PAgP', 'Static / 註記'],
        ['協定標準', 'LACP（IEEE 802.3ad / 802.1AX 開放標準）', 'PAgP（Cisco 專屬私有協定）', 'Static (On) 模式無任何動態協商'],
        ['模式匹配', 'active / passive（不可雙 passive 匹配）', 'desirable / auto（不可雙 auto 匹配）', 'on 只能對接 on；跨協定或非對應模式則無法綑綁'],
        ['驗證維護', 'show etherchannel summary ➡️ 檢查狀態標籤', '群組顯示 Po1(SU)，成員埠顯示 (P)', 'S=Layer2，U=In Use (正常使用)；P=Bundled in port-channel']
    ]],

['Port Security 三種違規模式', [
      ['', 'Protect (保護)', 'Restrict (限制)', 'Shutdown (關閉/預設)', ''],
      ['行為處理', '丟棄違規封包，不發送任何告警通知', '丟棄違規封包，計數器遞增並發送 Syslog / SNMP Trap', '（預設值）將介面置於 err-disabled，停止所有流量轉發', 'Protect 靜默丟棄、Restrict 記錄警告、Shutdown 關閉介面'],
      ['介面與恢復機制', '介面保持 Up，無需任何恢復程序（僅靜默丟棄違規訊框）', '介面保持 Up，無需恢復程序；可用 show port-security 檢視違規計數器', '介面進入 err-disabled；需手動 shutdown ➡️ no shutdown 或設定 errdisable recovery 復原', '安全等級：Shutdown > Restrict > Protect'],
      ['MAC 學習方式 <br> (獨立維度)', '⚠️ 三種違規模式皆可搭配任一學習方式：<br> Static (手動指定 MAC) / Dynamic (動態學習，重啟消失) / Sticky (黏性學習：動態學習並寫入 running-config)', '', 'Sticky 模式可搭配 copy run start 存入 startup-config', '學習模式與違規模式互不隸屬，考題常混合出題']
    ]],

['MAC Address Table vs ARP Table', [
        ['', 'MAC Address Table', 'ARP Table', ''],
        ['運作設備', 'Layer 2 交換器 (Switch)', 'Layer 3 設備（Router、L3 Switch、Host）', '兩者屬於不同 OSI 層級的核心組件'],
        ['對應關係', '硬體站點對應：MAC 位址 ➡️ 實體埠號 (Port)', '網路協定對應：IP 位址 ➡️ MAC 位址', '交換機查 CAM 表找埠、路由器查 ARP 表找下一跳 MAC']
    ]],

['CDP vs LLDP 鄰居發現協定', [
        ['', 'CDP', 'LLDP', ''],
        ['協定標準', 'CDP（Cisco 專有鄰居發現協定）', 'LLDP（IEEE 802.1AB 開放標準）', '混合廠牌環境、考古題題意涉及業界標準時選 LLDP'],
        ['預設狀態', 'Cisco 設備全域預設啟用（cdp run）', '多數Cisco平台需手動啟用（lldp run）', '指令層級支援全域啟用與介面局部關閉'],
        ['驗證指令', 'show cdp neighbors [detail]', 'show lldp neighbors [detail]', '考古題找對端 IP、IOS 版本或平台型號必加 detail 參數']
    ]],

['Autonomous AP vs Lightweight AP', [
        ['', 'Autonomous AP', 'Lightweight AP', ''],
        ['配置架構', '自主式 AP：每台獨立進行 Management & Data Plane 設定', '輕量型 AP：由無線控制器 (WLC) 進行集中化管理', '企業級主流採用 Controller-based 集中化部署'],
        ['通道協定', '無隧道（直接在實體埠上進行封裝劃分）', '採用 CAPWAP 隧道封裝 Data 與 Control 流量', 'Split-MAC 架構：AP 處理即時 RF，WLC 處理驗證與管理'],
        ['適用規模', '小型 SOHO 環境（1–3 台）', '中大型企業、園區網路', 'WLC 架構支援集中佈署動態通道（RRM）與安全策略']
    ]],

['WLC 發現機制 (WLC Discovery & Join Process)', [
      ['', 'DHCP Option 43', 'DNS 查詢', '本地廣播 / 靜態配置', ''],
      ['運作原理', 'DHCP Server 在 IP 租約中透過 Option 43 提供 WLC IP 位址', 'AP 向 DNS 伺服器查詢 cisco-capwap-controller.<local-domain>', 'AP 發送 L2/L3 子網廣播，或透過 CLI 預先寫入 WLC IP', 'AP 啟動後依序嘗試多種管道搜尋可用控制器'],
      ['適用情境', '跨網段 (L3) 企業大規模部署最推薦標準做法', '跨網段且無 DHCP Option 43 支援時的通用備援機制', '本地同網段 (L2) 測試或離線預先配置 (Staging)', 'CAPWAP 建立需經 Discovery ➡️ DTLS 握手 ➡️ Join ➡️ Config']
    ]],

['AP 運作模式 (AP Modes)', [
      ['', 'Local 模式', 'FlexConnect 模式', 'Monitor / Sniffer 模式', ''],
      ['流量轉發機制', '預設模式；所有 Client 流量封裝入 CAPWAP 集中送往 WLC 轉發', '分支機構專用；支援本地轉發 (Local Switching) 不佔 WAN 頻寬', '不轉發任何客戶端流量（非服務模式）', 'Local 採 Centralized 集中交換；FlexConnect 採 Local 本地交換'],
      ['斷網生存與功能', 'WAN 斷線即中斷服務（依賴與 WLC 連線）', 'WAN 斷線時可切換為 Standalone 模式，維持本地 SSID 轉發與驗證', 'Monitor：專職 WIPS 入侵偵測與 CleanAir 射頻分析<br>Sniffer：抓取空中 RF 訊框重導至 Wireshark', 'FlexConnect 專為 WAN 頻寬有限之 Remote Branch 分支設計']
    ]],

['2.4 GHz vs 5 GHz', [
        ['', '2.4 GHz', '5 GHz', ''],
        ['頻道劃分', '僅 1、6、11 三個通道互不重疊（台灣/美規標準）', '通道數量極多，非重疊頻道充裕、互不干擾', '2.4G 頻寬窄易受干擾，記住 1-6-11 核心考點'],
        ['物理特性', '波長較長：穿透力（穿牆）強、傳輸距離遠，但速率慢', '波長較短：速率極快、抗干擾強，但衰減快、覆蓋範圍小', '實務設計漫遊（Roaming）或大範圍覆蓋考量優先評估 2.4G']
    ]],

['DHCP Snooping vs DAI vs IP Source Guard', [
        ['', 'DHCP Snooping', 'DAI', 'IP Source Guard', ''],
        ['防禦目標', '防範非法 DHCP 伺服器（Rogue DHCP Server）與耗盡攻擊', '防範 ARP 欺騙/中間人攻擊（ARP Spoofing / MITM）', '防範 IP 位址冒用/欺騙（IP / MAC Spoofing）'],
        ['依賴關係', '透過監聽 DHCP 封包動態建立 DHCP Snooping Binding Table', '直接比對 Snooping 綁定表以驗證非信任埠的 ARP 應答', '結合 802.1X 或 Snooping 表驗證 IP+MAC 組合是否合法', '安全性順序：Snooping ➡️ DAI ➡️ IPSG，非信任埠（Untrusted Port）是防禦起點']
    ]]

]],

['IP Connectivity', [
['Static Route vs Default Route', [
      ['', 'Static Route', 'Default Route', ''],
      ['定義與目的', '靜態路由：手動指定特定目的地網段（如 10.1.1.0/24）', '預設路由：以 0.0.0.0/0 匹配所有未知的目的地', '預設路由在路由表中被稱為 Gateway of last resort'],
      ['管理距離與標記', '靜態路由預設 AD 值 = 1（出向介面或下一跳 IP）', '預設路由 AD 值亦為 1，但其功能為最終手段', '在 show ip route 中，靜態標記為 S，預設路由標記為 S*（* 為候選預設）']
    ]],

['Longest Prefix Match vs AD vs Metric', [
      ['', 'Longest Prefix Match (LPM)', 'Administrative Distance (AD)', 'Metric', ''],
      ['仲裁與路由抉擇', '① 最長前綴匹配（LPM）：<br> 子網路遮罩最長者最優先，此為第一優先判定準則', '② 管理距離（AD）：<br> 若前綴長度完全相同，則比較來源路由協定的可信度', '③ 度量值（Metric）：<br> 若前綴與 AD 皆相同，則比較該協定內部演算法計算出的開銷值', '經典考題：/24 Static (AD 1) 必然勝過 /16 OSPF (AD 110) ➡️ LPM 優先於 AD']
    ]],

['常見路由協定 AD 值', [
      ['', '內部 / 靜態協定', '外部 / 動態協定', ''],
      ['AD 數值對比', 'Connected=0 / Static=1 / EIGRP (Internal)=90 / OSPF=110', 'RIP=120 / EIGRP (External)=170 / BGP (External)=20', 'AD 數字越小越可信；調整靜態路由 AD 大於動態路由（如設為 125）即可做為「浮動靜態路由」備援']
    ]],

['OSPF Broadcast vs Point-to-Point vs NBMA', [
      ['', 'Broadcast', 'Point-to-Point', 'NBMA <br>(目前非CCNA考試範圍)', ''],
      ['DR / BDR 選舉', '有選舉（在多路接取環境中減少鄰居關係數量）', '無選舉（兩端直接建立鄰接關係 Full 狀態）', '有選舉（需手動指定鄰居，P2P 則免選舉）', '乙太網路介面預設為 Broadcast 網路類型'],
      ['計時器間隔', 'Hello 10 秒 / Dead 40 秒', 'Hello 10 秒 / Dead 40 秒', 'Hello 30 秒 / Dead 120 秒', '⭐CCNA 核心考點：<br> 計時器（Hello / Dead Timer）兩端必須一致才能建立鄰居；<br> NBMA 專屬 ATTEMPT 狀態：以 neighbor 手工指定後等待對方回應 Hello；若 Hello/Dead 不匹配則鄰居完全無法建立']
    ]],

['OSPF DR/BDR 選舉 vs RSTP 根橋選舉', [
      ['', 'OSPF DR/BDR 選舉', 'RSTP 根橋選舉', ''],
      ['比較參數與邏輯', '最高 介面 Priority（0 代表不參選） ➡️ 最高 Router ID（手動設定 ➡️ Loopback ➡️ 最大實體 IP）', '最低 Bridge Priority（必須為 4096 倍數） ➡️ 最低 MAC 位址', '秒殺重點：OSPF 選舉取數值最大者優先，STP 選舉取數值最小者優先，兩者邏輯完全相反'],
      ['搶佔行為（Preemption）', '不具備搶佔性。除非重啟 OSPF 程序（clear ip ospf process）或 DR 故障，否則後加入的高優先級路由器不會奪權', '具備動態搶佔性。若網路上加入一台擁有更低 Priority 的交換器，將會立即重新計算並搶佔成為新根橋', '維持網路拓樸穩定：OSPF 先到先得、STP 由參數絕對決定']
    ]],

['Standard vs Extended ACL', [
      ['', 'Standard ACL (標準)', 'Extended ACL (擴充)', ''],
      ['過濾匹配條件', '標準 ACL：僅能根據「來源 IP 位址」進行流量過濾', '擴充 ACL：可根據「來源/目的 IP」、「協定類型 (IP/TCP/UDP/ICMP)」及「Port 埠號」進行精確過濾', '擴充 ACL 即為典型的網路五元組檢查'],
      ['編號範圍劃分', '標準 ACL 編號：1–99, 1300–1999', '擴充 ACL 編號：100–199, 2000–2699', '具名 ACL（Named ACL）則直接使用自訂字串命名，無編號範圍限制'],
      ['部署放置位置', '應儘可能放置在靠近「目的地」的設備上（避免誤殺其他正常流量）', '應儘可能放置在靠近「來源地」的設備上（及早丟棄違規流量，節省網路頻寬）', '官方口訣：Standard 靠目的、Extended 靠來源'],
      ['匹配規則與結尾', '結尾皆隱含 deny any 拒絕所有流量；若全寫 deny，務必補上 permit any', '由上而下逐條匹配，一旦匹配成功即停止下查', '先細後粗（先拒絕特定主機，再允許整段網段）']
    ]],

['SVI vs Router-on-a-Stick', [
      ['', 'SVI (三層交換)', 'Router-on-a-Stick (單臂路由)', ''],
      ['適用硬體架構', '配置於三層交換器上（如 interface vlan 10），為該 VLAN 的網關', '配置於路由器子介面，需使用 encapsulation dot1q <VLAN_ID> 封裝指令', '三層交換器使用 SVI 進行多 VLAN 間路由，單臂路由則仰賴子介面'],
      ['轉發效能與頻寬', '利用 ASIC 晶片進行硬體級線速轉發，無單一鏈路頻寬瓶頸', '所有 VLAN 間流量皆必須通過單一 Trunk 往返路由器，易成瓶頸與單點故障風險', '企業核心骨幹首選 SVI，小規模環境採用 ROAS']
    ]],

['HSRP vs VRRP vs GLBP', [
      ['', 'HSRP', 'VRRP', 'GLBP', ''],
      ['協定標準與特性', 'Cisco 私有協定，提供作用/備援虛擬網關', 'IEEE 開放標準協定，功能與 HSRP 類似', 'Cisco 私有協定，真正支援單一網關多 MAC 的動態負載平衡', '第一跳備援協定 (FHRP) 家族'],
      ['角色與專有名詞', 'Active (主動) / Standby (備援)', 'Master (主導) / Backup (備援)', 'AVG (活動虛擬網關) / AVF (活動虛擬轉發器)', '預設皆為單主動轉發，僅 GLBP 支援多節點負載分流'],
      ['虛擬 MAC 位址', '0000.0C07.ACxx (xx 為十六進位組別編號)', '0000.5E00.01xx (xx 為十六進位組別編號)', '0007.b400.xxyy (xx 為組別，yy 為 AVF 編號)', '⭐CCNA 核心考點：<br> HSRP 預設 Priority 為 100；需配置 preempt 搶佔']
    ]]
]],

['IP Services', [
    ['Static NAT vs Dynamic NAT vs PAT (NAT Overload)', [
      ['', 'Static NAT (靜態一對一)', 'Dynamic NAT (動態位址池)', 'PAT / Overload (埠號位址轉換)', ''],
      ['映射對應與方向', '私網 IP 永久一對一固定綁定公網 IP；支援內外雙向連線發起', '私網 IP 暫時租借公網 IP 位址池 (Pool)；位址池耗盡則後續主機無法連線', '多台私網主機透過「公網 IP + 傳輸層 Port 埠號」共用連線上網', '企業與家用最普及方案為 PAT (NAT Overload)'],
      ['配置關鍵與語法', 'ip nat inside source static <local_ip> <global_ip>', 'ip nat inside source list <acl> pool <pool_name>', 'ip nat inside source list <acl> interface <int> overload', 'PAT 漏設 overload 關鍵字會降級為動態 NAT 導致連線中斷'],
      ['適用場景與維護', '內部對外發布伺服器（Web / Mail / FTP）需固定公網 IP', '早期有限公網 IP 環境，無法解決 IP 短缺，現已極少單獨使用', '大量內部終端共用單一公網 IP（單一公網 IP 可支撐約 65,000 個 L4 連線會話）', '驗證指令：show ip nat translations / clear ip nat trans *']
    ]],

    ['DHCP 運作原理 (DORA) 與 DHCP Relay Agent', [
      ['', 'DHCP 交互四步驟 (DORA)', 'DHCP Relay Agent (中繼代理)', '重要配置指令與考點', ''],
      ['運作機制與封包', 'Discover (廣播尋找 Server) ➡️ Offer (提供 IP) ➡️ Request (廣播請求確認) ➡️ ACK (正式確認租約)', '當 Client 與 DHCP Server 跨越路由器時，路由器必須扮演 Relay Agent 轉發請求', 'DHCP Client 使用 UDP 68，DHCP Server 使用 UDP 67', 'Discover 與 Request 由 Client 廣播發出，確保多 Server 環境協調'],
      ['轉發原理與配置', '路由器預設阻斷廣播；在「接收 Client 廣播的介面」配置 ip helper-address <DHCP_Server_IP>', 'ip helper-address 會將廣播的 Discover/Request 轉換為「單播 (Unicast)」轉發給遠端 DHCP Server', '除 DHCP (UDP 67/68) 外，helper-address 預設同時中繼 TFTP (69)、DNS (53)、Time (37) 等 UDP 廣播', '⭐CCNA 核心考點：<br> ip helper-address 必須配置在靠近 Client 的路由器介面上']
    ]],

    ['Syslog 系統日誌架構與嚴重度等級', [
      ['', '嚴重度等級 (0–7)', '日誌訊息格式規範', '傳輸與過濾配置', ''],
      ['等級劃分與含義', '0 Emergency (崩潰) / 1 Alert (急救) / 2 Critical (嚴重) / 3 Error (錯誤) / 4 Warning (警告)', '5 Notification (正常事件，如介面 Up/Down) / 6 Informational (操作紀錄) / 7 Debugging (除錯調試)', '🍦口訣：「Every Awesome Cisco Engineer Will Need Ice cream Daily」（7級對應7字）', '數字越小越緊急；4 以下多代表設備或介面故障異常'],
      ['格式解析與指令', '標準格式：*Timestamp: %FACILITY-SEVERITY-MNEMONIC: Description', '範例：%LINK-3-UPDOWN (3 代表 Error 級別；%SYS-5-CONFIG_I 代表 5 級 Notification)', 'logging trap <level>：設定日誌伺服器發送門檻（例如設 warning 4 則發送 0–4 級日誌）', '預設傳輸走 UDP 514；show logging 檢視記憶體緩衝區 (Buffered) 日誌與配置']
    ]],

    ['NTP 角色、層級 (Stratum) 與安全認證', [
      ['', 'NTP 角色與模式', 'Stratum 層級架構 (0–16)', '安全認證與指令驗證', ''],
      ['運作機制與架構', 'Server (提供時鐘)、Client (主動請求校時)、Peer (同級設備雙向對等校準備援)', 'Stratum 0 (原子鐘/GPS 硬體源) ➡️ Stratum 1 (直連 0 級) ➡️ Stratum 2–15 (逐層向下同步)', 'NTP 運作於 UDP 123 埠；透過 MD5 對稱金鑰啟用認證，防止惡意時間戳竄改攻擊', '每向下同步一跳 Stratum 數值自動 +1'],
      ['層級狀態與判定', 'Stratum 數值範圍 1–15；數字越小代表越接近精確時鐘源，可信度越高', 'Stratum 16 代表「未同步 (Unsynchronized)」或時鐘源失效不可信', 'show ntp status 檢查 Clock is synchronized 與當前 Stratum 層級', 'show ntp associations 檢視上游伺服器（* 為當前同步源，# 為備選源）'],
      ['安全認證三部曲', '① ntp authenticate (啟用全域認證功能)', '② ntp authentication-key <id> md5 <key> (定義金鑰編號與密碼)', '③ ntp trusted-key <id> (指定信任該金鑰編號)', '三指令缺一不可，兩端 Key ID 與 Key 字串必須完全一致']
    ]],

    ['SNMP v1/v2c vs v3 架構與安全模型', [
      ['', 'SNMP v1 / v2c', 'SNMP v3', '訊息操作與傳輸埠號', ''],
      ['安全防護模型', '僅依賴社群字串 (Community String, RO/RW) 作為密碼，且以明文在網路傳輸，無加密保護', '提供 USM 使用者模型與 VACM 存取控制，支援三種等級：noAuthNoPriv / authNoPriv / authPriv', 'CCNA 考試資安最佳實踐唯一指名 SNMP v3 authPriv (SHA 認證 + AES 加密)', 'UDP 161 (NMS 查詢 Agent) / UDP 162 (Agent 告警 NMS)'],
      ['訊息操作類型', 'Get / GetNext / Set：由 NMS 主動發起，查詢或修改設備 MIB 節點變數<br><br>GetBulk：RFC 1906 於 v2c 引入，v3 延用，一次請求大量取得 MIB 數據（非 v3 專屬功能）', '沿用 v2c 的 GetBulk 操作；核心差異在 USM 安全模型而非新增訊息類型', 'Trap (UDP 162)：Agent 發生事件時主動推送，不需 NMS 回覆 ACK (Unreliable)<br><br>Inform (UDP 162)：Agent 主動推送但必須收到 NMS 回傳 ACK 確認 (Reliable)', '秒殺考點：<br> Trap 不需確認 (Unreliable) vs Inform 需要 ACK (Reliable)']
    ]],

    ['QoS 核心機制、分類標記 (CoS vs DSCP) 與佇列', [
      ['', 'Layer 2 CoS (802.1p)', 'Layer 3 IP Precedence', 'Layer 3 DSCP (DiffServ)', ''],
      ['所在欄位與規格', '位於 802.1Q VLAN 標籤的 PRI 欄位 (3-bit)，值域 0–7', '位於 IPv4 ToS 位元組前 3-bit，值域 0–7（已過時，被 DSCP 取代）', '位於 IPv4 ToS / IPv6 Traffic Class 前 6-bit，值域 0–63 (後 2-bit 為 ECN)', 'DSCP 前 3-bit 與 IPP 向下相容 (Class Selector CS0–CS7)'],
      ['常用標準值', 'CoS 5 (語音 Voice) / CoS 3 (視訊 Video) / CoS 0 (最佳努力 Best Effort)', 'IPP 5 (Voice) / IPP 3 (Call Signaling) / IPP 0 (Best Effort)', 'EF (Expedited Forwarding = 46，專屬語音) / AF41 (視訊) / AFxy (x=類別, y=丟棄機率)', '語音 QoS 指標：單向延遲 ≤ 150ms、抖動 ≤ 30ms、丟包率 ≤ 1%'],
      ['處理機制 (MQC)', '分類與標記：於信任邊界 (Trust Boundary) 透過 class-map 與 policy-map 標記流量', '流量管制 (Policing)：超出頻寬直接丟棄 (突發鋸齒) vs 流量整形 (Shaping)：超額快取平滑送出', '佇列排程 (Congestion Management)：LLQ (低延遲佇列 = PQ + CBWFQ，語音優先走 PQ 轉發)', '在靠近來源端的信任邊界（如 IP Phone）完成標記']
    ]],

    ['DNS 基礎概念與Cisco設備配置', [
      ['', '常用 DNS 紀錄類型', '思科設備 DNS 配置指令', '排查與除錯技巧', ''],
      ['紀錄類型與用途', 'A (IPv4 解析) / AAAA (IPv6 解析) / PTR (反向指標：IP 轉網名) / CNAME (別名) / MX (郵件伺服器)', 'ip name-server <ip1> <ip2> (配置設備查詢的外部 DNS 伺服器 IP)', 'ping <hostname> 驗證網關是否能成功透過 DNS 獲取 IP 並連通', 'DNS 一般查詢走 UDP 53，區域傳送 (Zone Transfer) 走 TCP 53'],
      ['域名查找控制', '預設啟用 ip domain-lookup；輸入錯誤 CLI 指令時設備會誤判為域名查詢導致終端卡頓', 'no ip domain-lookup：關閉 CLI 錯誤指令的 DNS 解析（實驗室與實務強烈建議配置）', 'ip domain-name <domain>：指定設備預設網域名稱（配置 SSH 產生 RSA 金鑰時為必備前置條件）', 'crypto key generate rsa 前必須先設定 hostname 與 ip domain-name']
    ]],

    ['TFTP vs FTP 差異與 IOS 映像檔/設定管理', [
      ['', 'TFTP (Trivial FTP)', 'FTP (File Transfer Protocol)', 'IOS 映像檔管理與暫存器', ''],
      ['傳輸協定特性', '基於 UDP 69 傳輸；無認證、無加密、無目錄瀏覽，封包開銷極小，適用 LAN 內快速備份', '基於 TCP 20 (Data) / TCP 21 (Control) 雙通道傳輸；需帳號密碼認證，具備連線可靠性', 'copy running-config tftp: / copy tftp: flash: (備份與還原必考指令)', 'verify /md5 flash:<file> 驗證 IOS 映像檔 MD5 雜湊值防損毀'],
      ['引導順序與暫存器', 'boot system flash:<ios_name>.bin (指定開機引導的 IOS 檔案順序)', 'Configuration Register (組態暫存器)：0x2102 (預設值：從 Flash 開機並載入 startup-config)', '密碼恢復 (Password Recovery) 流程：修改暫存器為 0x2142 (開機跳過 startup-config) ➡️ 重啟後 copy start run ➡️ 改密碼 ➡️ 改回 0x2102 ➡️ 儲存', 'CCNA 必背十六進位：0x2102 正常開機 vs 0x2142 密碼恢復']
    ]]
]],

['Security Fundamentals', [
    ['密碼儲存與雜湊防護 (Password vs Secret)', [
      ['', 'enable password', 'enable secret', '雜湊演算法與類型對比', ''],
      ['演算法與安全等級', '預設明文儲存；啟用 service password-encryption 後以 Type 7 (Vigenère 弱加密) 儲存，極易被秒殺破解', '採用不可逆單向雜湊演算法；預設為 Type 5 (MD5)，新版 IOS 支援 Type 8 (PBKDF2 SHA-256) 或 Type 9 (SCRYPT)', 'Type 7 僅防偷看 (Obfuscation)；Type 5/8/9 具備高強度抗碰撞防破解性', '⭐CCNA 核心考點：<br> 密碼雜湊強度 Type 9 > Type 8 > Type 5 > Type 7 > Type 0 (明文)'],
      ['系統優先權與實例', '同時配置時，系統自動優先採用 enable secret 並忽略 enable password', '實務建議：全域配置 enable secret 與 username <name> secret <pass>，徹底淘汰 password 指令', 'service password-encryption 僅將設定檔中的明文 (Type 0) 轉為 Type 7，無法防禦資深攻擊者', '密碼恢復 (Password Recovery) 利用暫存器 0x2142 跳過 startup-config 繞過 secret']
    ]],

    ['Layer 2 安全防禦機制總表', [
      ['', '防禦目標 (Threat / Attack)', '部署位置 (Placement)', '觸發行為與狀態 (Action / State)', '恢復機制與核心考點', ''],
      ['PortFast & BPDU Guard', '防止非法交換器接入導致 STP 拓樸震盪或偽冒 Root Bridge', '部署於連接終端的 Access 埠（通常與 PortFast 共同啟用）', '收到任何 BPDU 即刻關閉介面，將介面置於 err-disabled 狀態', '恢復：需手動 shutdown / no shutdown 或設定 errdisable recovery', 'PortFast 繞過 Listen/Learn 直接進入 Forwarding'],
      ['Root Guard', '防止外部/下行交換器以更低 Priority 搶佔成為根橋 (Root Bridge)', '部署於管理者控制的下行指定埠 (Designated Ports，嚴禁設於 Root Port)', '收到優勢 BPDU (Superior BPDU) 時，將埠置於 root-inconsistent 狀態並阻斷流量', '恢復：劣勢/優勢 BPDU 消失後「自動恢復」為正常轉發', '維持核心交換器身為 Root Bridge 的絕對穩定性'],
      ['DHCP Snooping', '防範非法 DHCP 伺服器 (Rogue DHCP) 冒發網關/DNS 進行 MITM，以及 DHCP 耗盡攻擊', '全域啟用後，將連接合法伺服器/上行 Trunk 設為 Trusted，其餘 Access 埠預設 Untrusted', 'Untrusted 埠收到 DHCP Offer / ACK 立即丟棄；監聽合法 DHCP 交互建立 Snooping Binding Table', '建立 IP-MAC-VLAN-Port 綁定資料庫，為 DAI 與 IPSG 提供底層數據支撐', '必備前置指令：ip dhcp snooping + ip dhcp snooping vlan <vlan-id>'],
      ['Dynamic ARP Inspection (DAI)', '防範 ARP 欺騙 / 中間人攻擊 (ARP Spoofing / Poisoning / MITM)', '基於 VLAN 啟用；連接路由器/信任交換器的介面設為 Trusted，其餘埠設為 Untrusted', 'Untrusted 埠收到 ARP 封包時，強制比對 DHCP Snooping 綁定表（IP-to-MAC 映射），不符則丟棄', '針對靜態 IP 設備可搭配 arp access-list 進行靜態條目驗證', '依賴關係：DAI 強烈依賴 DHCP Snooping 建立的綁定表'],
      ['Port Security', '防範 MAC 位址表耗盡攻擊 (CAM Table Flooding) 及未授權實體設備接入', '僅部署於靜態 Access 埠（不可配置於動態 Trunk 埠或 EtherChannel 成員埠）', '違規模式：Protect (靜默丟棄) / Restrict (丟棄+計數+Syslog) / Shutdown (關閉埠至 err-disabled)', 'MAC 學習：Static (手動指定)、Dynamic (重啟消失)、Sticky (動態學習並寫入 running-config)', '啟用指令：switchport mode access ➡️ switchport port-security']
    ]],
  
    ['SSH vs Telnet 安全遠端管理', [
      ['', 'SSH (安全外殼協定)', 'Telnet (遠端登入協定)', '配置前置鏈與考點', ''],
      ['傳輸安全與埠號', '採用 TCP 22 埠；所有連線帳密與指令皆透過非對稱/對稱密鑰進行高強度加密', '採用 TCP 23 埠；所有數據（含密碼）皆以明文 (Cleartext) 傳輸，易遭竊聽與 MITM 攻擊', 'CCNA 考試與安全指引：遠端管理全面強制停用 Telnet，採用 SSHv2', '明文協定陷阱：HTTP (80)、Telnet (23)、SNMPv1/v2c、TFTP (69)'],
      ['SSH 五步標準配置', '① hostname <name> ➡️ ② ip domain-name <domain> (指定網域名稱)', '③ crypto key generate rsa (生成 RSA 密鑰以啟動 SSH 服務)', '④ username <user> secret <pass> ➡️ ⑤ line vty 0 4 下配置 login local 與 transport input ssh', '⭐CCNA 核心考點：<br>缺少 hostname 或 domain-name 將無法生成 RSA 金鑰'],
      ['安全加固與驗證', 'ip ssh version 2 (強制指定 SSHv2，防範 SSHv1 弱點)', 'ip ssh time-out <sec> (連線超時) / ip ssh authentication-retries <num> (重試次數)', 'transport input ssh 能有效阻絕 Telnet 協定連入', '驗證指令：show ip ssh 與 show ssh']
    ]],

    ['802.11 無線安全協定演進', [
      ['', 'WEP (有線等效加密) / WPA', 'WPA2 (無線安全存取)', 'WPA3 (第三代安全標準)', 'CCNA 核心定義 / 必考重點'],
      ['加密演算法', 'WEP：RC4 (靜態金鑰，極易破解)<br>WPA：TKIP + RC4 (動態金鑰改良版)', 'CCMP (基於 AES 128-bit 區塊加密)', 'Personal：CCMP-128 (AES)<br>Enterprise：GCMP-256 (AES，強制 CNSA 套件)', '⭐CCNA 核心連連看：<br>1. WEP / WPA ＝ 採用 RC4 體系<br>2. WPA2 ＝ 採用 CCMP (AES) [第一個真正安全的協議]<br>3. WPA3 ＝ 標準用 CCMP / 強固企業版用 GCMP'],
      ['完整性驗證', 'WEP：採 CRC-32 (僅檢錯，無完整性校驗)<br>WPA：TKIP (Michael MIC)', '基於 AES 的 CBC-MAC (CCMP 內建)', 'Personal：CBC-MAC<br>Enterprise：GMAC', ''],
      ['認證部署模式 (考題大宗)', 'WEP: Shared Key (靜態共用金鑰)<br>WPA: PSK 或 802.1X/RADIUS', 'Personal: PSK (預共享金鑰)<br>Enterprise: 802.1X/EAP + RADIUS', 'Personal：SAE (對等同步認證，防離線暴力破解)<br>Enterprise：802.1X/EAP + RADIUS', '⭐必考觀念：<br>1. 只要看到 Enterprise 模式，後端必選 802.1X 與 RADIUS 伺服器。<br>2. WPA3-Personal 改用 SAE 取代 WPA2 的 PSK。'],
    ]],

    ['AAA 架構：TACACS+ vs RADIUS', [
      ['', 'TACACS+ (思科私有)', 'RADIUS (開放標準)', 'AAA 核心定義 / 考點', ''],
      ['核心職責 (A-A-A)', '將 Authentication (認證)、Authorization (授權)、Accounting (計帳) 三者完全分離', '將 Authentication 與 Authorization 合併處理，僅 Accounting 獨立運作', '認證 (你是誰) ➡️ 授權 (能做什麼/權限 0–15) ➡️ 計帳 (做了什麼/審計)', 'TACACS+ 具備精細的「逐條指令授權 (Per-command)」能力'],
      ['傳輸協定與加密', '採用 TCP 49 埠；對「整個封包本體 (Payload)」進行完全加密', '採用 UDP 1812 (認證/授權) / 1813 (計帳) 埠；僅加密「密碼屬性 (User-Password)」', '舊版 RADIUS 埠號為 UDP 1645 / 1646；TACACS+ 傳輸可靠度與安全性更高', '802.1X (EAPoL) 網路存取認證後端強制結合 RADIUS 伺服器'],
      ['驗證與配置指令', 'test aaa group <group> <user> <pass> legacy (驗證伺服器連線)', 'show aaa servers (檢視 AAA 伺服器連線狀態與封包計數)', 'aaa new-model 為全域啟用 AAA 機制之首要前置指令', '⭐CCNA 核心考點：<br>設備管理授權首選 TACACS+；網路存取控制 (802.1X/VPN) 首選 RADIUS']
    ]],

    ['Site-to-Site vs Remote Access VPN 與 IPSec / IKE 機制', [
      ['', 'Site-to-Site VPN', 'Remote Access VPN', 'IPSec 協定與 IKE 階段', ''],
      ['架構與連線形式', '連接分支機構與總部閘道器 (Router ↔ Router / ASA)；對終端完全透明且免裝撥接軟體', '連接個別行動員工至企業閘道器；需安裝撥接客戶端 (如 Cisco AnyConnect / Secure Client)', 'Remote Access 支援 SSL/TLS (TCP 443) 或 IPsec VPN 撥接', 'S2S 取代昂貴專線；Remote Access 專為彈性遠端辦公設計'],
      ['IPSec 核心協定', 'AH (IP 協定編號 51)：提供身分驗證與完整性檢驗 (HMAC)，但「無加密能力」，不支援 NAT-T', 'ESP (IP 協定編號 50)：提供資料加密 (AES/3DES)、完整性與抗重播 (Anti-replay)，為 VPN 核心協定', 'NAT-Traversal (NAT-T)：當 ESP 穿越 NAT 設備時，會將 ESP 封裝為 UDP 4500 封包', '考題秒殺：涉及資料機密性 (Confidentiality) 必選 ESP'],
      ['IKE 協商階段', 'IKE Phase 1 (ISAKMP SA)：保護管理控制流量；透過 DH 演算法建立雙向安全通道 (UDP 500)', 'IKE Phase 2 (IPSec SA)：建立資料轉發通道；協商 Transform Set 與 ACL 流量，產生一對單向 IPSec SA', 'Diffie-Hellman (DH) 群組數字越大金鑰越長安全度越高 (如 Group 14/19/21)', '⭐CCNA 核心考點：<br> Phase 1 建立管理通道；Phase 2 建立數據通道']
    ]]

  ]
],

[
  'Automation & Programmability', [
    ['Controller-Based 架構 vs 傳統分散式網路架構', [
      ['', '傳統分散式架構', 'Controller-Based (SDN 架構)', 'Cisco Catalyst Center (DNA-C)', ''],
      ['平面分工與運作', '控制平面 (Control Plane) 與管理平面分散於每台設備本地獨立運算 (如 OSPF/STP)', '控制與管理平面集中於 SDN 控制器進行全域運算與派送；資料平面 (FIB) 保留在本地線速轉發', '四大核心工作流：Design (設計) ➡️ Policy (原則) ➡️ Provision (部署) ➡️ Assurance (監控除錯)', 'SDN 僅分離控制與管理平面，資料轉發仍由硬體 ASIC 執行'],
      ['管理效益與部署', '逐台 CLI/SNMP 手動設定，易人為出錯、擴展性低且缺乏全網拓樸可視性', '意圖導向網路 (IBN)；全域集中下發策略、自動化佈建與 AI/ML 網路健康度分析', '提供 Fabric 疊加網路 (Overlay) 與底層實體架構 (Underlay) 集中可視化管理', '⭐CCNA 核心考點：<br> SDN 架構具備集中化管理、全網可視與高擴展性']
    ]],

    ['Northbound (北向) vs Southbound (南向) API 三層架構', [
      ['', '北向 API (Northbound)', '南向 API (Southbound)', '代表性協定與技術', ''],
      ['架構位置與連接對象', '位於 SDN 控制器上方；連接 Controller 與「上層應用程式 / 管理腳本 / 業務軟體」', '位於 SDN 控制器下方；連接 Controller 與「底層實體/虛擬網路設備 (Switch/Router)」', 'Northbound: REST API (JSON/HTTPS)<br>Southbound: NETCONF, RESTCONF, gRPC, OpenFlow', '北向負責業務意圖；南向負責設備配置與狀態收集'],
      ['管理協定特性對比', '透過標準 RESTful 請求下發高層策略 (Intent-based)', 'NETCONF (RFC 6241)：走 SSH (TCP 830)，採用 XML 與 RPC 交互<br>RESTCONF (RFC 8040)：走 HTTPS，採用 JSON/XML，提供 RESTful 介面', 'YANG (RFC 6020/7950)：NETCONF 與 RESTCONF 所使用的資料建模語言 (Data Model)', 'NETCONF 基於 XML/SSH；RESTCONF 基於 JSON/HTTPS']
    ]],

    ['Cisco SD-Access (SDA) Fabric 4 大節點角色與職責', [
      ['', 'Fabric Control Plane Node', 'Fabric Edge Node', 'Fabric Border Node', 'Fabric Intermediate Node'],
      ['核心職責與功能', '維護 Fabric 映射資料庫（HTDB）；追蹤端點（Endpoints）與 Edge Node 關聯', '終端設備接入點；負責端點識別、註冊，並進行 VXLAN 封裝與解封裝', '連接 SDA Fabric 與外部網路（如 WAN/Internet/傳統 LAN）的邊界閘道', '底層 Underlay 核心/分發交換機；僅負責純 IP 路由轉發，不跑 VXLAN'],
      ['依賴協定與技術', '基於 LISP（Locator/ID Separation Protocol）協定運作', '提供 Anycast Gateway；執行 VXLAN 封裝 + TrustSec (SGT) 安全策略', '負責 LISP-to-BGP / VRF 路由重分配與外部連通性', '運行 IS-IS 或 OSPF；完全不參與 Overlay / VXLAN 運算'],
      ['口訣與秒殺速記', 'Control 查 LISP 找人、Edge 接終端做封裝、Border 當外網閘道、Intermediate 純 Underlay 轉發']
    ]],

    ['REST API 機制與 CLI 特性對比', [
      ['', '傳統 CLI 管理', 'REST API 可程式化管理', 'REST 架構約束 (Constraints)', ''],
      ['互動模式與資料格式', '純文字 (Plain Text) 非結構化輸出；需撰寫 Screen-Scraping 正則表達式解析', '結構化資料 (JSON/XML)；透過標準 URI 操作資源，易於自動化腳本讀取與批次處理', '六大原則：Client-Server、Stateless、Cacheable、Uniform Interface、Layered System、Code-on-Demand', 'REST API 大幅降低自動化開發與維護成本'],
      ['連線狀態與通訊', '具狀態性 (Stateful)；維持 Session 登入連線，斷線需重新驗證', '無狀態性 (Stateless)；每次 HTTP 請求皆獨立且必須自帶驗證金鑰 (如 Bearer Token)', 'CRUD 操作映射至標準 HTTP 動詞 (GET / POST / PUT / PATCH / DELETE)', 'REST API 核心特徵：Stateless (無狀態) 請求']
    ]],

    ['HTTP 動詞與 CRUD 及 REST API 狀態碼 (Status Code)', [
      ['', 'CRUD 操作', 'HTTP 動詞 (Methods)', '常見 HTTP 狀態碼 (Status Code)', ''],
      ['讀取與建立 (R / C)', 'Read (讀取現有資源) ➡️ GET<br>Create (建立全新資源) ➡️ POST', 'GET (冪等性/安全讀取)<br>POST (非冪等/伺服器建立資源並分配 URI)', '200 OK (請求成功)<br>201 Created (資源成功建立)<br>204 No Content (成功但無回傳內容)', 'GET 具備 Idempotent (冪等性)，POST 則無'],
      ['更新與刪除 (U / D)', 'Update/Replace (全量替換覆蓋) ➡️ PUT<br>Partial Update (局部欄位修改) ➡️ PATCH<br>Delete (刪除指定資源) ➡️ DELETE', 'PUT / DELETE (具冪等性)<br>PATCH (通常非冪等/局部修改)', '400 Bad Request (語法錯誤)<br>401 Unauthorized (未驗證/缺少 Token)<br>403 Forbidden (已驗證但權限不足)<br>404 Not Found (資源不存在)', '401 為未驗證身分；403 為權限不足被拒存取'],
      ['伺服器端錯誤', '伺服器內部異常或上游閘道無回應', '500 Internal Server Error (後端服務崩潰)<br>502 Bad Gateway (閘道無效回應)<br>503 Service Unavailable (伺服器超載/維護中)', '5xx 狀態碼皆代表伺服器端 (Server-side) 發生錯誤', '⭐CCNA 核心考點：<br>2xx 成功、3xx 重導、4xx 用戶端錯、5xx 伺服端錯']
    ]],

    ['自動化組態管理工具對比 (Ansible vs Terraform vs Puppet vs Chef)', [
      ['', 'Ansible', 'Terraform', 'Puppet', 'Chef', ''],
      ['代理程式與傳輸模式', 'Agentless (免裝代理)；透過 SSH / NETCONF 傳輸；Push (推式) 模式', 'Agentless (免裝代理)；透過 Cloud/Device API 傳輸；Push (推式) 模式', 'Agent-based (需裝代理)；透過 HTTPS 傳輸；Pull (拉式) 模式', 'Agent-based (需裝代理)；透過 HTTPS 傳輸；Pull (拉式) 模式', 'Ansible 與 Terraform 皆為免裝代理 (Agentless)'],
      ['組態檔案與語言格式', 'Playbook 劇本；採用 YAML 語法格式（易讀性高）', '設定檔 (`.tf`)；採用 HashiCorp 自家 HCL 語法格式', 'Manifest 清單 (`.pp`)；採用 Puppet 專用 DSL (基於 Ruby)', 'Cookbook / Recipe 食譜；採用純 Ruby 語法撰寫', 'Ansible 用 YAML；Terraform 用 HCL；Chef/Puppet 用 Ruby'],
      ['核心定位與考點', '組態設定管理 (Configuration Management) 與自動化任務編排', '基礎架構即代碼 (IaC)；專注於多雲與虛擬資源佈建 (Provisioning)', '企業級自動化配置與持續合規狀態維護 (State Enforcement)', '以代碼管理伺服器與基礎架構狀態 (Infrastructure as Code)', '⭐CCNA 核心考點：<br> Ansible 為 Agentless + Push + YAML']
    ]],

    ['資料序列化格式規格 (JSON vs YAML vs XML)', [
      ['', 'JSON', 'YAML', 'XML', ''],
      ['語法特徵與結構', '鍵值對 `{"key": "value"}`；物件用 `{}`、陣列用 `[]`，逗號分隔，鍵名必加雙引號 `""`，不支援註解', '依靠「空格縮排」表達階層，陣列項目以連字號 `-` 開頭，支援 `#` 註解，可讀性最高', '類似 HTML 標籤 `<tag>value</tag>`，需嚴格成對閉合標籤，文本冗長嚴謹', 'JSON 用括號；YAML 用縮排；XML 用標籤'],
      ['應用場景與協定', 'REST API、RESTCONF、Web 應用程式資料交換標準', 'Ansible Playbook 劇本、Kubernetes 配置檔、Docker Compose', 'NETCONF、傳統 Web Services (SOAP)、舊版設定檔', 'NETCONF 使用 XML；RESTCONF / REST API 主流使用 JSON'],
      ['快速識別範例', '`{ "vlan_id": 10, "name": "Sales" }`', '`vlan_id: 10`<br>`name: Sales`', '`<vlan_id>10</vlan_id>`<br>`<name>Sales</name>`', '考試若出現格式判斷：有大括號選 JSON，有縮排無括號選 YAML，有標籤選 XML']
    ]]
  ]
]

];


/* ================= 易混淆對照表（搜尋列與膠囊過濾器整合） ================= */
const cl = document.getElementById('cmp-list');
let cmpTotal = 0;
let activeModule = 'all';

// 計算全部對照表總數
const allTableCount = cmpModules.reduce((sum, [, tables]) => sum + tables.length, 0);

// 建立現代化搜尋與篩選工具列 DOM
const tools = document.createElement('div');
tools.id = 'cmp-tools';
tools.className = 'cmp-tools';

tools.innerHTML = `
  <div class="cmp-search-wrapper">
    <span class="cmp-search-icon">🔍</span>
    <input id="cmp-search" type="text" placeholder="搜尋對照表概念、指令或考點關鍵字（例如：OSPF, VLAN, LACP）..." autocomplete="off">
    <button class="cmp-search-clear" id="cmp-search-clear" title="清除搜尋">✕</button>
  </div>
  <div class="cmp-filter-group" id="cmp-filters">
    <button class="active" data-m="all">全部 <span class="pill-badge">${allTableCount}</span></button>
    ${cmpModules.map(([moduleName, tables], i) => `
      <button data-m="${i}">${moduleName.split('（')[0]} <span class="pill-badge">${tables.length}</span></button>
    `).join('')}
  </div>
`;

cl.parentNode.insertBefore(tools, cl);

// 搜尋輸入與清除按鈕邏輯
const searchInput = document.getElementById('cmp-search');
const clearBtn = document.getElementById('cmp-search-clear');

function renderCmp() {
  cl.innerHTML = '';
  cmpTotal = 0;
  const kw = (searchInput.value || '').trim().toLowerCase();

  // 控制清除按鈕顯隱
  clearBtn.style.display = kw ? 'block' : 'none';

  cmpModules.forEach(([modName, tables], i) => {
    if (activeModule !== 'all' && activeModule != i) return;

    // 支援比對表名與表格內文關鍵字
    const visible = tables.filter(([title, rows]) => {
      if (!kw) return true;
      const matchTitle = title.toLowerCase().includes(kw);
      const matchBody = rows.some(row => row.some(cell => String(cell || '').toLowerCase().includes(kw)));
      return matchTitle || matchBody;
    });

    if (!visible.length) return;

    const h = document.createElement('h3');
    h.className = 'cmp-module';
    h.innerHTML = `<span>${modName}</span><span class="cnt">${visible.length} 表</span>`;

    const wrap = document.createElement('div');
    visible.forEach(([title, rows]) => {
      cmpTotal++;
      const d = document.createElement('details');

      // 搜尋中、單一模組篩選，或總數較少時自動展開
      if (kw || activeModule !== 'all' || cmpModules.length <= 3) {
        d.open = true;
      }

      let html = '<table><tbody>';
      rows.forEach(r => {
        html += '<tr>' + r.map(c => `<td>${c ?? ''}</td>`).join('') + '</tr>';
      });
      html += '</tbody></table>';

      d.innerHTML = `<summary>${title}</summary><div class="body">${html}</div>`;
      wrap.appendChild(d);
    });

    cl.appendChild(h);
    cl.appendChild(wrap);
  });

  // 無匹配結果提示
  if (cmpTotal === 0) {
    cl.innerHTML = `
      <div style="text-align:center;padding:36px 16px;color:var(--text-muted)">
        <p style="font-size:1.1rem;margin-bottom:8px">🔍 找不到與「<b style="color:var(--accent-cyan)">${kw}</b>」相關的對照表</p>
        <p style="font-size:0.85rem;color:var(--text-dim)">建議嘗試搜尋簡短關鍵字（例如：STP、NAT、SSH、AAA）</p>
      </div>
    `;
  }
}

// 綁定事件監聽
document.getElementById('cmp-filters').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    document.getElementById('cmp-filters').querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeModule = b.dataset.m;
    renderCmp();
  };
});

searchInput.oninput = renderCmp;

clearBtn.onclick = () => {
  searchInput.value = '';
  searchInput.focus();
  renderCmp();
};

// 初始渲染
renderCmp();