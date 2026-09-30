import { Question } from '../types';

export interface ModuleMeta {
  id: number;
  name: string;
  fullName: string;
  weight: number; // percentage in CCNA 200-301
  ciscoCode: string;
  description: string;
}

export const MODULE_META: ModuleMeta[] = [
  {
    id: 0,
    name: '1. Network Fundamentals',
    fullName: '1. Network Fundamentals',
    weight: 20,
    ciscoCode: '1.0',
    description: '實體層規格、雙絞線/光纖、TCP/IP 與 OSI 七層、IPv4 子網與 IPv6 定址、雲端與虛擬化'
  },
  {
    id: 1,
    name: '2. Network Access',
    fullName: '2. Network Access',
    weight: 20,
    ciscoCode: '2.0',
    description: 'VLAN 劃分、802.1Q Trunking、STP/RSTP 根橋生成樹、EtherChannel 鏈路綑綁、WLC 無線架構'
  },
  {
    id: 2,
    name: '3. IP Connectivity',
    fullName: '3. IP Connectivity',
    weight: 25,
    ciscoCode: '3.0',
    description: '路由表仲裁 (LPM/AD/Metric)、靜態與浮動路由、OSPFv2/v3 鄰居條件與狀態機、FHRP/HSRP 備援'
  },
  {
    id: 3,
    name: '4. IP Services',
    fullName: '4. IP Services',
    weight: 10,
    ciscoCode: '4.0',
    description: 'NAT/PAT 埠位址轉換、DHCP Server 與 Relay Agent、NTP 時間同步、Syslog 與 SNMPv3 網管、QoS'
  },
  {
    id: 4,
    name: '5. Security Fundamentals',
    fullName: '5. Security Fundamentals',
    weight: 15,
    ciscoCode: '5.0',
    description: 'Layer 2 安全 (Port Security/DHCP Snooping/DAI)、標準與延伸 ACL、AAA 與 802.1X、VPN 與 IPsec'
  },
  {
    id: 5,
    name: '6. Automation & Programmability',
    fullName: '6. Automation & Programmability',
    weight: 10,
    ciscoCode: '6.0',
    description: 'SDN 控制器與 Cisco DNA Center、REST API 與 HTTP 狀態碼、JSON/YAML 格式、Ansible 與 Terraform'
  }
];

export const QM: string[] = MODULE_META.map(m => m.name);

