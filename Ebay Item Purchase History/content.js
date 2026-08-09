// content.js
// Adds a "Price history" button below the "Add to cart" button with localized text

(function () {
  // Translation map for various eBay domains
  const translations = {
    "ebay.com": "Price history",
    "ebay.co.uk": "Price history",
    "ebay.com.au": "Price history",
    "ebay.ca": "Price history",
    "ebay.de": "Preisverlauf",
    "ebay.fr": "Historique des prix",
    "ebay.it": "Storico prezzi",
    "ebay.es": "Historial de precios",
    "ebay.nl": "Prijsgeschiedenis",
    "ebay.pl": "Historia cen",
    "ebay.com.br": "Histórico de preços",
    "ebay.co.jp": "価格履歴",
    "ebay.ru": "История cen",
    "ebay.at": "Preisverlauf",
    "ebay.ch": "Preisverlauf",
    "ebay.be": "Historique des prix",
    "ebay.ie": "Price history",
    // More domains can be added
  };

  // Function to get localized button text safely matching domain suffixes
  const getLocalizedText = (hostname) => {
    const match = Object.keys(translations).find(domain => hostname.endsWith(domain));
    return match ? translations[match] : "Price history";
  };

  // Function to find the buybox element
  function getBuyboxElement({ throwOnFail = false } = {}) {
    const selectors = [
      '[data-testid="x-buybox-cta"] ul', // targets the ul inside the modern buybox div
      '.x-buybox-cta ul',                 // fallback for class wrapper
      'ul[data-testid="x-buybox-cta"]',   // legacy fallback
      'ul.x-buybox-cta.mar-t-20'          // legacy fallback
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.debug(`[Addon] Found buybox using selector: '${selector}'`);
        return element;
      }
    }

    console.warn('[Addon] Buybox element not found!');

    if (throwOnFail) {
      throw new Error('Buybox element not found!');
    }

    return null;
  }

  // Function to add the "Price history" button
  const addPriceHistoryButton = () => {
    const buybox = getBuyboxElement();
    if (!buybox) {
      return;
    }

    // Check if the button already exists
    if (buybox.querySelector('.historyButton')) return;

    const url = new URL(window.location.href);
    const itemNumber = url.pathname.match(/\/itm\/([^/?]+)/)?.[1];
    if (!itemNumber) return;

    const localizedText = getLocalizedText(url.hostname);
    const purchaseHistoryURL = `https://${url.hostname}/bin/purchaseHistory?item=${itemNumber}`;

    // Create the new button
    const historyLink = document.createElement("a");
    historyLink.href = purchaseHistoryURL;
    historyLink.target = "_blank";
    historyLink.rel = "noopener noreferrer";
    historyLink.classList.add(
      "ux-call-to-action",
      "fake-btn",
      "fake-btn--fluid",
      "fake-btn--large",
      "fake-btn--secondary",
      "historyButton"
    );

    const buttonContent = document.createElement('span');
    buttonContent.className = 'ux-call-to-action__cell';

    const buttonText = document.createElement('span');
    buttonText.className = 'ux-call-to-action__text';
    buttonText.textContent = localizedText;

    buttonContent.appendChild(buttonText);
    historyLink.appendChild(buttonContent);

    // Insert the button into the buybox
    const historyListItem = document.createElement("li");
    const historyDiv = document.createElement("div");
    historyDiv.classList.add("vim", "x-history-action", "overlay-placeholder");
    historyDiv.appendChild(historyLink);
    historyListItem.appendChild(historyDiv);
    buybox.appendChild(historyListItem);
  };


  // Set up a MutationObserver to support dynamically loaded pages
  const observeDOM = () => {
    addPriceHistoryButton();

    const observer = new MutationObserver(() => addPriceHistoryButton());
    observer.observe(document.body, { childList: true, subtree: true });
  };

  // Initialize when the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeDOM);
  } else {
    observeDOM();
  }
})();