# Auth Flow і BFF API

Статус: підтверджене користувачем архітектурне рішення від 2026-10-09.
Класифікація: **REQUIRED NOW** для всіх подальших API-функцій.

Це єдине основне джерело правил взаємодії Browser → Next.js 16 App Router → NestJS REST API. Розміщення коду визначає [STRUCTURE.md](./STRUCTURE.md). Інші документи посилаються сюди, а не встановлюють альтернативні API-підходи.

Цей документ фіксує цільову архітектуру, а не підтверджує завершення її реалізації. Прийняття рішення саме по собі не означає, що refresh, SSR або logout уже підключені. Фактичний стан реалізації та перевірок фіксуємо в [PROGRESS.md](../../docs/learning/PROGRESS.md). Уточнення відповідальностей від 2026-10-09 не вимагає автоматичного переписування наявного login/register; у межах документаційного рішення код і залежності не змінюємо.

## Браузерний API-потік

```text
React Component
    ↓
TanStack React Query (useQuery / useMutation)
    ↓
Browser API function → bffApi
    ↓
Next.js Route Handler (/api/...)
    ↓
Спільний server-only Nest API client
    ↓
NestJS REST API
    ↓
PostgreSQL
```

- Усі браузерні API-запити застосунку виконуються через TanStack React Query та Next.js Route Handlers.
- `useQuery` використовуємо для GET: списків, деталей, пошуку, фільтрації, пагінації та аналітики.
- `useMutation` використовуємо для POST, PUT, PATCH, DELETE та інших операцій зміни даних, включно з браузерними auth-операціями.
- `queryFn` і `mutationFn` викликають звичайні браузерні API-функції, які звертаються через `bffApi` до `/api/...`.
- Браузер не звертається безпосередньо до захищеного NestJS API.
- **Server Actions не використовуємо для CRUD або інших викликів NestJS API**: ні як `queryFn`, ні як `mutationFn`, ні як окрему заміну Route Handler.

## Відповідальності API-шарів і помилки

Для простого endpoint Route Handler напряму викликає спільний server-only Nest client. Окрема серверна feature-функція між ними не є обов'язковою. `import 'server-only'` обмежує використання модуля сервером, але не робить функцію Server Action.

| Шар | Відповідальність | Результат |
| --- | --- | --- |
| Спільний server-only Nest client | Адреса Nest, timeout, обмеження redirects та спільні транспортні/auth-механізми. Не визначає повідомлення конкретних бізнес-операцій | Статус, headers і ще не перевірене тіло відповіді Nest для серверного споживача; транспортний збій може відхилити Promise |
| Route Handler | Перевіряє запит браузера: CSRF для зміни стану, параметри, тіло. Викликає Nest client, перевіряє контракт відповіді конкретного endpoint, інтерпретує погоджені статуси/коди, формує безпечний HTTP-вихід | HTTP-статус окремо від JSON `ApiResponse<T>`: `{ success: true, data }` або `{ success: false, message }`; cookies/headers за контрактом |
| Browser API function через `bffApi` | Обробляє збій зв'язку з BFF, перевіряє структуру відповіді та відповідність HTTP-статусу контракту | Успіх — `return data`; невдача — `throw Error` із безпечним повідомленням. Некоректна відповідь або відсутність відповіді мають власне повідомлення |
| React Query hook | Підключає API-функцію як `queryFn` / `mutationFn`, керує кешем, retry та реакціями на результат; не повторює HTTP-перевірки | Стан query/mutation та методи запуску. `mutateAsync` відхиляє Promise при помилці API-функції |
| UI | Вибирає місце показу повідомлення; не розбирає статуси Nest повторно | Повідомлення компонента або помилка форми, наприклад `setError('root.server', ...)` |

- Nest залишається власником бізнес-рішень та авторизації. Next не вгадує причину за текстом помилки й не повторює бізнес-перевірки: для різних причин одного статусу потрібен погоджений контракт кодів.
- Вхідний/вихідний JSON перевіряємо під час виконання; TypeScript-тип або `axios.get<T>()` цього не замінює. Очікуваний статус без коректних даних не є успішним результатом.
- Для простої операції перетворення відповіді Nest на публічний статус і повідомлення відбувається в Handler один раз. Сирі Axios/DB errors, stack traces, credentials та внутрішні подробиці не передаємо браузеру й не логуємо цілком.
- HTTP-статус і `success` у JSON — різні частини контракту. Повернення `{ success: false }` з `queryFn` / `mutationFn` саме по собі не переводить React Query у стан помилки; для цього Promise має бути відхилений.
- Загальні механізми класифікації timeout/мережевих збоїв можуть належати server-only інфраструктурі, коли є реальне повторення. Остаточну HTTP-відповідь формує Handler; не додаємо універсальний error framework наперед.
- Окрема серверна feature-функція доречна для спільної логіки кількох handlers, оркестрації або реального повторного використання з Server Components. У такому разі спільну перевірку/інтерпретацію виконує ця функція, а Handler лише оформлює результат — не перевіряє те саме вдруге.
- Проміжний `{ success, status, message }` між серверними функціями не є обов'язковим форматом усіх операцій. Наявний `requestAuthCredentials` зберігаємо: він містить спільну логіку login/register, перевірку credentials та обробку збоїв. Не переносимо цей шаблон автоматично на кожен новий endpoint.

## Автентифікація та cookies

### Register і login

Форма передає дані через mutation у відповідний Route Handler. Next перевіряє CSRF та вхідні дані, викликає Nest через server-only API layer, перевіряє відповідь і встановлює access/refresh cookies. Браузер отримує безпечний результат операції без токенів у JSON.

Nest перевіряє credentials і створює серверну сесію. Кожен успішний register/login видає токени нової сесії; новий login сам по собі не відкликає попередні сесії.

