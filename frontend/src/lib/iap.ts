import { Capacitor } from '@capacitor/core';

export const MONTHLY_ID = 'com.aaronusa.xiaoran.premium.monthly';
export const YEARLY_ID = 'com.aaronusa.xiaoran.premium.yearly';

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

      store.register([
        {
          id: MONTHLY_ID,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: CdvPurchase.Platform.APPLE_APPSTORE,
        },
        {
          id: YEARLY_ID,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: CdvPurchase.Platform.APPLE_APPSTORE,
        },
      ]);

      store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]).then(() => {
        storeReady = true;
        resolve();
      });
    };
    check();
  });

  return initPromise;
}

export function getProduct(productId: string) {
  const store = getStore();
  if (!store) return null;
  return store.get(productId) || null;
}

export async function purchase(productId: string): Promise<boolean> {
  const store = getStore();
  if (!store) return false;

  const product = store.get(productId);
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