export const CCNA_QUESTIONS: Question[] = [
  // ── Module 0: Network Fundamentals (20%) ──
  {
    m: 0,
    q: '在乙太網路交換器全雙工（Full-Duplex）通訊中，若介面計數器持續出現大量的「Late Collisions（延遲碰撞）」錯誤，通常最可能的原因為何？',
    o: [
      '兩端雙工模式設定不匹配（Duplex Mismatch），一端為 Half-Duplex，另一端為 Full-Duplex',
      '雙絞線纜線超過乙太網路標準限制長度（如超過 100 公尺）',
      '介面 MTU 設定過大引發巨型封包（Jumbo Frame）截斷',
      '交換器內部 CAM 表快取溢位導致向所有埠 Flooding'
    ],
    a: 0,
    e: 'Late Collision 定義為封包傳送超過 64 Bytes（512 bit-times）後才檢測到的碰撞。在正常網路中 CSMA/CD 會在傳輸前 64 Bytes 內檢測到碰撞。引發 Late Collision 最常見的兩大原因是：雙工不匹配（Duplex Mismatch，一方全雙工無視載波持續發送，另一方半雙工檢測到載波衝突）或纜線長度超過 100 公尺上限導致傳播延遲過大。在選項中，「兩端雙工模式不匹配」為 CCNA 最典型的標準考點。'
  },
  {
    m: 0,
    q: '根據 RFC 3021 規範，在點對點（Point-to-Point）串列或乙太網路直連路由鏈路中，最節省 IPv4 位址空間的最佳子網路遮罩前綴長度為何？',
    o: ['/30', '/31', '/32', '/29'],
    a: 1,
    e: 'RFC 3021 專門定義了在點對點鏈路上使用 /31 子網路遮罩（255.255.255.254）。在 /31 中只有 2 個 IP 位址（如 .0 與 .1），傳統上分別作為 Network ID 與 Broadcast ID，但在點對點鏈路無需廣播與網路辨識，這 2 個 IP 均可直接指派給兩端路由器介面，可用主機率達 100%，相比 /30 節省了 50% 的位址。'
  },
  {
    m: 0,
    q: '網路管理員欲將 IPv6 位址「2001:0db8:0000:0000:0008:0800:200c:417a」進行標準精簡縮寫，下列何者為正確縮寫形式？',
    o: [
      '2001:db8::8:800:200c:417a',
      '2001:db8::8:8:200c:417a',
      '2001:0db8::8:800:200c:417a',
      '2001:db8:0:0:8:800:200c:417a'
    ],
    a: 0,
    e: 'IPv6 縮寫三大規則：1. 每組 16-bit 內的「前導零（Leading Zeros）」必須省略（0db8 → db8, 0008 → 8）；注意非前導零不能省（0800 縮寫為 800，不能縮成 8）。2. 連續的全零群組可用雙冒號「::」替代一次，此處「0000:0000」壓縮為「::」。綜合得出 2001:db8::8:800:200c:417a。'
  },
  {
    m: 0,
    q: '當主機透過 EUI-64 自動產生 IPv6 Link-Local 介面識別碼時，針對 MAC 位址「00-1A-2B-3C-4D-5E」，生成的介面識別碼（Interface ID）為何？',
    o: [
      '021a:2bff:fe3c:4d5e',
      '001a:2bff:fe3c:4d5e',
      '021a:2bfe:ff3c:4d5e',
      'fe80::001a:2bff:fe3c:4d5e'
    ],
    a: 0,
    e: 'EUI-64 生成步驟：1. 在 48-bit MAC 位址中央（第 24 bit 處）插入 16-bit 固定值「FF-FE」，得到 001A:2BFF:FE3C:4D5E。2. 將第一個 Byte（00 即 0000 0000）的反轉第 7 位（Universal/Local bit，U/L bit），0000 0010 二進位轉換為十六進位「02」。最終結果為 021a:2bff:fe3c:4d5e。'
  },
  {
    m: 0,
    q: '關於 TCP 與 UDP 傳輸層協定特性的比較，下列敘述哪些正確？（複選題，選 2 項）',
    o: [
      'TCP 提供基於序號（Sequence Number）與確認號（ACK）的可靠重傳與滑動視窗流量控制',
      'UDP 標頭長度為 8 Bytes，而 TCP 基本標頭長度為 20 Bytes',
      'TCP 使用三向交握建立連線，終止連線亦僅需兩次交握',
      '語音通話（VoIP/RTP）通常優先選擇 TCP 協定以確保語音封包 100% 不遺失',
      'UDP 支援廣播（Broadcast）與多播（Multicast），而 TCP 亦同時完整支援多播傳輸'
    ],
    a: [0, 1],
    e: '選項 A 正確：TCP 為連線導向，具備可靠傳輸與流量控制機制。選項 B 正確：UDP Header 僅 8 Bytes（Source Port, Dest Port, Length, Checksum），TCP 標準 Header 為 20 Bytes。選項 C 錯誤：TCP 斷線需要四向交握（FIN/ACK 流程）。選項 D 錯誤：VoIP/RTP 需要低延遲、容忍少量丟包，故使用 UDP。選項 E 錯誤：TCP 僅支援一對一單播（Unicast），不支援多播或廣播。'
  },
  {
    m: 0,
    q: '下列哪種類型的虛擬化架構中，Hypervisor 直接安裝於實體伺服器硬體之上（Bare-Metal），無需依賴底層主機作業系統？',
    o: [
      'Type 1 Hypervisor（例如 VMware ESXi、Cisco UCS）',
      'Type 2 Hypervisor（例如 VMware Workstation、VirtualBox）',
      'Container 容器化引擎（例如 Docker）',
      'VLAN 虛擬區域網路分區'
    ],
    a: 0,
    e: 'Type 1 Hypervisor（原生/裸機 Bare-Metal）直接運行於實體硬體之上，如 VMware ESXi、Microsoft Hyper-V Server，效能損耗極低，適用於企業級資料中心。Type 2 Hypervisor 則必須安裝在現有作業系統（如 Windows, macOS）之上。'
  },
  {
    m: 0,
    q: '一台 PC 欲傳送封包至遠端網段的 Web 伺服器，若 PC 本地 ARP 快取表中無任何紀錄，PC 在發送第一個資料封包前，會先向區域網路發送 ARP 請求以解析下列何者的 MAC 位址？',
    o: [
      '預設閘道器（Default Gateway）的路由器介面 MAC 位址',
      '遠端 Web 伺服器的 MAC 位址',
      '本地 DNS 伺服器的 MAC 位址',
      '二層交換器管理介面（SVI）的 MAC 位址'
    ],
    a: 0,
    e: '當目的 IP 與來源主機不在同一子網路時，主機知道必須透過預設閘道（Default Gateway）進行跨網段轉發。由於 L2 幀只能在本地廣播域傳輸，PC 在封裝資料時，目的 MAC 填入的是預設閘道介面的 MAC 位址，因此發送 ARP Request 查詢預設閘道的 MAC。'
  },

  // ── Module 1: Network Access (20%) ──
  {
    m: 1,
    q: '在 Cisco Catalyst 交換器之間配置 802.1Q Trunk 鏈路時，若兩端 Native VLAN 設定不一致（例如 SW1 為 VLAN 1，SW2 為 VLAN 99），會產生下列何種後果？',
    o: [
      '兩端會收到 CDP 的 Native VLAN Mismatch 警報，且跨 Native VLAN 的未標記流量可能在兩端 VLAN 間洩漏',
      'Trunk 鏈路會立即被 err-disable 關閉',
      '所有已標記（Tagged）的 VLAN 流量均會立即中斷轉發',
      '交換器會自動協商並強制將兩端 Native VLAN 統一改為 VLAN 1'
    ],
    a: 0,
    e: '802.1Q Native VLAN 預設為明文不打 Tag。如果 SW1 Native VLAN 為 1，SW2 Native VLAN 為 99，當 SW1 發送 VLAN 1 流量時不加標頭送出，SW2 接收到無標頭流量後會認定屬於自己的 Native VLAN 99，從而引發 VLAN 洩漏（VLAN Hopping/Leak）與廣播域合併風險。Cisco CDP 會持續在 Console 打印「%CDP-4-NATIVE_VLAN_MISMATCH」警告。'
  },
  {
    m: 1,
    q: '在執行 Rapid-PVST+（802.1w）的交換式網路中，哪一項 STP 防護特性（STP Protection）可配置在存取埠（Access Port）上，當該埠收到意外的 BPDU 封包時，立即將該介面置於「err-disable」狀態？',
    o: ['BPDU Guard', 'Root Guard', 'Loop Guard', 'BPDU Filter'],
    a: 0,
    e: 'BPDU Guard 通常搭配 PortFast 一起配置在連接終端主機的邊緣存取埠。若有人私接未授權交換器並發送 BPDU，BPDU Guard 會偵測到並立刻將該連接埠關閉進入 err-disable 狀態，防止未授權設備影響生成樹拓撲。Root Guard 則是防止下游埠奪取 Root Bridge 權利（收到 Superior BPDU 時將埠置於 root-inconsistent 狀態）。'
  },
  {
    m: 1,
    q: '在配置 Cisco EtherChannel（LACP 802.3ad）時，若交換器 SW1 介面配置為「channel-group 1 mode active」，則對端 SW2 的介面必須配置為下列哪種模式才能成功協商建立 EtherChannel？（複選題，選 2 項）',
    o: ['active', 'passive', 'desirable', 'auto', 'on'],
    a: [0, 1],
    e: 'LACP 協定共有兩種協商模式：active（主動發起 LACP 協商）與 passive（被動等待 LACP 封包）。若一方為 active，另一方為 active 或 passive 均可順利建立（Active+Active 或 Active+Passive）。注意 desirable 與 auto 屬於 Cisco 私有的 PAgP 協定，無法與 LACP 混用。'
  },
  {
    m: 1,
    q: '在企業無線網路架構中，採用「Split-MAC（集中式 WLC）」架構時，下列哪項功能由 Lightweight AP（LAP）本地負責處理，而非由遠端的 WLC 控制器處理？',
    o: [
      '802.11 射頻幀的發送、接收與 MAC 層確認（ACK/Beaconing）',
      '802.1X 企業級使用者身分認證與 RADIUS 交握',
      '無線客戶端跨 AP 三層漫遊協調（Layer 3 Roaming）',
      '動態通道指派與射頻資源管理（RRM）'
    ],
    a: 0,
    e: 'Split-MAC 架構中，Lightweight AP 負責即時性極高的 Real-time MAC 功能：RF 射頻傳輸、Beacon 信標發送、ACK 確認信號、訊框探測 Probe Response 等。而管理性功能（如 802.1X 認證、漫遊協同、動態信道 RRM 分配、關聯與解除關聯）均交由 WLC（無線網路控制器）集中處理。'
  },
  {
    m: 1,
    q: '檢視 Cisco 交換器輸出發現某介面狀態如下：`Gi0/1 is down, line protocol is down (err-disabled)`。此介面最可能是因為觸發了下列哪一項安全機制所導致？',
    o: [
      'Port Security 違反規則（Violation 模式設定為 shutdown）',
      '兩端 Native VLAN 不匹配',
      '該介面連接的 PC 重新開機',
      'VLAN 10 在 VTP 中被刪除'
    ],
    a: 0,
    e: '當配置了 Switchport Port-Security 且 violation 模式預設為 shutdown 時，一旦未授權的 MAC 位址嘗試接入該介面，交換器會立即引發 Violation 事件，並將該實體介面強制置入「err-disabled」狀態。'
  },
  {
    m: 1,
    q: 'IEEE 802.11 無線網路在 2.4 GHz 頻段中，互不重疊（Non-overlapping）的三個獨立通道編號為何？',
    o: [
      '通道 1、6、11',
      '通道 1、5、9',
      '通道 2、7、12',
      '通道 36、40、44'
    ],
    a: 0,
    e: '在 2.4 GHz 頻譜中，每個通道寬度通常為 20 MHz 或 22 MHz，相鄰通道間距僅 5 MHz。為了避免同頻與相鄰頻率干擾（CCI/ACI），標準規劃中互不重疊的三個通道為 1、6、11。通道 36、40 等為 5 GHz 頻段通道。'
  },

  // ── Module 2: IP Connectivity (25%) ──
  {
    m: 2,
    q: '路由器路由表（Routing Table）中同時存在以下四條到達不同目標網段的路由，當路由器收到目的 IP 為「172.16.10.33」的封包時，將根據何種原則決定轉發路徑？且會匹配到哪條路由？',
    o: [
      '最長前綴匹配原則（Longest Prefix Match），匹配到 172.16.10.32/28',
      '管理距離（AD）最小優先，匹配到 OSPF 路由 172.16.10.0/24',
      '度量值（Metric）最低優先，匹配到 172.16.0.0/16',
      '靜態路由優先於動態路由，匹配到 172.16.10.0/24'
    ],
    a: 0,
    e: '路由仲裁黃金定律：路由器選路的第一優先級永遠是「最長前綴匹配（Longest Prefix Match, LPM）」，即子網路遮罩最長、最精確者優先，只有當多條路徑的前綴長度完全相同時，才會比較管理距離（AD）與度量值（Metric）。172.16.10.33 落在 172.16.10.32/28（範圍 .32~.47）之內，其 /28 比 /24 或 /16 更精確，故必定由該路由轉發。'
  },
  {
    m: 2,
    q: '網路管理員欲在 Cisco 路由器上配置一條浮動靜態路由（Floating Static Route）作為 OSPF 路由的備援鏈路，下列指令何者正確？（OSPF 預設 AD 為 110）',
    o: [
      'ip route 0.0.0.0 0.0.0.0 192.168.12.2 120',
      'ip route 0.0.0.0 0.0.0.0 192.168.12.2 90',
      'ip route 0.0.0.0 0.0.0.0 192.168.12.2 metric 120',
      'ip route 0.0.0.0 0.0.0.0 192.168.12.2 distance 10'
    ],
    a: 0,
    e: '浮動靜態路由（Floating Static Route）的核心原理是將靜態路由的管理距離（AD）故意調高，使其大於主路由協定（OSPF 的 AD 為 110）。Cisco IOS 語法中，末尾接的數值即為 Administrative Distance。指令 `ip route 0.0.0.0 0.0.0.0 192.168.12.2 120` 將該靜態路由的 AD 指定為 120，當 OSPF 正常時此路由不會進路由表；一旦 OSPF 失效，該浮動路由立即接管。'
  },
  {
    m: 2,
    q: '在 OSPFv2 網路中，兩台直連路由器 R1 與 R2 嘗試建立鄰居關係，但狀態始終停留在「ExStart / Exchange」狀態無法進入「Full」，最常見的故障原因為何？',
    o: [
      '兩端直連接面的 MTU（最大傳輸單元）大小不匹配',
      '兩端的 Hello / Dead Timer 間隔設定不一致',
      '兩端配置的 OSPF Area ID 不一致',
      '介面上的子網路遮罩設定不相同'
    ],
    a: 0,
    e: '在 OSPF 狀態機中，若 Hello/Dead Timer、Area ID 或 Subnet 遮罩不一致，路由器甚至無法進入 2-Way 狀態（直接無法發現鄰居）。當狀態能推進到 ExStart，代表兩端已經完成雙向通訊並開始協商主從關係與交換 DBD 封包。若兩端 MTU 不一致，MTU 較小的一方會拒絕接收對方超過 MTU 的 DBD 封包，導致狀態永久卡在 ExStart 或 Exchange。'
  },
  {
    m: 2,
    q: '關於單臂路由器（Router-on-a-Stick, ROAS）實現跨 VLAN 路由轉發的設定，下列在路由器子介面上的配置何者正確且必備？',
    o: [
      '必須在子介面上配置 `encapsulation dot1q <vlan-id>` 指定封裝協定與 VLAN ID',
      '必須在子介面上配置 `switchport mode trunk`',
      '實體主介面必須配置與子介面相同的 IP 位址',
      '所有子介面必須啟用 VTP 協定以獲取 VLAN 資訊'
    ],
    a: 0,
    e: 'ROAS 架構中，路由器實體介面連接交換器的 Trunk 埠，路由器上建立多個邏輯子介面（如 G0/0.10）。每個子介面必須使用 `encapsulation dot1q <vlan-id>` 宣告其對應解封裝的 802.1Q VLAN 標籤，然後配置該 VLAN 的預設閘道 IP 位址。注意路由器三層介面不支援 switchport 指令。'
  },
  {
    m: 2,
    q: '在配置 HSRPv2（Hot Standby Router Protocol 版本 2）時，預設虛擬 MAC 位址（Virtual MAC Address）的格式為何？',
    o: [
      '0000.0C9F.Fxxx（xxx 為 12-bit 的 HSRP Group 編號）',
      '0000.0C07.ACxx（xx 為 8-bit 的 HSRP Group 編號）',
      '0000.5E00.01xx（VRRP 虛擬 MAC 位址）',
      '0007.B400.xxxx（GLBP 虛擬 MAC 位址）'
    ],
    a: 0,
    e: 'HSRPv1 的虛擬 MAC 為 0000.0C07.ACxx（Group 範圍 0~255）。HSRPv2 將 Group 擴充為 0~4095，其虛擬 MAC 格式為 0000.0C9F.Fxxx（例如 Group 100 為 0000.0C9F.F064）。0000.5E00.01xx 則屬於標準 VRRP IPv4 虛擬 MAC。'
  },

  // ── Module 3: IP Services (10%) ──
  {
    m: 3,
    q: '在配置 PAT（埠位址轉換，Port Address Translation / NAT Overload）時，下列哪一個關鍵字必須加在 NAT 映射指令的末端，以便多個內部私有 IP 能共享單一公網 IP？',
    o: ['overload', 'pat-enable', 'multiplex', 'pool-share'],
    a: 0,
    e: 'Cisco IOS 中配置 PAT 必須在 `ip nat inside source list <acl> interface <ext-if> overload` 或 `ip nat inside source list <acl> pool <pool-name> overload` 指令後加上「overload」關鍵字。overload 告訴路由器利用 TCP/UDP 的第 4 層埠號（Port）來區分不同的內部主機連線。'
  },
  {
    m: 3,
    q: '當跨網段的 DHCP 客戶端發送廣播的 DHCP Discover 封包（UDP 68 → 廣播 255.255.255.255:67）時，路由器介面必須配置下列哪一條指令以充當 DHCP Relay Agent（中繼代理），將廣播轉換為單播轉發給遠端的 DHCP 伺服器？',
    o: [
      'ip helper-address <DHCP_Server_IP>',
      'ip dhcp relay <DHCP_Server_IP>',
      'service dhcp forward <DHCP_Server_IP>',
      'ip dhcp-server target <DHCP_Server_IP>'
    ],
    a: 0,
    e: '`ip helper-address <ip>` 配置在接收客戶端廣播的路由器入口介面上。它會將 8 種預設 UDP 廣播協定（包括 UDP 67/68 DHCP/BOOTP、UDP 69 TFTP、UDP 53 DNS、UDP 37 Time 等）轉換為單播發送給指定的伺服器 IP，並在 DHCP 封包中填入 `giaddr`（Relay Agent IP）供伺服器分配對應網段的 IP 池。'
  },
  {
    m: 3,
    q: 'Cisco IOS Syslog 系統日誌嚴重程度等級（Severity Levels）由高到低為 0 至 7。下列哪一級代表「Warning（警告等級）」？',
    o: ['4', '1', '3', '6'],
    a: 0,
    e: 'Syslog 8 大等級口訣（Every Alien Shits In Cold Dim Water）：0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notification, 6=Informational, 7=Debugging。因此 Level 4 為 Warning。'
  },
  {
    m: 3,
    q: '在 SNMP 協定版本比較中，哪一個版本正式引入了使用者安全模型（USM），同時提供資料加密（Privacy/AES）、訊息完整性驗證（Auth/SHA）與防重放攻擊特性？',
    o: ['SNMPv3', 'SNMPv2c', 'SNMPv1', 'RMONv2'],
    a: 0,
    e: 'SNMPv1 與 SNMPv2c 均依賴明文 Community String 進行極度脆弱的身份認證，無加密功能。SNMPv3 完整引入了 USM（User-based Security Model），支援 noAuthNoPriv、authNoPriv 及最強的 authPriv（身份認證+封包加密傳輸）。'
  },
  {
    m: 3,
    q: '關於 QoS 服務品質中的差異化服務代碼點（DSCP），語音通話載荷（Voice Payload）在標準 DiffServ 架構中通常被標記為下列何種數值？',
    o: [
      'EF（Expedited Forwarding，DSCP 46）',
      'AF31（Assured Forwarding，DSCP 26）',
      'CS3（Class Selector 3，DSCP 24）',
      'BE（Best Effort，DSCP 0）'
    ],
    a: 0,
    e: 'QoS 考綱中，語音封包（Voice）對延遲與抖動極為敏感，標準推薦標記為 EF（Expedited Forwarding，十進位 DSCP 46，二進位 101110，對應 L2 CoS 5），享有專屬優先佇列（Priority Queue / LLQ）。'
  },

  // ── Module 4: Security Fundamentals (15%) ──
  {
    m: 4,
    q: '當在交換器介面上配置了「Dynamic ARP Inspection（DAI）」以防範 ARP 欺騙（ARP Spoofing）與中間人攻擊時，DAI 必須依賴下列哪一項功能所維護的資料庫來驗證 ARP 封包？',
    o: [
      'DHCP Snooping Binding Database',
      'Port Security MAC Table',
      'ARP Cache Routing Table',
      'CAM Table Flooding Filter'
    ],
    a: 0,
    e: 'DAI（動態 ARP 檢查）是一種二層安全技術，當接收到 ARP 請求或回應時，它會比對封包中的 IP 與 MAC 是否匹配。DAI 的驗證基礎正是來自於 DHCP Snooping 建立的「DHCP Snooping 綁定表（包含 MAC、IP、租期、VLAN 與埠號）」。'
  },
  {
    m: 4,
    q: '關於標準 ACL（Standard ACL）與延伸 ACL（Extended ACL）的最佳部署位置原則，下列敘述何者最符合 Cisco 官方架構設計最佳實踐？',
    o: [
      '標準 ACL 應盡可能放置在靠近目的端（Destination），延伸 ACL 應盡可能放置在靠近來源端（Source）',
      '標準 ACL 應盡可能放置在靠近來源端，延伸 ACL 應盡可能放置在靠近目的端',
      '兩種 ACL 均應優先配置在網路核心交換器（Core Switch）上',
      '標準 ACL 只能配置在 Outbound 方向，延伸 ACL 只能配置在 Inbound 方向'
    ],
    a: 0,
    e: '標準 ACL 僅能依據「來源 IP」進行過濾。若將標準 ACL 放在靠近來源端，可能會誤殺該主機前往其他合法目的地的流量，因此標準 ACL 應盡量靠近「目的端」。延伸 ACL 支援依據來源 IP、目的 IP、通訊協定與埠號進行五元組過濾，因此越靠近「來源端」封鎖越好，可避免無效流量浪費廣域網路頻寬。'
  },
  {
    m: 4,
    q: '在 AAA 認證架構中，Cisco 專屬的 TACACS+ 與業界標準 RADIUS 協定之間有著關鍵差異。下列關於 TACACS+ 的敘述何者正確？',
    o: [
      'TACACS+ 使用 TCP 49 埠，並對整個封包內容（除標頭外）進行全面加密，且將 Authentication、Authorization 與 Accounting 完全分離',
      'TACACS+ 使用 UDP 1812 埠，僅對密碼欄位進行 MD5 加密',
      'TACACS+ 將認證與授權功能合併於單一交握封包中以降低傳輸開銷',
      'TACACS+ 為 IEEE 802.1X 無線網路認證之強制標準協定'
    ],
    a: 0,
    e: 'TACACS+（Cisco 私有）使用 TCP 49，將 AAA 三大模組徹底分離，允許依據指令進行逐一授權（Command Authorization），且整個封包載荷全面加密；RADIUS（開放標準）使用 UDP 1812/1813，將認證與授權合併，且僅對密碼欄位加密。'
  },
  {
    m: 4,
    q: '在 IPsec VPN 架構中，下列哪一個安全協定同時提供資料機密性（加密 Encryption）、資料完整性驗證（Integrity）與來源身份認證？',
    o: [
      'ESP（Encapsulating Security Payload，IP 協定號 50）',
      'AH（Authentication Header，IP 協定號 51）',
      'GRE（Generic Routing Encapsulation，IP 協定號 47）',
      'TLS / SSL（傳輸層安全）'
    ],
    a: 0,
    e: 'IPsec 兩大核心協定：AH（Protocol 51）僅提供認證與完整性校驗，不提供加密（無法保護機密性）；ESP（Protocol 50）則同時提供加密（AES/3DES）、完整性驗證（HMAC-SHA）與防重放攻擊。'
  },
  {
    m: 4,
    q: '在 Cisco IOS 設定檔中，為了防止未加密的純文字密碼（如 enable password 或 line vty 密碼）被看光，應啟用下列哪一條全域指令？',
    o: [
      'service password-encryption',
      'enable secret-mode global',
      'crypto pki encrypt-passwords',
      'ip ssh password-protect'
    ],
    a: 0,
    e: '`service password-encryption` 會將設定檔中所有明文密碼透過 Cisco Type 7 演算法進行可逆加密（雖然 Type 7 安全性較弱，但能有效防止螢幕窺探 Shoulder Surfing）。最高安全等級特權密碼則應使用 `enable secret <pass>`（Type 5/Type 8/Type 9 雜湊）。'
  },

  // ── Module 5: Automation & Programmability (10%) ──
  {
    m: 5,
    q: '在軟體定義網路（SDN）架構中，將傳統網路設備的控制平面（Control Plane）抽離並集中化至 SDN 控制器。控制器與底層轉發設備（如 OpenFlow/NETCONF）之間的通訊介面稱為什麼？',
    o: [
      'Southbound API（南向介面）',
      'Northbound API（北向介面）',
      'Eastbound API（東向介面）',
      'Westbound API（西向介面）'
    ],
    a: 0,
    e: 'SDN 架構中：控制器向上對接業務與自動化應用程式的介面稱為 Northbound API（北向介面，通常為 RESTful API）；控制器向下對接實體或虛擬轉發層設備的介面稱為 Southbound API（南向介面，如 OpenFlow、NETCONF、RESTCONF、SNMP、OpFlex）。'
  },
  {
    m: 5,
    q: '客戶端透過 REST API 向 Cisco DNA Center 送出 HTTP POST 請求以建立新設定，伺服器成功處理並建立了該項資源，標準回傳的 HTTP 狀態碼為何？',
    o: ['201 Created', '200 OK', '204 No Content', '301 Moved Permanently'],
    a: 0,
    e: 'HTTP 狀態碼規範：200 OK 代表請求成功；201 Created 代表請求成功且伺服器已成功創建了新資源（常見於 POST 操作）；204 No Content 代表請求成功但回應不需包含主體實體（常見於 DELETE 操作）。'
  },
  {
    m: 5,
    q: '檢視以下 JSON 字串片段，何者符合嚴格的 JSON 語法規範？',
    o: [
      '{"hostname": "Router-Core", "interfaces": ["Gi0/0", "Gi0/1"], "active": true}',
      "{'hostname': 'Router-Core', 'interfaces': ['Gi0/0', 'Gi0/1'], 'active': True}",
      '{"hostname": "Router-Core", interfaces: ["Gi0/0", "Gi0/1"], "active": 1}',
      '{"hostname": "Router-Core", "interfaces": ("Gi0/0", "Gi0/1"), "active": "yes"}'
    ],
    a: 0,
    e: 'JSON 標準語法嚴格要求：1. 物件鍵名（Keys）與字串型別值必須使用「雙引號」包裹，單引號不合法。2. 布林值必須為小寫的 `true` 或 `false`（Python 的大寫 True 不合法）。3. 陣列使用中括號 `[...]`。選項 A 100% 符合 JSON 規範。'
  },
  {
    m: 5,
    q: '在主流組態管理與自動化工具（Ansible、Puppet、Chef、SaltStack）中，下列關於 Ansible 的特性描述何者正確？',
    o: [
      'Ansible 為無代理（Agentless）架構，預設透過 SSH 協定管理 Linux/網路設備，其劇本（Playbook）採用 YAML 語法撰寫',
      'Ansible 必須在每一台受管網路交換器上安裝常駐的 Python Agent 程式',
      'Ansible 採用 Pull 拉取模式，客戶端設備定時向中央伺服器同步組態',
      'Ansible 劇本只能以 Ruby 語言編寫，且不具備等冪性（Idempotency）'
    ],
    a: 0,
    e: 'Ansible 最大特色為 Agentless（無代理）：無需在被控交換器或伺服器上安裝任何 Agent，僅需 SSH 連線與 Python 環境即可運行，由控制節點主動「Push」推送設定，Playbook 採用簡潔易讀的 YAML 格式編寫，具備高度等冪性（Idempotency）。Puppet 與 Chef 則通常需要在客戶端安裝 Agent。'
  },
  {
    m: 5,
    q: '在 RESTCONF 協定中，資料建模採用哪種業界標準資料建模語言，以定義網路設備的設定（Configuration）與狀態（State）資料架構？',
    o: ['YANG', 'YAML', 'XML Schema', 'JSON Schema'],
    a: 0,
    e: 'NETCONF（RFC 6241）與 RESTCONF（RFC 8040）協定均採用 YANG（RFC 6020/7950）作為資料建模語言（Data Modeling Language）。YANG 定義資料結構、節點關聯與約束，而具體傳輸時 RESTCONF 可採用 XML 或 JSON 編碼。'
  },
  // ── Extra authentic CCNA questions for full random coverage ──
  {
    m: 0,
    q: '關於單模光纖（Single-Mode Fiber, SMF）與多模光纖（Multi-Mode Fiber, MMF）的物理特性，下列敘述何者正確？',
    o: [
      '單模光纖核心直徑較細（約 9 微米），使用雷射（Laser）作為光源，色散極小，適用於長距離傳輸',
      '多模光纖核心直徑通常為 9 微米，使用 LED 作為光源，傳輸距離可達數十公里',
      '單模光纖核心直徑約 50 或 62.5 微米，主要用於建築物內部的短距離骨幹',
      '多模光纖因完全消除了模態色散（Modal Dispersion），故成本與傳輸效能高於單模光纖'
    ],
    a: 0,
    e: '單模光纖（SMF）纖芯極細（約 8~10 微米，標準 9 µm），光束以單一路徑直線傳播，幾無模態色散，搭配雷射光源可達數十甚至上百公里傳輸。多模光纖（MMF）纖芯較粗（50 或 62.5 µm），使用 LED 或 VCSEL 光源，存在模態色散，標準有效距離通常在 550 公尺以內。'
  },
  {
    m: 0,
    q: '根據 IEEE 802.3at（PoE+）標準規範，受電設備（Powered Device, PD）端保證可獲得的最大可用輸出功率約為多少？',
    o: ['25.5 Watts', '15.4 Watts', '60 Watts', '90 Watts'],
    a: 0,
    e: 'PoE 功率標準演進：IEEE 802.3af（PoE Type 1）供電端 15.4W、受電端保證 12.95W；IEEE 802.3at（PoE+ Type 2）供電端 30W、受電端保證 25.5W；IEEE 802.3bt（4PPoE Type 3/4）則可提供 60W 至 90W 功率。'
  },
  {
    m: 1,
    q: '在兩台 Cisco Catalyst 交換器之間進行 DTP（動態中繼協定）協商時，若一方介面配置為「dynamic auto」，另一方介面必須配置為下列何種模式才能成功形成 Trunk 鏈路？（複選題，選 2 項）',
    o: ['trunk', 'dynamic desirable', 'dynamic auto', 'access'],
    a: [0, 1],
    e: 'DTP 模式匹配矩陣：dynamic auto 是被動等待協商（只要對方主動發起就轉為 Trunk，否則維持 Access）。若兩端均為 dynamic auto，雙方皆被動等待，結果會停留在 Access！因此若一方為 dynamic auto，另一方必須為 trunk 或 dynamic desirable 才能協商建立 Trunk 鏈路。'
  },
  {
    m: 1,
    q: '在 VTP（VLAN Trunking Protocol）設定中，若將交換器的 VTP 模式配置為「Transparent（透明模式）」，該交換器會具備下列哪些行為特徵？（複選題，選 2 項）',
    o: [
      '會在 Trunk 埠上繼續轉發（Forward）接收到的 VTP 廣播通告給其他下游交換器',
      '可在本地自由新增、修改與刪除 VLAN，但其變更僅儲存於本地 NVRAM/vlan.dat，不會影響其他交換器',
      '會強制將自身的 VTP Configuration Revision Number 覆寫同步給 VTP Client 交換器',
      '會自動向 VTP Server 同步並覆蓋本機原有的 VLAN 資料庫'
    ],
    a: [0, 1],
    e: 'VTP Transparent 模式特徵：1. 不與 VTP Server/Client 同步 VLAN 資料庫；2. 在 Trunk 埠上作為中繼透明轉發 VTP 封包；3. 允許在本地自行建立 VLAN（儲存在 running-config / startup-config），其 Revision 號恆為 0，絕不發送自己的 VLAN 給他人。'
  },
  {
    m: 2,
    q: 'Cisco IOS 路由表中各項路由來源之預設管理距離（Administrative Distance, AD）由小到大排序，下列何者完全正確？',
    o: [
      'Connected (0) < Static (1) < eBGP (20) < OSPF (110) < RIP (120)',
      'Connected (0) < Static (1) < OSPF (110) < eBGP (20) < RIP (120)',
      'Static (1) < Connected (0) < EIGRP (90) < OSPF (110) < RIP (120)',
      'Connected (0) < eBGP (20) < Static (1) < RIP (120) < OSPF (110)'
    ],
    a: 0,
    e: 'CCNA 必背經典 AD 表：Directly Connected = 0；Static Route = 1；eBGP = 20；EIGRP (內部) = 90；OSPF = 110；IS-IS = 115；RIP = 120；iBGP = 200；Unknown = 255。'
  },
  {
    m: 2,
    q: '在廣播型多重存取（Broadcast Multi-Access）網路的 OSPFv2 環境中，關於指定路由器（DR）與備用指定路由器（BDR）的選舉機制，下列敘述何者正確？',
    o: [
      '選舉優先比對介面 Priority（最高者勝），若 Priority 相同則比對 Router ID（最高者勝），且 DR 選舉不具搶佔性（Non-preemptive）',
      '若網路中新加入一台 Priority 更高的路由器，將會立即搶佔（Preempt）現有 DR 的地位',
      '介面 Priority 設為 0 的路由器依然可以被選為 BDR',
      '所有 DROTHER 路由器之間會彼此建立 Full 狀態的 OSPF 鄰居關係'
    ],
    a: 0,
    e: 'OSPF DR/BDR 選舉規則：1. 比對 OSPF Priority（預設 1，範圍 0~255，越大越優先；設為 0 代表放棄參選）。2. 若 Priority 相同，比對 Router-ID（最高者勝）。3. DR 選舉不具備搶佔性（Non-preemptive）：一旦 DR/BDR 選出，即使後續接入更高優先級的路由器也不會重新搶奪，以維護拓撲穩定性。4. DROTHER 之間僅停留在 2-Way 狀態，只與 DR/BDR 保持 Full。'
  },
  {
    m: 3,
    q: '在企業 Cisco IP Phone 與 PC 共享同一個交換器實體埠的典型拓撲中，為了保障語音品質，交換器介面應如何劃分信任邊界（Trust Boundary）與 VLAN？',
    o: [
      '配置 Access VLAN 承載 PC 資料流量，並透過 `switchport voice vlan <id>` 配置 Voice VLAN 承載語音流量，且信任 IP Phone 標記的 CoS/DSCP',
      '將介面設為純 Trunk 模式，並要求 PC 端自行封裝 802.1Q 語音標籤',
      '配置單一 VLAN，並在該介面上將所有流量一律強制標記為 Best Effort',
      '使用 Native VLAN 傳輸語音流量以完全免除打標開銷'
    ],
    a: 0,
    e: '典型 IP Phone 部署方案：在交換器埠上同時配置 `switchport access vlan <data-vlan>`（給串接的 PC）與 `switchport voice vlan <voice-vlan>`（以 802.1p/CoS 5 標記語音）。交換器信任 IP Phone 發出的 DSCP/CoS 標記，並將信任邊界延伸至 IP Phone，而 PC 發出的未信任流量則由 IP Phone 或交換器重標記為 CoS 0。'
  },
  {
    m: 3,
    q: '若 Cisco 網路設備的 NTP（網路時間協定）同步狀態顯示「Stratum 16」，這代表設備當前處於何種時間同步狀態？',
    o: [
      '設備目前未與任何有效 NTP 伺服器建立同步，時間處於不可信狀態',
      '設備已與最精準的原子鐘同步（Stratum 16 為最高精度）',
      '設備正處於多路徑時間負載平衡模式',
      '設備時間偏移量正好為 16 毫秒'
    ],
    a: 0,
    e: 'NTP Stratum 層級定義：Stratum 0 為原子鐘/GPS 等物理參考時鐘；Stratum 1 為直接連接原子鐘的主伺服器；Stratum 2~15 為下游逐層同步之節點。當層級達到 Stratum 16 時，代表該設備未同步（Unsynchronized）或與母鐘失聯，時間不可信。'
  },
  {
    m: 4,
    q: '當 Cisco 交換器介面啟用 Port Security 且將 violation 模式設定為「restrict」時，發生違規時交換器會執行下列哪些動作？（複選題，選 2 項）',
    o: [
      '丟棄來自未授權 MAC 位址的封包（Drop traffic）',
      '增加 Violation 計數器並發送 SNMP Trap 與 Syslog 告警日誌',
      '立即將該介面關閉並置於 err-disabled 狀態',
      '自動將該違規 MAC 學習並儲存至 running-config'
    ],
    a: [0, 1],
    e: 'Port Security 違規三大模式：1. Protect：丟棄違規封包，不發日誌，介面保持開啟；2. Restrict：丟棄違規封包，增加 Violation 計數器，發送 SNMP Trap/Syslog 警報，介面保持開啟；3. Shutdown（預設）：丟棄封包，發送警報，並立即將介面置於 err-disable 狀態。'
  },
  {
    m: 4,
    q: 'IEEE 802.1X 連接埠網路存取控制架構中，包含三大核心元件。當終端筆記型電腦嘗試接入企業交換器時，該筆記型電腦扮演下列哪一個角色？',
    o: ['Supplicant（客戶端申請者）', 'Authenticator（驗證者）', 'Authentication Server（認證伺服器）', 'Certificate Authority（憑證中心）'],
    a: 0,
    e: '802.1X 三大實體角色：1. Supplicant（申請者）：請求存取網路的終端設備/客戶端軟體；2. Authenticator（驗證者/控制中繼）：通常為 Access Switch 或 WLC，負責阻斷未認證流量並轉發 EAP 訊息；3. Authentication Server（認證伺服器）：通常為 Cisco ISE 或 RADIUS 伺服器，負責驗證憑證與發放授權政策。'
  },
  {
    m: 5,
    q: '在 Cisco DNA Center（現稱 Catalyst Center）所提供的核心功能中，「Assurance（網路保障）」模組主要提供下列哪一項革命性價值？',
    o: [
      '透過串流遙測（Streaming Telemetry）與 AI 分析進行端對端網路效能監控、主動式異常警報與根本原因分析（RCA）',
      '自動生成並列印實體機房標籤與配線圖',
      '將所有傳統 IOS 交換器直接重刷為 Linux 作業系統',
      '取代實體路由器所有的線速資料轉發硬體 ASIC'
    ],
    a: 0,
    e: 'Cisco DNA Center Assurance 模組是 Intent-Based Networking（IBN）的重要支柱。它跳脫傳統 SNMP 定時輪詢的被動模式，收集設備的即時串流遙測（Streaming Telemetry）、NetFlow、Syslog 與用戶體驗指標，利用 AI/ML 關聯分析主動預警網路劣化，並提供 Guided Remediation（根本原因排錯引導）。'
  },
  {
    m: 5,
    q: '在 Python 網路自動化腳本中，若已透過 requests 模組取得 Cisco 控制器的 JSON 回應字串 `json_text`，欲將其解析為 Python 原生 dictionary 物件，應使用下列哪一個標準函式？',
    o: ['json.loads(json_text)', 'json.dumps(json_text)', 'json.parse(json_text)', 'json.decode(json_text)'],
    a: 0,
    e: 'Python 內建 `json` 模組：`json.loads()`（load string）負責將 JSON 格式的文字字串反序列化轉換為 Python 資料型別（dict/list）；`json.dumps()`（dump string）則是將 Python 物件序列化為 JSON 字串。'
  }
];

