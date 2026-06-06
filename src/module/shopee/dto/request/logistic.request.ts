interface RequestShipOrder {
  order_sn: string;
  package_number?: string;
  pickup?: {
    address_id: number;
    pickup_time_id?: string;
    tracking_number?: string;
  };
  dropoff?: {
    branch_id?: number;
    sender_real_name?: string;
    slug?: string;
  };
  non_integrated?: {
    tracking_number?: string;
  };
}

interface RequestDownloadShippingDocumentOrder {
  order_sn: string;
  package_number?: string;
}

interface RequestDownloadShippingDocument {
  shipping_document_type?: string;
  order_list: RequestDownloadShippingDocumentOrder[];
}

interface RequestCreateShippingDocumentOrder {
  order_sn: string;
  package_number?: string;
  tracking_number?: string;
  shipping_document_type?: string;
}

interface RequestCreateShippingDocument {
  order_list: RequestCreateShippingDocumentOrder[];
}

export { RequestShipOrder as ShopeeRequestShipOrder };
export {
  RequestCreateShippingDocument as ShopeeRequestCreateShippingDocument,
  RequestCreateShippingDocumentOrder as ShopeeRequestCreateShippingDocumentOrder,
  RequestDownloadShippingDocument as ShopeeRequestDownloadShippingDocument,
  RequestDownloadShippingDocumentOrder as ShopeeRequestDownloadShippingDocumentOrder,
};
