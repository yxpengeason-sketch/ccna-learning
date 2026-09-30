export interface PitfallItem {
  title: string;
  scenario: string;
  solution: string;
  mnemonic: string;
}

export interface ModulePitfalls {
  moduleName: string;
  items: PitfallItem[];
}

export const PITFALL_MODULES: ModulePitfalls[] = [
  {
    moduleName: 'Network Fundamentals',
    items: [
      {
        title: 'Subnetting / Wildcard Mask 計算反轉錯誤',
        scenario: '把 Subnet Mask 直接當作反遮罩，例如將 /27 (255.255.255.224) 寫成 0.0.0.224。',
        solution: '標準計算公式為 255.255.255.255 − Subnet Mask。/27 塊長為 32 (256−224)，反遮罩最後一組八位元即為 32 − 1 = 31，故為 0.0.0.31。',
        mnemonic: '反遮罩算式全用 255 減；塊長減一即是末位元'
      },
      {
        title: '可用 IP 數量與網段/廣播位址混淆',
        scenario: '將網路位址 (Network ID) 或廣播位址 (Broadcast ID) 當作可指派給主機的可用 IP；考試忽略 /31 點對點特例。',
        solution: '一般子網路可用主機數公式為 2^h − 2（扣除網路與廣播）；唯獨 RFC 3021 點對點鏈路 /31 具備 2 個可用位址且無廣播概念；/32 為單一主機位址。',
        mnemonic: '一般網段減二可用，/31 點對點無廣播免減'
      },
      {
        title: 'TCP vs UDP 可靠性與三次交握機制混淆',
        scenario: '誤以為 UDP 也會進行三次交握建立連線，或認為 TCP「有連線」就代表資料一定不會遺失。',
        solution: 'TCP：連線導向，三向交握 (SYN → SYN/ACK → ACK) 建立連線、四次揮手拆除；提供確認重傳、排序、流量控制。UDP：無連線、無交握、不保證送達，開銷低延遲小。',
        mnemonic: 'TCP 三次握手可靠重傳，UDP 不握手快而不保證'
      },
      {
        title: 'OSI 七層 vs TCP/IP 四層封裝與 PDU 對應錯誤',
        scenario: '將 PDU 名稱與層級配錯，例如把 Segment 稱為第三層的 PDU，或把 Frame 誤當成第四層單元。',
        solution: 'OSI 由下而上：① Physical（Bits）➡️ ② Data Link（Frame）➡️ ③ Network（Packet）➡️ ④ Transport（Segment）➡️ ⑤~⑦ Application（Data）。',
        mnemonic: '一二三四層依序是 Bit、Frame、Packet、Segment'
      },
      {
        title: 'IPv6 位址縮寫與壓縮規則錯誤',
        scenario: '在同一 IPv6 位址中連續使用兩次 :: 壓縮符號，或將組內的「尾隨零」誤刪。',
        solution: 'RFC 5952 規範：:: 在一個位址中僅限出現一次；每組 16-bit 只能刪除「前導零 (Leading zeros)」，絕不可刪除尾隨零（如 0040 只能縮為 40）。',
        mnemonic: '雙冒號唯一縮一次，只刪前導不刪尾'
      },
      {
        title: 'IPv6 特殊位址類型與 EUI-64 生成規則混淆',
        scenario: '搞錯各類 IPv6 位址前綴用途，或以為 EUI-64 是直接複製 MAC 位址當 Interface ID。',
        solution: 'FE80::/10 為 Link-Local；FC00::/7 為 Unique Local；FF00::/8 為 Multicast。EUI-64 規則：48-bit MAC 中間插入 FF:FE 變 64-bit，並將第 7 個 bit（U/L bit）反轉。',
        mnemonic: 'EUI-64 插 FFFE 再翻第七位元，Link-Local FE80 打底'
      },
      {
        title: '銅纜與光纖選型及連接器規格混淆',
        scenario: '在長距離骨幹場景誤選 UTP 雙絞線，或搞混 Single-mode 與 Multi-mode 光纖適用的收發器。',
        solution: 'UTP Cat5e/6：100 公尺上限；SMF (單模)：核心細（~9μm），黃色外皮，雷射光源，長距離；MMF (多模)：核心粗（50/62.5μm），橘色外皮，LED/VCSEL 光源，短距離（≤550m）。',
        mnemonic: 'UTP 百米封頂，SMF 黃皮跑長距離、MMF 橘皮短程樓內'
      },
      {
        title: 'SLAAC 位址分配與 DHCPv6 運作機制混淆',
        scenario: '誤以為 SLAAC（無狀態位址自動配置）是由 DHCPv6 Server 提供 IP 位址與預設閘道。',
        solution: 'SLAAC 依賴路由器發送的 RA (Router Advertisement) 取得 /64 前綴，主機自組 Interface ID；預設閘道指向路由器的 Link-Local 位址 (FE80::/10)。',
        mnemonic: 'RA 廣播給前綴自己組，DHCPv6 補 DNS 或全包'
      },
      {
        title: '無線射頻頻段特性與重疊頻道誤判',
        scenario: '誤以為 5 GHz 的穿透力比 2.4 GHz 強，或不知 2.4 GHz 只有哪三個頻道互不重疊。',
        solution: '2.4 GHz 穿牆強、覆蓋廣，但速率低；僅 1、6、11 三個互不重疊頻道。5 GHz 頻道多、干擾少、速率高，但衰減快、穿透弱。',
        mnemonic: '2.4G 穿牆強只剩 1/6/11，5G 快而短命'
      },
      {
        title: '路由仲裁順序（LPM vs AD vs Metric）混淆',
        scenario: '誤以為 Administrative Distance (AD) 越低的路由永遠優先轉發，或 Metric 小就必然勝出。',
        solution: '路由查表三部曲順序絕對不可顛倒：① 最長前綴匹配 (LPM) ➡️ 遮罩最長最優先。② 管理距離 (AD) ➡️ 前綴相同才比。③ 度量值 (Metric) ➡️ 前綴與 AD 皆相同才比。',
        mnemonic: '最長前綴排第一、前綴相同比 AD、AD 相同比 Metric'
      }
    ]
  },
  {
    moduleName: 'Network Access',
    items: [
      {
        title: 'Port Security 違規模式行為差異 (Violation Modes)',
        scenario: '誤以為三種違規模式都會將連接埠關閉 (Shutdown)，或認為 Protect 模式會產生日誌。',
        solution: 'protect：靜默丟棄違規封包；restrict：丟棄違規封包，累加計數並發送 Syslog/SNMP 告警，埠維持 Up；shutdown（預設）：介面進入 err-disabled。',
        mnemonic: 'protect 靜默丟包、restrict 記帳發告警、shutdown 斷電鎖埠'
      },
      {
        title: 'Port Security Sticky MAC 儲存本質誤解',
        scenario: '以為 Sticky MAC（黏性學習）在重開機後會自動保留於設備中。',
        solution: 'Sticky 模式是將動態學習到的 MAC 自動寫入 running-config；若未執行 copy running-config startup-config，重啟後設定完全遺失。',
        mnemonic: 'Sticky 存進 run-config，必須手動存檔才防斷電'
      },
      {
        title: 'EtherChannel 協商模式不匹配導致無法綑綁',
        scenario: '使用 PAgP 的 desirable 與 LACP 的 active 對接，或兩端皆配置 auto / passive。',
        solution: '跨協定完全不通！LACP：active ↔ active/passive（不可雙 passive）。PAgP：desirable ↔ desirable/auto（不可雙 auto）。Static (On)：on ↔ on。',
        mnemonic: 'LACP 不理 PAgP，雙 passive/雙 auto 永不起，on 只對 on'
      },
      {
        title: 'Native VLAN 與 802.1Q 封裝行為混淆',
        scenario: '誤以為 Native VLAN 通過 Trunk 也會打上 4-byte 802.1Q 標籤，或兩端 Native VLAN 不一致仍可正常轉發。',
        solution: 'Native VLAN 預設明文未打標穿越 Trunk；兩端 ID 不匹配會造成 VLAN 洩漏與 CDP 報錯。最佳實務是將 Native 改為閒置 VLAN 999。',
        mnemonic: 'Native 預設不打標，兩端 ID 必須對齊防洩漏'
      },
      {
        title: 'DTP 協商結果誤判與安全性漏洞',
        scenario: '兩端交換器介面皆設為 dynamic auto 卻期待能自動形成 Trunk。',
        solution: 'dynamic auto ↔ dynamic auto 協商結果為 Access Port（皆被動等待）。只有一方為 dynamic desirable 才會形成 Trunk。面向終端埠應 switchport nonegotiate。',
        mnemonic: '雙 auto 變 access，安全埠強制 nonegotiate'
      },
      {
        title: 'STP Root Guard vs BPDU Guard 防禦目標搞混',
        scenario: '誤以為 Root Guard 用於連接終端的 Edge Port，或以為 Root Guard 防禦的是劣質 BPDU。',
        solution: 'BPDU Guard 部署於邊界埠，收到任何 BPDU 即進入 err-disabled。Root Guard 部署於指定下游埠，防禦優勢 BPDU (Superior BPDU) 搶佔根橋。',
        mnemonic: 'BPDU Guard 顧終端邊界，Root Guard 顧下游防搶根'
      },
      {
        title: 'CDP vs LLDP 發現協定特性混淆',
        scenario: '誤以為 CDP 是業界開放標準可跨廠商運作，或不知道兩者預設啟用狀態。',
        solution: 'CDP 為 Cisco 專有，預設啟用，週期 60s；LLDP 為 IEEE 802.1AB 開放標準，預設關閉，需 lldp run 啟用。',
        mnemonic: 'CDP 思科專有預設開，LLDP 開放標準要手動開'
      },
      {
        title: 'QoS Trust Boundary 與分類標記位置誤判',
        scenario: '讓所有接入交換機都重新標記 QoS，或搞混 Layer 2 與 Layer 3 標記欄位所在位置。',
        solution: '在最靠近流量來源的信任邊界進行分類標記，之後全程信任。L2 標記為 802.1Q 內 3-bit CoS；L3 標記為 IP Header ToS 內 6-bit DSCP。',
        mnemonic: '邊界一次標好全程信任，CoS 在二層、DSCP 在三層'
      },
      {
        title: 'Wireless 架構 Autonomous AP vs Lightweight AP+WLC 模式搞混',
        scenario: '以為 Lightweight AP 自己處理認證與 SSID 配置，或不知道 Control/Data Plane 如何分離。',
        solution: 'Lightweight AP 只負責 RF 射頻收發，智慧集中在 WLC，透過 CAPWAP 隧道（Control UDP 5246、Data UDP 5247）通訊。',
        mnemonic: 'Lightweight AP 只管天線，CAPWAP 5246 控制 5247 傳資料'
      },
      {
        title: 'WLC 上 WLAN 配置四要素順序與綁定遺漏',
        scenario: '在 WLC 建立 WLAN 後忘記套用 Interface 或 Policy Profile，導致 SSID 廣播出來卻連不上。',
        solution: 'WLC 關鍵四要素：① 定義 SSID 名稱與 VLAN 對應；② 綁定 Interface；③ 設定安全策略；④ 啟用 WLAN 狀態。',
        mnemonic: 'SSID 綁介面配安全再啟用，四步缺一 SSID 白搭'
      }
    ]
  },
  {
    moduleName: 'IP Connectivity',
    items: [
      {
        title: 'Inter-VLAN Routing：Router-on-a-Stick 子介面配置陷阱',
        scenario: '在 Router-on-a-Stick 場景忘了在子介面下配置 encapsulation dot1q，或實體介面維持 shutdown。',
        solution: '物理介面必須 no shutdown；每個子介面執行 encapsulation dot1q <vlan-id>，且必須在配 IP 之前設定。',
        mnemonic: '物理口不 no shut 子介面全死，先 dot1q 再配 IP'
      },
      {
        title: 'Inter-VLAN Routing：SVI 方案前置條件遺漏',
        scenario: '在三層交換機上建立了 SVI 卻無法互通，忽略 ip routing 未啟用或 VLAN 不存在。',
        solution: 'SVI Up 且可路由前提：① 全域啟用 ip routing；② VLAN 已建立；③ 至少有一個 Active Port 屬於該 VLAN；④ SVI 自身 no shutdown。',
        mnemonic: 'SVI 要 ip routing 加 VLAN 有活躍埠才會 Up'
      },
      {
        title: 'OSPF 鄰居狀態卡在 ExStart / Exchange 階段',
        scenario: '鄰居起不來時只檢查密碼與 IP，忽略介面 MTU 數值與 Router-ID 重複問題。',
        solution: '停在 Down/Init 查 Timer、Area ID 或認證；卡在 ExStart/Exchange 檢查兩端 MTU 是否不匹配或 Router-ID 是否重複。',
        mnemonic: '停 Init 查三件套，卡 ExStart 查 MTU 與 RID 重複'
      },
      {
        title: 'OSPF DR/BDR 選舉非搶佔性誤解',
        scenario: '在運作中的 OSPF 網路上新增一台 Priority 255 的全新路由器，以為會立刻奪取成為 DR。',
        solution: 'OSPF DR/BDR 選舉具備非搶佔性 (Non-preemptive)，一旦選出，後加入的高優先級設備只能成為 DROther，除非 DR 故障或重啟進程。',
        mnemonic: 'DR 選舉先到先得不搶佔，Priority 0 永不參選'
      },
      {
        title: 'Static Route 出介面 vs 下一跳 IP 寫法陷阱',
        scenario: '在乙太網路介面上配置靜態路由時僅指定出介面。',
        solution: '乙太網為多路存取介面，未指定下一跳 IP 會對所有目標發起 ARP Request 造成廣播洪泛；P2P/Serial 點對點鏈路才適用純出介面寫法。',
        mnemonic: '乙太網必寫下一跳 IP，Serial 點對點才用出介面'
      },
      {
        title: '浮動靜態路由 AD 設計不當導致主備倒置',
        scenario: '規劃備援路由時，靜態路由未手動調整 AD 值，或 AD 值設得比主要動態路由更低。',
        solution: '靜態路由預設 AD 為 1；若欲備援 OSPF (AD 110)，浮動靜態路由的 AD 必須大於 110（如 120），平時才不會寫入 RIB。',
        mnemonic: '備援路徑 AD 要調高，高於動態協定才沉睡'
      },
      {
        title: '路由表四要素讀法與代碼意義誤判',
        scenario: 'show ip route 看到 S* 0.0.0.0/0 就以為是靜態黑洞，或不清楚開頭字母代碼含義。',
        solution: '格式為：代碼 Prefix [AD/Metric] via 下一跳。C=直連、S=靜態、S*=預設路由候選、O=OSPF。AD 比來源可信度，Metric 比同協定開銷。',
        mnemonic: '看懂代碼與 [AD/Metric]，C直連 S靜態 O是OSPF'
      },
      {
        title: 'OSPF Passive-Interface 宣告與行為誤解',
        scenario: '誤以為設定 passive-interface 後，該介面所屬的網段就不會被宣告給鄰居。',
        solution: 'passive-interface 僅停止在該介面上收發 Hello 封包（不建鄰居），但該介面的直連網段依然會透過 LSA 正常宣告給其他鄰居。',
        mnemonic: 'Passive 介面不發 Hello 建鄰居，直連網段照樣廣告出去'
      }
    ]
  },
  {
    moduleName: 'IP Services',
    items: [
      {
        title: 'PAT 配置遺漏 overload 關鍵字',
        scenario: '希望多台內網主機共用單一公網 IP 上網，但在 NAT 指令末端漏寫 overload。',
        solution: '沒有 overload 時會被視為動態一對一 NAT；當唯一公網 IP 被占用後，後續主機因無可用 IP 映射而無法連網。',
        mnemonic: '多對一上網必加 overload，等於 Port 埠號位址轉換'
      },
      {
        title: 'NAT Inside / Outside 介面方向掛反',
        scenario: '將 ip nat inside 設在外網出口，ip nat outside 設在內網。',
        solution: '方向掛反會導致 NAT 引擎無法識別連線發起方向，封包直接被原樣轉發或丟棄。LAN 掛 inside，WAN 掛 outside。',
        mnemonic: 'LAN 介面掛 inside、WAN 出口掛 outside，方向掛反不轉換'
      },
      {
        title: 'ACL 隱含 deny any 與放置原則陷阱',
        scenario: '自訂 ACL 未寫 permit 就直接套用導致全斷，或把 Standard ACL 放在靠近來源的位置。',
        solution: '每個 ACL 末尾皆有隱含 deny any。Standard ACL 放靠近目的地；Extended ACL 放靠近來源端。由上而下比對、命中即停。',
        mnemonic: '隱含 deny any 藏尾端，Standard 靠目的、Extended 靠來源'
      },
      {
        title: 'ACL 方向 (in/out) 判斷顛倒',
        scenario: '以為 out 是指本機發出的流量，或在介面上掛反 in/out 導致鎖死管理連線。',
        solution: '以路由器視角判定：in 是流量進入介面、尚未查路由表前過濾；out 是已完成查表、正要離開介面時過濾。',
        mnemonic: 'in 是進門先檢查，out 是出門才檢查，永遠站在路由器角度看'
      },
      {
        title: 'SSH vs Telnet 安全性與配置要件遺漏',
        scenario: '只配置了 transport input ssh 卻沒產生 RSA 金鑰，導致 vty 完全登不進去。',
        solution: 'SSH 四要件：① 設定 hostname 與 ip domain-name；② crypto key generate rsa；③ 本地帳號與 vty 下 login local；④ transport input ssh。',
        mnemonic: '域名金鑰帳號 transport 四件套齊才能 SSH'
      },
      {
        title: 'DHCP Relay (ip helper-address) 配置介面位置錯誤',
        scenario: '將 ip helper-address 配置在靠近 DHCP Server 的路由器介面上。',
        solution: '必須配置在接收客戶端廣播的入口介面上；路由器收到廣播後轉為單播並填入 giaddr 轉發給遠端 DHCP Server 選池。',
        mnemonic: 'Helper-address 設在靠近 Client 的介面，轉單播帶 giaddr 選池'
      },
      {
        title: 'SNMP v2c 與 SNMPv3 安全模式混淆',
        scenario: '誤以為 SNMPv3 所有模式都有加密，或以為 v2c 的 community string 是安全的。',
        solution: 'v2c 明文傳輸 community string。SNMPv3 三等級：noAuthNoPriv（無防護）、authNoPriv（有認證無加密）、authPriv（認證 + AES 加密）。',
        mnemonic: 'v2c 明文 community，v3 要 authPriv 才是真安全'
      },
      {
        title: 'DNS 解析流程與 name-server 行為誤解',
        scenario: '誤以為路由器會向 DHCP Server 取得 DNS 後自動代理解析。',
        solution: '路由器上 ip name-server 讓設備自身可解析主機名；ip host 為本地靜態映射（優先於 DNS）。A 對應 IPv4、AAAA 對應 IPv6。',
        mnemonic: '遞迴代問權威答，ip host 本地映射最優先'
      },
      {
        title: 'NTP Stratum 16 狀態誤判為正常同步',
        scenario: '在 show ntp status 輸出中看到 Stratum 16，誤以為時鐘已成功完成同步。',
        solution: 'Stratum 範圍為 1–15；Stratum 16 代表未同步 (Unsynchronized) 或時間源不可信。必須顯示 Clock is synchronized 且 Stratum ≤ 15。',
        mnemonic: 'Stratum 16 代表未同步，synchronized 才是真對時'
      },
      {
        title: 'Syslog 嚴重度等級數字方向搞反',
        scenario: '誤以為 Severity 7 比 Severity 0 更嚴重、更緊急。',
        solution: '0 (Emergency，崩潰) 最緊急；7 (Debugging) 最輕微。logging trap warning (4) 會發送 0、1、2、3、4 級別的所有日誌。',
        mnemonic: '數字越小越危急（0 宕機 7 調試），Trap 門檻包含以下全部'
      }
    ]
  },
  {
    moduleName: 'Security Fundamentals',
    items: [
      {
        title: 'enable password vs enable secret 儲存安全盲點',
        scenario: '以為啟用了 service password-encryption 就能確保 enable password 的安全。',
        solution: 'service password-encryption 僅將明文轉為 Type 7 弱混淆，可被線上秒解；enable secret 採用單向不可逆雜湊（Type 5/8/9），系統優先採用 secret。',
        mnemonic: 'Type 7 是防偷看弱編碼，enable secret 才是真雜湊'
      },
      {
        title: 'TACACS+ vs RADIUS 架構與加密範疇混淆',
        scenario: '考試將 TACACS+ 與 RADIUS 的傳輸協定埠號與加密欄位相互顛倒。',
        solution: 'TACACS+：走 TCP 49，全封包 Payload 加密，AAA 三功能獨立，支援逐指令授權。RADIUS：走 UDP 1812/1813，僅對密碼欄位加密，認證授權合併。',
        mnemonic: 'TACACS+ 走 TCP49 全加密分三權，RADIUS 走 UDP 密碼加密合二為一'
      },
      {
        title: 'DHCP Snooping Untrusted 埠防禦行為盲點',
        scenario: '全域啟用 DHCP Snooping 後，忘記將連接合法 DHCP 伺服器或上行 Trunk 設為 Trusted。',
        solution: 'Snooping 啟用後所有介面預設為 Untrusted；Untrusted 介面收到 DHCP Offer 或 ACK 會直接丟棄，必須手動在伺服器埠配置 ip dhcp snooping trust。',
        mnemonic: 'Snooping 預設全 Untrusted，合法 Server 埠務必手動 Trust'
      },
      {
        title: 'DAI (動態 ARP 檢驗) 對 DHCP Snooping 的依賴性',
        scenario: '在未啟用 DHCP Snooping 或未建立綁定表的 VLAN 上直接開啟 DAI。',
        solution: 'DAI 強烈依賴 DHCP Snooping Binding Table 來驗證 ARP 封包；若無綁定表且未配置 arp access-list，所有合法 ARP 請求皆會被丟棄。',
        mnemonic: 'DAI 查表靠 Snooping，無綁定表會誤殺所有 ARP'
      },
      {
        title: 'VPN 分類與 IPsec 核心組成混淆',
        scenario: '搞混 Site-to-Site 與 Remote Access VPN 適用場景，或不知道 IPsec 由哪些協定組成。',
        solution: 'Site-to-Site：閘道對閘道，終端無感。Remote Access：個別終端撥入。IPsec 中 ESP (Protocol 50) 提供加密與認證；AH (Protocol 51) 僅認證不加密且過 NAT 有問題。',
        mnemonic: 'Site-to-Site 閘道對閘道，IKE 先談判 ESP 來加密，AH 不加密怕 NAT'
      },
      {
        title: 'WLAN 安全演進與 WPA2/WPA3 模式選擇錯誤',
        scenario: '以為 WPA2-Personal 已是最高安全等級，或不清楚 WEP 為何已被淘汰。',
        solution: 'WEP/WPA 採用 RC4 弱加密已被淘汰；WPA2 用 AES-CCMP；WPA3-Personal 改用 SAE 取代 PSK 防離線字典攻擊；Enterprise 模式一律 802.1X/RADIUS。',
        mnemonic: 'WEP/WPA 早淘汰，WPA2 用 AES、WPA3 SAE 防字典，企業一律 802.1X'
      },
      {
        title: '登入安全強化措施遺漏',
        scenario: '只設定密碼就認為設備管理已安全，忽略暴力破解防護與 Session 逾時控制。',
        solution: '① login block-for 120 attempts 3 within 60 防爆破；② exec-timeout 10 0 閒置自動登出；③ vty 線上掛 ACL 限制管理來源 IP。',
        mnemonic: 'block-for 防爆破、exec-timeout 防掛線、vty 掛 ACL 限來源'
      }
    ]
  },
  {
    moduleName: 'Automation & Programmability',
    items: [
      {
        title: 'JSON 資料格式語法規範陷阱',
        scenario: '在 JSON 物件中使用單引號、鍵名未加雙引號，或在最後一個元素後加尾隨逗號。',
        solution: 'JSON 鍵名與字串值必須使用雙引號 ""；最後一個元素後嚴禁加逗號；JSON 不支援註解。',
        mnemonic: 'JSON 鍵名必加雙引號，無尾隨逗號不支援註解'
      },
      {
        title: 'XML vs JSON vs YAML 三大資料格式定位混淆',
        scenario: '搞混三種格式各自的語法特徵與典型用途。',
        solution: 'JSON：{} 物件 + [] 陣列，REST API 主流；XML：成對標籤包裹，NETCONF 使用；YAML：縮排表達層級，Ansible Playbook 使用。',
        mnemonic: 'JSON 括號走 API、XML 標籤陪 NETCONF、YAML 縮排寫 Playbook'
      },
      {
        title: 'REST API HTTP 狀態碼 401 vs 403 混淆',
        scenario: '將 401 Unauthorized 與 403 Forbidden 的定義搞混。',
        solution: '401 Unauthorized：身分未驗證（缺少 Token 或憑證無效）；403 Forbidden：身分已驗證但權限不足被拒絕存取。201 代表 Created 成功建立資源。',
        mnemonic: '401 沒帶身分證（未驗證），403 帶了證件沒權限，201 建好 404 找無'
      },
      {
        title: 'HTTP Method 與 CRUD 操作對應錯誤',
        scenario: '將 PUT 與 PATCH 的語義混為一談，或把 DELETE 對應到讀取操作。',
        solution: 'Create ➡️ POST；Read ➡️ GET；Update ➡️ PUT（全量覆蓋）/ PATCH（部分更新）；Delete ➡️ DELETE。',
        mnemonic: 'POST 建 GET 讀，PUT 全換 PATCH 局部改，DELETE 刪光光'
      },
      {
        title: 'API 身份驗證方式 Basic Auth vs Token/API Key 混淆',
        scenario: '以為 Basic Auth 把帳密放 Header 就是安全做法，或不理解 Token 機制。',
        solution: 'Basic Auth 是將帳密做 Base64 編碼（非加密，秒解）；Token/API Key 登入換取憑證，有時效與範圍限制，洩露風險可控可撤銷。',
        mnemonic: 'Basic 只是 Base64 化妝不是加密，Token 有效期可撤銷才是王道'
      },
      {
        title: '組態管理工具 Ansible vs Terraform 定位混淆',
        scenario: '誤以為 Ansible 是 Agent-based 且主要用於 IaC 基礎架構佈建。',
        solution: 'Ansible：Agentless，走 SSH，Push 模式，YAML 劇本，專注於組態管理；Terraform：Agentless，HCL 語法，專注於 IaC 資源佈建；Puppet/Chef 為 Agent-based。',
        mnemonic: 'Ansible Agentless+Push+YAML 做配置，Terraform IaC 佈建，Puppet/Chef 要裝代理'
      },
      {
        title: 'SDN 架構北向 vs 南向 API 方向搞反',
        scenario: '把 Controller 與 Device 之間的介面當作北向 API，或搞不清 SDN 三層角色。',
        solution: '北向 API (Northbound)：Application ➡️ Controller（REST API）；南向 API (Southbound)：Controller ➡️ Network Devices（NETCONF/RESTCONF/OpenFlow）。',
        mnemonic: '北向接應用南向管設備，Controller 居中發號施令'
      },
      {
        title: 'NETCONF vs RESTCONF 協定特性混淆',
        scenario: '搞混兩者的傳輸埠、編碼格式與適用場景。',
        solution: 'NETCONF：TCP 830（SSH 加密）、XML 編碼、支援交易式配置（commit/rollback）；RESTCONF：HTTPS 443、支援 XML 或 JSON，兩者皆以 YANG 為資料模型。',
        mnemonic: 'NETCONF 走 830 XML 能回滾，RESTCONF 走 443 可 JSON，共用 YANG 模型'
      },
      {
        title: 'Cisco Catalyst Center (DNA Center) 功能定位誤解',
        scenario: '以為 DNA Center 只是一般的網管 SNMP 平台，或不清楚其 Intent-based 核心能力。',
        solution: 'Catalyst Center 四大工作流：Design ➡️ Policy ➡️ Provision ➡️ Assurance。Assurance 透過串流遙測 (Telemetry) + AI/ML 進行主動式異常偵測與根因分析。',
        mnemonic: 'DNA Center 四大功能 Design/Policy/Provision/Assurance，意圖驅動自動下發'
      }
    ]
  }
];
