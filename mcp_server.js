#!/usr/bin/env node
/**
 * Model Context Protocol (MCP) Server for e-com-api.
 * 
 * Enables Antigravity to inspect e-commerce platforms (Shopee, TikTok Shop, Nhanh.vn),
 * validate print eligibility, chunk orders, and check fulfillment specifications.
 * 
 * Now with EcomBridgeService: Auto-detects order origin (Shopee, TikTok Shop, Nhanh.vn)
 * and dispatches order details, shipping labels, fulfillment, and tracking info.
 */

const readline = require('readline');
const path = require('path');

let app;
try {
  app = require(path.join(__dirname, 'dist', 'app.js'));
} catch (err) {
  console.error('[e-com-api-mcp] Warning: Could not load dist/app.js. Run npm run build.', err);
}

const helper = {
  isOrderPrintable: (candidate, options) => {
    if (!app) return { printable: false, reason: 'App module not loaded' };
    if (candidate.source === 'SHOPEE') {
      return app.isShopeeOrderPrintable(candidate, options?.allowReprint);
    }
    if (candidate.source === 'TIKTOK') {
      return app.isTiktokOrderPrintable(candidate, options?.allowReprint);
    }
    return app.isNhanhOrderPrintable(candidate, options);
  },
  chunkShopeePrintOrders: app ? app.chunkShopeePrintOrders : null,
  dedupeTiktokPackages: app ? app.dedupeTiktokPackages : null,
};

let orderService;
let fulfillmentService;

if (app?.OrderIdentifierService && app?.BridgeOrderService && app?.BridgeFulfillmentService) {
  const nhanhClient = process.env.NHANH_APP_ID && new app.NhanhModule({
    appId: process.env.NHANH_APP_ID,
    appSecret: process.env.NHANH_APP_SECRET || '',
    version: process.env.NHANH_VERSION || '2.0',
    returnLink: process.env.NHANH_RETURN_LINK || '',
    businessId: process.env.NHANH_BUSINESS_ID,
    accessToken: process.env.NHANH_ACCESS_TOKEN,
  });

  const shopeeClient = process.env.SHOPEE_PARTNER_ID && new app.ShopeeModule({
    partnerId: Number(process.env.SHOPEE_PARTNER_ID),
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    shopId: process.env.SHOPEE_SHOP_ID,
    accessToken: process.env.SHOPEE_ACCESS_TOKEN,
  });

  const tiktokClient = process.env.TIKTOK_APP_KEY && new app.TiktokModule({
    appKey: process.env.TIKTOK_APP_KEY,
    appSecret: process.env.TIKTOK_APP_SECRET || '',
    accessToken: process.env.TIKTOK_ACCESS_TOKEN,
    shopId: process.env.TIKTOK_SHOP_ID,
  });

  const identifierService = new app.OrderIdentifierService(nhanhClient || undefined);

  orderService = new app.BridgeOrderService({
    identifierService,
    shopee: shopeeClient || undefined,
    tiktok: tiktokClient || undefined,
  });

  fulfillmentService = new app.BridgeFulfillmentService({
    identifierService,
    shopee: shopeeClient || undefined,
    tiktok: tiktokClient || undefined,
    nhanh: nhanhClient || undefined,
  });
}

function setOrderService(service) {
  orderService = service;
}

function setFulfillmentService(service) {
  fulfillmentService = service;
}

