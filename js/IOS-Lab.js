/* ================= Cisco IOS Lab 實作指令（CCNA 200-301）— [區塊A] ================= */
// 涵蓋考綱：Network Access (20%) 與 IP Connectivity (25%)
const labModules = [
  ['Network Access', [
    ['Lab 1：VLAN 基本建立與 Access 埠指派',
     `vlan 10\n name SALES\nvlan 20\n name IT\ninterface f0/1\n switchport mode access\n switchport access vlan 10`,
     `show vlan brief → 檢視 VLAN 建立與介面歸屬\nshow interfaces f0/1 switchport → 驗證 Administrative/Operational Mode 皆為 static access\n排錯：若 Access Port 指向未建立的 VLAN，該埠不會出現在 show vlan brief 中；必須先建立 VLAN 再指派\n觀念：預設所有連接埠皆屬於 VLAN 1（預設管理/原生 VLAN），安全最佳實務建議停用 VLAN 1 作為存取用途`],

    ['Lab 2：802.1Q Trunking 與 Native VLAN 安全防護',
     `vlan dot1q tag native   ! 全域標記 Native VLAN 封包（防範雙重標記 VLAN Hopping 攻擊）\ninterface g0/1\n switchport trunk encapsulation dot1q   ! 舊款 2960/3560 需指定，新版 IOS-XE 預設固定 dot1q\n switchport mode trunk\n switchport trunk native vlan 99\n switchport trunk allowed vlan 10,20,99`,
     `show interfaces trunk → 驗證 Mode 為 on、Encapsulation 為 802.1q、Native VLAN 為 99\nshow interfaces g0/1 switchport → 檢查 Trunking Native Mode VLAN\n排錯：兩端 Native VLAN 不一致會引發 CDP Native VLAN Mismatch 告警，並導致跨 VLAN 流量外洩（VLAN Hopping）\n觀念：Trunk 上未帶 802.1Q Tag 的流量歸屬於 Native VLAN，兩端必須嚴格對齊，強烈建議改為閒置未使用的 VLAN ID`],

    ['Lab 3：關閉 DTP 與靜態安全連接埠模式',
     `interface range g0/1-24\n switchport mode access\n switchport nonegotiate   ! 停用 DTP 協商封包發送\n shutdown   ! 未使用的閒置連接埠預設管理性關閉`,
     `show interfaces g0/1 switchport → 驗證 Negotiation of Trunking: Off\nshow interfaces trunk → 確認無非預期的動態 Trunk 形成\n排錯：兩端皆為 dynamic auto 時無法建立 Trunk（皆被動等待），導致跨 Switch VLAN 通訊中斷\n觀念：DTP 五種模式配對表：desirable 對 desirable/auto/on 皆可成 Trunk；nonegotiate 僅適用於手動指定 access 或 mode trunk 模式`],

    ['Lab 4：Rapid-PVST+ 根橋選舉與生成樹防護',
     `spanning-tree mode rapid-pvst\nspanning-tree vlan 1,10,20 root primary       ! 自動將 Priority 設為 24576 (或低於當前 Root)\nspanning-tree vlan 1,10,20 root secondary     ! 自動將 Priority 設為 28672\ninterface range f0/3-4\n spanning-tree portfast\n spanning-tree bpduguard enable\ninterface g0/1\n spanning-tree guard root`,
     `show spanning-tree vlan 10 → 檢視 Root ID/Bridge ID、Root Port、Designated/Alternate (BLK) 狀態與 Path Cost\nshow spanning-tree summary → 驗證 PortFast 與 BPDU Guard 全域狀態\n排錯：Root Bridge 選舉順序＝最低 Bridge Priority（必須為 4096 倍數）+ 最低 MAC Address；Cost 標準值：Gigabit=4, FastEthernet=19\n觀念：PortFast 僅限用於終端設備（Edge Ports），跳過 Listening/Learning 直接進入 Forwarding；BPDU Guard 收到任何 BPDU 即刻進入 err-disabled；Root Guard 部署於 Designated Port 防範非法 Switch 搶佔根橋`],

    ['Lab 5：EtherChannel 鏈路綑綁（LACP / PAgP）',
     `interface range g0/1-2\n channel-group 1 mode active   ! active 啟用 IEEE 802.3ad LACP\ninterface port-channel 1\n switchport mode trunk\n switchport trunk allowed vlan 10,20,99`,
     `show etherchannel summary → 驗證 Po1 標記為 (SU) [Layer 2 + In-Use]、成員埠皆為 (P) [Bundled in port-channel]\nshow etherchannel load-balance → 檢視負載平衡演算法（src-mac / dst-ip 等）\n排錯：LACP 模式需 active ↔ active/passive；PAgP 需 desirable ↔ desirable/auto；on 僅能對 on；兩端速度、雙工、Native VLAN、Trunk 允許清單不一致會導致成員埠被掛起 (s) [Suspended]\n觀念：最佳實務為先在實體介面下 channel-group，再至生成的 Port-Channel 介面統一配置 Trunk 屬性`],

    ['Lab 6：鄰居探索協定（CDP 與 LLDP）',
     `cdp run\ncdp advertise-v2\nlldp run   ! 全域啟用 IEEE 802.1AB LLDP（預設關閉）\ninterface g0/2\n no cdp enable   ! 面向 Untrusted / ISP 外部介面關閉探索協定\n no lldp transmit\n no lldp receive`,
     `show cdp neighbors → 檢視 Device ID、Local Interface、Holdtime、Capability、Platform、Port ID\nshow cdp neighbors detail → 取得鄰居 IP 位址、IOS 軟體版本與原生 VLAN\nshow lldp neighbors detail → 驗證跨廠商設備連接狀態\n排錯：CDP 為 Cisco 專屬（預設啟用），異質網路環境必須手動啟用 lldp run`],

    ['Lab 7：Port Security 介面存取防護與 Sticky MAC',
     `interface f0/1\n switchport mode access\n switchport port-security\n switchport port-security maximum 1\n switchport port-security mac-address sticky\n switchport port-security violation restrict   ! 違規處理：丟棄封包 + 累加計數 + 發送 Syslog\nerrdisable recovery cause psecure-violation\nerrdisable recovery interval 300`,
     `show port-security interface f0/1 → 驗證 Port Security: Enabled、Violation Mode: Restrict、Security MAC Count\nshow port-security address → 檢視自動學習的 Sticky MAC 清單\n排錯：若為預設 shutdown 模式，觸發違規後介面會變為 err-disabled，需以 shutdown/no shutdown 復原或仰賴 errdisable recovery 自動復原\n觀念：Sticky 學習到的 MAC 位址會自動寫入 running-config，必須手動執行 copy running-config startup-config 才能於斷電重啟後保留`],

    ['Lab 8：語音 VLAN 配置與 PoE 供電監控',
     `interface f0/5\n switchport mode access\n switchport access vlan 10\n switchport voice vlan 150`,
     `show interfaces f0/5 switchport → 驗證 Access Mode VLAN: 10 與 Voice VLAN: 150\nshow power inline f0/5 → 檢視 PoE 供電狀態、瓦數（Watts）、Class 等級\n排錯：IP Phone 無法獲取語音 IP 時，先檢查 PoE 供電狀態，並確認 CDP 是否正常發送以告知 IP Phone 語音 VLAN ID`],

    ['Lab 9：Cisco WLC / WLAN 基礎架構（含 WPA2/WPA3）',
     `! WLC GUI/CLI 配置架構：\n! 1. WLANs → Create New → 設定 SSID 與 Profile Name，Status 勾選 Enabled\n! 2. Security → Layer 2：\n!    - WPA2-Personal (PSK) 或 WPA3-Personal (SAE / Simultaneous Authentication of Equals)\n!    - WPA2/WPA3-Enterprise 需啟用 802.1X 並指向外部 RADIUS 伺服器 (ISE)\n! 3. QoS Profile：Platinum (語音)、Gold (視訊)、Silver (最佳努力)、Bronze (背景流量)\n! 4. CAPWAP 穿透需求：UDP 5246 (Control) 與 UDP 5247 (Data)`,
     `show ap summary（WLC CLI）→ 檢視已註冊之 Lightweight AP 清單與狀態\nshow client summary → 檢視關聯 (Associated) 與通過認證 (Authenticated) 之終端數量與加密方式\n排錯：AP 無法加入 WLC 時，排查 DHCP Option 43、DNS (cisco-capwap-controller) 及底層 MTU/防火牆是否放行 UDP 5246\n觀念：WPA3 使用 SAE (Dragonfly 握手) 取代傳統 PSK，能抵禦離線字典暴力破解，並強制啟用 PMF (Protected Management Frames)`],

    ['Lab 10：無線 AP 運作架構（Lightweight Split-MAC vs. Autonomous）',
     `! 核心考點對比：\n! Split-MAC 架構職責劃分：\n! • AP (Real-time MAC)：負責發送 Beacon 訊框、Probe Response、802.11 實體層加密/解密、訊框交握\n! • WLC (Non-real-time MAC)：負責 802.1X 認證轉發、關聯處理 (Association)、跨 AP 漫遊切換、QoS 策略下發\n! Autonomous AP (獨立型)：單機獨立完成所有 MAC 運算與認證，缺少集中管理能力`,
     `WLC Monitor → AP Join Statistics → 檢視 CAPWAP Discovery 與 Join Request 統計\n排錯：CAPWAP Tunnel 建立失敗常見於 Discovery 封包被阻擋、AP/WLC 軟體版本不相容或 AP 證照過期`]
  ]],

  ['IP Connectivity', [
    ['Lab 11：Router-on-a-Stick (ROAS) 子介面路由',
     `interface g0/0\n no shutdown   ! 實體主介面必須保持啟用，不配置 IP\ninterface g0/0.10\n encapsulation dot1q 10\n ip address 192.168.10.1 255.255.255.0\ninterface g0/0.20\n encapsulation dot1q 20\n ip address 192.168.20.1 255.255.255.0`,
     `show ip interface brief → 驗證 g0/0 及所有子介面皆為 up/up\nshow ip route connected → 檢查子介面網段是否正確進入路由表\n排錯：若實體主介面 shutdown，所有關聯子介面將全部 down；encapsulation dot1q <vlan> 必須在設定 ip address 之前完成配置\n觀念：ROAS 子介面的 802.1Q VLAN Tag 必須與對端 Switch Trunk 允許的 VLAN 一致`],

    ['Lab 12：SVI 三層交換機跨 VLAN 路由',
     `ip routing   ! 啟用三層轉發引擎（核心關鍵）\ninterface vlan 10\n ip address 192.168.10.1 255.255.255.0\n no shutdown\ninterface vlan 20\n ip address 192.168.20.1 255.255.255.0\n no shutdown`,
     `show ip route → 驗證路由表中出現 C (Connected) 與 L (Local) 條目\nshow ip interface brief | include Vlan → 驗證 SVI 狀態為 up/up\n排錯：若 L3 Switch 遺漏 ip routing，SVI 僅具備管理 IP 功能，無法在 VLAN 間轉發封包；若 VLAN 內無任何處於 up 狀態的連接埠，SVI 將處於 down/down`],

    ['Lab 13：靜態路由、浮動備援路由與預設路由（AD 修正版）',
     `ip route 192.168.20.0 255.255.255.0 10.0.0.2         ! 主要路徑：靜態路由（預設 AD = 1）\nip route 192.168.20.0 255.255.255.0 172.16.0.2 120    ! 浮動備援路徑：AD = 120（劣於 OSPF 110 與主要靜態路由 1）\nip route 0.0.0.0 0.0.0.0 203.0.113.1                 ! 預設路由（Gateway of Last Resort）`,
     `show ip route static → 檢視目前裝表的靜態路由\nshow ip route 192.168.20.0 → 檢視路由管理距離（AD 1 優先於 AD 120）\n排錯：若主要路徑失效，AD 120 的浮動路由將自動浮出並寫入 RIB；下一跳 IP 若遞迴不可達，靜態路由將不會安裝至路由表\n觀念：官方標準 AD 值：Connected=0、Static=1、eBGP=20、EIGRP(內部)=90、OSPF=110、IS-IS=115、RIP=120、iBGP=200；浮動靜態路由 AD 必須嚴格大於主路由協定之 AD`],

    ['Lab 14：Single-Area OSPFv2 配置、Passive 介面與 DR 選舉',
     `router ospf 1\n router-id 1.1.1.1\n network 10.0.0.0 0.0.0.255 area 0\n passive-interface default   ! 預設所有介面設為被動（最佳安全實務）\n no passive-interface g0/1    ! 僅在連接 OSPF 鄰居的介面上啟用 Hello\n auto-cost reference-bandwidth 1000   ! 調整參考頻寬為 1000 Mbps（使 Gigabit 與 100M Cost 產生區隔）\ninterface g0/1\n ip ospf priority 100   ! 調整 DR 選舉優先權（1-255，值大勝出；0 代表永不參選）`,
     `show ip ospf neighbor → 驗證鄰居狀態為 FULL/DR 或 FULL/BDR\nshow ip ospf interface g0/1 → 檢查 Priority、Timer (Hello 10s / Dead 40s)、Cost 計算值\nshow ip protocols → 檢查 Router-ID、Passive Interface 清單與 Routing for Networks\n排錯：OSPF 鄰居建立 7 大必要匹配條件：1. Area ID、2. Subnet Mask、3. Hello/Dead Timers、4. Authentication 密碼、5. Stub 區域標記、6. 介面 MTU（卡在 ExStart/Exchange）、7. 重複的 Router-ID；DR 選舉具備非搶佔性（Non-preemptive）`],

    ['Lab 15：Multi-Area OSPFv2 與 ABR 路由彙總',
     `router ospf 1\n router-id 2.2.2.2\n network 10.0.0.0 0.0.0.255 area 0\n network 192.168.0.0 0.0.0.255 area 1\n network 192.168.1.0 0.0.0.255 area 1\n network 192.168.2.0 0.0.0.255 area 1\n network 192.168.3.0 0.0.0.255 area 1\n area 1 range 192.168.0.0 255.255.252.0   ! ABR 路由彙總：將 Area 1 內的 4 個 /24 網段彙總為單一 /22 廣播至 Area 0`,
     `show ip ospf → 驗證輸出包含 It is an area border router (ABR)\nshow ip route ospf → 在 Area 0 路由器上驗證接收到 O IA (Inter-Area) 彙總路由 192.168.0.0/22\n排錯：ABR 彙總使用 area <area-id> range 指令；ASBR 外部重分配彙總使用 summary-address；非骨幹區域必須直接與 Area 0 骨幹相連`],

    ['Lab 16：OSPFv3 (IPv6) 單區域配置',
     `ipv6 unicast-routing\nipv6 router ospf 10\n router-id 2.2.2.2   ! OSPFv3 必須手動指定 32-bit 點分十進位 Router-ID\ninterface g0/0\n ipv6 ospf 10 area 0   ! OSPFv3 改由介面模式宣告啟用，不再使用全域 network 指令`,
     `show ipv6 ospf neighbor → 驗證鄰居狀態為 FULL，鄰居以 Link-Local (FE80::) 識別\nshow ipv6 route ospf → 檢查 OI / O (IPv6 OSPF) 路由條目\n排錯：未啟用 ipv6 unicast-routing 或未配置手動 router-id 時，OSPFv3 處理程序將無法正常啟動；OSPFv3 原生採用 Link-Local 位址建立鄰居與計算下一跳`],

    ['Lab 17：第一跳冗餘協定（FHRP / HSRPv2 搶佔與追蹤）',
     `interface g0/0\n standby version 2   ! 啟用 HSRPv2（支援 IPv6、毫秒級 Timer、虛擬 MAC 0000.0C9F.Fxxx）\n standby 1 ip 192.168.1.254\n standby 1 priority 110\n standby 1 preempt\n standby 1 track 1 decrement 20   ! 追蹤上聯介面/路由，故障時自動調降 Priority 以觸發主備切換`,
     `show standby brief → 檢視 Group 1 之 State (Active / Standby)、Virtual IP、Active/Standby 路由器實體 IP\nshow standby → 驗證 Preempt 是否啟用、Hello 3s / Hold 10s (v2 預設值)、追蹤狀態\n排錯：若未啟用 standby preempt，當原 Active 路由器修復重啟後，無法主動搶回轉發角色；FHRP 考點對照：HSRP (Cisco 專有)、VRRP (RFC 標準，Master/Backup)、GLBP (支援 Active/Active 負載平衡)`],

    ['Lab 18：IPv6 位址配置（SLAAC / EUI-64 / Link-Local / 點對點 /31）',
     `ipv6 unicast-routing\ninterface g0/0\n ipv6 address 2001:db8:acad:1::1/64   ! 手動指定 Global Unicast Address\n ipv6 address fe80::1 link-local       ! 手動自訂易於維護的 Link-Local 位址\ninterface g0/1\n ipv6 address 2001:db8:acad:2::/64 eui-64   ! EUI-64 自動依據 MAC 位址生成 Interface ID\ninterface g0/2\n ip address 10.0.0.0 255.255.255.254   ! RFC 3021 /31 點對點路由器互連（僅 2 個 IP，無網路/廣播位址）`,
     `show ipv6 interface brief → 驗證各介面已同時具備 Global Unicast 與 Link-Local 位址\nshow ip interface brief g0/2 → 驗證 /31 介面正常運作\n排錯：若主機端無法透過 SLAAC 取得位址，檢查路由器介面是否誤設 ipv6 nd suppress-ra；EUI-64 規則：於 MAC 中間插入 FFFE 並將第 7 個 bit (U/L bit) 反轉（0 變 1）`],

    ['Lab 19：IPv6 靜態路由與預設路由',
     `ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:12::2                   ! 靜態路由：下一跳指定 Global Unicast IP\nipv6 route 2001:db8:acad:3::/64 GigabitEthernet0/0 fe80::2             ! 靜態路由：下一跳指定 Link-Local 時，必須同時指定本地出介面\nipv6 route ::/0 2001:db8:acad:12::2                                   ! IPv6 預設路由（::/0 等同 IPv4 0.0.0.0/0）`,
     `show ipv6 route static → 驗證 S 靜態路由與 ::/0 預設路由已裝入 IPv6 RIB\nping 2001:db8:acad:2::2 → 驗證跨網段連通性\n排錯：在 Cisco IOS 中，若下一跳使用 Link-Local 位址 (FE80::)，由於 Link-Local 位址具備鏈路區域性（非全域唯一），指令後方「必須」明確指定本地出介面（如 GigabitEthernet0/0 fe80::2），否則 CLI 會拒絕執行或報錯`]
  ]],
['IP Services', [
    ['Lab 20：DNS 用戶端配置與特權模式延伸 Ping / Traceroute',
     `ip domain lookup\nip name-server 8.8.8.8\nip name-server 1.1.1.1\nping 8.8.8.8 source loopback0   ! 延伸 Ping：指定來源介面驗證回程路由\ntraceroute 8.8.8.8 numeric      ! 數字化輸出，略過 DNS 反查加速排錯`,
     `show hosts → 檢視已解析的主機名稱暫存與 DNS 伺服器清單\n特權模式延伸 Ping 互動選項：Repeat count (封包數)、Datagram size (大小)、Timeout、DF-bit (測試路徑 MTU)\n排錯：Traceroute 依賴 ICMP Time Exceeded (Type 11) 訊息；若中間防火牆阻擋 ICMP 或 UDP 高埠，輸出將出現星號 (*)`],

    ['Lab 21：DHCPv4 伺服器建置與作用域排除',
     `ip dhcp excluded-address 192.168.20.1 192.168.20.10   ! 排除網關與伺服器靜態保留 IP\nip dhcp pool LAN20\n network 192.168.20.0 255.255.255.0\n default-router 192.168.20.1\n dns-server 8.8.8.8 1.1.1.1\n domain-name lab.local\n lease 1 0 0   ! 設定租期為 1 天 0 時 0 分`,
     `show ip dhcp binding → 檢視已分配 IP 與客戶端 MAC 位址對應表\nshow ip dhcp pool LAN20 → 檢視位址池使用率與租約狀態\nshow ip dhcp conflict → 檢視位址衝突清單（透過 Ping/Gratuitous ARP 偵測）\n排錯：DHCP DORA 流程全為廣播（UDP 67/68）；Client 續約時先於 T1 (50% 租期) 發送單播 Request，若無回應則於 T2 (87.5%) 發送全網廣播 Request`],

    ['Lab 22：DHCP 中繼代理（Relay Agent / ip helper-address）',
     `interface g0/0\n ip address 192.168.10.1 255.255.255.0\n ip helper-address 10.0.0.100   ! 指向遠端集中式 DHCP 伺服器 IP`,
     `debug ip dhcp server events → 監控 DHCP 封包轉發與選池日誌\n排錯：1. helper-address 必須配置於靠近客戶端的「接收廣播之入口介面」\n 2. 路由器會將廣播 Discover 轉為單播並填入 giaddr (Gateway IP = 192.168.10.1)，遠端伺服器依 giaddr 網段匹配位址池\n 3. ip helper-address 預設同時轉發 8 種 UDP 廣播（DHCP 67/68, TFTP 69, DNS 53, Time 37, TACACS 49 等）`],

    ['Lab 23：NAT/PAT 網路位址轉換（靜態 NAT / 動態 Pool / PAT Overload）',
     `! 1. 靜態 NAT (Static NAT)：一對一伺服器對外發布\nip nat inside source static 192.168.1.100 203.0.113.100\n! 2. PAT (NAT Overload)：企業多對一上網（主流必考）\naccess-list 1 permit 192.168.1.0 0.0.0.255\nip nat inside source list 1 interface g0/2 overload\n! 3. 介面方向定義（核心關鍵）\ninterface g0/0\n ip nat inside\ninterface g0/2\n ip nat outside`,
     `show ip nat translations → 檢視轉換表（Inside Local / Inside Global / Outside Local / Outside Global）\nshow ip nat statistics → 檢視轉換命中計數 (Hits)、未命中 (Misses) 與 Pool 分配率\nclear ip nat translation * → 清除動態 NAT 轉換快取條目\n排錯：Inside/Outside 介面方向掛反時 NAT 完全不觸發；PAT 漏加 overload 會退化為動態一對一 NAT，導致 IP 耗盡後其餘主機無法連網`],

    ['Lab 24：SSHv2 安全遠端管理與 RSA 2048 金鑰生成',
     `hostname R1\nip domain-name lab.local\ncrypto key generate rsa general-keys modulus 2048   ! 生成 2048 bits 加密金鑰\nusername admin secret Cisco123!\nip ssh version 2\nip ssh time-out 60\nip ssh authentication-retries 3\nline vty 0 4\n login local\n transport input ssh   ! 強制僅允許 SSH，封鎖明文 Telnet`,
     `show ip ssh → 驗證 SSH Enabled - version 2.0、Authentication timeout 與 Authentication retries\nshow ssh → 檢視當前已連線之 SSH Session 與加密演算法\nshow users → 檢視連線來源 IP 與線路通道 (VTY)\n排錯：若未先設定 hostname 或 ip domain-name，執行 crypto key generate rsa 將被系統拒絕；金鑰長度 < 768 bits 無法啟用 SSHv2`],

    ['Lab 25：QoS 模組化服務品質（MQC 分類、標記與信任邊界）',
     `class-map match-any VOICE-TRAFFIC\n match protocol rtp\n match access-group name ACL-VOICE\npolicy-map QOS-MARKING\n class VOICE-TRAFFIC\n  set dscp ef   ! 將語音封包標記為 Expedited Forwarding (DSCP 46)\n class class-default\n  set dscp default\ninterface g0/0\n service-policy input QOS-MARKING`,
     `show policy-map interface g0/0 → 檢視各 Class 匹配封包數 (Packets Matched) 與 DSCP 標記統計\nshow class-map → 檢查分類規則定義\n觀念：QoS 信任邊界 (Trust Boundary) 應設於接入層（IP Phone / Access Switch）；語音標記為 EF (DSCP 46 / CoS 5)；視訊標記為 AF41 (DSCP 34)；CoS 位於 802.1Q Tag (3 bits, 0-7)，DSCP 位於 IP Header ToS (6 bits, 0-63)`],

    ['Lab 26：SNMP 網路監控管理（SNMPv2c 與 SNMPv3 USM 安全模型）',
     `! SNMPv2c 配置：\nsnmp-server community PublicRO ro\nsnmp-server location DataCenter-Rack1\nsnmp-server contact netadmin@lab.local\n! SNMPv3 配置 (authPriv 最高安全等級)：\nsnmp-server view V3VIEW iso included\nsnmp-server group SECGROUP v3 priv read V3VIEW   ! 群組必須宣告 priv 等級\nsnmp-server user snmpuser SECGROUP v3 auth sha AuthPass123 priv aes 128 PrivPass123\nsnmp-server host 10.0.0.50 version 3 priv snmpuser\nsnmp-server enable traps`,
     `show snmp group → 驗證群組安全等級 (authPriv) 與 View 名稱\nshow snmp user → 檢查 SNMPv3 使用者認證 (SHA) 與加密 (AES) 演算法\nshow snmp contact / location → 驗證基礎資訊\n排錯：SNMPv3 安全等級三階段：1. noAuthNoPriv (無認證無加密)、2. authNoPriv (需 SHA/MD5 認證)、3. authPriv (需認證 + AES 加密)；Group 宣告等級必須與 User 一致`],

    ['Lab 27：Syslog 日誌伺服器導流與嚴重度等級控制',
     `logging host 10.0.0.200   ! 指定外部 Syslog 伺服器 IP\nlogging trap warning      ! 僅發送 Severity <= 4 (0 Emergency ~ 4 Warning) 之日誌至伺服器\nlogging source-interface loopback0\nservice timestamps log datetime msec\nservice timestamps debug datetime msec`,
     `show logging → 檢視 Logging 目的地狀態、Trap 門檻等級、緩衝區日誌與發送計數\n觀念：Syslog 8 大嚴重度等級（口訣：Every Alien Can Eat Worms, Not Injured Dogs）：\n 0 Emergency (系統不可用) ➡️ 1 Alert ➡️ 2 Critical ➡️ 3 Error ➡️ 4 Warning ➡️ 5 Notification (介面 Up/Down) ➡️ 6 Informational ➡️ 7 Debugging\n排錯：logging trap 設定等級時，包含該等級與所有數值更小（更緊急）的日誌`],

    ['Lab 28：NTP 網路時間協定同步與 MD5 認證',
     `ntp server 10.0.0.100\nntp master 3   ! 當本機為時鐘源時手動指定 Stratum 級別\nntp authenticate\nntp authentication-key 1 md5 NtpSecretKey123\nntp trusted-key 1`,
     `show ntp status → 驗證輸出 Clock is synchronized, stratum X (正常為 1~15)\nshow ntp associations → 檢視關聯狀態（* 代表目前同步的時間源，+ 代表合格候選源）\n排錯：若顯示 Stratum 16 代表「未同步 (Unsynchronized)」或來源不可達；時間誤差會導致數位憑證失效、Syslog 事件關聯錯亂與 802.1X 認證失敗`]
  ]],

  ['Security Fundamentals', [
    ['Lab 29：標準 ACL 與延伸 ACL 佈放原則',
     `! 標準 ACL：僅比對來源 IP，放近「目的地」\naccess-list 10 permit 192.168.1.0 0.0.0.255\n! 延伸 ACL：比對五元組（協定/來源/目的/埠號），放近「來源端」\naccess-list 100 deny tcp 192.168.1.0 0.0.0.255 host 172.16.0.100 eq 23\naccess-list 100 permit ip any any\ninterface g0/1\n ip access-group 100 in`,
     `show access-lists → 檢視 ACL 條目、規則序號與封包比對計數 (matches)\nshow ip interface g0/1 → 驗證 Inbound/Outbound access list 套用狀態\n排錯：ACL 由上而下循序比對、命中即停 (First Match)、末端存在隱含拒絕 (Implicit Deny Any)；每介面每方向每協定僅能掛載一組 ACL`],

    ['Lab 30：具名 ACL（Named ACL）與序號靈活編輯',
     `ip access-list extended SECURE_EDGE\n 10 remark == Block Inbound Telnet ==\n 20 deny tcp 192.168.1.0 0.0.0.255 host 172.16.0.100 eq 23\n 30 permit ip any any\n! 插入新規則與刪除單行：\nip access-list extended SECURE_EDGE\n 25 permit tcp any host 172.16.0.100 eq 80   ! 插入 20 與 30 之間\n no 20   ! 單獨刪除序號 20 條目`,
     `show ip access-lists SECURE_EDGE → 驗證序號重新排列與單條規則命中狀態\n排錯：傳統編號 ACL 執行 no access-list 100 會整張表刪除；具名 ACL 支援以序號 (Sequence Number) 進行單行刪除與動態插入`],

    ['Lab 31：VTY 虛擬終端線路管理 ACL（access-class）',
     `ip access-list standard VTY_ADMIN\n permit host 10.0.0.10\n permit host 10.0.0.20\nline vty 0 4\n access-class VTY_ADMIN in   ! 限制僅指定管理主機能連入 VTY\n transport input ssh`,
     `show access-lists VTY_ADMIN → 檢視管理連線命中次數\n排錯：過濾資料平面流量使用 ip access-group；過濾管理平面 (VTY/Console) 登入流量使用 access-class`],

    ['Lab 32：AAA 集中式身分驗證架構與 802.1X 連接埠存取控制',
     `aaa new-model\nradius server ISE-NODE\n address ipv4 10.0.0.100 auth-port 1812 acct-port 1813\n key CiscoRadiusKey123\naaa group server radius ISE-GROUP\n server name ISE-NODE\naaa authentication login default group ISE-GROUP local\naaa authorization exec default group ISE-GROUP local\n! 802.1X 連接埠安全控制配置：\ndot1x system-auth-control\ninterface f0/5\n switchport mode access\n authentication port-control auto\n dot1x pae authenticator`,
     `test aaa group ISE-GROUP admin Cisco123 legacy → 測試 RADIUS 伺服器連通性\nshow dot1x all → 檢視 802.1X 全域啟用狀態與 PAE 角色\nshow authentication sessions interface f0/5 → 檢視認證狀態 (Authc/Authz Status)\n觀念：1. 802.1X 三大角色：Supplicant (客戶端)、Authenticator (交換機)、Authentication Server (RADIUS/ISE)\n 2. TACACS+：TCP 49，全封包加密，AAA 三者分離，適合設備管理授權\n 3. RADIUS：UDP 1812/1813，僅密碼欄位加密，認證與授權合併，適合 802.1X 網路存取`],

    ['Lab 33：設備安全加固、密碼複雜度與防爆破登入',
     `enable secret StrongAdminPass!\nservice password-encryption\nsecurity passwords min-length 10\nlogin block-for 120 attempts 3 within 60   ! 60秒內失敗3次即鎖定120秒防暴力破解\nbanner motd # Authorized Personnel Only. All activities are monitored. #\nline con 0\n exec-timeout 5 0   ! 5分鐘無操作自動登出\n login local\nline vty 0 4\n exec-timeout 5 0\n login local`,
     `show login → 檢視防暴力破解登入鎖定狀態 (Quiet Mode / Watch Window)\nshow running-config | section line → 驗證 timeout 與認證配置\n觀念：enable secret 採用 SHA-256 (Type 8) 或 Scrypt (Type 9) 單向雜湊，優於 service password-encryption 之 Type 7 弱混淆編碼`],

    ['Lab 34：Layer 2 安全防禦四件套（DHCP Snooping / DAI / IPSG / BPDU Guard）',
     `! 1. DHCP Snooping\nip dhcp snooping\nip dhcp snooping vlan 10,20\nno ip dhcp snooping information option   ! 若交換機非 Option 82 Relay 建議關閉防丟包\ninterface g0/24\n ip dhcp snooping trust   ! 上聯/伺服器埠設為信任\n! 2. Dynamic ARP Inspection (DAI)\nip arp inspection vlan 10,20\ninterface g0/24\n ip arp inspection trust   ! 上聯埠設為信任\nip arp inspection validate src-mac dst-mac ip\n! 3. BPDU Guard & PortFast\ninterface range f0/1-20\n spanning-tree portfast\n spanning-tree bpduguard enable`,
     `show ip dhcp snooping binding → 檢視動態學習的 IP-MAC-VLAN-Port 綁定資料庫\nshow ip arp inspection statistics → 檢視 DAI 攔截非法 ARP 封包計數\nshow ip arp inspection interfaces → 驗證 Trust 埠與 Rate-limit 狀態\n排錯：DAI 強烈依賴 DHCP Snooping 綁定表；若上聯口未設 trust，合法 ARP 與 DHCP Offer 皆會被 Untrusted 埠直接丟棄導致全網癱瘓`],

    ['Lab 35：Site-to-Site IPsec VPN 架構與密碼學基礎',
     `! IPsec Phase 1 (IKE SA / ISAKMP)：UDP 500 / 4500 (NAT-T)，協商安全通道\ncrypto isakmp policy 10\n encr aes 256\n hash sha256\n authentication pre-share\n group 14   ! Diffie-Hellman Group 14 (2048-bit)\ncrypto isakmp key CiscoVpnSecret address 203.0.113.2\n! IPsec Phase 2 (IPsec SA / Data Plane)：ESP (IP Protocol 50)\ncrypto ipsec transform-set TS-AES-SHA esp-aes 256 esp-sha256-hmac\n mode tunnel`,
     `show crypto isakmp sa → 驗證 Phase 1 狀態是否為 QM_IDLE (已建立)\nshow crypto ipsec sa → 驗證 Phase 2 #pkts encaps / #pkts decaps 加解密計數\n觀念：CIA 資訊安全三要素：機密性 (AES)、完整性 (SHA/HMAC)、來源認證 (PSK/憑證)、金鑰交換 (DH)；ESP (Protocol 50) 提供加密與認證，AH (Protocol 51) 僅提供認證不加密；SSL/TLS VPN 適合遠端用戶端存取 (AnyConnect)`]
  ]],

  ['Automation & Programmability', [
    ['Lab 36：SDN 控制器架構與 Cisco Catalyst Center（DNA Center）',
     `! 觀念題實作解析：\n! 1. 控制平面與轉發平面分離：\n!    - Centralized Control/Management Plane (Catalyst Center 控制器集中運算路徑與策略)\n!    - Distributed Data Plane (各 Edge Switch 依硬體 ASIC 進行線速轉發)\n! 2. 介面架構：\n!    - 北向 API (Northbound API)：REST API (HTTPS/JSON) 提供上層業務系統/腳本調用\n!    - 南向 API (Southbound API)：NETCONF (SSH 830/YANG)、RESTCONF (HTTPS/YANG)、SNMP、CLI\n! 3. Fabric 架構：Underlay (實體底層 L3 路由) + Overlay (VXLAN 邏輯隧道) + LISP (控制平面對應)`,
     `Catalyst Center GUI → Design / Policy / Provision / Assurance 模組驗證\n觀念：Cisco ACI 用於資料中心 (Spine-Leaf + APIC)；Catalyst Center 用於企業園區網；SD-WAN 用於廣域網路 (vManage/vSmart/vBond/vEdge)`],

    ['Lab 37：REST API CRUD 操作、HTTP 狀態碼與資料格式（JSON/YAML）',
     `! 1. REST API 調用流程範例 (Cisco Catalyst Center)：\n!    - 取得 Token：POST https://dnac.lab.local/api/system/v1/auth/token (Basic Auth)\n!    - 取得設備清單：GET https://dnac.lab.local/api/v1/network-device (Header: X-Auth-Token: <token>)\n! 2. HTTP Methods 與 CRUD 映射：\n!    - Create ➡️ POST (201 Created)\n!    - Read   ➡️ GET (200 OK)\n!    - Update ➡️ PUT (完整覆蓋) / PATCH (部分更新) (200 OK)\n!    - Delete ➡️ DELETE (204 No Content)`,
     `HTTP 狀態碼考點分類：\n• 2xx 成功：200 OK, 201 Created, 204 No Content\n• 4xx 客戶端錯誤：400 Bad Request, 401 Unauthorized (未驗證身分), 403 Forbidden (已驗證但無權限), 404 Not Found\n• 5xx 伺服器錯誤：500 Internal Server Error, 503 Service Unavailable\n資料格式規範：JSON 鍵名與字串強制雙引號 ""、無尾隨逗號；YAML 依賴縮排表示階層`],

    ['Lab 38：網路自動化組態管理（Ansible Playbook / Terraform / Python Netmiko）',
     `# 1. Ansible Playbook 範例 (playbook.yml) - Agentless / Push 模式 / YAML\n---\n- name: Deploy Enterprise VLANs\n  hosts: access_switches\n  gather_facts: false\n  connection: network_cli\n  tasks:\n    - name: Ensure VLAN 10 exists\n      cisco.ios.ios_vlans:\n        config:\n          - vlan_id: 10\n            name: SALES\n            state: active\n        state: merged\n# 2. Python Netmiko 腳本範例 (CLI 自動化)\n# from netmiko import ConnectHandler\n# device = {'device_type': 'cisco_ios', 'host': '10.1.1.1', 'username': 'admin', 'password': '...'}\n# with ConnectHandler(**device) as net_connect:\n#     output = net_connect.send_command('show ip int brief')`,
     `ansible-playbook playbook.yml -i inventory.ini → 驗證 changed=1 與 ok=1\n觀念考點對照：\n• Ansible：Agentless (免代理)、走 SSH、Push (推式)、YAML Playbook、冪等性 (Idempotency)\n• Puppet / Chef：Agent-based (需安裝代理節點)、Pull (拉式)\n• Terraform：IaC (基礎架構即代碼)、宣告式 (Declarative)、HashiCorp HCL\n• Python 資料結構：dict (鍵值字典對應 JSON 物件)、list (列表對應 JSON 陣列)`]
  ]]
];

