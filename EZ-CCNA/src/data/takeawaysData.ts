export interface FlashCard {
  question: string;
  answer: string;
}

export interface ModuleFlashCards {
  moduleName: string;
  weight: string;
  cards: FlashCard[];
}

export const TAKEAWAYS_DATA: ModuleFlashCards[] = [
  {
    moduleName: 'Network Fundamentals',
    weight: '20%',
    cards: [
      {
        question: 'OSI 七層模型與對應 設備/PDU？',
        answer: 'L1 Physical (設備：Hub/PDU：Bit)、<br> L2 Data Link (設備：Switch/PDU：Frame)、<br> L3 Network (設備：Router/PDU：Packet)、<br> L4 Transport (PDU：Segment)、<br> L5 Session、<br> L6 Presentation [加密/壓縮]、<br> L7 Application <br> 🍕口訣：Please Do Not Throw Sausage Pizza Away'
      },
      {
        question: 'TCP 三向交握順序？',
        answer: 'SYN → SYN-ACK → ACK； <br> <br> 斷線四次揮手 <br> FIN → ACK → FIN → ACK'
      },
      {
        question: 'TCP vs UDP 常見埠號 (Port Numbers)？',
        answer: 'TCP：HTTP 80 / HTTPS 443 / SSH 22 / FTP 21； <br> <br>  UDP：DNS 53 / DHCP 67,68 / SNMP 161 / TFTP 69 / Syslog 514'
      },
      {
        question: 'IPv4 私有位址範圍？',
        answer: '10.0.0.0/8、172.16.0.0/12、192.168.0.0/16； <br> APIPA 自動私有位址 169.254.0.0/16（DHCP 失敗時）'
      },
      {
        question: '單模 vs 多模光纖？',
        answer: '單模(SMF)：長距離LR、雷射光源、黃色接頭； <br> 多模(MMF)：短距離SR、LED 光源、橘色接頭'
      },
      {
        question: 'UTP 纜線類型？',
        answer: '直通線（不同類設備）、跳接線（同類設備）； <br> Gigabit 以上四對全用；Cat5e=1G、Cat6a=10G'
      },
      {
        question: 'IPv6 位址縮寫規則？',
        answer: ':: 每位址限一次（RFC 5952）； <br> 只能刪每組前導零，不可刪尾零'
      },
      {
        question: 'IPv6 位址類型？',
        answer: 'Global Unicast (2000::/3)、 <br> Link-local (FE80::/10)、 <br> Unique Local (FD00::/8 實務使用，L bit=1)、 <br> Multicast (FF00::/8)；無廣播'
      },
      {
        question: 'IPv6 取代廣播的方式？',
        answer: '<b>1. 核心機制：</b>改用多播 (Multicast) 與 Anycast。<br><b>2. 常考核心多播位址：</b>• ff02::1：網段內 所有節點(All Nodes)，等同 IPv4 的 255.255.255.255。<br>• ff02::2：網段內 所有路由器(All Routers)。<br><b>3. 代替 ARP：</b>使用 NDP 協定 搭配 Solicited-Node 多播位址 (ff02::1:ffxx:xxxx) 來解析 MAC 位址。'
      },
      {
        question: 'Subnetting 可用主機數公式？',
        answer: '可用主機數：2^(主機位元數) − 2；<br><br> Block Size (子網段大小) = 2^8 − 最後非零遮罩值； <br><br> 子網切分：「新遮罩」-「舊遮罩」，<br>相差n個Bit，切出2^n子網 ；<br><br> Wildcard = 255.255.255.255 − 遮罩'
      },
      {
        question: '虛擬化 Type 1 vs Type 2 Hypervisor？',
        answer: 'Type 1 裸機（ESXi/KVM）； <br> Type 2 架於 OS 上（VMware Workstation）； <br> Container 共享 OS Kernel 更輕量'
      }
    ]
  },
  {
    moduleName: 'Network Access',
    weight: '20%',
    cards: [
      {
        question: 'STP 根橋選舉順序？',
        answer: '最低 Bridge Priority → 最低 MAC； <br> Gigabit Port Cost 預設 4'
      },
      {
        question: 'STP 保護機制？',
        answer: 'PortFast（接端點跳過 Listening/Learning）<br> + BPDU Guard（接收到 BPDU 即 err-disable）<br><br>+ Root Guard (介面啟用：spanning-tree guard root) <br>+ Loop Guard (全域啟用： spanning-tree loopguard default)'
      },
      {
        question: 'RSTP 收斂機制？',
        answer: 'Proposal/Agreement 握手 <br>+ Alternate Port 即時備援，數秒內收斂'
      },
      {
        question: 'RSTP port角色與狀態？',
        answer: '角色：Root/Designated/Alternate/Backup； <br> 狀態三態：Discarding/Learning/Forwarding'
      },
      {
        question: 'VLAN Trunk 封裝重點？',
        answer: '僅支援 802.1Q；Native VLAN 不打標籤明文穿越，兩端必須一致 <br> （建議改未使用的閒置 VLAN 如VLAN 999）'
      },
      {
        question: 'EtherChannel 協定匹配矩陣？',
        answer: '<b>LACP：</b>active ↔ active/passive 可成<br><b>PAgP：</b>desirable ↔ desirable/auto 可成<br><b>Static：</b>on 只能 ↔ on<br><b>跨協定：</b>LACP 不理 PAgP（兩端同協定且不可雙被動）'
      },
      {
        question: 'Port Security 三種違規模式？',
        answer: 'protect：靜默丟棄違規封包，無任何紀錄； <br> restrict：丟棄違規封包 + 計數 violation counter + 發 SNMP trap/syslog 記錄； <br> shutdown（預設）：err-disabled，需手動 shutdown/no shutdown 或 errdisable recovery 恢復'
      },
      {
        question: 'MAC Address Table vs ARP Table？',
        answer: 'MAC Table：L2 交換器「MAC→埠」； <br> ARP Cache：L3 設備「IP→MAC」，不同設備不同層級'
      },
      {
        question: 'CDP vs LLDP？',
        answer: 'CDP 是 Cisco 專屬且預設啟用； <br> LLDP 是 IEEE 802.1AB 開放標準，跨廠牌必用 <br><br> <b>全域啟用：</b>分別為 `cdp run` 與 `lldp run`；<b>介面控制：</b>為 `cdp enable` 與 `lldp transmit/receive`；<br><b>安全考量：</b>面對外網或非信任網段時，應關閉鄰居發現以防拓樸外洩。'
      },
      {
        question: 'Lightweight AP 架構？',
        answer: '透過 CAPWAP 連回 WLC，Split-MAC 分工； <br> Autonomous AP 適合小型 1–3 台獨立設定'
      },
      {
        question: 'WPA2 vs WPA3？',
        answer: 'WPA2-PSK 可離線字典攻擊、AES-CCMP；<br> WPA3-SAE（Dragonfly 握手）抗攻擊、AES-GCMP、強制 PMF'
      },
      {
        question: '2.4 GHz vs 5 GHz 無線通道？',
        answer: '2.4 GHz 僅 Channel 1、6、11 互不重疊； <br> 5 GHz 快但穿牆弱、覆蓋小'
      },
      {
        question: '交換器三大轉發行為？',
        answer: '學習（記錄來源 MAC）、 <br> 轉發（查表送出）、 <br> 過濾（同埠不重複發送）； <br> 未知單播才 Flood'
      }
    ]
  },
  {
    moduleName: 'IP Connectivity',
    weight: '25%',
    cards: [
      {
        question: 'OSPF Cost 公式？',
        answer: 'Cost = 參考頻寬 ÷ 介面頻寬，預設參考值 100 Mbps； <br> FastE=1、GigE=1（≥100Mbps 全算 1 造成次優路徑風險）； <br> 建議全域調整：auto-cost reference-bandwidth 100000'
      },
      {
        question: 'OSPFv2 鄰居狀態？',
        answer: 'Down→Init→2-Way（此階段選 DR/BDR）<br> →ExStart（協商 DD 序號）→Exchange <br>→Loading（LSR/LSU）→Full； <br><br> 卡在 ExStart 多為 MTU 不符；DROther 與 DROther 之間停在 2-Way 屬正常行為；<br> 穩定目標為 FULL'
      },
      {
        question: 'OSPF DR/BDR 選舉特性？',
        answer: '不具搶佔性（先到先得）；Priority 0 不參選； <br> 順序：① 最高 Priority → ② 最高 Router ID； <br> 多播位址：224.0.0.5（AllSPF）／224.0.0.6（DRothers→DR/BDR）'
      },
      {
        question: 'OSPF 網路類型與計時器？',
        answer: 'Broadcast/P2P：Hello 10/Dead 40； <br> NBMA：30/120 <br> （陷阱！）；P2P 免選舉 DR/BDR'
      },
      {
        question: 'OSPF 區域類型與 Router ID？',
        answer: 'Backbone Area 0 必須存在；ABR 連接區域；Router ID 順序：手動 router-id > 最高 loopback > 最高物理介面'
      },
      {
        question: '浮動靜態路由？',
        answer: '加高 AD（如 ip route … 90）作備援備份路由，主路由失效時才浮出'
      },
      {
        question: '路由選擇優先順序？',
        answer: '① Longest Prefix Match  <br> → ② AD（Static=1, EIGRP=90, OSPF=110, RIP=120） <br> → ③ Metric'
      },
      {
        question: '靜態路由出介面 vs 下一跳？',
        answer: '乙太網是多接取網路必寫下一跳 IP；Serial/P2P 才可用純出介面寫法'
      },
      {
        question: 'ACL 放置黃金法則？',
        answer: 'Standard 靠近目的地、 <br> Extended 靠近來源端； <br> 結尾隱含 deny any；「先細後粗、先拒後允」'
      },
      {
        question: 'Standard vs Extended ACL 編號？',
        answer: 'Standard：1–99, 1300–1999（僅比對來源 IP）；Extended：100–199, 2000–2699（五元組）'
      },
      {
        question: 'NAT 三種類型比較？',
        answer: 'Static NAT 1對1固定發布伺服器；<br> Dynamic NAT 多對多位址池；PAT 多對一（overload=PAT）'
      },
      {
        question: 'HSRP 角色？',
        answer: 'Active/Standby 提供預設閘道冗餘，Virtual IP 由主機當 Gateway；<br> 預設 Priority 100，需 preempt 才能搶回； <br> HSRP 為 Cisco 專屬（v1 群組 0–255）；<br> 開放標準對應 VRRP（RFC 5798）'
      },
      {
        question: 'SVI vs Router-on-a-Stick？',
        answer: '三層交換器MLS 用 interface vlan X（SVI）；<br> 單臂路由Router-on-a-Stick 用子介面 + encapsulation dot1q'
      },
      {
        question: 'VLAN 間路由驗證指令？',
        answer: 'show ip interface brief（子介面 up/up）、show vlan brief、跨 VLAN ping 通即成功'
      }
    ]
  },
  {
    moduleName: 'IP Services',
    weight: '10%',
    cards: [
      {
        question: 'DHCP DORA 四步驟？',
        answer: 'Discover→Offer→Request→Acknowledge；Discover/Request 由 Client 廣播；跨網段需 ip helper-address 轉換為單播轉發'
      },
      {
        question: 'Syslog 嚴重度範圍？',
        answer: '0(emergency) 最嚴重 → 7(debugging) 最輕微； <br> 🍦口訣：「Every Awesome Cisco Engineer Will Need Ice cream Daily」； <br> logging trap 設定傳送等級門檻；<br>logging host 指定伺服器'
      },
      {
        question: 'SSH vs Telnet？',
        answer: 'SSH：TCP 22 加密（需 crypto key generate rsa + login local）；<br> Telnet：TCP 23 全文字串明文傳輸不安全'
      },
      {
        question: 'NTP stratum 意義？',
        answer: '數字越小越接近權威源（stratum 0 為原子鐘/GPS）；<br> <b>驗證：</b> show ntp status 看 synchronized、<br> show ntp associations 看狀態'
      },
      {
        question: 'CoS vs DSCP？',
        answer: 'CoS 在 Layer 2（802.1Q Tag 內 3-bit，0–7）；<br> DSCP 在 Layer 3（TOS/Traffic Class 內 6-bit，0–63）；<br> 語音建議最高優先級 EF(46)；信任邊界設在第一跳（Access Switch）'
      },
      {
        question: 'SNMP v2c vs v3？',
        answer: 'v2c 用 Community String（ro/rw）明文；<br> v3 支援認證+加密 authPriv（唯一具加密版本）；<br> Trap 為主動不可靠告警，Inform 為需確認之可靠告警'
      },
      {
        question: 'IPv6 動態地址分配（SLAAC vs Stateful）？',
        answer: '純 SLAAC：M=0, O=0，自動算地址與gateway；<br> Stateless DHCPv6：M=0, O=1，SLAAC 地址 + 伺服器給 DNS；<br> Stateful DHCPv6：M=1, O=1，伺服器全權分配地址與 DNS；<br> 注意：gateway 一律透過 Link-Local (FE80::) 獲取'
      }
    ]
  },
  {
    moduleName: 'Security Fundamentals',
    weight: '15%',
    cards: [
      {
        question: 'Site-to-Site vs Remote Access VPN？',
        answer: 'Site-to-Site：閘道器間網路對網路、使用者無感免客戶端；<br> Remote Access：個別裝置需登入'
      },
      {
        question: 'DHCP Snooping / DAI / IPSG 防禦目標？',
        answer: 'DHCP Snooping 防 Rogue DHCP Server；<br> DAI 防 ARP Spoofing；IPSG 防 IP Spoofing；Snooping 建 Binding Table 供 DAI 使用'
      },
      {
        question: '實體安全與密碼強化？',
        answer: 'service password-encryption 加密明文密碼；<br> enable secret 優於 enable password；<br> 閒置port shutdown 或設 Black Hole VLAN'
      },
      {
        question: 'Telnet/SSH 安全遠端管理配置順序？',
        answer: 'hostname <br> → ip domain-name <br> → crypto key generate rsa <br> → username secret <br> → line vty login local + transport input ssh'
      },
      {
        question: '802.1X 三角色？',
        answer: 'Supplicant（用戶端）/ <br> Authenticator（交換器/AP，走 EAPoL）/ <br> Authentication Server（RADIUS 如 ISE）；認證前埠只放行 EAPoL'
      },
      {
        question: 'TACACS+ vs RADIUS？',
        answer: 'TACACS+：TCP 49、全程加密、三功能分離、逐指令授權，確保傳輸過程私密性（設備管理首選）、Cisco專屬協定；<br> RADIUS：UDP 1812/1813、僅加密密碼欄位（網路接入常用）、IETF標準'
      },
      {
        question: 'WEP/WPA/WPA2/WPA3 演進？',
        answer: 'WEP 已被破解淘汰禁用（RC4）；<br> WPA=TKIP 過渡；WPA2=AES-CCMP；WPA3=SAE+GCMP+強制 PMF；企業版一律 802.1X'
      },
      {
        question: 'IDS vs IPS？',
        answer: 'IDS：promiscuous 被動監測告警（旁掛）；<br> IPS：inline 即時阻擋； <br>Signature 偵測已知攻擊、Anomaly 偵測未知行為'
      },
      {
        question: 'Stateful Firewall 特性？',
        answer: '維護連線狀態表、自動允許回程流量；Router ACL 是無狀態過濾需手動放行雙向'
      },
      {
        question: '對稱 vs 非對稱加密？',
        answer: '對稱（AES）：同一把金鑰、快； <br>非對稱（RSA）：公私鑰對、解決金鑰交換；實務混用（如 TLS 握手）'
      },
      {
        question: '雜湊完整性驗證？',
        answer: 'SHA-256 取代 MD5/CRC32；驗證 IOS 映像防篡改；雜湊不可逆、非加密'
      },
      {
        question: '社會工程與威脅分類？',
        answer: 'Phishing 假頁面騙憑證；<br> Ransomware 加密勒索；<br> DoS 打可用性；<br> Worm 自主散播 vs Virus 需宿主檔案；防社工靠資安意識訓練'
      },
      {
        question: 'AAA 三要素？',
        answer: 'Authentication 認證（你是誰）、<br> Authorization 授權（你能做什麼）、<br> Accounting 記錄（你做了什麼）'
      }
    ]
  },
  {
    moduleName: 'Automation & Programmability',
    weight: '10%',
    cards: [
      {
        question: 'SDN Controller-based 架構？',
        answer: '管理平面集中於 Controller；<br> Northbound API 對上層應用（REST）、<br> Southbound API 對底層設備（NETCONF/OpenFlow）；<br> DNA Center 為 Cisco 實作'
      },
      {
        question: '三平面分工？',
        answer: 'Control plane：跑 OSPF/BGP 建路由表；Data plane：依表轉發；Management plane：CLI/SNMP/API 管理；SDN 將控制面集中於 Controller'
      },
      {
        question: 'Postman 定位？',
        answer: 'API 測試工具：發送請求、檢視回應與 Header；呼叫 DNA Center 北向 REST API 的標準驗證流程'
      },
      {
        question: 'Python JSON 解析？',
        answer: 'json.loads() 字串→Python 物件；json.dumps() 物件→字串；requests 模組 .json() 方法最常用'
      },
      {
        question: 'JSON/YAML/XML 格式差異？',
        answer: 'JSON：鍵值對+陣列、機器友善主流；YAML：縮排階層、人類可讀常用於 Ansible；XML：標籤式較冗長'
      },
      {
        question: 'REST API 特性？',
        answer: 'Stateless、HTTP 動詞操作資源（GET/POST/PUT/DELETE）、JSON 主流格式；Northbound 向上、Southbound（NETCONF/OpenFlow）向下'
      },
      {
        question: '自動化工具定位？',
        answer: 'Ansible：Agentless 配置管理；Terraform：Agentless IaC 佈建；Puppet/Chef：Agent-based 配置管理'
      },
      {
        question: 'NETCONF vs RESTCONF？',
        answer: 'NETCONF：XML over SSH（TCP 830）；RESTCONF：RESTful over HTTPS（443），支援 JSON/XML；兩者皆以 YANG 為資料模型'
      },
      {
        question: 'HTTP Status Code？',
        answer: '• 1xx（資訊回應）：伺服器已接收請求，正在繼續處理。<br> • 2xx（成功）：請求已成功被伺服器接收、理解並接受（如 200 成功 / 201 建立 / 204 無內容）。 <br> • 3xx（重新導向）：需要採取進一步的措施以完成請求（如 301、302 重新導向）。 <br>  • 4xx（客戶端錯誤）：請求包含語法錯誤或無法完成（如 400 錯誤請求 / 401 未授權 / 403 禁止 / 404 找不到）。 <br> • 5xx（伺服器錯誤）：伺服器在處理請求時發生錯誤（如 500 Internal Server Error）。 <br> '
      },
      {
        question: 'Ansible 核心元件？',
        answer: 'Inventory（主機清單）、Playbook（YAML 任務劇本）、Module（執行單元）、Vault（加密機敏資料）；Agentless 走 SSH/API 推送'
      },
      {
        question: 'YANG 是什麼？',
        answer: 'Data Modeling Language，定義設備配置與狀態的結構化資料模型，供 NETCONF/RESTCONF 使用'
      }
    ]
  }
];
