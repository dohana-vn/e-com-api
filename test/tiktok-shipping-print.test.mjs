import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TiktokModule,
  fetchTiktokShippingDocumentUrl,
  isTiktokOrderPrintable,
  dedupeTiktokPackages,
  TIKTOK_ORDER_STATUS,
} from '../dist/app.js';

test('TiktokModule exposes shipping document methods', () => {
  const client = new TiktokModule({
    appKey: 'k',
    appSecret: 's',
  });
  assert.equal(typeof client.getShippingDocument, 'function');
  assert.equal(typeof client.getShippingDocumentUrl, 'function');
  assert.equal(typeof client.isOrderPrintable, 'function');
});

test('fetchTiktokShippingDocumentUrl validates packageId', async () => {
  await assert.rejects(
    () => fetchTiktokShippingDocumentUrl('', { appKey: 'k', appSecret: 's' }),
    /packageId is required to fetch TikTok shipping document/,
  );
});

test('isTiktokOrderPrintable handles TikTok statuses and fulfillment rules', () => {
  assert.deepEqual(
    isTiktokOrderPrintable({
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      fulfillmentType: 0,
      deliveryOptionType: 1,
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
      packageStatus: 'PROCESSING',
    }),
    { printable: true, isReprint: false, recommendedStrategy: 'DIRECT_LINK' },
  );

  assert.equal(
    isTiktokOrderPrintable({
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_SHIPMENT,
      fulfillmentType: 0,
      deliveryOptionType: 1,
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isTiktokOrderPrintable({
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      fulfillmentType: 1, // FBT
      deliveryOptionType: 1,
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isTiktokOrderPrintable({
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      fulfillmentType: 0,
      deliveryOptionType: 2, // Seller self-shipping
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isTiktokOrderPrintable({
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      packageId: '',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isTiktokOrderPrintable({
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
      packageStatus: 'CANCELLED',
    }).printable,
    false,
  );

  assert.equal(
    isTiktokOrderPrintable(
      {
        platformStatus: TIKTOK_ORDER_STATUS.IN_TRANSIT,
        packageId: 'pkg_1',
        trackingNumber: 'TT123',
      },
      true,
    ).isReprint,
    true,
  );
});

test('dedupeTiktokPackages removes duplicate packageIds for combined orders', () => {
  const result = dedupeTiktokPackages([
    { orderId: '1', packageId: 'pkg_shared' },
    { orderId: '2', packageId: 'pkg_shared' },
    { orderId: '3', packageId: 'pkg_shared' },
    { orderId: '4', packageId: 'pkg_other' },
  ]);

  assert.equal(result.uniqueItems.length, 2);
  assert.deepEqual(
    result.uniqueItems.map((i) => i.orderId),
    ['1', '4'],
  );
  assert.equal(result.skippedDuplicates.length, 2);
  assert.equal(result.skippedDuplicates[0].sharedPackageId, 'pkg_shared');
});