export interface CheatItem {
  category: string;
  title: string;
  content: string;
  badge: string;
}

export const COMPARISON_TABLES: CheatItem[] = [
  {
    category: 'Layer 1 & 2',
    title: '光纖規格對照：單模 (SMF) vs 多模 (MMF)',
    content: 'SMF（9µm 纖芯、Laser 光源、無模態色散、距離數十公里）vs MMF（50/62.5µm 纖芯、LED/VCSEL 光源、受限模態色散、距離 ≤550m）。',
    badge: '1.1 Cabling'
  },
  {
    category: 'Layer 2',
    title: 'STP vs RSTP 埠狀態對照',
    content: '傳統 802.1D（Blocking → Listening → Learning → Forwarding）對應 802.1w RSTP（Discarding → Learning → Forwarding）。RSTP 透過 Proposal/Agreement 機制秒級收斂。',
    badge: '2.2 STP'
  },
  {
    category: 'Layer 3',
    title: 'CCNA 官方 Administrative Distance (AD) 總覽',
    content: 'Connected: 0 | Static: 1 | eBGP: 20 | EIGRP(內部): 90 | OSPF: 110 | IS-IS: 115 | RIP: 120 | iBGP: 200。選路第一看 LPM 前綴長度，長度相同看 AD，AD 相同看 Metric。',
    badge: '3.1 Routing'
  },
  {
    category: 'Layer 3 & 4',
    title: 'Syslog 8 大嚴重度等級 (0-7)',
    content: '0: Emergency | 1: Alert | 2: Critical | 3: Error | 4: Warning | 5: Notice | 6: Info | 7: Debugging。口訣：Every Alien Shits In Cold Dim Water。',
    badge: '4.3 Syslog'
  },
  {
    category: 'Security',
    title: 'TACACS+ vs RADIUS 深度比對',
    content: 'TACACS+：TCP 49，整個封包（載荷）加密，AAA 完全獨立解耦，Cisco 私有。RADIUS：UDP 1812/1813，僅加密 Password 欄位，認證與授權合併，開放標準。',
    badge: '5.3 AAA'
  },
  {
    category: 'Automation',
    title: '組態管理工具：Ansible vs Puppet vs Chef vs Terraform',
    content: 'Ansible：Agentless、Push、SSH/YAML。Puppet：Agent-based、Pull、Ruby/Manifest。Chef：Agent-based、Pull、Ruby/Cookbook。Terraform：宣告式 IaC 雲端基礎架構編排。',
    badge: '6.3 Automation'
  }
];

