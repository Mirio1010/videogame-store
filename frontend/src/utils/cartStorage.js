const LEGACY_CART_STORAGE_KEY = "cart";
const GUEST_CART_STORAGE_KEY = "cart:guest";

function getCartStorageKey(user) {
  if (user?.id) {
    return `cart:user:${user.id}`;
  }
  return GUEST_CART_STORAGE_KEY;
}

function parseCart(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLegacyGuestCart() {
  const legacyCart = parseCart(localStorage.getItem(LEGACY_CART_STORAGE_KEY));
  if (legacyCart.length > 0) {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(legacyCart));
  }
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  return legacyCart;
}

export function readCart(user) {
  const key = getCartStorageKey(user);
  const raw = localStorage.getItem(key);

  if (!raw && key === GUEST_CART_STORAGE_KEY) {
    return readLegacyGuestCart();
  }

  return parseCart(raw);
}

export function writeCart(user, cartItems) {
  const key = getCartStorageKey(user);
  localStorage.setItem(key, JSON.stringify(cartItems));
}

export function addGameToCart(user, game) {
  const cart = readCart(user);
  const existing = cart.find((item) => item.id === game.id);

  if (existing) {
    const updated = cart.map((item) =>
      item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
    );
    writeCart(user, updated);
    return;
  }

  writeCart(user, [
    ...cart,
    {
      id: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
      quantity: 1,
    },
  ]);
}
