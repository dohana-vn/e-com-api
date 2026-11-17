import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NhanhModule,
  isNhanhOrderPrintable,
  NHANH_ORDER_STATUS,
  NHANH_ORDER_SALE_CHANNEL,
  NHANH_ORDER_CARRIER,
} from '../dist/app.js';

test('NhanhModule exposes isOrderPrintable method', () => {
  const client = new NhanhModule({
    appSecret: 'secret',
    returnLink: 'link',
    version: '2.0',
  });
  assert.equal(typeof client.isOrderPrintable, 'function');
});

test('isNhanhOrderPrintable handles Nhanh.vn strategies', () => {
  assert.deepEqual(
    isNhanhOrderPrintable({
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.GIAO_HANG_NHANH,
      carrierCode: 'GHN999',
      nhanhSaleChannel: NHANH_ORDER_SALE_CHANNEL.WEBSITE,
    }),
    { printable: true, isReprint: false, recommendedStrategy: 'SELF_RENDER_PDF' },
  );

  assert.deepEqual(
    isNhanhOrderPrintable({
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.SPX,
      carrierCode: 'SPXVN123',
      nhanhSaleChannel: NHANH_ORDER_SALE_CHANNEL.SHOPEE,
      nhanhAppOrderId: '241110ABC',
      hasLinkedPlatformShop: true,
    }),
    { printable: true, isReprint: false, recommendedStrategy: 'PLATFORM_DELEGATION' },
  );

  assert.equal(
    isNhanhOrderPrintable({
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.GIAO_HANG_NHANH,
    }).printable,
    false,
  );

  assert.equal(
    isNhanhOrderPrintable({
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.SELF_TRANSPORT,
    }).printable,
    true,
  );
});