const ll = document.getElementById('lab-list');
let labTotal = 0;
let activeLabModule = 'all';

// 計算全部 Lab 總數
const allLabCount = labModules.reduce((sum, [, items]) => sum + items.length, 0);

// 建立現代化搜尋與篩選工具列 DOM
const labTools = document.createElement('div');
labTools.id = 'lab-tools';
labTools.className = 'lab-tools';

labTools.innerHTML = `
  <div class="lab-search-wrapper">
    <span class="lab-search-icon">🔍</span>
    <input id="lab-search" type="text" placeholder="搜尋實作 CLI 指令或驗證排錯關鍵字（例如：ospf, vlan, helper, rsa）..." autocomplete="off">
    <button class="lab-search-clear" id="lab-search-clear" title="清除搜尋">✕</button>
  </div>
  <div class="lab-filter-group" id="lab-filters">
    <button class="active" data-m="all">全部 <span class="pill-badge">${allLabCount}</span></button>
    ${labModules.map(([moduleName, items], i) => `
      <button data-m="${i}">${moduleName} <span class="pill-badge">${items.length}</span></button>
    `).join('')}
  </div>
`;

ll.parentNode.insertBefore(labTools, ll);

const labSearchInput = document.getElementById('lab-search');
const labClearBtn = document.getElementById('lab-search-clear');

