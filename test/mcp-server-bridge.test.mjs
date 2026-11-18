import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, handleToolCall, setOrderService, setFulfillmentService } from '../mcp_server.js';

test('MCP Server: Registers 4 new bridge tools in TOOLS array', () => {
  const toolNames = TOOLS.map((t) => t.name);
  assert.ok(toolNames.includes('ecom_get_order_detail'));
  assert.ok(toolNames.includes('ecom_ship_order'));
  assert.ok(toolNames.includes('ecom_get_shipping_label'));
  assert.ok(toolNames.includes('ecom_get_tracking_info'));

  // Ensure Vietnamese descriptions exist
  const getDetailTool = TOOLS.find((t) => t.name === 'ecom_get_order_detail');
  assert.match(getDetailTool.description, /Tra cứu chi tiết đơn hàng/);
  assert.ok(getDetailTool.inputSchema.properties.nhanhOrderId);
});

test('MCP Server: handleToolCall dispatches bridge service requests correctly', async () => {
  const mockOrderService = {
    getOrderDetailByNhanhId: async (id) => ({
      source: 'SHOPEE',
      nhanhOrderId: 8899,
      platformOrderId: 'SHOPEE_SN_8899',
      totalAmount: 400000,
      items: [{ itemName: 'Áo Khoác Bomber', quantity: 1, price: 400000 }],
    }),
  };

  const mockFulfillmentService = {
    shipOrderByNhanhId: async (id) => ({
      success: true,
      platform: 'SHOPEE',
      nhanhOrderId: 8899,
      message: 'Đã bắn lệnh xác nhận chuẩn bị hàng lên Shopee thành công.',
    }),
    getShippingLabelByNhanhId: async (id) => ({
      platform: 'SHOPEE',
      nhanhOrderId: 8899,
      printStatus: 'READY',
      documentUrl: 'https://shopee.vn/docs/label8899.pdf',
    }),
    getTrackingInfoByNhanhId: async (id) => ({
      platform: 'SHOPEE',
      nhanhOrderId: 8899,
      trackingNumber: 'SPXVN998811',
      status: 'LOGISTICS_READY',
    }),
  };

  setOrderService(mockOrderService);
  setFulfillmentService(mockFulfillmentService);

  // 1. Order Detail
  const detailJson = await handleToolCall('ecom_get_order_detail', { nhanhOrderId: 'NH8899' });
  const detail = JSON.parse(detailJson);
  assert.equal(detail.source, 'SHOPEE');
  assert.equal(detail.totalAmount, 400000);
  assert.equal(detail.items[0].itemName, 'Áo Khoác Bomber');

  // 2. Ship Order
  const shipJson = await handleToolCall('ecom_ship_order', { nhanhOrderId: 'NH8899' });
  const shipRes = JSON.parse(shipJson);
  assert.equal(shipRes.success, true);
  assert.match(shipRes.message, /Shopee/);

  // 3. Shipping Label
  const labelJson = await handleToolCall('ecom_get_shipping_label', { nhanhOrderId: 'NH8899' });
  const labelRes = JSON.parse(labelJson);
  assert.equal(labelRes.printStatus, 'READY');
  assert.equal(labelRes.documentUrl, 'https://shopee.vn/docs/label8899.pdf');

  // 4. Tracking Info
  const trackJson = await handleToolCall('ecom_get_tracking_info', { nhanhOrderId: 'NH8899' });
  const trackRes = JSON.parse(trackJson);
  assert.equal(trackRes.trackingNumber, 'SPXVN998811');
});