const TOOLS = [
  {
    name: 'ecom_get_order_detail',
    description: 'Tra cứu chi tiết đơn hàng (danh sách món, phân loại, giá tiền, tổng tiền, địa chỉ) từ mã đơn Nhanh.vn (VD: NH8899, 8899). Tự động nhận diện sàn gốc (Shopee, TikTok Shop) và lấy đúng dữ liệu món hàng khách đã mua.',
    inputSchema: {
      type: 'object',
      properties: {
        nhanhOrderId: {
          type: 'string',
          description: 'Mã đơn hàng trên Nhanh.vn (Ví dụ: NH8899 hoặc 8899)'
        }
      },
      required: ['nhanhOrderId']
    }
  },
  {
    name: 'ecom_ship_order',
    description: 'Bắn lệnh xác nhận chuẩn bị hàng / hẹn shipper đến lấy hàng lên Shopee hoặc TikTok Shop dựa theo mã đơn Nhanh.vn để đơn vị vận chuyển tới kho nhận hàng.',
    inputSchema: {
      type: 'object',
      properties: {
        nhanhOrderId: {
          type: 'string',
          description: 'Mã đơn Nhanh.vn (Ví dụ: NH8899)'
        },
        addressId: {
          type: 'integer',
          description: 'ID địa chỉ kho lấy hàng (Shopee, tùy chọn)'
        },
        timeSlot: {
          type: 'string',
          description: 'Khung giờ shipper đến lấy hàng (tùy chọn)'
        }
      },
      required: ['nhanhOrderId']
    }
  },
  {
    name: 'ecom_get_shipping_label',
    description: 'Lấy link tải file PDF tem in vận chuyển chính thức của sàn Shopee hoặc TikTok Shop cho đơn hàng Nhanh.vn để nhân viên kho in nhiệt dán gói hàng.',
    inputSchema: {
      type: 'object',
      properties: {
        nhanhOrderId: {
          type: 'string',
          description: 'Mã đơn Nhanh.vn (Ví dụ: NH8899)'
        }
      },
      required: ['nhanhOrderId']
    }
  },
  {
    name: 'ecom_get_tracking_info',
    description: 'Tra cứu mã vận đơn (tracking number), tên đơn vị vận chuyển (SPX, J&T, GHN...) và tiến trình giao hàng thực tế của đơn Nhanh.vn trên sàn.',
    inputSchema: {
      type: 'object',
      properties: {
        nhanhOrderId: {
          type: 'string',
          description: 'Mã đơn Nhanh.vn (Ví dụ: NH8899)'
        }
      },
      required: ['nhanhOrderId']
    }
  },
  {
    name: 'ecom_check_print_eligibility',
    description: 'Kiểm tra trạng thái đơn hàng từ TikTok Shop, Shopee, hoặc Nhanh.vn xem có đủ điều kiện in tem vận đơn (shipping document) hay không.',
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          enum: ['TIKTOK', 'SHOPEE', 'NHANH'],
          description: 'Sàn thương mại điện tử: TIKTOK, SHOPEE, hoặc NHANH'
        },
        platformStatus: {
          type: 'string',
          description: 'Trạng thái đơn hàng của sàn (VD: TikTok: 111/112/114/121; Shopee: READY_TO_SHIP, PROCESSED, SHIPPED; Nhanh: 56/4/6)'
        },
        trackingNumber: {
          type: 'string',
          description: 'Mã vận đơn (tracking number) nếu đã có'
        },
        packageId: {
          type: 'string',
          description: 'Mã kiện hàng (TikTok package_id)'
        },
        packageStatus: {
          type: 'string',
          description: 'Trạng thái kiện hàng TikTok (TO_FULFILL, AWAITING_COLLECTION, IN_TRANSIT, DELIVERED)'
        },
        logisticsStatus: {
          type: 'string',
          description: 'Trạng thái logistics của Shopee (LOGISTICS_NOT_STARTED, LOGISTICS_REQUEST_CREATED, LOGISTICS_PICKUP_DONE...)'
        },
        carrierCode: {
          type: 'string',
          description: 'Mã đơn vị vận chuyển (Nhanh.vn)'
        },
        allowReprint: {
          type: 'boolean',
          description: 'Cho phép in lại đơn đã giao/đang giao (mặc định: false)'
        }
      },
      required: ['source', 'platformStatus']
    }
  },
  {
    name: 'ecom_chunk_shopee_orders',
    description: 'Chia nhỏ danh sách đơn hàng Shopee thành các lô (batch) tối đa 50 đơn/lô để gọi API in hàng loạt không bị quá tải.',
    inputSchema: {
      type: 'object',
      properties: {
        orderSns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách mã đơn hàng Shopee (order_sn)'
        },
        maxPerBatch: {
          type: 'integer',
          description: 'Số lượng đơn tối đa mỗi batch (mặc định 50)',
          default: 50
        }
      },
      required: ['orderSns']
    }
  },
  {
    name: 'ecom_dedupe_tiktok_packages',
    description: 'Lọc bỏ các kiện hàng TikTok trùng lặp trong danh sách in ấn.',
    inputSchema: {
      type: 'object',
      properties: {
        packageIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách package_id cần lọc trùng'
        }
      },
      required: ['packageIds']
    }
  },
  {
    name: 'ecom_list_platforms',
    description: 'Liệt kê danh sách các sàn thương mại điện tử và các module API được hỗ trợ trong e-com-api.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'ecom_platform_print_specs',
    description: 'Tra cứu tài liệu đặc tả kỹ thuật và quy tắc in tem vận đơn của từng sàn (TikTok Shop, Shopee, Nhanh.vn).',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['TIKTOK', 'SHOPEE', 'NHANH', 'ALL'],
          description: 'Tên sàn cần xem đặc tả',
          default: 'ALL'
        }
      }
    }
  }
];

