import { ethers } from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js';

// ใส่ Address หลัง Deploy เพื่อไม่ต้องกรอกใหม่ทุกครั้ง
const CONTRACT_ADDRESS = '0x0172cd41102e158b470131f469e9f28930220da1';
const CHAIN_ID = 11155111n; // Sepolia
const ABI = [
  'function deposit() payable',
  'function withdraw(uint256 amount)',
  'function checkBlance() view returns (uint256)',
  'event Deposit(address indexed owner, uint256 amount)',
  'event Withdraw(address indexed owner, uint256 amount)'
];
const el = id => document.getElementById(id);
let bank, provider, wallet, signer, busy = false;
el('address').value = CONTRACT_ADDRESS;
function controls() {
  el('connect').disabled = busy;
  el('address').disabled = busy;
  el('load').disabled = busy || !signer;
  for (const id of ['deposit', 'withdraw', 'check']) el(id).disabled = busy || !bank;
}
function reset() {
  bank = null;
  el('balance').textContent = '—';
  el('tx').textContent = '';
  controls();
}
async function run(task) {
  if (busy) return;
  busy = true; controls();
  try { await task(); }
  catch (error) {
    const code = error.code ?? error.info?.error?.code;
    const message = code === 4001 || code === 'ACTION_REJECTED'
      ? 'ยกเลิกคำขอใน MetaMask แล้ว สามารถกดทำรายการใหม่ได้'
      : code === -32002 ? 'มีคำขอค้างอยู่ กรุณาเปิด MetaMask เพื่อยืนยันหรือยกเลิกคำขอเดิม'
      : (error.reason || error.shortMessage || error.message);
    el('status').textContent = 'ไม่สำเร็จ: ' + message;
  }
  finally { busy = false; controls(); }
}
async function balance() {
  el('balance').textContent = ethers.formatEther(await bank.checkBlance());
}

