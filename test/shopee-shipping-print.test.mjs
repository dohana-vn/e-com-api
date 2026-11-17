import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ShopeeModule,
  fetchShopeeBatchShippingDocuments,
  isShopeeOrderPrintable,
  chunkShopeePrintOrders,
  detectDownloadedDocumentFormat,
  partitionShopeeDocumentResult,
  ShopeeOrderStatus,
  SHOPEE_ORDER_STATUS,
  SHOPEE_LOGISTICS_STATUS,
  SHOPEE_SHIPPING_DOCUMENT_TYPE,
  SHOPEE_STATUS_SHIPPING_DOCUMENT,
} from '../dist/app.js';

test('ShopeeOrderStatus includes PROCESSED and INVOICE_PENDING', () => {
  assert.equal(ShopeeOrderStatus.PROCESSED, 'PROCESSED');
  assert.equal(ShopeeOrderStatus.INVOICE_PENDING, 'INVOICE_PENDING');
  assert.equal(SHOPEE_ORDER_STATUS.PROCESSED, 'PROCESSED');
});

test('ShopeeModule exposes shipping document methods', () => {
  const client = new ShopeeModule({
    partnerId: 1,
    partnerKey: 'secret',
    shopId: 100,
    accessToken: 'token',
  });
  assert.equal(typeof client.getShippingDocumentParameter, 'function');
  assert.equal(typeof client.getBatchShippingDocuments, 'function');
  assert.equal(typeof client.isOrderPrintable, 'function');
});

test('fetchShopeeBatchShippingDocuments validates batch size', async () => {
  await assert.rejects(
    () => fetchShopeeBatchShippingDocuments([], { partnerId: 1, partnerKey: 'k', shopId: '1', accessToken: 't' }),
    /Shopee batch print requires at least 1 order/,
  );

  const over50 = Array.from({ length: 51 }, (_, i) => ({ order_sn: `SN_${i}` }));
  await assert.rejects(
    () => fetchShopeeBatchShippingDocuments(over50, { partnerId: 1, partnerKey: 'k', shopId: '1', accessToken: 't' }),
    /Shopee batch print limit exceeded: requested 51 orders, maximum allowed is 50/,
  );
});

test('isShopeeOrderPrintable handles PROCESSED vs READY_TO_SHIP', () => {
  assert.deepEqual(
    isShopeeOrderPrintable({
      platformStatus: SHOPEE_ORDER_STATUS.PROCESSED,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_REQUEST_CREATED,
      trackingNumber: 'SPX123',
    }),
    { printable: true, isReprint: false, recommendedStrategy: 'SHOPEE_BATCH_WORKER' },
  );

  assert.equal(
    isShopeeOrderPrintable({
      platformStatus: SHOPEE_ORDER_STATUS.READY_TO_SHIP,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_READY,
      trackingNumber: 'SPX123',
    }).printable,
    false,
  );

  assert.equal(
    isShopeeOrderPrintable({
      platformStatus: SHOPEE_ORDER_STATUS.PROCESSED,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_READY,
      trackingNumber: '',
    }).printable,
    false,
  );

  assert.equal(
    isShopeeOrderPrintable({
      platformStatus: SHOPEE_ORDER_STATUS.PROCESSED,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_REQUEST_CANCELED,
      trackingNumber: 'SPX123',
    }).printable,
    false,
  );

  assert.equal(
    isShopeeOrderPrintable(
      {
        platformStatus: SHOPEE_ORDER_STATUS.SHIPPED,
        logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_PICKUP_DONE,
        trackingNumber: 'SPX123',
      },
      true,
    ).isReprint,
    true,
  );
});

test('chunkShopeePrintOrders groups by shopId + docType and chunks max 50', () => {
  const items = Array.from({ length: 53 }, (_, i) => ({
    shopId: 'shop_1',
    orderSn: `SN_${i}`,
    shippingDocumentType: SHOPEE_SHIPPING_DOCUMENT_TYPE.THERMAL_AIR_WAYBILL,
  }));
  items.push({
    shopId: 'shop_2',
    orderSn: 'SN_OTHER',
    shippingDocumentType: SHOPEE_SHIPPING_DOCUMENT_TYPE.NORMAL_AIR_WAYBILL,
  });

  const chunks = chunkShopeePrintOrders(items, 50);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].items.length, 50);
  assert.equal(chunks[1].items.length, 3);
  assert.equal(chunks[2].shopId, 'shop_2');
  assert.equal(chunks[2].items.length, 1);
});

test('detectDownloadedDocumentFormat identifies PDF, ZIP, PNG, ZPL', () => {
  assert.equal(detectDownloadedDocumentFormat(Buffer.from('%PDF-1.7\n')), 'PDF');
  assert.equal(detectDownloadedDocumentFormat(Uint8Array.from([0x50, 0x4b, 0x03, 0x04])), 'ZIP');
  assert.equal(detectDownloadedDocumentFormat(Uint8Array.from([0x89, 0x50, 0x4e, 0x47])), 'PNG');
  assert.equal(detectDownloadedDocumentFormat(Buffer.from('  ^XA^FO50,50^FDTest^FS^XZ')), 'ZPL');
  assert.equal(detectDownloadedDocumentFormat(Buffer.from('random')), 'UNKNOWN');
});

test('partitionShopeeDocumentResult supports partial success and all failed orders', () => {
  const requested = [
    { order_sn: 'A1' },
    { order_sn: 'A2' },
    { order_sn: 'A3' },
  ];

  const pending = partitionShopeeDocumentResult(requested, [
    { order_sn: 'A1', status: 'READY' },
    { order_sn: 'A2', status: 'PROCESSING' },
    { order_sn: 'A3', status: 'READY' },
  ]);
  assert.equal(pending.stillProcessing, true);

  const finished = partitionShopeeDocumentResult(requested, [
    { order_sn: 'A1', status: 'READY' },
    { order_sn: 'A2', status: 'FAILED', fail_message: 'Cancelled order' },
    { order_sn: 'A3', status: 'READY' },
  ]);
  assert.equal(finished.stillProcessing, false);
  assert.deepEqual(finished.readyOrders, [{ order_sn: 'A1' }, { order_sn: 'A3' }]);
  assert.deepEqual(finished.failedOrders, [
    { order: { order_sn: 'A2' }, reason: 'Cancelled order' },
  ]);

  const allFailed = partitionShopeeDocumentResult(
    [{ order_sn: 'SN_1' }, { order_sn: 'SN_2' }],
    [
      { order_sn: 'SN_1', status: SHOPEE_STATUS_SHIPPING_DOCUMENT.FAILED, fail_error: 'NOT_READY' },
      { order_sn: 'SN_2', status: SHOPEE_STATUS_SHIPPING_DOCUMENT.FAILED, fail_message: 'Carrier error' },
    ],
  );
  assert.equal(allFailed.stillProcessing, false);
  assert.equal(allFailed.readyOrders.length, 0);
  assert.equal(allFailed.failedOrders.length, 2);
});
