export interface ScheduleDay {
  day: number;
  stage: string;
  focus: string;
  ratio: string;
}

export const SCHEDULE_DATA: ScheduleDay[] = [
  { day: 1, stage: '打地基', focus: '網路拓撲、實體層纜線（UTP / 單模光纖）', ratio: '60:40' },
  { day: 2, stage: '打地基', focus: 'TCP/IP 與 OSI 七層對照、TCP 三向交握', ratio: '60:40' },
  { day: 3, stage: '打地基', focus: 'IPv4 子網路劃分 — 每日 20 題', ratio: '60:40' },
  { day: 4, stage: '打地基', focus: 'IPv6 位址類型與縮寫規則', ratio: '60:40' },
  { day: 5, stage: '打地基', focus: '交換原理：MAC Address Table、VLAN', ratio: '60:40' },
  { day: 6, stage: '打地基', focus: '靜態路由 / 預設路由', ratio: '60:40' },
  { day: 7, stage: '打地基', focus: '第一輪模擬測驗（50 題檢視弱點）', ratio: '60:40' },
  { day: 8, stage: '路由深潛', focus: 'OSPFv2 鄰居狀態機、Hello/Dead Timer', ratio: '50:50' },
  { day: 9, stage: '路由深潛', focus: 'OSPF 網路類型、Router ID、DR/BDR 選舉', ratio: '50:50' },
  { day: 10, stage: '路由深潛', focus: 'FHRP（HSRP）、First Hop 冗餘', ratio: '50:50' },
  { day: 11, stage: '路由深潛', focus: 'ACL 基本語法與放置位置原則', ratio: '50:50' },
  { day: 12, stage: '路由深潛', focus: 'NAT（Static / Dynamic / PAT）完整演練', ratio: '50:50' },
  { day: 13, stage: '路由深潛', focus: 'VLAN 間路由：Router-on-a-Stick 與 SVI', ratio: '50:50' },
  { day: 14, stage: '路由深潛', focus: '第二輪模擬測驗 + 錯題本建立', ratio: '50:50' },
  { day: 15, stage: '存取層與安全', focus: 'STP/RSTP 根橋選舉與 Port Cost', ratio: '45:55' },
  { day: 16, stage: '存取層與安全', focus: 'EtherChannel（LACP/PAgP）模式匹配矩陣', ratio: '45:55' },
  { day: 17, stage: '存取層與安全', focus: '無線架構：Autonomous vs Controller-based、WLC/WLAN', ratio: '45:55' },
  { day: 18, stage: '存取層與安全', focus: '無線安全（WPA2/WPA3）、CAPWAP', ratio: '45:55' },
  { day: 19, stage: '存取層與安全', focus: '實體安全、AAA、密碼強化、Telnet vs SSH', ratio: '45:55' },
  { day: 20, stage: '存取層與安全', focus: 'VPN、DHCP Snooping、Dynamic ARP Inspection', ratio: '45:55' },
  { day: 21, stage: '存取層與安全', focus: '第三輪模擬測驗（含 Lab 題型）', ratio: '45:55' },
  { day: 22, stage: '衝刺收尾', focus: 'NTP、SNMP v2c/v3、Syslog 嚴重度', ratio: '40:60' },
  { day: 23, stage: '衝刺收尾', focus: 'DHCP Relay、QoS 分類標記概念', ratio: '40:60' },
  { day: 24, stage: '衝刺收尾', focus: 'JSON/YAML/XML 格式比較', ratio: '40:60' },
  { day: 25, stage: '衝刺收尾', focus: 'REST API、HTTP 動詞、Northbound/Southbound API', ratio: '40:60' },
  { day: 26, stage: '衝刺收尾', focus: 'SDN 架構、Controller-based Networking、DNA Center', ratio: '40:60' },
  { day: 27, stage: '衝刺收尾', focus: 'Terraform/Ansible/Puppet 自動化工具定位', ratio: '40:60' },
  { day: 28, stage: '衝刺收尾', focus: '錯題總複習 + Lab 快速重跑', ratio: '40:60'  },
  { day: 29, stage: '衝刺收尾', focus: '錯題總複習 + 弱項章節重讀', ratio: '40:60' },
  { day: 30, stage: '衝刺收尾', focus: '輕量複習翻卡記憶、早睡、確認證件', ratio: '40:60' }
];
