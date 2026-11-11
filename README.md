# Assignment 6 — Bank DApp

## ไฟล์
- Bank.sol: นำไป Compile และ Deploy ใน https://app.remix.live
- index.html และ app.js: หน้าเว็บ DApp สำหรับ GitHub Pages (ต้องอัปโหลดทั้งคู่)

## 1. Deploy ใน Remix
1. สร้างไฟล์ contracts/Bank.sol แล้วคัดลอกโค้ดจาก Bank.sol ลงไป
2. ใน Solidity Compiler เลือก compiler รุ่น 0.8.x เช่น 0.8.20 แล้วกด Compile Bank.sol
3. เปิด MetaMask เลือกเครือข่ายทดสอบ Sepolia และเตรียม Sepolia ETH สำหรับทดสอบและค่า gas
4. เปิด Deploy & Run Transactions เลือก Environment เป็น Browser Extension แล้วเลือก MetaMask (บางรุ่นเรียก Injected Provider - MetaMask)
5. ตรวจว่า MetaMask อยู่บน Sepolia เลือก contract Bank ตั้ง Value = 0 แล้วกด Deploy และยืนยันใน MetaMask
6. คัดลอก Contract Address ใน Deployed Contracts ไปใส่ CONTRACT_ADDRESS ใน app.js ระหว่างเครื่องหมายอัญประกาศ หรือกรอกในหน้าเว็บ

Remix VM ใช้ทดลอง contract ใน Remix ได้ แต่เว็บนี้เชื่อม MetaMask บน Sepolia จึงต้อง Deploy ผ่านกระเป๋าบน Sepolia ด้วย

## 2. ข้อมูลนักศึกษา
เปิด index.html แล้วแทนที่ “กรอกรหัสนักศึกษาที่นี่” และ “กรอกชื่อ–สกุลที่นี่” ด้วยข้อมูลจริง

## 3. เผยแพร่บน GitHub Pages
1. สร้าง repository สำหรับงานนี้ เช่น assignment6-bank
2. อัปโหลด index.html และ app.js ไว้ที่ระดับบนสุดของ repository (เพิ่ม Bank.sol และ README.md ได้)
3. เปิด Settings > Pages > Build and deployment เลือก Deploy from a branch
4. เลือก main และ /(root) แล้ว Save
5. รอเผยแพร่และเปิด URL ที่ GitHub แสดง เช่น https://YOUR-USERNAME.github.io/assignment6-bank/
6. เปิดด้วยเบราว์เซอร์ที่มี MetaMask จากนั้นเชื่อมต่อและทดสอบ
7. นำ URL จริงที่เปิดได้ไปส่งใน dlearning ด้วยตนเอง

## 4. ทดสอบก่อนส่ง
- เชื่อมต่อ MetaMask และ Contract Address ที่ Deploy บน Sepolia
- Deposit 0.01 ETH แล้วรอรายการยืนยัน: ยอดฝากเพิ่มขึ้น 0.01 ETH
- Withdraw 0.005 ETH แล้วรอรายการยืนยัน: ยอดฝากลดลง 0.005 ETH
- CheckBlance อ่านยอดเงินฝากของบัญชีปัจจุบัน ไม่ใช่ยอดเงินทั้งหมดในกระเป๋า
- ลองถอนเกินยอดหรือใส่ 0: ต้องแสดงข้อผิดพลาด
- เปลี่ยนบัญชีใน MetaMask แล้วเชื่อมต่อใหม่: แต่ละบัญชีมียอดฝากแยกกัน

ถ้าทดสอบโดยตรงใน Remix: deposit ใช้ช่อง Value เช่น 0.01 และหน่วย Ether; withdraw รับจำนวนเป็น wei เช่น 5000000000000000 = 0.005 ETH โดยตั้ง Value กลับเป็น 0 ก่อนถอน

ชื่อ checkBlance สะกดตามโจทย์ จึงต้องใช้ชื่อเดียวกันทั้ง Solidity และ ABI โค้ดนี้ปรับให้หักยอดก่อนโอนใน withdraw; หากโอนล้มเหลวธุรกรรมจะย้อนกลับรวมถึงยอดเงินด้วย หน้าเว็บใช้ ethers จาก CDN จึงต้องมีอินเทอร์เน็ต

## สถานะการตรวจสอบ
ตรวจไวยากรณ์ JavaScript แล้ว ยังไม่ได้ Compile Solidity ใน Remix หรือทดสอบธุรกรรมจริงผ่าน MetaMask และยังไม่ได้เผยแพร่ GitHub Pages

## เอกสารอ้างอิง
- https://remix-ide.readthedocs.io/en/latest/run.html
- https://docs.ethers.org/v6/getting-started/
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## การแก้ไขการเชื่อมต่อ
กดเชื่อมต่อ MetaMask ได้ทันทีโดยไม่ต้องใส่แอดเดรสกระเป๋า จากนั้นกรอก Contract Address ของ Bank ที่ Deploy บน Sepolia แล้วกดโหลดสัญญา Bank แอดเดรสกระเป๋าใช้แทนสัญญาไม่ได้
เปิดเว็บผ่าน localhost (เช่น VS Code Live Server) หรือ HTTPS ไม่ใช่ดับเบิลคลิกไฟล์ HTML
ตรวจด้วยการจำลอง provider: เชื่อมต่อโดยไม่กรอกแอดเดรส เปลี่ยนเป็น Sepolia ปฏิเสธแอดเดรสกระเป๋า/ไม่มีโค้ด/สัญญาไม่ตรง โหลด Bank และล้างการเชื่อมต่อเมื่อเปลี่ยนบัญชี ผ่านแล้ว ยังไม่ได้ทดสอบธุรกรรมจริงใน MetaMask