export const CLI_LABS: CheatItem[] = [
  {
    category: 'Switching',
    title: 'Trunk 與 Native VLAN 配置',
    content: '`switchport mode trunk`\n`switchport trunk native vlan 99`\n`switchport trunk allowed vlan 10,20,99`\n驗證：`show interfaces trunk`',
    badge: 'Lab: VLAN'
  },
  {
    category: 'Routing',
    title: 'OSPFv2 單區域基礎設定',
    content: '`router ospf 1`\n`router-id 1.1.1.1`\n`network 192.168.1.0 0.0.0.255 area 0`\n`passive-interface G0/0`\n驗證：`show ip ospf neighbor`、`show ip route ospf`',
    badge: 'Lab: OSPF'
  },
  {
    category: 'Security',
    title: 'Port Security 嚴格綁定',
    content: '`switchport mode access`\n`switchport port-security`\n`switchport port-security maximum 2`\n`switchport port-security mac-address sticky`\n`switchport port-security violation shutdown`\n驗證：`show port-security interface G0/1`',
    badge: 'Lab: PortSec'
  },
  {
    category: 'Services',
    title: 'PAT (NAT Overload) 上網映射',
    content: '`ip nat inside source list 1 interface G0/1 overload`\n`access-list 1 permit 192.168.0.0 0.0.255.255`\n`interface G0/0` -> `ip nat inside`\n`interface G0/1` -> `ip nat outside`\n驗證：`show ip nat translations`',
    badge: 'Lab: NAT'
  }
];