function renderLabs() {
  ll.innerHTML = '';
  labTotal = 0;
  const kw = (labSearchInput.value || '').trim().toLowerCase();

  labClearBtn.style.display = kw ? 'block' : 'none';

  labModules.forEach(([modName, items], i) => {
    if (activeLabModule !== 'all' && activeLabModule != i) return;

    // 深層全文比對：標題、配置指令 (Config)、驗證指令 (Verify)
    const visible = items.filter(([title, cfg, verify]) => {
      if (!kw) return true;
      return title.toLowerCase().includes(kw) ||
             cfg.toLowerCase().includes(kw) ||
             verify.toLowerCase().includes(kw);
    });

    if (!visible.length) return;

    const h = document.createElement('h3');
    h.className = 'lab-module-title';
    h.innerHTML = `<span>${modName}</span><span class="cnt">${visible.length} Labs</span>`;

    const wrap = document.createElement('div');
    visible.forEach(([title, cfg, v]) => {
      labTotal++;
      const d = document.createElement('details');

      // 搜尋中、單一模組篩選時自動展開
      if (kw || activeLabModule !== 'all') {
        d.open = true;
      }

      d.innerHTML = `
        <summary>${title}</summary>
        <div class="body lab-body">
          <!-- 上方：Cisco IOS-XE 配置指令終端 -->
          <div class="lab-section">
            <div class="lab-sec-header cfg-header">
              <span class="lab-badge">
                <span class="lab-terminal-dot cfg-dot"></span>
                ⚙️ Cisco IOS 配置指令畫面 (Configuration)
              </span>
              <span style="opacity:0.6;font-size:0.7rem;font-family:monospace">CONFIG-MODE</span>
            </div>
            <pre class="lab-pre lab-pre-cfg">${cfg.replace(/</g, '&lt;')}</pre>
          </div>

          <!-- 下方：驗證指令與排錯要點終端 -->
          <div class="lab-section">
            <div class="lab-sec-header verify-header">
              <span class="lab-badge">
                <span class="lab-terminal-dot verify-dot"></span>
                🔍 驗證指令與排錯要點 (Verification & Troubleshooting)
              </span>
              <span style="opacity:0.6;font-size:0.7rem;font-family:monospace">EXEC-SHOW-MODE</span>
            </div>
            <pre class="lab-pre lab-pre-verify">${v.replace(/</g, '&lt;')}</pre>
          </div>
        </div>
      `;
      wrap.appendChild(d);
    });

    ll.appendChild(h);
    ll.appendChild(wrap);
  });

  // 無匹配結果提示
  if (labTotal === 0) {
    ll.innerHTML = `
      <div style="text-align:center;padding:36px 16px;color:var(--text-muted)">
        <p style="font-size:1.1rem;margin-bottom:8px">🔍 找不到與「<b style="color:var(--accent-cyan)">${kw}</b>」相關的 Lab 或指令</p>
        <p style="font-size:0.85rem;color:var(--text-dim)">建議嘗試搜尋簡短 CLI 指令（例如：ospf, trunk, nat, acl, standby）</p>
      </div>
    `;
  }
}

// 綁定事件監聽
document.getElementById('lab-filters').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    document.getElementById('lab-filters').querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeLabModule = b.dataset.m;
    renderLabs();
  };
});

labSearchInput.oninput = renderLabs;

labClearBtn.onclick = () => {
  labSearchInput.value = '';
  labSearchInput.focus();
  renderLabs();
};

// 初始渲染
renderLabs();