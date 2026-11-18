import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OrderIdentifierService,
  BridgeOrderService,
  BridgeFulfillmentService,
  NHANH_ORDER_SALE_CHANNEL,
} from '../dist/app.js';

function createMockNhanh(orderData) {
  return {
    getOrderList: async ({ filters }) => {
      const id = filters?.ids?.[0];
      if (orderData && orderData.info?.id === id) {
        return { code: 1, data: [orderData] };
      }
      return { code: 1, data: [] };
    },
    getShippingDocument: async (data) => ({
      source: 'NHANH',
      type: 'RAW_DATA',
      orderData: data,
    }),
  };
}

function createMockShopee() {
  return {
    getOrderDetail: async (orderSn) => ({
      response: {
        order_list: [
          {
            order_sn: orderSn,
            order_status: 'READY_TO_SHIP',
            total_amount: 350000,
            shipping_carrier: 'SPX Express',
            recipient_address: {
              full_address: '123 Đường Cầu Giấy, Hà Nội',
            },
            item_list: [
              {
                item_name: 'Áo Thun Trơn Basic',
                model_name: 'Trắng - L',
                model_quantity_purchased: 2,
                model_discounted_price: 175000,
              },
            ],
          },
        ],
      },
    }),
    shipOrder: async (orderSn, addressId, timeSlot) => ({
      order_sn: orderSn,
      address_id: addressId,
      time_slot: timeSlot,
      status: 'SHIPPED_SUCCESS',
    }),
    getBatchShippingDocuments: async (orders) => ({
      source: 'SHOPEE',
      type: 'URL',
      url: 'https://shopee.vn/shipping-docs/shopee-8899.pdf',
      format: 'PDF',
      readyOrders: orders,
      failedOrders: [],
    }),
    getTrackingNumber: async (orderSn) => ({
      response: {
        order_sn: orderSn,
        tracking_number: 'SPXVN08899',
        shipping_carrier: 'SPX Express',
        logistics_status: 'LOGISTICS_READY',
      },
    }),
  };
}

function createMockTiktok() {
  return {
    getOrderDetail: async (orderId) => ({
      data: {
        orders: [
          {
            id: orderId,
            order_status: 'AWAITING_COLLECTION',
            shipping_provider_name: 'J&T Express',
            payment_info: {
              total_amount: '280000',
            },
            recipient_address: {
              full_address: '456 Lê Duẩn, TP.HCM',
            },
            line_items: [
              {
                product_name: 'Tai Nghe Bluetooth Không Dây',
                sku_name: 'Màu Đen',
                quantity: 1,
                sale_price: '280000',
              },
            ],
            packages: [{ id: 'PKG_TT_9988' }],
          },
        ],
      },
    }),
    shipPackage: async (packageId, payload) => ({
      code: 0,
      message: 'success',
      data: { package_id: packageId, payload },
    }),
    getShippingDocumentUrl: async (packageId) => ({
      type: 'URL',
      source: 'TIKTOK',
      url: 'https://tiktok.com/shipping-docs/pkg-9988.pdf',
      packageId,
      format: 'PDF',
    }),
    getPackageDetail: async (packageId) => ({
      data: {
        package_id: packageId,
        tracking_number: 'JNT_VN_9988',
        shipping_provider_name: 'J&T Express',
        package_status: 'AWAITING_COLLECTION',
      },
    }),
  };
}

test('OrderIdentifierService: resolves Shopee order', async () => {
  const nhanhMock = createMockNhanh({
    info: { id: 8899 },
    channel: {
      saleChannel: NHANH_ORDER_SALE_CHANNEL.SHOPEE,
      appOrderId: 'SHOPEE_SN_8899',
    },
    carrier: { carrierCode: 'SPXVN08899' },
  });
  const identifierService = new OrderIdentifierService(nhanhMock);

  const identified = await identifierService.identifyPlatformOrder('NH8899');
  assert.equal(identified.platform, 'SHOPEE');
  assert.equal(identified.platformOrderId, 'SHOPEE_SN_8899');
  assert.equal(identified.nhanhOrderId, 8899);
  assert.equal(identified.carrierCode, 'SPXVN08899');
  assert.equal(identified.channelName, 'Shopee');
});

test('OrderIdentifierService: resolves TikTok order and packageId', async () => {
  const nhanhMock = createMockNhanh({
    info: { id: 9988 },
    channel: {
      saleChannel: NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP,
      appOrderId: 'TT_ORDER_9988',
    },
    carrier: { packageCode: 'PKG_TT_9988', carrierCode: 'JNT9988' },
  });
  const identifierService = new OrderIdentifierService(nhanhMock);

  const identified = await identifierService.identifyPlatformOrder('  nh9988  ');
  assert.equal(identified.platform, 'TIKTOK');
  assert.equal(identified.platformOrderId, 'TT_ORDER_9988');
  assert.equal(identified.platformPackageId, 'PKG_TT_9988');
  assert.equal(identified.nhanhOrderId, 9988);
});

test('OrderIdentifierService: handles Nhanh internal / retail orders', async () => {
  const nhanhMock = createMockNhanh({
    info: { id: 7777 },
    channel: {
      saleChannel: NHANH_ORDER_SALE_CHANNEL.WEBSITE,
    },
  });
  const identifierService = new OrderIdentifierService(nhanhMock);

  const identified = await identifierService.identifyPlatformOrder('7777');
  assert.equal(identified.platform, 'NHANH');
  assert.equal(identified.platformOrderId, '7777');
  assert.match(identified.channelName, /Nhanh\.vn/);
});

