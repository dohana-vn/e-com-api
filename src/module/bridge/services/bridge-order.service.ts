import { ShopeeModule } from '../../shopee';
import { TiktokModule } from '../../tiktokshops';
import { BridgeOrderDetailResult, BridgeOrderItem } from '../dto/order.dto';
import { OrderIdentifierService } from './order-identifier.service';

export interface BridgeOrderServiceDependencies {
  identifierService: OrderIdentifierService;
  shopee?: ShopeeModule;
  tiktok?: TiktokModule;
}

export class BridgeOrderService {
  private identifier: OrderIdentifierService;
  private shopee?: ShopeeModule;
  private tiktok?: TiktokModule;

  constructor(deps: BridgeOrderServiceDependencies) {
    this.identifier = deps.identifierService;
    this.shopee = deps.shopee;
    this.tiktok = deps.tiktok;
  }

  setShopeeModule(shopee: ShopeeModule) {
    this.shopee = shopee;
  }

  setTiktokModule(tiktok: TiktokModule) {
    this.tiktok = tiktok;
  }

  /**
   * Mảng 1: Lấy chi tiết đơn hàng (Sản phẩm, số lượng, tiền, địa chỉ)
   */
  async getOrderDetailByNhanhId(nhanhOrderId: string | number): Promise<BridgeOrderDetailResult> {
    const meta = await this.identifier.identifyPlatformOrder(nhanhOrderId);

    if (meta.platform === 'SHOPEE') {
      if (!this.shopee) {
        throw new Error('ShopeeModule chưa được cấu hình để truy vấn chi tiết đơn Shopee.');
      }
      const shopeeData = await this.shopee.getOrderDetail(meta.platformOrderId);
      const order = (shopeeData as any)?.response?.order_list?.[0] || (shopeeData as any)?.response || shopeeData;

      const items: BridgeOrderItem[] = (order?.item_list || []).map((it: any) => ({
        itemName: it.item_name,
        modelName: it.model_name,
        skuName: it.item_sku || it.model_sku,
        quantity: it.model_quantity_purchased ?? it.order_quantity ?? 1,
        price: it.model_discounted_price ?? it.model_original_price ?? 0,
      }));

      const recipient = order?.recipient_address;
      const recipientAddress = recipient?.full_address || [
        recipient?.address,
        recipient?.district,
        recipient?.city
      ].filter(Boolean).join(', ');

      return {
        source: 'SHOPEE',
        channelName: meta.channelName,
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        orderStatus: order?.order_status,
        totalAmount: order?.total_amount,
        shippingCarrier: order?.shipping_carrier,
        recipientAddress,
        items,
        rawResponse: order,
      };
    }

    if (meta.platform === 'TIKTOK') {
      if (!this.tiktok) {
        throw new Error('TiktokModule chưa được cấu hình để truy vấn chi tiết đơn TikTok Shop.');
      }
      const tiktokData = await this.tiktok.getOrderDetail(meta.platformOrderId);
      const order = (tiktokData as any)?.data?.orders?.[0] || (tiktokData as any)?.data || tiktokData;

      const items: BridgeOrderItem[] = (order?.line_items || []).map((it: any) => ({
        itemName: it.product_name,
        skuName: it.sku_name || it.seller_sku,
        quantity: it.quantity ?? 1,
        price: Number(it.sale_price ?? it.original_price ?? 0),
      }));

      if (!meta.platformPackageId && order?.packages?.[0]?.id) {
        meta.platformPackageId = order.packages[0].id;
      }

      return {
        source: 'TIKTOK',
        channelName: meta.channelName,
        nhanhOrderId: meta.nhanhOrderId,
        platformOrderId: meta.platformOrderId,
        orderStatus: order?.status || order?.order_status,
        totalAmount: order?.payment_info?.total_amount,
        shippingCarrier: order?.delivery_option_name || order?.shipping_provider,
        recipientAddress: order?.recipient_address?.full_address,
        items,
        rawResponse: order,
      };
    }

    // Đơn nội bộ Nhanh
    const nhanhOrder = meta.rawNhanhOrder;
    const items: BridgeOrderItem[] = (nhanhOrder?.products || []).map((p: any) => ({
      itemName: p.name,
      skuName: p.code,
      quantity: p.quantity,
      price: p.price,
    }));

    return {
      source: 'NHANH',
      channelName: meta.channelName,
      nhanhOrderId: meta.nhanhOrderId,
      platformOrderId: meta.platformOrderId,
      orderStatus: String(nhanhOrder?.info?.status ?? ''),
      totalAmount: nhanhOrder?.payment?.codAmount,
      shippingCarrier: nhanhOrder?.carrier?.name,
      recipientAddress: nhanhOrder?.shippingAddress?.address,
      items,
      rawResponse: nhanhOrder,
    };
  }
}
