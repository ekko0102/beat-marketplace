import crypto from 'crypto';

const MERCHANT_ID  = process.env.ECPAY_MERCHANT_ID  || '2000132';   // test
const HASH_KEY     = process.env.ECPAY_HASH_KEY      || '5294y06JbISpM5x9';
const HASH_IV      = process.env.ECPAY_HASH_IV       || 'v77hoKGq4kWxNNIS';
const IS_PROD      = process.env.ECPAY_PROD === 'true';
const PAYMENT_URL  = IS_PROD
  ? 'https://payment.ecpay.com.tw/Cashier/AioCheckout/'
  : 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckout/';

function genCheckMac(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  const raw = `HashKey=${HASH_KEY}&${sorted}&HashIV=${HASH_IV}`;
  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%20/g, '+')
    .replace(/%21/g, '!')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%2a/g, '*');

  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

export function verifyCheckMac(params: Record<string, string>): boolean {
  const { CheckMacValue, ...rest } = params;
  return genCheckMac(rest) === CheckMacValue;
}

export function buildEcpayForm(opts: {
  tradeNo: string;
  totalAmount: number;
  tradeDesc: string;
  itemName: string;
  returnUrl: string;
  orderResultUrl: string;
  buyerEmail: string;
}): { url: string; params: Record<string, string> } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const tradeDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const params: Record<string, string> = {
    MerchantID:         MERCHANT_ID,
    MerchantTradeNo:    opts.tradeNo,
    MerchantTradeDate:  tradeDate,
    PaymentType:        'aio',
    TotalAmount:        String(opts.totalAmount),
    TradeDesc:          opts.tradeDesc,
    ItemName:           opts.itemName,
    ReturnURL:          opts.returnUrl,
    OrderResultURL:     opts.orderResultUrl,
    ChoosePayment:      'ALL',
    EncryptType:        '1',
    NeedExtraPaidInfo:  'N',
    PlatformID:         '',
    InvoiceMark:        'N',
    CustomField1:       '',
    CustomField2:       '',
    CustomField3:       '',
    CustomField4:       '',
    Remark:             opts.buyerEmail,
  };

  params.CheckMacValue = genCheckMac(params);
  return { url: PAYMENT_URL, params };
}
