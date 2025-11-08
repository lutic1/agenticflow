/**
 * Multi-Language Support (P1.6)
 * Internationalization (i18n) with 10 languages
 * RTL support, dynamic locale switching, translation management
 */

export type SupportedLanguage =
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'zh' // Chinese (Simplified)
  | 'ja' // Japanese
  | 'ar' // Arabic (RTL)
  | 'pt' // Portuguese
  | 'ru' // Russian
  | 'hi'; // Hindi

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface TranslationOptions {
  count?: number; // For pluralization
  context?: Record<string, string | number>; // For interpolation
}

/**
 * Internationalization Manager
 * Manage multi-language support
 */
export class I18nManager {
  private currentLocale: SupportedLanguage = 'en';
  private translations: Map<SupportedLanguage, TranslationDictionary>;
  private languages: Map<SupportedLanguage, LanguageConfig>;

  constructor() {
    this.translations = new Map();
    this.languages = new Map();
    this.initializeLanguages();
    this.initializeTranslations();
  }

  /**
   * Initialize supported languages
   */
  private initializeLanguages(): void {
    const languages: LanguageConfig[] = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        dir: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        dir: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        dir: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        dir: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        dir: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        dir: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        dir: 'rtl',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        dir: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        dir: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        dir: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { style: 'decimal', useGrouping: true }
      }
    ];

    languages.forEach(lang => this.languages.set(lang.code, lang));
  }

  /**
   * Initialize translations (sample translations for core UI)
   */
  private initializeTranslations(): void {
    // English (base language)
    this.translations.set('en', {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning'
      },
      slide: {
        title: 'Slide {{number}}',
        addSlide: 'Add Slide',
        deleteSlide: 'Delete Slide',
        duplicateSlide: 'Duplicate Slide',
        moveSlide: 'Move Slide',
        slideNotes: 'Speaker Notes',
        slidePreview: 'Preview'
      },
      presentation: {
        title: 'Presentation',
        new: 'New Presentation',
        open: 'Open Presentation',
        export: 'Export',
        share: 'Share',
        present: 'Present',
        settings: 'Settings'
      },
      template: {
        selectTemplate: 'Select Template',
        noTemplates: 'No templates available',
        templateApplied: 'Template applied successfully'
      },
      errors: {
        notFound: 'Not found',
        serverError: 'Server error occurred',
        networkError: 'Network error',
        invalidInput: 'Invalid input'
      }
    });

    // Spanish
    this.translations.set('es', {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia'
      },
      slide: {
        title: 'Diapositiva {{number}}',
        addSlide: 'Agregar Diapositiva',
        deleteSlide: 'Eliminar Diapositiva',
        duplicateSlide: 'Duplicar Diapositiva',
        moveSlide: 'Mover Diapositiva',
        slideNotes: 'Notas del Orador',
        slidePreview: 'Vista Previa'
      },
      presentation: {
        title: 'Presentación',
        new: 'Nueva Presentación',
        open: 'Abrir Presentación',
        export: 'Exportar',
        share: 'Compartir',
        present: 'Presentar',
        settings: 'Configuración'
      },
      template: {
        selectTemplate: 'Seleccionar Plantilla',
        noTemplates: 'No hay plantillas disponibles',
        templateApplied: 'Plantilla aplicada exitosamente'
      },
      errors: {
        notFound: 'No encontrado',
        serverError: 'Error del servidor',
        networkError: 'Error de red',
        invalidInput: 'Entrada inválida'
      }
    });

    // French
    this.translations.set('fr', {
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Attention'
      },
      slide: {
        title: 'Diapositive {{number}}',
        addSlide: 'Ajouter une Diapositive',
        deleteSlide: 'Supprimer la Diapositive',
        duplicateSlide: 'Dupliquer la Diapositive',
        moveSlide: 'Déplacer la Diapositive',
        slideNotes: 'Notes de Présentation',
        slidePreview: 'Aperçu'
      },
      presentation: {
        title: 'Présentation',
        new: 'Nouvelle Présentation',
        open: 'Ouvrir une Présentation',
        export: 'Exporter',
        share: 'Partager',
        present: 'Présenter',
        settings: 'Paramètres'
      },
      template: {
        selectTemplate: 'Sélectionner un Modèle',
        noTemplates: 'Aucun modèle disponible',
        templateApplied: 'Modèle appliqué avec succès'
      },
      errors: {
        notFound: 'Non trouvé',
        serverError: 'Erreur serveur',
        networkError: 'Erreur réseau',
        invalidInput: 'Entrée invalide'
      }
    });

    // Arabic (RTL)
    this.translations.set('ar', {
      common: {
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        close: 'إغلاق',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        warning: 'تحذير'
      },
      slide: {
        title: 'شريحة {{number}}',
        addSlide: 'إضافة شريحة',
        deleteSlide: 'حذف الشريحة',
        duplicateSlide: 'تكرار الشريحة',
        moveSlide: 'نقل الشريحة',
        slideNotes: 'ملاحظات المتحدث',
        slidePreview: 'معاينة'
      },
      presentation: {
        title: 'عرض تقديمي',
        new: 'عرض تقديمي جديد',
        open: 'فتح عرض تقديمي',
        export: 'تصدير',
        share: 'مشاركة',
        present: 'تقديم',
        settings: 'الإعدادات'
      },
      template: {
        selectTemplate: 'اختر قالب',
        noTemplates: 'لا توجد قوالب متاحة',
        templateApplied: 'تم تطبيق القالب بنجاح'
      },
      errors: {
        notFound: 'غير موجود',
        serverError: 'خطأ في الخادم',
        networkError: 'خطأ في الشبكة',
        invalidInput: 'إدخال غير صالح'
      }
    });

    // Add placeholders for other languages (would be fully translated in production)
    ['de', 'zh', 'ja', 'pt', 'ru', 'hi'].forEach(lang => {
      this.translations.set(lang as SupportedLanguage, this.translations.get('en')!);
    });
  }

  /**
   * Set current locale
   */
  setLocale(locale: SupportedLanguage): void {
    if (!this.languages.has(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    this.currentLocale = locale;

    // Update HTML dir attribute
    if (typeof document !== 'undefined') {
      document.documentElement.dir = this.getLanguageConfig(locale).dir;
      document.documentElement.lang = locale;
    }
  }

  /**
   * Get current locale
   */
  getLocale(): SupportedLanguage {
    return this.currentLocale;
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(locale: SupportedLanguage): LanguageConfig {
    const config = this.languages.get(locale);
    if (!config) {
      throw new Error(`Language config not found: ${locale}`);
    }
    return config;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Array.from(this.languages.values());
  }

  /**
   * Translate a key
   */
  t(key: string, options?: TranslationOptions): string {
    const translations = this.translations.get(this.currentLocale);
    if (!translations) return key;

    // Navigate nested keys (e.g., "common.save")
    const parts = key.split('.');
    let value: any = translations;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Handle interpolation (e.g., "{{number}}")
    if (options?.context) {
      Object.entries(options.context).forEach(([key, val]) => {
        value = value.replace(`{{${key}}}`, String(val));
      });
    }

    // Handle pluralization (simplified)
    if (options?.count !== undefined) {
      // In production, would use proper plural rules per language
      if (options.count !== 1) {
        value += 's'; // Simple English pluralization
      }
    }

    return value;
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const langConfig = this.getLanguageConfig(this.currentLocale);
    return new Intl.NumberFormat(
      this.currentLocale,
      { ...langConfig.numberFormat, ...options }
    ).format(number);
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(
      this.currentLocale,
      options
    ).format(date);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Detect browser language
   */
  detectBrowserLanguage(): SupportedLanguage {
    if (typeof navigator === 'undefined') return 'en';

    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;

    return this.languages.has(browserLang) ? browserLang : 'en';
  }

  /**
   * Add custom translations
   */
  addTranslations(locale: SupportedLanguage, translations: TranslationDictionary): void {
    const existing = this.translations.get(locale) || {};
    this.translations.set(locale, this.deepMerge(existing, translations));
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });

    return result;
  }

  /**
   * Export translations for a locale
   */
  exportTranslations(locale: SupportedLanguage): string {
    const translations = this.translations.get(locale);
    return JSON.stringify(translations, null, 2);
  }

  /**
   * Import translations
   */
  importTranslations(locale: SupportedLanguage, jsonData: string): boolean {
    try {
      const translations = JSON.parse(jsonData);
      this.addTranslations(locale, translations);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get translation coverage (percentage of keys translated)
   */
  getTranslationCoverage(locale: SupportedLanguage): number {
    const base = this.translations.get('en');
    const target = this.translations.get(locale);

    if (!base || !target) return 0;

    const baseKeys = this.flattenKeys(base);
    const targetKeys = this.flattenKeys(target);

    const translated = targetKeys.filter(key => {
      const baseValue = this.getNestedValue(base, key);
      const targetValue = this.getNestedValue(target, key);
      return baseValue !== targetValue;
    }).length;

    return Math.round((translated / baseKeys.length) * 100);
  }

  /**
   * Flatten nested keys
   */
  private flattenKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = [];

    Object.keys(obj).forEach(key => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        keys.push(...this.flattenKeys(obj[key], path));
      } else {
        keys.push(path);
      }
    });

    return keys;
  }

  /**
   * Get nested value by path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return undefined;
    }

    return value;
  }

  /**
   * Check if locale is RTL
   */
  isRTL(locale?: SupportedLanguage): boolean {
    const lang = locale || this.currentLocale;
    return this.getLanguageConfig(lang).dir === 'rtl';
  }

  /**
   * Get text direction
   */
  getTextDirection(): 'ltr' | 'rtl' {
    return this.getLanguageConfig(this.currentLocale).dir;
  }
}

// Singleton instance
export const i18n = new I18nManager();

// Convenience function
export const t = (key: string, options?: TranslationOptions) => i18n.t(key, options);
