// export default defineNuxtPlugin(() => {
//   const { locale, locales } = useI18n()
//   type LocaleCode = typeof locale.value
//   const cookie = useCookie<string | null>('ow_locale', { sameSite: 'lax', path: '/' })
//   const validLocales = locales.value.map((item) => (typeof item === 'string' ? item : item.code) as LocaleCode)

//   const saved = localStorage.getItem('ow_locale') || cookie.value
//   if (saved && validLocales.includes(saved as LocaleCode) && saved !== locale.value) {
//     locale.value = saved as LocaleCode
//   }

//   watch(locale, (value) => {
//     localStorage.setItem('ow_locale', value)
//     cookie.value = value
//   }, { immediate: true })
// })