export const COMMON_PITFALLS: CheatItem[] = [
  {
    category: 'Routing',
    title: '最長前綴匹配 (LPM) 大於一切 AD！',
    content: '即使某條路由是 AD=120 的 RIP 路由，只要其前綴為 /28，而 OSPF(AD=110) 路由為 /24，目的 IP 落在 /28 內時必定走 RIP！AD 只有在「前綴長度完全相同」時才比較。',
    badge: 'Trap: LPM'
  },
  {
    category: 'Switching',
    title: 'Native VLAN 不一致引發 CDP 告警與洩漏',
    content: '802.1Q Native VLAN 預設不打 Tag。兩端 Native VLAN 號碼不一致會造成 VLAN 跨越與廣播域混淆，CDP 會報告 %CDP-4-NATIVE_VLAN_MISMATCH。',
    badge: 'Trap: 802.1Q'
  },
  {
    category: 'Security',
    title: 'ACL 末端永遠隱含 Deny Any Any！',
    content: 'Cisco ACL 在由上而下匹配時，最後一條永遠預設為隱含的 `deny ip any any`。如果 ACL 只寫了 deny 指令而沒有寫任何 permit，所有流量都將被無情封鎖！',
    badge: 'Trap: ACL'
  },
  {
    category: 'Services',
    title: 'DHCP ip helper-address 放置位置不可反向',
    content: '`ip helper-address <server-ip>` 必須配置在「接收客戶端廣播的入口路由器介面」上，而非靠近 DHCP 伺服器的出口介面！',
    badge: 'Trap: DHCP'
  }
];

