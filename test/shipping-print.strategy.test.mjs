import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ShippingPrintRegistry,
  defaultShippingPrintRegistry,
  TiktokPrintStrategy,
  ShopeePrintStrategy,
  NhanhPrintStrategy,
  isOrderPrintable,
  getShippingPrintDocument,
} from '../dist/app.js';

test('ShippingPrintRegistry pre-registers core strategies', () => {
  assert.equal(defaultShippingPrintRegistry.has('TIKTOK'), true);
  assert.equal(defaultShippingPrintRegistry.has('SHOPEE'), true);
  assert.equal(defaultShippingPrintRegistry.has('NHANH'), true);

  const tiktokStrategy = defaultShippingPrintRegistry.get('TIKTOK');
  assert.equal(tiktokStrategy instanceof TiktokPrintStrategy, true);

  const shopeeStrategy = defaultShippingPrintRegistry.get('SHOPEE');
  assert.equal(shopeeStrategy instanceof ShopeePrintStrategy, true);

  const nhanhStrategy = defaultShippingPrintRegistry.get('NHANH');
  assert.equal(nhanhStrategy instanceof NhanhPrintStrategy, true);
});

test('ShippingPrintRegistry supports adding a new platform strategy (OCP - Open/Closed Principle)', async () => {
  const customRegistry = new ShippingPrintRegistry();

  // Mock a new platform: LAZADA without modifying any existing Shopee/TikTok code!
  class LazadaPrintStrategy {
    constructor() {
      this.source = 'LAZADA';
    }

    isPrintable(order) {
      if (order.platformStatus === 'ready_to_ship') {
        return { printable: true, recommendedStrategy: 'DIRECT_LINK' };
      }
      return { printable: false, reason: 'Lazada order not ready to ship' };
    }

    async print(request) {
      return {
        source: 'LAZADA',
        type: 'URL',
        url: `https://lazada.com/labels/${request.orderId}.pdf`,
        format: 'PDF',
      };
    }
  }

  // Register Lazada
  customRegistry.register(new LazadaPrintStrategy());
  assert.equal(customRegistry.has('LAZADA'), true);
  assert.deepEqual(customRegistry.getSupportedPlatforms(), ['TIKTOK', 'SHOPEE', 'NHANH', 'LAZADA']);

  // Test isOrderPrintable for Lazada
  const checkPass = customRegistry.isOrderPrintable({
    source: 'LAZADA',
    platformStatus: 'ready_to_ship',
  });
  assert.equal(checkPass.printable, true);

  const checkFail = customRegistry.isOrderPrintable({
    source: 'LAZADA',
    platformStatus: 'pending',
  });
  assert.equal(checkFail.printable, false);
  assert.equal(checkFail.reason, 'Lazada order not ready to ship');

  // Test getShippingPrintDocument for Lazada
  const printRes = await customRegistry.getShippingPrintDocument({
    source: 'LAZADA',
    orderId: 'LAZ_9999',
  });
  assert.equal(printRes.source, 'LAZADA');
  assert.equal(printRes.type, 'URL');
  assert.equal(printRes.url, 'https://lazada.com/labels/LAZ_9999.pdf');
});