test('OrderIdentifierService: validates input and missing orders', async () => {
  const identifierService = new OrderIdentifierService(createMockNhanh(null));

  await assert.rejects(
    () => identifierService.identifyPlatformOrder(''),
    /Mã đơn Nhanh không hợp lệ/,
  );

  await assert.rejects(
    () => identifierService.identifyPlatformOrder('INVALID_NO_DIGITS'),
    /Mã đơn Nhanh không hợp lệ/,
  );

  await assert.rejects(
    () => identifierService.identifyPlatformOrder('NH12345'),
    /Không tìm thấy đơn hàng Nhanh ID: 12345/,
  );
});

test('BridgeOrderService: retrieves order details for Shopee and TikTok', async () => {
  const nhanhMock = {
    getOrderList: async ({ filters }) => {
      const id = filters?.ids?.[0];
      if (id === 8899) {
        return {
          code: 1,
          data: [
            {
              info: { id: 8899 },
              channel: {
                saleChannel: NHANH_ORDER_SALE_CHANNEL.SHOPEE,
                appOrderId: 'SHOPEE_SN_8899',
              },
            },
          ],
        };
      }
      if (id === 9988) {
        return {
          code: 1,
          data: [
            {
              info: { id: 9988 },
              channel: {
                saleChannel: NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP,
                appOrderId: 'TT_ORDER_9988',
              },
            },
          ],
        };
      }
      return { code: 1, data: [] };
    },
  };

  const identifierService = new OrderIdentifierService(nhanhMock);
  const orderService = new BridgeOrderService({
    identifierService,
    shopee: createMockShopee(),
    tiktok: createMockTiktok(),
  });

  // Shopee detail
  const shopeeDetail = await orderService.getOrderDetailByNhanhId('NH8899');
  assert.equal(shopeeDetail.source, 'SHOPEE');
  assert.equal(shopeeDetail.totalAmount, 350000);
  assert.equal(shopeeDetail.items.length, 1);
  assert.equal(shopeeDetail.items[0].itemName, 'Áo Thun Trơn Basic');
  assert.equal(shopeeDetail.items[0].quantity, 2);

  // TikTok detail
  const tiktokDetail = await orderService.getOrderDetailByNhanhId('NH9988');
  assert.equal(tiktokDetail.source, 'TIKTOK');
  assert.equal(tiktokDetail.totalAmount, '280000');
  assert.equal(tiktokDetail.items.length, 1);
  assert.equal(tiktokDetail.items[0].itemName, 'Tai Nghe Bluetooth Không Dây');
});

test('BridgeFulfillmentService: ship, shipping label, and tracking work directly', async () => {
  const nhanhMock = {
    getOrderList: async ({ filters }) => {
      const id = filters?.ids?.[0];
      if (id === 8899) {
        return {
          code: 1,
          data: [
            {
              info: { id: 8899 },
              channel: {
                saleChannel: NHANH_ORDER_SALE_CHANNEL.SHOPEE,
                appOrderId: 'SHOPEE_SN_8899',
              },
            },
          ],
        };
      }
      if (id === 9988) {
        return {
          code: 1,
          data: [
            {
              info: { id: 9988 },
              channel: {
                saleChannel: NHANH_ORDER_SALE_CHANNEL.TIKTOK_SHOP,
                appOrderId: 'TT_ORDER_9988',
              },
              carrier: { packageCode: 'PKG_TT_9988' },
            },
          ],
        };
      }
      return { code: 1, data: [] };
    },
  };

  const identifierService = new OrderIdentifierService(nhanhMock);
  const fulfillmentService = new BridgeFulfillmentService({
    identifierService,
    shopee: createMockShopee(),
    tiktok: createMockTiktok(),
  });

  // Ship Order
  const shopeeShip = await fulfillmentService.shipOrderByNhanhId('NH8899');
  assert.equal(shopeeShip.success, true);
  assert.equal(shopeeShip.platform, 'SHOPEE');

  const tiktokShip = await fulfillmentService.shipOrderByNhanhId('NH9988');
  assert.equal(tiktokShip.success, true);
  assert.equal(tiktokShip.platform, 'TIKTOK');

  // Shipping Label URL
  const shopeeLabel = await fulfillmentService.getShippingLabelByNhanhId('NH8899');
  assert.equal(shopeeLabel.printStatus, 'READY');
  assert.match(shopeeLabel.documentUrl, /shopee-8899\.pdf/);

  const tiktokLabel = await fulfillmentService.getShippingLabelByNhanhId('NH9988');
  assert.equal(tiktokLabel.printStatus, 'READY');
  assert.match(tiktokLabel.documentUrl, /pkg-9988\.pdf/);

  // Tracking info
  const shopeeTrack = await fulfillmentService.getTrackingInfoByNhanhId('NH8899');
  assert.equal(shopeeTrack.trackingNumber, 'SPXVN08899');
  assert.equal(shopeeTrack.carrierName, 'SPX Express');

  const tiktokTrack = await fulfillmentService.getTrackingInfoByNhanhId('NH9988');
  assert.equal(tiktokTrack.trackingNumber, 'JNT_VN_9988');
  assert.equal(tiktokTrack.carrierName, 'J&T Express');
});