export const CCNA_TAXONOMY = [
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

export const REMEDIATION_GUIDE: Record<string, {
  day: string;
  tab: string;
  kw: string;
  summary: string;
}> = {
  '1.1 實體層排錯、纜線與光纖規格 (L1/Cabling/Optics)': {
    day: 'Day 1（實體層與纜線規格）',
    tab: 'tables',
    kw: '光纖',
    summary: '重點複習單模 (SMF 9µm Laser) vs 多模 (MMF 50µm LED) 光纖特性、雙絞線長度限制 (100m) 與 Late Collision 雙工排錯。'
  },
  '1.2 IPv4 定址、VLSM 與子網劃分 (IPv4/Subnetting)': {
    day: 'Day 3（IPv4 子網路劃分 — 每日 20 題）',
    tab: 'calc',
    kw: 'IPv4',
    summary: '善用本系統「IPv4 Subnetting 計算機」演練 RFC 3021 /31 點對點鏈路與 /32 主機遮罩運算。'
  },
  '1.3 IPv6 定址、SLAAC 與 EUI-64 (IPv6 Fundamentals)': {
    day: 'Day 4（IPv6 位址類型與縮寫規則）',
    tab: 'tables',
    kw: 'IPv6',
    summary: '聚焦 EUI-64 第 7 bit 反轉（U/L bit）、Link-Local (FE80::/10) 與 SLAAC 搭配 Router Advertisement (RA) 流程。'
  },
  '1.4 TCP/IP 與 OSI 模型封裝 (TCP/UDP/OSI Layers)': {
    day: 'Day 2（TCP/IP 與 OSI 七層對照、TCP 三向交握）',
    tab: 'tables',
    kw: 'TCP',
    summary: '重溫 TCP 三向交握 (SYN→SYN-ACK→ACK)、常見 Port 埠號 (HTTP 80/HTTPS 443/SSH 22/DNS 53) 與 L1-L4 PDU 封裝。'
  },
  '1.5 雲端運算架構與虛擬化技術 (Cloud/Virtualization)': {
    day: 'Day 1（打地基：虛擬化與雲端服務）',
    tab: 'tables',
    kw: '虛擬化',
    summary: '比較 Type 1 (Bare-Metal/ESXi) vs Type 2 (Hosted) Hypervisor，以及 Container 共享 OS Kernel 的輕量特性。'
  },
  '1.6 基礎網路服務與拓撲 (Topology/ARP/DNS/Gateway)': {
    day: 'Day 1–2（網路拓撲與基礎通訊）',
    tab: 'tables',
    kw: 'ARP',
    summary: '理解跨網段封裝先發 ARP 請求預設閘道 MAC、Full-Mesh 連線數公式 n(n-1)/2 與 DNS 遞迴查詢。'
  },
  '2.1 VLAN、Trunking 與 Native VLAN (VLAN/802.1Q)': {
    day: 'Day 5 與 Day 13（交換原理、VLAN 與 Trunking）',
    tab: 'labs',
    kw: 'Trunking',
    summary: '802.1Q Native VLAN 預設明文不打標，兩端 ID 不匹配將導致 VLAN 洩漏與廣播域合併。'
  },
  '2.2 STP/RSTP 根橋選舉與保護機制 (STP/RSTP/Guard)': {
    day: 'Day 15（STP/RSTP 根橋選舉與 Port Cost）',
    tab: 'tables',
    kw: 'STP',
    summary: '熟記 Bridge Priority (4096 倍數) + 最低 MAC 選舉原則；區分 BPDU Guard (邊緣鎖埠) 與 Root Guard (下游防奪權)。'
  },
  '2.3 EtherChannel 鏈路綑綁與模式 (EtherChannel/LACP)': {
    day: 'Day 16（EtherChannel 模式匹配矩陣）',
    tab: 'tables',
    kw: 'EtherChannel',
    summary: '複習 LACP (active/passive) 與 PAgP (desirable/auto) 模式匹配矩陣，注意成員埠 (s) 代表參數不一致被掛起。'
  },
  '2.4 企業級無線網路 WLC 與 AP 架構 (Wireless/WLC/AP)': {
    day: 'Day 17–18（無線架構：Autonomous vs Lightweight、WPA3）',
    tab: 'tables',
    kw: 'WLAN',
    summary: '聚焦 Split-MAC 架構中 CAPWAP 控制 (UDP 5246) / 資料 (UDP 5247) 傳輸，以及 WPA3-SAE Dragonfly 抗字典攻擊機制。'
  },
  '2.5 交換器轉發原理與探索協定 (Switch/CDP/LLDP)': {
    day: 'Day 5 與 Day 19（交換原理與探索協定）',
    tab: 'tables',
    kw: 'CDP',
    summary: '區別 Cisco 專屬 CDP (預設啟用) 與 IEEE 802.1AB 開放標準 LLDP (需手動 lldp run)；掌握未知單播 Flooding 行為。'
  },
  '3.1 路由表解析與選路仲裁 (Routing Table/LPM/AD)': {
    day: 'Day 6（路由仲裁黃金律）',
    tab: 'tables',
    kw: 'Longest Prefix',
    summary: '落實查表三部曲：① 最長前綴匹配 (LPM) > ② 管理距離 (AD) > ③ 度量值 (Metric)；/28 路由必優先於 /24 路由。'
  },
  '3.2 靜態路由、預設與浮動備援 (Static/Default/Floating)': {
    day: 'Day 6 與 Day 11（靜態路由與浮動備援）',
    tab: 'labs',
    kw: '靜態路由',
    summary: '理解浮動靜態路由 AD 必須大於動態協定 (如設為 120)，且乙太網路介面必須指定下一跳 IP。'
  },
  '3.3 OSPFv2/OSPFv3 鄰居條件與狀態機 (OSPF Neighbors/LSA)': {
    day: 'Day 8–9（OSPFv2 鄰居狀態機、Timer 與 DR 選舉）',
    tab: 'tables',
    kw: 'OSPF',
    summary: '排查 OSPF 鄰居 7 大匹配條件；卡在 ExStart 檢查 MTU 與重複 Router-ID；DR 選舉採最高 Priority 且不具搶佔性。'
  },
  '3.4 跨 VLAN 路由 SVI 與 ROAS (Inter-VLAN Routing)': {
    day: 'Day 13（VLAN 間路由：ROAS 與 SVI）',
    tab: 'labs',
    kw: 'ROAS',
    summary: '比對 Router-on-a-Stick 子介面 dot1q 封裝與 L3 Switch SVI (需 ip routing) 的轉發原理。'
  },
  '3.5 第一跳閘道備援協定 (FHRP/HSRP/VRRP/GLBP)': {
    day: 'Day 10（FHRP 第一跳冗餘與 HSRP）',
    tab: 'tables',
    kw: 'HSRP',
    summary: '演練 HSRPv2 虛擬 MAC (0000.0C9F.Fxxx)、standby preempt 搶佔機制，以及 VRRP (Master/Backup) 開放標準差異。'
  },
  '4.1 NAT 與 PAT 埠位址轉換 (NAT/PAT/Overload)': {
    day: 'Day 12（NAT / PAT 完整演練）',
    tab: 'labs',
    kw: 'NAT',
    summary: 'Inside/Outside 方向不可顛倒；PAT 多對一上網必須加上 overload 關鍵字以透過 L4 Port 區分連線。'
  },
  '4.2 DHCP 服務與 Relay 中繼代理 (DHCP/Relay Agent)': {
    day: 'Day 23（DHCP Relay 與 DORA 流程）',
    tab: 'labs',
    kw: 'DHCP',
    summary: '掌握 DORA 四步驟；ip helper-address 必須配置在靠近客戶端的入口介面，將廣播轉為單播並填入 giaddr 選池。'
  },
  '4.3 時間同步、日誌與監控 (NTP/Syslog/SNMP)': {
    day: 'Day 22（NTP、Syslog 嚴重度與 SNMPv3）',
    tab: 'tables',
    kw: 'Syslog',
    summary: '記憶 Syslog 嚴重度 0 (Emergency) 至 7 (Debugging)；NTP Stratum 16 代表未同步；SNMPv3 authPriv 具備加密防護。'
  },
  '4.4 QoS 服務品質分類與標記 (QoS/CoS/DSCP)': {
    day: 'Day 23（QoS 分類標記、Policing 與 Shaping）',
    tab: 'tables',
    kw: 'QoS',
    summary: '語音標記為 EF (DSCP 46 / CoS 5)；Policing (丟棄/重標記) 支援雙向，Shaping (佇列緩衝平滑) 僅支援 Outbound。'
  },
  '5.1 Layer 2 安全防護 (Port Sec/Snooping/DAI)': {
    day: 'Day 20（Port Security、DHCP Snooping 與 DAI）',
    tab: 'labs',
    kw: 'Port Security',
    summary: '熟悉 Port Security 三大違規模式 (Protect/Restrict/Shutdown)；DAI 依賴 DHCP Snooping 建立的 IP-MAC 綁定表防 ARP 欺騙。'
  },
  '5.2 ACL 存取控制清單 (Standard/Extended/Named ACL)': {
    day: 'Day 11（ACL 基本語法與放置位置原則）',
    tab: 'tables',
    kw: 'ACL',
    summary: 'Standard ACL (僅來源 IP) 放靠近目的地；Extended ACL (五元組) 放靠近來源；由上而下逐條匹配且末端隱含 Deny Any。'
  },
  '5.3 AAA 架構、身分認證與密碼強化 (AAA/802.1X/Passwords)': {
    day: 'Day 19（AAA 架構、802.1X 與密碼強化）',
    tab: 'tables',
    kw: 'TACACS+',
    summary: 'TACACS+ (TCP 49 全加密/逐指令授權) vs RADIUS (UDP 1812/1813 僅加密密碼)；Type 9 Scrypt 雜湊具最高防破解強度。'
  },
  '5.4 VPN 隧道與密碼學基礎 (VPN/IPsec/Encryption)': {
    day: 'Day 20（Site-to-Site VPN 與 IPsec 機制）',
    tab: 'tables',
    kw: 'VPN',
    summary: 'IPsec Tunnel Mode 加密整個原始封包並加新標頭；ESP (Protocol 50) 提供加密與認證，AH (Protocol 51) 僅認證不加密。'
  },
  '6.1 SDN 控制器與 DNA/Catalyst Center (SDN/DNA-C)': {
    day: 'Day 26（SDN 架構、Controller 與 DNA Center）',
    tab: 'tables',
    kw: 'Controller',
    summary: 'SDN 將控制與管理平面集中於 Controller，資料平面留於本地線速轉發；DNA-C 提供 Assurance 遙測主動健康分析。'
  },
  '6.2 REST API、HTTP 狀態碼與資料格式 (REST/JSON/YAML)': {
    day: 'Day 24–25（REST API、HTTP 動詞與 JSON/YAML）',
    tab: 'tables',
    kw: 'REST API',
    summary: 'CRUD 對應 POST(201)/GET(200)/PUT(200)/DELETE(204)；401 代表未驗證，403 代表權限不足；JSON 鍵名必須使用雙引號。'
  },
  '6.3 自動化組態管理與 IaC 工具 (Ansible/Terraform/Python)': {
    day: 'Day 27（Terraform、Ansible 與 Python 自動化）',
    tab: 'tables',
    kw: 'Ansible',
    summary: 'Ansible 為 Agentless + Push 模式 (走 SSH/YAML Playbook)；Terraform 為宣告式 IaC 基礎設施佈建工具。'
  }
};