### Захищені запити

Route Handler через спільний server-only API layer отримує credentials із cookies та передає access JWT до Nest у `Authorization: Bearer <access-token>`.

Nest залишається джерелом остаточного рішення щодо JWT, чинності сесії та доступу до ресурсів. Коли продукт матиме ролі й permissions, їх також перевірятиме Nest. Це рішення не додає ролі або permissions до поточного MVP scope.

Не дублюємо бізнес-авторизацію в кожному Route Handler. Спільні механізми читання credentials, авторизованого виклику Nest і обробки транспортних помилок належать server-only API layer; валідація та HTTP-відповідь конкретного endpoint залишаються на його HTTP-межі.

### Refresh і logout

- Access JWT короткоживучий; refresh credential — випадковий opaque token.
- Успішний refresh зберігає ту саму сесію, але ротує refresh credential та видає новий access JWT. Використаний refresh token більше не придатний; Nest виявляє повторне використання та відкликає відповідну сесію.
- Абсолютний `sessionExpiresAt` не продовжується під час refresh.
- BFF оновлює обидві cookies у Route Handler. Початковий запит повторюється щонайбільше один раз після refresh; нескінченних retry немає.
- Конкурентні refresh потрібно координувати відповідно до фактичного deployment. Mutex одного процесу не є рішенням для кількох інстансів.
- Logout викликає відкликання сесії в Nest і очищає cookies у Next; поведінку при недоступності Nest визначаємо явно під час реалізації.

### Межа браузера

- Access та refresh tokens зберігаються в HttpOnly cookies. HttpOnly обмежує доступ JavaScript, але не шифрує значення і не означає, що токенів фізично немає у браузері.
- Cookies мають `Path=/`, `SameSite=Lax`, без `Domain`; у production — `Secure` і префікс `__Host-`. Production працює через HTTPS.
- Токени не передаємо в Client Components, JSON-відповіді браузеру, логи, localStorage, sessionStorage, Zustand, Redux, React Context або кеш React Query, включно з даними hydration.
- Для кожного state-changing endpoint обов'язкові CSRF-захист і серверна валідація вхідних даних. Клієнтська валідація форми їх не замінює.
- HttpOnly і CSRF-захист не замінюють перевірку доступу в Nest або auth rate limiting.

## React Query та синхронізація UI

- Query keys узгоджені всередині feature; включають параметри, від яких залежить результат: ідентифікатор, фільтри, пошук, пагінацію тощо.
- Після успішної mutation інвалідуємо відповідні queries через `queryClient.invalidateQueries`.
- За потреби використовуємо `setQueryData` для негайного оновлення кешу або оптимістичного оновлення з відновленням стану при помилці.
- `revalidatePath()` не є заміною інвалідації React Query: це різні механізми кешування.
- Не додаємо глобальні state managers для дублювання серверних даних із React Query. Безпечні дані користувача можуть бути в кеші; токени — ні.

Наприклад, усередині feature hook:

```ts
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: createChild,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['children'] })
  },
})
```

`createChild` тут — звичайна браузерна API-функція, що викликає Route Handler через `bffApi`, а не Server Action. Це приклад патерну, а не додавання нового endpoint до scope.

## Server Components і SSR

```text
Server Component → server-only API layer → NestJS
```

- Server Components можуть читати cookies та викликати Nest безпосередньо через server-only API layer. Додатковий HTTP-запит до власного `/api/...` не потрібний.
- Вони не використовують браузерний `bffApi` і не передають credentials у Client Components.
- Під час рендеру Server Components не можуть встановлювати, оновлювати або видаляти cookies.
- Тому не можна безумовно переносити refresh із записом cookies у серверний клієнт, який викликається під час SSR. Відновлення сесії має проходити через контекст, де можна встановити cookies; у нашій архітектурі це Route Handler. Конкретний SSR refresh flow визначаємо окремо, з урахуванням ротації та конкуренції.
- Якщо SSR уже надав потрібні дані, не додаємо зайвий браузерний запит лише заради React Query. Правило React Query стосується браузерних API-запитів і не вимагає переносити всі читання на клієнт.

## Межі абстракцій

Route Handlers залишаються компактними: HTTP-вхід, виклик спільного Nest client, перевірка/інтерпретація контракту endpoint та HTTP-вихід. Серверну feature-функцію додаємо лише за конкретної потреби, описаної в розділі [відповідальностей](#відповідальності-api-шарів-і-помилки). Повторювані інфраструктурні механізми належать спільному server-only шару; змістовна feature-логіка — відповідному модулю.

Не створюємо обов'язкову обгортку `getUserFromNest()` / `deleteUserFromNest()`, яка лише повторює один `api.get()` / `api.delete()`. Це не заборона серверних функцій або їх розміщення в `modules/<feature>/api/`. Server Components так само можуть напряму використовувати спільний серверний клієнт; перевірку даних, потрібну і SSR, і Handler, виносимо за фактичного повторного використання.

**DO NOT ABSTRACT YET:** не створюємо універсальний proxy з довільним upstream/path, необмеженим доступом або сліпим пересиланням headers; не додаємо класи, factories, generic SDK чи wrappers без конкретної потреби. Нові endpoints мають явно визначені методи, вхідний контракт і межу доступу.

## Офіційні довідкові матеріали

- [Next.js BFF і прямі серверні виклики з Server Components](https://nextjs.org/docs/app/guides/backend-for-frontend#server-components).
- [Next.js cookies: читання та обмеження запису](https://nextjs.org/docs/app/api-reference/functions/cookies).
- [TanStack Query: інвалідація після mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations).

Вибір Route Handlers замість Server Actions для Nest API є обов'язковим рішенням цього проєкту, а не твердженням, що Next.js загалом забороняє інші підходи.
