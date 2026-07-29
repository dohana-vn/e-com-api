const END_POINT = 'https://nhanh.vn';
const V3_END_POINT = 'https://pos.open.nhanh.vn/v3.0';

enum PATH {
  AUTHORIZED_SHOP = '/app/getaccesstoken',
  GENERATE_AUTH_LINK = '/oauth',
  PRODUCT_LIST = '/product/list',
  ORDER_LIST = '/order/list',
}

export {
  PATH as NHANH_PATH,
  END_POINT as NHANH_END_POINT,
  V3_END_POINT as NHANH_V3_END_POINT,
};