function walletChanged() {
  signer = null;
  provider = null;
  reset();
  el('account').textContent = 'บัญชีหรือเครือข่ายเปลี่ยน กรุณาเชื่อมต่อ MetaMask อีกครั้ง';
  el('status').textContent = 'กรุณาเชื่อมต่อใหม่ก่อนทำรายการ';
}
el('connect').onclick = () => run(async () => {
  signer = null;
  reset();
  el('account').textContent = 'ยังไม่ได้เชื่อมต่อ';
  const injected = window.ethereum;
  const selected = injected?.providers?.find(p => p.isMetaMask) || injected;
  if (!selected) throw new Error('ไม่พบ MetaMask: เปิดเว็บผ่าน localhost หรือ HTTPS ในเบราว์เซอร์ที่ติดตั้ง MetaMask');
  if (wallet) {
    wallet.removeListener?.('accountsChanged', walletChanged);
    wallet.removeListener?.('chainChanged', walletChanged);
    wallet.removeListener?.('disconnect', walletChanged);
  }
  wallet = selected;
  el('status').textContent = 'กรุณาอนุญาตเชื่อมต่อใน MetaMask';
  await wallet.request({ method: 'eth_requestAccounts' });
  if (BigInt(await wallet.request({ method: 'eth_chainId' })) !== CHAIN_ID) {
    try {
      await wallet.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }] });
    } catch (error) {
      if ((error.code ?? error.info?.error?.code) === 4902) {
        throw new Error('เปิดแสดงเครือข่ายทดสอบใน MetaMask และเลือก Sepolia แล้วเชื่อมต่ออีกครั้ง');
      }
      throw error;
    }
  }
  provider = new ethers.BrowserProvider(wallet);
  if ((await provider.getNetwork()).chainId !== CHAIN_ID) throw new Error('กรุณาเลือกเครือข่าย Sepolia');
  const connectedSigner = await provider.getSigner();
  const account = await connectedSigner.getAddress();
  signer = connectedSigner;
  el('account').textContent = 'กระเป๋าที่เชื่อมต่อ: ' + account + ' | Sepolia';
  el('status').textContent = 'เชื่อมต่อกระเป๋าสำเร็จ — กรอก Contract Address ของ Bank จาก Remix แล้วกดโหลดสัญญา';
  wallet.on?.('accountsChanged', walletChanged);
  wallet.on?.('chainChanged', walletChanged);
  wallet.on?.('disconnect', walletChanged);
});
el('load').onclick = () => run(async () => {
  reset();
  if (!signer) throw new Error('กรุณาเชื่อมต่อ MetaMask ก่อน');
  const address = el('address').value.trim();
  if (!ethers.isAddress(address)) throw new Error('กรอก Contract Address ของ Bank จาก Deployed Contracts ใน Remix (เริ่มด้วย 0x และมี 42 ตัวอักษร)');
  const currentSigner = signer;
  const currentProvider = provider;
  if (address.toLowerCase() === (await currentSigner.getAddress()).toLowerCase()) {
    throw new Error('นี่คือแอดเดรสกระเป๋าของคุณ กรุณาใช้ Contract Address ของ Bank จาก Deployed Contracts ใน Remix');
  }
  if (await currentProvider.getCode(address) === '0x') {
    throw new Error('แอดเดรสนี้ไม่มีสัญญาบน Sepolia: ใช้แอดเดรส Bank ที่ Deploy บน Sepolia ไม่ใช่แอดเดรสกระเป๋าหรือสัญญาจาก Remix VM');
  }
  const candidate = new ethers.Contract(address, ABI, currentSigner);
  let initialBalance;
  try { initialBalance = await candidate.checkBlance(); }
  catch (error) {
    if (error.code === 'CALL_EXCEPTION' || error.code === 'BAD_DATA') {
      throw new Error('อ่าน checkBlance() ไม่ได้ กรุณาตรวจว่าเป็นสัญญา Bank ตามไฟล์ Bank.sol');
    }
    throw error;
  }
  if (signer !== currentSigner || provider !== currentProvider) throw new Error('บัญชีหรือเครือข่ายเปลี่ยน กรุณาเชื่อมต่อใหม่');
  bank = candidate;
  el('balance').textContent = ethers.formatEther(initialBalance);
  el('status').textContent = 'โหลดสัญญา Bank สำเร็จ พร้อมฝาก ถอน และตรวจสอบยอด';
});
el('address').oninput = () => {
  reset();
  el('status').textContent = signer ? 'กรอก Contract Address แล้วกดโหลดสัญญา Bank' : 'กดเชื่อมต่อ MetaMask ก่อน โดยไม่ต้องกรอกแอดเดรสกระเป๋า';
};
el('check').onclick = () => run(async () => {
  await balance(); el('status').textContent = 'อัปเดตยอดเงินแล้ว';
});
function amount(id) {
  const value = el(id).value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(value)) throw new Error('กรอกจำนวน ETH เป็นเลขบวก ทศนิยมไม่เกิน 18 ตำแหน่ง');
  const wei = ethers.parseEther(value);
  if (wei <= 0n) throw new Error('จำนวนเงินต้องมากกว่า 0');
  return wei;
}
async function transact(kind) {
  const value = amount(kind + 'Amount');
  if (kind === 'withdraw' && value > await bank.checkBlance()) throw new Error('ยอดเงินฝากไม่เพียงพอ');
  el('tx').textContent = '';
  el('status').textContent = 'กรุณายืนยันรายการใน MetaMask';
  const transaction = kind === 'deposit' ? await bank.deposit({ value }) : await bank.withdraw(value);
  el('tx').textContent = 'Transaction: ' + transaction.hash;
  el('status').textContent = 'ส่งรายการแล้ว กำลังรอยืนยันบนบล็อกเชน…';
  await transaction.wait();
  el(kind + 'Amount').value = '';
  el('status').textContent = kind === 'deposit' ? 'ฝากเงินสำเร็จ' : 'ถอนเงินสำเร็จ';
  try { await balance(); }
  catch { el('status').textContent += ' แต่ยังอ่านยอดใหม่ไม่ได้ กรุณากดตรวจสอบยอดอีกครั้ง'; }
}
el('deposit').onclick = () => run(() => transact('deposit'));
el('withdraw').onclick = () => run(() => transact('withdraw'));
