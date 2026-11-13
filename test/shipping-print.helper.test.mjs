import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isOrderPrintable,
  dedupeTiktokPackages,
  chunkShopeePrintOrders,
  detectDownloadedDocumentFormat,
  partitionShopeeDocumentResult,
  ShopeeModule,
  ShopeeOrderStatus,
  SHOPEE_ORDER_STATUS,
  SHOPEE_LOGISTICS_STATUS,
  SHOPEE_SHIPPING_DOCUMENT_TYPE,
  TIKTOK_ORDER_STATUS,
  NHANH_ORDER_STATUS,
  NHANH_ORDER_SALE_CHANNEL,
  NHANH_ORDER_CARRIER,
} from '../dist/app.js';

test('ShopeeOrderStatus includes PROCESSED and INVOICE_PENDING', () => {
  assert.equal(ShopeeOrderStatus.PROCESSED, 'PROCESSED');
  assert.equal(ShopeeOrderStatus.INVOICE_PENDING, 'INVOICE_PENDING');
  assert.equal(SHOPEE_ORDER_STATUS.PROCESSED, 'PROCESSED');
});

test('ShopeeModule exposes getShippingDocumentParameter', () => {
  const client = new ShopeeModule({
    partnerId: 1,
    partnerKey: 'secret',
    shopId: 100,
    accessToken: 'token',
  });
  assert.equal(typeof client.getShippingDocumentParameter, 'function');
});

test('isOrderPrintable handles TikTok statuses and fulfillment rules', () => {
  assert.deepEqual(
    isOrderPrintable({
      source: 'TIKTOK',
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
    isOrderPrintable({
      source: 'TIKTOK',
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_SHIPMENT,
      fulfillmentType: 0,
      deliveryOptionType: 1,
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isOrderPrintable({
      source: 'TIKTOK',
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      fulfillmentType: 1, // FBT
      deliveryOptionType: 1,
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isOrderPrintable({
      source: 'TIKTOK',
      platformStatus: TIKTOK_ORDER_STATUS.AWAITING_COLLECTION,
      fulfillmentType: 0,
      deliveryOptionType: 2, // seller self-shipping
      packageId: 'pkg_1',
      trackingNumber: 'TT123',
    }).printable,
    false,
  );

  assert.equal(
    isOrderPrintable(
      {
        source: 'TIKTOK',
        platformStatus: TIKTOK_ORDER_STATUS.IN_TRANSIT,
        fulfillmentType: 0,
        deliveryOptionType: 1,
        packageId: 'pkg_1',
        trackingNumber: 'TT123',
      },
      { allowReprint: true },
    ).isReprint,
    true,
  );
});

test('isOrderPrintable handles Shopee PROCESSED vs READY_TO_SHIP', () => {
  assert.deepEqual(
    isOrderPrintable({
      source: 'SHOPEE',
      platformStatus: SHOPEE_ORDER_STATUS.PROCESSED,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_REQUEST_CREATED,
      trackingNumber: 'SPX123',
    }),
    { printable: true, isReprint: false, recommendedStrategy: 'SHOPEE_BATCH_WORKER' },
  );

  assert.equal(
    isOrderPrintable({
      source: 'SHOPEE',
      platformStatus: SHOPEE_ORDER_STATUS.READY_TO_SHIP,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_READY,
      trackingNumber: '',
    }).printable,
    false,
  );

  assert.equal(
    isOrderPrintable({
      source: 'SHOPEE',
      platformStatus: SHOPEE_ORDER_STATUS.PROCESSED,
      logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_REQUEST_CANCELED,
      trackingNumber: 'SPX123',
    }).printable,
    false,
  );

  assert.equal(
    isOrderPrintable(
      {
        source: 'SHOPEE',
        platformStatus: SHOPEE_ORDER_STATUS.SHIPPED,
        logisticsStatus: SHOPEE_LOGISTICS_STATUS.LOGISTICS_PICKUP_DONE,
        trackingNumber: 'SPX123',
      },
      { allowReprint: true },
    ).isReprint,
    true,
  );
});

test('isOrderPrintable handles Nhanh.vn strategies', () => {
  assert.deepEqual(
    isOrderPrintable({
      source: 'NHANH',
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.GIAO_HANG_NHANH,
      carrierCode: 'GHN999',
      nhanhSaleChannel: NHANH_ORDER_SALE_CHANNEL.WEBSITE,
    }),
    { printable: true, isReprint: false, recommendedStrategy: 'SELF_RENDER_PDF' },
  );

  assert.deepEqual(
    isOrderPrintable({
      source: 'NHANH',
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
    isOrderPrintable({
      source: 'NHANH',
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.GIAO_HANG_NHANH,
    }).printable,
    false,
  );

  assert.equal(
    isOrderPrintable({
      source: 'NHANH',
      platformStatus: NHANH_ORDER_STATUS.PACKED,
      carrierId: NHANH_ORDER_CARRIER.SELF_TRANSPORT,
    }).printable,
    true,
  );
});

test('dedupeTiktokPackages removes duplicate packageIds for combined orders', () => {
  const result = dedupeTiktokPackages([
    { source: 'TIKTOK', orderId: '1', packageId: 'pkg_shared' },
    { source: 'TIKTOK', orderId: '2', packageId: 'pkg_shared' },
    { source: 'SHOPEE', orderId: '3', packageId: 'pkg_shared' },
    { source: 'TIKTOK', orderId: '4', packageId: 'pkg_other' },
  ]);

  assert.equal(result.uniqueItems.length, 3);
  assert.deepEqual(
    result.uniqueItems.map((i) => i.orderId),
    ['1', '3', '4'],
  );
  assert.equal(result.skippedDuplicates.length, 1);
  assert.equal(result.skippedDuplicates[0].sharedPackageId, 'pkg_shared');
});

test('chunkShopeePrintOrders groups by shopId + docType and chunks max 50', () => {
  const items = Array.from({ length: 53 }, (_, i) => ({
    source: 'SHOPEE',
    shopId: 'shop_1',
    orderSn: `SN_${i}`,
    shippingDocumentType: SHOPEE_SHIPPING_DOCUMENT_TYPE.THERMAL_AIR_WAYBILL,
  }));
  items.push({
    source: 'SHOPEE',
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

test('partitionShopeeDocumentResult supports partial success', () => {
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
});
