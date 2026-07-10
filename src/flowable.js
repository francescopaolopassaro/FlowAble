/*!
 * FlowAble — standalone accessibility toolbar
 * Zero dependencies (no jQuery/Bootstrap/server data). Safe to extract as-is
 * into its own open-source package.
 *
 * Namespace: CSS vars --flowable-*, state classes flowable-* on <html>,
 * localStorage key 'flowable-settings'.
 *
 * Author: Passaro Francesco Paolo - https://www.digitalsolutions.it
 *
 * License: free to use for any business or personal purpose. You may not
 * modify the source code or copy/redistribute it separately from this
 * project. All rights reserved by the author.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'flowable-settings';
  var HIDE_KEY = 'flowable-hidden-until';
  var CSS_HREF = '/css/flowable.css';

  // Host pages may set window.FlowAbleConfig = { lang: 'fr' } BEFORE this
  // script runs to pick an initial UI language. FlowAble never reads the
  // host page's own language/culture (e.g. document.documentElement.lang) —
  // it stays fully independent so it behaves identically on any site.
  var externalConfig = window.FlowAbleConfig || {};

  // Full language list (flag + native name), used both for the panel
  // language selector and for picking a speech-synthesis voice/locale.
  var LANGUAGES = [
    { code: 'it', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italiano', bcp47: 'it-IT' },
    { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', name: 'English', bcp47: 'en-US' },
    { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', name: 'Français', bcp47: 'fr-FR' },
    { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', name: 'Deutsch', bcp47: 'de-DE' },
    { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', name: 'Español', bcp47: 'es-ES' },
    { code: 'pt', flag: '\u{1F1F5}\u{1F1F9}', name: 'Português', bcp47: 'pt-PT' },
    { code: 'ru', flag: '\u{1F1F7}\u{1F1FA}', name: 'Русский', bcp47: 'ru-RU' },
    { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', name: '中文', bcp47: 'zh-CN' },
    { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', name: 'العربية', bcp47: 'ar-SA' },
    { code: 'ja', flag: '\u{1F1EF}\u{1F1F5}', name: '日本語', bcp47: 'ja-JP' },
    { code: 'ko', flag: '\u{1F1F0}\u{1F1F7}', name: '한국어', bcp47: 'ko-KR' },
    { code: 'nl', flag: '\u{1F1F3}\u{1F1F1}', name: 'Nederlands', bcp47: 'nl-NL' },
    { code: 'pl', flag: '\u{1F1F5}\u{1F1F1}', name: 'Polski', bcp47: 'pl-PL' },
    { code: 'tr', flag: '\u{1F1F9}\u{1F1F7}', name: 'Türkçe', bcp47: 'tr-TR' },
    { code: 'sv', flag: '\u{1F1F8}\u{1F1EA}', name: 'Svenska', bcp47: 'sv-SE' },
    { code: 'da', flag: '\u{1F1E9}\u{1F1F0}', name: 'Dansk', bcp47: 'da-DK' },
    { code: 'fi', flag: '\u{1F1EB}\u{1F1EE}', name: 'Suomi', bcp47: 'fi-FI' },
    { code: 'no', flag: '\u{1F1F3}\u{1F1F4}', name: 'Norsk', bcp47: 'no-NO' },
    { code: 'el', flag: '\u{1F1EC}\u{1F1F7}', name: 'Ελληνικά', bcp47: 'el-GR' },
    { code: 'cs', flag: '\u{1F1E8}\u{1F1FF}', name: 'Čeština', bcp47: 'cs-CZ' },
    { code: 'hu', flag: '\u{1F1ED}\u{1F1FA}', name: 'Magyar', bcp47: 'hu-HU' },
    { code: 'ro', flag: '\u{1F1F7}\u{1F1F4}', name: 'Română', bcp47: 'ro-RO' },
    { code: 'uk', flag: '\u{1F1FA}\u{1F1E6}', name: 'Українська', bcp47: 'uk-UA' },
    { code: 'he', flag: '\u{1F1EE}\u{1F1F1}', name: 'עברית', bcp47: 'he-IL' },
    { code: 'hi', flag: '\u{1F1EE}\u{1F1F3}', name: 'हिन्दी', bcp47: 'hi-IN' },
    { code: 'th', flag: '\u{1F1F9}\u{1F1ED}', name: 'ไทย', bcp47: 'th-TH' },
    { code: 'vi', flag: '\u{1F1FB}\u{1F1F3}', name: 'Tiếng Việt', bcp47: 'vi-VN' },
    { code: 'id', flag: '\u{1F1EE}\u{1F1E9}', name: 'Bahasa Indonesia', bcp47: 'id-ID' },
    { code: 'ms', flag: '\u{1F1F2}\u{1F1FE}', name: 'Bahasa Melayu', bcp47: 'ms-MY' },
    { code: 'bg', flag: '\u{1F1E7}\u{1F1EC}', name: 'Български', bcp47: 'bg-BG' },
    { code: 'sk', flag: '\u{1F1F8}\u{1F1F0}', name: 'Slovenčina', bcp47: 'sk-SK' },
    { code: 'hr', flag: '\u{1F1ED}\u{1F1F7}', name: 'Hrvatski', bcp47: 'hr-HR' },
    { code: 'sr', flag: '\u{1F1F7}\u{1F1F8}', name: 'Српски', bcp47: 'sr-RS' },
    { code: 'lt', flag: '\u{1F1F1}\u{1F1F9}', name: 'Lietuvių', bcp47: 'lt-LT' },
    { code: 'lv', flag: '\u{1F1F1}\u{1F1FB}', name: 'Latviešu', bcp47: 'lv-LV' },
    { code: 'et', flag: '\u{1F1EA}\u{1F1EA}', name: 'Eesti', bcp47: 'et-EE' }
  ];

  var FONT_STEPS = ['flowable-font-1', 'flowable-font-2', 'flowable-font-3'];
  var LINE_STEPS = ['flowable-line-1', 'flowable-line-2', 'flowable-line-3'];

  var defaultState = {
    uiLang: null,
    fontStep: 0,
    lineStep: 0,
    letterSpacing: false,
    bold: false,
    readableFont: false,
    dyslexicFont: false,
    highlightLinks: false,
    highlightTitles: false,
    highlightAll: false,
    alignText: null,
    bigCursor: false,
    textMagnifier: false,
    magnifierSpeak: false,
    contrast: null,
    monochrome: false,
    desaturate: false,
    readingLine: false,
    readingMask: false,
    keyboardNav: false,
    hideImages: false,
    muteSounds: false,
    stopAnimations: false,
    virtualKeyboard: false,
    kbLargeKeys: false
  };

  var state = loadState();
  var isOpen = false;
  var isSpeaking = false;
  var isPaused = false;
  // Chrome garbage-collects a SpeechSynthesisUtterance that has no
  // surviving reference, which silently cuts speech off after the
  // first word or two. Keeping this module-level reference alive
  // for the duration of playback avoids that.
  var currentUtterance = null;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, defaultState);
      var parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed);
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function isHiddenNow() {
    try {
      var until = parseInt(localStorage.getItem(HIDE_KEY) || '0', 10);
      return until > Date.now();
    } catch (e) { return false; }
  }

  // ---------------------------------------------------------------
  // Styles injection
  // ---------------------------------------------------------------
  function injectStyles() {
    if (document.querySelector('link[data-flowable]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    link.setAttribute('data-flowable', '1');
    document.head.appendChild(link);
  }

  // ---------------------------------------------------------------
  // Icons (inline SVG, single-color / currentColor friendly)
  // ---------------------------------------------------------------
  var ICONS = {
    logo: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4C13 4 4 12.5 4 23c0 6.5 4 12 9.5 15" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M24 44c11 0 20-8.5 20-19 0-6.5-4-12-9.5-15" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="5" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>',
    fontSize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 18l4-12 4 12M5.5 14h5"/><path d="M14 18l3-8 3 8M14.7 15.5h4.6"/></svg>',
    lineHeight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
    letterSpacing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4v16M20 4v16"/><path d="M9 12h6"/></svg>',
    bold: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h6a4 4 0 0 1 3 6.7A4.5 4.5 0 0 1 13 20H6V4zm3 2.5v4.5h3a2.25 2.25 0 0 0 0-4.5H9zm0 7v4h3.5a2 2 0 0 0 0-4H9z"/></svg>',
    font: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 20h6M8 4l6 16M14 20h5M13 8h6"/></svg>',
    dyslexic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 18c3-10 6-10 8 0M4 8h4M14 4v14M14 8h6"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 15l6-6"/><path d="M10 6l1-1a4 4 0 1 1 6 6l-1 1"/><path d="M14 18l-1 1a4 4 0 1 1-6-6l1-1"/></svg>',
    title: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h10M4 18h16"/></svg>',
    align: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3l14 8-6 2-2 6z"/></svg>',
    magnifier: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6"/><line x1="20" y1="20" x2="14.5" y2="14.5"/></svg>',
    contrastDark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></svg>',
    contrastLight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
    contrastHigh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18" fill="currentColor"/></svg>',
    monochrome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 1 0 0 18" fill="currentColor" stroke="none"/></svg>',
    saturation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z"/></svg>',
    readingLine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>',
    readingMask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="6" fill="currentColor" stroke="none" opacity=".5"/><rect x="2" y="16" width="20" height="6" fill="currentColor" stroke="none" opacity=".5"/></svg>',
    tts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>',
    hideImages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="19" x2="21" y2="5"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><line x1="17" y1="8" x2="23" y2="16"/><line x1="23" y1="8" x2="17" y2="16"/></svg>',
    stopAnim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none"/></svg>',
    goto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4v6h6M20 20v-6h-6"/><path d="M5.5 15a8 8 0 0 0 13.9 2.5M18.5 9A8 8 0 0 0 4.6 6.5"/></svg>',
    keyboardVirtual: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h12"/></svg>'
  };

  // ---------------------------------------------------------------
  // Presets
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // i18n — FlowAble owns its UI language independently of the host
  // page. It is never told the language by the host site/server;
  // it defaults from the browser's own locale and can be switched
  // from the panel itself, storing the choice in its own settings.
  // ---------------------------------------------------------------
  var T = {
    it: {
      brand: 'FlowAble', close: 'Chiudi', panelAriaLabel: 'Pannello accessibilità FlowAble',
      toggleAriaLabel: 'Apri pannello accessibilità FlowAble',
      presetsTitle: 'Profili rapidi', presetPlaceholder: 'Scegli un profilo…',
      presetVisionImpaired: 'Ipovisione', presetSeizureSafe: 'Anti-epilessia', presetAdhd: 'ADHD friendly',
      presetBlindness: 'Cecità', presetEpilepsySafe: 'Epilessia sicura',
      textTitle: 'Testo', fontSize: 'Dimensione testo', lineHeight: 'Altezza riga',
      decrease: 'Diminuisci', increase: 'Aumenta',
      letterSpacing: 'Spaziatura', bold: 'Grassetto', readableFont: 'Font leggibile', dyslexicFont: 'Font dislessia',
      highlightLinks: 'Evidenzia link', highlightTitles: 'Evidenzia titoli', highlightAll: 'Evidenzia tutto',
      alignText: 'Allinea testo', bigCursor: 'Cursore grande', textMagnifier: 'Lente testo',
      magnifierSpeak: 'Lente + lettura parola',
      colorTitle: 'Colore', contrastDark: 'Contrasto scuro', contrastLight: 'Contrasto chiaro',
      contrastHigh: 'Alto contrasto', monochrome: 'Monocromatico', desaturate: 'Desatura',
      orientationTitle: 'Orientamento e lettura', readingLine: 'Linea di lettura', readingMask: 'Maschera di lettura',
      readPage: 'Leggi la pagina', keyboardNav: 'Navigazione tastiera', hideImages: 'Nascondi immagini',
      muteSounds: 'Disattiva suoni', stopAnimations: 'Ferma animazioni',
      gotoTitle: 'Vai a', gotoPlaceholder: 'Salta a…', gotoMain: 'Contenuto principale', gotoMenu: 'Menu', gotoFooter: 'Footer',
      otherTitle: 'Altro', virtualKeyboard: 'Tastiera virtuale', kbLargeKeys: 'Ingrandisci i tasti', hideToolbarPlaceholder: 'Nascondi toolbar…',
      hideSession: 'Per questa sessione', hide24h: 'Per 24 ore', hideWeek: 'Per una settimana',
      resetBtn: 'Reimposta impostazioni', statementBack: '← Indietro', statementTitle: 'Dichiarazione di accessibilità',
      statementP1: 'FlowAble è una toolbar di accessibilità eseguita interamente nel browser: nessun dato di navigazione viene inviato a server esterni per applicare queste impostazioni, che restano salvate solo sul tuo dispositivo.',
      statementP2: 'Se riscontri difficoltà di accesso a una parte del sito, scrivici tramite la pagina Contatti: faremo il possibile per risolvere il problema.',
      statementLink: 'Dichiarazione di accessibilità',
      aboutTitle: 'Informazioni su FlowAble',
      aboutText: 'FlowAble è una libreria sviluppata da Passaro Francesco Paolo — DigitalSolutions.it. Libera e gratuita per qualsiasi utilizzo, aziendale o privato.',
      footerCredit: 'Sviluppato da Passaro Francesco Paolo · DigitalSolutions.it · Gratuito per tutti'
    },
    en: {
      brand: 'FlowAble', close: 'Close', panelAriaLabel: 'FlowAble accessibility panel',
      toggleAriaLabel: 'Open FlowAble accessibility panel',
      presetsTitle: 'Quick profiles', presetPlaceholder: 'Choose a profile…',
      presetVisionImpaired: 'Vision impaired', presetSeizureSafe: 'Seizure safe', presetAdhd: 'ADHD friendly',
      presetBlindness: 'Blindness', presetEpilepsySafe: 'Epilepsy safe',
      textTitle: 'Text', fontSize: 'Font size', lineHeight: 'Line height',
      decrease: 'Decrease', increase: 'Increase',
      letterSpacing: 'Letter spacing', bold: 'Bold', readableFont: 'Readable font', dyslexicFont: 'Dyslexia font',
      highlightLinks: 'Highlight links', highlightTitles: 'Highlight titles', highlightAll: 'Highlight everything',
      alignText: 'Align text', bigCursor: 'Big cursor', textMagnifier: 'Text magnifier',
      magnifierSpeak: 'Magnifier + word reading',
      colorTitle: 'Color', contrastDark: 'Dark contrast', contrastLight: 'Light contrast',
      contrastHigh: 'High contrast', monochrome: 'Monochrome', desaturate: 'Desaturate',
      orientationTitle: 'Orientation & reading', readingLine: 'Reading line', readingMask: 'Reading mask',
      readPage: 'Read page', keyboardNav: 'Keyboard navigation', hideImages: 'Hide images',
      muteSounds: 'Mute sounds', stopAnimations: 'Stop animations',
      gotoTitle: 'Go to', gotoPlaceholder: 'Jump to…', gotoMain: 'Main content', gotoMenu: 'Menu', gotoFooter: 'Footer',
      otherTitle: 'Other', virtualKeyboard: 'Virtual keyboard', kbLargeKeys: 'Larger keys', hideToolbarPlaceholder: 'Hide toolbar…',
      hideSession: 'For this session', hide24h: 'For 24 hours', hideWeek: 'For a week',
      resetBtn: 'Reset settings', statementBack: '← Back', statementTitle: 'Accessibility statement',
      statementP1: 'FlowAble is an accessibility toolbar that runs entirely in the browser: no browsing data is sent to external servers to apply these settings, which are only saved on your device.',
      statementP2: 'If you run into any accessibility issue on this site, please reach out via the Contact page: we will do our best to fix it.',
      statementLink: 'Accessibility statement',
      aboutTitle: 'About FlowAble',
      aboutText: 'FlowAble is a library developed by Passaro Francesco Paolo — DigitalSolutions.it. Free to use for any purpose, business or personal.',
      footerCredit: 'Developed by Passaro Francesco Paolo · DigitalSolutions.it · Free for everyone'
    },
    fr: {
      brand: 'FlowAble', close: 'Fermer', panelAriaLabel: 'Panneau d’accessibilité FlowAble',
      toggleAriaLabel: 'Ouvrir le panneau d’accessibilité FlowAble',
      presetsTitle: 'Profils rapides', presetPlaceholder: 'Choisir un profil…',
      presetVisionImpaired: 'Malvoyance', presetSeizureSafe: 'Anti-épilepsie', presetAdhd: 'TDAH',
      presetBlindness: 'Cécité', presetEpilepsySafe: 'Épilepsie sûre',
      textTitle: 'Texte', fontSize: 'Taille du texte', lineHeight: 'Hauteur de ligne',
      decrease: 'Diminuer', increase: 'Augmenter',
      letterSpacing: 'Espacement', bold: 'Gras', readableFont: 'Police lisible', dyslexicFont: 'Police dyslexie',
      highlightLinks: 'Surligner les liens', highlightTitles: 'Surligner les titres', highlightAll: 'Tout surligner',
      alignText: 'Aligner le texte', bigCursor: 'Grand curseur', textMagnifier: 'Loupe de texte',
      magnifierSpeak: 'Loupe + lecture du mot',
      colorTitle: 'Couleur', contrastDark: 'Contraste sombre', contrastLight: 'Contraste clair',
      contrastHigh: 'Contraste élevé', monochrome: 'Monochrome', desaturate: 'Désaturer',
      orientationTitle: 'Orientation et lecture', readingLine: 'Ligne de lecture', readingMask: 'Masque de lecture',
      readPage: 'Lire la page', keyboardNav: 'Navigation clavier', hideImages: 'Masquer les images',
      muteSounds: 'Couper le son', stopAnimations: 'Arrêter les animations',
      gotoTitle: 'Aller à', gotoPlaceholder: 'Aller à…', gotoMain: 'Contenu principal', gotoMenu: 'Menu', gotoFooter: 'Pied de page',
      otherTitle: 'Autre', hideToolbarPlaceholder: 'Masquer la barre…',
      hideSession: 'Pour cette session', hide24h: 'Pendant 24 heures', hideWeek: 'Pendant une semaine',
      resetBtn: 'Réinitialiser', statementBack: '← Retour', statementTitle: 'Déclaration d’accessibilité',
      statementP1: 'FlowAble est une barre d’accessibilité qui fonctionne entièrement dans le navigateur : aucune donnée de navigation n’est envoyée à des serveurs externes pour appliquer ces réglages, qui restent enregistrés uniquement sur votre appareil.',
      statementP2: 'Si vous rencontrez une difficulté d’accès sur ce site, contactez-nous via la page Contact : nous ferons le nécessaire pour la résoudre.',
      statementLink: 'Déclaration d’accessibilité'
    },
    de: {
      brand: 'FlowAble', close: 'Schließen', panelAriaLabel: 'FlowAble-Barrierefreiheitspanel',
      toggleAriaLabel: 'FlowAble-Barrierefreiheitspanel öffnen',
      presetsTitle: 'Schnellprofile', presetPlaceholder: 'Profil wählen…',
      presetVisionImpaired: 'Sehbehinderung', presetSeizureSafe: 'Anfallsicher', presetAdhd: 'ADHS-freundlich',
      presetBlindness: 'Blindheit', presetEpilepsySafe: 'Epilepsiesicher',
      textTitle: 'Text', fontSize: 'Textgröße', lineHeight: 'Zeilenhöhe',
      decrease: 'Verringern', increase: 'Erhöhen',
      letterSpacing: 'Buchstabenabstand', bold: 'Fett', readableFont: 'Lesbare Schrift', dyslexicFont: 'Legasthenie-Schrift',
      highlightLinks: 'Links hervorheben', highlightTitles: 'Titel hervorheben', highlightAll: 'Alles hervorheben',
      alignText: 'Text ausrichten', bigCursor: 'Großer Cursor', textMagnifier: 'Textlupe',
      magnifierSpeak: 'Lupe + Wort vorlesen',
      colorTitle: 'Farbe', contrastDark: 'Dunkler Kontrast', contrastLight: 'Heller Kontrast',
      contrastHigh: 'Hoher Kontrast', monochrome: 'Monochrom', desaturate: 'Entsättigen',
      orientationTitle: 'Orientierung & Lesen', readingLine: 'Leselinie', readingMask: 'Lesemaske',
      readPage: 'Seite vorlesen', keyboardNav: 'Tastaturnavigation', hideImages: 'Bilder ausblenden',
      muteSounds: 'Ton stummschalten', stopAnimations: 'Animationen stoppen',
      gotoTitle: 'Gehe zu', gotoPlaceholder: 'Springen zu…', gotoMain: 'Hauptinhalt', gotoMenu: 'Menü', gotoFooter: 'Fußzeile',
      otherTitle: 'Sonstiges', hideToolbarPlaceholder: 'Symbolleiste ausblenden…',
      hideSession: 'Für diese Sitzung', hide24h: 'Für 24 Stunden', hideWeek: 'Für eine Woche',
      resetBtn: 'Einstellungen zurücksetzen', statementBack: '← Zurück', statementTitle: 'Barrierefreiheitserklärung',
      statementP1: 'FlowAble ist eine Barrierefreiheits-Toolbar, die vollständig im Browser läuft: Es werden keine Navigationsdaten an externe Server gesendet, um diese Einstellungen anzuwenden — sie werden nur auf Ihrem Gerät gespeichert.',
      statementP2: 'Falls Sie auf ein Zugänglichkeitsproblem auf dieser Website stoßen, kontaktieren Sie uns über die Kontaktseite: wir werden unser Bestes tun, um es zu beheben.',
      statementLink: 'Barrierefreiheitserklärung'
    },
    es: {
      brand: 'FlowAble', close: 'Cerrar', panelAriaLabel: 'Panel de accesibilidad FlowAble',
      toggleAriaLabel: 'Abrir el panel de accesibilidad FlowAble',
      presetsTitle: 'Perfiles rápidos', presetPlaceholder: 'Elige un perfil…',
      presetVisionImpaired: 'Baja visión', presetSeizureSafe: 'Anti-epilepsia', presetAdhd: 'Amigable con TDAH',
      presetBlindness: 'Ceguera', presetEpilepsySafe: 'Epilepsia segura',
      textTitle: 'Texto', fontSize: 'Tamaño del texto', lineHeight: 'Altura de línea',
      decrease: 'Disminuir', increase: 'Aumentar',
      letterSpacing: 'Espaciado', bold: 'Negrita', readableFont: 'Fuente legible', dyslexicFont: 'Fuente para dislexia',
      highlightLinks: 'Resaltar enlaces', highlightTitles: 'Resaltar títulos', highlightAll: 'Resaltar todo',
      alignText: 'Alinear texto', bigCursor: 'Cursor grande', textMagnifier: 'Lupa de texto',
      magnifierSpeak: 'Lupa + lectura de palabra',
      colorTitle: 'Color', contrastDark: 'Contraste oscuro', contrastLight: 'Contraste claro',
      contrastHigh: 'Alto contraste', monochrome: 'Monocromo', desaturate: 'Desaturar',
      orientationTitle: 'Orientación y lectura', readingLine: 'Línea de lectura', readingMask: 'Máscara de lectura',
      readPage: 'Leer la página', keyboardNav: 'Navegación por teclado', hideImages: 'Ocultar imágenes',
      muteSounds: 'Silenciar sonidos', stopAnimations: 'Detener animaciones',
      gotoTitle: 'Ir a', gotoPlaceholder: 'Saltar a…', gotoMain: 'Contenido principal', gotoMenu: 'Menú', gotoFooter: 'Pie de página',
      otherTitle: 'Otro', hideToolbarPlaceholder: 'Ocultar barra…',
      hideSession: 'Para esta sesión', hide24h: 'Durante 24 horas', hideWeek: 'Durante una semana',
      resetBtn: 'Restablecer ajustes', statementBack: '← Atrás', statementTitle: 'Declaración de accesibilidad',
      statementP1: 'FlowAble es una barra de accesibilidad que se ejecuta enteramente en el navegador: no se envían datos de navegación a servidores externos para aplicar estos ajustes, que solo se guardan en tu dispositivo.',
      statementP2: 'Si encuentras alguna dificultad de acceso en este sitio, escríbenos a través de la página de Contacto: haremos lo posible por resolverlo.',
      statementLink: 'Declaración de accesibilidad'
    },
    pt: {
      brand: 'FlowAble', close: 'Fechar', panelAriaLabel: 'Painel de acessibilidade FlowAble',
      toggleAriaLabel: 'Abrir painel de acessibilidade FlowAble',
      presetsTitle: 'Perfis rápidos', presetPlaceholder: 'Escolha um perfil…',
      presetVisionImpaired: 'Baixa visão', presetSeizureSafe: 'Anti-epilepsia', presetAdhd: 'Amigo do TDAH',
      presetBlindness: 'Cegueira', presetEpilepsySafe: 'Epilepsia segura',
      textTitle: 'Texto', fontSize: 'Tamanho do texto', lineHeight: 'Altura da linha',
      decrease: 'Diminuir', increase: 'Aumentar',
      letterSpacing: 'Espaçamento', bold: 'Negrito', readableFont: 'Fonte legível', dyslexicFont: 'Fonte para dislexia',
      highlightLinks: 'Destacar links', highlightTitles: 'Destacar títulos', highlightAll: 'Destacar tudo',
      alignText: 'Alinhar texto', bigCursor: 'Cursor grande', textMagnifier: 'Lupa de texto',
      magnifierSpeak: 'Lupa + leitura da palavra',
      colorTitle: 'Cor', contrastDark: 'Contraste escuro', contrastLight: 'Contraste claro',
      contrastHigh: 'Alto contraste', monochrome: 'Monocromático', desaturate: 'Dessaturar',
      orientationTitle: 'Orientação e leitura', readingLine: 'Linha de leitura', readingMask: 'Máscara de leitura',
      readPage: 'Ler a página', keyboardNav: 'Navegação por teclado', hideImages: 'Ocultar imagens',
      muteSounds: 'Silenciar sons', stopAnimations: 'Parar animações',
      gotoTitle: 'Ir para', gotoPlaceholder: 'Saltar para…', gotoMain: 'Conteúdo principal', gotoMenu: 'Menu', gotoFooter: 'Rodapé',
      otherTitle: 'Outro', hideToolbarPlaceholder: 'Ocultar barra…',
      hideSession: 'Para esta sessão', hide24h: 'Por 24 horas', hideWeek: 'Por uma semana',
      resetBtn: 'Repor definições', statementBack: '← Voltar', statementTitle: 'Declaração de acessibilidade',
      statementP1: 'FlowAble é uma barra de acessibilidade que funciona inteiramente no navegador: nenhum dado de navegação é enviado a servidores externos para aplicar estas definições, que ficam guardadas apenas no seu dispositivo.',
      statementP2: 'Se encontrar alguma dificuldade de acesso neste site, contacte-nos através da página de Contactos: faremos o possível para resolver o problema.',
      statementLink: 'Declaração de acessibilidade'
    },
    ru: {
      brand: 'FlowAble', close: 'Закрыть', panelAriaLabel: 'Панель доступности FlowAble',
      toggleAriaLabel: 'Открыть панель доступности FlowAble',
      presetsTitle: 'Быстрые профили', presetPlaceholder: 'Выберите профиль…',
      presetVisionImpaired: 'Слабовидящим', presetSeizureSafe: 'Против эпилепсии', presetAdhd: 'Для СДВГ',
      presetBlindness: 'Слепота', presetEpilepsySafe: 'Безопасно при эпилепсии',
      textTitle: 'Текст', fontSize: 'Размер текста', lineHeight: 'Высота строки',
      decrease: 'Уменьшить', increase: 'Увеличить',
      letterSpacing: 'Интервал', bold: 'Жирный', readableFont: 'Читаемый шрифт', dyslexicFont: 'Шрифт для дислексии',
      highlightLinks: 'Выделить ссылки', highlightTitles: 'Выделить заголовки', highlightAll: 'Выделить всё',
      alignText: 'Выравнивание текста', bigCursor: 'Крупный курсор', textMagnifier: 'Лупа текста',
      magnifierSpeak: 'Лупа + чтение слова',
      colorTitle: 'Цвет', contrastDark: 'Тёмный контраст', contrastLight: 'Светлый контраст',
      contrastHigh: 'Высокий контраст', monochrome: 'Монохром', desaturate: 'Обесцветить',
      orientationTitle: 'Ориентация и чтение', readingLine: 'Линия чтения', readingMask: 'Маска чтения',
      readPage: 'Прочитать страницу', keyboardNav: 'Навигация с клавиатуры', hideImages: 'Скрыть изображения',
      muteSounds: 'Отключить звук', stopAnimations: 'Остановить анимации',
      gotoTitle: 'Перейти к', gotoPlaceholder: 'Перейти к…', gotoMain: 'Основной контент', gotoMenu: 'Меню', gotoFooter: 'Подвал',
      otherTitle: 'Другое', hideToolbarPlaceholder: 'Скрыть панель…',
      hideSession: 'На эту сессию', hide24h: 'На 24 часа', hideWeek: 'На неделю',
      resetBtn: 'Сбросить настройки', statementBack: '← Назад', statementTitle: 'Заявление о доступности',
      statementP1: 'FlowAble — это панель доступности, работающая полностью в браузере: для применения этих настроек данные о просмотре не отправляются на внешние серверы, они сохраняются только на вашем устройстве.',
      statementP2: 'Если вы столкнулись с проблемой доступности на этом сайте, напишите нам через страницу Контакты — мы постараемся её решить.',
      statementLink: 'Заявление о доступности'
    },
    zh: {
      brand: 'FlowAble', close: '关闭', panelAriaLabel: 'FlowAble 无障碍面板',
      toggleAriaLabel: '打开 FlowAble 无障碍面板',
      presetsTitle: '快速配置', presetPlaceholder: '选择一个配置…',
      presetVisionImpaired: '视力障碍', presetSeizureSafe: '防癫痫发作', presetAdhd: 'ADHD 友好',
      presetBlindness: '失明', presetEpilepsySafe: '癫痫安全',
      textTitle: '文本', fontSize: '字体大小', lineHeight: '行高',
      decrease: '减小', increase: '增大',
      letterSpacing: '字间距', bold: '加粗', readableFont: '易读字体', dyslexicFont: '阅读障碍字体',
      highlightLinks: '高亮链接', highlightTitles: '高亮标题', highlightAll: '高亮全部',
      alignText: '文本对齐', bigCursor: '大光标', textMagnifier: '文本放大镜',
      magnifierSpeak: '放大镜 + 朗读单词',
      colorTitle: '颜色', contrastDark: '深色对比度', contrastLight: '浅色对比度',
      contrastHigh: '高对比度', monochrome: '单色', desaturate: '去饱和',
      orientationTitle: '方向与阅读', readingLine: '阅读线', readingMask: '阅读遮罩',
      readPage: '朗读页面', keyboardNav: '键盘导航', hideImages: '隐藏图片',
      muteSounds: '静音', stopAnimations: '停止动画',
      gotoTitle: '跳转到', gotoPlaceholder: '跳转到…', gotoMain: '主要内容', gotoMenu: '菜单', gotoFooter: '页脚',
      otherTitle: '其他', hideToolbarPlaceholder: '隐藏工具栏…',
      hideSession: '本次会话', hide24h: '24 小时', hideWeek: '一周',
      resetBtn: '重置设置', statementBack: '← 返回', statementTitle: '无障碍声明',
      statementP1: 'FlowAble 是一个完全在浏览器中运行的无障碍工具栏：应用这些设置时不会将浏览数据发送到外部服务器，设置仅保存在您的设备上。',
      statementP2: '如果您在本网站遇到任何无障碍访问问题，请通过联系页面与我们联系，我们会尽力解决。',
      statementLink: '无障碍声明'
    },
    ar: {
      brand: 'FlowAble', close: 'إغلاق', panelAriaLabel: 'لوحة إمكانية الوصول FlowAble',
      toggleAriaLabel: 'فتح لوحة إمكانية الوصول FlowAble',
      presetsTitle: 'ملفات سريعة', presetPlaceholder: 'اختر ملفًا…',
      presetVisionImpaired: 'ضعف البصر', presetSeizureSafe: 'آمن للنوبات', presetAdhd: 'صديق لفرط الحركة',
      presetBlindness: 'العمى', presetEpilepsySafe: 'آمن للصرع',
      textTitle: 'النص', fontSize: 'حجم النص', lineHeight: 'ارتفاع السطر',
      decrease: 'تقليل', increase: 'زيادة',
      letterSpacing: 'تباعد الأحرف', bold: 'عريض', readableFont: 'خط سهل القراءة', dyslexicFont: 'خط لعسر القراءة',
      highlightLinks: 'إبراز الروابط', highlightTitles: 'إبراز العناوين', highlightAll: 'إبراز الكل',
      alignText: 'محاذاة النص', bigCursor: 'مؤشر كبير', textMagnifier: 'مكبر النص',
      magnifierSpeak: 'مكبر + قراءة الكلمة',
      colorTitle: 'اللون', contrastDark: 'تباين داكن', contrastLight: 'تباين فاتح',
      contrastHigh: 'تباين عالٍ', monochrome: 'أحادي اللون', desaturate: 'تقليل التشبع',
      orientationTitle: 'التوجيه والقراءة', readingLine: 'خط القراءة', readingMask: 'قناع القراءة',
      readPage: 'قراءة الصفحة', keyboardNav: 'التنقل بلوحة المفاتيح', hideImages: 'إخفاء الصور',
      muteSounds: 'كتم الصوت', stopAnimations: 'إيقاف الحركات',
      gotoTitle: 'الانتقال إلى', gotoPlaceholder: 'انتقل إلى…', gotoMain: 'المحتوى الرئيسي', gotoMenu: 'القائمة', gotoFooter: 'التذييل',
      otherTitle: 'أخرى', hideToolbarPlaceholder: 'إخفاء شريط الأدوات…',
      hideSession: 'لهذه الجلسة', hide24h: 'لمدة 24 ساعة', hideWeek: 'لمدة أسبوع',
      resetBtn: 'إعادة ضبط الإعدادات', statementBack: '→ رجوع', statementTitle: 'بيان إمكانية الوصول',
      statementP1: 'FlowAble هو شريط أدوات لإمكانية الوصول يعمل بالكامل داخل المتصفح: لا يتم إرسال أي بيانات تصفح إلى خوادم خارجية لتطبيق هذه الإعدادات، وتُحفظ فقط على جهازك.',
      statementP2: 'إذا واجهت أي صعوبة في الوصول إلى هذا الموقع، يرجى التواصل معنا عبر صفحة الاتصال، وسنبذل قصارى جهدنا لحلها.',
      statementLink: 'بيان إمكانية الوصول'
    },
    ja: {
      brand: 'FlowAble', close: '閉じる', panelAriaLabel: 'FlowAble アクセシビリティパネル',
      toggleAriaLabel: 'FlowAble アクセシビリティパネルを開く',
      presetsTitle: 'クイックプロファイル', presetPlaceholder: 'プロファイルを選択…',
      presetVisionImpaired: '弱視', presetSeizureSafe: 'てんかん配慮', presetAdhd: 'ADHD向け',
      presetBlindness: '全盲', presetEpilepsySafe: 'てんかん安全',
      textTitle: 'テキスト', fontSize: '文字サイズ', lineHeight: '行の高さ',
      decrease: '縮小', increase: '拡大',
      letterSpacing: '文字間隔', bold: '太字', readableFont: '読みやすいフォント', dyslexicFont: 'ディスレクシア用フォント',
      highlightLinks: 'リンクを強調', highlightTitles: '見出しを強調', highlightAll: 'すべて強調',
      alignText: 'テキスト配置', bigCursor: '大きいカーソル', textMagnifier: 'テキスト拡大鏡',
      magnifierSpeak: '拡大鏡 + 単語読み上げ',
      colorTitle: '色', contrastDark: 'ダークコントラスト', contrastLight: 'ライトコントラスト',
      contrastHigh: '高コントラスト', monochrome: 'モノクロ', desaturate: '彩度を下げる',
      orientationTitle: '方向と読み上げ', readingLine: '読書ライン', readingMask: '読書マスク',
      readPage: 'ページを読み上げ', keyboardNav: 'キーボード操作', hideImages: '画像を非表示',
      muteSounds: '音を消す', stopAnimations: 'アニメーション停止',
      gotoTitle: '移動', gotoPlaceholder: '移動先…', gotoMain: 'メインコンテンツ', gotoMenu: 'メニュー', gotoFooter: 'フッター',
      otherTitle: 'その他', hideToolbarPlaceholder: 'ツールバーを隠す…',
      hideSession: 'このセッションのみ', hide24h: '24時間', hideWeek: '1週間',
      resetBtn: '設定をリセット', statementBack: '← 戻る', statementTitle: 'アクセシビリティ声明',
      statementP1: 'FlowAble はブラウザ内で完結するアクセシビリティツールバーです。これらの設定を適用するために閲覧データが外部サーバーに送信されることはなく、お使いの端末にのみ保存されます。',
      statementP2: 'このサイトでアクセシビリティ上の問題があれば、お問い合わせページからご連絡ください。解決に努めます。',
      statementLink: 'アクセシビリティ声明'
    },
    ko: {
      brand: 'FlowAble', close: '닫기', panelAriaLabel: 'FlowAble 접근성 패널',
      toggleAriaLabel: 'FlowAble 접근성 패널 열기',
      presetsTitle: '빠른 프로필', presetPlaceholder: '프로필 선택…',
      presetVisionImpaired: '저시력', presetSeizureSafe: '발작 안전', presetAdhd: 'ADHD 친화',
      presetBlindness: '시각 장애', presetEpilepsySafe: '간질 안전',
      textTitle: '텍스트', fontSize: '글자 크기', lineHeight: '줄 높이',
      decrease: '축소', increase: '확대',
      letterSpacing: '자간', bold: '굵게', readableFont: '읽기 쉬운 글꼴', dyslexicFont: '난독증 글꼴',
      highlightLinks: '링크 강조', highlightTitles: '제목 강조', highlightAll: '전체 강조',
      alignText: '텍스트 정렬', bigCursor: '큰 커서', textMagnifier: '텍스트 돋보기',
      magnifierSpeak: '돋보기 + 단어 읽기',
      colorTitle: '색상', contrastDark: '어두운 대비', contrastLight: '밝은 대비',
      contrastHigh: '고대비', monochrome: '단색', desaturate: '채도 낮추기',
      orientationTitle: '방향 및 읽기', readingLine: '읽기 줄', readingMask: '읽기 마스크',
      readPage: '페이지 읽기', keyboardNav: '키보드 탐색', hideImages: '이미지 숨기기',
      muteSounds: '소리 음소거', stopAnimations: '애니메이션 정지',
      gotoTitle: '이동', gotoPlaceholder: '이동…', gotoMain: '주요 콘텐츠', gotoMenu: '메뉴', gotoFooter: '푸터',
      otherTitle: '기타', hideToolbarPlaceholder: '도구 모음 숨기기…',
      hideSession: '이번 세션 동안', hide24h: '24시간 동안', hideWeek: '일주일 동안',
      resetBtn: '설정 초기화', statementBack: '← 뒤로', statementTitle: '접근성 선언',
      statementP1: 'FlowAble은 브라우저에서 완전히 실행되는 접근성 도구 모음입니다. 이 설정을 적용하기 위해 탐색 데이터가 외부 서버로 전송되지 않으며, 사용자의 기기에만 저장됩니다.',
      statementP2: '이 사이트에서 접근성 문제가 발생하면 문의 페이지를 통해 알려주세요. 해결을 위해 최선을 다하겠습니다.',
      statementLink: '접근성 선언'
    },
    nl: {
      brand: 'FlowAble', close: 'Sluiten', panelAriaLabel: 'FlowAble-toegankelijkheidspaneel',
      toggleAriaLabel: 'FlowAble-toegankelijkheidspaneel openen',
      presetsTitle: 'Snelle profielen', presetPlaceholder: 'Kies een profiel…',
      presetVisionImpaired: 'Slechtziend', presetSeizureSafe: 'Aanvalveilig', presetAdhd: 'ADHD-vriendelijk',
      presetBlindness: 'Blindheid', presetEpilepsySafe: 'Epilepsieveilig',
      textTitle: 'Tekst', fontSize: 'Tekstgrootte', lineHeight: 'Regelhoogte',
      decrease: 'Verkleinen', increase: 'Vergroten',
      letterSpacing: 'Letterafstand', bold: 'Vet', readableFont: 'Leesbaar lettertype', dyslexicFont: 'Dyslexie-lettertype',
      highlightLinks: 'Links markeren', highlightTitles: 'Titels markeren', highlightAll: 'Alles markeren',
      alignText: 'Tekst uitlijnen', bigCursor: 'Grote cursor', textMagnifier: 'Tekstvergrootglas',
      magnifierSpeak: 'Vergrootglas + woord voorlezen',
      colorTitle: 'Kleur', contrastDark: 'Donker contrast', contrastLight: 'Licht contrast',
      contrastHigh: 'Hoog contrast', monochrome: 'Monochroom', desaturate: 'Verzadiging verlagen',
      orientationTitle: 'Oriëntatie en lezen', readingLine: 'Leeslijn', readingMask: 'Leesmasker',
      readPage: 'Pagina voorlezen', keyboardNav: 'Toetsenbordnavigatie', hideImages: 'Afbeeldingen verbergen',
      muteSounds: 'Geluid dempen', stopAnimations: 'Animaties stoppen',
      gotoTitle: 'Ga naar', gotoPlaceholder: 'Spring naar…', gotoMain: 'Hoofdinhoud', gotoMenu: 'Menu', gotoFooter: 'Voettekst',
      otherTitle: 'Overig', hideToolbarPlaceholder: 'Werkbalk verbergen…',
      hideSession: 'Voor deze sessie', hide24h: 'Voor 24 uur', hideWeek: 'Voor een week',
      resetBtn: 'Instellingen resetten', statementBack: '← Terug', statementTitle: 'Toegankelijkheidsverklaring',
      statementP1: 'FlowAble is een toegankelijkheidsbalk die volledig in de browser draait: er worden geen navigatiegegevens naar externe servers gestuurd om deze instellingen toe te passen; ze worden alleen op uw apparaat opgeslagen.',
      statementP2: 'Als u op deze site een toegankelijkheidsprobleem tegenkomt, neem dan contact met ons op via de contactpagina: we doen ons best om het op te lossen.',
      statementLink: 'Toegankelijkheidsverklaring'
    },
    pl: {
      brand: 'FlowAble', close: 'Zamknij', panelAriaLabel: 'Panel dostępności FlowAble',
      toggleAriaLabel: 'Otwórz panel dostępności FlowAble',
      presetsTitle: 'Szybkie profile', presetPlaceholder: 'Wybierz profil…',
      presetVisionImpaired: 'Słabowidzący', presetSeizureSafe: 'Bezpieczny dla padaczki', presetAdhd: 'Przyjazny ADHD',
      presetBlindness: 'Niewidomi', presetEpilepsySafe: 'Bezpieczny dla epilepsji',
      textTitle: 'Tekst', fontSize: 'Rozmiar tekstu', lineHeight: 'Wysokość linii',
      decrease: 'Zmniejsz', increase: 'Zwiększ',
      letterSpacing: 'Odstępy liter', bold: 'Pogrubienie', readableFont: 'Czytelna czcionka', dyslexicFont: 'Czcionka dla dysleksji',
      highlightLinks: 'Podświetl linki', highlightTitles: 'Podświetl nagłówki', highlightAll: 'Podświetl wszystko',
      alignText: 'Wyrównaj tekst', bigCursor: 'Duży kursor', textMagnifier: 'Lupa tekstu',
      magnifierSpeak: 'Lupa + czytanie słowa',
      colorTitle: 'Kolor', contrastDark: 'Ciemny kontrast', contrastLight: 'Jasny kontrast',
      contrastHigh: 'Wysoki kontrast', monochrome: 'Monochromatyczny', desaturate: 'Odbarw',
      orientationTitle: 'Orientacja i czytanie', readingLine: 'Linia czytania', readingMask: 'Maska czytania',
      readPage: 'Czytaj stronę', keyboardNav: 'Nawigacja klawiaturą', hideImages: 'Ukryj obrazy',
      muteSounds: 'Wycisz dźwięki', stopAnimations: 'Zatrzymaj animacje',
      gotoTitle: 'Przejdź do', gotoPlaceholder: 'Przejdź do…', gotoMain: 'Główna treść', gotoMenu: 'Menu', gotoFooter: 'Stopka',
      otherTitle: 'Inne', hideToolbarPlaceholder: 'Ukryj pasek narzędzi…',
      hideSession: 'Na tę sesję', hide24h: 'Na 24 godziny', hideWeek: 'Na tydzień',
      resetBtn: 'Resetuj ustawienia', statementBack: '← Wstecz', statementTitle: 'Deklaracja dostępności',
      statementP1: 'FlowAble to pasek dostępności działający w całości w przeglądarce: żadne dane nawigacyjne nie są wysyłane do zewnętrznych serwerów w celu zastosowania tych ustawień — są zapisywane wyłącznie na Twoim urządzeniu.',
      statementP2: 'Jeśli napotkasz na tej stronie problem z dostępnością, napisz do nas przez stronę Kontakt — postaramy się go rozwiązać.',
      statementLink: 'Deklaracja dostępności'
    },
    tr: {
      brand: 'FlowAble', close: 'Kapat', panelAriaLabel: 'FlowAble erişilebilirlik paneli',
      toggleAriaLabel: 'FlowAble erişilebilirlik panelini aç',
      presetsTitle: 'Hızlı profiller', presetPlaceholder: 'Bir profil seçin…',
      presetVisionImpaired: 'Görme engelli', presetSeizureSafe: 'Nöbete karşı güvenli', presetAdhd: 'DEHB dostu',
      presetBlindness: 'Körlük', presetEpilepsySafe: 'Epilepsiye güvenli',
      textTitle: 'Metin', fontSize: 'Yazı boyutu', lineHeight: 'Satır yüksekliği',
      decrease: 'Azalt', increase: 'Artır',
      letterSpacing: 'Harf aralığı', bold: 'Kalın', readableFont: 'Okunaklı yazı tipi', dyslexicFont: 'Disleksi yazı tipi',
      highlightLinks: 'Bağlantıları vurgula', highlightTitles: 'Başlıkları vurgula', highlightAll: 'Her şeyi vurgula',
      alignText: 'Metni hizala', bigCursor: 'Büyük imleç', textMagnifier: 'Metin büyüteci',
      magnifierSpeak: 'Büyüteç + kelime okuma',
      colorTitle: 'Renk', contrastDark: 'Koyu kontrast', contrastLight: 'Açık kontrast',
      contrastHigh: 'Yüksek kontrast', monochrome: 'Tek renk', desaturate: 'Doygunluğu azalt',
      orientationTitle: 'Yönelim ve okuma', readingLine: 'Okuma çizgisi', readingMask: 'Okuma maskesi',
      readPage: 'Sayfayı oku', keyboardNav: 'Klavye gezinme', hideImages: 'Görselleri gizle',
      muteSounds: 'Sesi kapat', stopAnimations: 'Animasyonları durdur',
      gotoTitle: 'Git', gotoPlaceholder: 'Git…', gotoMain: 'Ana içerik', gotoMenu: 'Menü', gotoFooter: 'Alt bilgi',
      otherTitle: 'Diğer', hideToolbarPlaceholder: 'Araç çubuğunu gizle…',
      hideSession: 'Bu oturum için', hide24h: '24 saat boyunca', hideWeek: 'Bir hafta boyunca',
      resetBtn: 'Ayarları sıfırla', statementBack: '← Geri', statementTitle: 'Erişilebilirlik beyanı',
      statementP1: 'FlowAble, tamamen tarayıcı içinde çalışan bir erişilebilirlik araç çubuğudur: bu ayarları uygulamak için gezinme verileri harici sunuculara gönderilmez, yalnızca cihazınızda saklanır.',
      statementP2: 'Bu sitede bir erişilebilirlik sorunuyla karşılaşırsanız, İletişim sayfası üzerinden bize ulaşın; sorunu çözmek için elimizden geleni yapacağız.',
      statementLink: 'Erişilebilirlik beyanı'
    },
    el: {
      brand: 'FlowAble', close: 'Κλείσιμο', panelAriaLabel: 'Πίνακας προσβασιμότητας FlowAble',
      toggleAriaLabel: 'Άνοιγμα πίνακα προσβασιμότητας FlowAble',
      presetsTitle: 'Γρήγορα προφίλ', presetPlaceholder: 'Επιλέξτε προφίλ…',
      presetVisionImpaired: 'Μειωμένη όραση', presetSeizureSafe: 'Ασφαλές για επιληψία', presetAdhd: 'Φιλικό για ADHD',
      presetBlindness: 'Τύφλωση', presetEpilepsySafe: 'Ασφαλές για επιληψία',
      textTitle: 'Κείμενο', fontSize: 'Μέγεθος κειμένου', lineHeight: 'Ύψος γραμμής',
      decrease: 'Μείωση', increase: 'Αύξηση',
      letterSpacing: 'Απόσταση γραμμάτων', bold: 'Έντονα', readableFont: 'Ευανάγνωστη γραμματοσειρά', dyslexicFont: 'Γραμματοσειρά δυσλεξίας',
      highlightLinks: 'Επισήμανση συνδέσμων', highlightTitles: 'Επισήμανση τίτλων', highlightAll: 'Επισήμανση όλων',
      alignText: 'Στοίχιση κειμένου', bigCursor: 'Μεγάλος δρομέας', textMagnifier: 'Μεγεθυντικός φακός',
      magnifierSpeak: 'Φακός + ανάγνωση λέξης',
      colorTitle: 'Χρώμα', contrastDark: 'Σκούρα αντίθεση', contrastLight: 'Ανοιχτή αντίθεση',
      contrastHigh: 'Υψηλή αντίθεση', monochrome: 'Μονόχρωμο', desaturate: 'Αποκορεσμός',
      orientationTitle: 'Προσανατολισμός & ανάγνωση', readingLine: 'Γραμμή ανάγνωσης', readingMask: 'Μάσκα ανάγνωσης',
      readPage: 'Ανάγνωση σελίδας', keyboardNav: 'Πλοήγηση πληκτρολογίου', hideImages: 'Απόκρυψη εικόνων',
      muteSounds: 'Σίγαση ήχων', stopAnimations: 'Διακοπή κινούμενων εικόνων',
      gotoTitle: 'Μετάβαση σε', gotoPlaceholder: 'Μετάβαση σε…', gotoMain: 'Κύριο περιεχόμενο', gotoMenu: 'Μενού', gotoFooter: 'Υποσέλιδο',
      otherTitle: 'Άλλο', hideToolbarPlaceholder: 'Απόκρυψη γραμμής εργαλείων…',
      hideSession: 'Για αυτή τη συνεδρία', hide24h: 'Για 24 ώρες', hideWeek: 'Για μία εβδομάδα',
      resetBtn: 'Επαναφορά ρυθμίσεων', statementBack: '← Πίσω', statementTitle: 'Δήλωση προσβασιμότητας',
      statementP1: 'Το FlowAble είναι μια γραμμή εργαλείων προσβασιμότητας που εκτελείται εξ ολοκλήρου στο πρόγραμμα περιήγησης: δεν αποστέλλονται δεδομένα περιήγησης σε εξωτερικούς διακομιστές για την εφαρμογή αυτών των ρυθμίσεων, οι οποίες αποθηκεύονται μόνο στη συσκευή σας.',
      statementP2: 'Αν αντιμετωπίσετε πρόβλημα προσβασιμότητας σε αυτόν τον ιστότοπο, επικοινωνήστε μαζί μας μέσω της σελίδας Επικοινωνία: θα κάνουμε ό,τι είναι δυνατόν για να το λύσουμε.',
      statementLink: 'Δήλωση προσβασιμότητας'
    }
  };

  function detectLang() {
    if (externalConfig.lang && T[externalConfig.lang]) return externalConfig.lang;
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase().slice(0, 2);
    return T[nav] ? nav : 'en';
  }

  function uiLang() {
    return state.uiLang || detectLang();
  }

  function t(key) {
    var lang = T[uiLang()] ? uiLang() : 'en';
    return T[lang][key] || T.en[key] || key;
  }

  function bcp47Lang() {
    var code = uiLang();
    var entry = LANGUAGES.filter(function (l) { return l.code === code; })[0];
    return entry ? entry.bcp47 : 'en-US';
  }

  var PRESETS = {
    visionImpaired: function () { return Object.assign({}, defaultState, { fontStep: 2, contrast: 'high', readableFont: true }); },
    seizureSafe: function () { return Object.assign({}, defaultState, { stopAnimations: true, desaturate: true }); },
    adhdFriendly: function () { return Object.assign({}, defaultState, { readingMask: true, stopAnimations: true, hideImages: true }); },
    blindness: function () { return Object.assign({}, defaultState, { fontStep: 3, bigCursor: true, keyboardNav: true }); },
    epilepsySafe: function () { return Object.assign({}, defaultState, { stopAnimations: true, monochrome: true }); }
  };

  // ---------------------------------------------------------------
  // Apply state -> DOM classes
  // ---------------------------------------------------------------
  function applySettings() {
    var html = document.documentElement;
    var allManaged = FONT_STEPS.concat(LINE_STEPS).concat([
      'flowable-letter-spacing', 'flowable-bold', 'flowable-readable-font', 'flowable-dyslexic-font',
      'flowable-highlight-links', 'flowable-highlight-titles', 'flowable-highlight-all',
      'flowable-align-left', 'flowable-align-center', 'flowable-align-right',
      'flowable-big-cursor', 'flowable-text-magnifier',
      'flowable-contrast-dark', 'flowable-contrast-light', 'flowable-contrast-high',
      'flowable-monochrome', 'flowable-desaturate',
      'flowable-keyboard-nav', 'flowable-hide-images', 'flowable-stop-animations'
    ]);
    allManaged.forEach(function (c) { html.classList.remove(c); });

    if (state.fontStep > 0) html.classList.add(FONT_STEPS[state.fontStep - 1]);
    if (state.lineStep > 0) html.classList.add(LINE_STEPS[state.lineStep - 1]);
    if (state.letterSpacing) html.classList.add('flowable-letter-spacing');
    if (state.bold) html.classList.add('flowable-bold');
    if (state.readableFont) html.classList.add('flowable-readable-font');
    if (state.dyslexicFont) html.classList.add('flowable-dyslexic-font');
    if (state.highlightLinks) html.classList.add('flowable-highlight-links');
    if (state.highlightTitles) html.classList.add('flowable-highlight-titles');
    if (state.highlightAll) html.classList.add('flowable-highlight-all');
    if (state.alignText) html.classList.add('flowable-align-' + state.alignText);
    if (state.bigCursor) html.classList.add('flowable-big-cursor');
    if (state.textMagnifier || state.magnifierSpeak) html.classList.add('flowable-text-magnifier');
    if (state.contrast) html.classList.add('flowable-contrast-' + state.contrast);
    if (state.monochrome) html.classList.add('flowable-monochrome');
    if (state.desaturate) html.classList.add('flowable-desaturate');
    if (state.keyboardNav) html.classList.add('flowable-keyboard-nav');
    if (state.hideImages) html.classList.add('flowable-hide-images');
    if (state.stopAnimations) html.classList.add('flowable-stop-animations');

    toggleReadingLine(state.readingLine);
    toggleReadingMask(state.readingMask);
    toggleMuteSounds(state.muteSounds);

    saveState();
    if (isOpen) refreshPanelUi();
  }

  // ---------------------------------------------------------------
  // Reading line / mask (follow mouse)
  // ---------------------------------------------------------------
  var readingLineEl, maskTopEl, maskBottomEl;

  function ensureOverlays() {
    if (!readingLineEl) {
      readingLineEl = document.createElement('div');
      readingLineEl.className = 'flowable-reading-line';
      document.body.appendChild(readingLineEl);
    }
    if (!maskTopEl) {
      maskTopEl = document.createElement('div');
      maskTopEl.className = 'flowable-reading-mask-top';
      document.body.appendChild(maskTopEl);
    }
    if (!maskBottomEl) {
      maskBottomEl = document.createElement('div');
      maskBottomEl.className = 'flowable-reading-mask-bottom';
      document.body.appendChild(maskBottomEl);
    }
  }

  function onMouseMoveOverlays(e) {
    if (state.readingLine && readingLineEl) {
      readingLineEl.style.top = (e.clientY - 16) + 'px';
    }
    if (state.readingMask && maskTopEl && maskBottomEl) {
      maskTopEl.style.top = '0';
      maskTopEl.style.height = Math.max(0, e.clientY - 60) + 'px';
      maskBottomEl.style.top = (e.clientY + 60) + 'px';
      maskBottomEl.style.bottom = '0';
      maskBottomEl.style.height = 'auto';
    }
  }

  function toggleReadingLine(on) {
    ensureOverlays();
    readingLineEl.classList.toggle('flowable-active', !!on);
  }

  function toggleReadingMask(on) {
    ensureOverlays();
    maskTopEl.classList.toggle('flowable-active', !!on);
    maskBottomEl.classList.toggle('flowable-active', !!on);
  }

  document.addEventListener('mousemove', function (e) {
    if (state.readingLine || state.readingMask) onMouseMoveOverlays(e);
  });

  // ---------------------------------------------------------------
  // Text magnifier + "magnifier + word reading": both operate on the
  // same hovered element (a link, heading, paragraph, list item…),
  // not on the single word directly under the pointer — hovering a
  // link reads out its whole text, the way a screen reader would.
  // ---------------------------------------------------------------
  var MAGNIFY_SELECTOR = 'a, button, li, h1, h2, h3, h4, h5, h6, p, td, th, blockquote, label, span';
  var lastMagnified = null;
  var lastSpokenText = null;

  function speakElementText(el) {
    if (!ttsSupported() || !el) return;
    var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || text === lastSpokenText) return;
    lastSpokenText = text;
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = bcp47Lang();
    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  }

  function getMagnifyTarget(el) {
    // Prefer the enclosing link/button so hovering any inline part
    // of it (e.g. a <span> inside an <a>) still reads/enlarges the
    // whole clickable text, not just the fragment under the cursor.
    return el.closest('a, button') || el.closest(MAGNIFY_SELECTOR);
  }

  document.addEventListener('mouseover', function (e) {
    if (!state.textMagnifier && !state.magnifierSpeak) return;
    var target = getMagnifyTarget(e.target);
    if (!target || target.closest('.flowable-panel, .flowable-toggle, .flowable-kb')) return;
    if (lastMagnified && lastMagnified !== target) lastMagnified.classList.remove('flowable-magnified');
    target.classList.add('flowable-magnified');
    lastMagnified = target;
    if (state.magnifierSpeak && !isSpeaking) speakElementText(target);
  });
  document.addEventListener('mouseout', function (e) {
    if (!state.textMagnifier && !state.magnifierSpeak) return;
    if (lastMagnified && !e.relatedTarget) {
      lastMagnified.classList.remove('flowable-magnified');
      lastMagnified = null;
      // Allow re-hovering the same element later to read it out again.
      lastSpokenText = null;
    }
  });

  // ---------------------------------------------------------------
  // Mute sounds (audio/video)
  // ---------------------------------------------------------------
  var muteObserver;
  function toggleMuteSounds(on) {
    var mediaEls = document.querySelectorAll('audio, video');
    mediaEls.forEach(function (m) { m.muted = !!on; });
    if (on && !muteObserver) {
      muteObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (n.matches && n.matches('audio, video')) n.muted = true;
            if (n.querySelectorAll) n.querySelectorAll('audio, video').forEach(function (el) { el.muted = true; });
          });
        });
      });
      muteObserver.observe(document.body, { childList: true, subtree: true });
    } else if (!on && muteObserver) {
      muteObserver.disconnect();
      muteObserver = null;
    }
  }

  // ---------------------------------------------------------------
  // TTS — "Leggi la pagina" (Web Speech API, client-only)
  // ---------------------------------------------------------------
  function getReadableText() {
    var el = document.querySelector('main, article, .tc-main-post-content, .content') || document.body;
    return el.innerText || el.textContent || '';
  }

  function ttsSupported() {
    return 'speechSynthesis' in window;
  }

  // Text is split into sentence-sized chunks spoken sequentially
  // (rather than as one giant utterance) to sidestep two well-known
  // engine issues: very long utterances silently stop partway
  // through, and — the more severe one — an utterance with no
  // surviving JS reference gets garbage-collected and cuts speech
  // off after just the first word or two. currentUtterance keeps
  // whichever chunk is currently playing alive for its full duration.
  var ttsQueue = [];
  var ttsQueueIndex = 0;

  function chunkReadableText(text) {
    var sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
    var chunks = [];
    var buf = '';
    sentences.forEach(function (s) {
      if (buf && (buf + s).length > 200) { chunks.push(buf); buf = s; }
      else { buf += s; }
    });
    if (buf.trim()) chunks.push(buf);
    return chunks;
  }

  function speakNextChunk() {
    if (ttsQueueIndex >= ttsQueue.length) {
      isSpeaking = false;
      isPaused = false;
      currentUtterance = null;
      refreshPanelUi();
      return;
    }
    var utter = new SpeechSynthesisUtterance(ttsQueue[ttsQueueIndex++]);
    utter.lang = bcp47Lang();
    utter.onend = function () { speakNextChunk(); };
    utter.onerror = function () { isSpeaking = false; isPaused = false; currentUtterance = null; refreshPanelUi(); };
    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  }

  function ttsPlay() {
    if (!ttsSupported()) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      isPaused = false;
      isSpeaking = true;
      refreshPanelUi();
      return;
    }
    window.speechSynthesis.cancel();
    var text = getReadableText();
    if (!text.trim()) return;
    ttsQueue = chunkReadableText(text);
    ttsQueueIndex = 0;
    isSpeaking = true;
    isPaused = false;
    refreshPanelUi();
    speakNextChunk();
  }

  function ttsPause() {
    if (!ttsSupported()) return;
    window.speechSynthesis.pause();
    isPaused = true;
    isSpeaking = false;
    refreshPanelUi();
  }

  function ttsStop() {
    if (!ttsSupported()) return;
    window.speechSynthesis.cancel();
    ttsQueue = [];
    ttsQueueIndex = 0;
    currentUtterance = null;
    isSpeaking = false;
    isPaused = false;
    refreshPanelUi();
  }

  // ---------------------------------------------------------------
  // FlowAble's own UI language switch. Fully independent from the
  // host page: no navigation, no query-string convention, nothing
  // read from or written to the host's language mechanism.
  // ---------------------------------------------------------------
  function setUiLang(lang) {
    if (!T[lang] || lang === uiLang()) return;
    state.uiLang = lang;
    saveState();
    rebuildPanel();
  }

  // ---------------------------------------------------------------
  // Go to content (quick jump)
  // ---------------------------------------------------------------
  function gotoSection(sel) {
    var el = document.querySelector(sel);
    if (el) { el.scrollIntoView({ behavior: state.stopAnimations ? 'auto' : 'smooth', block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  }

  // ---------------------------------------------------------------
  // Hide toolbar (session / 24h / week)
  // ---------------------------------------------------------------
  function hideFor(ms) {
    try { localStorage.setItem(HIDE_KEY, String(Date.now() + ms)); } catch (e) {}
    closePanel();
    var toggle = document.querySelector('.flowable-toggle');
    if (toggle) toggle.style.display = 'none';
  }

  // ---------------------------------------------------------------
  // Virtual keyboard — lets a mouse-only user type into any text
  // input/textarea/contenteditable field without a physical keyboard.
  // ---------------------------------------------------------------
  var kbEl = null;
  var kbShift = false;
  var kbTargetEl = null;

  var KB_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', "@.,-_/:;!?'"];

  function isTypableField(el) {
    if (!el || el.disabled || el.readOnly) return false;
    if (isFlowableOwnField(el)) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'SELECT') return true;
    if (el.tagName === 'INPUT') {
      var type = (el.getAttribute('type') || 'text').toLowerCase();
      return ['text', 'search', 'email', 'url', 'tel', 'number', 'password'].indexOf(type) !== -1;
    }
    return false;
  }

  function isFlowableOwnField(el) {
    return !!(el.closest && el.closest('.flowable-panel, .flowable-kb, .flowable-toggle'));
  }

  // For <select>, the virtual keyboard acts as a letter-based
  // typeahead: pressing a key jumps to (and cycles through) the
  // options whose label starts with that letter — matching how a
  // physical keyboard already behaves on a focused native select.
  function typeaheadSelect(selectEl, ch) {
    var letter = ch.toLowerCase();
    var options = Array.prototype.slice.call(selectEl.options);
    var matches = options.map(function (o, i) { return { o: o, i: i }; })
      .filter(function (x) { return x.o.text.trim().toLowerCase().indexOf(letter) === 0; });
    if (!matches.length) return;
    var currentIdx = matches.findIndex(function (m) { return m.i === selectEl.selectedIndex; });
    var next = matches[(currentIdx + 1) % matches.length];
    selectEl.selectedIndex = next.i;
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function insertAtCursor(el, text) {
    if (el.isContentEditable) {
      document.execCommand('insertText', false, text);
      return;
    }
    var start = el.selectionStart == null ? el.value.length : el.selectionStart;
    var end = el.selectionEnd == null ? el.value.length : el.selectionEnd;
    var val = el.value;
    el.value = val.slice(0, start) + text + val.slice(end);
    var pos = start + text.length;
    try { el.setSelectionRange(pos, pos); } catch (e) {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function backspaceAtCursor(el) {
    if (el.isContentEditable) { document.execCommand('delete'); return; }
    var start = el.selectionStart == null ? el.value.length : el.selectionStart;
    var end = el.selectionEnd == null ? el.value.length : el.selectionEnd;
    var val = el.value;
    if (start === end && start > 0) { el.value = val.slice(0, start - 1) + val.slice(end); start--; }
    else { el.value = val.slice(0, start) + val.slice(end); }
    try { el.setSelectionRange(start, start); } catch (e) {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function buildKeyboard() {
    var el = document.createElement('div');
    el.className = 'flowable-kb' + (state.kbLargeKeys ? ' flowable-kb-large' : '');
    var rowsHtml = KB_ROWS.map(function (row) {
      return '<div class="flowable-kb-row">' + row.split('').map(function (ch) {
        return '<button type="button" class="flowable-kb-key" data-kb-char="' + ch + '">' + ch + '</button>';
      }).join('') + '</div>';
    }).join('');
    el.innerHTML = '' +
      '<button type="button" class="flowable-kb-close" data-kb-close>' + t('close') + '</button>' +
      '<button type="button" class="flowable-kb-size' + (state.kbLargeKeys ? ' flowable-kb-size-on' : '') + '" data-kb-size title="' + t('kbLargeKeys') + '">A+</button>' +
      rowsHtml +
      '<div class="flowable-kb-row">' +
      '  <button type="button" class="flowable-kb-key flowable-kb-wide" data-kb-shift>⇧</button>' +
      '  <button type="button" class="flowable-kb-key flowable-kb-space" data-kb-space>' + (uiLang() === 'en' ? 'space' : ' ') + '</button>' +
      '  <button type="button" class="flowable-kb-key flowable-kb-wide" data-kb-backspace>⌫</button>' +
      '  <button type="button" class="flowable-kb-key flowable-kb-wide flowable-kb-accent" data-kb-enter>↵</button>' +
      '</div>';
    return el;
  }

  function applyKbShiftState() {
    if (!kbEl) return;
    kbEl.querySelectorAll('[data-kb-char]').forEach(function (b) {
      var ch = b.getAttribute('data-kb-char');
      b.textContent = kbShift ? ch.toUpperCase() : ch;
    });
  }

  function ensureKeyboard() {
    if (kbEl) return;
    kbEl = buildKeyboard();
    document.body.appendChild(kbEl);

    // Prevent the keyboard from stealing focus away from the target
    // field: the field must stay focused for insertAtCursor to work.
    kbEl.addEventListener('mousedown', function (e) { e.preventDefault(); });

    kbEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-kb-size]')) {
        state.kbLargeKeys = !state.kbLargeKeys;
        saveState();
        kbEl.classList.toggle('flowable-kb-large', state.kbLargeKeys);
        var sizeBtn = kbEl.querySelector('[data-kb-size]');
        if (sizeBtn) sizeBtn.classList.toggle('flowable-kb-size-on', state.kbLargeKeys);
        positionKeyboard();
        return;
      }
      if (!kbTargetEl) return;
      var isSelect = kbTargetEl.tagName === 'SELECT';

      var charBtn = e.target.closest('[data-kb-char]');
      if (charBtn) {
        var ch = charBtn.getAttribute('data-kb-char');
        if (isSelect) { typeaheadSelect(kbTargetEl, ch); return; }
        insertAtCursor(kbTargetEl, kbShift ? ch.toUpperCase() : ch);
        if (kbShift) { kbShift = false; applyKbShiftState(); }
        return;
      }
      if (e.target.closest('[data-kb-shift]')) { kbShift = !kbShift; applyKbShiftState(); return; }
      if (e.target.closest('[data-kb-space]')) { if (!isSelect) insertAtCursor(kbTargetEl, ' '); return; }
      if (e.target.closest('[data-kb-backspace]')) { if (!isSelect) backspaceAtCursor(kbTargetEl); return; }
      if (e.target.closest('[data-kb-enter]')) {
        if (isSelect) { /* no-op: selection already applied on each keypress */ }
        else if (kbTargetEl.tagName === 'TEXTAREA' || kbTargetEl.isContentEditable) insertAtCursor(kbTargetEl, '\n');
        else kbTargetEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        return;
      }
      if (e.target.closest('[data-kb-close]')) { state.virtualKeyboard = false; saveState(); hideKeyboard(); refreshPanelUi(); return; }
    });
  }

  function positionKeyboard() {
    if (!kbEl || !kbTargetEl || !kbEl.classList.contains('flowable-open')) return;
    var rect = kbTargetEl.getBoundingClientRect();
    var kbHeight = kbEl.offsetHeight || 220;
    var kbWidth = kbEl.offsetWidth || 340;
    var top = rect.bottom + 8;
    if (top + kbHeight > window.innerHeight) top = Math.max(8, rect.top - kbHeight - 8);
    var left = rect.left;
    if (left + kbWidth > window.innerWidth - 8) left = window.innerWidth - kbWidth - 8;
    if (left < 8) left = 8;
    kbEl.style.top = top + 'px';
    kbEl.style.left = left + 'px';
  }

  function showKeyboard(targetEl) {
    ensureKeyboard();
    kbTargetEl = targetEl;
    kbEl.style.transform = '';
    kbEl.classList.add('flowable-open');
    positionKeyboard();
  }

  // Shown when the feature is switched on but no field is focused
  // yet (e.g. toggled straight from the panel): gives immediate
  // visible confirmation instead of appearing to do nothing, then
  // showKeyboard() takes over and repositions it once a real field
  // is focused.
  function showKeyboardDefault() {
    ensureKeyboard();
    kbTargetEl = null;
    kbEl.classList.add('flowable-open');
    kbEl.style.left = '50%';
    kbEl.style.top = 'auto';
    kbEl.style.bottom = '24px';
    kbEl.style.transform = 'translateX(-50%)';
  }

  function hideKeyboard() {
    if (kbEl) kbEl.classList.remove('flowable-open');
  }

  // Remembers the last real (non-FlowAble) field the user focused,
  // even while focus later moves to the panel itself — so turning
  // the feature on from the panel still shows the keyboard next to
  // the field the user was actually working in.
  var lastTypableTarget = null;

  // Capture phase: fires before the target page's own JS has a
  // chance to call stopPropagation() on the bubble phase, so the
  // keyboard still shows even on pages with focus-handling widgets
  // of their own.
  document.addEventListener('focusin', function (e) {
    if (!isTypableField(e.target)) return;
    lastTypableTarget = e.target;
    if (state.virtualKeyboard) showKeyboard(e.target);
  }, true);

  document.addEventListener('focusout', function (e) {
    if (!state.virtualKeyboard) return;
    // Ignore blur caused by clicking inside the keyboard itself
    // (its mousedown handler already prevents real focus loss).
    setTimeout(function () {
      if (kbEl && document.activeElement && isTypableField(document.activeElement)) return;
      hideKeyboard();
    }, 0);
  }, true);

  window.addEventListener('scroll', function () { positionKeyboard(); }, { passive: true, capture: true });
  window.addEventListener('resize', function () { positionKeyboard(); });

  function toggleVirtualKeyboard(on) {
    if (!on) { hideKeyboard(); kbTargetEl = null; return; }
    if (document.activeElement && isTypableField(document.activeElement)) {
      showKeyboard(document.activeElement);
    } else if (lastTypableTarget && document.contains(lastTypableTarget)) {
      showKeyboard(lastTypableTarget);
    } else {
      showKeyboardDefault();
    }
  }

  // ---------------------------------------------------------------
  // Panel markup
  // ---------------------------------------------------------------
  function stepControlHtml(key, labelId) {
    return '' +
      '<div class="flowable-step-controls" role="group" aria-label="' + labelId + '">' +
      '  <button type="button" data-step-dec="' + key + '" aria-label="Diminuisci">−</button>' +
      '  <span class="flowable-step-dots" data-step-dots="' + key + '"><span></span><span></span><span></span></span>' +
      '  <button type="button" data-step-inc="' + key + '" aria-label="Aumenta">+</button>' +
      '</div>';
  }

  function btnHtml(icon, label, action, on) {
    return '<button type="button" class="flowable-btn' + (on ? ' flowable-on' : '') + '" data-action="' + action + '" aria-pressed="' + (!!on) + '">' + icon + '<span>' + label + '</span></button>';
  }

  function langOptionsHtml() {
    var cur = uiLang();
    return LANGUAGES.map(function (l) {
      return '<option value="' + l.code + '"' + (l.code === cur ? ' selected' : '') + '>' + l.flag + ' ' + l.name + '</option>';
    }).join('');
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.className = 'flowable-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', t('panelAriaLabel'));
    panel.style.display = 'none';

    panel.innerHTML = '' +
      '<div class="flowable-header">' +
      '  <div class="flowable-brand">' + ICONS.logo + '<span>' + t('brand') + '</span></div>' +
      '  <div class="flowable-lang-switch">' +
      '    <select class="flowable-select" data-lang-select aria-label="Language">' + langOptionsHtml() + '</select>' +
      '  </div>' +
      '  <button type="button" class="flowable-close" data-close aria-label="' + t('close') + '">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="flowable-body">' +

      '  <div class="flowable-section">' +
      '    <div class="flowable-section-title">' + t('presetsTitle') + '</div>' +
      '    <select class="flowable-select" data-preset>' +
      '      <option value="">' + t('presetPlaceholder') + '</option>' +
      '      <option value="visionImpaired">' + t('presetVisionImpaired') + '</option>' +
      '      <option value="seizureSafe">' + t('presetSeizureSafe') + '</option>' +
      '      <option value="adhdFriendly">' + t('presetAdhd') + '</option>' +
      '      <option value="blindness">' + t('presetBlindness') + '</option>' +
      '      <option value="epilepsySafe">' + t('presetEpilepsySafe') + '</option>' +
      '    </select>' +
      '  </div>' +

      '  <div class="flowable-section">' +
      '    <div class="flowable-section-title">' + t('textTitle') + '</div>' +
      '    <div class="flowable-row"><span class="flowable-row-label">' + ICONS.fontSize + ' ' + t('fontSize') + '</span>' + stepControlHtml('fontStep', t('fontSize')) + '</div>' +
      '    <div class="flowable-row"><span class="flowable-row-label">' + ICONS.lineHeight + ' ' + t('lineHeight') + '</span>' + stepControlHtml('lineStep', t('lineHeight')) + '</div>' +
      '    <div class="flowable-grid">' +
      btnHtml(ICONS.letterSpacing, t('letterSpacing'), 'letterSpacing', state.letterSpacing) +
      btnHtml(ICONS.bold, t('bold'), 'bold', state.bold) +
      btnHtml(ICONS.font, t('readableFont'), 'readableFont', state.readableFont) +
      btnHtml(ICONS.dyslexic, t('dyslexicFont'), 'dyslexicFont', state.dyslexicFont) +
      btnHtml(ICONS.link, t('highlightLinks'), 'highlightLinks', state.highlightLinks) +
      btnHtml(ICONS.title, t('highlightTitles'), 'highlightTitles', state.highlightTitles) +
      btnHtml(ICONS.title, t('highlightAll'), 'highlightAll', state.highlightAll) +
      btnHtml(ICONS.align, t('alignText'), 'alignText', !!state.alignText) +
      btnHtml(ICONS.cursor, t('bigCursor'), 'bigCursor', state.bigCursor) +
      btnHtml(ICONS.magnifier, t('textMagnifier'), 'textMagnifier', state.textMagnifier) +
      btnHtml(ICONS.tts, t('magnifierSpeak'), 'magnifierSpeak', state.magnifierSpeak) +
      '    </div>' +
      '  </div>' +

      '  <div class="flowable-section">' +
      '    <div class="flowable-section-title">' + t('colorTitle') + '</div>' +
      '    <div class="flowable-grid">' +
      btnHtml(ICONS.contrastDark, t('contrastDark'), 'contrastDark', state.contrast === 'dark') +
      btnHtml(ICONS.contrastLight, t('contrastLight'), 'contrastLight', state.contrast === 'light') +
      btnHtml(ICONS.contrastHigh, t('contrastHigh'), 'contrastHigh', state.contrast === 'high') +
      btnHtml(ICONS.monochrome, t('monochrome'), 'monochrome', state.monochrome) +
      btnHtml(ICONS.saturation, t('desaturate'), 'desaturate', state.desaturate) +
      '    </div>' +
      '  </div>' +

      '  <div class="flowable-section">' +
      '    <div class="flowable-section-title">' + t('orientationTitle') + '</div>' +
      '    <div class="flowable-grid">' +
      btnHtml(ICONS.readingLine, t('readingLine'), 'readingLine', state.readingLine) +
      btnHtml(ICONS.readingMask, t('readingMask'), 'readingMask', state.readingMask) +
      btnHtml(ICONS.tts, t('readPage'), 'tts', isSpeaking) +
      btnHtml(ICONS.keyboard, t('keyboardNav'), 'keyboardNav', state.keyboardNav) +
      btnHtml(ICONS.hideImages, t('hideImages'), 'hideImages', state.hideImages) +
      btnHtml(ICONS.mute, t('muteSounds'), 'muteSounds', state.muteSounds) +
      btnHtml(ICONS.stopAnim, t('stopAnimations'), 'stopAnimations', state.stopAnimations) +
      '    </div>' +
      '  </div>' +

      '  <div class="flowable-section">' +
      '    <div class="flowable-section-title">' + t('gotoTitle') + '</div>' +
      '    <select class="flowable-select" data-goto>' +
      '      <option value="">' + t('gotoPlaceholder') + '</option>' +
      '      <option value="main, .site-content">' + t('gotoMain') + '</option>' +
      '      <option value="nav, header">' + t('gotoMenu') + '</option>' +
      '      <option value="footer">' + t('gotoFooter') + '</option>' +
      '    </select>' +
      '  </div>' +

      '  <div class="flowable-section">' +
      '    <div class="flowable-section-title">' + t('otherTitle') + '</div>' +
      '    <div class="flowable-grid" style="margin-bottom:8px">' +
      btnHtml(ICONS.keyboardVirtual, t('virtualKeyboard'), 'virtualKeyboard', state.virtualKeyboard) +
      '    </div>' +
      '    <select class="flowable-select mb-2" data-hide-toolbar style="margin-bottom:8px">' +
      '      <option value="">' + t('hideToolbarPlaceholder') + '</option>' +
      '      <option value="session">' + t('hideSession') + '</option>' +
      '      <option value="24h">' + t('hide24h') + '</option>' +
      '      <option value="week">' + t('hideWeek') + '</option>' +
      '    </select>' +
      '    <button type="button" class="flowable-reset" data-reset>' + ICONS.reset + ' ' + t('resetBtn') + '</button>' +
      '  </div>' +

      '  <div class="flowable-statement" data-statement>' +
      '    <button type="button" class="flowable-back" data-statement-close>' + t('statementBack') + '</button>' +
      '    <h3>' + t('statementTitle') + '</h3>' +
      '    <p>' + t('statementP1') + '</p>' +
      '    <p>' + t('statementP2') + '</p>' +
      '    <h3>' + t('aboutTitle') + '</h3>' +
      '    <p>' + t('aboutText') + '</p>' +
      '  </div>' +

      '</div>' +
      '<div class="flowable-footer">' +
      '  <span class="flowable-brand-mini">' + ICONS.logo + ' ' + t('brand') + '</span>' +
      '  <a href="#" data-statement-open>' + t('statementLink') + '</a>' +
      '</div>' +
      '<div class="flowable-footer-credit">' + t('footerCredit') + '</div>';

    return panel;
  }

  function buildToggle() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flowable-toggle';
    btn.setAttribute('aria-label', t('toggleAriaLabel'));
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = ICONS.logo;
    return btn;
  }

  var panelEl, toggleEl;

  function refreshPanelUi() {
    if (!panelEl) return;
    panelEl.querySelectorAll('[data-step-dots]').forEach(function (dots) {
      var key = dots.getAttribute('data-step-dots');
      var val = state[key] || 0;
      Array.prototype.forEach.call(dots.children, function (dot, i) {
        dot.classList.toggle('flowable-dot-on', i < val);
      });
    });
    panelEl.querySelectorAll('[data-action]').forEach(function (b) {
      var action = b.getAttribute('data-action');
      var on = false;
      switch (action) {
        case 'contrastDark': on = state.contrast === 'dark'; break;
        case 'contrastLight': on = state.contrast === 'light'; break;
        case 'contrastHigh': on = state.contrast === 'high'; break;
        case 'alignText': on = !!state.alignText; break;
        case 'tts': on = isSpeaking; break;
        default: on = !!state[action];
      }
      b.classList.toggle('flowable-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function handleAction(action) {
    switch (action) {
      case 'letterSpacing': case 'bold': case 'readableFont': case 'dyslexicFont':
      case 'highlightLinks': case 'highlightTitles': case 'highlightAll':
      case 'bigCursor': case 'textMagnifier': case 'monochrome': case 'desaturate':
      case 'readingLine': case 'readingMask': case 'keyboardNav': case 'hideImages':
      case 'muteSounds': case 'stopAnimations':
        state[action] = !state[action];
        break;
      case 'virtualKeyboard':
        state.virtualKeyboard = !state.virtualKeyboard;
        toggleVirtualKeyboard(state.virtualKeyboard);
        break;
      case 'magnifierSpeak':
        state.magnifierSpeak = !state.magnifierSpeak;
        if (!state.magnifierSpeak) {
          if (ttsSupported()) window.speechSynthesis.cancel();
          lastSpokenText = null;
          if (lastMagnified && !state.textMagnifier) { lastMagnified.classList.remove('flowable-magnified'); lastMagnified = null; }
        }
        break;
      case 'alignText':
        state.alignText = state.alignText === 'left' ? 'center' : state.alignText === 'center' ? 'right' : state.alignText === 'right' ? null : 'left';
        break;
      case 'contrastDark': state.contrast = state.contrast === 'dark' ? null : 'dark'; break;
      case 'contrastLight': state.contrast = state.contrast === 'light' ? null : 'light'; break;
      case 'contrastHigh': state.contrast = state.contrast === 'high' ? null : 'high'; break;
      case 'tts':
        if (isSpeaking) ttsPause(); else ttsPlay();
        return;
    }
    applySettings();
  }

  // Panel-scoped listeners: rebound every time the panel DOM is
  // rebuilt (e.g. on a UI language change).
  function bindPanelEvents() {
    panelEl.addEventListener('click', function (e) {
      var actionBtn = e.target.closest('[data-action]');
      if (actionBtn) { handleAction(actionBtn.getAttribute('data-action')); return; }

      var stepInc = e.target.closest('[data-step-inc]');
      if (stepInc) { var k1 = stepInc.getAttribute('data-step-inc'); state[k1] = Math.min(3, (state[k1] || 0) + 1); applySettings(); return; }

      var stepDec = e.target.closest('[data-step-dec]');
      if (stepDec) { var k2 = stepDec.getAttribute('data-step-dec'); state[k2] = Math.max(0, (state[k2] || 0) - 1); applySettings(); return; }

      if (e.target.closest('[data-close]')) { closePanel(); return; }
      if (e.target.closest('[data-reset]')) { var lang = state.uiLang; state = Object.assign({}, defaultState, { uiLang: lang }); ttsStop(); toggleVirtualKeyboard(false); applySettings(); return; }

      var statementOpen = e.target.closest('[data-statement-open]');
      if (statementOpen) { e.preventDefault(); panelEl.querySelector('[data-statement]').classList.add('flowable-open'); return; }
      var statementClose = e.target.closest('[data-statement-close]');
      if (statementClose) { panelEl.querySelector('[data-statement]').classList.remove('flowable-open'); return; }
    });

    panelEl.querySelector('[data-lang-select]').addEventListener('change', function (e) {
      setUiLang(e.target.value);
    });

    panelEl.querySelector('[data-preset]').addEventListener('change', function (e) {
      var key = e.target.value;
      if (!key || !PRESETS[key]) return;
      var lang = state.uiLang;
      state = Object.assign(PRESETS[key](), { uiLang: lang });
      applySettings();
      e.target.value = '';
    });

    panelEl.querySelector('[data-goto]').addEventListener('change', function (e) {
      if (e.target.value) gotoSection(e.target.value);
      e.target.value = '';
    });

    panelEl.querySelector('[data-hide-toolbar]').addEventListener('change', function (e) {
      var v = e.target.value;
      if (v === 'session') { try { sessionStorage.setItem('flowable-hidden-session', '1'); } catch (err) {} closePanel(); toggleEl.style.display = 'none'; }
      else if (v === '24h') hideFor(24 * 60 * 60 * 1000);
      else if (v === 'week') hideFor(7 * 24 * 60 * 60 * 1000);
      e.target.value = '';
    });
  }

  // Global listeners: bound once. They reference panelEl/toggleEl by
  // the outer closure variable, so they stay correct even after a
  // panel rebuild reassigns those variables.
  function bindGlobalEvents() {
    toggleEl.addEventListener('click', function () {
      isOpen ? closePanel() : openPanel();
    });

    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.key === '.') { e.preventDefault(); isOpen ? closePanel() : openPanel(); }
      if (e.metaKey && e.key === '.') { e.preventDefault(); isOpen ? closePanel() : openPanel(); }
      if (e.key === 'Escape' && isOpen) closePanel();
    });

    document.addEventListener('click', function (e) {
      if (!isOpen) return;
      if (panelEl.contains(e.target) || toggleEl.contains(e.target)) return;
      closePanel();
    });
  }

  function openPanel() {
    isOpen = true;
    panelEl.style.display = 'flex';
    toggleEl.classList.add('flowable-active');
    toggleEl.setAttribute('aria-expanded', 'true');
    refreshPanelUi();
  }

  function closePanel() {
    isOpen = false;
    panelEl.style.display = 'none';
    toggleEl.classList.remove('flowable-active');
    toggleEl.setAttribute('aria-expanded', 'false');
  }

  function rebuildPanel() {
    var wasOpen = isOpen;
    var newPanel = buildPanel();
    panelEl.replaceWith(newPanel);
    panelEl = newPanel;
    bindPanelEvents();
    toggleEl.setAttribute('aria-label', t('toggleAriaLabel'));
    if (wasOpen) { panelEl.style.display = 'flex'; }
    refreshPanelUi();
  }

  function render() {
    toggleEl = buildToggle();
    panelEl = buildPanel();
    document.body.appendChild(panelEl);
    document.body.appendChild(toggleEl);
    bindPanelEvents();
    bindGlobalEvents();
  }

  function init() {
    if (isHiddenNow()) return;
    try { if (sessionStorage.getItem('flowable-hidden-session') === '1') return; } catch (e) {}
    injectStyles();
    render();
    applySettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
