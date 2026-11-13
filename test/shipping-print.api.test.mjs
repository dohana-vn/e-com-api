import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchTiktokShippingDocumentUrl,
  fetchShopeeBatchShippingDocuments,
  getShippingPrintDocument,
  ShopeeOrderStatus,
  partitionShopeeDocumentResult,
  SHOPEE_STATUS_SHIPPING_DOCUMENT,
} from '../dist/app.js';

test('fetchTiktokShippingDocumentUrl validates packageId', async () => {
  await assert.rejects(
    () => fetchTiktokShippingDocumentUrl('', { appKey: 'k', appSecret: 's' }),
    /packageId is required/,
  );
});

test('fetchShopeeBatchShippingDocuments validates batch size', async () => {
  await assert.rejects(
    () => fetchShopeeBatchShippingDocuments([], { partnerId: 1, partnerKey: 'k' }),
    /At least one order is required/,
  );

  const over50 = Array.from({ length: 51 }, (_, i) => ({ order_sn: `SN_${i}` }));
  await assert.rejects(
    () => fetchShopeeBatchShippingDocuments(over50, { partnerId: 1, partnerKey: 'k' }),
    /exceeds maximum limit of 50 orders/,
  );
});

test('getShippingPrintDocument handles NHANH raw data fallback', async () => {
  const result = await getShippingPrintDocument({
    source: 'NHANH',
    orderData: { id: 12345, carrierCode: 'GHN123' },
  });

  assert.equal(result.source, 'NHANH');
  assert.equal(result.type, 'RAW_DATA');
  assert.equal(result.orderData.id, 12345);
  assert.match(result.message, /Nhanh\.vn Open API does not provide a direct print document endpoint/);
});

test('partitionShopeeDocumentResult handles all failed orders leading to NO_DOCUMENT condition', () => {
  const orders = [{ order_sn: 'SN_1' }, { order_sn: 'SN_2' }];
  const resultList = [
    { order_sn: 'SN_1', status: SHOPEE_STATUS_SHIPPING_DOCUMENT.FAILED, fail_error: 'NOT_READY' },
    { order_sn: 'SN_2', status: SHOPEE_STATUS_SHIPPING_DOCUMENT.FAILED, fail_message: 'Carrier error' },
  ];

  const partition = partitionShopeeDocumentResult(orders, resultList);
  assert.equal(partition.stillProcessing, false);
  assert.equal(partition.readyOrders.length, 0);
  assert.equal(partition.failedOrders.length, 2);
  assert.equal(partition.failedOrders[0].reason, 'NOT_READY');
  assert.equal(partition.failedOrders[1].reason, 'Carrier error');
});