async function handleToolCall(name, args) {
  console.error(`[e-com-api-mcp] Tool call: ${name}`, args);

  // --- CÁC TOOL CỦA BRIDGE SERVICES (ORDER & FULFILLMENT) ---
  if (name === 'ecom_get_order_detail') {
    if (!orderService) {
      return JSON.stringify({
        error: 'BridgeOrderService chưa sẵn sàng. Vui lòng kiểm tra cấu hình tài khoản Nhanh và các sàn.',
      });
    }
    const result = await orderService.getOrderDetailByNhanhId(args.nhanhOrderId);
    return JSON.stringify(result, null, 2);
  }

  if (name === 'ecom_ship_order') {
    if (!fulfillmentService) {
      return JSON.stringify({
        error: 'BridgeFulfillmentService chưa sẵn sàng. Vui lòng kiểm tra cấu hình tài khoản Nhanh và các sàn.',
      });
    }
    const result = await fulfillmentService.shipOrderByNhanhId(args.nhanhOrderId, {
      addressId: args.addressId,
      timeSlot: args.timeSlot,
    });
    return JSON.stringify(result, null, 2);
  }

  if (name === 'ecom_get_shipping_label') {
    if (!fulfillmentService) {
      return JSON.stringify({
        error: 'BridgeFulfillmentService chưa sẵn sàng. Vui lòng kiểm tra cấu hình tài khoản Nhanh và các sàn.',
      });
    }
    const result = await fulfillmentService.getShippingLabelByNhanhId(args.nhanhOrderId);
    return JSON.stringify(result, null, 2);
  }

  if (name === 'ecom_get_tracking_info') {
    if (!fulfillmentService) {
      return JSON.stringify({
        error: 'BridgeFulfillmentService chưa sẵn sàng. Vui lòng kiểm tra cấu hình tài khoản Nhanh và các sàn.',
      });
    }
    const result = await fulfillmentService.getTrackingInfoByNhanhId(args.nhanhOrderId);
    return JSON.stringify(result, null, 2);
  }

  // --- CÁC TOOL PRINT UTILS HIỆN CÓ ---
  if (name === 'ecom_check_print_eligibility') {
    if (!helper || !helper.isOrderPrintable) {
      return JSON.stringify({ error: 'Helper module isOrderPrintable not loaded. Please build the project.' });
    }
    const candidate = {
      source: args.source,
      platformStatus: args.platformStatus,
      trackingNumber: args.trackingNumber,
      packageId: args.packageId,
      packageStatus: args.packageStatus,
      logisticsStatus: args.logisticsStatus,
      carrierCode: args.carrierCode
    };
    const options = {
      allowReprint: Boolean(args.allowReprint)
    };
    const result = helper.isOrderPrintable(candidate, options);
    return JSON.stringify(result, null, 2);
  }

  if (name === 'ecom_chunk_shopee_orders') {
    if (!helper || !helper.chunkShopeePrintOrders) {
      return JSON.stringify({ error: 'Helper module not loaded.' });
    }
    const chunks = helper.chunkShopeePrintOrders(args.orderSns || [], args.maxPerBatch || 50);
    return JSON.stringify({
      totalOrders: (args.orderSns || []).length,
      totalBatches: chunks.length,
      batches: chunks
    }, null, 2);
  }

  if (name === 'ecom_dedupe_tiktok_packages') {
    const list = (args.packageIds || []).map(id => ({ packageId: id }));
    const deduped = helper && helper.dedupeTiktokPackages ? helper.dedupeTiktokPackages(list) : list;
    return JSON.stringify({
      originalCount: (args.packageIds || []).length,
      dedupedCount: deduped.length,
      packageIds: deduped.map(item => item.packageId || item)
    }, null, 2);
  }

  if (name === 'ecom_list_platforms') {
    return JSON.stringify({
      sdk: 'e-com-api v4.2.0',
      supported_platforms: [
        {
          code: 'SHOPEE',
          name: 'Shopee Open Platform v2',
          modules: ['order', 'logistic', 'product', 'return-refund'],
          shipping_document: 'Async create_shipping_document + polling get_result + download_shipping_document (PDF / ZIP / HTML / Thermal)'
        },
        {
          code: 'TIKTOK',
          name: 'TikTok Shop Partner API',
          modules: ['fulfillment', 'order', 'product'],
          shipping_document: 'Direct PDF URL (getPackageShippingDocument) for AWAITING_COLLECTION orders'
        },
        {
          code: 'NHANH',
          name: 'Nhanh.vn Open API',
          modules: ['order', 'shipping'],
          shipping_document: 'Raw bill data, rendered via backend PDF template (pdfkit / bwip-js)'
        },
        {
          code: 'LAZADA',
          name: 'Lazada Open Platform',
          modules: ['order', 'logistic']
        },
        {
          code: 'HARAVAN',
          name: 'Haravan API',
          modules: ['order', 'carrier']
        }
      ]
    }, null, 2);
  }

  if (name === 'ecom_platform_print_specs') {
    return JSON.stringify({
      tiktok: {
        allowed_statuses: ['111 (AWAITING_COLLECTION)', '114 (PARTIALLY_SHIPPING)'],
        reprint_status: '121 (IN_TRANSIT)',
        api: 'POST /fulfillment/202309/packages/{package_id}/shipping_documents',
        output_format: 'Direct doc_url (PDF)',
        rate_limit: 'Per-shop rate limit 20 QPS'
      },
      shopee: {
        allowed_statuses: ['READY_TO_SHIP', 'PROCESSED'],
        reprint_status: 'SHIPPED',
        api_flow: '1. create_shipping_document -> 2. get_shipping_document_result -> 3. download_shipping_document',
        output_format: 'PDF binary hoặc ZIP nén HTML / ZPL',
        max_batch_size: 50
      },
      nhanh: {
        allowed_statuses: ['56 (CONFIRMED)', '4 (PACKED)'],
        reprint_status: '6 (PICKEDUP / IN_TRANSIT)',
        requirement: 'Cần có carrierCode hoặc nhanh_app_order_id',
        output_format: 'Dữ liệu thô, backend tự render PDF A6'
      }
    }, null, 2);
  }

  return JSON.stringify({ error: `Tool ${name} not found` });
}

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function startServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  console.error('[e-com-api-mcp] Server started (stdio mode)');

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let req;
    try {
      req = JSON.parse(trimmed);
    } catch (err) {
      console.error('[e-com-api-mcp] Invalid JSON:', err);
      return;
    }

    const { id, method, params } = req;

    if (method === 'initialize') {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'e-com-api-mcp',
            version: '1.0.0'
          }
        }
      });
    } else if (method === 'notifications/initialized') {
      console.error('[e-com-api-mcp] Client initialized');
    } else if (method === 'ping') {
      sendResponse({ jsonrpc: '2.0', id, result: {} });
    } else if (method === 'tools/list') {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS }
      });
    } else if (method === 'tools/call') {
      try {
        const outputText = await handleToolCall(params?.name, params?.arguments || {});
        sendResponse({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              { type: 'text', text: outputText }
            ]
          }
        });
      } catch (err) {
        console.error('[e-com-api-mcp] Execution error:', err);
        sendResponse({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              { type: 'text', text: `Tool error: ${err.message}` }
            ],
            isError: true
          }
        });
      }
    } else {
      if (id !== undefined) {
        sendResponse({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method '${method}' not found` }
        });
      }
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  TOOLS,
  handleToolCall,
  setOrderService,
  setFulfillmentService,
};
