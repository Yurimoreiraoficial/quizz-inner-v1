/**
 * Serviço para disparo do Meta Pixel (Facebook).
 */
import { loadFunnel } from "./funnelService";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let pixelInitialized = false;

/**
 * Inicializa o script do Meta Pixel se houver um Pixel ID configurado.
 */
export async function initMetaPixel() {
  if (pixelInitialized || typeof window === "undefined") return;

  const { remote } = await loadFunnel();
  const pixelId = remote?.meta_pixel_id as string;

  if (!pixelId) return;

  // Script padrão do Facebook Pixel
  (function(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  pixelInitialized = true;
  console.log(`[Meta Pixel] Initialized with ID: ${pixelId}`);
}

/**
 * Dispara um evento do Meta Pixel baseado na configuração da tela.
 * @param screen A tela atual do funil.
 * @param trigger O gatilho que disparou a chamada (view, click, answer, submit, etc).
 */
export function triggerMetaPixel(screen: any, trigger: string) {
  if (typeof window === "undefined" || !window.fbq) return;

  const config = screen?.content?.metaEventConfig;
  if (!config) return;

  // Verifica se o gatilho da tela coincide com o gatilho da ação
  if (config.trigger === trigger) {
    const eventName = config.metaEvent === "Evento customizado" 
      ? config.customEventName 
      : config.metaEvent;

    if (eventName && eventName !== "Sem evento") {
      const isStandard = [
        "PageView", "ViewContent", "Search", "AddToCart", 
        "AddToWishlist", "InitiateCheckout", "AddPaymentInfo", 
        "Purchase", "Lead", "CompleteRegistration", "Contact", 
        "CustomizeProduct", "Donate", "FindLocation", "Schedule", 
        "StartTrial", "SubmitApplication", "Subscribe"
      ].includes(eventName);

      if (isStandard) {
        window.fbq('track', eventName);
      } else {
        window.fbq('trackCustom', eventName);
      }
      console.log(`[Meta Pixel] Fired event: ${eventName} (Trigger: ${trigger})`);
    }
  }
}
