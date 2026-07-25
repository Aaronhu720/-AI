import { Capacitor } from '@capacitor/core';

const PRODUCT_ID = 'com.aaronusa.xiaoran.premium.monthly';

declare global {
  interface Window {
    CdvPurchase?: any;
  }
}

let storeReady = false;
let initPromise: Promise<void> | null = null;

function getStore() {
  return window.CdvPurchase?.store;
}

export function isNative() {
  return Capacitor.isNativePlatform();
}

export async function initIAP(): Promise<void> {
  if (!isNative()) return;
  if (storeReady) return;
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve) => {
    const check = () => {
      const store = getStore();
      if (!store) {
        setTimeout(check, 200);
        return;
      }
      const CdvPurchase = window.CdvPurchase;

      store.register([{
        id: PRODUCT_ID,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      }]);

      store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]).then(() => {
        storeReady = true;
        resolve();
      });
    };
    check();
  });

  return initPromise;
}

export function getProduct() {
  const store = getStore();
  if (!store) return null;
  return store.get(PRODUCT_ID) || null;
}

export async function purchase(): Promise<boolean> {
  const store = getStore();
  if (!store) return false;

  const product = store.get(PRODUCT_ID);
  if (!product) return false;

  const offer = product.getOffer();
  if (!offer) return false;

  try {
    await store.order(offer);
    return true;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const store = getStore();
  if (!store) return false;

  try {
    await store.restorePurchases();
    return true;
  } catch {
    return false;
  }
}

export function onPurchaseApproved(callback: (receipt: string) => void) {
  const store = getStore();
  if (!store) return;

  store.when()
    .approved((transaction: any) => {
      const receipt = transaction.nativePurchase?.appStoreReceipt;
      if (receipt) {
        callback(receipt);
      }
      transaction.verify();
    })
    .verified((receipt: any) => {
      receipt.finish();
    });
}
